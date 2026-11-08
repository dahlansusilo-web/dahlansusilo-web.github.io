// DOSEN.JS - Reset, MK, Mahasiswa, Materi, Soal, Ujian, Nilai, Export
function resetPasswordDosen(nim){
  const m=DB.mahasiswa.find(x=>String(x.nim)===String(nim));
  const passBaru=prompt(`Reset password untuk ${m.nama} (${nim})\n\nMasukkan password baru:`,'mhs'+String(nim).slice(-1));
  if(passBaru===null)return;
  if(passBaru.length<4){alert('Password minimal 4 karakter!');return}
  if(!confirm(`Yakin ganti password ${m.nama} (${nim}) menjadi:\n\n"${passBaru}"\n\nKasih tahu mahasiswa password barunya ya!`))return;
  m.password=passBaru;
  DB.resetRequests=DB.resetRequests.filter(r=>!(String(r.nim)===String(nim)&&r.status==='Menunggu'));
  save('Mahasiswa',{nim,password:passBaru,action:'updatePassword'});
  alert(`Berhasil! Password baru ${m.nama} (${nim}) adalah:\n\n${passBaru}\n\nJangan lupa kasih tahu mahasiswanya!`); render();
}
function setujuiReset(nim){
  const r=DB.resetRequests.find(x=>String(x.nim)===String(nim)&&x.status==='Menunggu'); if(!r)return;
  const passBaru=prompt(`Setujui reset untuk ${r.nama} (${nim})?\n\nMasukkan password baru:`, 'mhs123');
  if(passBaru===null)return;
  if(passBaru.length<4){alert('Password minimal 4 karakter!');return}
  const m=DB.mahasiswa.find(x=>String(x.nim)===String(nim)); m.password=passBaru; r.status='Disetujui'; r.passwordBaru=passBaru; r.tanggalSetuju=new Date().toLocaleString('id-ID');
  save('Mahasiswa',{nim,password:passBaru,action:'updatePassword'});
  alert(`Disetujui! Password baru ${r.nama} adalah: ${passBaru}\nKasih tahu mahasiswanya.`); render();
}
function tolakReset(nim){
  if(!confirm('Tolak permintaan reset dari '+nim+'?'))return;
  const r=DB.resetRequests.find(x=>String(x.nim)===String(nim)&&x.status==='Menunggu'); if(r) r.status='Ditolak';
  save('ResetRequests',{nim,status:'Ditolak'}); render();
}
function renderListReset(){
  const el=document.getElementById('listReset'), elJml=document.getElementById('jmlReset'); if(!el)return;
  const menunggu=DB.resetRequests.filter(r=>r.status==='Menunggu');
  if(elJml) elJml.innerText=menunggu.length+' menunggu';
  if(menunggu.length===0){el.innerHTML='<p class="muted">Tidak ada permintaan reset. Aman.</p>';return}
  el.innerHTML=menunggu.map(r=>`<div style="border:1px solid #fed7aa;padding:10px;border-radius:10px;margin-bottom:8px;background:#fff7ed"><b>${r.nama} (${r.nim})</b> - minta reset password<br><span class="muted">Tanggal: ${r.tanggal}</span><br><button class="btn green small" onclick="setujuiReset('${r.nim}')">✅ Setujui & Buat Password Baru</button> <button class="btn red small" onclick="tolakReset('${r.nim}')">❌ Tolak</button></div>`).join('');
}
function exportExcelMK(kodeMK){
  const list=kodeMK?DB.peserta.filter(p=>String(p.kode_mk)===String(kodeMK)):DB.peserta;
  const judul=kodeMK?`Nilai_${kodeMK}`:`Nilai_Semua_MK`;
  let csv="NIM,Nama,Kode MK,Nama MK,Kehadiran,Tugas,UTS,UAS,Rata-rata\n";
  list.forEach(p=>{const nama=DB.mahasiswa.find(m=>String(m.nim)===String(p.nim))?.nama||''; const avg=((+p.nilai1||0)+(+p.nilai2||0)+(+p.nilai3||0)+(+p.nilai4||0))/4; csv+=`${p.nim},"${nama}",${p.kode_mk},"${mkNama(p.kode_mk)}",${p.nilai1},${p.nilai2},${p.nilai3},${p.nilai4},${avg.toFixed(1)}\n`;});
  csv+="\n\nDetail Jawaban Ujian\nNIM,Kode Ujian,No Soal,Jawaban,Nilai,Koreksi Dosen\n";
  const kodeUjianList=kodeMK?DB.ujian.filter(u=>String(u.KodeMK)===String(kodeMK)).map(u=>u.KodeUjian):DB.ujian.map(u=>u.KodeUjian);
  DB.jawaban.filter(j=>kodeUjianList.includes(j.KodeUjian)).forEach(j=>{csv+=`${j.NIM},${j.KodeUjian},${j.NoSoal},"${(j.Jawaban||'').replace(/"/g,'""')}",${j.nilai},"${(j.koreksi_dosen||'').replace(/"/g,'""')}"\n`;});
  const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=judul+".csv"; a.click();
  alert('File Excel (CSV) '+judul+'.csv berhasil diunduh!');
}
function exportPDFMK(kodeMK){
  const list=kodeMK?DB.peserta.filter(p=>String(p.kode_mk)===String(kodeMK)):DB.peserta;
  const w=window.open('','_blank');
  let html=`<h2>Rekap Nilai ${kodeMK?kodeMK+' - '+mkNama(kodeMK):'Semua MK'}</h2><p>Dosen: ${user.nama} | Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}</p><table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%"><tr><th>NIM</th><th>Nama</th><th>MK</th><th>Kehadiran</th><th>Tugas</th><th>UTS</th><th>UAS</th><th>Rata-rata</th></tr>`;
  list.forEach(p=>{const nama=DB.mahasiswa.find(m=>String(m.nim)===String(p.nim))?.nama||''; const avg=((+p.nilai1||0)+(+p.nilai2||0)+(+p.nilai3||0)+(+p.nilai4||0))/4; html+=`<tr><td>${p.nim}</td><td>${nama}</td><td>${p.kode_mk}</td><td>${p.nilai1}</td><td>${p.nilai2}</td><td>${p.nilai3}</td><td>${p.nilai4}</td><td><b>${avg.toFixed(1)}</b></td></tr>`;});
  html+=`</table><p style="margin-top:20px">Tanda tangan Dosen<br><br><br>____________________<br>${user.nama}</p><script>window.print()<\/script>`; w.document.write(html); w.document.close();
}
function bukaFormMhs(nim){
  if(nim){editMhsNim=nim; showFormMhs=true;} else {editMhsNim=null; showFormMhs=!showFormMhs;} render();
  setTimeout(()=>{ if(nim){ const m=DB.mahasiswa.find(x=>String(x.nim)===String(nim)); if(m){ document.getElementById('f_mhs_nim').value=m.nim; document.getElementById('f_mhs_nama').value=m.nama; document.getElementById('f_mhs_pass').value=m.password; document.getElementById('f_mhs_angk').value=m.angkatan; document.getElementById('f_mhs_role').value=m.role; } } },0);
}
function simpanMhsForm(){
  const nim=document.getElementById('f_mhs_nim').value.trim(), nama=document.getElementById('f_mhs_nama').value.trim(), pass=document.getElementById('f_mhs_pass').value.trim(), angk=document.getElementById('f_mhs_angk').value.trim(), role=document.getElementById('f_mhs_role').value;
  if(!nim||!nama||!pass){alert('NIM, Nama, dan Password wajib diisi!');return}
  const mkDipilih=[...document.querySelectorAll('.cekMK:checked')].map(c=>c.value);
  const nimLama=editMhsNim||nim;
  const mkLama=DB.peserta.filter(p=>String(p.nim)===String(nimLama)).map(p=>String(p.kode_mk));

  if(editMhsNim){ const m=DB.mahasiswa.find(x=>String(x.nim)===String(editMhsNim)); m.nim=nim; m.nama=nama; m.password=pass; m.angkatan=angk; m.role=role; save('Mahasiswa',{nim,nama,password:pass,angkatan:angk,role,action:'update'}); }
  else { if(DB.mahasiswa.find(x=>String(x.nim)===nim)){alert('NIM '+nim+' sudah ada di GS!');return} DB.mahasiswa.push({nim,nama,password:pass,angkatan:angk||'2026',role}); save('Mahasiswa',{nim,nama,password:pass,angkatan:angk||'2026',role,action:'add'}); }

  // --- Sync MK: hapus yang tidak dicentang, tambah yang baru dicentang ---
  if(nimLama!==nim){
    // Kalau NIM diganti, pindahkan semua peserta lama ke NIM baru
    mkLama.forEach(k=>{ DB.peserta=DB.peserta.filter(p=>!(String(p.nim)===String(nimLama)&&String(p.kode_mk)===String(k))); save('Peserta',{nim:nimLama,kode_mk:k,action:'delete'}); });
    mkDipilih.forEach(k=>{ const payload={nim,kode_mk:k,nilai1:0,nilai2:0,nilai3:0,nilai4:0}; DB.peserta.push(payload); save('Peserta',{...payload,action:'add'}); });
  } else {
    mkLama.filter(k=>!mkDipilih.includes(k)).forEach(k=>{ DB.peserta=DB.peserta.filter(p=>!(String(p.nim)===String(nim)&&String(p.kode_mk)===String(k))); save('Peserta',{nim,kode_mk:k,action:'delete'}); });
    mkDipilih.filter(k=>!mkLama.includes(k)).forEach(k=>{ const payload={nim,kode_mk:k,nilai1:0,nilai2:0,nilai3:0,nilai4:0}; DB.peserta.push(payload); save('Peserta',{...payload,action:'add'}); });
  }

  showFormMhs=false; editMhsNim=null; alert('Mahasiswa + MK berhasil disimpan ke GS! Bisa langsung login.'); render();
}
function hapusMhs(nim){
  const m=DB.mahasiswa.find(x=>String(x.nim)===String(nim)); if(m.role==='dosen'){alert('Tidak bisa hapus akun dosen!');return}
  if(!confirm(`Yakin hapus mahasiswa ${m.nama} (${nim}) dari GS?\n\nAkan menghapus juga peserta, pengumpulan tugas, dan jawaban ujiannya.\nTidak bisa dibatalkan!`))return;
  DB.mahasiswa=DB.mahasiswa.filter(x=>String(x.nim)!==String(nim)); DB.peserta=DB.peserta.filter(p=>String(p.nim)!==String(nim)); DB.pengumpulan=DB.pengumpulan.filter(p=>String(p.nim)!==String(nim)); DB.jawaban=DB.jawaban.filter(j=>String(j.NIM)!==String(nim));
  save('Mahasiswa',{nim,action:'delete'}); alert('Mahasiswa berhasil dihapus dari GS!'); render();
}
function toggleFormMK(editKode){ if(editKode){editMKCode=editKode; showFormMK=true;} else {editMKCode=null; showFormMK=!showFormMK;} render(); }
function simpanMK(){
  const kode=document.getElementById('f_mk_kode').value.trim(), nama=document.getElementById('f_mk_nama').value.trim(), sks=parseInt(document.getElementById('f_mk_sks').value)||3;
  if(!kode||!nama){alert('Kode MK dan Nama MK wajib diisi!');return}
  const pesertaDipilih=[...document.querySelectorAll('.cekPeserta:checked')].map(c=>c.value);
  const kodeLama=editMKCode||kode;
  const pesertaLama=DB.peserta.filter(p=>String(p.kode_mk)===String(kodeLama)).map(p=>String(p.nim));

  if(editMKCode){ const m=DB.mataKuliah.find(x=>String(x.kode_mk)===String(editMKCode)); m.kode_mk=kode; m.nama_mk=nama; m.sks=sks; save('MataKuliah',{kode_mk:kode,nama_mk:nama,sks,dosen:user.nim,action:'update',kodeLama:editMKCode}); }
  else { if(DB.mataKuliah.find(m=>String(m.kode_mk)===kode)){alert('Kode MK sudah ada di GS!');return} DB.mataKuliah.push({kode_mk:kode,nama_mk:nama,sks,dosen:user.nim}); save('MataKuliah',{kode_mk:kode,nama_mk:nama,sks,dosen:user.nim,action:'add'}); }

  // --- Sync Peserta: hapus yang tidak dicentang, tambah yang baru ---
  if(kodeLama!==kode){
    pesertaLama.forEach(nim=>{ DB.peserta=DB.peserta.filter(p=>!(String(p.nim)===String(nim)&&String(p.kode_mk)===String(kodeLama))); save('Peserta',{nim,kode_mk:kodeLama,action:'delete'}); });
    pesertaDipilih.forEach(nim=>{ const payload={nim,kode_mk:kode,nilai1:0,nilai2:0,nilai3:0,nilai4:0}; DB.peserta.push(payload); save('Peserta',{...payload,action:'add'}); });
  } else {
    pesertaLama.filter(nim=>!pesertaDipilih.includes(nim)).forEach(nim=>{ DB.peserta=DB.peserta.filter(p=>!(String(p.nim)===String(nim)&&String(p.kode_mk)===String(kode))); save('Peserta',{nim,kode_mk:kode,action:'delete'}); });
    pesertaDipilih.filter(nim=>!pesertaLama.includes(nim)).forEach(nim=>{ const payload={nim,kode_mk:kode,nilai1:0,nilai2:0,nilai3:0,nilai4:0}; DB.peserta.push(payload); save('Peserta',{...payload,action:'add'}); });
  }

  showFormMK=false; editMKCode=null; alert('MK + Peserta berhasil disimpan!'); render();
}
function hapusMK(kode){
  const jmlPeserta=DB.peserta.filter(p=>String(p.kode_mk)===String(kode)).length, jmlMateri=DB.materi.filter(p=>String(p.kode_mk)===String(kode)).length;
  if(!confirm(`YAKIN hapus MK ${kode} - ${mkNama(kode)} dari GS?\n\nAkan menghapus juga:\n- ${jmlPeserta} peserta\n- ${jmlMateri} materi/tugas\n- Pengumpulan & ujian MK ini\n\nTidak bisa dibatalkan!`))return;
  DB.mataKuliah=DB.mataKuliah.filter(m=>String(m.kode_mk)!==String(kode)); DB.peserta=DB.peserta.filter(p=>String(p.kode_mk)!==String(kode)); DB.materi=DB.materi.filter(p=>String(p.kode_mk)!==String(kode)); DB.pengumpulan=DB.pengumpulan.filter(p=>String(p.kode_mk)!==String(kode));
  const ku=DB.ujian.filter(u=>String(u.KodeMK)===String(kode)).map(u=>u.KodeUjian); DB.ujian=DB.ujian.filter(u=>String(u.KodeMK)!==String(kode)); DB.jawaban=DB.jawaban.filter(j=>!ku.includes(j.KodeUjian));
  save('MataKuliah',{kode_mk:kode,action:'delete'}); alert('MK '+kode+' berhasil dihapus dari GS!'); render();
}
function bukaFormMateri(idx){
  formMateriIdx=idx; showFormMateri=true; render();
  setTimeout(()=>{ if(idx>=0){ const m=DB.materi[idx]; document.getElementById('f_m_id').value=m.id_tugas; document.getElementById('f_m_judul').value=m.judul; document.getElementById('f_m_desk').value=m.deskripsi; document.getElementById('f_m_deadline').value=m.deadline; document.getElementById('f_m_linkM').value=m.link_materi; document.getElementById('f_m_linkT').value=m.link_tugas||''; } },0);
}
function simpanMateriForm(){
  const id=document.getElementById('f_m_id').value.trim(), judul=document.getElementById('f_m_judul').value.trim(), desk=document.getElementById('f_m_desk').value.trim(), deadline=document.getElementById('f_m_deadline').value, linkM=document.getElementById('f_m_linkM').value.trim(), linkT=document.getElementById('f_m_linkT').value.trim();
  if(!id||!judul){alert('ID Tugas dan Judul wajib diisi!');return}
  const payload={kode_mk:selectedMK,id_tugas:id,judul,deskripsi:desk,deadline,link_materi:linkM,link_tugas:linkT};
  if(formMateriIdx>=0){ const m=DB.materi[formMateriIdx]; Object.assign(m,payload); save('Materi',{...payload,action:'update'}); }
  else { DB.materi.push(payload); save('Materi',{...payload,action:'add'}); }
  showFormMateri=false; formMateriIdx=-1; alert('Materi / Tugas berhasil disimpan ke GS!'); render();
}
function hapusMateri(idx){ if(!confirm('Yakin hapus "'+DB.materi[idx].judul+'" dari GS?'))return; const m=DB.materi[idx]; DB.materi.splice(idx,1); save('Materi',{kode_mk:m.kode_mk,id_tugas:m.id_tugas,action:'delete'}); render(); }
function toggleFormSoal(){ showFormSoal=!showFormSoal; render(); }
function onJenisSoalChange(){ const jenis=document.getElementById('f_s_jenis').value; document.getElementById('boxPilihan').style.display=jenis==='MC'?'block':'none'; }
function simpanSoalForm(){
  const kodeUjian=document.getElementById('f_s_ujian').value, no=parseInt(document.getElementById('f_s_no').value), jenis=document.getElementById('f_s_jenis').value, soalTxt=document.getElementById('f_s_soal').value.trim();
  const pa=document.getElementById('f_s_a').value.trim(), pb=document.getElementById('f_s_b').value.trim(), pc=document.getElementById('f_s_c').value.trim(), pd=document.getElementById('f_s_d').value.trim(), kunci=document.getElementById('f_s_kunci').value.trim();
  if(!kodeUjian||!no||!soalTxt){alert('Ujian, No Soal, dan Soal wajib diisi!');return}
  if(jenis==='MC'&&(!pa||!pb||!pc||!pd||!['A','B','C','D'].includes(kunci.toUpperCase()))){alert('Untuk MC, Pilihan A-D dan Kunci wajib diisi!');return}
  if(DB.soal.find(s=>String(s.KodeUjian)===String(kodeUjian)&&+s.NoSoal===no)){alert('No Soal '+no+' sudah ada!');return}
  const payload={KodeUjian:kodeUjian,NoSoal:no,JenisSoal:jenis,Soal:soalTxt,PilihanA:pa,PilihanB:pb,PilihanC:pc,PilihanD:pd,Kunci:jenis==='MC'?kunci.toUpperCase():''};
  DB.soal.push(payload); save('Soal',{...payload,action:'add'}); showFormSoal=false; alert('Soal berhasil ditambah ke GS!'); render();
}
function hapusSoal(kode,no){ if(!confirm('Yakin hapus Soal No '+no+' di '+kode+' dari GS?'))return; DB.soal=DB.soal.filter(s=>!(String(s.KodeUjian)===String(kode)&&+s.NoSoal===+no)); save('Soal',{KodeUjian:kode,NoSoal:no,action:'delete'}); render(); }
function toggleFormUjian(){ showFormUjian=!showFormUjian; render(); }
function simpanUjianForm(){
  const kode=document.getElementById('f_u_kode').value.trim(), judul=document.getElementById('f_u_judul').value.trim(), tgl=document.getElementById('f_u_tgl').value, mulai=document.getElementById('f_u_mulai').value, selesai=document.getElementById('f_u_selesai').value, durasi=parseInt(document.getElementById('f_u_durasi').value)||60;
  if(!kode||!judul){alert('Kode Ujian dan Judul wajib diisi!');return}
  if(DB.ujian.find(u=>String(u.KodeUjian)===String(kode))){alert('Kode Ujian sudah ada!');return}
  const payload={KodeUjian:kode,KodeMK:selectedMK,Judul:judul,Jenis:'UTS',Tanggal:tgl,JamMulai:mulai,JamSelesai:selesai,Status:'Aktif',DurasiMenit:durasi};
  DB.ujian.push(payload); save('Ujian',{...payload,action:'add'}); showFormUjian=false; alert('Ujian berhasil dibuat di GS! Sekarang tambah soalnya.'); render();
}
function toggleFormPeserta(){ showFormPeserta=!showFormPeserta; render(); }
function simpanPesertaForm(){
  const nim=document.getElementById('f_p_nim').value; if(!nim){alert('Pilih mahasiswa dulu!');return}
  if(DB.peserta.find(p=>String(p.nim)===String(nim)&&String(p.kode_mk)===String(selectedMK))){alert('Mahasiswa ini sudah jadi peserta MK ini!');return}
  const payload={nim,kode_mk:selectedMK,nilai1:0,nilai2:0,nilai3:0,nilai4:0}; DB.peserta.push(payload); save('Peserta',{...payload,action:'add'}); showFormPeserta=false; alert('Peserta berhasil ditambah ke GS!'); render();
}
function hapusPeserta(nim){
  const nama=DB.mahasiswa.find(m=>String(m.nim)===String(nim))?.nama||nim;
  if(!confirm(`Yakin keluarkan ${nama} (${nim}) dari MK ${selectedMK} di GS?`))return;
  DB.peserta=DB.peserta.filter(p=>!(String(p.nim)===String(nim)&&String(p.kode_mk)===String(selectedMK))); save('Peserta',{nim,kode_mk:selectedMK,action:'delete'}); render();
}
function saveNilaiTugas(idx){ DB.pengumpulan[idx].nilai=document.getElementById('nt'+idx).value; save('Pengumpulan',{...DB.pengumpulan[idx],action:'update'}); alert('Nilai tugas tersimpan ke GS!'); render(); }
function saveNilai(i){ DB.peserta[i].nilai1=document.getElementById('n1'+i).value; DB.peserta[i].nilai2=document.getElementById('n2'+i).value; DB.peserta[i].nilai3=document.getElementById('n3'+i).value; DB.peserta[i].nilai4=document.getElementById('n4'+i).value; save('Peserta',{...DB.peserta[i],action:'update'}); alert('Nilai tersimpan ke GS'); render(); }
function saveKoreksi(i){ DB.jawaban[i].nilai=document.getElementById('jn'+i).value; DB.jawaban[i].koreksi_dosen=document.getElementById('jk'+i).value; save('Jawaban',{...DB.jawaban[i],action:'update'}); alert('Koreksi tersimpan ke GS!'); render(); }

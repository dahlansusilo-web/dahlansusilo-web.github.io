// MAHASISWA.JS - Kumpul Tugas, Ujian Terkunci
function sudahUjian(kode){ return DB.jawaban.some(j=>String(j.NIM)===String(user.nim)&&String(j.KodeUjian)===String(kode)); }
function kumpul(){
  const v=document.getElementById('kTugas').value.split('|'); const link=document.getElementById('kLink').value||'https://drive.google.com/file/d/contoh';
  const idx=DB.pengumpulan.findIndex(p=>String(p.nim)===String(user.nim)&&String(p.kode_mk)===String(v[0])&&String(p.id_tugas)===String(v[1]));
  if(idx!==-1){ if(!confirm('Tugas ini sudah dikumpulkan. Ganti dengan link baru?'))return; DB.pengumpulan[idx].link=link; DB.pengumpulan[idx].tanggal=new Date().toLocaleString('id-ID'); DB.pengumpulan[idx].ket='Sudah dikumpulkan (Diperbarui)'; DB.pengumpulan[idx].nilai=''; save('Pengumpulan',{kode_mk:v[0],nim:user.nim,id_tugas:v[1],link,tanggal:DB.pengumpulan[idx].tanggal,action:'update'}); }
  else { DB.pengumpulan.push({kode_mk:v[0],nim:user.nim,id_tugas:v[1],link,tanggal:new Date().toLocaleString('id-ID'),ket:'Sudah dikumpulkan',nilai:''}); save('Pengumpulan',{kode_mk:v[0],nim:user.nim,id_tugas:v[1],link,tanggal:new Date().toLocaleString('id-ID'),action:'add'}); }
  alert('Tugas berhasil dikumpulkan / diganti & tersimpan ke GS!'); render();
}
function lihatHasil(kode){
  const el=document.getElementById('hasil-'+kode); const list=DB.jawaban.filter(j=>String(j.NIM)===String(user.nim)&&String(j.KodeUjian)===String(kode));
  el.innerHTML=`<div style="background:#f8fafc;padding:12px;border-radius:10px;margin-top:10px"><b>Hasil Saya (Terkunci):</b>${list.map(j=>`<p>No ${j.NoSoal}: ${j.Jawaban} - Nilai: <b>${j.nilai||'Menunggu koreksi'}</b> • Koreksi: ${j.koreksi_dosen||'-'}</p>`).join('')}</div>`;
}
function mulaiUjian(kode){
  if(sudahUjian(kode)){alert('Sudah dikerjakan. Tidak bisa diulang.');return}
  if(!confirm('Mulai ujian? ATURAN: Jawaban yang sudah dipilih langsung TERKUNCI dan tidak bisa diubah.'))return;
  jawabanTerkunci={}; ujianAktifKode=kode;
  const dur=DB.ujian.find(u=>String(u.KodeUjian)===String(kode)).DurasiMenit||60; sisaDetik=dur*60; kerjakan(kode); startTimer();
}
function startTimer(){
  if(timerInterval)clearInterval(timerInterval);
  timerInterval=setInterval(()=>{ sisaDetik--; const el=document.getElementById('timerBox'); if(el){const m=Math.floor(sisaDetik/60),s=sisaDetik%60; el.innerHTML=`⏱️ SISA WAKTU KESELURUHAN: <b>${m}:${s<10?'0':''}${s}</b>`;} if(sisaDetik<=0){clearInterval(timerInterval); alert('Waktu habis! Jawaban terkirim otomatis.'); submitUjian(ujianAktifKode,true);} },1000);
}
function kerjakan(kode){
  const el=document.getElementById('ujian-'+kode); const soals=DB.soal.filter(s=>String(s.KodeUjian)===String(kode));
  el.innerHTML=`<div class="timer" id="timerBox">⏱️ SISA WAKTU: <b>${Math.floor(sisaDetik/60)}:${sisaDetik%60}</b></div>`+soals.map((s,idx)=>{
    const tampil = idx+1;
    if(s.JenisSoal==='MC') return `<div class="soal-box" id="box-${s.NoSoal}"><b>${tampil}. ${s.Soal}</b><p class="muted">⚠️ Sekali klik, langsung terkunci!</p><label><input type="radio" name="q${s.NoSoal}" value="A" style="width:auto" onchange="kunciMC(${s.NoSoal},this.value,${tampil})"> A. ${s.PilihanA}</label><br><label><input type="radio" name="q${s.NoSoal}" value="B" style="width:auto" onchange="kunciMC(${s.NoSoal},this.value,${tampil})"> B. ${s.PilihanB}</label><br><label><input type="radio" name="q${s.NoSoal}" value="C" style="width:auto" onchange="kunciMC(${s.NoSoal},this.value,${tampil})"> C. ${s.PilihanC}</label><br><label><input type="radio" name="q${s.NoSoal}" value="D" style="width:auto" onchange="kunciMC(${s.NoSoal},this.value,${tampil})"> D. ${s.PilihanD}</label><br><span id="status-${s.NoSoal}"><span class="badge warn">Belum dijawab</span></span></div>`;
    return `<div class="soal-box" id="box-${s.NoSoal}"><b>${tampil}. ${s.Soal} (Esai)</b><textarea id="esai${s.NoSoal}" placeholder="Ketik jawaban..."></textarea><button class="btn lock" onclick="kunciEsai(${s.NoSoal},${tampil})">🔒 Kunci Jawaban Ini</button><br><span id="status-${s.NoSoal}"><span class="badge warn">Belum dijawab</span></span></div>`;
  }).join('')+`<button class="btn green" onclick="submitUjian('${kode}',false)">✅ Kirim Semua Jawaban</button><p id="msgKirim" class="muted"></p>`;
}
function kunciMC(no,val,tampil){
  if(jawabanTerkunci[no]!==undefined)return;
  if(!confirm('Kunci jawaban No '+tampil+' = '+val+' ? Setelah dikunci TIDAK BISA DIUBAH.')){ document.querySelector(`input[name="q${no}"][value="${val}"]`).checked=false; return; }
  jawabanTerkunci[no]=val;
  document.querySelectorAll(`input[name="q${no}"]`).forEach(r=>r.disabled=true);
  document.getElementById('box-'+no).classList.add('locked');
  document.getElementById('status-'+no).innerHTML=`<span class="badge redbg">🔒 Terkunci: ${val}</span>`;
}
function kunciEsai(no,tampil){
  if(jawabanTerkunci[no]!==undefined)return;
  const txt=document.getElementById('esai'+no).value.trim(); if(!txt){alert('Isi dulu jawabannya baru dikunci.');return}
  if(!confirm('Kunci jawaban esai No '+tampil+' ? Setelah dikunci TIDAK BISA DIUBAH.'))return;
  jawabanTerkunci[no]=txt; document.getElementById('esai'+no).disabled=true;
  document.getElementById('box-'+no).classList.add('locked');
  document.getElementById('status-'+no).innerHTML=`<span class="badge redbg">🔒 Terkunci</span>`;
}
function submitUjian(kode,otomatis){
  if(timerInterval)clearInterval(timerInterval);
  const soals=DB.soal.filter(s=>String(s.KodeUjian)===String(kode));
  let totalMC=0,cntMC=0;
  soals.forEach(s=>{
    let ans=jawabanTerkunci[s.NoSoal]!==undefined?jawabanTerkunci[s.NoSoal]:'';
    if(ans===''&&s.JenisSoal==='Esai'){const e=document.getElementById('esai'+s.NoSoal); if(e)ans=e.value;}
    if(s.JenisSoal==='MC'){cntMC++; if(ans===s.Kunci)totalMC+=100;}
    DB.jawaban=DB.jawaban.filter(j=>!(String(j.NIM)===String(user.nim)&&String(j.KodeUjian)===String(kode)&&+j.NoSoal===+s.NoSoal));
    const payload={NIM:user.nim,KodeUjian:kode,NoSoal:s.NoSoal,Jawaban:ans,Status:'Dijawab',WaktuJawab:new Date().toLocaleString('id-ID'),nilai:s.JenisSoal==='MC'?(ans===s.Kunci?100:0):'',koreksi_dosen:s.JenisSoal==='MC'?(ans===s.Kunci?'Benar':'Salah'):''};
    DB.jawaban.push(payload); save('Jawaban',{...payload,action:'add'});
  });
  if(cntMC>0){ const p=DB.peserta.find(x=>String(x.nim)===String(user.nim)&&String(x.kode_mk)===String(DB.ujian.find(u=>String(u.KodeUjian)===String(kode)).KodeMK)); if(p){p.nilai3=Math.round(totalMC/cntMC); save('Peserta',{...p,action:'update'});} }
  const msgEl=document.getElementById('msgKirim'); if(msgEl) msgEl.innerHTML = otomatis ? '⏰ Waktu habis - jawaban terkirim otomatis ke GS.' : '✅ Jawaban terkirim ke GS!';
  setTimeout(()=>{ render(); }, 800);
}

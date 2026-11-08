// DB.JS - Muat & Simpan ke GS
function setStatus(txt,cls){
  const a=document.getElementById('statusGS'); const b=document.getElementById('statusGS2');
  if(a){a.innerText=txt; a.className='sync '+cls;} if(b){b.innerText=txt; b.className='sync '+cls;}
}
async function muatDariGS(){
  setStatus('⏳ Memuat dari GS...','load');
  const btnLogin = document.getElementById('btnLogin');
  if(btnLogin){ btnLogin.disabled = true; btnLogin.innerText = '⏳ Menghubungkan ke GS...'; }
  clearTimeout(window._tLogin);
  window._tLogin = setTimeout(()=>{
    if(btnLogin){ btnLogin.disabled = false; btnLogin.innerText = 'Masuk (Pakai Data Terakhir)'; }
    setStatus('⚠️ GS lambat, pakai data terakhir yang tersimpan','warn');
  }, 8000);
  async function getPage(page){
    try{
      const r = await fetch(API + '?page=' + page + '&t=' + Date.now(), { signal: AbortSignal.timeout(8000) });
      const j = await r.json();
      if(Array.isArray(j)) return j;
      if(j && Array.isArray(j.data)) return j.data;
      return [];
    }catch(e){ return []; }
  }
  function pick(o, names){
    for(let n of names){
      let k = Object.keys(o).find(x => x.toLowerCase().replace(/[^a-z0-9]/g,'') === n.toLowerCase().replace(/[^a-z0-9]/g,''));
      if(k) return o[k];
    }
    return '';
  }
  DB.mahasiswa = await getPage('Mahasiswa');
  let mk = await getPage('MataKuliah');
  DB.mataKuliah = mk.map(o => ({kode_mk: pick(o,['Kode_MK','KodeMK','Kode']), nama_mk: pick(o,['Nama_MK','NamaMK','Nama']), sks: +pick(o,['SKS'])||3, dosen: pick(o,['Dosen','KodeDosen'])}));
  let mt = await getPage('materi');
  DB.materi = mt.map(o => ({kode_mk: pick(o,['Kode_MK','KodeMK']), id_tugas: pick(o,['ID_Tugas','IDTugas','ID']), judul: pick(o,['Judul']), deskripsi: pick(o,['Deskripsi']), deadline: pick(o,['Deadline']), link_materi: pick(o,['Link_Materi','LinkMateri']), link_tugas: pick(o,['Link_Tugas','LinkTugas'])}));
  let ps = await getPage('peserta');
  DB.peserta = ps.map(o => ({nim: pick(o,['NIM']), kode_mk: pick(o,['Kode_MK','KodeMK']), nilai1:+pick(o,['Nilai1'])||0, nilai2:+pick(o,['Nilai2'])||0, nilai3:+pick(o,['Nilai3'])||0, nilai4:+pick(o,['Nilai4'])||0}));
  DB.pengumpulan = await getPage('pengumpulan');
  let uj = await getPage('Ujian');
  DB.ujian = uj.map(o => ({KodeUjian: pick(o,['KodeUjian']), KodeMK: pick(o,['KodeMK','Kode_MK']), Judul: pick(o,['Judul']), Tanggal: pick(o,['Tanggal']), JamMulai: pick(o,['JamMulai']), JamSelesai: pick(o,['JamSelesai']), Status: pick(o,['Status']), DurasiMenit: +pick(o,['DurasiMenit','Durasi'])||60}));
  let so = [];
  for(let u of DB.ujian){
    let s = await getPage('Soal&kodeUjian=' + encodeURIComponent(u.KodeUjian));
    if(Array.isArray(s)) so = so.concat(s);
  }
  DB.soal = so.map(o => ({KodeUjian: pick(o,['KodeUjian']), NoSoal:+pick(o,['NoSoal'])||0, JenisSoal: pick(o,['JenisSoal']), Soal: pick(o,['Soal']), PilihanA: pick(o,['PilihanA']), PilihanB: pick(o,['PilihanB']), PilihanC: pick(o,['PilihanC']), PilihanD: pick(o,['PilihanD']), Kunci: pick(o,['Kunci'])}));
  let jw = await getPage('Jawaban');
  DB.jawaban = jw.map(o => ({NIM: pick(o,['NIM']), KodeUjian: pick(o,['KodeUjian']), NoSoal:+pick(o,['NoSoal'])||0, Jawaban: pick(o,['Jawaban']), Status: pick(o,['Status']), WaktuJawab: pick(o,['WaktuJawab']), nilai: pick(o,['Nilai']), koreksi_dosen: pick(o,['Koreksi_Dosen','KoreksiDosen'])}));
  saveLocal();
  setStatus(`✅ ${DB.mahasiswa.length} mhs, ${DB.mataKuliah.length} MK, ${DB.materi.length} materi, ${DB.soal.length} soal`,'ok');
  clearTimeout(window._tLogin);
  if(btnLogin){ btnLogin.disabled = false; btnLogin.innerText = 'Masuk'; }
  if(user) render();
}
function muatUlangGS(){ muatDariGS(false); }
function saveLocal(){ localStorage.setItem('elearning_db_final_gs', JSON.stringify(DB)); }
async function simpanKeGS(sheet, payload){
  saveLocal();
  // Terjemahkan field kecil -> Header GS yang asli
  let dataGS = {...payload};
  if(sheet === 'Mahasiswa'){
    dataGS = { NIM: payload.nim, Nama: payload.nama, Password: payload.password, Angkatan: payload.angkatan, Role: payload.role, nim: payload.nim, nama: payload.nama, password: payload.password, angkatan: payload.angkatan, role: payload.role };
  }
  if(sheet === 'MataKuliah'){
    dataGS = { Kode_MK: payload.kode_mk, Nama_MK: payload.nama_mk, SKS: payload.sks, Dosen: payload.dosen, kode_mk: payload.kode_mk, nama_mk: payload.nama_mk, sks: payload.sks, dosen: payload.dosen };
  }
  try{
    await fetch(API, {method:'POST', mode:'no-cors', headers:{'Content-Type':'text/plain'}, body: JSON.stringify({action:'save', sheet: sheet, data: dataGS, all: DB})});
    console.log('Kirim ke GS:', sheet, dataGS);
  }catch(e){ console.log('Simpan GS gagal', e); }
}
function save(sheet, payload){ simpanKeGS(sheet||'', payload||{}); }
muatDariGS(false);

function setStatus(t,c){let a=document.getElementById('statusGS');if(a){a.innerText=t;a.className='sync '+c;}}
async function muatDariGS(){
setStatus('⏳ Memuat...','load');
async function getPage(p){try{let r=await fetch(API+'?page='+p+'&t='+Date.now());let j=await r.json();return Array.isArray(j)?j:[]}catch(e){return[]}}
function pick(o,n){for(let x of n){let k=Object.keys(o).find(y=>y.toLowerCase().replace(/[^a-z0-9]/g,'')===x.toLowerCase().replace(/[^a-z0-9]/g,''));if(k)return o[k]}return''}
DB.mahasiswa=await getPage('Mahasiswa');
DB.mataKuliah=(await getPage('MataKuliah')).map(o=>({kode_mk:pick(o,['Kode_MK']),nama_mk:pick(o,['Nama_MK']),sks:+pick(o,['SKS'])||3,dosen:pick(o,['Dosen'])}));
DB.materi=(await getPage('materi')).map(o=>({kode_mk:pick(o,['Kode_MK']),id_tugas:pick(o,['ID_Tugas']),judul:pick(o,['Judul']),deskripsi:pick(o,['Deskripsi']),deadline:pick(o,['Deadline']),link_materi:pick(o,['Link_Materi']),link_tugas:pick(o,['Link_Tugas'])}));
DB.peserta=(await getPage('peserta')).map(o=>({nim:pick(o,['NIM']),kode_mk:pick(o,['Kode_MK']),nilai1:+pick(o,['Nilai1'])||0,nilai2:+pick(o,['Nilai2'])||0,nilai3:+pick(o,['Nilai3'])||0,nilai4:+pick(o,['Nilai4'])||0}));
DB.pengumpulan=await getPage('pengumpulan');
DB.ujian=(await getPage('Ujian')).map(o=>({KodeUjian:pick(o,['KodeUjian']),KodeMK:pick(o,['KodeMK','Kode_MK']),Judul:pick(o,['Judul']),Tanggal:pick(o,['Tanggal']),JamMulai:pick(o,['JamMulai']),JamSelesai:pick(o,['JamSelesai']),Status:pick(o,['Status']),DurasiMenit:+pick(o,['DurasiMenit'])||60}));
let so=[];
for(let u of DB.ujian){let s=await getPage('Soal&kodeUjian='+encodeURIComponent(u.KodeUjian)+'&showKunci=1');if(Array.isArray(s))so=so.concat(s);}
DB.soal=so.map(o=>({KodeUjian:pick(o,['KodeUjian']),NoSoal:+pick(o,['NoSoal'])||0,JenisSoal:pick(o,['JenisSoal']),Soal:pick(o,['Soal']),PilihanA:pick(o,['PilihanA']),PilihanB:pick(o,['PilihanB']),PilihanC:pick(o,['PilihanC']),PilihanD:pick(o,['PilihanD']),Kunci:pick(o,['Kunci'])}));
DB.jawaban=(await getPage('Jawaban')).map(o=>({NIM:pick(o,['NIM']),KodeUjian:pick(o,['KodeUjian']),NoSoal:+pick(o,['NoSoal'])||0,Jawaban:pick(o,['Jawaban']),Status:pick(o,['Status']),WaktuJawab:pick(o,['WaktuJawab']),nilai:pick(o,['Nilai']),koreksi_dosen:pick(o,['Koreksi_Dosen'])}));
saveLocal();setStatus('✅ '+DB.mahasiswa.length+' mhs, '+DB.mataKuliah.length+' MK, '+DB.materi.length+' materi, '+DB.soal.length+' soal','ok');let b=document.getElementById('btnLogin');if(b){b.disabled=false;b.innerText='Masuk';}if(user)render();}
function muatUlangGS(){muatDariGS();}
function saveLocal(){localStorage.setItem('elearning_db_final_gs',JSON.stringify(DB));}
function save(s,p){simpanKeGS(s||'',p||{});}
muatDariGS();
async function simpanKeGS(sheet, payload){
  saveLocal();

  // PENERJEMAH UNIVERSAL - Kirim 2 versi nama field sekaligus
  // versi kecil (untuk kode lama) + versi Header GS (untuk Sheet)
  // Jadi Apps Script mau pakai yang mana saja, ketemu.
  let d = {...payload};
  let dataGS = {...d};

  // Tambahkan semua variasi nama yang mungkin dipakai Apps Script
  const tambah = (kecil, besar) => {
    if(d[kecil] !== undefined){ dataGS[besar] = d[kecil]; dataGS[kecil] = d[kecil]; }
    if(d[besar] !== undefined){ dataGS[kecil] = d[besar]; dataGS[besar] = d[besar]; }
  };

  tambah('nim','NIM'); tambah('nama','Nama'); tambah('password','Password');
  tambah('angkatan','Angkatan'); tambah('role','Role');
  tambah('kode_mk','Kode_MK'); tambah('nama_mk','Nama_MK');
  tambah('sks','SKS'); tambah('dosen','Dosen');
  tambah('id_tugas','ID_Tugas'); tambah('judul','Judul');
  tambah('deskripsi','Deskripsi'); tambah('deadline','Deadline');
  tambah('link_materi','Link_Materi'); tambah('link_tugas','Link_Tugas');
  tambah('kodeujian','KodeUjian'); tambah('kode_mk','KodeMK');
  tambah('noSoal','NoSoal'); tambah('jenisSoal','JenisSoal');
  tambah('soal','Soal'); tambah('pilihanA','PilihanA');
  tambah('pilihanB','PilihanB'); tambah('pilihanC','PilihanC');
  tambah('pilihanD','PilihanD'); tambah('kunci','Kunci');
  tambah('tanggal','Tanggal'); tambah('jamMulai','JamMulai');
  tambah('jamSelesai','JamSelesai'); tambah('status','Status');
  tambah('durasiMenit','DurasiMenit');
  tambah('nilai1','Nilai1'); tambah('nilai2','Nilai2');
  tambah('nilai3','Nilai3'); tambah('nilai4','Nilai4');
  tambah('nilai','Nilai'); tambah('link','Link');
  tambah('jawaban','Jawaban'); tambah('waktuJawab','WaktuJawab');
  tambah('koreksi_dosen','Koreksi_Dosen');

  // Khusus field yang di kode kita beda nama total
  if(d.KodeUjian) dataGS.KodeUjian = d.KodeUjian;
  if(d.KodeMK) { dataGS.KodeMK = d.KodeMK; dataGS.Kode_MK = d.KodeMK; }
  if(d.NoSoal !== undefined) dataGS.NoSoal = d.NoSoal;
  if(d.JenisSoal) dataGS.JenisSoal = d.JenisSoal;
  if(d.NIM) dataGS.nim = d.NIM;

  try{
    await fetch(API, {method:'POST', mode:'no-cors', headers:{'Content-Type':'text/plain'}, body: JSON.stringify({action:'save', sheet: sheet, data: dataGS, all: DB})});
    console.log('KIRIM KE GS:', sheet, dataGS);
  }catch(e){ console.log('Simpan GS gagal', e); }
}

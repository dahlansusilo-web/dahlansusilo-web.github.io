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

// CONFIG - Satu-satunya tempat ganti API
const API = "https://script.google.com/macros/s/AKfycbxOb93EOtRsz980tV-lWvDfadWdUnZMMMNj0yNnbtPkj5lXd5nTPse8CkmKKqxDV0KY/exec";

// STATE GLOBAL - Dipakai semua modul
let DB = JSON.parse(localStorage.getItem('elearning_db_final_gs')||'null') || {mahasiswa:[],mataKuliah:[],peserta:[],materi:[],pengumpulan:[],ujian:[],soal:[],jawaban:[],resetRequests:[]};
if(!DB.resetRequests) DB.resetRequests=[];
let user=null, tab='dashboard', selectedMK=null, subTab='materi', subTabDosen='link';
let timerInterval=null, sisaDetik=0, ujianAktifKode=null, jawabanTerkunci={};
let formMateriIdx=-1, showFormMateri=false, showFormMK=false, editMKCode=null, showFormSoal=false, showFormPeserta=false, showFormUjian=false, showFormMhs=false, editMhsNim=null;

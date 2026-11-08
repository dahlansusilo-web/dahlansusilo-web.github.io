// AUTH.JS
function doLogin(){
  if(!DB.mahasiswa || DB.mahasiswa.length===0){ document.getElementById('loginMsg').innerText='Masih menghubungkan ke GS, tunggu sebentar sampai tombol Masuk aktif...'; return; }
  const nim=document.getElementById('inNim').value.trim(), pw=document.getElementById('inPass').value.trim();
  const u=DB.mahasiswa.find(x=>String(x.nim).trim()===nim && String(x.password).trim()===pw);
  if(!u){document.getElementById('loginMsg').innerText='NIM / Password salah. Cek di Sheet Mahasiswa di GS.';return}
  user=u; selectedMK=null; tab='dashboard';
  document.getElementById('pageLogin').classList.add('hidden');
  document.getElementById('pageApp').classList.remove('hidden');
  document.getElementById('topUser').innerText=u.nama+' ('+u.role+')';
  document.getElementById('hello').innerText='Halo, '+u.nama+' 👋';
  document.getElementById('helloSub').innerText='NIM: '+u.nim+' • Role: '+u.role+' • Angkatan: '+u.angkatan;
  renderTabs(); render();
}
function logout(){
  if(timerInterval) clearInterval(timerInterval);
  if(confirm('Yakin mau keluar, '+user.nama+'?')) window.location.href = '../index.html';
}
function kembaliKeHalamanUtama(){
  window.location.href = '../index.html';
}
function toggleFormGantiPassword(){
  const el=document.getElementById('formGantiPass'); el.classList.toggle('hidden');
  document.getElementById('gpNama').innerText=user.nama+' ('+user.nim+')';
  document.getElementById('gp_lama').value=''; document.getElementById('gp_baru').value=''; document.getElementById('gp_baru2').value=''; document.getElementById('gpMsg').innerText='';
  if(!el.classList.contains('hidden')) el.scrollIntoView({behavior:'smooth'});
}
function simpanPasswordBaru(){
  const lama=document.getElementById('gp_lama').value, baru=document.getElementById('gp_baru').value, baru2=document.getElementById('gp_baru2').value, msg=document.getElementById('gpMsg');
  if(lama!==String(user.password)){msg.innerText='Password Lama salah!';return}
  if(baru.length<4){msg.innerText='Password Baru minimal 4 karakter!';return}
  if(baru!==baru2){msg.innerText='Password Baru tidak sama dengan ketik ulang!';return}
  if(baru===lama){msg.innerText='Password Baru tidak boleh sama dengan Password Lama!';return}
  if(!confirm('Yakin ganti password? Setelah ini kamu akan logout dan harus login pakai password baru.'))return;
  const idx=DB.mahasiswa.findIndex(m=>String(m.nim)===String(user.nim));
  DB.mahasiswa[idx].password=baru; user.password=baru;
  save('Mahasiswa',{nim:user.nim,password:baru,action:'updatePassword'});
  alert('Password berhasil diganti & tersimpan ke GS! Silakan login lagi pakai password baru.'); location.reload();
}
function toggleLupaPassword(){ document.getElementById('boxLupa').classList.toggle('hidden'); }
function kirimPermintaanReset(){
  const nim=document.getElementById('lupa_nim').value.trim(), msg=document.getElementById('lupaMsg');
  const m=DB.mahasiswa.find(x=>String(x.nim)===nim);
  if(!m){msg.style.color='red';msg.innerText='NIM tidak ditemukan di GS!';return}
  if(m.role==='dosen'){msg.style.color='red';msg.innerText='Akun dosen tidak bisa request reset di sini.';return}
  const sudah=DB.resetRequests.find(r=>String(r.nim)===nim && r.status==='Menunggu');
  if(sudah){msg.style.color='#854d0e';msg.innerText='Permintaan kamu sudah dikirim dan masih menunggu Dosen.';return}
  DB.resetRequests.push({nim,nama:m.nama,tanggal:new Date().toLocaleString('id-ID'),status:'Menunggu'});
  save('ResetRequests',{nim,nama:m.nama,tanggal:new Date().toLocaleString('id-ID'),status:'Menunggu'});
  msg.style.color='green';msg.innerText='✅ Permintaan terkirim ke Dosen! Hubungi Dosen agar cepat direset.';alert('Permintaan reset password terkirim ke Dosen!');
}

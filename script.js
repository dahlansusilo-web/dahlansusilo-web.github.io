// script.js - untuk index.html, baca dari profil.json (cepat, tanpa GS)
async function loadIndex(){
  try{
    const r = await fetch("profil.json");
    const d = await r.json();
    // Foto besar + foto kecil pojok kanan atas
    const avatar = document.getElementById("fotoUtama");
    if(avatar && d.foto) avatar.src = d.foto;
    const top = document.getElementById("fotoTop");
    if(top && d.foto){ top.src = d.foto; top.style.display = "block"; }
    // Nama + jabatan + bidang
    const namaEl = document.getElementById("namaUtama");
    if(namaEl) namaEl.textContent = (d.nama || "DAHLAN SUSILO").toUpperCase();
    const badge = document.getElementById("badgeUtama");
    if(badge) badge.textContent = (d.jabatan || "Dosen") + " • Akademik • Peneliti";
    const desc = document.getElementById("descUtama");
    if(desc) desc.textContent = "Pengajar & Peneliti — " + (d.bidang || "Ilmu Komputer");
  }catch(e){ console.log("profil.json belum ke-load", e); }
}
loadIndex();

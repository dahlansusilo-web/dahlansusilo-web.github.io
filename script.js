// script.js - baca dari profil.js (variabel PROFIL), BUKAN dari GS, BUKAN dari profil.json
function loadProfil(){
  const d = window.PROFIL;
  if(!d){ console.log("PROFIL belum ke-load, cek profil.js"); return; }
  const nama = [d.gelardepan||"", d.nama||"", d.gelar_belakang||""].join(" ").replace(/\s+/g," ").trim();

  // --- index.html ---
  const namaUtama = document.getElementById("namaUtama");
  if(namaUtama) namaUtama.textContent = nama.toUpperCase();
  const fotoUtama = document.getElementById("fotoUtama");
  if(fotoUtama && d.foto) fotoUtama.src = d.foto;
  const badgeUtama = document.getElementById("badgeUtama");
  if(badgeUtama) badgeUtama.textContent = d.jabatan || "Lektor";
  const descUtama = document.getElementById("descUtama");
  if(descUtama) descUtama.textContent = "Pengajar & Peneliti — " + (d.bidang||"Ilmu Komputer");

  // --- profil.html ---
  const pNama = document.getElementById("pNama");
  if(pNama) pNama.textContent = nama.toUpperCase();
  // ILMU KOMPUTER PADA LEKTOR DIBUANG, BADGE CUMA "Lektor" SAJA
  const pBadge = document.getElementById("pBadge");
  if(pBadge) pBadge.textContent = d.jabatan || "Lektor";
  const pDesc = document.getElementById("pDesc");
  if(pDesc) pDesc.textContent = "Pengajar & Peneliti — " + (d.bidang||"Ilmu Komputer");
  const pTentang = document.getElementById("pTentang");
  if(pTentang) pTentang.textContent = d.tentang || "";
  const pFoto = document.getElementById("pFoto");
  if(pFoto && d.foto) pFoto.src = d.foto;
  const pEmail = document.getElementById("pEmail");
  if(pEmail && d.email){ pEmail.textContent=d.email; pEmail.href="mailto:"+d.email; }
  const pScholar = document.getElementById("pScholar");
  if(pScholar && d.scholar){ pScholar.textContent=d.scholar; pScholar.href=d.scholar; }
  const pGithub = document.getElementById("pGithub");
  if(pGithub && d.github){ pGithub.textContent=d.github; pGithub.href=d.github; }

  const fotoTop = document.getElementById("fotoTop");
  if(fotoTop && d.foto){ fotoTop.src = d.foto; fotoTop.style.display = "block"; }
}
loadProfil();

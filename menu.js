const API_URL = "https://script.google.com/macros/s/AKfycbwVBcduHoQsSjV21I28w8zljg_ulQkB1y6-kew-cgLAi_I6NutbEqQZcPi2db1nn-Kz/exec";

function loadMenu(){
  const navContainer = document.getElementById('autoNav');
  const fotoEl = document.getElementById('fotoTop');
  
  // 1. Load Foto Profil
  fetch(API_URL+"?page=profil&t="+Date.now()).then(r=>r.json()).then(p=>{
    if(p.foto && fotoEl){ fotoEl.src = p.foto; fotoEl.style.display='block'; }
  });
  
  // 2. Load Daftar Sheet jadi Menu Otomatis
  fetch(API_URL+"?page=list&t="+Date.now()).then(r=>r.json()).then(list=>{
    let menuHTML = `<a href="/index.html" style="text-decoration:none;color:#6b5a52;font-size:14px">Beranda</a>`;
    list.forEach(name=>{
      if(name.toLowerCase()=='profil') return;
      let lower = name.toLowerCase();
      let url = `/${lower}/`;
      // Biar judul rapi
      let label = name;
      menuHTML += `<a href="${url}" style="text-decoration:none;color:#6b5a52;font-size:14px">${label}</a>`;
    });
    if(navContainer) navContainer.innerHTML = menuHTML;
  });
}
document.addEventListener('DOMContentLoaded', loadMenu);

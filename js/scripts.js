
// ----- CONFIG -----
// Set these to your GitHub username and repo name where /images is located
const GITHUB_USER = "Mangkah";
const GITHUB_REPO = "PhotoSite";

// number of items to load per batch
const BATCH_SIZE = 12;

let allImages = []; // fetched list of image file objects {name, download_url, category}
let displayed = 0;   // how many shown so far
let currentFilter = 'all';

// utility: determine category from filename (flexible heuristics)
function detectCategory(filename){
  const n = filename.toLowerCase();
  if(n.includes('portrait') || n.includes('people') || n.includes('person')) return 'portraits';
  if(n.includes('landscape') || n.includes('landscape') || n.includes('scenery') ) return 'landscape';
  if(n.includes('ai') || n.includes('generated') || n.includes('midjourney') || n.includes('stable')) return 'ai';
  if(n.includes('edit') || n.includes('before') || n.includes('after')) return 'edits';
  return 'uncategorized';
}

function fetchImages(){
  const apiURL = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/images`;
  return fetch(apiURL).then(r=>r.json()).then(files => {
    return files.filter(f=>f.name.match(/\.(jpg|jpeg|png|webp|gif)$/i)).map(f=>{
      return { name: f.name, download_url: f.download_url, category: detectCategory(f.name) };
    });
  });
}

// render a batch of images respecting current filter
function renderBatch(){
  const gallery = document.getElementById('gallery');
  const toShow = allImages.filter(img => currentFilter === 'all' || img.category === currentFilter);
  const batch = toShow.slice(displayed, displayed + BATCH_SIZE);

  batch.forEach(item => {
    const el = document.createElement('div');
    el.className = 'masonry-item';
    el.innerHTML = `
      <img src="${item.download_url}" alt="${item.name}" loading="lazy">
      <p>${item.name.replace(/[-_]/g,' ').replace(/\.[^.]+$/, '')}</p>`;
    el.querySelector('img').addEventListener('click', ()=> openLightbox(item.download_url, item.name));
    gallery.appendChild(el);

    // reveal with stagger using requestAnimationFrame
    requestAnimationFrame(()=>{
      setTimeout(()=> el.classList.add('show'), 40);
    });
  });

  displayed += batch.length;
  updateLoadStatus();
}

// update load status text
function updateLoadStatus(){
  const status = document.getElementById('loadStatus');
  const filtered = allImages.filter(img => currentFilter === 'all' || img.category === currentFilter);
  if(displayed >= filtered.length){
    status.textContent = 'All loaded.';
  } else {
    status.textContent = 'Scroll down to load more…';
  }
}

// reset gallery and render from scratch (on filter change)
function resetGallery(){
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = '';
  displayed = 0;
  renderBatch();
}

// infinite scroll handler
function handleScroll(){
  const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 1200;
  if(nearBottom){
    const filtered = allImages.filter(img => currentFilter === 'all' || img.category === currentFilter);
    if(displayed < filtered.length){
      renderBatch();
    }
  }
}

// setup filters UI
function setupFilters(){
  document.querySelectorAll('.filter').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.filter').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      resetGallery();
    });
  });
}

// Lightbox
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lightboxImg');
const lbCap = document.getElementById('lightboxCaption');
document.getElementById('lightboxClose').addEventListener('click', ()=> closeLightbox());
lightbox.addEventListener('click', (e)=>{ if(e.target === lightbox) closeLightbox(); });

function openLightbox(src, caption){
  lbImg.src = src;
  lbCap.textContent = caption;
  lightbox.classList.add('visible');
  lightbox.classList.remove('hidden');
  lightbox.setAttribute('aria-hidden','false');
  // small animation tweak
  setTimeout(()=> lbImg.style.transform = 'scale(1)', 60);
}
function closeLightbox(){
  lightbox.classList.remove('visible');
  lightbox.classList.add('hidden');
  lightbox.setAttribute('aria-hidden','true');
  lbImg.style.transform = 'scale(.98)';
  lbImg.src = '';
}

// init
document.addEventListener('DOMContentLoaded', ()=>{
  // theme persistence
  const themeSelect = document.getElementById('themeSelect');
  themeSelect.addEventListener('change', ()=> document.body.className = themeSelect.value);

  setupFilters();

  fetchImages().then(list => {
    allImages = list;
    // sort - favor categorized and alphabetical
    allImages.sort((a,b)=> (a.category > b.category) ? 1 : (a.category < b.category) ? -1 : (a.name > b.name ? 1 : -1));
    renderBatch();
  }).catch(err=>{
    console.error('Failed to fetch images from GitHub API', err);
    document.getElementById('loadStatus').textContent = 'Failed to load images. Make sure GITHUB_USER and GITHUB_REPO are set in js/scripts.js and the repo is public.';
  });

  window.addEventListener('scroll', handleScroll);
  window.addEventListener('resize', ()=> requestAnimationFrame(()=>{}));
});

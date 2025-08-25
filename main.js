// Keep sidebar offset equal to the real header height
(function(){
  const header = document.querySelector('.site-header');
  if(!header) return;

  const setOffset = () => {
    const h = Math.round(header.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--header-h', h + 'px');
  };

  setOffset();
  if (window.ResizeObserver) {
    new ResizeObserver(setOffset).observe(header);
  } else {
    window.addEventListener('resize', setOffset);
  }
})();

// Smooth anchor scroll
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const id = a.getAttribute('href');
    if(id && id.length>1){
      const el = document.querySelector(id);
      if(el){
        e.preventDefault();
        el.scrollIntoView({behavior:'smooth', block:'start'});
        history.pushState(null, "", id);
      }
    }
  });
});

// Mobile nav toggle
const menuBtn = document.querySelector('.menu-btn');
const nav = document.getElementById('nav');
if(menuBtn && nav){
  menuBtn.addEventListener('click', ()=>{
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  // Close the menu when any nav link is clicked
  nav.querySelectorAll('a[href^="#"]').forEach(link=>{
    link.addEventListener('click', ()=>{
      nav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

// Reveal on enter
const io = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  });
},{threshold:0.15});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

// Subtle tilt on cards
document.querySelectorAll('.tilt').forEach(card=>{
  const maxTilt = 8;
  card.addEventListener('pointermove', e=>{
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const rx = (0.5 - y) * maxTilt;
    const ry = (x - 0.5) * maxTilt;
    card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    card.style.boxShadow = '0 16px 40px rgba(0,0,0,.25)';
  });
  card.addEventListener('pointerleave', ()=>{
    card.style.transform = '';
    card.style.boxShadow = '';
  });
});

// Build the left on-page nav rail
(function(){
  // Updated: include "experience" instead of "timeline"
  const ids = ['overview','research','robotics','mmb','projects','experience','skills','contact','resume'];
  const sections = ids.map(id => document.getElementById(id)).filter(Boolean);
  const list = document.getElementById('tl-list');
  if(!list || !sections.length) return;

  list.style.setProperty('--row-count', String(sections.length));

  sections.forEach((sec, i)=>{
    const li = document.createElement('li');
    li.className = 'tl-item';

    const dot = document.createElement('span');
    dot.className = 'tl-dot';
    dot.setAttribute('data-step', String(i+1));

    const a = document.createElement('a');
    a.className = 'tl-link';
    a.href = `#${sec.id}`;
    a.textContent = sec.dataset.title || sec.querySelector('h1,h2')?.textContent?.trim() || sec.id;

    li.appendChild(dot);
    li.appendChild(a);
    list.appendChild(li);
  });

  list.querySelectorAll('.tl-link').forEach(a=>{
    a.addEventListener('click', e=>{
      e.preventDefault();
      const id = a.getAttribute('href');
      document.querySelector(id)?.scrollIntoView({behavior:'smooth', block:'start'});
    });
  });

  const items = Array.from(list.querySelectorAll('.tl-item'));
  const map = new Map(sections.map((sec,i)=>[sec, items[i]]));

  const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64;

  // IntersectionObserver: pick the visible section with the largest intersection ratio
  const io = new IntersectionObserver((entries)=>{
    let best = null, ratio = 0;
    for(const e of entries){
      if(e.isIntersecting && e.intersectionRatio > ratio){
        ratio = e.intersectionRatio;
        best = e.target;
      }
    }
    if(best){
      items.forEach(li => li.classList.remove('active'));
      map.get(best)?.classList.add('active');
    }
  }, {
    root: null,
    threshold: [0.25, 0.5, 0.75],
    rootMargin: `-${headerH}px 0px -40% 0px`
  });

  sections.forEach(sec => io.observe(sec));

  // Fallback: choose the section nearest the viewport center to avoid "second-to-last" bug
  function updateActiveByCenter(){
    const y = window.scrollY + window.innerHeight * 0.5;
    let best = null, bestDist = Infinity;
    for(const s of sections){
      const top = window.scrollY + s.getBoundingClientRect().top;
      const d = Math.abs(top - y);
      if(d < bestDist){ bestDist = d; best = s; }
    }
    if(best){
      items.forEach(li => li.classList.remove('active'));
      map.get(best)?.classList.add('active');
    }
  }
  window.addEventListener('scroll', updateActiveByCenter, {passive:true});
  window.addEventListener('resize', updateActiveByCenter);
  updateActiveByCenter();
})();

// Toggle open/close for sidebar
(function(){
  const sidebar = document.getElementById('side-timeline');
  const btn = document.querySelector('.side-toggle');
  if(!sidebar || !btn) return;

  function setState(open){
    sidebar.classList.toggle('collapsed', !open);
    document.body.classList.toggle('sidebar-collapsed', !open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close sidebar' : 'Open sidebar');
  }

  setState(true); // set to false if you want it collapsed by default
  btn.addEventListener('click', ()=> setState(btn.getAttribute('aria-expanded') !== 'true'));
})();

// Scroll progress bar
(function(){
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  const clamp01 = v => Math.max(0, Math.min(1, v));
  const update = () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    const max = scrollHeight - clientHeight;
    const ratio = max > 0 ? clamp01(scrollTop / max) : 0;
    bar.style.width = (ratio * 100).toFixed(2) + '%';
  };

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  window.addEventListener('load', update);
  update();
})();

// Cursor spotlight position variables
(function(){
  const root = document.documentElement;
  const set = (e)=>{
    root.style.setProperty('--mx', (e.clientX || 0) + 'px');
    root.style.setProperty('--my', (e.clientY || 0) + 'px');
  };
  window.addEventListener('mousemove', set, {passive:true});
  window.addEventListener('touchmove', (e)=>{
    const t = e.touches && e.touches[0];
    if(t) set(t);
  }, {passive:true});
  // initialize to center
  root.style.setProperty('--mx', (window.innerWidth/2) + 'px');
  root.style.setProperty('--my', (window.innerHeight/2) + 'px');
})();

// Footer year
const year = document.getElementById('year');
if(year) year.textContent = new Date().getFullYear();
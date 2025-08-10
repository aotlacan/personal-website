// Keep sidebar below the real header height
(function(){
  const header = document.querySelector('.site-header');
  if(!header) return;

  const setOffset = () => {
    const h = Math.round(header.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--header-h', h + 'px');
  };

  setOffset();
  new ResizeObserver(setOffset).observe(header);
  window.addEventListener('resize', setOffset);
})();


// Smooth anchor scroll
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const id = a.getAttribute('href');
    if(id && id.length>1){
      const el = document.querySelector(id);
      if(el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth', block:'start'}); }
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

// Build the side timeline
(function(){
  const ids = ['overview','research','robotics','mmb','projects','timeline','skills','contact','resume'];
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

  const obs = new IntersectionObserver(entries=>{
    let best = null, bestDist = Infinity;
    for(const e of entries){
      if(!e.isIntersecting) continue;
      const rect = e.target.getBoundingClientRect();
      const dist = Math.abs(rect.top - 110);
      if(dist < bestDist){ bestDist = dist; best = e.target; }
    }
    if(best){
      items.forEach(li => li.classList.remove('active'));
      map.get(best)?.classList.add('active');
    }
  }, { root: null, rootMargin: '-20% 0px -70% 0px', threshold: [0,.25,.5,.75,1] });

  sections.forEach(sec => obs.observe(sec));
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

// Footer year
const year = document.getElementById('year');
if(year) year.textContent = new Date().getFullYear();

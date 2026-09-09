// Shared behaviour for EVERY page: nav, reveal, count-up, WhatsApp links, enquiry modal.
// Ported from the single-file build of 2026-07; each block guards for elements that
// only exist on some pages.
import { SITE, IMG, waURL } from './config.js';

/* Reveal animations only arm when JS is alive (CSS is gated on html.js-on) */
document.documentElement.classList.add('js-on');

/* ===== IMAGE SAFETY NET — any photo that fails to load swaps to a branded card ===== */
(function(){
  const FALLBACK='data:image/svg+xml;utf8,'+encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#008292"/><stop offset="1" stop-color="#004E58"/>
      </linearGradient></defs>
      <rect width="800" height="1000" fill="url(#g)"/>
      <circle cx="400" cy="470" r="150" fill="#F9B14E"/>
      <circle cx="400" cy="470" r="86" fill="#fff"/>
      <text x="400" y="700" text-anchor="middle" fill="#fff" font-family="Arial" font-size="34" font-weight="bold" letter-spacing="6">CEYLON CARRIERS</text>
    </svg>`);
  function guard(img){
    if(img.classList.contains('wm-map'))return; /* the world map SVG reports 0 natural size; never fallback it */
    if(img.dataset.guarded)return;
    img.dataset.guarded='1';
    img.addEventListener('error',()=>{ if(img.src!==FALLBACK) img.src=FALLBACK; },{once:false});
    // Catch images that already failed before this script ran
    if(img.complete&&img.naturalWidth===0&&img.src&&img.src!==FALLBACK) img.src=FALLBACK;
  }
  document.querySelectorAll('img').forEach(guard);
  // Hero slides & preview cards are injected later — watch for them
  new MutationObserver(muts=>{
    muts.forEach(m=>m.addedNodes.forEach(n=>{
      if(n.nodeType!==1)return;
      if(n.tagName==='IMG')guard(n);
      n.querySelectorAll&&n.querySelectorAll('img').forEach(guard);
    }));
  }).observe(document.body,{childList:true,subtree:true});
})();


/* ===== NAV — scroll state + burger ===== */
(function(){
  const nav=document.getElementById('nav');
  const bar=document.getElementById('scrollProgress');
  const sticky=document.getElementById('stickyBar');
  const hero=document.querySelector('.hero');

  function onScroll(){
    const y=window.scrollY;
    nav.classList.toggle('scrolled',y>60);
    const h=document.documentElement.scrollHeight-window.innerHeight;
    bar.style.transform=`scaleX(${h>0?y/h:0})`;
    sticky.classList.toggle('show',hero?y>hero.offsetHeight*0.55:y>280);
  }
  window.addEventListener('scroll',onScroll,{passive:true});
  onScroll();

  const menu=document.getElementById('mobileMenu');
  document.getElementById('burger').addEventListener('click',()=>{menu.classList.add('open');menu.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'});
  const close=()=>{menu.classList.remove('open');menu.setAttribute('aria-hidden','true');document.body.style.overflow=''};
  document.getElementById('menuClose').addEventListener('click',close);
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
})();


/* ===== SCROLL REVEAL ===== */
(function(){
  const all=document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){all.forEach(el=>el.classList.add('visible'));return;}
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target);}
    });
  },{threshold:0.1,rootMargin:'0px 0px -50px 0px'});
  all.forEach(el=>io.observe(el));
})();


/* ===== COUNT-UP STATS ===== */
(function(){
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      io.unobserve(e.target);
      const target=+e.target.dataset.count;
      const t0=performance.now(),dur=1600;
      (function tick(t){
        const p=Math.min((t-t0)/dur,1);
        e.target.textContent=Math.round((1-Math.pow(1-p,3))*target).toLocaleString();
        if(p<1)requestAnimationFrame(tick);
      })(t0);
    });
  },{threshold:0.4});
  document.querySelectorAll('[data-count]').forEach(el=>io.observe(el));
})();


/* ===== WHATSAPP DEEP LINKS (simple CTAs) ===== */
document.querySelectorAll('[data-wa-link]').forEach(a=>{
  const dest=a.dataset.dest;
  const msg=dest
    ? `Hi Ceylon Carriers! I'm interested in your ${dest} tours. Could you share more details?`
    : `Hi Ceylon Carriers! I'd like help planning a trip.`;
  a.href=waURL(msg);
});


/* ===== SMART MULTI-STEP INQUIRY MODAL ===== */
(function(){
  const overlay=document.getElementById('modalOverlay');
  const bar=document.getElementById('mBar');
  const steps=[...overlay.querySelectorAll('.m-step')];
  const DESTS={
    Inbound:['Sri Lanka Highlights','Cultural Triangle','Hill Country','Southern Coast','Wildlife & Safari','Custom Sri Lanka Trip'],
    Outbound:['Velankanni & Chennai','Bhutan & Golden Triangle','Portugal','Southeast Asia','Europe (Other)','Somewhere Else']
  };
  const state={scope:null,dest:null,type:'Leisure',date:'',pax:'2',name:'',email:'',phone:''};
  let cur=1;

  function show(n){
    steps.forEach(s=>s.classList.toggle('on',+s.dataset.step===n));
    cur=n;
    bar.style.width=(Math.min(n,4)/4*100)+'%';
  }
  function open(prefDest){
    overlay.classList.add('open');
    document.body.style.overflow='hidden';
    if(prefDest){state.dest=prefDest;}
    show(1);
  }
  function close(){
    overlay.classList.remove('open');
    document.body.style.overflow='';
  }
  // Openers — event delegation so dynamically-built hero buttons work too
  document.addEventListener('click',e=>{
    const t=e.target.closest('[data-open-modal]');
    if(t){open(t.dataset.dest||null);}
  });
  document.getElementById('modalClose').addEventListener('click',close);
  document.getElementById('mDoneClose').addEventListener('click',close);
  overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay.classList.contains('open'))close();});
  overlay.querySelectorAll('[data-back]').forEach(b=>b.addEventListener('click',()=>show(cur-1)));

  // STEP 1 — scope
  const next1=document.getElementById('next1');
  overlay.querySelectorAll('[data-choice="scope"]').forEach(c=>{
    c.addEventListener('click',()=>{
      overlay.querySelectorAll('[data-choice="scope"]').forEach(x=>x.classList.remove('sel'));
      c.classList.add('sel');
      state.scope=c.dataset.val;
      next1.disabled=false;next1.style.opacity='1';
      buildChips();
    });
  });
  next1.addEventListener('click',()=>{if(state.scope)show(2);});

  // STEP 2 — destination chips (filtered by scope)
  const chipsWrap=document.getElementById('destChips');
  const next2=document.getElementById('next2');
  function buildChips(){
    chipsWrap.innerHTML='';
    (DESTS[state.scope]||[]).forEach(d=>{
      const b=document.createElement('button');
      b.className='chip'+(state.dest===d?' sel':'');
      b.textContent=d;
      b.addEventListener('click',()=>{
        chipsWrap.querySelectorAll('.chip').forEach(x=>x.classList.remove('sel'));
        b.classList.add('sel');state.dest=d;
        next2.disabled=false;next2.style.opacity='1';
      });
      chipsWrap.appendChild(b);
    });
    if(state.dest&&(DESTS[state.scope]||[]).includes(state.dest)){next2.disabled=false;next2.style.opacity='1';}
    else{state.dest=null;next2.disabled=true;next2.style.opacity='.45';}
  }
  next2.addEventListener('click',()=>{if(state.dest)show(3);});

  // STEP 3 — details
  overlay.querySelectorAll('[data-choice="type"]').forEach(c=>{
    c.addEventListener('click',()=>{
      overlay.querySelectorAll('[data-choice="type"]').forEach(x=>x.classList.remove('sel'));
      c.classList.add('sel');state.type=c.dataset.val;
    });
  });
  document.getElementById('next3').addEventListener('click',()=>{
    state.date=document.getElementById('fDate').value.trim();
    state.pax=document.getElementById('fPax').value;
    show(4);
  });

  // STEP 4 — contact + WhatsApp handoff
  function setErr(id,bad){document.getElementById(id).classList.toggle('err',bad);}
  document.getElementById('mSubmit').addEventListener('click',()=>{
    const name=document.getElementById('fName').value.trim();
    const email=document.getElementById('fEmail').value.trim();
    const phone=document.getElementById('fPhone').value.trim();
    const emailOK=!email||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    setErr('wrapName',!name);setErr('wrapEmail',!emailOK);setErr('wrapPhone',!phone);
    if(!name||!emailOK||!phone)return;
    Object.assign(state,{name,email,phone});

    const msg=
`Hi Ceylon Carriers! I'd like to plan a ${state.type.toLowerCase()} trip.
• Direction: ${state.scope==='Inbound'?'Visiting Sri Lanka':'Travelling from Sri Lanka'}
• Destination: ${state.dest}
• Dates: ${state.date||'Flexible'}
• Travellers: ${state.pax}
• Name: ${state.name}
• Email: ${state.email||'not given'}
• Phone: ${state.phone}
• Sent from: ${document.body.dataset.page||'website'}`;

    /* Open WhatsApp synchronously inside the click gesture so popup
       blockers never eat the handoff, then show the done step. */
    window.open(waURL(msg),'_blank','noopener');
    show(5);
  });
})();

/* ===== FILM BAND — play only while on screen (saves data/battery, mobile-safe) ===== */
(function(){
  const v=document.querySelector('.film-video');
  if(!v) return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return; // keep poster, no motion
  if(!('IntersectionObserver' in window)){ v.play&&v.play().catch(()=>{}); return; }
  const io=new IntersectionObserver(es=>{
    es.forEach(e=>{ if(e.isIntersecting){ v.play&&v.play().catch(()=>{}); } else { v.pause&&v.pause(); } });
  },{threshold:0.25});
  io.observe(v);
})();



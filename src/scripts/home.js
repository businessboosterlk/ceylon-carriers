// Home page only: vibe hero, destinations toggle, testimonials, parallax, film, world map.
import { SITE, IMG, waURL } from './config.js';

/* ===== HERO — WHAT'S YOUR VIBE (interactive landing) ===== */
(function(){
  const ICON={
    cool:'<svg viewBox="0 0 24 24"><path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9L4.9 19.1"/></svg>',
    beach:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/></svg>',
    wild:'<svg viewBox="0 0 24 24"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/></svg>',
    culture:'<svg viewBox="0 0 24 24"><path d="M3 21h18M4 21V10l8-5 8 5v11M9 21v-6h6v6"/></svg>',
    faith:'<svg viewBox="0 0 24 24"><path d="M12 2v6M9 5h6M6 22V11l6-4 6 4v11M6 22h12M10 22v-4a2 2 0 0 1 4 0v4"/></svg>'
  };
  // Each mood spans multiple countries - inbound Sri Lanka AND outbound worldwide.
  // bg = full-screen background per mood; swap any images/ file (same name) to update it everywhere.
  // Dedicated bg-*.jpg images can replace these later for even more variety.
  const VIBES=[
    {key:'cool',label:'Cool & Misty',bg:IMG+'bg-cool.jpg',tag:'From the Himalayas of Bhutan to the temples of Japan and Sri Lanka’s misty tea country',
      dests:[{name:'Bhutan',img:IMG+'tigers-nest.jpg'},{name:'Japan',img:IMG+'japan.jpg'},{name:'Hill Country, Sri Lanka',img:IMG+'hill-country.jpg'}]},
    {key:'beach',label:'Beach & Sun',bg:IMG+'bg-beach.jpg',tag:'Island sun and warm seas, from the Maldives to Bali to southern Sri Lanka',
      dests:[{name:'The Maldives',img:IMG+'maldives.jpg'},{name:'Bali, Indonesia',img:IMG+'bali.jpg'},{name:'Southern Sri Lanka',img:IMG+'south-coast.jpg'}]},
    {key:'wild',label:'Wild & Nature',bg:IMG+'bg-wild.jpg',tag:'Safaris and untamed trails, from the African savannah to the wilds of Sri Lanka',
      dests:[{name:'African Safari',img:IMG+'africa.jpg'},{name:'Yala Safari, Sri Lanka',img:IMG+'elephant.jpg'},{name:'Bhutan Himalayas',img:IMG+'tigers-nest.jpg'}]},
    {key:'culture',label:'Culture & Heritage',bg:IMG+'bg-culture.jpg',tag:'Ancient wonders, from Cappadocia to the Taj Mahal to old-world Lisbon',
      dests:[{name:'Cappadocia, Turkey',img:IMG+'turkey.jpg'},{name:'Golden Triangle, India',img:IMG+'taj-arch.jpg'},{name:'Historic Lisbon, Portugal',img:IMG+'lisbon-tram.jpg'}]},
    {key:'faith',label:'Faith & Pilgrimage',bg:IMG+'velankanni-basilica.jpg',tag:'Sacred journeys across India and Sri Lanka, guided with reverence',
      dests:[{name:'Velankanni & Chennai, India',img:IMG+'velankanni-basilica.jpg'},{name:'Sacred Sri Lanka',img:IMG+'sigiriya.jpg'},{name:'Shore Temples, India',img:IMG+'shore-temple.jpg'}]}
  ];
  const bg=document.getElementById('heroBg');
  const vibesWrap=document.getElementById('heroVibes');
  const previews=document.getElementById('heroPreviews');
  const tagline=document.getElementById('heroTagline');
  const recCta=document.getElementById('heroRecCta');
  const recText=document.getElementById('heroRecText');
  if(!bg||!vibesWrap) return;
  const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
  let idx=0,timer=null,userPicked=false;
  VIBES.forEach((v,i)=>{
    const layer=document.createElement('div');
    layer.className='layer'+(i===0?' on':'');
    layer.innerHTML='<img src="'+v.bg+'" alt="" '+(i===0?'fetchpriority="high"':'loading="lazy"')+'>';
    bg.appendChild(layer);
    const pill=document.createElement('button');
    pill.className='hero-vibe'+(i===0?' on':'');
    pill.setAttribute('role','tab');
    pill.setAttribute('aria-selected',i===0?'true':'false');
    pill.innerHTML=(ICON[v.key]||'')+'<span>'+v.label+'</span>';
    pill.addEventListener('click',()=>{userPicked=true;stop();go(i);});
    vibesWrap.appendChild(pill);
  });
  const layers=[...bg.children];
  const pills=[...vibesWrap.children];
  const bookmark='<span class="bookmark"><svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></span>';
  function renderPreviews(v){
    previews.innerHTML=v.dests.map(d=>
      '<div class="pcard" data-open-modal data-dest="'+esc(d.name)+'">'+
        '<img src="'+d.img+'" alt="'+esc(d.name)+'" loading="lazy" width="400" height="573">'+
        bookmark+
        '<span class="pcard-name">'+esc(d.name)+'</span>'+
      '</div>').join('');
  }
  function go(n){
    idx=(n+VIBES.length)%VIBES.length;
    const v=VIBES[idx];
    layers.forEach((l,i)=>l.classList.toggle('on',i===idx));
    const img=layers[idx].querySelector('img'); if(img){img.style.animation='none';void img.offsetWidth;img.style.animation='';}
    pills.forEach((p,i)=>{p.classList.toggle('on',i===idx);p.setAttribute('aria-selected',i===idx?'true':'false');});
    tagline.innerHTML='<b class="hero-tagline-mood">'+esc(v.label)+'.</b> '+esc(v.tag)+'.';
    renderPreviews(v);
    // Recommendation handoff: build a pre-filled WhatsApp message from this mood + its 3 matches
    if(recCta){
      const names=v.dests.map(d=>'\n• '+d.name).join('');
      const msg='Hi Ceylon Carriers! I used your Vibe Finder and my vibe is '+v.label+'.'
        +' Please recommend an itinerary for one of these:'+names+'\n\nWhen is the best time to go?';
      recCta.href=waURL(msg);
      if(recText) recText.textContent='Get my '+v.label+' trips';
    }
  }
  function start(){stop();timer=setInterval(()=>{if(!userPicked)go(idx+1);},10000);}
  function stop(){if(timer){clearInterval(timer);timer=null;}}
  const nextB=document.getElementById('heroNext'),prevB=document.getElementById('heroPrev');
  if(nextB) nextB.addEventListener('click',()=>{userPicked=true;stop();go(idx+1);});
  if(prevB) prevB.addEventListener('click',()=>{userPicked=true;stop();go(idx-1);});
  const heroEl=document.querySelector('.hero');
  heroEl.addEventListener('mouseenter',stop);
  heroEl.addEventListener('mouseleave',()=>{if(!userPicked)start();});
  let sx=0;
  heroEl.addEventListener('touchstart',e=>{sx=e.touches[0].clientX},{passive:true});
  heroEl.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>56){userPicked=true;stop();go(idx+(dx<0?1:-1));}},{passive:true});
  go(0); start();
})();


/* ===== DESTINATIONS TOGGLE ===== */
(function(){
  const toggle=document.getElementById('scopeToggle');
  if(!toggle) return;
  const pill=document.getElementById('togglePill');
  const btns=[...toggle.querySelectorAll('button')];
  const cards=[...document.querySelectorAll('#destGrid .dcard')];

  function movePill(btn){
    pill.style.left=btn.offsetLeft+'px';
    pill.style.width=btn.offsetWidth+'px';
  }
  function setScope(scope){
    btns.forEach(b=>{
      const on=b.dataset.scope===scope;
      b.classList.toggle('on',on);
      b.setAttribute('aria-selected',on);
      if(on)movePill(b);
    });
    // Animate out, then swap
    cards.forEach(c=>{ if(!c.classList.contains('hidden')) c.classList.add('hiding'); });
    setTimeout(()=>{
      cards.forEach(c=>{
        const show=c.dataset.scope===scope;
        c.classList.toggle('hidden',!show);
        c.classList.remove('hiding');
        if(show){c.classList.remove('visible');requestAnimationFrame(()=>requestAnimationFrame(()=>c.classList.add('visible')));}
      });
    },260);
  }
  btns.forEach(b=>b.addEventListener('click',()=>setScope(b.dataset.scope)));
  // Nav deep-links can pre-select scope
  document.querySelectorAll('[data-scope-link]').forEach(a=>{
    a.addEventListener('click',()=>setScope(a.dataset.scopeLink==='inbound'?'inbound':'outbound'));
  });
  window.addEventListener('load',()=>movePill(btns[0]));
  window.addEventListener('resize',()=>movePill(btns.find(b=>b.classList.contains('on'))));
})();


/* ===== CURRENCY CONVERTER ===== */
(function(){
  const sel=document.getElementById('currency');
  if(!sel) return; /* currency selector removed; prices are now shown as-is */
  const prices=[...document.querySelectorAll('[data-lkr]')];
  function fmt(n){return Math.round(n).toLocaleString('en-US');}
  sel.addEventListener('change',()=>{
    const cur=sel.value,rate=SITE.rates[cur],sym=SITE.symbols[cur];
    prices.forEach(p=>{
      const v=+p.dataset.lkr*rate;
      p.innerHTML=`<em>${sym}</em>${fmt(v)}`;
    });
  });
})();


/* ===== TESTIMONIALS CAROUSEL ===== */
(function(){
  const items=[...document.querySelectorAll('#tstTrack .tst')];
  const dotsWrap=document.getElementById('tstDots');
  if(!dotsWrap||!items.length) return;
  let i=0,timer;
  items.forEach((_,k)=>{
    const b=document.createElement('button');
    b.className=k===0?'on':'';
    b.setAttribute('aria-label','Show testimonial '+(k+1));
    b.addEventListener('click',()=>{go(k);restart();});
    dotsWrap.appendChild(b);
  });
  const dots=[...dotsWrap.children];
  function go(n){
    items[i].classList.remove('active');dots[i].classList.remove('on');
    i=n%items.length;
    items[i].classList.add('active');dots[i].classList.add('on');
  }
  function restart(){clearInterval(timer);timer=setInterval(()=>go(i+1),6500);}
  restart();
})();


/* ===== LIGHT PARALLAX — Why image only ===== */
(function(){
  const img=document.getElementById('parallaxImg');
  if(!img||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  let ticking=false;
  window.addEventListener('scroll',()=>{
    if(ticking)return;ticking=true;
    requestAnimationFrame(()=>{
      const r=img.parentElement.getBoundingClientRect();
      if(r.bottom>0&&r.top<innerHeight){
        const p=(r.top+r.height/2-innerHeight/2)/innerHeight;
        img.style.transform=`translateY(${p*-26}px)`;
      }
      ticking=false;
    });
  },{passive:true});
})();


/* ===== WORLD MAP — interactive destination reach (self-contained SVG) ===== */
(function(){
  const NS='http://www.w3.org/2000/svg';
  const svg=document.querySelector('.wm-svg'); if(!svg) return;
  const gArcs=document.getElementById('wmArcs'),
        gPins=document.getElementById('wmPins'),gHub=document.getElementById('wmHub'),
        card=document.getElementById('wmCard'),legend=document.getElementById('wmLegend');
  /* Coordinates are in the world map's own space (viewBox 0 0 1010 666) so pins sit on real geography */
  const HUB={x:702,y:441};
  const DEST=[
    {key:'india',x:709,y:406,name:'India',line:'The Taj Mahal and the Golden Triangle',img:IMG+'taj-arch.jpg',dest:'Golden Triangle, India'},
    {key:'bhutan',x:732,y:380,name:'Bhutan',line:'Cliffside monasteries in the Himalayas',img:IMG+'tigers-nest.jpg',dest:'Bhutan'},
    {key:'maldives',x:681,y:453,name:'Maldives',line:'Overwater villas on turquoise lagoons',img:IMG+'maldives.jpg',dest:'The Maldives'},
    {key:'turkey',x:574,y:344,name:'Turkey',line:'Hot-air balloons over Cappadocia',img:IMG+'turkey.jpg',dest:'Cappadocia, Turkey'},
    {key:'africa',x:586,y:464,name:'Africa',line:'Safari across the golden savannah',img:IMG+'africa.jpg',dest:'African Safari'},
    {key:'portugal',x:549,y:352,name:'Portugal',line:'Old-world Lisbon and the golden Algarve',img:IMG+'lisbon-tram.jpg',dest:'Historic Lisbon, Portugal'},
    {key:'bali',x:815,y:485,name:'Bali',line:'Island temples and emerald rice terraces',img:IMG+'bali.jpg',dest:'Bali, Indonesia'},
    {key:'japan',x:853,y:357,name:'Japan',line:'Snow temples and cherry blossom',img:IMG+'japan.jpg',dest:'Japan'}
  ];
  const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
  const el=(t,a)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);return e;};
  const arcPath=(x,y)=>{const cx=(HUB.x+x)/2,cy=(HUB.y+y)/2-Math.hypot(x-HUB.x,y-HUB.y)*0.22;
    return 'M'+HUB.x+' '+HUB.y+' Q'+cx.toFixed(1)+' '+cy.toFixed(1)+' '+x+' '+y;};
  DEST.forEach(d=>{const p=el('path',{class:'wm-arc',d:arcPath(d.x,d.y),pathLength:1});p.dataset.key=d.key;gArcs.appendChild(p);});
  DEST.forEach(d=>{
    const g=el('g',{class:'wm-pin',transform:'translate('+d.x+' '+d.y+')'});g.dataset.key=d.key;
    g.appendChild(el('circle',{class:'halo',r:13}));
    g.appendChild(el('circle',{class:'dot',r:5.5}));
    const t=el('text',{class:'lbl',y:-15});t.textContent=d.name;g.appendChild(t);
    g.addEventListener('mouseenter',()=>{userTouched=true;stop();activate(d.key);});
    g.addEventListener('click',()=>{userTouched=true;stop();activate(d.key);});
    gPins.appendChild(g);
  });
  gHub.setAttribute('transform','translate('+HUB.x+' '+HUB.y+')');gHub.setAttribute('class','wm-hub');
  gHub.appendChild(el('circle',{class:'ring',r:9}));
  gHub.appendChild(el('circle',{class:'core',r:6}));
  const hl=el('text',{class:'lbl',y:-20});hl.textContent='Sri Lanka';gHub.appendChild(hl);
  const hs=el('text',{class:'sub',y:26});hs.textContent='OUR HOME';gHub.appendChild(hs);
  DEST.forEach(d=>{const b=document.createElement('button');b.className='wm-chip';b.dataset.key=d.key;b.textContent=d.name;
    b.addEventListener('mouseenter',()=>{userTouched=true;stop();activate(d.key);});
    b.addEventListener('click',()=>{userTouched=true;stop();activate(d.key);});legend.appendChild(b);});
  const pins=[...gPins.children],arcs=[...gArcs.children],chips=[...legend.children];
  let cur=null,userTouched=false,timer=null;
  function activate(key){
    cur=key;const d=DEST.find(x=>x.key===key);if(!d)return;
    pins.forEach(p=>p.classList.toggle('on',p.dataset.key===key));
    arcs.forEach(a=>a.classList.toggle('on',a.dataset.key===key));
    chips.forEach(c=>c.classList.toggle('on',c.dataset.key===key));
    card.innerHTML='<img src="'+d.img+'" alt="'+esc(d.name)+'" loading="lazy">'+
      '<div><h4>'+esc(d.name)+'</h4><p>'+esc(d.line)+'</p>'+
      '<a class="btn btn-gold" data-open-modal data-dest="'+esc(d.dest)+'">Explore '+esc(d.name)+'</a></div>';
    card.classList.add('show');
  }
  function start(){stop();timer=setInterval(()=>{if(userTouched){stop();return;}
    const i=cur?DEST.findIndex(x=>x.key===cur):-1;activate(DEST[(i+1)%DEST.length].key);},2800);}
  function stop(){if(timer){clearInterval(timer);timer=null;}}
  const stage=document.querySelector('.wm-stage');
  stage.addEventListener('mouseleave',()=>{ if(!userTouched) start(); });
  if('IntersectionObserver' in window){
    new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ if(!userTouched && !timer) start(); } else stop(); }),{threshold:.3}).observe(stage);
  } else { activate(DEST[0].key); }
})();


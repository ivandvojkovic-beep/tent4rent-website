// UPIŠITE STVARNU E-MAIL ADRESU prije korištenja obrasca!
let KONTAKT_EMAIL = '';


document.getElementById('year').textContent = new Date().getFullYear();
const toggle = document.querySelector('.menu-toggle');
const links = document.querySelector('.links');
toggle.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Zatvori izbornik' : 'Otvori izbornik');
});
links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  links.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Otvori izbornik');
}));
document.getElementById('inquiry-form').addEventListener('submit', (event) => {
  event.preventDefault();
  if (!KONTAKT_EMAIL || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(KONTAKT_EMAIL)) {
    alert('Ova stranica je demo. Prije slanja upita potrebno je unijeti stvarnu kontaktnu e-mail adresu u Pages CMS-u.');
    return;
  }
  const form = new FormData(event.currentTarget);
  const subject = 'Tent4rent – upit za najam opreme';
  const body = `Ime i prezime: ${form.get('ime')}\nE-mail: ${form.get('email')}\nOprema: ${form.get('oprema')}\nDatum: ${form.get('datum') || 'Nije naveden'}\nLokacija: ${form.get('lokacija') || 'Nije navedena'}\n\nPoruka:\n${form.get('poruka') || '—'}`;
  window.location.href = `mailto:${KONTAKT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

// Pages CMS uredjuje data/site.json; Cloudflare nakon spremanja automatski objavljuje izmjene.
(async function ucitajSadrzaj() {
  try {
    const res = await fetch('/data/site.json', {cache:'no-cache'});
    if (!res.ok) throw new Error('Podaci nisu dostupni');
    const data = await res.json();
    document.querySelectorAll('[data-cms]').forEach(el => {
      const value = data[el.dataset.cms];
      if (typeof value === 'string' && value.trim()) el.textContent = value;
    });
    KONTAKT_EMAIL = (data.contact_email || '').trim();
    const details = [data.contact_phone && 'Telefon / WhatsApp: '+data.contact_phone,
      data.service_area && 'Područje: '+data.service_area,
      KONTAKT_EMAIL && 'E-mail: '+KONTAKT_EMAIL].filter(Boolean);
    const detailNode = document.querySelector('[data-contact="details"]');
    if (detailNode) detailNode.textContent = details.join('\n');
    if (details.length) {
      document.querySelector('.contact-note strong').textContent='Kontaktirajte nas';
      document.querySelector('.contact-note span').textContent='Za upite nam se javite putem navedenih kontakata.';
    }
    if (KONTAKT_EMAIL) document.querySelector('.form-help').textContent='Gumb priprema upit u vašem e-mail programu.';
    for (let i=1;i<=3;i++){
      const url=data['gallery_'+i];
      if(typeof url!=='string'||!url.trim()) continue;
      // Prihvati samo lokalne putanje iz Pages CMS galerije.
      if(!/^\/assets\/[^?#]+$/u.test(url)) continue;
      const card=document.querySelector('[data-gallery="'+i+'"]');
      if(card){card.style.backgroundImage='url("'+url+'")';card.classList.add('has-photo');}
    }
  } catch(e) { console.warn('Pages CMS sadržaj nije učitan:',e); }
})();



// Jedan slideshow: fotografije se uređuju u Pages CMS-u kroz data/slideshow.json.
(async function pokreniSlideshow(){
  const gallery = document.querySelector('#galerija .gallery-grid');
  if(!gallery) return;
  const validPath = path => typeof path === 'string' &&
    /^\/assets\/[^?#]+$/u.test(path) &&
    !/[\\"'<>\x00-\x1f]/u.test(path) &&
    !path.split('/').includes('..');
  let images = [];
  try {
    const res = await fetch('/data/slideshow.json', {cache:'no-cache'});
    if(!res.ok) throw new Error('Nema slideshow konfiguracije');
    const data = await res.json();
    images = Array.isArray(data.images) ? data.images.filter(validPath) : [];
  } catch(error) {
    // Ako nova datoteka još nije spremljena, prethodne 3 slike ostaju dostupne.
    try {
      const res = await fetch('/data/site.json', {cache:'no-cache'});
      const data = await res.json();
      images = [data.gallery_1,data.gallery_2,data.gallery_3].filter(validPath);
    } catch(e) { console.warn('Nema galerijskih fotografija',e); }
  }
  if(!images.length) return;
  const wrap=document.createElement('div');wrap.className='tent-slideshow';
  const frame=document.createElement('div');frame.className='slide-frame';
  const photo=document.createElement('img');photo.alt='Tent4rent – fotografija opreme';photo.loading='eager';photo.decoding='async';
  frame.appendChild(photo);
  const prev=document.createElement('button');prev.type='button';prev.className='slide-arrow slide-prev';prev.textContent='‹';prev.setAttribute('aria-label','Prethodna fotografija');
  const next=document.createElement('button');next.type='button';next.className='slide-arrow slide-next';next.textContent='›';next.setAttribute('aria-label','Sljedeća fotografija');
  frame.append(prev,next);wrap.appendChild(frame);
  const dots=document.createElement('div');dots.className='slide-dots';dots.setAttribute('aria-label','Odabir fotografije');
  wrap.appendChild(dots);
  let current=0;
  const dotButtons=images.map((_,i)=>{const b=document.createElement('button');b.type='button';b.className='slide-dot';b.setAttribute('aria-label','Prikaži fotografiju '+(i+1));b.addEventListener('click',()=>show(i));dots.appendChild(b);return b;});
  function show(index){current=(index+images.length)%images.length;photo.src=images[current];photo.alt='Tent4rent – fotografija '+(current+1)+' od '+images.length;dotButtons.forEach((b,i)=>{b.classList.toggle('active',i===current);b.setAttribute('aria-current',i===current?'true':'false');});}
  prev.addEventListener('click',()=>show(current-1));next.addEventListener('click',()=>show(current+1));
  wrap.tabIndex=0;wrap.setAttribute('aria-label','Galerija fotografija – koristite lijevu i desnu strelicu');
  wrap.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();show(current-1);}if(e.key==='ArrowRight'){e.preventDefault();show(current+1);}});
  if(images.length===1){prev.hidden=true;next.hidden=true;dots.hidden=true;}
  gallery.replaceWith(wrap);
  const note=document.querySelector('#galerija .gallery-note');if(note)note.remove();
  const desc=document.querySelector('#galerija .section-head > p');if(desc)desc.textContent='Pregledajte fotografije naše opreme pomoću strelica.';
  const heading=document.querySelector('#galerija .section-head h2');if(heading)heading.textContent='Fotografije naše opreme';
  show(0);
})();
// UPIŠITE STVARNU E-MAIL ADRESU prije korištenja obrasca!
let KONTAKT_EMAIL = '';


document.getElementById('year').textContent = new Date().getFullYear();
const toggle = document.querySelector('.menu-toggle');
const links = document.querySelector('.links');
toggle.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Zatvori izbornik' : 'Otvori izbornik');
});
links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  links.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Otvori izbornik');
}));
document.getElementById('inquiry-form').addEventListener('submit', (event) => {
  event.preventDefault();
  if (!KONTAKT_EMAIL || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(KONTAKT_EMAIL)) {
    alert('Ova stranica je demo. Prije slanja upita potrebno je unijeti stvarnu kontaktnu e-mail adresu u Pages CMS-u.');
    return;
  }
  const form = new FormData(event.currentTarget);
  const subject = 'Tent4rent – upit za najam opreme';
  const body = `Ime i prezime: ${form.get('ime')}\nE-mail: ${form.get('email')}\nOprema: ${form.get('oprema')}\nDatum: ${form.get('datum') || 'Nije naveden'}\nLokacija: ${form.get('lokacija') || 'Nije navedena'}\n\nPoruka:\n${form.get('poruka') || '—'}`;
  window.location.href = `mailto:${KONTAKT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

// Pages CMS uredjuje data/site.json; Cloudflare nakon spremanja automatski objavljuje izmjene.
(async function ucitajSadrzaj() {
  try {
    const res = await fetch('/data/site.json', {cache:'no-cache'});
    if (!res.ok) throw new Error('Podaci nisu dostupni');
    const data = await res.json();
    document.querySelectorAll('[data-cms]').forEach(el => {
      const value = data[el.dataset.cms];
      if (typeof value === 'string' && value.trim()) el.textContent = value;
    });
    KONTAKT_EMAIL = (data.contact_email || '').trim();
    const details = [data.contact_phone && 'Telefon / WhatsApp: '+data.contact_phone,
      data.service_area && 'Područje: '+data.service_area,
      KONTAKT_EMAIL && 'E-mail: '+KONTAKT_EMAIL].filter(Boolean);
    const detailNode = document.querySelector('[data-contact="details"]');
    if (detailNode) detailNode.textContent = details.join('\n');
    if (details.length) {
      document.querySelector('.contact-note strong').textContent='Kontaktirajte nas';
      document.querySelector('.contact-note span').textContent='Za upite nam se javite putem navedenih kontakata.';
    }
    if (KONTAKT_EMAIL) document.querySelector('.form-help').textContent='Gumb priprema upit u vašem e-mail programu.';
    for (let i=1;i<=3;i++){
      const url=data['gallery_'+i];
      if(typeof url!=='string'||!url.trim()) continue;
      // Prihvati samo lokalne putanje iz Pages CMS galerije.
      if(!/^\/assets\/[^?#]+$/u.test(url)) continue;
      const card=document.querySelector('[data-gallery="'+i+'"]');
      if(card){card.style.backgroundImage='url("'+url+'")';card.classList.add('has-photo');}
    }
  } catch(e) { console.warn('Pages CMS sadržaj nije učitan:',e); }
})();

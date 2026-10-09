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
      if(!/^\/assets\/[a-zA-Z0-9_./%-]+$/.test(url)) continue;
      const card=document.querySelector('[data-gallery="'+i+'"]');
      if(card){card.style.backgroundImage='url("'+url+'")';card.classList.add('has-photo');}
    }
  } catch(e) { console.warn('Pages CMS sadržaj nije učitan:',e); }
})();

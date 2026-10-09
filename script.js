// UPIŠITE STVARNU E-MAIL ADRESU prije korištenja obrasca!
const KONTAKT_EMAIL = 'OVDJE-UNESI-EMAIL@primjer.hr';

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
  if (KONTAKT_EMAIL.includes('OVDJE-UNESI-EMAIL')) {
    alert('Ova stranica je demo. Prije slanja upita potrebno je unijeti stvarnu kontaktnu e-mail adresu u script.js.');
    return;
  }
  const form = new FormData(event.currentTarget);
  const subject = 'Tent4rent – upit za najam opreme';
  const body = `Ime i prezime: ${form.get('ime')}\nE-mail: ${form.get('email')}\nOprema: ${form.get('oprema')}\nDatum: ${form.get('datum') || 'Nije naveden'}\nLokacija: ${form.get('lokacija') || 'Nije navedena'}\n\nPoruka:\n${form.get('poruka') || '—'}`;
  window.location.href = `mailto:${KONTAKT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});


let KONTAKT_EMAIL = '';

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const toggle = document.querySelector('.menu-toggle');
const links = document.querySelector('.links');

if (toggle && links) {
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Zatvori izbornik' : 'Otvori izbornik');
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const inquiryForm = document.getElementById('inquiry-form');

if (inquiryForm) {
  inquiryForm.addEventListener('submit', event => {
    event.preventDefault();

    if (!KONTAKT_EMAIL) {
      alert('Kontakt e-mail nije postavljen.');
      return;
    }

    const form = new FormData(event.currentTarget);
    const subject = 'Tent4rent - upit za najam opreme';

    const body = [
      'Ime i prezime: ' + (form.get('ime') || ''),
      'E-mail: ' + (form.get('email') || ''),
      'Oprema: ' + (form.get('oprema') || ''),
      'Datum: ' + (form.get('datum') || ''),
      'Lokacija: ' + (form.get('lokacija') || ''),
      'Poruka: ' + (form.get('poruka') || '')
    ].join('\n');

    window.location.href =
      'mailto:' + KONTAKT_EMAIL +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);
  });
}

// UCITAVANJE SADRZAJA IZ PAGES CMS-a
async function ucitajSadrzaj() {
  try {
    const res = await fetch('/data/site.json', {
      cache: 'no-store'
    });

    if (!res.ok) return;

    const data = await res.json();

    document.querySelectorAll('[data-cms]').forEach(el => {
      const value = data[el.dataset.cms];
      if (typeof value === 'string' && value.trim()) {
        el.textContent = value;
      }
    });

    KONTAKT_EMAIL = (data.contact_email || '').trim();

    const details = [
      data.contact_phone ? 'Telefon / WhatsApp: ' + data.contact_phone : '',
      data.service_area ? 'Područje: ' + data.service_area : '',
      KONTAKT_EMAIL ? 'E-mail: ' + KONTAKT_EMAIL : ''
    ].filter(Boolean);

    const detailNode = document.querySelector('[data-contact="details"]');
    if (detailNode) detailNode.textContent = details.join('\n');

    if (details.length) {
      const strong = document.querySelector('.contact-note strong');
      const span = document.querySelector('.contact-note span');

      if (strong) strong.textContent = 'Kontaktirajte nas';
      if (span) span.textContent = 'Za upite nam se javite putem navedenih kontakata.';
    }

    if (KONTAKT_EMAIL) {
      const help = document.querySelector('.form-help');
      if (help) help.textContent = 'Gumb priprema upit u vašem e-mail programu.';
    }

  } catch (error) {
    console.warn('Sadržaj stranice nije učitan:', error);
  }
}

// SLIDESHOW GALERIJA
async function pokreniSlideshow() {
  const gallery = document.querySelector('#galerija .gallery-grid');

  if (!gallery) return;

  let images = [];

  const validPath = path =>
    typeof path === 'string' &&
    /^\/assets\/[^?#]+$/u.test(path) &&
    !/[\\"'<>\x00-\x1f]/u.test(path) &&
    !path.split('/').includes('..');

  try {
    const res = await fetch('/data/slideshow.json', {
      cache: 'no-store'
    });

    if (!res.ok) throw new Error('Slideshow nije dostupan');

    const data = await res.json();

    if (Array.isArray(data.images)) {
      images = data.images.filter(validPath);
    }

  } catch (error) {
    console.warn('Slideshow konfiguracija nije učitana:', error);
  }

  // Rezervno ucitavanje postojecih fotografija
  if (!images.length) {
    try {
      const res = await fetch('/data/site.json', {
        cache: 'no-store'
      });

      if (res.ok) {
        const data = await res.json();

        images = [
          data.gallery_1,
          data.gallery_2,
          data.gallery_3
        ].filter(validPath);
      }

    } catch (error) {
      console.warn('Fotografije nisu dostupne:', error);
    }
  }

  if (!images.length) return;

  const wrap = document.createElement('div');
  wrap.className = 'tent-slideshow';

  const frame = document.createElement('div');
  frame.className = 'slide-frame';

  const photo = document.createElement('img');
  photo.alt = 'Tent4rent fotografija opreme';
  photo.loading = 'eager';

  frame.appendChild(photo);

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'slide-arrow slide-prev';
  prev.textContent = '‹';
  prev.setAttribute('aria-label', 'Prethodna fotografija');

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'slide-arrow slide-next';
  next.textContent = '›';
  next.setAttribute('aria-label', 'Sljedeća fotografija');

  frame.appendChild(prev);
  frame.appendChild(next);

  wrap.appendChild(frame);

  const dots = document.createElement('div');
  dots.className = 'slide-dots';

  wrap.appendChild(dots);

  let current = 0;

  const dotButtons = images.map((image, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'slide-dot';
    button.setAttribute('aria-label', 'Fotografija ' + (i + 1));

    button.addEventListener('click', () => show(i));

    dots.appendChild(button);
    return button;
  });

  function show(index) {
    current = (index + images.length) % images.length;

    photo.src = images[current];
    photo.alt = 'Tent4rent fotografija ' + (current + 1);

    dotButtons.forEach((button, i) => {
      button.classList.toggle('active', i === current);
      button.setAttribute('aria-current', i === current ? 'true' : 'false');
    });
  }

  prev.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));

  if (images.length === 1) {
    prev.hidden = true;
    next.hidden = true;
    dots.hidden = true;
  }

  gallery.replaceWith(wrap);

  const note = document.querySelector('#galerija .gallery-note');
  if (note) note.remove();

  const desc = document.querySelector('#galerija .section-head > p');
  if (desc) desc.textContent = 'Pregledajte fotografije naše opreme.';

  show(0);
}

ucitajSadrzaj();
pokreniSlideshow();

/* Tent4rent - skice satora po dimenzijama */
(() => {
  const paths = [
    '/assets/assetssator-4x4.jpg',
    '/assets/assetssator-5X5.jpg',
    '/assets/assetssator-4X8.jpg',
    '/assets/assetssator-5X8.jpg'
  ];

  const sizes = document.querySelectorAll(
    '#ponuda .sizes span'
  );

  if (!sizes.length) return;

  const dialog = document.createElement('dialog');
  dialog.className = 'tent-sketch-dialog';

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'tent-sketch-close';
  close.textContent = '×';
  close.setAttribute('aria-label', 'Zatvori skicu');

  const title = document.createElement('h3');
  const img = document.createElement('img');
  img.alt = 'Skica šatora';

  dialog.append(close, title, img);
  document.body.appendChild(dialog);

  close.addEventListener('click', () => dialog.close());

  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });

  sizes.forEach((size, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tent-size-button';
    button.textContent = size.textContent;

    size.replaceWith(button);

    button.addEventListener('click', () => {
      title.textContent = 'Šator ' + button.textContent;
      img.src = paths[index];
      img.alt = title.textContent + ' - skica i kapacitet';
      dialog.showModal();
    });
  });
})();

/* TENT4RENT - VELIKI PRIKAZ GALERIJE */
(() => {
  const dialog = document.createElement('dialog');
  dialog.className = 'gallery-lightbox';
  dialog.setAttribute('aria-label', 'Veliki prikaz galerije');

  dialog.innerHTML = `
    <div class="gallery-lightbox-content">
      <button type="button" class="gallery-lightbox-close"
        aria-label="Zatvori galeriju">×</button>
      <button type="button" class="gallery-lightbox-prev"
        aria-label="Prethodna fotografija">‹</button>
      <img alt="Fotografija iz galerije" draggable="false">
      <button type="button" class="gallery-lightbox-next"
        aria-label="Sljedeća fotografija">›</button>
      <div class="gallery-lightbox-counter"></div>
    </div>
  `;

  document.body.appendChild(dialog);

  const img = dialog.querySelector('img');
  const counter = dialog.querySelector('.gallery-lightbox-counter');
  const close = dialog.querySelector('.gallery-lightbox-close');
  const prev = dialog.querySelector('.gallery-lightbox-prev');
  const next = dialog.querySelector('.gallery-lightbox-next');

  let images = [];
  let current = 0;
  let startX = null;

  function show(index) {
    if (!images.length) return;
    current = (index + images.length) % images.length;
    img.src = images[current];
    img.alt = `Tent4rent fotografija ${current + 1}`;
    counter.textContent = `${current + 1} / ${images.length}`;
    prev.hidden = next.hidden = images.length < 2;
  }

  function openGallery() {
    const slideshow = document.querySelector(
      '#galerija .tent-slideshow'
    );
    if (!slideshow || dialog.open) return;

    const sources = [...document.querySelectorAll(
      '#galerija .slide-dot'
    )];

    // Fotografije se dohvaćaju iz iste konfiguracije
    // koju koristi postojeći slideshow.
    fetch('/data/slideshow.json', { cache: 'no-store' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        const valid = path =>
          typeof path === 'string' &&
          /^\/assets\/[^?#]+$/.test(path) &&
          !/[\\"'<>\x00-\x1f]/.test(path) &&
          !path.split('/').includes('..');

        images = Array.isArray(data?.images)
          ? data.images.filter(valid)
          : [];

        // Ako slideshow koristi rezervne fotografije,
        // učitaj ih iz CMS konfiguracije.
        if (images.length) return;
        return fetch('/data/site.json', { cache: 'no-store' })
          .then(res => res.ok ? res.json() : null)
          .then(site => {
            images = [
              site?.gallery_1,
              site?.gallery_2,
              site?.gallery_3
            ].filter(valid);
          });
      })
      .then(() => {
        if (!images.length) return;
        const active = sources.findIndex(dot =>
          dot.classList.contains('active')
        );
        show(active >= 0 ? active : 0);
        dialog.showModal();
        close.focus();
      })
      .catch(error => console.warn(
        'Veliki prikaz nije dostupan:', error
      ));
  }

  // Otvaranje klikom na fotografiju.
  document.addEventListener('click', event => {
    const photo = event.target.closest(
      '#galerija .slide-frame > img'
    );
    if (photo) openGallery();
  });

  close.addEventListener('click', () => dialog.close());
  prev.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));

  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      show(current - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      show(current + 1);
    }
  });

  // Povlačenje prstom ili mišem.
  img.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    startX = event.clientX;
  });

  img.addEventListener('pointerup', event => {
    if (startX === null) return;
    const distance = event.clientX - startX;
    startX = null;

    if (Math.abs(distance) > 50) {
      show(current + (distance < 0 ? 1 : -1));
    }
  });

  img.addEventListener('pointercancel', () => {
    startX = null;
  });
})();

// Desktop-Design (1600x1200) bei kleineren Fenstern/Bildschirmen proportional
// verkleinern, statt es abzuschneiden – exakt dasselbe Layout, nur kleiner.
// Gilt nur oberhalb der Mobile-Grenze (600px); die eigene Mobile-Ansicht
// (@media max-width:600px in style.css) bleibt davon unberührt.
const desktopScaleEl = document.querySelector('.glass-panel');
const DESKTOP_PANEL_WIDTH = 1600;
const DESKTOP_PANEL_HEIGHT = 1200;
const MOBILE_BREAKPOINT = 600;

function scaleDesktopPanel() {
  if (!desktopScaleEl) return;

  if (window.innerWidth <= MOBILE_BREAKPOINT) {
    desktopScaleEl.style.transform = '';
    return;
  }

  const margin = 40;
  const scaleByWidth = (window.innerWidth - margin) / DESKTOP_PANEL_WIDTH;
  const scaleByHeight = (window.innerHeight - margin) / DESKTOP_PANEL_HEIGHT;
  const scale = Math.min(1, scaleByWidth, scaleByHeight);

  desktopScaleEl.style.transform = scale < 1 ? `scale(${scale})` : '';
}

scaleDesktopPanel();
window.addEventListener('resize', scaleDesktopPanel);

// Hamburg-Stadtteile-Karte: SVG laden und inline einfügen, damit CSS die
// einzelnen <path>-Elemente (Stadtteile) direkt stylen kann
const stadtteileMapWrap = document.getElementById('stadtteile-map-wrap');

const stadtteileHoverName = document.getElementById('stadtteile-hover-name');
const stadtteileHoverText = document.getElementById('stadtteile-hover-text');
const stadtteileDefaultName = stadtteileHoverName ? stadtteileHoverName.textContent : '';
const stadtteileDefaultText = stadtteileHoverText ? stadtteileHoverText.textContent : '';

if (stadtteileMapWrap) {
  fetch('images/hamburg-stadtteile.svg')
    .then((res) => res.text())
    .then((svgText) => {
      stadtteileMapWrap.innerHTML = svgText;
    })
    .catch(() => {
      stadtteileMapWrap.textContent = 'Karte konnte nicht geladen werden.';
    });

  // Feste Adressen pro Stadtteil – hier weitere Projekte eintragen
  // (Schlüssel = path-id aus images/hamburg-stadtteile.svg, Schema: stadtteil-<name-slug>;
  // ein Stadtteil kann mehrere Projekt-Adressen haben)
  const stadtteilAddresses = {
    'stadtteil-langenhorn': ['Langenhorner Chaussee, 22419 Hamburg'],
    'stadtteil-rahlstedt': ['Soldkampweg, 22145 Hamburg', 'Nydamer Weg, 22145 Hamburg'],
    'stadtteil-eilbek': ['Landwehr, 22087 Hamburg'],
    'stadtteil-barmbek-nord': ['Fühlsbüttler Straße, 22305 Hamburg', 'Drosselstraße, 22305 Hamburg'],
    'stadtteil-gro-borstel': ['Obenhauptstraße, 22335 Hamburg'],
    'stadtteil-wellingsb-ttel': ['Eckerkamp, 22391 Hamburg'],
    'stadtteil-billstedt': ['Möllner Landstraße, 22111 Hamburg'],
    'stadtteil-harvestehude': ['Rothenbaumchaussee, 20149 Hamburg', 'Hallerstraße, 20146 Hamburg'],
    'stadtteil-eppendorf': ['Münsterstraße, 22529 Hamburg', 'Eppendorfer Landstraße, 20249 Hamburg'],
    'stadtteil-alsterdorf': [
      'Brabandstraße, 22297 Hamburg',
      'Alsterdorfer Straße, 22297 Hamburg',
      'Rathenaustraße, 22297 Hamburg',
    ],
    'stadtteil-hafencity': ['Sandtorkai, 20457 Hamburg', 'Brooktorkai, 20457 Hamburg', 'Am Kaiserkai, 20457 Hamburg'],
    'stadtteil-lokstedt': ['Lembekstraße, 22529 Hamburg'],
    'stadtteil-eimsb-ttel': ['Heußweg, 20255 Hamburg', 'Kleiner Schäferkamp, 20357 Hamburg'],
    'stadtteil-volksdorf': ['Claus-Ferck-Straße, 22359 Hamburg'],
    'stadtteil-dulsberg': ['Eulenkamp, 22049 Hamburg'],
  };

  // Grenzen benachbarter Stadtteile überlappen sich teils minimal (jeder
  // Stadtteil wurde beim SVG-Export einzeln vereinfacht/entrundet), dadurch
  // kann an einem Punkt mehr als ein <path> übereinanderliegen. Von allen
  // dort gestapelten Pfaden wird der mit der kleinsten Fläche genommen –
  // das ist zuverlässig der kleinere/genauere Stadtteil (z. B. HafenCity),
  // nicht der große, zufällig mit-überlappende Nachbar.
  function pickSmallestPathAtPoint(x, y) {
    const stack = document.elementsFromPoint(x, y);
    let best = null;
    let bestArea = Infinity;
    for (const el of stack) {
      const path = el.closest ? el.closest('path') : null;
      if (!path || !stadtteileMapWrap.contains(path)) continue;
      const bbox = path.getBBox();
      const area = bbox.width * bbox.height;
      if (area < bestArea) {
        bestArea = area;
        best = path;
      }
    }
    return best;
  }

  function showStadtteilInfo(path) {
    if (!path || !stadtteileHoverName || !stadtteileHoverText) return;

    const name = path.dataset.name;
    const addresses = stadtteilAddresses[path.id];
    stadtteileHoverName.textContent = name;

    if (addresses && addresses.length) {
      stadtteileHoverText.innerHTML = addresses.join('<br>');
    } else {
      stadtteileHoverText.textContent = `Aktuelle und abgeschlossene Bauprojekte in ${name}.`;
    }
  }

  // Einzige Stelle, die den dauerhaften roten "ausgewählt"-Zustand setzt –
  // egal ob per Kartentipp oder Pfeil-Button ausgewählt wurde, es darf immer
  // nur ein Stadtteil gleichzeitig markiert sein, daher hier zentral zuerst
  // alle vorherigen Markierungen entfernen.
  function selectStadtteilPath(path) {
    if (!path) return;

    stadtteileMapWrap.querySelectorAll('path.stadtteile-selected').forEach((p) => {
      p.classList.remove('stadtteile-selected');
    });
    path.classList.add('stadtteile-selected');

    const paths = stadtteileMapWrap.querySelectorAll('path');
    stadtteileNextIndex = Array.prototype.indexOf.call(paths, path);

    showStadtteilInfo(path);
  }

  stadtteileMapWrap.addEventListener('mouseover', (e) => {
    showStadtteilInfo(e.target.closest('path'));
  });

  stadtteileMapWrap.addEventListener('mouseout', (e) => {
    const path = e.target.closest('path');
    if (!path || !stadtteileHoverName || !stadtteileHoverText) return;

    stadtteileHoverName.textContent = stadtteileDefaultName;
    stadtteileHoverText.textContent = stadtteileDefaultText;
  });

  // Touch-Geräte: "mouseover" feuert dort unzuverlässig (mal gar nicht, mal
  // verzögert), daher zusätzlich auf "click" reagieren – das Tippen auf einen
  // Stadtteil zeigt die Infos dann garantiert an und bleibt bis zur nächsten
  // Auswahl sichtbar (kein "mouseout" bei Touch).
  stadtteileMapWrap.addEventListener('click', (e) => {
    selectStadtteilPath(pickSmallestPathAtPoint(e.clientX, e.clientY));
  });

  // Zusätzlich eigene Tipp-Erkennung über touchstart/touchend: bei kleinen/
  // schmalen Stadtteilen (z. B. Langenhorn) verschiebt sich der Finger beim
  // Tippen minimal, der Browser wertet das dann als Scroll-Geste und
  // unterdrückt den folgenden "click" komplett. Hier wird über die Distanz
  // zwischen Start- und Endpunkt selbst geprüft, ob es ein Tipp war (kein
  // Scroll), und die Auswertung erfolgt an der Endposition (touchend) – exakt
  // wie beim normalen Klick, nur ohne von der Klick-Unterdrückung des
  // Browsers abhängig zu sein. Bleibt passiv, Scrollen bleibt unberührt.
  let stadtteileTouchStartX = 0;
  let stadtteileTouchStartY = 0;
  let stadtteileTouchStartTime = 0;

  stadtteileMapWrap.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    if (!touch) return;
    stadtteileTouchStartX = touch.clientX;
    stadtteileTouchStartY = touch.clientY;
    stadtteileTouchStartTime = Date.now();
  }, { passive: true });

  stadtteileMapWrap.addEventListener('touchend', (e) => {
    const touch = e.changedTouches[0];
    if (!touch) return;

    const movedX = Math.abs(touch.clientX - stadtteileTouchStartX);
    const movedY = Math.abs(touch.clientY - stadtteileTouchStartY);
    const elapsed = Date.now() - stadtteileTouchStartTime;
    if (movedX > 10 || movedY > 10 || elapsed > 500) return;

    selectStadtteilPath(pickSmallestPathAtPoint(touch.clientX, touch.clientY));
  }, { passive: true });

  // Pfeil neben dem Seiten-Titel (Mobile): schaltet Stadtteil für Stadtteil
  // durch, ohne dass exakt auf die Karte getippt werden muss
  const stadtteileNextBtn = document.getElementById('stadtteile-next-btn');
  let stadtteileNextIndex = -1;

  if (stadtteileNextBtn) {
    stadtteileNextBtn.addEventListener('click', () => {
      const paths = stadtteileMapWrap.querySelectorAll('path');
      if (!paths.length) return;

      const nextIndex = (stadtteileNextIndex + 1) % paths.length;
      selectStadtteilPath(paths[nextIndex]);
    });
  }
}

// Wetter-Widget – Open-Meteo (kostenlos, kein API-Key nötig)
const weatherIcon = document.querySelector('.weather-icon');
const weatherTemp = document.querySelector('.weather-temp');

function weatherCodeToIcon(code) {
  if (code === 0) return '☀️';
  if (code <= 2) return '🌤️';
  if (code === 3) return '☁️';
  if (code >= 45 && code <= 48) return '🌫️';
  if (code >= 51 && code <= 67) return '🌧️';
  if (code >= 71 && code <= 77) return '🌨️';
  if (code >= 80 && code <= 82) return '🌦️';
  if (code >= 95) return '⛈️';
  return '🌡️';
}

if (weatherIcon && weatherTemp) {
  fetch('https://api.open-meteo.com/v1/forecast?latitude=53.5511&longitude=9.9937&current_weather=true')
    .then((res) => res.json())
    .then((data) => {
      const current = data.current_weather;
      weatherTemp.textContent = `${Math.round(current.temperature)}°C`;
      weatherIcon.textContent = weatherCodeToIcon(current.weathercode);
    })
    .catch(() => {
      weatherTemp.textContent = '–';
      weatherIcon.textContent = '⚠️';
    });
}

const weatherTime = document.querySelector('.weather-time');
const weatherDate = document.querySelector('.weather-date');
const weatherWeekday = document.querySelector('.weather-weekday');

if (weatherTime && weatherDate && weatherWeekday) {
  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    weatherTime.textContent = `${hours}:${minutes}`;

    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    weatherDate.textContent = `${day}.${month}.${now.getFullYear()}`;

    weatherWeekday.textContent = now.toLocaleDateString('de-DE', { weekday: 'long' });
  }

  updateClock();
  setInterval(updateClock, 1000);
}

const galleryImages = [
  'levels/01-clean.jpg',
  'levels/02-ready.jpg',
  'levels/03-wall.jpg',
  'levels/04-windows.jpg',
  'levels/05-installation.jpg',
  'levels/06-colored.jpg',
  'levels/07-parkett.jpg',
  'levels/08-elektrik.jpg',
  'levels/09-kitchen.jpg',
  'levels/10-tile.jpg',
  'levels/11-cleaning.jpg',
  'levels/12-finish.jpg',
];
const galleryHoldTime = 6000;

const galleryGrid = document.querySelector('.gallery-grid');
const galleryCells = document.querySelectorAll('.gallery-cell');

if (galleryGrid && galleryCells.length > 0) {
  let gridRect;
  let cellOffsets;

  function measureGallery() {
    gridRect = galleryGrid.getBoundingClientRect();
    cellOffsets = Array.from(galleryCells).map((cell) => {
      const rect = cell.getBoundingClientRect();
      return {
        cell,
        x: rect.left - gridRect.left,
        y: rect.top - gridRect.top,
      };
    });
  }

  function showImage(src) {
    const img = new Image();
    img.onload = () => {
      // Wie "background-size: cover" – Seitenverhältnis bleibt erhalten,
      // überschüssiger Bildbereich wird mittig abgeschnitten statt verzerrt.
      const scale = Math.max(gridRect.width / img.naturalWidth, gridRect.height / img.naturalHeight);
      const scaledWidth = img.naturalWidth * scale;
      const scaledHeight = img.naturalHeight * scale;
      const offsetX = (scaledWidth - gridRect.width) / 2;
      const offsetY = (scaledHeight - gridRect.height) / 2;
      const bgSize = `${scaledWidth}px ${scaledHeight}px`;

      cellOffsets.forEach(({ cell, x, y }) => {
        const activeLayer = cell.querySelector('.gallery-slice.active');
        const nextLayer = cell.querySelector('.gallery-slice:not(.active)');

        nextLayer.style.backgroundImage = `url(${src})`;
        nextLayer.style.backgroundSize = bgSize;
        nextLayer.style.backgroundPosition = `-${x + offsetX}px -${y + offsetY}px`;

        requestAnimationFrame(() => {
          nextLayer.classList.add('active');
          activeLayer.classList.remove('active');
        });
      });
    };
    img.src = src;
  }

  measureGallery();
  showImage(galleryImages[0]);

  let currentIndex = 0;

  window.addEventListener('resize', measureGallery);

  setInterval(() => {
    currentIndex = (currentIndex + 1) % galleryImages.length;
    measureGallery();
    showImage(galleryImages[currentIndex]);
  }, galleryHoldTime);
}

const contactForm = document.querySelector('.contact-form');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // TODO: Formular an echten Versand-Endpunkt anbinden
  });
}

// Leistungen: Karte mit 11 Seiten – Punkte/Next zum manuellen Wechseln,
// automatischer Wechsel alle 6 Minuten
const leistungenSlides = document.querySelectorAll('.leistungen-slide');
const leistungenDots = document.querySelectorAll('.leistungen-dot');
const leistungenNext = document.querySelector('.leistungen-next');

const leistungenImages = [
  'leistung/1-trockenbau.jpg',
  'leistung/2-innenputz.jpg',
  'leistung/3-maler.jpg',
  'leistung/4-boden.jpg',
  'leistung/5-fliesen.jpg',
  'leistung/6-sanitar.jpg',
  'leistung/7-elektro.jpg',
  'leistung/8-door.jpg',
  'leistung/9-kitchen.jpg',
  'leistung/10-reno.jpg',
  'leistung/11-clean.jpg',
];
const leistungenImageWrap = document.querySelector('.leistungen-image-wrap');
const leistungenImageEl = document.querySelector('.leistungen-image');

const leistungenBoxImages = [
  'blackboard/01-drywall.jpg',
  'blackboard/02-putz.jpg',
  'blackboard/03-colored.jpg',
  'blackboard/04-floor.jpg',
  'blackboard/05-teils.jpg',
  'blackboard/06-bathroom.jpg',
  'blackboard/07-electrik.jpg',
  'blackboard/08-door.jpg',
  'blackboard/09-kitchens.jpg',
  'blackboard/10-reno.jpg',
  'blackboard/11-cleans.jpg',
];
const leistungenBoxImageEls = document.querySelectorAll('.leistungen-box-image');

if (leistungenSlides.length > 0) {
  const leistungenAutoDelay = 6 * 1000;
  let leistungenIndex = 0;
  let leistungenTimer;

  function goToLeistungenSlide(index) {
    leistungenIndex = (index + leistungenSlides.length) % leistungenSlides.length;

    leistungenSlides.forEach((slide, i) => {
      slide.classList.toggle('active', i === leistungenIndex);
    });
    leistungenDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === leistungenIndex);
    });

    if (leistungenImageEl && leistungenImageWrap) {
      leistungenImageEl.src = leistungenImages[leistungenIndex];
      leistungenImageWrap.classList.remove('leistungen-image-fade');
      void leistungenImageWrap.offsetWidth;
      leistungenImageWrap.classList.add('leistungen-image-fade');
    }

    if (leistungenBoxImageEls.length === 2) {
      const activeLayer = document.querySelector('.leistungen-box-image.active');
      const nextLayer = [...leistungenBoxImageEls].find((el) => el !== activeLayer);

      nextLayer.src = leistungenBoxImages[leistungenIndex];
      requestAnimationFrame(() => {
        nextLayer.classList.add('active');
        activeLayer.classList.remove('active');
      });
    }
  }

  function restartLeistungenTimer() {
    clearInterval(leistungenTimer);
    leistungenTimer = setInterval(() => {
      goToLeistungenSlide(leistungenIndex + 1);
    }, leistungenAutoDelay);
  }

  leistungenDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      goToLeistungenSlide(Number(dot.dataset.index));
      restartLeistungenTimer();
    });
  });

  if (leistungenNext) {
    leistungenNext.addEventListener('click', () => {
      goToLeistungenSlide(leistungenIndex + 1);
      restartLeistungenTimer();
    });
  }

  restartLeistungenTimer();
}

const menuItems = document.querySelectorAll('.menu-item');
const views = document.querySelectorAll('.view');

menuItems.forEach((item) => {
  item.addEventListener('click', () => {
    menuItems.forEach((i) => i.classList.remove('active'));
    item.classList.add('active');

    const target = item.dataset.item;
    views.forEach((view) => {
      view.classList.toggle('active', view.dataset.view === target);
    });
  });
});

const timeline = document.querySelector('.timeline');
const timelinePoints = document.querySelectorAll('.timeline-point');
const pointSpacing = 100 / timelinePoints.length;
const normalSpeed = 0.06;
const slowSpeed = normalSpeed * 0.3;

let progress = 0;
let isHovering = false;
let isDragging = false;
let lastY = 0;

function renderTimeline() {
  timelinePoints.forEach((point, i) => {
    let distance = (progress + i * pointSpacing) % 100;
    if (distance < 0) distance += 100;
    point.style.offsetDistance = distance + '%';
  });
}

function tick() {
  if (!isDragging) {
    progress = (progress + (isHovering ? slowSpeed : normalSpeed)) % 100;
    renderTimeline();
  }
  requestAnimationFrame(tick);
}

if (timeline) {
  timeline.addEventListener('mouseenter', () => {
    isHovering = true;
  });

  timeline.addEventListener('mouseleave', () => {
    isHovering = false;
  });

  timeline.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastY = e.clientY;
    timeline.classList.add('dragging');
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaY = e.clientY - lastY;
    lastY = e.clientY;
    const deltaPercent = (deltaY / timeline.offsetHeight) * 100;
    progress = (progress - deltaPercent + 100) % 100;
    renderTimeline();
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    timeline.classList.remove('dragging');
  });

  renderTimeline();
  requestAnimationFrame(tick);
}

const commentLine = document.querySelector('.comment-line');
const commentTrack = document.querySelector('.comment-track');
const commentItems = document.querySelectorAll('.comment-item');

if (commentLine && commentTrack && commentItems.length > 0) {
  const holdTime = 6000;
  const slideDuration = 800;
  const itemCount = document.querySelectorAll('.comment-set')[0].children.length;

  // Echte Position jedes Profils merken statt sie aus einem konstanten
  // Abstand hochzurechnen – Beschreibungstexte sind unterschiedlich hoch,
  // wodurch ein fester Abstand mit der Zeit zu Verschiebungen führte.
  const itemOffsets = Array.from(commentItems).map((item) => item.offsetTop);
  const itemHeight = Math.max(...Array.from(commentItems).map((item) => item.offsetHeight));
  const avgStep = (itemOffsets[itemCount] - itemOffsets[0]) / itemCount;

  // Container-Höhe so setzen, dass Vorgänger-, aktuelles und Folge-Profil
  // jeweils vollständig sichtbar sind.
  commentLine.style.height = `${avgStep * 2 + itemHeight}px`;
  const centerOffset = avgStep;

  // Hintergrund-Feld exakt auf Höhe des mittleren (aktiven) Profils setzen.
  const commentHighlight = document.querySelector('.comment-highlight');
  if (commentHighlight) {
    const highlightPadding = 6;
    commentHighlight.style.top = `${centerOffset - highlightPadding}px`;
    commentHighlight.style.height = `${itemHeight + highlightPadding * 2}px`;
  }

  let currentIndex = 0;

  function goTo(index, animate) {
    commentTrack.style.transition = animate ? `transform ${slideDuration}ms ease` : 'none';
    commentTrack.style.transform = `translateY(${centerOffset - itemOffsets[index]}px)`;
  }

  const maxShift = 14;

  function updateFocus() {
    const containerRect = commentLine.getBoundingClientRect();
    const containerCenter = containerRect.top + containerRect.height / 2;
    const half = containerRect.height / 2;

    commentItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const itemCenter = rect.top + rect.height / 2;
      const normalized = Math.min(Math.abs(itemCenter - containerCenter) / half, 1);
      const shift = Math.max(0, 1 - normalized) * maxShift;
      item.style.opacity = 1 - normalized * 0.7;
      item.style.transform = `translateX(${shift}px)`;
    });

    requestAnimationFrame(updateFocus);
  }

  setInterval(() => {
    currentIndex += 1;
    goTo(currentIndex, true);

    if (currentIndex === itemCount) {
      setTimeout(() => {
        currentIndex = 0;
        goTo(0, false);
      }, slideDuration);
    }
  }, holdTime);

  goTo(0, false);
  requestAnimationFrame(updateFocus);
}

// Cookie-Consent: Akzeptieren / Ablehnen / Personalisieren
const cookieConsentKey = 'mono-cookie-consent';

const cookieBanner = document.getElementById('cookie-banner');
const cookieCategories = document.getElementById('cookie-banner-categories');
const cookieSaveRow = document.getElementById('cookie-save-row');
const cookieMapsToggle = document.getElementById('cookie-toggle-maps');
const cookieAcceptBtn = document.getElementById('cookie-accept-btn');
const cookieRejectBtn = document.getElementById('cookie-reject-btn');
const cookieCustomizeBtn = document.getElementById('cookie-customize-btn');
const cookieSaveBtn = document.getElementById('cookie-save-btn');
const cookieSettingsLink = document.querySelector('.cookie-settings-link');
const contactMapFrame = document.querySelector('.contact-map-frame');
const contactMapPlaceholder = document.querySelector('.contact-map-placeholder');
const contactMapEnableBtn = document.querySelector('.contact-map-enable');

function readCookieConsent() {
  try {
    return JSON.parse(localStorage.getItem(cookieConsentKey));
  } catch (e) {
    return null;
  }
}

function saveCookieConsent(consent) {
  try {
    localStorage.setItem(cookieConsentKey, JSON.stringify({ ...consent, date: new Date().toISOString() }));
  } catch (e) {
    // localStorage nicht verfügbar – Auswahl gilt nur für diese Sitzung
  }
}

function applyCookieConsent(consent) {
  if (!contactMapFrame || !contactMapPlaceholder) return;

  if (consent && consent.maps) {
    if (!contactMapFrame.src) {
      contactMapFrame.src = contactMapFrame.dataset.src;
    }
    contactMapPlaceholder.hidden = true;
  } else {
    contactMapPlaceholder.hidden = false;
  }

  if (cookieMapsToggle) {
    const active = !!(consent && consent.maps);
    cookieMapsToggle.setAttribute('aria-checked', String(active));
  }
}

function openCookieBanner() {
  if (!cookieBanner) return;
  cookieBanner.hidden = false;
}

function closeCookieBanner() {
  if (!cookieBanner) return;
  cookieBanner.hidden = true;
  if (cookieCategories) cookieCategories.hidden = true;
  if (cookieSaveRow) cookieSaveRow.hidden = true;
}

if (cookieBanner) {
  const existingConsent = readCookieConsent();
  applyCookieConsent(existingConsent);

  if (!existingConsent) {
    openCookieBanner();
  }

  if (cookieAcceptBtn) {
    cookieAcceptBtn.addEventListener('click', () => {
      const consent = { necessary: true, maps: true };
      saveCookieConsent(consent);
      applyCookieConsent(consent);
      closeCookieBanner();
    });
  }

  if (cookieRejectBtn) {
    cookieRejectBtn.addEventListener('click', () => {
      const consent = { necessary: true, maps: false };
      saveCookieConsent(consent);
      applyCookieConsent(consent);
      closeCookieBanner();
    });
  }

  if (cookieCustomizeBtn) {
    cookieCustomizeBtn.addEventListener('click', () => {
      if (cookieCategories) cookieCategories.hidden = false;
      if (cookieSaveRow) cookieSaveRow.hidden = false;
    });
  }

  if (cookieMapsToggle) {
    cookieMapsToggle.addEventListener('click', () => {
      const active = cookieMapsToggle.getAttribute('aria-checked') === 'true';
      cookieMapsToggle.setAttribute('aria-checked', String(!active));
    });
  }

  if (cookieSaveBtn) {
    cookieSaveBtn.addEventListener('click', () => {
      const consent = {
        necessary: true,
        maps: cookieMapsToggle ? cookieMapsToggle.getAttribute('aria-checked') === 'true' : false,
      };
      saveCookieConsent(consent);
      applyCookieConsent(consent);
      closeCookieBanner();
    });
  }

  if (cookieSettingsLink) {
    cookieSettingsLink.addEventListener('click', () => {
      const consent = readCookieConsent();
      if (cookieMapsToggle) {
        cookieMapsToggle.setAttribute('aria-checked', String(!!(consent && consent.maps)));
      }
      if (cookieCategories) cookieCategories.hidden = false;
      if (cookieSaveRow) cookieSaveRow.hidden = false;
      openCookieBanner();
    });
  }

  if (contactMapEnableBtn) {
    contactMapEnableBtn.addEventListener('click', () => {
      const consent = { necessary: true, maps: true };
      saveCookieConsent(consent);
      applyCookieConsent(consent);
      closeCookieBanner();
    });
  }
}

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

const galleryImages = Array.from({ length: 12 }, (_, i) => `gallery/${i + 1}.jpg`);
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

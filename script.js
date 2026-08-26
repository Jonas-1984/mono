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
      buildStadtteilNames();
    })
    .catch(() => {
      stadtteileMapWrap.textContent = 'Karte konnte nicht geladen werden.';
    });

  // Ein Eintrag pro einzelnem Projekt (ein Stadtteil kann mehrere haben).
  // "stadtteil" = path-id aus images/hamburg-stadtteile.svg.
  // "images" = Dateinamen aus dem Ordner "projects/" (Reihenfolge = Album-
  // Reihenfolge) – hier eintragen, sobald die Bilder zugeordnet sind.
  const projects = [
    {
      stadtteil: 'stadtteil-langenhorn',
      address: 'Langenhorner Chaussee, 22419 Hamburg',
      images: ['langenhorn-01.jpeg', 'langenhorn-02.jpeg', 'langenhorn-03.jpeg', 'langenhorn-04.jpeg'],
    },
    { stadtteil: 'stadtteil-rahlstedt', address: 'Soldkampweg, 22145 Hamburg', images: [] },
    { stadtteil: 'stadtteil-rahlstedt', address: 'Nydamer Weg, 22145 Hamburg', images: [] },
    { stadtteil: 'stadtteil-eilbek', address: 'Landwehr, 22087 Hamburg', images: [] },
    { stadtteil: 'stadtteil-barmbek-nord', address: 'Fühlsbüttler Straße, 22305 Hamburg', images: [] },
    { stadtteil: 'stadtteil-barmbek-nord', address: 'Drosselstraße, 22305 Hamburg', images: [] },
    { stadtteil: 'stadtteil-gro-borstel', address: 'Obenhauptstraße, 22335 Hamburg', images: [] },
    { stadtteil: 'stadtteil-wellingsb-ttel', address: 'Eckerkamp, 22391 Hamburg', images: [] },
    { stadtteil: 'stadtteil-billstedt', address: 'Möllner Landstraße, 22111 Hamburg', images: [] },
    { stadtteil: 'stadtteil-harvestehude', address: 'Rothenbaumchaussee, 20149 Hamburg', images: [] },
    {
      stadtteil: 'stadtteil-harvestehude',
      address: 'Hallerstraße, 20146 Hamburg',
      images: [
        'hallerstrasse-01.jpeg',
        'hallerstrasse-02.jpeg',
        'hallerstrasse-03.jpeg',
        'hallerstrasse-04.jpeg',
        'hallerstrasse-05.jpeg',
        'hallerstrasse-06.jpeg',
        'hallerstrasse-07.jpeg',
        'hallerstrasse-08.jpeg',
        'hallerstrasse-09.jpeg',
      ],
    },
    { stadtteil: 'stadtteil-eppendorf', address: 'Münsterstraße, 22529 Hamburg', images: [] },
    { stadtteil: 'stadtteil-eppendorf', address: 'Eppendorfer Landstraße, 20249 Hamburg', images: [] },
    { stadtteil: 'stadtteil-alsterdorf', address: 'Brabandstraße, 22297 Hamburg', images: [] },
    { stadtteil: 'stadtteil-alsterdorf', address: 'Alsterdorfer Straße, 22297 Hamburg', images: [] },
    { stadtteil: 'stadtteil-alsterdorf', address: 'Rathenaustraße, 22297 Hamburg', images: [] },
    { stadtteil: 'stadtteil-hafencity', address: 'Sandtorkai, 20457 Hamburg', images: [] },
    { stadtteil: 'stadtteil-hafencity', address: 'Brooktorkai, 20457 Hamburg', images: [] },
    { stadtteil: 'stadtteil-hafencity', address: 'Am Kaiserkai, 20457 Hamburg', images: [] },
    { stadtteil: 'stadtteil-lokstedt', address: 'Lembekstraße, 22529 Hamburg', images: [] },
    { stadtteil: 'stadtteil-eimsb-ttel', address: 'Heußweg, 20255 Hamburg', images: [] },
    { stadtteil: 'stadtteil-eimsb-ttel', address: 'Kleiner Schäferkamp, 20357 Hamburg', images: [] },
    { stadtteil: 'stadtteil-volksdorf', address: 'Claus-Ferck-Straße, 22359 Hamburg', images: [] },
    { stadtteil: 'stadtteil-dulsberg', address: 'Eulenkamp, 22049 Hamburg', images: [] },
  ];

  // Adressliste pro Stadtteil (für die Info-Box), aus "projects" abgeleitet,
  // damit die Adressen nur an einer Stelle (oben) gepflegt werden müssen
  const stadtteilAddresses = projects.reduce((acc, project) => {
    (acc[project.stadtteil] = acc[project.stadtteil] || []).push(project.address);
    return acc;
  }, {});

  // Name pro Stadtteil (für die Suche) – wird erst befüllt, sobald die SVG
  // geladen ist, da die Namen aus deren data-name-Attributen kommen
  let stadtteilNames = {};

  function buildStadtteilNames() {
    stadtteilNames = {};
    stadtteileMapWrap.querySelectorAll('path[id]').forEach((path) => {
      stadtteilNames[path.id] = path.dataset.name || path.id;
    });
  }

  // Bild-Galerie unter der Stadtteil-Info: zeigt die Bilder des aktuell
  // gehoverten/ausgewählten Projekts, mit Punkten zum Durchblättern und
  // einem Pfeil (unten rechts) zum nächsten Projekt. Ohne zugeordnete Bilder
  // bleibt die Box sichtbar mit Platzhaltertext.
  const projekteImageWrap = document.getElementById('projekte-image-wrap');
  const projekteGalleryImage = document.getElementById('projekte-gallery-image');
  const projekteGalleryDots = document.getElementById('projekte-gallery-dots');
  const projekteNextBtn = document.getElementById('projekte-next-btn');

  let currentProjectIndex = -1;
  let currentImageIndex = 0;
  // Dauerhaft ausgewähltes Projekt (Klick/Pfeil) – bleibt bestehen, auch
  // wenn die Maus danach über einen anderen Stadtteil bewegt wird
  let selectedProjectIndex = -1;

  // Mobile: läuft nur, solange die Galerie aufgeklappt ist (.is-expanded) -
  // wechselt automatisch alle 6s weiter, jeder manuelle Wechsel (Wisch/Punkt)
  // startet die 6s erneut
  let projekteAutoAdvanceTimer = null;
  const PROJEKTE_AUTO_ADVANCE_MS = 6000;

  function stopProjekteAutoAdvance() {
    if (projekteAutoAdvanceTimer) {
      clearInterval(projekteAutoAdvanceTimer);
      projekteAutoAdvanceTimer = null;
    }
  }

  function startProjekteAutoAdvance() {
    stopProjekteAutoAdvance();
    const project = projects[currentProjectIndex];
    if (!projekteImageWrap || !projekteImageWrap.classList.contains('is-expanded')) return;
    if (!project || project.images.length <= 1) return;

    projekteAutoAdvanceTimer = setInterval(() => {
      showGalleryImage(currentImageIndex + 1);
    }, PROJEKTE_AUTO_ADVANCE_MS);
  }

  // Bevorzugt ein Projekt MIT Bildern, falls der Stadtteil mehrere Projekte
  // hat (z. B. Harvestehude: Rothenbaumchaussee ohne Bilder, Hallerstraße
  // mit Bildern) – sonst wäre beim Klick nie etwas in der Galerie zu sehen.
  function findFirstProjectIndexForStadtteil(stadtteilId) {
    const withImages = projects.findIndex(
      (project) => project.stadtteil === stadtteilId && project.images.length
    );
    if (withImages !== -1) return withImages;

    return projects.findIndex((project) => project.stadtteil === stadtteilId);
  }

  function showGalleryImage(index) {
    const project = projects[currentProjectIndex];
    if (!project || !project.images.length || !projekteGalleryImage) return;

    currentImageIndex = ((index % project.images.length) + project.images.length) % project.images.length;

    const src = `projects/${project.images[currentImageIndex]}`;
    if (projekteGalleryImage.getAttribute('src') !== src) {
      projekteGalleryImage.setAttribute('src', src);
      projekteGalleryImage.classList.remove('projekte-image-fade');
      void projekteGalleryImage.offsetWidth;
      projekteGalleryImage.classList.add('projekte-image-fade');
    }

    if (projekteGalleryDots) {
      projekteGalleryDots.querySelectorAll('.projekte-gallery-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentImageIndex);
      });
    }

    startProjekteAutoAdvance();
  }

  function renderCurrentProject() {
    if (!projekteImageWrap) return;

    const project = projects[currentProjectIndex];
    if (!project || !project.images.length) {
      projekteImageWrap.classList.add('is-empty');
      if (projekteGalleryDots) projekteGalleryDots.innerHTML = '';
      return;
    }

    projekteImageWrap.classList.remove('is-empty');

    if (projekteGalleryDots) {
      projekteGalleryDots.innerHTML = '';
      project.images.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'projekte-gallery-dot';
        dot.setAttribute('aria-label', `Bild ${i + 1}`);
        dot.addEventListener('click', () => showGalleryImage(i));
        projekteGalleryDots.appendChild(dot);
      });
    }

    showGalleryImage(0);
  }

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

    // Auch leeren, wenn der Stadtteil kein Projekt hat – sonst blieben die
    // Bilder des vorher ausgewählten Stadtteils fälschlich sichtbar
    currentProjectIndex = findFirstProjectIndexForStadtteil(path.id);
    renderCurrentProject();
  }

  // Zeigt Name/Adresse/Galerie exakt für diesen Projekt-Index an (ohne die
  // "mit Bildern bevorzugen"-Auswahl von showStadtteilInfo) – genutzt, um
  // nach dem Weghovern zur zuletzt ausgewählten Ansicht zurückzukehren.
  function renderProjectByIndex(index) {
    const project = projects[index];
    if (!project || !stadtteileHoverName || !stadtteileHoverText) return;

    const path = stadtteileMapWrap.querySelector(`#${project.stadtteil}`);
    stadtteileHoverName.textContent = path ? path.dataset.name : project.stadtteil;

    const addresses = stadtteilAddresses[project.stadtteil];
    stadtteileHoverText.innerHTML = addresses && addresses.length
      ? addresses.join('<br>')
      : project.address;

    currentProjectIndex = index;
    renderCurrentProject();
  }

  // Einzige Stelle, die den dauerhaften roten "ausgewählt"-Zustand setzt –
  // egal ob per Kartentipp oder Pfeil-Button ausgewählt wurde, es darf immer
  // nur ein Stadtteil gleichzeitig markiert sein, daher hier zentral zuerst
  // alle vorherigen Markierungen entfernen.
  function highlightStadtteilPath(path) {
    if (!path) return;

    stadtteileMapWrap.querySelectorAll('path.stadtteile-selected').forEach((p) => {
      p.classList.remove('stadtteile-selected');
    });
    path.classList.add('stadtteile-selected');
  }

  function selectStadtteilPath(path) {
    if (!path) return;

    highlightStadtteilPath(path);
    showStadtteilInfo(path);
    selectedProjectIndex = currentProjectIndex;
  }

  stadtteileMapWrap.addEventListener('mouseover', (e) => {
    showStadtteilInfo(e.target.closest('path'));
  });

  // Beim Verlassen eines Stadtteils zur dauerhaft ausgewählten Ansicht
  // zurückkehren (falls vorhanden), statt die Galerie/Info zu leeren –
  // sonst verschwinden die Bilder eines ausgewählten Projekts, sobald die
  // Maus sich bewegt.
  stadtteileMapWrap.addEventListener('mouseout', (e) => {
    const path = e.target.closest('path');
    if (!path || !stadtteileHoverName || !stadtteileHoverText) return;

    if (selectedProjectIndex !== -1) {
      renderProjectByIndex(selectedProjectIndex);
      return;
    }

    stadtteileHoverName.textContent = stadtteileDefaultName;
    stadtteileHoverText.textContent = stadtteileDefaultText;
    currentProjectIndex = -1;
    renderCurrentProject();
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

  // Pfeil neben dem Seiten-Titel (Mobile) und Pfeil unten rechts in der
  // Bild-Box (Desktop): schalten beide gemeinsam Projekt für Projekt durch
  // (ein Stadtteil kann mehrere Projekte haben), ohne dass exakt auf die
  // Karte getippt/geklickt werden muss.
  const stadtteileNextBtn = document.getElementById('stadtteile-next-btn');

  function goToNextProject() {
    if (!projects.length) return;

    const nextIndex = (selectedProjectIndex + 1 + projects.length) % projects.length;
    const nextProject = projects[nextIndex];
    const path = stadtteileMapWrap.querySelector(`#${nextProject.stadtteil}`);
    highlightStadtteilPath(path);

    renderProjectByIndex(nextIndex);
    selectedProjectIndex = nextIndex;
  }

  if (stadtteileNextBtn) {
    stadtteileNextBtn.addEventListener('click', goToNextProject);
  }

  if (projekteNextBtn) {
    projekteNextBtn.addEventListener('click', goToNextProject);
  }

  // Mobile: kleines Vorschau-Viereck unter dem Stadtteil-Text klappt sich per
  // Touch zur großen Galerie auf (nimmt den Platz der Karte ein), mit
  // Wisch-Navigation zwischen den Bildern und X zum Schließen.
  const projekteImageClose = document.getElementById('projekte-image-close');

  function expandProjektePreview() {
    // Nur auf Mobile: die .is-expanded-Optik existiert ausschließlich in der
    // Mobile-Media-Query, am Desktop bliebe die Karte sonst einfach nur
    // ausgeblendet, ohne dass etwas an ihrer Stelle erscheint
    if (!projekteImageWrap || window.innerWidth > MOBILE_BREAKPOINT) return;
    closeRegionPanel();
    projekteImageWrap.classList.add('is-expanded');
    stadtteileMapWrap.classList.add('is-hidden');
    startProjekteAutoAdvance();
  }

  function collapseProjektePreview() {
    if (!projekteImageWrap) return;
    projekteImageWrap.classList.remove('is-expanded');
    stadtteileMapWrap.classList.remove('is-hidden');
    stopProjekteAutoAdvance();
  }

  if (projekteImageWrap) {
    projekteImageWrap.addEventListener('click', () => {
      if (projekteImageWrap.classList.contains('is-expanded')) return;
      expandProjektePreview();
    });
  }

  if (projekteImageClose) {
    projekteImageClose.addEventListener('click', (e) => {
      e.stopPropagation();
      collapseProjektePreview();
    });
  }

  // Suchleiste: Stadtteil, Straße, Postleitzahl oder ganzes Projekt suchen.
  // Ein Treffer wählt das Projekt genauso aus wie ein Kartenklick (Highlight
  // auf der Karte + Info-Box + Galerie).
  const projekteSearchInput = document.getElementById('projekte-search-input');
  const projekteSearchResults = document.getElementById('projekte-search-results');
  const projekteSearchIconBtn = document.getElementById('projekte-search-icon-btn');

  function selectProjectByIndex(index) {
    const project = projects[index];
    if (!project) return;

    const path = stadtteileMapWrap.querySelector(`#${project.stadtteil}`);
    highlightStadtteilPath(path);
    renderProjectByIndex(index);
    selectedProjectIndex = index;
  }

  function renderSearchResults(query) {
    if (!projekteSearchResults) return;

    const term = query.trim().toLowerCase();
    if (!term) {
      projekteSearchResults.classList.remove('visible');
      projekteSearchResults.innerHTML = '';
      return;
    }

    const matchedStadtteile = [];
    projects.forEach((project) => {
      const name = stadtteilNames[project.stadtteil] || '';
      const haystack = `${name} ${project.address}`.toLowerCase();
      if (haystack.includes(term) && !matchedStadtteile.includes(project.stadtteil)) {
        matchedStadtteile.push(project.stadtteil);
      }
    });

    projekteSearchResults.innerHTML = '';

    if (!matchedStadtteile.length) {
      const empty = document.createElement('p');
      empty.className = 'projekte-search-empty';
      empty.textContent = 'Keine Treffer.';
      projekteSearchResults.appendChild(empty);
      projekteSearchResults.classList.add('visible');
      return;
    }

    // Ein Ergebnis pro Stadtteil (auch wenn er mehrere Projekte hat) – beim
    // Klick wird wie beim Kartenklick bevorzugt das Projekt MIT Bildern
    // gewählt, sonst bliebe die Galerie leer, obwohl der Stadtteil Bilder hat.
    matchedStadtteile.slice(0, 8).forEach((stadtteilId) => {
      const index = findFirstProjectIndexForStadtteil(stadtteilId);
      const name = stadtteilNames[stadtteilId] || stadtteilId;
      const addresses = (stadtteilAddresses[stadtteilId] || []).join(' · ');

      const result = document.createElement('button');
      result.type = 'button';
      result.className = 'projekte-search-result';
      result.innerHTML = `<strong>${name}</strong>${addresses}`;
      result.addEventListener('click', () => {
        selectProjectByIndex(index);
        projekteSearchInput.value = '';
        projekteSearchResults.classList.remove('visible');
        projekteSearchResults.innerHTML = '';
        projekteSearchInput.blur();
      });
      projekteSearchResults.appendChild(result);
    });

    projekteSearchResults.classList.add('visible');
  }

  if (projekteSearchInput) {
    projekteSearchInput.addEventListener('input', () => {
      renderSearchResults(projekteSearchInput.value);
    });

    projekteSearchInput.addEventListener('focus', () => {
      if (projekteSearchInput.value.trim()) {
        renderSearchResults(projekteSearchInput.value);
      }
    });

    if (projekteSearchIconBtn) {
      projekteSearchIconBtn.addEventListener('click', () => {
        projekteSearchInput.focus();
        renderSearchResults(projekteSearchInput.value);
      });
    }

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.projekte-search-wrap')) {
        projekteSearchResults.classList.remove('visible');
      }
    });
  }

  // "Projekte deutschlandweit" / "Projekte im Ausland": Pfeil neben der
  // Überschrift öffnet ein Panel an Stelle der Hamburg-Karte mit Bildern +
  // Adressliste. Noch keine Adressen/Bilder hinterlegt - hier eintragen,
  // sobald sie feststehen (Bilder aus dem Ordner "projects/").
  const regionProjects = {
    deutschlandweit: [
      {
        address: 'Düsternbrooker Weg, 24105 Kiel',
        images: ['kiel-01.jpg', 'kiel-02.jpg', 'kiel-03.jpeg'],
      },
      {
        address: 'Strandallee, 23669 Timmendorfer Strand',
        images: ['lubek-01.jpeg', 'lubek-02.jpg', 'lubek-03.jpg'],
      },
      {
        address: 'Wulfsdorfer Weg, 22926 Ahrensburg',
        images: ['ahrensburg-01.jpg', 'ahrensburg-02.jpg', 'ahrensburg-03.jpg'],
      },
    ],
    ausland: [
      {
        address: 'Monte Carlo, 98000 Monaco',
        images: ['montecarlo-01.jpg', 'montecarlo-02.jpg', 'montecarlo-03.jpg', 'montecarlo-04.jpg'],
      },
      {
        address: 'Paris, 75016 Frankreich',
        images: ['paris-01.jpg', 'paris-02.jpg', 'paris-03.jpg'],
      },
    ],
  };

  const regionTitles = {
    deutschlandweit: 'Projekte deutschlandweit',
    ausland: 'Projekte im Ausland',
  };

  const projekteRegionPanel = document.getElementById('projekte-region-panel');
  const projekteRegionBack = document.getElementById('projekte-region-back');
  const projekteRegionTitle = document.getElementById('projekte-region-title');
  const projekteRegionGalleryWrap = document.getElementById('projekte-region-gallery-wrap');
  const projekteRegionGalleryImage = document.getElementById('projekte-region-gallery-image');
  const projekteRegionGalleryDots = document.getElementById('projekte-region-gallery-dots');
  const projekteRegionAddressList = document.getElementById('projekte-region-address-list');
  const projekteScopeArrowDe = document.getElementById('projekte-scope-arrow-de');
  const projekteScopeArrowInt = document.getElementById('projekte-scope-arrow-int');

  let currentRegionEntries = [];
  let regionImages = [];
  let regionImageIndex = 0;
  let regionAutoAdvanceTimer = null;
  const REGION_AUTO_ADVANCE_MS = 6000;

  // Nur ein einziges Pfeil-Icon insgesamt - es wandert zur jeweils
  // ausgewählten Anschrift, statt dass jede Zeile ein eigenes Icon hat.
  const projekteRegionSelectedIcon = document.createElement('span');
  projekteRegionSelectedIcon.className = 'projekte-region-address-icon';
  projekteRegionSelectedIcon.innerHTML =
    '<svg viewBox="0 0 80.593 122.88" fill="currentColor"><polygon points="0,0 30.82,0 80.593,61.44 30.82,122.88 0,122.88 49.772,61.44 0,0"/></svg>';

  // FLIP-Technik: Position vor dem Verschieben merken, danach die Distanz
  // zur neuen Position per Transform "rückgängig" machen und weich auf 0
  // animieren - so gleitet das Icon zur neuen Anschrift, statt dorthin zu
  // springen.
  function moveSelectedIconTo(newParent) {
    const icon = projekteRegionSelectedIcon;
    const wasInDocument = icon.isConnected;
    const firstRect = wasInDocument ? icon.getBoundingClientRect() : null;

    icon.style.transition = 'none';
    newParent.prepend(icon);

    if (!wasInDocument) return;

    const lastRect = icon.getBoundingClientRect();
    const deltaX = firstRect.left - lastRect.left;
    const deltaY = firstRect.top - lastRect.top;

    if (!deltaX && !deltaY) return;

    icon.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    requestAnimationFrame(() => {
      icon.style.transition = 'transform 0.35s ease';
      icon.style.transform = '';
    });
  }

  // Klasse ab-/wieder anhängen, damit die CSS-Animation bei jedem Aufruf
  // neu abspielt (sonst würde sie beim zweiten Mal nicht erneut auslösen)
  function retriggerAnimation(el, className) {
    if (!el) return;
    el.classList.remove(className);
    void el.offsetWidth;
    el.classList.add(className);
  }

  function stopRegionAutoAdvance() {
    if (regionAutoAdvanceTimer) {
      clearInterval(regionAutoAdvanceTimer);
      regionAutoAdvanceTimer = null;
    }
  }

  // Läuft, solange ein Projekt mit mehr als einem Bild ausgewählt ist -
  // wechselt automatisch alle 6s weiter; jeder manuelle Wechsel (Kreis-Klick)
  // startet die 6s erneut, damit das gerade gewählte Bild nicht sofort
  // wieder verschwindet.
  function startRegionAutoAdvance() {
    stopRegionAutoAdvance();
    if (regionImages.length <= 1) return;

    regionAutoAdvanceTimer = setInterval(() => {
      showRegionImage(regionImageIndex + 1);
    }, REGION_AUTO_ADVANCE_MS);
  }

  function showRegionImage(index) {
    if (!projekteRegionGalleryImage || !regionImages.length) return;

    regionImageIndex = ((index % regionImages.length) + regionImages.length) % regionImages.length;
    const src = `projects/${regionImages[regionImageIndex]}`;
    if (projekteRegionGalleryImage.getAttribute('src') !== src) {
      projekteRegionGalleryImage.setAttribute('src', src);
      retriggerAnimation(projekteRegionGalleryImage, 'projekte-region-image-fade');
    }

    if (projekteRegionGalleryDots) {
      projekteRegionGalleryDots.querySelectorAll('button').forEach((dot, i) => {
        dot.classList.toggle('active', i === regionImageIndex);
      });
    }

    startRegionAutoAdvance();
  }

  // Anschrift angeklickt: zeigt die Bilder genau dieses Projekts in der
  // Galerie, mit eigenen Kreisen + Auto-Wechsel; das einzige Pfeil-Icon
  // springt vor die neu gewählte Anschrift.
  function selectRegionProject(index) {
    const entry = currentRegionEntries[index];
    regionImages = entry ? entry.images : [];
    regionImageIndex = 0;

    if (projekteRegionAddressList) {
      const rows = projekteRegionAddressList.querySelectorAll('li');
      rows.forEach((li, i) => {
        li.classList.toggle('active', i === index);
      });

      const activeRow = rows[index];
      if (activeRow) {
        moveSelectedIconTo(activeRow);
      }
    }

    if (projekteRegionGalleryWrap) {
      projekteRegionGalleryWrap.classList.toggle('is-empty', !regionImages.length);
    }

    if (projekteRegionGalleryDots) {
      projekteRegionGalleryDots.innerHTML = '';
      regionImages.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', `Bild ${i + 1}`);
        dot.addEventListener('click', () => showRegionImage(i));
        projekteRegionGalleryDots.appendChild(dot);
      });
    }

    showRegionImage(0);
  }

  function openRegionPanel(regionKey) {
    if (!projekteRegionPanel) return;

    collapseProjektePreview();

    const entries = regionProjects[regionKey] || [];
    currentRegionEntries = entries;

    if (projekteRegionTitle) {
      projekteRegionTitle.textContent = regionTitles[regionKey] || '';
    }

    if (projekteRegionAddressList) {
      projekteRegionAddressList.innerHTML = '';
      if (!entries.length) {
        const li = document.createElement('li');
        li.className = 'projekte-region-address-empty';
        li.textContent = 'Adressen folgen in Kürze.';
        projekteRegionAddressList.appendChild(li);
      } else {
        entries.forEach((entry, i) => {
          const li = document.createElement('li');

          const text = document.createElement('span');
          text.className = 'projekte-region-address-text';
          // Adresse zeilenweise aufteilen (z. B. "Monte Carlo" / "98000 Monaco"),
          // statt alles in einer langen Zeile zu zeigen
          text.innerHTML = entry.address
            .split(',')
            .map((line) => line.trim())
            .join('<br>');

          li.setAttribute('role', 'button');
          li.setAttribute('tabindex', '0');
          li.setAttribute('aria-label', `Bilder zu ${entry.address} anzeigen`);
          li.addEventListener('click', () => selectRegionProject(i));
          li.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              selectRegionProject(i);
            }
          });

          li.appendChild(text);
          projekteRegionAddressList.appendChild(li);
        });
      }
    }

    selectRegionProject(entries.length ? 0 : -1);

    retriggerAnimation(projekteRegionTitle, 'projekte-region-content-fade');
    retriggerAnimation(projekteRegionAddressList, 'projekte-region-content-fade');
    retriggerAnimation(projekteRegionGalleryWrap, 'projekte-region-content-fade');

    stadtteileMapWrap.classList.add('is-hidden');
    projekteRegionPanel.classList.add('visible');
  }

  function closeRegionPanel() {
    if (!projekteRegionPanel) return;
    projekteRegionPanel.classList.remove('visible');
    stadtteileMapWrap.classList.remove('is-hidden');
    stopRegionAutoAdvance();
  }

  if (projekteScopeArrowDe) {
    projekteScopeArrowDe.addEventListener('click', () => openRegionPanel('deutschlandweit'));
  }

  if (projekteScopeArrowInt) {
    projekteScopeArrowInt.addEventListener('click', () => openRegionPanel('ausland'));
  }

  if (projekteRegionBack) {
    projekteRegionBack.addEventListener('click', closeRegionPanel);
  }

  const projekteRegionClose = document.getElementById('projekte-region-close');
  if (projekteRegionClose) {
    projekteRegionClose.addEventListener('click', closeRegionPanel);
  }

  // Mobile: per Wisch-Geste (links/rechts) statt durch Antippen wechseln -
  // ruft onSwipeLeft/onSwipeRight nur bei eindeutig horizontalen Wischgesten
  // auf, damit normales vertikales Scrollen der Seite nicht versehentlich
  // etwas wechselt. stopPropagation optional, damit eine Wisch-Geste über
  // der Bilder-Galerie nicht zusätzlich noch die Anschrift wechselt.
  function attachHorizontalSwipe(el, onSwipeLeft, onSwipeRight, stopBubble) {
    if (!el) return;
    let startX = 0;
    let startY = 0;

    el.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      if (!touch) return;
      startX = touch.clientX;
      startY = touch.clientY;
    }, { passive: true });

    el.addEventListener('touchend', (e) => {
      const touch = e.changedTouches[0];
      if (!touch) return;

      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      if (Math.abs(deltaX) < 40 || Math.abs(deltaX) < Math.abs(deltaY) * 1.5) return;

      if (stopBubble) e.stopPropagation();
      if (deltaX < 0) onSwipeLeft(); else onSwipeRight();
    }, { passive: true });
  }

  // Anschrift wechseln (ganzes Fenster, zeigt auf dem Handy ohnehin immer
  // nur die aktuell ausgewählte Anschrift, siehe CSS)
  function getActiveRegionIndex() {
    if (!projekteRegionAddressList) return -1;
    const rows = Array.from(projekteRegionAddressList.querySelectorAll('li'));
    return rows.findIndex((li) => li.classList.contains('active'));
  }

  attachHorizontalSwipe(
    projekteRegionPanel,
    () => {
      if (!currentRegionEntries.length) return;
      const i = getActiveRegionIndex();
      if (i === -1) return;
      selectRegionProject((i + 1) % currentRegionEntries.length);
    },
    () => {
      if (!currentRegionEntries.length) return;
      const i = getActiveRegionIndex();
      if (i === -1) return;
      selectRegionProject((i - 1 + currentRegionEntries.length) % currentRegionEntries.length);
    }
  );

  // Bild wechseln (nur über der Galerie, stoppt die Weitergabe an das
  // Fenster, damit ein Bild-Wisch nicht zugleich die Anschrift wechselt)
  attachHorizontalSwipe(
    projekteRegionGalleryWrap,
    () => {
      if (!regionImages.length) return;
      showRegionImage(regionImageIndex + 1);
    },
    () => {
      if (!regionImages.length) return;
      showRegionImage(regionImageIndex - 1);
    },
    true
  );

  // Projekt-Vorschau (Stadtteil-Galerie): Bilder per Wisch-Geste wechseln,
  // nur wirksam solange aufgeklappt (.is-expanded)
  attachHorizontalSwipe(
    projekteImageWrap,
    () => {
      if (!projekteImageWrap || !projekteImageWrap.classList.contains('is-expanded')) return;
      showGalleryImage(currentImageIndex + 1);
    },
    () => {
      if (!projekteImageWrap || !projekteImageWrap.classList.contains('is-expanded')) return;
      showGalleryImage(currentImageIndex - 1);
    }
  );
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

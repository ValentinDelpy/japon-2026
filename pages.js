// =============================================
// PAGE RENDERERS
// Dashboard, Itinerary, Guides, Print
// =============================================

// ─── COORDINATES DATABASE for mapping ───
const COORDS = {
  "tokyo": [35.6762, 139.6503], "shinjuku": [35.6938, 139.7034], "shibuya": [35.6580, 139.7016],
  "kyoto": [35.0116, 135.7681], "osaka": [34.6937, 135.5023], "hiroshima": [34.3853, 132.4553],
  "nara": [34.6851, 135.8048], "hakone": [35.2326, 139.1070], "nikko": [36.7199, 139.6982],
  "kamakura": [35.3192, 139.5467], "kanazawa": [36.5613, 136.6562], "takayama": [36.1461, 137.2522],
  "fuji": [35.3606, 138.7274], "kawaguchiko": [35.5139, 138.7553],
  "miyajima": [34.2960, 132.3198], "koyasan": [34.2131, 135.5833],
  "narita": [35.7720, 140.3929], "kobe": [34.6901, 135.1955],
  "yokohama": [35.4437, 139.6380], "nagoya": [35.1815, 136.9066],
  "fukuoka": [33.5902, 130.4017], "sapporo": [43.0618, 141.3545],
  "okinawa": [26.3344, 127.8056], "sendai": [38.2682, 140.8694],
  "matsumoto": [36.2381, 137.9720], "shirakawago": [36.2574, 136.9060],
  "shirakawa-go": [36.2574, 136.9060], "enoshima": [35.3003, 139.4800],
  "onomichi": [34.4090, 133.2050], "naoshima": [34.4618, 133.9955],
  "beppu": [33.2846, 131.4914], "kagoshima": [31.5966, 130.5571],
  "kumamoto": [32.8032, 130.7079], "nagasaki": [32.7503, 129.8779]
};

function getCoords(placeName) {
  if (!placeName) return null;
  const norm = placeName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").trim();
  for (const [key, coords] of Object.entries(COORDS)) {
    if (norm.includes(key) || key.includes(norm.split(/\s/)[0])) {
      return coords;
    }
  }
  return null;
}

// ─── Parse numeric budget ───
function parseBudget(str) {
  if (!str) return 0;
  const cleaned = String(str).replace(/[^0-9.,\-]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

// ─── Format currency ───
function formatJPY(amount) {
  if (!amount && amount !== 0) return '—';
  return '¥' + Math.round(amount).toLocaleString('fr-FR');
}
function formatEUR(amount) {
  if (!amount && amount !== 0) return '—';
  return Number(amount).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
}

// ─── MAP CREATION UTILITY ───
let maps = {};
function createMap(containerId, steps, options = {}) {
  if (maps[containerId]) {
    maps[containerId].remove();
    delete maps[containerId];
  }

  const container = document.getElementById(containerId);
  if (!container) return null;

  const map = L.map(containerId, {
    scrollWheelZoom: options.scrollZoom !== false,
    zoomControl: true
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/">OSM</a> © <a href="https://carto.com/">CARTO</a>',
    maxZoom: 18
  }).addTo(map);

  const markers = [];
  const validSteps = steps.filter(s => {
    const coords = getCoords(s.lieu);
    return coords !== null;
  });

  validSteps.forEach((step, idx) => {
    const coords = getCoords(step.lieu);
    if (!coords) return;

    // Custom numbered marker
    const icon = L.divIcon({
      className: 'custom-marker-wrapper',
      html: `<div class="custom-marker">${idx + 1}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const marker = L.marker(coords, { icon }).addTo(map);

    // Always-visible label
    const label = L.marker(coords, {
      icon: L.divIcon({
        className: 'marker-label-wrapper',
        html: `<div class="marker-label">${step.lieu}</div>`,
        iconSize: [100, 20],
        iconAnchor: [-18, 10]
      }),
      interactive: false
    }).addTo(map);

    // Popup
    let popupContent = `<div class="popup-title">${step.lieu}</div>`;
    if (step.date) popupContent += `<div class="popup-dates">📅 ${step.date}${step.dateFin ? ' → ' + step.dateFin : ''}</div>`;
    if (step.hebergement) popupContent += `<div class="popup-detail">🏨 ${step.hebergement}</div>`;
    if (step.transport) popupContent += `<div class="popup-detail">🚅 ${step.transport}</div>`;
    if (step.nuits) popupContent += `<div class="popup-detail">🌙 ${step.nuits} nuit(s)</div>`;

    marker.bindPopup(popupContent);
    markers.push(coords);
  });

  // Draw route line
  if (markers.length > 1) {
    L.polyline(markers, {
      color: '#c73e1d',
      weight: 2.5,
      opacity: 0.6,
      dashArray: '8, 8'
    }).addTo(map);
  }

  // Fit bounds
  if (markers.length > 0) {
    const bounds = L.latLngBounds(markers);
    map.fitBounds(bounds, { padding: [40, 40] });
  } else {
    // Default to Japan
    map.setView([36.2, 138.2], 6);
  }

  maps[containerId] = map;
  return map;
}

// ═══════════════════════════════════════════
// DASHBOARD PAGE
// ═══════════════════════════════════════════
function renderDashboard() {
  const steps = DataService.getSteps();
  const rate = DataService.exchangeRate;

  // Compute stats
  const totalNights = steps.reduce((sum, s) => sum + (parseInt(s.nuits) || 0), 0);
  const totalBudgetJPY = steps.reduce((sum, s) => sum + parseBudget(s.budget), 0);
  const totalBudgetEUR = rate ? (totalBudgetJPY / rate) : 0;
  const uniquePlaces = [...new Set(steps.map(s => s.lieu).filter(Boolean))];
  const firstDate = steps.find(s => s.date)?.date || '—';
  const lastDate = [...steps].reverse().find(s => s.date)?.date || '—';

  let html = `
    <div class="page-header">
      <h1>Dashboard <span class="jp-accent" style="opacity:0.3;font-size:0.6em">旅の概要</span></h1>
      <p class="subtitle">Vue d'ensemble de votre voyage au Japon</p>
    </div>

    <!-- STATS -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-label">Destinations</div>
        <div class="stat-value indigo">${uniquePlaces.length}</div>
        <div class="stat-detail">villes & étapes</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Nuits</div>
        <div class="stat-value teal">${totalNights}</div>
        <div class="stat-detail">${firstDate} → ${lastDate}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Budget total</div>
        <div class="stat-value vermillion">${formatJPY(totalBudgetJPY)}</div>
        <div class="stat-detail">≈ ${formatEUR(totalBudgetEUR)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Taux EUR→JPY</div>
        <div class="stat-value gold">${rate ? rate.toFixed(2) : '—'}</div>
        <div class="stat-detail">temps réel</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Budget / nuit</div>
        <div class="stat-value bamboo">${totalNights > 0 ? formatJPY(totalBudgetJPY / totalNights) : '—'}</div>
        <div class="stat-detail">${totalNights > 0 && rate ? '≈ ' + formatEUR(totalBudgetEUR / totalNights) : ''}</div>
      </div>
    </div>

    <!-- MAP + TIMELINE -->
    <div class="dashboard-grid">
      <div class="map-container">
        <div class="map-title-bar">🗾 Carte de l'itinéraire</div>
        <div id="dashboard-map"></div>
      </div>
      <div class="timeline-container">
        <div class="map-title-bar">📍 Étapes du voyage</div>
        <div class="timeline-list">
          ${steps.filter(s => s.lieu).map((step, i) => `
            <div class="timeline-item" onclick="highlightMapMarker('dashboard-map', ${i})" data-index="${i}">
              <div class="timeline-number">${i + 1}</div>
              <div class="timeline-info">
                <div class="timeline-place">${step.lieu}</div>
                <div class="timeline-dates">${step.date || ''}${step.dateFin ? ' → ' + step.dateFin : ''}</div>
                <div class="timeline-tags">
                  ${step.transport ? `<span class="tag transport">🚅 ${step.transport}</span>` : ''}
                  ${step.nuits ? `<span class="tag nights">🌙 ${step.nuits}n</span>` : ''}
                  ${step.budget ? `<span class="tag budget">${formatJPY(parseBudget(step.budget))}</span>` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- BUDGET BREAKDOWN -->
    <div class="budget-section mt-3">
      <div class="budget-grid">
        <div class="budget-table-wrap">
          <div class="map-title-bar">💰 Détail du budget par étape</div>
          <div class="table-scroll">
            <table class="budget-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Lieu</th>
                  <th>Budget ¥</th>
                  <th>Budget €</th>
                  <th>Hébergement</th>
                </tr>
              </thead>
              <tbody>
                ${steps.filter(s => s.lieu).map((step, i) => {
                  const bJPY = parseBudget(step.budget);
                  return `<tr>
                    <td>${i + 1}</td>
                    <td>${step.lieu}</td>
                    <td class="amount">${bJPY ? formatJPY(bJPY) : '—'}</td>
                    <td class="amount">${bJPY && rate ? formatEUR(bJPY / rate) : '—'}</td>
                    <td class="text-sm">${step.hebergement || '—'}</td>
                  </tr>`;
                }).join('')}
                <tr style="font-weight:700;background:var(--paper-warm)">
                  <td></td>
                  <td>TOTAL</td>
                  <td class="amount">${formatJPY(totalBudgetJPY)}</td>
                  <td class="amount">${formatEUR(totalBudgetEUR)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="budget-summary">
          <h3>Répartition</h3>
          ${generateBudgetBars(steps)}
        </div>
      </div>
    </div>
  `;

  document.getElementById('page-container').innerHTML = html;

  // Init map after DOM update
  setTimeout(() => {
    createMap('dashboard-map', steps);
  }, 100);
}

function generateBudgetBars(steps) {
  // Group by city
  const byCity = {};
  steps.forEach(s => {
    if (!s.lieu) return;
    const b = parseBudget(s.budget);
    byCity[s.lieu] = (byCity[s.lieu] || 0) + b;
  });

  const total = Object.values(byCity).reduce((a, b) => a + b, 0);
  if (total === 0) return '<p class="text-muted text-sm">Aucune donnée budget</p>';

  const colors = ['#c73e1d', '#264653', '#2a9d8f', '#e9c46a', '#e76f51', '#606c38', '#2a6478', '#d4a843', '#40b5a6', '#789048'];
  const sorted = Object.entries(byCity).sort((a, b) => b[1] - a[1]);

  return sorted.map(([city, amount], i) => {
    const pct = (amount / total * 100).toFixed(1);
    return `
      <div class="budget-bar-item">
        <div class="budget-bar-label">
          <span class="cat">${city}</span>
          <span class="val">${pct}%</span>
        </div>
        <div class="budget-bar">
          <div class="budget-bar-fill" style="width:${pct}%;background:${colors[i % colors.length]}"></div>
        </div>
      </div>
    `;
  }).join('');
}

function highlightMapMarker(mapId, index) {
  const map = maps[mapId];
  if (!map) return;
  const steps = DataService.getSteps().filter(s => s.lieu);
  if (index >= steps.length) return;
  const coords = getCoords(steps[index].lieu);
  if (coords) {
    map.flyTo(coords, 10, { duration: 0.8 });
  }
}

// ═══════════════════════════════════════════
// ITINERARY PAGE
// ═══════════════════════════════════════════
function renderItinerary() {
  const steps = DataService.getSteps();
  const cols = DataService.getMainCols();
  const rows = DataService.mainData?.rows || [];
  const rate = DataService.exchangeRate;

  // Summary statistics by city
  const cityStats = {};
  steps.forEach(s => {
    if (!s.lieu) return;
    if (!cityStats[s.lieu]) cityStats[s.lieu] = { nights: 0, budget: 0, activities: [] };
    cityStats[s.lieu].nights += parseInt(s.nuits) || 0;
    cityStats[s.lieu].budget += parseBudget(s.budget);
    if (s.activite) cityStats[s.lieu].activities.push(s.activite);
  });

  let html = `
    <div class="page-header">
      <h1>Itinéraire <span class="jp-accent" style="opacity:0.3;font-size:0.6em">旅程</span></h1>
      <p class="subtitle">Détail complet de votre parcours au Japon</p>
    </div>

    <!-- MAP -->
    <div class="map-container mb-2" style="animation: fadeInUp 0.5s ease backwards;">
      <div class="map-title-bar">🗾 Tracé de l'itinéraire complet</div>
      <div id="itinerary-map"></div>
    </div>

    <!-- FULL TABLE (raw spreadsheet data) -->
    <div class="itinerary-full-table mt-2 mb-2">
      <div class="map-title-bar flex-between">
        <span>📋 Données complètes du spreadsheet</span>
        <span class="text-sm text-muted">${rows.length} lignes · ${cols.length} colonnes</span>
      </div>
      <div class="table-scroll">
        <table class="iti-table">
          <thead>
            <tr>
              ${cols.map(c => `<th>${c}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr>
                ${cols.map(c => {
                  let val = row[c] || '';
                  let cls = '';
                  const cLower = c.toLowerCase();
                  if (cLower.includes('date') || cLower.includes('jour')) cls = 'row-date';
                  if (cLower.includes('lieu') || cLower.includes('ville') || cLower.includes('destination') || cLower.includes('étape')) cls = 'row-place';
                  if (cLower.includes('budget') || cLower.includes('coût') || cLower.includes('prix') || cLower.includes('montant')) cls = 'row-amount';
                  return `<td class="${cls}">${val}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- SUMMARY CARDS -->
    <div class="itinerary-summary-cards mt-2">
      ${Object.entries(cityStats).map(([city, stats]) => `
        <div class="summary-card">
          <h3>📍 ${city}</h3>
          <ul class="summary-list">
            <li><span class="s-label">Nuits</span><span class="s-value">${stats.nights}</span></li>
            <li><span class="s-label">Budget ¥</span><span class="s-value">${formatJPY(stats.budget)}</span></li>
            <li><span class="s-label">Budget €</span><span class="s-value">${rate ? formatEUR(stats.budget / rate) : '—'}</span></li>
            ${stats.activities.length > 0 ? `<li><span class="s-label">Activités</span><span class="s-value text-sm" style="font-family:'DM Sans';text-align:right;max-width:60%">${stats.activities.join(', ')}</span></li>` : ''}
          </ul>
        </div>
      `).join('')}
    </div>
  `;

  document.getElementById('page-container').innerHTML = html;

  setTimeout(() => {
    createMap('itinerary-map', steps);
  }, 100);
}

// ═══════════════════════════════════════════
// GUIDES PAGE
// ═══════════════════════════════════════════
function renderGuides() {
  const steps = DataService.getSteps();
  const uniquePlaces = [];
  const seen = new Set();

  steps.forEach(step => {
    if (!step.lieu) return;
    const key = step.lieu.toLowerCase().trim();
    if (seen.has(key)) return;
    seen.add(key);
    uniquePlaces.push(step);
  });

  let html = `
    <div class="page-header">
      <h1>Fiches Voyage <span class="jp-accent" style="opacity:0.3;font-size:0.6em">旅のガイド</span></h1>
      <p class="subtitle">Guides détaillés pour chaque étape de votre itinéraire</p>
    </div>
    <div class="guides-grid">
      ${uniquePlaces.map((step, i) => {
        const dest = findDestination(step.lieu);
        return `
          <div class="guide-card" onclick="openGuideDetail('${encodeURIComponent(step.lieu)}')" style="animation-delay:${i * 0.08}s">
            <div class="guide-card-img" style="background-image:url('${dest.image}')">
              <div class="guide-card-overlay">
                <h3>${step.lieu} ${dest.nameJP ? '<span style="opacity:0.6;font-size:0.75em">' + dest.nameJP + '</span>' : ''}</h3>
                <div class="guide-dates">${step.date || ''}${step.nuits ? ' · ' + step.nuits + ' nuit(s)' : ''}</div>
              </div>
            </div>
            <div class="guide-card-body">
              <p>${dest.intro.substring(0, 160)}...</p>
              <div class="guide-card-tags">
                ${dest.highlights.slice(0, 3).map(h => `<span class="guide-tag">${h.substring(0, 35)}${h.length > 35 ? '…' : ''}</span>`).join('')}
              </div>
              <a class="guide-card-cta" href="javascript:void(0)">Voir la fiche complète →</a>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  document.getElementById('page-container').innerHTML = html;
}

function openGuideDetail(encodedName) {
  const name = decodeURIComponent(encodedName);
  const dest = findDestination(name);
  const steps = DataService.getSteps();
  const step = steps.find(s => s.lieu && s.lieu.toLowerCase().includes(name.toLowerCase())) || {};

  const overlay = document.createElement('div');
  overlay.className = 'guide-detail-overlay';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  overlay.innerHTML = `
    <div class="guide-detail">
      <div class="guide-detail-hero" style="background-image:url('${dest.image}')">
        <button class="guide-close" onclick="this.closest('.guide-detail-overlay').remove()">&times;</button>
        <div class="guide-detail-hero-content">
          <h1>${name} ${dest.nameJP ? '<span style="opacity:0.7;font-size:0.6em">' + dest.nameJP + '</span>' : ''}</h1>
          <div class="dates">${step.date || ''}${step.dateFin ? ' → ' + step.dateFin : ''}${step.nuits ? ' · ' + step.nuits + ' nuit(s)' : ''}</div>
        </div>
      </div>
      <div class="guide-detail-body">
        <div class="guide-section">
          <h2>Présentation</h2>
          <p>${dest.intro}</p>
        </div>

        ${step.hebergement ? `
          <div class="guide-infobox">
            <div class="info-title">🏨 Votre hébergement</div>
            <p>${step.hebergement}</p>
          </div>
        ` : ''}

        ${step.transport ? `
          <div class="guide-infobox">
            <div class="info-title">🚅 Transport</div>
            <p>${step.transport}</p>
          </div>
        ` : ''}

        <div class="guide-section">
          <h2>À ne pas manquer</h2>
          <ul>
            ${dest.highlights.map(h => `<li>${h}</li>`).join('')}
          </ul>
        </div>

        <div class="guide-section">
          <h2>Le saviez-vous ?</h2>
          ${dest.funFacts.map(f => `
            <div class="guide-infobox" style="border-left-color:var(--teal)">
              <p>💡 ${f}</p>
            </div>
          `).join('')}
        </div>

        <div class="guide-section">
          <h2>Où manger</h2>
          <div class="guide-restaurants">
            ${dest.restaurants.map(r => `
              <div class="resto-card">
                <div class="resto-name">${r.name}</div>
                <div class="resto-type">${r.type}</div>
                <div class="resto-desc">${r.desc}</div>
                <div class="resto-price">${r.price}</div>
              </div>
            `).join('')}
          </div>
        </div>

        ${dest.tips ? `
          <div class="guide-section">
            <h2>Conseils pratiques</h2>
            <div class="guide-infobox" style="border-left-color:var(--vermillion)">
              <div class="info-title">💡 Bon à savoir</div>
              <p>${dest.tips}</p>
            </div>
          </div>
        ` : ''}

        ${step.activite ? `
          <div class="guide-section">
            <h2>Votre programme</h2>
            <p>${step.activite}</p>
          </div>
        ` : ''}

        ${step.notes ? `
          <div class="guide-section">
            <h2>Notes</h2>
            <p>${step.notes}</p>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
}

// ═══════════════════════════════════════════
// PRINT PAGE — Calendar + Map
// ═══════════════════════════════════════════
function renderPrint() {
  const steps = DataService.getSteps();

  // Build calendar data from dates
  const calendarData = buildCalendarData(steps);

  let html = `
    <div class="page-header">
      <h1>Impression <span class="jp-accent" style="opacity:0.3;font-size:0.6em">印刷</span></h1>
      <p class="subtitle">Version imprimable avec calendrier et carte</p>
    </div>

    <div class="print-actions no-print">
      <button class="btn btn-primary" onclick="window.print()">🖨️ Imprimer / PDF</button>
      <button class="btn btn-secondary" onclick="togglePrintFullscreen()">📄 Aperçu plein écran</button>
    </div>

    <!-- MAP for print -->
    <div class="print-map-section mb-2">
      <div class="map-title-bar">🗾 Carte de l'itinéraire</div>
      <div id="print-map"></div>
    </div>

    <!-- CALENDAR -->
    ${calendarData.months.map(month => `
      <div class="print-calendar mb-2">
        <div class="calendar-header">${month.label}</div>
        <div class="calendar-grid">
          <div class="calendar-day-header">Lun</div>
          <div class="calendar-day-header">Mar</div>
          <div class="calendar-day-header">Mer</div>
          <div class="calendar-day-header">Jeu</div>
          <div class="calendar-day-header">Ven</div>
          <div class="calendar-day-header">Sam</div>
          <div class="calendar-day-header">Dim</div>
          ${month.days.map(day => {
            if (!day) return '<div class="calendar-day empty"></div>';
            const events = calendarData.events[day.dateStr] || [];
            return `
              <div class="calendar-day ${day.isToday ? 'today' : ''}">
                <div class="day-num">${day.num}</div>
                ${events.map(e => `
                  <div class="day-event" title="${e.lieu}${e.transport ? ' — ' + e.transport : ''}">${e.lieu}</div>
                  ${e.transport ? `<div class="day-transport">${e.transport}</div>` : ''}
                `).join('')}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `).join('')}

    <!-- STEP LIST for print -->
    <div class="itinerary-full-table mt-2">
      <div class="map-title-bar">📋 Liste des étapes</div>
      <div class="table-scroll">
        <table class="iti-table">
          <thead>
            <tr>
              <th>#</th><th>Date</th><th>Lieu</th><th>Transport</th><th>Hébergement</th><th>Budget</th><th>Activités</th>
            </tr>
          </thead>
          <tbody>
            ${steps.filter(s => s.lieu).map((s, i) => `
              <tr>
                <td>${i + 1}</td>
                <td class="row-date">${s.date || '—'}</td>
                <td class="row-place">${s.lieu}</td>
                <td class="text-sm">${s.transport || '—'}</td>
                <td class="text-sm">${s.hebergement || '—'}</td>
                <td class="row-amount">${s.budget ? formatJPY(parseBudget(s.budget)) : '—'}</td>
                <td class="text-sm">${s.activite || '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.getElementById('page-container').innerHTML = html;

  setTimeout(() => {
    createMap('print-map', steps);
  }, 100);
}

function buildCalendarData(steps) {
  // Parse dates from steps to determine calendar range
  const dates = [];
  const events = {};

  steps.forEach(step => {
    if (!step.date) return;
    const parsed = parseDate(step.date);
    if (!parsed) return;

    const dateStr = formatDateStr(parsed);
    dates.push(parsed);
    if (!events[dateStr]) events[dateStr] = [];
    events[dateStr].push(step);

    // If there are multiple nights, fill in the range
    const nights = parseInt(step.nuits) || 0;
    for (let d = 1; d < nights; d++) {
      const next = new Date(parsed);
      next.setDate(next.getDate() + d);
      const nextStr = formatDateStr(next);
      if (!events[nextStr]) events[nextStr] = [];
      events[nextStr].push({ ...step, transport: '', isStay: true });
    }
  });

  if (dates.length === 0) {
    return { months: [], events };
  }

  // Find date range
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  // Add buffer for nights
  const maxNights = Math.max(...steps.map(s => parseInt(s.nuits) || 0));
  maxDate.setDate(maxDate.getDate() + maxNights + 1);

  // Generate months
  const months = [];
  let current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);

  while (current <= maxDate) {
    const year = current.getFullYear();
    const month = current.getMonth();
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    const firstDay = new Date(year, month, 1);
    let startPad = firstDay.getDay() - 1; // Monday = 0
    if (startPad < 0) startPad = 6;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const todayStr = formatDateStr(today);

    const days = [];
    // Pad start
    for (let i = 0; i < startPad; i++) days.push(null);
    // Fill days
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dateStr = formatDateStr(date);
      days.push({
        num: d,
        dateStr,
        isToday: dateStr === todayStr
      });
    }

    months.push({
      label: `${monthNames[month]} ${year}`,
      days
    });

    current = new Date(year, month + 1, 1);
  }

  return { months, events };
}

function parseDate(str) {
  if (!str) return null;
  // Try DD/MM/YYYY
  let m = String(str).match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/);
  if (m) return new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
  // Try YYYY-MM-DD
  m = String(str).match(/(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/);
  if (m) return new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]));
  // Try Date(TIMESTAMP)
  m = String(str).match(/Date\((\d+),(\d+),(\d+)\)/);
  if (m) return new Date(parseInt(m[1]), parseInt(m[2]), parseInt(m[3]));
  // Try natural parse
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function formatDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function togglePrintFullscreen() {
  document.body.classList.toggle('print-preview-mode');
}

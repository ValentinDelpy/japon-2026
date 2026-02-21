// =============================================
// PAGE RENDERERS
// Dashboard, Itinerary, Guides, Print
// =============================================

// Coordinates for mapping
var COORDS = {
  "tokyo": [35.6762, 139.6503], "shinjuku": [35.6938, 139.7034], "shibuya": [35.6580, 139.7016],
  "kyoto": [35.0116, 135.7681], "osaka": [34.6937, 135.5023], "hiroshima": [34.3853, 132.4553],
  "nara": [34.6851, 135.8048], "hakone": [35.2326, 139.1070], "nikko": [36.7199, 139.6982],
  "kamakura": [35.3192, 139.5467], "kanazawa": [36.5613, 136.6562], "takayama": [36.1461, 137.2522],
  "fuji": [35.3606, 138.7274], "kawaguchiko": [35.5139, 138.7553],
  "miyajima": [34.2960, 132.3198], "koyasan": [34.2131, 135.5833],
  "narita": [35.7720, 140.3929], "kobe": [34.6901, 135.1955],
  "yokohama": [35.4437, 139.6380], "nagoya": [35.1815, 136.9066],
  "fukuoka": [33.5902, 130.4017], "sapporo": [43.0618, 141.3545],
  "matsumoto": [36.2381, 137.9720], "shirakawago": [36.2574, 136.9060],
  "enoshima": [35.3003, 139.4800], "onomichi": [34.4090, 133.2050],
  "naoshima": [34.4618, 133.9955], "beppu": [33.2846, 131.4914],
  "kagoshima": [31.5966, 130.5571], "nagasaki": [32.7503, 129.8779]
};

function getCoords(placeName) {
  if (!placeName) return null;
  var norm = placeName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s\-]/g, "").trim();
  for (var key in COORDS) {
    if (norm.indexOf(key) !== -1 || key.indexOf(norm.split(/\s/)[0]) !== -1) {
      return COORDS[key];
    }
  }
  return null;
}

function parseBudget(str) {
  if (!str) return 0;
  var cleaned = String(str).replace(/[^0-9.,\-]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

function formatJPY(amount) {
  if (!amount && amount !== 0) return '—';
  return '¥' + Math.round(amount).toLocaleString('fr-FR');
}
function formatEUR(amount) {
  if (!amount && amount !== 0) return '—';
  return Number(amount).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
}

// ─── MAP UTILITY ───
var maps = {};
function createMap(containerId, steps, options) {
  options = options || {};
  if (maps[containerId]) {
    maps[containerId].remove();
    delete maps[containerId];
  }
  var container = document.getElementById(containerId);
  if (!container) return null;

  var map = L.map(containerId, { scrollWheelZoom: true, zoomControl: true });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OSM &copy; CARTO', maxZoom: 18
  }).addTo(map);

  var markers = [];
  var validSteps = [];
  var seen = {};
  steps.forEach(function(s) {
    var coords = getCoords(s.lieu);
    if (coords && !seen[s.lieu]) {
      seen[s.lieu] = true;
      validSteps.push(s);
    }
  });

  validSteps.forEach(function(step, idx) {
    var coords = getCoords(step.lieu);
    if (!coords) return;

    var icon = L.divIcon({
      className: 'custom-marker-wrapper',
      html: '<div class="custom-marker">' + (idx + 1) + '</div>',
      iconSize: [28, 28], iconAnchor: [14, 14]
    });
    var marker = L.marker(coords, { icon: icon }).addTo(map);

    // Always-visible label
    L.marker(coords, {
      icon: L.divIcon({
        className: 'marker-label-wrapper',
        html: '<div class="marker-label">' + step.lieu + '</div>',
        iconSize: [100, 20], iconAnchor: [-18, 10]
      }),
      interactive: false
    }).addTo(map);

    var popup = '<div class="popup-title">' + step.lieu + '</div>';
    if (step.jour) popup += '<div class="popup-dates">📅 ' + step.jour + '</div>';
    if (step.logement) popup += '<div class="popup-detail">🏨 ' + step.logement + '</div>';
    if (step.dureeTrajet) popup += '<div class="popup-detail">🚅 ' + step.dureeTrajet + '</div>';
    if (step.activites) popup += '<div class="popup-detail">🎯 ' + step.activites + '</div>';
    marker.bindPopup(popup);
    markers.push(coords);
  });

  // Route line
  if (markers.length > 1) {
    L.polyline(markers, { color: '#c73e1d', weight: 2.5, opacity: 0.6, dashArray: '8, 8' }).addTo(map);
  }
  if (markers.length > 0) {
    map.fitBounds(L.latLngBounds(markers), { padding: [40, 40] });
  } else {
    map.setView([36.2, 138.2], 6);
  }
  maps[containerId] = map;
  return map;
}

// ═══════════════════════════════════════════
// DASHBOARD PAGE
// ═══════════════════════════════════════════
function renderDashboard() {
  var steps = DataService.getSteps();
  var rate = DataService.exchangeRate;

  // Compute stats
  var totalBudgetJPY = 0;
  var totalTrajetJPY = 0;
  var uniquePlaces = [];
  var seenPlaces = {};
  var totalDays = steps.length;

  steps.forEach(function(s) {
    totalBudgetJPY += parseBudget(s.prix);
    totalTrajetJPY += parseBudget(s.prixTrajet);
    if (s.lieu && !seenPlaces[s.lieu]) {
      seenPlaces[s.lieu] = true;
      uniquePlaces.push(s.lieu);
    }
  });

  var grandTotalJPY = totalBudgetJPY + totalTrajetJPY;
  var grandTotalEUR = rate ? (grandTotalJPY / rate) : 0;
  var firstDay = steps.length > 0 ? steps[0].jour : '—';
  var lastDay = steps.length > 0 ? steps[steps.length - 1].jour : '—';

  var reservedCount = steps.filter(function(s) {
    return s.reserve && s.reserve.toLowerCase().indexOf('oui') !== -1;
  }).length;

  var html = '';
  html += '<div class="page-header">';
  html += '  <h1>Dashboard <span class="jp-accent" style="opacity:0.3;font-size:0.6em">旅の概要</span></h1>';
  html += '  <p class="subtitle">Vue d\'ensemble de votre voyage au Japon</p>';
  html += '</div>';

  // STATS ROW
  html += '<div class="stats-row">';
  html += '<div class="stat-card"><div class="stat-label">Destinations</div><div class="stat-value indigo">' + uniquePlaces.length + '</div><div class="stat-detail">' + totalDays + ' jours au total</div></div>';
  html += '<div class="stat-card"><div class="stat-label">Période</div><div class="stat-value teal" style="font-size:1.1rem">' + firstDay.split(' - ')[0] + ' → ' + lastDay.split(' - ')[0] + '</div><div class="stat-detail">' + totalDays + ' étapes</div></div>';
  html += '<div class="stat-card"><div class="stat-label">Budget logement</div><div class="stat-value vermillion">' + formatJPY(totalBudgetJPY) + '</div><div class="stat-detail">≈ ' + (rate ? formatEUR(totalBudgetJPY / rate) : '—') + '</div></div>';
  html += '<div class="stat-card"><div class="stat-label">Budget transport</div><div class="stat-value gold">' + formatJPY(totalTrajetJPY) + '</div><div class="stat-detail">≈ ' + (rate ? formatEUR(totalTrajetJPY / rate) : '—') + '</div></div>';
  html += '<div class="stat-card"><div class="stat-label">Taux EUR→JPY</div><div class="stat-value bamboo">' + (rate ? rate.toFixed(2) : '—') + '</div><div class="stat-detail">Réservé : ' + reservedCount + '/' + totalDays + '</div></div>';
  html += '</div>';

  // MAP + TIMELINE
  html += '<div class="dashboard-grid">';

  // Map
  html += '<div class="map-container"><div class="map-title-bar">🗾 Carte de l\'itinéraire</div><div id="dashboard-map"></div></div>';

  // Timeline
  html += '<div class="timeline-container"><div class="map-title-bar">📍 Étapes du voyage</div><div class="timeline-list">';
  steps.forEach(function(step, i) {
    if (!step.lieu) return;
    html += '<div class="timeline-item" onclick="highlightMapMarker(\'dashboard-map\',' + i + ')">';
    html += '<div class="timeline-number">' + (i + 1) + '</div>';
    html += '<div class="timeline-info">';
    html += '<div class="timeline-place">' + step.lieu + '</div>';
    html += '<div class="timeline-dates">' + step.jour + '</div>';
    html += '<div class="timeline-tags">';
    if (step.dureeTrajet) html += '<span class="tag transport">🚅 ' + step.dureeTrajet + '</span>';
    if (step.reserve) html += '<span class="tag nights">' + (step.reserve.toLowerCase().indexOf('oui') !== -1 ? '✅' : '⏳') + ' ' + step.reserve + '</span>';
    if (step.prix) html += '<span class="tag budget">' + formatJPY(parseBudget(step.prix)) + '</span>';
    html += '</div></div></div>';
  });
  html += '</div></div></div>';

  // BUDGET TABLE
  html += '<div class="budget-section mt-3"><div class="budget-grid">';
  html += '<div class="budget-table-wrap"><div class="map-title-bar">💰 Détail du budget</div><div class="table-scroll"><table class="budget-table">';
  html += '<thead><tr><th>#</th><th>Jour</th><th>Lieu</th><th>Logement ¥</th><th>Logement €</th><th>Transport ¥</th><th>Réservé</th></tr></thead><tbody>';
  steps.forEach(function(step, i) {
    if (!step.lieu) return;
    var pJPY = parseBudget(step.prix);
    var tJPY = parseBudget(step.prixTrajet);
    html += '<tr>';
    html += '<td>' + (i + 1) + '</td>';
    html += '<td class="text-sm">' + step.jour + '</td>';
    html += '<td>' + step.lieu + '</td>';
    html += '<td class="amount">' + (pJPY ? formatJPY(pJPY) : '—') + '</td>';
    html += '<td class="amount">' + (pJPY && rate ? formatEUR(pJPY / rate) : '—') + '</td>';
    html += '<td class="amount">' + (tJPY ? formatJPY(tJPY) : '—') + '</td>';
    html += '<td class="text-sm">' + (step.reserve || '—') + '</td>';
    html += '</tr>';
  });
  html += '<tr style="font-weight:700;background:var(--paper-warm)">';
  html += '<td></td><td></td><td>TOTAL</td>';
  html += '<td class="amount">' + formatJPY(totalBudgetJPY) + '</td>';
  html += '<td class="amount">' + (rate ? formatEUR(totalBudgetJPY / rate) : '—') + '</td>';
  html += '<td class="amount">' + formatJPY(totalTrajetJPY) + '</td>';
  html += '<td></td></tr></tbody></table></div></div>';

  // Budget bars
  html += '<div class="budget-summary"><h3>Répartition par ville</h3>' + generateBudgetBars(steps) + '</div>';
  html += '</div></div>';

  document.getElementById('page-container').innerHTML = html;
  setTimeout(function() { createMap('dashboard-map', steps); }, 100);
}

function generateBudgetBars(steps) {
  var byCity = {};
  steps.forEach(function(s) {
    if (!s.lieu) return;
    byCity[s.lieu] = (byCity[s.lieu] || 0) + parseBudget(s.prix) + parseBudget(s.prixTrajet);
  });
  var total = 0;
  for (var k in byCity) total += byCity[k];
  if (total === 0) return '<p class="text-muted text-sm">Aucune donnée budget</p>';

  var colors = ['#c73e1d', '#264653', '#2a9d8f', '#e9c46a', '#e76f51', '#606c38', '#2a6478', '#d4a843', '#40b5a6', '#789048'];
  var sorted = Object.entries(byCity).sort(function(a, b) { return b[1] - a[1]; });
  var result = '';
  sorted.forEach(function(entry, i) {
    var city = entry[0], amount = entry[1];
    var pct = (amount / total * 100).toFixed(1);
    result += '<div class="budget-bar-item">';
    result += '<div class="budget-bar-label"><span class="cat">' + city + '</span><span class="val">' + pct + '%</span></div>';
    result += '<div class="budget-bar"><div class="budget-bar-fill" style="width:' + pct + '%;background:' + colors[i % colors.length] + '"></div></div>';
    result += '</div>';
  });
  return result;
}

function highlightMapMarker(mapId, index) {
  var map = maps[mapId];
  if (!map) return;
  var steps = DataService.getSteps();
  if (index >= steps.length) return;
  var coords = getCoords(steps[index].lieu);
  if (coords) map.flyTo(coords, 10, { duration: 0.8 });
}

// ═══════════════════════════════════════════
// ITINERARY PAGE
// ═══════════════════════════════════════════
function renderItinerary() {
  var steps = DataService.getSteps();
  var cols = DataService.getCols();
  var rows = DataService.getRows();
  var rate = DataService.exchangeRate;

  // Stats by city
  var cityStats = {};
  steps.forEach(function(s) {
    if (!s.lieu) return;
    if (!cityStats[s.lieu]) cityStats[s.lieu] = { days: 0, budget: 0, transport: 0, activities: [], logements: [] };
    cityStats[s.lieu].days++;
    cityStats[s.lieu].budget += parseBudget(s.prix);
    cityStats[s.lieu].transport += parseBudget(s.prixTrajet);
    if (s.activites) cityStats[s.lieu].activities.push(s.activites);
    if (s.logement && cityStats[s.lieu].logements.indexOf(s.logement) === -1) cityStats[s.lieu].logements.push(s.logement);
  });

  var html = '';
  html += '<div class="page-header"><h1>Itinéraire <span class="jp-accent" style="opacity:0.3;font-size:0.6em">旅程</span></h1>';
  html += '<p class="subtitle">Détail complet de votre parcours au Japon</p></div>';

  // Map
  html += '<div class="map-container mb-2"><div class="map-title-bar">🗾 Tracé complet</div><div id="itinerary-map"></div></div>';

  // Raw data table
  html += '<div class="itinerary-full-table mt-2 mb-2">';
  html += '<div class="map-title-bar flex-between"><span>📋 Données du spreadsheet</span><span class="text-sm text-muted">' + rows.length + ' lignes</span></div>';
  html += '<div class="table-scroll"><table class="iti-table"><thead><tr>';
  cols.forEach(function(c) { html += '<th>' + c + '</th>'; });
  html += '</tr></thead><tbody>';
  rows.forEach(function(row) {
    html += '<tr>';
    cols.forEach(function(c) {
      var val = row[c] || '';
      var cl = c.toLowerCase();
      var cls = '';
      if (cl.indexOf('jour') !== -1 || cl.indexOf('date') !== -1) cls = 'row-date';
      if (cl.indexOf('lieu') !== -1) cls = 'row-place';
      if (cl.indexOf('prix') !== -1) cls = 'row-amount';
      html += '<td class="' + cls + '">' + val + '</td>';
    });
    html += '</tr>';
  });
  html += '</tbody></table></div></div>';

  // Summary cards
  html += '<div class="itinerary-summary-cards mt-2">';
  for (var city in cityStats) {
    var st = cityStats[city];
    html += '<div class="summary-card"><h3>📍 ' + city + '</h3><ul class="summary-list">';
    html += '<li><span class="s-label">Jours</span><span class="s-value">' + st.days + '</span></li>';
    html += '<li><span class="s-label">Logement ¥</span><span class="s-value">' + formatJPY(st.budget) + '</span></li>';
    if (rate) html += '<li><span class="s-label">Logement €</span><span class="s-value">' + formatEUR(st.budget / rate) + '</span></li>';
    html += '<li><span class="s-label">Transport ¥</span><span class="s-value">' + formatJPY(st.transport) + '</span></li>';
    if (st.logements.length > 0) html += '<li><span class="s-label">Hébergement</span><span class="s-value text-sm" style="font-family:\'DM Sans\';text-align:right;max-width:60%">' + st.logements.join(', ') + '</span></li>';
    if (st.activities.length > 0) html += '<li><span class="s-label">Activités</span><span class="s-value text-sm" style="font-family:\'DM Sans\';text-align:right;max-width:60%">' + st.activities.join(' / ') + '</span></li>';
    html += '</ul></div>';
  }
  html += '</div>';

  document.getElementById('page-container').innerHTML = html;
  setTimeout(function() { createMap('itinerary-map', steps); }, 100);
}

// ═══════════════════════════════════════════
// GUIDES PAGE
// ═══════════════════════════════════════════
function renderGuides() {
  var steps = DataService.getSteps();
  var uniquePlaces = [];
  var seen = {};

  steps.forEach(function(step) {
    if (!step.lieu) return;
    var key = step.lieu.toLowerCase().replace(/[→\-].*/g, '').trim();
    if (seen[key]) return;
    seen[key] = true;
    uniquePlaces.push(step);
  });

  var html = '<div class="page-header"><h1>Fiches Voyage <span class="jp-accent" style="opacity:0.3;font-size:0.6em">旅のガイド</span></h1>';
  html += '<p class="subtitle">Guides détaillés pour chaque destination</p></div>';
  html += '<div class="guides-grid">';

  uniquePlaces.forEach(function(step, i) {
    var dest = findDestination(step.lieu);
    html += '<div class="guide-card" onclick="openGuideDetail(\'' + encodeURIComponent(step.lieu) + '\')" style="animation-delay:' + (i * 0.08) + 's">';
    html += '<div class="guide-card-img" style="background-image:url(\'' + dest.image + '\')">';
    html += '<div class="guide-card-overlay">';
    html += '<h3>' + step.lieu + (dest.nameJP ? ' <span style="opacity:0.6;font-size:0.75em">' + dest.nameJP + '</span>' : '') + '</h3>';
    html += '<div class="guide-dates">' + step.jour + '</div>';
    html += '</div></div>';
    html += '<div class="guide-card-body">';
    html += '<p>' + dest.intro.substring(0, 160) + '...</p>';
    html += '<div class="guide-card-tags">';
    dest.highlights.slice(0, 3).forEach(function(h) {
      html += '<span class="guide-tag">' + h.substring(0, 35) + (h.length > 35 ? '…' : '') + '</span>';
    });
    html += '</div>';
    html += '<a class="guide-card-cta" href="javascript:void(0)">Voir la fiche complète →</a>';
    html += '</div></div>';
  });
  html += '</div>';

  document.getElementById('page-container').innerHTML = html;
}

function openGuideDetail(encodedName) {
  var name = decodeURIComponent(encodedName);
  var dest = findDestination(name);
  var steps = DataService.getSteps();
  var step = steps.find(function(s) { return s.lieu && s.lieu.toLowerCase().indexOf(name.toLowerCase()) !== -1; }) || {};

  var overlay = document.createElement('div');
  overlay.className = 'guide-detail-overlay';
  overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };

  var h = '';
  h += '<div class="guide-detail">';
  h += '<div class="guide-detail-hero" style="background-image:url(\'' + dest.image + '\')">';
  h += '<button class="guide-close" onclick="this.closest(\'.guide-detail-overlay\').remove()">&times;</button>';
  h += '<div class="guide-detail-hero-content">';
  h += '<h1>' + name + (dest.nameJP ? ' <span style="opacity:0.7;font-size:0.6em">' + dest.nameJP + '</span>' : '') + '</h1>';
  h += '<div class="dates">' + (step.jour || '') + '</div>';
  h += '</div></div>';
  h += '<div class="guide-detail-body">';

  // Presentation
  h += '<div class="guide-section"><h2>Présentation</h2><p>' + dest.intro + '</p></div>';

  // Your booking info
  if (step.logement || step.dureeTrajet || step.reserve) {
    h += '<div class="guide-infobox"><div class="info-title">📋 Votre réservation</div>';
    if (step.logement) h += '<p>🏨 <strong>' + step.logement + '</strong>' + (step.altLogement ? ' (alternative : ' + step.altLogement + ')' : '') + '</p>';
    if (step.prix) h += '<p>💰 ' + formatJPY(parseBudget(step.prix)) + (step.prixPersonne ? ' (' + step.prixPersonne + '/pers.)' : '') + '</p>';
    if (step.reserve) h += '<p>' + (step.reserve.toLowerCase().indexOf('oui') !== -1 ? '✅ Réservé' : '⏳ ' + step.reserve) + '</p>';
    if (step.dureeTrajet) h += '<p>🚅 Trajet : ' + step.dureeTrajet + (step.prixTrajet ? ' — ' + formatJPY(parseBudget(step.prixTrajet)) + '/pers.' : '') + '</p>';
    if (step.billetsRes) h += '<p>🎫 Billets : ' + step.billetsRes + '</p>';
    h += '</div>';
  }

  // Highlights
  h += '<div class="guide-section"><h2>À ne pas manquer</h2><ul>';
  dest.highlights.forEach(function(hl) { h += '<li>' + hl + '</li>'; });
  h += '</ul></div>';

  // Fun facts
  h += '<div class="guide-section"><h2>Le saviez-vous ?</h2>';
  dest.funFacts.forEach(function(f) {
    h += '<div class="guide-infobox" style="border-left-color:var(--teal)"><p>💡 ' + f + '</p></div>';
  });
  h += '</div>';

  // Restaurants
  h += '<div class="guide-section"><h2>Où manger</h2><div class="guide-restaurants">';
  dest.restaurants.forEach(function(r) {
    h += '<div class="resto-card"><div class="resto-name">' + r.name + '</div>';
    h += '<div class="resto-type">' + r.type + '</div>';
    h += '<div class="resto-desc">' + r.desc + '</div>';
    h += '<div class="resto-price">' + r.price + '</div></div>';
  });
  h += '</div></div>';

  // Tips
  if (dest.tips) {
    h += '<div class="guide-section"><h2>Conseils pratiques</h2>';
    h += '<div class="guide-infobox" style="border-left-color:var(--vermillion)"><div class="info-title">💡 Bon à savoir</div><p>' + dest.tips + '</p></div></div>';
  }

  // Activities from sheet
  if (step.activites) {
    h += '<div class="guide-section"><h2>Votre programme</h2><p>' + step.activites + '</p></div>';
  }
  if (step.infos) {
    h += '<div class="guide-section"><h2>Notes</h2><p>' + step.infos + '</p></div>';
  }

  h += '</div></div>';
  overlay.innerHTML = h;
  document.body.appendChild(overlay);
}

// ═══════════════════════════════════════════
// PRINT PAGE
// ═══════════════════════════════════════════
function renderPrint() {
  var steps = DataService.getSteps();
  var calendarData = buildCalendarData(steps);

  var html = '<div class="page-header"><h1>Impression <span class="jp-accent" style="opacity:0.3;font-size:0.6em">印刷</span></h1>';
  html += '<p class="subtitle">Calendrier et carte, optimisés pour l\'impression</p></div>';

  html += '<div class="print-actions no-print">';
  html += '<button class="btn btn-primary" onclick="window.print()">🖨️ Imprimer / PDF</button>';
  html += '<button class="btn btn-secondary" onclick="togglePrintFullscreen()">📄 Aperçu plein écran</button>';
  html += '</div>';

  // Map
  html += '<div class="print-map-section mb-2"><div class="map-title-bar">🗾 Carte</div><div id="print-map"></div></div>';

  // Calendar months
  calendarData.months.forEach(function(month) {
    html += '<div class="print-calendar mb-2"><div class="calendar-header">' + month.label + '</div>';
    html += '<div class="calendar-grid">';
    html += '<div class="calendar-day-header">Lun</div><div class="calendar-day-header">Mar</div><div class="calendar-day-header">Mer</div>';
    html += '<div class="calendar-day-header">Jeu</div><div class="calendar-day-header">Ven</div><div class="calendar-day-header">Sam</div><div class="calendar-day-header">Dim</div>';
    month.days.forEach(function(day) {
      if (!day) { html += '<div class="calendar-day empty"></div>'; return; }
      var events = calendarData.events[day.dateStr] || [];
      html += '<div class="calendar-day' + (day.isToday ? ' today' : '') + '">';
      html += '<div class="day-num">' + day.num + '</div>';
      events.forEach(function(e) {
        html += '<div class="day-event" title="' + e.lieu + '">' + e.lieu + '</div>';
        if (e.activites && !e.isStay) html += '<div class="day-transport">' + e.activites.substring(0, 30) + '</div>';
      });
      html += '</div>';
    });
    html += '</div></div>';
  });

  // Step list
  html += '<div class="itinerary-full-table mt-2"><div class="map-title-bar">📋 Liste des étapes</div>';
  html += '<div class="table-scroll"><table class="iti-table"><thead><tr>';
  html += '<th>#</th><th>Jour</th><th>Lieu</th><th>Logement</th><th>Activités</th><th>Transport</th><th>Réservé</th>';
  html += '</tr></thead><tbody>';
  steps.forEach(function(s, i) {
    if (!s.lieu) return;
    html += '<tr><td>' + (i + 1) + '</td>';
    html += '<td class="row-date">' + s.jour + '</td>';
    html += '<td class="row-place">' + s.lieu + '</td>';
    html += '<td class="text-sm">' + (s.logement || '—') + '</td>';
    html += '<td class="text-sm">' + (s.activites || '—') + '</td>';
    html += '<td class="text-sm">' + (s.dureeTrajet || '—') + '</td>';
    html += '<td class="text-sm">' + (s.reserve || '—') + '</td>';
    html += '</tr>';
  });
  html += '</tbody></table></div></div>';

  document.getElementById('page-container').innerHTML = html;
  setTimeout(function() { createMap('print-map', steps); }, 100);
}

function buildCalendarData(steps) {
  var dates = [];
  var events = {};

  steps.forEach(function(step) {
    if (!step.jour) return;
    var parsed = parseDate(step.jour);
    if (!parsed) return;
    var dateStr = formatDateStr(parsed);
    dates.push(parsed);
    if (!events[dateStr]) events[dateStr] = [];
    events[dateStr].push(step);
  });

  if (dates.length === 0) return { months: [], events: events };

  var minDate = new Date(Math.min.apply(null, dates));
  var maxDate = new Date(Math.max.apply(null, dates));
  maxDate.setDate(maxDate.getDate() + 2);

  var months = [];
  var current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);

  while (current <= maxDate) {
    var year = current.getFullYear();
    var month = current.getMonth();
    var monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    var firstDay = new Date(year, month, 1);
    var startPad = firstDay.getDay() - 1;
    if (startPad < 0) startPad = 6;
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var today = new Date();
    var todayStr = formatDateStr(today);
    var daysList = [];

    for (var i = 0; i < startPad; i++) daysList.push(null);
    for (var d = 1; d <= daysInMonth; d++) {
      var dt = new Date(year, month, d);
      var ds = formatDateStr(dt);
      daysList.push({ num: d, dateStr: ds, isToday: ds === todayStr });
    }
    months.push({ label: monthNames[month] + ' ' + year, days: daysList });
    current = new Date(year, month + 1, 1);
  }
  return { months: months, events: events };
}

function parseDate(str) {
  if (!str) return null;
  // Extract date part from "J1 - 15/03" or "15/03/2026" etc.
  var m = String(str).match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/);
  if (m) return new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
  m = String(str).match(/(\d{1,2})[\/\-.](\d{1,2})/);
  if (m) return new Date(2026, parseInt(m[2]) - 1, parseInt(m[1]));  // Default year 2026
  m = String(str).match(/(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/);
  if (m) return new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]));
  m = String(str).match(/Date\((\d+),(\d+),(\d+)\)/);
  if (m) return new Date(parseInt(m[1]), parseInt(m[2]), parseInt(m[3]));
  return null;
}

function formatDateStr(date) {
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
}

function togglePrintFullscreen() {
  document.body.classList.toggle('print-preview-mode');
}

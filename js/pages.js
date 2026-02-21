// =============================================
// PAGE RENDERERS — Little Domo Very Arigato v3.5
// =============================================

var STOP_COLORS = ['#c73e1d','#264653','#2a9d8f','#d4a843','#e76f51','#606c38','#2a6478','#c47e7e','#40b5a6','#789048'];

var COORDS = {
  "tokyo":[35.6762,139.6503],"shinjuku":[35.6938,139.7034],"shibuya":[35.6580,139.7016],
  "kyoto":[35.0116,135.7681],"osaka":[34.6937,135.5023],"hiroshima":[34.3853,132.4553],
  "nara":[34.6851,135.8048],"hakone":[35.2326,139.1070],"nikko":[36.7199,139.6982],
  "kamakura":[35.3192,139.5467],"kanazawa":[36.5613,136.6562],"takayama":[36.1461,137.2522],
  "fuji":[35.3606,138.7274],"kawaguchiko":[35.5139,138.7553],
  "miyajima":[34.2960,132.3198],"koyasan":[34.2131,135.5833],
  "narita":[35.7720,140.3929],"kobe":[34.6901,135.1955],
  "yokohama":[35.4437,139.6380],"nagoya":[35.1815,136.9066],
  "shirakawago":[36.2574,136.9060],"shirakawa":[36.2574,136.9060],
  "magome":[35.5314,137.5600],"tsumago":[35.5314,137.5600],"toulouse":[43.6047,1.4442]
};

function getCoords(name) {
  if (!name) return null;
  var n = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9\s]/g,"").trim();
  for (var k in COORDS) { if (n.includes(k) || k.includes(n.split(/\s/)[0])) return COORDS[k]; }
  return null;
}

function parseBudget(str) { if (!str) return 0; return parseFloat(String(str).replace(/[^0-9.,\-]/g,'').replace(',','.')) || 0; }
function formatEURint(v) { var n = parseFloat(v); if (isNaN(n) || !v) return '—'; return n.toLocaleString('fr-FR',{minimumFractionDigits:0,maximumFractionDigits:0}) + ' €'; }
function formatDateFR(d) {
  if (!d) return '';
  var days = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
  var months = ['jan','fév','mar','avr','mai','juin','juil','août','sep','oct','nov','déc'];
  return days[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()];
}
function formatDateRange(g) {
  if (!g.startDate) return '';
  var s = formatDateFR(g.startDate);
  if (!g.endDate || g.endDate.getTime() === g.startDate.getTime()) return s;
  var e = formatDateFR(g.endDate);
  var days = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
  if (g.startDate.getMonth() === g.endDate.getMonth()) { s = days[g.startDate.getDay()] + ' ' + g.startDate.getDate(); }
  return s + ' → ' + e;
}
function nightsLabel(g) { var n = g.nights || 0; if (!n) return '1 nuit'; return (n+1) + ' nuit' + (n > 0 ? 's' : ''); }
function formatBool(v) {
  if (!v) return '';
  var s = String(v).trim().toLowerCase();
  if (s === 'true' || s === 'oui' || s === 'yes') return '✅';
  if (s === 'false' || s === 'non' || s === 'no') return '❌';
  return v;
}
function formatCellBool(v) {
  if (!v) return '';
  var s = String(v).trim().toLowerCase();
  if (s === 'true') return '✅';
  if (s === 'false') return '❌';
  return v;
}

function linkify(text) {
  if (!text) return '';
  var s = String(text);
  var href = DataService.linkMap[s.trim()];
  if (href) return '<a href="'+href+'" target="_blank" rel="noopener" class="cell-link">'+s+'</a>';
  return s.replace(/(https?:\/\/[^\s<>"']+)/g, function(url) {
    var display = url.length > 40 ? url.substring(0,38)+'…' : url;
    return '<a href="'+url+'" target="_blank" rel="noopener" class="cell-link">'+display+'</a>';
  });
}
function getLodgeLink(text) {
  if (!text) return null;
  const s = String(text).trim();
  const lm = DataService.linkMap;
  if (!lm || Object.keys(lm).length === 0) return null;

  // 1. Exact match
  if (lm[s]) return lm[s];

  // 2. Case-insensitive exact
  const sl = s.toLowerCase();
  if (lm[sl]) return lm[sl];

  // 3. Fuzzy: find a key that starts with the same 15+ chars (handles truncation)
  const prefix = sl.substring(0, Math.min(15, sl.length));
  for (const k in lm) {
    const kl = k.toLowerCase();
    if (kl.startsWith(prefix) || prefix.startsWith(kl.substring(0, Math.min(15, kl.length)))) {
      return lm[k];
    }
  }

  // 4. Word overlap: check if 2+ significant words match
  const words = sl.split(/\s+/).filter(w => w.length > 3);
  if (words.length >= 1) {
    for (const k in lm) {
      const kl = k.toLowerCase();
      const matchCount = words.filter(w => kl.includes(w)).length;
      if (matchCount >= Math.min(2, words.length)) return lm[k];
    }
  }

  return null;
}

function renderLodgeLink(text, badgeHtml, priceHtml) {
  if (!text) return '';
  const href = getLodgeLink(text);
  if (href) {
    return `<a class="lodge-option main-opt" href="${href}" target="_blank" rel="noopener" onclick="event.stopPropagation()">${badgeHtml}<span class="lodge-name">${text}</span>${priceHtml||''}<span class="lodge-arrow">→</span></a>`;
  }
  return `<div class="lodge-option main-opt no-link">${badgeHtml}<span class="lodge-name">${text}</span>${priceHtml||''}<span class="lodge-arrow" style="opacity:0.25">→</span></div>`;
}

function getTravelGroups() {
  return DataService.getGroups().filter(function(g) {
    if (!g.city) return false;
    return !/aéroport|airport/i.test(g.city);
  });
}

var ACTIVITY_DESTINATIONS = {
  'shirakawa': {city:'Shirakawa-go', key:'takayama'},
  'shirakawa-go': {city:'Shirakawa-go', key:'takayama'},
  'nara': {city:'Nara', key:'nara'},
  'miyajima': {city:'Miyajima', key:'miyajima'},
  'hakone': {city:'Hakone', key:'hakone'},
  'nikko': {city:'Nikkō', key:'nikko'},
  'kamakura': {city:'Kamakura', key:'kamakura'},
  'koyasan': {city:'Kōya-san', key:'koyasan'},
  'koya-san': {city:'Kōya-san', key:'koyasan'},
  'fuji': {city:'Mont Fuji', key:'fuji'},
};

function extractSubDestinations(groups) {
  var found = {};
  groups.forEach(function(g) {
    var acts = Array.isArray(g.activites) ? g.activites : (g.activites ? [g.activites] : []);
    acts.forEach(function(actStr) {
      var parts = actStr.split(/[,\/·]/);
      parts.forEach(function(part) {
        var p = part.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s-]/g,'').trim();
        for (var key in ACTIVITY_DESTINATIONS) {
          if (p.includes(key) && !found[key] && !groups.find(function(gg){ return gg.city && gg.city.toLowerCase().includes(ACTIVITY_DESTINATIONS[key].city.toLowerCase()); })) {
            found[key] = { city: ACTIVITY_DESTINATIONS[key].city, parentCity: g.city, startDate: g.startDate, endDate: g.startDate,
              dates: [g.startDate], activites: [part.trim()], nights: 0, logement:'', altLogement:'', prix:'', prixPersonne:'',
              reserve:'', dureeTrajet:'', prixTrajet:'', billetsRes:'', infos:'', isSubDest: true };
          }
        }
      });
    });
  });
  return Object.values(found);
}

// ═══ MAP ENGINE ═══
var maps = {};
var _dashState = { activeIdx: null, expandedIdx: null, markers: [], groups: [] };

function createMap(containerId, steps) {
  if (maps[containerId]) { maps[containerId].remove(); delete maps[containerId]; }
  var el = document.getElementById(containerId);
  if (!el) return null;
  var map = L.map(containerId, {scrollWheelZoom:true,zoomControl:true});
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{attribution:'© OSM © CARTO',maxZoom:18}).addTo(map);
  var pts = [], seen = {};
  steps.forEach(function(g, idx) {
    var coords = getCoords(g.city || g.lieu);
    if (!coords || seen[g.city || g.lieu]) return;
    seen[g.city || g.lieu] = true;
    var icon = L.divIcon({className:'custom-marker-wrapper',html:'<div class="custom-marker">'+(idx+1)+'</div>',iconSize:[28,28],iconAnchor:[14,14]});
    var marker = L.marker(coords,{icon:icon}).addTo(map);
    L.marker(coords,{icon:L.divIcon({className:'marker-label-wrapper',html:'<div class="marker-label">'+(g.city||g.lieu)+'</div>',iconSize:[100,20],iconAnchor:[-18,10]}),interactive:false}).addTo(map);
    var dest = findDestination(g.city || g.lieu);
    var popup = '<div class="popup-card"><div class="popup-img" style="background-image:url(\''+dest.image+'\')" data-dest-key="'+(dest._destKey||'_default')+'"></div><div class="popup-body">';
    popup += '<div class="popup-title">'+(g.city||g.lieu);
    if (dest.nameJP) popup += ' <span class="popup-jp">'+dest.nameJP+'</span>';
    popup += '</div>';
    if (g.startDate) popup += '<div class="popup-dates">📅 '+formatDateRange(g)+'</div>';
    if (g.logement) popup += '<div class="popup-detail">🏨 '+g.logement+'</div>';
    if (g.dureeTrajet) popup += '<div class="popup-detail">🚄 '+g.dureeTrajet+'</div>';
    var acts = Array.isArray(g.activites) ? g.activites.filter(function(a){return a.trim();}) : [];
    if (acts.length) popup += '<div class="popup-detail popup-activities">📍 '+acts.slice(0,3).join(' · ')+'</div>';
    popup += '<a class="popup-cta" onclick="openGuideDetail(\''+encodeURIComponent(g.city||g.lieu)+'\')" href="javascript:void(0)">Voir la fiche →</a>';
    popup += '</div></div>';
    marker.bindPopup(popup,{maxWidth:280,className:'custom-popup'});
    // Centre la carte sur le marqueur au clic + ouvre le popup
    (function(c) {
      marker.on('click', function() {
        var m = maps[containerId];
        if (m) m.flyTo(c, Math.max(m.getZoom(), 11), {duration:0.8, easeLinearity:0.4});
      });
    })(coords);
    pts.push(coords);
  });
  if (pts.length > 1) L.polyline(pts,{color:'#c73e1d',weight:2.5,opacity:0.6,dashArray:'8,8'}).addTo(map);
  if (pts.length) map.fitBounds(L.latLngBounds(pts),{padding:[40,40]});
  else map.setView([36.2,138.2],6);
  maps[containerId] = map;
  return map;
}

function makeStopIcon(label, color, active) {
  var size = active ? 34 : 28;
  return L.divIcon({className:'custom-marker-wrapper',
    html:'<div class="custom-marker" style="background:'+color+';width:'+size+'px;height:'+size+'px;font-size:'+(active?'0.8':'0.68')+'rem;box-shadow:0 2px 10px '+color+'50">'+label+'</div>',
    iconSize:[size,size],iconAnchor:[size/2,size/2]});
}

function createDashboardMap(groups) {
  if (maps['dashboard-map']) { maps['dashboard-map'].remove(); delete maps['dashboard-map']; }
  var el = document.getElementById('dashboard-map');
  if (!el) return null;
  var map = L.map('dashboard-map', {scrollWheelZoom:true,zoomControl:true});
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{attribution:'© OSM © CARTO',maxZoom:18}).addTo(map);
  maps['dashboard-map'] = map;
  _dashState.markers = [];
  var pts = [], seen = {};

  // Pre-compute coordinate usage to offset overlapping markers
  var coordUse = {};
  groups.forEach(function(g) {
    var c = getCoords(g.city);
    if (!c) return;
    var key = c[0].toFixed(3)+','+c[1].toFixed(3);
    if (!coordUse[key]) coordUse[key] = 0;
    coordUse[key]++;
  });
  var coordIdx = {};

  groups.forEach(function(g, idx) {
    var coords = getCoords(g.city);
    var color = STOP_COLORS[idx % STOP_COLORS.length];
    if (!coords || seen[g.city]) { _dashState.markers.push(null); return; }
    seen[g.city] = true;
    // Offset overlapping markers in a circle
    var key = coords[0].toFixed(3)+','+coords[1].toFixed(3);
    if (!coordIdx[key]) coordIdx[key] = 0;
    if (coordUse[key] > 1) {
      var angle = (coordIdx[key] / coordUse[key]) * 2 * Math.PI;
      var offset = 0.015;
      coords = [coords[0] + Math.cos(angle)*offset, coords[1] + Math.sin(angle)*offset];
      coordIdx[key]++;
    }
    var marker = L.marker(coords, {icon: makeStopIcon(idx+1, color, false)}).addTo(map);
    L.marker(coords,{icon:L.divIcon({className:'marker-label-wrapper',html:'<div class="marker-label">'+g.city+'</div>',iconSize:[100,20],iconAnchor:[-18,10]}),interactive:false}).addTo(map);

    var dest = findDestination(g.city);
    var acts = Array.isArray(g.activites) ? g.activites.filter(function(a){return a.trim();}) : [];
    var wx = g.startDate ? getWeatherForDate(g.city, g.startDate) : null;
    var popup = '<div class="popup-card">';
    popup += '<div class="popup-img" style="background-image:url(\''+dest.image+'\');position:relative" data-dest-key="'+(dest._destKey||'_default')+'">';
    popup += '<div style="position:absolute;bottom:0;left:0;right:0;padding:8px 10px;background:linear-gradient(transparent,rgba(0,0,0,0.65));color:#fff;font-family:\'Shippori Mincho\',serif;font-size:0.88rem;font-weight:700">'+g.city+(dest.nameJP ? ' <span style="font-size:0.7em;opacity:0.8">'+dest.nameJP+'</span>' : '')+'</div>';
    popup += '</div>';
    popup += '<div class="popup-body">';
    if (g.startDate) popup += '<div class="popup-dates">📅 '+formatDateRange(g)+' · '+nightsLabel(g)+'</div>';
    if (g.logement) { var _lh=getLodgeLink(g.logement); popup += '<div class="popup-detail">🏨 '+(_lh?'<a href="'+_lh+'" target="_blank" class="cell-link">'+g.logement+'</a>':g.logement)+'</div>'; }
    if (g.dureeTrajet) popup += '<div class="popup-detail">🚄 '+g.dureeTrajet+(parseBudget(g.prixTrajet)?' · '+formatEURint(parseBudget(g.prixTrajet))+'/pers':'')+'</div>';
    if (acts.length) popup += '<div class="popup-detail popup-activities">📍 '+acts.slice(0,3).join(' · ')+'</div>';
    if (wx) popup += '<div class="popup-detail">'+wx.icon+' '+wx.high+'°C / '+wx.low+'°C</div>';
    popup += '<a class="popup-cta" onclick="openGuideDetail(\''+encodeURIComponent(g.city)+'\')" href="javascript:void(0)">Voir la fiche complète →</a>';
    popup += '</div></div>';
    marker.bindPopup(popup, {maxWidth:280, className:'custom-popup'});

    (function(capturedIdx, capturedColor) {
      marker.on('click', function() { activateDashStop(capturedIdx); });
      _dashState.markers.push({marker:marker, coords:coords, color:capturedColor});
    })(idx, color);
    pts.push(coords);
  });

  if (pts.length > 1) L.polyline(pts,{color:'#c73e1d',weight:2.5,opacity:0.6,dashArray:'8,8'}).addTo(map);
  if (pts.length) map.fitBounds(L.latLngBounds(pts),{padding:[40,40]});
  else map.setView([36.2,138.2],6);
  return map;
}

function activateDashStop(idx) {
  var groups = _dashState.groups;
  if (_dashState.activeIdx !== null && _dashState.activeIdx !== idx) {
    var prevCard = document.getElementById('dc-'+_dashState.activeIdx);
    if (prevCard) prevCard.classList.remove('active');
    var prevM = _dashState.markers[_dashState.activeIdx];
    if (prevM) prevM.marker.setIcon(makeStopIcon(_dashState.activeIdx+1, prevM.color, false));
  }
  _dashState.activeIdx = idx;
  var card = document.getElementById('dc-'+idx);
  if (card) {
    card.classList.add('active');
    // Center the card in the stops-list panel using getBoundingClientRect
    var list = document.getElementById('stops-list');
    if (list) {
      var listRect = list.getBoundingClientRect();
      var cardRect = card.getBoundingClientRect();
      // cardRect is relative to viewport; compute offset relative to list content
      var cardOffsetInList = cardRect.top - listRect.top + list.scrollTop;
      var scrollTarget = cardOffsetInList - (list.clientHeight / 2) + (card.offsetHeight / 2);
      list.scrollTo({ top: Math.max(0, scrollTarget), behavior: 'smooth' });
    }
  }
  var lm = _dashState.markers[idx];
  if (lm) {
    lm.marker.setIcon(makeStopIcon(idx+1, lm.color, true));
    var map = maps['dashboard-map'];
    if (map) { map.flyTo(lm.coords, 11, {duration:1.2,easeLinearity:0.3}); setTimeout(function(){ lm.marker.openPopup(); }, 900); }
  }
}

function toggleDashCard(idx, e) {
  if (e) e.stopPropagation();
  var card = document.getElementById('dc-'+idx);
  if (!card) return;
  if (_dashState.expandedIdx !== null && _dashState.expandedIdx !== idx) {
    var prev = document.getElementById('dc-'+_dashState.expandedIdx);
    if (prev) prev.classList.remove('expanded');
  }
  var wasExpanded = card.classList.contains('expanded');
  card.classList.toggle('expanded', !wasExpanded);
  _dashState.expandedIdx = wasExpanded ? null : idx;
  if (!wasExpanded) {
    activateDashStop(idx);
    setTimeout(function(){
      var list = document.getElementById('stops-list');
      if (list && card) {
        var listRect = list.getBoundingClientRect();
        var cardRect = card.getBoundingClientRect();
        var cardOffsetInList = cardRect.top - listRect.top + list.scrollTop;
        var scrollTarget = cardOffsetInList - (list.clientHeight / 2) + (card.offsetHeight / 2);
        list.scrollTo({ top: Math.max(0, scrollTarget), behavior: 'smooth' });
      }
    }, 80);
  } else {
    // Reset: deactivate card highlight and reset map to overview
    card.classList.remove('active');
    var lm = _dashState.markers[idx];
    if (lm) lm.marker.setIcon(makeStopIcon(idx+1, lm.color, false));
    _dashState.activeIdx = null;
    // Fit map back to all points
    var map = maps['dashboard-map'];
    if (map) {
      var pts = [];
      _dashState.markers.forEach(function(m){ if(m) pts.push(m.coords); });
      if (pts.length) map.flyToBounds(L.latLngBounds(pts), {padding:[40,40], duration:0.8});
    }
  }
}

// ═══ DASHBOARD ═══
function renderDashboard() {
  var groups = getTravelGroups();
  _dashState.groups = groups;
  _dashState.activeIdx = null;
  _dashState.expandedIdx = null;
  _dashState.markers = [];

  var totalBudget=0, totalTrajet=0, seen={}, places=[];
  groups.forEach(function(g) {
    totalBudget += parseBudget(g.prix);
    totalTrajet += parseBudget(g.prixTrajet);
    if (g.city && !seen[g.city]) { seen[g.city]=true; places.push(g.city); }
  });
  var grand = totalBudget + totalTrajet;
  var first = groups.length ? formatDateFR(groups[0].startDate) : '—';
  var last  = groups.length ? formatDateFR(groups[groups.length-1].endDate||groups[groups.length-1].startDate) : '—';
  var resCnt = groups.filter(function(g){ return g.reserve && /oui|true/i.test(g.reserve); }).length;

  var html = '<div class="page-header"><h1>Dashboard <span class="jp-accent" style="opacity:0.3;font-size:0.6em">旅の概要</span></h1>';
  html += '<p class="subtitle">Toulouse → Tokyo · Nov — Déc 2026 · 4 personnes</p></div>';
  html += '<div class="stats-row">';
  html += '<div class="stat-card"><div class="stat-label">Destinations</div><div class="stat-value indigo">'+places.length+'</div><div class="stat-detail">'+groups.length+' étapes</div></div>';
  html += '<div class="stat-card"><div class="stat-label">Période</div><div class="stat-value teal" style="font-size:0.9rem">'+first+'<br>'+last+'</div></div>';
  html += '<div class="stat-card"><div class="stat-label">Budget logement</div><div class="stat-value vermillion" style="font-size:1.05rem">'+formatEURint(totalBudget)+'</div></div>';
  html += '<div class="stat-card"><div class="stat-label">Budget transport</div><div class="stat-value gold" style="font-size:1.05rem">'+formatEURint(totalTrajet)+'</div></div>';
  html += '<div class="stat-card"><div class="stat-label">Total estimé</div><div class="stat-value bamboo" style="font-size:1rem">'+formatEURint(grand)+'</div><div class="stat-detail">Réservé : '+resCnt+'/'+groups.length+'</div></div>';
  html += '</div>';

  html += '<div class="dashboard-grid dash-split">';
  html += '<div class="map-container"><div class="map-title-bar">🗾 Carte de l\'itinéraire</div><div id="dashboard-map"></div></div>';
  html += '<div class="stops-panel"><div class="stops-panel-header"><span class="stops-panel-title">Étapes <span class="stops-count">'+groups.length+'</span></span><span class="stops-panel-hint">cliquer pour détailler</span></div><div class="stops-list" id="stops-list"></div></div>';
  html += '</div>';

  html += '<div class="budget-section mt-3"><div class="budget-grid">';
  html += '<div class="budget-table-wrap"><div class="map-title-bar">💰 Détail du budget</div><div class="table-scroll"><table class="budget-table">';
  html += '<thead><tr><th>#</th><th>Dates</th><th>Lieu</th><th>Logement</th><th>Transport</th><th>Réservé</th></tr></thead><tbody>';
  groups.forEach(function(g,i) {
    if (!g.city) return;
    var p=parseBudget(g.prix), t=parseBudget(g.prixTrajet);
    html += '<tr><td>'+(i+1)+'</td><td class="text-sm">'+formatDateRange(g)+'</td><td>'+g.city+'</td>';
    html += '<td class="amount">'+(p?formatEURint(p):'—')+'</td><td class="amount">'+(t?formatEURint(t):'—')+'</td>';
    html += '<td class="text-sm">'+formatBool(g.reserve)+(g.billetsRes ? ' · 🎫 '+formatBool(g.billetsRes) : '')+'</td></tr>';
  });
  var totB=0,totT=0; groups.forEach(function(g){totB+=parseBudget(g.prix);totT+=parseBudget(g.prixTrajet);});
  html += '<tr style="font-weight:700;background:var(--surface2)"><td colspan="3">TOTAL</td><td class="amount">'+formatEURint(totB)+'</td><td class="amount">'+formatEURint(totT)+'</td><td></td></tr>';
  html += '</tbody></table></div></div>';
  html += '<div class="budget-summary"><h3>Répartition par ville</h3>'+generateBudgetBars(groups)+'</div>';
  html += '</div></div>';

  document.getElementById('page-container').innerHTML = html;
  buildDashboardCards(groups);
  setTimeout(function(){ createDashboardMap(groups); _repairBrokenImages(); }, 100);
}

function buildDashboardCards(groups) {
  var listEl = document.getElementById('stops-list');
  if (!listEl) return;
  var months = ['jan','fév','mar','avr','mai','juin','juil','août','sep','oct','nov','déc'];

  groups.forEach(function(g, i) {
    var color = STOP_COLORS[i % STOP_COLORS.length];
    var card = document.createElement('div');
    card.className = 'stop-card';
    card.id = 'dc-'+i;
    card.style.animationDelay = (i * 0.07)+'s';

    var qChips = [];
    var pPers = parseBudget(g.prixPersonne);
    if (pPers) qChips.push('<span class="quick-chip" style="background:'+color+'18;color:'+color+';border:1px solid '+color+'30">🏠 '+formatEURint(pPers)+'/pers</span>');
    if (g.dureeTrajet) qChips.push('<span class="quick-chip qc-sky">🚄 '+g.dureeTrajet+'</span>');
    var acts = Array.isArray(g.activites) ? g.activites.filter(function(a){return a.trim();}) : [];
    if (acts.length) qChips.push('<span class="quick-chip qc-sage">📍 '+acts.length+' activité'+(acts.length>1?'s':'')+'</span>');
    var wx = g.startDate ? getWeatherForDate(g.city, g.startDate) : null;
    if (wx) qChips.push('<span class="quick-chip qc-amber">'+wx.icon+' ~'+wx.high+'°C</span>');
    if (g.reserve && /oui|true/i.test(g.reserve)) qChips.push('<span class="quick-chip qc-green">✅ Réservé</span>');

    var mainOpt = g.logement ? renderLodgeLink(g.logement,
      '<span class="lodge-badge">Choix 1</span>',
      parseBudget(g.prix) ? '<span class="lodge-price">'+formatEURint(parseBudget(g.prix))+'</span>' : null) : '';

    var altHref = getLodgeLink(g.altLogement);
    var altOpt = g.altLogement ? (altHref
      ? `<a class="lodge-option alt-opt" href="${altHref}" target="_blank" rel="noopener" onclick="event.stopPropagation()"><span class="lodge-badge badge-alt">Alt.</span><span class="lodge-name">${g.altLogement}</span><span class="lodge-arrow">→</span></a>`
      : `<div class="lodge-option alt-opt no-link"><span class="lodge-badge badge-alt">Alt.</span><span class="lodge-name">${g.altLogement}</span><span class="lodge-arrow" style="opacity:0.25">→</span></div>`
    ) : '';

    var resLine = '';
    if (g.reserve) {
      var resText = /oui|true/i.test(g.reserve) ? '✅ Réservé' : '⏳ Non réservé';
      var bilText = g.billetsRes ? (/oui|true/i.test(g.billetsRes) ? ' · 🎫 Billets OK' : ' · 🎫 '+g.billetsRes) : '';
      resLine = '<div class="gd-reserve" style="font-size:0.72rem;padding:6px 12px;opacity:0.8">'+resText+bilText+'</div>';
    }

    var actPills = acts.map(function(a){ return '<span class="activity-pill">'+a+'</span>'; }).join('');

    var weatherMini = '';
    if (g.dates && g.dates.length > 0) {
      var dayPills = g.dates.map(function(d) {
        var w = getWeatherForDate(g.city, d);
        if (!w) return '';
        return '<div class="wx-day-pill"><div class="wx-dp-date">'+d.getDate()+' '+months[d.getMonth()]+'</div>'+
          '<div class="wx-dp-icon">'+w.icon+'</div><div class="wx-dp-high">'+w.high+'°</div>'+
          '<div class="wx-dp-low">'+w.low+'°</div><div class="wx-dp-rain">💧'+w.rain+'%</div></div>';
      }).join('');
      var wxDesc = wx ? wx.desc : '';
      weatherMini = '<div class="weather-mini-section"><div class="lodge-title">Météo (historique)</div>'+
        '<div class="wx-day-row">'+dayPills+'</div>'+
        (wxDesc ? '<div class="wx-desc">'+wxDesc+'</div>' : '')+'</div>';
    }

    var pTrajet = parseBudget(g.prixTrajet);
    var trajetRow = g.dureeTrajet ? '<div class="detail-row">'+
      '<div class="detail-icon" style="background:#e8f4f8">🚄</div>'+
      '<div class="detail-content"><div class="detail-label">Trajet</div>'+
      '<div class="detail-value">'+g.dureeTrajet+(pTrajet ? ' · <strong>'+formatEURint(pTrajet)+'/pers</strong>' : '')+'</div></div></div>' : '';

    var noteRow = g.infos ? '<div class="detail-row">'+
      '<div class="detail-icon" style="background:#fef3e2">✦</div>'+
      '<div class="detail-content"><div class="detail-label">Note</div>'+
      '<div class="detail-value" style="font-style:italic;opacity:0.8">'+linkify(g.infos)+'</div></div></div>' : '';

    card.innerHTML = '<div class="card-strip" style="background:'+color+'"></div>'+
      '<div class="card-head-row" onclick="toggleDashCard('+i+', event)">'+
        '<div class="card-num-city">'+
          '<div class="card-num" style="color:'+color+'">Étape '+String(i+1).padStart(2,'0')+'</div>'+
          '<div class="card-city">'+g.city+'</div>'+
        '</div>'+
        '<div class="card-right">'+
          '<div class="card-dates">'+formatDateRange(g)+'</div>'+
          '<div class="card-expand-btn"><span class="arrow">▾</span></div>'+
        '</div>'+
      '</div>'+
      (qChips.length ? '<div class="card-quick">'+qChips.join('')+'</div>' : '')+
      '<div class="card-body"><div class="card-body-inner">'+
        ((mainOpt||altOpt) ? '<div class="lodge-section"><div class="lodge-title">Hébergement</div><div class="lodge-options">'+mainOpt+altOpt+'</div>'+resLine+'</div>' : '')+
        (actPills ? '<div class="act-section"><div class="lodge-title">Activités</div><div class="activity-pills">'+actPills+'</div></div>' : '')+
        weatherMini+trajetRow+noteRow+
      '</div></div>';

    card.addEventListener('click', function(e) {
      if (!e.target.closest('.lodge-option') && !e.target.closest('.card-head-row')) activateDashStop(i);
    });
    listEl.appendChild(card);
  });
}

function generateBudgetBars(groups) {
  var by={};
  groups.forEach(function(g){ if(g.city) by[g.city]=(by[g.city]||0)+parseBudget(g.prix)+parseBudget(g.prixTrajet); });
  var total=Object.values(by).reduce(function(a,b){return a+b;},0);
  if (!total) return '<p class="text-muted text-sm">Aucune donnée budget</p>';
  return Object.entries(by).sort(function(a,b){return b[1]-a[1];}).map(function(e,i){
    var pct=(e[1]/total*100).toFixed(1);
    return '<div class="budget-bar-item"><div class="budget-bar-label"><span class="cat">'+e[0]+'</span><span class="val">'+pct+'% · '+formatEURint(e[1])+'</span></div>'+
           '<div class="budget-bar"><div class="budget-bar-fill" style="width:'+pct+'%;background:'+STOP_COLORS[i%STOP_COLORS.length]+'"></div></div></div>';
  }).join('');
}

// ═══ ITINERAIRE ═══
function renderItinerary() {
  var groups = getTravelGroups();
  var cols = DataService.getCols();
  var rows = DataService.getRows();
  var rate = DataService.exchangeRate;

  var html = '<div class="page-header"><h1>Itinéraire <span class="jp-accent" style="opacity:0.3;font-size:0.6em">旅程</span></h1>';
  html += '<p class="subtitle">Détail complet de votre parcours</p></div>';
  html += '<div class="map-container mb-2"><div class="map-title-bar">🗾 Tracé complet</div><div id="itinerary-map"></div></div>';
  html += renderConverterCard(rate);

  var dateCol = cols.find(function(c){return /jour|date|day/i.test(c);}) || cols[0] || '';
  var cutoffDate = new Date(2026, 11, 5);

  function getRowDate(row) { var v = String(row[dateCol]||'').trim(); return DataService.parseDate(v); }
  function isDateRow(row) { return /\d{1,2}[\/\-]\d{1,2}/.test(String(row[dateCol]||'').trim()); }
  function hasContent(row) { return cols.some(function(c){return row[c]&&String(row[c]).trim();}); }

  var mainRows = rows.filter(function(r) { if (!isDateRow(r)) return false; var d=getRowDate(r); return d && d<=cutoffDate; });
  var extraRows = rows.filter(function(r) { if (!hasContent(r)) return false; if (!isDateRow(r)) return true; var d=getRowDate(r); return d && d>cutoffDate; });

  html += '<div class="itinerary-full-table mt-2 mb-2">';
  html += '<div class="map-title-bar flex-between"><span>📋 Données du spreadsheet</span><span class="text-sm text-muted">'+mainRows.length+' lignes</span></div>';
  html += '<div class="table-scroll"><table class="iti-table"><thead><tr>';
  cols.forEach(function(c){html+='<th>'+c+'</th>';});
  html += '</tr></thead><tbody>';
  mainRows.forEach(function(row) {
    html += '<tr>';
    cols.forEach(function(c) {
      var v = row[c]||'';
      var cls = /jour|date/i.test(c) ? 'row-date' : (/lieu|ville/i.test(c) ? 'row-place' : (/prix|coût/i.test(c) ? 'row-amount' : ''));
      html += '<td class="'+cls+'">'+linkify(formatCellBool(v))+'</td>';
    });
    html += '</tr>';
  });
  html += '</tbody></table></div></div>';

  if (extraRows.length > 0) {
    // Build a clean summary from extra rows - pivot into a readable format
    var prixCol = cols.find(function(c){return /^prix$/i.test(c.trim());}) || '';
    var ppCol = cols.find(function(c){return /prix.*personne/i.test(c);}) || '';
    var resCol = cols.find(function(c){return /réservé/i.test(c);}) || '';
    var ptCol = cols.find(function(c){return /prix.*trajet/i.test(c);}) || '';
    var btCol = cols.find(function(c){return /billets/i.test(c);}) || '';

    html += '<div class="recap-section mt-2 mb-2">';
    html += '<div class="recap-header"><span class="recap-title">📊 Récapitulatif &amp; totaux</span></div>';
    html += '<div class="recap-grid">';
    extraRows.forEach(function(row) {
      // Find the first non-empty text column to use as label
      var label = '';
      var vals = {};
      cols.forEach(function(c) {
        var v = String(row[c]||'').trim();
        if (!v) return;
        var cl = c.toLowerCase();
        if (/prix.*personne/i.test(c) && v) vals.prixPers = v;
        else if (/^prix$/i.test(c.trim()) && v) vals.prix = v;
        else if (/prix.*trajet/i.test(c) && v) vals.trajet = v;
        else if (/réservé/i.test(c) && v) vals.reserve = v;
        else if (/billets/i.test(c) && v) vals.billets = v;
        else if (!label && v && !/jour|date/i.test(c)) label = v;
      });
      // Only show rows that have some useful data
      var hasVals = vals.prix || vals.prixPers || vals.trajet;
      if (!hasVals && !label) return;

      html += '<div class="recap-card">';
      if (label) html += '<div class="recap-card-label">'+label+'</div>';
      if (vals.prix) html += '<div class="recap-kv"><span class="recap-k">Prix total</span><span class="recap-v">'+formatEURint(parseBudget(vals.prix))+'</span></div>';
      if (vals.prixPers) html += '<div class="recap-kv"><span class="recap-k">Par personne</span><span class="recap-v">'+formatEURint(parseBudget(vals.prixPers))+'</span></div>';
      if (vals.trajet) html += '<div class="recap-kv"><span class="recap-k">Transport/pers</span><span class="recap-v">'+formatEURint(parseBudget(vals.trajet))+'</span></div>';
      if (vals.reserve) html += '<div class="recap-kv"><span class="recap-k">Réservé</span><span class="recap-v">'+formatCellBool(vals.reserve)+'</span></div>';
      if (vals.billets) html += '<div class="recap-kv"><span class="recap-k">Billets</span><span class="recap-v">'+formatCellBool(vals.billets)+'</span></div>';
      html += '</div>';
    });
    html += '</div></div>';
  }

  html += '<div class="itinerary-summary-cards mt-2">';
  groups.forEach(function(g) {
    if (!g.city) return;
    var lienLog = getLodgeLink(g.logement);
    var lienAlt = getLodgeLink(g.altLogement);
    html += '<div class="summary-card"><h3>📍 '+g.city+'</h3><ul class="summary-list">';
    html += '<li><span class="s-label">Dates</span><span class="s-value text-sm" style="font-family:\'Outfit\'">'+formatDateRange(g)+'</span></li>';
    html += '<li><span class="s-label">Nuits</span><span class="s-value">'+nightsLabel(g)+'</span></li>';
    if (parseBudget(g.prix)) html += '<li><span class="s-label">Logement</span><span class="s-value">'+formatEURint(parseBudget(g.prix))+'</span></li>';
    if (parseBudget(g.prixPersonne)) html += '<li><span class="s-label">Prix/pers.</span><span class="s-value">'+formatEURint(parseBudget(g.prixPersonne))+'</span></li>';
    if (parseBudget(g.prixTrajet)) html += '<li><span class="s-label">Transport</span><span class="s-value">'+formatEURint(parseBudget(g.prixTrajet))+'/pers</span></li>';
    if (g.logement) {
      var logEl = lienLog ? '<a href="'+lienLog+'" target="_blank" class="cell-link">'+g.logement+'</a>' : g.logement;
      html += '<li style="flex-direction:column;gap:3px"><span class="s-label">Logement 1</span><span class="text-sm">'+logEl+'</span></li>';
    }
    if (g.altLogement) {
      var altEl = lienAlt ? '<a href="'+lienAlt+'" target="_blank" class="cell-link">'+g.altLogement+'</a>' : g.altLogement;
      html += '<li style="flex-direction:column;gap:3px"><span class="s-label">Alternative</span><span class="text-sm">'+altEl+'</span></li>';
    }
    if (g.reserve) html += '<li><span class="s-label">Réservé</span><span class="s-value">'+formatBool(g.reserve)+'</span></li>';
    if (g.activites && g.activites.length) html += '<li style="flex-direction:column;gap:4px"><span class="s-label">Activités</span><span class="text-sm" style="opacity:0.65;padding-top:2px">'+(Array.isArray(g.activites)?g.activites.join(' / '):g.activites)+'</span></li>';
    if (g.infos) html += '<li style="flex-direction:column;gap:3px"><span class="s-label">Note</span><span class="text-sm" style="font-style:italic;opacity:0.7">'+linkify(g.infos)+'</span></li>';
    html += '</ul></div>';
  });
  html += '</div>';

  document.getElementById('page-container').innerHTML = html;
  setTimeout(function(){createMap('itinerary-map', groups);}, 100);
}

function renderConverterCard(rate) {
  var eurPerYen = rate ? (1/rate).toFixed(6) : '---';
  return '<div class="converter-card mt-2 mb-2">'+
    '<div class="converter-header map-title-bar">💱 Convertisseur ¥ → €<span class="converter-rate-badge">1 ¥ = '+eurPerYen+' €</span></div>'+
    '<div class="converter-body"><div class="converter-row">'+
    '<div class="converter-input-wrap"><label class="converter-label">Montant en yens (¥)</label>'+
    '<div class="converter-input-group"><span class="conv-sym">¥</span><input type="number" id="jpy-amount" placeholder="ex : 1000" class="converter-input" oninput="convertJPY()" min="0"></div></div>'+
    '<div class="converter-arrow-col"><div class="conv-arrow">→</div></div>'+
    '<div class="converter-result-wrap"><label class="converter-label">Montant en euros (€)</label>'+
    '<div class="converter-output-group"><span class="conv-sym">€</span><span id="eur-result" class="converter-output">—</span></div></div>'+
    '</div><div class="converter-info">Taux en direct : 1 € = <strong>'+(rate?rate.toFixed(2):'—')+' ¥</strong></div>'+
    '</div></div>';
}
function convertJPY() {
  var input=document.getElementById('jpy-amount'),output=document.getElementById('eur-result');
  if(!input||!output) return;
  var amount=parseFloat(input.value),rate=DataService.exchangeRate;
  if(isNaN(amount)||!rate){output.textContent='—';return;}
  output.textContent=(amount/rate).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})+' €';
}

// ═══ GUIDES ═══
function renderGuides() {
  var groups = getTravelGroups();
  var subDests = extractSubDestinations(groups);
  var allDests = groups.concat(subDests);
  window._guideDests = allDests;

  var html = '<div class="page-header"><h1>Fiches Voyage <span class="jp-accent" style="opacity:0.3;font-size:0.6em">旅のガイド</span></h1>';
  html += '<p class="subtitle">Cliquez sur une destination pour voir la fiche complète</p></div>';
  html += '<div class="guides-dest-list">';

  allDests.forEach(function(g, i) {
    var dest = findDestination(g.city);
    var acts = Array.isArray(g.activites) ? g.activites.filter(function(a){return a.trim();}) : [];
    var weather = g.startDate ? getWeatherForDate(g.city, g.startDate) : null;
    var pPers = parseBudget(g.prixPersonne);

    html += '<div class="guide-dest-card" onclick="openGuideDetail('+i+')" style="animation-delay:'+(i*0.06)+'s">';
    var destKey = dest._destKey || '_default';
    html += '<div class="guide-dest-thumb img-loading" style="background-image:url(\''+dest.image+'\')" data-dest-key="'+destKey+'">';
    html += '<div class="guide-dest-num">'+(i+1)+'</div>';
    if (g.isSubDest) html += '<div class="guide-dest-sub-badge">Excursion</div>';
    html += '</div>';
    html += '<div class="guide-dest-info">';
    html += '<div class="guide-dest-header"><div>';
    html += '<div class="guide-dest-city">'+g.city+(dest.nameJP?' <span class="guide-dest-jp">'+dest.nameJP+'</span>':'')+'</div>';
    if (g.isSubDest && g.parentCity) {
      html += '<div class="guide-dest-dates" style="color:var(--vermillion);font-weight:600">Excursion depuis '+g.parentCity+'</div>';
    } else {
      html += '<div class="guide-dest-dates">'+formatDateRange(g)+'<span style="margin-left:6px;opacity:0.6">· '+nightsLabel(g)+'</span></div>';
    }
    html += '</div>';
    if (g.dureeTrajet) html += '<div class="guide-dest-trajet">🚄 '+g.dureeTrajet+'</div>';
    html += '</div>';
    html += '<div class="guide-dest-tags">';
    if (pPers) html += '<span class="dest-tag dest-tag-price">🏠 '+formatEURint(pPers)+'/pers.</span>';
    if (acts.length) html += '<span class="dest-tag dest-tag-act">📍 '+acts.length+' activité'+(acts.length>1?'s':'')+'</span>';
    if (weather) html += '<span class="dest-tag dest-tag-temp">'+weather.icon+' '+weather.high+'°C</span>';
    if (g.reserve && /oui|true/i.test(g.reserve)) html += '<span class="dest-tag dest-tag-ok">✅ Réservé</span>';
    html += '</div>';
    if (!g.isSubDest && g.logement) html += '<div class="guide-dest-preview">🏨 '+g.logement+(g.altLogement?' <span style="opacity:0.5">· alt: '+g.altLogement+'</span>':'')+'</div>';
    if (acts.length) html += '<div class="guide-dest-preview acts-preview">'+acts.slice(0,2).join(' · ')+(acts.length>2?' +'+( acts.length-2):'')+'</div>';
    html += '</div><div class="guide-dest-cta">›</div></div>';
  });

  html += '</div>';
  document.getElementById('page-container').innerHTML = html;
  setTimeout(_repairBrokenImages, 200);
}

function openGuideDetail(idxOrName) {
  var groups = window._guideDests || getTravelGroups();
  var g;
  if (typeof idxOrName === 'number') { g = groups[idxOrName]; }
  else {
    var name = decodeURIComponent(String(idxOrName));
    g = groups.find(function(x){ return x.city && x.city.toLowerCase().includes(name.toLowerCase()); });
    if (!g) g = { city: name, activites: [], dates: [] };
  }
  if (!g) return;

  var dest = findDestination(g.city);
  var acts = Array.isArray(g.activites) ? g.activites.filter(function(a){return a.trim();}) : [];
  var pPers = parseBudget(g.prixPersonne);
  var pTotal = parseBudget(g.prix);
  var pTrajet = parseBudget(g.prixTrajet);
  var wx = g.startDate ? getWeatherForDate(g.city, g.startDate) : null;
  var months = ['jan','fév','mar','avr','mai','juin','juil','août','sep','oct','nov','déc'];

  var old = document.querySelector('.guide-detail-overlay');
  if (old) old.remove();

  var overlay = document.createElement('div');
  overlay.className = 'guide-detail-overlay';
  overlay.onclick = function(e){ if(e.target===overlay) overlay.remove(); };

  var h = '<div class="guide-detail">';
  h += '<div class="guide-detail-hero img-loading" style="background-image:url(\''+dest.image+'\')" data-dest-key="'+(dest._destKey||'_default')+'">';
  h += '<button class="guide-close" onclick="this.closest(\'.guide-detail-overlay\').remove()">×</button>';
  h += '<div class="guide-detail-hero-content">';
  var idx = (window._guideDests||[]).indexOf(g);
  if (g.isSubDest) { h += '<div class="guide-detail-etape">EXCURSION <span class="guide-detail-range">depuis '+g.parentCity+'</span></div>'; }
  else { h += '<div class="guide-detail-etape">ÉTAPE '+String(idx+1).padStart(2,'0')+'<span class="guide-detail-range"> · '+formatDateRange(g)+'</span></div>'; }
  h += '<h1>'+g.city+(dest.nameJP?' <span style="opacity:0.6;font-size:0.55em;font-weight:400">'+dest.nameJP+'</span>':'')+'</h1>';
  h += '</div></div>';

  h += '<div class="guide-detail-tagbar">';
  if (pPers) h += '<span class="dtag dtag-price">🏠 '+formatEURint(pPers)+'/pers.</span>';
  if (acts.length) h += '<span class="dtag dtag-act">📍 '+acts.length+' activité'+(acts.length>1?'s':'')+'</span>';
  if (wx) h += '<span class="dtag dtag-temp">'+wx.icon+' '+wx.high+'°C</span>';
  if (pTotal) h += '<span class="dtag dtag-price">💰 '+formatEURint(pTotal)+'</span>';
  if (pTrajet) h += '<span class="dtag dtag-transport">🚄 '+formatEURint(pTrajet)+'/pers</span>';
  h += '</div>';

  h += '<div class="guide-detail-body">';

  if (g.logement || g.altLogement) {
    h += '<div class="gd-section"><div class="gd-section-title">HÉBERGEMENT</div>';
    if (g.logement) {
      var lienLog = getLodgeLink(g.logement);
      var logTag = lienLog ? 'a href="'+lienLog+'" target="_blank" rel="noopener"' : 'span';
      var logClose = lienLog ? 'a' : 'span';
      h += '<div class="gd-logement gd-logement-choix"><span class="gd-log-badge">CHOIX 1</span>'+
           '<span class="gd-log-name"><'+logTag+' class="cell-link">'+g.logement+'</'+logClose+'></span>'+
           (pTotal?'<span class="gd-log-price">'+formatEURint(pTotal)+'</span>':'')+
           '<span class="gd-log-arrow">→</span></div>';
    }
    if (g.altLogement) {
      var lienAlt = getLodgeLink(g.altLogement);
      var altTag2 = lienAlt ? 'a href="'+lienAlt+'" target="_blank" rel="noopener"' : 'span';
      var altClose2 = lienAlt ? 'a' : 'span';
      h += '<div class="gd-logement gd-logement-alt"><span class="gd-log-badge gd-log-badge-alt">ALT</span>'+
           '<span class="gd-log-name"><'+altTag2+' class="cell-link">'+g.altLogement+'</'+altClose2+'></span>'+
           '<span class="gd-log-arrow">→</span></div>';
    }
    if (g.reserve) { var resT = /oui|true/i.test(g.reserve)?'✅ Réservé':'⏳ Non réservé'; var bilT = g.billetsRes?(/oui|true/i.test(g.billetsRes)?' · 🎫 Billets OK':' · 🎫 '+g.billetsRes):''; h += '<div class="gd-reserve">'+resT+bilT+'</div>'; }
    if (g.dureeTrajet) h += '<div class="gd-transport">🚄 Trajet '+g.dureeTrajet+(pTrajet?'<span class="gd-trajet-price">'+formatEURint(pTrajet)+'/pers.</span>':'')+'</div>';
    h += '</div>';
  }

  if (acts.length) { h += '<div class="gd-section"><div class="gd-section-title">ACTIVITÉS</div><div class="gd-act-chips">'; acts.forEach(function(a){ h += '<span class="gd-chip">'+a+'</span>'; }); h += '</div></div>'; }

  if (g.dates && g.dates.length > 0) {
    h += '<div class="gd-section"><div class="gd-section-title">MÉTÉO (HISTORIQUE)</div><div class="gd-weather-grid">';
    g.dates.forEach(function(d) {
      var w = getWeatherForDate(g.city, d); if (!w) return;
      h += '<div class="gd-weather-day"><div class="gd-wx-date">'+d.getDate()+' '+months[d.getMonth()]+'</div><div class="gd-wx-icon">'+w.icon+'</div><div class="gd-wx-high">'+w.high+'°</div><div class="gd-wx-low">'+w.low+'°</div><div class="gd-wx-rain">💧'+w.rain+'%</div></div>';
    });
    h += '</div>';
    if (wx && wx.desc) h += '<p class="gd-weather-desc">'+wx.desc+'</p>';
    h += '</div>';
  }

  if (dest.intro) h += '<div class="gd-section"><p class="gd-intro">'+dest.intro+'</p></div>';
  if (g.infos) h += '<div class="gd-section"><div class="gd-section-title">NOTE</div><div class="gd-note">⭐ '+linkify(g.infos)+'</div></div>';

  if (dest.highlights && dest.highlights.length) { h += '<div class="gd-section"><div class="gd-section-title">À NE PAS MANQUER</div><ul class="gd-highlights">'; dest.highlights.forEach(function(hl){ h += '<li>'+hl+'</li>'; }); h += '</ul></div>'; }
  if (dest.funFacts && dest.funFacts.length) { h += '<div class="gd-section"><div class="gd-section-title">LE SAVIEZ-VOUS ?</div><ul class="gd-highlights gd-funfacts">'; dest.funFacts.forEach(function(f){ h += '<li>'+f+'</li>'; }); h += '</ul></div>'; }
  if (dest.restaurants && dest.restaurants.length) {
    h += '<div class="gd-section"><div class="gd-section-title">OÙ MANGER</div><div class="gd-restos">';
    dest.restaurants.forEach(function(r){ h += '<div class="gd-resto"><div class="gd-resto-name">'+r.name+'</div><div class="gd-resto-type">'+r.type+'</div><div class="gd-resto-desc">'+r.desc+'</div><div class="gd-resto-price">'+r.price+'</div></div>'; });
    h += '</div></div>';
  }
  if (dest.tips) h += '<div class="gd-section"><div class="gd-section-title">CONSEILS PRATIQUES</div><div class="gd-tips">'+dest.tips+'</div></div>';

  h += '</div></div>';
  overlay.innerHTML = h;
  // Append to <html> directly to escape any transform-based stacking contexts
  // (sidebar transition: transform can trap position:fixed children in some browsers)
  document.documentElement.appendChild(overlay);
  setTimeout(_repairBrokenImages, 50);
}

// ═══ PRINT ═══
function renderPrint() {
  var groups = getTravelGroups();
  var calendarData = buildCalendarData(groups);
  var html = '<div class="page-header"><h1>Impression <span class="jp-accent" style="opacity:0.3;font-size:0.6em">印刷</span></h1>';
  html += '<p class="subtitle">Calendrier et carte, optimisés pour l\'impression</p></div>';
  html += '<div class="print-actions no-print"><button class="btn btn-primary" onclick="window.print()">🖨️ Imprimer / PDF</button><button class="btn btn-secondary" onclick="togglePrintFullscreen()">📄 Aperçu</button></div>';
  html += '<div class="print-map-section mb-2"><div class="map-title-bar">🗾 Carte</div><div id="print-map"></div></div>';
  calendarData.months.forEach(function(month) {
    html += '<div class="print-calendar mb-2"><div class="calendar-header">'+month.label+'</div><div class="calendar-grid">';
    ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].forEach(function(d){ html += '<div class="calendar-day-header">'+d+'</div>'; });
    month.days.forEach(function(day) {
      if (!day) { html += '<div class="calendar-day empty"></div>'; return; }
      var events = calendarData.events[day.dateStr] || [];
      html += '<div class="calendar-day'+(day.isToday?' today':'')+'"><div class="day-num">'+day.num+'</div>';
      events.forEach(function(e){ html += '<div class="day-event">'+e.city+'</div>'; });
      html += '</div>';
    });
    html += '</div></div>';
  });
  html += '<div class="itinerary-full-table mt-2"><div class="map-title-bar">📋 Étapes</div><div class="table-scroll"><table class="iti-table"><thead><tr><th>#</th><th>Dates</th><th>Lieu</th><th>Logement</th><th>Activités</th><th>Transport</th><th>Budget</th></tr></thead><tbody>';
  groups.forEach(function(g,i) {
    if (!g.city) return;
    var acts = Array.isArray(g.activites) ? g.activites.join(', ') : (g.activites||'');
    html += '<tr><td>'+(i+1)+'</td><td class="row-date">'+formatDateRange(g)+'</td><td class="row-place">'+g.city+'</td><td class="text-sm">'+(g.logement||'—')+'</td><td class="text-sm">'+(acts||'—')+'</td><td class="text-sm">'+(g.dureeTrajet||'—')+'</td><td class="row-amount">'+(parseBudget(g.prix)?formatEURint(parseBudget(g.prix)):'—')+'</td></tr>';
  });
  html += '</tbody></table></div></div>';
  document.getElementById('page-container').innerHTML = html;
  setTimeout(function(){createMap('print-map', groups);}, 100);
}

function buildCalendarData(groups) {
  var dates=[], events={};
  groups.forEach(function(g) { (g.dates||[]).forEach(function(d){ var ds=fmtDs(d); dates.push(d); if(!events[ds]) events[ds]=[]; events[ds].push(g); }); });
  if (!dates.length) return {months:[],events:events};
  var min=new Date(Math.min.apply(null,dates)), max=new Date(Math.max.apply(null,dates));
  max.setDate(max.getDate()+2);
  var months=[], cur=new Date(min.getFullYear(),min.getMonth(),1);
  var MN=['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  while(cur<=max){
    var yr=cur.getFullYear(),mo=cur.getMonth(),fd=new Date(yr,mo,1),pad=fd.getDay()-1; if(pad<0)pad=6;
    var dim=new Date(yr,mo+1,0).getDate(),today=fmtDs(new Date()),days=[];
    for(var ii=0;ii<pad;ii++) days.push(null);
    for(var d=1;d<=dim;d++){var dt=new Date(yr,mo,d),ds=fmtDs(dt);days.push({num:d,dateStr:ds,isToday:ds===today});}
    months.push({label:MN[mo]+' '+yr,days:days});
    cur=new Date(yr,mo+1,1);
  }
  return {months:months,events:events};
}
function fmtDs(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function togglePrintFullscreen(){document.body.classList.toggle('print-preview-mode');}

// ═══════════════════════════════════════════════════════════
// V11 — NOUVELLES FONCTIONNALITÉS
// ═══════════════════════════════════════════════════════════

// ─── CHECKLIST STORE ───
var ChecklistStore = {
  KEY: 'ldva-checklist-v2',
  get: function() {
    try { return JSON.parse(localStorage.getItem(this.KEY) || '{}'); } catch(e) { return {}; }
  },
  isChecked: function(city, type) {
    return !!(this.get()[city] || {})[type];
  },
  toggle: function(city, type) {
    var d = this.get();
    if (!d[city]) d[city] = {};
    d[city][type] = !d[city][type];
    localStorage.setItem(this.KEY, JSON.stringify(d));
    return d[city][type];
  }
};

function toggleCheck(city, type, btn) {
  var checked = ChecklistStore.toggle(city, type);
  btn.classList.toggle('checked', checked);
  btn.querySelector('.ct-box').textContent = checked ? '✅' : '☐';
  // Also refresh dashboard progress strip if visible
  refreshProgressStrip();
}

// ─── TRIP STATUS ───
var TRIP_START = new Date('2026-11-18');
var TRIP_END   = new Date('2026-12-05');

function getTripPhase() {
  var now = new Date(); now.setHours(0,0,0,0);
  var s = new Date(TRIP_START); s.setHours(0,0,0,0);
  var e = new Date(TRIP_END); e.setHours(0,0,0,0);
  if (now < s) return 'before';
  if (now > e) return 'after';
  return 'during';
}

function getGroupTripState(g) {
  var now = new Date(); now.setHours(0,0,0,0);
  var start = g.startDate ? new Date(g.startDate) : null;
  var end   = g.endDate   ? new Date(g.endDate)   : start;
  if (start) start.setHours(0,0,0,0);
  if (end)   end.setHours(0,0,0,0);
  if (!start) return 'future';
  if (now > end) return 'past';
  if (now >= start && now <= end) return 'current';
  return 'future';
}

// ─── BARRE DE PROGRESSION ───
function buildProgressStrip(groups) {
  var total = groups.length;
  // Source of truth = spreadsheet columns only (no manual toggles)
  var resChecked = groups.filter(function(g){ return /oui|true/i.test(g.reserve||''); }).length;
  var bilChecked = groups.filter(function(g){ return /oui|true/i.test(g.billetsRes||''); }).length;

  var totalBudget = 0, totalTrajet = 0;
  groups.forEach(function(g){ totalBudget += parseBudget(g.prix); totalTrajet += parseBudget(g.prixTrajet); });
  var grand = totalBudget + totalTrajet;

  var resPct  = total ? Math.round(resChecked / total * 100) : 0;
  var bilPct  = total ? Math.round(bilChecked / total * 100) : 0;

  var phase = getTripPhase();
  var progressLabel, progressPct, progressColor;
  if (phase === 'before') {
    var msLeft = TRIP_START - new Date();
    var daysLeft = Math.max(0, Math.ceil(msLeft / 86400000));
    progressLabel = daysLeft + ' jours avant départ';
    progressPct = Math.round((1 - daysLeft / 365) * 100);
    progressColor = 'blush';
  } else if (phase === 'during') {
    var elapsed = Math.floor((new Date() - TRIP_START) / 86400000) + 1;
    var tripLen  = Math.ceil((TRIP_END - TRIP_START) / 86400000);
    progressLabel = 'Jour ' + elapsed + ' / ' + tripLen;
    progressPct = Math.round(elapsed / tripLen * 100);
    progressColor = 'sage';
  } else {
    progressLabel = 'Voyage terminé 🎌';
    progressPct = 100;
    progressColor = 'amber';
  }

  return '<div class="progress-strip" id="progress-strip">' +
    '<div class="prog-item">' +
      '<div class="prog-header"><span class="prog-label">Logements réservés</span><span class="prog-value" style="color:var(--sage)">' + resChecked + '/' + total + '</span></div>' +
      '<div class="prog-track"><div class="prog-fill prog-fill-sage" style="width:' + resPct + '%"></div></div>' +
    '</div>' +
    '<div class="prog-item">' +
      '<div class="prog-header"><span class="prog-label">Billets achetés</span><span class="prog-value" style="color:var(--sky)">' + bilChecked + '/' + total + '</span></div>' +
      '<div class="prog-track"><div class="prog-fill prog-fill-sky" style="width:' + bilPct + '%"></div></div>' +
    '</div>' +
    '<div class="prog-item">' +
      '<div class="prog-header"><span class="prog-label">Budget total</span><span class="prog-value" style="color:var(--amber)">' + formatEURint(grand) + '</span></div>' +
      '<div class="prog-track"><div class="prog-fill prog-fill-amber" style="width:75%"></div></div>' +
    '</div>' +
    '<div class="prog-item">' +
      '<div class="prog-header"><span class="prog-label">' + progressLabel + '</span><span class="prog-value" style="color:var(--' + progressColor + ')">' + Math.min(progressPct, 100) + '%</span></div>' +
      '<div class="prog-track"><div class="prog-fill prog-fill-' + progressColor + '" style="width:' + Math.min(progressPct, 100) + '%"></div></div>' +
    '</div>' +
  '</div>';
}

function refreshProgressStrip() {
  var groups = getTravelGroups();
  var strip = document.getElementById('progress-strip');
  if (strip) strip.outerHTML = buildProgressStrip(groups);
}

// ─── TRIP STATUS BANNER ───
function buildTripBanner(groups) {
  var phase = getTripPhase();
  if (phase === 'before') {
    var days = Math.ceil((TRIP_START - new Date()) / 86400000);
    return '<div class="trip-status-banner tsb-before"><span class="tsb-icon">✈️</span><div class="tsb-text"><strong>Voyage à venir</strong>Départ dans <strong>' + days + ' jours</strong> · Toulouse → Tokyo</div></div>';
  }
  if (phase === 'during') {
    // find current city
    var cur = null;
    groups.forEach(function(g){
      if (getGroupTripState(g) === 'current') cur = g;
    });
    var loc = cur ? ' · Actuellement à <strong>' + cur.city + '</strong>' : '';
    var day = Math.floor((new Date() - TRIP_START) / 86400000) + 1;
    var len = Math.ceil((TRIP_END - TRIP_START) / 86400000);
    return '<div class="trip-status-banner tsb-during"><span class="tsb-icon">📍</span><div class="tsb-text"><strong>Voyage en cours — Jour ' + day + '/' + len + '</strong>' + loc + '</div></div>';
  }
  return '<div class="trip-status-banner tsb-after"><span class="tsb-icon">🎌</span><div class="tsb-text"><strong>Voyage terminé</strong>Retour de Tokyo — よかった旅！</div></div>';
}

// ─── OVERRIDE renderDashboard to inject progress + banner ───
var _origRenderDashboard = renderDashboard;
renderDashboard = function() {
  _origRenderDashboard();
  var groups = getTravelGroups();

  // Inject trip status banner + progress strip before stats-row
  var statsRow = document.querySelector('.stats-row');
  if (statsRow) {
    var banner = document.createElement('div');
    banner.innerHTML = buildTripBanner(groups);
    statsRow.parentNode.insertBefore(banner.firstChild, statsRow);

    var prog = document.createElement('div');
    prog.innerHTML = buildProgressStrip(groups);
    statsRow.parentNode.insertBefore(prog.firstChild, statsRow);
  }

  // Add trip state classes + checklist to cards
  groups.forEach(function(g, i) {
    var card = document.getElementById('dc-' + i);
    if (!card) return;
    var state = getGroupTripState(g);
    if (state === 'past')    card.classList.add('trip-past');
    if (state === 'current') card.classList.add('trip-current');

    // Add checklist row to card body inner
    var inner = card.querySelector('.card-body-inner');
    if (!inner) return;

    var badge = state === 'current'
      ? '<div style="margin-bottom:8px"><span class="trip-current-badge">📍 Vous êtes ici</span></div>'
      : '';

    if (badge) inner.insertAdjacentHTML('afterbegin', badge);

    // Note button + display
    var cityEscN = g.city.replace(/'/g, "\\'");
    var existingNote = NotesStore.get(g.city);
    var noteHtml = '<div class="note-row">' +
      '<button class="note-edit-btn' + (existingNote ? ' has-note' : '') + '" ' +
        'onclick="openNoteEditor(\'' + cityEscN + '\', this);event.stopPropagation()" ' +
        'title="' + (existingNote ? 'Modifier la note' : 'Ajouter une note') + '">' +
        '📝 Note' +
      '</button>' +
      '<span class="note-display" data-note-city="' + cityEscN + '" style="' + (existingNote ? '' : 'display:none') + '">' +
        (existingNote ? '📝 ' + existingNote : '') +
      '</span>' +
    '</div>';
    inner.insertAdjacentHTML('beforeend', noteHtml);
  });
};

// ─── TIMELINE ───
function renderTimeline() {
  var groups = getTravelGroups();
  var allGroups = DataService.getGroups(); // includes airports
  var phase = getTripPhase();

  var html = '<div class="page-header">' +
    '<h1>Timeline <span class="jp-accent" style="opacity:.3;font-size:.6em">旅の時間</span></h1>' +
    '<p class="subtitle">Vue chronologique jour par jour</p></div>';

  html += buildTripBanner(groups);

  // Build a day-by-day list from first departure to return
  var allDates = [];
  var dateMap = {}; // dateStr -> group info
  allGroups.forEach(function(g) {
    if (!g.dates) return;
    g.dates.forEach(function(d) {
      var ds = fmtDs(d);
      if (!dateMap[ds]) dateMap[ds] = [];
      dateMap[ds].push(g);
    });
  });

  // Get range
  var rawDates = Object.keys(dateMap).sort();
  if (!rawDates.length) {
    document.getElementById('page-container').innerHTML = html + '<p class="text-muted">Aucune donnée disponible.</p>';
    return;
  }

  var months = ['jan.','fév.','mars','avr.','mai','juin','juil.','août','sep.','oct.','nov.','déc.'];
  var monthsFull = ['Novembre','Décembre','Janvier','Février'];
  var days = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];

  html += '<div class="timeline-page"><div class="timeline-wrapper"><div class="timeline-spine"></div>';

  var lastMonth = null;
  var now = new Date(); now.setHours(0,0,0,0);
  var stopIdx = 0;

  rawDates.forEach(function(ds, di) {
    var parts = ds.split('-');
    var d = new Date(+parts[0], +parts[1]-1, +parts[2]);
    var monthKey = parts[0] + '-' + parts[1];
    var gList = dateMap[ds] || [];
    // pick primary group (non-airport)
    var g = gList.find(function(x){ return !/aéroport|airport/i.test(x.city||''); }) || gList[0];
    if (!g) return;

    var isAirport = /aéroport|airport/i.test(g.city||'');
    var dayDate = new Date(d); dayDate.setHours(0,0,0,0);
    var isPast    = dayDate < now;
    var isCurrent = dayDate.getTime() === now.getTime();
    var dest = findDestination(g.city);
    var wx = getWeatherForDate(g.city, d);

    // Month divider
    if (monthKey !== lastMonth) {
      lastMonth = monthKey;
      var mn = d.toLocaleString('fr-FR', {month:'long', year:'numeric'});
      html += '<div class="tl-month-divider">' + mn.charAt(0).toUpperCase() + mn.slice(1) + '</div>';
    }

    var stateClass = isPast ? 'tl-past' : (isCurrent ? 'tl-current' : '');
    var dotColor = STOP_COLORS[stopIdx % STOP_COLORS.length];
    if (!isAirport) stopIdx++;

    var acts = Array.isArray(g.activites) ? g.activites.filter(function(a){return a&&a.trim();}) : [];
    var dateLabel = days[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()];

    html += '<div class="tl-day' + (isAirport?' tl-transit':'') + '" style="animation-delay:' + (di*.04) + 's">';
    html += '<div class="tl-dot' + (isCurrent?' dot-current':'') + '" style="background:' + dotColor + '">' + (isAirport?'✈':'') + '</div>';
    html += '<div class="tl-card ' + stateClass + '">';
    html += '<div class="tl-card-head">';
    html += '<div><div class="tl-city">' + g.city + (dest.nameJP ? '<span class="tl-jp">' + dest.nameJP + '</span>' : '') + '</div></div>';
    html += '<div class="tl-date">' + dateLabel + '</div>';
    html += '</div>';

    // Badges
    var badges = '';
    if (isCurrent) badges += '<span class="trip-current-badge">📍 Aujourd\'hui</span>';
    if (wx) badges += '<span class="tl-badge tl-badge-wx">' + wx.icon + ' ' + wx.high + '°/' + wx.low + '°</span>';
    if (g.dureeTrajet && d.getTime() === g.startDate.getTime()) badges += '<span class="tl-badge tl-badge-move">🚄 ' + g.dureeTrajet + '</span>';
    if (g.reserve && /oui|true/i.test(g.reserve)) badges += '<span class="tl-badge tl-badge-res">✅</span>';
    if (badges) html += '<div class="tl-badges">' + badges + '</div>';

    // Activities for this day
    if (acts.length) {
      html += '<div class="tl-acts">📍 <span>' + acts.join(' · ') + '</span></div>';
    }

    // Lodge (show only on first day of a stay)
    if (g.logement && g.startDate && d.getTime() === g.startDate.getTime()) {
      var lh = getLodgeLink(g.logement);
      html += '<div class="tl-lodge">🏨 ' + (lh ? '<a href="' + lh + '" target="_blank" class="cell-link">' + g.logement + '</a>' : g.logement);
      if (g.prix) html += ' <span style="opacity:.6;font-family:\'Space Mono\',monospace;font-size:.66rem">' + formatEURint(parseBudget(g.prix)) + '</span>';
      html += '</div>';
    }

    html += '</div></div>';
  });

  html += '</div></div>';
  document.getElementById('page-container').innerHTML = html;
}

// ─── WIKIMEDIA GALLERY ───
var _wikiCache = {};

var WIKI_QUERIES = {
  'tokyo':     'Tokyo Japan landmark',
  'kyoto':     'Kyoto Japan temple',
  'osaka':     'Osaka Japan cityscape',
  'hiroshima': 'Hiroshima Peace Memorial Japan',
  'nara':      'Nara Japan deer temple',
  'hakone':    'Hakone Japan Fuji',
  'kanazawa':  'Kanazawa Japan Kenroku-en',
  'takayama':  'Takayama Japan old town',
  'shirakawa': 'Shirakawa-go Japan gassho',
  'magome':    'Magome Japan Nakasendo',
  'miyajima':  'Miyajima Japan torii gate',
  'koyasan':   'Koyasan Japan Buddhist temple',
  'nikko':     'Nikko Tosho-gu Japan',
  'kamakura':  'Kamakura Japan Buddha',
  '_default':  'Japan landscape traditional'
};

function fetchWikiGallery(destKey) {
  if (_wikiCache[destKey]) return Promise.resolve(_wikiCache[destKey]);
  var q = WIKI_QUERIES[destKey] || WIKI_QUERIES['_default'];
  // Use Wikimedia search API — namespace 6 = Files
  var url = 'https://commons.wikimedia.org/w/api.php?action=query' +
    '&generator=search&gsrsearch=' + encodeURIComponent('File:' + q) +
    '&gsrnamespace=6&gsrlimit=9' +
    '&prop=imageinfo&iiprop=url|mime|thumburl&iiurlwidth=420' +
    '&format=json&origin=*';
  return fetch(url)
    .then(function(r){ return r.json(); })
    .then(function(data) {
      var pages = data.query && data.query.pages ? Object.values(data.query.pages) : [];
      var imgs = pages
        .filter(function(p){ return p.imageinfo && p.imageinfo[0] && /jpeg|jpg|png|webp/i.test(p.imageinfo[0].mime||''); })
        .map(function(p){ return { thumb: p.imageinfo[0].thumburl, full: p.imageinfo[0].url }; })
        .filter(function(i){ return i.thumb && i.full; })
        .slice(0, 6);
      _wikiCache[destKey] = imgs;
      return imgs;
    })
    .catch(function(){ return []; });
}

function injectWikiGallery(destKey) {
  var container = document.getElementById('gd-gallery-' + destKey);
  if (!container) return;
  fetchWikiGallery(destKey).then(function(imgs) {
    if (!imgs.length) { container.parentElement.style.display = 'none'; return; }
    container.innerHTML = imgs.map(function(img) {
      return '<div class="gd-gallery-img" style="background-image:url(\'' + img.thumb + '\')" ' +
        'onclick="openLightbox(\'' + img.full.replace(/'/g,"\\'") + '\')" title="Voir en grand"></div>';
    }).join('');
  });
}

function openLightbox(url) {
  var lb = document.createElement('div');
  lb.className = 'gd-lightbox';
  lb.innerHTML = '<button class="gd-lightbox-close" onclick="this.parentElement.remove()">×</button>' +
    '<img src="' + url + '" alt="Photo">';
  lb.onclick = function(e){ if(e.target===lb) lb.remove(); };
  document.documentElement.appendChild(lb);
}

// ─── PATCH openGuideDetail to add gallery section ───
var _origOpenGuideDetail = openGuideDetail;
openGuideDetail = function(idxOrName) {
  _origOpenGuideDetail(idxOrName);
  // Find the guide-detail that was just opened
  setTimeout(function() {
    var detail = document.querySelector('.guide-detail-body');
    if (!detail) return;

    // Find the dest key from the hero
    var hero = document.querySelector('.guide-detail-hero[data-dest-key]');
    var destKey = hero ? hero.getAttribute('data-dest-key') : '_default';
    if (!destKey || destKey === '_default') return;

    // Inject gallery section before "À ne pas manquer"
    var gallerySection = document.createElement('div');
    gallerySection.className = 'gd-section';
    gallerySection.id = 'gd-gallery-section-' + destKey;
    gallerySection.innerHTML =
      '<div class="gd-section-title">PHOTOS (Commons)</div>' +
      '<div class="gd-gallery" id="gd-gallery-' + destKey + '">' +
        [1,2,3,4,5,6].map(function(){ return '<div class="gd-gallery-img loading"></div>'; }).join('') +
      '</div>';

    // Insert before first .gd-section that has "À NE PAS MANQUER"
    var sections = detail.querySelectorAll('.gd-section');
    var inserted = false;
    sections.forEach(function(s) {
      if (!inserted && s.querySelector('.gd-section-title') && /NE PAS|À NE/i.test(s.querySelector('.gd-section-title').textContent)) {
        detail.insertBefore(gallerySection, s);
        inserted = true;
      }
    });
    if (!inserted) detail.appendChild(gallerySection);

    injectWikiGallery(destKey);
  }, 60);
};

// ─── NOTES ÉDITABLES ───
var NotesStore = {
  KEY: 'ldva-notes-v1',
  get: function(city) {
    try { return (JSON.parse(localStorage.getItem(this.KEY) || '{}'))[city] || ''; } catch(e) { return ''; }
  },
  set: function(city, text) {
    try {
      var d = JSON.parse(localStorage.getItem(this.KEY) || '{}');
      if (text.trim()) d[city] = text.trim(); else delete d[city];
      localStorage.setItem(this.KEY, JSON.stringify(d));
    } catch(e) {}
  }
};

function openNoteEditor(city, btnEl) {
  // Toggle inline note editor
  var card = btnEl.closest('.stop-card') || btnEl.closest('.tl-card') || btnEl.closest('.summary-card');
  var existing = card.querySelector('.note-editor-block');
  if (existing) { existing.remove(); return; }

  var current = NotesStore.get(city);
  var block = document.createElement('div');
  block.className = 'note-editor-block';
  block.innerHTML =
    '<div class="note-editor-label">Note personnelle</div>' +
    '<textarea class="note-editor-ta" placeholder="Ajouter une note pour ' + city + '…" rows="3">' + current + '</textarea>' +
    '<div class="note-editor-actions">' +
      '<button class="note-btn note-save" onclick="saveNote(\'' + city.replace(/'/g,"\\'") + '\', this)">Enregistrer</button>' +
      '<button class="note-btn note-cancel" onclick="this.closest(\'.note-editor-block\').remove()">Annuler</button>' +
    '</div>';

  // Insert after checklist-row or at end of card-body-inner
  var inner = card.querySelector('.card-body-inner') || card;
  inner.appendChild(block);
  block.querySelector('textarea').focus();
}

function saveNote(city, btnEl) {
  var block = btnEl.closest('.note-editor-block');
  var ta = block.querySelector('textarea');
  NotesStore.set(city, ta.value);
  block.remove();
  // Update note display on card if it exists
  _refreshNoteDisplay(city);
}

function _refreshNoteDisplay(city) {
  // find note-display elements for this city and update them
  document.querySelectorAll('[data-note-city="' + city + '"]').forEach(function(el) {
    var note = NotesStore.get(city);
    el.textContent = note ? '📝 ' + note : '';
    el.style.display = note ? '' : 'none';
    var btn = el.previousElementSibling;
    if (btn && btn.classList.contains('note-edit-btn')) {
      btn.classList.toggle('has-note', !!note);
    }
  });
}

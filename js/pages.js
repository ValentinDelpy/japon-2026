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
    var popup = '<div class="popup-card"><div class="popup-img" style="background-image:url(\''+dest.image+'\')"></div><div class="popup-body">';
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

  groups.forEach(function(g, idx) {
    var coords = getCoords(g.city);
    var color = STOP_COLORS[idx % STOP_COLORS.length];
    if (!coords || seen[g.city]) { _dashState.markers.push(null); return; }
    seen[g.city] = true;
    var marker = L.marker(coords, {icon: makeStopIcon(idx+1, color, false)}).addTo(map);
    L.marker(coords,{icon:L.divIcon({className:'marker-label-wrapper',html:'<div class="marker-label">'+g.city+'</div>',iconSize:[100,20],iconAnchor:[-18,10]}),interactive:false}).addTo(map);

    var dest = findDestination(g.city);
    var acts = Array.isArray(g.activites) ? g.activites.filter(function(a){return a.trim();}) : [];
    var wx = g.startDate ? getWeatherForDate(g.city, g.startDate) : null;
    var popup = '<div class="popup-card">';
    popup += '<div class="popup-img" style="background-image:url(\''+dest.image+'\');position:relative">';
    popup += '<div style="position:absolute;bottom:0;left:0;right:0;padding:8px 10px;background:linear-gradient(transparent,rgba(0,0,0,0.65));color:#fff;font-family:\'Noto Serif JP\',serif;font-size:0.88rem;font-weight:700">'+g.city+(dest.nameJP ? ' <span style="font-size:0.7em;opacity:0.8">'+dest.nameJP+'</span>' : '')+'</div>';
    popup += '</div>';
    popup += '<div class="popup-body">';
    if (g.startDate) popup += '<div class="popup-dates">📅 '+formatDateRange(g)+' · '+nightsLabel(g)+'</div>';
    if (g.logement) popup += '<div class="popup-detail">🏨 <a href="'+getLodgeLink(g.logement)+'" target="_blank" class="cell-link">'+g.logement+'</a></div>';
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
    // Scroll within the stops-list container, not the whole page
    var list = document.getElementById('stops-list');
    if (list) {
      var cardTop = card.offsetTop;
      var listScrollTop = list.scrollTop;
      var listH = list.clientHeight;
      // Only scroll if card is out of view
      if (cardTop < listScrollTop || cardTop + card.offsetHeight > listScrollTop + listH) {
        list.scrollTo({ top: cardTop - 8, behavior: 'smooth' });
      }
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
      if (list) list.scrollTo({ top: card.offsetTop - 8, behavior: 'smooth' });
    }, 60);
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
  html += '<tr style="font-weight:700;background:var(--paper-warm)"><td colspan="3">TOTAL</td><td class="amount">'+formatEURint(totB)+'</td><td class="amount">'+formatEURint(totT)+'</td><td></td></tr>';
  html += '</tbody></table></div></div>';
  html += '<div class="budget-summary"><h3>Répartition par ville</h3>'+generateBudgetBars(groups)+'</div>';
  html += '</div></div>';

  document.getElementById('page-container').innerHTML = html;
  buildDashboardCards(groups);
  setTimeout(function(){ createDashboardMap(groups); }, 100);
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
    html += '<div class="itinerary-full-table mt-2 mb-2 extra-rows-card">';
    html += '<div class="map-title-bar">📊 Récapitulatif &amp; totaux</div>';
    html += '<div class="table-scroll"><table class="iti-table"><thead><tr>';
    cols.forEach(function(c){html+='<th>'+c+'</th>';});
    html += '</tr></thead><tbody>';
    extraRows.forEach(function(row) {
      html += '<tr>'; cols.forEach(function(c){ html += '<td>'+linkify(formatCellBool(row[c]||''))+'</td>'; }); html += '</tr>';
    });
    html += '</tbody></table></div></div>';
  }

  html += '<div class="itinerary-summary-cards mt-2">';
  groups.forEach(function(g) {
    if (!g.city) return;
    var lienLog = getLodgeLink(g.logement);
    var lienAlt = getLodgeLink(g.altLogement);
    html += '<div class="summary-card"><h3>📍 '+g.city+'</h3><ul class="summary-list">';
    html += '<li><span class="s-label">Dates</span><span class="s-value text-sm" style="font-family:\'DM Sans\'">'+formatDateRange(g)+'</span></li>';
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
    html += '<div class="guide-dest-thumb" style="background-image:url(\''+dest.image+'\')">';
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
  h += '<div class="guide-detail-hero" style="background-image:url(\''+dest.image+'\')">';
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
  document.body.appendChild(overlay);
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

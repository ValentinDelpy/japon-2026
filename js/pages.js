// =============================================
// PAGE RENDERERS — Little Domo Very Arigato
// =============================================

// ─── Coordinates ───
var COORDS = {
  "tokyo":[35.6762,139.6503],"shinjuku":[35.6938,139.7034],"shibuya":[35.6580,139.7016],
  "kyoto":[35.0116,135.7681],"osaka":[34.6937,135.5023],"hiroshima":[34.3853,132.4553],
  "nara":[34.6851,135.8048],"hakone":[35.2326,139.1070],"nikko":[36.7199,139.6982],
  "kamakura":[35.3192,139.5467],"kanazawa":[36.5613,136.6562],"takayama":[36.1461,137.2522],
  "fuji":[35.3606,138.7274],"kawaguchiko":[35.5139,138.7553],
  "miyajima":[34.2960,132.3198],"koyasan":[34.2131,135.5833],
  "narita":[35.7720,140.3929],"kobe":[34.6901,135.1955],
  "yokohama":[35.4437,139.6380],"nagoya":[35.1815,136.9066],
  "fukuoka":[33.5902,130.4017],"sapporo":[43.0618,141.3545],
  "matsumoto":[36.2381,137.9720],"shirakawago":[36.2574,136.9060],
  "magome":[35.5314,137.5600],"tsumago":[35.5314,137.5600],
  "toulouse":[43.6047,1.4442]
};

function getCoords(name) {
  if (!name) return null;
  var n = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9\s]/g,"").trim();
  for (var k in COORDS) {
    if (n.includes(k) || k.includes(n.split(/\s/)[0])) return COORDS[k];
  }
  return null;
}

// ─── Formatters ───
function parseBudget(str) {
  if (!str) return 0;
  return parseFloat(String(str).replace(/[^0-9.,\-]/g,'').replace(',','.')) || 0;
}
function formatEUR(v) {
  var n = parseFloat(v); if (isNaN(n) || !v) return '—';
  return n.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2}) + ' €';
}
function formatEURint(v) {
  var n = parseFloat(v); if (isNaN(n) || !v) return '—';
  return n.toLocaleString('fr-FR',{minimumFractionDigits:0,maximumFractionDigits:0}) + ' €';
}
function formatDateFR(d) {
  if (!d) return '';
  var days = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
  var months = ['jan','fév','mar','avr','mai','juin','juil','août','sep','oct','nov','déc'];
  return days[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()];
}
function formatDateRange(g) {
  if (!g.startDate) return '';
  var months = ['jan','fév','mar','avr','mai','juin','juil','août','sep','oct','nov','déc'];
  var s = formatDateFR(g.startDate);
  if (!g.endDate || g.endDate.getTime() === g.startDate.getTime()) return s;
  var e = formatDateFR(g.endDate);
  // If same month, drop month from start
  if (g.startDate.getMonth() === g.endDate.getMonth()) {
    var days = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
    s = days[g.startDate.getDay()] + ' ' + g.startDate.getDate();
  }
  return s + ' → ' + e;
}
function nightsLabel(g) {
  var n = g.nights || 0;
  if (!n) return '1 nuit';
  return (n+1) + ' nuit' + (n > 0 ? 's' : '');
}

// ─── Link rendering ───
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

// ─── Maps ───
var maps = {};
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
    // Rich popup
    var dest = findDestination(g.city || g.lieu);
    var popup = '<div class="popup-card">';
    popup += '<div class="popup-img" style="background-image:url(\''+dest.image+'\')"></div>';
    popup += '<div class="popup-body">';
    popup += '<div class="popup-title">'+(g.city||g.lieu);
    if (dest.nameJP) popup += ' <span class="popup-jp">'+dest.nameJP+'</span>';
    popup += '</div>';
    if (g.startDate) popup += '<div class="popup-dates">📅 '+formatDateRange(g)+'</div>';
    if (g.logement) popup += '<div class="popup-detail">🏨 '+g.logement+'</div>';
    if (g.dureeTrajet) popup += '<div class="popup-detail">🚅 '+g.dureeTrajet+'</div>';
    var acts = (g.activites||[]).join(', ')||(g.activites||'');
    if (acts) popup += '<div class="popup-detail popup-activities">🎯 '+acts+'</div>';
    var city = g.city || g.lieu;
    popup += '<a class="popup-cta" onclick="openGuideDetail(\''+encodeURIComponent(city)+'\')" href="javascript:void(0)">Voir la fiche complète →</a>';
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
function highlightMapMarker(mapId,idx) {
  var map = maps[mapId]; if (!map) return;
  var groups = DataService.getGroups();
  if (idx >= groups.length) return;
  var coords = getCoords(groups[idx].city);
  if (coords) map.flyTo(coords,10,{duration:0.8});
}

// ═══════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════
function renderDashboard() {
  var groups = DataService.getGroups();
  var rate = DataService.exchangeRate;
  var totalBudget=0, totalTrajet=0, seen={}, places=[];
  groups.forEach(function(g) {
    totalBudget += parseBudget(g.prix);
    totalTrajet += parseBudget(g.prixTrajet);
    if (g.city && !seen[g.city]) { seen[g.city]=true; places.push(g.city); }
  });
  var grand = totalBudget + totalTrajet;
  var first = groups.length ? formatDateFR(groups[0].startDate) : '—';
  var last  = groups.length ? formatDateFR(groups[groups.length-1].endDate||groups[groups.length-1].startDate) : '—';
  var resCnt = groups.filter(function(g){ return g.reserve && /oui/i.test(g.reserve); }).length;

  var html = '<div class="page-header"><h1>Dashboard <span class="jp-accent" style="opacity:0.3;font-size:0.6em">旅の概要</span></h1>';
  html += '<p class="subtitle">Vue d\'ensemble de votre voyage au Japon</p></div>';

  html += '<div class="stats-row">';
  html += '<div class="stat-card"><div class="stat-label">Destinations</div><div class="stat-value indigo">'+places.length+'</div><div class="stat-detail">'+groups.length+' étapes</div></div>';
  html += '<div class="stat-card"><div class="stat-label">Période</div><div class="stat-value teal" style="font-size:1rem">'+first+' → '+last+'</div></div>';
  html += '<div class="stat-card"><div class="stat-label">Budget logement</div><div class="stat-value vermillion" style="font-size:1.1rem">'+formatEURint(totalBudget)+'</div></div>';
  html += '<div class="stat-card"><div class="stat-label">Budget transport</div><div class="stat-value gold" style="font-size:1.1rem">'+formatEURint(totalTrajet)+'</div></div>';
  html += '<div class="stat-card"><div class="stat-label">Total estimé</div><div class="stat-value bamboo" style="font-size:1rem">'+formatEURint(grand)+'</div><div class="stat-detail">Réservé : '+resCnt+'/'+groups.length+'</div></div>';
  html += '</div>';

  html += '<div class="dashboard-grid">';
  html += '<div class="map-container"><div class="map-title-bar">🗾 Carte de l\'itinéraire</div><div id="dashboard-map"></div></div>';

  html += '<div class="timeline-container"><div class="map-title-bar">📍 Étapes du voyage</div><div class="timeline-list">';
  groups.forEach(function(g,i) {
    if (!g.city) return;
    var p = parseBudget(g.prixPersonne);
    html += '<div class="timeline-item" onclick="highlightMapMarker(\'dashboard-map\','+i+')">';
    html += '<div class="timeline-number">'+(i+1)+'</div>';
    html += '<div class="timeline-info">';
    html += '<div class="timeline-place">'+g.city+'</div>';
    html += '<div class="timeline-dates">'+formatDateRange(g)+'</div>';
    html += '<div class="timeline-tags">';
    if (g.dureeTrajet) html += '<span class="tag transport">🚅 '+g.dureeTrajet+'</span>';
    if (g.reserve) html += '<span class="tag nights">'+((/oui/i.test(g.reserve)?'✅':'⏳'))+' '+g.reserve+'</span>';
    if (p) html += '<span class="tag budget">'+formatEURint(p)+'/pers.</span>';
    html += '</div></div></div>';
  });
  html += '</div></div></div>';

  // Budget table
  html += '<div class="budget-section mt-3"><div class="budget-grid">';
  html += '<div class="budget-table-wrap"><div class="map-title-bar">💰 Détail du budget</div><div class="table-scroll"><table class="budget-table">';
  html += '<thead><tr><th>#</th><th>Dates</th><th>Lieu</th><th>Logement</th><th>Transport</th><th>Réservé</th></tr></thead><tbody>';
  groups.forEach(function(g,i) {
    if (!g.city) return;
    var p=parseBudget(g.prix), t=parseBudget(g.prixTrajet);
    html += '<tr><td>'+(i+1)+'</td>';
    html += '<td class="text-sm">'+formatDateRange(g)+'</td>';
    html += '<td>'+g.city+'</td>';
    html += '<td class="amount">'+(p?formatEURint(p):'—')+'</td>';
    html += '<td class="amount">'+(t?formatEURint(t):'—')+'</td>';
    html += '<td class="text-sm">'+(g.reserve||'—')+'</td></tr>';
  });
  var totB=0,totT=0;
  groups.forEach(function(g){totB+=parseBudget(g.prix);totT+=parseBudget(g.prixTrajet);});
  html += '<tr style="font-weight:700;background:var(--paper-warm)"><td></td><td></td><td>TOTAL</td>';
  html += '<td class="amount">'+formatEURint(totB)+'</td><td class="amount">'+formatEURint(totT)+'</td><td></td></tr>';
  html += '</tbody></table></div></div>';
  html += '<div class="budget-summary"><h3>Répartition par ville</h3>'+generateBudgetBars(groups)+'</div>';
  html += '</div></div>';

  document.getElementById('page-container').innerHTML = html;
  setTimeout(function(){createMap('dashboard-map',groups);},100);
}

function generateBudgetBars(groups) {
  var by={};
  groups.forEach(function(g){ if(g.city) by[g.city]=(by[g.city]||0)+parseBudget(g.prix)+parseBudget(g.prixTrajet); });
  var total=Object.values(by).reduce(function(a,b){return a+b;},0);
  if (!total) return '<p class="text-muted text-sm">Aucune donnée budget</p>';
  var colors=['#c73e1d','#264653','#2a9d8f','#e9c46a','#e76f51','#606c38','#2a6478','#d4a843','#40b5a6','#789048'];
  return Object.entries(by).sort(function(a,b){return b[1]-a[1];}).map(function(e,i){
    var pct=(e[1]/total*100).toFixed(1);
    return '<div class="budget-bar-item"><div class="budget-bar-label"><span class="cat">'+e[0]+'</span><span class="val">'+pct+'% · '+formatEURint(e[1])+'</span></div>'+
           '<div class="budget-bar"><div class="budget-bar-fill" style="width:'+pct+'%;background:'+colors[i%colors.length]+'"></div></div></div>';
  }).join('');
}

// ═══════════════════════════════════════════════
// ITINERAIRE
// ═══════════════════════════════════════════════
function renderItinerary() {
  var groups = DataService.getGroups();
  var cols = DataService.getCols();
  var rows = DataService.getRows();
  var rate = DataService.exchangeRate;

  var html = '<div class="page-header"><h1>Itinéraire <span class="jp-accent" style="opacity:0.3;font-size:0.6em">旅程</span></h1>';
  html += '<p class="subtitle">Détail complet de votre parcours</p></div>';
  html += '<div class="map-container mb-2"><div class="map-title-bar">🗾 Tracé complet</div><div id="itinerary-map"></div></div>';

  // Converter card
  html += renderConverterCard(rate);

  // Find date col name
  var dateCol = cols.find(function(c){return /jour|date|day/i.test(c);}) || cols[0] || '';
  function isDateRow(row) {
    var v = String(row[dateCol]||'').trim();
    return /\d{1,2}[\/\-]\d{1,2}/.test(v);
  }
  function hasContent(row) { return cols.some(function(c){return row[c]&&String(row[c]).trim();}); }

  var mainRows = rows.filter(isDateRow);
  var extraRows = rows.filter(function(r){return !isDateRow(r)&&hasContent(r);});

  html += '<div class="itinerary-full-table mt-2 mb-2">';
  html += '<div class="map-title-bar flex-between"><span>📋 Données du spreadsheet</span><span class="text-sm text-muted">'+mainRows.length+' étapes</span></div>';
  html += '<div class="table-scroll"><table class="iti-table"><thead><tr>';
  cols.forEach(function(c){html+='<th>'+c+'</th>';});
  html += '</tr></thead><tbody>';
  mainRows.forEach(function(row){
    html += '<tr>';
    cols.forEach(function(c){
      var v=row[c]||'';
      var cls='';
      if(/jour|date/i.test(c)) cls='row-date';
      else if(/lieu|ville/i.test(c)) cls='row-place';
      else if(/prix|coût/i.test(c)) cls='row-amount';
      html += '<td class="'+cls+'">'+linkify(v)+'</td>';
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
    extraRows.forEach(function(row){
      html += '<tr>';
      cols.forEach(function(c){
        html += '<td>'+linkify(row[c]||'')+'</td>';
      });
      html += '</tr>';
    });
    html += '</tbody></table></div></div>';
  }

  // City summary cards
  html += '<div class="itinerary-summary-cards mt-2">';
  groups.forEach(function(g){
    if (!g.city) return;
    html += '<div class="summary-card"><h3>📍 '+g.city+'</h3><ul class="summary-list">';
    html += '<li><span class="s-label">Dates</span><span class="s-value text-sm" style="font-family:\'DM Sans\'">'+formatDateRange(g)+'</span></li>';
    html += '<li><span class="s-label">Nuits</span><span class="s-value">'+nightsLabel(g)+'</span></li>';
    if (parseBudget(g.prix)) html += '<li><span class="s-label">Logement</span><span class="s-value">'+formatEURint(parseBudget(g.prix))+'</span></li>';
    if (parseBudget(g.prixTrajet)) html += '<li><span class="s-label">Transport</span><span class="s-value">'+formatEURint(parseBudget(g.prixTrajet))+'</span></li>';
    if (g.logement) html += '<li><span class="s-label">Hébergement</span><span class="s-value text-sm" style="font-family:\'DM Sans\';text-align:right;max-width:60%">'+linkify(g.logement)+'</span></li>';
    if (g.activites && g.activites.length) {
      var acts = Array.isArray(g.activites) ? g.activites.join(' / ') : g.activites;
      html += '<li style="flex-direction:column;gap:4px"><span class="s-label">Activités</span><span class="text-sm" style="opacity:0.65;padding-top:2px">'+acts+'</span></li>';
    }
    html += '</ul></div>';
  });
  html += '</div>';

  document.getElementById('page-container').innerHTML = html;
  setTimeout(function(){createMap('itinerary-map',groups);},100);
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
    '</div><div class="converter-info">Taux : 1 € = <strong>'+(rate?rate.toFixed(2):'—')+' ¥</strong> — actualisé automatiquement</div>'+
    '</div></div>';
}
function convertJPY() {
  var input=document.getElementById('jpy-amount'), output=document.getElementById('eur-result');
  if(!input||!output) return;
  var amount=parseFloat(input.value), rate=DataService.exchangeRate;
  if(isNaN(amount)||!rate){output.textContent='—';return;}
  output.textContent=(amount/rate).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})+' €';
}

// ═══════════════════════════════════════════════
// GUIDES — Destination card list + detail overlay
// ═══════════════════════════════════════════════
function renderGuides() {
  var groups = DataService.getGroups();
  // Filter out transit-only entries (airports without logement or activities)
  var dests = groups.filter(function(g){
    if (!g.city) return false;
    var isTransit = /aéroport|airport/i.test(g.city) && !g.logement && !(g.activites&&g.activites.length);
    return !isTransit;
  });

  var html = '<div class="page-header"><h1>Fiches Voyage <span class="jp-accent" style="opacity:0.3;font-size:0.6em">旅のガイド</span></h1>';
  html += '<p class="subtitle">Cliquez sur une destination pour voir la fiche complète</p></div>';
  html += '<div class="guides-dest-list">';

  dests.forEach(function(g, i) {
    var dest = findDestination(g.city);
    var acts = Array.isArray(g.activites) ? g.activites : (g.activites ? [g.activites] : []);
    var actCount = acts.filter(function(a){return a.trim();}).length;
    var weather = null;
    if (g.startDate) weather = getWeatherForDate(g.city, g.startDate);
    var pPers = parseBudget(g.prixPersonne);

    html += '<div class="guide-dest-card" onclick="openGuideDetail('+i+')" style="animation-delay:'+(i*0.07)+'s">';

    // Left: thumbnail
    html += '<div class="guide-dest-thumb" style="background-image:url(\''+dest.image+'\')"><div class="guide-dest-num">'+(i+1)+'</div></div>';

    // Middle: info
    html += '<div class="guide-dest-info">';
    html += '<div class="guide-dest-header">';
    html += '<div>';
    html += '<div class="guide-dest-city">'+g.city+(dest.nameJP?' <span class="guide-dest-jp">'+dest.nameJP+'</span>':'')+'</div>';
    html += '<div class="guide-dest-dates">'+formatDateRange(g)+' · '+nightsLabel(g)+'</div>';
    html += '</div>';
    if (g.dureeTrajet) html += '<div class="guide-dest-trajet">🚅 '+g.dureeTrajet+'</div>';
    html += '</div>';

    // Tags row
    html += '<div class="guide-dest-tags">';
    if (pPers) html += '<span class="dest-tag dest-tag-price">🏠 '+formatEURint(pPers)+'/pers.</span>';
    if (actCount) html += '<span class="dest-tag dest-tag-act">📍 '+actCount+' activité'+(actCount>1?'s':'')+'</span>';
    if (weather) html += '<span class="dest-tag dest-tag-temp">'+weather.icon+' '+weather.high+'°C</span>';
    if (g.reserve && /oui/i.test(g.reserve)) html += '<span class="dest-tag dest-tag-ok">✅ Réservé</span>';
    html += '</div>';

    // Preview: logement
    if (g.logement) html += '<div class="guide-dest-preview">🏨 '+g.logement+(g.altLogement?' · <span style="opacity:0.6">alt: '+g.altLogement+'</span>':'')+'</div>';
    if (acts.length) html += '<div class="guide-dest-preview" style="font-size:0.78rem;opacity:0.55">'+acts.slice(0,2).join(' · ')+(acts.length>2?' +'+( acts.length-2):'')+'</div>';

    html += '</div>';

    // Right: CTA
    html += '<div class="guide-dest-cta">›</div>';
    html += '</div>';
  });

  html += '</div>';
  document.getElementById('page-container').innerHTML = html;

  // Store for detail access
  window._guideDests = dests;
}

// ─── Detail overlay ───
function openGuideDetail(idxOrName) {
  var groups = window._guideDests || DataService.getGroups();
  var g;
  if (typeof idxOrName === 'number') {
    g = groups[idxOrName];
  } else {
    var name = decodeURIComponent(idxOrName);
    g = groups.find(function(x){ return x.city && x.city.toLowerCase().includes(name.toLowerCase()); });
    if (!g) {
      // Fallback: create a minimal group
      g = { city: name, activites: [], dates: [] };
    }
  }
  if (!g) return;

  var dest = findDestination(g.city);
  var acts = Array.isArray(g.activites) ? g.activites.filter(function(a){return a.trim();}) : (g.activites ? [g.activites] : []);
  var allDest = (dest.highlights || []).concat([]);
  var pPers = parseBudget(g.prixPersonne);
  var pTotal = parseBudget(g.prix);
  var pTrajet = parseBudget(g.prixTrajet);

  // Remove existing overlay
  var old = document.querySelector('.guide-detail-overlay');
  if (old) old.remove();

  var overlay = document.createElement('div');
  overlay.className = 'guide-detail-overlay';
  overlay.onclick = function(e){ if(e.target===overlay) overlay.remove(); };

  // ─ Build content ─
  var h = '<div class="guide-detail">';

  // Hero
  h += '<div class="guide-detail-hero" style="background-image:url(\''+dest.image+'\')">';
  h += '<button class="guide-close" onclick="this.closest(\'.guide-detail-overlay\').remove()">×</button>';
  h += '<div class="guide-detail-hero-content">';
  h += '<div class="guide-detail-etape">ÉTAPE '+(String((window._guideDests||[]).indexOf(g)+1).padStart(2,'0')||'—')+'<span class="guide-detail-range">'+formatDateRange(g)+'</span></div>';
  h += '<h1>'+g.city+(dest.nameJP?' <span style="opacity:0.6;font-size:0.55em;font-weight:400">'+dest.nameJP+'</span>':'')+'</h1>';
  h += '</div></div>';

  // Tags bar
  h += '<div class="guide-detail-tagbar">';
  if (pPers) h += '<span class="dtag dtag-price">🏠 '+formatEURint(pPers)+'/pers.</span>';
  if (acts.length) h += '<span class="dtag dtag-act">📍 '+acts.length+' activité'+(acts.length>1?'s':'')+'</span>';
  var wx = g.startDate ? getWeatherForDate(g.city, g.startDate) : null;
  if (wx) h += '<span class="dtag dtag-temp">'+wx.icon+' '+wx.high+'°C</span>';
  if (pTotal) h += '<span class="dtag dtag-price">💰 '+formatEURint(pTotal)+' total</span>';
  h += '</div>';

  h += '<div class="guide-detail-body">';

  // Hébergement
  if (g.logement || g.altLogement) {
    h += '<div class="gd-section">';
    h += '<div class="gd-section-title">HÉBERGEMENT</div>';
    if (g.logement) {
      h += '<div class="gd-logement gd-logement-choix">';
      h += '<span class="gd-log-badge">CHOIX 1</span>';
      h += '<span class="gd-log-name">'+linkify(g.logement)+'</span>';
      if (pTotal) h += '<span class="gd-log-price">'+formatEURint(pTotal)+' €</span>';
      h += '<span class="gd-log-arrow">→</span>';
      h += '</div>';
    }
    if (g.altLogement) {
      h += '<div class="gd-logement gd-logement-alt">';
      h += '<span class="gd-log-badge gd-log-badge-alt">ALT</span>';
      h += '<span class="gd-log-name">'+linkify(g.altLogement)+'</span>';
      h += '<span class="gd-log-arrow">→</span>';
      h += '</div>';
    }
    if (g.reserve) h += '<div class="gd-reserve">'+((/oui/i.test(g.reserve))?'✅ Réservé':'⏳ '+g.reserve)+(g.billetsRes?' · 🎫 '+linkify(g.billetsRes):'')+'</div>';
    if (pTrajet) {
      h += '<div class="gd-transport">';
      h += '🚅 Trajet '+( g.dureeTrajet||'')+'<span class="gd-trajet-price">'+formatEURint(parseBudget(g.prixTrajet))+'/pers.</span>';
      h += '</div>';
    }
    h += '</div>';
  }

  // Activités
  var allActs = acts.slice();
  // Also add activities from destination highlights as suggestions
  if (allActs.length > 0) {
    h += '<div class="gd-section">';
    h += '<div class="gd-section-title">ACTIVITÉS</div>';
    h += '<div class="gd-act-chips">';
    allActs.forEach(function(a){ h += '<span class="gd-chip">'+a+'</span>'; });
    h += '</div>';
    h += '</div>';
  }

  // Météo historique
  if (g.dates && g.dates.length > 0) {
    h += '<div class="gd-section">';
    h += '<div class="gd-section-title">MÉTÉO (HISTORIQUE)</div>';
    h += '<div class="gd-weather-grid">';
    g.dates.forEach(function(d) {
      var w = getWeatherForDate(g.city, d);
      if (!w) return;
      var months=['jan','fév','mar','avr','mai','juin','juil','août','sep','oct','nov','déc'];
      h += '<div class="gd-weather-day">';
      h += '<div class="gd-wx-date">'+d.getDate()+' '+months[d.getMonth()]+'</div>';
      h += '<div class="gd-wx-icon">'+w.icon+'</div>';
      h += '<div class="gd-wx-high">'+w.high+'°</div>';
      h += '<div class="gd-wx-low">'+w.low+'°</div>';
      h += '<div class="gd-wx-rain">💧'+w.rain+'%</div>';
      h += '</div>';
    });
    h += '</div>';
    if (wx && wx.desc) h += '<p class="gd-weather-desc">'+wx.desc+'</p>';
    h += '</div>';
  }

  // Description destination
  if (dest.intro) {
    h += '<div class="gd-section">';
    h += '<p class="gd-intro">'+dest.intro+'</p>';
    h += '</div>';
  }

  // Note (infos supplémentaires du sheet)
  if (g.infos) {
    h += '<div class="gd-section">';
    h += '<div class="gd-section-title">NOTE</div>';
    h += '<div class="gd-note">⭐ '+linkify(g.infos)+'</div>';
    h += '</div>';
  }

  // À ne pas manquer
  if (dest.highlights && dest.highlights.length) {
    h += '<div class="gd-section">';
    h += '<div class="gd-section-title">À NE PAS MANQUER</div>';
    h += '<ul class="gd-highlights">';
    dest.highlights.forEach(function(hl){ h += '<li>'+hl+'</li>'; });
    h += '</ul></div>';
  }

  // Restaurants
  if (dest.restaurants && dest.restaurants.length) {
    h += '<div class="gd-section">';
    h += '<div class="gd-section-title">OÙ MANGER</div>';
    h += '<div class="gd-restos">';
    dest.restaurants.forEach(function(r){
      h += '<div class="gd-resto"><div class="gd-resto-name">'+r.name+'</div>';
      h += '<div class="gd-resto-type">'+r.type+'</div>';
      h += '<div class="gd-resto-desc">'+r.desc+'</div>';
      h += '<div class="gd-resto-price">'+r.price+'</div></div>';
    });
    h += '</div></div>';
  }

  // Conseils
  if (dest.tips) {
    h += '<div class="gd-section">';
    h += '<div class="gd-section-title">CONSEILS PRATIQUES</div>';
    h += '<div class="gd-tips">'+dest.tips+'</div>';
    h += '</div>';
  }

  h += '</div></div>';
  overlay.innerHTML = h;
  document.body.appendChild(overlay);
}

// ═══════════════════════════════════════════════
// PRINT
// ═══════════════════════════════════════════════
function renderPrint() {
  var groups = DataService.getGroups();
  var calendarData = buildCalendarData(groups);
  var html = '<div class="page-header"><h1>Impression <span class="jp-accent" style="opacity:0.3;font-size:0.6em">印刷</span></h1>';
  html += '<p class="subtitle">Calendrier et carte, optimisés pour l\'impression</p></div>';
  html += '<div class="print-actions no-print"><button class="btn btn-primary" onclick="window.print()">🖨️ Imprimer / PDF</button>';
  html += '<button class="btn btn-secondary" onclick="togglePrintFullscreen()">📄 Aperçu plein écran</button></div>';
  html += '<div class="print-map-section mb-2"><div class="map-title-bar">🗾 Carte</div><div id="print-map"></div></div>';
  calendarData.months.forEach(function(month){
    html += '<div class="print-calendar mb-2"><div class="calendar-header">'+month.label+'</div><div class="calendar-grid">';
    ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].forEach(function(d){ html += '<div class="calendar-day-header">'+d+'</div>'; });
    month.days.forEach(function(day){
      if (!day) { html += '<div class="calendar-day empty"></div>'; return; }
      var events = calendarData.events[day.dateStr] || [];
      html += '<div class="calendar-day'+(day.isToday?' today':'')+'">';
      html += '<div class="day-num">'+day.num+'</div>';
      events.forEach(function(e){ html += '<div class="day-event">'+e.city+'</div>'; });
      html += '</div>';
    });
    html += '</div></div>';
  });
  html += '<div class="itinerary-full-table mt-2"><div class="map-title-bar">📋 Étapes</div><div class="table-scroll"><table class="iti-table"><thead><tr>';
  html += '<th>#</th><th>Dates</th><th>Lieu</th><th>Logement</th><th>Activités</th><th>Transport</th><th>Budget</th></tr></thead><tbody>';
  groups.forEach(function(g,i){
    if (!g.city) return;
    var acts = Array.isArray(g.activites) ? g.activites.join(', ') : (g.activites||'');
    html += '<tr><td>'+(i+1)+'</td><td class="row-date">'+formatDateRange(g)+'</td><td class="row-place">'+g.city+'</td>';
    html += '<td class="text-sm">'+(g.logement||'—')+'</td><td class="text-sm">'+(acts||'—')+'</td>';
    html += '<td class="text-sm">'+(g.dureeTrajet||'—')+'</td><td class="row-amount">'+(parseBudget(g.prix)?formatEURint(parseBudget(g.prix)):'—')+'</td></tr>';
  });
  html += '</tbody></table></div></div>';
  document.getElementById('page-container').innerHTML = html;
  setTimeout(function(){createMap('print-map',groups);},100);
}

function buildCalendarData(groups) {
  var dates=[], events={};
  groups.forEach(function(g){
    (g.dates||[]).forEach(function(d){
      var ds=fmtDs(d);
      dates.push(d);
      if (!events[ds]) events[ds]=[];
      events[ds].push(g);
    });
  });
  if (!dates.length) return {months:[],events:events};
  var min=new Date(Math.min.apply(null,dates)), max=new Date(Math.max.apply(null,dates));
  max.setDate(max.getDate()+2);
  var months=[], cur=new Date(min.getFullYear(),min.getMonth(),1);
  var MN=['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  while(cur<=max){
    var yr=cur.getFullYear(), mo=cur.getMonth();
    var fd=new Date(yr,mo,1), pad=fd.getDay()-1; if(pad<0)pad=6;
    var dim=new Date(yr,mo+1,0).getDate(), today=fmtDs(new Date()), days=[];
    for(var i=0;i<pad;i++) days.push(null);
    for(var d=1;d<=dim;d++){var dt=new Date(yr,mo,d),ds=fmtDs(dt);days.push({num:d,dateStr:ds,isToday:ds===today});}
    months.push({label:MN[mo]+' '+yr,days:days});
    cur=new Date(yr,mo+1,1);
  }
  return {months:months,events:events};
}
function fmtDs(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function togglePrintFullscreen(){document.body.classList.toggle('print-preview-mode');}

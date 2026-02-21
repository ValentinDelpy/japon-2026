// ═══════════════════════════════════════════════════════════════════
// PAGES-NEW.JS — 8 nouvelles pages
// Restos & Souvenirs · Packing · Check-list · Logistique
// Phrasebook · Japon 101 · Surprise-moi · Stats
// ═══════════════════════════════════════════════════════════════════

// ── Shared localStorage helpers ──────────────────────────────────────
var NewPagesStore = {
  get: function(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch(e) { return null; } },
  set: function(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) {} },
  getObj: function(k) { return this.get(k) || {}; },
  toggle: function(k, id) {
    var d = this.getObj(k);
    d[id] = !d[id];
    this.set(k, d);
    return d[id];
  }
};

// ── Shared page header helper ──────────────────────────────────────────
function _newPageHeader(icon, title, titleJP, subtitle) {
  return '<div class="page-header">' +
    '<h1>' + icon + ' ' + title + ' <span class="jp-accent" style="opacity:.3;font-size:.6em">' + titleJP + '</span></h1>' +
    '<p class="subtitle">' + subtitle + '</p>' +
  '</div>';
}

// ═══════════════════════════════════════════════════════════════════
// 1. RESTOS & SOUVENIRS
// ═══════════════════════════════════════════════════════════════════
var _restoFilter = 'all';
var _tabRestos = 'restos';

var SOUVENIRS_DATA = {
  tokyo: {
    nameJP: '東京',
    items: [
      { name: 'Kit Kat saveurs japonaises', cat: 'Foodie', desc: 'Matcha, sakura, wasabi, sake, melon... Achetez des boîtes cadeaux dans les supermarchés ou convenience stores.', price: '¥500–1,200', icon: '🍫' },
      { name: 'Capsule toy (gachapon)', cat: 'Gadget', desc: 'Distributeurs partout dans Akihabara et les centres commerciaux. Objets insolites, figurines, mini-reproductions de plats japonais.', price: '¥200–500', icon: '🎰' },
      { name: 'Furoshiki (carré de tissu)', cat: 'Textile', desc: 'Tissu multifonction pour emballer, transporter, décorer. Trouvez-en dans les grands magasins (Tokyu, Isetan).', price: '¥800–3,500', icon: '🎁' },
      { name: 'Figurines / mangas Akihabara', cat: 'Pop Culture', desc: 'Quartier de l\'électronique et de l\'anime. Les échoppes Don Quijote débordent de merch officiel. Vérifiez les authentiques.', price: '¥500–10,000+', icon: '🤖' },
      { name: 'Papeterie japonaise (Tokyu Hands)', cat: 'Papeterie', desc: 'Stylos, masking tapes, carnets Hobonichi, agendas... La papeterie japonaise est un art. Tokyu Hands est LA référence.', price: '¥300–3,000', icon: '✏️' },
      { name: 'Cosmétiques japonais', cat: 'Beauté', desc: 'SK-II, Shiseido, Hada Labo, Kose... moins chers qu\'en Europe. Les pharmacies Matsumoto Kiyoshi sont incontournables.', price: '¥500–5,000', icon: '🧴' },
    ]
  },
  kyoto: {
    nameJP: '京都',
    items: [
      { name: 'Thé matcha haut de gamme', cat: 'Foodie', desc: 'Uji (Kyoto) = capitale mondiale du matcha. Achetez en vrac chez Ippodo ou Marukyu-Koyamaen. Goûtez avant d\'acheter.', price: '¥1,500–6,000', icon: '🍵' },
      { name: 'Éventail (sensu) peint à la main', cat: 'Artisanat', desc: 'Éventails en bambou et papier washi peints à la main, spécialité millénaire. Les boutiques de Gion en vendent de toutes gammes.', price: '¥1,500–12,000', icon: '🪭' },
      { name: 'Wagashi (confiseries)', cat: 'Foodie', desc: 'Mochi, daifuku, yokan, higashi... Les pâtisseries japonaises sont comestibles et contemplatives. Achetez dans une confiserie traditionnelle.', price: '¥200–600', icon: '🍡' },
      { name: 'Noren (rideau de porte)', cat: 'Décoration', desc: 'Tissu imprimé suspendu à l\'entrée des boutiques et maisons. Certains artisans vendent des pièces uniques dans Higashiyama.', price: '¥2,500–10,000', icon: '🎏' },
      { name: 'Yukata ou kimono simple', cat: 'Textile', desc: 'Les secondhand shops de Kyoto (Kokoroya, etc.) vendent des kimono vintage abordables. Un souvenir textile spectaculaire.', price: '¥2,000–15,000', icon: '👘' },
    ]
  },
  osaka: {
    nameJP: '大阪',
    items: [
      { name: 'Bâtons de Pocky / Pretz saveurs rares', cat: 'Foodie', desc: 'Saveurs régionales (takoyaki, okonomiyaki, mentai...) introuvables en Europe. Les supermarchés en regorgent.', price: '¥300–600', icon: '🍬' },
      { name: 'Sauce takoyaki originale', cat: 'Foodie', desc: 'Sauce Otafuku, aonori, katsuobushi en paquet — pour reproduire le takoyaki à la maison. Disponible dans tout konbini.', price: '¥400–900', icon: '🐙' },
      { name: 'Assaisonnements et épices japonaises', cat: 'Foodie', desc: 'Miso en différentes variétés, dashi, ponzu, shichimi togarashi... Les épiceries de Kuromon Market sont idéales.', price: '¥300–1,500', icon: '🧂' },
      { name: 'Peluches et dérivés Universal Studios', cat: 'Pop Culture', desc: 'Si vous visitez USJ : les exclusivités Nintendo, Minions, Harry Potter ne se trouvent qu\'ici.', price: '¥1,500–5,000', icon: '🎮' },
    ]
  },
  hiroshima: {
    nameJP: '広島',
    items: [
      { name: 'Momiji manju', cat: 'Foodie', desc: 'Gâteau en forme de feuille d\'érable fourré pâte de haricot, crème ou chocolat. Spécialité absolue de Miyajima — mangez-les chauds.', price: '¥150–400', icon: '🍁' },
      { name: 'Origami et papier washi', cat: 'Artisanat', desc: 'Papier japonais traditionnel teinté. Idéal pour plier des grues de la paix comme au Mémorial (1 000 grues = un vœu exaucé).', price: '¥500–2,500', icon: '🕊️' },
      { name: 'Spatule en bois (shamoji) de Miyajima', cat: 'Artisanat', desc: 'La shamoji artisanale de Miyajima est un symbole de fortune. La plus grande du monde mesure 7,7m.', price: '¥800–3,000', icon: '🥄' },
      { name: 'Sauce aux huîtres de Miyajima', cat: 'Foodie', desc: 'Sauce aux huîtres de la mer intérieure de Seto, ramenée en bouteille. Introuvable en France.', price: '¥600–1,200', icon: '🦪' },
    ]
  },
  nara: {
    nameJP: '奈良',
    items: [
      { name: 'Encens (senko) artisanal', cat: 'Artisanat', desc: 'Nara est l\'un des principaux centres de production d\'encens bouddhiste du Japon. Parfums de bois, de temples, de montagne.', price: '¥800–4,000', icon: '🕯️' },
      { name: 'Crackers pour cerfs (shika senbei)', cat: 'Fun', desc: 'À acheter sur place pour nourrir les cerfs sacrés. Attention : les cerfs mordent si vous en avez et ne donnez pas !', price: '¥200', icon: '🦌' },
      { name: 'Figurines de cerfs (shika)', cat: 'Artisanat', desc: 'Statuettes en bois, céramique ou tissu. Les cerfs de Nara sont classés trésor national — ramenez-en un en souvenir.', price: '¥500–3,000', icon: '🫎' },
    ]
  },
  kanazawa: {
    nameJP: '金沢',
    items: [
      { name: 'Céramique Kutani', cat: 'Artisanat', desc: 'Porcelaine aux couleurs vives (rouge, bleu, vert, noir, jaune) — spécialité de la région depuis 1655. Assiettes, tasses, vases.', price: '¥2,000–20,000', icon: '🏺' },
      { name: 'Feuilles d\'or comestibles (kinpaku)', cat: 'Artisanat', desc: 'Kanazawa produit 99% de l\'or en feuilles du Japon. À rapporter en kit (pour garnir sushis ou cocktails) ou en cosmétique.', price: '¥1,000–6,000', icon: '✨' },
      { name: 'Soie et textiles de Kaga', cat: 'Textile', desc: 'Tissus et soieries teints selon la technique Kaga-yuzen — motifs naturels d\'une finesse incroyable.', price: '¥3,000–30,000', icon: '🧵' },
      { name: 'Miso de Kanazawa (Jibu-ni)', cat: 'Foodie', desc: 'Miso spécial et sauce pour le jibu-ni, ragoût de canard typique. Disponible dans les épiceries du marché Omi-cho.', price: '¥600–1,500', icon: '🍲' },
    ]
  },
  takayama: {
    nameJP: '高山',
    items: [
      { name: 'Saké local (brasseries de Sanmachi)', cat: 'Foodie', desc: 'Takayama aligne 6 brasseries centenaires dans ses ruelles historiques. Dégustations gratuites et bouteilles à rapporter.', price: '¥800–3,500', icon: '🍶' },
      { name: 'Poupée Sarubobo', cat: 'Artisanat', desc: 'Talisman rouge sans visage (pour que chacun y projette ses émotions), symbole de la région Hida. Porte-bonheur et amulette.', price: '¥500–2,500', icon: '🪆' },
      { name: 'Miso de Hida', cat: 'Foodie', desc: 'Miso rouge foncé de la région, fermenté longtemps dans l\'air des montagnes. Saveur intense et umami profond.', price: '¥600–1,500', icon: '🫙' },
      { name: 'Artisanat en bois de Hida', cat: 'Artisanat', desc: 'Les charpentiers de Hida étaient exonérés d\'impôts pour leur talent. Petits objets sculptés, cuillères, boîtes en bois de cèdre.', price: '¥800–5,000', icon: '🪵' },
    ]
  },
  hakone: {
    nameJP: '箱根',
    items: [
      { name: 'Marqueterie Hakone (yosegi-zaiku)', cat: 'Artisanat', desc: 'Art géométrique du bois marqueté multicolore, unique à Hakone. Boîtes à secret, dessous de verre, cadres.', price: '¥1,500–15,000', icon: '🪵' },
      { name: 'Œufs noirs d\'Owakudani', cat: 'Fun/Foodie', desc: 'À déguster sur place uniquement — ils noircissent au soufre volcanique. Vendus en sachets de 5 (= 35 ans de vie en plus !)', price: '¥500 (5 œufs)', icon: '🥚' },
    ]
  },
  miyajima: {
    nameJP: '宮島',
    items: [
      { name: 'Spatule shamoji artisanale', cat: 'Artisanat', desc: 'Miyajima = capitale de la shamoji. Les ateliers locaux fabriquent ces spatules en bois dans toutes les tailles depuis des siècles.', price: '¥600–4,000', icon: '🥄' },
      { name: 'Momiji manju (version chaude)', cat: 'Foodie', desc: 'Idem Hiroshima, mais achetez-les directement devant les fours à Miyajima — une autre dimension de fraîcheur.', price: '¥120–200/pièce', icon: '🍁' },
    ]
  },
  koyasan: {
    nameJP: '高野山',
    items: [
      { name: 'Chapelet bouddhiste (juzu)', cat: 'Artisanat', desc: 'Perles en bois de santal, cristal ou verre bénies dans les temples. Le souvenir spirituel par excellence du mont Kōya.', price: '¥1,500–8,000', icon: '📿' },
      { name: 'Encens de temple', cat: 'Artisanat', desc: 'Encens Koyasan fabriqué dans la tradition shingon depuis des siècles. Odeur unique de cèdre et de résine de montagne.', price: '¥1,000–4,000', icon: '🕯️' },
    ]
  },
  magome: {
    nameJP: '馬籠',
    items: [
      { name: 'Soba artisanal de la région', cat: 'Foodie', desc: 'Paquets de soba du terroir montagnard à cuire à la maison. Vendus dans les boutiques des ruelles pavées de Magome.', price: '¥600–1,500', icon: '🍜' },
      { name: 'Objets en bois de la route Nakasendo', cat: 'Artisanat', desc: 'Petits objets artisanaux rappelant les voyageurs d\'époque Edo : bâtons de marche, porte-clés, signets sculptés.', price: '¥500–2,500', icon: '🪵' },
    ]
  },
};

function getAllRestoTypes() {
  var types = {};
  Object.values(DESTINATIONS_DB).forEach(function(d) {
    if (!d.restaurants) return;
    d.restaurants.forEach(function(r) { types[r.type] = true; });
  });
  return Object.keys(types).sort();
}

function renderRestos() {
  var groups = getTravelGroups();
  var visitedKeys = {};
  groups.forEach(function(g) {
    if (g.city) visitedKeys[_destKey(g.city)] = g.city;
  });

  document.getElementById('page-container').innerHTML =
    _newPageHeader('🍜', 'Restos & Souvenirs', '食と買い物', 'Restaurants sélectionnés et idées de cadeaux par ville') +
    '<div class="tabs-bar">' +
      '<button class="tab-btn ' + (_tabRestos==='restos'?'active':'') + '" onclick="setRestoTab(\'restos\')">🍽️ Restaurants</button>' +
      '<button class="tab-btn ' + (_tabRestos==='souvenirs'?'active':'') + '" onclick="setRestoTab(\'souvenirs\')">🛍️ Souvenirs</button>' +
    '</div>' +
    '<div id="restos-content"></div>';

  _renderRestoContent(visitedKeys);
}

function setRestoTab(tab) {
  _tabRestos = tab;
  document.querySelectorAll('.tab-btn').forEach(function(b) {
    b.classList.toggle('active', b.textContent.includes(tab==='restos'?'Restaurants':'Souvenirs'));
  });
  var groups = getTravelGroups();
  var visitedKeys = {};
  groups.forEach(function(g) { if (g.city) visitedKeys[_destKey(g.city)] = g.city; });
  _renderRestoContent(visitedKeys);
}

function setRestoFilter(type) {
  _restoFilter = type;
  document.querySelectorAll('.resto-filter-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.filter === type);
  });
  var cards = document.querySelectorAll('.resto-card');
  cards.forEach(function(c) {
    var match = type === 'all' || c.dataset.type === type;
    c.style.display = match ? '' : 'none';
  });
  // Update city section visibility
  document.querySelectorAll('.restos-city-section').forEach(function(s) {
    var visible = Array.from(s.querySelectorAll('.resto-card')).some(function(c) { return c.style.display !== 'none'; });
    s.style.display = visible ? '' : 'none';
  });
}

function _renderRestoContent(visitedKeys) {
  var container = document.getElementById('restos-content');
  if (!container) return;

  if (_tabRestos === 'restos') {
    var types = getAllRestoTypes();
    var filterHtml = '<div class="resto-filters">' +
      '<button class="resto-filter-btn active" data-filter="all" onclick="setRestoFilter(\'all\')">Tout</button>' +
      types.map(function(t) {
        return '<button class="resto-filter-btn" data-filter="' + t + '" onclick="setRestoFilter(\'' + t.replace(/'/g,"\\'") + '\')">' + t + '</button>';
      }).join('') +
    '</div>';

    var destOrder = ['tokyo','kyoto','osaka','hiroshima','nara','kanazawa','takayama','hakone','miyajima','koyasan','magome'];
    var sectionsHtml = '';
    destOrder.forEach(function(key) {
      var dest = DESTINATIONS_DB[key];
      if (!dest || !dest.restaurants) return;
      var inTrip = !!visitedKeys[key];
      sectionsHtml += '<div class="restos-city-section">' +
        '<div class="restos-city-header">' +
          '<span class="restos-city-name">' + (dest.name || key) + '</span>' +
          '<span class="restos-city-jp">' + (dest.nameJP || '') + '</span>' +
          (inTrip ? '<span class="restos-in-trip">📍 Dans votre itinéraire</span>' : '') +
        '</div>' +
        '<div class="restos-grid">' +
        dest.restaurants.map(function(r) {
          var typeColor = _typeColor(r.type);
          return '<div class="resto-card" data-type="' + r.type + '">' +
            '<div class="resto-card-top">' +
              '<div class="resto-type-badge" style="background:' + typeColor.bg + ';color:' + typeColor.fg + '">' + r.type + '</div>' +
              (r.tip ? '<div class="resto-tip-badge">' + r.tip + '</div>' : '') +
            '</div>' +
            '<div class="resto-name">' + r.name + '</div>' +
            '<div class="resto-desc">' + r.desc + '</div>' +
            '<div class="resto-footer">' +
              '<div class="resto-price">💴 ' + r.price + '</div>' +
            '</div>' +
          '</div>';
        }).join('') +
        '</div></div>';
    });
    container.innerHTML = filterHtml + sectionsHtml;

  } else {
    // Souvenirs tab
    var destOrder2 = ['tokyo','kyoto','osaka','hiroshima','nara','kanazawa','takayama','hakone','miyajima','koyasan','magome'];
    var html = '<div class="souvenirs-intro">Idées d\'achats & cadeaux à ramener — cliquez pour cocher ✅</div>';
    var state = NewPagesStore.getObj('ldva-souvenirs');

    destOrder2.forEach(function(key) {
      var data = SOUVENIRS_DATA[key];
      if (!data || !data.items.length) return;
      var dest = DESTINATIONS_DB[key];
      var inTrip = !!visitedKeys[key];
      html += '<div class="souvenirs-city-section">' +
        '<div class="restos-city-header">' +
          '<span class="restos-city-name">' + (dest && dest.name ? dest.name : key) + '</span>' +
          '<span class="restos-city-jp">' + data.nameJP + '</span>' +
          (inTrip ? '<span class="restos-in-trip">📍 Dans votre itinéraire</span>' : '') +
        '</div>' +
        '<div class="souvenirs-grid">' +
        data.items.map(function(item) {
          var id = key + '_' + item.name.replace(/\s/g,'_');
          var checked = !!state[id];
          return '<div class="souvenir-card' + (checked?' souvenir-checked':'') + '" onclick="toggleSouvenir(\'' + id + '\', this)">' +
            '<div class="souvenir-check">' + (checked ? '✅' : '☐') + '</div>' +
            '<div class="souvenir-icon">' + item.icon + '</div>' +
            '<div class="souvenir-body">' +
              '<div class="souvenir-name">' + item.name + '</div>' +
              '<div class="souvenir-cat">' + item.cat + '</div>' +
              '<div class="souvenir-desc">' + item.desc + '</div>' +
              '<div class="souvenir-price">💴 ' + item.price + '</div>' +
            '</div>' +
          '</div>';
        }).join('') +
        '</div></div>';
    });
    container.innerHTML = html;
  }
}

function toggleSouvenir(id, el) {
  var checked = NewPagesStore.toggle('ldva-souvenirs', id);
  el.classList.toggle('souvenir-checked', checked);
  el.querySelector('.souvenir-check').textContent = checked ? '✅' : '☐';
}

function _typeColor(type) {
  var map = {
    'Ramen': { bg: '#fce8e8', fg: '#c04040' },
    'Sushi': { bg: '#e8f4f8', fg: '#2a7090' },
    'Izakaya': { bg: '#fff3e0', fg: '#a06020' },
    'Tempura': { bg: '#fef5e0', fg: '#8a6020' },
    'Marché': { bg: '#e8f5e8', fg: '#3a7040' },
    'Kaiseki': { bg: '#f0e8f8', fg: '#6040a0' },
    'Okonomiyaki': { bg: '#fce8e8', fg: '#b04040' },
    'Takoyaki': { bg: '#fff0e0', fg: '#b06020' },
    'Pâtisserie': { bg: '#f8e8f0', fg: '#a04070' },
    'Végétarien': { bg: '#e8f5e8', fg: '#308050' },
    'Tsukemen': { bg: '#fce8e8', fg: '#c04040' },
    'Huîtres': { bg: '#e0f0f8', fg: '#205880' },
    'Soba': { bg: '#f5f0e8', fg: '#805830' },
    'Tonkatsu': { bg: '#fff0e0', fg: '#a05020' },
    'Gyudon': { bg: '#fce8e0', fg: '#904020' },
    'Yakiniku': { bg: '#fce8e0', fg: '#b04030' },
    'Nabe': { bg: '#e8f0f8', fg: '#2a5080' },
    'Kushikatsu': { bg: '#fce8e0', fg: '#a04020' },
  };
  return map[type] || { bg: '#f0f0f0', fg: '#606060' };
}


// ═══════════════════════════════════════════════════════════════════
// 2. PACKING LIST
// ═══════════════════════════════════════════════════════════════════
var PACKING_CATEGORIES = [
  {
    id: 'docs', icon: '🛂', label: 'Documents essentiels',
    items: [
      { id: 'passport', label: 'Passeport (valide ≥6 mois)', required: true },
      { id: 'passcopy', label: 'Photocopie du passeport (séparée)' },
      { id: 'insurance', label: 'Attestation assurance voyage' },
      { id: 'jrpass', label: '⚠️ JR Pass : à calculer selon votre itinéraire — peut ne pas être rentable (voir Logistique)' },
      { id: 'visa', label: 'Vérif. exemption de visa (passeport FR ✅)' },
      { id: 'hotels', label: 'Confirmation des hébergements (imprimée ou offline)' },
      { id: 'cb', label: 'Carte bancaire Visa/Mastercard (pas AmEx)' },
      { id: 'especes', label: 'Espèces en euros + yens pour l\'arrivée' },
    ]
  },
  {
    id: 'tech', icon: '🔌', label: 'Électronique & connectivité',
    items: [
      { id: 'adaptateur', label: 'Adaptateur de prise type A (Japon = US)', required: true },
      { id: 'powerbank', label: 'Batterie externe (chargée !)' },
      { id: 'sim', label: 'SIM japonaise ou Pocket WiFi (à commander)' },
      { id: 'camera', label: 'Appareil photo + carte SD' },
      { id: 'cables', label: 'Câbles USB / chargeurs' },
      { id: 'earphones', label: 'Écouteurs (shinkansen, avion)' },
      { id: 'offlinemaps', label: 'Cartes Google Maps téléchargées offline' },
      { id: 'translate', label: 'App Google Translate téléchargée offline (japonais)' },
    ]
  },
  {
    id: 'vetements', icon: '🧥', label: 'Vêtements (nov–déc : 5–15°C)',
    items: [
      { id: 'manteau', label: 'Manteau chaud (il peut faire 5°C à Kyoto/Nara)', required: true },
      { id: 'pulls', label: '3–4 pulls / sweats' },
      { id: 'pantalons', label: '3–4 pantalons' },
      { id: 'tshirts', label: '5–6 t-shirts (dessous thermiques utiles)' },
      { id: 'chaussettes', label: 'Chaussettes sans trous ! (on enlève les chaussures souvent)', required: true },
      { id: 'chaussures', label: 'Chaussures confortables pour marcher 15km/j', required: true },
      { id: 'slip', label: 'Slip de bain (onsen si prévu)' },
      { id: 'pluie', label: 'Imperméable léger / parapluie compact' },
      { id: 'tenue_onsen', label: 'Yukata fournie à l\'hôtel onsen — rien à prévoir' },
    ]
  },
  {
    id: 'sante', icon: '💊', label: 'Santé & hygiène',
    items: [
      { id: 'ordonnance', label: 'Ordonnance + médicaments habituels' },
      { id: 'antidouleur', label: 'Antidouleurs / anti-diarrhée (juste au cas où)' },
      { id: 'pharmacie', label: 'Trousse de premiers secours basique' },
      { id: 'masque', label: 'Masques chirurgicaux (normal au Japon en cas de rhume)' },
      { id: 'creme', label: 'Crème solaire (même en novembre)' },
    ]
  },
  {
    id: 'japon', icon: '🎌', label: 'Spécifique Japon',
    items: [
      { id: 'suica', label: 'Carte Suica / Pasmo (à charger à l\'aéroport)', required: true },
      { id: 'cash', label: '30,000–50,000 ¥ en cash (Japon = beaucoup de cash)', required: true },
      { id: 'smallbag', label: 'Petit sac de jour (temples = pas de grand sac)' },
      { id: 'plastique', label: 'Sacs plastiques refermables (konbini donne peu de sacs)' },
      { id: 'cartes', label: 'Petits cadeaux / mémos pour remercier (karuta)' },
      { id: 'serviette', label: 'Serviette microfibre (certains ryokan n\'en fournissent pas)' },
      { id: 'chopsticks', label: 'Apprenez à dire いただきます (itadakimasu) !' },
    ]
  },
  {
    id: 'bagages', icon: '🧳', label: 'Bagages & logistique',
    items: [
      { id: 'valise_dim', label: 'Valise ≤ 80cm (Shinkansen : espace limité)', required: true },
      { id: 'cadenas', label: 'Cadenas TSA (pour les vols)' },
      { id: 'sac_a_dos', label: 'Sac à dos de voyage (pour les jours de marche)' },
      { id: 'bagage_main', label: 'Bagage cabine pour les affaires de valeur' },
      { id: 'pliable', label: 'Sac pliable pour les achats (ramener plein de choses !)' },
    ]
  },
];

function renderPacking() {
  var state = NewPagesStore.getObj('ldva-packing');
  var totalItems = 0, checkedItems = 0;
  PACKING_CATEGORIES.forEach(function(cat) {
    cat.items.forEach(function(item) {
      totalItems++;
      if (state[item.id]) checkedItems++;
    });
  });
  var pct = totalItems ? Math.round(checkedItems / totalItems * 100) : 0;

  var html = _newPageHeader('🎒', 'Packing List', '荷造り', 'Tout ce qu\'il faut préparer avant de partir');
  html += '<div class="packing-progress-bar-wrap">' +
    '<div class="packing-prog-header">' +
      '<span class="packing-prog-label">Progression</span>' +
      '<span class="packing-prog-value">' + checkedItems + ' / ' + totalItems + ' items (' + pct + '%)</span>' +
    '</div>' +
    '<div class="packing-prog-track"><div class="packing-prog-fill" style="width:' + pct + '%"></div></div>' +
  '</div>';

  html += '<div class="packing-grid">';
  PACKING_CATEGORIES.forEach(function(cat) {
    var catChecked = cat.items.filter(function(i) { return state[i.id]; }).length;
    var catDone = catChecked === cat.items.length;
    html += '<div class="packing-cat' + (catDone ? ' packing-cat-done' : '') + '">' +
      '<div class="packing-cat-header">' +
        '<span class="packing-cat-icon">' + cat.icon + '</span>' +
        '<span class="packing-cat-label">' + cat.label + '</span>' +
        '<span class="packing-cat-count">' + catChecked + '/' + cat.items.length + '</span>' +
      '</div>' +
      '<div class="packing-cat-track"><div class="packing-cat-fill" style="width:' + Math.round(catChecked/cat.items.length*100) + '%"></div></div>' +
      '<ul class="packing-items">';
    cat.items.forEach(function(item) {
      var checked = !!state[item.id];
      html += '<li class="packing-item' + (checked ? ' packing-done' : '') + (item.required ? ' packing-required' : '') + '" onclick="togglePackingItem(\'' + item.id + '\', this)">' +
        '<span class="packing-checkbox">' + (checked ? '✅' : '☐') + '</span>' +
        '<span class="packing-item-label">' + item.label + '</span>' +
        (item.required && !checked ? '<span class="packing-req-badge">!</span>' : '') +
      '</li>';
    });
    html += '</ul></div>';
  });
  html += '</div>';

  html += '<button class="packing-reset-btn" onclick="if(confirm(\'Remettre toute la liste à zéro ?\')) { NewPagesStore.set(\'ldva-packing\', {}); renderPacking(); }">Remettre à zéro</button>';

  document.getElementById('page-container').innerHTML = html;
}

function togglePackingItem(id, li) {
  var checked = NewPagesStore.toggle('ldva-packing', id);
  li.classList.toggle('packing-done', checked);
  li.querySelector('.packing-checkbox').textContent = checked ? '✅' : '☐';
  li.querySelector('.packing-req-badge') && (li.querySelector('.packing-req-badge').style.display = checked ? 'none' : '');
  // Update progress
  var state = NewPagesStore.getObj('ldva-packing');
  var totalItems = 0, checkedItems = 0;
  PACKING_CATEGORIES.forEach(function(cat) { cat.items.forEach(function(item) { totalItems++; if (state[item.id]) checkedItems++; }); });
  var pct = Math.round(checkedItems / totalItems * 100);
  var fill = document.querySelector('.packing-prog-fill');
  var val = document.querySelector('.packing-prog-value');
  if (fill) fill.style.width = pct + '%';
  if (val) val.textContent = checkedItems + ' / ' + totalItems + ' items (' + pct + '%)';
}


// ═══════════════════════════════════════════════════════════════════
// 3. CHECK-LIST PRÉ-DÉPART (tâches avec échéances)
// ═══════════════════════════════════════════════════════════════════
var CHECKLIST_DATA = [
  {
    phase: 'Maintenant · J-270+', icon: '📋', color: '#9070b0',
    tasks: [
      { id: 'jrpass_cmd', label: '⚠️ Calculer si le JR Pass est rentable pour votre itinéraire AVANT de commander (voir Logistique Japon)', link: 'https://www.japan-rail-pass.fr/', important: true },
      { id: 'assurance', label: 'Souscrire une assurance voyage (remboursement médical au Japon)' },
      { id: 'budget_jpy', label: 'Commencer à économiser des ¥ (1€ ≈ 160¥)' },
      { id: 'vaccins', label: 'Vérifier que les vaccins sont à jour (aucun obligatoire pour le Japon)' },
    ]
  },
  {
    phase: '1 mois avant', icon: '📅', color: '#5b8fb5',
    tasks: [
      { id: 'sim_wifi', label: 'Réserver une SIM japonaise ou Pocket WiFi (ex. IIJmio, Sakura Mobile)', important: true },
      { id: 'yens', label: 'Commander des yens en bureau de change (meilleur taux qu\'à l\'aéroport)' },
      { id: 'vols_check', label: 'Vérifier les horaires de vol et récupérer les billets' },
      { id: 'hotels_check', label: 'Confirmer toutes les réservations d\'hôtels' },
      { id: 'suica_prep', label: 'Préparer l\'app Suica (iOS) ou savoir où la charger à l\'aéroport' },
    ]
  },
  {
    phase: '2 semaines avant', icon: '🗓️', color: '#5c8f7d',
    tasks: [
      { id: 'valise_sort', label: 'Sortir la valise et commencer à poser les affaires' },
      { id: 'roaming', label: 'Désactiver le roaming automatique sur les téléphones (si SIM JP prévue)' },
      { id: 'google_maps', label: 'Télécharger les cartes Google Maps offline (Tokyo, Kyoto, Osaka…)' },
      { id: 'translate_dl', label: 'Télécharger Google Translate avec pack japonais offline' },
    ]
  },
  {
    phase: '1 semaine avant', icon: '⏰', color: '#c06070',
    tasks: [
      { id: 'valise_done', label: 'Valise bouclée et pesée (max 23 kg en soute)', important: true },
      { id: 'docs_scan', label: 'Scanner passeport + billets + confirmations dans le cloud' },
      { id: 'prevenir_banque', label: 'Prévenir la banque du voyage au Japon (éviter blocage CB)' },
      { id: 'cash_euro', label: 'Préparer quelques € en cash pour les imprévus' },
      { id: 'jrpass_check', label: 'Si JR Pass commandé : vérifier la réception du bon d\'échange' },
    ]
  },
  {
    phase: 'La veille', icon: '🌙', color: '#a87d3a',
    tasks: [
      { id: 'powerbank_charge', label: 'Charger batterie externe, téléphones, appareil photo' },
      { id: 'checkin_online', label: 'Check-in en ligne si disponible' },
      { id: 'sleep', label: 'Se coucher tôt ! (vol TLS–CDG–NRT = long)' },
      { id: 'itinerary_print', label: 'Imprimer ou sauvegarder offline l\'itinéraire complet' },
    ]
  },
  {
    phase: 'À l\'aéroport & à l\'arrivée', icon: '✈️', color: '#c73e1d',
    tasks: [
      { id: 'jrpass_exchange', label: 'Si JR Pass : échanger le bon au guichet JR (Narita ou Haneda)', important: false },
      { id: 'suica_load', label: 'Charger la carte Suica / Pasmo aux automates IC Card' },
      { id: 'sim_activate', label: 'Activer la SIM ou récupérer le Pocket WiFi' },
      { id: 'yens_withdraw', label: 'Retirer des ¥ à l\'ATM Seven Bank de l\'aéroport' },
      { id: 'taxi_mode', label: 'Prendre le Narita Express ou le limousine bus vers Tokyo' },
    ]
  },
];

function renderChecklist() {
  var state = NewPagesStore.getObj('ldva-checklist-predep');
  var total = 0, done = 0;
  CHECKLIST_DATA.forEach(function(phase) {
    phase.tasks.forEach(function(t) { total++; if (state[t.id]) done++; });
  });
  var pct = total ? Math.round(done / total * 100) : 0;

  var html = _newPageHeader('✅', 'Check-list Pré-départ', '出発準備', 'Toutes les tâches à accomplir avant le 18 novembre');
  html += '<div class="packing-progress-bar-wrap">' +
    '<div class="packing-prog-header"><span class="packing-prog-label">Tâches accomplies</span>' +
    '<span class="packing-prog-value">' + done + ' / ' + total + ' (' + pct + '%)</span></div>' +
    '<div class="packing-prog-track"><div class="packing-prog-fill" style="width:' + pct + '%;background:var(--sage)"></div></div>' +
  '</div>';

  html += '<div class="checklist-phases">';
  CHECKLIST_DATA.forEach(function(phase, pi) {
    var phaseDone = phase.tasks.filter(function(t) { return state[t.id]; }).length;
    var allDone = phaseDone === phase.tasks.length;
    html += '<div class="cl-phase' + (allDone ? ' cl-phase-done' : '') + '">' +
      '<div class="cl-phase-header" style="border-left:3px solid ' + phase.color + '">' +
        '<span class="cl-phase-icon">' + phase.icon + '</span>' +
        '<span class="cl-phase-label">' + phase.phase + '</span>' +
        '<span class="cl-phase-count" style="color:' + phase.color + '">' + phaseDone + '/' + phase.tasks.length + '</span>' +
      '</div>' +
      '<ul class="cl-tasks">';
    phase.tasks.forEach(function(task) {
      var checked = !!state[task.id];
      var linkHtml = task.link ? ' <a href="' + task.link + '" target="_blank" class="cl-link" onclick="event.stopPropagation()">↗</a>' : '';
      html += '<li class="cl-task' + (checked ? ' cl-done' : '') + (task.important ? ' cl-important' : '') + '" onclick="toggleChecklistItem(\'' + task.id + '\', this)">' +
        '<span class="packing-checkbox">' + (checked ? '✅' : '☐') + '</span>' +
        '<span class="cl-task-label">' + task.label + linkHtml + '</span>' +
      '</li>';
    });
    html += '</ul></div>';
  });
  html += '</div>';

  document.getElementById('page-container').innerHTML = html;
}

function toggleChecklistItem(id, li) {
  var checked = NewPagesStore.toggle('ldva-checklist-predep', id);
  li.classList.toggle('cl-done', checked);
  li.querySelector('.packing-checkbox').textContent = checked ? '✅' : '☐';
  var state = NewPagesStore.getObj('ldva-checklist-predep');
  var total = 0, done = 0;
  CHECKLIST_DATA.forEach(function(p) { p.tasks.forEach(function(t) { total++; if (state[t.id]) done++; }); });
  var pct = Math.round(done / total * 100);
  var fill = document.querySelector('.packing-prog-fill');
  var val = document.querySelector('.packing-prog-value');
  if (fill) fill.style.width = pct + '%';
  if (val) val.textContent = done + ' / ' + total + ' (' + pct + '%)';
}


// ═══════════════════════════════════════════════════════════════════
// 4. LOGISTIQUE
// ═══════════════════════════════════════════════════════════════════
function renderLogistique() {
  var html = _newPageHeader('🗺️', 'Logistique', '実用情報', 'Tout ce qu\'il faut savoir pour voyager au Japon');

  var sections = [
    {
      icon: '🚄', title: 'JR Pass — À calculer !',
      color: '#c73e1d',
      content: [
        '⚠️ <strong>Pour votre itinéraire, le JR Pass 21 jours (~616€/pers) coûte ~157€ DE PLUS que les billets à l\'unité (~459€/pers estimés)</strong> — soit ~628€ en trop pour 4 personnes.',
        '<strong>Cumul des trajets :</strong> Tokyo→Kanazawa (~90€) · Kanazawa→Takayama (~30€) · Takayama→Kyoto (~65€) · Kyoto→Nara A/R (~9€) · Kyoto→Hiroshima (~70€) · Hiroshima→Osaka (~65€) · Osaka→Magome (~50€) · Magome→Tokyo (~80€) = <strong>~459€/pers.</strong>',
        '👉 <strong>Recommandation : achetez les tickets séparément</strong>, en gare ou via <strong>Eki-net</strong> (réservation en ligne JR). Économie : ~628€ pour le groupe.',
        'Le prix du JR Pass a <strong>fortement augmenté en octobre 2023</strong> (+65%). Méfiez-vous des articles de blog citant d\'anciens tarifs.',
        'Si vous optez quand même pour le pass : il ne couvre <strong>pas le Nozomi</strong>, s\'achète <strong>uniquement hors Japon</strong>, et s\'active le premier jour d\'utilisation.',
      ]
    },
    {
      icon: '🚇', title: 'Suica / Pasmo',
      color: '#5c8f7d',
      content: [
        '<strong>Carte à puce rechargeable</strong> utilisable dans tous les métros, trains locaux, buses, et dans la plupart des konbini et distributeurs automatiques.',
        'Chargeable aux automates IC Card (interface en français disponible). Minimum ¥500, maximum ¥20,000.',
        '<strong>Récupérez votre carte Suica à l\'aéroport</strong> dès l\'arrivée — ça simplifie tout. Déposit de ¥500 récupérable au retour.',
        'Sur iPhone : l\'app <strong>Suica</strong> permet de créer une carte virtuelle directement dans Apple Wallet (mais nécessite de charger avec CB japonaise ou en ATM).',
      ]
    },
    {
      icon: '💴', title: 'Argent & ATMs',
      color: '#a87d3a',
      content: [
        'Le Japon reste très <strong>cash-friendly</strong> — beaucoup de restaurants, temples et petites boutiques n\'acceptent que les espèces.',
        'Prévoyez <strong>30,000–50,000 ¥</strong> en cash sur vous en permanence.',
        '<strong>ATM 7-Bank</strong> (dans tous les 7-Eleven) = la référence pour les cartes étrangères. Commission : ¥110 par retrait.',
        '<strong>Japan Post ATMs</strong> (bureaux de poste) et ATMs Citibank acceptent aussi les cartes Visa/Mastercard.',
        '⚠️ La plupart des ATMs de banques japonaises classiques <strong>refusent les cartes étrangères</strong>.',
        'Taux de change indicatif : 1€ ≈ 155–165¥ (vérifiez avant le départ).',
      ]
    },
    {
      icon: '📱', title: 'Connectivité',
      color: '#7a9bb5',
      content: [
        '<strong>Option 1 — SIM japonaise</strong> : IIJmio, Sakura Mobile, Japan Tourist SIM. 15–20 jours, data illimitée, ~20€. Commandez avant le départ.',
        '<strong>Option 2 — Pocket WiFi</strong> : routeur WiFi partageable entre 4 personnes. Glocalme, JapanWifiEagle. Rentable à 4. ~€5/jour.',
        '<strong>Option 3 — eSIM</strong> : Airalo, Holafly. Activation instantanée. Uniquement data (pas d\'appels).',
        'Google Maps fonctionne bien offline (téléchargez les zones avant). <strong>Téléchargez aussi les cartes de Tokyo, Kyoto, Osaka, Hiroshima</strong>.',
        'App <strong>Japan Official Travel App</strong> (gratuite) : bonnes infos de transport.',
      ]
    },
    {
      icon: '🧳', title: 'Bagages & Shinkansen',
      color: '#b06080',
      content: [
        'Dans le Shinkansen, les <strong>bagages volumineux nécessitent une réservation</strong> de siège "bagages larges" (depuis 2020). Valises > 160cm de périmètre concernées.',
        'Service <strong>Takkyubin (ヤマト运輸)</strong> : envoyez vos valises de ville en ville pour ~¥1,500/valise. Disponible dans les hôtels et konbini. Très pratique !',
        'Les konbini (7-Eleven, Lawson, FamilyMart) ont des cases de consigne. Les grandes gares ont des consignes automatiques <strong>(coin lockers)</strong> de ¥300–700/jour.',
      ]
    },
    {
      icon: '🏥', title: 'Santé & Urgences',
      color: '#c06070',
      content: [
        'Numéros d\'urgence : <strong>110</strong> (police), <strong>119</strong> (SAMU/pompiers).',
        'Ambassade de France à Tokyo : +81-3-5798-6000 — <strong>Enregistrez ce numéro avant de partir.</strong>',
        'Pharmacies (<strong>薬局</strong> / yakkyoku) dans toutes les villes, bien fournies en médicaments génériques. Sans ordonnance pour les basiques.',
        'Assurance voyage <strong>indispensable</strong> : une hospitalisation au Japon peut coûter >¥100,000/nuit.',
        'Le Japon n\'est <strong>pas dans le réseau Carte Européenne d\'Assurance Maladie</strong> — il faut une assurance voyage séparée.',
      ]
    },
    {
      icon: '🎌', title: 'Étiquette & Customs',
      color: '#606c38',
      content: [
        '<strong>Pas de pourboire</strong> — jamais. C\'est presque offensant.',
        'Retirez vos chaussures à l\'entrée des maisons, temples, certains ryokan. Repérez le tatami.',
        'Les escalators : <strong>restez à gauche à Osaka, à droite partout ailleurs</strong> (pour laisser passer les pressés).',
        'Parlez doucement dans les transports en commun. Les appels téléphoniques dans le métro sont mal vus.',
        'Portez des <strong>sacs jetables pour vos poubelles</strong> — les poubelles publiques sont rarissimes au Japon.',
      ]
    },
  ];

  html += '<div class="logistique-grid">';
  sections.forEach(function(s) {
    html += '<div class="logistique-card">' +
      '<div class="logistique-card-header" style="border-left:4px solid ' + s.color + '">' +
        '<span class="logistique-icon">' + s.icon + '</span>' +
        '<span class="logistique-title">' + s.title + '</span>' +
      '</div>' +
      '<ul class="logistique-list">' +
      s.content.map(function(c) { return '<li>' + c + '</li>'; }).join('') +
      '</ul></div>';
  });
  html += '</div>';

  document.getElementById('page-container').innerHTML = html;
}


// ═══════════════════════════════════════════════════════════════════
// 5. PHRASEBOOK
// ═══════════════════════════════════════════════════════════════════
var PHRASES = [
  {
    cat: 'Politesse essentielle', icon: '🙏',
    phrases: [
      { fr: 'Bonjour (matin)', jp: 'おはようございます', rom: 'Ohayō gozaimasu', pron: 'O-ha-yô go-zaï-mass' },
      { fr: 'Bonjour (journée)', jp: 'こんにちは', rom: 'Konnichiwa', pron: 'Kon-ni-tchi-wa' },
      { fr: 'Bonsoir', jp: 'こんばんは', rom: 'Konbanwa', pron: 'Kon-ban-wa' },
      { fr: 'Merci (formel)', jp: 'ありがとうございます', rom: 'Arigatō gozaimasu', pron: 'A-ri-ga-tô go-zaï-mass' },
      { fr: 'Merci (simple)', jp: 'ありがとう', rom: 'Arigatō', pron: 'A-ri-ga-tô' },
      { fr: 'S\'il vous plaît', jp: 'お願いします', rom: 'Onegaishimasu', pron: 'O-né-gaï-shi-mass' },
      { fr: 'Pardon / Excusez-moi', jp: 'すみません', rom: 'Sumimasen', pron: 'Sou-mi-ma-sén' },
      { fr: 'Bon appétit (avant de manger)', jp: 'いただきます', rom: 'Itadakimasu', pron: 'I-ta-da-ki-mass' },
      { fr: 'Merci pour le repas', jp: 'ごちそうさまでした', rom: 'Gochisōsama deshita', pron: 'Go-tchi-sô-sa-ma désh-ta' },
    ]
  },
  {
    cat: 'Restaurant', icon: '🍽️',
    phrases: [
      { fr: 'Une table pour 4 personnes', jp: '4人です', rom: 'Yonin desu', pron: 'Yo-nin des' },
      { fr: 'Le menu, s\'il vous plaît', jp: 'メニューをください', rom: 'Menyū o kudasai', pron: 'Mé-nyou o kou-da-saï' },
      { fr: 'Je prends ça', jp: 'これをください', rom: 'Kore o kudasai', pron: 'Ko-ré o kou-da-saï' },
      { fr: 'C\'est délicieux !', jp: 'おいしい！', rom: 'Oishii!', pron: 'O-i-shi !' },
      { fr: 'L\'addition, s\'il vous plaît', jp: 'お会計お願いします', rom: 'Okaikei onegaishimasu', pron: 'O-kaï-ké o-né-gaï-shi-mass' },
      { fr: 'Je ne mange pas de viande', jp: '肉は食べません', rom: 'Niku wa tabemasen', pron: 'Ni-kou wa ta-bé-ma-sén' },
      { fr: 'Allergie aux arachides', jp: 'ピーナッツアレルギーです', rom: 'Pīnattsu arerugī desu', pron: 'Pi-natt-sou a-ré-rou-gi des' },
      { fr: 'De l\'eau, s\'il vous plaît', jp: 'お水をください', rom: 'Omizu o kudasai', pron: 'O-mi-zou o kou-da-saï' },
    ]
  },
  {
    cat: 'Transport', icon: '🚄',
    phrases: [
      { fr: 'Où est la station de métro ?', jp: '地下鉄の駅はどこですか？', rom: 'Chikatetsu no eki wa doko desu ka?', pron: 'Tchi-ka-tét-sou no é-ki wa do-ko des ka ?' },
      { fr: 'Un aller simple pour...', jp: '〜まで片道一枚', rom: '〜made katamichi ichimai', pron: '...ma-dé ka-ta-mi-tchi i-tchi-maï' },
      { fr: 'À quelle heure part le train ?', jp: '電車は何時に出ますか？', rom: 'Densha wa nanji ni demasu ka?', pron: 'Den-sha wa nan-ji ni dé-mass ka ?' },
      { fr: 'Je voudrais réserver un siège', jp: '指定席を予約したいです', rom: 'Shiteiseki o yoyaku shitai desu', pron: 'Shi-té-sé-ki o yo-ya-kou shi-taï des' },
      { fr: 'Où est l\'arrêt de bus ?', jp: 'バス停はどこですか？', rom: 'Basu tei wa doko desu ka?', pron: 'Ba-sou-té wa do-ko des ka ?' },
      { fr: 'Appelez-moi un taxi', jp: 'タクシーを呼んでください', rom: 'Takushī o yonde kudasai', pron: 'Ta-kou-shi o yon-dé kou-da-saï' },
    ]
  },
  {
    cat: 'Hôtel & Hébergement', icon: '🏨',
    phrases: [
      { fr: 'J\'ai une réservation', jp: '予約があります', rom: 'Yoyaku ga arimasu', pron: 'Yo-ya-kou ga a-ri-mass' },
      { fr: 'Check-in / enregistrement', jp: 'チェックインお願いします', rom: 'Chekkuin onegaishimasu', pron: 'Tchék-kou-in o-né-gaï-shi-mass' },
      { fr: 'Check-out / départ', jp: 'チェックアウトお願いします', rom: 'Chekkuauto onegaishimasu', pron: 'Tchék-kou-a-ou-to o-né-gaï-shi-mass' },
      { fr: 'Où est la chambre ?', jp: '部屋はどこですか？', rom: 'Heya wa doko desu ka?', pron: 'Hé-ya wa do-ko des ka ?' },
      { fr: 'Le WiFi, s\'il vous plaît', jp: 'Wi-Fiのパスワードを教えてください', rom: 'WiFi no pasuwādo o oshiete kudasai', pron: 'Waï-faï no pass-wâ-do o o-shi-é-té kou-da-saï' },
    ]
  },
  {
    cat: 'Shopping', icon: '🛍️',
    phrases: [
      { fr: 'Combien ça coûte ?', jp: 'いくらですか？', rom: 'Ikura desu ka?', pron: 'I-kou-ra des ka ?' },
      { fr: 'Trop cher', jp: '高すぎます', rom: 'Takasugimasu', pron: 'Ta-ka-sou-gi-mass' },
      { fr: 'Je regarde juste', jp: '見てるだけです', rom: 'Miteru dake desu', pron: 'Mi-té-rou da-ké des' },
      { fr: 'Je prends ça', jp: 'これにします', rom: 'Kore ni shimasu', pron: 'Ko-ré ni shi-mass' },
      { fr: 'Avez-vous la taille L ?', jp: 'Lサイズはありますか？', rom: 'L saizu wa arimasu ka?', pron: 'Él saï-zou wa a-ri-mass ka ?' },
      { fr: 'Carte bleue ou espèces ?', jp: 'カードか現金どちらですか？', rom: 'Kādo ka genkin dochira desu ka?', pron: 'Kâ-do ka guén-kin do-tchi-ra des ka ?' },
    ]
  },
  {
    cat: 'Urgences', icon: '🚨',
    phrases: [
      { fr: 'Au secours !', jp: '助けてください！', rom: 'Tasukete kudasai!', pron: 'Ta-sou-ké-té kou-da-saï !' },
      { fr: 'Appelez une ambulance', jp: '救急車を呼んでください', rom: 'Kyūkyūsha o yonde kudasai', pron: 'Kyou-kyou-sha o yon-dé kou-da-saï' },
      { fr: 'J\'ai besoin d\'un médecin', jp: '医者が必要です', rom: 'Isha ga hitsuyō desu', pron: 'I-sha ga hit-sou-yo des' },
      { fr: 'Je suis perdu(e)', jp: '迷子になりました', rom: 'Maigo ni narimashita', pron: 'Maï-go ni na-ri-mash-ta' },
      { fr: 'On m\'a volé', jp: '盗まれました', rom: 'Nusumaremashita', pron: 'Nou-sou-ma-ré-mash-ta' },
      { fr: 'J\'ai mal ici', jp: 'ここが痛いです', rom: 'Koko ga itai desu', pron: 'Ko-ko ga i-taï des' },
    ]
  },
  {
    cat: 'Onsen & Bains', icon: '♨️',
    phrases: [
      { fr: 'Onsen mixte ou séparé ?', jp: '混浴ですか？', rom: 'Konyoku desu ka?', pron: 'Kon-yo-kou des ka ?' },
      { fr: 'Les tatouages sont-ils autorisés ?', jp: 'タトゥーは大丈夫ですか？', rom: 'Tatū wa daijōbu desu ka?', pron: 'Ta-tou wa daï-jô-bou des ka ?' },
      { fr: 'Quelle est la température ?', jp: '温度は何度ですか？', rom: 'Ondo wa nando desu ka?', pron: 'On-do wa nan-do des ka ?' },
    ]
  },
];

var _phraseFilter = '';
var _phraseCatFilter = 'all';

function renderPhrasebook() {
  var html = _newPageHeader('🗣️', 'Phrasebook', '会話帳', 'Japonais de survie — prononciation approximative en français');

  html += '<div class="phrase-search-bar">' +
    '<input type="text" id="phrase-search" class="phrase-search-input" placeholder="Rechercher une phrase…" oninput="filterPhrases()" value="' + _phraseFilter + '">' +
    '<div class="phrase-cats">' +
      '<button class="phrase-cat-btn' + (_phraseCatFilter==='all'?' active':'') + '" onclick="setPhrasecat(\'all\')">Tout</button>' +
      PHRASES.map(function(c) {
        return '<button class="phrase-cat-btn' + (_phraseCatFilter===c.cat?' active':'') + '" onclick="setPhrasecat(\'' + c.cat.replace(/'/g,"\\'") + '\')">' + c.icon + ' ' + c.cat + '</button>';
      }).join('') +
    '</div>' +
  '</div>' +
  '<div id="phrases-container">';

  PHRASES.forEach(function(cat) {
    var visible = _phraseCatFilter === 'all' || _phraseCatFilter === cat.cat;
    html += '<div class="phrase-section' + (!visible ? ' phrase-hidden' : '') + '" data-cat="' + cat.cat + '">' +
      '<div class="phrase-section-title">' + cat.icon + ' ' + cat.cat + '</div>' +
      '<div class="phrases-grid">';
    cat.phrases.forEach(function(p) {
      var matchSearch = !_phraseFilter ||
        p.fr.toLowerCase().includes(_phraseFilter.toLowerCase()) ||
        p.rom.toLowerCase().includes(_phraseFilter.toLowerCase());
      html += '<div class="phrase-card' + (!matchSearch ? ' phrase-hidden' : '') + '">' +
        '<div class="phrase-fr">' + p.fr + '</div>' +
        '<div class="phrase-jp">' + p.jp + '</div>' +
        '<div class="phrase-rom">' + p.rom + '</div>' +
        '<div class="phrase-pron">🔊 ' + p.pron + '</div>' +
      '</div>';
    });
    html += '</div></div>';
  });

  html += '</div>';
  document.getElementById('page-container').innerHTML = html;
}

function filterPhrases() {
  _phraseFilter = document.getElementById('phrase-search').value;
  var q = _phraseFilter.toLowerCase();
  document.querySelectorAll('.phrase-card').forEach(function(card) {
    var fr = card.querySelector('.phrase-fr').textContent.toLowerCase();
    var rom = card.querySelector('.phrase-rom').textContent.toLowerCase();
    var match = !q || fr.includes(q) || rom.includes(q);
    card.classList.toggle('phrase-hidden', !match);
  });
  // Hide empty sections
  document.querySelectorAll('.phrase-section').forEach(function(s) {
    var catMatch = _phraseCatFilter === 'all' || s.dataset.cat === _phraseCatFilter;
    var hasVisible = Array.from(s.querySelectorAll('.phrase-card')).some(function(c) { return !c.classList.contains('phrase-hidden'); });
    s.classList.toggle('phrase-hidden', !catMatch || !hasVisible);
  });
}

function setPhrasecat(cat) {
  _phraseCatFilter = cat;
  document.querySelectorAll('.phrase-cat-btn').forEach(function(b) {
    b.classList.toggle('active', b.textContent.trim().includes(cat === 'all' ? 'Tout' : cat));
  });
  filterPhrases();
}


// ═══════════════════════════════════════════════════════════════════
// 6. JAPON 101
// ═══════════════════════════════════════════════════════════════════
var JAPON101_DATA = [
  {
    icon: '🙇', title: 'Codes sociaux & étiquette',
    items: [
      { q: 'Le pourboire', a: '<strong>N\'en donnez jamais.</strong> Au Japon, laisser de l\'argent en dehors du prix fixé est considéré comme impoli ou embarrassant. Les serveurs peuvent courir après vous pour vous le rendre.' },
      { q: 'Parler dans les transports', a: 'Les conversations à voix haute et les appels téléphoniques sont mal vus dans le métro et le Shinkansen. Mettez votre téléphone en silencieux et parlez à voix basse.' },
      { q: 'La file d\'attente', a: 'Les Japonais font la queue de façon exemplaire. Sur les quais de métro, des lignes peintes au sol indiquent exactement où attendre. Respectez-les toujours.' },
      { q: 'Côté escalator', a: '<strong>À Osaka :</strong> restez à droite (gauche pour marcher). <strong>Partout ailleurs :</strong> restez à gauche (droite pour marcher). Exception notable !' },
      { q: 'La carte de visite (meishi)', a: 'Si quelqu\'un vous tend une carte de visite à deux mains, prenez-la à deux mains et lisez-la. Ne la rangez pas immédiatement dans votre poche — posez-la devant vous.' },
      { q: 'Chaussures', a: 'On retire ses chaussures à l\'entrée des maisons, de nombreux ryokan, temples et certains restaurants. Des pantoufles sont souvent fournies. Évitez les lacets compliqués.' },
      { q: 'Tatouages', a: 'Les tatouages restent tabous dans certains onsen et piscines — ils sont associés à la yakuza. Cherchez des établissements "tattoo-friendly" si c\'est votre cas.' },
    ]
  },
  {
    icon: '🍱', title: 'Nourriture & Restaurants',
    items: [
      { q: 'Itadakimasu & Gochisōsama', a: 'Avant de manger, dites <strong>いただきます (itadakimasu)</strong>. Après, <strong>ごちそうさまでした (gochisōsama deshita)</strong>. Ce sont des formules de gratitude incontournables.' },
      { q: 'Oshibori', a: 'Le petit tissu humide qu\'on vous apporte à l\'arrivée sert à vous essuyer les mains. Pas le visage (en public). Rendez-le plié après usage.' },
      { q: 'Manger en marchant', a: 'Déconseillé, sauf dans les festivals et marchés de rue (comme Dotonbori). Dans la vie courante, trouvez-vous un endroit pour vous asseoir.' },
      { q: 'Baguettes', a: 'Ne les plantez jamais verticalement dans un bol de riz (symbolique funéraire). Ne les tendez jamais à quelqu\'un d\'autre baguette-à-baguette. Posez-les sur le repose-baguettes.' },
      { q: 'Commander sans parler japonais', a: 'Beaucoup de restaurants ont des <strong>photos dans le menu ou des maquettes en vitrine</strong> — pointez simplement. Les tablettes de commande tactile (souvent en anglais) sont très répandues.' },
      { q: 'Konbini', a: 'Les convenience stores japonais (7-Eleven, Lawson, FamilyMart) sont extraordinaires. Onigiri frais, bento chauds, ramen, yakitori… à toute heure, pour ¥500–900. Incontournable.' },
    ]
  },
  {
    icon: '🚇', title: 'Transport',
    items: [
      { q: 'Ponctualité', a: 'Les trains japonais ont un retard moyen de 18 secondes par an. Soyez à l\'heure sur le quai. Un retard de 1 minute fait l\'objet d\'excuses officielles par haut-parleur.' },
      { q: 'Validation des tickets', a: 'Passez toujours votre carte IC ou votre ticket à l\'entrée ET à la sortie des portiques. Un ticket non validé à la sortie bloque le portique.' },
      { q: 'Noms de stations en anglais', a: 'Toutes les grandes stations sont indiquées en romaji (alphabet latin). Les annonces dans le Shinkansen et le métro de Tokyo sont souvent en anglais.' },
      { q: 'Taxis', a: 'Les portières des taxis s\'ouvrent et se ferment automatiquement. N\'essayez pas de les forcer. Donnez l\'adresse en japonais si possible — les chauffeurs parlent rarement anglais.' },
      { q: 'Vélo', a: 'Le vélo est omniprésent et pratique dans des villes plates comme Kyoto ou Kanazawa. Des sociétés de vélo en libre-service existent. Garez-vous dans des zones dédiées.' },
    ]
  },
  {
    icon: '🏯', title: 'Temples & Sites',
    items: [
      { q: 'Temizuya (purification)', a: 'À l\'entrée d\'un sanctuaire shinto, rincez vos mains au bassin rituels (temizuya) : versez de l\'eau sur la main gauche, puis droite, puis dans le creux de la main gauche pour vous rincer la bouche.' },
      { q: 'Torii', a: 'Les torii (portiques vermillon) marquent l\'entrée d\'un sanctuaire shinto. Inclinez légèrement la tête en passant dessous, et évitez de marcher au centre (réservé aux divinités).' },
      { q: 'Photos', a: 'Vérifiez toujours les panneaux "No Photography". Les espaces intérieurs sacrés, certains jardins zen et trésors nationaux l\'interdisent.' },
      { q: 'Tenue', a: 'Pas de dress code strict pour les touristes, mais évitez les tenues ultra-courtes ou provocatrices dans les temples. Épaules couvertes recommandées dans certains lieux.' },
    ]
  },
  {
    icon: '♨️', title: 'Onsen',
    items: [
      { q: 'Règles fondamentales', a: 'On entre dans l\'onsen entièrement nu. Pas de maillot. Rincez-vous soigneusement à la douche avant d\'entrer dans le bassin.' },
      { q: 'Serviette', a: 'La petite serviette sert à se couvrir en marchant et peut être posée sur la tête dans l\'eau. Elle n\'entre pas dans le bassin.' },
      { q: 'Cheveux', a: 'Les cheveux longs doivent être attachés ou relevés pour ne pas toucher l\'eau.' },
      { q: 'Tatouages', a: 'Beaucoup d\'onsen refusent les personnes tatouées. Cherchez "tattoo-friendly onsen" si nécessaire. Certains proposent des bains privés.' },
      { q: 'Après l\'onsen', a: 'Évitez de vous rincer après l\'onsen — les minéraux sont censés rester sur la peau. Buvez de l\'eau pour vous hydrater.' },
    ]
  },
  {
    icon: '💡', title: 'Infos pratiques',
    items: [
      { q: 'Poubelles', a: '<strong>Il n\'y a quasi pas de poubelles dans la rue</strong> au Japon. Promenez-vous avec un sac pour vos déchets et jetez-les à votre hôtel, dans un konbini ou aux WC publics.' },
      { q: 'WC japonais', a: 'Les WC électroniques (washlet) font peur mais sont addictifs. Le bouton 大 est pour les selles, 小 pour l\'urine. Il y a toujours un mode "bruit de fond" pour couvrir les sons.' },
      { q: 'Courant électrique', a: '100V / 50-60Hz, prises type A (identiques aux prises US). Vos appareils européens ont besoin d\'un adaptateur (et vérifiez la tension !).' },
      { q: 'Décalage horaire', a: 'Toulouse → Tokyo = +8h en hiver. Prévoyez 2–3 jours d\'adaptation. Restez éveillés jusqu\'à 22h le premier soir.' },
      { q: 'Applications utiles', a: '<strong>Google Maps</strong> (transport en commun très précis), <strong>Google Translate</strong> (caméra pour lire le japonais), <strong>Tabelog</strong> (avis de restaurants), <strong>Hyperdia</strong> (calcul de trajets JR).' },
    ]
  },
];

var _j101Open = {};

function renderJapon101() {
  var html = _newPageHeader('🇯🇵', 'Japon 101', '日本の常識', 'Tout ce qu\'il faut savoir pour voyager au Japon');

  html += '<div class="j101-grid">';
  JAPON101_DATA.forEach(function(section, si) {
    html += '<div class="j101-section">' +
      '<div class="j101-section-header">' +
        '<span class="j101-section-icon">' + section.icon + '</span>' +
        '<span class="j101-section-title">' + section.title + '</span>' +
      '</div>' +
      '<div class="j101-items">';
    section.items.forEach(function(item, ii) {
      var id = 'j101_' + si + '_' + ii;
      var open = !!_j101Open[id];
      html += '<div class="j101-item' + (open ? ' j101-open' : '') + '" onclick="toggleJ101(\'' + id + '\', this)">' +
        '<div class="j101-q">' +
          '<span class="j101-q-text">' + item.q + '</span>' +
          '<span class="j101-chevron">' + (open ? '▲' : '▼') + '</span>' +
        '</div>' +
        '<div class="j101-a"><div class="j101-a-inner">' + item.a + '</div></div>' +
      '</div>';
    });
    html += '</div></div>';
  });
  html += '</div>';

  document.getElementById('page-container').innerHTML = html;
}

function toggleJ101(id, el) {
  _j101Open[id] = !_j101Open[id];
  el.classList.toggle('j101-open', _j101Open[id]);
  el.querySelector('.j101-chevron').textContent = _j101Open[id] ? '▲' : '▼';
  var answerEl = el.querySelector('.j101-a');
  if (_j101Open[id]) {
    // Set to scrollHeight so the transition has an end value
    answerEl.style.maxHeight = answerEl.scrollHeight + 'px';
  } else {
    // First pin at current height, then animate to 0
    answerEl.style.maxHeight = answerEl.scrollHeight + 'px';
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        answerEl.style.maxHeight = '0';
      });
    });
  }
}


// ═══════════════════════════════════════════════════════════════════
// 7. SURPRISE-MOI
// ═══════════════════════════════════════════════════════════════════
function renderSurprise() {
  var groups = getTravelGroups();
  var cityFilter = NewPagesStore.get('ldva-surprise-city') || 'all';
  var typeFilter = NewPagesStore.get('ldva-surprise-type') || 'all';

  var cities = ['all'];
  groups.forEach(function(g) { if (g.city && !cities.includes(g.city)) cities.push(g.city); });

  var html = _newPageHeader('🎲', 'Surprise !', 'サプライズ', 'Laissez le hasard choisir votre prochaine activité');

  html += '<div class="surprise-controls">' +
    '<div class="surprise-filter-group">' +
      '<label class="surprise-label">Ville</label>' +
      '<select class="surprise-select" onchange="setSurpriseFilter(\'city\', this.value)">' +
      cities.map(function(c) {
        return '<option value="' + c + '"' + (c === cityFilter ? ' selected' : '') + '>' + (c === 'all' ? 'Toutes les villes' : c) + '</option>';
      }).join('') +
      '</select>' +
    '</div>' +
    '<div class="surprise-filter-group">' +
      '<label class="surprise-label">Type</label>' +
      '<select class="surprise-select" onchange="setSurpriseFilter(\'type\', this.value)">' +
        '<option value="all"' + (typeFilter==='all'?' selected':'') + '>Tout</option>' +
        '<option value="activite"' + (typeFilter==='activite'?' selected':'') + '>🏯 Activité</option>' +
        '<option value="restaurant"' + (typeFilter==='restaurant'?' selected':'') + '>🍜 Restaurant</option>' +
        '<option value="highlight"' + (typeFilter==='highlight'?' selected':'') + '>⭐ À ne pas manquer</option>' +
      '</select>' +
    '</div>' +
  '</div>';

  html += '<div class="surprise-stage">' +
    '<button class="surprise-btn" onclick="spinSurprise()">' +
      '<span class="surprise-btn-dice">🎲</span>' +
      '<span>Lancer le dé !</span>' +
    '</button>' +
    '<div id="surprise-result" class="surprise-result"></div>' +
  '</div>';

  document.getElementById('page-container').innerHTML = html;
}

function setSurpriseFilter(key, val) {
  NewPagesStore.set('ldva-surprise-' + key, val);
}

function spinSurprise() {
  var cityFilter = NewPagesStore.get('ldva-surprise-city') || 'all';
  var typeFilter = NewPagesStore.get('ldva-surprise-type') || 'all';
  var groups = getTravelGroups();

  // Build pool
  var pool = [];
  var destOrder = ['tokyo','kyoto','osaka','hiroshima','nara','kanazawa','takayama','hakone','miyajima','koyasan','magome'];
  destOrder.forEach(function(key) {
    var dest = DESTINATIONS_DB[key];
    if (!dest) return;
    var cityName = dest.name || key;
    var inFilter = cityFilter === 'all' || groups.some(function(g) { return g.city && g.city.toLowerCase().includes(key); });
    if (!inFilter) return;

    if (typeFilter === 'all' || typeFilter === 'activite') {
      (dest.highlights || []).forEach(function(h) {
        pool.push({ type: 'activite', city: cityName, nameJP: dest.nameJP, text: h, icon: '🏯' });
      });
    }
    if (typeFilter === 'all' || typeFilter === 'restaurant') {
      (dest.restaurants || []).forEach(function(r) {
        pool.push({ type: 'restaurant', city: cityName, nameJP: dest.nameJP, text: r.name + ' — ' + r.desc, price: r.price, rtype: r.type, icon: '🍜' });
      });
    }
    if (typeFilter === 'all' || typeFilter === 'highlight') {
      (dest.funFacts || []).forEach(function(f) {
        pool.push({ type: 'highlight', city: cityName, nameJP: dest.nameJP, text: f, icon: '💡' });
      });
    }
  });

  if (!pool.length) {
    document.getElementById('surprise-result').innerHTML = '<div class="surprise-empty">Aucun résultat avec ces filtres.</div>';
    return;
  }

  var btn = document.querySelector('.surprise-btn');
  btn.classList.add('spinning');
  setTimeout(function() {
    btn.classList.remove('spinning');
    var pick = pool[Math.floor(Math.random() * pool.length)];
    var typeLabel = pick.type === 'activite' ? 'Activité' : (pick.type === 'restaurant' ? 'Restaurant' : 'Le saviez-vous ?');
    var color = pick.type === 'activite' ? 'var(--sage)' : (pick.type === 'restaurant' ? 'var(--blush)' : 'var(--amber)');

    document.getElementById('surprise-result').innerHTML =
      '<div class="surprise-card" style="border-top:4px solid ' + color + '">' +
        '<div class="surprise-card-meta">' +
          '<span class="surprise-type-badge" style="background:' + color + '20;color:' + color + '">' + pick.icon + ' ' + typeLabel + '</span>' +
          '<span class="surprise-city">' + pick.city + (pick.nameJP ? ' <span class="jp-accent">' + pick.nameJP + '</span>' : '') + '</span>' +
        '</div>' +
        '<div class="surprise-card-text">' + pick.text + '</div>' +
        (pick.price ? '<div class="surprise-card-price">💴 ' + pick.price + '</div>' : '') +
        '<button class="surprise-again-btn" onclick="spinSurprise()">↻ Une autre</button>' +
      '</div>';
  }, 600);
}


// ═══════════════════════════════════════════════════════════════════
// 8. STATS DU VOYAGE
// ═══════════════════════════════════════════════════════════════════

// Distances entre villes (km vol d'oiseau approx)
var CITY_COORDS = {
  'toulouse': [43.60, 1.44], 'tokyo': [35.69, 139.69], 'kyoto': [35.01, 135.76],
  'osaka': [34.69, 135.50], 'hiroshima': [34.39, 132.45], 'nara': [34.68, 135.83],
  'hakone': [35.23, 139.10], 'nikko': [36.75, 139.60], 'kamakura': [35.32, 139.55],
  'kanazawa': [36.56, 136.66], 'takayama': [36.14, 137.25], 'shirakawa': [36.26, 136.89],
  'miyajima': [34.30, 132.32], 'koyasan': [34.21, 135.59], 'magome': [35.54, 137.55],
};

function _haversine(lat1, lon1, lat2, lon2) {
  var R = 6371;
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLon = (lon2 - lon1) * Math.PI / 180;
  var a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2);
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

function _getCityKey(name) {
  if (!name) return null;
  var n = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z]/g,'');
  for (var k in CITY_COORDS) { if (n.includes(k) || k.includes(n.substring(0,4))) return k; }
  return null;
}

function renderStats() {
  var groups = getTravelGroups();

  // Compute stats
  var totalBudgetLodging = 0, totalBudgetTransport = 0;
  var totalNights = 0;
  var cities = [], citySet = {};
  var shinkansen = 0;
  var activities = 0;
  var reserved = 0;
  var notReserved = 0;

  groups.forEach(function(g) {
    totalBudgetLodging += parseBudget(g.prix);
    totalBudgetTransport += parseBudget(g.prixTrajet);
    totalNights += (g.nights || 0) + 1;
    if (g.city && !citySet[g.city]) { citySet[g.city] = true; cities.push(g.city); }
    if (g.dureeTrajet) shinkansen++;
    if (Array.isArray(g.activites)) activities += g.activites.filter(function(a){return a.trim();}).length;
    if (/oui|true/i.test(g.reserve||'')) reserved++;
    else if (g.reserve) notReserved++;
  });

  var grand = totalBudgetLodging + totalBudgetTransport;
  var perPerson = grand / 4;

  // Distance calculation
  var totalKm = 0;
  var prevKey = 'toulouse';
  cities.forEach(function(city) {
    var key = _getCityKey(city);
    if (key && CITY_COORDS[key] && CITY_COORDS[prevKey]) {
      totalKm += _haversine(CITY_COORDS[prevKey][0], CITY_COORDS[prevKey][1], CITY_COORDS[key][0], CITY_COORDS[key][1]);
      prevKey = key;
    }
  });
  // Return flight
  if (CITY_COORDS['tokyo']) {
    totalKm += _haversine(CITY_COORDS[prevKey][0], CITY_COORDS[prevKey][1], CITY_COORDS['tokyo'][0], CITY_COORDS['tokyo'][1]);
    totalKm += _haversine(CITY_COORDS['tokyo'][0], CITY_COORDS['tokyo'][1], CITY_COORDS['toulouse'][0], CITY_COORDS['toulouse'][1]);
  }

  // Avg budget per night
  var avgPerNight = totalNights ? Math.round(grand / totalNights) : 0;

  // Restaurants planned
  var restoCount = 0;
  cities.forEach(function(city) { var d = findDestination(city); restoCount += (d.restaurants||[]).length; });

  var html = _newPageHeader('📊', 'Stats du voyage', '旅の統計', 'Chiffres clés de votre aventure japonaise');

  // Big stat cards
  html += '<div class="stats-big-grid">';
  var bigStats = [
    { icon: '🗺️', label: 'Km parcourus', value: totalKm.toLocaleString('fr-FR'), sub: '(estimé vol d\'oiseau)', color: 'var(--sage)' },
    { icon: '🌆', label: 'Villes', value: cities.length, sub: groups.length + ' étapes', color: 'var(--sky)' },
    { icon: '🌙', label: 'Nuits au Japon', value: totalNights, sub: '18 nov — 5 déc', color: 'var(--lavender)' },
    { icon: '💰', label: 'Budget hébergement', value: formatEURint(totalBudgetLodging), sub: formatEURint(totalBudgetLodging/4) + '/pers', color: 'var(--blush)' },
    { icon: '🚄', label: 'Budget transport', value: formatEURint(totalBudgetTransport * 4), sub: formatEURint(totalBudgetTransport) + '/pers', color: 'var(--amber)' },
    { icon: '💎', label: 'Budget total estimé', value: formatEURint(grand), sub: formatEURint(perPerson) + '/pers', color: '#c73e1d' },
    { icon: '📍', label: 'Activités prévues', value: activities, sub: Math.round(activities/cities.length*10)/10 + '/ville en moy.', color: 'var(--sage)' },
    { icon: '✅', label: 'Hébergements réservés', value: reserved + '/' + (reserved+notReserved), sub: notReserved ? notReserved + ' à réserver' : 'Tout est réservé !', color: notReserved ? 'var(--amber)' : 'var(--sage)' },
  ];
  bigStats.forEach(function(s) {
    html += '<div class="stats-big-card">' +
      '<div class="stats-big-icon">' + s.icon + '</div>' +
      '<div class="stats-big-value" style="color:' + s.color + '">' + s.value + '</div>' +
      '<div class="stats-big-label">' + s.label + '</div>' +
      '<div class="stats-big-sub">' + s.sub + '</div>' +
    '</div>';
  });
  html += '</div>';

  // Budget breakdown bar
  html += '<div class="stats-section-title">Répartition du budget hébergement</div>';
  html += '<div class="stats-budget-bars">';
  var budgetByCity = {};
  groups.forEach(function(g) { if (g.city) budgetByCity[g.city] = (budgetByCity[g.city]||0) + parseBudget(g.prix); });
  var maxB = Math.max.apply(null, Object.values(budgetByCity).filter(Boolean));
  cities.forEach(function(city, i) {
    var b = budgetByCity[city] || 0;
    if (!b) return;
    var pct = Math.round(b / maxB * 100);
    var color = STOP_COLORS[i % STOP_COLORS.length];
    html += '<div class="stats-bar-row">' +
      '<div class="stats-bar-label">' + city + '</div>' +
      '<div class="stats-bar-track"><div class="stats-bar-fill" style="width:' + pct + '%;background:' + color + '"></div></div>' +
      '<div class="stats-bar-value">' + formatEURint(b) + '</div>' +
    '</div>';
  });
  html += '</div>';

  // Fun facts section
  html += '<div class="stats-section-title">Quelques chiffres fun</div>';
  html += '<div class="stats-fun-grid">';
  var funs = [
    { icon: '✈️', text: 'Distance Toulouse → Tokyo', val: '9 700 km', sub: 'environ 13h de vol' },
    { icon: '🍜', text: 'Restaurants dans vos fiches', val: restoCount + ' adresses', sub: cities.length + ' villes couvertes' },
    { icon: '🚄', text: 'Trajets en train/Shinkansen', val: shinkansen + ' trajets', sub: '⚠️ Comparer avec JR Pass avant achat' },
    { icon: '📸', text: 'Destinations UNESCO', val: '5', sub: 'Kyoto, Hiroshima, Nara, Miyajima, Shirakawa-gō' },
    { icon: '🌡️', text: 'Températures en novembre', val: '5–18°C', sub: 'du nord au sud du Japon' },
    { icon: '💴', text: 'Dépense quotidienne estimée', val: '¥10,000–15,000', sub: 'soit 65–100€/personne/jour' },
  ];
  funs.forEach(function(f) {
    html += '<div class="stats-fun-card">' +
      '<span class="stats-fun-icon">' + f.icon + '</span>' +
      '<div class="stats-fun-body">' +
        '<div class="stats-fun-text">' + f.text + '</div>' +
        '<div class="stats-fun-val">' + f.val + '</div>' +
        '<div class="stats-fun-sub">' + f.sub + '</div>' +
      '</div>' +
    '</div>';
  });
  html += '</div>';

  document.getElementById('page-container').innerHTML = html;
}

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
      { q: 'Le pourboire', a: '<strong>N\'en donnez jamais, nulle part.</strong> Au Japon, laisser de l\'argent en dehors du prix fixé est considéré comme impoli ou embarrassant. Les serveurs peuvent courir après vous dans la rue pour vous le rendre. Ça inclut les taxis, les guides, les masseurs — absolument tous les services.' },
      { q: 'Parler dans les transports', a: 'Conversations à voix haute et appels téléphoniques sont mal vus dans le métro et le Shinkansen. Réglez votre téléphone en mode silencieux dès que vous entrez dans un train. Dans le Shinkansen, si vous devez appeler, rendez-vous dans l\'espace inter-wagons.' },
      { q: 'La file d\'attente', a: 'Les Japonais font la queue de façon exemplaire et naturelle. Sur les quais de métro, des lignes peintes au sol indiquent exactement où attendre — respectez-les. On laisse sortir les passagers avant de monter. Couper la file, même accidentellement, crée un malaise palpable.' },
      { q: 'Côté escalator', a: '<strong>À Osaka :</strong> restez à droite (gauche pour marcher vite). <strong>Partout ailleurs :</strong> restez à gauche (droite pour marcher). Exception historique d\'Osaka qui prend plaisir à être différente !' },
      { q: 'Chaussures', a: 'On retire ses chaussures à l\'entrée des maisons privées, des ryokan, de nombreux temples et de certains restaurants traditionnels. Des pantoufles sont souvent fournies. <strong>Attention :</strong> dans les WC, il y a souvent des pantoufles spéciales "WC" — on les change à l\'entrée, et on <em>n\'oublie pas</em> de les remettre en sortant (erreur classique de touriste).' },
      { q: 'Cadeaux & emballage', a: 'Offrir un cadeau est courant, mais on ne l\'ouvre généralement pas devant la personne (pour ne pas montrer de déception ou d\'enthousiasme excessif). L\'emballage compte autant que le contenu — les Japonais emballent avec un soin extrême.' },
      { q: 'Respect du silence', a: 'Le silence n\'est pas embarrassant au Japon — il est respectueux. Ne cherchez pas à remplir les silences dans une conversation. Dans les espaces publics (librairies, musées, trains), le volume ambiant est souvent étonnamment bas.' },
      { q: 'Tatouages', a: 'Les tatouages restent tabous dans certains onsen, piscines et ryokan — ils sont historiquement associés à la yakuza. Des établissements "tattoo-friendly" existent mais sont moins répandus. Si vous en avez, couvrez-les dans les lieux publics pour éviter les situations délicates.' },
    ]
  },
  {
    icon: '🍱', title: 'Nourriture & Restaurants',
    items: [
      { q: 'Itadakimasu & Gochisōsama', a: 'Avant de manger, dites <strong>いただきます (itadakimasu)</strong> — "Je reçois humblement". Après, <strong>ごちそうさまでした (gochisōsama deshita)</strong> — "C\'était un festin". Ce ne sont pas juste des formules de politesse : elles expriment une gratitude envers tous ceux qui ont contribué au repas.' },
      { q: 'Oshibori', a: 'Le petit tissu humide qu\'on vous apporte à l\'arrivée sert à s\'essuyer <strong>uniquement les mains</strong>. Pas le visage en public (bien que certains Japonais le fassent en privé). Rendez-le replié proprement après usage.' },
      { q: 'Manger en marchant', a: 'Déconseillé dans la vie quotidienne — ça se fait dans les festivals et marchés de rue uniquement. Une exception notable : les ruelles de Kyoto ou Nara où c\'est toléré pour les touristes. Mais trouvez un endroit pour vous asseoir autant que possible.' },
      { q: 'Baguettes — les interdits', a: 'Ne les plantez <strong>jamais</strong> verticalement dans un bol de riz (geste funéraire — rappelle les offrandes aux morts). Ne les tendez jamais à quelqu\'un d\'autre baguette-à-baguette (idem, symbolique funéraire de passage des os). Posez-les sur le repose-baguettes ou horizontalement sur le bol.' },
      { q: 'Le bruit en mangeant', a: 'Contrairement à l\'étiquette occidentale, <strong>aspirer bruyamment ses ramen ou ses soba est poli</strong> — cela refroidit les nouilles et signifie qu\'on apprécie. Ne soyez pas gêné par le bruit des tables voisines.' },
      { q: 'Commander sans parler japonais', a: 'Beaucoup de restaurants ont des photos dans le menu ou des <em>sampuru</em> (maquettes en plastique ultra-réalistes) en vitrine — pointez simplement. Les tablettes de commande tactile en anglais sont très répandues. L\'appli Google Translate avec mode caméra déchiffre les menus en temps réel.' },
      { q: 'Konbini — bien plus qu\'un magasin', a: 'Les 7-Eleven, Lawson et FamilyMart japonais sont extraordinaires. Onigiri frais (¥120), bento chauds, ramen cup de qualité, yakitori, café... mais aussi <strong>payer ses factures, retirer de l\'argent, imprimer, envoyer des colis</strong>. Ouverts 24h/24, ils sont un pilier de la vie quotidienne.' },
      { q: 'Les files d\'attente pour les restaurants', a: 'Les grandes files devant un restaurant sont une <strong>garantie de qualité</strong> au Japon. Les locaux ne font pas la queue n\'importe où. Utilisez l\'app <strong>Tabelog</strong> (équivalent TripAdvisor) pour voir les notes et gérer les attentes.' },
    ]
  },
  {
    icon: '🚇', title: 'Transport',
    items: [
      { q: 'Ponctualité légendaire', a: 'Les trains japonais ont un retard moyen de 18 secondes par an. Soyez au quai à l\'heure — la porte s\'ouvre et se ferme à la minute exacte. Un retard de 2 minutes déclenche des excuses officielles par haut-parleur. Les trains de retard rares sont suffisamment inhabituels pour faire la une des journaux.' },
      { q: 'Carte IC (Suica / Pasmo)', a: 'La carte IC est le sésame du transport japonais : métro, bus, trains locaux, konbini, certains distributeurs. Chargez-la à l\'aéroport dès l\'arrivée. Minimum ¥500 de dépôt récupérable. Sur iPhone récent, vous pouvez l\'ajouter dans Apple Wallet.' },
      { q: 'Validation des tickets', a: 'Passez toujours votre carte à l\'entrée <strong>ET</strong> à la sortie des portiques. La sortie est cruciale — le système calcule le tarif à la sortie selon la distance. Un oubli bloque le portique et nécessite l\'assistance du guichetier.' },
      { q: 'Lire les panneaux', a: 'Toutes les grandes stations affichent les noms en romaji (alphabet latin). Les annonces dans le Shinkansen et le métro de Tokyo sont en anglais. Les lignes de métro ont des couleurs et des numéros — utilisez les numéros plutôt que les noms japonais.' },
      { q: 'Taxis', a: 'Les portières s\'ouvrent et se ferment <strong>automatiquement</strong> — ne les touchez pas. Donnez l\'adresse en japonais si possible (montrez votre téléphone avec la carte). Les taxis sont chers mais propres, ponctuels et les chauffeurs portent souvent des gants blancs.' },
      { q: 'Shinkansen — astuces', a: 'Réservez un siège côté <strong>droite (sens Tokyo→Osaka)</strong> pour voir le Mont Fuji. La voiture 11 en épi est souvent réservée aux porteurs de bagages encombrants. Le Nozomi (le plus rapide) ne prend pas le JR Pass standard.' },
      { q: 'Vélo', a: 'Idéal dans les villes plates comme Kyoto, Kanazawa ou le long des rivières. Des loueurs proposent des vélos à la journée (~¥1,000). Stationnez uniquement dans les zones dédiées — les vélos mal garés sont confisqués et récupérables contre une amende.' },
    ]
  },
  {
    icon: '🏯', title: 'Temples & Sites',
    items: [
      { q: 'Shinto vs Bouddhisme', a: 'Le Japon pratique les deux en parallèle sans contradiction : <strong>les sanctuaires (jinja) sont shinto</strong> — portiques torii, renards et cordes tressées (shimenawa). <strong>Les temples (tera/ji) sont bouddhistes</strong> — pagodes, statues de Bouddha, encens. Une même famille peut se marier en shinto et se faire enterrer en bouddhiste.' },
      { q: 'Temizuya — purification', a: 'À l\'entrée d\'un sanctuaire shinto, rincez vos mains au bassin (temizuya) : puisez de l\'eau avec la louche, versez sur la main gauche, puis droite, puis dans le creux de la main gauche pour vous rincer la bouche (ne buvez pas !), puis redressee la louche pour que l\'eau coule sur le manche.' },
      { q: 'Torii & déplacement sacré', a: 'Les torii marquent le passage du monde profane au monde sacré. Inclinez légèrement la tête en passant dessous. Évitez de marcher au centre de l\'allée (réservé aux divinités) — tenez-vous sur le côté.' },
      { q: 'Offrandes et prières', a: 'Dans un sanctuaire shinto : lancez une pièce dans le coffre, sonnez la cloche, inclinez-vous deux fois, frappez deux fois des mains, inclinez-vous encore une fois. Dans un temple bouddhiste : brûlez un bâton d\'encens (senko), orientez la fumée vers vous (purifiante), joignez les mains et priez.' },
      { q: 'Omamori — les amulettes', a: 'Ces petits sachets en tissu brodé vendus dans tous les sanctuaires sont des amulettes pour la santé, l\'amour, la réussite, la sécurité en route... On ne les ouvre jamais (ça brise la protection) et on les rapporte au temple après un an pour les brûler. Un beau souvenir.' },
      { q: 'Goshuin — le carnet de temple', a: 'Le <em>goshuincho</em> est un carnet accordéon dans lequel les temples et sanctuaires apposent un tampon calligraphié unique (goshuin). Un souvenir extraordinaire qui se collectionne tout au long du voyage. Vendez dans les temple shops (~¥1,000).' },
      { q: 'Photos', a: 'Vérifiez toujours les panneaux "No Photography". Les espaces intérieurs sacrés, certains jardins zen et trésors nationaux l\'interdisent. Ne photographiez jamais les gens dans les espaces sacrés sans leur accord tacite (les geishas de Gion y sont particulièrement sensibles).' },
    ]
  },
  {
    icon: '♨️', title: 'Onsen & Sento',
    items: [
      { q: 'Règles fondamentales', a: 'On entre dans l\'onsen <strong>entièrement nu</strong>. Pas de maillot — jamais. Rincez-vous soigneusement à la douche individuelle (avec le pommeau) <strong>avant</strong> d\'entrer dans le bassin commun. C\'est une règle d\'hygiène absolue.' },
      { q: 'La petite serviette', a: 'Elle sert à se couvrir en marchant vers le bassin et peut être posée, repliée, sur le bord ou sur votre tête dans l\'eau (pratique pour ne pas s\'évaporer). Elle <strong>n\'entre jamais</strong> dans le bassin lui-même.' },
      { q: 'Cheveux longs', a: 'Attachez ou relevez vos cheveux pour qu\'ils ne touchent pas l\'eau du bassin. Des élastiques sont souvent disponibles à l\'accueil.' },
      { q: 'Température & durée', a: 'Les onsens japonais sont <strong>très chauds</strong> (40–45°C). Entrez lentement, jusqu\'aux épaules. Ne restez pas plus de 10–15 min d\'affilée pour éviter l\'hypotension. Hydratez-vous bien avant et après.' },
      { q: 'Sento vs Onsen', a: 'Le <strong>sento</strong> est un bain public avec eau du robinet chauffée — abordable (~¥500), très local. L\'<strong>onsen</strong> utilise de l\'eau thermale naturelle aux minéraux — expérience plus "authentique". Dans les deux cas, les règles de nudité et d\'hygiène s\'appliquent.' },
      { q: 'Rotenburo — bain en plein air', a: 'Le <em>rotenburo</em> est un bassin extérieur dans un cadre naturel (forêt, montagne, vue sur mer). Avec neige en hiver, c\'est une expérience transcendante. Prévu dans votre itinéraire si vous êtes dans une auberge avec onsen.' },
      { q: 'Après l\'onsen', a: 'Évitez de vous rincer — les minéraux sont censés rester sur la peau pour leurs bienfaits. Buvez beaucoup d\'eau. Le yukata (kimono léger) que vous enfilez après est idéal pour se promener dans le ryokan et dîner.' },
    ]
  },
  {
    icon: '💰', title: 'Argent & Shopping',
    items: [
      { q: 'Le Japon reste très cash', a: 'Malgré l\'essor du paiement sans contact, <strong>beaucoup de temples, petits restaurants et boutiques artisanales n\'acceptent que les espèces</strong>. Prévoyez toujours 20 000–50 000 ¥ en liquide. Ne soyez jamais à court.' },
      { q: 'ATM — où retirer', a: '<strong>ATM 7-Bank</strong> (dans tous les 7-Eleven) : la référence pour les cartes étrangères, interface en anglais, commission ~¥110. <strong>Japan Post ATM</strong> (bureaux de poste) : aussi fiable. La plupart des ATMs de banques locales classiques refusent les cartes étrangères.' },
      { q: 'Payer par carte', a: 'Visa et Mastercard sont acceptés dans les grands magasins, chaînes et hôtels. American Express bien moins. Certains restaurants ont un minimum de consommation pour la carte. La carte IC (Suica) s\'utilise comme moyen de paiement dans les konbini et certains commerces.' },
      { q: 'Tax Free Shopping', a: 'En tant que touriste étranger, vous êtes exonéré de TVA (10%) sur les achats dépassant ¥5,000 dans les magasins affiliés. Présentez votre passeport à la caisse — on vous remet une enveloppe de remboursement. Très pratique dans les grands magasins.' },
      { q: 'Don Quijote (Donki)', a: 'Cette chaîne de grandes surfaces fouillies et labyrinthiques est le paradis des achats : cosmétiques japonais, snacks, gadgets, alcools, vêtements, électronique... à des prix souvent très avantageux. Ouvert souvent jusqu\'à minuit voire 24h/24.' },
      { q: 'Marchandage', a: '<strong>On ne marchande pas au Japon</strong>. Le prix affiché est le prix. Tenter de négocier dans une boutique est perçu comme impoli. Les seules exceptions : certains marchés aux puces et brocantes.' },
    ]
  },
  {
    icon: '🌤️', title: 'Météo de novembre–décembre',
    items: [
      { q: 'Températures à attendre', a: '<strong>Tokyo :</strong> 8–17°C. <strong>Kyoto / Osaka :</strong> 8–16°C. <strong>Hiroshima :</strong> 9–17°C. <strong>Kanazawa :</strong> 5–13°C. <strong>Takayama :</strong> 0–10°C (froid et neige possible). Fin novembre = début du grand froid dans les Alpes japonaises.' },
      { q: 'Les koyo — feuilles d\'automne', a: 'Novembre est <strong>la saison du koyo</strong> (紅葉) : les érables japonais (momiji) et ginkgos virent au rouge, orange et jaune vif. C\'est l\'une des deux grandes saisons touristiques avec les cerisiers. Kyoto, Nara et Kanazawa sont particulièrement spectaculaires. Réservez à l\'avance.' },
      { q: 'Quoi porter', a: 'Superposez ! Matin et soir froids, journées douces. Manteau ou veste chaude indispensable, écharpe, t-shirts thermiques pour Takayama et les zones de montagne. Les températures chutent de 5–8°C entre les plaines et les Alpes japonaises.' },
      { q: 'Pluie & parapluie', a: 'Novembre est relativement sec, mais des averses sont possibles. Les japonais ont une culture du parapluie très poussée — chaque konbini vend des parapluies transparents pour ~¥500 (les <em>bijin kasa</em>). Emportez un imperméable léger ou achetez-en un sur place.' },
      { q: 'Jours fériés novembre', a: '<strong>3 novembre</strong> : Journée de la Culture (musées et sites peuvent être très fréquentés). <strong>15 novembre</strong> : Shichi-go-san (fête des enfants de 3, 5 et 7 ans — vous verrez des enfants en kimono dans les sanctuaires). <strong>23 novembre</strong> : Journée du Travail.' },
      { q: 'Illuminations de décembre', a: 'Début décembre, les illuminations de Noël s\'allument dans tout le Japon — paradoxalement très populaires malgré la minorité chrétienne. Shibuya, Marunouchi à Tokyo, et les grandes villes brillent de mille feux. Ambiance féerique.' },
    ]
  },
  {
    icon: '📱', title: 'Tech & Applications',
    items: [
      { q: 'Google Maps — indispensable', a: '<strong>Téléchargez les zones offline avant de partir</strong> (Tokyo, Kyoto, Osaka, Hiroshima, Kanazawa). Google Maps est exceptionnellement précis au Japon pour les transports en commun : il donne les numéros de quai, les correspondances à la minute, les prix.' },
      { q: 'Google Translate — mode caméra', a: 'L\'IA de traduction en temps réel via la caméra lit les menus, panneaux et étiquettes japonais instantanément. <strong>Téléchargez le pack japonais offline</strong> — vous n\'aurez pas toujours du WiFi.' },
      { q: 'Applications utiles', a: '<strong>Tabelog</strong> : avis de restaurants (note /5 très fiable). <strong>Gurunavi</strong> : réservations en ligne. <strong>Japan Official Travel App</strong> : infos transport officielles. <strong>Hyperdia</strong> ou <strong>Navitime</strong> : calcul de trajets JR avec tarifs. <strong>Yurekuru</strong> : alertes séismes.' },
      { q: 'Connectivité — vos options', a: '<strong>eSIM</strong> (Airalo, Holafly) : activation immédiate, data uniquement. <strong>SIM locale</strong> (IIJmio, Sakura Mobile) : commander avant le départ. <strong>Pocket WiFi</strong> : routeur partageable entre 4, ~¥5/jour. Recommandation : eSIM individuelle + désactivation du roaming.' },
      { q: 'Prises & courant', a: 'Japon : <strong>100V</strong>, prises type A (identiques aux prises US — plates à deux broches). Vos chargeurs USB-C européens fonctionnent généralement sans adaptateur. Vérifiez la tension de vos appareils (marquée sur le chargeur). Un multiprise compact est très utile dans les chambres d\'hôtel.' },
      { q: 'Urgences digitales', a: 'Sauvegardez en offline : votre itinéraire complet, les confirmations d\'hôtels, votre passeport scanné, les numéros d\'urgence (police 110, pompiers/SAMU 119, ambassade de France +81-3-5798-6000). Un téléphone mort sans batterie externe à 14h à Tokyo = situation de stress.' },
    ]
  },
  {
    icon: '🏥', title: 'Santé & Sécurité',
    items: [
      { q: 'Le Japon est très sûr', a: 'Le Japon est l\'un des pays les plus sûrs au monde. Le taux de criminalité est extrêmement bas. Vous pouvez laisser votre sac sur votre chaise dans un café, votre vélo non attaché, marcher seul la nuit dans les grandes villes sans crainte réelle.' },
      { q: 'Séismes', a: 'Le Japon est l\'un des pays les plus sismiques du monde. En cas de séisme : réfugiez-vous sous une table solide ou dans l\'encadrement d\'une porte, protégez votre tête. Les immeubles modernes japonais sont conçus pour résister — faites confiance à la construction.' },
      { q: 'Assurance médicale', a: '<strong>La carte européenne d\'assurance maladie ne fonctionne pas au Japon.</strong> Une hospitalisation peut coûter ¥100 000+ par nuit. Souscrivez une assurance voyage avant le départ (AXA, April, Chapka...). Gardez vos ordonnances et noms génériques de vos médicaments.' },
      { q: 'Pharmacies japonaises', a: 'Les pharmacies (薬局 / yakkyoku) sont bien fournies. Cherchez Matsumoto Kiyoshi ou CocoDrug. Pour les médicaments courants (antidouleurs, anti-diarrhée, pastilles gorge), inutile d\'en emmener des quantités — vous trouverez sur place, souvent sans ordonnance.' },
      { q: 'Urgences médicales', a: 'Appelez le <strong>119</strong> (SAMU/pompiers). Ou cherchez un hôpital avec une unité "Foreign Patient" — Tokyo et Osaka en ont plusieurs. L\'appli <strong>AMDA International Medical Information Center</strong> aide à trouver des médecins anglophones.' },
      { q: 'Ambassade de France à Tokyo', a: 'Adresse : 4-11-44 Minami-Azabu, Minato-ku, Tokyo. Téléphone : <strong>+81-3-5798-6000</strong>. Urgences consulaires hors heures ouvrables disponibles. Enregistrez ce numéro et aussi le numéro du Quai d\'Orsay : +33-1-77-67-67-67.' },
    ]
  },
  {
    icon: '💡', title: 'Vie quotidienne & Infos pratiques',
    items: [
      { q: 'Poubelles — le grand mystère', a: '<strong>Il n\'y a quasi pas de poubelles dans les rues japonaises</strong>, depuis les attentats au sarin de 1995 dans le métro. Promenez-vous avec un sac plastique pour vos déchets et jetez-les à l\'hôtel, dans un konbini (seuls les déchets du konbini) ou aux WC publics. Les Japonais ramènent chez eux leurs déchets.' },
      { q: 'WC japonais', a: 'Les washlet (WC électroniques) font peur mais deviennent addictifs. <strong>大 (大 = grand)</strong> : grosse chasse. <strong>小 (小 = petit)</strong> : petite chasse. Le bouton "son de flush" couvre les bruits — largement utilisé. La lunette est souvent chauffante en hiver. Profitez.' },
      { q: 'Décalage horaire', a: 'Toulouse → Tokyo = <strong>+8h en hiver</strong> (UTC+9 vs UTC+1). Un vol de 13h vous fait arriver le lendemain matin. Conseil d\'adaptation : ne dormez pas dans l\'avion, résistez jusqu\'à 22h local le premier soir, exposez-vous à la lumière dès le matin.' },
      { q: 'Dormir en ryokan', a: 'Le futon est posé directement sur le tatami — rangé dans le placard le matin par le personnel. On dort en yukata. Le repas du soir (kaiseki) est servi dans votre chambre. Arrivez pour l\'heure de check-in prévue — le rituel est orchestré.' },
      { q: 'Tri des déchets', a: 'Le tri sélectif est très strict au Japon. Dans les ryokan et appartements, les poubelles sont compartimentées : burnable (燃えるゴミ), non-burnable (燃えないゴミ), recyclable (缶・瓶・ペット). Suivez ce que fait l\'hôtel.' },
      { q: 'Ambiance générale', a: 'Le Japon peut sembler distant ou formel au premier abord. En réalité, <strong>les Japonais sont incroyablement serviables</strong>. Si vous avez l\'air perdu, quelqu\'un viendra vous aider spontanément — même sans parler anglais, ils vous accompagneront physiquement à votre destination plutôt que d\'expliquer.' },
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


// ═══════════════════════════════════════════════════════════════════
// 9. MÉTÉO & SAISON
// ═══════════════════════════════════════════════════════════════════
var METEO_DATA = [
  {
    city: 'Tokyo', nameJP: '東京', icon: '🗼',
    temps: { min: 8, max: 17, rain: 3 },
    koyo: 'Fin novembre — Shinjuku Gyoen, Rikugien',
    tips: [
      'Les jardins comme Rikugien s\'illuminent certains soirs pour le koyo nocturne (¥300, spectaculaire)',
      'Prenez un imperméable léger — quelques averses possibles en novembre',
      'Début décembre : illuminations de Noël à Marunouchi et Omotesando',
    ]
  },
  {
    city: 'Kanazawa', nameJP: '金沢', icon: '🏺',
    temps: { min: 5, max: 13, rain: 7 },
    koyo: 'Mi-novembre — Kenroku-en, Gyokusen-inmaru',
    tips: [
      'Kanazawa reçoit beaucoup plus de pluie que le reste du Japon en novembre — parapluie indispensable',
      'Le Kenroku-en est magnifique sous la pluie fine : les feuilles luisent',
      'Les yukitsuri (armatures de bambou pour protéger les arbres de la neige) sont installés à partir de novembre — spectacle unique',
    ]
  },
  {
    city: 'Takayama', nameJP: '高山', icon: '🏔️',
    temps: { min: 0, max: 10, rain: 4 },
    koyo: 'Début novembre (déjà terminé fin nov.)',
    tips: [
      'Takayama peut recevoir ses premières neiges fin novembre — prévoyez des chaussures imperméables',
      'Les ruelles de Sanmachi Suji sous un ciel gris hivernal ont un charme particulier et moins de touristes',
      'Shirakawa-go début décembre : les toits de chaume peuvent déjà être enneigés — féerique',
    ]
  },
  {
    city: 'Kyoto', nameJP: '京都', icon: '⛩️',
    temps: { min: 7, max: 16, rain: 4 },
    koyo: 'Mi à fin novembre — Eikan-do, Tofuku-ji, Arashiyama',
    tips: [
      'Le Tofuku-ji est LE spot koyo de Kyoto : un tapis rouge et orange à perte de vue depuis le pont Tsutenkaku',
      'Éikan-do propose des illuminations nocturnes du koyo en novembre — queue de 2h mais exceptionnel',
      'Fin novembre à Kyoto = très fréquenté. Arrivez aux sites avant 8h ou après 16h',
      'Le marché Nishiki reste vivant même par temps froid — parfait pour se réchauffer avec du dashi',
    ]
  },
  {
    city: 'Nara', nameJP: '奈良', icon: '🦌',
    temps: { min: 6, max: 16, rain: 4 },
    koyo: 'Mi-novembre — Parc de Nara, Yoshiki-en',
    tips: [
      'Les érables du parc de Nara sont splendides mi-novembre avec les cerfs qui se promènent entre les feuilles rouges',
      'Visite en journée depuis Kyoto recommandée — Nara est à 45 min en train',
      'Novembre = foules plus raisonnables que l\'automne de Kyoto, profitez-en',
    ]
  },
  {
    city: 'Hiroshima', nameJP: '広島', icon: '🕊️',
    temps: { min: 9, max: 17, rain: 3 },
    koyo: 'Fin novembre — Shukkei-en, Miyajima',
    tips: [
      'Le Mont Misen à Miyajima est particulièrement beau avec les érables d\'automne fin novembre',
      'Le torii vu depuis un ferry au coucher du soleil en novembre = lumière dorée parfaite, peu de touristes',
      'Hiroshima est une des villes les plus clémentes de l\'itinéraire en termes de météo hivernale',
    ]
  },
  {
    city: 'Osaka', nameJP: '大阪', icon: '🎡',
    temps: { min: 8, max: 17, rain: 4 },
    koyo: 'Fin novembre — Expo\'70 Commemorative Park',
    tips: [
      'Osaka est le hub pour la journée de koyo à l\'Expo\'70 Park (érables exceptionnels)',
      'Universal Studios Japan : moins de queue en novembre qu\'en été, mais vêtements chauds requis',
      'Dotonbori est encore plus photogénique la nuit dans le froid de novembre — vapeurs des restaurants, néons réfléchis',
    ]
  },
  {
    city: 'Magome', nameJP: '馬籠', icon: '🪵',
    temps: { min: 2, max: 10, rain: 4 },
    koyo: 'Début décembre — parfois encore quelques érables',
    tips: [
      'Début décembre à Magome = frais voire froid (3–10°C). Habillez-vous en conséquence pour la randonnée',
      'Les pavés de la route Nakasendo peuvent être glissants après la pluie ou si gelés',
      'Les ruelles de Magome presque vides en décembre — l\'atmosphère médiévale est saisissante',
    ]
  },
];

function renderMeteo() {
  var html = _newPageHeader('🌤️', 'Météo & Saison', '気候と季節', 'Novembre–décembre au Japon : à quoi s\'attendre');

  // Season intro banner
  html += '<div class="meteo-banner">';
  html += '<div class="meteo-banner-emoji">🍁</div>';
  html += '<div class="meteo-banner-body">';
  html += '<div class="meteo-banner-title">Saison idéale — le koyo</div>';
  html += '<div class="meteo-banner-text">Votre voyage tombe pendant l\'une des plus belles saisons du Japon : le <strong>koyo</strong> (紅葉), la coloration automnale des érables. Des milliers de momiji virent au rouge, orange et jaune dans tous les parcs et temples. Températures fraîches et agréables, foules inférieures à l\'été.</div>';
  html += '</div></div>';

  // Legend
  html += '<div class="meteo-legend">';
  html += '<span class="meteo-leg-item"><span class="meteo-temp-icon" style="color:#2a7090">🌡️</span> Min / Max °C</span>';
  html += '<span class="meteo-leg-item"><span class="meteo-temp-icon" style="color:#5c8f7d">☔</span> Jours de pluie/mois</span>';
  html += '<span class="meteo-leg-item"><span class="meteo-temp-icon" style="color:#c73e1d">🍁</span> Koyo</span>';
  html += '</div>';

  // City cards
  html += '<div class="meteo-grid">';
  METEO_DATA.forEach(function(m) {
    html += '<div class="meteo-card">';
    html += '<div class="meteo-card-header">';
    html += '<span class="meteo-city-icon">' + m.icon + '</span>';
    html += '<div><div class="meteo-city-name">' + m.city + '</div><div class="meteo-city-jp">' + m.nameJP + '</div></div>';
    html += '</div>';

    html += '<div class="meteo-stats">';
    html += '<div class="meteo-stat"><span class="meteo-stat-icon">🌡️</span><span class="meteo-stat-val">' + m.temps.min + '–' + m.temps.max + '°C</span></div>';
    html += '<div class="meteo-stat"><span class="meteo-stat-icon">☔</span><span class="meteo-stat-val">~' + m.temps.rain + ' j/mois</span></div>';
    html += '</div>';

    html += '<div class="meteo-koyo"><span class="meteo-koyo-icon">🍁</span>' + m.koyo + '</div>';

    html += '<ul class="meteo-tips">';
    m.tips.forEach(function(t){ html += '<li>' + t + '</li>'; });
    html += '</ul>';

    html += '</div>';
  });
  html += '</div>';

  // Packing tip
  html += '<div class="meteo-packing-tip">';
  html += '<div class="meteo-packing-title">🧥 Quoi mettre dans sa valise pour cette saison</div>';
  html += '<div class="meteo-packing-grid">';
  var packingItems = [
    { icon: '🧥', label: 'Manteau ou veste chaude', note: 'Indispensable, surtout Takayama & Magome' },
    { icon: '🧣', label: 'Écharpe & bonnet', note: 'Matins et soirs froids partout' },
    { icon: '👕', label: 'Sous-vêtements thermiques', note: 'Chaleur légère sans surcharger' },
    { icon: '👟', label: 'Chaussures imperméables', note: 'Pavés mouillés à Kanazawa et Magome' },
    { icon: '☂️', label: 'Parapluie compact', note: 'Ou achetez-en un konbini pour ¥500' },
    { icon: '🧴', label: 'Crème hydratante', note: 'L\'air sec d\'automne dessèche la peau' },
  ];
  packingItems.forEach(function(p) {
    html += '<div class="meteo-packing-item"><span class="meteo-packing-icon">' + p.icon + '</span>';
    html += '<div><div class="meteo-packing-label">' + p.label + '</div><div class="meteo-packing-note">' + p.note + '</div></div></div>';
  });
  html += '</div></div>';

  document.getElementById('page-container').innerHTML = html;
}


// ═══════════════════════════════════════════════════════════════════
// 8. AGENDA CULTUREL
// ═══════════════════════════════════════════════════════════════════
var AGENDA_DATA = [
  {
    city: 'Tokyo', nameJP: '東京', dates: '19–21 nov',
    events: [
      {
        name: 'Koyo nocturne — Rikugien',
        type: 'Nature', emoji: '🍁',
        date: '1–23 nov (soirs)',
        desc: 'Le jardin Rikugien illumine ses érables chaque soir en novembre. Tapis rouge et reflets dans l\'étang, atmosphère zen et magique.',
        price: '¥300', tip: '⏰ Ouvert 18h–21h, queue conseillée 17h30'
      },
      {
        name: 'Koyo — Shinjuku Gyoen',
        type: 'Nature', emoji: '🌳',
        date: 'Fin novembre',
        desc: 'Le grand jardin national de Tokyo mélange érables japonais et ginkgos dorés. Parfait pour une demi-journée de pique-nique dans les feuilles.',
        price: '¥500', tip: '📍 Entrée Shinjuku-mon'
      },
      {
        name: 'Festival de musique au Budokan',
        type: 'Musique', emoji: '🎵',
        date: 'Tout novembre',
        desc: 'La salle légendaire de Tokyo accueille des concerts régulièrement. Vérifiez le programme sur Pia ou LiveNation Japan pour les dates exactes.',
        price: '¥4,000–10,000', tip: '🎫 Billetterie en ligne recommandée'
      },
      {
        name: 'Marchés de Noël Allemand — Marunouchi',
        type: 'Marché', emoji: '🎄',
        date: 'Mi-nov à fin déc',
        desc: 'Marché de Noël style bavarois au cœur du quartier d\'affaires. Glühwein, saucisses, décorations. Atmosphère inattendue et très populaire.',
        price: 'Entrée libre', tip: '✨ Plus beau en soirée, illuminations 17h–22h'
      },
    ]
  },
  {
    city: 'Kanazawa', nameJP: '金沢', dates: '22–24 nov',
    events: [
      {
        name: 'Yukitsuri — Kenroku-en',
        type: 'Tradition', emoji: '🪢',
        date: '1er nov → mars',
        desc: 'Installation des armatures de bambou et corde pour protéger les pins de la neige. Un art japonais ancestral et photographique. Le Kenroku-en est l\'un des plus beaux spots.',
        price: '¥320', tip: '🌟 Ne pas manquer — exclusivité de la région'
      },
      {
        name: 'Kanazawa Jazz Street (automne)',
        type: 'Musique', emoji: '🎷',
        date: 'Novembre (TBC)',
        desc: 'Festival de jazz dans les quartiers historiques. Des musiciens jouent dans les bars, rues et espaces culturels de la ville.',
        price: 'Entrée libre pour la majorité', tip: '🎶 Programme sur kanazawa-jazz.jp'
      },
      {
        name: 'Koyo — Gyokusen-inmaru Garden',
        type: 'Nature', emoji: '🍁',
        date: 'Mi-novembre',
        desc: 'Jardin récemment restauré, moins connu que le Kenroku-en mais souvent plus beau pour le koyo. Vue sur le château.',
        price: '¥310', tip: '📸 Spot photo peu fréquenté'
      },
    ]
  },
  {
    city: 'Takayama', nameJP: '高山', dates: '23–24 nov',
    events: [
      {
        name: 'Marchés du matin (Jinya-mae & Miyagawa)',
        type: 'Marché', emoji: '🥕',
        date: 'Tous les matins',
        desc: 'Petits marchés paysans quotidiens dans les ruelles historiques. Légumes de montagne, pickles, fleurs séchées, artisanat local. Atmosphère vivante et authentique.',
        price: 'Gratuit', tip: '⏰ 7h–12h'
      },
      {
        name: 'Saké no Yado — dégustations de brasseries',
        type: 'Gastronomie', emoji: '🍶',
        date: 'Toute l\'année',
        desc: 'Les 6 brasseries de saké de Sanmachi Suji proposent des dégustations libres. En automne, les nouvelles cuvées (shiboritate) arrivent — c\'est le meilleur moment.',
        price: 'Gratuit (dégus)', tip: '🍶 Cherchez la boule de cèdre verte (sugidama) à l\'entrée'
      },
      {
        name: 'Excursion Shirakawa-go — village enneigé',
        type: 'Excursion', emoji: '🏔️',
        date: 'Déc — illuminations nocturnes',
        desc: 'Si votre passage coïncide avec un week-end d\'illumination hivernal, le village gasshō-zukuri sous la neige éclairé la nuit est une des images les plus féeriques du Japon.',
        price: 'Bus ~¥2,600 A/R', tip: '📅 Vérifiez les dates exactes d\'illumination sur Shirakawa-go.gr.jp'
      },
    ]
  },
  {
    city: 'Kyoto', nameJP: '京都', dates: '25–27 nov',
    events: [
      {
        name: 'Koyo nocturne — Eikan-do',
        type: 'Nature', emoji: '🍁',
        date: '1–30 nov (soirs)',
        desc: 'Le temple Eikan-do illumine ses jardins d\'érables chaque soir en novembre. Probablement le plus beau spectacle de koyo nocturne de tout le Japon. Attente jusqu\'à 2h mais inoubliable.',
        price: '¥600', tip: '⏰ Ouvre 17h30 — arrivez avant 17h'
      },
      {
        name: 'Koyo — Tofuku-ji',
        type: 'Nature', emoji: '🌊',
        date: 'Mi à fin novembre',
        desc: 'Le pont Tsutenkaku enjambe une mer d\'érables rouges — la scène la plus photographiée du koyo de Kyoto. Arrivez avant 8h ou après 16h pour éviter les foules.',
        price: '¥600', tip: '🌅 Meilleure lumière tôt le matin'
      },
      {
        name: 'Arashiyama Hanatouro — illuminations',
        type: 'Tradition', emoji: '🏮',
        date: 'Déb. déc (vérifier)',
        desc: 'Des milliers de lanternes illuminent les bambous et temples d\'Arashiyama le soir. Si vous êtes encore à Kyoto début décembre, c\'est à ne pas manquer.',
        price: 'Gratuit', tip: '🎋 Programme sur hanatouro.jp'
      },
      {
        name: 'Excursion Nara — cerfs et érables',
        type: 'Excursion', emoji: '🦌',
        date: 'Mi-novembre (koyo)',
        desc: 'À 45 min de Kyoto, le parc de Nara conjugue cerfs sacrés et érables colorés. Le combo parfait pour une journée d\'automne.',
        price: 'Train ~¥9 A/R (carte IC)', tip: '🚃 Kintetsu Nara line depuis Kyoto'
      },
    ]
  },
  {
    city: 'Hiroshima', nameJP: '広島', dates: '28 nov',
    events: [
      {
        name: 'Commémoration & Mémorial de la Paix',
        type: 'Histoire', emoji: '🕊️',
        date: 'Toute l\'année',
        desc: 'Le musée de la Paix retrace l\'histoire du 6 août 1945 avec une rigueur poignante. Une visite qui transforme. Prévoir 2h minimum et de la place mentale.',
        price: '¥200', tip: '🙏 La partie des objets personnels est particulièrement émouvante'
      },
      {
        name: 'Koyo — Shukkei-en & Miyajima',
        type: 'Nature', emoji: '🍁',
        date: 'Fin novembre',
        desc: 'Le jardin Shukkei-en en ville est superbe à l\'automne. Sur l\'île de Miyajima, les érables du Mont Misen créent un cadre naturel exceptionnel.',
        price: '¥260 (jardin)', tip: '🚢 Ferry Miyajima inclus dans certains JR passes régionaux'
      },
      {
        name: 'Festival d\'huîtres de Miyajima',
        type: 'Gastronomie', emoji: '🦪',
        date: 'Novembre–mars (saison)',
        desc: 'C\'est la pleine saison des huîtres de la mer intérieure de Seto. Les stands de Miyajima proposent des huîtres grillées sur charbon, cuites à la sauce ponzu ou en beignet.',
        price: '¥600–1,500', tip: '🔥 Mangez-les directement sur le grill, chaudes'
      },
    ]
  },
  {
    city: 'Osaka', nameJP: '大阪', dates: '29 nov–1 déc',
    events: [
      {
        name: 'Universal Studios Japan — Zone Nintendo',
        type: 'Loisirs', emoji: '🎮',
        date: 'Toute l\'année',
        desc: 'Super Nintendo World est une attraction unique au monde : Mario Kart en AR, Yoshi\'s Adventure, et le château de Peach grandeur nature. Réservez les Express Pass à l\'avance.',
        price: '¥10,400 + Express Pass ~¥5,000', tip: '📅 Achetez les tickets en ligne — souvent complet en nov'
      },
      {
        name: 'Illuminations de Noël — Midosuji Avenue',
        type: 'Illuminations', emoji: '✨',
        date: 'Mid-nov à fin déc',
        desc: '4 km d\'arbres illuminés le long du boulevard principal d\'Osaka. Une des illuminations les plus spectaculaires du Japon, avec des millions de LEDs.',
        price: 'Gratuit', tip: '🌃 Parfait pour une promenade du soir'
      },
      {
        name: 'Vente de saké nouveau (Shinbōritachi)',
        type: 'Gastronomie', emoji: '🍶',
        date: 'Novembre',
        desc: 'La période de mise en vente des nouvelles cuvées de saké de l\'année. Les izakayas et brasseries proposent des shiboritate (saké non filtré, frais) en quantité limitée.',
        price: '¥500–1,500/verre', tip: '🍶 Cherchez les panneaux "新酒" dans les izakayas'
      },
    ]
  },
  {
    city: 'Magome', nameJP: '馬籠', dates: '2 déc',
    events: [
      {
        name: 'Randonnée Nakasendo — Magome à Tsumago',
        type: 'Randonnée', emoji: '🥾',
        date: 'Toute l\'année (idéal mai–déc)',
        desc: '8 km de chemin forestier sur l\'ancienne route des shoguns. Rizières en terrasses, forêts de cèdres, auberges d\'époque. La randonnée la plus belle et la plus accessible du Japon.',
        price: 'Gratuit (bagagerie ~¥1,000/valise)', tip: '🎒 Envoyez vos valises au ryokan, marchez léger'
      },
      {
        name: 'Marché artisanal de Magome',
        type: 'Marché', emoji: '🏮',
        date: 'Week-ends',
        desc: 'Les boutiques des ruelles pavées de Magome vendent artisanat local, soba, teintures indigo, et objets en bois de cèdre liés à la route Nakasendo.',
        price: 'Gratuit', tip: '🪵 Cherchez les bouteilles de saké local et les lacques'
      },
    ]
  },
  {
    city: 'Tokyo (retour)', nameJP: '東京', dates: '3–4 déc',
    events: [
      {
        name: 'Illuminations Marunouchi Bright Christmas',
        type: 'Illuminations', emoji: '🎄',
        date: 'Nov–25 déc',
        desc: 'L\'avenue principale du quartier d\'affaires se transforme en allée de lumières champagne. Élégant, japonais dans l\'esprit, photographique.',
        price: 'Gratuit', tip: '📸 Plus beau 18h–22h'
      },
      {
        name: 'Shopping final — Akihabara & Don Quijote',
        type: 'Shopping', emoji: '🛍️',
        date: 'Toute l\'année',
        desc: 'Dernière occasion pour les Kit Kat rares, la papeterie Tokyu Hands, les gadgets électroniques et les cosmétiques japoanais. Vérifiez le poids de votre valise avant !',
        price: 'Selon appétit 😄', tip: '🧳 Tax-free disponible avec passeport (>¥5,000)'
      },
      {
        name: 'Koyo tardif — Shinjuku Gyoen',
        type: 'Nature', emoji: '🍁',
        date: 'Début décembre',
        desc: 'Début décembre, quelques érables tardifs et cerisiers hiver fleurissent encore dans le Shinjuku Gyoen. Un au revoir botanique avant de reprendre l\'avion.',
        price: '¥500', tip: '🌸 Les Prunus × subhirtella fleurissent en décembre !'
      },
    ]
  },
];

var _agendaFilter = 'all';

function renderAgenda() {
  var typeSet = {};
  AGENDA_DATA.forEach(function(city) {
    city.events.forEach(function(e){ typeSet[e.type] = e.emoji; });
  });
  var types = Object.keys(typeSet).sort();

  var html = _newPageHeader('🎌', 'Agenda culturel', '文化カレンダー', 'Événements et activités pendant votre séjour nov–déc 2026');

  // Filter buttons
  html += '<div class="agenda-filters">';
  html += '<button class="agenda-filter-btn' + (_agendaFilter==='all'?' active':'') + '" onclick="setAgendaFilter(\'all\')">Tout</button>';
  types.forEach(function(t) {
    html += '<button class="agenda-filter-btn' + (_agendaFilter===t?' active':'') + '" onclick="setAgendaFilter(\'' + t + '\')">' + typeSet[t] + ' ' + t + '</button>';
  });
  html += '</div>';

  // City sections
  html += '<div class="agenda-timeline">';
  AGENDA_DATA.forEach(function(city) {
    var events = _agendaFilter === 'all' ? city.events : city.events.filter(function(e){ return e.type === _agendaFilter; });
    if (!events.length) return;

    html += '<div class="agenda-city-block" data-city="' + city.city + '">';
    html += '<div class="agenda-city-header">';
    html += '<div class="agenda-city-info">';
    html += '<span class="agenda-city-name">' + city.city + '</span>';
    html += '<span class="agenda-city-jp">' + city.nameJP + '</span>';
    html += '</div>';
    html += '<span class="agenda-city-dates">📅 ' + city.dates + '</span>';
    html += '</div>';

    html += '<div class="agenda-events">';
    events.forEach(function(ev) {
      html += '<div class="agenda-event">';
      html += '<div class="agenda-event-emoji">' + ev.emoji + '</div>';
      html += '<div class="agenda-event-body">';
      html += '<div class="agenda-event-name">' + ev.name + '</div>';
      html += '<div class="agenda-event-date">📆 ' + ev.date + '</div>';
      html += '<div class="agenda-event-desc">' + ev.desc + '</div>';
      if (ev.tip) html += '<div class="agenda-event-tip">' + ev.tip + '</div>';
      html += '</div>';
      html += '<div class="agenda-event-meta">';
      html += '<span class="agenda-type-badge">' + ev.emoji + ' ' + ev.type + '</span>';
      html += '<span class="agenda-price">' + ev.price + '</span>';
      html += '</div>';
      html += '</div>';
    });
    html += '</div></div>';
  });
  html += '</div>';

  document.getElementById('page-container').innerHTML = html;
}

function setAgendaFilter(type) {
  _agendaFilter = type;
  renderAgenda();
}


// ═══════════════════════════════════════════════════════════════════
// 9. MOODBOARD
// ═══════════════════════════════════════════════════════════════════
var MOODBOARD_DATA = [
  {
    city: 'Tokyo', nameJP: '東京', color: '#2a3a5a',
    images: [
      { url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80', alt: 'Tokyo skyline', caption: 'Skyline depuis Shibuya' },
      { url: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=600&q=80', alt: 'Shibuya crossing', caption: 'Carrefour de Shibuya' },
      { url: 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=600&q=80', alt: 'Senso-ji', caption: 'Temple Senso-ji, Asakusa' },
      { url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&q=80', alt: 'Ramen', caption: 'Ramen dans les ruelles' },
    ]
  },
  {
    city: 'Kanazawa', nameJP: '金沢', color: '#4a3a1a',
    images: [
      { url: 'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=600&q=80', alt: 'Kanazawa', caption: 'Kenroku-en en automne' },
      { url: 'https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?w=600&q=80', alt: 'Geisha district', caption: 'Quartier Higashi Chaya' },
    ]
  },
  {
    city: 'Takayama', nameJP: '高山', color: '#3a2a1a',
    images: [
      { url: 'https://images.unsplash.com/photo-1580533089532-54e9b8f62997?w=600&q=80', alt: 'Takayama', caption: 'Ruelles Sanmachi Suji' },
      { url: 'https://images.unsplash.com/photo-1611464908623-07f19927264e?w=600&q=80', alt: 'Shirakawa-go', caption: 'Shirakawa-go sous la neige' },
    ]
  },
  {
    city: 'Kyoto', nameJP: '京都', color: '#3a1a2a',
    images: [
      { url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80', alt: 'Kyoto temple', caption: 'Fushimi Inari au crépuscule' },
      { url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80', alt: 'Bamboo forest', caption: 'Forêt de bambous, Arashiyama' },
      { url: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600&q=80', alt: 'Geisha Gion', caption: 'Maiko dans Gion, crépuscule' },
      { url: 'https://images.unsplash.com/photo-1570459027562-4a916cc6113f?w=600&q=80', alt: 'Koyo Kyoto', caption: 'Érables rouges de novembre' },
    ]
  },
  {
    city: 'Hiroshima & Miyajima', nameJP: '広島・宮島', color: '#1a3a2a',
    images: [
      { url: 'https://images.unsplash.com/photo-1505069446780-4ef442b5207f?w=600&q=80', alt: 'Miyajima torii', caption: 'Torii flottant, Miyajima' },
      { url: 'https://images.unsplash.com/photo-1599922407858-a3d0e1e6b7de?w=600&q=80', alt: 'Hiroshima peace', caption: 'Dôme de la Bombe A, Hiroshima' },
    ]
  },
  {
    city: 'Osaka', nameJP: '大阪', color: '#3a1a1a',
    images: [
      { url: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=600&q=80', alt: 'Osaka dotonbori', caption: 'Dotonbori la nuit' },
      { url: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=600&q=80', alt: 'Takoyaki', caption: 'Takoyaki fumants' },
    ]
  },
  {
    city: 'Route Nakasendo', nameJP: '中山道', color: '#1a2a1a',
    images: [
      { url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80', alt: 'Magome', caption: 'Ruelles pavées de Magome' },
      { url: 'https://images.unsplash.com/photo-1578469645742-46cae010e5d6?w=600&q=80', alt: 'Nakasendo', caption: 'Sentier forestier Nakasendo' },
    ]
  },
  {
    city: 'Ambiances & Détails', nameJP: '細部', color: '#2a2a3a',
    images: [
      { url: 'https://images.unsplash.com/photo-1612178537253-bccd437b730e?w=600&q=80', alt: 'Japanese food', caption: 'Bento du konbini' },
      { url: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=600&q=80', alt: 'Shrine', caption: 'Offrandes dans un sanctuaire' },
      { url: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=600&q=80', alt: 'Onsen', caption: 'Rotenburo en hiver' },
      { url: 'https://images.unsplash.com/photo-1551641506-ee5bf4cb45f1?w=600&q=80', alt: 'Shinkansen', caption: 'Shinkansen — ponctualité légendaire' },
    ]
  },
];

var _moodFilter = 'all';
var _moodLightbox = null;

function renderMoodboard() {
  var allCities = ['all'].concat(MOODBOARD_DATA.map(function(d){ return d.city; }));

  var html = _newPageHeader('📸', 'Moodboard', 'インスピレーション', 'L\'ambiance du voyage — images et atmosphères');

  // City filter
  html += '<div class="mood-filters">';
  allCities.forEach(function(c) {
    html += '<button class="mood-filter-btn' + (_moodFilter===c?' active':'') + '" onclick="setMoodFilter(\'' + c.replace(/'/g,"\\'") + '\')">' + (c==='all'?'🗾 Tout':c) + '</button>';
  });
  html += '</div>';

  // Masonry grid
  html += '<div class="mood-grid">';
  MOODBOARD_DATA.forEach(function(section) {
    if (_moodFilter !== 'all' && _moodFilter !== section.city) return;

    html += '<div class="mood-section">';
    html += '<div class="mood-section-header" style="border-left:3px solid ' + section.color + '">';
    html += '<span class="mood-section-city">' + section.city + '</span>';
    html += '<span class="mood-section-jp">' + section.nameJP + '</span>';
    html += '</div>';
    html += '<div class="mood-images">';

    section.images.forEach(function(img, idx) {
      var imgId = 'moodimg_' + section.city.replace(/\s/g,'_') + '_' + idx;
      html += '<div class="mood-img-wrap" onclick="openMoodLightbox(\'' + imgId + '\')">';
      html += '<img class="mood-img img-loading" src="' + img.url + '" alt="' + img.alt + '" id="' + imgId + '" loading="lazy" onload="this.classList.remove(\'img-loading\')" data-full="' + img.url.replace('w=600','w=1200') + '" data-caption="' + img.caption + '">';
      html += '<div class="mood-img-caption">' + img.caption + '</div>';
      html += '</div>';
    });

    html += '</div></div>';
  });
  html += '</div>';

  // Lightbox container
  html += '<div id="mood-lightbox" class="mood-lightbox" onclick="closeMoodLightbox()" style="display:none">';
  html += '<button class="mood-lb-close" onclick="closeMoodLightbox()">×</button>';
  html += '<img class="mood-lb-img" id="mood-lb-img" src="" alt="">';
  html += '<div class="mood-lb-caption" id="mood-lb-caption"></div>';
  html += '</div>';

  document.getElementById('page-container').innerHTML = html;
}

function setMoodFilter(city) {
  _moodFilter = city;
  renderMoodboard();
}

function openMoodLightbox(imgId) {
  var img = document.getElementById(imgId);
  if (!img) return;
  var lb = document.getElementById('mood-lightbox');
  var lbImg = document.getElementById('mood-lb-img');
  var lbCap = document.getElementById('mood-lb-caption');
  lbImg.src = img.dataset.full || img.src;
  lbCap.textContent = img.dataset.caption || '';
  lb.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeMoodLightbox() {
  var lb = document.getElementById('mood-lightbox');
  if (lb) lb.style.display = 'none';
  document.body.style.overflow = '';
}

// ═══════════════════════════════════════════════════════════════════
// PHOTOS — Google Drive, par destination
// ═══════════════════════════════════════════════════════════════════

function renderPhotos() {
  var pc = document.getElementById('page-container');
  pc.innerHTML =
    _newPageHeader('🖼️', 'Photos', '写真', 'Nos souvenirs photo par destination') +
    '<div class="photos-toolbar">' +
      '<span class="photos-total" id="photos-total"></span>' +
      '<button class="photos-refresh-btn" onclick="reloadPhotos()">🔄 Actualiser</button>' +
    '</div>' +
    '<div id="photos-content">' +
      '<div class="loading-screen" style="min-height:180px">' +
        '<div class="loading-torii">📷</div>' +
        '<p class="loading-text">Chargement des photos depuis Drive…</p>' +
      '</div>' +
    '</div>';

  _loadPhotosContent(false);
}

function reloadPhotos() {
  try { sessionStorage.removeItem('ldva-photos'); } catch(e) {}
  var content = document.getElementById('photos-content');
  if (content) content.innerHTML =
    '<div class="loading-screen" style="min-height:180px">' +
      '<div class="loading-torii">📷</div>' +
      '<p class="loading-text">Actualisation…</p>' +
    '</div>';
  _loadPhotosContent(true);
}

function _loadPhotosContent(force) {
  DataService.fetchPhotos(force).then(function(data) {
    var content = document.getElementById('photos-content');
    if (!content) return;

    if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
      content.innerHTML =
        '<div class="photos-empty">' +
          '<div class="empty-icon">📂</div>' +
          '<p>Aucune photo trouvée dans le dossier Drive.</p>' +
          '<p class="text-sm" style="opacity:.6">Assurez-vous que les photos sont dans des sous-dossiers (un par lieu).</p>' +
          '<div class="photos-setup-box">' +
            '<strong>Configuration requise dans votre Apps Script :</strong><br>' +
            'Ajoutez la fonction <code>getPhotosList()</code> et gérez <code>action=photos</code> dans <code>doGet</code>.<br>' +
            'Voir les instructions fournies séparément.' +
          '</div>' +
        '</div>';
      return;
    }

    var totalCount = 0;
    var html = '';
    var cities = Object.keys(data);

    cities.forEach(function(city) {
      var files = data[city];
      if (!Array.isArray(files) || !files.length) return;
      totalCount += files.length;

      html += '<div class="photos-section">';
      html += '<div class="photos-section-header">' +
        '<span class="photos-city">' + city + '</span>' +
        '<span class="photos-count">' + files.length + ' photo' + (files.length > 1 ? 's' : '') + '</span>' +
      '</div>';
      html += '<div class="photos-masonry">';
      files.forEach(function(file) {
        var thumb = 'https://drive.google.com/thumbnail?id=' + file.id + '&sz=w600';
        var cityEnc = encodeURIComponent(city);
        var nameEnc = encodeURIComponent(file.name || '');
        html += '<div class="photo-item" onclick="openPhotoLightbox(\'' + file.id + '\',\'' + nameEnc + '\',\'' + cityEnc + '\')">' +
          '<img class="photo-img" src="' + thumb + '" alt="' + city + '" loading="lazy" decoding="async" onload="this.classList.add(\'loaded\')">' +
          '<div class="photo-item-overlay"></div>' +
        '</div>';
      });
      html += '</div></div>';
    });

    content.innerHTML = html;

    var totalEl = document.getElementById('photos-total');
    if (totalEl) totalEl.textContent = totalCount + ' photo' + (totalCount > 1 ? 's' : '') + ' · ' + cities.length + ' lieu' + (cities.length > 1 ? 'x' : '');
  });
}

function openPhotoLightbox(fileId, nameEnc, cityEnc) {
  var old = document.getElementById('photo-lightbox');
  if (old) old.remove();

  var city = decodeURIComponent(cityEnc);
  var name = decodeURIComponent(nameEnc);
  var fullUrl = 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w1600';

  var lb = document.createElement('div');
  lb.id = 'photo-lightbox';
  lb.className = 'photo-lightbox';
  lb.setAttribute('role', 'dialog');
  lb.onclick = function(e) { if (e.target === lb) closePhotoLightbox(); };

  lb.innerHTML =
    '<button class="photo-lb-close" onclick="closePhotoLightbox()" aria-label="Fermer">×</button>' +
    '<div class="photo-lb-content">' +
      '<img class="photo-lb-img" src="' + fullUrl + '" alt="' + name + '">' +
      '<div class="photo-lb-caption">' +
        '<span class="photo-lb-city">' + city + '</span>' +
        (name ? '<span class="photo-lb-name">' + name + '</span>' : '') +
      '</div>' +
    '</div>';

  document.body.appendChild(lb);
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(function() { lb.classList.add('active'); });
}

function closePhotoLightbox() {
  var lb = document.getElementById('photo-lightbox');
  if (!lb) return;
  lb.classList.remove('active');
  setTimeout(function() { if (lb.parentNode) lb.parentNode.removeChild(lb); }, 300);
  document.body.style.overflow = '';
}

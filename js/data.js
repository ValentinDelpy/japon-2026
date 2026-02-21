// =============================================
// DATA SERVICE — Little Domo Very Arigato V4
// =============================================

const SHEET_ID = '1ZOze3lbKEsa-nJpt30hhA8rlrZlkC0y295NkH_GLnJ4';
const PUB_ID = '2PACX-1vR9migMUQys-qd6rcsbQ6ETIO3LRxungbKIvIXEMctSjdPYfNniSNASgbqUhcDQn3NrmhcSEEngM8T2';

const DataService = {
  exchangeRate: null,
  rawData: null,
  lastSync: null,
  linkMap: {},

  // ── Fetch sheet data as JSON via gviz ──
  async fetchSheet(gid) {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${gid}&_=${Date.now()}`;
    const resp = await fetch(url, { cache: 'no-store' });
    const text = await resp.text();
    const jsonStr = text.match(/\{.*\}/s);
    if (!jsonStr) throw new Error('Parse error');
    const json = JSON.parse(jsonStr[0]);
    if (!json.table) throw new Error('No table');
    const cols = json.table.cols.map(c => (c.label || '').trim());
    const rows = (json.table.rows || []).map(row => {
      const obj = {};
      (row.c || []).forEach((cell, i) => {
        if (i >= cols.length) return;
        let val = '';
        if (cell && cell.v !== null && cell.v !== undefined) {
          const dm = String(cell.v).match(/^Date\((\d+),(\d+),(\d+)\)$/);
          if (dm) {
            const d = new Date(+dm[1], +dm[2], +dm[3]);
            val = d.getDate().toString().padStart(2, '0') + '/' +
                  (d.getMonth() + 1).toString().padStart(2, '0') + '/' +
                  d.getFullYear();
          } else {
            val = cell.f != null ? String(cell.f) : String(cell.v);
          }
        }
        obj[cols[i]] = val;
      });
      return obj;
    });
    return { cols, rows };
  },

  // ── Extract hyperlinks from HTML endpoints ──
  // Google Sheets "Insert > Link" only shows in HTML renders, not JSON.
  // We try 3 endpoints in order of reliability:
  async fetchLinks(gid) {
    const endpoints = [
      // 1. pubhtml — most reliable since sheet is published to web
      `https://docs.google.com/spreadsheets/d/e/${PUB_ID}/pubhtml?gid=${gid}&single=true`,
      // 2. gviz HTML export
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:html&gid=${gid}`,
      // 3. full HTML export
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=html&gid=${gid}`
    ];

    for (const url of endpoints) {
      try {
        const label = url.includes('pubhtml') ? 'pubhtml' : url.includes('gviz') ? 'gviz' : 'export';
        console.log(`[Links] Trying ${label}…`);
        const resp = await fetch(url, { cache: 'no-store' });
        if (!resp.ok) { console.warn(`[Links] ${label}: HTTP ${resp.status}`); continue; }
        const html = await resp.text();
        if (html.includes('accounts.google.com') || html.includes('ServiceLogin')) {
          console.warn(`[Links] ${label}: got login redirect`); continue;
        }
        const links = this._parseHtmlLinks(html);
        const count = Object.keys(links).length / 2; // each key stored twice (original + lowercase)
        if (count > 0) {
          console.log(`[Links] ✅ ${count} links via ${label}:`, Object.keys(links).slice(0, 6));
          return links;
        }
        console.log(`[Links] ${label}: 0 links found`);
      } catch (e) { console.warn('[Links] Error:', e.message); }
    }
    console.warn('[Links] ⚠️ No links extracted. Check sheet sharing settings.');
    return {};
  },

  _parseHtmlLinks(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const links = {};
    doc.querySelectorAll('a[href]').forEach(a => {
      const text = (a.textContent || '').trim();
      if (!text) return;
      let href = a.getAttribute('href') || '';
      // Unwrap Google redirect: /url?q=REAL_URL or ?q=REAL_URL
      const m = href.match(/[?&]q=([^&]+)/);
      if (m) try { href = decodeURIComponent(m[1]); } catch (e) {}
      if (!href.startsWith('http')) return;
      links[text] = href;
      links[text.toLowerCase()] = href;
    });
    return links;
  },

  // ── Load everything ──
  async loadAllData() {
    await Promise.allSettled([this.tryFetchSheets(), this.fetchExchangeRate()]);
    if (!this.rawData) { console.warn('Sheet failed, using fallback'); this.useFallbackData(); }
    this.lastSync = new Date();
    return true;
  },

  async tryFetchSheets() {
    for (const gid of ['2038497907', '0']) {
      try {
        const result = await this.fetchSheet(gid);
        if (result && result.rows.length > 0) {
          this.rawData = result;
          console.log('Sheet gid=' + gid + ':', result.rows.length, 'rows, cols:', result.cols.join(', '));
          // Now fetch links (await so they're ready before render)
          try {
            this.linkMap = await this.fetchLinks(gid);
          } catch (e) { console.warn('Link fetch failed:', e.message); }
          return;
        }
      } catch (e) { console.warn('gid=' + gid + ':', e.message); }
    }
  },

  // ── Exchange rate EUR→JPY ──
  async fetchExchangeRate() {
    for (const url of ['https://open.er-api.com/v6/latest/EUR', 'https://api.exchangerate-api.com/v4/latest/EUR']) {
      try {
        const data = await (await fetch(url)).json();
        if (data.rates && data.rates.JPY) { this.exchangeRate = data.rates.JPY; return; }
      } catch (e) {}
    }
    this.exchangeRate = 162.5;
  },

  jpyToEur(amount) {
    if (!this.exchangeRate || !amount) return null;
    return (amount / this.exchangeRate).toFixed(2);
  },

  // ── Smart column finder ──
  _col(...keywords) {
    if (!this.rawData) return null;
    for (const kw of keywords) {
      const found = this.rawData.cols.find(c => c.toLowerCase().includes(kw.toLowerCase()));
      if (found) return found;
    }
    return null;
  },

  // ── Parse date ──
  parseDate(str) {
    if (!str) return null;
    str = String(str).trim();
    let m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
    m = str.match(/^(\d{1,2})\/(\d{1,2})$/);
    if (m) return new Date(2026, +m[2] - 1, +m[1]);
    m = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
    m = str.match(/Date\((\d+),(\d+),(\d+)\)/);
    if (m) return new Date(+m[1], +m[2], +m[3]);
    const MO = { jan: 0, fév: 1, feb: 1, mar: 2, avr: 3, apr: 3, mai: 4, may: 4, juin: 5, jun: 5,
                 juil: 6, jul: 6, août: 7, aug: 7, sep: 8, oct: 9, nov: 10, déc: 11, dec: 11 };
    m = str.match(/(\d{1,2})\s+([a-zéûô]+)\.?\s*(\d{4})?/i);
    if (m) { const mo = MO[m[2].toLowerCase().substring(0, 3)]; if (mo !== undefined) return new Date(m[3] ? +m[3] : 2026, mo, +m[1]); }
    return null;
  },

  // ── Build groups (one per destination stay) ──
  getGroups() {
    if (!this.rawData) return [];
    const C = {
      jour: this._col('Jour', 'Date', 'Day'),
      lieu: this._col('Lieu', 'Ville', 'City'),
      logement: this._col('Logement', 'Hébergement', 'Hotel'),
      altLogement: this._col('Alternative logement', 'Alternative'),
      prix: this._col('Prix'),
      prixPersonne: this._col('Prix / personne', 'Prix/personne'),
      reserve: this._col('Réservé'),
      activites: this._col('Activités', 'Activité'),
      dureeTrajet: this._col('Durée trajet', 'Durée'),
      prixTrajet: this._col('Prix trajet', 'Coût trajet'),
      billetsRes: this._col('Billets réservés', 'Billets'),
      infos: this._col('Infos supplémentaires', 'Infos', 'Notes')
    };

    const annotated = [];
    let currentCity = '';
    for (const row of this.rawData.rows) {
      const jourRaw = C.jour ? (row[C.jour] || '') : '';
      const date = this.parseDate(jourRaw);
      if (!date) continue;
      const lieu = (C.lieu ? row[C.lieu] || '' : '').trim();
      if (lieu) currentCity = lieu;
      annotated.push({
        date, city: currentCity, row,
        logement: C.logement ? row[C.logement] || '' : '',
        altLogement: C.altLogement ? row[C.altLogement] || '' : '',
        prix: C.prix ? row[C.prix] || '' : '',
        prixPersonne: C.prixPersonne ? row[C.prixPersonne] || '' : '',
        reserve: C.reserve ? row[C.reserve] || '' : '',
        activites: C.activites ? row[C.activites] || '' : '',
        dureeTrajet: C.dureeTrajet ? row[C.dureeTrajet] || '' : '',
        prixTrajet: C.prixTrajet ? row[C.prixTrajet] || '' : '',
        billetsRes: C.billetsRes ? row[C.billetsRes] || '' : '',
        infos: C.infos ? row[C.infos] || '' : '',
        hasCity: !!lieu
      });
    }
    if (!annotated.length) return [];

    const groups = [];
    let cur = null;
    for (const a of annotated) {
      if (!cur || (a.hasCity && a.city !== cur.city)) {
        cur = {
          city: a.city, startDate: a.date, endDate: a.date, nights: 0,
          logement: a.logement, altLogement: a.altLogement,
          prix: a.prix, prixPersonne: a.prixPersonne, reserve: a.reserve,
          dureeTrajet: a.dureeTrajet, prixTrajet: a.prixTrajet,
          billetsRes: a.billetsRes, infos: a.infos,
          activites: [], dates: [a.date], rows: [a.row]
        };
        if (a.activites.trim()) cur.activites.push(a.activites.trim());
        groups.push(cur);
      } else {
        cur.endDate = a.date; cur.nights++; cur.dates.push(a.date); cur.rows.push(a.row);
        if (a.activites.trim()) cur.activites.push(a.activites.trim());
        if (!cur.logement && a.logement) cur.logement = a.logement;
        if (!cur.altLogement && a.altLogement) cur.altLogement = a.altLogement;
        if (!cur.prix && a.prix) cur.prix = a.prix;
        if (!cur.prixPersonne && a.prixPersonne) cur.prixPersonne = a.prixPersonne;
        if (!cur.reserve && a.reserve) cur.reserve = a.reserve;
        if (!cur.infos && a.infos) cur.infos = a.infos;
        if (!cur.billetsRes && a.billetsRes) cur.billetsRes = a.billetsRes;
      }
    }
    return groups.filter(g => g.city);
  },

  getSteps() {
    const groups = this.getGroups();
    const seen = {};
    return groups.filter(g => { if (seen[g.city]) return false; seen[g.city] = true; return true; });
  },

  getCols() { return this.rawData ? this.rawData.cols : []; },
  getRows() { return this.rawData ? this.rawData.rows : []; },

  // ── Fallback data ──
  useFallbackData() {
    const cols = ['Jour','Lieu','Logement','Alternative logement','Prix','Prix / personne','Réservé ?','Activités','Durée trajet','Prix trajet / personne','Billets réservés ?','Infos supplémentaires'];
    const rows = [
      {'Jour':'18/11/2026','Lieu':'Aéroport Toulouse','Logement':'','Alternative logement':'','Prix':'','Prix / personne':'','Réservé ?':'','Activités':'','Durée trajet':'','Prix trajet / personne':'','Billets réservés ?':'','Infos supplémentaires':'Départ'},
      {'Jour':'19/11/2026','Lieu':'Tokyo','Logement':'Logement low cost','Alternative logement':'Ca a de la gueule','Prix':'363','Prix / personne':'90.75','Réservé ?':'Non','Activités':'','Durée trajet':'','Prix trajet / personne':'','Billets réservés ?':'','Infos supplémentaires':''},
      {'Jour':'20/11/2026','Lieu':'','Logement':'','Alternative logement':'','Prix':'','Prix / personne':'','Réservé ?':'','Activités':'','Durée trajet':'','Prix trajet / personne':'','Billets réservés ?':'','Infos supplémentaires':''},
      {'Jour':'21/11/2026','Lieu':'','Logement':'','Alternative logement':'','Prix':'','Prix / personne':'','Réservé ?':'','Activités':'Tsukiji, Shibuya crossing, Shinjuku','Durée trajet':'','Prix trajet / personne':'','Billets réservés ?':'','Infos supplémentaires':'3 nuits'},
      {'Jour':'22/11/2026','Lieu':'Kanazawa','Logement':'Moyen cost','Alternative logement':'Marrant','Prix':'250','Prix / personne':'62.50','Réservé ?':'Non','Activités':'Peut-être plutôt deux jours','Durée trajet':'2h30','Prix trajet / personne':'90','Billets réservés ?':'Non','Infos supplémentaires':''},
      {'Jour':'23/11/2026','Lieu':'Takayama','Logement':'C\'est joli','Alternative logement':'Lave-linge + sèche-linge','Prix':'475','Prix / personne':'118.75','Réservé ?':'','Activités':'Shirakawa-go','Durée trajet':'1h15','Prix trajet / personne':'30','Billets réservés ?':'Non','Infos supplémentaires':''},
      {'Jour':'24/11/2026','Lieu':'','Logement':'','Alternative logement':'','Prix':'','Prix / personne':'','Réservé ?':'','Activités':'','Durée trajet':'','Prix trajet / personne':'','Billets réservés ?':'','Infos supplémentaires':''},
      {'Jour':'25/11/2026','Lieu':'Kyoto','Logement':'Lave-linge','Alternative logement':'Sèche-linge','Prix':'250','Prix / personne':'62.50','Réservé ?':'Non','Activités':'Fushimi Inari, Bambouseraie, Gion','Durée trajet':'Train 3h30','Prix trajet / personne':'65','Billets réservés ?':'Non','Infos supplémentaires':''},
      {'Jour':'26/11/2026','Lieu':'','Logement':'','Alternative logement':'','Prix':'','Prix / personne':'','Réservé ?':'','Activités':'','Durée trajet':'','Prix trajet / personne':'','Billets réservés ?':'','Infos supplémentaires':''},
      {'Jour':'27/11/2026','Lieu':'','Logement':'','Alternative logement':'','Prix':'','Prix / personne':'','Réservé ?':'','Activités':'Nara A/R','Durée trajet':'','Prix trajet / personne':'9','Billets réservés ?':'Non','Infos supplémentaires':''},
      {'Jour':'28/11/2026','Lieu':'Hiroshima','Logement':'Prix sympa','Alternative logement':'Trad house','Prix':'137','Prix / personne':'34.25','Réservé ?':'Non','Activités':'Mémorial Paix, Dôme, Miyajima','Durée trajet':'1h45','Prix trajet / personne':'70','Billets réservés ?':'Non','Infos supplémentaires':''},
      {'Jour':'29/11/2026','Lieu':'Osaka','Logement':'Very economic','Alternative logement':'Fancy time (très cool)','Prix':'100','Prix / personne':'25','Réservé ?':'Non','Activités':'Dotonbori, Universal Studio (jour 2)','Durée trajet':'1h30','Prix trajet / personne':'65','Billets réservés ?':'Non','Infos supplémentaires':''},
      {'Jour':'30/11/2026','Lieu':'','Logement':'','Alternative logement':'','Prix':'','Prix / personne':'','Réservé ?':'','Activités':'Universal Studio','Durée trajet':'','Prix trajet / personne':'','Billets réservés ?':'','Infos supplémentaires':''},
      {'Jour':'01/12/2026','Lieu':'','Logement':'','Alternative logement':'','Prix':'','Prix / personne':'','Réservé ?':'','Activités':'','Durée trajet':'','Prix trajet / personne':'','Billets réservés ?':'','Infos supplémentaires':''},
      {'Jour':'02/12/2026','Lieu':'Magome','Logement':'Ryokan O','Alternative logement':'','Prix':'140','Prix / personne':'35','Réservé ?':'Non','Activités':'Nakasendo','Durée trajet':'3h30-4h','Prix trajet / personne':'50','Billets réservés ?':'Non','Infos supplémentaires':''},
      {'Jour':'03/12/2026','Lieu':'Tokyo','Logement':'Correct','Alternative logement':'','Prix':'371','Prix / personne':'92.75','Réservé ?':'Non','Activités':'Shopping, dernière soirée','Durée trajet':'3h','Prix trajet / personne':'80','Billets réservés ?':'Non','Infos supplémentaires':''},
      {'Jour':'04/12/2026','Lieu':'','Logement':'','Alternative logement':'','Prix':'','Prix / personne':'','Réservé ?':'','Activités':'','Durée trajet':'','Prix trajet / personne':'','Billets réservés ?':'','Infos supplémentaires':''},
      {'Jour':'05/12/2026','Lieu':'Aéroport de Tokyo','Logement':'','Alternative logement':'','Prix':'','Prix / personne':'','Réservé ?':'','Activités':'','Durée trajet':'13h vol','Prix trajet / personne':'','Billets réservés ?':'Oui','Infos supplémentaires':'Retour'}
    ];
    this.rawData = { cols, rows };
    this.exchangeRate = this.exchangeRate || 162.5;
  }
};

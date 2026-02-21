// =============================================
// DATA SERVICE — Little Domo Very Arigato
// =============================================

const SHEET_ID = '1ZOze3lbKEsa-nJpt30hhA8rlrZlkC0y295NkH_GLnJ4';

const DataService = {
  exchangeRate: null,
  rawData: null,
  lastSync: null,
  linkMap: {},   // "cellValue" → href

  // ── Fetch sheet JSON ──
  async fetchSheet(gid) {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${gid}`;
    const resp = await fetch(url);
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
          const dateMatch = String(cell.v).match(/^Date\((\d+),(\d+),(\d+)\)$/);
          if (dateMatch) {
            const d = new Date(+dateMatch[1], +dateMatch[2], +dateMatch[3]);
            val = d.getDate().toString().padStart(2,'0') + '/' +
                  (d.getMonth()+1).toString().padStart(2,'0') + '/' +
                  d.getFullYear();
          } else {
            val = cell.f !== null && cell.f !== undefined ? String(cell.f) : String(cell.v);
          }
        }
        obj[cols[i]] = val;
      });
      return obj;
    });
    return { cols, rows };
  },

  // ── Fetch HTML export to extract hyperlinks (value-keyed) ──
  async fetchSheetHtmlLinks(gid) {
    try {
      const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:html&gid=${gid}`;
      const resp = await fetch(url);
      const html = await resp.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const links = {};
      doc.querySelectorAll('a[href]').forEach(function(a) {
        const text = a.textContent.trim();
        let href = a.getAttribute('href') || '';
        const gMatch = href.match(/[?&]q=([^&]+)/);
        if (gMatch) { try { href = decodeURIComponent(gMatch[1]); } catch(e) {} }
        if (text && href && !href.startsWith('#')) {
          links[text] = href;
        }
      });
      return links;
    } catch(e) {
      console.warn('HTML links fetch failed:', e.message);
      return {};
    }
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
          console.log('Loaded sheet gid=' + gid, result.rows.length, 'rows, cols:', result.cols.join(', '));
          // Async hyperlink fetch
          this.fetchSheetHtmlLinks(gid).then(lm => {
            this.linkMap = lm;
            console.log('Links loaded:', Object.keys(lm).length, 'entries');
          });
          return;
        }
      } catch(e) { console.warn('gid=' + gid + ' failed:', e.message); }
    }
  },

  // ── Exchange rate EUR→JPY ──
  async fetchExchangeRate() {
    const apis = [
      'https://open.er-api.com/v6/latest/EUR',
      'https://api.exchangerate-api.com/v4/latest/EUR'
    ];
    for (const url of apis) {
      try {
        const data = await (await fetch(url)).json();
        if (data.rates && data.rates.JPY) { this.exchangeRate = data.rates.JPY; return; }
      } catch(e) {}
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

  // ── Parse a date string to Date object ──
  parseDate(str) {
    if (!str) return null;
    str = String(str).trim();
    // DD/MM/YYYY or DD/MM/YY
    let m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) return new Date(+m[3], +m[2]-1, +m[1]);
    // DD/MM (no year)
    m = str.match(/^(\d{1,2})\/(\d{1,2})$/);
    if (m) return new Date(2026, +m[2]-1, +m[1]);
    // YYYY-MM-DD
    m = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return new Date(+m[1], +m[2]-1, +m[3]);
    // Date(Y,M,D)
    m = str.match(/Date\((\d+),(\d+),(\d+)\)/);
    if (m) return new Date(+m[1], +m[2], +m[3]);
    // French: "18 nov. 2026" or "18 nov 2026"
    const MONTHS = {jan:0,fév:1,feb:1,mar:2,avr:3,apr:3,mai:4,may:4,juin:5,jun:5,
                    juil:6,jul:6,août:7,aug:7,sep:8,oct:9,nov:10,déc:11,dec:11};
    m = str.match(/(\d{1,2})\s+([a-zéûô]+)\.?\s*(\d{4})?/i);
    if (m) {
      const mo = MONTHS[m[2].toLowerCase().substring(0,3)];
      if (mo !== undefined) return new Date(m[3] ? +m[3] : 2026, mo, +m[1]);
    }
    return null;
  },

  // ── Build structured groups (one per destination stay) ──
  getGroups() {
    if (!this.rawData) return [];
    const C = {
      jour:         this._col('Jour','Date','Day'),
      lieu:         this._col('Lieu','Ville','City','Destination'),
      logement:     this._col('Logement','Hébergement','Hotel'),
      altLogement:  this._col('Alternative logement','Alternative'),
      prix:         this._col('Prix'),
      prixPersonne: this._col('Prix / personne','Prix/personne'),
      reserve:      this._col('Réservé'),
      activites:    this._col('Activités','Activité','Activity'),
      dureeTrajet:  this._col('Durée trajet','Durée','Transport'),
      prixTrajet:   this._col('Prix trajet','Coût trajet'),
      billetsRes:   this._col('Billets réservés','Billets'),
      infos:        this._col('Infos supplémentaires','Infos','Notes')
    };

    // Step 1: annotate each row with parsed date + inherited city
    const annotated = [];
    let currentCity = '';
    for (const row of this.rawData.rows) {
      const jourRaw = C.jour ? (row[C.jour] || '') : '';
      const date = this.parseDate(jourRaw);
      if (!date) continue; // skip non-date rows (totals etc.)
      const lieu = (C.lieu ? row[C.lieu] || '' : '').trim();
      if (lieu) currentCity = lieu;
      annotated.push({
        date,
        city: currentCity,
        row,
        logement:     C.logement    ? row[C.logement]    || '' : '',
        altLogement:  C.altLogement ? row[C.altLogement] || '' : '',
        prix:         C.prix        ? row[C.prix]        || '' : '',
        prixPersonne: C.prixPersonne? row[C.prixPersonne]|| '' : '',
        reserve:      C.reserve     ? row[C.reserve]     || '' : '',
        activites:    C.activites   ? row[C.activites]   || '' : '',
        dureeTrajet:  C.dureeTrajet ? row[C.dureeTrajet] || '' : '',
        prixTrajet:   C.prixTrajet  ? row[C.prixTrajet]  || '' : '',
        billetsRes:   C.billetsRes  ? row[C.billetsRes]  || '' : '',
        infos:        C.infos       ? row[C.infos]       || '' : '',
        hasCity: !!lieu
      });
    }

    if (annotated.length === 0) return [];

    // Step 2: group consecutive rows with same city
    const groups = [];
    let cur = null;
    for (const a of annotated) {
      if (!cur || (a.hasCity && a.city !== cur.city)) {
        // Start new group
        cur = {
          city:       a.city,
          startDate:  a.date,
          endDate:    a.date,
          nights:     0,
          logement:   a.logement,
          altLogement:a.altLogement,
          prix:       a.prix,
          prixPersonne: a.prixPersonne,
          reserve:    a.reserve,
          dureeTrajet:a.dureeTrajet,
          prixTrajet: a.prixTrajet,
          billetsRes: a.billetsRes,
          infos:      a.infos,
          activites:  [],
          dates:      [a.date],
          rows:       [a.row]
        };
        if (a.activites.trim()) cur.activites.push(a.activites.trim());
        groups.push(cur);
      } else {
        // Continue current group
        cur.endDate = a.date;
        cur.nights++;
        cur.dates.push(a.date);
        cur.rows.push(a.row);
        if (a.activites.trim()) cur.activites.push(a.activites.trim());
        // Fill in logement/prix if current group is missing them
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

  // Legacy getSteps (kept for dashboard/print)
  getSteps() {
    const groups = this.getGroups();
    const steps = [];
    groups.forEach(g => {
      g.dates.forEach((d, i) => {
        steps.push({
          index: steps.length + 1,
          jour: g.dates[0].getDate().toString().padStart(2,'0') + '/' + (g.dates[0].getMonth()+1).toString().padStart(2,'0'),
          lieu: g.city,
          logement: g.logement,
          altLogement: g.altLogement,
          prix: g.prix,
          prixPersonne: g.prixPersonne,
          reserve: g.reserve,
          activites: g.activites.join(', '),
          dureeTrajet: g.dureeTrajet,
          prixTrajet: g.prixTrajet,
          billetsRes: g.billetsRes,
          infos: g.infos,
          raw: g.rows[0]
        });
      });
    });
    // Deduplicate by city
    const seen = {};
    return steps.filter(s => { if (seen[s.lieu]) return false; seen[s.lieu] = true; return true; });
  },

  getCols() { return this.rawData ? this.rawData.cols : []; },
  getRows() { return this.rawData ? this.rawData.rows : []; },

  // ── Fallback data matching real sheet structure ──
  useFallbackData() {
    const cols = ['Jour','Lieu','Logement','Alternative logement','Prix','Prix / personne','Réservé ?','Activités','Durée trajet','Prix trajet / personne','Billets réservés ?','Infos supplémentaires'];
    const rows = [
      {'Jour':'18/11/2026','Lieu':'Aéroport Toulouse - Blagnac','Logement':'Pas de logement','Alternative logement':'','Prix':'','Prix / personne':'','Réservé ?':'','Activités':'','Durée trajet':'','Prix trajet / personne':'','Billets réservés ?':'','Infos supplémentaires':'Départ'},
      {'Jour':'19/11/2026','Lieu':'Tokyo','Logement':'Logement low cost','Alternative logement':'Ca a de la gueule','Prix':'363','Prix / personne':'90.75','Réservé ?':'Non','Activités':'','Durée trajet':'','Prix trajet / personne':'','Billets réservés ?':'','Infos supplémentaires':''},
      {'Jour':'20/11/2026','Lieu':'','Logement':'','Alternative logement':'','Prix':'','Prix / personne':'','Réservé ?':'','Activités':'','Durée trajet':'','Prix trajet / personne':'','Billets réservés ?':'','Infos supplémentaires':''},
      {'Jour':'21/11/2026','Lieu':'','Logement':'','Alternative logement':'','Prix':'','Prix / personne':'','Réservé ?':'','Activités':'Tsukiji, Shibuya crossing, Shinjuku','Durée trajet':'','Prix trajet / personne':'','Billets réservés ?':'','Infos supplémentaires':'3 nuits · Premier contact avec Tokyo'},
      {'Jour':'22/11/2026','Lieu':'Kanazawa','Logement':'Moyen cost - à voir pour moins cher','Alternative logement':'Marrant','Prix':'250','Prix / personne':'62.50','Réservé ?':'Non','Activités':'Peut-être plutôt deux jours','Durée trajet':'2h30','Prix trajet / personne':'90','Billets réservés ?':'Non','Infos supplémentaires':''},
      {'Jour':'23/11/2026','Lieu':'Takayama','Logement':'C\'est joli','Alternative logement':'Lave-linge + sèche-linge','Prix':'475','Prix / personne':'118.75','Réservé ?':'','Activités':'Shirakawa-go / Recommandation kiné','Durée trajet':'1h15','Prix trajet / personne':'30','Billets réservés ?':'Non','Infos supplémentaires':''},
      {'Jour':'24/11/2026','Lieu':'','Logement':'','Alternative logement':'','Prix':'','Prix / personne':'','Réservé ?':'','Activités':'','Durée trajet':'','Prix trajet / personne':'','Billets réservés ?':'','Infos supplémentaires':''},
      {'Jour':'25/11/2026','Lieu':'Kyoto','Logement':'Lave-linge','Alternative logement':'Sèche-linge','Prix':'250','Prix / personne':'62.50','Réservé ?':'Non','Activités':'Fushimi Inari, Bambouseraie, Gion','Durée trajet':'Train 3h30','Prix trajet / personne':'65','Billets réservés ?':'Non','Infos supplémentaires':''},
      {'Jour':'26/11/2026','Lieu':'','Logement':'','Alternative logement':'','Prix':'','Prix / personne':'','Réservé ?':'','Activités':'','Durée trajet':'','Prix trajet / personne':'','Billets réservés ?':'','Infos supplémentaires':''},
      {'Jour':'27/11/2026','Lieu':'','Logement':'','Alternative logement':'','Prix':'','Prix / personne':'','Réservé ?':'','Activités':'Nara A/R','Durée trajet':'','Prix trajet / personne':'9','Billets réservés ?':'Non','Infos supplémentaires':''},
      {'Jour':'28/11/2026','Lieu':'Hiroshima','Logement':'Prix sympa','Alternative logement':'Trad house','Prix':'137','Prix / personne':'34.25','Réservé ?':'Non','Activités':'Mémorial Paix, Dôme, Miyajima','Durée trajet':'1h45','Prix trajet / personne':'70','Billets réservés ?':'Non','Infos supplémentaires':''},
      {'Jour':'29/11/2026','Lieu':'Osaka','Logement':'Very economic','Alternative logement':'Fancy time (très cool)','Prix':'100','Prix / personne':'25','Réservé ?':'Non','Activités':'Dotonbori, Universal Studio (jour 2)','Durée trajet':'1h30','Prix trajet / personne':'65','Billets réservés ?':'Non','Infos supplémentaires':''},
      {'Jour':'30/11/2026','Lieu':'','Logement':'','Alternative logement':'','Prix':'','Prix / personne':'','Réservé ?':'','Activités':'Universal Studio','Durée trajet':'','Prix trajet / personne':'','Billets réservés ?':'','Infos supplémentaires':''},
      {'Jour':'01/12/2026','Lieu':'','Logement':'','Alternative logement':'','Prix':'','Prix / personne':'','Réservé ?':'','Activités':'','Durée trajet':'','Prix trajet / personne':'','Billets réservés ?':'','Infos supplémentaires':''},
      {'Jour':'02/12/2026','Lieu':'Magome','Logement':'Ryokan O','Alternative logement':'','Prix':'140','Prix / personne':'35','Réservé ?':'Non','Activités':'A réfléchir - peut-être Shibu Onsen','Durée trajet':'3h30-4h','Prix trajet / personne':'50','Billets réservés ?':'Non','Infos supplémentaires':''},
      {'Jour':'03/12/2026','Lieu':'Tokyo','Logement':'Correct','Alternative logement':'','Prix':'371','Prix / personne':'92.75','Réservé ?':'Non','Activités':'Shopping, dernière soirée','Durée trajet':'3h','Prix trajet / personne':'80','Billets réservés ?':'Non','Infos supplémentaires':''},
      {'Jour':'04/12/2026','Lieu':'','Logement':'','Alternative logement':'','Prix':'','Prix / personne':'','Réservé ?':'','Activités':'','Durée trajet':'','Prix trajet / personne':'','Billets réservés ?':'','Infos supplémentaires':''},
      {'Jour':'05/12/2026','Lieu':'Aéroport de Tokyo','Logement':'Pas de logement','Alternative logement':'','Prix':'','Prix / personne':'','Réservé ?':'','Activités':'','Durée trajet':'13h vol','Prix trajet / personne':'','Billets réservés ?':'Oui','Infos supplémentaires':'Retour'}
    ];
    this.rawData = { cols, rows };
    this.exchangeRate = this.exchangeRate || 162.5;
  }
};

// =============================================
// DATA SERVICE
// Fetches data from Google Sheets + Exchange rates
// Columns: Jour, Lieu, Logement, Alternative logement, Prix,
//   Prix / personne, Réservé ?, Activités, Durée trajet,
//   Prix trajet / personne, Billets réservés ?, Infos supplémentaires
// =============================================

const SHEET_ID = '1ZOze3lbKEsa-nJpt30hhA8rlrZlkC0y295NkH_GLnJ4';

const DataService = {
  exchangeRate: null,
  rawData: null,
  lastSync: null,

  // Fetch sheet via gviz
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
        if (i < cols.length) {
          let val = cell ? (cell.f || cell.v) : '';
          if (val === null || val === undefined) val = '';
          obj[cols[i]] = String(val);
        }
      });
      return obj;
    });
    return { cols, rows };
  },

  // Load everything
  async loadAllData() {
    const [sheetResult, _] = await Promise.allSettled([
      this.tryFetchSheets(),
      this.fetchExchangeRate()
    ]);
    if (!this.rawData) {
      console.warn('Sheet fetch failed, using fallback');
      this.useFallbackData();
    }
    this.lastSync = new Date();
    return true;
  },

  async tryFetchSheets() {
    const gidsToTry = ['2038497907', '0'];
    for (const gid of gidsToTry) {
      try {
        const result = await this.fetchSheet(gid);
        if (result && result.rows.length > 0) {
          this.rawData = result;
          console.log('Loaded sheet gid=' + gid + ':', result.rows.length, 'rows, cols:', result.cols);
          return;
        }
      } catch (e) {
        console.warn('Sheet gid=' + gid + ' failed:', e.message);
      }
    }
  },

  // Exchange Rate
  async fetchExchangeRate() {
    try {
      const resp = await fetch('https://open.er-api.com/v6/latest/EUR');
      const data = await resp.json();
      if (data.rates && data.rates.JPY) { this.exchangeRate = data.rates.JPY; return; }
    } catch (e) {}
    try {
      const resp = await fetch('https://api.exchangerate-api.com/v4/latest/EUR');
      const data = await resp.json();
      if (data.rates && data.rates.JPY) { this.exchangeRate = data.rates.JPY; return; }
    } catch (e) {}
    this.exchangeRate = 162.5;
  },

  jpyToEur(amountJPY) {
    if (!this.exchangeRate || !amountJPY) return null;
    return (amountJPY / this.exchangeRate).toFixed(2);
  },

  // Smart column finder
  _findCol() {
    if (!this.rawData) return null;
    const keywords = Array.from(arguments);
    for (const kw of keywords) {
      const found = this.rawData.cols.find(function(c) {
        return c.toLowerCase().includes(kw.toLowerCase());
      });
      if (found) return found;
    }
    return null;
  },

  // Get structured steps
  getSteps() {
    if (!this.rawData) return [];

    const COL = {
      jour:         this._findCol('Jour', 'Date', 'Day'),
      lieu:         this._findCol('Lieu', 'Ville', 'City', 'Destination'),
      logement:     this._findCol('Logement', 'Hébergement', 'Hotel'),
      altLogement:  this._findCol('Alternative logement', 'Alternative'),
      prix:         this._findCol('Prix'),
      prixPersonne: this._findCol('Prix / personne', 'Prix/personne'),
      reserve:      this._findCol('Réservé'),
      activites:    this._findCol('Activités', 'Activité', 'Activity'),
      dureeTrajet:  this._findCol('Durée trajet', 'Durée', 'Transport'),
      prixTrajet:   this._findCol('Prix trajet', 'Coût trajet'),
      billetsRes:   this._findCol('Billets réservés', 'Billets'),
      infos:        this._findCol('Infos supplémentaires', 'Infos', 'Notes')
    };

    return this.rawData.rows
      .filter(function(r) {
        var lieu = COL.lieu ? r[COL.lieu] : '';
        var jour = COL.jour ? r[COL.jour] : '';
        return (lieu && lieu.trim()) || (jour && jour.trim());
      })
      .map(function(row, idx) {
        return {
          index: idx + 1,
          jour:         COL.jour ? row[COL.jour] || '' : '',
          lieu:         COL.lieu ? row[COL.lieu] || '' : '',
          logement:     COL.logement ? row[COL.logement] || '' : '',
          altLogement:  COL.altLogement ? row[COL.altLogement] || '' : '',
          prix:         COL.prix ? row[COL.prix] || '' : '',
          prixPersonne: COL.prixPersonne ? row[COL.prixPersonne] || '' : '',
          reserve:      COL.reserve ? row[COL.reserve] || '' : '',
          activites:    COL.activites ? row[COL.activites] || '' : '',
          dureeTrajet:  COL.dureeTrajet ? row[COL.dureeTrajet] || '' : '',
          prixTrajet:   COL.prixTrajet ? row[COL.prixTrajet] || '' : '',
          billetsRes:   COL.billetsRes ? row[COL.billetsRes] || '' : '',
          infos:        COL.infos ? row[COL.infos] || '' : '',
          raw: row
        };
      });
  },

  getCols() { return this.rawData ? this.rawData.cols : []; },
  getRows() { return this.rawData ? this.rawData.rows : []; },

  // Fallback
  useFallbackData() {
    var cols = ['Jour', 'Lieu', 'Logement', 'Alternative logement', 'Prix', 'Prix / personne', 'Réservé ?', 'Activités', 'Durée trajet', 'Prix trajet / personne', 'Billets réservés ?', 'Infos supplémentaires'];
    var rows = [
      { 'Jour': 'J1 - 15/03', 'Lieu': 'Tokyo', 'Logement': 'Hotel Shinjuku Granbell', 'Alternative logement': '', 'Prix': '15000', 'Prix / personne': '7500', 'Réservé ?': 'Oui', 'Activités': 'Arrivée Narita, Shinjuku, Golden Gai', 'Durée trajet': '', 'Prix trajet / personne': '', 'Billets réservés ?': '', 'Infos supplémentaires': 'Décalage horaire' },
      { 'Jour': 'J2 - 16/03', 'Lieu': 'Tokyo', 'Logement': 'Hotel Shinjuku Granbell', 'Alternative logement': '', 'Prix': '15000', 'Prix / personne': '7500', 'Réservé ?': 'Oui', 'Activités': 'Asakusa, Senso-ji, Akihabara, Shibuya', 'Durée trajet': '', 'Prix trajet / personne': '', 'Billets réservés ?': '', 'Infos supplémentaires': '' },
      { 'Jour': 'J3 - 17/03', 'Lieu': 'Tokyo', 'Logement': 'Hotel Shinjuku Granbell', 'Alternative logement': '', 'Prix': '15000', 'Prix / personne': '7500', 'Réservé ?': 'Oui', 'Activités': 'Tsukiji, Harajuku, Meiji-jingu, Roppongi', 'Durée trajet': '', 'Prix trajet / personne': '', 'Billets réservés ?': '', 'Infos supplémentaires': '' },
      { 'Jour': 'J4 - 18/03', 'Lieu': 'Hakone', 'Logement': 'Ryokan avec onsen', 'Alternative logement': '', 'Prix': '35000', 'Prix / personne': '17500', 'Réservé ?': 'Non', 'Activités': 'Lac Ashi, Owakudani, Open-Air Museum', 'Durée trajet': '1h30', 'Prix trajet / personne': '2500', 'Billets réservés ?': 'Non', 'Infos supplémentaires': 'Hakone Free Pass' },
      { 'Jour': 'J5 - 19/03', 'Lieu': 'Kyoto', 'Logement': 'Machiya traditionnelle', 'Alternative logement': 'Piece Hostel', 'Prix': '18000', 'Prix / personne': '9000', 'Réservé ?': 'Oui', 'Activités': 'Fushimi Inari, Gion, Nishiki Market', 'Durée trajet': '2h', 'Prix trajet / personne': '4500', 'Billets réservés ?': 'JR Pass', 'Infos supplémentaires': '' },
      { 'Jour': 'J6 - 20/03', 'Lieu': 'Kyoto', 'Logement': 'Machiya traditionnelle', 'Alternative logement': '', 'Prix': '18000', 'Prix / personne': '9000', 'Réservé ?': 'Oui', 'Activités': 'Arashiyama, bambouseraie, Kinkaku-ji', 'Durée trajet': '', 'Prix trajet / personne': '', 'Billets réservés ?': '', 'Infos supplémentaires': '' },
      { 'Jour': 'J7 - 21/03', 'Lieu': 'Nara', 'Logement': 'Day trip depuis Kyoto', 'Alternative logement': '', 'Prix': '', 'Prix / personne': '', 'Réservé ?': '', 'Activités': 'Todai-ji, cerfs, Kasuga Taisha', 'Durée trajet': '45min', 'Prix trajet / personne': '720', 'Billets réservés ?': 'JR Pass', 'Infos supplémentaires': 'Excursion journée' },
      { 'Jour': 'J8 - 22/03', 'Lieu': 'Osaka', 'Logement': 'Airbnb Namba', 'Alternative logement': 'Cross Hotel Osaka', 'Prix': '12000', 'Prix / personne': '6000', 'Réservé ?': 'Oui', 'Activités': 'Dotonbori, street food, Shinsekai', 'Durée trajet': '15min', 'Prix trajet / personne': '570', 'Billets réservés ?': '', 'Infos supplémentaires': '' },
      { 'Jour': 'J9 - 23/03', 'Lieu': 'Osaka', 'Logement': 'Airbnb Namba', 'Alternative logement': '', 'Prix': '12000', 'Prix / personne': '6000', 'Réservé ?': 'Oui', 'Activités': 'Château Osaka, Kuromon, Umeda Sky', 'Durée trajet': '', 'Prix trajet / personne': '', 'Billets réservés ?': '', 'Infos supplémentaires': '' },
      { 'Jour': 'J10 - 24/03', 'Lieu': 'Hiroshima', 'Logement': 'Hotel Granvia', 'Alternative logement': '', 'Prix': '14000', 'Prix / personne': '7000', 'Réservé ?': 'Non', 'Activités': 'Mémorial Paix, Dôme', 'Durée trajet': '1h30', 'Prix trajet / personne': '5500', 'Billets réservés ?': 'JR Pass', 'Infos supplémentaires': '' },
      { 'Jour': 'J11 - 25/03', 'Lieu': 'Miyajima', 'Logement': 'Day trip Hiroshima', 'Alternative logement': '', 'Prix': '', 'Prix / personne': '', 'Réservé ?': '', 'Activités': 'Torii flottant, Mont Misen', 'Durée trajet': '1h ferry', 'Prix trajet / personne': '360', 'Billets réservés ?': 'JR Pass', 'Infos supplémentaires': 'Vérifier marées' },
      { 'Jour': 'J12 - 26/03', 'Lieu': 'Kanazawa', 'Logement': 'Hotel Nikko', 'Alternative logement': '', 'Prix': '16000', 'Prix / personne': '8000', 'Réservé ?': 'Non', 'Activités': 'Kenroku-en, quartier samouraï', 'Durée trajet': '3h', 'Prix trajet / personne': '7500', 'Billets réservés ?': 'JR Pass', 'Infos supplémentaires': '' },
      { 'Jour': 'J13 - 27/03', 'Lieu': 'Takayama', 'Logement': 'Minshuku', 'Alternative logement': '', 'Prix': '14000', 'Prix / personne': '7000', 'Réservé ?': 'Non', 'Activités': 'Sanmachi Suji, boeuf Hida', 'Durée trajet': '2h', 'Prix trajet / personne': '3500', 'Billets réservés ?': '', 'Infos supplémentaires': 'Option Shirakawa-go' },
      { 'Jour': 'J14 - 28/03', 'Lieu': 'Tokyo', 'Logement': 'Hotel Shibuya', 'Alternative logement': '', 'Prix': '18000', 'Prix / personne': '9000', 'Réservé ?': 'Non', 'Activités': 'Shopping, dernière soirée', 'Durée trajet': '3h30', 'Prix trajet / personne': '8500', 'Billets réservés ?': 'JR Pass', 'Infos supplémentaires': '' },
      { 'Jour': 'J15 - 29/03', 'Lieu': 'Tokyo → Paris', 'Logement': '—', 'Alternative logement': '', 'Prix': '', 'Prix / personne': '', 'Réservé ?': '', 'Activités': 'Vol retour', 'Durée trajet': '13h vol', 'Prix trajet / personne': '', 'Billets réservés ?': 'Oui', 'Infos supplémentaires': '' }
    ];
    this.rawData = { cols: cols, rows: rows };
    this.exchangeRate = this.exchangeRate || 162.5;
  }
};

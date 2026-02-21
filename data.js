// =============================================
// DATA SERVICE
// Fetches data from Google Sheets + Exchange rates
// =============================================

const SHEET_ID = '1ZOze3lbKEsa-nJpt30hhA8rlrZlkC0y295NkH_GLnJ4';
const MAIN_GID = '2038497907';

// GIDs to try for itinerary sheet — we'll discover them
let ALL_SHEETS = {};

const DataService = {
  exchangeRate: null,
  mainData: null,
  itineraryData: null,
  allSheetsRaw: {},
  lastSync: null,

  // ─── Fetch a single sheet via gviz ───
  async fetchSheet(gid) {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${gid}`;
    try {
      const resp = await fetch(url);
      const text = await resp.text();
      // Response is like: /*O_o*/ google.visualization.Query.setResponse({...});
      const jsonStr = text.match(/\{.*\}/s);
      if (!jsonStr) throw new Error('Could not parse gviz response');
      const json = JSON.parse(jsonStr[0]);
      return this.parseGvizData(json);
    } catch (err) {
      console.warn(`Failed to fetch sheet gid=${gid}:`, err);
      return null;
    }
  },

  // Parse Google Visualization JSON to rows
  parseGvizData(json) {
    if (!json.table) return null;
    const cols = json.table.cols.map(c => c.label || '');
    const rows = (json.table.rows || []).map(row => {
      const obj = {};
      (row.c || []).forEach((cell, i) => {
        if (i < cols.length) {
          let val = cell ? (cell.f || cell.v) : '';
          if (val === null || val === undefined) val = '';
          obj[cols[i]] = val;
        }
      });
      return obj;
    });
    return { cols, rows };
  },

  // ─── Discover all sheets ───
  async discoverSheets() {
    // Try the main GID first
    const mainResult = await this.fetchSheet(MAIN_GID);
    if (mainResult) {
      this.allSheetsRaw[MAIN_GID] = mainResult;
    }

    // Try common GIDs: 0 (first sheet), and a few others
    const commonGids = ['0', '1', '2038497907'];
    for (const gid of commonGids) {
      if (!this.allSheetsRaw[gid]) {
        const result = await this.fetchSheet(gid);
        if (result && result.rows.length > 0) {
          this.allSheetsRaw[gid] = result;
        }
      }
    }
  },

  // ─── Main data loading ───
  async loadAllData() {
    try {
      await Promise.all([
        this.discoverSheets(),
        this.fetchExchangeRate()
      ]);

      // Determine which sheet is the "main" data and which is "itinéraire"
      this.categorizeSheets();
      this.lastSync = new Date();
      return true;
    } catch (err) {
      console.error('Data loading error:', err);
      // Use fallback data
      this.useFallbackData();
      return false;
    }
  },

  categorizeSheets() {
    // We look at column names to identify sheets
    for (const [gid, sheet] of Object.entries(this.allSheetsRaw)) {
      const colsLower = sheet.cols.map(c => c.toLowerCase());
      const colsJoined = colsLower.join(' ');

      // Detect itinerary-like sheet
      if (colsJoined.includes('itinérai') || colsJoined.includes('itinerai') ||
          colsJoined.includes('jour') || colsJoined.includes('étape') ||
          colsJoined.includes('date') || colsJoined.includes('transport') ||
          colsJoined.includes('lieu') || colsJoined.includes('destination')) {
        // Could be itinerary
        if (!this.mainData || gid === MAIN_GID) {
          this.mainData = sheet;
        }
      }
      // If it has budget/cost columns
      if (colsJoined.includes('budget') || colsJoined.includes('coût') ||
          colsJoined.includes('cout') || colsJoined.includes('prix') ||
          colsJoined.includes('dépens')) {
        this.itineraryData = this.itineraryData || sheet;
      }
    }

    // Fallback: use whatever we got
    if (!this.mainData) {
      const keys = Object.keys(this.allSheetsRaw);
      if (keys.length > 0) {
        this.mainData = this.allSheetsRaw[keys[0]];
      }
      if (keys.length > 1) {
        this.itineraryData = this.allSheetsRaw[keys[1]];
      }
    }
    if (!this.itineraryData) {
      this.itineraryData = this.mainData;
    }
  },

  // ─── Exchange Rate ───
  async fetchExchangeRate() {
    try {
      // Try multiple APIs
      const apis = [
        'https://open.er-api.com/v6/latest/EUR',
        'https://api.exchangerate-api.com/v4/latest/EUR'
      ];
      for (const url of apis) {
        try {
          const resp = await fetch(url);
          const data = await resp.json();
          if (data.rates && data.rates.JPY) {
            this.exchangeRate = data.rates.JPY;
            return;
          }
        } catch(e) { continue; }
      }
      // Fallback
      this.exchangeRate = 162.5;
    } catch(err) {
      this.exchangeRate = 162.5;
    }
  },

  // ─── Convert JPY to EUR ───
  jpyToEur(amountJPY) {
    if (!this.exchangeRate || !amountJPY) return null;
    return (amountJPY / this.exchangeRate).toFixed(2);
  },

  eurToJpy(amountEUR) {
    if (!this.exchangeRate || !amountEUR) return null;
    return Math.round(amountEUR * this.exchangeRate);
  },

  // ─── Extract structured steps from main data ───
  getSteps() {
    if (!this.mainData) return [];
    const rows = this.mainData.rows;
    const cols = this.mainData.cols;

    // Try to find key columns by name
    const findCol = (...names) => {
      for (const name of names) {
        const idx = cols.findIndex(c =>
          c.toLowerCase().includes(name.toLowerCase())
        );
        if (idx >= 0) return cols[idx];
      }
      return null;
    };

    const dateCol = findCol('date', 'jour', 'day');
    const dateFinCol = findCol('date fin', 'date_fin', 'end', 'fin', 'départ', 'depart');
    const lieuCol = findCol('lieu', 'ville', 'city', 'destination', 'étape', 'etape', 'location', 'place');
    const transportCol = findCol('transport', 'déplacement', 'deplacement', 'moyen');
    const hebergCol = findCol('hébergement', 'hebergement', 'hotel', 'logement', 'accommodation', 'hôtel');
    const budgetCol = findCol('budget', 'coût', 'cout', 'prix', 'cost', 'dépense', 'depense', 'montant');
    const activiteCol = findCol('activité', 'activite', 'activity', 'programme', 'visite');
    const notesCol = findCol('note', 'remarque', 'comment', 'info', 'détail');
    const nuitsCol = findCol('nuit', 'night', 'durée', 'duree', 'jours');
    const catCol = findCol('catégorie', 'categorie', 'category', 'type');
    const statutCol = findCol('statut', 'status', 'réservé', 'reserve', 'booking');

    return rows
      .filter(r => {
        // Filter out empty rows
        const vals = Object.values(r).filter(v => v && String(v).trim());
        return vals.length > 0;
      })
      .map((row, idx) => ({
        index: idx + 1,
        date: row[dateCol] || '',
        dateFin: row[dateFinCol] || '',
        lieu: row[lieuCol] || '',
        transport: row[transportCol] || '',
        hebergement: row[hebergCol] || '',
        budget: row[budgetCol] || '',
        activite: row[activiteCol] || '',
        notes: row[notesCol] || '',
        nuits: row[nuitsCol] || '',
        categorie: row[catCol] || '',
        statut: row[statutCol] || '',
        raw: row
      }));
  },

  // ─── Get itinerary detail rows ───
  getItineraryRows() {
    if (!this.itineraryData) return [];
    return this.itineraryData.rows.filter(r => {
      const vals = Object.values(r).filter(v => v && String(v).trim());
      return vals.length > 0;
    });
  },

  getItineraryCols() {
    if (!this.itineraryData) return [];
    return this.itineraryData.cols;
  },

  getMainCols() {
    if (!this.mainData) return [];
    return this.mainData.cols;
  },

  // ─── Fallback data for demo ───
  useFallbackData() {
    const fallbackCols = ['Date', 'Lieu', 'Transport', 'Hébergement', 'Budget (¥)', 'Activités', 'Nuits'];
    const fallbackRows = [
      { 'Date': '15/03/2026', 'Lieu': 'Tokyo', 'Transport': 'Avion Paris→Tokyo', 'Hébergement': 'Hotel Shinjuku', 'Budget (¥)': '25000', 'Activités': 'Arrivée, Shinjuku', 'Nuits': '4' },
      { 'Date': '19/03/2026', 'Lieu': 'Hakone', 'Transport': 'Shinkansen + Romancecar', 'Hébergement': 'Ryokan Onsen', 'Budget (¥)': '35000', 'Activités': 'Onsen, Lac Ashi, Owakudani', 'Nuits': '1' },
      { 'Date': '20/03/2026', 'Lieu': 'Kyoto', 'Transport': 'Shinkansen', 'Hébergement': 'Machiya traditionnelle', 'Budget (¥)': '18000', 'Activités': 'Fushimi Inari, Gion, Arashiyama', 'Nuits': '3' },
      { 'Date': '23/03/2026', 'Lieu': 'Nara', 'Transport': 'JR Nara Line', 'Hébergement': 'Day trip depuis Kyoto', 'Budget (¥)': '5000', 'Activités': 'Todai-ji, cerfs, Kasuga Taisha', 'Nuits': '0' },
      { 'Date': '24/03/2026', 'Lieu': 'Osaka', 'Transport': 'JR', 'Hébergement': 'Airbnb Namba', 'Budget (¥)': '15000', 'Activités': 'Dotonbori, street food, château', 'Nuits': '2' },
      { 'Date': '26/03/2026', 'Lieu': 'Hiroshima', 'Transport': 'Shinkansen', 'Hébergement': 'Hotel Peace Park', 'Budget (¥)': '12000', 'Activités': 'Mémorial Paix, Miyajima', 'Nuits': '2' },
      { 'Date': '28/03/2026', 'Lieu': 'Kanazawa', 'Transport': 'Thunderbird Limited Express', 'Hébergement': 'Ryokan', 'Budget (¥)': '22000', 'Activités': 'Kenroku-en, quartier samouraï', 'Nuits': '1' },
      { 'Date': '29/03/2026', 'Lieu': 'Takayama', 'Transport': 'JR Wide View Hida', 'Hébergement': 'Minshuku', 'Budget (¥)': '16000', 'Activités': 'Vieille ville, marché, boeuf Hida', 'Nuits': '1' },
      { 'Date': '30/03/2026', 'Lieu': 'Tokyo', 'Transport': 'Shinkansen', 'Hébergement': 'Hotel Shibuya', 'Budget (¥)': '20000', 'Activités': 'Shopping, Akihabara, Tsukiji', 'Nuits': '2' },
      { 'Date': '01/04/2026', 'Lieu': 'Tokyo', 'Transport': 'Vol retour', 'Hébergement': '—', 'Budget (¥)': '5000', 'Activités': 'Départ vers Paris', 'Nuits': '0' }
    ];

    this.mainData = { cols: fallbackCols, rows: fallbackRows };
    this.itineraryData = this.mainData;
    this.exchangeRate = this.exchangeRate || 162.5;
    this.lastSync = new Date();
  }
};

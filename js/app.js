// =============================================
// APP — Router, Theme, Countdown, Init
// =============================================

// ─── THEME MANAGEMENT ───
const ThemeManager = {
  STORAGE_KEY: 'ldva-theme',

  init() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    this.apply(theme, false);
  },

  get current() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  },

  apply(theme, animate = true) {
    // On initial load (animate=false): suppress transition to avoid flash
    // On toggle click (animate=true): let CSS transitions run naturally
    if (!animate) {
      document.documentElement.style.transition = 'none';
      document.documentElement.setAttribute('data-theme', theme);
      requestAnimationFrame(() => { document.documentElement.style.transition = ''; });
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    localStorage.setItem(this.STORAGE_KEY, theme);
    this._updateButtons(theme);
  },

  _updateButtons(theme) {
    const isDark = theme === 'dark';
    const icon  = isDark ? '☀️' : '🌙';
    const label = isDark ? 'Mode clair' : 'Mode sombre';
    document.querySelectorAll('#theme-btn, #theme-btn-mobile').forEach(btn => {
      btn.title = label;
      const iconSpan  = btn.querySelector('.theme-icon');
      const labelSpan = btn.querySelector('.theme-label');
      if (iconSpan)  iconSpan.textContent  = icon;
      if (labelSpan) labelSpan.textContent = label;
    });
  },

  toggle() {
    this.apply(this.current === 'dark' ? 'light' : 'dark');
  }
};

function toggleTheme() { ThemeManager.toggle(); }

// ─── COUNTDOWN ───
function updateCountdown() {
  const departure = new Date('2026-11-18T00:00:00');
  const now = new Date();
  const diff = Math.ceil((departure - now) / (1000 * 60 * 60 * 24));
  const el = document.getElementById('countdown-days');
  const widget = document.getElementById('countdown-widget');
  if (!el || !widget) return;
  if (diff > 0) {
    el.textContent = diff;
    widget.style.display = '';
  } else if (diff === 0) {
    el.textContent = '✈️';
    el.style.fontSize = '1.6rem';
    widget.querySelector('.countdown-label').textContent = "C'est le grand départ !";
  } else {
    widget.style.display = 'none'; // voyage en cours ou terminé
  }
}

// ─── ROUTER ───
const Router = {
  currentPage: null,

  init() {
    window.addEventListener('hashchange', () => this.route());
    this.route();
  },

  route() {
    const hash = window.location.hash || '#/';
    const path = hash.replace('#/', '').split('/')[0] || 'dashboard';

    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.page === path);
    });

    this.currentPage = path;

    switch (path) {
      case 'dashboard':  renderDashboard(); break;
      case 'itinerary':  renderItinerary(); break;
      case 'guides':     renderGuides(); break;
      case 'timeline':  renderTimeline(); break;
      case 'print':      renderPrint(); break;
      default:           renderDashboard();
    }

    closeMobileMenu();
    document.querySelector('.page-container')?.scrollTo(0, 0);
    window.scrollTo(0, 0);
  }
};

// ─── MOBILE MENU ───
function openMobileMenu() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('mobile-overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('mobile-overlay').classList.remove('active');
  document.body.style.overflow = '';
}

// ─── DATA REFRESH ───
async function refreshData() {
  const btn = document.querySelector('.refresh-btn');
  if (btn) { btn.style.animation = 'spin 0.6s linear'; setTimeout(() => btn.style.animation = '', 700); }

  const container = document.getElementById('page-container');
  container.innerHTML = `
    <div class="loading-screen">
      <div class="loading-torii">⛩️</div>
      <p class="loading-text">Synchronisation avec le spreadsheet…</p>
      <div class="loading-bar"><div class="loading-bar-fill"></div></div>
    </div>
  `;

  await DataService.loadAllData();
  updateExchangeWidget();
  Router.route();
}

function updateExchangeWidget() {
  const el = document.getElementById('exchange-rate-value');
  if (el && DataService.exchangeRate) {
    el.textContent = DataService.exchangeRate.toFixed(2);
  }
  const syncEl = document.getElementById('last-sync');
  if (syncEl && DataService.lastSync) {
    const t = DataService.lastSync;
    syncEl.textContent = `${t.getHours().toString().padStart(2,'0')}:${t.getMinutes().toString().padStart(2,'0')}`;
  }
}

// ─── KEYBOARD SHORTCUTS ───
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const overlay = document.querySelector('.guide-detail-overlay');
    if (overlay) overlay.remove();
    closeMobileMenu();
  }
  // t = toggle theme
  if (e.key === 't' && !e.ctrlKey && !e.metaKey && !e.altKey) {
    const tag = document.activeElement?.tagName?.toLowerCase();
    if (tag !== 'input' && tag !== 'textarea') toggleTheme();
  }
});

// ─── ROBUST IMAGE REPAIR — handles popup images too ───
// Intercept Leaflet popup openings to repair images inside them
function patchLeafletPopups() {
  const orig = L.Popup.prototype.openOn;
  L.Popup.prototype.openOn = function(map) {
    const result = orig.call(this, map);
    setTimeout(() => _repairBrokenImages(), 50);
    return result;
  };
}

// ─── INITIALIZATION ───
async function initApp() {
  console.log('🏯 Little Domo Very Arigato V10 — Initializing…');

  // Theme must be applied first to avoid flash
  ThemeManager.init();
  updateCountdown();

  await DataService.loadAllData();
  updateExchangeWidget();

  // Patch Leaflet popup to auto-repair images
  if (typeof L !== 'undefined') patchLeafletPopups();

  Router.init();

  console.log('✅ App ready!',
    `Data: ${DataService.rawData ? DataService.rawData.rows.length + ' rows' : 'fallback'}`,
    `Rate: ${DataService.exchangeRate}`
  );

  // Auto-refresh exchange rate every 10 minutes (lightweight)
  setInterval(async () => {
    await DataService.fetchExchangeRate();
    updateExchangeWidget();
  }, 600_000);

  // Auto-refresh all data every 5 minutes (only when tab is visible)
  setInterval(async () => {
    if (!document.hidden) {
      await DataService.loadAllData();
      updateExchangeWidget();
      Router.route();
      console.log('Data auto-refreshed at', new Date().toLocaleTimeString());
    }
  }, 300_000);

  // Update countdown every hour
  setInterval(updateCountdown, 3_600_000);
}

document.addEventListener('DOMContentLoaded', initApp);

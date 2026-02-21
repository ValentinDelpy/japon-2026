// =============================================
// APP — Router, Initialization, Mobile Menu
// =============================================

// ─── Router ───
const Router = {
  currentPage: null,

  init() {
    window.addEventListener('hashchange', () => this.route());
    this.route();
  },

  route() {
    const hash = window.location.hash || '#/';
    const path = hash.replace('#/', '').split('/')[0] || 'dashboard';

    // Update active nav
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.page === path);
    });

    this.currentPage = path;

    switch (path) {
      case 'dashboard':
        renderDashboard();
        break;
      case 'itinerary':
        renderItinerary();
        break;
      case 'guides':
        renderGuides();
        break;
      case 'print':
        renderPrint();
        break;
      default:
        renderDashboard();
    }

    // Close mobile menu on navigate
    closeMobileMenu();

    // Scroll to top
    document.querySelector('.page-container')?.scrollTo(0, 0);
    window.scrollTo(0, 0);
  }
};

// ─── Mobile Menu ───
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

// ─── Data Refresh ───
async function refreshData() {
  const container = document.getElementById('page-container');
  container.innerHTML = `
    <div class="loading-screen">
      <div class="loading-torii">⛩️</div>
      <p class="loading-text">Synchronisation avec le spreadsheet...</p>
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
    syncEl.textContent = `Sync: ${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`;
  }
}

// ─── Keyboard shortcuts ───
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    // Close guide detail if open
    const overlay = document.querySelector('.guide-detail-overlay');
    if (overlay) overlay.remove();
    closeMobileMenu();
  }
});

// ─── Initialization ───
async function initApp() {
  console.log('🏯 Little Domo Very Arigato — Initializing...');

  await DataService.loadAllData();
  updateExchangeWidget();
  Router.init();

  console.log('✅ App ready!',
    `Data: ${DataService.mainData ? DataService.mainData.rows.length + ' rows' : 'fallback'}`,
    `Rate: ${DataService.exchangeRate}`
  );

  // Auto-refresh every 10 minutes
  setInterval(async () => {
    await DataService.fetchExchangeRate();
    updateExchangeWidget();
  }, 600000);
}

// Start
document.addEventListener('DOMContentLoaded', initApp);

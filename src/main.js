import './style.css'
import { loginWithGoogle, logoutUser, subscribeToAuthChanges } from './utils/auth.js';
import { createIcons, icons } from 'lucide';
import { initDashboard } from './components/Dashboard.js';
import { initPractice } from './components/PracticeTracker.js';
import { initMocks } from './components/MockModule.js';
import { initImprovement } from './components/ImprovementModule.js';
import { initVocab } from './components/VocabTracker.js';
import { initTopicPerformance } from './components/TopicDashboard.js';
import { exportToExcel } from './utils/excel.js';

// Initialize Lucide icons
createIcons({ icons });

// ── Hamburger sidebar (mobile) ─────────────────────────────────────
function openSidebar() {
  document.getElementById('sidebar').classList.add('sidebar-open');
  document.getElementById('sidebar-overlay').classList.add('active');
  const btn = document.getElementById('hamburger-btn');
  if (btn) { btn.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('sidebar-open');
  document.getElementById('sidebar-overlay').classList.remove('active');
  const btn = document.getElementById('hamburger-btn');
  if (btn) { btn.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
}

document.getElementById('hamburger-btn')?.addEventListener('click', () => {
  document.getElementById('sidebar').classList.contains('sidebar-open') ? closeSidebar() : openSidebar();
});

document.getElementById('sidebar-overlay')?.addEventListener('click', closeSidebar);
// ──────────────────────────────────────────────────────────────────

// Routing Logic
const mainView = document.getElementById('main-view');

const renderView = async (view) => {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.view === view) item.classList.add('active');
  });

  mainView.innerHTML = '<p style="color: var(--text-secondary);">Loading...</p>';

  switch (view) {
    case 'dashboard':   await initDashboard(mainView); break;
    case 'practice':    await initPractice(mainView); break;
    case 'mocks':       await initMocks(mainView); break;
    case 'improvement': await initImprovement(mainView); break;
    case 'vocab':       await initVocab(mainView); break;
    case 'performance': await initTopicPerformance(mainView); break;
    default:            await initDashboard(mainView);
  }

  // Re-init icons after new HTML is injected
  createIcons({ icons });
};

// Navigation listeners — close sidebar on mobile after navigating
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    renderView(item.dataset.view);
    closeSidebar();
  });
});

// Export listener
document.getElementById('export-excel').addEventListener('click', async () => {
  const success = await exportToExcel();
  alert(success ? 'Data exported successfully!' : 'Export failed. Check console.');
});

// Auth Logic
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userProfile = document.getElementById('user-profile');
const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');

loginBtn.addEventListener('click', async () => {
  try { await loginWithGoogle(); } catch { alert('Login failed. Check console for details.'); }
});

logoutBtn.addEventListener('click', async () => {
  try { await logoutUser(); } catch { alert('Logout failed. Check console for details.'); }
});

subscribeToAuthChanges((user) => {
  if (user) {
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'flex';
    userProfile.style.display = 'flex';
    userAvatar.src = user.photoURL;
    userName.textContent = user.displayName;
  } else {
    loginBtn.style.display = 'flex';
    logoutBtn.style.display = 'none';
    userProfile.style.display = 'none';
    userAvatar.src = '';
    userName.textContent = '';
  }
  const activeView = document.querySelector('.nav-item.active')?.dataset.view || 'dashboard';
  renderView(activeView);
});

// Initial Render
renderView('dashboard');

// Dev tools — dynamic import so it is excluded from production build
if (import.meta.env.DEV) {
  import('./utils/seeder.js').then(({ seedDatabase }) => {
    window.seedDatabase = seedDatabase;
    console.log("Dev Tools: Run `window.seedDatabase()` in console to populate data.");
  });
}

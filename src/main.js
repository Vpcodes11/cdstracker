import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js';
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

document.querySelector('#app').innerHTML = `
  <div>
    <nav class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <span id="logo-icon"></span>
          CDS TRACKER
        </div>
      </div>
      <ul class="nav-links">
        <li class="nav-item active" data-view="dashboard">
          <span class="nav-icon" data-lucide="layout-dashboard"></span>
          Dashboard
        </li>
        <li class="nav-item" data-view="practice">
          <span class="nav-icon" data-lucide="edit-3"></span>
          Daily Practice
        </li>
        <li class="nav-item" data-view="mocks">
          <span class="nav-icon" data-lucide="bar-chart-2"></span>
          Mock Tests
        </li>
        <li class="nav-item" data-view="improvement">
          <span class="nav-icon" data-lucide="trending-up"></span>
          Improvement
        </li>
        <li class="nav-item" data-view="vocab">
          <span class="nav-icon" data-lucide="book-open"></span>
          Vocabulary
        </li>
        <li class="nav-item" data-view="performance">
          <span class="nav-icon" data-lucide="target"></span>
          Topic Performance
        </li>
      </ul>

      <div style="margin-top: auto; padding: 20px; border-top: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 10px;">
        <div id="user-profile" style="display: none; align-items: center; gap: 10px; margin-bottom: 5px;">
           <img id="user-avatar" src="" alt="User" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">
           <div style="overflow: hidden;">
             <div id="user-name" style="font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></div>
             <div style="font-size: 11px; color: var(--text-secondary);">Logged In</div>
           </div>
        </div>

        <button id="login-btn" class="btn btn-primary" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;">
          <span data-lucide="log-in" style="width: 16px;"></span>
          Sign in
        </button>

        <button id="logout-btn" class="btn btn-secondary" style="width: 100%; display: none; align-items: center; justify-content: center; gap: 8px;">
          <span data-lucide="log-out" style="width: 16px;"></span>
          Sign Out
        </button>

        <button id="export-excel" class="btn btn-secondary"
          style="width: 100%; display: flex; align-items: center; gap: 8px; justify-content: center;">
          <span data-lucide="download" style="width: 16px;"></span>
          Export to Excel
        </button>
      </div>
    </nav>

    <main class="main-content" id="main-view">
      <!-- Content will be injected here -->
    </main>
  </div>
`;

// Re-initialize icons after injecting HTML
createIcons({ icons });

// Routing Logic
const mainView = document.getElementById('main-view');

const renderView = async (view) => {
  // Update Active State
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.view === view) {
      item.classList.add('active');
    }
  });

  mainView.innerHTML = '<p style="color: var(--text-secondary);">Loading...</p>';

  switch (view) {
    case 'dashboard':
      await initDashboard(mainView);
      break;
    case 'practice':
      await initPractice(mainView);
      break;
    case 'mocks':
      await initMocks(mainView);
      break;
    case 'improvement':
      await initImprovement(mainView);
      break;
    case 'vocab':
      await initVocab(mainView);
      break;
    case 'performance':
      await initTopicPerformance(mainView);
      break;
    default:
      await initDashboard(mainView);
  }
};

// Navigation Listeners
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    renderView(item.dataset.view);
  });
});

// Export Listener
document.getElementById('export-excel').addEventListener('click', async () => {
  const success = await exportToExcel();
  if (success) {
    alert('Data exported successfully!');
  } else {
    alert('Export failed. Check console.');
  }
});

// Auth Logic
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userProfile = document.getElementById('user-profile');
const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');

loginBtn.addEventListener('click', async () => {
  try {
    await loginWithGoogle();
  } catch (error) {
    alert("Login failed. Check console for details.");
  }
});

logoutBtn.addEventListener('click', async () => {
  try {
    await logoutUser();
  } catch (error) {
    alert("Logout failed. Check console for details.");
  }
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
  // Reload current view to refresh data source (Firestore vs LocalStorage)
  const activeView = document.querySelector('.nav-item.active')?.dataset.view || 'dashboard';
  renderView(activeView);
});

// Initial Render
renderView('dashboard');

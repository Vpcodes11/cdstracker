import { createIcons, LayoutDashboard, Edit3, BarChart2, TrendingUp, BookOpen, Download, Plus, Trash2, Calendar, Target, LogIn, LogOut, Edit2 } from 'lucide';
import { exportToExcel } from './src/utils/excel';
import { initDashboard } from './src/components/Dashboard';
import { initPractice } from './src/components/PracticeTracker';
import { initMocks } from './src/components/MockModule';
import { initVocab } from './src/components/VocabTracker';
import { initImprovement } from './src/components/ImprovementModule';
import { initTopicPerformance } from './src/components/TopicDashboard';
import { logoutUser, subscribeToAuthChanges } from './src/utils/auth';
import { showAuthModal } from './src/components/AuthModal';
import { initTheme, toggleTheme } from './src/utils/theme';

// ── Theme: apply saved preference immediately ──────────────────────
initTheme();

// ── Icons ─────────────────────────────────────────────────────────
createIcons({ icons: { LayoutDashboard, Edit3, BarChart2, TrendingUp, BookOpen, Download, Plus, Trash2, Calendar, Target, LogIn, LogOut, Edit2 } });

// ── View routing ──────────────────────────────────────────────────
const views = {
    dashboard:   initDashboard,
    practice:    initPractice,
    mocks:       initMocks,
    vocab:       initVocab,
    improvement: initImprovement,
    performance: initTopicPerformance,
};

let currentView = 'dashboard';

function renderView(viewName) {
    const container = document.getElementById('main-view');
    container.innerHTML = '';
    container.classList.remove('fade-in');
    void container.offsetWidth;
    container.classList.add('fade-in');
    if (views[viewName]) views[viewName](container);
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.view === viewName);
    });
    currentView = viewName;
}

// ── Mobile sidebar ────────────────────────────────────────────────
function closeSidebar() {
    document.getElementById('sidebar')?.classList.remove('sidebar-open');
    document.getElementById('sidebar-overlay')?.classList.remove('active');
    const btn = document.getElementById('hamburger-btn');
    if (btn) { btn.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
}

function openSidebar() {
    document.getElementById('sidebar')?.classList.add('sidebar-open');
    document.getElementById('sidebar-overlay')?.classList.add('active');
    const btn = document.getElementById('hamburger-btn');
    if (btn) { btn.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
}

document.getElementById('hamburger-btn')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.contains('sidebar-open') ? closeSidebar() : openSidebar();
});
document.getElementById('sidebar-overlay')?.addEventListener('click', closeSidebar);

// Nav items — close sidebar on mobile after navigating
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        renderView(item.dataset.view);
        closeSidebar();
    });
});

// ── Theme toggle ──────────────────────────────────────────────────
document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.addEventListener('click', toggleTheme);
});

// ── Auth ──────────────────────────────────────────────────────────
document.getElementById('login-btn')?.addEventListener('click', () => showAuthModal('signin'));

document.getElementById('logout-btn')?.addEventListener('click', async () => {
    try { await logoutUser(); } catch (e) { console.error(e); }
});

subscribeToAuthChanges((user) => {
    const loginBtn    = document.getElementById('login-btn');
    const logoutBtn   = document.getElementById('logout-btn');
    const userProfile = document.getElementById('user-profile');
    const userAvatar  = document.getElementById('user-avatar');
    const userName    = document.getElementById('user-name');
    const userEmail   = document.getElementById('user-email');

    if (user) {
        loginBtn.style.display  = 'none';
        logoutBtn.style.display = 'flex';
        userProfile.style.display = 'flex';
        userAvatar.src = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=3b82f6&color=fff`;
        userName.textContent  = user.displayName || 'User';
        if (userEmail) userEmail.textContent = user.email || '';
    } else {
        loginBtn.style.display  = 'flex';
        logoutBtn.style.display = 'none';
        userProfile.style.display = 'none';
        userAvatar.src = '';
        userName.textContent = '';
        if (userEmail) userEmail.textContent = '';
    }
    // Re-render current view to refresh data source
    renderView(currentView);
});

// ── Export ────────────────────────────────────────────────────────
document.getElementById('export-excel')?.addEventListener('click', async () => {
    const success = await exportToExcel();
    alert(success ? 'Excel file updated successfully!' : 'Export failed. Check console.');
});

// ── Initial render ────────────────────────────────────────────────
renderView('dashboard');

// ── Dev tools (excluded from prod build) ─────────────────────────
if (import.meta.env.DEV) {
    import('./src/utils/seeder.js').then(({ seedDatabase }) => {
        window.seedDatabase = seedDatabase;
        console.log('Dev Tools: Run window.seedDatabase() in console to populate data.');
    });
}
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
import { getPendingRevisions } from './src/utils/storage';
import { showRevisionModal } from './src/components/RevisionModal';

// ── Theme: apply saved preference immediately ──────────────────────
initTheme();

// ── Icons ─────────────────────────────────────────────────────────
createIcons({ icons: { LayoutDashboard, Edit3, BarChart2, TrendingUp, BookOpen, Download, Plus, Trash2, Calendar, Target, LogIn, LogOut, Edit2 } });

// ── View routing ──────────────────────────────────────────────────
const views = {
    dashboard: initDashboard,
    practice: initPractice,
    mocks: initMocks,
    vocab: initVocab,
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
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userProfile = document.getElementById('user-profile');
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');

    if (user) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'flex';
        userProfile.style.display = 'flex';
        userAvatar.src = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=3b82f6&color=fff`;
        userName.textContent = user.displayName || 'User';
        if (userEmail) userEmail.textContent = user.email || '';
    } else {
        loginBtn.style.display = 'flex';
        logoutBtn.style.display = 'none';
        userProfile.style.display = 'none';
        userAvatar.src = '';
        userName.textContent = '';
        if (userEmail) userEmail.textContent = '';
    }
    // Re-render current view to refresh data source
    renderView(currentView);

    // Active Reminder Behavior
    if (user && !sessionStorage.getItem('revision_reminder_shown')) {
        setTimeout(async () => {
            try {
                const pending = await getPendingRevisions();
                const todayStr = new Date().toISOString().split('T')[0];
                const dueCount = pending.filter(item => item.revisit_due_date.split('T')[0] <= todayStr).length;

                if (dueCount > 0) {
                    sessionStorage.setItem('revision_reminder_shown', 'true');

                    const banner = document.createElement('div');
                    banner.style.position = 'fixed';
                    banner.style.bottom = '24px';
                    banner.style.right = '24px';
                    banner.style.maxWidth = '350px';
                    banner.style.background = 'var(--bg-secondary)';
                    banner.style.border = '2px solid var(--accent-red)';
                    banner.style.padding = '20px';
                    banner.style.borderRadius = '12px';
                    banner.style.zIndex = '9999';
                    banner.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
                    banner.style.animation = 'slideUp 0.3s ease';
                    banner.innerHTML = `
                        <h4 style="margin:0 0 8px 0; color:var(--text-primary); display:flex; align-items:center; gap:8px;">
                            <span data-lucide="alert-circle" style="color:var(--accent-red); width:18px;"></span>
                            Unresolved Mistakes
                        </h4>
                        <p style="margin:0 0 16px 0; font-size:0.95rem; color:var(--text-secondary); line-height:1.4;">
                            You have ${dueCount} questions due for revision. Review them before starting a new session?
                        </p>
                        <div style="display:flex; gap:12px;">
                            <button id="remind-later-btn" class="btn btn-secondary" style="flex:1;">Later</button>
                            <button id="remind-review-btn" class="btn btn-primary" style="flex:1; background:var(--accent-red); color:#fff; border:none;">Review Now</button>
                        </div>
                    `;
                    document.body.appendChild(banner);

                    // Delay icon creation to ensure elements are in DOM
                    setTimeout(() => createIcons({ icons: { AlertCircle: { name: 'alert-circle', tags: [], attrs: { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, children: [{ name: "circle", attrs: { cx: "12", cy: "12", r: "10" } }, { name: "line", attrs: { x1: "12", y1: "8", x2: "12", y2: "12" } }, { name: "line", attrs: { x1: "12", y1: "16", x2: "12.01", y2: "16" } }] } } }), 0);

                    document.getElementById('remind-later-btn').onclick = () => banner.remove();
                    document.getElementById('remind-review-btn').onclick = () => {
                        banner.remove();
                        showRevisionModal(() => {
                            if (currentView === 'dashboard') renderView('dashboard');
                        });
                    };
                }
            } catch (e) {
                console.error('Failed to show active reminder', e);
            }
        }, 1000);
    }
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
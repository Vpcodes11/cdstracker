import { createIcons, LayoutDashboard, Edit3, BarChart2, TrendingUp, BookOpen, Download, Plus, Trash2, Calendar, Target } from 'lucide';
import { exportToExcel } from './src/utils/excel';
import { initDashboard } from './src/components/Dashboard';
import { initPractice } from './src/components/PracticeTracker';
import { initMocks } from './src/components/MockModule';
import { initVocab } from './src/components/VocabTracker';
import { initImprovement } from './src/components/ImprovementModule';
import { initTopicPerformance } from './src/components/TopicDashboard';

const views = {
    dashboard: initDashboard,
    practice: initPractice,
    mocks: initMocks,
    vocab: initVocab,
    improvement: initImprovement,
    performance: initTopicPerformance
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

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('sidebar-open');
    document.getElementById('sidebar-overlay').classList.remove('active');
    const btn = document.getElementById('hamburger-btn');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
}

function openSidebar() {
    document.getElementById('sidebar').classList.add('sidebar-open');
    document.getElementById('sidebar-overlay').classList.add('active');
    const btn = document.getElementById('hamburger-btn');
    btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
}

document.addEventListener('DOMContentLoaded', () => {
    createIcons({ icons: { LayoutDashboard, Edit3, BarChart2, TrendingUp, BookOpen, Download, Plus, Trash2, Calendar, Target } });

    renderView('dashboard');

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            renderView(item.dataset.view);
            closeSidebar();
        });
    });

    document.getElementById('hamburger-btn').addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.contains('sidebar-open') ? closeSidebar() : openSidebar();
    });

    document.getElementById('sidebar-overlay').addEventListener('click', closeSidebar);

    document.getElementById('export-excel').addEventListener('click', async () => {
        const success = await exportToExcel();
        if (success) alert('Excel file updated successfully!');
    });
});

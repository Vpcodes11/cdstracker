import { createIcons, LayoutDashboard, Edit3, BarChart2, TrendingUp, BookOpen, Download, Plus, Trash2, Calendar, Target } from 'lucide';
import { exportToExcel } from './src/utils/excel';
// Import component initializers (to be created)
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
    void container.offsetWidth; // Trigger reflow
    container.classList.add('fade-in');

    if (views[viewName]) {
        views[viewName](container);
    }

    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.view === viewName);
    });

    currentView = viewName;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    createIcons({
        icons: { LayoutDashboard, Edit3, BarChart2, TrendingUp, BookOpen, Download, Plus, Trash2, Calendar, Target }
    });

    renderView('dashboard');

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            renderView(item.dataset.view);
        });
    });

    document.getElementById('export-excel').addEventListener('click', async () => {
        const success = await exportToExcel();
        if (success) {
            alert('Excel file updated successfully!');
        }
    });
});

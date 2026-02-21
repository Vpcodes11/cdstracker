import { getStorageData, STORAGE_KEYS, getPendingRevisions } from '../utils/storage';
import { calculateAccuracy, getSubjectStats } from '../utils/stats';
import { initCountdown } from './Countdown';
import { showRevisionModal } from './RevisionModal';
import { createIcons, RefreshCw, TrendingUp } from 'lucide';
import Chart from 'chart.js/auto';

export async function initDashboard(container) {
  const practice = await getStorageData(STORAGE_KEYS.PRACTICE);
  const mocks = await getStorageData(STORAGE_KEYS.MOCKS);
  const totalSolved = practice.reduce((acc, s) => acc + Number(s.attempted), 0);
  const totalCorrect = practice.reduce((acc, s) => acc + Number(s.correct), 0);
  const overallAccuracy = calculateAccuracy(totalCorrect, totalSolved);
  const subjectStats = getSubjectStats(practice);

  const pendingRevisions = await getPendingRevisions();
  const todayDate = new Date().toISOString().split('T')[0];

  let overdueCount = 0;
  let dueTodayCount = 0;
  const subjectBreakdown = {};

  pendingRevisions.forEach(rev => {
    const revDate = rev.revisit_due_date.split('T')[0];
    if (revDate < todayDate) overdueCount++;
    else if (revDate === todayDate) dueTodayCount++;

    subjectBreakdown[rev.subject] = (subjectBreakdown[rev.subject] || 0) + 1;
  });

  const totalPending = pendingRevisions.length;

  // Prepare data for Trend Line (last 10 sessions)
  const sortedPractice = [...practice].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const recentSessions = sortedPractice.slice(-10);
  const trendLabels = recentSessions.map((_, i) => `S${i + 1}`);
  const trendData = recentSessions.map(s => Math.round(s.accuracy || (s.attempted ? (s.correct / s.attempted) * 100 : 0)));

  container.innerHTML = `
    <header class="page-header">
      <div>
        <h1 style="font-size:2rem;margin-bottom:8px;">Welcome back, Aspirant</h1>
        <p style="color:var(--text-secondary);">Here is your preparation overview.</p>
      </div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;">
        <button id="quick-log-practice" class="btn btn-primary" style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:1.2em;">+</span> Log Practice
        </button>
        <button id="quick-log-mock" class="btn btn-secondary" style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:1.2em;">+</span> Log Mock
        </button>
      </div>
    </header>

    <div id="countdown-widget" style="margin-bottom:32px;"></div>

    ${totalPending > 0 ? `
    <div class="card" style="margin-bottom:32px; border: 1px solid ${overdueCount > 0 ? 'var(--accent-red)' : 'var(--border-color)'}; background: ${overdueCount > 0 ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-secondary)'};">
        <h3 style="margin-bottom:12px; display:flex; align-items:center; gap:8px;">
           <span data-lucide="refresh-cw" style="width:20px; color: ${overdueCount > 0 ? 'var(--accent-red)' : 'var(--text-primary)'};"></span> 
           Pending Mistake Revisions
        </h3>
        <p style="margin-bottom:16px;">You have <strong>${totalPending}</strong> questions to revisit. 
        <span style="color:var(--accent-red); font-weight:bold;">${overdueCount} are overdue.</span> 
        <span style="color:var(--accent-yellow); font-weight:bold;">${dueTodayCount} due today.</span></p>
        <div style="display:flex; gap:12px; flex-wrap:wrap;">
            ${Object.entries(subjectBreakdown).map(([subj, count]) => `
                <span style="background:var(--bg-color); padding:4px 12px; border-radius:12px; border: 1px solid var(--border-color); font-size:0.85rem;">${subj}: ${count}</span>
            `).join('')}
        </div>
        <button id="review-now-btn" class="btn btn-primary" style="margin-top:16px; background:var(--accent-blue); color:#fff;">Review Now</button>
    </div>
    ` : ''}

    <div class="grid-stats">
      <div class="card stat-card"><div class="stat-value">${totalSolved}</div><div class="stat-label">Total Solved</div></div>
      <div class="card stat-card"><div class="stat-value" style="color:var(--accent-green);">${overallAccuracy}%</div><div class="stat-label">Overall Accuracy</div></div>
      <div class="card stat-card"><div class="stat-value">${mocks.length}</div><div class="stat-label">Mocks Taken</div></div>
      <div class="card stat-card"><div class="stat-value">${practice.length}</div><div class="stat-label">Sessions Logged</div></div>
    </div>

    <div class="two-col-grid" style="margin-bottom:32px;">
      <div class="card">
        <h3 style="margin-bottom:20px; display:flex; align-items:center; gap:8px;">
          <span data-lucide="trending-up" style="color:var(--accent-blue); width:20px;"></span>
          Recent Accuracy Trend
        </h3>
        <div style="height:250px;">
          <canvas id="trendChart"></canvas>
        </div>
      </div>
      <div class="card">
        <h3 style="margin-bottom:20px;">Accuracy by Subject</h3>
        <div style="height:250px;">
          <canvas id="subjectChart"></canvas>
        </div>
      </div>
    </div>

    <div class="card">
        <h3 style="margin-bottom:20px;">Top Weak Areas</h3>
        <div id="weak-areas-list">
          ${subjectStats.sort((a, b) => a.accuracy - b.accuracy).slice(0, 3).map(s => `
            <div style="margin-bottom:16px;">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                <span>${s.subject}</span><span style="color:var(--accent-red);">${s.accuracy}%</span>
              </div>
              <div style="height:4px;background:var(--bg-accent);border-radius:2px;">
                <div style="height:100%;width:${s.accuracy}%;background:var(--accent-red);border-radius:2px;"></div>
              </div>
            </div>`).join('')}
        </div>
      </div>
    </div>
  `;

  // --- Render Subject Chart with Gradient ---
  const ctxSubj = document.getElementById('subjectChart').getContext('2d');
  const gradientSubj = ctxSubj.createLinearGradient(0, 0, 0, 250);
  gradientSubj.addColorStop(0, 'rgba(59, 130, 246, 0.8)'); // accent-blue
  gradientSubj.addColorStop(1, 'rgba(59, 130, 246, 0.2)');

  new Chart(ctxSubj, {
    type: 'bar',
    data: {
      labels: subjectStats.map(s => s.subject),
      datasets: [{
        label: 'Accuracy %',
        data: subjectStats.map(s => s.accuracy),
        backgroundColor: gradientSubj,
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.05)' } },
        x: { grid: { display: false } }
      },
      plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } }
    }
  });

  // --- Render Trend Chart with Gradient Fill ---
  const ctxTrend = document.getElementById('trendChart').getContext('2d');
  const gradientTrend = ctxTrend.createLinearGradient(0, 0, 0, 250);
  gradientTrend.addColorStop(0, 'rgba(16, 185, 129, 0.5)'); // accent-green
  gradientTrend.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

  new Chart(ctxTrend, {
    type: 'line',
    data: {
      labels: trendLabels.length ? trendLabels : ['No Data'],
      datasets: [{
        label: 'Accuracy %',
        data: trendData.length ? trendData : [0],
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: gradientTrend,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(16, 185, 129, 1)',
        pointBorderColor: '#fff',
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.05)' } },
        x: { grid: { display: false } }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          cornerRadius: 4
        }
      },
      interaction: { mode: 'index', intersect: false }
    }
  });

  initCountdown(document.getElementById('countdown-widget'));

  if (totalPending > 0) {
    createIcons({ icons: { RefreshCw, TrendingUp } });
    document.getElementById('review-now-btn').onclick = () => {
      showRevisionModal(() => {
        // Refresh dashboard after modal closes
        initDashboard(container);
      });
    };
  }

  document.getElementById('quick-log-practice').onclick = () => {
    document.querySelector('.nav-item[data-view="practice"]')?.click();
    setTimeout(() => document.getElementById('add-session-btn')?.click(), 100);
  };
  document.getElementById('quick-log-mock').onclick = () => {
    document.querySelector('.nav-item[data-view="mocks"]')?.click();
    setTimeout(() => document.getElementById('add-mock-btn')?.click(), 100);
  };
}

import { getStorageData, STORAGE_KEYS } from '../utils/storage';
import { calculateAccuracy, getSubjectStats } from '../utils/stats';
import { initCountdown } from './Countdown';
import Chart from 'chart.js/auto';

export async function initDashboard(container) {
  const practice = await getStorageData(STORAGE_KEYS.PRACTICE);
  const mocks = await getStorageData(STORAGE_KEYS.MOCKS);
  const totalSolved = practice.reduce((acc, s) => acc + Number(s.attempted), 0);
  const totalCorrect = practice.reduce((acc, s) => acc + Number(s.correct), 0);
  const overallAccuracy = calculateAccuracy(totalCorrect, totalSolved);
  const subjectStats = getSubjectStats(practice);

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

    <div class="grid-stats">
      <div class="card stat-card"><div class="stat-value">${totalSolved}</div><div class="stat-label">Total Solved</div></div>
      <div class="card stat-card"><div class="stat-value" style="color:var(--accent-green);">${overallAccuracy}%</div><div class="stat-label">Overall Accuracy</div></div>
      <div class="card stat-card"><div class="stat-value">${mocks.length}</div><div class="stat-label">Mocks Taken</div></div>
      <div class="card stat-card"><div class="stat-value">${practice.length}</div><div class="stat-label">Sessions Logged</div></div>
    </div>

    <div class="two-col-grid">
      <div class="card">
        <h3 style="margin-bottom:20px;">Accuracy by Subject</h3>
        <canvas id="subjectChart" height="200"></canvas>
      </div>
      <div class="card">
        <h3 style="margin-bottom:20px;">Top Weak Areas</h3>
        <div id="weak-areas-list">
          ${subjectStats.sort((a,b)=>a.accuracy-b.accuracy).slice(0,3).map(s=>`
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

  const ctx = document.getElementById('subjectChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: { labels: subjectStats.map(s=>s.subject), datasets: [{ label:'Accuracy %', data: subjectStats.map(s=>s.accuracy), backgroundColor:'#3b82f6', borderRadius:4 }] },
    options: { responsive:true, scales: { y:{beginAtZero:true,max:100,grid:{color:'#2d2d33'}}, x:{grid:{display:false}} }, plugins:{legend:{display:false}} }
  });

  initCountdown(document.getElementById('countdown-widget'));

  document.getElementById('quick-log-practice').onclick = () => {
    document.querySelector('.nav-item[data-view="practice"]')?.click();
    setTimeout(()=>document.getElementById('add-session-btn')?.click(), 100);
  };
  document.getElementById('quick-log-mock').onclick = () => {
    document.querySelector('.nav-item[data-view="mocks"]')?.click();
    setTimeout(()=>document.getElementById('add-mock-btn')?.click(), 100);
  };
}

import { getStorageData, STORAGE_KEYS } from '../utils/storage';
import { getTopicStats } from '../utils/stats';
import { createIcons, Target, TrendingUp } from 'lucide';

export async function initImprovement(container) { await render(container); }

const ERROR_TYPES = ["Concept Error","Careless Mistake","Time Pressure","Guess Error"];

async function render(container) {
  const practice = await getStorageData(STORAGE_KEYS.PRACTICE);
  const topicStats = getTopicStats(practice);
  const errorCounts = {};
  ERROR_TYPES.forEach(t => errorCounts[t] = 0);
  practice.forEach(session => {
    if (session.errors && Array.isArray(session.errors))
      session.errors.forEach(err => { if (errorCounts[err] !== undefined) errorCounts[err]++; });
  });
  const totalErrors = Object.values(errorCounts).reduce((a,b)=>a+b,0);
  const weakTopics = topicStats.filter(t=>t.accuracy<60&&t.attempted>10).slice(0,5);

  container.innerHTML = `
    <header style="margin-bottom:40px;">
      <h1 style="font-size:2rem;margin-bottom:8px;">Improvement Tracker</h1>
      <p style="color:var(--text-secondary);">Identify why you are losing marks and create a fix plan.</p>
    </header>

    <div class="two-col-grid">
      <div class="card">
        <h3 style="margin-bottom:20px;">Error Patterns</h3>
        <p style="color:var(--text-secondary);margin-bottom:20px;font-size:0.9rem;">Based on your tagged sessions.</p>
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${ERROR_TYPES.map(type => {
    const count = errorCounts[type];
    const pct = totalErrors > 0 ? Math.round((count/totalErrors)*100) : 0;
    return `<div style="background:var(--bg-accent);padding:16px;border-radius:8px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <span>${type}</span><span style="color:var(--accent-red);font-weight:700;">${count}</span>
      </div>
      <div style="height:6px;background:var(--bg-primary);border-radius:3px;">
        <div style="height:100%;width:${pct}%;background:var(--accent-red);border-radius:3px;"></div>
      </div></div>`;
  }).join('')}
        </div>
      </div>

      <div class="card">
        <h3 style="margin-bottom:20px;">Weak Topics (Acc &lt; 60%)</h3>
        <div id="granular-weak-list">
          ${weakTopics.length > 0 ? weakTopics.map(t=>`
            <div style="margin-bottom:16px;border-bottom:1px solid var(--border-color);padding-bottom:12px;">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                <span style="font-weight:600;">${t.topic}</span>
                <span style="color:var(--accent-red);">${t.accuracy}%</span>
              </div>
              <div style="font-size:0.8em;color:var(--text-secondary);">${t.subject} - ${t.correct}/${t.attempted} Correct</div>
            </div>`).join('')
    : '<p style="color:var(--text-secondary);">No weak topics identified yet. Keep practicing!</p>'}
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:24px;">
      <h3 style="margin-bottom:20px;">Self-Assessment Guide</h3>
      <div style="color:var(--text-secondary);line-height:1.6;">
        <p>1. <strong>Concept Error:</strong> You did not know the formula or the fact. Solution: Revise theory.</p>
        <p>2. <strong>Careless Mistake:</strong> Calculation error or misreading. Solution: Practice with focus.</p>
        <p>3. <strong>Time Pressure:</strong> Ran out of time. Solution: Solve more timed mocks.</p>
        <p>4. <strong>Guess Error:</strong> Educated guess went wrong. Solution: Refine elimination techniques.</p>
      </div>
    </div>
  `;
  createIcons({ icons: { Target, TrendingUp } });
}

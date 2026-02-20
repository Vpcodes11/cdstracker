import { getStorageData, STORAGE_KEYS, addEntry } from '../utils/storage';
import { createIcons, Target, TrendingUp } from 'lucide';

export async function initImprovement(container) {
  await render(container);
}

const ERROR_TYPES = [
  "Concept Error",
  "Careless Mistake",
  "Time Pressure",
  "Guess Error"
];

async function render(container) {
  const practice = await getStorageData(STORAGE_KEYS.PRACTICE);

  // Group by error type from comments/tags (if we had specific error log table)
  // For MVP, we'll allow tagging errors on an "Assessment" form.

  container.innerHTML = `
    <header style="margin-bottom: 40px;">
      <h1 style="font-size: 2rem; margin-bottom: 8px;">Improvement Tracker</h1>
      <p style="color: var(--text-secondary);">Identify why you're losing marks and create a fix plan.</p>
    </header>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
      <div class="card">
        <h3 style="margin-bottom: 20px;">Analyze Error Patterns</h3>
        <p style="color: var(--text-secondary); margin-bottom: 20px; font-size: 0.9rem;">
          Select a subject to see where common errors occur.
        </p>
        
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${ERROR_TYPES.map(type => `
            <div style="background: var(--bg-accent); padding: 16px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
              <span>${type}</span>
              <span style="color: var(--accent-red); font-weight: 700;">Coming in V2</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="card">
        <h3 style="margin-bottom: 20px;">Weak Topics List</h3>
        <div id="granular-weak-list">
          <!-- Logic to pull from stats.js getTopicStats -->
          <p style="color: var(--text-secondary);">Analyzing your practice sessions...</p>
        </div>
      </div>
    </div>
    
    <div class="card" style="margin-top: 24px;">
      <h3 style="margin-bottom: 20px;">Self-Assessment Guide</h3>
      <div style="color: var(--text-secondary); line-height: 1.6;">
        <p>1. <strong>Concept Error:</strong> You didn't know the formula or the fact. Solution: Revise theory.</p>
        <p>2. <strong>Careless Mistake:</strong> Calculation error or misreading. Solution: Practice with focus.</p>
        <p>3. <strong>Time Pressure:</strong> Ran out of time. Solution: Solve more timed mocks.</p>
        <p>4. <strong>Guess Error:</strong> Educated guess went wrong. Solution: Refine elimination techniques.</p>
      </div>
    </div>
  `;

  createIcons({ icons: { Target, TrendingUp } });
}

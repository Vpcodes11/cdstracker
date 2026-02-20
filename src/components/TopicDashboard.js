import { getStorageData, STORAGE_KEYS } from '../utils/storage';
import { getTopicStats } from '../utils/stats';

export async function initTopicPerformance(container) {
  const practice = await getStorageData(STORAGE_KEYS.PRACTICE);
  const topicStats = getTopicStats(practice);

  const subjects = ["Maths", "English", "GS"];

  container.innerHTML = `
    <header style="margin-bottom: 40px;">
      <h1 style="font-size: 2rem; margin-bottom: 8px;">Topic Performance</h1>
      <p style="color: var(--text-secondary);">Subject-wise breakdown of your accuracy.</p>
    </header>

    <div style="display: flex; flex-direction: column; gap: 32px;">
      ${subjects.map(sub => {
    const subTopics = topicStats.filter(t => t.subject === sub);
    return `
          <div class="card">
            <h2 style="margin-bottom: 20px; color: var(--accent-blue); display: flex; align-items: center; gap: 10px;">
              ${sub}
            </h2>
            ${subTopics.length > 0 ? `
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px;">
                ${subTopics.map(t => `
                  <div style="background: var(--bg-accent); padding: 16px; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                      <span style="font-weight: 600;">${t.topic}</span>
                      <span style="color: ${t.accuracy > 70 ? 'var(--accent-green)' : t.accuracy > 50 ? 'var(--accent-yellow)' : 'var(--accent-red)'}">
                        ${t.accuracy}%
                      </span>
                    </div>
                    <div style="height: 6px; background: var(--bg-primary); border-radius: 3px;">
                      <div style="height: 100%; width: ${t.accuracy}%; background: ${t.accuracy > 70 ? 'var(--accent-green)' : t.accuracy > 50 ? 'var(--accent-yellow)' : 'var(--accent-red)'}; border-radius: 3px;"></div>
                    </div>
                    <div style="margin-top: 8px; font-size: 0.75rem; color: var(--text-secondary);">
                      ${t.correct} / ${t.attempted} Correct
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : `<p style="color: var(--text-secondary);">No data for ${sub} yet.</p>`}
          </div>
        `;
  }).join('')}
    </div>
  `;
}

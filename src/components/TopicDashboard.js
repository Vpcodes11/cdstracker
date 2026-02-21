import { getStorageData, STORAGE_KEYS } from '../utils/storage';
import { getTopicStats } from '../utils/stats';
import Chart from 'chart.js/auto';

export async function initTopicPerformance(container) {
  const practice = await getStorageData(STORAGE_KEYS.PRACTICE);
  const topicStats = getTopicStats(practice);

  const subjects = ["Maths", "English", "GS"];

  // Calculate average accuracy per subject for Radar Chart
  const subjectAverages = subjects.map(sub => {
    const subTopics = topicStats.filter(t => t.subject === sub);
    if (subTopics.length === 0) return 0;
    const sum = subTopics.reduce((acc, curr) => acc + curr.accuracy, 0);
    return Math.round(sum / subTopics.length);
  });

  container.innerHTML = `
    <header style="margin-bottom: 32px;">
      <h1 style="font-size: 2rem; margin-bottom: 8px;">Topic Performance</h1>
      <p style="color: var(--text-secondary);">Subject-wise breakdown of your accuracy.</p>
    </header>

    <div class="card" style="margin-bottom:32px; display:flex; flex-direction:column; align-items:center;">
        <h3 style="margin-bottom:16px;">Skill Web</h3>
        <div style="height:300px; width:100%; max-width:500px;">
           <canvas id="radarChart"></canvas>
        </div>
    </div>

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
                    <div style="height: 6px; background: var(--bg-primary); border-radius: 3px; overflow:hidden;">
                      <div style="height: 100%; width: 0%; background: ${t.accuracy > 70 ? 'var(--accent-green)' : t.accuracy > 50 ? 'var(--accent-yellow)' : 'var(--accent-red)'}; border-radius: 3px; transition: width 1s ease-out;" data-width="${t.accuracy}%"></div>
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

  // --- Render Radar Chart ---
  const ctxRadar = document.getElementById('radarChart').getContext('2d');
  new Chart(ctxRadar, {
    type: 'radar',
    data: {
      labels: subjects,
      datasets: [{
        label: 'Average Accuracy',
        data: subjectAverages,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)'
      }]
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        r: {
          angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          pointLabels: { color: 'var(--text-primary)', font: { size: 14 } },
          ticks: { display: false, min: 0, max: 100 }
        }
      },
      plugins: { legend: { display: false } }
    }
  });

  // Trigger animations for progress bars
  setTimeout(() => {
    container.querySelectorAll('[data-width]').forEach(el => {
      el.style.width = el.getAttribute('data-width');
    });
  }, 100);
}

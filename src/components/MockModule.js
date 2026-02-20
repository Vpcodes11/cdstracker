import { addEntry, getStorageData, STORAGE_KEYS, deleteEntry } from '../utils/storage';
import { createIcons, Trash2, TrendingUp } from 'lucide';
import Chart from 'chart.js/auto';

export async function initMocks(container) {
  await render(container);
}

async function render(container) {
  const mocks = await getStorageData(STORAGE_KEYS.MOCKS);

  container.innerHTML = `
    <header style="margin-bottom: 40px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h1 style="font-size: 2rem; margin-bottom: 8px;">Mock Tests</h1>
        <p style="color: var(--text-secondary);">Track your full-length mock performance.</p>
      </div>
      <button id="add-mock-btn" class="btn btn-primary">
        + Log Mock
      </button>
    </header>

    <div id="mock-form-container" style="display: none;" class="card">
      <h3 style="margin-bottom: 20px;">Log Mock Results</h3>
      <form id="mock-form">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div class="input-group">
            <label>Mock Name/Number</label>
            <input type="text" name="name" placeholder="e.g. Mock 1, PYQ 2023" required>
          </div>
          <div class="input-group">
            <label>Date</label>
            <input type="date" name="date" required value="${new Date().toISOString().split('T')[0]}">
          </div>
          <div class="input-group">
            <label>English Score</label>
            <input type="number" name="english" placeholder="Out of 100" required>
          </div>
          <div class="input-group">
            <label>GS Score</label>
            <input type="number" name="gs" placeholder="Out of 100" required>
          </div>
          <div class="input-group">
            <label>Maths Score</label>
            <input type="number" name="maths" placeholder="Out of 100" required>
          </div>
          <div class="input-group">
            <label>Total Score</label>
            <input type="number" name="total" placeholder="Calculated automatically" readonly style="background: var(--bg-primary);">
          </div>
        </div>
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <button type="button" id="cancel-mock-form" class="btn btn-secondary">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Mock</button>
        </div>
      </form>
    </div>

    ${mocks.length > 1 ? `
    <div class="card">
      <h3 style="margin-bottom: 20px;">Score Trends</h3>
      <canvas id="mockTrendChart" height="150"></canvas>
    </div>
    ` : ''}

    <div class="card">
      <h3 style="margin-bottom: 20px;">Previous Mocks</h3>
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-secondary); font-size: 0.85rem;">
            <th style="padding: 12px;">Mock</th>
            <th style="padding: 12px;">English</th>
            <th style="padding: 12px;">GS</th>
            <th style="padding: 12px;">Maths</th>
            <th style="padding: 12px;">Total</th>
            <th style="padding: 12px;"></th>
          </tr>
        </thead>
        <tbody>
          ${mocks.map(m => `
            <tr style="border-bottom: 1px solid var(--border-color);">
              <td style="padding: 12px;">${m.name}</td>
              <td style="padding: 12px;">${m.english}</td>
              <td style="padding: 12px;">${m.gs}</td>
              <td style="padding: 12px;">${m.maths}</td>
              <td style="padding: 12px; font-weight: 700;">${m.total}</td>
              <td style="padding: 12px;">
                <button class="delete-mock btn-secondary" data-id="${m.id}" style="padding: 4px; border-radius: 4px;">
                  <span data-lucide="trash-2" style="width: 16px;"></span>
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  // Auto-calculate total
  const form = document.getElementById('mock-form');
  if (form) {
    const inputs = ['english', 'gs', 'maths'];
    inputs.forEach(id => {
      form[id].oninput = () => {
        const total = inputs.reduce((acc, name) => acc + (Number(form[name].value) || 0), 0);
        form.total.value = total;
      };
    });
  }

  // Chart Rendering
  if (mocks.length > 1) {
    const sortedMocks = [...mocks].sort((a, b) => new Date(a.date) - new Date(b.date));
    const ctx = document.getElementById('mockTrendChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: sortedMocks.map(m => m.name),
        datasets: [{
          label: 'Total Score',
          data: sortedMocks.map(m => m.total),
          borderColor: '#3b82f6',
          borderWidth: 3,
          tension: 0.4,
          pointBackgroundColor: '#3b82f6'
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { grid: { color: '#2d2d33' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // Event Listeners
  document.getElementById('add-mock-btn').onclick = () => {
    document.getElementById('mock-form-container').style.display = 'block';
  };

  document.getElementById('cancel-mock-form').onclick = () => {
    document.getElementById('mock-form-container').style.display = 'none';
  };

  document.getElementById('mock-form').onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const entry = Object.fromEntries(formData.entries());
    await addEntry(STORAGE_KEYS.MOCKS, entry);
    await render(container);
  };

  document.querySelectorAll('.delete-mock').forEach(btn => {
    btn.onclick = async () => {
      if (confirm('Delete this mock result?')) {
        await deleteEntry(STORAGE_KEYS.MOCKS, btn.dataset.id);
        await render(container);
      }
    };
  });

  createIcons({ icons: { Trash2, TrendingUp } });
}

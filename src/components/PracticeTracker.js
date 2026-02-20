import { addEntry, getStorageData, STORAGE_KEYS, deleteEntry } from '../utils/storage';
import { createIcons, Trash2 } from 'lucide';

export async function initPractice(container) {
  await render(container);
}

async function render(container) {
  const practice = await getStorageData(STORAGE_KEYS.PRACTICE);

  container.innerHTML = `
    <header style="margin-bottom: 40px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h1 style="font-size: 2rem; margin-bottom: 8px;">Daily Practice</h1>
        <p style="color: var(--text-secondary);">Log your question practice sessions.</p>
      </div>
      <button id="add-session-btn" class="btn btn-primary">
        + New Session
      </button>
    </header>

    <div id="session-form-container" style="display: none;" class="card">
      <h3 style="margin-bottom: 20px;">Log New Session</h3>
      <form id="practice-form">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div class="input-group">
            <label>Subject</label>
            <select name="subject" required>
              <option value="Maths">Maths</option>
              <option value="English">English</option>
              <option value="GS">GS</option>
            </select>
          </div>
          <div class="input-group">
            <label>Topic</label>
            <input type="text" name="topic" placeholder="e.g. Geometry, Ancient History" required>
          </div>
          <div class="input-group">
            <label>Attempted</label>
            <input type="number" name="attempted" required min="1">
          </div>
          <div class="input-group">
            <label>Correct</label>
            <input type="number" name="correct" required min="0">
          </div>
          <div class="input-group">
            <label>Wrong</label>
            <input type="number" name="wrong" required min="0">
          </div>
          <div class="input-group">
            <label>Source</label>
            <input type="text" name="source" placeholder="e.g. Disha PYQ, Mock 1">
          </div>
        </div>
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <button type="button" id="cancel-form" class="btn btn-secondary">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Session</button>
        </div>
      </form>
    </div>

    <div class="card">
      <h3 style="margin-bottom: 20px;">Recent Sessions</h3>
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-secondary); font-size: 0.85rem;">
            <th style="padding: 12px;">Date</th>
            <th style="padding: 12px;">Subject</th>
            <th style="padding: 12px;">Topic</th>
            <th style="padding: 12px;">Accuracy</th>
            <th style="padding: 12px;">Score</th>
            <th style="padding: 12px;"></th>
          </tr>
        </thead>
        <tbody>
          ${practice.map(s => `
            <tr style="border-bottom: 1px solid var(--border-color);">
              <td style="padding: 12px;">${new Date(s.timestamp).toLocaleDateString()}</td>
              <td style="padding: 12px;">${s.subject}</td>
              <td style="padding: 12px;">${s.topic}</td>
              <td style="padding: 12px;">
                <span style="color: ${Number(s.correct) / Number(s.attempted) > 0.7 ? 'var(--accent-green)' : 'var(--accent-yellow)'}">
                  ${Math.round((Number(s.correct) / Number(s.attempted)) * 100)}%
                </span>
              </td>
              <td style="padding: 12px;">${s.correct}/${s.attempted}</td>
              <td style="padding: 12px;">
                <button class="delete-session btn-secondary" data-id="${s.id}" style="padding: 4px; border-radius: 4px;">
                  <span data-lucide="trash-2" style="width: 16px;"></span>
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  // Event Listeners
  document.getElementById('add-session-btn').onclick = () => {
    document.getElementById('session-form-container').style.display = 'block';
  };

  document.getElementById('cancel-form').onclick = () => {
    document.getElementById('session-form-container').style.display = 'none';
  };

  document.getElementById('practice-form').onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const entry = Object.fromEntries(formData.entries());
    await addEntry(STORAGE_KEYS.PRACTICE, entry);
    await render(container);
    createIcons({ icons: { Trash2 } });
  };

  document.querySelectorAll('.delete-session').forEach(btn => {
    btn.onclick = async () => {
      if (confirm('Delete this session?')) {
        await deleteEntry(STORAGE_KEYS.PRACTICE, btn.dataset.id);
        await render(container);
        createIcons({ icons: { Trash2 } });
      }
    };
  });

  createIcons({ icons: { Trash2 } });
}

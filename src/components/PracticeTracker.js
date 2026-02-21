import { addEntry, getStorageData, STORAGE_KEYS, deleteEntry, updateEntry } from '../utils/storage';
import { createIcons, Trash2, Edit2 } from 'lucide';

export async function initPractice(container) { await render(container); }

async function render(container) {
  const practice = await getStorageData(STORAGE_KEYS.PRACTICE);

  container.innerHTML = `
    <header class="page-header">
      <div>
        <h1 style="font-size:2rem;margin-bottom:8px;">Daily Practice</h1>
        <p style="color:var(--text-secondary);">Log your question practice sessions.</p>
      </div>
      <button id="add-session-btn" class="btn btn-primary">+ New Session</button>
    </header>

    <div id="session-form-container" style="display:none;" class="card">
      <h3 id="form-title" style="margin-bottom:20px;">Log New Session</h3>
      <form id="practice-form">
        <div class="form-grid">
          <div class="input-group"><label>Subject</label>
            <select name="subject" required>
              <option value="Maths">Maths</option>
              <option value="English">English</option>
              <option value="GS">GS</option>
            </select>
          </div>
          <div class="input-group"><label>Topic</label><input type="text" name="topic" placeholder="e.g. Geometry, Ancient History" required></div>
          <div class="input-group"><label>Total Questions</label><input type="number" id="calc-total" name="total" required min="1"></div>
          <div class="input-group"><label>Correct</label><input type="number" id="calc-correct" name="correct" required min="0"></div>
          <div class="input-group"><label>Left (Unattempted)</label><input type="number" id="calc-left" name="left" required min="0"></div>
          <div class="input-group"><label>Wrong (Auto)</label><input type="number" id="calc-wrong" name="wrong" readonly style="background:var(--bg-color);opacity:0.8;"></div>
          <div class="input-group"><label>Marks (Auto)</label><input type="number" id="calc-marks" name="marks" readonly step="0.01" style="background:var(--bg-color);opacity:0.8;"></div>
          <div class="input-group"><label>Source</label><input type="text" name="source" placeholder="e.g. Disha PYQ, Mock 1"></div>
        </div>
        
        <div id="calc-preview" style="margin-top:20px; padding:15px; background:var(--bg-color); border-radius:8px; border:1px solid var(--border-color); display:none;">
           <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px;">
              <div><strong>Estimated Marks:</strong> <span id="preview-marks">0</span></div>
              <div><strong>Accuracy:</strong> <span id="preview-accuracy">0%</span></div>
              <div><strong>Attempt Rate:</strong> <span id="preview-attempt-rate">0%</span></div>
           </div>
           <div id="calc-error" style="color:var(--accent-red); margin-top:10px; font-size:0.9rem; display:none;"></div>
        </div>

        <div class="input-group" style="margin-top:20px;">
          <label>Primary Error Types (if any)</label>
          <div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:8px;">
            <label style="display:flex;align-items:center;gap:6px;font-size:0.9rem;cursor:pointer;"><input type="checkbox" name="errors" value="Concept Error"> Concept</label>
            <label style="display:flex;align-items:center;gap:6px;font-size:0.9rem;cursor:pointer;"><input type="checkbox" name="errors" value="Careless Mistake"> Careless</label>
            <label style="display:flex;align-items:center;gap:6px;font-size:0.9rem;cursor:pointer;"><input type="checkbox" name="errors" value="Time Pressure"> Time</label>
            <label style="display:flex;align-items:center;gap:6px;font-size:0.9rem;cursor:pointer;"><input type="checkbox" name="errors" value="Guess Error"> Guess</label>
          </div>
        </div>
        <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:24px;flex-wrap:wrap;">
          <button type="button" id="cancel-form" class="btn btn-secondary">Cancel</button>
          <button type="submit" id="save-session-btn" class="btn btn-primary">Save Session</button>
        </div>
      </form>
    </div>

    <div class="card">
      <h3 style="margin-bottom:20px;">Recent Sessions</h3>
      <div class="table-scroll">
        <table style="width:100%;border-collapse:collapse;text-align:left;min-width:520px;">
          <thead><tr style="border-bottom:1px solid var(--border-color);color:var(--text-secondary);font-size:0.85rem;">
            <th style="padding:12px;">Date</th><th style="padding:12px;">Subject</th><th style="padding:12px;">Topic</th>
            <th style="padding:12px;">Score</th><th style="padding:12px;">Accuracy</th><th style="padding:12px;">Marks</th><th style="padding:12px;"></th>
          </tr></thead>
          <tbody>
            ${practice.map(s => `
              <tr style="border-bottom:1px solid var(--border-color);">
                <td style="padding:12px;">${new Date(s.timestamp).toLocaleDateString()}</td>
                <td style="padding:12px;">${s.subject}</td>
                <td style="padding:12px;">${s.topic}</td>
                <td style="padding:12px;">${s.correct}/${s.total || s.attempted}</td>
                <td style="padding:12px;"><span style="color:${Number(s.accuracy || (s.attempted ? s.correct / s.attempted * 100 : 0)) > 70 ? 'var(--accent-green)' : 'var(--accent-yellow)'}">
                  ${Math.round(s.accuracy || (s.attempted ? s.correct / s.attempted * 100 : 0))}%</span></td>
                <td style="padding:12px; font-weight:bold;">${s.marks !== undefined ? s.marks : '-'}</td>
                <td style="padding:12px;display:flex;gap:8px;align-items:center;">
                  <button class="edit-session btn-secondary" data-id="${s.id}" style="padding:4px;border-radius:4px;cursor:pointer;">
                    <span data-lucide="edit-2" style="width:16px;"></span>
                  </button>
                  <button class="delete-session btn-secondary" data-id="${s.id}" style="padding:4px;border-radius:4px;cursor:pointer;">
                    <span data-lucide="trash-2" style="width:16px;"></span>
                  </button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  let editingId = null;

  function resetForm() {
    document.getElementById('practice-form').reset();
    document.getElementById('session-form-container').style.display = 'none';
    document.getElementById('calc-preview').style.display = 'none';
    document.getElementById('form-title').textContent = 'Log New Session';
    document.getElementById('save-session-btn').textContent = 'Save Session';
    editingId = null;
  }

  document.getElementById('add-session-btn').onclick = () => {
    resetForm();
    document.getElementById('session-form-container').style.display = 'block';
  };
  document.getElementById('cancel-form').onclick = resetForm;

  const calcTotal = document.getElementById('calc-total');
  const calcCorrect = document.getElementById('calc-correct');
  const calcLeft = document.getElementById('calc-left');
  const calcWrong = document.getElementById('calc-wrong');
  const calcMarks = document.getElementById('calc-marks');
  const previewDiv = document.getElementById('calc-preview');
  const previewMarks = document.getElementById('preview-marks');
  const previewAccuracy = document.getElementById('preview-accuracy');
  const previewAttemptRate = document.getElementById('preview-attempt-rate');
  const calcError = document.getElementById('calc-error');
  const saveBtn = document.getElementById('save-session-btn');

  const positive_mark = 1;
  const negative_mark = 0.33;

  function updateCalculations() {
    const total = parseInt(calcTotal.value) || 0;
    const correct = parseInt(calcCorrect.value) || 0;
    const left = parseInt(calcLeft.value) || 0;

    if (calcTotal.value === '' && calcCorrect.value === '' && calcLeft.value === '') {
      previewDiv.style.display = 'none';
      return;
    }

    previewDiv.style.display = 'block';
    let hasError = false;
    let errorMsg = '';

    const wrong = total - correct - left;

    if (wrong < 0) {
      hasError = true;
      errorMsg = 'Invalid: Correct + Left exceeds Total questions.';
    }

    if (hasError) {
      calcError.textContent = errorMsg;
      calcError.style.display = 'block';
      calcWrong.value = '';
      calcMarks.value = '';
      previewMarks.textContent = '-';
      previewAccuracy.textContent = '-';
      previewAttemptRate.textContent = '-';
      saveBtn.disabled = true;
      return;
    }

    calcError.style.display = 'none';
    saveBtn.disabled = false;

    const marks = (correct * positive_mark) - (wrong * negative_mark);
    const roundedMarks = Math.round(marks * 100) / 100;
    const accuracy = total > 0 && (correct + wrong) > 0 ? (correct / (correct + wrong)) * 100 : 0;
    const attemptRate = total > 0 ? ((correct + wrong) / total) * 100 : 0;

    calcWrong.value = wrong;
    calcMarks.value = roundedMarks;

    previewMarks.textContent = roundedMarks;
    previewAccuracy.textContent = accuracy.toFixed(2) + '%';
    previewAttemptRate.textContent = attemptRate.toFixed(2) + '%';
  }

  calcTotal.addEventListener('input', updateCalculations);
  calcCorrect.addEventListener('input', updateCalculations);
  calcLeft.addEventListener('input', updateCalculations);

  document.getElementById('practice-form').onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const entry = Object.fromEntries(formData.entries());

    const total = Number(entry.total);
    const correct = Number(entry.correct);
    const left = Number(entry.left);
    const wrong = total - correct - left;

    if (wrong < 0) return;

    entry.attempted = correct + wrong;
    entry.accuracy = correct + wrong > 0 ? (correct / (correct + wrong)) * 100 : 0;
    entry.attempt_rate = total > 0 ? ((correct + wrong) / total) * 100 : 0;

    entry.errors = Array.from(e.target.querySelectorAll('input[name="errors"]:checked')).map(cb => cb.value);

    if (editingId) {
      await updateEntry(STORAGE_KEYS.PRACTICE, editingId, entry);

      // Try to find a pending revision
      const revisions = await getStorageData(STORAGE_KEYS.REVISIONS);
      const pendingRev = revisions.find(r => r.subject === entry.subject && r.topic === entry.topic && r.status !== 'mastered');

      if (pendingRev) {
        if (wrong === 0) {
          await updateEntry(STORAGE_KEYS.REVISIONS, pendingRev.id, { status: 'mastered' });
        } else {
          await updateEntry(STORAGE_KEYS.REVISIONS, pendingRev.id, { wrong_count: wrong });
        }
      } else if (wrong > 0) {
        // Create new revision if not found
        const today = new Date();
        const dueDate = new Date();
        dueDate.setDate(today.getDate() + 2);
        await addEntry(STORAGE_KEYS.REVISIONS, {
          subject: entry.subject,
          topic: entry.topic,
          wrong_count: wrong,
          date_logged: today.toISOString(),
          revisit_due_date: dueDate.toISOString(),
          status: 'pending',
          review_count: 0,
          original_accuracy: entry.accuracy
        });
      }
    } else {
      await addEntry(STORAGE_KEYS.PRACTICE, entry);

      if (wrong > 0) {
        const today = new Date();
        const dueDate = new Date();
        dueDate.setDate(today.getDate() + 2);
        await addEntry(STORAGE_KEYS.REVISIONS, {
          subject: entry.subject,
          topic: entry.topic,
          wrong_count: wrong,
          date_logged: today.toISOString(),
          revisit_due_date: dueDate.toISOString(),
          status: 'pending',
          review_count: 0,
          original_accuracy: entry.accuracy
        });
      }
    }

    resetForm();
    await render(container);
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

  document.querySelectorAll('.edit-session').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const session = practice.find(s => s.id === id);
      if (session) {
        editingId = id;
        document.getElementById('form-title').textContent = 'Edit Session';
        document.getElementById('save-session-btn').textContent = 'Update Session';
        document.getElementById('session-form-container').style.display = 'block';

        const form = document.getElementById('practice-form');
        form.subject.value = session.subject;
        form.topic.value = session.topic;
        form.total.value = session.total || (session.attempted + (session.left || 0));
        form.correct.value = session.correct;
        form.left.value = session.left || 0;
        form.source.value = session.source || '';

        Array.from(form.querySelectorAll('input[name="errors"]')).forEach(cb => {
          cb.checked = session.errors && session.errors.includes(cb.value);
        });

        updateCalculations();
        document.getElementById('session-form-container').scrollIntoView({ behavior: 'smooth' });
      }
    };
  });

  createIcons({ icons: { Trash2, Edit2 } });
}

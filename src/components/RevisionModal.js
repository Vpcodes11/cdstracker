import { getPendingRevisions, updateEntry, STORAGE_KEYS } from '../utils/storage';
import { createIcons, RefreshCw, X, CheckCircle, AlertCircle, BookOpen } from 'lucide';

let modalRoot = null;

export async function showRevisionModal(onCloseCallback) {
  if (!modalRoot) {
    modalRoot = document.createElement('div');
    modalRoot.id = 'revision-modal-root';
    document.body.appendChild(modalRoot);
  }

  const pending = await getPendingRevisions();

  // Sort by overdue first, then due today, then future
  const todayStr = new Date().toISOString().split('T')[0];
  pending.sort((a, b) => {
    return new Date(a.revisit_due_date) - new Date(b.revisit_due_date);
  });

  const dueItems = pending; // Changed to allow reviewing all pending items including future ones

  if (dueItems.length === 0) {
    alert("You have no pending mistake revisions! Great job.");
    return;
  }

  let currentIndex = 0;

  function renderModal() {
    if (currentIndex >= dueItems.length) {
      modalRoot.innerHTML = '';
      if (onCloseCallback) onCloseCallback();
      return;
    }

    const item = dueItems[currentIndex];
    const isOverdue = item.revisit_due_date.split('T')[0] < todayStr;
    const isUpcoming = item.revisit_due_date.split('T')[0] > todayStr;
    const statusLabel = isOverdue ? 'Overdue' : (isUpcoming ? 'Upcoming' : 'Due Today');
    const borderColor = isOverdue ? 'var(--accent-red)' : (isUpcoming ? 'var(--accent-blue)' : 'var(--accent-yellow)');

    modalRoot.innerHTML = `
      <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(4px);">
        <div class="card" style="width:100%;max-width:500px;max-height:90vh;overflow-y:auto;position:relative;animation:slideUp 0.3s ease;margin:0;">
          <button id="close-revision" style="position:absolute;top:16px;right:16px;background:none;border:none;color:var(--text-secondary);cursor:pointer;">
            <span data-lucide="x"></span>
          </button>
          
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
            <div style="width:40px;height:40px;border-radius:50%;background:var(--bg-accent);display:flex;align-items:center;justify-content:center;color:var(--accent-blue);">
              <span data-lucide="refresh-cw"></span>
            </div>
            <div>
              <h2 style="font-size:1.2rem;margin:0;">Review Mistake</h2>
              <p style="font-size:0.9rem;color:var(--text-secondary);margin:0;">Item ${currentIndex + 1} of ${dueItems.length}</p>
            </div>
          </div>

          <div style="background:var(--bg-color);padding:16px;border-radius:8px;margin-bottom:24px;border-left:4px solid ${borderColor};overflow:hidden;">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:8px;">
               <span style="font-weight:600;color:var(--text-primary);">${item.subject}</span>
               <span style="font-size:0.85rem;padding:2px 8px;border-radius:12px;background:var(--bg-accent);white-space:nowrap;">${statusLabel}</span>
            </div>
            <h3 style="font-size:1.1rem;margin:0 0 12px 0;">${item.topic}</h3>
            <div style="display:flex;gap:16px;font-size:0.9rem;color:var(--text-secondary);">
               <span>Wrong: <strong>${item.wrong_count}</strong></span>
               <span>Review Count: <strong>${item.review_count}/3</strong></span>
            </div>
          </div>

          <h4 style="margin-bottom:12px;font-size:0.9rem;color:var(--text-secondary);">How did you do on the reattempt?</h4>
          
          <div style="display:flex;flex-direction:column;gap:12px;">
            <button id="btn-correct" class="btn" style="background:var(--bg-accent);color:var(--text-primary);border:1px solid var(--border-color);display:flex;align-items:center;gap:8px;justify-content:center;">
              <span data-lucide="check-circle" style="color:var(--accent-green);"></span>
              Reattempted & Correct
            </button>
            <button id="btn-incorrect" class="btn" style="background:var(--bg-accent);color:var(--text-primary);border:1px solid var(--border-color);display:flex;align-items:center;gap:8px;justify-content:center;">
              <span data-lucide="alert-circle" style="color:var(--accent-red);"></span>
              Still Incorrect
            </button>
            <button id="btn-more-practice" class="btn" style="background:var(--bg-accent);color:var(--text-primary);border:1px solid var(--border-color);display:flex;align-items:center;gap:8px;justify-content:center;">
              <span data-lucide="book-open" style="color:var(--accent-yellow);"></span>
              Need More Practice
            </button>
          </div>
        </div>
      </div>
    `;

    createIcons({ icons: { RefreshCw, X, CheckCircle, AlertCircle, BookOpen } });

    document.getElementById('close-revision').onclick = () => {
      modalRoot.innerHTML = '';
      if (onCloseCallback) onCloseCallback();
    };

    const handleAction = async (action) => {
      let updates = {};
      const now = new Date();

      if (action === 'correct') {
        const newCount = item.review_count + 1;
        if (newCount >= 3) {
          updates = { status: 'mastered', review_count: newCount };
        } else {
          const nextDays = newCount === 1 ? 5 : 10;
          now.setDate(now.getDate() + nextDays);
          updates = { review_count: newCount, revisit_due_date: now.toISOString() };
        }
      } else {
        // incorrect or needs practice
        now.setDate(now.getDate() + 3);
        updates = { revisit_due_date: now.toISOString() };
      }

      // Disable buttons during save
      document.querySelectorAll('#revision-modal-root .btn').forEach(b => b.disabled = true);

      await updateEntry(STORAGE_KEYS.REVISIONS, item.id, updates);

      currentIndex++;
      renderModal();
    };

    document.getElementById('btn-correct').onclick = () => handleAction('correct');
    document.getElementById('btn-incorrect').onclick = () => handleAction('incorrect');
    document.getElementById('btn-more-practice').onclick = () => handleAction('practice');
  }

  renderModal();
}

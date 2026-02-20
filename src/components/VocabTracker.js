import { addEntry, getStorageData, STORAGE_KEYS, deleteEntry, updateEntry } from '../utils/storage';
import { createIcons, Trash2, BookOpen, Calendar, Target, Edit2 } from 'lucide';

export async function initVocab(container) { await render(container); }

function calculateNextRevision(revisionCount) {
  const days = [1,3,7,14,30,90][revisionCount] || 180;
  const d = new Date(); d.setDate(d.getDate()+days); return d.toISOString();
}

async function render(container) {
  const vocab = await getStorageData(STORAGE_KEYS.VOCAB);
  const today = new Date().toISOString().split('T')[0];
  const dueRevision = vocab.filter(v=>v.nextRevision&&v.nextRevision.split('T')[0]<=today);

  container.innerHTML = `
    <header class="page-header">
      <div>
        <h1 style="font-size:2rem;margin-bottom:8px;">Vocabulary Tracker</h1>
        <p style="color:var(--text-secondary);">Manage keywords and definitions with spaced repetition.</p>
      </div>
      <button id="add-vocab-btn" class="btn btn-primary">+ Add Word</button>
    </header>

    ${dueRevision.length > 0 ? `
      <div class="card" style="border-left:4px solid var(--accent-yellow);">
        <h3 style="color:var(--accent-yellow);margin-bottom:12px;display:flex;align-items:center;gap:8px;">
          <span data-lucide="calendar" style="width:20px;"></span>
          Revision Due Today (${dueRevision.length})
        </h3>
        <div style="display:flex;gap:12px;overflow-x:auto;padding-bottom:10px;-webkit-overflow-scrolling:touch;">
          ${dueRevision.map(v=>`
            <div class="card" style="min-width:200px;flex-shrink:0;margin-bottom:0;padding:16px;background:var(--bg-accent);">
              <div style="font-weight:700;margin-bottom:4px;">${v.word}</div>
              <div style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:12px;">${v.meaning}</div>
              <button class="mark-revised btn btn-primary" data-id="${v.id}" style="font-size:0.75rem;width:100%;">Mark Done</button>
            </div>`).join('')}
        </div>
      </div>` : ''}

    <div id="vocab-form-container" style="display:none;" class="card">
      <h3 style="margin-bottom:20px;">Add New Vocabulary</h3>
      <form id="vocab-form">
        <div class="input-group"><label>Word / Phrase</label><input type="text" name="word" required></div>
        <div class="input-group"><label>Meaning</label><textarea name="meaning" rows="2" required></textarea></div>
        <div class="input-group"><label>Example Sentence</label><input type="text" name="example"></div>
        <div style="display:flex;gap:12px;justify-content:flex-end;flex-wrap:wrap;">
          <button type="button" id="cancel-vocab-form" class="btn btn-secondary">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Word</button>
        </div>
      </form>
    </div>

    <div class="card">
      <h3 style="margin-bottom:20px;">Vocabulary Bank</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">
        ${vocab.map(v=>`
          <div class="card" style="margin-bottom:0;position:relative;">
            <div style="position:absolute;top:12px;right:12px;display:flex;gap:8px;">
              <button class="edit-vocab" data-id="${v.id}" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;">
                <span data-lucide="edit-2" style="width:16px;"></span></button>
              <button class="delete-vocab" data-id="${v.id}" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;">
                <span data-lucide="trash-2" style="width:16px;"></span></button>
            </div>
            <h4 style="color:var(--accent-blue);margin-bottom:8px;padding-right:60px;">${v.word}</h4>
            <p style="font-size:0.9rem;margin-bottom:8px;">${v.meaning}</p>
            ${v.example?`<p style="font-style:italic;color:var(--text-secondary);font-size:0.85rem;margin-bottom:12px;">"${v.example}"</p>`:''}
            <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--border-color);padding-top:12px;margin-top:12px;font-size:0.75rem;color:var(--text-secondary);">
              <span>Revisions: ${v.revisionCount||0}</span>
              <span>Next: ${v.nextRevision?new Date(v.nextRevision).toLocaleDateString():'N/A'}</span>
            </div>
          </div>`).join('')}
      </div>
    </div>
  `;

  let editingId = null;

  document.getElementById('add-vocab-btn').onclick = () => {
    editingId = null;
    document.getElementById('vocab-form').reset();
    document.querySelector('#vocab-form button[type="submit"]').textContent = 'Save Word';
    document.getElementById('vocab-form-container').style.display = 'block';
  };

  document.getElementById('cancel-vocab-form').onclick = () => {
    editingId = null;
    document.getElementById('vocab-form').reset();
    document.getElementById('vocab-form-container').style.display = 'none';
  };

  document.getElementById('vocab-form').onsubmit = async (e) => {
    e.preventDefault();
    const entry = Object.fromEntries(new FormData(e.target).entries());
    if (editingId) {
      await updateEntry(STORAGE_KEYS.VOCAB, editingId, entry);
    } else {
      entry.revisionCount = 0; entry.nextRevision = calculateNextRevision(0);
      await addEntry(STORAGE_KEYS.VOCAB, entry);
    }
    editingId = null;
    document.getElementById('vocab-form').reset();
    document.getElementById('vocab-form-container').style.display = 'none';
    await render(container);
  };

  document.querySelectorAll('.edit-vocab').forEach(btn => {
    btn.onclick = () => {
      const word = vocab.find(v=>v.id===btn.dataset.id);
      if (word) {
        editingId = btn.dataset.id;
        const form = document.getElementById('vocab-form');
        form.word.value=word.word; form.meaning.value=word.meaning; form.example.value=word.example||'';
        document.querySelector('#vocab-form button[type="submit"]').textContent = 'Update Word';
        document.getElementById('vocab-form-container').style.display = 'block';
        window.scrollTo({top:0,behavior:'smooth'});
      }
    };
  });

  document.querySelectorAll('.mark-revised').forEach(btn => {
    btn.onclick = async () => {
      const word = vocab.find(v=>v.id===btn.dataset.id);
      const newCount = (word.revisionCount||0)+1;
      await updateEntry(STORAGE_KEYS.VOCAB, btn.dataset.id, {revisionCount:newCount, nextRevision:calculateNextRevision(newCount)});
      await render(container);
    };
  });

  document.querySelectorAll('.delete-vocab').forEach(btn => {
    btn.onclick = async () => {
      if (confirm('Delete this word?')) { await deleteEntry(STORAGE_KEYS.VOCAB, btn.dataset.id); await render(container); }
    };
  });

  createIcons({ icons: { Trash2, BookOpen, Calendar, Target, Edit2 } });
}

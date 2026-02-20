export function initCountdown(container) {
    const examDate = new Date('2026-04-12T09:00:00');

    const updateTimer = () => {
        const now = new Date();
        const diff = examDate - now;

        if (diff <= 0) {
            container.innerHTML = '<div class="card" style="text-align: center; background: var(--accent-green); color: white;">Exam Started/Finished!</div>';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        // Color coding based on urgency
        let color = 'var(--accent-green)';
        if (days < 30) color = 'var(--accent-yellow)';
        if (days < 7) color = 'var(--accent-red)';

        container.innerHTML = `
      <div class="card" style="text-align: center; border: 1px solid ${color};">
        <h3 style="margin-bottom: 10px; color: var(--text-secondary);">CDS Exam Countdown</h3>
        <div style="font-size: 2.5rem; font-weight: 700; color: ${color}; font-variant-numeric: tabular-nums;">
          ${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s
        </div>
        <p style="margin-top: 8px; font-size: 0.9rem;">Target: April 12, 2026</p>
      </div>
    `;
    };

    updateTimer();
    setInterval(updateTimer, 1000);
}

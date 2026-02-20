const STORAGE_KEY = 'cds-theme';
const DARK = 'dark';
const LIGHT = 'light';

export function getTheme() {
    return localStorage.getItem(STORAGE_KEY) || DARK;
}

export function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    // Update all toggle buttons
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
        btn.textContent = theme === DARK ? '☀️' : '🌙';
        btn.setAttribute('aria-label', theme === DARK ? 'Switch to light mode' : 'Switch to dark mode');
    });
}

export function initTheme() {
    applyTheme(getTheme());
}

export function toggleTheme() {
    const next = getTheme() === DARK ? LIGHT : DARK;
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
}

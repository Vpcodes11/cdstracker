import { loginWithGoogle, loginWithEmail, registerWithEmail, sendPasswordReset } from '../utils/auth.js';

function closeModal() {
    const root = document.getElementById('auth-modal-root');
    if (root) root.innerHTML = '';
}

function showError(id, msg) {
    const el = document.getElementById(id);
    if (el) { el.textContent = msg; el.style.display = msg ? 'block' : 'none'; }
}

function setLoading(btnId, loading) {
    const btn = document.getElementById(btnId);
    if (btn) { btn.disabled = loading; btn.textContent = loading ? 'Please wait...' : btn.dataset.label; }
}

export function showAuthModal(defaultTab = 'signin') {
    const root = document.getElementById('auth-modal-root');
    if (!root) return;
    root.innerHTML = `
        <div class="auth-overlay" id="auth-overlay">
          <div class="auth-modal" role="dialog" aria-modal="true">
            <button class="auth-close" id="auth-close" aria-label="Close">&times;</button>
            <div class="auth-brand">
              <span class="auth-brand-icon">🎯</span>
              <h2>CDS Tracker</h2>
            </div>

            <div class="auth-tabs">
              <button class="auth-tab ${defaultTab === 'signin' ? 'active' : ''}" data-tab="signin">Sign In</button>
              <button class="auth-tab ${defaultTab === 'signup' ? 'active' : ''}" data-tab="signup">Sign Up</button>
              <button class="auth-tab ${defaultTab === 'forgot' ? 'active' : ''}" data-tab="forgot">Reset</button>
            </div>

            <!-- Sign In -->
            <div class="auth-panel ${defaultTab === 'signin' ? 'active' : ''}" id="panel-signin">
              <p class="auth-error" id="signin-err" style="display:none"></p>
              <div class="input-group">
                <label>Email</label>
                <input type="email" id="signin-email" placeholder="you@example.com" autocomplete="email">
              </div>
              <div class="input-group">
                <label>Password</label>
                <input type="password" id="signin-pass" placeholder="Your password" autocomplete="current-password">
              </div>
              <button class="btn btn-primary auth-submit" id="signin-btn" data-label="Sign In" style="width:100%;margin-bottom:12px;">Sign In</button>
              <div class="auth-divider"><span>or</span></div>
              <button class="btn auth-google-btn" id="signin-google">
                <svg width="18" height="18" viewBox="0 0 48 48" style="margin-right:8px;"><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.5 2.8-2.2 5.2-4.7 6.8v5.6h7.6c4.5-4.1 7-10.2 7-16.4z"/><path fill="#34A853" d="M24 47c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.6c-2.2 1.4-5 2.3-8.3 2.3-6.4 0-11.8-4.3-13.7-10.1H2.4v5.8C6.3 41.7 14.5 47 24 47z"/><path fill="#FBBC04" d="M10.3 27.8c-.5-1.4-.8-2.9-.8-4.4s.3-3.1.8-4.5v-5.8H2.4C.9 16.2 0 19.9 0 23.9s.9 7.7 2.4 10.7l7.9-6.8z"/><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.5l6.8-6.8C35.9 2.4 30.5 0 24 0 14.5 0 6.3 5.3 2.4 13.2l7.9 6.8C12.2 13.8 17.6 9.5 24 9.5z"/></svg>
                Continue with Google
              </button>
            </div>

            <!-- Sign Up -->
            <div class="auth-panel ${defaultTab === 'signup' ? 'active' : ''}" id="panel-signup">
              <p class="auth-error" id="signup-err" style="display:none"></p>
              <div class="input-group">
                <label>Full Name</label>
                <input type="text" id="signup-name" placeholder="Your name" autocomplete="name">
              </div>
              <div class="input-group">
                <label>Email</label>
                <input type="email" id="signup-email" placeholder="you@example.com" autocomplete="email">
              </div>
              <div class="input-group">
                <label>Password</label>
                <input type="password" id="signup-pass" placeholder="Min 6 characters" autocomplete="new-password">
              </div>
              <div class="input-group">
                <label>Confirm Password</label>
                <input type="password" id="signup-confirm" placeholder="Repeat password" autocomplete="new-password">
              </div>
              <button class="btn btn-primary auth-submit" id="signup-btn" data-label="Create Account" style="width:100%;margin-bottom:12px;">Create Account</button>
              <div class="auth-divider"><span>or</span></div>
              <button class="btn auth-google-btn" id="signup-google">
                <svg width="18" height="18" viewBox="0 0 48 48" style="margin-right:8px;"><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.5 2.8-2.2 5.2-4.7 6.8v5.6h7.6c4.5-4.1 7-10.2 7-16.4z"/><path fill="#34A853" d="M24 47c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.6c-2.2 1.4-5 2.3-8.3 2.3-6.4 0-11.8-4.3-13.7-10.1H2.4v5.8C6.3 41.7 14.5 47 24 47z"/><path fill="#FBBC04" d="M10.3 27.8c-.5-1.4-.8-2.9-.8-4.4s.3-3.1.8-4.5v-5.8H2.4C.9 16.2 0 19.9 0 23.9s.9 7.7 2.4 10.7l7.9-6.8z"/><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.5l6.8-6.8C35.9 2.4 30.5 0 24 0 14.5 0 6.3 5.3 2.4 13.2l7.9 6.8C12.2 13.8 17.6 9.5 24 9.5z"/></svg>
                Continue with Google
              </button>
            </div>

            <!-- Forgot Password -->
            <div class="auth-panel ${defaultTab === 'forgot' ? 'active' : ''}" id="panel-forgot">
              <p class="auth-error" id="forgot-err" style="display:none"></p>
              <p class="auth-hint">Enter your email and we will send a reset link.</p>
              <div class="input-group">
                <label>Email</label>
                <input type="email" id="forgot-email" placeholder="you@example.com" autocomplete="email">
              </div>
              <button class="btn btn-primary auth-submit" id="forgot-btn" data-label="Send Reset Link" style="width:100%;">Send Reset Link</button>
            </div>

          </div>
        </div>`;

    // Tab switching
    root.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            root.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            root.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            root.querySelector(`#panel-${tab.dataset.tab}`)?.classList.add('active');
        });
    });

    document.getElementById('auth-close').addEventListener('click', closeModal);
    document.getElementById('auth-overlay').addEventListener('click', (e) => {
        if (e.target.id === 'auth-overlay') closeModal();
    });
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', escHandler); }
    });

    // --- Sign In ---
    document.getElementById('signin-btn').addEventListener('click', async () => {
        const email = document.getElementById('signin-email').value.trim();
        const pass  = document.getElementById('signin-pass').value;
        showError('signin-err', '');
        setLoading('signin-btn', true);
        try {
            await loginWithEmail(email, pass);
            closeModal();
        } catch (e) {
            showError('signin-err', friendlyError(e.code));
        } finally { setLoading('signin-btn', false); }
    });

    document.getElementById('signin-email').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('signin-pass').focus(); });
    document.getElementById('signin-pass').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('signin-btn').click(); });

    document.getElementById('signin-google').addEventListener('click', async () => {
        showError('signin-err', '');
        try { await loginWithGoogle(); closeModal(); }
        catch (e) { showError('signin-err', friendlyError(e.code)); }
    });

    // --- Sign Up ---
    document.getElementById('signup-btn').addEventListener('click', async () => {
        const name    = document.getElementById('signup-name').value.trim();
        const email   = document.getElementById('signup-email').value.trim();
        const pass    = document.getElementById('signup-pass').value;
        const confirm = document.getElementById('signup-confirm').value;
        showError('signup-err', '');
        if (!name) { showError('signup-err', 'Please enter your name.'); return; }
        if (pass.length < 6) { showError('signup-err', 'Password must be at least 6 characters.'); return; }
        if (pass !== confirm) { showError('signup-err', 'Passwords do not match.'); return; }
        setLoading('signup-btn', true);
        try {
            await registerWithEmail(email, pass, name);
            closeModal();
        } catch (e) {
            showError('signup-err', friendlyError(e.code));
        } finally { setLoading('signup-btn', false); }
    });

    document.getElementById('signup-google').addEventListener('click', async () => {
        showError('signup-err', '');
        try { await loginWithGoogle(); closeModal(); }
        catch (e) { showError('signup-err', friendlyError(e.code)); }
    });

    // --- Forgot Password ---
    document.getElementById('forgot-btn').addEventListener('click', async () => {
        const email = document.getElementById('forgot-email').value.trim();
        showError('forgot-err', '');
        setLoading('forgot-btn', true);
        try {
            await sendPasswordReset(email);
            showError('forgot-err', '');
            document.getElementById('forgot-btn').textContent = '✓ Email sent!';
            document.getElementById('forgot-btn').style.background = 'var(--accent-green)';
        } catch (e) {
            showError('forgot-err', friendlyError(e.code));
        } finally { document.getElementById('forgot-btn').disabled = false; }
    });

    // Focus first field
    setTimeout(() => {
        root.querySelector('.auth-panel.active input')?.focus();
    }, 100);
}

function friendlyError(code) {
    const map = {
        'auth/user-not-found':       'No account found with this email.',
        'auth/wrong-password':       'Incorrect password.',
        'auth/invalid-credential':   'Invalid email or password.',
        'auth/email-already-in-use': 'This email is already registered.',
        'auth/weak-password':        'Password must be at least 6 characters.',
        'auth/invalid-email':        'Please enter a valid email address.',
        'auth/too-many-requests':    'Too many attempts. Please try again later.',
        'auth/popup-closed-by-user': 'Sign-in was cancelled.',
        'auth/network-request-failed': 'Network error. Check your connection.',
    };
    return map[code] || 'Something went wrong. Please try again.';
}
/* UDYAM SARTHI Login Page View */
import { renderPublicNavbar } from '../../components/Navbar.js';
import { renderPublicFooter } from '../../components/Footer.js';
import { getIcon } from '../../components/IconLibrary.js';
import { authService } from '../../services/authService.js';

export const LoginView = () => {
  setTimeout(() => {
    const form = document.getElementById('login-form');
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const togglePassBtn = document.getElementById('toggle-password-btn');
    const errorBox = document.getElementById('login-error');
    const submitBtn = document.getElementById('login-submit-btn');

    if (togglePassBtn) {
      togglePassBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
      });
    }

    // Demo Fill Buttons
    document.querySelectorAll('.demo-fill-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const email = e.currentTarget.dataset.email;
        if (emailInput) emailInput.value = email;
        if (passwordInput) passwordInput.value = 'demo123';
      });
    });

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorBox.style.display = 'none';
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Logging in...</span>`;

        try {
          await authService.login(emailInput.value, passwordInput.value);
          window.location.hash = '#/dashboard';
        } catch (err) {
          errorBox.textContent = err.message;
          errorBox.style.display = 'block';
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Login to Udyam Sarthi</span> ${getIcon('chevronRight', 18)}`;
        }
      });
    }
  }, 0);

  return `
    ${renderPublicNavbar('/login')}

    <div class="container" style="padding: 4rem 1.5rem; min-height: calc(100vh - 200px); display: flex; align-items: center; justify-content: center;">
      <div class="glass-card" style="width: 100%; max-width: 440px; padding: 2.5rem;">
        <div class="text-center mb-6">
          <div class="brand-icon" style="margin: 0 auto 1rem; width: 48px; height: 48px;">
            ${getIcon('sparkles', 26)}
          </div>
          <h2 class="text-2xl font-bold mb-1">Welcome Back</h2>
          <p class="text-xs text-muted">Sign in to your MSME digital business companion</p>
        </div>

        <div id="login-error" class="form-error mb-4" style="display: none; padding: 0.75rem; background: var(--danger-bg); border-radius: var(--radius-sm); border: 1px solid var(--danger);"></div>

        <form id="login-form">
          <div class="form-group">
            <label class="form-label" for="login-email">Email Address</label>
            <input type="email" id="login-email" class="form-input" placeholder="rajesh@abccoating.com" required value="rajesh@abccoating.com" />
          </div>

          <div class="form-group">
            <div class="flex items-center justify-between mb-1">
              <label class="form-label" for="login-password">Password</label>
              <a href="#/login" class="text-xs text-muted">Forgot?</a>
            </div>
            <div style="position: relative;">
              <input type="password" id="login-password" class="form-input" placeholder="••••••••" required value="demo123" />
              <button type="button" id="toggle-password-btn" class="btn-icon" style="position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%); color: var(--text-dim);">
                ${getIcon('info', 16)}
              </button>
            </div>
          </div>

          <button type="submit" id="login-submit-btn" class="btn btn-primary w-full mt-2">
            <span>Login to Udyam Sarthi</span>
            ${getIcon('chevronRight', 18)}
          </button>
        </form>

        <div style="margin-top: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 1.25rem;">
          <span class="text-xs text-muted display-block mb-2 text-center">Quick Prototype Auto-Fill:</span>
          <button class="btn btn-secondary btn-sm w-full demo-fill-btn mb-2" data-email="rajesh@abccoating.com">
            Login as Demo MSME (ABC Coating)
          </button>
        </div>

        <div class="text-center mt-6 text-xs text-muted">
          Don't have a business profile? <a href="#/register" class="text-primary font-semibold">Register here</a>
        </div>
      </div>
    </div>

    ${renderPublicFooter()}
  `;
};
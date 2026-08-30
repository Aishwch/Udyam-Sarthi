/* UDYAM SARTHI Register Page View */
import { renderPublicNavbar } from '../../components/Navbar.js';
import { renderPublicFooter } from '../../components/Footer.js';
import { getIcon } from '../../components/IconLibrary.js';
import { authService } from '../../services/authService.js';

export const RegisterView = () => {
  setTimeout(() => {
    const form = document.getElementById('register-form');
    const errorBox = document.getElementById('register-error');
    const submitBtn = document.getElementById('register-submit-btn');

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorBox.style.display = 'none';

        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const confirmPass = document.getElementById('reg-confirm').value;

        if (password !== confirmPass) {
          errorBox.textContent = "Passwords do not match!";
          errorBox.style.display = 'block';
          return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Creating Account...</span>`;

        try {
          await authService.register(name, email, password);
          window.location.hash = '#/onboarding';
        } catch (err) {
          errorBox.textContent = err.message;
          errorBox.style.display = 'block';
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Continue to Onboarding</span> ${getIcon('chevronRight', 18)}`;
        }
      });
    }
  }, 0);

  return `
    ${renderPublicNavbar('/register')}

    <div class="container" style="padding: 4rem 1.5rem; min-height: calc(100vh - 200px); display: flex; align-items: center; justify-content: center;">
      <div class="glass-card" style="width: 100%; max-width: 480px; padding: 2.5rem;">
        <div class="text-center mb-6">
          <div class="brand-icon" style="margin: 0 auto 1rem; width: 48px; height: 48px;">
            ${getIcon('sparkles', 26)}
          </div>
          <h2 class="text-2xl font-bold mb-1">Create Your MSME Profile</h2>
          <p class="text-xs text-muted">Get started with Udyam Sarthi digital companion</p>
        </div>

        <div id="register-error" class="form-error mb-4" style="display: none; padding: 0.75rem; background: var(--danger-bg); border-radius: var(--radius-sm); border: 1px solid var(--danger);"></div>

        <form id="register-form">
          <div class="form-group">
            <label class="form-label" for="reg-name">Full Name / MSME Representative</label>
            <input type="text" id="reg-name" class="form-input" placeholder="e.g. Rajesh Sharma" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="reg-email">Business Email</label>
            <input type="email" id="reg-email" class="form-input" placeholder="e.g. rajesh@abccoating.com" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="reg-password">Password</label>
            <input type="password" id="reg-password" class="form-input" placeholder="Minimum 6 characters" required minlength="6" />
          </div>

          <div class="form-group">
            <label class="form-label" for="reg-confirm">Confirm Password</label>
            <input type="password" id="reg-confirm" class="form-input" placeholder="Re-enter password" required />
          </div>

          <button type="submit" id="register-submit-btn" class="btn btn-primary w-full mt-2">
            <span>Continue to Onboarding</span>
            ${getIcon('chevronRight', 18)}
          </button>
        </form>

        <div class="text-center mt-6 text-xs text-muted">
          Already registered? <a href="#/login" class="text-primary font-semibold">Login here</a>
        </div>
      </div>
    </div>

    ${renderPublicFooter()}
  `;
};
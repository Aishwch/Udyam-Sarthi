/* UDYAM SARTHI Public Website Navigation Component */
import { getIcon } from './IconLibrary.js';

export const renderPublicNavbar = (activePath = '/') => {
  return `
    <nav class="public-nav">
      <div class="container public-nav-container">
        <a href="#/" class="brand-logo">
          <div class="brand-icon">
            ${getIcon('sparkles', 22)}
          </div>
          <span>UDYAM SARTHI</span>
        </a>

        <ul class="nav-links">
          <li><a href="#/" class="nav-link ${activePath === '/' ? 'active' : ''}">Home</a></li>
          <li><a href="#/about" class="nav-link ${activePath === '/about' ? 'active' : ''}">About</a></li>
          <li><a href="#/features" class="nav-link ${activePath === '/features' ? 'active' : ''}">Features</a></li>
          <li><a href="#/how-it-works" class="nav-link ${activePath === '/how-it-works' ? 'active' : ''}">How It Works</a></li>
          <li><a href="#/sdg" class="nav-link ${activePath === '/sdg' ? 'active' : ''}">SDG Alignment</a></li>
        </ul>

        <div class="flex items-center gap-3">
          <a href="#/login" class="btn btn-secondary btn-sm">Login</a>
          <a href="#/register" class="btn btn-primary btn-sm">Get Started</a>
        </div>
      </div>
    </nav>
  `;
};

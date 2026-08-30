/* UDYAM SARTHI Client-Side Hash Router with Auth Guards */
import { store } from './store.js';

// Import Public Views
import { HomeView } from './views/public/HomeView.js';
import { LoginView } from './views/public/LoginView.js';
import { RegisterView } from './views/public/RegisterView.js';
import { OnboardingView } from './views/public/OnboardingView.js';

// Import Private Views
import { DashboardView } from './views/private/DashboardView.js';
import { BusinessView } from './views/private/BusinessView.js';
import { MachinesView } from './views/private/MachinesView.js';
import { OperationsView } from './views/private/OperationsView.js';
import { AnalyticsView } from './views/private/AnalyticsView.js';
import { PredictionsView } from './views/private/PredictionsView.js';
import { AlertsView } from './views/private/AlertsView.js';
import { DiagnosisView } from './views/private/DiagnosisView.js';
import { AssistantView } from './views/private/AssistantView.js';
import { GrowthView } from './views/private/GrowthView.js';
import { SymbiosisView } from './views/private/SymbiosisView.js';
import { MarketplaceView } from './views/private/MarketplaceView.js';
import { SchemesView } from './views/private/SchemesView.js';
import { ReportsView } from './views/private/ReportsView.js';
import { SettingsView } from './views/private/SettingsView.js';
import { AdminView } from './views/private/AdminView.js';

const routes = {
  '/': HomeView,
  '/about': HomeView,
  '/features': HomeView,
  '/how-it-works': HomeView,
  '/sdg': HomeView,
  '/login': LoginView,
  '/register': RegisterView,
  '/onboarding': OnboardingView,

  '/dashboard': DashboardView,
  '/business': BusinessView,
  '/machines': MachinesView,
  '/operations': OperationsView,
  '/analytics': AnalyticsView,
  '/predictions': PredictionsView,
  '/alerts': AlertsView,
  '/diagnosis': DiagnosisView,
  '/assistant': AssistantView,
  '/growth': GrowthView,
  '/symbiosis': SymbiosisView,
  '/marketplace': MarketplaceView,
  '/schemes': SchemesView,
  '/reports': ReportsView,
  '/settings': SettingsView,
  '/admin': AdminView
};

export const handleRoute = () => {
  const hash = window.location.hash.slice(1) || '/';
  const cleanPath = hash.split('?')[0];

  const viewFn = routes[cleanPath] || HomeView;
  const appContainer = document.getElementById('app');

  if (appContainer) {
    appContainer.innerHTML = viewFn();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Handle smooth scrolling for anchor sections on public home page
    if (cleanPath === '/about' || cleanPath === '/features' || cleanPath === '/how-it-works' || cleanPath === '/sdg') {
      setTimeout(() => {
        const sectionId = cleanPath.slice(1);
        const section = document.getElementById(sectionId);
        if (section) section.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }

  // Attach global dynamic event handlers (Logout, Mobile Sidebar, Theme Toggle)
  setTimeout(() => {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        store.logout();
        window.location.hash = '#/login';
      });
    }

    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        store.toggleTheme();
      });
    }

    const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('app-sidebar');
    if (mobileMenuBtn && sidebar) {
      mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
      });
    }
  }, 50);
};

export const initRouter = () => {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
};
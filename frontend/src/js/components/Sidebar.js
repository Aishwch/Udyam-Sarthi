/* UDYAM SARTHI Private Application Sidebar Component */
import { store } from '../store.js';
import { getIcon } from './IconLibrary.js';

export const renderSidebar = (activePath = '/dashboard') => {
  const { user, business, alerts } = store.getState();
  const unackAlertsCount = alerts.filter(a => !a.acknowledged).length;

  const navItems = [
    { section: 'CORE PLATFORM' },
    { path: '/dashboard', label: 'Dashboard', icon: 'layoutDashboard' },
    { path: '/business', label: 'Business Profile', icon: 'factory' },
    { path: '/machines', label: 'Machine Management', icon: 'cpu' },
    { path: '/operations', label: 'Daily Operations', icon: 'clipboardList' },

    { section: 'ANALYTICS & INTELLIGENCE' },
    { path: '/analytics', label: 'Analytics & Trends', icon: 'barChart3' },
    { path: '/predictions', label: 'Predictive Insights', icon: 'trendingUp' },
    { path: '/alerts', label: 'Alerts & Anomalies', icon: 'alertTriangle', badge: unackAlertsCount },
    { path: '/diagnosis', label: 'Performance Diagnosis', icon: 'helpCircle' },
    { path: '/assistant', label: 'AI Assistant', icon: 'bot' },

    { section: 'GROWTH & ECOSYSTEM' },
    { path: '/growth', label: 'Growth Opportunities', icon: 'zap' },
    { path: '/symbiosis', label: 'Industrial Symbiosis', icon: 'recycle' },
    { path: '/marketplace', label: 'Material Marketplace', icon: 'store' },
    { path: '/schemes', label: 'Government Schemes', icon: 'award' },

    { section: 'SYSTEM & TOOLS' },
    { path: '/reports', label: 'Reports & Export', icon: 'fileText' },
    { path: '/settings', label: 'Settings', icon: 'settings' },
    { path: '/admin', label: 'Admin Overview', icon: 'shield' }
  ];

  const navHtml = navItems.map(item => {
    if (item.section) {
      return `<div class="sidebar-section-title">${item.section}</div>`;
    }
    const isActive = activePath === item.path || (item.path !== '/' && activePath.startsWith(item.path));
    return `
      <a href="#${item.path}" class="sidebar-link ${isActive ? 'active' : ''}">
        ${getIcon(item.icon, 18)}
        <span>${item.label}</span>
        ${item.badge ? `<span class="badge-count">${item.badge}</span>` : ''}
      </a>
    `;
  }).join('');

  return `
    <aside class="app-sidebar" id="app-sidebar">
      <div class="sidebar-header">
        <a href="#/dashboard" class="brand-logo">
          <div class="brand-icon">
            ${getIcon('sparkles', 20)}
          </div>
          <span style="font-size: 1.1rem;">UDYAM SARTHI</span>
        </a>
      </div>

      <nav class="sidebar-nav">
        ${navHtml}
      </nav>

      <div class="sidebar-footer">
        <div class="user-profile-badge">
          <div class="user-avatar">${user.name.charAt(0)}</div>
          <div style="overflow: hidden; flex: 1;">
            <div style="font-size: 0.8125rem; font-weight: 600; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${user.name}</div>
            <div style="font-size: 0.7rem; color: var(--text-muted); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${business.name}</div>
          </div>
          <button class="btn-icon" id="logout-btn" title="Logout">
            ${getIcon('logout', 16)}
          </button>
        </div>
      </div>
    </aside>
  `;
};
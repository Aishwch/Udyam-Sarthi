/* UDYAM SARTHI Dynamic Breadcrumb Component */
import { getIcon } from './IconLibrary.js';

const ROUTE_NAME_MAP = {
  '/dashboard': { parent: 'Platform', name: 'Dashboard' },
  '/business': { parent: 'Platform', name: 'Business Profile' },
  '/machines': { parent: 'Platform', name: 'Machine Management' },
  '/operations': { parent: 'Platform', name: 'Daily Operations' },
  '/analytics': { parent: 'Analytics & AI', name: 'Analytics & Trends' },
  '/predictions': { parent: 'Analytics & AI', name: 'Predictive Insights' },
  '/alerts': { parent: 'Analytics & AI', name: 'Smart Alerts' },
  '/diagnosis': { parent: 'Analytics & AI', name: 'Performance Diagnosis' },
  '/assistant': { parent: 'Analytics & AI', name: 'AI Assistant' },
  '/growth': { parent: 'Ecosystem', name: 'Growth Opportunities' },
  '/symbiosis': { parent: 'Ecosystem', name: 'Industrial Symbiosis' },
  '/marketplace': { parent: 'Ecosystem', name: 'Scrap Marketplace' },
  '/schemes': { parent: 'Ecosystem', name: 'Government Schemes' },
  '/reports': { parent: 'Tools', name: 'Reports & Export' },
  '/settings': { parent: 'Tools', name: 'Settings' },
  '/admin': { parent: 'System', name: 'Admin Overview' }
};

export const renderBreadcrumb = (currentPath = '/dashboard') => {
  const info = ROUTE_NAME_MAP[currentPath] || { parent: 'Platform', name: 'Overview' };

  return `
    <nav class="breadcrumb-nav flex items-center gap-1.5 text-xs text-muted">
      <a href="#/dashboard" class="flex items-center gap-1 hover:text-primary transition-colors">
        ${getIcon('layoutDashboard', 14)}
        <span>Home</span>
      </a>
      <span class="text-dim">${getIcon('chevronRight', 12)}</span>
      <span class="text-dim">${info.parent}</span>
      <span class="text-dim">${getIcon('chevronRight', 12)}</span>
      <span class="text-main font-semibold">${info.name}</span>
    </nav>
  `;
};

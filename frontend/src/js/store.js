/* UDYAM SARTHI Central Reactive Store */

import {
  INITIAL_BUSINESS_PROFILE,
  INITIAL_MACHINES,
  INITIAL_OPERATIONS_LOGS,
  INITIAL_ALERTS,
  INITIAL_GROWTH_OPPORTUNITIES,
  INITIAL_SYMBIOSIS_MATCHES,
  INITIAL_MARKETPLACE_LISTINGS
} from './data/mockData.js';

const STORAGE_KEY = 'UDYAM_SARTHI_STATE_V1';

const getInitialState = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to parse stored state, initializing defaults.", e);
    }
  }

  return {
    isAuthenticated: true, // Prototype defaults logged in as MSME Owner
    theme: 'dark',
    user: {
      id: 'usr-901',
      name: 'Rajesh Sharma',
      email: 'rajesh@abccoating.com',
      role: 'MSME Owner / Plant Manager'
    },
    business: INITIAL_BUSINESS_PROFILE,
    machines: INITIAL_MACHINES,
    operations: INITIAL_OPERATIONS_LOGS,
    alerts: INITIAL_ALERTS,
    growthOpportunities: INITIAL_GROWTH_OPPORTUNITIES,
    symbiosisMatches: INITIAL_SYMBIOSIS_MATCHES,
    marketplaceListings: INITIAL_MARKETPLACE_LISTINGS,
    chatMessages: [
      {
        id: 'msg-1',
        sender: 'ai',
        text: 'Hello Rajesh! I am **Udyam Sarthi**, your digital business companion. I have reviewed your plant operations for Machine A, B, and C. How can I help optimize your production today?',
        timestamp: new Date().toISOString()
      }
    ],
    toasts: []
  };
};

class Store {
  constructor() {
    this.state = getInitialState();
    this.listeners = [];
  }

  getState() {
    return this.state;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.saveState();
    this.notify();
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error("Failed to save state to localStorage", e);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  /* Actions */
  login(userEmail, password) {
    this.setState({
      isAuthenticated: true,
      user: {
        id: 'usr-901',
        name: userEmail.split('@')[0].toUpperCase() || 'MSME Owner',
        email: userEmail,
        role: 'MSME Owner'
      }
    });
    this.addToast('Logged in successfully', 'success');
  }

  logout() {
    this.setState({
      isAuthenticated: false
    });
    this.addToast('Logged out of Udyam Sarthi', 'info');
  }

  updateBusinessProfile(updatedProfile) {
    this.setState({
      business: { ...this.state.business, ...updatedProfile }
    });
    this.addToast('Business profile updated', 'success');
  }

  addMachine(newMachine) {
    const machine = {
      id: `m-${Date.now()}`,
      ...newMachine
    };
    this.setState({
      machines: [machine, ...this.state.machines]
    });
    this.addToast(`Added machine: ${machine.name}`, 'success');
  }

  addOperationLog(newLog) {
    const log = {
      id: `op-${Date.now()}`,
      ...newLog
    };
    
    // Auto calculate variance or check alert conditions
    const updatedOps = [log, ...this.state.operations];
    this.setState({ operations: updatedOps });
    this.addToast(`Recorded operational data for ${log.machineName}`, 'success');
  }

  acknowledgeAlert(alertId) {
    const updatedAlerts = this.state.alerts.map(alt =>
      alt.id === alertId ? { ...alt, acknowledged: true } : alt
    );
    this.setState({ alerts: updatedAlerts });
    this.addToast('Alert acknowledged', 'info');
  }

  addChatMessage(text, sender = 'user') {
    const msg = {
      id: `msg-${Date.now()}`,
      sender,
      text,
      timestamp: new Date().toISOString()
    };
    this.setState({
      chatMessages: [...this.state.chatMessages, msg]
    });
  }

  addMarketplaceListing(newListing) {
    const item = {
      id: `mkt-${Date.now()}`,
      seller: this.state.business.name,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'Active',
      ...newListing
    };
    this.setState({
      marketplaceListings: [item, ...this.state.marketplaceListings]
    });
    this.addToast('Scrap listing published to marketplace', 'success');
  }

  toggleTheme() {
    const newTheme = this.state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    this.setState({ theme: newTheme });
  }

  addToast(message, type = 'info') {
    const toast = { id: `toast-${Date.now()}`, message, type };
    this.setState({ toasts: [...this.state.toasts, toast] });

    setTimeout(() => {
      this.setState({
        toasts: this.state.toasts.filter(t => t.id !== toast.id)
      });
    }, 3500);
  }

  resetDemoData() {
    localStorage.removeItem(STORAGE_KEY);
    this.state = getInitialState();
    this.saveState();
    this.notify();
    this.addToast('Demo state reset to initial defaults', 'info');
  }
}

export const store = new Store();
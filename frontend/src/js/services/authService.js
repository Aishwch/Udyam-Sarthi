/* UDYAM SARTHI Authentication Service Layer */
import { store } from '../store.js';

export const authService = {
  login: async (email, password) => {
    // Mock login simulation
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email || !password) {
          reject(new Error("Please enter both email and password"));
          return;
        }
        if (password.length < 4) {
          reject(new Error("Password must be at least 4 characters"));
          return;
        }
        store.login(email, password);
        resolve({ success: true, email });
      }, 400);
    });
  },

  register: async (fullName, email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!fullName || !email || !password) {
          reject(new Error("All fields are required"));
          return;
        }
        store.login(email, password);
        resolve({ success: true, email });
      }, 400);
    });
  },

  logout: () => {
    store.logout();
  },

  isAuthenticated: () => {
    return store.getState().isAuthenticated;
  },

  getCurrentUser: () => {
    return store.getState().user;
  }
};

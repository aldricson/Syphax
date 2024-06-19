// role: MobX store for managing authentication state, including user information and token management.

import { makeObservable, observable, action, runInAction } from 'mobx';

class AuthStore {
  token = localStorage.getItem('SyphaxToken') || null; // Initialize token from localStorage if available
  user = JSON.parse(localStorage.getItem('SyphaxUser')) || null; // Initialize user from localStorage if available
  stayLogged = localStorage.getItem('SyphaxStayLogged') === 'true'; // Initialize stayLogged from localStorage if available

  constructor() {
    makeObservable(this, {
      token: observable, // Make the token property observable
      user: observable, // Make the user property observable
      stayLogged: observable, // Make the stayLogged property observable
      setToken: action, // Make the setToken method an action
      setUser: action, // Make the setUser method an action
      setStayLogged: action, // Make the setStayLogged method an action
      logout: action, // Make the logout method an action
      checkAuth: action, // Make the checkAuth method an action
      checkAuthAndRedirect: action, // Make the checkAuthAndRedirect method an action
    });
    this.checkAuth(); // Check authentication status on initialization
  }

  /**
   * Sets the authentication token.
   * 
   * If a token is provided, it is stored in both the state and localStorage.
   * If no token is provided, the token is removed from both the state and localStorage.
   * 
   * @param {string|null} token - The authentication token.
   */
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('SyphaxToken', token); // Store token in localStorage
    } else {
      localStorage.removeItem('SyphaxToken'); // Remove token from localStorage
    }
  }

  /**
   * Sets the user information.
   * 
   * Updates the user state with the provided user information.
   * 
   * @param {object|null} user - The user information.
   */
  setUser(user) {
    this.user = user;
    if (user) {
      localStorage.setItem('SyphaxUser', JSON.stringify(user)); // Store user in localStorage
    } else {
      localStorage.removeItem('SyphaxUser'); // Remove user from localStorage
    }
  }

  /**
   * Sets the stayLogged flag.
   * 
   * Updates the stayLogged state with the provided flag.
   * 
   * @param {boolean} stayLogged - The stayLogged flag.
   */
  setStayLogged(stayLogged) {
    this.stayLogged = stayLogged;
    localStorage.setItem('SyphaxStayLogged', stayLogged); // Store stayLogged flag in localStorage
  }

  /**
   * Logs out the user.
   * 
   * Clears the authentication token and user information from the state and localStorage.
   */
  logout() {
    this.setToken(null); // Clear token
    this.setUser(null); // Clear user information
    localStorage.removeItem('SyphaxStayLogged'); // Remove stayLogged flag from localStorage
  }

  /**
   * Checks the authentication status on page load.
   * 
   * Retrieves the token from localStorage, validates it with the backend,
   * and updates the state accordingly.
   */
  async checkAuth() {
    const token = localStorage.getItem('SyphaxToken');
    if (token) {
      try {
        const response = await fetch('http://localhost:5010/api/auth/verifyToken', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Token validation failed');
        }
        const data = await response.json();
        runInAction(() => {
          this.setToken(token);
          this.setUser(data.user);
        });
      } catch (error) {
        console.error('Token validation error', error);
        runInAction(() => {
          this.logout();
        });
      }
    }
  }

  /**
   * Checks the authentication status and redirects to the login page if not authenticated.
   */
  async checkAuthAndRedirect() {
    await this.checkAuth();
    if (!this.token) {
      window.location.href = '/login'; // Redirect to login page
    }
  }
}

const authStore = new AuthStore();
export default authStore;

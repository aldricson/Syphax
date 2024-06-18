// role: MobX store for managing authentication state, including user information and token management.

import { makeObservable, observable, action } from 'mobx'; // Import MobX functions for creating observable state and actions

/**
 * AuthStore class.
 * 
 * This class manages the authentication state, including the user token and user information.
 * It provides actions to set the token, set the user, and log out the user.
 */
class AuthStore {
  // Observable property to store the authentication token
  token = localStorage.getItem('SyphaxToken') || null;
  // Observable property to store the user information
  user = null;

  /**
   * Constructor for AuthStore.
   * 
   * Makes the properties and methods observable and actionable using MobX.
   */
  constructor() {
    makeObservable(this, {
      token: observable, // Make the token property observable
      user: observable, // Make the user property observable
      setToken: action, // Make the setToken method an action
      setUser: action, // Make the setUser method an action
      logout: action, // Make the logout method an action
    });
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
    this.token = token; // Update the token state
    if (token) {
      localStorage.setItem('SyphaxToken', token); // Store the token in localStorage if provided
    } else {
      localStorage.removeItem('SyphaxToken'); // Remove the token from localStorage if null
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
    this.user = user; // Update the user state
  }

  /**
   * Logs out the user.
   * 
   * Clears the authentication token and user information from the state and localStorage.
   */
  logout() {
    this.setToken(null); // Clear the token
    this.setUser(null); // Clear the user information
  }
}

// Create an instance of AuthStore
const authStore = new AuthStore();
export default authStore; // Export the instance for use in other parts of the application

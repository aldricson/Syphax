// role: MobX store for managing the login state, including user email, password, and login status.

import { makeObservable, observable, action, runInAction } from 'mobx'; // Import MobX functions for creating observable state and actions
import { login } from '../apis/authApi'; // Import the login function from the API
import authStore from './authStore'; // Import the authentication store

/**
 * LoginStore class.
 * 
 * This class manages the login state, including the user's email, password, and login status.
 * It provides actions to handle changes in email and password, submit the login form, and manage the "stay logged in" option.
 */
export class LoginStore {
  stayLogged = false; // Observable property to store the "stay logged in" status
  loginSucces = false; // Observable property to store the login success status
  stayLoggedAsText = 'No'; // Observable property to store the "stay logged in" status as text
  userEmail = ''; // Observable property to store the user's email
  userPasssword = ''; // Observable property to store the user's password
  errorText = ''; // Observable property to store the error message
  errorBorder = '0px'; // Observable property to store the error border style

  /**
   * Constructor for LoginStore.
   * 
   * Makes the properties and methods observable and actionable using MobX.
   */
  constructor() {
    makeObservable(this, {
      stayLogged: observable, // Make the stayLogged property observable
      stayLoggedAsText: observable, // Make the stayLoggedAsText property observable
      userEmail: observable, // Make the userEmail property observable
      userPasssword: observable, // Make the userPasssword property observable
      errorText: observable, // Make the errorText property observable
      errorBorder: observable, // Make the errorBorder property observable
      loginSucces: observable, // Make the loginSucces property observable
      onUserEmailChanged: action, // Make the onUserEmailChanged method an action
      onPasswordChanged: action, // Make the onPasswordChanged method an action
      onHandleStayLogged: action, // Make the onHandleStayLogged method an action
      onSubmitLogin: action, // Make the onSubmitLogin method an action
    });
  }

  /**
   * Handles changes to the user email input field.
   * 
   * Updates the userEmail property with the new value from the input field.
   * 
   * @param {object} event - The event object from the input field.
   */
  onUserEmailChanged = (event) => {
    this.userEmail = event.target.value; // Update the userEmail state with the input value
  };

  /**
   * Handles changes to the user password input field.
   * 
   * Updates the userPasssword property with the new value from the input field.
   * 
   * @param {object} event - The event object from the input field.
   */
  onPasswordChanged = (event) => {
    this.userPasssword = event.target.value; // Update the userPasssword state with the input value
  };

  /**
   * Handles the submission of the login form.
   * 
   * Sends the login request to the server and updates the authentication state upon success.
   * Updates the error state if the login request fails.
   */
  onSubmitLogin = async () => {
    try {
      const response = await login(this.userEmail, this.userPasssword, this.stayLogged); // Send login request
      const data = response.auth; // Correctly access the auth object
      runInAction(() => {
        authStore.setToken(data.accessToken); // Set the authentication token in the authStore
        authStore.setUser(data.user); // Set the user information in the authStore
        if (this.stayLogged) {
          localStorage.setItem('SyphaxToken', data.accessToken); // Store the token in localStorage if "stay logged in" is checked
        }
        this.errorText = ''; // Clear the error text
        this.errorBorder = '0px'; // Reset the error border style
        this.loginSucces = true; // Set the login success status to true
      });
    } catch (error) {
      runInAction(() => {
        this.errorText = 'Login Failed !'; // Set the error text to "Login Failed !"
        this.errorBorder = '1px solid red'; // Set the error border style
        this.loginSucces = false; // Set the login success status to false
      });
      console.error('Login failed', error); // Log the error to the console
    }
  };

  /**
   * Handles changes to the "stay logged in" checkbox.
   * 
   * Updates the stayLogged and stayLoggedAsText properties based on the checkbox status.
   * 
   * @param {object} event - The event object from the checkbox.
   */
  onHandleStayLogged = (event) => {
    this.stayLogged = event.target.checked; // Update the stayLogged state with the checkbox status
    this.stayLogged ? (this.stayLoggedAsText = 'Yes') : (this.stayLoggedAsText = 'No'); // Update the stayLoggedAsText state based on the checkbox status
    console.log('enter on handleStayLogged:' + this.stayLogged); // Log the stayLogged status to the console
  };
}

// Create an instance of LoginStore
export const loginStore = new LoginStore();

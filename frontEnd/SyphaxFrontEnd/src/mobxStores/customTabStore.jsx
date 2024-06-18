// role: MobX store for managing the state of a custom tab component, including the index of the currently selected tab.

import { makeObservable, observable, action } from 'mobx'; // Import MobX functions for creating observable state and actions

/**
 * CustomTabStore class.
 * 
 * This class manages the state of a custom tab component, specifically the index of the currently selected tab.
 * It provides an action to update the selected tab index.
 */
class CustomTabStore {
  // Observable property to store the index of the currently selected tab
  value = 0;

  /**
   * Constructor for CustomTabStore.
   * 
   * Makes the properties and methods observable and actionable using MobX.
   */
  constructor() {
    makeObservable(this, {
      value: observable, // Make the value property observable
      setValue: action, // Make the setValue method an action
    });
  }

  /**
   * Sets the index of the selected tab.
   * 
   * Updates the value property with the new tab index.
   * 
   * @param {number} newValue - The index of the newly selected tab.
   */
  setValue(newValue) {
    this.value = newValue; // Update the value state with the new tab index
  }
}

// Create an instance of CustomTabStore and export it for use in other parts of the application
const tabStore = new CustomTabStore();
export default tabStore;

// role: MobX store for managing the state of the dashboard, including the index of the currently selected tab.

import { makeObservable, observable, action } from 'mobx'; // Import MobX functions for creating observable state and actions

/**
 * DashBoardStore class.
 * 
 * This class manages the state of the dashboard, specifically the index of the currently selected tab.
 * It provides an action to handle changes to the selected tab.
 */
export class DashBoardStore {
  // Observable property to store the index of the currently selected tab
  tabSheetIndex = 0;

  /**
   * Constructor for DashBoardStore.
   * 
   * Makes the properties and methods observable and actionable using MobX.
   */
  constructor() {
    makeObservable(this, {
      tabSheetIndex: observable, // Make the tabSheetIndex property observable
      onHandleDashBoardTabsheetChanged: action // Make the onHandleDashBoardTabsheetChanged method an action
    });
  }

  /**
   * Handles changes to the selected tab.
   * 
   * Updates the tabSheetIndex property with the new value from the tab change event.
   * 
   * @param {object} event - The event object from the tab change.
   * @param {number} newValue - The index of the newly selected tab.
   */
  onHandleDashBoardTabsheetChanged = (event, newValue) => {
    this.tabSheetIndex = newValue; // Update the tabSheetIndex state with the new tab index
  };
}

// Create an instance of DashBoardStore and export it for use in other parts of the application
export const dashBoardStore = new DashBoardStore();

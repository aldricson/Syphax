// role: MobX store for managing the state of a simple LED component, including on and off colors, on or off LED state, and blink functionality.

// Import necessary functions from MobX
import { makeObservable, observable, action, runInAction } from 'mobx';

/**
 * SimpleLedStore class.
 * 
 * This class manages the state of an LED, including its on/off status and colors.
 */
class SimpleLedStore {
  // Observable properties for LED state and colors
  isOn = false; // Indicates whether the LED is on or off
  onColor = '#00FF00'; // Default on color (green)
  offColor = '#FF0000'; // Default off color (red)

  /**
   * Constructor for SimpleLedStore.
   * 
   * Makes the properties and methods observable and actionable using MobX.
   */
  constructor() {
    makeObservable(this, {
      isOn: observable, // Makes the isOn property observable
      onColor: observable, // Makes the onColor property observable
      offColor: observable, // Makes the offColor property observable
      toggleLed: action, // Makes the toggleLed method an action
      setOnColor: action, // Makes the setOnColor method an action
      setOffColor: action, // Makes the setOffColor method an action
      blink: action.bound, // Makes the blink method an action and binds it to the instance
    });
  }

  /**
   * Toggles the on/off state of the LED.
   */
  toggleLed = () => {
    this.isOn = !this.isOn; // Toggles the isOn state between true and false
  };

  /**
   * Sets the on color of the LED.
   * 
   * @param {string} color - The new on color.
   */
  setOnColor = (color) => {
    this.onColor = color; // Sets the onColor to the provided color
  };

  /**
   * Sets the off color of the LED.
   * 
   * @param {string} color - The new off color.
   */
  setOffColor = (color) => {
    this.offColor = color; // Sets the offColor to the provided color
  };

  /**
   * Blinks the LED.
   * 
   * If the LED is on, it turns it off. Then it turns the LED on, waits for 500 milliseconds, and turns it off again.
   */
  blink = () => {
    if (this.isOn) { // Checks if the LED is currently on
      this.isOn = false; // Turns the LED off if it is currently on
    }
    this.isOn = true; // Turns the LED on
    setTimeout(() => { // Waits for 500 milliseconds before turning the LED off
      runInAction(() => {
        this.isOn = false; // Turns the LED off
      });
    }, 500); // 500 milliseconds delay
  };
}

// Create an instance of SimpleLedStore and export it for use in other parts of the application
const newDataLedStore = new SimpleLedStore();
export default newDataLedStore;

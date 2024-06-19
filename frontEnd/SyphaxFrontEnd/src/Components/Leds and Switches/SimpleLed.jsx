// role: Provides a simple LED component that changes color based on its state, including a blink functionality.

// Import the observer function from MobX to create an observer component
import { observer } from 'mobx-react';
// Import the MobX store for the SimpleLed component
import newDataLedStore from '../../mobxStores/simpleLedStore.jsx';
// Import the stylesheet for the SimpleLed component
import '../../assets/styleSheets/simpleLed.css';

/**
 * Led component.
 * 
 * This functional component renders an LED with customizable on and off colors.
 * It observes the state from the ledStore to manage the on/off status and colors.
 * 
 * @returns {JSX.Element} The rendered LED component.
 */
const SimpleLed = observer(() => {
  // Define the style for the LED, which changes based on its on/off state
  const ledStyle = {
    backgroundColor: newDataLedStore.isOn ? newDataLedStore.onColor : newDataLedStore.offColor, // Set the background color based on the LED state
    boxShadow: newDataLedStore.isOn 
      ? `0 0 10px ${newDataLedStore.onColor}, 0 0 20px ${newDataLedStore.onColor}` // Set the box-shadow if the LED is on
      : `0 0 10px ${newDataLedStore.offColor}, 0 0 20px ${newDataLedStore.offColor}`, // Set the box-shadow if the LED is off
  };

  // Return the JSX structure for the LED component
  return (
    <div className="led-container"> {/* Container for the LED component */}
      <div className="led-box"> {/* Box containing the LED and its label */}
        <div className="led" style={ledStyle} onClick={newDataLedStore.blink}></div> {/* LED element with the blink function on click */}
        <p>{newDataLedStore.isOn ? 'ON' : 'OFF'}</p> {/* Label indicating the LED state */}
      </div>
    </div>
  );
});

// Export the SimpleLed component as the default export
export default SimpleLed;

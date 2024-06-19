// role: Main application component that handles the conditional rendering of the SignInForm or DashBoard based on login status.

// Import the global stylesheet for the application
import './App.css';
// Import the SignInForm component
import SignInForm from './Components/SignInForm/SignInForm.jsx';
// Import the DashBoard component
import ProtectedDashBoard from './Components/DashBoard/ProtectedDashBoard.jsx';
// Import the authentication store from MobX
import authStore from './mobxStores/authStore';
// Import observer from MobX for observing state changes
import { observer } from 'mobx-react';
// Import the WebSocket instance
import socket from './webSockets/websocket.jsx';

/**
 * App component.
 * 
 * This functional component is the main application component.
 * It observes the authStore to conditionally render either the SignInForm or the DashBoard based on the login status.
 * 
 * @returns {JSX.Element} The rendered application component.
 */
const App = observer(() => {
  // Connect to the WebSocket server
  socket.connect();

  return (
    <div>
      {authStore.token || authStore.user ? (
        // If token and user are available, render the DashBoard component
        <ProtectedDashBoard />
      ) : (
        // If token and user are not available, render the SignInForm component
        <SignInForm />
      )}
    </div>
  );
});

// Export the App component as the default export
export default App;

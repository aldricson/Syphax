// role: WebSocket client setup for real-time communication with the backend server.

// Import the WebSocket client from the 'socket.io-client' library
import { io } from "socket.io-client";
// Import the authentication store from MobX to manage authentication state
import authStore from '../mobxStores/authStore';
// Import the WebSocket URL from the global configuration
import { WEB_SOCKET_URL } from "../globals/globals";
import { refreshAccessToken } from "../apis/refreshToken";

// Initialize the WebSocket connection using the provided URL
const socket = io(WEB_SOCKET_URL);

/**
 * Event listener for WebSocket connection.
 * Logs the connection status and socket ID to the console.
 */
socket.on('connect', () => {
  console.log('Connected to WebSocket server');
  // Optionally, we could send the socket ID to the backend for association with user sessions
  console.log('Socket ID:', socket.id);
});

/**
 * Handles token invalidation and expiration.
 * Logs the user out and clears the local storage.
 *
 * @param {string} message - The message received from the server indicating an invalid or expired token.
 */
const handleInvalidToken = async (message) => {
  console.log('Received token invalid/expired message:', message);
  
  try {
    // Attempt to refresh the access token using the refresh token
    const data = await refreshAccessToken();
    authStore.setToken(data.accessToken);
    authStore.setUser(data.userData);
    console.log('Access token refreshed successfully');
  } catch (error) {
    // If refresh fails, logout the user
    console.log('Failed to refresh access token, logging out user');
    authStore.logout();
    // Clear any token in local storage
    localStorage.removeItem('SyphaxToken');
    // Display an alert to the user with the received message
    alert(message);
  }
};

// Event listener for 'invalidToken' messages
socket.on('invalidToken', handleInvalidToken);

// Event listener for 'tokenExpired' messages
socket.on('tokenExpired', handleInvalidToken);

/**
 * Event listener for WebSocket disconnection.
 * Logs the disconnection status to the console.
 */
socket.on('disconnect', () => {
  console.log('Disconnected from WebSocket server');
});

// Export the initialized WebSocket connection for use in other modules
export default socket;

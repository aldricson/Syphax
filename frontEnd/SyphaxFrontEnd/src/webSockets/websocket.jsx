import { io } from "socket.io-client";
import authStore from '../mobxStores/authStore';
import { WEB_SOCKET_URL } from "../globals/globals";



// Initialize the WebSocket connection
const socket = io(WEB_SOCKET_URL);

// Event listener for connection
socket.on('connect', () => {
  console.log('Connected to WebSocket server');
  // Optionally, we could send the socket ID to the backend for association with user sessions
  console.log('Socket ID:', socket.id);
});

// Event listener for 'invalidToken' messages
socket.on('invalidToken', (message) => {
  console.log('Received invalidToken message:', message);
  // Handle the invalid token scenario (e.g., log out the user)
  authStore.logout();
  alert(message); // Display an alert to the user
});

// Event listener for disconnection
socket.on('disconnect', () => {
  console.log('Disconnected from WebSocket server');
});

export default socket;

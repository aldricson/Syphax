// src/apis/authApi.jsx
import axios from 'axios';
import { LOGIN_API_URL } from '../globals/globals.jsx';
import socket from '../webSockets/websocket.jsx'

// Add the socket ID to the headers
export async function login(email, password, staySignedIn) {
  const response = await axios.post(
    `${LOGIN_API_URL}/login`,
    { email, password, staySignedIn },
    { headers: { 'socket-id': socket.id } } // Include the socket ID in the headers
  );
  return response.data;
}

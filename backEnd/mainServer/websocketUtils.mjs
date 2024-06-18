// role: Helper functions for sending messages to specific clients via WebSocket

// role: Utility functions for sending messages via WebSocket to specific clients or broadcasting to all clients.

// Import necessary modules
import { getSocketServerInstance } from './index.mjs'; // Function to get the WebSocket server instance

/**
 * @brief Sends a message to a specific client via WebSocket.
 * 
 * This function retrieves the WebSocket server instance and uses it to send a message to a specific client identified by their socket ID.
 * 
 * @param {string} socketId - The socket ID of the client to send the message to.
 * @param {string} event - The event name to emit.
 * @param {string} message - The message to send to the client.
 * @returns {void}
 */
export function sendMessageToClient(socketId, event, message) {
    // Get the WebSocket server instance
    const io = getSocketServerInstance();

    // Check if the socket ID and server instance are valid
    if (io && socketId) {
        io.to(socketId).emit(event, message); // Send the message to the specified client
        console.log(`Message sent to client ${socketId}: ${message}`); // Log the message sending
    } else {
        console.error(`Failed to send message to client ${socketId}. Invalid socket ID or server instance.`); // Log an error if message sending fails
    }
}

/**
 * @brief Sends a broadcast message to all connected clients via WebSocket.
 * 
 * This function retrieves the WebSocket server instance and uses it to broadcast a message to all connected clients.
 * 
 * @param {string} event - The event name to emit.
 * @param {string} message - The message to broadcast to all clients.
 * @returns {void}
 */
export function broadcastMessage(event, message) {
    // Get the WebSocket server instance
    const io = getSocketServerInstance();

    // Check if the server instance is valid
    if (io) {
        io.emit(event, message); // Broadcast the message to all connected clients
        console.log(`Broadcast message: ${message}`); // Log the message broadcasting
    } else {
        console.error('Failed to broadcast message. Invalid server instance.'); // Log an error if message broadcasting fails
    }
}


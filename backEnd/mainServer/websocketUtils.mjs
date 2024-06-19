// role: Utility functions for sending messages via WebSocket to specific clients or broadcasting to all clients.

// Import necessary modules
import { getSocketServerInstance } from './index.mjs'; // Function to get the WebSocket server instance
import { MESSAGE_EVENTS, MESSAGE_STRINGS } from '../globals/globalWebSocket.mjs'; // Import WebSocket constants

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

/**
 * @brief Sends a signal indicating new data is ready to all connected clients via WebSocket.
 * 
 * This function retrieves the WebSocket server instance and uses it to broadcast a new data ready signal to all connected clients.
 * 
 * @param {Object} data - The new data that is ready to be processed by the clients.
 * @returns {void}
 */
export function sendNewDataReadySignal(data) {
    // Get the WebSocket server instance
    const io = getSocketServerInstance();

    // Check if the server instance is valid
    if (io) {
        const event = MESSAGE_EVENTS.NEW_DATA_READY; // Define the event name for new data ready signal
        const message = MESSAGE_STRINGS.NEW_DATA_READY; // Define the message string for new data ready signal
        io.emit(event, { message, data }); // Broadcast the new data ready signal to all connected clients
        console.log(`New data ready signal broadcasted: ${JSON.stringify({ message, data })}`); // Log the signal broadcasting
    } else {
        console.error('Failed to broadcast new data ready signal. Invalid server instance.'); // Log an error if signal broadcasting fails
    }
}

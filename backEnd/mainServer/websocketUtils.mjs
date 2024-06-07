import { io } from './index.mjs'; // Adjust the path if necessary

/**
 * Send a message to a specific client by socket ID.
 * @param {string} socketId - The ID of the client to send the message to.
 * @param {string} event - The event name.
 * @param {any} message - The message to send.
 */
export function sendMessageToClient(socketId, event, message) {
    if (io) {
        const socket = io.sockets.sockets.get(socketId);
        if (socket) {
            socket.emit(event, message);
        } else {
            console.error(`No client found with socket ID: ${socketId}`);
        }
    } else {
        console.error('WebSocket server not initialized');
    }
}

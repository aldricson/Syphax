// Import required modules
import express from 'express'; // Express framework
import { createServer } from 'http'; // Node.js HTTP server
import { Server } from 'socket.io'; // WebSocket library
import { PORT } from './config.mjs'; // Port configuration
import { initializeTerminal, updateProgressBar, finalizeInitialization } from '../terminalUi/terminalUi.mjs'; // Terminal UI functions
import setupRoutes from './routes.mjs'; // Route setup function
import { setupMiddlewares } from './middlewares.mjs'; // Middleware setup function

// Create an instance of the WebSocket server
let io;

async function startServer() {
    // Create an Express application
    const app = express();

    // Create an HTTP server and bind it to the Express app
    const httpServer = createServer(app);

    // Create a WebSocket server and bind it to the HTTP server
    io = new Server(httpServer);

    // Handle WebSocket connections
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);
        // Example event to send a message to the client
        socket.emit('message', 'Welcome to the WebSocket server!');
        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('A user disconnected:', socket.id);
        });
    });

    try {
        // Initialize terminal UI
        await initializeTerminal();

        // Setup middlewares
        await setupMiddlewares(app);

        // Update progress bar to 50%
        await updateProgressBar(0.5, 100);

        // Setup routes
        await setupRoutes(app);

        // Update progress bar to 90%
        await updateProgressBar(0.9, 100);

        // Start the HTTP server
        httpServer.listen(PORT, () => {
            // Finalize initialization and show the server is running
            finalizeInitialization(PORT);
        });

        // Update progress bar to 100%
        await updateProgressBar(1.0, 100);
    } catch (err) {
        // Handle errors during server startup
        console.error(`Error starting server: ${err.message}`);
        process.exit(1); // Exit the process with an error code
    }
}

// Export the io instance for use in other modules
export { io };

// Start the server
startServer();

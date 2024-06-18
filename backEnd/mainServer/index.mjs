// role: Entry point of the backend server, sets up the Express server, WebSocket server, middlewares, and routes.

// Import required modules
import express from 'express'; // Express framework for building web applications
import { createServer } from 'http'; // Node.js HTTP server module
import { Server } from 'socket.io'; // WebSocket library for real-time communication
import { PORT } from './config.mjs'; // Port configuration for the server
import { initializeTerminal, updateProgressBar, finalizeInitialization } from '../terminalUi/terminalUi.mjs'; // Terminal UI functions for progress display
import setupRoutes from './routes.mjs'; // Function to setup application routes
import { setupMiddlewares } from './middlewares.mjs'; // Function to setup application middleware

// Variable to hold the WebSocket server instance
let io;

/**
 * @brief Starts the server and sets up WebSocket for real-time communication.
 * 
 * This function creates an Express application, sets up middleware and routes, initializes WebSocket for real-time communication, and starts the server.
 * It also initializes and updates the terminal UI to display the server's progress.
 * 
 * @returns {Promise<void>}
 */
async function startServer() {
    // Create an Express application instance
    const app = express();

    // Create an HTTP server and bind it to the Express app
    const httpServer = createServer(app);

    // Create a WebSocket server and bind it to the HTTP server
    io = new Server(httpServer, {
        cors: {
            origin: ["http://localhost:4173", "http://localhost:5173", "https://domain.com/"], // Allowed origins
            methods: ["GET", "POST"], // Allowed methods
            allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
            credentials: true // Allow credentials
        }
    });

    // Handle WebSocket connections
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id); // Log when a user connects
        // Example event to send a message to the client
        socket.emit('message', 'Welcome to the WebSocket server!');

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('A user disconnected:', socket.id); // Log when a user disconnects
        });
    });

    try {
        // Initialize terminal UI
        await initializeTerminal();

        // Setup middleware for the Express app
        await setupMiddlewares(app);

        // Update progress bar to 50%
        await updateProgressBar(0.5, 100);

        // Setup routes for the Express app
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

/**
 * @brief Gets the WebSocket server instance.
 * 
 * This function returns the WebSocket server instance.
 * 
 * @returns {Server} The WebSocket server instance.
 */
export function getSocketServerInstance() {
    return io;
}

// Start the server by invoking the startServer function
startServer();

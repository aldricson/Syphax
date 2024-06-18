// backEnd/mainServer/middlewares.mjs

// role: Middleware setup module for the Syphax backend server, handling CORS, static files, cookies, and authentication.

// Import required modules
import express from 'express'; // Express framework for building web applications
import cors from 'cors'; // CORS middleware for enabling Cross-Origin Resource Sharing
import cookieParser from 'cookie-parser'; // Middleware to parse cookies from HTTP requests
import { dirname } from 'path'; // Path module for handling and transforming file paths
import { fileURLToPath } from 'url'; // Utility to convert file URL to path
import { verifyTokenForStatic } from '../authentificationServices/tokenHelper.mjs'; // Function to verify tokens for static files
import { updateProgressBar } from '../terminalUi/terminalUi.mjs'; // Function to update progress bar in terminal UI

// Set directory name based on current module
const __dirname = dirname(fileURLToPath(import.meta.url)); 

// Define CORS options
const corsOptions = {
  origin: ["http://localhost:4173", "http://localhost:5173", "https://domain.com/"], // Allowed origins
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
  credentials: true, // Allow credentials (cookies, authorization headers)
};

/**
 * Sets up all middlewares for the Express application with progress updates.
 *
 * @param {Object} app - The Express application instance.
 * @returns {Promise<void>} - A promise that resolves when middlewares are set up.
 */
function setupMiddlewares(app) {
    // Enable CORS with predefined options
    app.use(cors(corsOptions));
    // Serve static files from the "public" directory for the "/storage/assets" route
    app.use("/storage/assets", express.static(__dirname + "/public"));
    // Parse cookies from incoming requests
    app.use(cookieParser());
    // Serve static files from the "private" directory for authenticated users only
    app.use("/storage/private/assets", isAuthenticated, express.static(__dirname + "/private"));
    // Update progress bar to indicate that middlewares have been set up
    updateProgressBar(0.6, 100);
    // Return a resolved promise for async consistency
    return Promise.resolve();
}

/**
 * Middleware function to check if the user is authenticated.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The next middleware function in the stack.
 */
async function isAuthenticated(req, res, next) {
    const authStatus = await verifyTokenForStatic(req); // Verify the token for static files
    if (authStatus) {
        next(); // If authenticated, proceed to the next middleware
    } else {
        res.status(401).send("Unauthorized"); // If not authenticated, send an "Unauthorized" response
    }
}

// Export the setupMiddlewares function
export { setupMiddlewares };

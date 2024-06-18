// role: Route setup module for the Syphax backend server, configuring API and web routes.

// Import required route modules
import apiAuthRoutesMain from "../routes/api/auth/auth.mjs"; // Authentication-related API routes
import apiRoutesMain from "../routes/web/main.mjs"; // General API routes
import webRoutesMain from "../routes/web/main.mjs"; // Web routes
import { updateProgressBar } from '../terminalUi/terminalUi.mjs'; // Function to update progress bar in terminal UI

/**
 * Applies all route configurations to the Express application.
 *
 * @param {Object} app - The Express application instance.
 * @returns {Promise<void>} - A promise that resolves when routes are set up.
 */
function setupRoutes(app) {
    // Apply authentication-related API routes to the "/api/auth" path
    app.use("/api/auth", apiAuthRoutesMain);
    // Apply general API routes to the "/api" path
    app.use("/api", apiRoutesMain);
    // Apply web routes to the root path "/"
    app.use("/", webRoutesMain);
    // Update progress bar to indicate routes are nearly fully set up
    updateProgressBar(0.9, 100);
    // Return a resolved promise for async consistency
    return Promise.resolve();
}

// Export the setupRoutes function as the default export
export default setupRoutes;

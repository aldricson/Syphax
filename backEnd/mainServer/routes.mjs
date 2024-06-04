// Route setup module for the Syphax backend server
import apiAuthRoutesMain from "../routes/api/auth/auth.mjs";
import apiRoutesMain from "../routes/web/main.mjs";
import webRoutesMain from "../routes/web/main.mjs";
import { updateProgressBar } from '../terminalUi/terminalUi.mjs';


// Function to apply all route configurations to the Express application
function setupRoutes(app) {
    app.use("/api/auth", apiAuthRoutesMain);
    app.use("/api", apiRoutesMain);
    app.use("/", webRoutesMain);
    updateProgressBar(0.9, 100); // Update progress bar near completion
    return Promise.resolve(); // Return promise for async consistency
}

export default setupRoutes;

import express from 'express';
import { PORT } from './config.mjs';
import { initializeTerminal, updateProgressBar, finalizeInitialization } from '../terminalUi/terminalUi.mjs';


import setupRoutes from './routes.mjs';
import { setupMiddlewares } from './middlewares.mjs';


async function startServer() {
    const app = express();

    try {

        await initializeTerminal();  // Initialize terminal UI
        await setupMiddlewares(app);  // Setup middleware
        await updateProgressBar(0.5, 100);  // Delay slightly for visual effect and update to 50%
        await setupRoutes(app);  // Setup routes
        await updateProgressBar(0.9, 100);  // Delay slightly for visual effect and update to 90%
        await updateProgressBar(1.0, 100);
        app.listen(PORT, () => {
            finalizeInitialization(PORT);  // Complete and show the server is running
        });
        await updateProgressBar(1.0, 100);
    } catch (err) {
        console.error(`Error starting server: ${err.message}`);
        process.exit(1);
    }
}

startServer();

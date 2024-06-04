// Middleware setup module for the Syphax backend server
import express from 'express'; // <-- Add this line to import express
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { verifyTokenForStatic } from '../authentificationServices/tokenHelper.mjs';
import { updateProgressBar } from '../terminalUi/terminalUi.mjs';


const __dirname = dirname(fileURLToPath(import.meta.url)); // Set directory name based on current module

const corsOptions = {
  origin: ["http://localhost:4173", "http://localhost:5173", "https://domain.com/"],
  methods: ["GET, POST, PUT, DELETE"],
  credentials: true,
};

// Function to setup all middlewares with progress updates
function setupMiddlewares(app) {
    app.use(cors(corsOptions));
    app.use("/storage/assets", express.static(__dirname + "/public"));
    app.use(cookieParser());
    app.use("/storage/private/assets", isAuthenticated, express.static(__dirname + "/private"));
    updateProgressBar( 0.6, 100); // Update progress bar after setting middlewares
    return Promise.resolve(); // Return promise for async consistency
}

async function isAuthenticated(req, res, next) {
    const authStatus = await verifyTokenForStatic(req);
    if (authStatus) {
        next();
    } else {
        res.status(401).send("Unauthorized");
    }
}

export { setupMiddlewares };

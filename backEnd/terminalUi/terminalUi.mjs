// terminalUI.js
// Import necessary modules
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'terminal-kit';
import { checkDb } from '../db/userDbManager.mjs';
import { showUserAdderForm,
         displayUsers,
         displayRevokeUserByName,
         displayRestoreUserByName,
         displaySetUserDeletableByName,
         displayDeleteUserByName,
         waitForKeyPress  } from './userAdderForm.mjs';

let terminalReady = false;
let terminalResolve;
let terminalPromise = new Promise(resolve => {
  terminalResolve = resolve;
});


const { terminal } = pkg;

terminal.on('key', function (name, matches, data) {
    if (name === 'CTRL_C') {
        terminal.grabInput(false);  // Stop grabbing input
        terminal.green('\nCTRL+C received, exiting...\n');
        process.exit(0);  // Safely exit the process
    }
});

// Derive __dirname equivalent in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

let progressBar;




// Initialize the terminal and progress bar
async function initializeTerminal() {
    try {
        terminal.clear();
        terminal.green("Welcome to the Syphax backend server, sit back and relax.\n");
        terminal.grabInput({ mouse: 'button' });

        progressBar = terminal.progressBar({
            width: 80,
            title: 'Initialization Progress:',
            eta: true,
            percent: true
        });

        // Your actual initialization logic here
        await new Promise(resolve => setTimeout(resolve, 100));  // Simulated delay

        terminalReady = true;
        terminalResolve(terminal);
    } catch (error) {
        terminalResolve(); // Resolve the promise even on failure to avoid hanging
        console.error("Failed to initialize terminal:", error);
    }
    return progressBar;
}


// Update the progress bar with a specified progress and an optional delay
async function updateProgressBar(progress, delay = 0) {
    await new Promise(resolve => setTimeout(resolve, delay)); // Wait for the delay before updating
    progressBar.update(progress);
}

function getTerminal() {
    return new Promise((resolve, reject) => {
        if (terminalReady) {
            resolve(terminal);
        } else {
            // Wait for terminal to be ready
            terminalPromise.then(resolve).catch(reject);
        }
    });
}
// Finalize initialization by displaying server running information
function finalizeInitialization(port) {
    progressBar.stop();
    terminal.moveTo(1, 3);
    terminal.green(`Syphax backend server running at http://localhost:${port}\n`);

    // Construct the path to the image file
    const imagePath = path.join(__dirname, "../assets/images/Cyberpunk.png");

    // Attempt to draw the image, wrapped in try-catch for error handling
    try {
        terminal.drawImage(imagePath, {
            shrink: {
                width: 100,
                height: 100
                }
        });

        terminal.slowTyping(
            'Everything seems to run smoothly boss!\n',
            { flashStyle: terminal.brightWhite, delay: 60 },
            function () {

                displayMenu(true);
            }
        );
    } catch (error) {
        console.error("Failed to draw image:", error);
    }
}

async function displayMenu(clearScreen) {
    if (clearScreen) {
        terminal.clear();
    }
    const menuItems = ['Show parameters', 'Check DB', 'Show users', 'Revoke user', 'Restore user', 'Create user', 'Set user deletable', 'Delete user', 'Exit'];
    terminal.singleColumnMenu(menuItems, { selectedIndex: 0 }, (error, response) => {
        if (error) {
            terminal.red('An error occurred: ' + error.message + '\n');
            return;
        }
        terminal.green(`You selected: ${response.selectedText}\n`);

        switch (response.selectedIndex) {
            case 0:
                terminal.yellow('Placeholder for show parameters.\n');
                waitForKeyPress(terminal);
                break;
            case 1:
                terminal.yellow('Checking the database:\n');
                checkDb(terminal);
                break;
            case 2:
                displayUsers(terminal);
                break;
            case 3:
                terminal.yellow('Revoking a user:\n');
                displayRevokeUserByName(terminal);
                break;
            case 4:
                terminal.yellow('Restoring a user.\n');
                displayRestoreUserByName(terminal);
                break;
            case 5:
                terminal.yellow('Adding a new user:\n');
                showUserAdderForm(terminal);
                break;
            case 6:
                terminal.yellow('Set user delatable\n');
                displaySetUserDeletableByName(terminal);
                break;
            case 7:
                terminal.yellow('Delete user.\n');
                displayDeleteUserByName(terminal);
                break;
            case 8:
                terminal.yellow('Exiting\n');
                process.exit(0);
                break;
            default:
                terminal.red('No valid option selected.\n');
                waitForKeyPress(terminal);
        }
    });
}

function displayError(clearScreen,message) {
    if (clearScreen) {
        terminal.clear();
    }
    terminal.red(message);
}

function displaySucces(clearScreen,message) {
    if (clearScreen) {
        terminal.clear();
    }
    terminal.green(message);
}


// Ensure all functions I need are correctly exported

export { initializeTerminal, updateProgressBar, finalizeInitialization, getTerminal,  displayMenu, displayError, displaySucces};

import fs from 'fs'; // Import the file system module
import { inputField } from "./inputField.mjs";

export async function selectFile(terminal) {
    terminal.cyan('Choose an image file:\n');
    try {
      const items = fs.readdirSync(process.cwd()); // Reads the current directory's contents
      return new Promise((resolve, reject) => {
        terminal.gridMenu(items, (error, response) => {
          if (error) {
            reject(error);
          } else {
            term('\n').eraseLineAfter.green(
              "#%s selected: %s (%s,%s)\n",
              response.selectedIndex,
              response.selectedText,
              response.x,
              response.y
            );
            resolve(response.selectedText);
          }
        });
      });
    } catch (error) {
      console.error('Error reading directory:', error);
      return null;
    }
  }


  export async function showUserAdderForm(terminal) {
    terminal.clear();
    terminal.moveTo(1, 1, 'Create New User\n');
  
    const name = await inputField(terminal,'Name: ', { cancelable: true });
    const email = await inputField(terminal,'Email: ', { cancelable: true });
    const mobile = await inputField(terminal,'Mobile (optional): ', { cancelable: true, default: '' });
    const password = await inputField(terminal,'Password: ', { echo: '*', cancelable: true });
    const imagePath = await selectFile(terminal); // Uses gridMenu to select the file
    const status = await inputField(terminal,'Status (1 - Active, 0 - Inactive): ', { cancelable: true, default: '1' });
  
    // Submit logic here
    terminal.green('\nSubmitting User Data...\n');
    // Simulation of data processing
    setTimeout(() => terminal.green('User created successfully!\n'), 1000);
  
    term('Press any key to continue...').waitForInput(() => {
      terminal.grabInput(false);
      terminal.clear();
      //TODO
    });
  }
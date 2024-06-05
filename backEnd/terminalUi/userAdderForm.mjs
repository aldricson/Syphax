import fs from 'fs'; // Import the file system module
import path from 'path';
import { inputField } from "./inputField.mjs";
import { addUser,showUsers,revokeUserByName } from '../db/userDbManager.mjs';
import { displayMenu } from './terminalUi.mjs'; 

/**
 * Waits for a key press and then returns to the menu.
 * @param {Object} terminal - The terminal interface.
 */
export function waitForKeyPress(terminal) {
  terminal('\nPress any key to continue...\n');
  terminal.grabInput(true);

  const keyHandler = () => {
    terminal.grabInput(false);
    terminal.removeListener('key', keyHandler); // Remove the event listener
    terminal.clear();
    displayMenu(true);
  };

  terminal.on('key', keyHandler);
}


/**
 * Prompts the user to select a file from the current directory or navigate into directories.
 * @param {Object} terminal - The terminal interface.
 * @param {string} dir - The current directory path.
 * @returns {Promise<string>} The name of the selected file.
 */
export async function selectFile(terminal, dir = process.cwd()) {
  terminal.cyan('Choose an image file:\n');
  try {
    const items = fs.readdirSync(dir); // Reads the current directory's contents
    const fullPathItems = items.map(item => ({
      name: item,
      isDirectory: fs.lstatSync(path.join(dir, item)).isDirectory()
    }));
    return new Promise((resolve, reject) => {
      const itemNames = fullPathItems.map(item => (item.isDirectory ? `[DIR] ${item.name}` : item.name));
      terminal.gridMenu(itemNames, (error, response) => {
        if (error) {
          reject(error);
        } else {
          const selectedItem = fullPathItems[response.selectedIndex];
          const selectedPath = path.join(dir, selectedItem.name);
          if (selectedItem.isDirectory) {
            // Navigate into the selected directory
            resolve(selectFile(terminal, selectedPath));
          } else {
            terminal('\n').eraseLineAfter.green(
              "#%s selected: %s (%s,%s)\n",
              response.selectedIndex,
              response.selectedText,
              response.x,
              response.y
            );
            resolve(selectedPath);
          }
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

    terminal.green('\nSubmitting User Data...\n');
    await addUser(terminal, name, email, mobile, password, imagePath);
    
    terminal.green('User created successfully!\n');
    terminal('Press any key to continue...\n');
    terminal.grabInput(true);
    waitForKeyPress(terminal);
  }

  export async function displayUsers(terminal) {
    terminal.clear();
    terminal.moveTo(1, 1, 'User List\n');
  
    const users = await showUsers(terminal);
  
    if (users.length === 0) {
      terminal.yellow('No users found.\n');
    } else {
      // Prepare table data
      const tableData = [
        ['ID', 'Name', 'Email', 'Mobile', 'Status', 'Image Path']
      ];
  
      users.forEach(user => {
        tableData.push([
          user.id.toString(),
          user.u_name,
          user.u_email,
          user.u_mobile ? user.u_mobile.toString() : '',
          user.u_status.toString(),
          user.u_image
        ]);
      });
  
      // Display the table
      terminal.table(tableData, {
        hasBorder: true,
        contentHasMarkup: false,
        borderChars: 'lightRounded',
        borderAttr: { color: 'blue' },
        textAttr: { bgColor: 'default' },
        firstCellTextAttr: { bgColor: 'blue' },
        firstRowTextAttr: { bgColor: 'yellow' },
        firstColumnTextAttr: { bgColor: 'red' },
        width: 100,
        fit: true   // Activate all expand/shrink + wordWrap
      });
    }
  
    waitForKeyPress(terminal)
  }

 export async function displayRevokeUserByName(terminal){
    terminal.clear();
    terminal.moveTo(1, 1, 'Create New User\n');
    const name = await inputField(terminal,'User name: ', { cancelable: false });
    revokeUserByName(terminal,name);
    waitForKeyPress(terminal)
 }
// role: helper functions to create, remove, revoke, restore, etc... a user inside the db (administration)

// Import what is needed to generate unique ids
import { v4 as uuidv4 } from 'uuid';
// Import a crypto library for hashing passwords
import bcrypt from "bcrypt";
// Import the mysql module with promise support
import mysql from "mysql2/promise";
import { getTerminal, displayMenu } from '../terminalUi/terminalUi.mjs'; // Import terminal UI functions
import { waitForKeyPress } from '../terminalUi/userAdderForm.mjs'; // Import function to wait for key press
import { DBIP, DBNAME, DBUSER, DBPASSWORD, CONNECTLIMIT, DBUSERTABLE } from '../mainServer/config.mjs'; // Import database configuration

// Create a noDbPool with no DB in case we need to recreate the db
const noDbPool = mysql.createPool({
    host: DBIP, // Database server address
    user: DBUSER, // Database user based on application mode (production or development)
    password: DBPASSWORD, // DB password based on application mode
    waitForConnections: true, // When no connections are available, wait rather than immediately throwing an error
    connectionLimit: CONNECTLIMIT || 10, // Maximum number of connections to create at once (fallback is 10)
    queueLimit: 0 // Maximum number of connection requests the pool will queue before returning an error
});

// Create a connection pool with MySQL database parameters
const pool = mysql.createPool({
  host: DBIP, // Database server address
  user: DBUSER, // Database user based on application mode (production or development)
  password: DBPASSWORD, // DB password based on application mode
  database: DBNAME, // Determine which database to connect to based on application mode
  waitForConnections: true, // When no connections are available, wait rather than immediately throwing an error
  connectionLimit: CONNECTLIMIT || 10, // Maximum number of connections to create at once (fallback is 10)
  queueLimit: 0 // Maximum number of connection requests the pool will queue before returning an error
});

/**
 * Creates the user table if it does not exist.
 *
 * @param {Object} pool - The MySQL connection pool.
 * @param {string} tableName - The name of the table to create.
 * @returns {Promise<void>}
 */
async function createUserTable(pool, tableName) {
    await pool.query(`
        CREATE TABLE ${tableName} (
            id int NOT NULL AUTO_INCREMENT,
            u_user_id varchar(255) DEFAULT '',
            u_name varchar(255) NOT NULL,
            u_email varchar(255) NOT NULL,
            u_mobile bigint(20) NULL,
            u_password varchar(255) NULL,
            u_image varchar(150) DEFAULT '',
            u_status int(11) DEFAULT 1,
            u_deleted_status int(11) DEFAULT 0,
            u_created_at timestamp DEFAULT current_timestamp(),
            u_updated_at timestamp NULL,
            PRIMARY KEY(id)
        );
    `);
}

/**
 * Checks and manages the database and table setup.
 *
 * @param {Object} aTerminal - The terminal interface.
 * @returns {Promise<void>}
 */
export async function checkDb(aTerminal) {
    aTerminal.clear(); // Clear the terminal
    try {
        // Check if the database exists
        const dbResult = await noDbPool.query(`SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '${DBNAME}'`);
        if (!dbResult[0].length) {
            aTerminal.yellow(`Database '${DBNAME}' does not exist. Creating...\n`);
            try {
                // Temporarily connect to a default database to execute the creation
                aTerminal.green(`Database '${DBNAME}' has been successfully created...\n`);
                await noDbPool.query(`CREATE DATABASE IF NOT EXISTS ${DBNAME}`);
            } catch (error) {
                throw new Error(`Failed to create database: ${error.message}`);
            }
        } else {
            aTerminal.green(`Database '${DBNAME}' exists.\n`);
        }

        // Check if the table exists within the specified database
        const tableResult = await pool.query(`SHOW TABLES LIKE '${DBUSERTABLE}'`);
        if (!tableResult[0].length) {
            aTerminal.yellow(`Table '${DBUSERTABLE}' does not exist. Creating...\n`);
            await createUserTable(pool, DBUSERTABLE);
            aTerminal.green("Table created successfully.\n");
        } else {
            aTerminal.green(`Table '${DBUSERTABLE}' exists.\n`);
        }

        // Query to check user count
        const [results] = await pool.query(`SELECT COUNT(*) AS userCount FROM ${DBUSERTABLE}`);
        const userCount = results[0].userCount;
        aTerminal.green(`User count: ${userCount}\n`);

    } catch (error) {
        aTerminal.red(`Error checking database: ${error.message}\n`);
        if (error.message.includes("Unknown database")) {
            aTerminal.magenta(`last attempt to create the DB ${DBNAME}\n`);
            await createUserDB(pool, DBNAME);
        }
    }

    aTerminal.yellow("Press 'Enter' to return to the menu...");
    aTerminal.inputField({}, (err, input) => {
        displayMenu(true);
    });
}

/**
 * Adds a new user to the database.
 *
 * @param {Object} terminal - The terminal interface.
 * @param {string} u_name - User's name.
 * @param {string} u_email - User's email.
 * @param {string} u_mobile - User's mobile number.
 * @param {string} plainPassword - User's plain text password.
 * @param {string} u_image_path - Path to the user's image.
 * @returns {Promise<void>}
 */
export async function addUser(terminal, u_name, u_email, u_mobile, plainPassword, u_image_path) {
    try {
        const u_user_id = uuidv4(); // Generate a UUID for the user ID
        const saltRounds = 10; // Number of salt rounds for hashing
        const hashedPassword = await bcrypt.hash(plainPassword, saltRounds); // Hash the user's password

        const query = `
        INSERT INTO ${DBUSERTABLE} (
          u_user_id, 
          u_name, 
          u_email, 
          u_mobile, 
          u_password, 
          u_image
        ) VALUES (?, ?, ?, ?, ?, ?);
      `;

        const values = [u_user_id, u_name, u_email, u_mobile, hashedPassword, u_image_path]; // Values to insert into the user table
        const [result] = await pool.query(query, values); // Execute the query with the provided values

        terminal.green(`User successfully added with UUID: ${u_user_id}\n`); // Output success message
        return result; // Return the result of the query
    } catch (error) {
        terminal.red(`Error adding user: ${error.message}\n`); // Output error message
        return null; // Return null if an error occurs
    }
}

/**
 * Retrieves all users from the database.
 *
 * @param {Object} terminal - The terminal interface.
 * @returns {Promise<Array>} An array of user objects.
 */
export async function showUsers(terminal) {
    try {
        const query = `SELECT * FROM ${DBUSERTABLE};`; // Query to select all users
        const [rows] = await pool.query(query); // Execute the query

        terminal.green(`Retrieved ${rows.length} users from the database.\n`); // Output success message
        return rows; // Return the rows of the query result
    } catch (error) {
        terminal.red(`Error retrieving users: ${error.message}\n`); // Output error message
        return []; // Return an empty array if an error occurs
    }
}

/**
 * Revokes a user by name by setting their status to inactive (0).
 * If the exact name is not found, performs a Soundex search to find similar names.
 *
 * @param {Object} terminal - The terminal interface.
 * @param {string} userName - The name of the user to revoke.
 * @returns {Promise<void>}
 */
export async function revokeUserByName(terminal, userName) {
    try {
        // Attempt to revoke user by exact name
        let query = `
        UPDATE ${DBUSERTABLE}
        SET u_status = 0
        WHERE u_name = ?;
      `;

        let values = [userName];
        let [result] = await pool.query(query, values);

        if (result.affectedRows === 0) {
            terminal.red(`No user found with the exact name '${userName}'.\n`);

            // Perform a Soundex search for similar names
            terminal.yellow('Performing a Soundex search for similar names...\n');
            query = `
          SELECT u_name
          FROM ${DBUSERTABLE}
          WHERE SOUNDEX(u_name) = SOUNDEX(?);
        `;
            const [rows] = await pool.query(query, values);

            if (rows.length === 0) {
                terminal.red('No similar names found.\n');
                waitForKeyPress(terminal);
                return null;
            } else {
                terminal.cyan('Found similar names:\n');
                const similarNames = rows.map(row => row.u_name);
                similarNames.forEach((name, index) => {
                    terminal.cyan(`${index + 1}: ${name}\n`);
                });

                // Ask the user to select a name from the list
                terminal('Select a user by number: ');
                const selectedNumber = await new Promise(resolve => terminal.inputField((_, input) => resolve(Number(input.trim()) - 1)));

                if (selectedNumber < 0 || selectedNumber >= similarNames.length) {
                    terminal.red('Invalid selection.\n');
                    return null;
                }

                const selectedName = similarNames[selectedNumber];
                terminal.yellow(`Revoking user '${selectedName}'...\n`);

                // Attempt to revoke the selected user
                values = [selectedName];
                query = `
            UPDATE ${DBUSERTABLE}
            SET u_status = 0
            WHERE u_name = ?;
          `;
                [result] = await pool.query(query, values);

                if (result.affectedRows === 0) {
                    terminal.red(`Failed to revoke user '${selectedName}'.\n`);
                } else {
                    terminal.green(`User '${selectedName}' successfully revoked.\n`);
                }
            }
        } else {
            terminal.green(`User '${userName}' successfully revoked.\n`);
        }

        return result;
    } catch (error) {
        terminal.red(`Error revoking user: ${error.message}\n`);
        return null;
    }
}

/**
 * Restores a user by name by setting their status to active (1).
 * If the exact name is not found, performs a Soundex search to find similar names.
 *
 * @param {Object} terminal - The terminal interface.
 * @param {string} userName - The name of the user to restore.
 * @returns {Promise<void>}
 */
export async function restoreUserByName(terminal, userName) {
    try {
        // Attempt to restore user by exact name
        let query = `
        UPDATE ${DBUSERTABLE}
        SET u_status = 1
        WHERE u_name = ?;
      `;

        let values = [userName];
        let [result] = await pool.query(query, values);

        if (result.affectedRows === 0) {
            terminal.red(`No user found with the exact name '${userName}'.\n`);

            // Perform a Soundex search for similar names
            terminal.yellow('Performing a Soundex search for similar names...\n');
            query = `
          SELECT u_name
          FROM ${DBUSERTABLE}
          WHERE SOUNDEX(u_name) = SOUNDEX(?);
        `;
            const [rows] = await pool.query(query, values);

            if (rows.length === 0) {
                terminal.red('No similar names found.\n');
                waitForKeyPress(terminal);
                return null;
            } else {
                terminal.cyan('Found similar names:\n');
                const similarNames = rows.map(row => row.u_name);
                similarNames.forEach((name, index) => {
                    terminal.cyan(`${index + 1}: ${name}\n`);
                });

                // Ask the user to select a name from the list
                terminal('Select a user by number: ');
                const selectedNumber = await new Promise(resolve => terminal.inputField((_, input) => resolve(Number(input.trim()) - 1)));

                if (selectedNumber < 0 || selectedNumber >= similarNames.length) {
                    terminal.red('Invalid selection.\n');
                    return null;
                }

                const selectedName = similarNames[selectedNumber];
                terminal.yellow(`Restoring user '${selectedName}'...\n`);

                // Attempt to restore the selected user
                values = [selectedName];
                query = `
            UPDATE ${DBUSERTABLE}
            SET u_status = 1
            WHERE u_name = ?;
          `;
                [result] = await pool.query(query, values);

                if (result.affectedRows === 0) {
                    terminal.red(`Failed to restore user '${selectedName}'.\n`);
                } else {
                    terminal.green(`User '${selectedName}' successfully restored.\n`);
                }
            }
        } else {
            terminal.green(`User '${userName}' successfully restored.\n`);
        }

        return result;
    } catch (error) {
        terminal.red(`Error restoring user: ${error.message}\n`);
        return null;
    }
}

/**
 * Deletes a user by name by setting their deleted status to true (1).
 * If the exact name is not found, performs a Soundex search to find similar names.
 *
 * @param {Object} terminal - The terminal interface.
 * @param {string} userName - The name of the user to delete.
 * @returns {Promise<void>}
 */
export async function setUserDeletableByName(terminal, userName) {
    try {
        // Attempt to delete user by exact name
        let query = `
        UPDATE ${DBUSERTABLE}
        SET u_deleted_status = 1
        WHERE u_name = ?;
      `;

        let values = [userName];
        let [result] = await pool.query(query, values);

        if (result.affectedRows === 0) {
            terminal.red(`No user found with the exact name '${userName}'.\n`);

            // Perform a Soundex search for similar names
            terminal.yellow('Performing a Soundex search for similar names...\n');
            query = `
          SELECT u_name
          FROM ${DBUSERTABLE}
          WHERE SOUNDEX(u_name) = SOUNDEX(?);
        `;
            const [rows] = await pool.query(query, values);

            if (rows.length === 0) {
                terminal.red('No similar names found.\n');
                waitForKeyPress(terminal);
                return null;
            } else {
                terminal.cyan('Found similar names:\n');
                const similarNames = rows.map(row => row.u_name);
                similarNames.forEach((name, index) => {
                    terminal.cyan(`${index + 1}: ${name}\n`);
                });

                // Ask the user to select a name from the list
                terminal('Select a user by number: ');
                const selectedNumber = await new Promise(resolve => terminal.inputField((_, input) => resolve(Number(input.trim()) - 1)));

                if (selectedNumber < 0 || selectedNumber >= similarNames.length) {
                    terminal.red('Invalid selection.\n');
                    return null;
                }

                const selectedName = similarNames[selectedNumber];
                terminal.yellow(`Setting user deletable '${selectedName}'...\n`);

                // Attempt to delete the selected user
                values = [selectedName];
                query = `
            UPDATE ${DBUSERTABLE}
            SET u_deleted_status = 1
            WHERE u_name = ?;
          `;
                [result] = await pool.query(query, values);

                if (result.affectedRows === 0) {
                    terminal.red(`Failed to set user deletable '${selectedName}'.\n`);
                } else {
                    terminal.green(`User '${selectedName}' successfully set as deletable.\n`);
                }
            }
        } else {
            terminal.green(`User '${userName}' successfully set as deletable.\n`);
        }

        return result;
    } catch (error) {
        terminal.red(`Error deleting user: ${error.message}\n`);
        return null;
    }
}

/**
 * Permanently deletes a user by name from the database.
 * If the exact name is not found, performs a Soundex search to find similar names.
 *
 * @param {Object} terminal - The terminal interface.
 * @param {string} userName - The name of the user to delete.
 * @returns {Promise<void>}
 */
export async function deleteUserByName(terminal, userName) {
    try {
        // Attempt to delete user by exact name
        let query = `
        DELETE FROM ${DBUSERTABLE}
        WHERE u_name = ?;
      `;

        let values = [userName];
        let [result] = await pool.query(query, values);

        if (result.affectedRows === 0) {
            terminal.red(`No user found with the exact name '${userName}'.\n`);

            // Perform a Soundex search for similar names
            terminal.yellow('Performing a Soundex search for similar names...\n');
            query = `
          SELECT u_name
          FROM ${DBUSERTABLE}
          WHERE SOUNDEX(u_name) = SOUNDEX(?);
        `;
            const [rows] = await pool.query(query, values);

            if (rows.length === 0) {
                terminal.red('No similar names found.\n');
                waitForKeyPress(terminal);
                return null;
            } else {
                terminal.cyan('Found similar names:\n');
                const similarNames = rows.map(row => row.u_name);
                similarNames.forEach((name, index) => {
                    terminal.cyan(`${index + 1}: ${name}\n`);
                });

                // Ask the user to select a name from the list
                terminal('Select a user by number: ');
                const selectedNumber = await new Promise(resolve => terminal.inputField((_, input) => resolve(Number(input.trim()) - 1)));

                if (selectedNumber < 0 || selectedNumber >= similarNames.length) {
                    terminal.red('Invalid selection.\n');
                    return null;
                }

                const selectedName = similarNames[selectedNumber];
                terminal.yellow(`Deleting user '${selectedName}'...\n`);

                // Attempt to delete the selected user
                values = [selectedName];
                query = `
            DELETE FROM ${DBUSERTABLE}
            WHERE u_name = ?;
          `;
                [result] = await pool.query(query, values);

                if (result.affectedRows === 0) {
                    terminal.red(`Failed to delete user '${selectedName}'.\n`);
                } else {
                    terminal.green(`User '${selectedName}' successfully deleted.\n`);
                }
            }
        } else {
            terminal.green(`User '${userName}' successfully deleted.\n`);
        }

        // Reorganize the table indexes after deletion
        await pool.query(`OPTIMIZE TABLE ${DBUSERTABLE}`);
        terminal.green(`Table indexes reorganized successfully.\n`);

        return result;
    } catch (error) {
        terminal.red(`Error deleting user: ${error.message}\n`);
        return null;
    }
}

// Export the pool for use elsewhere in the application
export default pool;

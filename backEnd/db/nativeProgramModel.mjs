// role: This file handles database operations related to native programs, including registration and validation, ensuring secure association with user data.

// Import the database pool object from the configuration file
import pool from "./userDbManager.mjs"; // Assuming userDbManager exports the pool
import { v4 as uuidv4 } from 'uuid'; // Import to generate unique IDs

/**
 * Creates the native programs table if it does not exist.
 *
 * @param {Object} pool - The MySQL connection pool.
 * @returns {Promise<void>}
 */
async function createNativeProgramsTable(pool) {
    // Execute the SQL query to create the native programs table if it does not exist
    await pool.query(`
        CREATE TABLE IF NOT EXISTS native_programs (
            program_id INT AUTO_INCREMENT PRIMARY KEY,   // Define the primary key for the table
            user_id VARCHAR(255) NOT NULL,               // Define the user ID column as a foreign key
            user_name VARCHAR(255) NOT NULL,             // Define the user name column
            user_email VARCHAR(255) NOT NULL,            // Define the user email column
            program_name VARCHAR(255) NOT NULL,          // Define the program name column
            program_key VARCHAR(255) UNIQUE NOT NULL,    // Define the program key column with a unique constraint
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, // Define the creation timestamp
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, // Define the update timestamp
            FOREIGN KEY (user_id) REFERENCES user(u_user_id) // Set user_id as a foreign key referencing user table
        );
    `); // End of SQL query
}

/**
 * Registers a new native program linked to a user.
 *
 * @param {string} userId - The user ID to link the native program to.
 * @param {string} userName - The name of the user.
 * @param {string} userEmail - The email of the user.
 * @param {string} programName - The name of the native program.
 * @returns {Object|null} - The native program object if registration is successful, otherwise null.
 */
export const registerNativeProgram = async (userId, userName, userEmail, programName) => {
    if (!userId || !userName || !userEmail || !programName) { // Check if any input is null or undefined
        return null; // Return null if any input is invalid
    }

    const programKey = uuidv4(); // Generate a unique program key

    try {
        // Perform a SQL query to insert the new native program
        const result = await pool.query(
            "INSERT INTO native_programs (user_id, user_name, user_email, program_name, program_key) VALUES (?, ?, ?, ?, ?)",
            [userId, userName, userEmail, programName, programKey] // Provide the query values
        );

        if (result[0].affectedRows === 0) { // Check if the insertion was successful
            return null; // Return null if no rows were affected
        }

        // Return the inserted native program data
        return {
            program_id: result[0].insertId, // ID of the newly inserted program
            user_id: userId,                // ID of the user linked to the program
            user_name: userName,            // Name of the user
            user_email: userEmail,          // Email of the user
            program_name: programName,      // Name of the program
            program_key: programKey,        // Unique key of the program
            created_at: new Date(),         // Creation timestamp
            updated_at: new Date(),         // Update timestamp
        };
    } catch (error) {
        console.error('Error registering native program:', error); // Log the error if insertion fails
        return null; // Return null if an error occurs
    }
};

/**
 * Fetches a native program by its program key.
 *
 * @param {string} programKey - The key of the native program to fetch.
 * @returns {Object|null} - The native program object if found, otherwise null.
 */
export const getNativeProgramByKey = async (programKey) => {
    if (!programKey) { // Check if the program key input is null or undefined
        return null; // Return null if the program key is invalid
    }

    try {
        // Perform a SQL query to find the native program by its key
        const result = await pool.query(
            "SELECT * FROM native_programs WHERE program_key = ?",
            [programKey] // Provide the program key as a query value
        );
        const [rows] = result; // Destructure the result to get the rows from the query result

        if (Object.keys(rows).length === 0) { // Check if the query returned any rows
            return null; // Return null if no rows were found
        }
        return rows[0]; // Return the first row of the results (the native program data)
    } catch (error) {
        console.error('Error fetching native program by key:', error); // Log the error if the query fails
        return null; // Return null if an error occurs
    }
};

/**
 * Validates data sent from a native program by its program key.
 *
 * @param {string} programKey - The key of the native program to validate.
 * @returns {Object|null} - The native program object if validation is successful, otherwise null.
 */
export const validateNativeProgram = async (programKey) => {
    const program = await getNativeProgramByKey(programKey); // Fetch the native program by its key
    if (!program) { // Check if the native program exists
        return null; // Return null if the native program does not exist
    }

    // Additional validation logic can be added here

    return program; // Return the valid native program data
};

/**
 * Fetches all native programs linked to a specific user.
 *
 * @param {string} userId - The user ID to fetch the native programs for.
 * @returns {Array|null} - An array of native programs if found, otherwise null.
 */
export const getNativeProgramsByUserId = async (userId) => {
    if (!userId) { // Check if the user ID input is null or undefined
        return null; // Return null if the user ID is invalid
    }

    try {
        // Perform a SQL query to find native programs by user ID
        const result = await pool.query(
            "SELECT * FROM native_programs WHERE user_id = ?",
            [userId] // Provide the user ID as a query value
        );
        const [rows] = result; // Destructure the result to get the rows from the query result

        if (Object.keys(rows).length === 0) { // Check if the query returned any rows
            return null; // Return null if no rows were found
        }
        return rows; // Return the rows of the results (the native programs data)
    } catch (error) {
        console.error('Error fetching native programs by user ID:', error); // Log the error if the query fails
        return null; // Return null if an error occurs
    }
};

/**
 * Initializes the database by creating the native programs table if it does not exist.
 *
 * @returns {Promise<void>}
 */
export const initializeDatabase = async () => {
    try {
        await createNativeProgramsTable(pool); // Create the native programs table if it does not exist
        console.log("Native programs table initialized."); // Log the successful initialization
    } catch (error) {
        console.error("Error initializing native programs table:", error); // Log the error if initialization fails
    }
};

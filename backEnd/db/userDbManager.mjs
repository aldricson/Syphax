//Import what is needed to generate unique ids
import { v4 as uuidv4 } from 'uuid';
//import a crypto lib
import bcrypt from "bcrypt";
// Import the mysql module with promise support
import mysql from "mysql2/promise";
import { getTerminal, displayMenu } from '../terminalUi/terminalUi.mjs';
import { DBIP, DBNAME, DBUSER, DBPASSWORD, CONNECTLIMIT, DBUSERTABLE} from '../mainServer/config.mjs';

//create a noDbPool with no DB in case we need to recreate the db
const  noDbPool = mysql.createPool
({
    host: DBIP, // Database server address
    user: DBUSER, // database user based on application mode (production or development)
    password: DBPASSWORD, //DB password based on application mode
    waitForConnections: true, // When no connections are available, wait rather than immediately throwing an error
    connectionLimit: CONNECTLIMIT || 10, // Maximum number of connections to create at once (fallback is 10)
    queueLimit: 0 // Maximum number of connection requests the pool will queue before returning an error
  });
  

// Create a connection pool with MySQL database parameters
const pool = mysql.createPool({
  host: DBIP, // Database server address
  user: DBUSER, // database user based on application mode (production or development)
  password: DBPASSWORD, //DB password based on application mode
  database: DBNAME,// Determine which database to connect to based on application mode
  waitForConnections: true, // When no connections are available, wait rather than immediately throwing an error
  connectionLimit: CONNECTLIMIT || 10, // Maximum number of connections to create at once (fallback is 10)
  queueLimit: 0 // Maximum number of connection requests the pool will queue before returning an error
});



// Function to create the user table if it does not exist
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

// Function to check and manage the database and table setup
export async function checkDb(aTerminal) {
    aTerminal.clear();
    try {
        // Check if the database exists
        const dbResult = await noDbPool.query(`SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '${DBNAME}'`);
        if (!dbResult[0].length) {
            aTerminal.yellow(`Database '${DBNAME}' does not exist. Creating...\n`);
            try {
                    // Temporarily connect to a default database to execute the creation
                    aTerminal.green(`Database '${DBNAME}' has been successfully created...\n`);
                    await noDbPool.query(`CREATE DATABASE IF NOT EXISTS ${DBNAME}`);
                } catch (error) 
                {
                    throw new Error(`Failed to create database: ${error.message}`);
                }
        }
        else
        {
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
        if (error.message.includes("Unknown database")) 
        {
            aTerminal.magenta(`last attempt to create the DB ${DBNAME}\n`);
            await createUserDB(pool,DBNAME);

        }
    }

    aTerminal.yellow("Press 'Enter' to return to the menu...");
    aTerminal.inputField({}, (err, input) => {
        displayMenu(true);
    });
}


/**
 * Adds a new user to the database.
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
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
  
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
  
      const values = [u_user_id, u_name, u_email, u_mobile, hashedPassword, u_image_path];
      const [result] = await pool.query(query, values);
      
      terminal.green(`User successfully added with UUID: ${u_user_id}\n`);
      return result;
    } catch (error) {
      terminal.red(`Error adding user: ${error.message}\n`);
      return null;
    }
  }

  /**
 * Retrieves all users from the database.
 * @param {Object} terminal - The terminal interface.
 * @returns {Promise<Array>} An array of user objects.
 */
export async function showUsers(terminal) {
    try {
      const query = `SELECT * FROM ${DBUSERTABLE};`;
      const [rows] = await pool.query(query);
  
      terminal.green(`Retrieved ${rows.length} users from the database.\n`);
      return rows;
    } catch (error) {
      terminal.red(`Error retrieving users: ${error.message}\n`);
      return [];
    }
  }

  /**
 * Revokes a user by name by setting their status to inactive (0).
 * @param {Object} terminal - The terminal interface.
 * @param {string} userName - The name of the user to revoke.
 * @returns {Promise<void>}
 */
export async function revokeUserByName(terminal, userName) {
    try {
      const query = `
        UPDATE ${DBUSERTABLE}
        SET u_status = 0
        WHERE u_name = ?;
      `;
  
      const values = [userName];
      const [result] = await pool.query(query, values);
  
      if (result.affectedRows === 0) {
        terminal.red(`No user found with the name '${userName}'.\n`);
      } else {
        terminal.green(`User '${userName}' successfully revoked.\n`);
      }
      return result;
    } catch (error) {
      terminal.red(`Error revoking user: ${error.message}\n`);
      return null;
    }
  }


// Export the pool for use elsewhere in the application
export default pool;

// role: retrieve a user from the db to check its existence and its status. A part of the security.

// Import the database pool object from the configuration file
import pool from "./userDbManager.mjs";

/**
 * Fetches a user from the database by their email.
 *
 * @param {string} email - The email of the user to fetch.
 * @returns {Object|null} - The user object if found, otherwise null.
 */
export const getUserByEmail = async (email) => {
  if (!email) { // Check if the email input is null or undefined, and return null if it is
    return null;
  }

  try {
    const authenticated = await pool.query(
      "SELECT * from user WHERE u_email = ? AND u_deleted_status = 0 AND u_status = 1",
      [email]
    ); // Perform a SQL query to find the user in the database who matches the given email and has not been deleted (`u_deleted_status = 0`) and is active (`u_status = 1`)
    const [rows] = authenticated; // Destructure the result to get the rows from the query result

    if (Object.keys(rows).length === 0) { // Check if the query returned any rows; if none, return null
      return null;
    }
    return rows[0]; // Return the first row of the results (the user data)
  } catch (error) {
    return null; // If an error occurs during the database operation, return null
  }
};

/**
 * Fetches a user from the database by their user ID.
 *
 * @param {number} refId - The user ID of the user to fetch.
 * @returns {Object|null} - The user object if found, otherwise null.
 */
export const getUserByUserId = async (refId) => {
  if (!refId) { // Check if the reference ID input is null or undefined, and return null if it is
    return null;
  }

  try {
    const authenticated = await pool.query(
      "SELECT * from user WHERE u_user_id = ? AND u_deleted_status = 0 AND u_status = 1",
      [refId]
    ); // Perform a SQL query to find the user in the database who matches the given user ID and has not been deleted (`u_deleted_status = 0`) and is active (`u_status = 1`)
    const [rows] = authenticated; // Destructure the result to get the rows from the query result

    if (Object.keys(rows).length === 0) { // Check if the query returned any rows; if none, return null
      return null;
    }
    return rows[0]; // Return the first row of the results (the user data)
  } catch (error) {
    return null; // If an error occurs during the database operation, return null
  }
};

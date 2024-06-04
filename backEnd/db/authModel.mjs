// Import the database pool object from the configuration file
import pool from "./userDbManager.mjs";

// Define an asynchronous function to fetch a user by email
export const getUserByEmail = async (email) => {
  // Check if the email input is null or undefined, and return null if it is
  if (!email) {
    return null;
  }

  try {
    // Perform a SQL query to find the user in the database who matches the given email
    // and has not been deleted (`u_deleted_status = 0`) and is active (`u_status = 1`)
    const authenticated = await pool.query(
      "SELECT * from user WHERE u_email = ? AND u_deleted_status = 0 AND u_status = 1",
      [email]
    );
    // Destructure the result to get the rows from the query result
    const [rows] = authenticated;

    // Check if the query returned any rows; if none, return null
    if (Object.keys(rows).length === 0) {
      return null;
    }
    // Return the first row of the results (the user data)
    return rows[0];
  } catch (error) {
    // If an error occurs during the database operation, return null
    return null;
  }
};

// Define an asynchronous function to fetch a user by their user ID
export const getUserByUserId = async (refId) => {
  // Check if the reference ID input is null or undefined, and return null if it is
  if (!refId) {
    return null;
  }

  try {
    // Perform a SQL query to find the user in the database who matches the given user ID
    // and has not been deleted (`u_deleted_status = 0`) and is active (`u_status = 1`)
    const authenticated = await pool.query(
      "SELECT * from user WHERE u_user_id = ? AND u_deleted_status = 0 AND u_status = 1",
      [refId]
    );
    // Destructure the result to get the rows from the query result
    const [rows] = authenticated;

    // Check if the query returned any rows; if none, return null
    if (Object.keys(rows).length === 0) {
      return null;
    }
    // Return the first row of the results (the user data)
    return rows[0];
  } catch (error) {
    // If an error occurs during the database operation, return null
    return null;
  }
};

// role: helper functions for handling dates and sending success or error responses, mainly used across the application

// Imports necessary functions from the 'date-fns' and 'date-fns-tz' libraries for handling dates.
import { add, endOfDay, getUnixTime } from "date-fns";
import { toZonedTime } from "date-fns-tz";

/**
 * Processes dates based on input parameters.
 *
 * @param {number} value - The value to add (e.g., number of seconds or days).
 * @param {string} type - The type of date operation ('seconds' or 'daysEnd').
 * @param {string} action - The action to perform ('inc' for increment).
 * @returns {number|null} - The difference in seconds between the final and current date as Unix time or null if an error occurs.
 */
export function dateTimeHandler(value, type, action) {
  if (!value || !type || !action) { // Checks if the necessary parameters 'value', 'type', or 'action' are not provided.
    return null; // If any are missing, returns null to indicate a failure to process the date.
  }

  const timeZone = "CET"; // Defines the time zone to be used for all date-time operations within this function.

  try {
    if (type === "seconds") { // Handles date operations when the type is specified as "seconds".
      if (action === "inc") { // If the action is to increment ('inc'), performs the operation.
        const currentDate = toZonedTime(new Date(), timeZone); // Converts the current date to the specified time zone.
        const finalDate = add(currentDate, { seconds: value }); // Adds the specified number of seconds to the current date.
        return getUnixTime(finalDate) - getUnixTime(currentDate); // Returns the difference in seconds between the final and current date as Unix time.
      }
    }

    if (type === "daysEnd") { // Handles date operations when the type is specified as "daysEnd".
      if (action === "inc") { // If the action is to increment, performs the operation.
        const currentDate = toZonedTime(new Date(), timeZone); // Converts the current date to the specified time zone.
        const incrementedDate = add(currentDate, { days: value }); // Adds the specified number of days to the current date.
        const finalDate = endOfDay(incrementedDate); // Adjusts the incremented date to the end of that day.
        return getUnixTime(finalDate) - getUnixTime(currentDate); // Returns the difference in seconds between the final and current date as Unix time.
      }
    }
  } catch (error) {
    console.error(error); // Catches and logs any errors that occur during date manipulation.
  }

  return null; // Returns null if none of the conditions are met or if an error occurs.
}

/**
 * Sends a successful JSON response for HTTP requests.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {string} message - The success message.
 * @param {Object} data - The additional data to include in the response.
 * @returns {Object} - The JSON response object.
 */
export function sendSuccessResponse(req, res, message, data) {
  const auth = {}; // Initializes an object to hold authentication-related information.
  const { authenticated, accessToken, refreshToken, userData } = req; // Destructures necessary properties from the request to check authentication status and user data.

  if (authenticated) { // Adds authentication status to the response if present.
    auth.authenticated = authenticated;
  }
  if (accessToken) { // Adds access token to the response if present.
    auth.accessToken = accessToken;
  }
  if (refreshToken) { // Adds refresh token to the response if present.
    auth.refreshToken = refreshToken;
  }
  if (userData) { // Adds user data to the response if present.
    auth.user = userData;
  }

  return res.json({
    success: true,
    auth: auth,
    message: message ? message : "", // Ensures a message is always present, even if it's empty.
    data: data ? data : null, // Includes data if provided, otherwise null.
    error: null, // No error on successful response.
  });
}

/**
 * Sends an error JSON response for HTTP requests.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {number} code - The HTTP status code for the error.
 * @param {string} errorMsg - The error message.
 * @param {Object} data - The additional data to include in the response.
 * @returns {Object} - The JSON response object.
 */
export function sendErrorResponse(req, res, code, errorMsg, data) {
  const statusCode = code ? code : 500; // Determines the status code for the error response, defaulting to 500 if not specified.
  const errorMessage = errorMsg ? errorMsg : "Error in server!"; // Sets the error message, defaulting to a generic server error message if not specified.

  return res.status(statusCode).json({
    success: false, // Indicates the response is due to an error.
    message: "", // Empty message field for error responses.
    auth: null, // No authentication data included in error responses.
    data: data ? data : null, // Includes additional data if provided, otherwise null.
    error: { // Details of the error.
      code: statusCode, // HTTP status code for the error.
      message: errorMessage, // Descriptive error message.
    },
  });
}

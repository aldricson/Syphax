// Imports necessary functions from the 'date-fns' and 'date-fns-tz' libraries for handling dates.
import { add, endOfDay, getUnixTime } from "date-fns";
import { toZonedTime } from "date-fns-tz";

// Defines a function 'dateTimeHandler' which processes dates based on input parameters.
export function dateTimeHandler(value, type, action) {
  // Checks if the necessary parameters 'value', 'type', or 'action' are not provided.
  // If any are missing, returns null to indicate a failure to process the date.
  if (!value || !type || !action) {
    return null;
  }

  // Defines the time zone to be used for all date-time operations within this function.
  const timeZone = "CET";

  try {
    // Handles date operations when the type is specified as "seconds".
    if (type === "seconds") {
      // If the action is to increment ('inc'), performs the operation.
      if (action === "inc") {
        // Converts the current date to the specified time zone.
        const currentDate = toZonedTime(new Date(), timeZone);
        // Adds the specified number of seconds to the current date.
        const finalDate = add(currentDate, { seconds: value });
        // Returns the difference in seconds between the final and current date as Unix time.
        return getUnixTime(finalDate) - getUnixTime(currentDate);
      }
    }

    // Handles date operations when the type is specified as "daysEnd".
    if (type === "daysEnd") {
      // If the action is to increment, performs the operation.
      if (action === "inc") {
        // Converts the current date to the specified time zone.
        const currentDate = toZonedTime(new Date(), timeZone);
        // Adds the specified number of days to the current date.
        const incrementedDate = add(currentDate, { days: value });
        // Adjusts the incremented date to the end of that day.
        const finalDate = endOfDay(incrementedDate);
        // Returns the difference in seconds between the final and current date as Unix time.
        return getUnixTime(finalDate) - getUnixTime(currentDate);
      }
    }
  } catch (error) {
    // Catches and logs any errors that occur during date manipulation.
    console.error(error);
  }

  // Returns null if none of the conditions are met or if an error occurs.
  return null;
}

// A function to send a successful JSON response for HTTP requests.
export function sendSuccessResponse(req, res, message, data) {
    const auth = {};  // Initializes an object to hold authentication-related information.
    // Destructures necessary properties from the request to check authentication status and user data.
    const { authenticated, accessToken, refreshToken, userData } = req;
  
    // Adds authentication status to the response if present.
    if (authenticated) {
      auth.authenticated = authenticated;
    }
    // Adds access token to the response if present.
    if (accessToken) {
      auth.accessToken = accessToken;
    }
    // Adds refresh token to the response if present.
    if (refreshToken) {
      auth.refreshToken = refreshToken;
    }
    // Adds user data to the response if present.
    if (userData) {
      auth.user = userData;
    }
    // Returns the response in JSON format with success status and any provided message and data.
    return res.json({
      success: true,
      auth: auth,
      message: message ? message : "",  // Ensures a message is always present, even if it's empty.
      data: data ? data : null,         // Includes data if provided, otherwise null.
      error: null,                      // No error on successful response.
    });
  }
  
  // A function to send an error JSON response for HTTP requests.
  export function sendErrorResponse(req, res, code, errorMsg, data) {
    // Determines the status code for the error response, defaulting to 500 if not specified.
    const statusCode = code ? code : 500;
    // Sets the error message, defaulting to a generic server error message if not specified.
    const errorMessage = errorMsg ? errorMsg : "Error in server!";
    // Sends the error response in JSON format with the specified status code.
    return res.status(statusCode).json({
      success: false,            // Indicates the response is due to an error.
      message: "",               // Empty message field for error responses.
      auth: null,                // No authentication data included in error responses.
      data: data ? data : null,  // Includes additional data if provided, otherwise null.
      error: {                   // Details of the error.
        code: statusCode,        // HTTP status code for the error.
        message: errorMessage,   // Descriptive error message.
      },
    });
  }
  
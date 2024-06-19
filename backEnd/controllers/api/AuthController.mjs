// role: This file handles the login, token verification, and logout processes for user authentication.

// Import the authentication function from the authService.
import { authenticateUser } from "../../authentificationServices/authSrv.mjs"; 
// Import the function to verify refresh tokens from jwtService.
import { verifyRefreshToken } from "../../authentificationServices/jwtService.mjs"; 
// Import utility functions from globals.
import {
  dateTimeHandler, // Utility function for handling dates.
  sendErrorResponse, // Utility function for sending error responses.
  sendSuccessResponse, // Utility function for sending success responses.
} from "../../globals/globals.mjs"; 

/**
 * Handles the login process, authenticating the user and setting cookies.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Object} - The response object indicating success or failure of login.
 */
export const login = async (req, res) => {
  const { email, password, staySignedIn } = req.body || {}; // Destructure email, password, and staySignedIn flag from the request body; default to empty object if none provided.
  const errorMessage = "Failed to authenticate!"; // Define a default error message for failed authentication.

  if (!email || !password) { // Check if email or password is missing.
    return sendErrorResponse(req, res, 401, errorMessage); // Return an error response if email or password is missing.
  }

  let expiryTime = ""; // Initialize a variable to hold the expiry time of the token.
  try {
    expiryTime = staySignedIn
      ? dateTimeHandler(15, "daysEnd", "inc")  // Set expiry to end of 15th day if staySignedIn is true.
      : dateTimeHandler(1, "daysEnd", "inc");  // Set expiry to end of 1st day if staySignedIn is false.
  } catch (error) {
    return sendErrorResponse(req, res, 500, "Error calculating token expiry time."); // Return error response if calculating expiry time fails.
  }

  const auth = await authenticateUser(email, password, expiryTime); // Authenticate the user with provided credentials and calculated expiry time.

  if (!auth || !auth.user || !auth.refreshToken || !auth.accessToken) { // Check if authentication was not successful or if any expected auth properties are missing.
    return sendErrorResponse(req, res, 401, errorMessage); // Return an error response if authentication fails.
  }

  res.cookie("yttmrtck", auth.refreshToken, {
    httpOnly: true,  // Prevents client-side JavaScript from reading the cookie.
    secure: process.env.APP_MODE === "prod" ? true : false,  // Use secure cookies in production.
    sameSite: "Lax",  // Lax sameSite setting to prevent CSRF.
    path: "/",  // The cookie is available to all paths.
    maxAge: expiryTime * 1000,  // Set cookie expiry time in milliseconds.
  }); // Set a cookie with the refresh token in the response, configure properties for security.

  req.refreshToken = auth.refreshToken; // Attach the refresh token to the request object.
  req.accessToken = auth.accessToken; // Attach the access token to the request object.
  req.userData = auth.user; // Attach the user data to the request object.
  req.authenticated = auth.authenticated; // Attach the authentication status to the request object.

  return sendSuccessResponse(req, res, "Successfully logged in!", auth); // Return a success response with the login success message and auth details.
};

/**
 * Verifies the refresh token in the request and updates tokens if valid.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} - The response object indicating success or failure of token verification.
 */
export const verifyTokenController = async (req, res, next) => {
  const isVerified = await verifyRefreshToken(req); // Verify the refresh token in the request.
  
  if (isVerified && isVerified.authStatus === 1 && isVerified.data.accessToken && isVerified.data.userData) { // Check if token verification was successful and contains necessary data.
    if (isVerified.updatedToken) { // Update the request with new token and user data if token was updated.
      req.accessToken = isVerified.data.accessToken; // Update the request object with the new access token.
      req.userData = isVerified.data.userData; // Update the request object with the new user data.
    }
    return sendSuccessResponse(req, res, "Token valid!"); // Return a success response stating the token is valid.
  } else {
    return sendErrorResponse(req, res, 401, "Verification failed!"); // Return an error response if token verification failed.
  }
};

/**
 * Handles user logout by clearing the refresh token cookie.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Object} - The response object indicating success of logout.
 */
export const logoutController = (req, res) => {
  res.clearCookie("yttmrtck"); // Clear the refresh token cookie.
  return sendSuccessResponse(req, res, "Successfully logged out!"); // Return a success response indicating successful logout.
};

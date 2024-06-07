// Imports the 'verifyRefreshToken' function from a local jwtService module to handle token verification.
import { verifyRefreshToken } from "./jwtService.mjs";
// Imports the 'sendErrorResponse' function from a global utility module to handle error responses uniformly.
import { sendErrorResponse } from "../globals/globals.mjs";
// Imports the WebSocket utility to send messages to specific clients.
import { sendMessageToClient } from '../mainServer/websocketUtils.mjs';

/**
 * @brief Middleware to verify JWT tokens for routes requiring authentication.
 * 
 * This middleware function verifies the JWT token provided in the request.
 * If the token is valid and authentication succeeds, the request proceeds to the next middleware or route handler.
 * If the token is invalid, it sends an appropriate error response and optionally sends a WebSocket message to the client.
 * 
 * @param {Object} req - Express request object containing headers and cookies.
 * @param {Object} res - Express response object used to send responses back to the client.
 * @param {Function} next - Function to pass control to the next middleware or route handler.
 * @returns {Promise<void>}
 */
export const verifyTokenMiddleware = async (req, res, next) => {
  // Calls 'verifyRefreshToken' with the current request to check token validity and get new tokens if necessary.
  const isVerified = await verifyRefreshToken(req);
  // Checks if the token verification was successful and all necessary data is present.
  if (
    isVerified &&
    isVerified.authStatus === 1 &&
    isVerified.data.accessToken &&
    isVerified.data.userData
  ) {
    // If a new access token was issued during the refresh process, update the request object with the new token and user data.
    if (isVerified.updatedToken) {
      req.accessToken = isVerified.data.accessToken;
      req.userData = isVerified.data.userData;
    }
    next(); // Proceeds to the next middleware or route handler since authentication was successful.
  } else {
    // If verification fails, send a WebSocket message to the client if socket-id is provided.
    const socketId = req.headers['socket-id']; // Assuming socket ID is passed in headers
    if (socketId) {
      sendMessageToClient(socketId, 'invalidToken', 'Your token is invalid or expired.');
    }
    return sendErrorResponse(req, res, 401, "Verification failed!");
  }
};

/**
 * @brief Function to verify JWT tokens for static routes.
 * 
 * This function verifies the JWT token provided in the request without passing through the middleware chain.
 * It is typically used for static routes that require user verification.
 * 
 * @param {Object} req - Express request object containing headers and cookies.
 * @returns {Promise<boolean|null>} Returns true if verification is successful, null otherwise.
 */
export const verifyTokenForStatic = async (req) => {
  // Similar to the middleware, it calls 'verifyRefreshToken' to check the validity of the user's tokens.
  const isVerified = await verifyRefreshToken(req);
  // Verifies the token just like the middleware and checks all required fields are present and correct.
  if (
    isVerified &&
    isVerified.authStatus === 1 &&
    isVerified.data.accessToken &&
    isVerified.data.userData
  ) {
    // Updates the request object with new token and user data if a new token was issued.
    if (isVerified.updatedToken) {
      req.accessToken = isVerified.data.accessToken;
      req.userData = isVerified.data.userData;
    }
    return true; // Returns true indicating that the token verification was successful.
  } else {
    // Returns null if the verification process fails, indicating no valid token or user data was available.
    return null;
  }
};

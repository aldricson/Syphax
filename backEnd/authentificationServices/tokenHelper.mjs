// Imports the 'verifyRefreshToken' function from a local jwtService module to handle token verification.
import { verifyRefreshToken } from "./jwtService.mjs";
// Imports the 'sendErrorResponse' function from a global utility module to handle error responses uniformly.
import { sendErrorResponse } from "../globals/globals.mjs";

// Exporting an asynchronous middleware function that verifies tokens for routes requiring authentication.
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
    // If verification fails, sends a 401 Unauthorized response with a custom error message.
    return sendErrorResponse(req, res, 401, "Verification failed!");
  }
};

// Exporting an asynchronous function intended for static routes that need user verification without middleware steps.
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

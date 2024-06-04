// Import the authentication function from the authService.
import { authenticateUser } from "../../authentificationServices/authSrv.mjs";
// Import the function to verify refresh tokens from jwtService.
import { verifyRefreshToken } from "../../authentificationServices/jwtService.mjs";
// Import utility functions for handling dates, success, and error responses.
import {
  dateTimeHandler,
  sendErrorResponse,
  sendSuccessResponse,
} from "../../globals/globals.mjs";

// Define an asynchronous function 'login' for the login process.
export const login = async (req, res) => {
  // Destructure email, password, and staySignedIn flag from the request body; default to empty object if none provided.
  const { email, password, staySignedIn } = req.body || {};

  // Define a default error message for failed authentication.
  const errorMessage = "Failed to authenticate!";

  // Check if email or password is missing and return an error response if so.
  if (!email || !password) {
    return sendErrorResponse(req, res, 401, errorMessage);
  }

  // Initialize a variable to hold the expiry time of the token.
  let expiryTime = "";
  // Attempt to calculate the expiry time based on whether the user opted to stay signed in.
  try {
    expiryTime = staySignedIn
      ? dateTimeHandler(15, "daysEnd", "inc")  // Set expiry to end of 15th day.
      : dateTimeHandler(1, "daysEnd", "inc");  // Set expiry to end of 1st day.
  } catch (error) {}

  // If calculating expiry time fails and it remains empty, exit the function early.
  if (!expiryTime) {
    return null;
  }

  // Authenticate the user with provided credentials and calculated expiry time.
  const auth = await authenticateUser(email, password, expiryTime);

  // Check if authentication was not successful or if any expected auth properties are missing.
  if (!auth || !auth.user || !auth.refreshToken || !auth.accessToken) {
    return sendErrorResponse(req, res, 401, errorMessage);
  }

  // Set a cookie with the refresh token in the response, configure properties for security.
  res.cookie("yttmrtck", auth.refreshToken, {
    httpOnly: true,  // Prevents client-side JavaScript from reading the cookie.
    secure: process.env.APP_MODE === "prod" ? true : false,  // Use secure cookies in production.
    sameSite: "Lax",  // Lax sameSite setting to prevent CSRF.
    path: "/",  // The cookie is available to all paths.
    maxAge: expiryTime * 1000,  // Set cookie expiry time in milliseconds.
  });

  // Attach the refresh token, access token, user data, and authentication status to the request object.
  req.refreshToken = auth.refreshToken;
  req.accessToken = auth.accessToken;
  req.userData = auth.user;
  req.authenticated = auth.authenticated;

  // Return a success response with the login success message and auth details.
  return sendSuccessResponse(req, res, "Successfully logged in!", auth);
};

// Define an asynchronous function to verify a token.
export const verifyTokenController = async (req, res, next) => {
  // Verify the refresh token in the request.
  const isVerified = await verifyRefreshToken(req);
  // Check if token verification was successful and contains necessary data.
  if (
    isVerified &&
    isVerified.authStatus === 1 &&
    isVerified.data.accessToken &&
    isVerified.data.userData
  ) {
    // Update the request with new token and user data if token was updated.
    if (isVerified.updatedToken) {
      req.accessToken = isVerified.data.accessToken;
      req.userData = isVerified.data.userData;
    }
    // Return a success response stating the token is valid.
    return sendSuccessResponse(req, res, "Token valid!");
  } else {
    // Return an error response if token verification failed.
    return sendErrorResponse(req, res, 401, "Verification failed!");
  }
};

// Define a function to handle user logout.
export const logoutController = (req, res) => {
  // Clear the refresh token cookie.
  res.clearCookie("yttmrtck");
  // Return a success response indicating successful logout.
  return sendSuccessResponse(req, res, "Successfully logged out!");
};

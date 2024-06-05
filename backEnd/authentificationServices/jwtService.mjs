import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
import {
  cryptoAESDecryption,
  cryptoAESEncryption,
} from "./cryptoService.mjs";

import { getUserByUserId } from "../db/authModel.mjs";

const rootDir = process.cwd();
const privateKeyPath = path.join(rootDir, "./certs/jwtRS256.key");
const publicKeyPath = path.join(rootDir, "./certs/jwtRS256.key.pub");
const privateKey = await fs.readFile(privateKeyPath);
const publicKey = await fs.readFile(publicKeyPath);

// This exports an asynchronous function named 'sign' that takes 'data' and an optional 'seconds' parameter.
// The 'seconds' parameter defaults to the number of seconds in 30 days.
export const sign = async (data, seconds = 30 * 60 * 60 * 24) => {
    // Checks if the data parameter is present, returns null if not to avoid processing empty or undefined data.
    if (!data) {
      return null;
    }
  
    try {
      // Sets up the options for the JWT signing, specifying the algorithm (RS256 for RSA signature) and the expiration time.
      const options = { algorithm: "RS256", expiresIn: seconds };
  
      // Generates a JWT token with the provided data (wrapped in an object under 'payload') using the private key and the defined options.
      const token = jwt.sign({ payload: data }, privateKey, options);
  
      // Returns the generated token if signing was successful.
      return token;
    } catch (error) {
      // Logs any error that occurs during the token generation to the console for debugging.
      console.error(error);
  
      // Returns null if there is an exception, indicating that token generation failed.
      return null;
    }
  };
  

// Exports a function named 'verifyToken' that takes a 'token' as its argument.
export const verifyToken = (token) => {
    // Checks if a token is provided; if not, returns null to prevent further processing.
    if (!token) {
      return null;
    }
  
    try {
      // Attempts to verify the token using the public key and RS256 algorithm.
      // If the token is valid, the decoded token is returned.
      return jwt.verify(token, publicKey, { algorithm: "RS256" });
    } catch (error) {
      // If verification fails (e.g., token is expired, invalid, or tampered), logs the error to the console.
      console.error(error);
  
      // Returns null if an error occurs during token verification, indicating the verification failed.
      return null;
    }
  };
  

// Exports an asynchronous function named 'verifyRefreshToken' which processes an HTTP request to handle user authentication through tokens.
export const verifyRefreshToken = async (req) => {
    let userData = null; // Variable to store decrypted user data if found.
    
    // Initializes the default response data structure indicating the authentication status, token state, and user data.
    const responseData = {
      authStatus: 0,           // 0 indicates the user is not authenticated.
      updatedToken: false,     // Indicates if a new token has been issued.
      data: {
        accessToken: null,     // Placeholder for a potentially new access token.
        userData: null,        // Placeholder for user data if authenticated.
      },
    };
  
    // Extracts the access token from the Authorization header of the request if it exists.
    let accessTok =
      req.headers?.authorization && req.headers?.authorization.split(" ")[1]
        ? req.headers?.authorization.split(" ")[1]
        : "";
  
    // Retrieves the refresh token from cookies, specifically the 'yttmrtck' cookie.
    const refreshTok = req.cookies?.yttmrtck;
  
    // If both access token and refresh token are absent, returns the default response data immediately.
    if (!accessTok && !refreshTok) {
      return responseData;
    }
  
    // Verifies the access token's validity using the verifyToken function.
    const accessTokenValid = verifyToken(accessTok);
  
    // If the access token is invalid or does not contain expected payload data, process the refresh token.
    if (!accessTokenValid || !accessTokenValid.payload) {
      // Verifies the refresh token's validity.
      const refreshTokenValid = verifyToken(refreshTok);
      if (refreshTokenValid && refreshTokenValid.payload) {
        // Attempts to decrypt the user data encoded in the refresh token.
        const userDec = await cryptoAESDecryption(
          refreshTokenValid.payload
        ).catch(() => null); // Catches and handles any decryption errors by returning null.
  
        if (userDec) {
          // Retrieves user details from the database using the decrypted user ID.
          const user = await getUserByUserId(userDec);
          if (user) {
            // Prepares the user data to be returned in the response.
            const userData = {
              id: user.u_user_id,
              name: user.u_name,
              email: user.u_email,
              mobile: user.u_mobile,
              image: user.u_image,
            };
  
            // Re-encrypts the user data for inclusion in a new access token.
            const encUser = await cryptoAESEncryption(
              JSON.stringify(userData)
            ).catch(() => null); // Handles any encryption errors by returning null.
  
            // Generates a new access token with a short expiry (2 minutes).
            const accessToken = await sign(encUser, 2 * 60).catch(() => null);
  
            // Updates the response data with the new access token and user details.
            responseData.updatedToken = true;
            responseData.authStatus = 1;
            responseData.data.accessToken = accessToken;
            responseData.data.userData = userData;
            return responseData; // Returns the updated response data.
          }
        }
      }
    } else {
      // If the access token is still valid, decrypts the payload to obtain user data.
      userData = await cryptoAESDecryption(accessTokenValid.payload).catch(
        () => null // Handles decryption errors by returning null.
      );
    }
  
    // If the access token is valid and userData is successfully obtained, updates the response data.
    if (accessTokenValid && userData) {
      responseData.authStatus = 1;
      responseData.data.accessToken = accessTok;
      responseData.data.userData = userData;
    }
  
    // Returns the final response data with either updated or current authentication status and tokens.
    return responseData;
  };
  
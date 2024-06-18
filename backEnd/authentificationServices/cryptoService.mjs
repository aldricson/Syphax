// role: This file provides functions for AES encryption and decryption using Node.js crypto module.

// Importing the 'crypto' module from Node.js which provides cryptographic functionality.
import crypto from "crypto";

// Exporting an asynchronous function for AES encryption.
export async function cryptoAESEncryption(text) {
  try {
    // Checks if text input is non-empty.
    if (text) {
      const algorithm = "aes-256-cbc";  // Specifies the AES encryption algorithm with a 256-bit key and CBC mode.
      // Generates a cryptographic key from a predefined environment variable 'AES_ENC_KEY' using scrypt algorithm,
      // with 'salt' as the salt, and the number of key bytes specified by 'AES_ENC_SALT' environment variable.
      const key = crypto.scryptSync(
        process.env.AES_ENC_KEY,
        "salt",
        parseInt(process.env.AES_ENC_SALT)
      );
      const iv = crypto.randomBytes(16);  // Generates a 16-byte initialization vector (IV) randomly.
      const cipher = crypto.createCipheriv(algorithm, key, iv);  // Creates a cipher instance using the algorithm, key, and IV.
      let encrypted = cipher.update(text, "utf8", "hex");  // Encrypts the text and outputs it in hexadecimal format.
      encrypted += cipher.final("hex");  // Finalizes the encryption and appends the result.
      return `i$${iv.toString("hex")}$e$${encrypted}`;  // Returns the IV and encrypted data formatted with specific delimiters.
    }
  } catch (error) {
    // Logs any encryption errors to the console.
    console.error(`Error Enc: ${error.message}`);
  }
  return null;  // Returns null if the function fails due to an error or empty input.
}

// Exporting an asynchronous function for AES decryption.
export async function cryptoAESDecryption(encrypted) {
  try {
    // Checks if encrypted input is non-empty.
    if (encrypted) {
      const parts = encrypted.split("$");  // Splits the encrypted string by '$' to extract the IV and encrypted data.
      // Ensures the format is correct: starts with 'i', the IV, 'e', and the encrypted data.
      if (parts.length === 4 && parts[0] === "i" && parts[2] === "e") {
        const iv = Buffer.from(parts[1], "hex");  // Recreates the IV from its hexadecimal string.
        const encryptedData = parts[3];  // Extracts the encrypted data part.
        const algorithm = "aes-256-cbc";  // Specifies the AES decryption algorithm as before.
        // Generates the decryption key as in the encryption function.
        const key = crypto.scryptSync(
          process.env.AES_ENC_KEY,
          "salt",
          parseInt(process.env.AES_ENC_SALT)
        );
        const decipher = crypto.createDecipheriv(algorithm, key, iv);  // Creates a decipher instance using the algorithm, key, and IV.
        let decrypted = decipher.update(encryptedData, "hex", "utf8");  // Decrypts the data to utf8 format from hex.
        decrypted += decipher.final("utf8");  // Finalizes the decryption and appends the result.
        return decrypted;  // Returns the decrypted text.
      } else {
        // Throws an error if the format of the encrypted data does not meet expected standards.
        throw new Error("An error occurred while decrypting the data");
      }
    }
  } catch (error) {
    // Logs any decryption errors to the console.
    console.error(`Error Enc: ${error.message}`);
  }
  return null;  // Returns null if the function fails due to an error or incorrect formatting.
}

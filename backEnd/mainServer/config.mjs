// role: Configuration module for environment variables and server settings

import dotenv from 'dotenv'; // Import dotenv for loading environment variables
import path from 'path'; // Import path module for handling file paths

const __dirname = path.resolve(); // Resolve the current directory path
const envPath = path.join(__dirname, '.env'); // Construct the path to the .env file
console.log('Resolved path:', envPath);

// Load environment variables from the .env file
const result = dotenv.config({ path: envPath });

if (result.error) {
    throw result.error; // Throw an error if loading the environment variables fails
}

const DBIP = process.env.DB_IP || '127.0.0.1'; // Set the default IP for the database
console.log("parameter readed db ip:", DBIP);

const PORT = process.env.PORT || 5010; // Set default port or use environment specified
console.log("parameter readed listening port:", PORT);

const DBNAME = process.env.APP_MODE === "prod"
    ? process.env.DB_NAME_LIVE // Use live database name in production
    : process.env.DB_NAME_DEV;  // Use development database name otherwise
console.log("parameter readed db name:", DBNAME);

const DBUSER = process.env.APP_MODE === "prod"
    ? process.env.DB_USER_LIVE // Use live user in production
    : process.env.DB_USER_DEV; // Use development user otherwise

const DBPASSWORD = process.env.APP_MODE === "prod"
      ? process.env.DB_USER_PASS_LIVE // If in production, use the live user password
      : process.env.DB_USER_PASS_DEV; // If in development, use the development user password
console.log("parameter readed db password: [SECRET]");

const CONNECTLIMIT = process.env.CONNECT_LIMIT; // Number of Syphax users at the same time
console.log("parameter readed connection limit:", CONNECTLIMIT);

const DBUSERTABLE = process.env.DB_USER_TABLE; // Name of the user table
console.log("parameter readed user table:", DBUSERTABLE);

export { PORT, DBIP, DBNAME, DBUSER, DBPASSWORD, CONNECTLIMIT, DBUSERTABLE };

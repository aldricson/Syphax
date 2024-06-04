// Configuration module for environment variables and server settings
import dotenv from 'dotenv';

const result=dotenv.config({ path: '../.env' }); // Load environment variables

if (result.error)
{
    throw result.error;
}

const DBIP = process.env.DB_IP || '127.0.0.1'; //Set the default Ip for the dataBase
//terminal.magenta("parameter readed db ip:", DBIP);
console.log("parameter readed db ip:", DBIP);

const PORT = process.env.PORT || 5010; // Set default port or use environment specified
console.log("parameter readed listening port:", PORT);


const DBNAME = process.env.APP_MODE === "prod"
    ? process.env.DB_NAME_LIVE // Use live database user in production
    : process.env.DB_NAME_DEV;  // Use development database user otherwise
console.log("parameter readed db name:", DBNAME);

const DBUSER = process.env.APP_MODE === "prod"
    ? process.env.DB_USER_LIVE // Use live user in production
    : process.env.DB_USER_DEV; // Use dev user otherwise


const DBPASSWORD = process.env.APP_MODE === "prod"
      ? process.env.DB_USER_PASS_LIVE // If in production, use the live user password
      : process.env.DB_USER_PASS_DEV; // If in development, use the development user password
console.log("parameter readed db password: [SECRET]");

const CONNECTLIMIT = process.env.CONNECT_LIMIT; //number of Syphax users at the same time
console.log("parameter readed connection limit:", CONNECTLIMIT);

const DBUSERTABLE = process.env.DB_USER_TABLE; //naùe of the user table
console.log("parameter readed user table:", DBUSERTABLE);



export { PORT, DBIP, DBNAME, DBUSER, DBPASSWORD, CONNECTLIMIT, DBUSERTABLE };

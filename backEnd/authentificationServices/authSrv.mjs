import bcrypt from "bcrypt";
import { sign } from "./jwtService.mjs";
import { cryptoAESEncryption } from "./cryptoService.mjs";
import { getUserByEmail } from "../db/authModel.mjs";
import { displayError, displaySucces } from "../terminalUi/terminalUi.mjs";
import { sendMessageToClient } from "../mainServer/websocketUtils.mjs"; 


export async function authenticateUser(email, password, expiryTime) {
  if (!email || !password || !expiryTime) {
    displayError(true,'user can not be identified');
    return null;
  }

  try {
    const user = await getUserByEmail(email);
    const dbHash = user.u_password;
    displaySucces(true,'password hash:\n');
    displaySucces(false,dbHash);
    if (user.u_email !== email || !dbHash) {
      displayError(false,'\nwrong email or password is null\n');
      return null;
    }

    //to compare php hash
    const hash = dbHash.replace(/^\$2y(.+)$/i, "$2b$1");
    const verified = await bcrypt.compare(password, hash).catch(() => false);

    if (!verified) {
      displayError('\npassword not verified\n');
      return null;
    }

    const userData = {
      id: user.u_user_id,
      name: user.u_name,
      email: user.u_email,
      mobile: user.u_mobile,
      image: user.u_image,
    };
    displaySucces(false,'\nuser datas:\n');
    displaySucces(false,JSON.stringify(userData));
    displaySucces(false,'\n\nuser ID:\n');
    displaySucces(false,JSON.stringify(user.u_user_id));

    const encUser = await cryptoAESEncryption(JSON.stringify(userData)).catch(
      () => null
    );
    const encUserId = await cryptoAESEncryption(user.u_user_id).catch(
      () => null
    );

    displaySucces(false,'\n\nencrypted datas:\n');
    displaySucces(false,encUser);
    displaySucces(false,'\nencrypted id:\n');
    displaySucces(false,encUserId);


    //1 day
    const refreshToken = await sign(encUserId, expiryTime).catch(() => null);
    //2 minutes
    const accessToken = await sign(encUser, 2 * 60).catch(() => null);
    displayMenu(true);
    return {
      refreshToken: refreshToken,
      accessToken: accessToken,
      user: userData,
      authenticated: true,
    };
  } catch (error) {
    displayError(error);
    return null;
  }
}
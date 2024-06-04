import { sendSuccessResponse } from "../../globals/globals.mjs";

export const dummyDataController = (req, res) => {
  return sendSuccessResponse(req, res, "Dummy data", ["toto", "tata"]);
};
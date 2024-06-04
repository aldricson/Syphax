// Import the express module to create router instances.
import express from "express";
// Import specific controller functions from the AuthController.
import {
  login,
  logoutController,
  verifyTokenController,
} from "../../../controllers/api/AuthController.mjs";

// Create a new router object to handle routes under a specific path.
const router = express.Router();

// Middleware to parse JSON bodies. This lets us handle raw JSON data sent in requests.
router.use(express.json());

// Middleware to parse URL-encoded bodies. `extended: true` allows for rich data objects.
router.use(
  express.urlencoded({
    extended: true,
  })
);

// Route that handles POST requests on "/login". It uses the `login` function from the imported controllers.
router.post("/login", login);

// Route that handles GET requests on "/verifyToken". It uses the `verifyTokenController` function from the imported controllers.
router.get("/verifyToken", verifyTokenController);

// Route that handles GET requests on "/logout". It uses the `logoutController` function from the imported controllers.
router.get("/logout", logoutController);

// Catch-all route for any other GET requests not previously matched.
router.get("*", function (req, res) {
  // Respond with a 404 status code and a JSON object describing the error.
  res.status(404).json({
    success: false,
    message: "",
    data: null,
    error: {
      code: 404,
      message: "Page not found!",
    },
  });
});

// Export the router as the default export of this module.
export default router;

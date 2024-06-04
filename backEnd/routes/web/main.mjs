// Import the express module to use its functionalities for routing and middleware.
import express from "express";
// Import a controller function to handle requests for dummy data.
import { dummyDataController } from "../../controllers/api/MainController.mjs";
// Import middleware that verifies tokens to secure routes.
import { verifyTokenMiddleware } from "../../authentificationServices/tokenHelper.mjs";

// Create a new router object to handle routes under a specific path prefix.
const router = express.Router();

// Middleware to parse JSON bodies. This allows us to handle JSON input in requests.
router.use(express.json());

// Middleware to parse URL-encoded bodies with the setting `extended: true`.
// This allows for objects and arrays to be URL-encoded which the querystring library does not allow.
router.use(
  express.urlencoded({
    extended: true,
  })
);

// Define a route that handles GET requests on "/dummydata".
// It uses the `verifyTokenMiddleware` to authenticate requests before handling them with `dummyDataController`.
router.get("/dummydata", verifyTokenMiddleware, dummyDataController);

// Define a catch-all route for any other GET requests not previously handled.
// This is useful for displaying a 404 Not Found error in JSON format.
router.get("*", function (req, res) {
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

// Export the configured router as the default export of this module.
export default router;

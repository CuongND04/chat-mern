import express from "express";
import {
  changePassword,
  checkAuth,
  login,
  logout,
  signup,
  updateProfile,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { authLimiter } from "../middleware/security.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  changePasswordSchema,
  loginSchema,
  signupSchema,
  updateProfileSchema,
} from "../schemas/auth.schema.js";

const router = express.Router();

router.post("/signup", authLimiter, validate(signupSchema), signup);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/logout", logout);

// put : there is something that we're updating
router.put("/update-profile", protectRoute, validate(updateProfileSchema), updateProfile);
router.put("/change-password", protectRoute, validate(changePasswordSchema), changePassword);

// check if user is authenticated
router.get("/check", protectRoute, checkAuth);
export default router;

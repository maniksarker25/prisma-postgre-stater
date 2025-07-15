import express from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { authController } from "./auth.controller";

const router = express.Router();

router.post("/login-user", authController.loginUser);
router.post("/refresh-token", authController.refreshToken);
router.post(
  "/change-password",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  authController.changePassword
);
router.post("/forgot-password", authController.forgetPassword);
router.post("/reset-password", authController.resetPassword);

export const authRoutes = router;

import { NextFunction, Request, Response, Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import normalUserValidations from "../normalUser/normalUser.validation";
import { userController } from "./user.controller";
import userValidations from "./user.validation";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";
import { uploadFile } from "../../../aws/multer-s3-uploader";

const router = Router();

router.post(
  "/register-user",
  validateRequest(normalUserValidations.registerNormalUserValidationSchema),
  userController.registerUser
);
router.post(
  "/verify-code",
  validateRequest(userValidations.verifyCodeValidationSchema),
  userController.verifyUserCode
);

router.post(
  "/resend-verify-code",
  validateRequest(userValidations.resendVerifyCodeSchema),
  userController.resendVerifyCode
);
router.get(
  "/get-my-profile",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.USER),
  userController.getMyProfile
);

router.patch(
  "/update-profile",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.USER),
  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(normalUserValidations.updateNormalUserValidationSchema),
  userController.updateMyProfile
);

router.patch("/change-status/:id", auth(UserRole.SUPER_ADMIN), userController.changeUserStatus);
router.delete(
  "/delete-account",
  auth(UserRole.USER),
  validateRequest(userValidations.deleteUserAccountValidationSchema),
  userController.deleteUserAccount
);

router.get(
  "/get-my-profile",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.USER),
  userController.getMyProfile
);

export const userRoutes = router;

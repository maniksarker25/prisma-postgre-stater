import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import userServices from "./user.service";

// Register a new user
const registerUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.registerUser(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User registered successfully. Please verify your email.",
    data: result,
  });
});

// Verify user account with code
const verifyUserCode = catchAsync(async (req: Request, res: Response) => {
  const { email, code } = req.body;
  const result = await userServices.verifyCode(email, Number(code));
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Account verified successfully",
    data: result,
  });
});

// Resend verification code
const resendVerifyCode = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  await userServices.resendVerifyCode(email);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Verification code resent successfully",
    data: null,
  });
});

// Delete user account
const deleteUserAccount = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const { password } = req.body;
  await userServices.deleteUserAccount(user, password);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Account deleted successfully",
    data: null,
  });
});

// Get my profile
const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const result = await userServices.getMyProfile(user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile data retrieved successfully",
    data: result,
  });
});

// Update my profile
const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const result = await userServices.updateUserProfile(user, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

// Toggle user status (block/unblock)
const changeUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await userServices.changeUserStatus(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User status updated successfully",
    data: result,
  });
});

export const userController = {
  registerUser,
  verifyUserCode,
  resendVerifyCode,
  deleteUserAccount,
  getMyProfile,
  updateMyProfile,
  changeUserStatus,
};

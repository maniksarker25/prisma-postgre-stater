import generateToken from "../../helpers/generateToken";
import prisma from "../../utils/prisma";
import bcrypt from "bcrypt";
import config from "../../config";
import AppError from "../../errors/appError";
import httpStatus from "http-status";
import verifyToken from "../../helpers/verifyToken";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import { TLoginUser } from "./auth.interface";
import sendEmail from "../../utils/sendEmail";
import resetPasswordEmailBody from "../../mailTemplate/resetPasswordEmailBody";

const generateVerifyCode = (): number => {
  return Math.floor(100000 + Math.random() * 900000);
};
const loginUserIntoDB = async (payload: TLoginUser) => {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
      isBlocked: false,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "This user does not exist");
  }

  const isPasswordMatched = await bcrypt.compare(payload?.password, user?.password);

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.BAD_REQUEST, "Password does not matched");
  }

  const jwtPayload = {
    id: user?.id,
    email: user?.email,
    role: user?.role,
  };
  const accessToken = generateToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );
  const refreshToken = generateToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
  };
};

// refresh token
const refreshToken = async (token: string) => {
  console.log("refresh token =>", token);
  let decodedData;
  try {
    decodedData = verifyToken(token, config.jwt_refresh_secret as string);
  } catch (error) {
    throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized ");
  }
  const user = await prisma.user.findUnique({
    where: {
      email: decodedData?.email,
      isBlocked: false,
    },
  });
  const jwtPayload = {
    email: user?.email,
    role: user?.role,
  };
  const accessToken = generateToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );
  return { accessToken };
};

// change password
const changePasswordIntoDB = async (
  user: any,
  payload: { currentPassword: string; newPassword: string }
) => {
  const userData = await prisma.user.findUnique({
    where: {
      email: user?.email,
      isBlocked: false,
    },
  });
  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  const isPasswordMatched = await bcrypt.compare(payload?.currentPassword, userData?.password);

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.FORBIDDEN, "Password does not matched");
  }
  const hashedPassword = await bcrypt.hash(payload?.newPassword, 12);
  await prisma.user.update({
    where: {
      email: user?.email,
    },
    data: {
      password: hashedPassword,
    },
  });

  return null;
};

// forget password into db
const forgetPasswordIntoDB = async (email: string) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email,
      isBlocked: false,
    },
  });

  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User does not exist!");
  }

  const resetCode = generateVerifyCode();

  sendEmail({
    email: isUserExist.email,
    subject: "Reset password code",
    html: resetPasswordEmailBody("Dear", resetCode),
  });
};

// reset password into db
const resetPasswordIntoDB = async (payload: { id: string; newPassword: string }, token: string) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      id: payload.id,
      isBlocked: false,
    },
  });

  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User not found!");
  }

  const isVarified = verifyToken(token, config.jwt_access_secret as string);

  if (!isVarified) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Something went wrong!");
  }

  const password = await bcrypt.hash(payload.newPassword, Number(config.bcrypt_salt_rounds));

  await prisma.user.update({
    where: {
      id: payload.id,
    },
    data: {
      password,
    },
  });
};

export const authService = {
  loginUserIntoDB,
  refreshToken,
  changePasswordIntoDB,
  forgetPasswordIntoDB,
  resetPasswordIntoDB,
};

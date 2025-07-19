import { NormalUser, PrismaClient, UserRole } from "@prisma/client";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import config from "../../config";
import AppError from "../../errors/appError";
import sendEmail from "../../utils/sendEmail";
import registrationSuccessEmailBody from "../../mailTemplate/registerSuccessEmail";
import { createToken } from "./user.utils";

const prisma = new PrismaClient();

const generateVerifyCode = (): number => {
  return Math.floor(100000 + Math.random() * 900000);
};

const registerUser = async (
  payload: NormalUser & {
    password: string;
    confirmPassword: string;
  }
) => {
  const { password, confirmPassword, ...userData } = payload;

  console.log("paswrd", password, confirmPassword);

  if (password !== confirmPassword) {
    throw new AppError(httpStatus.BAD_REQUEST, "Password and confirm password don't match");
  }

  const existingUser = await prisma.user.findUnique({ where: { email: userData.email } });
  if (existingUser) {
    throw new AppError(httpStatus.BAD_REQUEST, "This email already exists");
  }

  const verifyCode = generateVerifyCode();
  const codeExpireIn = new Date(Date.now() + 5 * 60000);

  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: userData.email,
        password,
        role: UserRole.USER,
        verifyCode,
        codeExpireIn,
        isVerified: false,
      },
    });

    let createdProfile;

    createdProfile = await tx.normalUser.create({
      data: {
        ...userData,
        userId: user.id,
      },
    });

    await tx.user.update({
      where: { id: user.id },
      data: { profileId: createdProfile.id },
    });

    await sendEmail({
      email: user.email,
      subject: "Activate Your Account",
      html: registrationSuccessEmailBody(createdProfile.name, verifyCode),
    });

    return createdProfile;
  });
};

const verifyCode = async (email: string, code: number) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.codeExpireIn && user.codeExpireIn < new Date()) {
    throw new AppError(httpStatus.BAD_REQUEST, "Verify code expired");
  }

  if (user.verifyCode !== code) {
    throw new AppError(httpStatus.BAD_REQUEST, "Code doesn't match");
  }

  const updatedUser = await prisma.user.update({
    where: { email },
    data: { isVerified: true },
  });

  const jwtPayload = {
    id: updatedUser.id,
    profileId: updatedUser?.profileId,
    email: updatedUser.email,
    role: updatedUser.role,
  };

  return {
    accessToken: createToken(jwtPayload, config.jwt_access_secret!, config.jwt_access_expires_in!),
    refreshToken: createToken(
      jwtPayload,
      config.jwt_refresh_secret!,
      config.jwt_refresh_expires_in!
    ),
  };
};

const resendVerifyCode = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const newCode = generateVerifyCode();

  const updatedUser = await prisma.user.update({
    where: { email },
    data: {
      verifyCode: newCode,
      codeExpireIn: new Date(Date.now() + 5 * 60000),
    },
  });

  await sendEmail({
    email,
    subject: "Resend Verification Code",
    html: registrationSuccessEmailBody("Dear", newCode),
  });

  return true;
};

const deleteUserAccount = async (jwtUser: JwtPayload, password: string) => {
  const user = await prisma.user.findUnique({ where: { id: jwtUser.id } });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const passwordMatch = await prisma.user.findFirst({
    where: {
      id: jwtUser.id,
      password: password, // You should hash and compare securely
    },
  });

  if (!passwordMatch) {
    throw new AppError(httpStatus.FORBIDDEN, "Password does not match");
  }

  await prisma.$transaction([
    prisma.normalUser.delete({ where: { id: user.profileId! } }),
    prisma.user.delete({ where: { id: user.id } }),
  ]);

  return true;
};

const getMyProfile = async (jwtUser: JwtPayload) => {
  switch (jwtUser.role) {
    case UserRole.USER:
      return prisma.normalUser.findUnique({ where: { id: jwtUser.profileId } });
    case UserRole.ADMIN:
      return prisma.admin.findUnique({ where: { id: jwtUser.profileId } });
    case UserRole.SUPER_ADMIN:
      return prisma.superAdmin.findUnique({ where: { id: jwtUser.profileId } });
    default:
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid role");
  }
};

const updateUserProfile = async (jwtUser: JwtPayload, payload: Partial<NormalUser>) => {
  switch (jwtUser.role) {
    case UserRole.USER:
      return prisma.normalUser.update({
        where: { id: jwtUser.profileId },
        data: payload,
      });
    case UserRole.ADMIN:
      return prisma.admin.update({
        where: { id: jwtUser.profileId },
        data: payload,
      });
    case UserRole.SUPER_ADMIN:
      return prisma.superAdmin.update({
        where: { id: jwtUser.profileId },
        data: payload,
      });
    default:
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid role");
  }
};

const changeUserStatus = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  return prisma.user.update({
    where: { id },
    data: { isBlocked: !user.isBlocked },
  });
};

const userServices = {
  registerUser,
  verifyCode,
  resendVerifyCode,
  deleteUserAccount,
  getMyProfile,
  updateUserProfile,
  changeUserStatus,
};

export default userServices;

import { UserRole } from "@prisma/client";
import jwt, { JwtPayload } from "jsonwebtoken";

export const createToken = (
  jwtPayload: { id: string; profileId: string | null; email: string; role: UserRole },
  secret: string,
  expiresIn: string
) => {
  const token = jwt.sign(jwtPayload, secret, {
    expiresIn: expiresIn,
  });
  return token;
};

export const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, secret) as JwtPayload;
};

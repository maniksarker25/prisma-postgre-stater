import { PrismaClient, UserRole } from "@prisma/client";
import config from "../src/app/config/index";
const prisma = new PrismaClient();

const superAdminData = {
  name: "Mr Admin",
  email: config.super_admin_email,
};

const seedSuperAdmin = async () => {
  const existingSuperAdmin = await prisma.user.findFirst({
    where: { role: UserRole.SUPER_ADMIN },
  });

  if (existingSuperAdmin) {
    console.log("Super Admin already exists");
    return;
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: config.super_admin_email as string,
          password: config.super_admin_password as string,
          role: UserRole.SUPER_ADMIN,
          isVerified: true,
        },
      });

      const superAdmin = await tx.superAdmin.create({
        data: {
          name: superAdminData.name,
          email: superAdminData.email as string,
          user: {
            connect: { id: user.id },
          },
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: { profileId: superAdmin.id },
      });

      return superAdmin;
    });

    console.log("Super Admin Created Successfully");
    return result;
  } catch (error) {
    console.error("Failed to seed Super Admin:", error);
    throw error;
  }
};

export default seedSuperAdmin;

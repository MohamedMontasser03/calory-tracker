import { prisma } from "../db/client";

export const doesUserExist = async (userId: string) => {
  const userCount = await prisma.user.count({
    where: {
      id: userId,
      admin: false,
    },
  });
  return userCount > 0;
};

export const getUserData = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  return user;
};

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

export const getUserData = (userId?: string) => {
  if (!userId) {
    return null;
  }
  const user = prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  return user;
};

export const getUserMaxCalories = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      maxCalories: true,
    },
  });
  return user?.maxCalories;
};

export const setUserMaxCalories = (userId: string, maxCalories: number) => {
  prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      maxCalories,
    },
  });
};

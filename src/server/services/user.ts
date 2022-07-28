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

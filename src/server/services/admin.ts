import { User } from "@prisma/client";
import { prisma } from "../db/client";

export const getUsers = (page: number, count: number = 10): Promise<User[]> => {
  const users = prisma.user.findMany({
    where: {
      admin: false,
    },
    skip: page * count,
    take: count,
  });
  return users;
};

export const getUserCount = (): Promise<number> => {
  const count = prisma.user.count({
    where: {
      admin: false,
    },
  });
  return count;
};

export const getAvgWeekCalories = async (): Promise<number> => {
  const [weekFoodEntries, userCount] = await Promise.all([
    prisma.foodEntry.findMany({
      where: {
        date: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          lte: new Date(),
        },
      },
      select: {
        calories: true,
      },
    }),
    getUserCount(),
  ]);
  const weekCalories = weekFoodEntries.reduce((acc, curr) => {
    return acc + curr.calories;
  }, 0);
  return weekCalories / userCount;
};

export const getNumOfFoodEntries = (endOfWeek: Date): Promise<number> => {
  const foodEntriesCount = prisma.foodEntry.count({
    where: {
      date: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        lte: endOfWeek,
      },
    },
  });
  return foodEntriesCount;
};

export const isAdmin = async (userId?: string): Promise<boolean> => {
  if (!userId) return false;
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  return user?.admin || false;
};

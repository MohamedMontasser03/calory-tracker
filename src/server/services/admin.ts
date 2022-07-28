import { User } from "@prisma/client";
import { prisma } from "../db/client";

export const getUsers = async (
  page: number,
  count: number = 10
): Promise<User[]> => {
  const users = await prisma.user.findMany({
    where: {
      admin: false,
    },
    skip: page * count,
    take: count,
  });
  return users;
};

export const getUserCount = async (): Promise<number> => {
  const count = await prisma.user.count();
  return count;
};

export const getAvgWeekCalories = async (): Promise<number> => {
  const weekFoodEntries = await prisma.foodEntry.findMany({
    where: {
      date: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        lte: new Date(),
      },
    },
    select: {
      calories: true,
    },
  });
  const weekCalories = weekFoodEntries.reduce((acc, curr) => {
    return acc + curr.calories;
  }, 0);
  return weekCalories / weekFoodEntries.length;
};

export const getNumOfFoodEntries = async (endOfWeek: Date): Promise<number> => {
  const foodEntriesCount = await prisma.foodEntry.count({
    where: {
      date: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        lte: endOfWeek,
      },
    },
  });
  return foodEntriesCount;
};

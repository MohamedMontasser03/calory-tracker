import { FoodEntry } from "@prisma/client";
import { prisma } from "../../server/db/client";

export const addFoodEntry = async (foodEntry: FoodEntry) => {
  const result = await prisma.foodEntry.create({
    data: {
      ...foodEntry,
    },
  });
  return result;
};
export const updateFoodEntry = async (foodEntry: FoodEntry) => {
  const result = await prisma.foodEntry.update({
    where: {
      id: foodEntry.id,
    },
    data: {
      ...foodEntry,
    },
  });
  return result;
};

export const listFoodEntries = async (
  userId: string,
  sd: string,
  ed: string
) => {
  const foodEntries = await prisma.foodEntry.findMany({
    where: {
      userId,
      date: {
        gte: new Date(new Date(sd).setHours(0, 0, 0, 0)),
        lte: new Date(new Date(ed).setHours(23, 59, 59, 999)),
      },
    },
  });
  return foodEntries;
};

export const deleteFoodEntries = async (entryId: string) => {
  await prisma.foodEntry.delete({
    where: {
      id: entryId,
    },
  });
};

export const getEarliestDate = async (userId: string) => {
  const foodEntry = await prisma.foodEntry.findFirst({
    where: {
      userId,
    },
    select: {
      date: true,
    },
    orderBy: {
      date: "asc",
    },
  });
  const earliestDate = foodEntry?.date;
  return earliestDate;
};

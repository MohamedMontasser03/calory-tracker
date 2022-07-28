import { FoodEntry } from "@prisma/client";
import { prisma } from "../../server/db/client";
import { setToMidnight } from "../../utils/date";

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
    orderBy: {
      date: "asc",
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

export const getDaysWithExcessCalories = async (
  userId: string,
  maxCalories: number
) => {
  const foodEntries = await prisma.foodEntry.findMany({
    where: {
      userId,
    },
    select: {
      date: true,
      calories: true,
    },
    orderBy: {
      date: "asc",
    },
  });
  const earliestDate = foodEntries[0]?.date;
  const caloriesInDays = foodEntries.reduce<Record<string, number>>(
    (acc, entry) => ({
      ...acc,
      [setToMidnight(entry.date).toLocaleString()]:
        (acc[setToMidnight(entry.date).toLocaleString()] || 0) + entry.calories,
    }),
    {}
  );
  const daysWithExcessCalories = Object.keys(caloriesInDays).filter(
    (day) => (caloriesInDays[day] || 0) > maxCalories
  );
  return { daysWithExcessCalories, earliestDate };
};

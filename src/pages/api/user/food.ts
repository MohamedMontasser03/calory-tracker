import { NextApiRequest, NextApiResponse } from "next";
import {
  Session,
  unstable_getServerSession as getServerSession,
} from "next-auth";
import { authOptions as nextAuthOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../server/db/client";
import { FoodEntry } from "@prisma/client";

const foodEntry = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, nextAuthOptions);

  if (session) {
    if (req.method === "POST") {
      const { foodEntry } = req.body;
      const result = await addFoodEntry(foodEntry);
      res.status(201).send(result);
    } else if (req.method === "GET") {
      const foodEntries = await listFoodEntries(session);
      res.send(foodEntries);
    } else if (req.method === "DELETE") {
      const {
        foodEntry,
      }: {
        foodEntry: FoodEntry;
      } = req.body;
      await deleteFoodEntries(foodEntry?.id);
      res.status(200);
    }
  } else {
    res.send({
      error:
        "You must be signed in to view the protected content on this page.",
    });
  }
};

const addFoodEntry = async (foodEntry: FoodEntry) => {
  const result = await prisma.foodEntry.create({
    data: {
      ...foodEntry,
    },
  });
  return result;
};

const listFoodEntries = async (session: Session) => {
  const foodEntries = await prisma.foodEntry.findMany({
    where: {
      userId: session.user?.id,
    },
  });
  return foodEntries;
};

const deleteFoodEntries = async (entryId: string) => {
  await prisma.foodEntry.delete({
    where: {
      id: entryId,
    },
  });
};

export default foodEntry;

import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { authOptions as nextAuthOptions } from "../auth/[...nextauth]";
import { FoodEntry } from "@prisma/client";
import {
  addFoodEntry,
  deleteFoodEntries,
  listFoodEntries,
  updateFoodEntry,
} from "../../../server/services/foodEntries";

const foodEntry = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, nextAuthOptions);

  if (session && session.user && session.user.id) {
    if (req.method === "POST") {
      const { foodEntry } = req.body;
      const result = await addFoodEntry(foodEntry);
      res.status(201).send(result);
    } else if (req.method === "PATCH") {
      const { foodEntry } = req.body;
      const result = await updateFoodEntry(foodEntry);
      res.status(201).send(result);
    } else if (req.method === "GET") {
      const { sd = Date(), ed = Date() } = req.query as Record<string, string>;
      const foodEntries = await listFoodEntries(session.user.id, sd, ed);
      res.send(foodEntries);
    } else if (req.method === "DELETE") {
      const {
        foodEntry,
      }: {
        foodEntry: FoodEntry;
      } = req.body;

      await deleteFoodEntries(foodEntry?.id);
      res.status(200).send({});
    }
  } else {
    res.send({
      error:
        "You must be signed in to view the protected content on this page.",
    });
  }
};

export default foodEntry;

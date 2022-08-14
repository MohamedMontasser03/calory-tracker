import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { authOptions as nextAuthOptions } from "../auth/[...nextauth]";
import { isAdmin } from "../../../server/services/admin";
import { doesUserExist } from "../../../server/services/user";
import {
  addFoodEntry,
  deleteFoodEntries,
  listFoodEntries,
  updateFoodEntry,
} from "../../../server/services/foodEntries";
import { z } from "zod";

const getQuerySchema = z.object({
  userId: z.string(),
  sd: z.string().optional(),
  ed: z.string().optional(),
});

const postBodySchema = z.object({
  foodEntry: z.object({
    userId: z.string(),
    date: z.preprocess((a) => new Date(z.string().parse(a)), z.date()),
    name: z.string(),
    calories: z.number().positive(),
    price: z.number().positive(),
  }),
});

const patchBodySchema = z.object({
  foodEntry: z.object({
    userId: z.string(),
    date: z.preprocess((a) => new Date(z.string().parse(a)), z.date()),
    name: z.string(),
    calories: z.number().positive(),
    price: z.number().positive(),
    id: z.string(),
  }),
});

const deleteBodySchema = z.object({
  foodId: z.string(),
  userId: z.string(),
});

const users = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getServerSession(req, res, nextAuthOptions);

    if (!session || !(await isAdmin(session.user?.id))) {
      return res.status(401).send({
        error: "You must be signed in as Admin to access this endpoint.",
      });
    }
    const controllers: Record<
      string,
      (req: NextApiRequest, res: NextApiResponse) => void
    > = {
      POST: async (req, res) => {
        const { foodEntry } = postBodySchema.parse(req.body);
        if (!foodEntry.userId || !(await doesUserExist(foodEntry.userId))) {
          return res.status(404).json({
            error: "User does not exist",
          });
        }
        const result = await addFoodEntry(foodEntry);
        return res.status(201).send(result);
      },
      GET: async (req, res) => {
        const {
          userId,
          sd = Date(),
          ed = Date(),
        } = getQuerySchema.parse(req.query);
        if (!userId || !(await doesUserExist(userId))) {
          return res.status(404).json({
            error: "User does not exist",
          });
        }
        const foodEntries = await listFoodEntries(userId, sd, ed);
        console.log(foodEntries);
        return res.send({ foodEntries });
      },
      PATCH: async (req, res) => {
        const { foodEntry } = patchBodySchema.parse(req.body);
        if (!foodEntry.userId || !(await doesUserExist(foodEntry.userId))) {
          return res.status(404).json({
            error: "User does not exist",
          });
        }

        const result = await updateFoodEntry(foodEntry);
        return res.status(201).send(result);
      },
      DELETE: async (req, res) => {
        const { foodId, userId } = deleteBodySchema.parse(req.body);

        await deleteFoodEntries(userId, foodId);
        return res.status(200).send({});
      },
    };
    return req.method && controllers[req.method]?.(req, res);
  } catch (err) {
    return res.status(400).send({
      message: "Failed to process request",
      error: err,
    });
  }
};

export default users;

import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "../auth/[...nextauth]";
import {
  addFoodEntry,
  deleteFoodEntries,
  listFoodEntries,
  updateFoodEntry,
} from "../../../server/services/foodEntries";
import { z } from "zod";

const getQuerySchema = z.object({
  sd: z.string().optional(),
  ed: z.string().optional(),
});

const postBodySchema = z.object({
  foodEntry: z.object({
    date: z.preprocess((a) => new Date(z.string().parse(a)), z.date()),
    name: z.string(),
    calories: z.number().positive(),
    price: z.number().positive(),
  }),
});

const patchBodySchema = z.object({
  foodEntry: z.object({
    date: z.preprocess((a) => new Date(z.string().parse(a)), z.date()),
    name: z.string(),
    calories: z.number().positive(),
    price: z.number().positive(),
    id: z.string(),
  }),
});

const foodEntry = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getSession(req);

    if (!session || !session.user || !session.user.id) {
      return res.status(401).send({
        error: "You must be signed in to access this endpoint.",
      });
    }
    const controllers: Record<
      string,
      (req: NextApiRequest, res: NextApiResponse) => void
    > = {
      POST: async (req, res) => {
        const { foodEntry } = postBodySchema.parse(req.body);
        const result = await addFoodEntry({
          ...foodEntry,
          userId: session.user?.id!,
        });
        return res.status(201).send(result);
      },
      GET: async (req, res) => {
        const { sd = Date(), ed = Date() } = getQuerySchema.parse(req.query);
        const foodEntries = await listFoodEntries(session.user?.id!, sd, ed);
        return res.send({ foodEntries });
      },
      PATCH: async (req, res) => {
        const { foodEntry } = patchBodySchema.parse(req.body);
        const result = await updateFoodEntry({
          ...foodEntry,
          userId: session.user?.id!,
        });
        return res.status(201).send(result);
      },
      DELETE: async (req, res) => {
        const {
          foodId,
        }: {
          foodId: string;
        } = req.body;

        await deleteFoodEntries(session.user?.id!, foodId);
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

export default foodEntry;

import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { authOptions as nextAuthOptions } from "../auth/[...nextauth]";
import { isAdmin } from "../../../server/services/admin";
import {
  doesUserExist,
  getUserMaxCalories,
  setUserMaxCalories,
} from "../../../server/services/user";
import { promise, z } from "zod";

const getQuerySchema = z.object({
  userId: z.string().optional(),
});
const postBodySchema = z.object({
  maxCalories: z.number().positive(),
  userId: z.string().optional(),
});

const calory = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getServerSession(req, res, nextAuthOptions);

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
        const { maxCalories: newMaxCalories, userId } = postBodySchema.parse(
          req.body
        );
        const [admin, userExists] = await Promise.all([
          isAdmin(session.user?.id),
          doesUserExist(userId || ""),
        ]);
        if (userId && !admin) return res.status(403).send("Forbidden");

        if (userId && !userExists)
          return res.status(404).send("User does not exist");

        await setUserMaxCalories(userId || session.user?.id!, newMaxCalories);
        return res.status(201).send({ success: true });
      },
      GET: async (req, res) => {
        const admin = await isAdmin(session.user!.id);
        const userId = getQuerySchema.parse(req.query).userId;
        if (userId && !admin) {
          res.status(403).send("Forbidden");
          return;
        }

        return res.send({
          maxCalories: await getUserMaxCalories(userId || session.user?.id!),
        });
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

export default calory;

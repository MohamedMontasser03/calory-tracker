import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { authOptions as nextAuthOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../server/db/client";
import { setToMidnight } from "../../../utils/date";
import { isAdmin } from "../../../server/services/admin";
import {
  getUserMaxCalories,
  setUserMaxCalories,
} from "../../../server/services/user";

const calory = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getServerSession(req, res, nextAuthOptions);

    if (!session || !session.user || !session.user.id) {
      return res.status(401).send({
        error:
          "You must be signed in as Admin to view the protected content on this page.",
      });
    }

    if (req.method === "POST") {
      const { maxCalories: newMaxCalories, userId } = req.body;
      if (userId && !isAdmin(session.user.id)) {
        res.status(403).send("Forbidden");
        return;
      }
      await setUserMaxCalories(userId || session.user.id, newMaxCalories);
      return res.status(201).send({ success: true });
    }
    if (req.method === "GET") {
      const userId = req.query.userId as string;
      if (userId && !isAdmin(session.user.id)) {
        res.status(403).send("Forbidden");
        return;
      }

      return res.send({
        maxCalories: await getUserMaxCalories(userId || session.user.id),
      });
    }
  } catch (err) {
    return res.status(400).send({
      error: "Failed to process request",
    });
  }
};

export default calory;

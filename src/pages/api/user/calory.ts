import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { authOptions as nextAuthOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../server/db/client";
import { setToMidnight } from "../../../utils/date";
import { isAdmin } from "../../../server/services/admin";

const calory = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, nextAuthOptions);

  if (session) {
    if (req.method === "POST") {
      const { maxCalories: newMaxCalories, userId } = req.body;
      if (userId && !isAdmin(session.user?.id)) {
        res.status(403).send("Forbidden");
        return;
      }
      await prisma.user.update({
        where: {
          id: userId || session.user?.id,
        },
        data: {
          maxCalories: newMaxCalories,
        },
      });
      res.status(201).send({ success: true });
    } else if (req.method === "GET") {
      const userId = req.query.userId as string;
      if (userId && !isAdmin(session.user?.id)) {
        res.status(403).send("Forbidden");
        return;
      }
      const user = await prisma.user.findUnique({
        where: {
          id: userId || session.user?.id,
        },
      });
      res.send({
        maxCalories: user?.maxCalories,
      });
    }
  } else {
    res.send({
      error:
        "You must be signed in to view the protected content on this page.",
    });
  }
};

export default calory;

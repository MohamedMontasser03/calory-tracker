import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { authOptions as nextAuthOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../server/db/client";

const foodEntry = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, nextAuthOptions);

  if (session) {
    if (req.method === "POST") {
      const { maxCalories: newMaxCalories } = req.body;
      await prisma.user.update({
        where: {
          id: session.user?.id,
        },
        data: {
          maxCalories: newMaxCalories,
        },
      });
      res.status(201).send({ success: true });
    } else if (req.method === "GET") {
      const user = await prisma.user.findUnique({
        where: {
          id: session.user?.id,
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

export default foodEntry;

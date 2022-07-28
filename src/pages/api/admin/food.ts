import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { authOptions as nextAuthOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../server/db/client";
import { setToMidnight } from "../../../utils/date";
import {
  getUserCount,
  getUsers,
  isAdmin,
} from "../../../server/services/admin";
import { doesUserExist } from "../../../server/services/user";
import { listFoodEntries } from "../../../server/services/foodEntries";

const users = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, nextAuthOptions);

  if (session && (await isAdmin(session.user?.id))) {
    if (req.method === "GET") {
      const {
        userId,
        sd = Date(),
        ed = Date(),
      } = req.query as Record<string, string>;
      if (!userId || !doesUserExist(userId)) {
        res.status(404).json({
          error: "User does not exist",
        });
        return;
      }
      res.status(200).json({
        foodEntries: await listFoodEntries(userId, sd, ed),
      });
    }
  } else {
    res.send({
      error:
        "You must be signed in as Admin to view the protected content on this page.",
    });
  }
};

export default users;

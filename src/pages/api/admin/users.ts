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

const users = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, nextAuthOptions);

  if (session && (await isAdmin(session.user?.id))) {
    if (req.method === "GET") {
      const { page, count } = req.query;
      const users = await getUsers(Number(page), Number(count));
      res.status(200).json({
        userList: users,
        numOfPages: Math.ceil((await getUserCount()) / Number(count)),
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

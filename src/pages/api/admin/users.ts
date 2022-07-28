import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { authOptions as nextAuthOptions } from "../auth/[...nextauth]";
import {
  getUserCount,
  getUsers,
  isAdmin,
} from "../../../server/services/admin";

const users = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, nextAuthOptions);

  if (!session || !(await isAdmin(session.user?.id))) {
    return res.send({
      error:
        "You must be signed in as Admin to view the protected content on this page.",
    });
  }
  if (req.method === "GET") {
    const { page, count } = req.query;
    const users = await getUsers(Number(page), Number(count));
    return res.status(200).json({
      userList: users,
      numOfPages: Math.ceil((await getUserCount()) / Number(count)),
    });
  }
};

export default users;

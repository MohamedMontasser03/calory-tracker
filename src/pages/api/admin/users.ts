import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "../auth/[...nextauth]";
import { getUserCount, getUsers } from "../../../server/services/admin";
import { z } from "zod";

const getQuerySchema = z.object({
  page: z.preprocess((a) => Number(a), z.number().nonnegative().int()),
  count: z.preprocess((a) => Number(a), z.number().positive().int()),
});

const users = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getSession(req);

    if (!session || !session.user.isAdmin) {
      return res.status(401).send({
        error: "You must be signed in as Admin to access this endpoint.",
      });
    }
    if (req.method === "GET") {
      const { page, count } = getQuerySchema.parse(req.query);
      const [users, userCount] = await Promise.all([
        getUsers(page, count),
        getUserCount(),
      ]);

      return res.status(200).json({
        userList: users,
        numOfPages: Math.ceil(userCount / count),
      });
    }
  } catch (err) {
    return res.status(400).send({
      message: "Failed to process request",
      error: err,
    });
  }
};

export default users;

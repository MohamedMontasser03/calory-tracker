import NextAuth, {
  Session as AuthSession,
  type NextAuthOptions,
} from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../server/db/client";
import { env } from "../../../env/server.mjs";
import { isAdmin } from "../../../server/services/admin";
import { getSession as authGetSession } from "next-auth/react";
import { NextApiRequest } from "next";
import { IncomingMessage } from "http";

export type Session = {
  user: {
    isAdmin: boolean;
  };
} & AuthSession;

export const getSession = (req: NextApiRequest | IncomingMessage) =>
  authGetSession({ req }) as Promise<Session | null>;

export const authOptions: NextAuthOptions = {
  // Include user.id on session
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return {
        ...session,
        user: {
          ...session.user,
          isAdmin: await isAdmin(session.user?.id),
        },
      };
    },
  },
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: env.JWT_SECRET,
};

export default NextAuth(authOptions);

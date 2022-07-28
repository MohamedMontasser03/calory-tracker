import type { GetServerSideProps, NextPage } from "next";
import { User } from "@prisma/client";
import { getSession } from "next-auth/react";
import Head from "next/head";
import { prisma } from "../../../server/db/client";
import Header from "../../../components/header/Header";
import { isAdmin } from "../../../server/services/admin";

type AdminProps = {
  user: User;
};

const Admin: NextPage<AdminProps> = ({ user }) => {
  return (
    <>
      <Head>
        <title>Calory Tracker-Admin</title>
        <meta name="description" content="calory tracker" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header user={user} />

      <main className="p-4 text-gray-700">
        <h1 className="flex justify-center text-2xl md:text-4xl leading-normal font-extrabold mb-4">
          Calory <span className="text-purple-300">Tracker</span> App
        </h1>
        <div className="mt-8"></div>
      </main>
    </>
  );
};

export default Admin;

// make sure user is logged in and redirect to login page if not
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx);
  if (!session || !session.user || !session.user.id) {
    ctx.res.writeHead(302, {
      Location: "/api/auth/signin?callbackUrl=http%3A%2F%2Flocalhost%3A3000%2F",
    });
    ctx.res.end();
    return { props: {} };
  }
  if (!(await isAdmin(session.user?.id))) {
    ctx.res.writeHead(302, {
      Location: "/",
    });
    ctx.res.end();
    return { props: {} };
  }

  return {
    props: {
      user: session.user,
    },
  };
};

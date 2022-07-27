import { FoodEntry } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import type { GetServerSideProps, NextPage } from "next";
import { User } from "next-auth";
import { getSession } from "next-auth/react";
import Head from "next/head";
import FoodEntryList from "../components/food-entry-list/FoodEntryList";
import Header from "../components/header/Header";
import { prisma } from "../server/db/client";

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

      <main className="container mx-auto flex flex-col items-center h-screen p-4 text-white">
        <h1 className="text-2xl md:text-4xl leading-normal font-extrabold mb-4 text-gray-700">
          Calory <span className="text-purple-300">Tracker</span> App
        </h1>
      </main>
    </>
  );
};

export default Admin;

// make sure user is logged in and redirect to login page if not
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx);
  if (!session) {
    ctx.res.writeHead(302, {
      Location: "/api/auth/signin?callbackUrl=http%3A%2F%2Flocalhost%3A3000%2F",
    });
    ctx.res.end();
    return { props: {} };
  }
  const userData = await prisma.user.findUnique({
    where: { id: session.user?.id },
    select: { admin: true },
  });
  if (!userData?.admin) {
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

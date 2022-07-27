import { FoodEntry } from "@prisma/client";
import type { GetServerSideProps, NextPage } from "next";
import { User } from "next-auth";
import { getSession } from "next-auth/react";
import Head from "next/head";
import FoodEntryList from "../components/food-entry-list/FoodEntryList";
import Header from "../components/header/Header";
import { prisma } from "../server/db/client";

type HomeProps = {
  user: User;
  foodEntries: FoodEntry[];
};

const Home: NextPage<HomeProps> = ({ foodEntries, user }) => {
  return (
    <>
      <Head>
        <title>Calory Tracker</title>
        <meta name="description" content="calory tracker" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header user={user} />

      <main className="container mx-auto flex flex-col items-center h-screen p-4 text-white">
        <h1 className="text-2xl md:text-4xl leading-normal font-extrabold text-gray-700 mb-4">
          Calory <span className="text-purple-300">Tracker</span> App
        </h1>
        <div className="pb-5">
          <FoodEntryList foodEntries={foodEntries} />
        </div>
      </main>
    </>
  );
};

export default Home;

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

  const foodEntries = await prisma.foodEntry.findMany({
    where: {
      userId: session.user?.id,
      date: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
        lte: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    },
  });

  return {
    props: {
      user: session.user,
      foodEntries: JSON.parse(JSON.stringify(foodEntries)),
    },
  };
};

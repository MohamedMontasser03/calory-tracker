import { FoodEntry } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import type { GetServerSideProps, NextPage } from "next";
import { User } from "next-auth";
import { getSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import FoodEntryList from "../components/food-entry-list/FoodEntryList";
import Header from "../components/header/Header";
import { prisma } from "../server/db/client";

type HomeProps = {
  user: User;
  foodEntries: FoodEntry[];
  maxCalories: number;
};

const Home: NextPage<HomeProps> = ({
  foodEntries: initialFoodEntries,
  user,
  maxCalories,
}) => {
  const { data: foodEntries, isLoading: loadingFoodEntries } = useQuery(
    ["foodEntries"],
    async () => {
      const res = await fetch("/api/user/food");
      return await res.json();
    },
    {
      enabled: user !== null,
      initialData: initialFoodEntries,
      staleTime: 1000,
    }
  );
  const { data: maxCaloriesData, isLoading: loadingMaxCalories } = useQuery(
    ["maxCalories"],
    async () => {
      const res = await fetch("/api/user/calory");
      return await res.json();
    },
    {
      initialData: { maxCalories },
      staleTime: 1000,
    }
  );

  return (
    <>
      <Head>
        <title>Calory Tracker</title>
        <meta name="description" content="calory tracker" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header user={user} />

      <main className="container mx-auto flex flex-col items-center h-screen p-4 text-white">
        <h1 className="text-2xl md:text-4xl leading-normal font-extrabold mb-4 text-gray-700">
          Calory <span className="text-purple-300">Tracker</span> App
        </h1>
        <div className="pb-5">
          <Link href="/summary">
            <a className="text-purple-300">Summary</a>
          </Link>
          {loadingFoodEntries || loadingMaxCalories ? (
            <div className="text-gray-700">Loading...</div>
          ) : (
            <FoodEntryList
              foodEntries={foodEntries}
              maxCalories={maxCaloriesData.maxCalories}
            />
          )}
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
  const userData = await prisma.user.findUnique({
    where: { id: session.user?.id },
    select: { maxCalories: true, admin: true },
  });
  if (userData?.admin) {
    ctx.res.writeHead(302, {
      Location: "/admin",
    });
    ctx.res.end();
    return { props: {} };
  }

  return {
    props: {
      user: session.user,
      maxCalories: userData?.maxCalories,
      foodEntries: JSON.parse(JSON.stringify(foodEntries)),
    },
  };
};

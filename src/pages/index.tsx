import { FoodEntry } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import type { GetServerSideProps, NextPage } from "next";
import { User } from "next-auth";
import { getSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import FoodEntryList from "../components/food-entry-list/FoodEntryList";
import Header from "../components/header/Header";
import { listFoodEntries } from "../server/services/foodEntries";
import { getUserData } from "../server/services/user";
import { quickFetch } from "../utils/fetch";
import { getRedirection } from "../utils/queries";

type HomeProps = {
  user: User;
  foodEntries: FoodEntry[];
  maxCalories: number;
};

const Home: NextPage<HomeProps> = ({ foodEntries, user, maxCalories }) => {
  const { data: foodEntriesData, isLoading: loadingFoodEntries } = useQuery(
    ["foodEntries"],
    () => quickFetch<{ foodEntries: FoodEntry[] }>("/api/user/food"),
    {
      initialData: { foodEntries },
      staleTime: 1000,
    }
  );
  const { data: maxCaloriesData, isLoading: loadingMaxCalories } = useQuery(
    ["maxCalories"],
    () => quickFetch<{ maxCalories: number }>("/api/user/calory"),
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
              foodEntries={foodEntriesData?.foodEntries || []}
              maxCalories={maxCaloriesData?.maxCalories || 0}
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
  const userData = await getUserData(session?.user?.id);
  const redirect = getRedirection({
    "/api/auth/signin?callbackUrl=http%3A%2F%2Flocalhost%3A3000%2F":
      !session || !session.user || !session.user.id,
    "/admin": userData?.admin,
  });
  if (redirect) {
    ctx.res.writeHead(302, {
      Location: redirect,
    });
    ctx.res.end();
    return { props: {} };
  }
  const foodEntries = await listFoodEntries(
    session?.user?.id || "",
    Date(),
    Date()
  );
  return {
    props: {
      user: session?.user,
      maxCalories: userData?.maxCalories,
      foodEntries: JSON.parse(JSON.stringify(foodEntries)),
    },
  };
};

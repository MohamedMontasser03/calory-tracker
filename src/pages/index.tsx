import { FoodEntry } from "@prisma/client";
import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import FoodEntryList from "../components/food-entry-list/FoodEntryList";

const FoodEntryMock: FoodEntry[] = [
  {
    id: "1",
    name: "Pizza",
    calories: 500,
    price: 10,
    date: new Date(),
    userId: "1",
  },
];

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Calory Tracker</title>
        <meta name="description" content="calory tracker" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto flex flex-col items-center h-screen p-4 text-white">
        <h1 className="text-2xl md:text-4xl leading-normal font-extrabold text-gray-700 mb-4">
          Calory <span className="text-purple-300">Tracker</span> App
        </h1>
        <div className="pb-5">
          <FoodEntryList foodEntries={FoodEntryMock} />
        </div>
      </main>
    </>
  );
};

export default Home;

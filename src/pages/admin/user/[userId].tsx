import type { GetServerSideProps, NextPage } from "next";
import { FoodEntry, User } from "@prisma/client";
import { getSession } from "next-auth/react";
import Head from "next/head";
import { prisma } from "../../../server/db/client";
import Header from "../../../components/header/Header";
import { isAdmin } from "../../../server/services/admin";
import { useEffect, useState } from "react";
import { DateRange } from "react-date-range";
import FoodEntryList from "../../../components/food-entry-list/FoodEntryList";
import { getEarliestDate } from "../../../server/services/foodEntries";
import { doesUserExist } from "../../../server/services/user";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";

type AdminProps = {
  user: User;
  earliestDate: string;
  foodEntries: FoodEntry[];
};

const Admin: NextPage<AdminProps> = ({ user, earliestDate, foodEntries }) => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });
  const { userId: queryUserId } = useRouter().query;

  const {
    data: foodEntriesData,
    isLoading: loadingFoodEntries,
    refetch,
  } = useQuery(
    ["sumFoodEntries", queryUserId],
    async () => {
      const res = await fetch(
        `/api/admin/food?userId=${queryUserId}&sd=${dateRange.startDate.toString()}&ed=${dateRange.endDate.toString()}`
      );
      return await res.json();
    },
    {
      enabled: user !== null || dateRange.key === "selection",
      initialData: { foodEntries },
      staleTime: 1000,
    }
  );

  useEffect(() => {
    refetch();
  }, [dateRange, refetch]);

  return (
    <>
      <Head>
        <title>Calory Tracker-Admin</title>
        <meta name="description" content="calory tracker" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header user={user} />

      <main className="container mx-auto flex flex-col items-center h-screen p-4 text-white">
        <h1 className="flex justify-center text-2xl md:text-4xl leading-normal font-extrabold mb-4 text-gray-700">
          Calory <span className="text-purple-300">Tracker/Admin</span> App
        </h1>
        <div className="flex gap-2 md:flex-row flex-col items-center">
          <div className="p-2 bg-blue-200 text-gray-700 rounded-sm">
            <DateRange
              minDate={new Date(earliestDate)}
              maxDate={new Date()}
              onChange={(date) =>
                setDateRange({
                  startDate: date.selection!.startDate!,
                  endDate: date.selection!.endDate!,
                  key: "selection",
                })
              }
              ranges={[dateRange]}
              showDateDisplay={false}
              showMonthAndYearPickers={false}
            />
          </div>
          {loadingFoodEntries ? (
            <div className="text-gray-700">Loading...</div>
          ) : (
            <FoodEntryList
              foodEntries={foodEntriesData.foodEntries}
              maxCalories={0}
              isFullDate={true}
              noEdit={true}
            />
          )}
        </div>
      </main>
    </>
  );
};

export default Admin;

// make sure user is logged in and redirect to login page if not
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx);
  const queryUserId = ctx.query.userId as string;

  if (!session || !session.user || !session.user.id) {
    ctx.res.writeHead(302, {
      Location: "/api/auth/signin?callbackUrl=http%3A%2F%2Flocalhost%3A3000%2F",
    });
    ctx.res.end();
    return { props: {} };
  }
  if (
    !(await isAdmin(session.user.id)) ||
    !queryUserId ||
    !(await doesUserExist(queryUserId))
  ) {
    ctx.res.writeHead(302, {
      Location: "/",
    });
    ctx.res.end();
    return { props: {} };
  }
  const foodEntries = await prisma.foodEntry.findMany({
    where: {
      userId: queryUserId,
      date: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
        lte: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    },
  });
  return {
    props: {
      user: session.user,
      earliestDate: (await getEarliestDate(queryUserId))?.toString(),
      foodEntries: JSON.parse(JSON.stringify(foodEntries)),
    },
  };
};

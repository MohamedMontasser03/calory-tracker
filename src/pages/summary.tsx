import { FoodEntry } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import type { GetServerSideProps, NextPage } from "next";
import { User } from "next-auth";
import { getSession } from "next-auth/react";
import Head from "next/head";
import { useEffect, useState } from "react";
import {
  Calendar,
  DateRange,
  DateRangePicker,
  RangeKeyDict,
} from "react-date-range";
import FoodEntryList from "../components/food-entry-list/FoodEntryList";
import Header from "../components/header/Header";
import { prisma } from "../server/db/client";
import {
  getDaysWithExcessCalories,
  listFoodEntries,
} from "../server/services/foodEntries";
import { setToMidnight, toLocaleDateString } from "../utils/date";

type SummaryProps = {
  user: User;
  foodEntries: FoodEntry[];
  daysWithExcessCalories: string[];
  earliestDate: string;
};

const Summary: NextPage<SummaryProps> = ({
  user,
  foodEntries,
  daysWithExcessCalories,
  earliestDate,
}) => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });
  const {
    data: foodEntriesData,
    isLoading: loadingFoodEntries,
    refetch,
  } = useQuery(
    ["sumFoodEntries"],
    async () => {
      const res = await fetch(
        `/api/user/food?sd=${dateRange.startDate.toLocaleString()}&ed=${dateRange.endDate.toLocaleString()}`
      );
      return await res.json();
    },
    {
      enabled: user !== null || dateRange.key === "selection",
      initialData: foodEntries,
      staleTime: 1000,
    }
  );
  useEffect(() => {
    refetch();
  }, [dateRange, refetch]);
  return (
    <>
      <Head>
        <title>Calory Tracker-Summary</title>
        <meta name="description" content="calory tracker" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header user={user} />

      <main className="container mx-auto flex flex-col items-center h-screen p-4 text-white">
        <h1 className="text-2xl md:text-4xl leading-normal font-extrabold mb-4 text-gray-700">
          Calory <span className="text-purple-300">Tracker</span> App
        </h1>
        <div className="flex gap-2 md:flex-row flex-col items-center">
          <div className="p-2 bg-blue-200 text-gray-700 rounded-sm">
            <DateRange
              minDate={new Date(earliestDate)}
              maxDate={new Date()}
              onChange={(date) =>
                setDateRange({
                  startDate: date.selection?.startDate || new Date(),
                  endDate: date.selection?.endDate || new Date(),
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
              foodEntries={foodEntriesData}
              maxCalories={0}
              isFullDate={true}
              noEdit={true}
            />
          )}
        </div>
        <div className="flex flex-col items-center mt-4">
          <h2 className="text-2xl md:text-4xl leading-normal font-extrabold mb-4 text-gray-700">
            Days with excess calories
          </h2>
          <div className="flex flex-col gap-2">
            {daysWithExcessCalories?.map((day) => (
              <div className="flex items-center" key={day}>
                <div className="p-2 bg-red-200 text-gray-700 rounded-sm">
                  {toLocaleDateString(day)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default Summary;

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
  const userData = await prisma.user.findUnique({
    where: { id: session.user?.id },
    select: { maxCalories: true, admin: true },
  });
  const foodEntries = await listFoodEntries(session.user.id, Date(), Date());
  if (userData?.admin) {
    ctx.res.writeHead(302, {
      Location: "/admin",
    });
    ctx.res.end();
    return { props: {} };
  }
  const { daysWithExcessCalories, earliestDate } =
    await getDaysWithExcessCalories(session.user?.id!, userData?.maxCalories!);
  return {
    props: {
      user: session.user,
      foodEntries: JSON.parse(JSON.stringify(foodEntries)),
      daysWithExcessCalories,
      earliestDate: earliestDate?.toLocaleString(),
    },
  };
};

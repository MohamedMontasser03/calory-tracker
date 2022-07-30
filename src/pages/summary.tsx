import { FoodEntry } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import type { GetServerSideProps, NextPage } from "next";
import { User } from "next-auth";
import { getSession } from "next-auth/react";
import Head from "next/head";
import { useEffect, useState } from "react";
import { DateRange } from "react-date-range";
import FoodEntryList from "../components/food-entry-list/FoodEntryList";
import Header from "../components/header/Header";
import {
  getDaysWithExcessCalories,
  listFoodEntries,
} from "../server/services/foodEntries";
import { getUserData } from "../server/services/user";
import { toLocaleDateString } from "../utils/date";
import { quickFetch } from "../utils/fetch";
import { getRedirection } from "../utils/queries";

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
    () =>
      quickFetch<{ foodEntries: FoodEntry[] }>(
        `/api/user/food?sd=${dateRange.startDate.toLocaleString()}&ed=${dateRange.endDate.toLocaleString()}`
      ),
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
              foodEntries={foodEntriesData?.foodEntries || []}
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
  try {
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

    const promises = await Promise.allSettled([
      listFoodEntries(session?.user?.id || "", Date(), Date()),
      getDaysWithExcessCalories(
        session?.user?.id || "",
        userData?.maxCalories!
      ),
    ]);
    const [foodEntries, { daysWithExcessCalories, earliestDate }] =
      promises.map((p) => {
        if (p.status === "rejected") {
          throw p.reason;
        }
        return p.value;
      }) as [
        FoodEntry[],
        { daysWithExcessCalories: string[]; earliestDate: string }
      ];

    return {
      props: {
        user: session?.user,
        foodEntries: JSON.parse(JSON.stringify(foodEntries)),
        daysWithExcessCalories,
        earliestDate: earliestDate?.toLocaleString(),
      },
    };
  } catch (err) {
    console.error(err);
    return { props: {} };
  }
};

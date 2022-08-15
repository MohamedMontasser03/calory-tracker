import type { GetServerSideProps, NextPage } from "next";
import { FoodEntry, User } from "@prisma/client";
import Head from "next/head";
import Header from "../../../components/header/Header";
import { useEffect, useState } from "react";
import { DateRange } from "react-date-range";
import FoodEntryList from "../../../components/food-entry-list/FoodEntryList";
import {
  getEarliestDate,
  listFoodEntries,
} from "../../../server/services/foodEntries";
import { doesUserExist, getUserData } from "../../../server/services/user";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { quickFetch } from "../../../utils/fetch";
import { getRedirection } from "../../../utils/queries";
import { User as AuthUser } from "next-auth";
import { getSession } from "../../api/auth/[...nextauth]";

type AdminProps = {
  user: AuthUser;
  earliestDate: string;
  foodEntries: FoodEntry[];
  queryUserData: User;
};

const Admin: NextPage<AdminProps> = ({
  user,
  earliestDate,
  foodEntries,
  queryUserData,
}) => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });
  const { userId: queryUserId } = useRouter().query as Record<string, string>;

  const {
    data: foodEntriesData,
    isLoading: loadingFoodEntries,
    refetch,
  } = useQuery(
    ["sumFoodEntries", queryUserId],
    () =>
      quickFetch<{ foodEntries: FoodEntry[] }>(
        `/api/admin/food?userId=${queryUserId}&sd=${dateRange.startDate.toLocaleString()}&ed=${dateRange.endDate.toLocaleString()}`
      ),
    {
      initialData: { foodEntries },
      staleTime: 1000,
    }
  );
  const { data: maxCaloriesData, isLoading: loadingMaxCalories } = useQuery(
    ["maxCalories", queryUserId],
    () =>
      quickFetch<{ maxCalories: number }>(
        `/api/user/calory?userId=${queryUserId}`
      ),
    {
      initialData: { maxCalories: queryUserData.maxCalories },
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

      <main className="container mx-auto flex flex-col items-center mb-4 p-4 text-white">
        <h1 className="flex justify-center text-2xl md:text-4xl leading-normal font-extrabold mb-4 text-gray-700">
          Calory <span className="text-purple-300">Tracker/Admin</span> App
        </h1>
        <div className="flex items-center justify-center gap-2 mb-4">
          <h2 className="leading-normal font-extrabold text-gray-700">
            Editing: {queryUserData.name}
          </h2>
          <Image
            className="rounded-full"
            src={queryUserData.image!}
            alt={queryUserData.name!}
            width={32}
            height={32}
          />
        </div>

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
          {loadingFoodEntries || loadingMaxCalories ? (
            <div className="text-gray-700">Loading...</div>
          ) : (
            <FoodEntryList
              foodEntries={foodEntriesData?.foodEntries || []}
              maxCalories={maxCaloriesData?.maxCalories || 0}
              isFullDate={true}
              noEdit={false}
              userId={queryUserId}
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
  try {
    const session = await getSession(ctx.req);
    const queryUserId = ctx.query.userId as string;
    const userExists = doesUserExist(queryUserId);
    const redirect = getRedirection({
      "/api/auth/signin?callbackUrl=http%3A%2F%2Flocalhost%3A3000%2F":
        !session || !session.user || !session.user.id,
      "/": !queryUserId || !session?.user.isAdmin,
      "/admin": !userExists,
    });
    if (redirect) {
      ctx.res.writeHead(302, {
        Location: redirect,
      });
      ctx.res.end();
      return { props: {} };
    }
    const promises = await Promise.allSettled([
      listFoodEntries(queryUserId, Date(), Date()),
      getUserData(queryUserId),
      getEarliestDate(queryUserId),
    ]);
    const [foodEntries, queryUserData, earliestDate] = promises.map((p) => {
      if (p.status === "rejected") {
        throw p.reason;
      }
      return p.value;
    }) as [FoodEntry[], User, string];
    return {
      props: {
        user: session?.user,
        earliestDate: earliestDate.toLocaleString(),
        foodEntries: JSON.parse(JSON.stringify(foodEntries)),
        queryUserData,
      },
    };
  } catch (err) {
    console.error(err);
    ctx.res.writeHead(500, {
      Location: "/error",
    });
    ctx.res.end();
    return { props: {} };
  }
};

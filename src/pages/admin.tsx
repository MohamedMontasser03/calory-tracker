import type { GetServerSideProps, NextPage } from "next";
import { User } from "@prisma/client";
import Head from "next/head";
import Header from "../components/header/Header";
import { UserList } from "../components/user-list/UserList";
import {
  getAvgWeekCalories,
  getNumOfFoodEntries,
  getUserCount,
  getUsers,
} from "../server/services/admin";
import { removeDaysFromDate } from "../utils/date";
import { getRedirection } from "../utils/queries";
import { getSession, Session } from "./api/auth/[...nextauth]";

type AdminProps = {
  user: User;
  AvgCalories: number;
  numOfEntryComparison: number[];
  userList: User[];
  numOfPages: number;
};

const Admin: NextPage<AdminProps> = ({
  user,
  AvgCalories,
  numOfEntryComparison,
  userList,
  numOfPages,
}) => {
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
          Calory <span className="text-purple-300">Tracker/Admin</span> App
        </h1>
        <div className="mt-8">
          <h2>This Week&rsquo;s Stats </h2>
          <p>Average Calories Added This Week: {AvgCalories}</p>
          <p>Number of Food Entries This Week: {numOfEntryComparison[1]}</p>
          <p>Number of Food Entries Last Week: {numOfEntryComparison[0]}</p>
        </div>
        <div className="mt-8">
          <h2>User List</h2>
          <UserList
            userList={userList}
            numOfPages={numOfPages}
            currentPage={0}
          />
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
    const redirect = getRedirection({
      "/api/auth/signin?callbackUrl=http%3A%2F%2Flocalhost%3A3000%2F":
        !session || !session.user || !session.user.id,
      "/": !session?.user?.isAdmin,
    });
    if (redirect) {
      ctx.res.writeHead(302, {
        Location: redirect,
      });
      ctx.res.end();
      return { props: {} };
    }

    const promises = await Promise.allSettled([
      getAvgWeekCalories(),
      getNumOfFoodEntries(removeDaysFromDate(new Date(), 7)),
      getNumOfFoodEntries(new Date()),
      getUsers(0, 10),
      getUserCount(),
    ]);

    const [
      AvgCalories,
      prevNumOfEntries,
      curNumOfEntries,
      userList,
      userCount,
    ] = promises.map((p) => {
      if (p.status === "rejected") {
        throw p.reason;
      }
      return p.value;
    });

    return {
      props: {
        user: session?.user,
        AvgCalories,
        numOfEntryComparison: [prevNumOfEntries, curNumOfEntries],
        userList,
        numOfPages: Math.ceil((userCount as number) / 10),
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

import type { GetServerSideProps, NextPage } from "next";
import { User } from "next-auth";
import { getSession } from "next-auth/react";
import Head from "next/head";
import { useState } from "react";
import {
  Calendar,
  DateRange,
  DateRangePicker,
  RangeKeyDict,
} from "react-date-range";
import Header from "../components/header/Header";
import { prisma } from "../server/db/client";

type SummaryProps = {
  user: User;
};

const Summary: NextPage<SummaryProps> = ({ user }) => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });
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
        <div className="p-2 bg-blue-200 text-gray-700 rounded-sm">
          <DateRange
            minDate={new Date(new Date().setMonth(1))}
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
      </main>
    </>
  );
};

export default Summary;

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
    },
  };
};

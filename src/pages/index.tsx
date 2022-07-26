import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Calory Tracker</title>
        <meta name="description" content="calory tracker" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto flex flex-col items-center justify-center h-screen p-4">
        <h1 className="text-4xl md:text-2xl leading-normal font-extrabold text-gray-700">
          Calory <span className="text-purple-300">Tracker</span> App
        </h1>
      </main>
    </>
  );
};

export default Home;

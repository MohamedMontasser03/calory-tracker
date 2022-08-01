import Head from "next/head";
import Link from "next/link";

const Error = () => {
  return (
    <>
      <Head>
        <title>Calory Tracker</title>
        <meta name="description" content="calory tracker" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="p-4 text-gray-700">
        <h1 className="flex justify-center text-2xl md:text-4xl leading-normal font-extrabold mb-4">
          Calory <span className="text-purple-300">Tracker</span> App
        </h1>
        <p>It seems like you&apos;ve encountered a problem.</p>
        <Link href="/">
          <a className="text-purple-300">Go back to the home page.</a>
        </Link>
      </main>
    </>
  );
};

export default Error;

import { User } from "next-auth";
import { signOut } from "next-auth/react";
import Image from "next/image";
import React from "react";

type HeaderProps = {
  user: User;
};

const Header = ({ user }: HeaderProps) => {
  return (
    <header className="flex justify-center flex-col items-center">
      <div className="flex justify-center items-center gap-2">
        <p>Welcome, {user?.name}</p>
        <Image
          src={user?.image || ""}
          alt="Profile"
          width={32}
          height={32}
          className="rounded-full"
        />
      </div>
      <p>
        <button
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-1 px-2 text-xs rounded transition-colors"
          onClick={() => signOut()}
        >
          Sign out
        </button>
      </p>
    </header>
  );
};

export default Header;

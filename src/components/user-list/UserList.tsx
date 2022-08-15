import { User } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import Router from "next/router";
import React, { useEffect } from "react";
import { quickFetch } from "../../utils/fetch";
import { useSession } from "../../utils/queries";

type UserListProps = {
  userList: User[];
  numOfPages: number;
  currentPage: number;
};

export const UserList: React.FC<UserListProps> = ({
  userList,
  numOfPages,
  currentPage,
}) => {
  const { data } = useSession();
  const [curPage, setCurPage] = React.useState(currentPage);
  const userCount = 10;
  const {
    data: userListData,
    isLoading,
    refetch,
  } = useQuery<{
    userList: User[];
    numOfPages: number;
  }>(
    ["userList"],
    () =>
      quickFetch(
        `/api/admin/users?page=${curPage}&count=${userCount}`,
        "GET"
      ) as Promise<{
        userList: User[];
        numOfPages: number;
      }>,
    {
      initialData: {
        userList: userList,
        numOfPages: numOfPages,
      },
      staleTime: 1000,
    }
  );

  useEffect(() => {
    refetch();
  }, [curPage, refetch]);

  if (!data?.user?.isAdmin) {
    Router.push("/error");
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <table className="table-auto w-full">
        <thead className="bg-gray-200">
          <tr className="text-left">
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Max Calories</th>
          </tr>
        </thead>
        <tbody>
          {userListData.userList.map((user) => (
            <tr key={user.id}>
              <td className="border px-4 py-2 flex items-center gap-2">
                <Image
                  src={user.image || ""}
                  alt={user.name || "Profile"}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <span>{user.name}</span>
              </td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">{user.maxCalories}</td>
              <td className="border px-4 py-2">
                <Link href={`/admin/user/${user.id}`}>
                  <a className="text-blue-400 hover:text-blue-700">View</a>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-center gap-2 mt-4">
        <p>
          Page {curPage + 1} of {userListData.numOfPages}
        </p>
        <button
          className="bg-blue-500 hover:bg-blue-700 cursor-pointer disabled:cursor-auto text-white font-bold py-2 px-4 rounded disabled:bg-gray-600"
          onClick={() => setCurPage(curPage - 1)}
          disabled={curPage === 0}
        >
          Previous
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 cursor-pointer disabled:cursor-auto text-white font-bold py-2 px-4 rounded disabled:bg-gray-600"
          onClick={() => setCurPage(curPage + 1)}
          disabled={curPage === userListData.numOfPages - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
};

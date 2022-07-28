import { User } from "@prisma/client";
import Image from "next/image";
import React from "react";

type UserListProps = {
  userList: User[];
  numOfPages: number;
  currentPage: number;
};

export const UserList = ({
  userList,
  numOfPages,
  currentPage,
}: UserListProps) => {
  const [curPage, setCurPage] = React.useState(currentPage);

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
          {userList.map((user) => (
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
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-center gap-2 mt-4">
        <p>
          Page {curPage + 1} of {numOfPages}
        </p>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-600"
          onClick={() => setCurPage(curPage - 1)}
          disabled={curPage === 0}
        >
          Previous
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setCurPage(curPage + 1)}
          disabled={curPage === numOfPages - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
};

import { FoodEntry } from "@prisma/client";
import React from "react";
import FoodEntryCard from "./FoodEntryCard";

type FoodEntryListProps = {
  foodEntries: FoodEntry[];
};

const FoodEntryList = ({ foodEntries }: FoodEntryListProps) => {
  return (
    <div className="bg-purple-300 rounded flex flex-col p-2 w-80">
      <div className=" flex flex-row justify-between pb-2">
        <h1 className="font-semibold">Food Entry List</h1>
        <button className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-1 px-2 text-xs rounded transition-colors">
          Add Food Entry
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {foodEntries.map((foodEntry) => (
          <FoodEntryCard key={foodEntry.id} foodEntry={foodEntry} />
        ))}
      </div>
    </div>
  );
};

export default FoodEntryList;

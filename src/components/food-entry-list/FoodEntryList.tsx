import { FoodEntry } from "@prisma/client";
import React, { useState } from "react";
import FoodEditMenu from "../food-edit-menu/FoodEditMenu";
import FoodEntryCard from "./FoodEntryCard";

type FoodEntryListProps = {
  foodEntries: FoodEntry[];
};

const FoodEntryList = ({ foodEntries }: FoodEntryListProps) => {
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [isUpdating, setIsUpdating] = useState<FoodEntry | null>(null);

  const onUpdate = (foodEntry: FoodEntry) => {
    setIsUpdating(foodEntry);
    setShowEditMenu(true);
  };

  return (
    <div className="bg-purple-300 rounded flex flex-col p-2 w-80">
      <div className=" flex flex-row justify-between pb-2">
        <h1 className="font-semibold">Food Entry List</h1>
        <button
          onClick={() => setShowEditMenu(true)}
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-1 px-2 text-xs rounded transition-colors"
        >
          Add Food Entry
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {foodEntries.map((foodEntry) => (
          <FoodEntryCard
            onUpdate={onUpdate}
            key={foodEntry.id}
            foodEntry={foodEntry}
          />
        ))}
      </div>
      <span>
        Total Calories: {foodEntries.reduce((p, v) => p + v.calories, 0)} calory
      </span>
      <span>Total Price: {foodEntries.reduce((p, v) => p + v.price, 0)}$</span>
      {showEditMenu && (
        <FoodEditMenu
          foodEntry={isUpdating}
          onClose={() => {
            setShowEditMenu(false);
            setIsUpdating(null);
          }}
        />
      )}
    </div>
  );
};

export default FoodEntryList;

import { FoodEntry } from "@prisma/client";
import React, { useEffect, useState } from "react";
import FoodEditMenu from "../food-edit-menu/FoodEditMenu";
import FoodEntryCard from "./FoodEntryCard";
import { toast } from "react-toastify";
import MaxCaloriesModal from "./MaxCaloryModal";

type FoodEntryListProps = {
  foodEntries: FoodEntry[];
  maxCalories: number;
};

const FoodEntryList = ({ foodEntries, maxCalories }: FoodEntryListProps) => {
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [showMaxCaloryMenu, setShowMaxCaloryMenu] = useState(false);
  const [isUpdating, setIsUpdating] = useState<FoodEntry | null>(null);
  const calories = foodEntries.reduce(
    (acc, foodEntry) => acc + foodEntry.calories,
    0
  );

  const onUpdate = (foodEntry: FoodEntry) => {
    setIsUpdating(foodEntry);
    setShowEditMenu(true);
  };

  useEffect(() => {
    if (calories > maxCalories) {
      toast("You've consumed too many calories!", {
        type: "warning",
        autoClose: 2000,
        hideProgressBar: true,
      });
    }
  }, [foodEntries, maxCalories, calories]);

  return (
    <div className="bg-purple-300 rounded flex flex-col p-2 w-80 md:w-96">
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
      <div className="flex justify-between flex-col md:flex-row">
        <div className="flex flex-col">
          <span>Total Calories: {calories} calory</span>
          <span>
            Total Price: {foodEntries.reduce((p, v) => p + v.price, 0)}$
          </span>
        </div>
        <div className="flex flex-col">
          <span>Max Calories: {maxCalories} calory</span>
          <button
            onClick={() => setShowMaxCaloryMenu(true)}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-1 px-2 text-xs rounded transition-colors"
          >
            Change Max Calories
          </button>
        </div>
      </div>
      {showEditMenu && (
        <FoodEditMenu
          foodEntry={isUpdating}
          onClose={() => {
            setShowEditMenu(false);
            setIsUpdating(null);
          }}
        />
      )}
      {showMaxCaloryMenu && (
        <MaxCaloriesModal onClose={() => setShowMaxCaloryMenu(false)} />
      )}
    </div>
  );
};

export default FoodEntryList;

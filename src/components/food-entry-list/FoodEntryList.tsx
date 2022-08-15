import { FoodEntry } from "@prisma/client";
import React, { useEffect, useState } from "react";
import FoodEditMenu from "../food-edit-menu/FoodEditMenu";
import FoodEntryCard from "./FoodEntryCard";
import { toast } from "react-toastify";
import MaxCaloriesModal from "./MaxCaloryModal";
import { useSession } from "../../utils/queries";
import Router from "next/router";

type FoodEntryListProps = {
  foodEntries: FoodEntry[];
  maxCalories: number;
  isFullDate?: boolean;
  noEdit?: boolean;
  userId?: string;
};

const FoodEntryList: React.FC<FoodEntryListProps> = ({
  foodEntries,
  maxCalories,
  isFullDate = false,
  noEdit = false,
  userId,
}) => {
  const { data } = useSession();
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [showMaxCaloryMenu, setShowMaxCaloryMenu] = useState(false);
  const [isUpdating, setIsUpdating] = useState<FoodEntry | null>(null);
  const calories = foodEntries.reduce(
    (acc, foodEntry) => acc + foodEntry.calories,
    0
  );
  const price = foodEntries.reduce(
    (acc, foodEntry) => acc + foodEntry.price,
    0
  );
  const maxPrice = 1000;
  const isAdmin = data?.user?.isAdmin;

  if (!isAdmin && userId && userId !== data?.user.id) {
    Router.push("/error");
  }

  const onUpdate = (foodEntry: FoodEntry) => {
    setIsUpdating(foodEntry);
    setShowEditMenu(true);
  };

  useEffect(() => {
    if (calories > maxCalories && !noEdit && !isAdmin) {
      const Id = toast("You've consumed too many calories!", {
        type: "warning",
        autoClose: 2000,
        hideProgressBar: true,
      });

      return () => {
        toast.dismiss(Id);
      };
    }
    if (price > maxPrice && !noEdit && !isAdmin) {
      const Id = toast("You've Paid too much!", {
        type: "warning",
        autoClose: 2000,
        hideProgressBar: true,
      });

      return () => {
        toast.dismiss(Id);
      };
    }
  }, [foodEntries, maxCalories, calories, noEdit, isAdmin, price]);

  return (
    <div className="bg-purple-300 rounded flex flex-col p-2 w-80 md:w-96">
      <div className=" flex flex-row justify-between pb-2">
        <h1 className="font-semibold">Food Entry List</h1>
        {!noEdit && (
          <button
            onClick={() => setShowEditMenu(true)}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-1 px-2 text-xs rounded transition-colors"
          >
            Add Food Entry
          </button>
        )}
      </div>
      <div className="flex flex-col gap-4">
        {foodEntries.map((foodEntry) => (
          <FoodEntryCard
            onUpdate={onUpdate}
            key={foodEntry.id}
            foodEntry={foodEntry}
            isFullDate={isFullDate}
            noEdit={noEdit}
          />
        ))}
      </div>
      <div className="flex justify-between flex-col md:flex-row">
        <div className="flex flex-col">
          <span>Total Calories: {calories} calory</span>
          <span>Total Price: {price}$</span>
        </div>
        {!noEdit && (
          <div className="flex flex-col">
            <span>Max Calories: {maxCalories} calory</span>
            <span>Max Price: 1000$</span>
            <button
              onClick={() => setShowMaxCaloryMenu(true)}
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-1 px-2 text-xs rounded transition-colors"
            >
              Change Max Calories
            </button>
          </div>
        )}
      </div>
      {showEditMenu && (
        <FoodEditMenu
          foodEntry={isUpdating}
          userId={userId}
          onClose={() => {
            setShowEditMenu(false);
            setIsUpdating(null);
          }}
        />
      )}
      {showMaxCaloryMenu && (
        <MaxCaloriesModal
          userId={userId}
          onClose={() => setShowMaxCaloryMenu(false)}
        />
      )}
    </div>
  );
};

export default FoodEntryList;

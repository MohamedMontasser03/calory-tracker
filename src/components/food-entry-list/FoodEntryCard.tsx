import { FoodEntry } from "@prisma/client";
import React from "react";

type FoodEntryCardProps = {
  foodEntry: FoodEntry;
  onUpdate: (foodEntry: FoodEntry) => void;
};

const FoodEntryCard = ({ foodEntry, onUpdate }: FoodEntryCardProps) => {
  const onDelete = () => {
    fetch("/api/user/food", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        foodEntry,
      }),
    });
  };

  return (
    <div className="flex flex-row justify-between bg-purple-500 rounded px-2 py-4">
      <div className="flex flex-col justify-between">
        <h2 className="font-medium">{foodEntry.name}</h2>
        <h2>Calories: {foodEntry.calories} calory</h2>
        <h2>Price: {foodEntry.price}$</h2>
        <h2>
          Date:{" "}
          {new Date(foodEntry.date).toLocaleString("en", {
            timeStyle: "short",
          })}
        </h2>
      </div>
      <div className="flex flex-col justify-evenly">
        <button
          onClick={() => onUpdate(foodEntry)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 text-xs rounded transition-colors"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 text-xs rounded transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default FoodEntryCard;

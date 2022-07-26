import React from "react";

const FoodEntryList = (props: {}) => {
  return (
    <div className="bg-purple-300 rounded flex flex-col p-2 w-80">
      <div className=" flex flex-row justify-between">
        <h1>Food Entry List</h1>
        <button className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-1 px-2 text-xs rounded">
          Add Food Entry
        </button>
      </div>
    </div>
  );
};

export default FoodEntryList;

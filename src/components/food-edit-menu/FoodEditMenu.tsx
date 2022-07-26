import { FoodEntry } from "@prisma/client";
import React from "react";
import { ErrorMessage, Formik } from "formik";

type FoodEditMenuProps = {
  foodEntry?: FoodEntry;
  onClose?: () => void;
};

const FoodEditMenu = ({ foodEntry, onClose }: FoodEditMenuProps) => {
  return (
    <div
      className="fixed flex justify-center items-center h-full w-full bg-black opacity-60 top-0 left-0"
      onClick={onClose}
    >
      <Formik
        initialValues={{
          name: foodEntry?.name || "",
          calories: foodEntry?.calories || "",
          date:
            foodEntry?.date?.toLocaleTimeString([], {
              hourCycle: "h23",
            }) ||
            new Date().toLocaleTimeString([], {
              hourCycle: "h23",
            }),
          price: foodEntry?.price || "",
        }}
        onSubmit={(values, { setSubmitting }) => {
          setSubmitting(false);
        }}
        validate={(values) => {
          const errors: {
            name?: string;
            calories?: string | number;
            date?: string | undefined;
            price?: string | number;
          } = {};
          if (!values.name) {
            errors.name = "Required";
          }
          if (!values.calories) {
            errors.calories = "Required";
          }
          if (!values.price) {
            errors.price = "Required";
          }
          if (!values.date) {
            errors.date = "Required";
          }
          // make sure date is in the past
          // turn HH:MM:SS string into date object
          const [hours, mins, secs] = values.date
            ?.split(":")
            .map(Number) as number[];
          const date = new Date().setHours(hours || 0, mins || 0, secs || 0);
          if (date > Date.now()) {
            errors.date = "Date must be in the past";
          }
          return errors;
        }}
      >
        {({ values, handleChange, handleSubmit, isSubmitting }) => (
          <form
            className="bg-purple-300 rounded flex flex-col p-2 w-80 gap-4"
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              className="bg-purple-400 rounded flex flex-col p-2 placeholder:text-white"
              placeholder="Enter food name"
              name="name"
              value={values.name}
              onChange={handleChange}
            />
            <ErrorMessage
              className="text-red-600 font-semibold"
              name="name"
              component="div"
            />
            <input
              type="number"
              className="bg-purple-400 rounded flex flex-col p-2 placeholder:text-white"
              placeholder="Enter calories"
              name="calories"
              value={values.calories}
              onChange={handleChange}
            />
            <ErrorMessage
              className="text-red-600 font-semibold"
              name="calories"
              component="div"
            />
            <input
              type="number"
              className="bg-purple-400 rounded flex flex-col p-2 placeholder:text-white"
              placeholder="Enter Price"
              name="price"
              value={values.price}
              onChange={handleChange}
            />
            <ErrorMessage
              className="text-red-600 font-semibold"
              name="price"
              component="div"
            />
            <input
              type="time"
              className="bg-purple-400 rounded flex flex-col p-2 placeholder:text-white"
              placeholder="Enter date"
              name="date"
              value={values.date}
              onChange={handleChange}
            />
            <ErrorMessage
              className="text-red-600 font-semibold"
              name="date"
              component="div"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-1 px-2 text-xs rounded transition-colors"
            >
              Add Food Entry
            </button>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default FoodEditMenu;

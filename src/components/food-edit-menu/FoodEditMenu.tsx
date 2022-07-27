import { FoodEntry } from "@prisma/client";
import React from "react";
import { ErrorMessage, Formik } from "formik";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type FoodEditMenuProps = {
  foodEntry?: FoodEntry | null;
  onClose?: () => void;
};

const FoodEditMenu = ({ foodEntry, onClose }: FoodEditMenuProps) => {
  const { data } = useSession();
  const queryClient = useQueryClient();
  const { mutate } = useMutation(
    ["foodEntries"],
    async ({
      values,
      date,
    }: {
      values: Record<string, string | number>;
      date: number;
    }) => {
      const res = await fetch("/api/user/food", {
        method: foodEntry ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          foodEntry: {
            ...(foodEntry || {}),
            ...values,
            userId: data?.user?.id,
            date: new Date(date),
          },
        }),
      });
      return await res.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["foodEntries"]);
      },
    }
  );

  return (
    <div
      className="fixed flex justify-center items-center h-full w-full bg-black bg-opacity-60 top-0 left-0"
      onClick={onClose}
    >
      <Formik
        initialValues={{
          name: foodEntry?.name || "",
          calories: foodEntry?.calories || "",
          date: new Date(
            foodEntry ? foodEntry.date : Date()
          ).toLocaleTimeString([], {
            hourCycle: "h23",
          }),
          price: foodEntry?.price || "",
        }}
        onSubmit={async (values, { setSubmitting }) => {
          setSubmitting(true);
          const [hours, mins, secs] = values.date
            ?.split(":")
            .map(Number) as number[];
          const date = new Date().setHours(hours || 0, mins || 0, secs || 0);
          mutate({
            values,
            date,
          });
          setSubmitting(false);
          onClose?.();
        }}
        validate={(values) => {
          const errors: Record<string, string> = {};
          const [hours, mins, secs] = values.date
            ?.split(":")
            .map(Number) as number[];
          const date = new Date().setHours(hours || 0, mins || 0, secs || 0);
          const validators = {
            name: z
              .string({
                required_error: "Name is required",
              })
              .min(1, "Name is required")
              .safeParse(values.name),
            calories: z
              .number({
                required_error: "Calories are required",
                invalid_type_error: "Price is required",
              })
              .positive("Calories must be positive")
              .safeParse(values.calories),
            price: z
              .number({
                required_error: "Price is required",
                invalid_type_error: "Price is required",
              })
              .positive("Price must be positive")
              .safeParse(values.price),
            date: z
              .date({
                required_error: "Date is required",
                invalid_type_error: "Date is required",
              })
              .max(new Date(), "Date must be in the past")
              .safeParse(new Date(date)),
          };
          Object.entries(validators).forEach(([key, val]) => {
            if (!val.success) {
              errors[key] = val.error.formErrors.formErrors[0] || "";
            }
          });
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

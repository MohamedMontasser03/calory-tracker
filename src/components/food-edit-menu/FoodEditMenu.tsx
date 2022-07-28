import { FoodEntry } from "@prisma/client";
import React from "react";
import { ErrorMessage, Formik } from "formik";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getDateFromDateTimeInput,
  getDateFromTimeInput,
  getDateTimeInputFromDate,
  getTimeInputFromDate,
} from "../../utils/date";
import { getErrorsFromValidation } from "../../utils/validation";

type FoodEditMenuProps = {
  foodEntry?: FoodEntry | null;
  userId?: string;
  onClose?: () => void;
};

const FoodEditMenu = ({ foodEntry, userId, onClose }: FoodEditMenuProps) => {
  const { data } = useSession();
  const queryClient = useQueryClient();
  const { mutate } = useMutation(
    ["foodEntries"],
    async ({ values }: { values: Record<string, string | number> }) => {
      const res = await fetch(`/api/user/food`, {
        method: foodEntry ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          foodEntry: {
            ...(foodEntry || {}),
            ...values,
            userId: userId || data?.user?.id,
            date: valueToDate((values.date as string) || ""),
          },
        }),
      });
      return await res.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["foodEntries"]);
        queryClient.invalidateQueries(["sumFoodEntries"]);
      },
    }
  );

  const isEditing = !!foodEntry;
  const isAdmin = !!userId;
  const initialDate = new Date(isEditing ? foodEntry.date : Date());
  const dateToValue = isAdmin ? getDateTimeInputFromDate : getTimeInputFromDate;
  const valueToDate = isAdmin ? getDateFromDateTimeInput : getDateFromTimeInput;
  return (
    <div
      className="fixed flex justify-center items-center h-full w-full bg-black bg-opacity-60 top-0 left-0"
      onClick={onClose}
    >
      <Formik
        initialValues={{
          name: foodEntry?.name || "",
          calories: foodEntry?.calories || "",
          date: dateToValue(initialDate),
          price: foodEntry?.price || "",
        }}
        onSubmit={async (values, { setSubmitting }) => {
          setSubmitting(true);
          mutate(
            {
              values,
            },
            {
              onSuccess: () => {
                setSubmitting(false);
                onClose?.();
                toast(`Food ${foodEntry ? "Edited" : "Added"} Successfully`, {
                  type: "success",
                  autoClose: 2000,
                  hideProgressBar: true,
                });
              },
            }
          );
        }}
        validate={(values) => {
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
              .safeParse(valueToDate((values.date as string) || "")),
          };

          return getErrorsFromValidation(validators);
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
              type={userId ? "datetime-local" : "time"}
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
              {foodEntry ? "Edit" : "Add"} Food Entry
            </button>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default FoodEditMenu;

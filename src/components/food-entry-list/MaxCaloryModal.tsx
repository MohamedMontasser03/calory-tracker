import React from "react";
import { ErrorMessage, Formik } from "formik";
import { string, z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

type MaxCaloriesModalProps = {
  onClose?: () => void;
  userId?: string;
};

const MaxCaloriesModal = ({ onClose, userId }: MaxCaloriesModalProps) => {
  const queryClient = useQueryClient();
  const { mutate } = useMutation(
    ["maxCalories"],
    async ({ values }: { values: Record<string, string | number> }) => {
      const res = await fetch(`/api/user/calory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          maxCalories: values.maxCalories,
          userId,
        }),
      });
      return await res.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["maxCalories"]);
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
          maxCalories:
            queryClient.getQueryData<any>(
              ["maxCalories", userId].filter((v) => v) // remove userId if undefined
            )?.maxCalories || 2100,
        }}
        onSubmit={async (values, { setSubmitting }) => {
          setSubmitting(true);
          mutate({ values });
          setSubmitting(false);
          onClose?.();
          toast(`Max Calories Changed Successfully`, {
            type: "success",
            autoClose: 2000,
            hideProgressBar: true,
          });
        }}
        validate={(values) => {
          const errors: Record<string, string> = {};
          const validators = {
            maxCalories: z
              .number({
                required_error: "Calories are required",
                invalid_type_error: "Price is required",
              })
              .positive("Calories must be positive")
              .safeParse(values.maxCalories),
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
              type="number"
              className="bg-purple-400 rounded flex flex-col p-2 placeholder:text-white"
              placeholder="Enter maxCalories"
              name="maxCalories"
              value={values.maxCalories}
              onChange={handleChange}
            />
            <ErrorMessage
              className="text-red-600 font-semibold"
              name="maxCalories"
              component="div"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-1 px-2 text-xs rounded transition-colors"
            >
              Update Max Calories
            </button>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default MaxCaloriesModal;

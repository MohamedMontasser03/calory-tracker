import React from "react";
import { ErrorMessage, Formik } from "formik";
import { string, z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { quickFetch } from "../../utils/fetch";
import { getErrorsFromValidation } from "../../utils/validation";

type MaxCaloriesModalProps = {
  onClose?: () => void;
  userId?: string;
};

const MaxCaloriesModal = ({ onClose, userId }: MaxCaloriesModalProps) => {
  const queryClient = useQueryClient();
  const { mutate } = useMutation(
    ["maxCalories"],
    ({ values }: { values: Record<string, string | number> }) =>
      quickFetch(`/api/user/calory`, "POST", {
        maxCalories: values.maxCalories,
        userId,
      }),
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
            queryClient.getQueryData<{ maxCalories: number }>(
              ["maxCalories", userId].filter((v) => v) // remove userId if undefined
            )?.maxCalories || 2100,
        }}
        onSubmit={async (values, { setSubmitting }) => {
          setSubmitting(true);
          mutate(
            { values },
            {
              onSuccess: () => {
                setSubmitting(false);
                onClose?.();
                toast(`Max Calories Changed Successfully`, {
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
            maxCalories: z
              .number({
                required_error: "Calories are required",
                invalid_type_error: "Price is required",
              })
              .positive("Calories must be positive")
              .safeParse(values.maxCalories),
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

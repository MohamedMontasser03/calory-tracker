import { z } from "zod";

export const getErrorsFromValidation = (
  validators: Record<string, z.SafeParseReturnType<unknown, unknown>>
): Record<string, string> => {
  const errors: Record<string, string> = {};
  Object.entries(validators).forEach(([key, val]) => {
    if (!val.success) {
      errors[key] = val.error.formErrors.formErrors[0] || "";
    }
  });
  return errors;
};

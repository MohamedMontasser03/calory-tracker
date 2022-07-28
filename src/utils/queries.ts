export const getRedirection = (
  urlCondition: Record<string, boolean | undefined | null>
) => {
  return Object.keys(urlCondition).find((key) => urlCondition[key]);
};

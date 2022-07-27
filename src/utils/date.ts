export const toLocaleDateString = (date: Date): string => {
  return date.toLocaleDateString([]);
};

export const parseDate = (date: string): Date => {
  return JSON.parse(JSON.stringify(date));
};

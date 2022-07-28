export const toLocaleDateString = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString([]);
};

export const setToMidnight = (date: Date): Date => {
  date.setHours(0, 0, 0, 0);
  return new Date(date);
};

export const parseDate = (date: string): Date => {
  return JSON.parse(JSON.stringify(date));
};

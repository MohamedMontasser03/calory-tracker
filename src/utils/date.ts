export const toLocaleDateString = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString([]);
};

export const setToMidnight = (date: Date): Date => {
  date.setHours(0, 0, 0, 0);
  return new Date(date);
};

export const getFirstDayOfWeek = (date: Date): Date => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

export const getWeekRange = (date: Date): [Date, Date] => {
  const firstDayOfWeek = getFirstDayOfWeek(date);
  const lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);
  return [firstDayOfWeek, lastDayOfWeek];
};

export const removeDaysFromDate = (date: Date, days: number): Date => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() - days);
  return newDate;
};

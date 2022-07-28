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

export const getDateFromTimeInput = (timeInput: string): Date => {
  const [hours, mins, secs] = timeInput.split(":").map(Number) as number[];
  const date = new Date().setHours(hours || 0, mins || 0, secs || 0);

  return new Date(date);
};

export const getDateFromDateTimeInput = (dateTimeInput: string): Date => {
  const [date, time] = dateTimeInput.split("T");
  const dateObj = new Date(date || "");
  const timeObj = getDateFromTimeInput(time || "");
  dateObj.setHours(timeObj.getHours());
  dateObj.setMinutes(timeObj.getMinutes());
  dateObj.setSeconds(timeObj.getSeconds());
  return dateObj;
};

export const getDateTimeInputFromDate = (date: Date): string => {
  const [month, day, year] = date
    .toLocaleDateString([], {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .split("/");
  const timeString = date.toTimeString().split(" ")[0];
  return `${year}-${month}-${day}T${timeString}`;
};

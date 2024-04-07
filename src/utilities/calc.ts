export const calculateTotalHours = (startDate: Date, endDate: Date): number => {
  const millisecondsPerHour = 1000 * 60 * 60;
  const differenceInMilliseconds = endDate.getTime() - startDate.getTime();
  const totalHours = differenceInMilliseconds / millisecondsPerHour;
  return totalHours;
};

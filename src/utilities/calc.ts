export const calculateTotalHours = (startDate: Date, endDate: Date): number => {
  const millisecondsPerHour = 1000 * 60 * 60;
  const differenceInMilliseconds = endDate.getTime() - startDate.getTime();
  const totalHours = differenceInMilliseconds / millisecondsPerHour;
  return totalHours;
};

export const generateRandomDigits = (length: number): string => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
};

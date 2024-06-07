export function getTimeIn24HourFormat(date: Date): string {
  return date.toString().substring(16, 21);
}

export function formatDateDdMmYyyy(date: Date): string {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  const day = date.getDate().toString().padStart(2, '0');

  return `${day}-${month}-${year}`;
}

export function getTodaysDate(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function getCurrentWeekStartDate(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const dayDifference = (dayOfWeek + 6) % 7;
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayDifference);
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek;
}

export function getCurrentMonthStartDate(): Date {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  return startOfMonth;
}

function convertToNSWTime(date: Date): Date {
  // Get the current date and time in UTC
  const utcDate = date.toLocaleTimeString();


  // Set the time zone to Australia/Sydney (AEST/AEDT)
  const nswTimezoneOffset = 10; // UTC+10 for AEST, UTC+11 for AEDT
  const nswTimezoneOffsetMilliseconds = nswTimezoneOffset * 60 * 60 * 1000;
  const nswTime = new Date(utcDate);
  nswTime.setTime(nswTime.getTime() - nswTimezoneOffsetMilliseconds);

  return nswTime;
}

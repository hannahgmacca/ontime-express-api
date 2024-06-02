export function getTimeIn24HourFormat(date: Date): string {
    const isoString = date.toISOString();
    const timePart = isoString.substring(11, 16); 
    return timePart;
}

export function formatDateDdMmYyyy(date: Date): string {
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
    const year = date.getFullYear().toString();
    const day = date.getDate().toString().padStart(2, '0');
    
    return `${month}-${day}-${year}`;
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
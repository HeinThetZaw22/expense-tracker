export const getThisWeekDays = () => {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const result = [];

  const today = new Date();
  const dayOfWeek = today.getDay(); // Sunday = 0, Monday = 1, etc.

  // Calculate Monday of the current week
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7)); // shift back to Monday

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);

    result.push({
      day: daysOfWeek[date.getDay()],
      date: date.toISOString().split("T")[0],
      income: 0,
      expense: 0,
    });
  }

  return result;
};

export const getLast12Months = () => {
  const monthsOfYear = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const result = [];

  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);

    const monthName = monthsOfYear[date.getMonth()];
    const shortYear = date.getFullYear().toString().slice(-2);
    const formattedMonthYear = `${monthName} ${shortYear}`; // Jan 24, Feb 25
    const formattedDate = date.toISOString().split("T")[0];

    result.push({
      month: formattedMonthYear,
      fullDate: formattedDate,
      income: 0,
      expense: 0,
    });
  }

  // return result;
  return result.reverse();
};

export const getThisYearMonths = () => {
  const monthsOfYear = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const result = [];

  const currentYear = new Date().getFullYear();

  for (let i = 0; i < 12; i++) {
    const date = new Date(currentYear, i, 1); // Start of each month

    const monthName = monthsOfYear[date.getMonth()];
    const shortYear = date.getFullYear().toString().slice(-2);
    const formattedMonthYear = `${monthName}`; // Jan 24, Feb 25
    const formattedDate = date.toISOString().split("T")[0];

    result.push({
      month: formattedMonthYear,
      fullDate: formattedDate,
      income: 0,
      expense: 0,
    });
  }

  return result;
};

export const getYearsRange = (startYear: number, endYear: number): any => {
  const result = [];
  const currentYear = new Date().getFullYear();

  // Start at two years before the current year and go up to two years after
  for (let year = currentYear - 2; year <= currentYear + 2; year++) {
    result.push({
      year: year.toString(),
      fullDate: `01-01-${year}`,
      income: 0,
      expense: 0,
    });
  }

  return result;
};

// export const getYearsRange = (startYear: number, endYear: number): any => {
//   const result = [];
//   for (let year = startYear; year <= endYear; year++) {
//     result.push({
//       year: year.toString(),
//       fullDate: `01-01-${year}`,
//       income: 0,
//       expense: 0,
//     });
//   }
//   // return result;
//   return result.reverse();
// };

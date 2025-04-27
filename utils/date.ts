export const getLast7Days = () => {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const result = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    result.push({
      day: daysOfWeek[date.getDay()], // Mon, Tue
      date: date.toISOString().split("T")[0], // '2024-02-5
      income: 0,
      expense: 0,
    });
  }
  return result;
  // returns an array of all the previous 7 days
};

export const monthsOfYear = [
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

export const getThisYear12Months = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const result = [];

  for (let month = 0; month < 12; month++) {
    const date = new Date(currentYear, month, 1); // 1st of each month
    const monthName = monthsOfYear[month];
    const shortYear = date.getFullYear().toString().slice(-2);
    const formattedMonthYear = `${monthName} ${shortYear}`;
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

export const getYearsRange = () => {
  const result = [];
  const currentYear = new Date().getFullYear();

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

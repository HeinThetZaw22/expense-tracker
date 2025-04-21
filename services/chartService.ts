import { firestore } from "@/config/firebase";
import { colors } from "@/constants/theme";
import { ResponseType, TransactionType } from "@/types";
import {
  getLast12Months,
  getThisWeekDays,
  getThisYearMonths,
  getYearsRange,
} from "@/utils/common";
import { scale } from "@/utils/styling";
import {
  collection,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";

export const fetchWeeklyStats = async (uid: string): Promise<ResponseType> => {
  try {
    // const last7Days = getLast7Days();
    const last7Days = getThisWeekDays();

    const startDate = new Date(last7Days[0].date);
    const startTimestamp = Timestamp.fromDate(startDate);

    const transactionRef = collection(firestore, "transactions");
    const q = query(
      transactionRef,
      where("uid", "==", uid),
      where("date", ">=", startTimestamp)
    );

    const snapshot = await getDocs(q);

    const formattedStats = [...last7Days]; // clone to modify
    snapshot.forEach((doc) => {
      const data = doc.data() as TransactionType;
      const txDate = (data.date as Timestamp).toDate();
      const txDateStr = txDate.toISOString().split("T")[0];

      const stat = formattedStats.find((item) => item.date === txDateStr);
      if (stat) {
        if (data.type === "income") {
          stat.income += data.amount;
        } else if (data.type === "expense") {
          stat.expense += data.amount;
        }
      }
    });

    // Transform for Gifted BarChart
    const chartData = formattedStats.flatMap((item, index) => [
      {
        value: item.income,
        label: item.day,
        spacing: scale(4),
        labelWidth: scale(30),
        frontColor: colors.primary, // income color
      },
      {
        value: item.expense,
        frontColor: colors.rose, // expense color
      },
    ]);

    return { success: true, data: chartData };
  } catch (error: any) {
    console.log("Error fetching weekly stats", error);
    return { success: false, msg: error.message };
  }
};

export const fetchMonthlyStats = async (uid: string): Promise<ResponseType> => {
  try {
    // Get the current month's first and last day
    const currentMonth = new Date();
    const startOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    );

    const startTimestamp = Timestamp.fromDate(startOfMonth);
    const endTimestamp = Timestamp.fromDate(endOfMonth);

    const transactionRef = collection(firestore, "transactions");
    const q = query(
      transactionRef,
      where("uid", "==", uid),
      where("date", ">=", startTimestamp),
      where("date", "<=", endTimestamp)
    );

    const snapshot = await getDocs(q);

    // const formattedStats = getLast12Months(); 
    const formattedStats = getThisYearMonths(); 
    snapshot.forEach((doc) => {
      const data = doc.data() as TransactionType;
      const txDate = (data.date as Timestamp).toDate();
      const txDateStr = txDate.toISOString().split("T")[0].slice(0, 7); // Get YYYY-MM format

      const stat = formattedStats.find(
        (item) => item.fullDate.slice(0, 7) === txDateStr
      );
      if (stat) {
        if (data.type === "income") {
          stat.income += data.amount;
        } else if (data.type === "expense") {
          stat.expense += data.amount;
        }
      }
    });

    // Transform for Gifted BarChart
    const chartData = formattedStats.flatMap((item) => [
      {
        value: item.income,
        label: item.month,
        spacing: scale(4),
        labelWidth: scale(30),
        frontColor: colors.primary, // income color
      },
      {
        value: item.expense,
        frontColor: colors.rose, // expense color
      },
    ]);

    return { success: true, data: chartData };
  } catch (error: any) {
    console.log("Error fetching monthly stats", error);
    return { success: false, msg: error.message };
  }
};

interface YearlyStat {
  year: string;
  fullDate: string;
  income: number;
  expense: number;
}

export const fetchYearlyStats = async (uid: string): Promise<ResponseType> => {
  try {
    // Get the current year's first and last day
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1); // January 1st
    const endOfYear = new Date(currentYear, 11, 31); // December 31st

    const startTimestamp = Timestamp.fromDate(startOfYear);
    const endTimestamp = Timestamp.fromDate(endOfYear);

    const transactionRef = collection(firestore, "transactions");
    const q = query(
      transactionRef,
      where("uid", "==", uid),
      where("date", ">=", startTimestamp),
      where("date", "<=", endTimestamp)
    );

    const snapshot = await getDocs(q);

    const formattedStats: YearlyStat[] = getYearsRange(
      startOfYear.getFullYear(),
      endOfYear.getFullYear()
    ); // Get stats for the years range

    snapshot.forEach((doc) => {
      const data = doc.data() as TransactionType;
      const txDate = (data.date as Timestamp).toDate();
      const txDateStr = txDate.getFullYear().toString(); // Get year from transaction date

      // Use the correct type for `item`
      const stat = formattedStats.find(
        (item: YearlyStat) => item.year === txDateStr
      );
      if (stat) {
        if (data.type === "income") {
          stat.income += data.amount;
        } else if (data.type === "expense") {
          stat.expense += data.amount;
        }
      }
    });

    // Transform for Gifted BarChart
    const chartData = formattedStats.flatMap((item) => [
      {
        value: item.income,
        label: item.year,
        spacing: scale(4),
        labelWidth: scale(30),
        frontColor: colors.primary, // income color
      },
      {
        value: item.expense,
        frontColor: colors.rose, // expense color
      },
    ]);

    return { success: true, data: chartData };
  } catch (error: any) {
    console.log("Error fetching yearly stats", error);
    return { success: false, msg: error.message };
  }
};

import { firestore } from "@/config/firebase";
import { colors } from "@/constants/theme";
import { ResponseType, TransactionType } from "@/types";
import { getThisWeekDays } from "@/utils/common";
import {
  getLast7Days,
  getThisYear12Months,
  getYearsRange,
  monthsOfYear,
} from "@/utils/date";
import { scale } from "@/utils/styling";
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";

export const getWeeklyStats = async (uid: string): Promise<ResponseType> => {
  try {
    // const today = new Date();
    // const sevenDaysAgo = new Date(today);
    // sevenDaysAgo.setDate(today.getDate() - 7);

    const last7Days = getThisWeekDays();

    const startDate = new Date(last7Days[0].date);
    const startTimestamp = Timestamp.fromDate(startDate);

    const transactionRef = collection(firestore, "transactions");
    const q = query(
      transactionRef,
      where("uid", "==", uid),
      where("date", ">=", startTimestamp),
      orderBy("date", "desc")
    );

    const snapshot = await getDocs(q);
    // const weeklyData = getLast7Days();
    const weeklyData = getThisWeekDays();
    const transactions: TransactionType[] = [];

    snapshot.forEach((doc) => {
      const transaction = doc.data() as TransactionType;
      transaction.id = doc.id;
      transactions.push(transaction);

      const transactionDate = (transaction.date as Timestamp)
        .toDate()
        .toISOString()
        .split("T")[0];
      const dayData = weeklyData.find((day) => day.date === transactionDate);

      if (dayData) {
        if (transaction.type == "income") {
          dayData.income += transaction.amount;
        } else if (transaction.type == "expense") {
          dayData.expense += transaction.amount;
        }
      }
    });

    const stats = weeklyData.flatMap((day) => [
      {
        value: day.income,
        label: day.day,
        spacing: scale(4),
        labelWidth: scale(30),
        frontColor: colors.primary,
      },
      {
        value: day.expense,
        frontColor: colors.rose,
      },
    ]);

    return {
      success: true,
      data: {
        stats,
        transactions,
      },
    };
  } catch (error: any) {
    console.log("Error fetching weekly stats", error);
    return { success: false, msg: error.message };
  }
};

export const getMonthlyStats = async (uid: string): Promise<ResponseType> => {
  try {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const transactionRef = collection(firestore, "transactions");
    const q = query(
      transactionRef,
      where("uid", "==", uid),
      where("date", ">=", Timestamp.fromDate(startOfYear)),
      orderBy("date", "desc")
    );

    const snapshot = await getDocs(q);

    const monthlyData = getThisYear12Months();
    console.log("monthlyData", monthlyData);
    const transactions: TransactionType[] = [];

    snapshot.forEach((doc) => {
      const transaction = doc.data() as TransactionType;
      transaction.id = doc.id;
      transactions.push(transaction);

      const date = (transaction.date as Timestamp).toDate();
      const monthIndex = date.getMonth();
      const year = date.getFullYear().toString().slice(-2);

      const monthName = monthlyData.find(
        (m) => m.month === `${monthsOfYear[monthIndex]} ${year}`
      );

      if (monthName) {
        if (transaction.type === "income") {
          monthName.income += transaction.amount;
        } else if (transaction.type === "expense") {
          monthName.expense += transaction.amount;
        }
      }
    });

    const stats = monthlyData.flatMap((month) => [
      {
        value: month.income,
        label: month.month,
        spacing: scale(8),
        labelWidth: scale(40),
        frontColor: colors.primary,
      },
      {
        value: month.expense,
        frontColor: colors.rose,
      },
    ]);

    return {
      success: true,
      data: {
        stats,
        transactions,
      },
    };
  } catch (error: any) {
    console.log("Error fetching monthly stats", error);
    return { success: false, msg: error.message };
  }
};

export const getYearlyStats = async (uid: string): Promise<ResponseType> => {
  try {
    const yearsData = getYearsRange();

    const startYear = parseInt(yearsData[0].year, 10);
    const startDate = new Date(startYear, 0, 1);
    const startTimestamp = Timestamp.fromDate(startDate);

    const transactionRef = collection(firestore, "transactions");
    const q = query(
      transactionRef,
      where("uid", "==", uid),
      where("date", ">=", startTimestamp),
      orderBy("date", "desc")
    );

    const snapshot = await getDocs(q);

    const transactions: TransactionType[] = [];

    snapshot.forEach((doc) => {
      const transaction = doc.data() as TransactionType;
      transaction.id = doc.id;
      transactions.push(transaction);

      const transactionDate = (transaction.date as Timestamp).toDate();
      const transactionYear = transactionDate.getFullYear().toString();

      const yearData = yearsData.find((year) => year.year === transactionYear);

      if (yearData) {
        if (transaction.type === "income") {
          yearData.income += transaction.amount;
        } else if (transaction.type === "expense") {
          yearData.expense += transaction.amount;
        }
      }
    });

    const stats = yearsData.flatMap((year) => [
      {
        value: year.income,
        label: year.year,
        spacing: scale(8),
        labelWidth: scale(40),
        frontColor: colors.primary,
      },
      {
        value: year.expense,
        frontColor: colors.rose,
      },
    ]);

    return {
      success: true,
      data: {
        stats,
        transactions,
      },
    };
  } catch (error: any) {
    console.error("Error fetching yearly stats:", error);
    return { success: false, msg: error.message };
  }
};

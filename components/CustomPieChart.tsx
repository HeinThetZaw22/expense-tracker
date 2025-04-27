import { StyleSheet, Text, View } from "react-native";
import React, { useState, useEffect, useMemo } from "react";
import { limit, orderBy, where, Timestamp } from "firebase/firestore";
import { useAuth } from "@/contexts/authContext";
import { useFetchData } from "@/hooks/useFetchData";
import { TransactionType } from "@/types";
import {
  PieChart,
  pieDataItem as BasePieDataItem,
} from "react-native-gifted-charts";
import { expenseCategories } from "@/constants/data";
import { colors, radius } from "@/constants/theme";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { scale, verticalScale } from "@/utils/styling";
import Loading from "./Loading";

type PieDataWithLabel = BasePieDataItem & {
  label: string;
};

const CustomPieChart = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { user } = useAuth();

  const getStartOfWeek = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day;
    const startOfWeek = new Date(date.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);
    return Timestamp.fromDate(startOfWeek);
  };

  const getStartOfMonth = (date: Date) => {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    return Timestamp.fromDate(startOfMonth);
  };

  const constraints = useMemo(() => {
    const today = new Date();
    let startDate: Timestamp;

    if (activeIndex === 0) {
      startDate = getStartOfWeek(today);
    } else {
      startDate = getStartOfMonth(today);
    }

    if (user?.uid) {
      return [
        where("uid", "==", user?.uid),
        where("date", ">=", startDate),
        orderBy("date", "desc"),
        limit(30),
      ];
    }

    return [];
  }, [activeIndex, user?.uid]);

  const {
    data: transactions,
    isLoading,
    error,
  } = useFetchData<TransactionType>("transactions", constraints);

  const expenses = transactions.filter((txn) => txn.type === "expense");

  const grouped: Record<string, number> = {};

  for (const txn of expenses) {
    const category = txn.category || "others";
    grouped[category] = (grouped[category] || 0) + txn.amount;
  }

  const totalAmount = Object.values(grouped).reduce((sum, val) => sum + val, 0);

  const pieData: PieDataWithLabel[] = Object.entries(grouped).map(
    ([category, amount]) => {
      const categoryInfo =
        expenseCategories[category] || expenseCategories.others;
      const percent = ((amount / totalAmount) * 100).toFixed(0);
      return {
        value: amount,
        color: categoryInfo.bgColor,
        text: `${percent}%`,
        label: categoryInfo.label,
      };
    }
  );

  return (
    <View>
      <View
        style={{
          padding: 20,
          flex: 1,
          justifyContent: "center",
          position: "relative",
          alignItems: "center",
        }}
      >
        {isLoading ? (
          <View style={styles.chartLoadingContainer}>
            <Loading />
            <View
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.primary }}>Loading pie data...</Text>
            </View>
          </View>
        ) : (
          <>
            <PieChart
              donut
              strokeColor={colors.neutral400}
              strokeWidth={1}
              innerRadius={65}
              data={pieData}
              showValuesAsLabels={true}
              showText
              innerCircleColor={colors.neutral900}
              innerCircleBorderColor={colors.neutral500}
              innerCircleBorderWidth={1}
              textColor="white"
              centerLabelComponent={() => (
                <Text
                  style={{
                    fontSize: 18,
                    color: colors.neutral500,
                    fontWeight: "bold",
                  }}
                >
                  Expenses
                </Text>
              )}
            />

            <View style={styles.legendContainer}>
              {pieData.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View
                    style={[styles.colorBox, { backgroundColor: item.color }]}
                  />
                  <Text style={styles.legendLabel}>
                    {item.label} ({item.text})
                  </Text>
                </View>
              ))}
            </View>
            <View style={{ paddingTop: 20}}>
              <Text style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.neutral200,
              }}>Total Expenses - {totalAmount.toLocaleString()} Kyats</Text>
            </View>
          </>
        )}
      </View>

      <View style={{ paddingVertical: 20 }}>
        <SegmentedControl
          values={["This Week", "This Month"]}
          selectedIndex={activeIndex}
          onChange={(event) => {
            setActiveIndex(event.nativeEvent.selectedSegmentIndex);
          }}
          tintColor={colors.neutral200}
          backgroundColor={colors.neutral700}
          appearance="dark"
          activeFontStyle={styles.segmentFontStyle}
          style={styles.segmentStyle}
          fontStyle={{ ...styles.segmentFontStyle, color: colors.white }}
        />
      </View>
    </View>
  );
};

export default CustomPieChart;

const styles = StyleSheet.create({
  legendContainer: {
    marginTop: 50,
    flexWrap: "wrap",
    flexDirection: "row",
    gap: 10,
  },
  chartLoadingContainer: {
    width: "100%",
    height: verticalScale(300),
    borderRadius: radius._12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    marginBottom: 8,
  },
  colorBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 14,
    color: colors.neutral200,
  },
  segmentStyle: {
    height: scale(37),
  },
  segmentFontStyle: {
    fontSize: verticalScale(13),
    fontWeight: "bold",
    color: colors.black,
  },
});

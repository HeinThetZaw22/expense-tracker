import { StyleSheet, Text, View } from "react-native";
import React, { useMemo } from "react";
import { limit, orderBy, where } from "firebase/firestore";
import { useAuth } from "@/contexts/authContext";
import { useFetchData } from "@/hooks/useFetchData";
import { TransactionType } from "@/types";
import {
  PieChart,
  pieDataItem as BasePieDataItem,
} from "react-native-gifted-charts";
import { expenseCategories } from "@/constants/data";
import { colors } from "@/constants/theme";

type PieDataWithLabel = BasePieDataItem & {
  label: string;
};

const CustomPieChart = () => {
  const { user } = useAuth();
  const constraints = useMemo(
    () => [where("uid", "==", user?.uid), orderBy("date", "desc"), limit(30)],
    [user?.uid]
  );

  const {
    data: transactions,
    isLoading,
    error,
  } = useFetchData<TransactionType>("transactions", constraints);

  const expenses = transactions.filter((txn) => txn.type === "expense");

  // Grouped amount by category
  const grouped: Record<string, number> = {};

  for (const txn of expenses) {
    const category = txn.category || "others";
    grouped[category] = (grouped[category] || 0) + txn.amount;
  }

  const totalAmount = Object.values(grouped).reduce((sum, val) => sum + val, 0);

  // Build pieData safely
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

  console.log("pieData", pieData);
  return (
    <View>
      <View
        style={{
          padding: 20,
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
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

        {/* Custom Legend */}
        <View style={styles.legendContainer}>
          {pieData.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View
                style={[styles.colorBox, { backgroundColor: item.color }]}
              />
              <Text style={styles.legendLabel}>{item.label} ({item.text})</Text>
            </View>
          ))}
        </View>
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
});

import { Alert, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/authContext";

import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { colors, radius } from "@/constants/theme";
import Loading from "./Loading";
import { BarChart } from "react-native-gifted-charts";
import { scale, verticalScale } from "@/utils/styling";
import {
  getMonthlyStats,
  getWeeklyStats,
  getYearlyStats,
} from "@/services/chart.service";
import TransactionList from "./TransactionList";

type ChartItem = {
  label?: string;
  value: number;
  frontColor: string;
  labelWidth?: number;
  spacing?: number;
};

const OriginalBarChart = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [chartLoading, setChartLoading] = useState(false);
  const { user } = useAuth();
  const [chartData, setChartData] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const generateYAxisLabels = (maxValue: number, sections: number) => {
    const interval = maxValue / sections;
    const labels = [];

    for (let i = 0; i <= sections; i++) {
      const value = interval * i;
      if (value >= 1000000) {
        labels.push(`${value / 1000000}M`);
      } else if (value >= 1000) {
        labels.push(`${value / 1000}k`);
      } else {
        labels.push(`${value}`);
      }
    }

    return labels;
  };

  const getMaxValueFromData = (data: ChartItem[]) => {
    const rawMax = Math.max(...data.map((item) => item.value), 0);
  
    if (rawMax === 0) return 10; // Default minimum if no data
  
    // Find the nearest upper nice integer
    const power = Math.pow(10, Math.floor(Math.log10(rawMax)));
    const roundedMax = Math.ceil(rawMax / power) * power;
  
    return roundedMax;
  };

  const dynamicMaxValue = getMaxValueFromData(chartData);
  const dynamicYAxisLabels = generateYAxisLabels(dynamicMaxValue, 10);

  useEffect(() => {
    if (activeIndex === 0) {
      weeklyStats();
    }
    if (activeIndex === 1) {
      monthlyStats();
    }
    if (activeIndex === 2) {
      yearlyStats();
    }
  }, [activeIndex]);

  const weeklyStats = async () => {
    setChartLoading(true);
    let res = await getWeeklyStats(user?.uid as string);
    setChartLoading(false);
    if (res.success) {
      setChartData(res?.data?.stats);
      setTransactions(res?.data?.transactions);
    } else {
      Alert.alert("Error", res.msg);
    }
  };

  const monthlyStats = async () => {
    setChartLoading(true);
    let res = await getMonthlyStats(user?.uid as string);
    setChartLoading(false);
    if (res.success) {
      setChartData(res?.data?.stats);
      setTransactions(res?.data?.transactions);
    } else {
      Alert.alert("Error", res.msg);
    }
  };

  const yearlyStats = async () => {
    setChartLoading(true);
    let res = await getYearlyStats(user?.uid as string);
    setChartLoading(false);
    if (res.success) {
      setChartData(res?.data?.stats);
      setTransactions(res?.data?.transactions);
    } else {
      Alert.alert("Error", res.msg);
    }
  };

  return (
    <View>
      <View style={styles.chartContainer}>
        {chartLoading && (
          <View style={styles.chartLoadingContainer}>
            <Loading />
          </View>
        )}
        {chartData.length > 0 ? (
          <BarChart
            data={chartData}
            barWidth={scale(12)}
            height={verticalScale(300)}
            spacing={scale(25)}
            roundedTop
            roundedBottom
            hideRules={false}
            rulesColor={colors.neutral700}
            rulesThickness={1}
          
            initialSpacing={scale(10)}
            isAnimated
            animationDuration={500}
            noOfSections={10}
            maxValue={dynamicMaxValue}
            yAxisLabelPrefix=""
            yAxisThickness={0}
            xAxisThickness={0}
            yAxisLabelWidth={scale(50)}
            yAxisLabelTexts={dynamicYAxisLabels}
            yAxisTextStyle={{ color: colors.neutral350 }}
            xAxisLabelTextStyle={{
              color: colors.neutral350,
              fontSize: verticalScale(12),
            }}
          />
        ) : (
          <View style={styles.noChart}>
            <Text style={{ color: colors.white, textAlign: "center" }}>
              No data available
            </Text>
          </View>
        )}
      </View>
      <View style={{ paddingVertical: 20 }}>
        <SegmentedControl
          values={["Weekly", "Monthly", "Yearly"]}
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
      <View style={{ paddingBottom: 30 }}>
        <TransactionList
          data={transactions}
          title="Transactions"
          emptyListMessage="No transactions found"
          loading={chartLoading}
        />
      </View>
    </View>
  );
};

export default OriginalBarChart;

const styles = StyleSheet.create({
  chartContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  chartLoadingContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: radius._12,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  header: {},
  noChart: {
    backgroundColor: "rgba(0.5, 0.5, 0.5, 0.5)",
    height: verticalScale(210),
  },
  searchIcon: {
    backgroundColor: colors.neutral700,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
    width: verticalScale(35),
    height: verticalScale(35),
    borderCurve: "continuous",
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

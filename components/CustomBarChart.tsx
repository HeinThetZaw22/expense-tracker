import { Alert, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/authContext";
import {
  fetchMonthlyStats,
  fetchWeeklyStats,
  fetchYearlyStats,
} from "@/services/chartService";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { colors, radius } from "@/constants/theme";
import Loading from "./Loading";
import { BarChart } from "react-native-gifted-charts";
import { scale, verticalScale } from "@/utils/styling";

type ChartItem = {
  label?: string;
  value: number;
  frontColor: string;
  labelWidth?: number;
  spacing?: number;
};

const CustomBarChart = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [chartLoading, setChartLoading] = useState(false);
  const { user } = useAuth();
  const [chartData, setChartData] = useState([]);

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
    return Math.max(...data.map((item) => item.value), 0);
  };

  const dynamicMaxValue = getMaxValueFromData(chartData);
  const dynamicYAxisLabels = generateYAxisLabels(dynamicMaxValue, 10);

  useEffect(() => {
    if (activeIndex === 0) {
      getWeeklyStats();
    }
    if (activeIndex === 1) {
      getMonthlyStats();
    }
    if (activeIndex === 2) {
      getYearlyStats();
    }
  }, [activeIndex]);

  const getWeeklyStats = async () => {
    setChartLoading(true);
    let res = await fetchWeeklyStats(user?.uid as string);
    setChartLoading(false);
    if (res.success) {
      setChartData(res.data);
    } else {
      Alert.alert("Error", res.msg);
    }
  };

  const getMonthlyStats = async () => {
    setChartLoading(true);
    let res = await fetchMonthlyStats(user?.uid as string);
    setChartLoading(false);
    if (res.success) {
      setChartData(res.data);
    } else {
      Alert.alert("Error", res.msg);
    }
  };
  const getYearlyStats = async () => {
    setChartLoading(true);
    let res = await fetchYearlyStats(user?.uid as string);
    setChartLoading(false);
    if (res.success) {
      setChartData(res.data);
    } else {
      Alert.alert("Error", res.msg);
    }
  };

  console.log("chartData", chartData);

  return (
    <View>
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
      <View style={styles.chartContainer}>
        {chartLoading && (
          <View style={styles.chartLoadingContainer}>
            <Loading />
          </View>
        )}
        {chartData.length > 0 ? (
          <BarChart
            data={chartData}
            height={verticalScale(300)}
            barWidth={scale(12)}
            spacing={scale(25)}
            roundedTop
            roundedBottom
            initialSpacing={scale(10)}
            isAnimated
            animationDuration={500}
            noOfSections={10}
            showValuesAsTopLabel
            topLabelTextStyle={{
              color: colors.white,
              fontSize: verticalScale(10),
              fontWeight: "600",
              transform: [{ rotate: "-90deg" }],
              textAlign: "center",
            }}
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
            hideRules
          />
        ) : (
          <View style={styles.noChart}>
            <Text style={{ color: colors.white, textAlign: "center" }}>
              No data available
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default CustomBarChart;

const styles = StyleSheet.create({
  chartContainer: {
    position: "relative",
    marginTop: verticalScale(30),
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

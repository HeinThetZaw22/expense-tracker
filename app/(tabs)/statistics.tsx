import { ScrollView, StyleSheet, View, Text } from "react-native";
import React, { useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import { colors, spacingX, spacingY } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import Header from "@/components/Header";
import CustomPieChart from "@/components/CustomPieChart";
import CustomBarChart from "@/components/CustomBarChart";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import OriginalBarChart from "@/components/OriginalBarChart";

const Statistics = () => {
  const [selectedTab, setSelectedTab] = useState("pie");

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Header title="Statistics" />
        </View>

        <View style={styles.segmentedControl}>
          <SegmentedControl
            style={{
              height: verticalScale(40),
              borderColor: colors.neutral500,
              borderWidth: 0.5,
            }}
            values={["Pie Chart", "Bar Chart"]}
            selectedIndex={selectedTab === "pie" ? 0 : 1}
            activeFontStyle={{ color: colors.black }}
            onChange={(event) =>
              setSelectedTab(
                event.nativeEvent.selectedSegmentIndex === 0 ? "pie" : "bar"
              )
            }
            tintColor={colors.primary}
          />
        </View>

        <ScrollView
          contentContainerStyle={{
            gap: spacingY._20,
            paddingBottom: verticalScale(100),
            paddingTop: verticalScale(20),
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* {selectedTab === "bar" && <CustomBarChart />} */}
          {selectedTab === "bar" && <OriginalBarChart />}
          {selectedTab === "pie" && <CustomPieChart />}
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default Statistics;

const styles = StyleSheet.create({
  header: {},
  container: {
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._5,
    gap: spacingY._10,
  },
  segmentedControl: {
    marginVertical: verticalScale(10),
  },
});

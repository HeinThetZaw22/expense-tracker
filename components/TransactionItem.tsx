import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { TransactionItemProps } from "@/types";
import { expenseCategories, incomeCategory } from "@/constants/data";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import Typo from "./Typo";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Timestamp } from "firebase/firestore";

const TransactionItem = ({ item, index, onClick }: TransactionItemProps) => {
  let category =
    item?.type === "income"
      ? incomeCategory
      : expenseCategories[item.category!];
  if (!category) {
    return null;
  }
  const IconComponent = category?.icon;

  const date = (item?.date as Timestamp)
    ?.toDate()
    ?.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50)
        .springify()
        .damping(13)}
    >
      <TouchableOpacity style={styles.row} onPress={() => onClick(item)}>
        <View style={[styles.icon, { backgroundColor: category?.bgColor }]}>
          {IconComponent && (
            <IconComponent
              size={verticalScale(25)}
              weight="fill"
              color={colors.white}
            />
          )}
        </View>
        <View style={styles.categoryDes}>
          <Typo size={16}>{category.label}</Typo>
          <Typo
            size={12}
            color={colors.neutral400}
            textProps={{ numberOfLines: 1 }}
          >
            {item?.description || ""}
          </Typo>
        </View>
        <View style={styles.amountDate}>
          <Typo
            size={16}
            fontWeight={"500"}
            color={item.type === "income" ? colors.primary : colors.rose}
          >
            {item.type === "income" ? "+" : "-"}
            {item.amount?.toLocaleString()} Kyats
          </Typo>
          <Typo size={12} color={colors.neutral400}>
            {date}
          </Typo>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default TransactionItem;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacingX._12,
    backgroundColor: colors.neutral800,
    padding: spacingY._10,
    paddingHorizontal: spacingY._10,
    borderRadius: radius._17,
    marginVertical: spacingY._5,
  },
  icon: {
    height: verticalScale(44),
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius._12,
    borderCurve: "continuous",
  },
  categoryDes: {
    flex: 1,
    gap: 2.5,
  },
  amountDate: {
    alignItems: "flex-end",
    gap: 3,
  },
});

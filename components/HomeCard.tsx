import { ImageBackground, StyleSheet, Text, View } from "react-native";
import React, { useMemo } from "react";
import Typo from "./Typo";
import { colors, spacingX, spacingY } from "@/constants/theme";
import { scale, verticalScale } from "@/utils/styling";
import { ArrowDown, ArrowUp, DotsThreeOutline } from "phosphor-react-native";
import { useAuth } from "@/contexts/authContext";
import { orderBy, where } from "firebase/firestore";
import { useFetchData } from "@/hooks/useFetchData";
import { WalletType } from "@/types";

const HomeCard = () => {
  const { user } = useAuth();

  const constraints = useMemo(
    () => [where("uid", "==", user?.uid), orderBy("created", "desc")],
    [user?.uid]
  );

  const { data, isLoading, error } = useFetchData<WalletType>(
    "wallets",
    constraints
  );

  const getTotals = () => {
    if (!data) return { totalAmount: 0, totalIncome: 0, totalExpenses: 0 };

    return data.reduce(
      (acc, wallet) => {
        (acc.totalAmount += wallet.amount || 0),
          (acc.totalIncome += wallet.totalIncome || 0),
          (acc.totalExpenses += wallet.totalExpenses || 0);
        return acc;
      },
      { totalAmount: 0, totalIncome: 0, totalExpenses: 0 }
    );
  };
  const totalBalance = getTotals();

  return (
    <ImageBackground
      resizeMode="stretch"
      style={styles.bgImage}
      source={require("../assets/images/card.png")}
    >
      <View style={styles.container}>
        {/* total balance  */}
        <View>
          <View style={styles.totalBalanceRow}>
            <Typo color={colors.neutral800} size={16} fontWeight={"500"}>
              Total Balance
            </Typo>
            <DotsThreeOutline
              size={verticalScale(23)}
              color={colors.black}
              weight="fill"
            />
          </View>
          <Typo color={colors.black} size={30} fontWeight={"bold"}>
            {isLoading
              ? "----"
              : `${totalBalance.totalAmount.toLocaleString()} Kyats`}
          </Typo>
        </View>

        {/* expense and income  */}
        <View style={styles.stats}>
          {/* income  */}
          <View style={{ gap: verticalScale(5) }}>
            <View style={styles.incomeExpense}>
              <View style={styles.statsIcon}>
                <ArrowDown
                  size={verticalScale(15)}
                  color={colors.black}
                  weight="bold"
                />
              </View>
              <Typo size={16} color={colors.neutral700} fontWeight={"500"}>
                Income
              </Typo>
            </View>
            <View style={{ alignSelf: "center" }}>
              <Typo size={17} fontWeight={"600"} color={colors.green}>
                {isLoading
                  ? "----"
                  : `  ${totalBalance.totalIncome.toLocaleString()} Kyats `}
              </Typo>
            </View>
          </View>

          {/* expense */}
          <View style={{ gap: verticalScale(5) }}>
            <View style={styles.incomeExpense}>
              <View style={styles.statsIcon}>
                <ArrowUp
                  size={verticalScale(15)}
                  color={colors.black}
                  weight="bold"
                />
              </View>
              <Typo size={16} color={colors.neutral700} fontWeight={"500"}>
                Expense
              </Typo>
            </View>
            <View style={{ alignSelf: "center" }}>
              <Typo size={17} fontWeight={"600"} color={colors.rose}>
                {isLoading
                  ? "----"
                  : ` ${totalBalance.totalExpenses.toLocaleString()} Kyats`}
              </Typo>
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

export default HomeCard;

const styles = StyleSheet.create({
  bgImage: {
    height: scale(210),
    width: "100%",
  },
  container: {
    padding: spacingX._20,
    paddingHorizontal: scale(23),
    height: "87%",
    width: "100%",
    justifyContent: "space-between",
  },
  totalBalanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._5,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statsIcon: {
    backgroundColor: colors.neutral350,
    padding: spacingY._5,
    borderRadius: 50,
  },
  incomeExpense: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingY._7,
  },
});

import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useMemo } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import Typo from "@/components/Typo";
import { PlusCircle } from "phosphor-react-native";
import { useRouter } from "expo-router";
import { useFetchData } from "@/hooks/useFetchData";
import { WalletType } from "@/types";
import { useAuth } from "@/contexts/authContext";
import { orderBy, where } from "firebase/firestore";
import Loading from "@/components/Loading";
import WalletCard from "@/components/WalletCard";

const Wallet = () => {
  const router = useRouter();
  const { user } = useAuth();

  const constraints = useMemo(
    () => [where("uid", "==", user?.uid), orderBy("created", "desc")],
    [user?.uid]
  );

  const { data, isLoading, error } = useFetchData<WalletType>(
    "wallets",
    constraints
  );

  const getTotalBalance = (): number => {
    return data.reduce((total, item) => total + (item.amount || 0), 0);
  };

  console.log("wallets", data);
  return (
    <ScreenWrapper style={{ backgroundColor: colors.black }}>
      <View style={styles.container}>
        {/* balance  */}
        <View style={styles.balanceView}>
          <View style={{ alignItems: "center" }}>
            <Typo size={28} fontWeight={"400"}>
              {" "}
              {getTotalBalance()?.toLocaleString()} Kyats
            </Typo>
            <Typo size={16} color={colors.neutral300}>
              Total Balance
            </Typo>
          </View>
        </View>

        {/* wallet  */}
        <View style={styles.wallets}>
          {/* header  */}
          <View style={styles.flexRow}>
            <Typo size={20} fontWeight={"500"}>
              My Wallets
            </Typo>
            <TouchableOpacity
              onPress={() => router.push("/(modals)/walletModal")}
            >
              <PlusCircle
                weight="fill"
                color={colors.primary}
                size={verticalScale(33)}
              />
            </TouchableOpacity>
          </View>

          {/* wallet list  */}
          {isLoading && <Loading />}
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <WalletCard item={item} index={index} />
            )}
            contentContainerStyle={styles.listStyle}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Wallet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  balanceView: {
    height: verticalScale(160),
    backgroundColor: colors.black,
    justifyContent: "center",
    alignItems: "center",
  },
  flexRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._10,
  },
  wallets: {
    flex: 1,
    backgroundColor: colors.neutral900,
    borderTopRightRadius: radius._30,
    borderTopLeftRadius: radius._30,
    padding: spacingX._20,
    paddingTop: spacingX._25,
  },
  listStyle: {
    paddingVertical: spacingY._25,
    paddingTop: spacingY._15,
  },
});

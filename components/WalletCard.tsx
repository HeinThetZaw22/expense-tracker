import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { WalletType } from "@/types";
import { verticalScale } from "@/utils/styling";
import { colors, radius, spacingX } from "@/constants/theme";
import { CaretRight, Wallet } from "phosphor-react-native";
import Typo from "./Typo";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";

const WalletCard = ({ item, index }: { item: WalletType; index: number }) => {
  const router = useRouter();
  const openWallet = () => {
    router.push({
      pathname: "/(modals)/walletModal",
      params: {
        id: item?.id,
        name: item?.name,
      },
    });
  };
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50)
        .springify()
        .damping(13)}
    >
      <TouchableOpacity onPress={openWallet} style={styles.container}>
        <View style={styles.imageContainer}>
          <Wallet size={verticalScale(30)} color={colors.white} />
        </View>
        <View style={styles.nameContainer}>
          <Typo size={16}>{item?.name}</Typo>
          <Typo size={16} color={colors.neutral400}>
            {item?.amount} {item?.amount && item?.amount > 0 ? "Kyats" : "Kyat"}
          </Typo>
        </View>
        <CaretRight
          size={verticalScale(20)}
          weight="bold"
          color={colors.white}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default WalletCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(17),
  },
  imageContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: verticalScale(45),
    width: verticalScale(45),
    borderWidth: 1,
    backgroundColor: colors.black,
    borderColor: colors.neutral600,
    borderRadius: radius._12,
    borderCurve: "continuous",
    overflow: "hidden",
  },
  nameContainer: {
    flex: 1,
    gap: 2,
    marginLeft: spacingX._20,
  },
});

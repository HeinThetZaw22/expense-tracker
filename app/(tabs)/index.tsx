import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useMemo } from "react";
import Typo from "@/components/Typo";
import { colors, spacingX, spacingY } from "@/constants/theme";
import { useAuth } from "@/contexts/authContext";
import ScreenWrapper from "@/components/ScreenWrapper";
import { verticalScale } from "@/utils/styling";
import { MagnifyingGlass, Plus } from "phosphor-react-native";
import HomeCard from "@/components/HomeCard";
import TransactionList from "@/components/TransactionList";
import Button from "@/components/Button";
import { useRouter } from "expo-router";
import { limit, orderBy, where } from "firebase/firestore";
import { useFetchData } from "@/hooks/useFetchData";
import { TransactionType } from "@/types";

const Home = () => {
  const { user } = useAuth();
  const router = useRouter();
  console.log("user", user);

  const constraints = useMemo(
    () => [where("uid", "==", user?.uid), orderBy("date", "desc"), limit(30)],
    [user?.uid]
  );

  const { data, isLoading, error } = useFetchData<TransactionType>(
    "transactions",
    constraints
  );

  console.log("transactions", data);

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* header  */}
        <View style={styles.header}>
          <View style={{ gap: 4 }}>
            <Typo size={16} color={colors.neutral400}>
              Hello,
            </Typo>
            <Typo size={20} fontWeight={"500"}>
              {user?.name}
            </Typo>
          </View>
          <TouchableOpacity style={styles.searchIcon}>
            <MagnifyingGlass
              size={verticalScale(22)}
              weight="bold"
              color={colors.neutral200}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollViewStyle}
          showsVerticalScrollIndicator={false}
        >
          <View>
            <HomeCard />
          </View>

          <TransactionList
            data={data}
            loading={isLoading}
            emptyListMessage="No transactions added yet"
            title="All Transactions"
          />
        </ScrollView>

        <Button
          onPress={() => router.push("/(modals)/transactionModal")}
          style={styles.floatingButton}
        >
          <Plus color={colors.black} weight="bold" size={verticalScale(24)} />
        </Button>
      </View>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._20,
    marginTop: verticalScale(8),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._10,
  },
  searchIcon: {
    backgroundColor: colors.neutral700,
    padding: spacingX._10,
    borderRadius: 50,
  },
  floatingButton: {
    height: verticalScale(50),
    width: verticalScale(50),
    borderRadius: 100,
    position: "absolute",
    bottom: verticalScale(30),
    right: verticalScale(30),
  },
  scrollViewStyle: {
    marginTop: spacingY._10,
    paddingBottom: verticalScale(100),
    gap: spacingY._25,
  },
});

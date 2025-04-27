import { ScrollView, StyleSheet, View } from "react-native";
import React, { useMemo, useState } from "react";
import { colors, spacingX, spacingY } from "@/constants/theme";
import { scale, verticalScale } from "@/utils/styling";
import ModalWrapper from "@/components/ModalWrapper";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import { Trash } from "phosphor-react-native";
import Typo from "@/components/Typo";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { useAuth } from "@/contexts/authContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFetchData } from "@/hooks/useFetchData";
import { TransactionType } from "@/types";
import { orderBy, where } from "firebase/firestore";
import TransactionList from "@/components/TransactionList";

const SearchModal = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const router = useRouter();

  const constraints = useMemo(
    () => [where("uid", "==", user?.uid), orderBy("date", "desc")],
    [user?.uid]
  );
  const {
    data: allTransactions,
    isLoading,
    error,
  } = useFetchData<TransactionType>("transactions", constraints);

  const filterTransactions = allTransactions.filter((item) => {
    if (search.length > 1) {
      if (
        item.category?.toLowerCase()?.includes(search?.toLowerCase()) ||
        item.type?.toLowerCase()?.includes(search?.toLowerCase()) ||
        item.description?.toLowerCase()?.includes(search?.toLowerCase())
      ) {
        return true;
      }
      return false;
    }
    return true;
  });

  console.log("all transactions", allTransactions);

  return (
    <ModalWrapper style={{ backgroundColor: colors.neutral900 }}>
      <View style={styles.container}>
        <Header
          title={"Search"}
          leftIcon={<BackButton />}
          style={{ marginBottom: spacingY._10 }}
        />

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.form}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.inputContainer}>
            <Input
              placeholder="Search here"
              value={search}
              onChangeText={(value) => setSearch(value)}
            />
          </View>

          <View>
            <TransactionList
              data={filterTransactions}
              loading={isLoading}
              emptyListMessage="No transactions match your search"
            />
          </View>
        </ScrollView>
      </View>
    </ModalWrapper>
  );
};

export default SearchModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingY._20,
    paddingBottom: spacingY._10,
  },

  scrollContainer: {
    flex: 1,
  },
  form: {
    gap: spacingY._30,
    paddingTop: spacingY._15,
    paddingBottom: spacingY._20,
  },
  inputContainer: {
    gap: spacingY._10,
  },
});

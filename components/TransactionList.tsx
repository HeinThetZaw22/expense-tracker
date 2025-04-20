import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { TransactionListType } from "@/types";
import { verticalScale } from "@/utils/styling";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import Typo from "./Typo";
import { FlashList } from "@shopify/flash-list";
import TransactionItem from "./TransactionItem";
import Loading from "./Loading";

const TransactionList = ({
  data,
  loading,
  title,
  emptyListMessage,
}: TransactionListType) => {
  const handleClickItem = () => {
    //to open transaction detail
  };
  return (
    <View style={styles.container}>
      {title && (
        <Typo size={20} style={{ paddingTop: 20}} fontWeight={"500"}>
          {title}
        </Typo>
      )}

      {loading && (
        <View style={{ top: verticalScale(100) }}>
          <Loading />
        </View>
      )}

      {!loading && data?.length === 0 && (
        <Typo
          size={15}
          color={colors.neutral400}
          style={{ textAlign: "center", marginTop: spacingY._15 }}
        >
          {emptyListMessage}
        </Typo>
      )}
      <View style={styles.list}>
        <FlashList
          data={data}
          renderItem={({ item, index }) => (
            <TransactionItem
              item={item}
              index={index}
              onClick={handleClickItem}
            />
          )}
          estimatedItemSize={50}
        />
      </View>
    </View>
  );
};

export default TransactionList;

const styles = StyleSheet.create({
  container: {
    gap: spacingY._17,
    marginBottom: verticalScale(10),
  },
  list: {
    minHeight: 3,
  },
});

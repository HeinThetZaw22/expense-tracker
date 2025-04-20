import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { TransactionItemProps } from "@/types";
import { expenseCategories } from "@/constants/data";

const TransactionItem = ({ item, index, onClick }: TransactionItemProps) => {
  let category = expenseCategories["groceries"];

  return (
    <View>
      <Text>TransactionItem</Text>
    </View>
  );
};

export default TransactionItem;

const styles = StyleSheet.create({});

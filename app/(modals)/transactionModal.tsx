import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { scale, verticalScale } from "@/utils/styling";
import ModalWrapper from "@/components/ModalWrapper";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import { Trash } from "phosphor-react-native";
import Typo from "@/components/Typo";
import Input from "@/components/Input";
import { TransactionType, WalletType } from "@/types";
import Button from "@/components/Button";
import { useAuth } from "@/contexts/authContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { createOrUpdateWallet, deleteWallet } from "@/services/walletService";
import { Dropdown } from "react-native-element-dropdown";
import { expenseCategories, transactionTypes } from "@/constants/data";
import { useFetchData } from "@/hooks/useFetchData";
import { orderBy, where } from "firebase/firestore";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import {
  createOrUpdateTransaction,
  deleteTransaction,
} from "@/services/transactionService";

type TransactionParamType = {
  id: string;
  type: string;
  amount: string;
  category?: string;
  date: string;
  description?: string;
  uid?: string;
  walletId: string;
};

const TransactionModal = () => {
  const [transaction, setTransaction] = useState<TransactionType>({
    type: "expense",
    amount: 0,
    description: "",
    category: "",
    date: new Date(),
    walletId: "",
    image: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const router = useRouter();
  const oldTransaction: TransactionParamType = useLocalSearchParams();
  console.log("tparam", oldTransaction);

  const { user } = useAuth();
  const constraints = useMemo(
    () => [where("uid", "==", user?.uid), orderBy("created", "desc")],
    [user?.uid]
  );
  const {
    data: wallets,
    isLoading: isFetchingWallets,
    error,
  } = useFetchData<WalletType>("wallets");

  useEffect(() => {
    if (oldTransaction?.id) {
      setTransaction({
        type: oldTransaction.type,
        amount: Number(oldTransaction.amount),
        description: oldTransaction.description || "",
        category: oldTransaction.category,
        date: new Date(oldTransaction.date),
        walletId: oldTransaction.walletId,
      });
    }
  }, []);

  const onSubmit = async () => {
    const { walletId, amount, type, date, category, description } = transaction;
    if (!walletId || !date || !amount || (type === "expense" && !category)) {
      Alert.alert("Transaction", "Please fill all the fields");
      return;
    }
    setIsLoading(true);
    let data: TransactionType = {
      type,
      amount,
      date,
      description,
      walletId,
      uid: user?.uid,
      ...(type === "expense" && { category }),
    };

    if (oldTransaction?.id) {
      data.id = oldTransaction?.id as string;
    }

    const res = await createOrUpdateTransaction(data);
    setIsLoading(false);
    if (res.success) {
      router.back();
    } else {
      Alert.alert("Wallet", res.msg);
    }
  };

  const onDelete = async () => {
    if (!oldTransaction?.id) return;
    setIsLoading(true);
    const res = await deleteTransaction(
      oldTransaction?.walletId,
      oldTransaction?.id
    );
    if (res.success) {
      router.back();
    } else {
      Alert.alert("Wallet", res.msg);
    }
  };

  const showDeleteAlert = () => {
    Alert.alert(
      "Confirm",
      "Are you sure you want to delete this transaction?",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => console.log("cancel delete wallet"),
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: onDelete,
        },
      ]
    );
  };

  return (
    <ModalWrapper>
      <View style={styles.container}>
        <Header
          title={oldTransaction?.id ? "Update Transaction" : "Add Transaction"}
          leftIcon={<BackButton />}
          style={{ marginBottom: spacingY._10 }}
        />

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.form}
          showsVerticalScrollIndicator={false}
        >
          {/*  select type  */}
          <View style={styles.inputContainer}>
            <Typo size={16} color={colors.neutral200}>
              Type
            </Typo>
            <Dropdown
              style={styles.dropdownContainer}
              activeColor={colors.neutral700}
              selectedTextStyle={styles.dropdownSelectedText}
              iconStyle={styles.dropdownIcon}
              itemTextStyle={styles.dropItemText}
              itemContainerStyle={styles.dropdownItemContainer}
              containerStyle={styles.dropdownListContainer}
              data={transactionTypes}
              maxHeight={300}
              labelField="label"
              valueField="value"
              value={transaction.type}
              onChange={(item) => {
                setTransaction((prev) => ({
                  ...prev,
                  type: item.value,
                  category: item.value === "income" ? "" : prev.category,
                }));
              }}
            />
          </View>

          {/* select wallet  */}
          <View style={styles.inputContainer}>
            <Typo size={16} color={colors.neutral200}>
              Wallet
            </Typo>
            <Dropdown
              data={wallets.map((wallet) => ({
                label: `${wallet.name} (${wallet.amount})`,
                value: wallet?.id,
              }))}
              style={styles.dropdownContainer}
              activeColor={colors.neutral700}
              selectedTextStyle={styles.dropdownSelectedText}
              iconStyle={styles.dropdownIcon}
              itemTextStyle={styles.dropItemText}
              itemContainerStyle={styles.dropdownItemContainer}
              containerStyle={styles.dropdownListContainer}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholderStyle={styles.dropItemText}
              placeholder="Select wallet"
              value={transaction.walletId}
              onChange={(item) => {
                setTransaction({ ...transaction, walletId: item.value || "" });
              }}
            />
          </View>

          {/* expense category */}
          {transaction.type === "expense" && (
            <View style={styles.inputContainer}>
              <Typo size={16} color={colors.neutral200}>
                Category
              </Typo>
              <Dropdown
                data={Object.values(expenseCategories)}
                style={styles.dropdownContainer}
                activeColor={colors.neutral700}
                selectedTextStyle={styles.dropdownSelectedText}
                iconStyle={styles.dropdownIcon}
                itemTextStyle={styles.dropItemText}
                itemContainerStyle={styles.dropdownItemContainer}
                containerStyle={styles.dropdownListContainer}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholderStyle={styles.dropItemText}
                placeholder="Select category"
                value={transaction.category}
                onChange={(item) => {
                  setTransaction({
                    ...transaction,
                    category: item.value || "",
                  });
                }}
              />
            </View>
          )}

          {/* date picker  */}
          <View style={styles.inputContainer}>
            <Typo size={16} color={colors.neutral200}>
              Date
            </Typo>
            {!showDatePicker && (
              <Pressable
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Typo size={14}>
                  {(transaction.date as Date).toLocaleDateString()}
                </Typo>
              </Pressable>
            )}
            {/* in ios, it should be hanlde differently for date picker ui */}
            {showDatePicker && (
              <View style={styles.flexRow}>
                <DateTimePicker
                  value={transaction.date as Date}
                  mode="date"
                  display="default"
                  onChange={(
                    event: DateTimePickerEvent,
                    selectedDate?: Date
                  ) => {
                    if (event.type === "set" && selectedDate) {
                      setTransaction((prev) => ({
                        ...prev,
                        date: selectedDate,
                      }));
                    }
                    setShowDatePicker(false);
                  }}
                />
              </View>
            )}
          </View>

          {/* amount  */}
          <View style={styles.inputContainer}>
            <Typo size={16} color={colors.neutral200}>
              Amount
            </Typo>
            <Input
              placeholder="Wallet Name"
              keyboardType="numeric"
              value={transaction.amount.toString()}
              onChangeText={(value) =>
                setTransaction({
                  ...transaction,
                  amount: Number(value.replace(/[^0-9]/g, "")),
                })
              }
            />
          </View>

          {/* description  */}
          <View style={styles.inputContainer}>
            <View style={styles.flexRow}>
              <Typo size={16} color={colors.neutral200}>
                Description
              </Typo>
              <Typo size={14} color={colors.neutral500}>
                (optional)
              </Typo>
            </View>
            <Input
              placeholder="description"
              multiline
              containerStyle={{
                flexDirection: "row",
                height: verticalScale(150),
                alignItems: "flex-start",
                paddingVertical: 15,
              }}
              value={transaction.description}
              onChangeText={(value) =>
                setTransaction({
                  ...transaction,
                  description: value,
                })
              }
            />
          </View>
        </ScrollView>

        {/* footer button  */}
        <View style={styles.footer}>
          {oldTransaction?.id && !isLoading && (
            <Button
              onPress={showDeleteAlert}
              style={{
                backgroundColor: colors.rose,
                paddingHorizontal: spacingX._15,
              }}
            >
              <Trash
                size={verticalScale(20)}
                color={colors.white}
                weight="bold"
              />
            </Button>
          )}
          <Button loading={isLoading} onPress={onSubmit} style={{ flex: 1 }}>
            <Typo color={colors.black} fontWeight={"700"}>
              {oldTransaction?.id ? "Update Transaction" : "Add Transaction"}
            </Typo>
          </Button>
        </View>
      </View>
    </ModalWrapper>
  );
};

export default TransactionModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingY._20,
    paddingBottom: spacingY._10,
  },
  scrollContainer: {
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    // paddingHorizontal: spacingX._20,
    gap: scale(12),
    paddingTop: spacingY._15,
    borderTopColor: colors.neutral700,
    borderTopWidth: 1,
    marginBottom: spacingY._5,
  },
  form: {
    gap: spacingY._30,
    paddingVertical: spacingY._20,
    paddingBottom: spacingY._40,
  },
  inputContainer: {
    gap: spacingY._10,
  },
  iosDropDown: {
    flexDirection: "row",
    height: verticalScale(54),
    alignItems: "center",
    justifyContent: "center",
    fontSize: verticalScale(14),
    borderWidth: 1,
    color: colors.white,
    borderColor: colors.neutral300,
    borderRadius: radius._17,
    borderCurve: "continuous",
    paddingHorizontal: spacingX._15,
  },
  androidDropDown: {
    // flexDirection: "row",
    height: verticalScale(54),
    alignItems: "center",
    justifyContent: "center",
    fontSize: verticalScale(14),
    borderWidth: 1,
    color: colors.white,
    borderColor: colors.neutral300,
    borderRadius: radius._17,
    borderCurve: "continuous",
    // paddingHorizontal: spacingX._15
  },
  flexRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._5,
  },
  dateInput: {
    flexDirection: "row",
    height: verticalScale(54),
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.neutral300,
    borderRadius: radius._17,
    borderCurve: "continuous",
    paddingHorizontal: spacingX._15,
  },
  iosDatePicker: {},
  datePickerButton: {
    backgroundColor: colors.neutral700,
    alignSelf: "flex-end",
    padding: spacingY._7,
    marginRight: spacingX._7,
    paddingHorizontal: spacingY._15,
    borderRadius: radius._10,
  },
  dropdownContainer: {
    height: verticalScale(54),
    borderWidth: 1,
    borderColor: colors.neutral300,
    paddingHorizontal: spacingX._15,
    borderRadius: radius._15,
    borderCurve: "continuous",
  },
  dropItemText: {
    color: colors.white,
  },
  dropdownSelectedText: {
    color: colors.white,
    fontSize: verticalScale(14),
  },
  dropdownListContainer: {
    backgroundColor: colors.neutral900,
    borderRadius: radius._15,
    borderCurve: "continuous",
    paddingVertical: spacingY._7,
    top: 5,
    borderColor: colors.neutral500,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 15,
  },
  dropdownPlaceholder: {
    color: colors.white,
  },
  dropdownItemContainer: {
    borderRadius: radius._15,
    marginHorizontal: spacingX._7,
  },
  dropdownIcon: {
    height: verticalScale(30),
    tintColor: colors.neutral300,
  },
});

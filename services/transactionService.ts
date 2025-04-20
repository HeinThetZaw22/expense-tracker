import { firestore } from "@/config/firebase";
import { ResponseType, TransactionType, WalletType } from "@/types";
import { collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export const createOrUpdateTransaction = async (
  transactionData: Partial<TransactionType>
): Promise<ResponseType> => {
  try {
    const { id, type, amount, category, description, walletId, date } =
      transactionData;

    if (!amount || amount <= 0 || !walletId || !type) {
      return { success: false, msg: "Invalid transaction data" };
    }

    if (id) {
      //TODO: update transaction
    } else {
      let res = await updateWalletForNewTransaction(walletId, amount, type);
      if (!res.success) {
        return res;
      }
    }

    const transactionRef = id
      ? doc(firestore, "transactions", id)
      : doc(collection(firestore, "transactions"));
    await setDoc(transactionRef, transactionData, { merge: true });

    return {
      success: true,
      data: { ...transactionData, id: transactionRef.id },
      msg: "Transaction created/updated successfully",
    };
  } catch (error: any) {
    console.log("Error upserting transaction");
    return { success: false, msg: error.message };
  }
};

const updateWalletForNewTransaction = async (
  walletId: string,
  amount: number,
  type: string
) => {
  try {
    const walletRef = doc(firestore, "wallets", walletId);
    const walletSnapshot = await getDoc(walletRef);
    if (!walletSnapshot.exists()) {
      return { success: false, msg: "Wallet not found" };
    }

    const walletData = walletSnapshot.data() as WalletType;
    if (type === "expense" && walletData.amount! - amount < 0) {
      return { success: false, msg: "Insufficient balance" };
    }

    const updatedWallet = {
      ...walletData,
      amount:
        type === "expense"
          ? walletData.amount! - amount
          : walletData.amount! + amount,
      totalExpenses:
        type === "expense"
          ? walletData.totalExpenses! + amount
          : walletData.totalExpenses,
      totalIncome:
        type === "income"
          ? walletData.totalIncome! + amount
          : walletData.totalIncome,
    };

    await updateDoc(walletRef, updatedWallet);

    return { success: true, msg: "Wallet updated successfully" };
  } catch (error: any) {
    return { success: false, msg: error.message };
  }
};

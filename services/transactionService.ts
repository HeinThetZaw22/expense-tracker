import { firestore } from "@/config/firebase";
import { ResponseType, TransactionType, WalletType } from "@/types";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

export const createOrUpdateTransaction = async (
  transactionData: Partial<TransactionType>
): Promise<ResponseType> => {
  try {
    const { id, type, amount, walletId } = transactionData;

    if (!amount || amount <= 0 || !walletId || !type) {
      return { success: false, msg: "Invalid transaction data" };
    }

    if (id) {
      const transactionRef = doc(firestore, "transactions", id);
      const existingSnap = await getDoc(transactionRef);

      if (!existingSnap.exists()) {
        return { success: false, msg: "Transaction not found" };
      }

      const prev = existingSnap.data() as TransactionType;

      //checking for safe wallet update
      const simulation = await simulateApplyNewTransaction(
        walletId,
        amount,
        type
      );
      if (!simulation.success) return simulation;

      // 1 Revert old transaction from old wallet
      let revertRes = await revertOldTransactionFromWallet(prev);
      if (!revertRes.success) {
        return revertRes;
      }
      //2 apply new transaction to new (or same) wallet
      let applyRes = await updateWalletForNewTransaction(
        walletId,
        amount,
        type
      );
      if (!applyRes.success) {
        return applyRes;
      }

      //3 Save updated transactin
      await setDoc(transactionRef, transactionData, { merge: true });
      return {
        success: true,
        data: { ...transactionData, id },
        msg: "Transaction updated successfully",
      };
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

const revertOldTransactionFromWallet = async (transaction: TransactionType) => {
  try {
    const walletRef = doc(firestore, "wallets", transaction.walletId);
    const walletSnap = await getDoc(walletRef);

    if (!walletSnap.exists()) {
      return { success: false, msg: "Wallet not found for revert" };
    }

    const walletData = walletSnap.data() as WalletType;

    const updatedWallet = {
      ...walletData,
      amount:
        transaction.type === "expense"
          ? walletData.amount! + transaction.amount
          : walletData.amount! - transaction.amount,
      totalExpenses:
        transaction.type === "expense"
          ? walletData.totalExpenses! - transaction.amount
          : walletData.totalExpenses,
      totalIncome:
        transaction.type === "income"
          ? walletData.totalIncome! - transaction.amount
          : walletData.totalIncome,
    };

    await updateDoc(walletRef, updatedWallet);

    return { success: true, msg: "Old transaction reverted" };
  } catch (error: any) {
    return { success: false, msg: error.message };
  }
};

const simulateApplyNewTransaction = async (
  walletId: string,
  amount: number,
  type: string
): Promise<ResponseType> => {
  try {
    const walletRef = doc(firestore, "wallets", walletId);
    const walletSnapshot = await getDoc(walletRef);
    if (!walletSnapshot.exists()) {
      return { success: false, msg: "Wallet not found" };
    }

    const wallet = walletSnapshot.data() as WalletType;

    if (type === "expense" && wallet.amount! < amount) {
      return { success: false, msg: "Insufficient balance to apply update" };
    }

    return { success: true, msg: "Simulated apply success" };
  } catch (error: any) {
    return { success: false, msg: error.message };
  }
};

export const deleteTransaction = async (
  walletId: string,
  transactionId: string
): Promise<ResponseType> => {
  try {
    const transactionRef = doc(firestore, "transactions", transactionId);
    const transactionSnap = await getDoc(transactionRef);

    if (!transactionSnap.exists()) {
      return { success: false, msg: "Transaction not found" };
    }

    const transactionData = transactionSnap.data() as TransactionType;

    if (transactionData.walletId !== walletId) {
      return {
        success: false,
        msg: "Transaction does not belong to this wallet",
      };
    }

    // Revert the wallet update
    const revertRes = await revertOldTransactionFromWallet(transactionData);
    if (!revertRes.success) {
      return revertRes;
    }

    // Delete the transaction
    //soft delete, it won't be deleted from firebase store
    // await setDoc(transactionRef, { deleted: true }, { merge: true });

    //hard delete
    await deleteDoc(transactionRef);

    return { success: true, msg: "Transaction deleted successfully" };
  } catch (error: any) {
    console.log("Error deleting transaction");
    return { success: false, msg: error.message };
  }
};

import { firestore } from "@/config/firebase";
import { ResponseType, WalletType } from "@/types";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";

export const createOrUpdateWallet = async (
  walletData: Partial<WalletType>
): Promise<ResponseType> => {
  try {
    let walletToSave = { ...walletData };

    //for new wallet
    if (!walletData?.id) {
      walletToSave.amount = 0;
      walletToSave.totalExpenses = 0;
      walletToSave.totalIncome = 0;
      walletToSave.created = new Date();
    }

    //determine create or update
    const walletRef = walletData?.id
      ? doc(firestore, "wallets", walletData.id)
      : doc(collection(firestore, "wallets"));

    //merge: true mean updates only the data provided
    await setDoc(walletRef, walletToSave, { merge: true });
    return { success: true, data: { ...walletToSave, id: walletRef.id } };
  } catch (error: any) {
    console.log("Error upserting wallet");
    return { success: false, msg: error.message };
  }
};

export const deleteWallet = async (walletId: string): Promise<ResponseType> => {
  try {
    const walletRef = doc(firestore, "wallets", walletId);
    //TODO: delete related transactions
    //1. Get all related transactions
    const transactionsRef = collection(firestore, "transactions");
    const q = query(transactionsRef, where("walletId", "==", walletId));
    const transactionSnapshots = await getDocs(q);

    //2. Batch delete
    const batch = writeBatch(firestore);
    transactionSnapshots.forEach((doc) => {
      batch.delete(doc.ref);
    });

    //3. Delete the wallet
    batch.delete(walletRef);
    await batch.commit();

    return {
      success: true,
      msg: "Wallet and related transactions deleted successfully",
    };
  } catch (error: any) {
    console.log("Error deleting wallet");
    return { success: false, msg: error.message };
  }
};

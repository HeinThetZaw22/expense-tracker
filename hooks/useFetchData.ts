import { firestore } from "@/config/firebase";
import {
  collection,
  onSnapshot,
  query,
  QueryConstraint,
} from "firebase/firestore";
import { useEffect, useState } from "react";

type FirebaseDoc<T> = T & { id: string };

export function useFetchData<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
) {
  const [data, setData] = useState<FirebaseDoc<T>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!collectionName) return;

    let isMounted = true;

    const collectionRef = collection(firestore, collectionName);
    const q = query(collectionRef, ...constraints);

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        if (!isMounted) return;
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as FirebaseDoc<T>[];

        setData(docs);
        setIsLoading(false);
      },
      (err) => {
        if (!isMounted) return;
        console.log("Error fetching data:", err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => {
      isMounted = false;
      unsub();
    };
  }, [collectionName, ...constraints]);

  return { data, isLoading, error };
}

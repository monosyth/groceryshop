import { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const ReceiptContext = createContext();

export function useReceipts() {
  const context = useContext(ReceiptContext);
  if (!context) {
    throw new Error('useReceipts must be used within a ReceiptProvider');
  }
  return context;
}

export function ReceiptProvider({ children }) {
  const { currentUser } = useAuth();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setReceipts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(
      collection(db, 'receipts'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const receiptData = [];
        snapshot.forEach((doc) => {
          receiptData.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        // Sort by date (newest first)
        receiptData.sort((a, b) => {
          const dateA = a.createdAt?.toDate() || new Date(0);
          const dateB = b.createdAt?.toDate() || new Date(0);
          return dateB - dateA;
        });

        setReceipts(receiptData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching receipts:', error);
        setError(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Helper: Get only analyzed receipts with items
  const getAnalyzedReceipts = () => {
    return receipts.filter(
      (receipt) =>
        receipt.metadata?.analysisStatus === 'completed' &&
        receipt.items &&
        receipt.items.length > 0
    );
  };

  // Helper: Get receipts with store info
  const getReceiptsWithStores = () => {
    return receipts.filter((receipt) => receipt.storeInfo?.name);
  };

  const value = {
    receipts,
    loading,
    error,
    getAnalyzedReceipts,
    getReceiptsWithStores,
  };

  return <ReceiptContext.Provider value={value}>{children}</ReceiptContext.Provider>;
}

import { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Paper, CircularProgress } from '@mui/material';
import { Receipt as ReceiptIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { getUserReceipts } from '../../services/receiptService';
import ReceiptCard, { ReceiptCardSkeleton } from '../receipt/ReceiptCard';
import ReceiptDetail from '../receipt/ReceiptDetail';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Fetch receipts with real-time updates
  useEffect(() => {
    if (!currentUser) return;

    // Query receipts for current user
    const q = query(
      collection(db, 'receipts'),
      where('userId', '==', currentUser.uid)
    );

    // Subscribe to real-time updates
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

        // Sort by creation date (newest first)
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
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => unsubscribe();
  }, [currentUser]);

  // Handle receipt card click
  const handleReceiptClick = (receipt) => {
    setSelectedReceipt(receipt);
    setDetailOpen(true);
  };

  // Handle detail dialog close
  const handleDetailClose = () => {
    setDetailOpen(false);
    setSelectedReceipt(null);
  };

  return (
    <Container maxWidth="lg" sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom fontWeight="bold" color="primary.main">
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {receipts.length > 0
            ? `You have ${receipts.length} receipt${receipts.length === 1 ? '' : 's'}`
            : 'Welcome to your grocery tracking dashboard!'}
        </Typography>
      </Box>

      {/* Loading State */}
      {loading && (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <ReceiptCardSkeleton />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Empty State */}
      {!loading && receipts.length === 0 && (
        <Paper
          elevation={2}
          sx={{
            p: 8,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <ReceiptIcon sx={{ fontSize: 80, color: 'primary.light' }} />
          <Typography variant="h5" fontWeight="600">
            No Receipts Yet
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Start uploading receipts to see them here!
          </Typography>
        </Paper>
      )}

      {/* Receipts Grid */}
      {!loading && receipts.length > 0 && (
        <Grid container spacing={3}>
          {receipts.map((receipt) => (
            <Grid item xs={12} sm={6} md={4} key={receipt.id}>
              <ReceiptCard receipt={receipt} onClick={() => handleReceiptClick(receipt)} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Receipt Detail Dialog */}
      <ReceiptDetail receipt={selectedReceipt} open={detailOpen} onClose={handleDetailClose} />
    </Container>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { Container, Typography, Box, Grid, Paper, CircularProgress } from '@mui/material';
import { Receipt as ReceiptIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { getUserReceipts } from '../../services/receiptService';
import ReceiptCard, { ReceiptCardSkeleton } from '../receipt/ReceiptCard';
import ReceiptDetail from '../receipt/ReceiptDetail';
import SearchBar from '../search/SearchBar';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Search and filter state
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({ dateRange: 'all', category: 'all' });
  const [sortBy, setSortBy] = useState('date-desc');

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

  // Filter and sort receipts
  const filteredAndSortedReceipts = useMemo(() => {
    let filtered = [...receipts];

    // Apply text search
    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter((receipt) => {
        const storeName = receipt.storeInfo?.name?.toLowerCase() || '';
        const location = receipt.storeInfo?.location?.toLowerCase() || '';
        const items = receipt.items?.map((item) => item.name?.toLowerCase()).join(' ') || '';
        return storeName.includes(search) || location.includes(search) || items.includes(search);
      });
    }

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();

      switch (filters.dateRange) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case '7days':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case '30days':
          cutoffDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          cutoffDate.setDate(now.getDate() - 90);
          break;
      }

      filtered = filtered.filter((receipt) => {
        const receiptDate = receipt.createdAt?.toDate() || new Date(0);
        return receiptDate >= cutoffDate;
      });
    }

    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter((receipt) => {
        return receipt.items?.some((item) => item.category === filters.category);
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return (b.createdAt?.toDate() || new Date(0)) - (a.createdAt?.toDate() || new Date(0));
        case 'date-asc':
          return (a.createdAt?.toDate() || new Date(0)) - (b.createdAt?.toDate() || new Date(0));
        case 'amount-desc':
          return (b.summary?.total || 0) - (a.summary?.total || 0);
        case 'amount-asc':
          return (a.summary?.total || 0) - (b.summary?.total || 0);
        case 'store-asc':
          return (a.storeInfo?.name || '').localeCompare(b.storeInfo?.name || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [receipts, searchText, filters, sortBy]);

  return (
    <Container maxWidth="lg" sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom fontWeight="bold" color="primary.main">
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {receipts.length > 0
            ? `Showing ${filteredAndSortedReceipts.length} of ${receipts.length} receipt${receipts.length === 1 ? '' : 's'}`
            : 'Welcome to your grocery tracking dashboard!'}
        </Typography>
      </Box>

      {/* Search and Filters */}
      {!loading && receipts.length > 0 && (
        <SearchBar
          onSearchChange={setSearchText}
          onFilterChange={setFilters}
          onSortChange={setSortBy}
        />
      )}

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

      {/* Empty State - No receipts at all */}
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

      {/* Empty State - No results from filters */}
      {!loading && receipts.length > 0 && filteredAndSortedReceipts.length === 0 && (
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
          <ReceiptIcon sx={{ fontSize: 80, color: 'text.disabled' }} />
          <Typography variant="h5" fontWeight="600">
            No Receipts Found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Try adjusting your search or filters
          </Typography>
        </Paper>
      )}

      {/* Receipts Grid */}
      {!loading && filteredAndSortedReceipts.length > 0 && (
        <Grid container spacing={3}>
          {filteredAndSortedReceipts.map((receipt) => (
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

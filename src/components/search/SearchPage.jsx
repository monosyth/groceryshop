import { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Divider,
  Stack,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Store as StoreIcon,
  CalendarToday as CalendarIcon,
  LocationOn,
} from '@mui/icons-material';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import SearchBar from './SearchBar';
import { format } from 'date-fns';

/**
 * Category colors for chips
 */
const categoryColors = {
  grocery: 'default',
  produce: 'success',
  meat: 'error',
  dairy: 'info',
  bakery: 'warning',
  frozen: 'primary',
  beverages: 'secondary',
  snacks: 'warning',
  household: 'default',
  'personal care': 'info',
  health: 'success',
  other: 'default',
};

export default function SearchPage() {
  const { currentUser } = useAuth();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({ dateRange: 'all', category: 'all' });
  const [sortBy, setSortBy] = useState('date-desc');

  // Load receipts from Firestore
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const receiptsQuery = query(
      collection(db, 'receipts'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      receiptsQuery,
      (snapshot) => {
        const receiptsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReceipts(receiptsList);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading receipts:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Flatten all items from all receipts with receipt context
  const allItems = useMemo(() => {
    const items = [];
    receipts.forEach((receipt) => {
      if (receipt.items && Array.isArray(receipt.items)) {
        receipt.items.forEach((item, index) => {
          items.push({
            ...item,
            itemId: `${receipt.id}-${index}`,
            receiptId: receipt.id,
            receiptStore: receipt.storeInfo?.name || 'Unknown Store',
            receiptDate: receipt.storeInfo?.date,
            receiptLocation: receipt.storeInfo?.location,
          });
        });
      }
    });
    return items;
  }, [receipts]);

  // Filter and search items
  const filteredItems = useMemo(() => {
    let items = [...allItems];

    // Text search - search item name, receipt text, keywords, category, store, and location
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      items = items.filter((item) => {
        // Search in item name
        if (item.name?.toLowerCase().includes(searchLower)) return true;

        // Search in receipt text (shorthand)
        if (item.receiptText?.toLowerCase().includes(searchLower)) return true;

        // Search in keywords array
        if (
          item.keywords &&
          Array.isArray(item.keywords) &&
          item.keywords.some((keyword) => keyword.toLowerCase().includes(searchLower))
        ) {
          return true;
        }

        // Search in category
        if (item.category?.toLowerCase().includes(searchLower)) return true;

        // Search in store name (matches Dashboard behavior)
        if (item.receiptStore?.toLowerCase().includes(searchLower)) return true;

        // Search in store location (matches Dashboard behavior)
        if (item.receiptLocation?.toLowerCase().includes(searchLower)) return true;

        return false;
      });
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case '7days':
          filterDate.setDate(now.getDate() - 7);
          break;
        case '30days':
          filterDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          filterDate.setDate(now.getDate() - 90);
          break;
        default:
          break;
      }

      items = items.filter((item) => {
        if (!item.receiptDate) return false;
        const itemDate = item.receiptDate.toDate();
        return itemDate >= filterDate;
      });
    }

    // Category filter
    if (filters.category !== 'all') {
      items = items.filter((item) => item.category === filters.category);
    }

    // Sort items
    switch (sortBy) {
      case 'date-desc':
        items.sort((a, b) => {
          if (!a.receiptDate) return 1;
          if (!b.receiptDate) return -1;
          return b.receiptDate.toDate() - a.receiptDate.toDate();
        });
        break;
      case 'date-asc':
        items.sort((a, b) => {
          if (!a.receiptDate) return 1;
          if (!b.receiptDate) return -1;
          return a.receiptDate.toDate() - b.receiptDate.toDate();
        });
        break;
      case 'amount-desc':
        items.sort((a, b) => (b.totalPrice || 0) - (a.totalPrice || 0));
        break;
      case 'amount-asc':
        items.sort((a, b) => (a.totalPrice || 0) - (b.totalPrice || 0));
        break;
      case 'store-asc':
        items.sort((a, b) =>
          (a.receiptStore || '').localeCompare(b.receiptStore || '')
        );
        break;
      default:
        break;
    }

    return items;
  }, [allItems, searchText, filters, sortBy]);

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom fontWeight="bold" color="primary.main">
          Search Items
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Find items by name, keywords (candy, creamer, etc.), category, date, or store
        </Typography>
      </Box>

      {/* Search Bar */}
      <SearchBar
        onSearchChange={setSearchText}
        onFilterChange={setFilters}
        onSortChange={setSortBy}
      />

      {/* Results Header */}
      {filteredItems.length > 0 && (
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            {searchText || filters.category !== 'all' || filters.dateRange !== 'all'
              ? `Found ${filteredItems.length} item${filteredItems.length !== 1 ? 's' : ''}`
              : `${filteredItems.length} total item${filteredItems.length !== 1 ? 's' : ''}`}
          </Typography>
        </Box>
      )}

      {/* Empty state - no items at all */}
      {allItems.length === 0 && (
        <Paper
          elevation={2}
          sx={{
            p: 6,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <SearchIcon sx={{ fontSize: 64, color: 'primary.light' }} />
          <Typography variant="h6" fontWeight="600">
            No Receipts Yet
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Upload a receipt to start tracking your grocery items
          </Typography>
        </Paper>
      )}

      {/* Empty state - no results after search/filter */}
      {allItems.length > 0 &&
        filteredItems.length === 0 &&
        (searchText || filters.category !== 'all' || filters.dateRange !== 'all') && (
          <Paper
            elevation={2}
            sx={{
              p: 6,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <SearchIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
            <Typography variant="h6" fontWeight="600">
              No Items Found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Try adjusting your search or filters
            </Typography>
          </Paper>
        )}

      {/* Results Grid */}
      {filteredItems.length > 0 && (
        <Grid container spacing={3}>
          {filteredItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.itemId}>
              <Card
                elevation={2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Item Name */}
                  <Typography variant="h6" gutterBottom fontWeight="600" noWrap>
                    {item.name}
                  </Typography>
                  {item.receiptText && item.receiptText !== item.name && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      Receipt: {item.receiptText}
                    </Typography>
                  )}

                  {/* Category Chip */}
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={item.category || 'other'}
                      color={categoryColors[item.category] || 'default'}
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </Box>

                  {/* Store Info - Prominent */}
                  <Box
                    sx={{
                      mb: 2,
                      p: 1.5,
                      bgcolor: 'primary.lighter',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'primary.light',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <StoreIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                      <Typography variant="body2" fontWeight="700" color="primary.main" noWrap>
                        {item.receiptStore}
                      </Typography>
                    </Box>
                    {item.receiptLocation && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {item.receiptLocation}
                        </Typography>
                      </Box>
                    )}
                    {item.receiptDate && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          Purchased {format(item.receiptDate.toDate(), 'MMM d, yyyy')}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Item Details */}
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Quantity:
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {item.quantity || 1}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Unit Price:
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        ${(item.unitPrice || 0).toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Total Paid:
                      </Typography>
                      <Typography variant="body1" fontWeight="700" color="primary">
                        ${(item.totalPrice || 0).toFixed(2)}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

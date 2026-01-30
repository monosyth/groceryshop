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

      {/* Results List */}
      {filteredItems.length > 0 && (
        <Stack spacing={2}>
          {filteredItems.map((item) => (
            <Card
              key={item.itemId}
              elevation={1}
              sx={{
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: 3,
                  bgcolor: 'action.hover',
                },
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: { xs: 2, md: 3 },
                    alignItems: { xs: 'stretch', md: 'center' },
                  }}
                >
                  {/* Left: Item Info */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="h6" fontWeight="600" sx={{ flexGrow: 1 }}>
                        {item.name}
                      </Typography>
                      <Chip
                        label={item.category}
                        color={categoryColors[item.category] || 'default'}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </Box>
                    {item.receiptText && item.receiptText !== item.name && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        Receipt: {item.receiptText}
                      </Typography>
                    )}
                  </Box>

                  {/* Middle: Store Info */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.5,
                      minWidth: { md: 220 },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StoreIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                      <Typography variant="body2" fontWeight="600" color="primary.main">
                        {item.receiptStore}
                      </Typography>
                    </Box>
                    {item.receiptLocation && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 3.5 }}>
                        <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {item.receiptLocation}
                        </Typography>
                      </Box>
                    )}
                    {item.receiptDate && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 3.5 }}>
                        <CalendarIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {format(item.receiptDate.toDate(), 'MMM d, yyyy')}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Right: Pricing */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'row', md: 'column' },
                      justifyContent: { xs: 'space-between', md: 'center' },
                      alignItems: { md: 'flex-end' },
                      gap: { xs: 2, md: 0.5 },
                      minWidth: { md: 140 },
                      pt: { xs: 1, md: 0 },
                      borderTop: { xs: 1, md: 0 },
                      borderColor: { xs: 'divider', md: 'transparent' },
                    }}
                  >
                    <Box sx={{ textAlign: { md: 'right' } }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Qty: {item.quantity || 1} × ${(item.unitPrice || 0).toFixed(2)}
                      </Typography>
                      <Typography variant="h6" fontWeight="700" color="primary.main">
                        ${(item.totalPrice || 0).toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}

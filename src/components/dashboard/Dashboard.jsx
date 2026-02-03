import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Divider,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Edit as EditIcon,
  ArrowUpward,
  ArrowDownward,
  Store as StoreIcon,
  CalendarToday as CalendarIcon,
  CameraAlt,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useReceipts } from '../../context/ReceiptContext';
import { getUserReceipts, retryReceiptAnalysis, createReceipt } from '../../services/receiptService';
import { addReceiptItemsToPantry } from '../../services/pantryService';
import ReceiptCard, { ReceiptCardSkeleton } from '../receipt/ReceiptCard';
import ReceiptDetail from '../receipt/ReceiptDetail';
import SearchBar from '../search/SearchBar';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { format } from 'date-fns';
import { getCategoryInfo, teal, blue, darkGray, brown, cream } from '../../theme/colors';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { receipts, loading } = useReceipts();
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState(0); // 0 = Receipts, 1 = Items

  // Search and filter state
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({ dateRange: 'all', category: 'all' });
  const [sortBy, setSortBy] = useState('date-desc');

  // Items view sort
  const [itemsSortBy, setItemsSortBy] = useState('name-asc');

  // Edit functionality for items
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editedName, setEditedName] = useState('');

  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Track which receipts have been processed for pantry auto-add
  const processedReceiptsRef = useRef(new Set());

  // Auto-add items to pantry for newly analyzed receipts
  useEffect(() => {
    if (!currentUser || !receipts.length) return;

    receipts.forEach(async (receipt) => {
      // Check if receipt was just analyzed and hasn't been processed yet
      if (
        receipt.items &&
        receipt.items.length > 0 &&
        receipt.metadata?.analysisStatus === 'completed' &&
        !receipt.metadata?.addedToPantry &&
        !processedReceiptsRef.current.has(receipt.id)
      ) {
        processedReceiptsRef.current.add(receipt.id);

        try {
          const addedCount = await addReceiptItemsToPantry(
            currentUser.uid,
            receipt.id,
            receipt.items,
            receipt.storeInfo?.name
          );

          // Mark receipt as processed
          await updateDoc(doc(db, 'receipts', receipt.id), {
            'metadata.addedToPantry': true,
            'metadata.pantryItemsAdded': addedCount,
          });

          if (addedCount > 0) {
            setSnackbar({
              open: true,
              message: `Added ${addedCount} item${addedCount !== 1 ? 's' : ''} to pantry!`,
              severity: 'success',
            });
          }
        } catch (error) {
          console.error('Error adding items to pantry:', error);
        }
      }
    });
  }, [receipts, currentUser]);

  // Handle receipt card click
  const handleReceiptClick = (receipt) => {
    setSelectedReceipt(receipt);
    setDetailOpen(true);
  };

  // Handle retry analysis
  const handleRetryAnalysis = async (receiptId) => {
    try {
      await retryReceiptAnalysis(receiptId);
      setSnackbar({
        open: true,
        message: 'Retrying analysis... Please wait a moment.',
        severity: 'info',
      });
    } catch (error) {
      console.error('Retry error:', error);
      setSnackbar({
        open: true,
        message: 'Failed to retry. Please try again.',
        severity: 'error',
      });
    }
  };

  // Handle file upload
  const handleFileUpload = async (file) => {
    if (!currentUser) {
      setSnackbar({
        open: true,
        message: 'You must be logged in to upload receipts',
        severity: 'error',
      });
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      await createReceipt(file, currentUser.uid, (progressPercent) => {
        setUploadProgress(progressPercent);
      });

      setSnackbar({
        open: true,
        message: 'Receipt uploaded successfully! Analyzing...',
        severity: 'success',
      });
    } catch (error) {
      console.error('Upload error:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to upload receipt',
        severity: 'error',
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle file select
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Trigger camera input
  const triggerCameraInput = () => {
    cameraInputRef.current?.click();
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Handle detail dialog close
  const handleDetailClose = () => {
    setDetailOpen(false);
    setSelectedReceipt(null);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Reset search when switching tabs
    setSearchText('');
  };

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

  // Filter and sort receipts
  const filteredAndSortedReceipts = useMemo(() => {
    let filtered = [...receipts];

    // Apply text search
    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter((receipt) => {
        const storeName = receipt.storeInfo?.name?.toLowerCase() || '';
        const location = receipt.storeInfo?.location?.toLowerCase() || '';
        const itemNames = receipt.items?.map((item) => item.name?.toLowerCase()).join(' ') || '';
        const receiptTexts = receipt.items?.map((item) => item.receiptText?.toLowerCase()).join(' ') || '';
        const keywords = receipt.items?.flatMap((item) => item.keywords || []).map((kw) => kw.toLowerCase()).join(' ') || '';
        return storeName.includes(search) || location.includes(search) || itemNames.includes(search) || receiptTexts.includes(search) || keywords.includes(search);
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

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let items = [...allItems];

    // Text search
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      items = items.filter((item) => {
        if (item.name?.toLowerCase().includes(searchLower)) return true;
        if (item.receiptText?.toLowerCase().includes(searchLower)) return true;
        if (
          item.keywords &&
          Array.isArray(item.keywords) &&
          item.keywords.some((keyword) => keyword.toLowerCase().includes(searchLower))
        ) {
          return true;
        }
        if (item.category?.toLowerCase().includes(searchLower)) return true;
        if (item.receiptStore?.toLowerCase().includes(searchLower)) return true;
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
    switch (itemsSortBy) {
      case 'name-asc':
        items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name-desc':
        items.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      case 'store-asc':
        items.sort((a, b) =>
          (a.receiptStore || '').localeCompare(b.receiptStore || '')
        );
        break;
      case 'store-desc':
        items.sort((a, b) =>
          (b.receiptStore || '').localeCompare(a.receiptStore || '')
        );
        break;
      case 'amount-asc':
        items.sort((a, b) => (a.totalPrice || 0) - (b.totalPrice || 0));
        break;
      case 'amount-desc':
        items.sort((a, b) => (b.totalPrice || 0) - (a.totalPrice || 0));
        break;
      default:
        break;
    }

    return items;
  }, [allItems, searchText, filters, itemsSortBy]);

  // Handle edit click
  const handleEditClick = (item) => {
    setEditingItem(item);
    setEditedName(item.name);
    setEditDialogOpen(true);
  };

  // Handle save edited name
  const handleSaveEdit = async () => {
    if (!editingItem || !editedName.trim()) {
      return;
    }

    try {
      const receiptRef = doc(db, 'receipts', editingItem.receiptId);
      const receipt = receipts.find((r) => r.id === editingItem.receiptId);

      if (!receipt) {
        throw new Error('Receipt not found');
      }

      const itemIndex = receipt.items.findIndex((_, idx) => {
        return `${editingItem.receiptId}-${idx}` === editingItem.itemId;
      });

      if (itemIndex === -1) {
        throw new Error('Item not found in receipt');
      }

      const updatedItems = [...receipt.items];
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        name: editedName.trim(),
      };

      await updateDoc(receiptRef, {
        items: updatedItems,
      });

      setSnackbar({
        open: true,
        message: 'Item name updated successfully',
        severity: 'success',
      });

      setEditDialogOpen(false);
      setEditingItem(null);
      setEditedName('');
    } catch (error) {
      console.error('Error updating item name:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update item name',
        severity: 'error',
      });
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditDialogOpen(false);
    setEditingItem(null);
    setEditedName('');
  };

  // Handle column sort
  const handleSort = (column) => {
    if (itemsSortBy === `${column}-asc`) {
      setItemsSortBy(`${column}-desc`);
    } else {
      setItemsSortBy(`${column}-asc`);
    }
  };

  // Get sort icon for column
  const getSortIcon = (column) => {
    if (itemsSortBy === `${column}-asc`) {
      return <ArrowUpward sx={{ fontSize: 16 }} />;
    }
    if (itemsSortBy === `${column}-desc`) {
      return <ArrowDownward sx={{ fontSize: 16 }} />;
    }
    return null;
  };

  return (
    <Box sx={{ background: 'linear-gradient(180deg, #F0FDFA 0%, #FFFFFF 100%)', minHeight: '100vh', pb: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ pt: 4, pb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
            <Typography
              variant="h3"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 700,
                color: teal.main,
                fontSize: { xs: '28px', md: '34px' },
              }}
            >
              {activeTab === 0 ? '🧾 Receipts' : '🛍️ All Items'}
            </Typography>
            {activeTab === 0 && (
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button
                  variant="outlined"
                  startIcon={uploading ? <CircularProgress size={16} /> : <CameraAlt />}
                  onClick={triggerCameraInput}
                  disabled={uploading}
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    textTransform: 'none',
                    color: teal.main,
                    borderColor: teal.main,
                    px: 2,
                    '&:hover': {
                      borderColor: teal.dark,
                      bgcolor: teal.bg,
                    },
                  }}
                >
                  Photo
                </Button>
                <Button
                  variant="outlined"
                  startIcon={uploading ? <CircularProgress size={16} /> : <UploadIcon />}
                  onClick={triggerFileInput}
                  disabled={uploading}
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    textTransform: 'none',
                    color: teal.main,
                    borderColor: teal.main,
                    px: 2,
                    '&:hover': {
                      borderColor: teal.dark,
                      bgcolor: teal.bg,
                    },
                  }}
                >
                  Upload
                </Button>
              </Box>
            )}
          </Box>
          <Typography
            variant="body1"
            sx={{ fontFamily: 'Outfit, sans-serif', color: brown.main, fontWeight: 400 }}
          >
            {activeTab === 0
              ? receipts.length > 0
                ? `${filteredAndSortedReceipts.length} of ${receipts.length} receipt${receipts.length === 1 ? '' : 's'}`
                : 'Upload your first receipt to get started!'
              : `${filteredItems.length} total item${filteredItems.length !== 1 ? 's' : ''}`}
          </Typography>
          {uploading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
              <CircularProgress size={20} sx={{ color: teal.main }} />
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  color: teal.dark,
                  fontSize: '13px',
                }}
              >
                Analyzing receipt...
              </Typography>
            </Box>
          )}
        </Box>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />

        {/* Tabs */}
        {!loading && receipts.length > 0 && (
          <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
            <Button
              onClick={(e) => handleTabChange(e, 0)}
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                fontSize: '13px',
                px: 2,
                py: 0.75,
                borderRadius: '8px',
                textTransform: 'none',
                color: activeTab === 0 ? 'white' : teal.main,
                bgcolor: activeTab === 0 ? teal.main : 'white',
                border: '1px solid',
                borderColor: activeTab === 0 ? teal.main : '#E5E7EB',
                minWidth: 'auto',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: activeTab === 0 ? teal.dark : '#F9FAFB',
                  borderColor: activeTab === 0 ? teal.dark : '#D1D5DB',
                },
              }}
            >
              📋 Receipts
            </Button>
            <Button
              onClick={(e) => handleTabChange(e, 1)}
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                fontSize: '13px',
                px: 2,
                py: 0.75,
                borderRadius: '8px',
                textTransform: 'none',
                color: activeTab === 1 ? 'white' : teal.main,
                bgcolor: activeTab === 1 ? teal.main : 'white',
                border: '1px solid',
                borderColor: activeTab === 1 ? teal.main : '#E5E7EB',
                minWidth: 'auto',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: activeTab === 1 ? teal.dark : '#F9FAFB',
                  borderColor: activeTab === 1 ? teal.dark : '#D1D5DB',
                },
              }}
            >
              🛍️ Items
            </Button>
          </Box>
        )}

      {/* Search and Filters */}
      {!loading && receipts.length > 0 && (
        <SearchBar
          onSearchChange={setSearchText}
          onFilterChange={setFilters}
          onSortChange={activeTab === 0 ? setSortBy : setItemsSortBy}
          hideSortDropdown={activeTab === 1}
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
            elevation={0}
            sx={{
              p: 8,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              bgcolor: 'white',
              borderRadius: '24px',
              border: '4px solid #DBEAFE',
              boxShadow: '6px 6px 0px #DBEAFE',
            }}
          >
            <Box sx={{ fontSize: '80px', mb: 1 }}>🧾</Box>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 800,
                color: teal.main,
              }}
            >
              No Receipts Yet!
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                color: brown.main,
                maxWidth: 400,
              }}
            >
              Upload your first receipt to start tracking your grocery spending
            </Typography>
          </Paper>
        )}

      {/* Receipts Tab Content */}
      {!loading && receipts.length > 0 && activeTab === 0 && (
        <>
          {/* Empty State - No results from filters */}
          {filteredAndSortedReceipts.length === 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 8,
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                bgcolor: 'white',
                borderRadius: '24px',
                border: '4px solid #FED7E2',
                boxShadow: '6px 6px 0px #FED7E2',
              }}
            >
              <Box sx={{ fontSize: '80px', mb: 1 }}>🔍</Box>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 800,
                  color: teal.main,
                }}
              >
                No Receipts Found
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  color: brown.main,
                }}
              >
                Try adjusting your search or filters
              </Typography>
            </Paper>
          )}

          {/* Receipts Grid */}
          {filteredAndSortedReceipts.length > 0 && (
            <Grid container spacing={3}>
              {filteredAndSortedReceipts.map((receipt) => (
                <Grid item xs={12} sm={6} md={4} key={receipt.id}>
                  <ReceiptCard
                    receipt={receipt}
                    onClick={() => handleReceiptClick(receipt)}
                    onRetry={handleRetryAnalysis}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Items Tab Content */}
      {!loading && receipts.length > 0 && activeTab === 1 && (
        <>
          {/* Empty State - No items */}
          {filteredItems.length === 0 && (searchText || filters.category !== 'all' || filters.dateRange !== 'all') && (
            <Paper
              elevation={0}
              sx={{
                p: 6,
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                bgcolor: 'white',
                borderRadius: '24px',
                border: '4px solid #99F6E4',
                boxShadow: '6px 6px 0px #99F6E4',
              }}
            >
              <Box sx={{ fontSize: '64px', mb: 1 }}>🔍</Box>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 800,
                  color: teal.main,
                }}
              >
                No Items Found
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  color: brown.main,
                }}
              >
                Try adjusting your search or filters
              </Typography>
            </Paper>
          )}

          {/* Items List - Grouped by Category */}
          {filteredItems.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                borderRadius: '16px',
                border: '3px solid #F59E0B',
                boxShadow: '3px 3px 0px #FCD34D',
                p: 2.5,
              }}
            >
              {(() => {
                // Group items by category and sort
                const categoryOrder = [
                  'produce',
                  'meat',
                  'dairy',
                  'bakery',
                  'frozen',
                  'pantry',
                  'beverages',
                  'snacks',
                  'household',
                  'personal care',
                  'health',
                  'other',
                ];

                // Sort items by category first
                const sortedByCategory = [...filteredItems].sort((a, b) => {
                  const categoryA = a.category?.toLowerCase() || 'other';
                  const categoryB = b.category?.toLowerCase() || 'other';
                  const indexA = categoryOrder.indexOf(categoryA);
                  const indexB = categoryOrder.indexOf(categoryB);
                  const orderA = indexA === -1 ? categoryOrder.length : indexA;
                  const orderB = indexB === -1 ? categoryOrder.length : indexB;
                  return orderA - orderB;
                });

                // Group by category
                const groupedItems = {};
                sortedByCategory.forEach((item) => {
                  const category = item.category || 'other';
                  if (!groupedItems[category]) {
                    groupedItems[category] = [];
                  }
                  groupedItems[category].push(item);
                });

                return Object.entries(groupedItems).map(([category, categoryItems], categoryIndex) => {
                  const categoryInfo = getCategoryInfo(category);
                  return (
                    <Box key={category}>
                      {/* Category Header */}
                      {categoryIndex > 0 && (
                        <Divider
                          sx={{
                            my: 2,
                            borderStyle: 'dashed',
                            borderColor: '#E5E7EB',
                          }}
                        />
                      )}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 1.5,
                          bgcolor: categoryInfo.bg,
                          px: 1.5,
                          py: 0.75,
                          borderRadius: '8px',
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontFamily: 'Outfit, sans-serif',
                            fontWeight: 700,
                            fontSize: '13px',
                            color: categoryInfo.color,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}
                        >
                          {categoryInfo.emoji} {category}
                        </Typography>
                        <Chip
                          label={`${categoryItems.length} item${categoryItems.length !== 1 ? 's' : ''}`}
                          size="small"
                          sx={{
                            height: '20px',
                            fontSize: '11px',
                            fontFamily: 'Outfit, sans-serif',
                            bgcolor: categoryInfo.color,
                            color: '#fff',
                            fontWeight: 600,
                          }}
                        />
                      </Box>

                      {/* Category Items */}
                      {categoryItems.map((item) => (
                        <Box
                          key={item.itemId}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            py: 1,
                            px: 1,
                            borderRadius: '8px',
                            '&:hover': {
                              bgcolor: '#F9FAFB',
                            },
                          }}
                        >
                          {/* Left: Item name and store */}
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: 'Outfit, sans-serif',
                                  fontWeight: 600,
                                  fontSize: '13px',
                                  color: '#1F2937',
                                }}
                              >
                                {item.quantity > 1 && (
                                  <Box
                                    component="span"
                                    sx={{
                                      color: '#6B7280',
                                      fontSize: '12px',
                                      mr: 0.5,
                                    }}
                                  >
                                    {item.quantity}x
                                  </Box>
                                )}
                                {item.name}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => handleEditClick(item)}
                                sx={{
                                  padding: 0.25,
                                  color: 'text.secondary',
                                  '&:hover': { color: teal.main, bgcolor: teal.bg },
                                }}
                              >
                                <EditIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  fontFamily: 'Outfit, sans-serif',
                                  fontSize: '11px',
                                  color: teal.main,
                                  fontWeight: 600,
                                }}
                              >
                                {item.receiptStore}
                              </Typography>
                              {item.receiptDate && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontFamily: 'Outfit, sans-serif',
                                    fontSize: '11px',
                                    color: '#9CA3AF',
                                  }}
                                >
                                  {format(item.receiptDate.toDate(), 'MMM d, yyyy')}
                                </Typography>
                              )}
                            </Box>
                          </Box>

                          {/* Right: Price */}
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'Outfit, sans-serif',
                              fontWeight: 700,
                              fontSize: '13px',
                              color: '#1F2937',
                              minWidth: '70px',
                              textAlign: 'right',
                            }}
                          >
                            ${(item.totalPrice || 0).toFixed(2)}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  );
                });
              })()}
            </Paper>
          )}
        </>
      )}

      {/* Receipt Detail Dialog */}
      <ReceiptDetail receipt={selectedReceipt} open={detailOpen} onClose={handleDetailClose} />

      {/* Edit Item Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCancelEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Item Name</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              autoFocus
              fullWidth
              label="Item Name"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSaveEdit();
                }
              }}
              helperText="Update the product name (e.g., 'Tillamook Ice Cream' instead of 'Tillamook Cheese')"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" disabled={!editedName.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

        {/* Snackbar for feedback */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

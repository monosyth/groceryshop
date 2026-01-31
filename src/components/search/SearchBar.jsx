import { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
} from '@mui/material';
import { Search, FilterList, Sort, Clear } from '@mui/icons-material';

/**
 * Search and filter bar for receipts
 */
export default function SearchBar({ onSearchChange, onFilterChange, onSortChange, hideSortDropdown = false }) {
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  // Date range options
  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
  ];

  // Category options
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'grocery', label: 'Grocery' },
    { value: 'produce', label: 'Produce' },
    { value: 'meat', label: 'Meat' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'bakery', label: 'Bakery' },
    { value: 'frozen', label: 'Frozen' },
    { value: 'beverages', label: 'Beverages' },
    { value: 'snacks', label: 'Snacks' },
    { value: 'household', label: 'Household' },
    { value: 'personal care', label: 'Personal Care' },
    { value: 'health', label: 'Health' },
    { value: 'other', label: 'Other' },
  ];

  // Sort options
  const sortOptions = [
    { value: 'date-desc', label: 'Newest First' },
    { value: 'date-asc', label: 'Oldest First' },
    { value: 'amount-desc', label: 'Highest Amount' },
    { value: 'amount-asc', label: 'Lowest Amount' },
    { value: 'store-asc', label: 'Store (A-Z)' },
  ];

  // Handle search text change
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchText(value);
    onSearchChange(value);
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchText('');
    onSearchChange('');
  };

  // Handle date range change
  const handleDateRangeChange = (value) => {
    setDateRange(value);
    onFilterChange({ dateRange: value, category });
  };

  // Handle category change
  const handleCategoryChange = (event) => {
    const value = event.target.value;
    setCategory(value);
    onFilterChange({ dateRange, category: value });
  };

  // Handle sort change
  const handleSortChange = (event) => {
    const value = event.target.value;
    setSortBy(value);
    onSortChange(value);
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* Search Input */}
      <TextField
        fullWidth
        placeholder="Search by store, item, keywords (candy, creamer, etc)..."
        value={searchText}
        onChange={handleSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ color: '#9CA3AF', fontSize: 20 }} />
            </InputAdornment>
          ),
          endAdornment: searchText && (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={handleClearSearch}
                edge="end"
                sx={{
                  color: '#9CA3AF',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <Clear sx={{ fontSize: 18 }} />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '14px',
            borderRadius: '8px',
            bgcolor: 'white',
            '& fieldset': {
              borderColor: '#E5E7EB',
              borderWidth: '1px',
            },
            '&:hover fieldset': {
              borderColor: '#D1D5DB',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#14B8A6',
              borderWidth: '1px',
            },
          },
        }}
      />

      {/* Filters Row */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="stretch">
        {/* Date Range Chips */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, flex: 1 }}>
          {dateRanges.map((range) => (
            <Chip
              key={range.value}
              label={range.label}
              onClick={() => handleDateRangeChange(range.value)}
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '8px',
                px: 0.5,
                height: '32px',
                bgcolor: dateRange === range.value ? '#14B8A6' : 'white',
                color: dateRange === range.value ? 'white' : '#374151',
                border: '1px solid',
                borderColor: dateRange === range.value ? '#14B8A6' : '#E5E7EB',
                transition: 'all 0.15s ease',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: dateRange === range.value ? '#0D9488' : '#F9FAFB',
                  borderColor: dateRange === range.value ? '#0D9488' : '#D1D5DB',
                },
              }}
            />
          ))}
        </Box>

        {/* Category Filter */}
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel
            id="category-filter-label"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '14px',
              '&.Mui-focused': {
                color: '#14B8A6',
              },
            }}
          >
            <FilterList sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
            Category
          </InputLabel>
          <Select
            labelId="category-filter-label"
            value={category}
            onChange={handleCategoryChange}
            label="Category"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '14px',
              borderRadius: '8px',
              bgcolor: 'white',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#E5E7EB',
                borderWidth: '1px',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#D1D5DB',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#14B8A6',
                borderWidth: '1px',
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  borderRadius: '8px',
                  mt: 0.5,
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                },
              },
            }}
          >
            {categories.map((cat) => (
              <MenuItem
                key={cat.value}
                value={cat.value}
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '14px',
                }}
              >
                {cat.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Sort Dropdown */}
        {!hideSortDropdown && (
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel
              id="sort-by-label"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '14px',
                '&.Mui-focused': {
                  color: '#14B8A6',
                },
              }}
            >
              <Sort sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
              Sort By
            </InputLabel>
            <Select
              labelId="sort-by-label"
              value={sortBy}
              onChange={handleSortChange}
              label="Sort By"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '14px',
                borderRadius: '8px',
                bgcolor: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#E5E7EB',
                  borderWidth: '1px',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#D1D5DB',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#14B8A6',
                  borderWidth: '1px',
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    borderRadius: '8px',
                    mt: 0.5,
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  },
                },
              }}
            >
              {sortOptions.map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '14px',
                  }}
                >
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Stack>
    </Box>
  );
}

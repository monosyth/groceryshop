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
export default function SearchBar({ onSearchChange, onFilterChange, onSortChange }) {
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
              <Search color="action" />
            </InputAdornment>
          ),
          endAdornment: searchText && (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={handleClearSearch}
                edge="end"
                sx={{
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <Clear />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            borderRadius: 3,
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
              color={dateRange === range.value ? 'primary' : 'default'}
              variant={dateRange === range.value ? 'filled' : 'outlined'}
              sx={{
                borderRadius: 2,
                fontWeight: dateRange === range.value ? 600 : 400,
              }}
            />
          ))}
        </Box>

        {/* Category Filter */}
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel id="category-filter-label">
            <FilterList sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle' }} />
            Category
          </InputLabel>
          <Select
            labelId="category-filter-label"
            value={category}
            onChange={handleCategoryChange}
            label="Category"
            sx={{ borderRadius: 2 }}
          >
            {categories.map((cat) => (
              <MenuItem key={cat.value} value={cat.value}>
                {cat.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Sort Dropdown */}
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel id="sort-by-label">
            <Sort sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle' }} />
            Sort By
          </InputLabel>
          <Select
            labelId="sort-by-label"
            value={sortBy}
            onChange={handleSortChange}
            label="Sort By"
            sx={{ borderRadius: 2 }}
          >
            {sortOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </Box>
  );
}

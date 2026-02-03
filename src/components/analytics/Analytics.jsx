import React, { useMemo } from 'react';
import { teal, blue, purple, pink, orange, amber, red, cyan, gray, darkGray, brown, ui, white, cream, getCategoryInfo } from '../../theme/colors';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  Paid,
  Receipt,
  ShoppingCart,
  Storefront,
  BarChart,
  TrendingUp,
  LocalOffer,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useReceipts } from '../../context/ReceiptContext';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  calculateSummaryStats,
  getSpendingByDate,
  getSpendingByCategory,
  getSpendingByStore,
} from '../../utils/analytics';
import { formatCurrency } from '../../utils/formatters';

// Softer, more sophisticated card colors
const cardColors = [
  { bg: orange.bg, border: orange.main, shadow: orange.light }, // Orange
  { bg: pink.bg, border: pink.main, shadow: pink.light }, // Pink
  { bg: teal.bg, border: teal.main, shadow: teal.light }, // Green
  { bg: amber.bg, border: amber.main, shadow: amber.light }, // Yellow
];

export default function AnalyticsPage() {
  const { currentUser } = useAuth();
  const { receipts, loading } = useReceipts();

  // Calculate analytics
  const stats = useMemo(() => calculateSummaryStats(receipts), [receipts]);
  const spendingByDate = useMemo(() => getSpendingByDate(receipts), [receipts]);
  const spendingByCategory = useMemo(() => getSpendingByCategory(receipts), [receipts]);
  const spendingByStore = useMemo(() => getSpendingByStore(receipts), [receipts]);

  // Stat cards configuration
  const statCards = [
    {
      title: 'Total Spending',
      value: formatCurrency(stats.totalSpending),
      icon: Paid,
      colorScheme: cardColors[0], // Blue
    },
    {
      title: 'Average Receipt',
      value: formatCurrency(stats.averageReceipt),
      icon: Receipt,
      colorScheme: cardColors[1], // Pink
    },
    {
      title: 'Total Receipts',
      value: stats.receiptCount,
      icon: ShoppingCart,
      colorScheme: cardColors[2], // Green
    },
    {
      title: 'Unique Stores',
      value: stats.storeCount,
      icon: Storefront,
      colorScheme: cardColors[3], // Yellow
    },
  ];

  if (loading) {
    return (
      <Box sx={{ background: `linear-gradient(180deg, ${teal.bg} 0%, ${white} 100%)`, minHeight: '100vh', pb: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress size={60} sx={{ color: teal.main }} />
          </Box>
        </Container>
      </Box>
    );
  }

  if (receipts.length === 0) {
    return (
      <Box sx={{ background: `linear-gradient(180deg, ${teal.bg} 0%, ${white} 100%)`, minHeight: '100vh', pb: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ pt: 4, pb: 3 }}>
            <Typography
              variant="h3"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 700,
                color: teal.main,
                fontSize: { xs: '28px', md: '34px' },
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <BarChart sx={{ fontSize: '36px', color: teal.main }} />
              Analytics
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 400,
                color: brown.main,
              }}
            >
              Track your grocery spending trends and insights
            </Typography>
          </Box>
          <Card
            sx={{
              bgcolor: amber.bg,
              borderRadius: '16px',
              border: `2px solid ${amber.main}`,
              boxShadow: `3px 3px 0px ${amber.light}`,
              p: 5,
              textAlign: 'center',
            }}
          >
            <Box sx={{ fontSize: '56px', mb: 2, display: 'flex', justifyContent: 'center' }}>
              <TrendingUp sx={{ fontSize: '56px', color: amber.main }} />
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                color: brown.main,
                mb: 1,
                fontSize: '20px',
              }}
            >
              No Data Yet
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 400,
                color: brown.dark,
              }}
            >
              Upload receipts to see your spending analytics!
            </Typography>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ background: `linear-gradient(180deg, ${teal.bg} 0%, ${white} 100%)`, minHeight: '100vh', pb: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ pt: 4, pb: 3 }}>
          <Typography
            variant="h3"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              color: teal.main,
              fontSize: { xs: '28px', md: '34px' },
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <BarChart sx={{ fontSize: '36px', color: teal.main }} />
            Analytics
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 400,
              color: brown.main,
            }}
          >
            Insights from {stats.receiptCount} receipt{stats.receiptCount === 1 ? '' : 's'}
          </Typography>
        </Box>

        {/* Summary Stats */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {statCards.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  bgcolor: stat.colorScheme.bg,
                  borderRadius: '12px',
                  border: `2px solid ${stat.colorScheme.border}`,
                  boxShadow: `3px 3px 0px ${stat.colorScheme.shadow}`,
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
                      <stat.icon sx={{ fontSize: '36px', color: stat.colorScheme.border }} />
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 700,
                        color: stat.colorScheme.border,
                        mb: 0.5,
                        fontSize: '22px',
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 500,
                        color: stat.colorScheme.border,
                        opacity: 0.75,
                        fontSize: '13px',
                      }}
                    >
                      {stat.title}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2.5}>
          {/* Spending Trend Chart */}
          {spendingByDate.length > 0 && (
            <Grid item xs={12}>
              <Card
                sx={{
                  bgcolor: orange.bg,
                  borderRadius: '12px',
                  border: `2px solid ${orange.main}`,
                  boxShadow: `3px 3px 0px ${amber.light}`,
                  p: 3,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <TrendingUp sx={{ fontSize: '24px', color: orange.dark }} />
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 600,
                      color: orange.dark,
                      fontSize: '18px',
                    }}
                  >
                    Spending Over Time
                  </Typography>
                </Box>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={spendingByDate}>
                    <CartesianGrid strokeDasharray="3 3" stroke={orange.light} />
                    <XAxis
                      dataKey="date"
                      stroke={orange.dark}
                      style={{ fontSize: '11px', fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}
                    />
                    <YAxis
                      stroke={orange.dark}
                      style={{ fontSize: '11px', fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        borderRadius: 8,
                        border: `2px solid ${orange.main}`,
                        fontSize: '12px',
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 500,
                      }}
                    />
                    <Legend
                      wrapperStyle={{
                        fontSize: '12px',
                        paddingTop: '12px',
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 500,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke={orange.main}
                      strokeWidth={3}
                      dot={{ fill: orange.main, r: 4, strokeWidth: 2, stroke: white }}
                      activeDot={{ r: 6 }}
                      name="Daily Spending"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
          )}

          {/* Category Breakdown */}
          {spendingByCategory.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  bgcolor: pink.bg,
                  borderRadius: '12px',
                  border: `2px solid ${pink.main}`,
                  boxShadow: `3px 3px 0px ${pink.light}`,
                  p: 3,
                  height: '100%',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <LocalOffer sx={{ fontSize: '24px', color: pink.dark }} />
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 600,
                      color: pink.dark,
                      fontSize: '18px',
                    }}
                  >
                    Spending by Category
                  </Typography>
                </Box>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={spendingByCategory} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={pink.light} />
                    <XAxis
                      type="number"
                      stroke={pink.dark}
                      style={{ fontSize: '10px', fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={90}
                      stroke={pink.dark}
                      style={{ fontSize: '10px', fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        borderRadius: 8,
                        border: `2px solid ${pink.main}`,
                        fontSize: '11px',
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 500,
                      }}
                    />
                    <Bar dataKey="value" fill={pink.main} radius={[0, 6, 6, 0]} name="Spending" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
          )}

          {/* Top Stores */}
          {spendingByStore.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  bgcolor: teal.bg,
                  borderRadius: '12px',
                  border: `2px solid ${teal.main}`,
                  boxShadow: `3px 3px 0px ${teal.light}`,
                  p: 3,
                  height: '100%',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Storefront sx={{ fontSize: '24px', color: teal.dark }} />
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 600,
                      color: teal.dark,
                      fontSize: '18px',
                    }}
                  >
                    Top Stores
                  </Typography>
                </Box>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={spendingByStore} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={teal.light} />
                    <XAxis
                      type="number"
                      stroke={teal.darker}
                      style={{ fontSize: '10px', fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      stroke={teal.darker}
                      style={{ fontSize: '10px', fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        borderRadius: 8,
                        border: `2px solid ${teal.main}`,
                        fontSize: '11px',
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 500,
                      }}
                    />
                    <Bar dataKey="value" fill={teal.main} radius={[0, 6, 6, 0]} name="Spending" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
}

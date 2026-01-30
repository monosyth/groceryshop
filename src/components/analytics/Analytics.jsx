import React, { useState, useEffect, useMemo } from 'react';
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
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
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

// Playful card colors
const cardColors = [
  { bg: '#DBEAFE', border: '#1E40AF', shadow: '#1E40AF' }, // Blue
  { bg: '#FED7E2', border: '#BE185D', shadow: '#BE185D' }, // Pink
  { bg: '#D1FAE5', border: '#047857', shadow: '#047857' }, // Green
  { bg: '#FEF3C7', border: '#B45309', shadow: '#B45309' }, // Yellow
];

export default function AnalyticsPage() {
  const { currentUser } = useAuth();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch receipts
  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, 'receipts'), where('userId', '==', currentUser.uid));

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
        setReceipts(receiptData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching receipts:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

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
      emoji: '💰',
      colorScheme: cardColors[0], // Blue
    },
    {
      title: 'Average Receipt',
      value: formatCurrency(stats.averageReceipt),
      emoji: '🧾',
      colorScheme: cardColors[1], // Pink
    },
    {
      title: 'Total Receipts',
      value: stats.receiptCount,
      emoji: '🛒',
      colorScheme: cardColors[2], // Green
    },
    {
      title: 'Unique Stores',
      value: stats.storeCount,
      emoji: '🏪',
      colorScheme: cardColors[3], // Yellow
    },
  ];

  if (loading) {
    return (
      <Box sx={{ background: 'linear-gradient(180deg, #FFFBEB 0%, #FFFFFF 100%)', minHeight: '100vh', pb: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress size={60} sx={{ color: '#15803D' }} />
          </Box>
        </Container>
      </Box>
    );
  }

  if (receipts.length === 0) {
    return (
      <Box sx={{ background: 'linear-gradient(180deg, #FFFBEB 0%, #FFFFFF 100%)', minHeight: '100vh', pb: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ pt: 4, pb: 3 }}>
            <Typography
              variant="h3"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 900,
                color: '#15803D',
                fontSize: { xs: '32px', md: '42px' },
              }}
            >
              📊 Analytics
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 500,
                color: '#78350F',
              }}
            >
              Track your grocery spending trends and insights
            </Typography>
          </Box>
          <Card
            sx={{
              bgcolor: '#FEF3C7',
              borderRadius: '24px',
              border: '4px solid #B45309',
              boxShadow: '6px 6px 0px #B45309',
              p: 6,
              textAlign: 'center',
            }}
          >
            <Box sx={{ fontSize: '80px', mb: 2 }}>📈</Box>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 800,
                color: '#78350F',
                mb: 1,
              }}
            >
              No Data Yet
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 500,
                color: '#92400E',
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
    <Box sx={{ background: 'linear-gradient(180deg, #FFFBEB 0%, #FFFFFF 100%)', minHeight: '100vh', pb: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ pt: 4, pb: 3 }}>
          <Typography
            variant="h3"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 900,
              color: '#15803D',
              fontSize: { xs: '32px', md: '42px' },
              mb: 1,
            }}
          >
            📊 Analytics
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 500,
              color: '#78350F',
            }}
          >
            Insights from {stats.receiptCount} receipt{stats.receiptCount === 1 ? '' : 's'}
          </Typography>
        </Box>

        {/* Summary Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  bgcolor: stat.colorScheme.bg,
                  borderRadius: '20px',
                  border: `4px solid ${stat.colorScheme.border}`,
                  boxShadow: `6px 6px 0px ${stat.colorScheme.shadow}`,
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  '&:hover': {
                    transform: 'scale(1.05) rotate(-2deg)',
                    boxShadow: `8px 8px 0px ${stat.colorScheme.shadow}`,
                  },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ fontSize: '48px', mb: 1 }}>{stat.emoji}</Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 900,
                        color: stat.colorScheme.border,
                        mb: 0.5,
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 600,
                        color: stat.colorScheme.border,
                        opacity: 0.8,
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

        <Grid container spacing={3}>
          {/* Spending Trend Chart */}
          {spendingByDate.length > 0 && (
            <Grid item xs={12}>
              <Card
                sx={{
                  bgcolor: '#DBEAFE',
                  borderRadius: '24px',
                  border: '4px solid #1E40AF',
                  boxShadow: '6px 6px 0px #1E40AF',
                  p: 3,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Box sx={{ fontSize: '28px' }}>📈</Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 800,
                      color: '#1E3A8A',
                    }}
                  >
                    Spending Over Time
                  </Typography>
                </Box>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={spendingByDate}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#93C5FD" />
                    <XAxis
                      dataKey="date"
                      stroke="#1E3A8A"
                      style={{ fontSize: '12px', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}
                    />
                    <YAxis
                      stroke="#1E3A8A"
                      style={{ fontSize: '12px', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        borderRadius: 12,
                        border: '3px solid #1E40AF',
                        fontSize: '13px',
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 600,
                      }}
                    />
                    <Legend
                      wrapperStyle={{
                        fontSize: '13px',
                        paddingTop: '15px',
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 700,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#1E40AF"
                      strokeWidth={4}
                      dot={{ fill: '#1E40AF', r: 6, strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 9 }}
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
                  bgcolor: '#FED7E2',
                  borderRadius: '24px',
                  border: '4px solid #BE185D',
                  boxShadow: '6px 6px 0px #BE185D',
                  p: 3,
                  height: '100%',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Box sx={{ fontSize: '28px' }}>🏷️</Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 800,
                      color: '#831843',
                    }}
                  >
                    Spending by Category
                  </Typography>
                </Box>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={spendingByCategory} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#FBCFE8" />
                    <XAxis
                      type="number"
                      stroke="#831843"
                      style={{ fontSize: '11px', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={90}
                      stroke="#831843"
                      style={{ fontSize: '11px', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        borderRadius: 12,
                        border: '3px solid #BE185D',
                        fontSize: '12px',
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 600,
                      }}
                    />
                    <Bar dataKey="value" fill="#BE185D" radius={[0, 8, 8, 0]} name="Spending" />
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
                  bgcolor: '#D1FAE5',
                  borderRadius: '24px',
                  border: '4px solid #047857',
                  boxShadow: '6px 6px 0px #047857',
                  p: 3,
                  height: '100%',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Box sx={{ fontSize: '28px' }}>🏪</Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 800,
                      color: '#065F46',
                    }}
                  >
                    Top Stores
                  </Typography>
                </Box>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={spendingByStore} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#A7F3D0" />
                    <XAxis
                      type="number"
                      stroke="#065F46"
                      style={{ fontSize: '11px', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      stroke="#065F46"
                      style={{ fontSize: '11px', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        borderRadius: 12,
                        border: '3px solid #047857',
                        fontSize: '12px',
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 600,
                      }}
                    />
                    <Bar dataKey="value" fill="#047857" radius={[0, 8, 8, 0]} name="Spending" />
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

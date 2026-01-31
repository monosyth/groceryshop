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

// Softer, more sophisticated card colors
const cardColors = [
  { bg: '#FFEDD5', border: '#F97316', shadow: '#FCD34D' }, // Orange
  { bg: '#FCE7F3', border: '#EC4899', shadow: '#F9A8D4' }, // Pink
  { bg: '#ECFDF5', border: '#10B981', shadow: '#6EE7B7' }, // Green
  { bg: '#FEF3C7', border: '#F59E0B', shadow: '#FCD34D' }, // Yellow
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
            <CircularProgress size={60} sx={{ color: '#10B981' }} />
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
                fontWeight: 700,
                color: '#10B981',
                fontSize: { xs: '28px', md: '34px' },
              }}
            >
              📊 Analytics
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 400,
                color: '#78350F',
              }}
            >
              Track your grocery spending trends and insights
            </Typography>
          </Box>
          <Card
            sx={{
              bgcolor: '#FEF3C7',
              borderRadius: '16px',
              border: '2px solid #F59E0B',
              boxShadow: '3px 3px 0px #FCD34D',
              p: 5,
              textAlign: 'center',
            }}
          >
            <Box sx={{ fontSize: '56px', mb: 2 }}>📈</Box>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                color: '#78350F',
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
              fontWeight: 700,
              color: '#10B981',
              fontSize: { xs: '28px', md: '34px' },
              mb: 1,
            }}
          >
            📊 Analytics
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 400,
              color: '#78350F',
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
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `4px 4px 0px ${stat.colorScheme.shadow}`,
                  },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ fontSize: '36px', mb: 1 }}>{stat.emoji}</Box>
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
                  bgcolor: '#FFEDD5',
                  borderRadius: '12px',
                  border: '2px solid #F97316',
                  boxShadow: '3px 3px 0px #FCD34D',
                  p: 3,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Box sx={{ fontSize: '20px' }}>📈</Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 600,
                      color: '#EA580C',
                      fontSize: '18px',
                    }}
                  >
                    Spending Over Time
                  </Typography>
                </Box>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={spendingByDate}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#FDBA74" />
                    <XAxis
                      dataKey="date"
                      stroke="#EA580C"
                      style={{ fontSize: '11px', fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}
                    />
                    <YAxis
                      stroke="#EA580C"
                      style={{ fontSize: '11px', fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        borderRadius: 8,
                        border: '2px solid #F97316',
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
                      stroke="#F97316"
                      strokeWidth={3}
                      dot={{ fill: '#F97316', r: 4, strokeWidth: 2, stroke: '#fff' }}
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
                  bgcolor: '#FCE7F3',
                  borderRadius: '12px',
                  border: '2px solid #EC4899',
                  boxShadow: '3px 3px 0px #F9A8D4',
                  p: 3,
                  height: '100%',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Box sx={{ fontSize: '20px' }}>🏷️</Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 600,
                      color: '#BE185D',
                      fontSize: '18px',
                    }}
                  >
                    Spending by Category
                  </Typography>
                </Box>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={spendingByCategory} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#FBCFE8" />
                    <XAxis
                      type="number"
                      stroke="#BE185D"
                      style={{ fontSize: '10px', fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={90}
                      stroke="#BE185D"
                      style={{ fontSize: '10px', fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        borderRadius: 8,
                        border: '2px solid #EC4899',
                        fontSize: '11px',
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 500,
                      }}
                    />
                    <Bar dataKey="value" fill="#EC4899" radius={[0, 6, 6, 0]} name="Spending" />
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
                  bgcolor: '#ECFDF5',
                  borderRadius: '12px',
                  border: '2px solid #10B981',
                  boxShadow: '3px 3px 0px #6EE7B7',
                  p: 3,
                  height: '100%',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Box sx={{ fontSize: '20px' }}>🏪</Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 600,
                      color: '#059669',
                      fontSize: '18px',
                    }}
                  >
                    Top Stores
                  </Typography>
                </Box>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={spendingByStore} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#A7F3D0" />
                    <XAxis
                      type="number"
                      stroke="#059669"
                      style={{ fontSize: '10px', fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      stroke="#059669"
                      style={{ fontSize: '10px', fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        borderRadius: 8,
                        border: '2px solid #10B981',
                        fontSize: '11px',
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 500,
                      }}
                    />
                    <Bar dataKey="value" fill="#10B981" radius={[0, 6, 6, 0]} name="Spending" />
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

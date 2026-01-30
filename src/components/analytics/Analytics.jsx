import { useState, useEffect, useMemo } from 'react';
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
  TrendingUp,
  Receipt,
  Store,
  AttachMoney,
  ShoppingCart,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
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

// Chart colors
const COLORS = ['#2e7d32', '#ff6f00', '#ab47bc', '#1976d2', '#d32f2f', '#f57c00', '#388e3c', '#7b1fa2'];

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
      icon: <AttachMoney sx={{ fontSize: 40 }} />,
      color: 'primary.main',
      bgColor: 'primary.lighter',
    },
    {
      title: 'Average Receipt',
      value: formatCurrency(stats.averageReceipt),
      icon: <Receipt sx={{ fontSize: 40 }} />,
      color: 'secondary.main',
      bgColor: 'secondary.lighter',
    },
    {
      title: 'Total Receipts',
      value: stats.receiptCount,
      icon: <ShoppingCart sx={{ fontSize: 40 }} />,
      color: 'success.main',
      bgColor: 'success.lighter',
    },
    {
      title: 'Unique Stores',
      value: stats.storeCount,
      icon: <Store sx={{ fontSize: 40 }} />,
      color: 'info.main',
      bgColor: 'info.lighter',
    },
  ];

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (receipts.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" gutterBottom fontWeight="bold" color="primary.main">
            Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your grocery spending trends and insights
          </Typography>
        </Box>
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
          <TrendingUp sx={{ fontSize: 80, color: 'primary.light' }} />
          <Typography variant="h5" fontWeight="600">
            No Data Yet
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Upload receipts to see your spending analytics!
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom fontWeight="bold" color="primary.main">
          Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Insights from {stats.receiptCount} receipt{stats.receiptCount === 1 ? '' : 's'}
        </Typography>
      </Box>

      {/* Summary Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              elevation={2}
              sx={{
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: stat.bgColor,
                      color: stat.color,
                      display: 'flex',
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
                <Typography variant="h4" fontWeight="bold" color={stat.color}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Spending Trend Chart */}
      {spendingByDate.length > 0 && (
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>
            Spending Over Time
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={spendingByDate}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" stroke="#666" style={{ fontSize: '12px' }} />
              <YAxis stroke="#666" style={{ fontSize: '12px' }} />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={{ borderRadius: 8, border: '1px solid #e0e0e0' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#2e7d32"
                strokeWidth={3}
                dot={{ fill: '#2e7d32', r: 4 }}
                activeDot={{ r: 6 }}
                name="Spending"
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      )}

      <Grid container spacing={3}>
        {/* Category Breakdown */}
        {spendingByCategory.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>
                Spending by Category
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={spendingByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {spendingByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* Top Stores */}
        {spendingByStore.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>
                Top Stores
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={spendingByStore} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis type="number" stroke="#666" style={{ fontSize: '12px' }} />
                  <YAxis dataKey="name" type="category" width={120} stroke="#666" style={{ fontSize: '12px' }} />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ borderRadius: 8, border: '1px solid #e0e0e0' }}
                  />
                  <Bar dataKey="value" fill="#ff6f00" radius={[0, 8, 8, 0]} name="Spending" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}

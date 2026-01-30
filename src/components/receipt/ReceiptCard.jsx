import { Card, CardContent, CardMedia, Chip, Typography, Box, Skeleton } from '@mui/material';
import { Store, CalendarToday, AttachMoney, CheckCircle, Error, HourglassEmpty } from '@mui/icons-material';
import { formatCurrency, formatDate } from '../../utils/formatters';

/**
 * Receipt card component displaying receipt summary
 */
export default function ReceiptCard({ receipt, onClick }) {
  const { storeInfo, summary, metadata, imageUrl } = receipt;

  // Status badge configuration
  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed':
        return { label: 'Analyzed', color: 'success', icon: <CheckCircle sx={{ fontSize: 16 }} /> };
      case 'processing':
        return { label: 'Processing', color: 'warning', icon: <HourglassEmpty sx={{ fontSize: 16 }} /> };
      case 'failed':
        return { label: 'Failed', color: 'error', icon: <Error sx={{ fontSize: 16 }} /> };
      default:
        return { label: 'Pending', color: 'default', icon: <HourglassEmpty sx={{ fontSize: 16 }} /> };
    }
  };

  const statusConfig = getStatusConfig(metadata?.analysisStatus);

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
      }}
    >
      {/* Receipt Image */}
      <CardMedia
        component="img"
        height="160"
        image={imageUrl}
        alt={storeInfo?.name || 'Receipt'}
        sx={{
          objectFit: 'cover',
          backgroundColor: 'grey.100',
        }}
      />

      <CardContent>
        {/* Status Badge */}
        <Box sx={{ mb: 2 }}>
          <Chip
            label={statusConfig.label}
            color={statusConfig.color}
            size="small"
            icon={statusConfig.icon}
            sx={{
              fontWeight: 600,
              borderRadius: 2,
            }}
          />
        </Box>

        {/* Store Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Store color="primary" sx={{ fontSize: 20 }} />
          <Typography variant="h6" component="h3" noWrap sx={{ fontWeight: 600 }}>
            {storeInfo?.name || 'Unknown Store'}
          </Typography>
        </Box>

        {/* Date */}
        {storeInfo?.date && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <CalendarToday sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {formatDate(storeInfo.date)}
            </Typography>
          </Box>
        )}

        {/* Location */}
        {storeInfo?.location && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
            {storeInfo.location}
          </Typography>
        )}

        {/* Total Amount */}
        {summary?.total !== undefined && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mt: 2,
              pt: 2,
              borderTop: 1,
              borderColor: 'divider',
            }}
          >
            <AttachMoney color="secondary" sx={{ fontSize: 24 }} />
            <Typography variant="h5" color="secondary.main" sx={{ fontWeight: 700 }}>
              {formatCurrency(summary.total)}
            </Typography>
          </Box>
        )}

        {/* Error Message */}
        {metadata?.analysisStatus === 'failed' && metadata?.processingError && (
          <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
            {metadata.processingError}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton for receipt card
 */
export function ReceiptCardSkeleton() {
  return (
    <Card>
      <Skeleton variant="rectangular" height={160} />
      <CardContent>
        <Skeleton variant="rounded" width={100} height={24} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="80%" height={32} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="70%" height={20} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="40%" height={36} />
      </CardContent>
    </Card>
  );
}

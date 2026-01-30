import { Card, CardContent, CardMedia, Chip, Typography, Box, Skeleton, Button } from '@mui/material';
import { Store, CalendarToday, AttachMoney, CheckCircle, Error, HourglassEmpty, Refresh } from '@mui/icons-material';
import { formatCurrency, formatDate } from '../../utils/formatters';

// Softer, more sophisticated card colors that rotate
const cardColors = [
  { bg: '#F0FDFA', border: '#14B8A6', shadow: '#5EEAD4' }, // Teal
  { bg: '#FCE7F3', border: '#EC4899', shadow: '#F9A8D4' }, // Pink
  { bg: '#ECFDF5', border: '#10B981', shadow: '#6EE7B7' }, // Green
  { bg: '#FEF3C7', border: '#F59E0B', shadow: '#FCD34D' }, // Yellow
];

/**
 * Receipt card component displaying receipt summary
 */
export default function ReceiptCard({ receipt, onClick, onRetry }) {
  const { storeInfo, summary, metadata, imageUrl } = receipt;

  // Assign a color based on receipt ID (consistent color per receipt)
  const colorIndex = receipt.id ? receipt.id.charCodeAt(0) % cardColors.length : 0;
  const cardColor = cardColors[colorIndex];

  // Status badge configuration
  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed':
        return { label: '✓ Analyzed', color: 'success', icon: <CheckCircle sx={{ fontSize: 16 }} /> };
      case 'processing':
        return { label: '⏳ Processing', color: 'warning', icon: <HourglassEmpty sx={{ fontSize: 16 }} /> };
      case 'failed_retryable':
        return { label: '⚠️ Try Again', color: 'warning', icon: <Error sx={{ fontSize: 16 }} /> };
      case 'failed':
        return { label: '✗ Failed', color: 'error', icon: <Error sx={{ fontSize: 16 }} /> };
      default:
        return { label: '⏳ Pending', color: 'default', icon: <HourglassEmpty sx={{ fontSize: 16 }} /> };
    }
  };

  const statusConfig = getStatusConfig(metadata?.analysisStatus);
  const isRetryable = metadata?.analysisStatus === 'failed_retryable' || metadata?.retryable;

  const handleRetryClick = (e) => {
    e.stopPropagation(); // Prevent card click
    if (onRetry) {
      onRetry(receipt.id);
    }
  };

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: cardColor.bg,
        borderRadius: '12px',
        border: `2px solid ${cardColor.border}`,
        boxShadow: `3px 3px 0px ${cardColor.shadow}`,
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `4px 4px 0px ${cardColor.shadow}`,
        },
      }}
    >
      {/* Receipt Image */}
      <CardMedia
        component="img"
        height="200"
        image={imageUrl}
        alt={storeInfo?.name || 'Receipt'}
        sx={{
          objectFit: 'cover',
          backgroundColor: 'grey.100',
        }}
      />

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Status Badge */}
        <Box sx={{ mb: 2 }}>
          <Chip
            label={statusConfig.label}
            color={statusConfig.color}
            size="small"
            sx={{
              fontWeight: 600,
              fontFamily: 'Outfit, sans-serif',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
        </Box>

        {/* Store Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
          <Box sx={{ fontSize: '18px' }}>🏪</Box>
          <Typography
            variant="h6"
            component="h3"
            noWrap
            sx={{
              fontWeight: 600,
              fontFamily: 'Outfit, sans-serif',
              color: cardColor.border,
              fontSize: '18px',
            }}
          >
            {storeInfo?.name || 'Unknown Store'}
          </Typography>
        </Box>

        {/* Date */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
          <Box sx={{ fontSize: '14px' }}>📅</Box>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              color: 'text.secondary',
              fontWeight: 500,
              fontSize: '13px',
            }}
          >
            {storeInfo?.date ? formatDate(storeInfo.date) : 'No date'}
          </Typography>
        </Box>

        {/* Location */}
        <Typography
          variant="body2"
          sx={{
            mb: 2,
            fontFamily: 'Outfit, sans-serif',
            color: 'text.secondary',
            minHeight: '18px',
            fontWeight: 400,
            fontSize: '13px',
          }}
        >
          {storeInfo?.location || '\u00A0'}
        </Typography>

        {/* Spacer to push total to bottom */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Total Amount */}
        {summary?.total !== undefined && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              pt: 2,
              borderTop: `2px solid ${cardColor.border}`,
            }}
          >
            <Box sx={{ fontSize: '20px' }}>💰</Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                fontFamily: 'Outfit, sans-serif',
                color: cardColor.border,
                fontSize: '22px',
              }}
            >
              {formatCurrency(summary.total)}
            </Typography>
          </Box>
        )}

        {/* Error Message & Retry Button */}
        {(metadata?.analysisStatus === 'failed' || metadata?.analysisStatus === 'failed_retryable') && metadata?.processingError && (
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="body2"
              color="error"
              sx={{ mb: 1, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}
            >
              {metadata.processingError}
            </Typography>
            {isRetryable && onRetry && (
              <Button
                size="small"
                variant="contained"
                startIcon={<Refresh />}
                onClick={handleRetryClick}
                sx={{
                  mt: 1,
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: '12px',
                  bgcolor: cardColor.border,
                  border: `2px solid ${cardColor.shadow}`,
                  '&:hover': {
                    bgcolor: cardColor.shadow,
                  },
                }}
              >
                Retry Analysis
              </Button>
            )}
          </Box>
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
    <Card
      sx={{
        borderRadius: '24px',
        border: '4px solid #E5E7EB',
      }}
    >
      <Skeleton variant="rectangular" height={200} />
      <CardContent>
        <Skeleton variant="rounded" width={100} height={24} sx={{ mb: 2, borderRadius: '12px' }} />
        <Skeleton variant="text" width="80%" height={32} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="70%" height={20} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="40%" height={36} />
      </CardContent>
    </Card>
  );
}

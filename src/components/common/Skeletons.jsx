import { Box, Card, CardContent, Skeleton, Grid } from '@mui/material';

// Receipt Card Skeleton
export function ReceiptCardSkeleton() {
  return (
    <Card
      sx={{
        bgcolor: 'white',
        borderRadius: '12px',
        border: '2px solid #E5E7EB',
        boxShadow: '3px 3px 0px #E5E7EB',
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1.5 }}>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="40%" height={24} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="60%" height={20} />
          </Box>
          <Skeleton variant="circular" width={24} height={24} />
        </Box>
        <Box sx={{ display: 'flex', gap: 0.75, mb: 1.5 }}>
          <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: '12px' }} />
          <Skeleton variant="rounded" width={100} height={24} sx={{ borderRadius: '12px' }} />
        </Box>
        <Skeleton variant="text" width="30%" height={20} />
      </CardContent>
    </Card>
  );
}

// List Item Skeleton
export function ListItemSkeleton() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        py: 1.5,
        borderBottom: '1px solid #F3F4F6',
      }}
    >
      <Skeleton variant="circular" width={40} height={40} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="70%" height={20} />
        <Skeleton variant="text" width="40%" height={16} />
      </Box>
      <Skeleton variant="circular" width={32} height={32} />
    </Box>
  );
}

// Shopping List Item Skeleton
export function ShoppingListItemSkeleton() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        py: 0.75,
        borderBottom: '1px solid #F3F4F6',
      }}
    >
      <Skeleton variant="circular" width={42} height={42} sx={{ mr: 1.5 }} />
      <Skeleton variant="text" width="60%" height={20} />
    </Box>
  );
}

// Recipe Card Skeleton
export function RecipeCardSkeleton() {
  return (
    <Card
      sx={{
        bgcolor: 'white',
        borderRadius: '12px',
        border: '2px solid #E5E7EB',
        boxShadow: '3px 3px 0px #E5E7EB',
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
          <Skeleton variant="text" width="70%" height={28} />
          <Skeleton variant="circular" width={32} height={32} />
        </Box>
        <Skeleton variant="text" width="90%" height={18} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="80%" height={18} sx={{ mb: 1.5 }} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Skeleton variant="rounded" width={60} height={24} sx={{ borderRadius: '12px' }} />
          <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: '12px' }} />
        </Box>
      </CardContent>
    </Card>
  );
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 4 }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 2,
        py: 2,
        borderBottom: '1px solid #E5E7EB',
      }}
    >
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={index} variant="text" width="80%" height={20} />
      ))}
    </Box>
  );
}

// Grid of skeletons
export function SkeletonGrid({ count = 6, component: Component = ReceiptCardSkeleton }) {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Component />
        </Grid>
      ))}
    </Grid>
  );
}

// List of skeletons
export function SkeletonList({ count = 5, component: Component = ListItemSkeleton }) {
  return (
    <Box>
      {Array.from({ length: count }).map((_, index) => (
        <Component key={index} />
      ))}
    </Box>
  );
}

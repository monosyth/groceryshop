import { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  ShoppingCart,
  Dashboard,
  BarChart,
  AccountCircle,
  Logout,
  Menu as MenuIcon,
  Restaurant,
  List as ListIcon,
  MenuBook,
  Kitchen,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

export default function Navigation() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
    handleClose();
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <Dashboard />, emoji: '🏠' },
    { label: 'Pantry', path: '/pantry', icon: <Kitchen />, emoji: '🥫' },
    { label: 'Recipes', path: '/recipes', icon: <Restaurant />, emoji: '👨‍🍳' },
    { label: 'My Recipes', path: '/my-recipes', icon: <MenuBook />, emoji: '📖' },
    { label: 'Shopping List', path: '/shopping-list', icon: <ListIcon />, emoji: '🛒' },
    { label: 'Analytics', path: '/analytics', icon: <BarChart />, emoji: '📊' },
  ];

  // Mobile drawer
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ width: 250, height: '100%' }}>
      <Box
        sx={{
          p: 2,
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <ShoppingCart sx={{ fontSize: '28px', color: 'white' }} />
        <Typography variant="h6" fontWeight="900" sx={{ fontFamily: 'Outfit, sans-serif' }}>
          GrozeryShop
        </Typography>
      </Box>
      <List sx={{ py: 1 }}>
        {navItems.map((item) => (
          <ListItem
            button
            key={item.path}
            component={RouterLink}
            to={item.path}
            selected={location.pathname === item.path}
            sx={{
              py: 1.25,
              px: 2,
              mx: 1,
              mb: 0.5,
              borderRadius: '8px',
              '&.Mui-selected': {
                bgcolor: 'rgba(16, 185, 129, 0.12)',
                borderLeft: '3px solid #10B981',
              },
              '&:hover': {
                bgcolor: 'rgba(16, 185, 129, 0.08)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: '36px' }}>
              <Box sx={{ fontSize: '20px' }}>{item.emoji}</Box>
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                fontSize: '14px',
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
          borderBottom: '2px solid #F59E0B',
          borderRadius: 0,
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important' }}>
          {/* Mobile Menu Icon */}
          {isMobile && (
            <IconButton
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                mr: 2,
                color: '#15803D',
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo */}
          <Box
            component={RouterLink}
            to="/dashboard"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flexGrow: isMobile ? 1 : 0,
              mr: 4,
              textDecoration: 'none',
            }}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'rotate(-3deg)',
                boxShadow: '0 2px 10px rgba(16, 185, 129, 0.25)',
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'rotate(-3deg) scale(1.05)',
                },
              }}
            >
              <ShoppingCart sx={{ fontSize: '22px', color: 'white' }} />
            </Box>
            <Typography
              sx={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#15803D',
                fontFamily: 'Outfit, sans-serif',
                letterSpacing: '-0.02em',
              }}
            >
              GrozeryShop
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    component={RouterLink}
                    to={item.path}
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 600,
                      fontSize: '13px',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '8px',
                      textTransform: 'none',
                      color: isActive ? 'white' : '#15803D',
                      bgcolor: isActive ? '#15803D' : 'transparent',
                      border: '1px solid transparent',
                      minWidth: 'auto',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        bgcolor: isActive ? '#166534' : 'rgba(21, 128, 61, 0.08)',
                        border: isActive ? '1px solid #166534' : '1px solid rgba(21, 128, 61, 0.2)',
                      },
                    }}
                  >
                    <Box component="span" sx={{ fontSize: '15px', mr: 0.5 }}>
                      {item.emoji}
                    </Box>
                    {item.label}
                  </Button>
                );
              })}
            </Box>
          )}

          {/* User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!isMobile && currentUser?.displayName && (
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600,
                  color: '#92400E',
                }}
              >
                {currentUser.displayName}
              </Typography>
            )}
            <IconButton
              onClick={handleMenu}
              size="large"
              sx={{
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.1) rotate(5deg)',
                },
              }}
            >
              {currentUser?.photoURL ? (
                <Avatar
                  src={currentUser.photoURL}
                  sx={{
                    width: 36,
                    height: 36,
                    border: '2px solid #15803D',
                  }}
                />
              ) : (
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: '#EC4899',
                    border: '2px solid #BE185D',
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  {currentUser?.displayName?.charAt(0) || 'U'}
                </Avatar>
              )}
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                mt: 1,
                borderRadius: '10px',
                border: '2px solid #15803D',
                boxShadow: '2px 2px 0px rgba(21, 128, 61, 0.3)',
              },
            }}
          >
            <MenuItem
              disabled
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
              }}
            >
              <AccountCircle sx={{ mr: 1 }} />
              {currentUser?.email}
            </MenuItem>
            <MenuItem
              onClick={handleLogout}
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                color: '#DC2626',
                '&:hover': {
                  bgcolor: 'rgba(220, 38, 38, 0.1)',
                },
              }}
            >
              <Logout sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 250,
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

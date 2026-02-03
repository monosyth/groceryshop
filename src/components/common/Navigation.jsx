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
  People,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { teal, pink, red } from '../../theme/colors';

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
    { label: 'Receipts', path: '/dashboard', icon: <Dashboard />, emoji: '🧾' },
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
          background: `linear-gradient(135deg, ${teal.main} 0%, ${teal.darker} 100%)`,
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
                bgcolor: `rgba(20, 184, 166, 0.12)`,
                borderLeft: `3px solid ${teal.main}`,
              },
              '&:hover': {
                bgcolor: `rgba(20, 184, 166, 0.08)`,
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
          background: `linear-gradient(135deg, ${teal.darker} 0%, ${teal.dark} 100%)`,
          borderBottom: 'none',
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
                color: 'white',
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
                background: 'rgba(255, 255, 255, 0.15)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'rotate(-3deg)',
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'rotate(-3deg) scale(1.05)',
                  background: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <ShoppingCart sx={{ fontSize: '22px', color: 'white' }} />
            </Box>
            <Typography
              sx={{
                fontSize: '20px',
                fontWeight: 700,
                color: 'white',
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
                      fontWeight: 700,
                      fontSize: '14px',
                      px: 2,
                      py: 0.75,
                      borderRadius: '8px',
                      textTransform: 'none',
                      color: isActive ? teal.darker : 'white',
                      bgcolor: isActive ? 'white' : 'rgba(255, 255, 255, 0.1)',
                      minWidth: 'auto',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        bgcolor: isActive ? 'white' : 'rgba(255, 255, 255, 0.2)',
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
                  color: 'rgba(255, 255, 255, 0.9)',
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
                    border: '2px solid rgba(255, 255, 255, 0.5)',
                  }}
                />
              ) : (
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 600,
                    color: 'white',
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
                border: `2px solid ${teal.main}`,
                boxShadow: `2px 2px 0px rgba(20, 184, 166, 0.3)`,
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
              component={RouterLink}
              to="/household"
              onClick={handleClose}
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                color: teal.dark,
                '&:hover': {
                  bgcolor: `rgba(20, 184, 166, 0.1)`,
                },
              }}
            >
              <People sx={{ mr: 1 }} />
              Household
            </MenuItem>
            <MenuItem
              onClick={handleLogout}
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                color: red.dark,
                '&:hover': {
                  bgcolor: `rgba(220, 38, 38, 0.1)`,
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

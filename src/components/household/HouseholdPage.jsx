import { useState } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  People,
  PersonAdd,
  ContentCopy,
  Refresh,
  ExitToApp,
  Home,
  Check,
  Edit,
  Close,
  VpnKey,
  Email,
  Group,
} from '@mui/icons-material';
import { useHousehold } from '../../context/HouseholdContext';
import { teal, orange, pink, amber, white, ui, gray, darkGray } from '../../theme/colors';

export default function HouseholdPage() {
  const {
    household,
    members,
    loading,
    error,
    hasHousehold,
    inviteCode,
    createHousehold,
    joinHousehold,
    leaveHousehold,
    regenerateInviteCode,
    updateHouseholdName,
  } = useHousehold();

  const [mode, setMode] = useState('select'); // 'select', 'create', 'join'
  const [householdName, setHouseholdName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [codeCopied, setCodeCopied] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  const handleCreateHousehold = async () => {
    if (!householdName.trim()) {
      setActionError('Please enter a household name');
      return;
    }

    try {
      setActionLoading(true);
      setActionError('');
      await createHousehold(householdName.trim());
      setSnackbar({ open: true, message: 'Household created! Share your invite code with family.' });
      setHouseholdName('');
      setMode('select');
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinHousehold = async () => {
    if (!joinCode.trim()) {
      setActionError('Please enter an invite code');
      return;
    }

    try {
      setActionLoading(true);
      setActionError('');
      await joinHousehold(joinCode.trim().toUpperCase());
      setSnackbar({ open: true, message: 'Welcome to the household! 🎉' });
      setJoinCode('');
      setMode('select');
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveHousehold = async () => {
    try {
      setActionLoading(true);
      setActionError('');
      await leaveHousehold();
      setLeaveDialogOpen(false);
      setSnackbar({ open: true, message: 'You have left the household.' });
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
    setSnackbar({ open: true, message: 'Invite code copied!' });
  };

  const handleRegenerateCode = async () => {
    try {
      setActionLoading(true);
      await regenerateInviteCode();
      setSnackbar({ open: true, message: 'New invite code generated!' });
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartEditName = () => {
    setEditedName(household?.name || '');
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      setActionError('Household name cannot be empty');
      return;
    }
    try {
      setActionLoading(true);
      await updateHouseholdName(editedName.trim());
      setIsEditingName(false);
      setSnackbar({ open: true, message: 'Household name updated!' });
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    setEditedName('');
  };

  if (loading) {
    return (
      <Box sx={{ background: `linear-gradient(180deg, ${teal.bg} 0%, ${white} 100%)`, minHeight: '100vh', pb: 4 }}>
        <Container maxWidth="md">
          <Box sx={{ pt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <CircularProgress sx={{ color: teal.main }} />
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ background: `linear-gradient(180deg, ${teal.bg} 0%, ${white} 100%)`, minHeight: '100vh', pb: 4 }}>
      <Container maxWidth="md">
        <Box sx={{ pt: 4, pb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <People sx={{ fontSize: { xs: 28, md: 34 }, color: teal.main }} />
            <Typography
              variant="h3"
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 700,
                color: teal.main,
                fontSize: { xs: '28px', md: '34px' },
              }}
            >
              Household
            </Typography>
          </Box>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 400,
              color: darkGray.main,
            }}
          >
            {hasHousehold
              ? 'Manage your household and share groceries with family'
              : 'Create or join a household to share groceries with family'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
            {error}
          </Alert>
        )}

        {actionError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setActionError('')}>
            {actionError}
          </Alert>
        )}

        {/* No Household - Create or Join */}
        {!hasHousehold && (
          <Box>
            {mode === 'select' && (
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
                {/* Create Household Card */}
                <Paper
                  elevation={0}
                  sx={{
                    flex: 1,
                    p: 4,
                    borderRadius: '16px',
                    border: `3px solid ${teal.main}`,
                    boxShadow: `4px 4px 0px ${teal.light}`,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `6px 6px 0px ${teal.light}`,
                    },
                  }}
                  onClick={() => setMode('create')}
                >
                  <Home sx={{ fontSize: '56px', mb: 2, color: teal.main }} />
                  <Typography
                    variant="h5"
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 600,
                      color: teal.darker,
                      mb: 1,
                    }}
                  >
                    Create Household
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      color: darkGray.main,
                    }}
                  >
                    Start a new household and invite your family to join
                  </Typography>
                </Paper>

                {/* Join Household Card */}
                <Paper
                  elevation={0}
                  sx={{
                    flex: 1,
                    p: 4,
                    borderRadius: '16px',
                    border: `3px solid ${orange.main}`,
                    boxShadow: `4px 4px 0px ${orange.light}`,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `6px 6px 0px ${orange.light}`,
                    },
                  }}
                  onClick={() => setMode('join')}
                >
                  <VpnKey sx={{ fontSize: '56px', mb: 2, color: orange.main }} />
                  <Typography
                    variant="h5"
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 600,
                      color: orange.dark,
                      mb: 1,
                    }}
                  >
                    Join Household
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      color: darkGray.main,
                    }}
                  >
                    Enter an invite code to join an existing household
                  </Typography>
                </Paper>
              </Box>
            )}

            {/* Create Form */}
            {mode === 'create' && (
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: '16px',
                  border: `3px solid ${teal.main}`,
                  boxShadow: `4px 4px 0px ${teal.light}`,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 600,
                    color: teal.darker,
                    mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Home sx={{ color: teal.main }} />
                Create Your Household
              </Typography>
                <TextField
                  fullWidth
                  label="Household Name"
                  placeholder="e.g., The Smith Family, Apartment 5B"
                  value={householdName}
                  onChange={(e) => setHouseholdName(e.target.value)}
                  sx={{ mb: 3 }}
                  disabled={actionLoading}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setMode('select')}
                    disabled={actionLoading}
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 600,
                      borderRadius: '10px',
                      textTransform: 'none',
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleCreateHousehold}
                    disabled={actionLoading}
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 600,
                      borderRadius: '10px',
                      textTransform: 'none',
                      bgcolor: teal.main,
                      '&:hover': { bgcolor: teal.dark },
                    }}
                  >
                    {actionLoading ? 'Creating...' : 'Create Household'}
                  </Button>
                </Box>
              </Paper>
            )}

            {/* Join Form */}
            {mode === 'join' && (
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: '16px',
                  border: `3px solid ${orange.main}`,
                  boxShadow: `4px 4px 0px ${orange.light}`,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 600,
                    color: orange.dark,
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <VpnKey sx={{ color: orange.main }} />
                  Join a Household
                </Typography>
                <TextField
                  fullWidth
                  label="Invite Code"
                  placeholder="Enter 6-character code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  sx={{ mb: 3 }}
                  disabled={actionLoading}
                  inputProps={{ maxLength: 6, style: { textTransform: 'uppercase', letterSpacing: '4px', fontWeight: 600 } }}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setMode('select')}
                    disabled={actionLoading}
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 600,
                      borderRadius: '10px',
                      textTransform: 'none',
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleJoinHousehold}
                    disabled={actionLoading}
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 600,
                      borderRadius: '10px',
                      textTransform: 'none',
                      bgcolor: orange.main,
                      '&:hover': { bgcolor: orange.dark },
                    }}
                  >
                    {actionLoading ? 'Joining...' : 'Join Household'}
                  </Button>
                </Box>
              </Paper>
            )}
          </Box>
        )}

        {/* Has Household - Show Details */}
        {hasHousehold && (
          <Box>
            {/* Household Info Card */}
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: '16px',
                border: `3px solid ${teal.main}`,
                boxShadow: `4px 4px 0px ${teal.light}`,
                mb: 3,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Home sx={{ fontSize: '48px', color: teal.main }} />
                <Box sx={{ flex: 1 }}>
                  {isEditingName ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        size="small"
                        autoFocus
                        disabled={actionLoading}
                        onKeyPress={(e) => e.key === 'Enter' && handleSaveName()}
                        sx={{
                          '& .MuiInputBase-input': {
                            fontFamily: 'Outfit, sans-serif',
                            fontWeight: 700,
                            fontSize: '1.5rem',
                            color: teal.darker,
                          },
                        }}
                      />
                      <IconButton
                        onClick={handleSaveName}
                        disabled={actionLoading}
                        sx={{ color: teal.main }}
                      >
                        <Check />
                      </IconButton>
                      <IconButton
                        onClick={handleCancelEditName}
                        disabled={actionLoading}
                        sx={{ color: darkGray.main }}
                      >
                        <Close />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="h4"
                        sx={{
                          fontFamily: 'Outfit, sans-serif',
                          fontWeight: 700,
                          color: teal.darker,
                        }}
                      >
                        {household.name}
                      </Typography>
                      <Tooltip title="Edit name">
                        <IconButton
                          onClick={handleStartEditName}
                          size="small"
                          sx={{ color: darkGray.main, '&:hover': { color: teal.main } }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      color: darkGray.main,
                    }}
                  >
                    {members.length} member{members.length !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              </Box>

              {/* Invite Code Section */}
              <Box
                sx={{
                  bgcolor: amber.bg,
                  borderRadius: '12px',
                  border: `2px solid ${amber.main}`,
                  p: 3,
                  mb: 3,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 600,
                    color: amber.dark,
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <Email fontSize="small" sx={{ color: amber.main }} />
                  Invite Code - Share with family to join
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color: teal.darker,
                      letterSpacing: '6px',
                      flex: 1,
                    }}
                  >
                    {inviteCode}
                  </Typography>
                  <Tooltip title={codeCopied ? 'Copied!' : 'Copy code'}>
                    <IconButton
                      onClick={handleCopyCode}
                      sx={{
                        bgcolor: white,
                        border: `2px solid ${amber.main}`,
                        '&:hover': { bgcolor: amber.light },
                      }}
                    >
                      {codeCopied ? <Check /> : <ContentCopy />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Generate new code">
                    <IconButton
                      onClick={handleRegenerateCode}
                      disabled={actionLoading}
                      sx={{
                        bgcolor: white,
                        border: `2px solid ${amber.main}`,
                        '&:hover': { bgcolor: amber.light },
                      }}
                    >
                      <Refresh />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Members List */}
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600,
                  color: teal.darker,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Group sx={{ color: teal.main }} />
                Household Members
              </Typography>
              <List sx={{ bgcolor: gray.bg, borderRadius: '12px', overflow: 'hidden' }}>
                {members.map((member, index) => (
                  <Box key={member.id}>
                    {index > 0 && <Divider />}
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar
                          src={member.photoURL}
                          sx={{ bgcolor: teal.main }}
                        >
                          {member.displayName?.[0]?.toUpperCase() || '?'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography
                            sx={{
                              fontFamily: 'Outfit, sans-serif',
                              fontWeight: 600,
                              color: darkGray.darker,
                            }}
                          >
                            {member.displayName || 'Unknown'}
                          </Typography>
                        }
                        secondary={member.email}
                      />
                    </ListItem>
                  </Box>
                ))}
              </List>
            </Paper>

            {/* Leave Household Button */}
            <Button
              variant="outlined"
              color="error"
              startIcon={<ExitToApp />}
              onClick={() => setLeaveDialogOpen(true)}
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                borderRadius: '10px',
                textTransform: 'none',
              }}
            >
              Leave Household
            </Button>
          </Box>
        )}

        {/* Leave Confirmation Dialog */}
        <Dialog open={leaveDialogOpen} onClose={() => setLeaveDialogOpen(false)}>
          <DialogTitle sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
            Leave Household?
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ fontFamily: 'Outfit, sans-serif' }}>
              Are you sure you want to leave "{household?.name}"? Your receipts and data will remain
              with the household, but you won't be able to see shared items anymore.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setLeaveDialogOpen(false)}
              sx={{ fontFamily: 'Outfit, sans-serif', textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleLeaveHousehold}
              color="error"
              disabled={actionLoading}
              sx={{ fontFamily: 'Outfit, sans-serif', textTransform: 'none' }}
            >
              {actionLoading ? 'Leaving...' : 'Leave'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          message={snackbar.message}
        />
      </Container>
    </Box>
  );
}

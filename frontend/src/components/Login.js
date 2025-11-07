import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Snackbar,
  CircularProgress,
  InputAdornment,
  IconButton,
  Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const StyledContainer = styled(Container)(({ theme }) => ({
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
  position: 'relative',
  overflow: 'hidden',
  paddingTop: theme.spacing(2), // Add top padding for all screens
  [theme.breakpoints.down('sm')]: {
    paddingTop: theme.spacing(4), // More top padding for small screens
  },
  [theme.breakpoints.down('xs')]: {
    paddingTop: theme.spacing(6), // Even more top padding for extra small screens
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '300px',
    height: '300px',
    background: 'linear-gradient(45deg, #90CAF9, #1976D2)',
    borderRadius: '50%',
    top: '-100px',
    right: '-100px',
    opacity: 0.4,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '250px',
    height: '250px',
    background: 'linear-gradient(45deg, #42A5F5, #1565C0)',
    borderRadius: '50%',
    bottom: '-100px',
    left: '-100px',
    opacity: 0.4,
  }
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2), // Reduced from 4 for smaller screens
  width: '100%',
  maxWidth: 350, // Reduced from 450 for smaller screens
  borderRadius: theme.spacing(2), // Slightly reduced
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.3)',
  position: 'relative',
  overflow: 'hidden',
  zIndex: 1,
  animation: 'slideUp 0.5s ease-out',
  '@keyframes slideUp': {
    from: {
      transform: 'translateY(20px)',
      opacity: 0,
    },
    to: {
      transform: 'translateY(0)',
      opacity: 1,
    },
  },
  transform: 'perspective(1000px) rotateX(0deg)',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'perspective(1000px) rotateX(2deg)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #1976d2, #2196f3, #1976d2)',
    backgroundSize: '200% 100%',
    animation: 'gradient 2s linear infinite',
  },
  '@keyframes gradient': {
    '0%': { backgroundPosition: '0% 0%' },
    '100%': { backgroundPosition: '200% 0%' },
  },
  [theme.breakpoints.down('sm')]: {
    maxWidth: 260,
    padding: theme.spacing(0.5),
    borderRadius: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  [theme.breakpoints.down('xs')]: {
    maxWidth: 220,
    padding: theme.spacing(0.25),
    borderRadius: theme.spacing(0.8),
    marginTop: theme.spacing(1),
  }
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  margin: '0 auto',
  width: theme.spacing(16), // Smaller avatar for compact card
  height: theme.spacing(16),
  background: 'transparent',
  boxShadow: '0 8px 32px rgba(25, 118, 210, 0.15)',
  marginBottom: theme.spacing(2), // Less margin for compactness
  '& img': {
    objectFit: 'contain',
    padding: theme.spacing(1),
    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
  },
  animation: 'popIn 0.5s ease-out',
  '@keyframes popIn': {
    from: {
      transform: 'scale(0)',
    },
    to: {
      transform: 'scale(1)',
    },
  }
}));

const FloatingAvatar = styled(StyledAvatar)(({ theme }) => ({
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '120%',
    height: '120%',
    background: 'radial-gradient(circle, rgba(25,118,210,0.1) 0%, rgba(255,255,255,0) 70%)',
    animation: 'pulse 2s ease-in-out infinite',
  },
  '@keyframes pulse': {
    '0%': { transform: 'scale(0.95)' },
    '50%': { transform: 'scale(1.05)' },
    '100%': { transform: 'scale(0.95)' },
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)',
    transform: 'rotate(0deg)',
    animation: 'rotate 4s linear infinite',
  },
  '@keyframes rotate': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  }
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(2),
  fontSize: '1rem',
  fontWeight: 600,
  background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
  '&:hover': {
    background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
    boxShadow: '0 6px 20px rgba(25, 118, 210, 0.35)',
    transform: 'translateY(-1px)',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
      animation: 'ripple 1s cubic-bezier(0, 0, 0.2, 1)',
    }
  },
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '200%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
    transform: 'translateX(-100%)',
  },
  '&:hover::after': {
    transform: 'translateX(100%)',
    transition: 'transform 0.8s ease',
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(0)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.5)',
      opacity: 0,
    },
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(2),
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(25, 118, 210, 0.1)',
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(255, 255, 255, 1)',
      boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
      transform: 'translateY(-3px) scale(1.01)',

    }
  },
  '& .MuiInputLabel-root': {
    transition: 'all 0.3s ease',
    '&.Mui-focused': {
      transform: 'translate(14px, -9px) scale(0.75)',
      color: theme.palette.primary.main,
      textShadow: '0 0 8px rgba(25, 118, 210, 0.2)',
    }
  },
  marginBottom: theme.spacing(2)
}));

const WelcomeBox = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  textAlign: 'center',
  position: 'relative',
  padding: theme.spacing(2, 0),
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '120px', // Increased from 80px
    height: '4px', // Increased from 3px
    background: 'linear-gradient(90deg, transparent, #1976d2, #42A5F5, #1976d2, transparent)',
    borderRadius: '4px',
    animation: 'shimmer 2s infinite linear',
  },
  '@keyframes shimmer': {
    '0%': { backgroundPosition: '-120px 0' },
    '100%': { backgroundPosition: '120px 0' },
  }
}));

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotDialog, setShowForgotDialog] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTogglePassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/auth/login', formData);
      const { token, user } = response.data;
      
      // Pass both user data and token to login function
      login(user, token);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Failed to login. Please try again.');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage('');
    try {
      // Call the new backend endpoint for user self-service reset
      await api.post('/api/auth/send-reset-password-link', { email_or_username: forgotEmail });
      setForgotMessage('If your account exists, a reset link has been sent to your email.');
    } catch (error) {
      setForgotMessage(error.response?.data?.message || 'Failed to send reset link.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <StyledContainer sx={{ px: { xs: 0.5, sm: 1, md: 0 } }}>
      <StyledPaper elevation={24} sx={{ maxWidth: { xs: 320, sm: 400, md: 450 }, width: '100%', p: { xs: 1.5, sm: 3, md: 4 } }}>
        <FloatingAvatar
          src="/logo192.png"
          variant="square" // Makes it non-circular
          imgProps={{
            style: {
              maxWidth: '100%',
              maxHeight: '100%',
              padding: '24px', // Increased padding
              transform: 'scale(1.1)' // Slightly larger
            }
          }}
        />

        <WelcomeBox>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 400,
              background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.5px',
              mb: 2,
              animation: 'scaleIn 0.5s ease-out',
              '@keyframes scaleIn': {
                from: { transform: 'scale(0.9)', opacity: 0 },
                to: { transform: 'scale(1)', opacity: 1 },
              }
            }}
          >
            Expense Tracker
          </Typography>

    
        </WelcomeBox>
        
        {!showForgotDialog ? (
          <form onSubmit={handleSubmit}>
            <StyledTextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <StyledTextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleTogglePassword} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ textAlign: 'center', mt: 1, mb: 1, width: '100%' }}>
              <Button
                variant="text"
                size="small"
                onClick={() => setShowForgotDialog(true)}
                sx={{ textTransform: 'none', color: 'primary.main', fontWeight: 600, fontSize: { xs: '0.95rem', sm: '1rem' }, width: '100%' }}
              >
                Forgot Password?
              </Button>
            </Box>
            <StyledButton
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                'Sign In'
              )}
            </StyledButton>
          </form>
        ) : (
          <Paper elevation={8} sx={{ p: { xs: 1.5, sm: 3 }, mt: { xs: 2, sm: 3 }, borderRadius: { xs: 2, sm: 3 }, position: 'relative', zIndex: 10, maxWidth: { xs: 320, sm: 400 }, mx: 'auto', background: 'linear-gradient(135deg, #e3f2fd 70%, #bbdefb 100%)', boxShadow: '0 8px 32px rgba(25,118,210,0.10)', border: '1.5px solid #90caf9' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Reset Password</Typography>
            <form onSubmit={handleForgotPassword}>
              <TextField
                fullWidth
                label="Email or Username"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                required
                sx={{ mb: 2 }}
                disabled={forgotLoading}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={forgotLoading}
                  sx={{ minWidth: 120 }}
                >
                  {forgotLoading ? <CircularProgress size={20} /> : 'Send Reset Link'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setShowForgotDialog(false);
                    setForgotEmail('');
                    setForgotMessage('');
                  }}
                  sx={{ minWidth: 120 }}
                >
                  Cancel
                </Button>
              </Box>
              {forgotMessage && (
                <Alert severity={forgotMessage.includes('sent') ? 'success' : 'error'} sx={{ mt: 2 }}>{forgotMessage}</Alert>
              )}
            </form>
          </Paper>
        )}
      </StyledPaper>

      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowError(false)}
          severity="error"
          variant="filled"
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(211, 47, 47, 0.25)'
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </StyledContainer>
  );
};

export default Login;

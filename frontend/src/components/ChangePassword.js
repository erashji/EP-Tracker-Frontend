import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SecurityIcon from '@mui/icons-material/Security';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';  // Add this import at the top
import { alpha } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  margin: '0',
  borderRadius: theme.spacing(3),
  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
  border: '1px solid',
  borderColor: alpha(theme.palette.primary.main, 0.15),
  position: 'relative',
  overflow: 'visible',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
    borderRadius: '4px 4px 0 0'
  }
}));

const FormTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(2),
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
    transition: 'all 0.3s ease',
    border: '1px solid',
    borderColor: alpha(theme.palette.primary.main, 0.2),
    '&:hover': {
      backgroundColor: theme.palette.background.paper,
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`
    }
  },
  '& .MuiInputLabel-root': {
    '&.Mui-focused': {
      color: theme.palette.primary.main,
      fontWeight: 600
    }
  },
  '& .MuiInputAdornment-root': {
    '& .MuiIconButton-root': {
      color: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.08)
      }
    }
  }
}));

const PasswordStrengthIndicator = ({ password }) => {
  const getStrength = () => {
    if (!password) return { strength: 0, label: 'None', color: 'grey.400' };
    if (password.length < 6) return { strength: 25, label: 'Weak', color: 'error.main' };
    if (password.length < 8) return { strength: 50, label: 'Fair', color: 'warning.main' };
    if (password.length < 10) return { strength: 75, label: 'Good', color: 'success.light' };
    return { strength: 100, label: 'Strong', color: 'success.main' };
  };

  const strength = getStrength();

  return (
    <Box sx={{ mt: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          Password Strength:
        </Typography>
        <Typography variant="caption" color={strength.color} fontWeight="medium">
          {strength.label}
        </Typography>
      </Box>
      <Box sx={{ height: 4, bgcolor: 'grey.100', borderRadius: 2, overflow: 'hidden' }}>
        <Box
          sx={{
            height: '100%',
            width: `${strength.strength}%`,
            bgcolor: strength.color,
            transition: 'all 0.3s ease'
          }}
        />
      </Box>
    </Box>
  );
};

const ChangePassword = () => {
  const { token } = useAuth();  // Add this line
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await axios.post('/api/auth/change-password', 
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        },
        {
          headers: {
            'Authorization': `Bearer ${token}` // Add the token to request headers
          }
        }
      );

      setSuccess('Password changed successfully');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Error changing password');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <StyledCard>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          mb: 4,
          pb: 2,
          borderBottom: '2px solid',
          borderImage: 'linear-gradient(to right, #1976d2, #90caf9) 1',
          position: 'relative'
        }}>
          <Box sx={{
            p: 1.5,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)'
          }}>
            <SecurityIcon sx={{ 
              fontSize: 32,
              color: '#fff'
            }} />
          </Box>
          <Box>
            <Typography variant="h5" 
              sx={{ 
                background: 'linear-gradient(45deg, #1976d2, #2196f3)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700,
                mb: 0.5,
                letterSpacing: '-0.5px'
              }}
            >
              Change Password
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              Please enter your current password and choose a new one
            </Typography>
          </Box>
        </Box>

        {/* Enhanced alert styling */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'error.light',
              boxShadow: '0 4px 12px rgba(211, 47, 47, 0.1)',
              '& .MuiAlert-icon': {
                fontSize: 24
              }
            }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert 
            severity="success"
            sx={{ 
              mb: 3,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'success.light',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.1)',
              '& .MuiAlert-icon': {
                fontSize: 24
              }
            }}
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        )}

        {/* Form */}
        <Box 
          component="form" 
          onSubmit={handleSubmit} 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 3 
          }}
        >
          <FormTextField
            fullWidth
            type={showPassword.current ? 'text' : 'password'}
            label="Current Password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    onClick={() => togglePasswordVisibility('current')}
                  >
                    {showPassword.current ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <FormTextField
            fullWidth
            type={showPassword.new ? 'text' : 'password'}
            label="New Password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    {showPassword.new ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ mt: -2 }}>
            <PasswordStrengthIndicator password={formData.newPassword} />
          </Box>

          <FormTextField
            fullWidth
            type={showPassword.confirm ? 'text' : 'password'}
            label="Confirm New Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    {showPassword.confirm ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              mt: 2,
              height: 52,
              borderRadius: 3,
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 600,
              background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.35)',
                transform: 'translateY(-1px)'
              },
              '&:active': {
                transform: 'translateY(0)',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                <span>Updating...</span>
              </Box>
            ) : (
              'Update Password'
            )}
          </Button>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default ChangePassword;

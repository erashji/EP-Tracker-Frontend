import React, { useState } from 'react';
import axios from 'axios';
import { Box, TextField, Button, Typography, Alert, Paper, InputAdornment, IconButton, LinearProgress } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const ActivateAccount = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [mode, setMode] = useState('activate'); // 'activate' or 'reset'
  const token = new URLSearchParams(window.location.search).get('token');

  // Password strength logic
  const getStrength = () => {
    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[a-z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 20;
    if (/[^A-Za-z0-9]/.test(password)) score += 15;
    // Only show 100 if all criteria met
    if (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    ) {
      return 100;
    }
    return score;
  };
  const strength = getStrength();
  const strengthLabel =
    strength === 100
      ? 'Strong'
      : strength >= 75
      ? 'Medium'
      : 'Weak';
  const strengthColor =
    strength === 100
      ? 'success.main'
      : strength >= 75
      ? 'warning.main'
      : 'error.main';

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Password validation: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    if (
      !password ||
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      setError(
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.'
      );
      setSuccess('');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      setSuccess('');
      return;
    }
    try {
      const res = await axios.post('/api/admin/activate-user', { token, password });
      setSuccess(res.data.message);
      setError('');
      // Detect mode from backend message
      if (
        res.data.message &&
        res.data.message.toLowerCase().includes('password updated')
      ) {
        setMode('reset');
      } else {
        setMode('activate');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Activation failed.');
      setSuccess('');
    }
  };

  // UI text based on mode
  const heading = mode === 'reset' ? 'Set Your New Password' : 'Activate Your Account';
  const subtext = mode === 'reset'
    ? 'Please set a new password for your account.'
    : 'Please set a strong password to activate your account.';

  return (
    <Box sx={{ maxWidth: 420, mx: 'auto', mt: 8 }}>
      <Paper elevation={8} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" mb={2} sx={{
          fontWeight: 700,
          background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {heading}
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          {subtext}
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success ? (
          <Alert severity="success">{success}</Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            <TextField
              label="Set Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(v => !v)} edge="end">
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Box sx={{ mb: 2 }}>
              <LinearProgress
                variant="determinate"
                value={strength}
                sx={{
                  height: 6,
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                  '& .MuiLinearProgress-bar': { bgcolor: strengthColor }
                }}
              />
              <Typography variant="caption" color={strengthColor}>
                Password strength: {strengthLabel}
              </Typography>
            </Box>
            <TextField
              label="Confirm Password"
              type={showConfirm ? "text" : "password"}
              fullWidth
              required
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirm(v => !v)} edge="end">
                      {showConfirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{
                py: 1.5,
                fontWeight: 600,
                fontSize: '1.1rem',
                borderRadius: 2,
                background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)'
                }
              }}
            >
              {mode === 'reset' ? 'Set Password' : 'Activate Account'}
            </Button>
          </form>
        )}
      </Paper>
    </Box>
  );
};

export default ActivateAccount;

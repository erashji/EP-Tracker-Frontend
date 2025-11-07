import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Grid,
  InputAdornment,
  Divider,
  Paper,
  Stepper,
  CircularProgress,
  LinearProgress,
  Chip,

} from '@mui/material';
import {
  Search as SearchIcon,

  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Lock as LockIcon,
  Badge as BadgeIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AddUser = () => {
  const { token, user } = useAuth();  // Make sure user is destructured from useAuth
  const [formData, setFormData] = useState({
    emp_id: '',
    password: '',
    role: 'user',  // Set default role to 'user'
  });

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  const config = useMemo(() => ({
    headers: { Authorization: `Bearer ${token}` }
  }), [token]);

  // Fetch employees without user accounts
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/employees-without-users`, config);
        setEmployees(response.data);
      } catch (error) {
        console.error('Error fetching employees:', error);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Error fetching employees',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchEmployees();
    }
  }, [token, config]);

  // Filter employees to only show those without user accounts
  const availableEmployees = employees.filter(emp => !emp.user_id);

  // Filter employees based on search query
  const filteredEmployees = availableEmployees.filter(employee => 
    ((employee.first_name || employee.middle_name || employee.last_name
      ? `${employee.first_name || ''}${employee.middle_name ? ' ' + employee.middle_name : ''}${employee.last_name ? ' ' + employee.last_name : ''}`.replace(/\s+/g, ' ').trim()
      : employee.full_name
    ).toLowerCase().includes(searchQuery.toLowerCase()))
    ||
    employee.emp_code.toLowerCase().includes(searchQuery.toLowerCase())
    ||
    employee.email.toLowerCase().includes(searchQuery.toLowerCase())
    ||
    employee.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'username') {
      const selectedEmployee = employees.find(emp => emp.username === value);
      if (selectedEmployee) {
        setFormData(prev => ({
          ...prev,
          emp_id: selectedEmployee.emp_id,
          username: selectedEmployee.username,
          email: selectedEmployee.email
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    if (password.match(/[!@#$%^&*]/)) strength += 25;
    return strength;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPasswordStrength(checkPasswordStrength(newPassword));
    handleChange(e);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.emp_id || !formData.password || !formData.role) {
      setSnackbar({
        open: true,
        message: 'Please fill all required fields',
        severity: 'error',
      });
      return;
    }

    try {
      const userData = {
        emp_id: formData.emp_id,
        password: formData.password,
        role: formData.role
      };

      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/admin/users`,
        userData,
        config
      );

      setSnackbar({
        open: true,
        message: 'User added successfully!',
        severity: 'success',
      });

      // Clear form
      setFormData({
        emp_id: '',
        password: '',
        role: '',
      });
      setSearchQuery('');
      
      // Refresh employee list
      if (token) {
        const updatedResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/employees-without-users`, config);
        setEmployees(updatedResponse.data);
      }
    } catch (error) {
      console.error('Error adding user:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error adding user',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Add this function to manage available roles based on user's role
  const getAvailableRoles = () => {
    const allRoles = [
      { value: "user", label: "User" },  // Put user first
      { value: "hr", label: "HR" },
      { value: "accounts", label: "Accounts" },
      { value: "coordinator", label: "Coordinator" }
    ];

    // Only add admin option if user is admin
    if (user?.role === 'admin') {
      allRoles.push({ value: "admin", label: "Admin" });
    }

    return allRoles;
  };

  if (loading) {
    return (
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2, maxWidth: 1200, mx: 'auto' }}>
      <Paper elevation={0} sx={{ p: 4, mb: 3, bgcolor: 'background.default' }}>
     

        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3} lg={2}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  textAlign: 'center',
                  borderRadius: 2,
                  bgcolor: 'primary.lighter',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  }
                }}
              >
                <Box sx={{ mb: 1, color: 'primary.main' }}>
                  <PersonAddIcon sx={{ fontSize: 32 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  {availableEmployees.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Available Employees
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3} lg={2}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  textAlign: 'center',
                  borderRadius: 2,
                  bgcolor: 'success.lighter',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  }
                }}
              >
                <Box sx={{ mb: 1, color: 'success.main' }}>
                  <CheckCircleIcon sx={{ fontSize: 32 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  {employees.length - availableEmployees.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Users
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Stepper 
          activeStep={0} 
          sx={{ 
            mb: 4,
            '& .MuiStepLabel-root .Mui-completed': {
              color: 'success.main',
            },
            '& .MuiStepLabel-root .Mui-active': {
              color: 'primary.main',
            }
          }}
        >
          {/* No steps defined, so Stepper is just a placeholder */}
        </Stepper>

        {availableEmployees.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            p: 4,
            bgcolor: 'action.hover',
            borderRadius: 2
          }}>
            <Typography 
              color="text.secondary" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 1
              }}
            >
              <ErrorIcon color="error" />
              No employees available for user creation
            </Typography>
          </Box>
        ) : (
          <>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 2.5, 
                mb: 4, 
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2
              }}
            >
              <TextField
                fullWidth
                placeholder="Search employees by name, ID, email or username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <Chip 
                        label={`${filteredEmployees.length} results`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'background.paper',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    }
                  }
                }}
              />
            </Paper>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BadgeIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      Employee Selection
                    </Typography>
                  </Box>
                  <FormControl fullWidth required>
                    <InputLabel id="username-label">Select Employee</InputLabel>
                    <Select
                      labelId="username-label"
                      name="username"
                      value={employees.find(emp => emp.emp_id === formData.emp_id)?.username || ''}
                      label="Select Employee"
                      onChange={handleChange}
                      sx={{ 
                        '& .MuiSelect-select': { py: 1.5 }
                      }}
                    >
                      {filteredEmployees.length === 0 ? (
                        <MenuItem disabled>
                          <Box sx={{ textAlign: 'center', py: 1 }}>
                            <Typography color="text.secondary">No matches found</Typography>
                          </Box>
                        </MenuItem>
                      ) : (
                        filteredEmployees.map((employee) => (
                          <MenuItem
                            key={`username-${employee.emp_id}`}
                            value={employee.username}
                            sx={{ 
                              py: 1.5,
                              '&:not(:last-child)': {
                                borderBottom: '1px solid',
                                borderColor: 'divider'
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                  {(employee.first_name || employee.middle_name || employee.last_name)
                                    ? `${employee.first_name || ''}${employee.middle_name ? ' ' + employee.middle_name : ''}${employee.last_name ? ' ' + employee.last_name : ''}`.replace(/\s+/g, ' ').trim()
                                    : employee.full_name}
                                </Typography>
                                <Typography variant="caption" sx={{ 
                                  bgcolor: 'primary.main',
                                  color: 'primary.contrastText',
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  fontSize: '0.75rem'
                                }}>
                                  {employee.emp_code}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                  {employee.username}
                                </Typography>
                                <Divider orientation="vertical" flexItem />
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                  {employee.email}
                                </Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LockIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      User Details
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={employees.find(emp => emp.emp_id === formData.emp_id)?.email || ''}
                        disabled
                        sx={{ bgcolor: 'action.hover' }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth required>
                        <InputLabel id="role-label">Role</InputLabel>
                        <Select
                          labelId="role-label"
                          name="role"
                          value={formData.role}
                          label="Role"
                          onChange={handleChange}
                        >
                          {getAvailableRoles().map((role) => (
                            <MenuItem 
                              key={role.value} 
                              value={role.value}
                            >
                              {role.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        value={formData.password}
                        onChange={handlePasswordChange}
                        helperText={
                          <span>
                            Password strength: {passwordStrength < 50 ? 'Weak' : 
                              passwordStrength < 75 ? 'Medium' : 'Strong'}
                          </span>
                        }
                      />
                      {passwordStrength > 0 && (
                        <LinearProgress 
                          variant="determinate" 
                          value={passwordStrength}
                          sx={{ 
                            mt: 1,
                            mb: 0.5,
                            height: 6,
                            borderRadius: 1,
                            bgcolor: 'action.hover',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: passwordStrength < 50 ? 'error.main' : 
                                      passwordStrength < 75 ? 'warning.main' : 'success.main'
                            }
                          }}
                        />
                      )}
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => setFormData({ emp_id: '', password: '', role: '' })}
                sx={{ borderRadius: 2 }}
              >
                Clear Form
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{ 
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: 2
                }}
                disabled={!formData.emp_id || !formData.password || !formData.role}
                onClick={handleSubmit}
                startIcon={<CheckCircleIcon />}
              >
                Add User
              </Button>
            </Box>
          </>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddUser;

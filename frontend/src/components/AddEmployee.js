import React, { useState, useEffect } from 'react';
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
  Autocomplete,
  Paper
} from '@mui/material';
import { styled } from '@mui/system';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import BusinessIcon from '@mui/icons-material/Business';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const formatDisplayDate = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d)) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  border: '1px solid',
  borderColor: theme.palette.divider,
  '&:hover': {
    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.12)'
  }
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  '& .MuiSvgIcon-root': {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.lighter,
    padding: theme.spacing(1),
    borderRadius: theme.spacing(1),
    fontSize: '2rem'
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(2),
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: theme.palette.action.hover
    },
    '&.Mui-focused': {
      backgroundColor: 'white',
      boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
    }
  }
}));

const AddEmployee = () => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    emp_code: '',
    username: '',
    first_name: '',
    middle_name: '', // optional
    last_name: '',   // optional
    full_name: '',   // computed, not user-editable
    email: '',
    country_code: '+91', // Add country code field
    mobile_number: '',
    designation_id: '',
    department_id: '',
    location_id: '',
    date_of_joining: '',
    category: '',
    gender: '',
    birth_of_date: '',
    first_reporting_manager_emp_code: '',
    second_reporting_manager_emp_code: ''
  });

  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [dateErrors, setDateErrors] = useState({
    date_of_joining: '',
    birth_of_date: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, desigRes, locRes, empRes] = await Promise.all([
          api.get('/api/employees/departments'),
          api.get('/api/employees/designations'),
          api.get('/api/employees/locations'),
          api.get('/api/employees/all')
        ]);

        setDepartments(deptRes.data);
        setDesignations(desigRes.data);
        setLocations(locRes.data);
        setEmployees(empRes.data);
      } catch (error) {
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Error fetching data. Please try again.',
          severity: 'error'
        });
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  // Helper to auto-complete email domain
  const autoCompleteEmail = (email) => {
    if (!email) return '';
    if (email.includes('@')) return email;
    return `${email}@sprayengineering.com`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'date_of_joining') {
      let error = '';
      const minDate = new Date('1992-01-01');
      const birthDate = formData.birth_of_date ? new Date(formData.birth_of_date) : null;
      const joiningDate = value ? new Date(value) : null;

      if (joiningDate && joiningDate < minDate) {
        error = 'Company is not established at that time';
      } else if (birthDate && joiningDate && joiningDate <= birthDate) {
        error = 'Date of joining must be after birth date';
      }
      setDateErrors(prev => ({ ...prev, date_of_joining: error }));

      setFormData(prev => ({
        ...prev,
        date_of_joining: value
      }));
    } else if (name === 'birth_of_date') {
      let error = '';
      const joiningDate = formData.date_of_joining ? new Date(formData.date_of_joining) : null;
      const birthDate = value ? new Date(value) : null;

      if (joiningDate && birthDate && joiningDate <= birthDate) {
        error = 'Date of joining must be after birth date';
        setDateErrors(prev => ({ ...prev, date_of_joining: error }));
      } else {
        setDateErrors(prev => ({ ...prev, date_of_joining: '' }));
      }
      setFormData(prev => ({
        ...prev,
        birth_of_date: value
      }));
    } else if (name === 'email') {
      setFormData(prev => {
        // Don't auto-complete here, only on blur/enter
        return {
          ...prev,
          email: value,
          username: value
        };
      });
    } else if (name === 'first_name' || name === 'middle_name' || name === 'last_name') {
      // Only allow alphabetic characters and spaces
      const alphabeticValue = value.replace(/[^A-Za-z\s]/g, '');
      setFormData(prev => {
        const updated = {
          ...prev,
          [name]: alphabeticValue
        };
        // Compute full_name
        updated.full_name = [updated.first_name, updated.middle_name, updated.last_name].filter(Boolean).join(' ');
        return updated;
      });
    } else if (name === 'country_code') {
      setFormData(prev => ({
        ...prev,
        country_code: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleMobileNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length <= 10) {
      setFormData(prev => ({
        ...prev,
        mobile_number: value
      }));
    }
  };

  // Handle email blur or Enter key to auto-complete domain
  const handleEmailBlurOrEnter = (e) => {
    let email = formData.email;
    if (email && !email.includes('@')) {
      email = autoCompleteEmail(email);
      setFormData(prev => ({
        ...prev,
        email,
        username: email
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Format date fields to YYYY-MM-DD before sending
      // Removed unused variable 'formatDate'
      let mobile_number = formData.mobile_number;
      if (formData.country_code && mobile_number && !mobile_number.startsWith(formData.country_code)) {
        mobile_number = `${formData.country_code}${mobile_number}`;
      }
   
      setSnackbar({
        open: true,
        message: 'Employee added successfully!',
        severity: 'success'
      });

      setFormData({
        emp_code: '',
        username: '',
        first_name: '',
        middle_name: '', // added
        last_name: '',
        full_name: '', // computed, not user-editable
        email: '',
        country_code: '+91', // Reset country code to default
        mobile_number: '',
        designation_id: '',
        department_id: '',
        location_id: '',
        date_of_joining: '',
        category: '', // added
        gender: '', // added
        birth_of_date: '', // added
        first_reporting_manager_emp_code: '',
        second_reporting_manager_emp_code: ''
      });
      setDateErrors({ date_of_joining: '', birth_of_date: '' }); // Clear date errors
    } catch (error) {
      // Only show duplicate error if backend returns it
      const msg = error.response?.data?.message || 'Error adding employee. Please try again.';
      setSnackbar({
        open: true,
        message: msg,
        severity: 'error'
      });
   
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const getEmployeeFullName = (emp) => {
    if (!emp) return '';
    return `${emp.emp_code} - ${(emp.first_name || emp.middle_name || emp.last_name)
      ? `${emp.first_name || ''}${emp.middle_name ? ' ' + emp.middle_name : ''}${emp.last_name ? ' ' + emp.last_name : ''}`.replace(/\s+/g, ' ').trim()
      : emp.full_name}`;
  };

  const filterOptions = (options, { inputValue }) => {
    return options.filter((option) =>
      getEmployeeFullName(option)
        .toLowerCase()
        .includes(inputValue.toLowerCase())
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <StyledPaper>
        <SectionHeader>
          <PersonAddIcon />
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Add New Employee
          </Typography>
        </SectionHeader>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            {/* Personal Information Section */}
            <Grid item xs={12}>
              <SectionHeader>
                <AssignmentIndIcon />
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  Personal Information
                </Typography>
              </SectionHeader>
              <Grid container spacing={3}>
                {/* Row 1: First, Middle, Last Name */}
                <Grid item xs={12} md={4}>
                  <StyledTextField
                    required
                    fullWidth
                    label="First Name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    variant="outlined"
                    inputProps={{
                      pattern: '[A-Za-z\\s]*',
                      title: 'Only alphabetic characters are allowed'
                    }}
                    error={!/^[A-Za-z\s]*$/.test(formData.first_name)}
                    helperText={
                      !/^[A-Za-z\s]*$/.test(formData.first_name)
                        ? <span style={{ color: 'red' }}>Only alphabetic characters are allowed</span>
                        : ''
                    }
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <StyledTextField
                    fullWidth
                    label="Middle Name"
                    name="middle_name"
                    value={formData.middle_name}
                    onChange={handleChange}
                    variant="outlined"
                    inputProps={{
                      pattern: '[A-Za-z\\s]*',
                      title: 'Only alphabetic characters are allowed'
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <StyledTextField
                    fullWidth
                    label="Last Name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    variant="outlined"
                    inputProps={{
                      pattern: '[A-Za-z\\s]*',
                      title: 'Only alphabetic characters are allowed'
                    }}
                    error={!/^[A-Za-z\s]*$/.test(formData.last_name)}
                    helperText={
                      !/^[A-Za-z\s]*$/.test(formData.last_name)
                        ? <span style={{ color: 'red' }}>Only alphabetic characters are allowed</span>
                        : ''
                    }
                  />
                </Grid>
                {/* Row 2: Full Name, Email, Username */}
                <Grid item xs={12} md={4}>
                  <StyledTextField
                    fullWidth
                    label="Full Name"
                    name="full_name"
                    value={formData.full_name}
                    variant="outlined"
                    InputProps={{
                      readOnly: true,
                      style: { backgroundColor: '#f5f5f5', color: '#888' }
                    }}
                    helperText="Auto-generated from names"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <StyledTextField
                    required
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleEmailBlurOrEnter}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        handleEmailBlurOrEnter(e);
                      }
                    }}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <StyledTextField
                    required
                    fullWidth
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    variant="outlined"
                    InputProps={{
                      readOnly: true,
                      style: { backgroundColor: '#f5f5f5', color: '#888' }
                    }}
                    helperText="Username will always match the email"
                  />
                </Grid>
                {/* Row 3: Mobile, Birth Date, Gender */}
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FormControl sx={{ minWidth: 80 }}>
                      <Select
                        name="country_code"
                        value={formData.country_code}
                        onChange={handleChange}
                        variant="outlined"
                        size="small"
                      >
                        <MenuItem value="+91">+91</MenuItem>
                        <MenuItem value="+1">+1</MenuItem>
                        <MenuItem value="+44">+44</MenuItem>
                        {/* Add more country codes as needed */}
                      </Select>
                    </FormControl>
                    <StyledTextField
                      fullWidth
                      label="Mobile Number"
                      name="mobile_number"
                      value={formData.mobile_number}
                      onChange={handleMobileNumberChange}
                      variant="outlined"
                      inputProps={{
                        maxLength: 10,
                        pattern: '[0-9]*'
                      }}
                      required
                      type="tel"
                      sx={{ flex: 1 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <StyledTextField
                    required
                    fullWidth
                    label="Birth Date"
                    name="birth_of_date"
                    type="date"
                    value={formData.birth_of_date}
                    onChange={handleChange}
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true
                    }}
                    inputProps={{
                      max: new Date().toISOString().split('T')[0]
                    }}
                    error={!!dateErrors.birth_of_date}
                    helperText={formData.birth_of_date ? formatDisplayDate(formData.birth_of_date) : dateErrors.birth_of_date}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth variant="outlined" required>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      name="gender"
                      value={formData.gender}
                      label="Gender"
                      onChange={handleChange}
                      sx={{ borderRadius: 2 }}
                      required
                    >
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>

            {/* Organization Details Section */}
            <Grid item xs={12}>
              <SectionHeader>
                <BusinessIcon />
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  Organization Details
                </Typography>
              </SectionHeader>
              <Grid container spacing={3}>
                {/* Row 1: Employee Code, Designation, Department */}
                <Grid item xs={12} md={4}>
                  <StyledTextField
                    required
                    fullWidth
                    label="Employee Code"
                    name="emp_code"
                    value={formData.emp_code}
                    onChange={handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth variant="outlined" required>
                    <InputLabel>Designation</InputLabel>
                    <Select
                      name="designation_id"
                      value={formData.designation_id}
                      label="Designation"
                      onChange={handleChange}
                      required
                      sx={{ borderRadius: 2 }}
                    >
                      {designations.map((designation) => (
                        <MenuItem key={designation.designation_id} value={designation.designation_id}>
                          {designation.designation_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth variant="outlined" required>
                    <InputLabel>Department</InputLabel>
                    <Select
                      name="department_id"
                      value={formData.department_id}
                      label="Department"
                      onChange={handleChange}
                      required
                      sx={{ borderRadius: 2 }}
                    >
                      {departments.map((department) => (
                        <MenuItem key={department.department_id} value={department.department_id}>
                          {department.department_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                {/* Row 2: Location, Date of Joining, Category */}
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth variant="outlined" required>
                    <InputLabel>Location</InputLabel>
                    <Select
                      name="location_id"
                      value={formData.location_id}
                      label="Location"
                      onChange={handleChange}
                      required
                      sx={{ borderRadius: 2 }}
                    >
                      {locations.map((location) => (
                        <MenuItem key={location.location_id} value={location.location_id}>
                          {location.location_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <StyledTextField
                    required
                    fullWidth
                    label="Date of Joining"
                    name="date_of_joining"
                    type="date"
                    value={formData.date_of_joining}
                    onChange={handleChange}
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true
                    }}
                    inputProps={{
                      min: '1992-01-01',
                      max: new Date().toISOString().split('T')[0]
                    }}
                    error={!!dateErrors.date_of_joining}
                    helperText={formData.date_of_joining ? formatDisplayDate(formData.date_of_joining) : dateErrors.date_of_joining}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth variant="outlined" required>
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="category"
                      value={formData.category}
                      label="Category"
                      onChange={handleChange}
                      sx={{ borderRadius: 2 }}
                      required
                    >
                      <MenuItem value="Staff">Staff</MenuItem>
                      <MenuItem value="Worker">Worker</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>

            {/* Reporting Structure Section */}
            <Grid item xs={12}>
              <SectionHeader>
                <SupervisorAccountIcon />
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  Reporting Structure
                </Typography>
              </SectionHeader>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    fullWidth
                    options={employees || []}
                    getOptionLabel={getEmployeeFullName}
                    filterOptions={filterOptions}
                    value={employees?.find(emp => emp.emp_code === formData.first_reporting_manager_emp_code) || null}
                    onChange={(event, newValue) => {
                      setFormData(prev => ({
                        ...prev,
                        first_reporting_manager_emp_code: newValue?.emp_code || ''
                      }));
                    }}
                    renderOption={(props, option) => (
                      <li {...props} key={option.emp_id}>
                        {getEmployeeFullName(option)}
                      </li>
                    )}
                    renderInput={(params) => (
                      <StyledTextField
                        {...params}
                        label="First Reporting Manager"
                        variant="outlined"
                        required
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    fullWidth
                    options={employees || []}
                    getOptionLabel={getEmployeeFullName}
                    filterOptions={filterOptions}
                    value={employees?.find(emp => emp.emp_code === formData.second_reporting_manager_emp_code) || null}
                    onChange={(event, newValue) => {
                      setFormData(prev => ({
                        ...prev,
                        second_reporting_manager_emp_code: newValue?.emp_code || ''
                      }));
                    }}
                    renderOption={(props, option) => (
                      <li {...props} key={option.emp_id}>
                        {getEmployeeFullName(option)}
                      </li>
                    )}
                    renderInput={(params) => (
                      <StyledTextField
                        {...params}
                        label="Second Reporting Manager"
                        variant="outlined"
                        required
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Box sx={{ 
            mt: 4, 
            pt: 3, 
            display: 'flex', 
            justifyContent: 'flex-end',
            borderTop: '1px solid',
            borderColor: 'divider' 
          }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<PersonAddIcon />}
              sx={{
                minWidth: 200,
                height: 48,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                  boxShadow: '0 6px 16px rgba(25, 118, 210, 0.35)'
                }
              }}
            >
              Create
            </Button>
          </Box>
        </Box>
      </StyledPaper>

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

export default AddEmployee;

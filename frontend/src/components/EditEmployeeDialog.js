import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Alert,
  Autocomplete,
  Select,
  FormControl,
  Box
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useAuth } from '../context/AuthContext';
import { formatDisplayDate } from './NewExpense';

const EditEmployeeDialog = ({ 
  open, 
  onClose, 
  employee, 
  onSave, 
  departments, 
  designations, 
  locations,
  employees 
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    emp_code: '',
    username: '',
    first_name: '',
    middle_name: '', // added
    last_name: '',
    full_name: '', // computed, not user-editable
    email: '',
    country_code: '+91', // Add country code field
    mobile_number: '',
    designation_id: '',
    department_id: '',
    location_id: '',
    last_employment_date: null,
    date_of_joining: null,
    category: '', // added
    gender: '', // added
    birth_of_date: null, // added
    role: '',
    password: '',
    first_reporting_manager_emp_code: '',
    second_reporting_manager_emp_code: '',
    inactive_reason: '', // <-- add this field
  });
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({
    first_name: '',
    last_name: '',
    mobile_number: ''
  });

  useEffect(() => {
    if (employee) {
      // Parse country code and mobile number if present
      let country_code = '+91';
      let mobile_number = employee.mobile_number || '';
      const match = mobile_number.match(/^(\+\d{1,3})(\d{10})$/);
      if (match) {
        country_code = match[1];
        mobile_number = match[2];
      } else if (mobile_number.startsWith('+')) {
        // fallback: country code present but not 10 digits
        const ccMatch = mobile_number.match(/^(\+\d{1,3})/);
        if (ccMatch) {
          country_code = ccMatch[1];
          mobile_number = mobile_number.replace(country_code, '');
        }
      }
      setFormData({
        ...employee,
        country_code,
        mobile_number,
        last_employment_date: employee.last_employment_date ? 
          new Date(employee.last_employment_date) : null,
        date_of_joining: employee.date_of_joining ? new Date(employee.date_of_joining) : null,
        birth_of_date: employee.birth_of_date ? new Date(employee.birth_of_date) : null,
        inactive_reason: employee.inactive_reason || '',
      });
    }
  }, [employee]);

  const validateField = (name, value) => {
    switch (name) {
      case 'first_name':
      case 'last_name':
        if (!/^[a-zA-Z\s]*$/.test(value)) {
          return 'Only alphabets are allowed';
        }
        return '';
      case 'mobile_number':
        if (!/^\d*$/.test(value)) {
          return 'Only numbers are allowed';
        }
        if (value.length > 10) {
          return 'Mobile number cannot be more than 10 digits';
        }
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'first_name' || name === 'middle_name' || name === 'last_name') {
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
      // Set error message if applicable
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
      return;
    }

    // Special handling for mobile number
    if (name === 'mobile_number') {
      // Only proceed if the input is empty, numeric, and not longer than 10 digits
      if (value === '' || ((/^\d*$/.test(value)) && value.length <= 10)) {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
      // Set error message if applicable
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
      return;
    }

    if (name === 'country_code') {
      setFormData(prev => ({
        ...prev,
        country_code: value
      }));
      return;
    }

    // If editing email, also update username
    if (name === 'email') {
      setFormData(prev => ({
        ...prev,
        email: value,
        username: value // Username always matches email
      }));
      return;
    }

    if (name === 'inactive_reason') {
      setFormData(prev => ({
        ...prev,
        inactive_reason: value
      }));
      return;
    }

    // Handle other fields
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));

    if (!error) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      // Format date_of_joining and birth_of_date to 'YYYY-MM-DD' in local time (not UTC)
      const formatDate = (date) => {
        if (!date) return null;
        if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
        const d = new Date(date);
        if (isNaN(d)) return null;
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      // Fix mobile number concatenation
      let mobile_number = formData.mobile_number;
      if (formData.country_code && mobile_number && !mobile_number.startsWith(formData.country_code)) {
        mobile_number = `${formData.country_code}${mobile_number}`;
      }
      const dataToSend = {
        ...formData,
        mobile_number,
        date_of_joining: formatDate(formData.date_of_joining),
        last_employment_date: formatDate(formData.last_employment_date),
        birth_of_date: formatDate(formData.birth_of_date),
        inactive_reason: formData.inactive_reason
      };
      await onSave(dataToSend);
      onClose();
    } catch (err) {
      let msg = 'Error updating employee';
      if (err.message === 'Network Error') {
        msg = 'Network Error: Unable to connect to the server. Please check your backend server and CORS settings.';
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.message) {
        msg = err.message;
      }
      if (err.response?.data?.error) {
        msg += ` (${err.response.data.error})`;
      }
      setError(msg);
    }
  };

  const isFieldDisabled = (fieldName) => {
    if (user?.role === 'admin' || user?.role === 'hr') {
      return false; // Allow both admin and HR to edit all fields
    }
    return true; // Other roles cannot edit any fields
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Employee</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              name="emp_code"
              label="Employee Code"
              value={formData.emp_code || ''}
              onChange={handleChange}
              disabled={isFieldDisabled('emp_code')}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              name="username"
              label="Username"
              value={formData.username || ''}
              onChange={handleChange}
              disabled
              InputProps={{
                readOnly: true,
                style: { backgroundColor: '#f5f5f5', color: '#888' }
              }}
              helperText="Username will always match the email"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              name="first_name"
              label="First Name"
              value={formData.first_name || ''}
              onChange={handleChange}
              disabled={isFieldDisabled('first_name')}
              error={!!errors.first_name}
              helperText={errors.first_name ? <span style={{ color: 'red' }}>{errors.first_name}</span> : ''}
              inputProps={{ pattern: '[a-zA-Z]*' }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              name="middle_name"
              label="Middle Name"
              value={formData.middle_name || ''}
              onChange={handleChange}
              disabled={isFieldDisabled('middle_name')}
              inputProps={{ pattern: '[a-zA-Z]*' }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              name="last_name"
              label="Last Name"
              value={formData.last_name || ''}
              onChange={handleChange}
              disabled={isFieldDisabled('last_name')}
              error={!!errors.last_name}
              helperText={errors.last_name ? <span style={{ color: 'red' }}>{errors.last_name}</span> : ''}
              inputProps={{ pattern: '[a-zA-Z]*' }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              name="full_name"
              label="Full Name"
              value={formData.full_name || ''}
              disabled
              InputProps={{
                readOnly: true,
                style: { backgroundColor: '#f5f5f5', color: '#888' }
              }}
              helperText="Auto-generated from names"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              name="email"
              label="Email"
              value={formData.email || ''}
              onChange={handleChange}
              disabled={isFieldDisabled('email')}
            />
          </Grid>
          <Grid item xs={6}>
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
              <TextField
                fullWidth
                label="Mobile Number"
                name="mobile_number"
                value={formData.mobile_number || ''}
                onChange={handleChange}
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
          <Grid item xs={6}>
            <TextField
              select
              fullWidth
              name="department_id"
              label="Department"
              value={formData.department_id || ''}
              onChange={handleChange}
              disabled={isFieldDisabled('department_id')}
            >
              {departments.map(dept => (
                <MenuItem key={dept.department_id} value={dept.department_id}>
                  {dept.department_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField
              select
              fullWidth
              name="designation_id"
              label="Designation"
              value={formData.designation_id || ''}
              onChange={handleChange}
              disabled={isFieldDisabled('designation_id')}
            >
              {designations.map(desig => (
                <MenuItem key={desig.designation_id} value={desig.designation_id}>
                  {desig.designation_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField
              select
              fullWidth
              name="location_id"
              label="Location"
              value={formData.location_id || ''}
              onChange={handleChange}
              disabled={isFieldDisabled('location_id')}
            >
              {locations.map(loc => (
                <MenuItem key={loc.location_id} value={loc.location_id}>
                  {loc.location_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <Autocomplete
              fullWidth
              options={employees?.filter(emp => emp.emp_id !== employee?.emp_id) || []}
              getOptionLabel={emp =>
                (emp?.first_name || emp?.middle_name || emp?.last_name)
                  ? `${emp?.first_name || ''}${emp?.middle_name ? ' ' + emp.middle_name : ''}${emp?.last_name ? ' ' + emp.last_name : ''}`.replace(/\s+/g, ' ').trim()
                  : emp?.full_name || ''
              }
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
              disabled={isFieldDisabled('first_reporting_manager_emp_code')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="First Reporting Manager"
                  fullWidth
                />
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <Autocomplete
              fullWidth
              options={employees?.filter(emp => emp.emp_id !== employee?.emp_id) || []}
              getOptionLabel={emp =>
                (emp?.first_name || emp?.middle_name || emp?.last_name)
                  ? `${emp?.first_name || ''}${emp?.middle_name ? ' ' + emp.middle_name : ''}${emp?.last_name ? ' ' + emp.last_name : ''}`.replace(/\s+/g, ' ').trim()
                  : emp?.full_name || ''
              }
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
              disabled={isFieldDisabled('second_reporting_manager_emp_code')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Second Reporting Manager"
                  fullWidth
                />
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date of Joining"
                value={formData.date_of_joining}
                inputFormat="dd/MM/yyyy"
                onChange={date => setFormData(prev => ({
                  ...prev,
                  date_of_joining: date
                }))}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    value={formData.date_of_joining ? formatDisplayDate(formData.date_of_joining) : ''}
                    onChange={e => {
                      const val = e.target.value;
                      if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
                        const [day, month, year] = val.split('/');
                        const dateObj = new Date(`${year}-${month}-${day}`);
                        setFormData(prev => ({
                          ...prev,
                          date_of_joining: dateObj
                        }));
                      }
                    }}
                    helperText={formData.date_of_joining ? formatDisplayDate(formData.date_of_joining) : ''}
                  />
                )}
                maxDate={new Date()}
                minDate={new Date('1900-01-01')}
                disabled={formData.status === 'inactive'}
              />
            </LocalizationProvider>
          </Grid>
          {(user.role === 'admin' || user.role === 'hr') && (
            <>
              <Grid item xs={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Last Employment Date"
                    value={formData.last_employment_date}
                    inputFormat="dd/MM/yyyy"
                    onChange={date => setFormData(prev => ({
                      ...prev,
                      last_employment_date: date
                    }))}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        value={formData.last_employment_date ? formatDisplayDate(formData.last_employment_date) : ''}
                        onChange={e => {
                          const val = e.target.value;
                          if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
                            const [day, month, year] = val.split('/');
                            const dateObj = new Date(`${year}-${month}-${day}`);
                            setFormData(prev => ({
                              ...prev,
                              last_employment_date: dateObj
                            }));
                          }
                        }}
                        helperText={formData.last_employment_date ? formatDisplayDate(formData.last_employment_date) : ''}
                      />
                    )}
                    disabled={formData.status !== 'inactive'}
                    maxDate={new Date()}
                    minDate={new Date('1900-01-01')}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  select
                  fullWidth
                  name="role"
                  label="Role"
                  value={formData.role || ''}
                  onChange={handleChange}
                >
                  {['admin', 'user', 'hr', 'accounts', 'coordinator']
                    .filter(role => !(user.role === 'hr' && role === 'admin')) // Filter out admin role for HR users
                    .map(role => (
                      <MenuItem key={role} value={role}>
                        {role.toUpperCase()}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>
            </>
          )}
          <Grid item xs={6}>
            <TextField
              select
              fullWidth
              name="gender"
              label="Gender"
              value={formData.gender || ''}
              onChange={handleChange}
              disabled={isFieldDisabled('gender')}
            >
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField
              select
              fullWidth
              name="category"
              label="Category"
              value={formData.category || ''}
              onChange={handleChange}
              disabled={isFieldDisabled('category')}
            >
              <MenuItem value="Staff">Staff</MenuItem>
              <MenuItem value="Worker">Worker</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Birth Date"
                value={formData.birth_of_date}
                inputFormat="dd/MM/yyyy"
                onChange={date => setFormData(prev => ({
                  ...prev,
                  birth_of_date: date
                }))}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    value={formData.birth_of_date ? formatDisplayDate(formData.birth_of_date) : ''}
                    onChange={e => {
                      const val = e.target.value;
                      if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
                        const [day, month, year] = val.split('/');
                        const dateObj = new Date(`${year}-${month}-${day}`);
                        setFormData(prev => ({
                          ...prev,
                          birth_of_date: dateObj
                        }));
                      }
                    }}
                    helperText={formData.birth_of_date ? formatDisplayDate(formData.birth_of_date) : ''}
                  />
                )}
                maxDate={new Date()}
                minDate={new Date('1900-01-01')}
                disabled={isFieldDisabled('birth_of_date')}
              />
            </LocalizationProvider>
          </Grid>
          {(formData.status === 'inactive' || formData.last_employment_date) && (
            <Grid item xs={6}>
              <TextField
                select
                fullWidth
                name="inactive_reason"
                label="Inactive Reason"
                value={formData.inactive_reason || ''}
                onChange={handleChange}
                helperText="Reason for employee being inactive"
              >
                <MenuItem value="terminated">Terminated</MenuItem>
                <MenuItem value="reassigned">Reassigned</MenuItem>
                <MenuItem value="deceased">Deceased</MenuItem>
              </TextField>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditEmployeeDialog;

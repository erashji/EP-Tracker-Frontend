import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  Fade,
  Chip
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PersonIcon from '@mui/icons-material/Person';
import WarningIcon from '@mui/icons-material/Warning';
import { styled } from '@mui/material/styles';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(1),
}));

const WarningBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.warning.lighter,
  borderRadius: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

// Helper to format date as YYYY-MM-DD in local time
function formatLocalDate(date) {
  if (!date) return null;
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  const d = new Date(date);
  if (isNaN(d)) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to format date as DD/MM/YYYY for display
function formatDisplayDate(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d)) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// Main component
const TerminateEmployeeDialog = ({ open, onClose, employee, onSuccess }) => {
  const { token } = useAuth();
  const [lastEmploymentDate, setLastEmploymentDate] = useState(null);
  const [reportees, setReportees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [managers, setManagers] = useState([]);
  const [selectedManagers, setSelectedManagers] = useState({
    firstManager: '',
    secondManager: ''
  });
  const [confirmationInput, setConfirmationInput] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [inactiveReason, setInactiveReason] = useState('terminated');

  const fetchReportees = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`/api/employees/reporting-to/${employee.emp_code}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const reporteesWithDesignation = response.data.map(reportee => ({
        ...reportee,
        designation_name: reportee.designation?.name || reportee.designation_name || 'Position Not Assigned'
      }));
      setReportees(reporteesWithDesignation);
    } catch (error) {
      console.error('Error fetching reportees:', error);
      setError(`Failed to fetch reporting employees: ${error.response?.data?.message || 'Please try again later'}`);
      setReportees([]);
    } finally {
      setLoading(false);
    }
  }, [employee.emp_code, token]);

  const fetchAvailableManagers = useCallback(async () => {
    try {
      const response = await axios.get('/api/employees/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const activeManagers = response.data.filter(emp => 
        emp.status === 'active' && 
        emp.emp_code !== employee.emp_code &&
        emp.role !== 'Not Activated' && 
        emp.role !== ''
      );
      setManagers(activeManagers);
    } catch (error) {
      console.error('Error fetching managers:', error);
      setError('Failed to fetch available managers. Please try again.');
    }
  }, [employee.emp_code, token]);

  useEffect(() => {
    if (employee?.emp_code) {
      fetchReportees();
      fetchAvailableManagers();
      setLastEmploymentDate(new Date());
      setInactiveReason('terminated');
    }
  }, [employee, fetchReportees, fetchAvailableManagers]);

  // Enhanced validation
  const validateForm = () => {
    if (!lastEmploymentDate) {
      setError('Please select last employment date');
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight for accurate date comparison
    
    const selectedDate = new Date(lastEmploymentDate);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      setError('Last employment date cannot be in the future');
      return false;
    }

    if (reportees.length > 0) {
      if (!selectedManagers.firstManager) {
        setError('Please select new first reporting manager');
        return false;
      }
      if (!selectedManagers.secondManager) {
        setError('Please select new second reporting manager');
        return false;
      }
      if (selectedManagers.firstManager === selectedManagers.secondManager) {
        setError('First and second reporting managers cannot be the same');
        return false;
      }
    }

    if (!showConfirmation) {
      setShowConfirmation(true);
      return false;
    }

    if (confirmationInput !== employee.emp_code) {
      setError('Please enter the correct employee code to confirm');
      return false;
    }

    if (!inactiveReason) {
      setError('Please select employee status reason');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await axios.put(
        `/api/employees/${employee.emp_id}/terminate`,
        {
          last_employment_date: formatLocalDate(lastEmploymentDate), // <-- Use local date format
          new_first_manager: selectedManagers.firstManager,
          new_second_manager: selectedManagers.secondManager,
          inactive_reason: inactiveReason // <-- send to backend
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess();
      handleClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Error terminating employee');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setLastEmploymentDate(null);
    setError('');
    setSelectedManagers({ firstManager: '', secondManager: '' });
    setConfirmationInput('');
    setShowConfirmation(false);
    setInactiveReason('terminated');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        elevation: 24,
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'error.main', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <WarningIcon />
        Change Employee Status: {employee?.first_name} {employee?.last_name}
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <WarningBox>
          <WarningIcon color="warning" />
          <Typography variant="body2">
            This action will change the employee status and reassign their reportees to new managers.
            This action cannot be undone.
          </Typography>
        </WarningBox>

        {/* Show current status and reason */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2">
            Current Status: <strong>{employee?.status?.toUpperCase() || 'ACTIVE'}</strong>
          </Typography>
          <Typography variant="subtitle2">
            Reason: <strong>{employee?.inactive_reason ? employee.inactive_reason.toUpperCase() : 'ACTIVE'}</strong>
          </Typography>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Inactive Reason</InputLabel>
            <Select
              value={inactiveReason}
              label="Inactive Reason"
              onChange={e => setInactiveReason(e.target.value)}
            >
              <MenuItem value="terminated">Terminated</MenuItem>
              <MenuItem value="reassigned">Reassigned</MenuItem>
              <MenuItem value="deceased">Deceased</MenuItem>
            </Select>
          </FormControl>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Last Employment Date"
              value={lastEmploymentDate}
              inputFormat="dd/MM/yyyy"
              onChange={(date) => setLastEmploymentDate(date)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  value={lastEmploymentDate ? formatDisplayDate(lastEmploymentDate) : ''}
                  onChange={e => {
                    const val = e.target.value;
                    if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
                      const [day, month, year] = val.split('/');
                      const dateObj = new Date(`${year}-${month}-${day}`);
                      setLastEmploymentDate(dateObj);
                    }
                  }}
                  helperText={lastEmploymentDate ? formatDisplayDate(lastEmploymentDate) : ''}
                />
              )}
              maxDate={new Date()}
              minDate={new Date('1900-01-01')}
              disableFuture
            />
          </LocalizationProvider>
        </Box>

        {loading ? (
          <StyledPaper elevation={0}>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={40} />
            </Box>
          </StyledPaper>
        ) : error ? (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={fetchReportees}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        ) : reportees.length > 0 && (
          <StyledPaper elevation={0}>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              Employees Currently Reporting ({reportees.length})
            </Typography>
            <List dense>
              {reportees.map((reportee) => (
                <ListItem key={reportee.emp_id}>
                  <ListItemIcon>
                    <PersonIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${reportee.first_name} ${reportee.last_name}`}
                    secondary={`Employee Code: ${reportee.emp_code}`}
                  />
                  <Chip 
                    label={reportee.designation_name || 'Position Not Assigned'} 
                    size="small"
                    variant="outlined"
                  />
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" color="primary" gutterBottom>
              Select New Reporting Managers
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }} error={!selectedManagers.firstManager}>
              <InputLabel>New First Reporting Manager</InputLabel>
              <Select
                value={selectedManagers.firstManager}
                onChange={(e) => setSelectedManagers({
                  ...selectedManagers,
                  firstManager: e.target.value
                })}
                label="New First Reporting Manager"
              >
                {managers.length === 0 ? (
                  <MenuItem disabled>No available managers</MenuItem>
                ) : (
                  managers.map((manager) => (
                    <MenuItem key={manager.emp_code} value={manager.emp_code}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon fontSize="small" />
                        {`${manager.first_name} ${manager.last_name} (${manager.emp_code}) - ${manager.role?.toUpperCase()}`}
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>New Second Reporting Manager</InputLabel>
              <Select
                value={selectedManagers.secondManager}
                onChange={(e) => setSelectedManagers({
                  ...selectedManagers,
                  secondManager: e.target.value
                })}
                label="New Second Reporting Manager"
              >
                {managers.map((manager) => (
                  <MenuItem key={manager.emp_code} value={manager.emp_code}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon fontSize="small" />
                      {manager.first_name} {manager.last_name} ({manager.emp_code})
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </StyledPaper>
        )}

        {showConfirmation && (
          <Fade in={showConfirmation}>
            <StyledPaper elevation={0}>
              <Typography variant="subtitle1" color="error" gutterBottom>
                Confirmation Required
              </Typography>
              <Typography variant="body2" paragraph>
                To confirm termination, please enter the employee code: <strong>{employee?.emp_code}</strong>
              </Typography>
              <TextField
                fullWidth
                label="Enter Employee Code"
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
                error={confirmationInput !== '' && confirmationInput !== employee?.emp_code}
                helperText={confirmationInput !== '' && confirmationInput !== employee?.emp_code ? 
                  'Employee code does not match' : ''}
              />
            </StyledPaper>
          </Fade>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained" 
          color="error"
          disabled={loading || (showConfirmation && confirmationInput !== employee?.emp_code)}
          startIcon={loading ? <CircularProgress size={20} /> : <WarningIcon />}
        >
          {loading ? 'Processing...' : showConfirmation ? 'Confirm Termination' : 'Terminate'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TerminateEmployeeDialog;

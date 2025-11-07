import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Typography,
  IconButton,
  MenuItem,
  Divider,
  Tabs,
  Tab,
  CircularProgress,
  Backdrop,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  Tooltip,
  Chip,
  Autocomplete,
  TableContainer
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FlightIcon from '@mui/icons-material/Flight';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import WarningIcon from '@mui/icons-material/Warning';
import WorkIcon from '@mui/icons-material/Work';
import HotelIcon from '@mui/icons-material/Hotel';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import { styled, alpha } from '@mui/material/styles';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Configure axios
axios.defaults.baseURL = process.env.REACT_APP_API_URL;

// Format date as YYYY-MM-DD for backend/database
const formatDate = (date) => {
  if (!date) return null;
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  // Accept dd/MM/yyyy string and convert to Date
  if (typeof date === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
    const [day, month, year] = date.split('/');
    return `${year}-${month}-${day}`;
  }
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Format date for display as DD/MM/YYYY everywhere
export const formatDisplayDate = (date) => {
  if (!date) return '';
  // Accept YYYY-MM-DD or Date object
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }
  if (typeof date === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
    return date;
  }
  const d = new Date(date);
  if (isNaN(d)) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};



const HOTEL_SHARING_OPTIONS = [
  { value: 'Single', label: 'Single' },
  { value: 'Double', label: 'Double' },
  { value: 'Triple', label: 'Triple' }
];
const FOOD_SHARING_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  value: (i + 1).toString(),
  label: (i + 1).toString()
}));

// Replace existing ALLOWANCE_SCOPES constant
const ALLOWANCE_SCOPES = [
  { value: 'Daily Allowance Metro', label: 'Daily Allowance Metro' },
  { value: 'Daily Allowance Non-Metro', label: 'Daily Allowance Non-Metro' },
  { value: 'Site Allowance', label: 'Site Allowance' }
];

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 3px 15px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 5px 20px rgba(0,0,0,0.15)'
  }
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
  padding: theme.spacing(3),
  borderRadius: theme.spacing(3),
  marginBottom: theme.spacing(3),
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  position: 'relative',
  overflow: 'hidden'
}));

const HeaderCard = styled(Box)(({ theme, backgroundColor = '#E3F2FD' }) => ({
  backgroundColor: backgroundColor,
  backdropFilter: 'blur(10px)',
  padding: theme.spacing(2.5),
  borderRadius: theme.spacing(2),
  border: '1px solid rgba(255,255,255,0.6)',
  transition: 'all 0.3s ease',
  height: '100%',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
  }
}));



const TravelTableContainer = styled(Box)(({ theme }) => ({
  '& .MuiTableCell-root': {
    padding: theme.spacing(1),
    '&:first-of-type': {
      paddingLeft: theme.spacing(2)
    },
    '&:last-of-type': {
      paddingRight: theme.spacing(2)
    }
  },
  '& .MuiTableRow-root': {
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.04)
    }
  }
}));

const SuccessDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(3),
    padding: theme.spacing(4),
    textAlign: 'center',
    maxWidth: 400,
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(90deg, #4caf50, #81c784)'
    }
  }
}));

const ConfirmDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    padding: theme.spacing(2),
    maxWidth: 450,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(90deg, #1976d2, #2196f3)'
    }
  }
}));

const ValidationStepCard = styled(Box)(({ theme, isComplete }) => ({
  position: 'relative',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(1),
  backgroundColor: isComplete ? alpha(theme.palette.success.light, 0.1) : alpha(theme.palette.warning.light, 0.1),
  border: `1px solid ${isComplete ? theme.palette.success.light : theme.palette.warning.light}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateX(8px)',
    backgroundColor: isComplete ? alpha(theme.palette.success.light, 0.2) : alpha(theme.palette.warning.light, 0.2),
  }
}));

const ProgressIndicator = styled(Box)(({ theme, active }) => ({
  width: 24,
  height: 24,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: active ? theme.palette.success.main : theme.palette.grey[300],
  color: active ? theme.palette.common.white : theme.palette.grey[600],
  transition: 'all 0.3s ease',
  marginRight: theme.spacing(2)
}));

const ValidationDialog = ({ open, onClose, incomplete, activeTab, onNavigate, message }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="sm"
    fullWidth
    PaperProps={{
      elevation: 24,
      sx: {
        borderRadius: 2,
        overflow: 'visible',
        boxShadow: '0 8px 32px rgba(211,47,47,0.18)', // Strong red shadow for error
        background: 'linear-gradient(135deg, #fff 80%, #ffeaea 100%)'
      }
    }}
  >
    <DialogTitle 
      sx={{ 
        bgcolor: 'error.light',
        color: 'error.dark',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 2,
        fontWeight: 700,
        fontSize: '1.2rem',
        borderBottom: '2px solid #ffcdd2',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -15,
          left: 30,
          width: 0,
          height: 0,
          borderLeft: '15px solid transparent',
          borderRight: '15px solid transparent',
          borderTop: '15px solid',
          borderTopColor: 'error.light'
        }
      }}
    >
      <WarningIcon sx={{ color: 'error.main', fontSize: 32 }} />
      Submission Error
    </DialogTitle>
    
    <DialogContent sx={{ mt: 3, px: 3 }}>
      {message && (
        <Box sx={{
          mb: 3,
          p: 2,
          bgcolor: 'error.lighter',
          borderRadius: 2,
          border: '1.5px solid #ffcdd2',
          boxShadow: '0 2px 12px rgba(211,47,47,0.10)',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <WarningIcon sx={{ color: 'error.main', fontSize: 28 }} />
          <Box>
            <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 700 }}>
              {message}
            </Typography>
            <Typography variant="body2" sx={{ color: 'error.dark', mt: 0.5 }}>
              Please enter at least one expense (Travel) before submitting your claim.
            </Typography>
          </Box>
        </Box>
      )}
      <Typography 
        variant="subtitle1" 
        sx={{ 
          mb: 3,
          color: 'text.secondary',
          fontWeight: 500
        }}
      >
        The following sections need attention:
      </Typography>

      {incomplete.map((section, index) => (
        <ValidationStepCard key={index} isComplete={false} sx={{
          bgcolor: 'primary.lighter',
          border: '1px solid',
          borderColor: 'primary.light',
          '&:hover': {
            bgcolor: alpha('#1976d2', 0.08),
            borderColor: 'primary.main'
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <ProgressIndicator active sx={{
              bgcolor: 'primary.main',
              color: 'common.white'
            }}>
              {index + 1}
            </ProgressIndicator>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: 'primary.dark',
                  fontWeight: 600,
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                {section.icon}
                {section.name}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {section.fields.map((field, i) => (
                  <Chip
                    key={i}
                    label={field}
                    size="small"
                    variant="outlined"
                    color="primary"
                    sx={{ 
                      borderRadius: 1,
                      bgcolor: 'background.paper',
                      '& .MuiChip-label': {
                        px: 1,
                        color: 'primary.main'
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
            <Tooltip title="Go to section">
              <IconButton 
                size="small"
                onClick={() => {
                  onNavigate(index);
                  onClose();
                }}
                sx={{
                  ml: 1,
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: alpha('#1976d2', 0.08)
                  }
                }}
              >
                <ArrowForwardIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </ValidationStepCard>
      ))}
    </DialogContent>

    <DialogActions sx={{ p: 3, bgcolor: 'grey.50' }}>
      <Button
        variant="contained"
        onClick={onClose}
        startIcon={<CheckCircleIcon />}
        sx={{
          background: 'linear-gradient(135deg, #d32f2f 0%, #ffcdd2 100%)',
          color: 'white',
          boxShadow: '0 3px 8px 2px rgba(211,47,47,.13)',
          borderRadius: 2,
          fontWeight: 600,
          '&:hover': {
            background: 'linear-gradient(135deg, #b71c1c 0%, #ffcdd2 100%)',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(211,47,47,.18)'
          }
        }}
      >
        Close
      </Button>
    </DialogActions>
  </Dialog>
);

const NewExpense = ({
  isEditing,
  initialData,
  expenseId,
  onSuccess,
  journeyAllowance: journeyAllowanceProp = [],
  returnAllowance: returnAllowanceProp = [],
  stayAllowance: stayAllowanceProp = [],
  travelReceiptPath,
  hotelReceiptPath,
  foodReceiptPath,
  specialApprovalPath,
  hotelExpenses: hotelExpensesProp = [],
  foodExpenses: foodExpensesProp = []
}) => {
  const { token, user } = useAuth();

  // --- FIX: Move scopeAmounts state to the top, before any usage ---
  const [scopeAmounts, setScopeAmounts] = useState({
    'Daily Allowance Metro': '',
    'Daily Allowance Non-Metro': '',
    'Site Allowance': ''
  });

  // --- FIX: Initialize allowance arrays after scopeAmounts ---
  const [journeyAllowance, setJourneyAllowance] = useState(
    isEditing && journeyAllowanceProp ? journeyAllowanceProp : []
  );
  const [returnAllowance, setReturnAllowance] = useState(
    isEditing && returnAllowanceProp ? returnAllowanceProp : []
  );
  const [stayAllowance, setStayAllowance] = useState(
    isEditing && stayAllowanceProp ? stayAllowanceProp : []
  );
  // ---------------------------------------------------

  // Initialize hotel/food expenses from props if editing
  const [hotelExpenses, setHotelExpenses] = useState(
    isEditing && hotelExpensesProp.length > 0 ? hotelExpensesProp : []
  );
  const [foodExpenses, setFoodExpenses] = useState(
    isEditing && foodExpensesProp.length > 0 ? foodExpensesProp : []
  );
  // Keep hotelExpenses in sync with props in edit mode
  useEffect(() => {
    if (isEditing) {
      setHotelExpenses(hotelExpensesProp && hotelExpensesProp.length > 0 ? hotelExpensesProp : []);
    }
  }, [isEditing, hotelExpensesProp]);
  // Keep foodExpenses in sync with props in edit mode
  useEffect(() => {
    if (isEditing) {
      setFoodExpenses(foodExpensesProp && foodExpensesProp.length > 0 ? foodExpensesProp : []);
    }
  }, [isEditing, foodExpensesProp]);

  const addHotelExpense = () => {
    setHotelExpenses(prev => [...prev, { fromDate: null, toDate: null, sharing: '', location: '', billAmount: '' }]);
  };
  const removeHotelExpense = (idx) => {
    setHotelExpenses(prev => prev.filter((_, i) => i !== idx));
  };
  const handleHotelChange = (idx, field, value) => {
    setHotelExpenses(prev => {
      const arr = [...prev];
      arr[idx][field] = value;
      return arr;
    });
  };
  const hotelTotal = hotelExpenses.reduce((sum, h) => sum + (parseFloat(h.billAmount) || 0), 0);

  const addFoodExpense = () => {
    setFoodExpenses(prev => [...prev, { fromDate: null, toDate: null, sharing: '', location: '', billAmount: '' }]);
  };
  const removeFoodExpense = (idx) => {
    setFoodExpenses(prev => prev.filter((_, i) => i !== idx));
  };
  const handleFoodChange = (idx, field, value) => {
    setFoodExpenses(prev => {
      const arr = [...prev];
      arr[idx][field] = value;
      return arr;
    });
  };
  const foodTotal = foodExpenses.reduce((sum, f) => sum + (parseFloat(f.billAmount) || 0), 0);

  // Add state for special approval file
  const [specialApprovalFile, setSpecialApprovalFile] = useState(null);
  const [specialApprovalFileName, setSpecialApprovalFileName] = useState('');

  // Add local state for special approval path
  const [localSpecialApprovalPath, setLocalSpecialApprovalPath] = useState(specialApprovalPath || '');
  useEffect(() => {
    setLocalSpecialApprovalPath(specialApprovalPath || '');
  }, [specialApprovalPath]);

  // Add state to track if special approval should be deleted
  const [deleteSpecialApproval, setDeleteSpecialApproval] = useState(false);

  // Configure axios headers whenever token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  const [formData, setFormData] = useState({
    employeeCode: '',
    employeeName: '',
    designation: '',
    department: '',
    projectId: '',
    projectCode: '',
    projectName: '',
    travelData: [],
    travelReceipt: null,
    hotelReceipt: null,
    foodReceipt: null
  });

  // Add new state to store receipt file names
  const [receiptFileNames, setReceiptFileNames] = useState({
    travelReceipt: travelReceiptPath || '',
    hotelReceipt: hotelReceiptPath || '',
    foodReceipt: foodReceiptPath || '',
    specialApproval: specialApprovalPath || ''
  });

  // Add local state for receipt paths in edit mode
  const [localTravelReceiptPath, setLocalTravelReceiptPath] = useState(travelReceiptPath || '');
  const [localHotelReceiptPath, setLocalHotelReceiptPath] = useState(hotelReceiptPath || '');
  const [localFoodReceiptPath, setLocalFoodReceiptPath] = useState(foodReceiptPath || '');

  // Update local path states if props change (for edit mode)
  useEffect(() => {
    setLocalTravelReceiptPath(travelReceiptPath || '');
  }, [travelReceiptPath]);
  useEffect(() => {
    setLocalHotelReceiptPath(hotelReceiptPath || '');
  }, [hotelReceiptPath]);
  useEffect(() => {
    setLocalFoodReceiptPath(foodReceiptPath || '');
  }, [foodReceiptPath]);

  // Remove travel receipt if all travel entries are deleted
  useEffect(() => {
    if (formData.travelData.length === 0) {
      setFormData(prev => ({ ...prev, travelReceipt: null }));
      setReceiptFileNames(prev => ({ ...prev, travelReceipt: '' }));
      setLocalTravelReceiptPath('');
    }
  }, [formData.travelData]);

  // Remove hotel receipt if all hotel entries are deleted
  useEffect(() => {
    if (hotelExpenses.length === 0) {
      setFormData(prev => ({ ...prev, hotelReceipt: null }));
      setReceiptFileNames(prev => ({ ...prev, hotelReceipt: '' }));
      setLocalHotelReceiptPath('');
    }
  }, [hotelExpenses]);

  // Remove food receipt if all food entries are deleted
  useEffect(() => {
    if (foodExpenses.length === 0) {
      setFormData(prev => ({ ...prev, foodReceipt: null }));
      setReceiptFileNames(prev => ({ ...prev, foodReceipt: '' }));
      setLocalFoodReceiptPath('');
    }
  }, [foodExpenses]);

  const [validationError, setValidationError] = useState({
    open: false,
    message: '',
    severity: 'error',
    incomplete: []
  });

  const [allProjects, setAllProjects] = useState([]);

  useEffect(() => {
    fetchEmployeeInfo();
  }, []);

  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        ...formData,
        employeeCode: initialData.emp_code,
        employeeName: initialData.employee_name,
        designation: initialData.designation_name,
        department: initialData.department_name,
        empId: initialData.emp_id,
        designation_id: initialData.designation_id,
        projectCode: initialData.project_code,
        projectName: initialData.project_name,
        travelData: initialData.travel_data || [],
        firstName: initialData.first_name || '',
        middleName: initialData.middle_name || '',
        lastName: initialData.last_name || '',
        site_location: initialData.site_location || '',
        site_incharge_emp_code: initialData.site_incharge_emp_code || ''
      });
      setSiteLocation(initialData.site_location || '');
      setJourneyAllowance(initialData.journey_allowance || journeyAllowanceProp || []);
      setReturnAllowance(initialData.return_allowance || returnAllowanceProp || []);
      setStayAllowance(initialData.stay_allowance || stayAllowanceProp || []);
      setIsGeneralProject(
        initialData.project_code &&
        initialData.project_code.toLowerCase() === 'general'
      );
    }
  }, [isEditing, initialData, journeyAllowanceProp, returnAllowanceProp, stayAllowanceProp, formData]);

  useEffect(() => {
    if (isEditing && initialData) {
      setReceiptFileNames({
        travelReceipt: initialData.travel_receipt_path || '',
        hotelReceipt: initialData.hotel_receipt_path || '',
        foodReceipt: initialData.food_receipt_path || '',
        specialApproval: initialData.special_approval_path || ''
      });
      setLocalTravelReceiptPath(initialData.travel_receipt_path || '');
      setLocalHotelReceiptPath(initialData.hotel_receipt_path || '');
      setLocalFoodReceiptPath(initialData.food_receipt_path || '');
    }
  }, [isEditing, initialData]);

  const fetchEmployeeInfo = async () => {
    try {
      const response = await axios.get('/api/expenses/employees/current');
      const data = response.data;
      setFormData(prev => ({
        ...prev,
        employeeCode: data.emp_code,
        employeeName: `${data.first_name} ${data.middle_name ? data.middle_name + ' ' : ''}${data.last_name}`,
        designation: data.designation_name,
        department: data.department_name,
        empId: data.emp_id,
        designation_id: data.designation_id, // <-- ADD THIS
        // Add these fields for correct name display
        firstName: data.first_name || '',
        middleName: data.middle_name || '',
        lastName: data.last_name || ''
      }));
    } catch (error) {
      alert('Error fetching employee information. Please try again.');
    }
  };

  const [siteLocation, setSiteLocation] = useState('');

  useEffect(() => {
    // Fetch all project codes for autocomplete
    const fetchProjects = async () => {
      try {
        const response = await axios.get('/api/expenses/projects/all-fields');
        setAllProjects(response.data || []);
      } catch (error) {
        // handle error
      }
    };
    fetchProjects();
  }, []);

  // Add this state to track if it's a general project
  const [isGeneralProject, setIsGeneralProject] = useState(false);

  // Separate useEffect for general project siteLocation
  useEffect(() => {
    if (formData.projectCode && formData.projectCode.toLowerCase() === 'general') {
      setSiteLocation(formData.site_location || '');
    }
  }, [formData.projectCode, formData.site_location]);

  // Separate useEffect for non-general project siteLocation
  useEffect(() => {
    if (formData.projectCode && formData.projectCode.toLowerCase() !== 'general') {
      const selectedProject = allProjects.find(p => p.project_code === formData.projectCode);
      setSiteLocation(selectedProject ? selectedProject.site_location || '' : '');
    }
  }, [formData.projectCode, allProjects]);

  // Update siteLocation only when project code changes
  const handleProjectCodeChange = async (e, selectedProject) => {
    if (selectedProject) {
      const isGeneral = selectedProject.project_code.toLowerCase() === 'general';
      setIsGeneralProject(isGeneral);
      setFormData(prev => ({
        ...prev,
        projectCode: selectedProject.project_code,
        projectName: selectedProject.project_name,
        site_location: isGeneral ? '' : (selectedProject.site_location || ''),
        site_incharge_emp_code: isGeneral ? '' : (selectedProject.site_incharge_emp_code || '')
      }));
      setSiteLocation(isGeneral ? '' : (selectedProject.site_location || ''));
    } else {
      setFormData(prev => ({
        ...prev,
        projectCode: '',
        projectName: '',
        site_location: '',
        site_incharge_emp_code: ''
      }));
      setSiteLocation('');
      setIsGeneralProject(false);
    }
  };

  // Add state for all employees for autocomplete
  const [allEmployees, setAllEmployees] = useState([]);

  // Fetch all employees for autocomplete (once, always)
  useEffect(() => {
    axios.get('/api/employees/all')
      .then(res => setAllEmployees(res.data || []))
      .catch(() => setAllEmployees([]));
  }, []);

  const calculateTotalTravelFare = useCallback(() => {
    return formData.travelData.reduce((sum, travel) => {
      return sum + (parseFloat(travel.fareAmount) || 0);
    }, 0);
  }, [formData.travelData]);

  // Helper to calculate total allowance scope amount
  const calculateTotalAllowanceScopeAmount = useCallback(() => {
    // Sum all scope total amounts entered by user
    return Object.values(scopeAmounts).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  }, [scopeAmounts]);

  const calculateTotalExpense = useCallback(() => {
    const totalTravel = calculateTotalTravelFare();
    const allowanceTotal = calculateTotalAllowanceScopeAmount();
    const hotelTotalAmount = hotelTotal;
    const foodTotalAmount = foodTotal;
    return totalTravel + allowanceTotal + hotelTotalAmount + foodTotalAmount;
  }, [
    calculateTotalTravelFare,
    calculateTotalAllowanceScopeAmount,
    hotelTotal,
    foodTotal
  ]);

  const handleTravelDataChange = (index, field, value) => {
    setFormData(prev => {
      const newTravelData = [...prev.travelData];
      if (field === 'modeOfTransport') {
        newTravelData[index].modeOfTransport = value;
        if (value === 'SED Provided') {
          newTravelData[index].fareAmount = '0';
        }
      } else if (field === 'fareAmount') {
        // Only allow editing if not SED Provided
        if (newTravelData[index].modeOfTransport !== 'SED Provided') {
          let val = value;
          if (val === '' || isNaN(val)) val = '0';
          if (typeof val === 'string' && val.startsWith('-')) val = '0';
          if (parseFloat(val) < 0) val = '0';
          newTravelData[index].fareAmount = val;
        }
      } else {
        newTravelData[index][field] = value;
      }
      return { ...prev, travelData: newTravelData };
    });
  };

  const addTravelEntry = () => {
    setFormData(prev => ({
      ...prev,
      travelData: [...prev.travelData, {
        travelDate: null,
        fromLocation: '',
        toLocation: '',
        modeOfTransport: '',
        fareAmount: '0' // Default to "0"
      }]
    }));
  };

  const removeTravelEntry = (index) => {
    setFormData(prev => ({
      ...prev,
      travelData: prev.travelData.filter((_, i) => i !== index)
    }));
  };

  // Modify handleFileUpload to store file names
  const handleFileUpload = (field) => (event) => {
    const file = event.target.files[0];
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
    setReceiptFileNames(prev => ({
      ...prev,
      [field]: file ? file.name : (isEditing ? receiptFileNames[field] : '')
    }));
  };

  const handleRemoveReceipt = (type) => {
    setFormData(prev => ({
      ...prev,
      [type]: null
    }));
    setReceiptFileNames(prev => ({
      ...prev,
      [type]: ''
    }));
    // Clear local path state for edit mode
    if (type === 'travelReceipt') {
      setLocalTravelReceiptPath('');
    }
    if (type === 'hotelReceipt') setLocalHotelReceiptPath('');
    if (type === 'foodReceipt') setLocalFoodReceiptPath('');
    if (type === 'specialApproval') {
      setSpecialApprovalFile(null);
      setSpecialApprovalFileName('');
      setLocalSpecialApprovalPath('');
      setDeleteSpecialApproval(true); // Mark for deletion
    }
    // Recalculate tab completion for Receipts tab
    setTabCompletion(prev => ({
      ...prev,
      5: Object.entries(receiptsNeeded).every(([type, needed]) => {
        return !needed || isReceiptPresent(type);
      })
    }));
  };


  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [submissionStep, setSubmissionStep] = useState(0);



  // Helper to group all allowances by scope and sum total days
  const getScopeTotals = () => {
    const scopes = {};
    // Helper to add days for a scope from an allowance array
    const addDays = (arr) => {
      arr.forEach(row => {
        if (!row.scope) return;
        const days = parseInt(row.no_of_days || calcDays(row.from_date, row.to_date), 10) || 0;
        if (!scopes[row.scope]) scopes[row.scope] = { totalDays: 0, amountPerDay: '' };
        scopes[row.scope].totalDays += days;
      });
    };
    addDays(journeyAllowance);
    addDays(returnAllowance);
    addDays(stayAllowance);
    return scopes;
  };

  // Add new state for allowance rates
  const [allowanceRates, setAllowanceRates] = useState({});

  useEffect(() => {
    const fetchAllowanceRates = async () => {
      try {
        // Using designation_id from formData
        if (formData.designation_id) {
          const response = await axios.get(`/api/expenses/allowance-rates/${formData.designation_id}`);
          const ratesMap = {};
          response.data.forEach(rate => {
            ratesMap[rate.scope] = rate.amount;
          });
          setAllowanceRates(ratesMap);
          setScopeAmounts(ratesMap); // Pre-fill scope amounts with estimated rates
        }
      } catch (error) {
        // Removed console.error for production
      }
    };

    fetchAllowanceRates();
  }, [formData.designation_id]); // Run when designation_id changes

  // Initialize scopeAmounts from actual saved values (not estimated)
  useEffect(() => {
    if (isEditing && (journeyAllowance.length || returnAllowance.length || stayAllowance.length)) {
      const allAllowances = [...journeyAllowance, ...returnAllowance, ...stayAllowance];
      const newScopeAmounts = {};
      allAllowances.forEach(row => {
        if (row.scope && row.amount !== undefined && row.amount !== null && row.amount !== '') {
          // Only set if not already set (first occurrence per scope)
          if (newScopeAmounts[row.scope] === undefined) {
            newScopeAmounts[row.scope] = row.amount;
          }
        }
      });
      setScopeAmounts(prev => {
        // Only overwrite if not already set (preserve user edits in session)
        const merged = { ...prev };
        Object.entries(newScopeAmounts).forEach(([scope, amount]) => {
          if (!merged[scope] || merged[scope] === '' || merged[scope] === allowanceRates[scope]) {
            merged[scope] = amount;
          }
        });
        return merged;
      });
    } else if (!isEditing && Object.keys(allowanceRates).length) {
      // For new, set to estimated if not set
      setScopeAmounts(prev => {
        const merged = { ...prev };
        Object.entries(allowanceRates).forEach(([scope, amount]) => {
          if (!merged[scope] || merged[scope] === '') {
            merged[scope] = amount;
          }
        });
        return merged;
      });
    }
  }, [isEditing, journeyAllowance, returnAllowance, stayAllowance, allowanceRates]);

  const handleSubmit = async (event) => {
    if (event) {
      event.preventDefault();
    }
    // --- NEW: Validate DA/Allowance Scope Total amounts ---
    const scopeTotals = getScopeTotals();
    const missingScopeAmounts = Object.entries(scopeTotals)
      .filter(([scope, data]) => data.totalDays > 0 && (!scopeAmounts[scope] || parseFloat(scopeAmounts[scope]) <= 0))
      .map(([scope]) => scope);
    if (missingScopeAmounts.length > 0) {
      setValidationError({
        open: true,
        message: 'Please enter Amount per Day for all DA/Allowance scopes with days > 0.',
        severity: 'error',
        incomplete: [
          {
            name: 'DA (Daily Allowance)',
            icon: <WorkIcon color="primary" />, // Use WorkIcon for DA/Allowance
            fields: missingScopeAmounts.map(scope => `${scope}: Amount per Day`)
          }
        ]
      });
      setIsSubmitting(false);
      return;
    }
    // Add validation for general project site fields
    if (formData.projectCode.toLowerCase() === 'general' && (!formData.site_location || !formData.site_incharge_emp_code)) {
      setValidationError({
        open: true,
        message: "For General Project, Site Location and Site Incharge Employee Code are required",
        severity: 'error',
        incomplete: [{
          name: "Project Details",
          icon: <AssignmentIcon color="primary" />,
          fields: [
            !formData.site_location && "Site Location",
            !formData.site_incharge_emp_code && "Site Incharge Employee Code"
          ].filter(Boolean)
        }]
      });
      setIsSubmitting(false);
      return;
    }

    // Prevent submit if total expense is 0
    const totalTravel = calculateTotalTravelFare();
    const allowanceTotal = calculateTotalAllowanceScopeAmount();
    const hotelTotalAmount = hotelTotal;
    const foodTotalAmount = foodTotal;
    const claimAmount = totalTravel + allowanceTotal + hotelTotalAmount + foodTotalAmount;
    if (claimAmount <= 0 || getIncompleteSections().length > 0) {
      setValidationError({
        open: true,
        message: claimAmount <= 0 ? "Total expense amount cannot be zero. Please enter at least one expense (Travel, TA/DA, Hotel, or Food)." : "Please fill all required fields before submitting.",
        severity: 'error',
        incomplete: getIncompleteSections()
      });
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      // --- Always calculate claim_amount as total of travel and all allowances ---
      const totalTravel = calculateTotalTravelFare();
      const allowanceTotal = calculateTotalAllowanceScopeAmount();
      const hotelTotalAmount = hotelTotal;
      const foodTotalAmount = foodTotal;
      const claimAmount = totalTravel + allowanceTotal + hotelTotalAmount + foodTotalAmount;
      // Prevent submit if claimAmount is 0 or less
      if (claimAmount <= 0) {
        setValidationError({
          open: true,
          message: "Total expense amount cannot be zero or less. Please enter at least one valid expense.",
          severity: 'error',
          incomplete: []
        });
        setIsSubmitting(false);
        return;
      }
      // -----------------------------------------------------------------------------------------

      // Always use the latest state for allowance arrays
      const applyScopeAmounts = (arr) => arr.map(row => ({
        ...row,
        amount: scopeAmounts[row.scope] || row.amount || ''
      }));

      const expenseData = {
        emp_id: formData.empId,
        project_code: formData.projectCode,
        project_name: formData.projectName,
        site_location: formData.site_location || null,  // Make sure these are included
        site_incharge_emp_code: formData.site_incharge_emp_code || null,
        claim_amount: claimAmount, // <-- send correct total
        travel_data: formData.travelData.map(travel => ({
          emp_id: formData.empId,
          travel_date: formatDate(travel.travelDate),
          from_location: travel.fromLocation,
          to_location: travel.toLocation,
          mode_of_transport: travel.modeOfTransport,
          fare_amount: parseFloat(travel.fareAmount)
        })),
        journey_allowance: applyScopeAmounts(journeyAllowance),
        return_allowance: applyScopeAmounts(returnAllowance),
        stay_allowance: applyScopeAmounts(stayAllowance),
        hotel_expenses: hotelExpenses,
        food_expenses: foodExpenses
      };

      formDataToSend.append('data', JSON.stringify(expenseData));
      
      if (calculateTotalTravelFare() > 0 && formData.travelReceipt) {
        formDataToSend.append('travelReceipt', formData.travelReceipt);
      }
      if (specialApprovalFile) {
        formDataToSend.append('specialApproval', specialApprovalFile);
      }
      // Add this: send delete flag if user removed special approval
      if (deleteSpecialApproval) {
        formDataToSend.append('deleteSpecialApproval', 'true');
      }
      if (formData.hotelReceipt) {
        formDataToSend.append('hotelReceipt', formData.hotelReceipt);
      }
      if (formData.foodReceipt) {
        formDataToSend.append('foodReceipt', formData.foodReceipt);
      }

      // Add flags to delete receipts if all entries are deleted
      if (formData.travelData.length === 0) {
        formDataToSend.append('deleteTravelReceipt', 'true');
      }
      if (hotelExpenses.length === 0) {
        formDataToSend.append('deleteHotelReceipt', 'true');
      }
      if (foodExpenses.length === 0) {
        formDataToSend.append('deleteFoodReceipt', 'true');
      }

      const url = isEditing ? 
        `/api/expenses/${expenseId}` : 
        '/api/expenses';
      
      const method = isEditing ? 'put' : 'post';

      await axios[method](url, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (onSuccess) {
        onSuccess();
      }
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        if (!isEditing) {
          resetForm();
          // Immediately refresh the page after successful submit
          window.location.reload();
        }
      }, 3004);

    } catch (error) {
      // If backend returns total expense error, show in modal
      if (error.response?.data?.message?.includes('Total expense amount cannot be zero')) {
        setValidationError({
          open: true,
          message: error.response.data.message,
          severity: 'error',
          incomplete: []
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add form reset function
  const resetForm = () => {
    setFormData({
      employeeCode: '',
      employeeName: '',
      designation: '',
      department: '',
      projectId: '',
      projectCode: '',
      projectName: '',
      travelData: [],
      travelReceipt: null,
      hotelReceipt: null,
      foodReceipt: null
    });
    setActiveTab(0); // <-- Reset to first tab after form reset
    setFormKey(prev => prev + 1); // <-- Force full form remount
  };

  const [activeTab, setActiveTab] = useState(0);
  const [formKey, setFormKey] = useState(0); // <-- Add this line
  const [tabCompletion, setTabCompletion] = useState({
    0: false, // Project Details
    1: false, // DA (Daily Allowance
    2: false, // Travel Entries
    3: false, // Food Expense
    4: false, // Hotel Expense
    5: false  // Receipts
  });

  const [allowanceTab, setAllowanceTab] = useState(0);

  // Move isReceiptPresent above checkTabCompletion
  const isReceiptPresent = useCallback((type) => {
    if (type === 'travelReceipt') return !!(receiptFileNames.travelReceipt || localTravelReceiptPath);
    if (type === 'hotelReceipt') return !!(receiptFileNames.hotelReceipt || localHotelReceiptPath);
    if (type === 'foodReceipt') return !!(receiptFileNames.foodReceipt || localFoodReceiptPath);
    if (type === 'specialApproval') return !!(specialApprovalFileName || localSpecialApprovalPath);
    return false;
  }, [receiptFileNames, localTravelReceiptPath, localHotelReceiptPath, localFoodReceiptPath, specialApprovalFileName, localSpecialApprovalPath]);

  // Wrap checkTabCompletion in useCallback, remove unnecessary dependencies
  const checkTabCompletion = useCallback((tabIndex) => {
    switch (tabIndex) {
      case 0:
        return !!(
          formData.projectCode && formData.projectName
        );
      case 1:
        return true; // DA (Daily Allowance) tab is always considered complete
      case 2:
        return formData.travelData.every(t => 
          t.travelDate && t.fromLocation && t.toLocation && 
          t.modeOfTransport && t.fareAmount);
      case 3:
        return foodExpenses.every(f => f.fromDate && f.toDate && f.sharing && f.location && f.billAmount);
      case 4:
        return hotelExpenses.every(h => h.fromDate && h.toDate && h.sharing && h.location && h.billAmount);
      case 5:
        const receiptsNeeded = {
          travelReceipt: calculateTotalTravelFare() > 0,
          hotelReceipt: hotelExpenses.length > 0,
          foodReceipt: foodExpenses.length > 0,
          specialApproval: false // Set to true if you want to require special approval
        };
        return Object.entries(receiptsNeeded).every(([type, needed]) => {
          return !needed || isReceiptPresent(type);
        });
      default:
        return false;
    }
  }, [formData, hotelExpenses, foodExpenses, isReceiptPresent, calculateTotalTravelFare]);

  // Update completion status when form data changes
  useEffect(() => {
    const newCompletion = {};
    [0, 1, 2, 3, 4, 5].forEach(index => {
      newCompletion[index] = checkTabCompletion(index);
    });
    setTabCompletion(newCompletion);
  }, [formData, hotelExpenses, foodExpenses, checkTabCompletion]);

  // Wrap receiptsNeeded in useMemo
  const receiptsNeeded = useMemo(() => ({
    travelReceipt: calculateTotalTravelFare() > 0,
    hotelReceipt: hotelExpenses.length > 0,
    foodReceipt: foodExpenses.length > 0,
    specialApproval: false // Set to true if you want to require special approval
  }), [calculateTotalTravelFare, hotelExpenses.length, foodExpenses.length]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getIncompleteSections = () => {
    const sections = [];
    // Project Details Section
    const projectMissingFields = [];
    if (!formData.projectCode) projectMissingFields.push("Project Code");
    if (!formData.projectName) projectMissingFields.push("Project Name");
    if (formData.projectCode && formData.projectCode.toLowerCase() === 'general') {
      if (!formData.site_location) projectMissingFields.push("Site Location");
      if (!formData.site_incharge_emp_code) projectMissingFields.push("Site Incharge Employee Code");
    }
    if (projectMissingFields.length > 0) {
      sections.push({
        name: "Project Details",
        icon: <AssignmentIcon color="primary" />,
        fields: projectMissingFields
      });
    }
    // Travel Entries Section
    const travelMissingFields = [];
    formData.travelData.forEach((travel, index) => {
      if (!travel.travelDate) travelMissingFields.push(`Entry ${index + 1}: Travel Date`);
      if (!travel.fromLocation) travelMissingFields.push(`Entry ${index + 1}: From Location`);
      if (!travel.toLocation) travelMissingFields.push(`Entry ${index + 1}: To Location`);
      if (!travel.modeOfTransport) travelMissingFields.push(`Entry ${index + 1}: Transport Mode`);
      if (!travel.fareAmount) travelMissingFields.push(`Entry ${index + 1}: Fare Amount`);
    });
    if (travelMissingFields.length > 0) {
      sections.push({
        name: "Travel Details",
        icon: <DirectionsBusIcon color="primary" />, // Use bus icon for local travel
        fields: travelMissingFields
      });
    }
    // Food Expense Section
    const foodMissingFields = [];
    foodExpenses.forEach((food, idx) => {
      if (!food.fromDate) foodMissingFields.push(`Entry ${idx + 1}: From Date`);
      if (!food.toDate) foodMissingFields.push(`Entry ${idx + 1}: To Date`);
      if (!food.sharing) foodMissingFields.push(`Entry ${idx + 1}: Sharing`);
      if (!food.location) foodMissingFields.push(`Entry ${idx + 1}: Location`);
      if (!food.billAmount) foodMissingFields.push(`Entry ${idx + 1}: Bill Amount`);
    });
    if (foodMissingFields.length > 0) {
      sections.push({
        name: "Food Expense",
        icon: <RestaurantIcon color="primary" />,
        fields: foodMissingFields
      });
    }
    // Hotel Expense Section
    const hotelMissingFields = [];
    hotelExpenses.forEach((hotel, idx) => {
      if (!hotel.fromDate) hotelMissingFields.push(`Entry ${idx + 1}: From Date`);
      if (!hotel.toDate) hotelMissingFields.push(`Entry ${idx + 1}: To Date`);
      if (!hotel.sharing) hotelMissingFields.push(`Entry ${idx + 1}: Sharing`);
      if (!hotel.location) hotelMissingFields.push(`Entry ${idx + 1}: Location`);
      if (!hotel.billAmount) hotelMissingFields.push(`Entry ${idx + 1}: Bill Amount`);
    });
    if (hotelMissingFields.length > 0) {
      sections.push({
        name: "Hotel Expense",
        icon: <HotelIcon color="primary" />,
        fields: hotelMissingFields
      });
    }
    // Receipts Section
    const receiptsMissingFields = [];
    if (calculateTotalTravelFare() > 0 && !isReceiptPresent('travelReceipt')) receiptsMissingFields.push("Travel Receipt");
    if (hotelExpenses.length > 0 && !isReceiptPresent('hotelReceipt')) receiptsMissingFields.push("Hotel Receipt");
    if (foodExpenses.length > 0 && !isReceiptPresent('foodReceipt')) receiptsMissingFields.push("Food Receipt");
    // If you want to require special approval, add here
    // if (!isReceiptPresent('specialApproval')) receiptsMissingFields.push("Special Approval Receipt");
    if (receiptsMissingFields.length > 0) {
      sections.push({
        name: "Receipts",
        icon: <UploadFileIcon color="primary" />,
        fields: receiptsMissingFields
      });
    }
    // --- NEW: DA/Allowance Scope Total Section ---
    const scopeTotals = getScopeTotals();
    const missingScopeAmounts = Object.entries(scopeTotals)
      .filter(([scope, data]) => data.totalDays > 0 && (!scopeAmounts[scope] || parseFloat(scopeAmounts[scope]) <= 0))
      .map(([scope]) => scope);
    if (missingScopeAmounts.length > 0) {
      sections.push({
        name: 'DA (Daily Allowance)',
        icon: <WorkIcon color="primary" />, // Use WorkIcon for DA/Allowance
        fields: missingScopeAmounts.map(scope => `${scope}: Amount per Day`)
      });
    }
    return sections;
  };

  const FormSection = ({ children, title, icon }) => (
    <Box sx={{
      bgcolor: 'background.paper',
      p: 3,
      borderRadius: 2,
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      mb: 3,
      '&:hover': {
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        transform: 'translateY(-2px)'
      },
      transition: 'all 0.3s ease'
    }}>
      <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        {icon}
        {title}
      </Typography>
      {children}
    </Box>
  );

  // Track which travel amount field is focused (by index)
  const [travelAmountFocusedIndex, setTravelAmountFocusedIndex] = useState(null);

  // Helper to calculate days
  const calcDays = (from, to) => {
    if (!from || !to) return 0;
    const start = new Date(from);
    const end = new Date(to);
    start.setHours(0,0,0,0);
    end.setHours(0,0,0,0);
    const diff = end - start;
    if (diff < 0) return 0;
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleChangeDate = (idx, field, date) => {
    const updated = [...journeyAllowance];
    updated[idx][field] = date;
    updated[idx].no_of_days = calcDays(updated[idx].from_date, updated[idx].to_date);
    setJourneyAllowance(updated);
  };

  // Helper to allow only alphabets
  const onlyAlphabets = (value) => value.replace(/[^A-Za-z\s]/g, '');

  // Remove role restriction so admin can also use the form if the tab is enabled
  return (
    (user?.tab_permissions?.includes('new_expense') || ['user', 'coordinator', 'hr', 'accounts', 'admin'].includes(user?.role))
      ? (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box key={formKey} component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%', maxWidth: { xs: '100%', md: 1500 }, mx: 'auto' }}>
            <HeaderSection sx={{ width: '100%', maxWidth: { xs: '100%', md: 1500 }, mx: 'auto' }}>
              <Grid container spacing={3}>
                {/* Employee Details Card */}
                <Grid item xs={12} md={4}>
                  <HeaderCard backgroundColor="rgba(227, 242, 253, 0.95)" sx={{ width: '100%', maxWidth: { xs: '100%', md: 1500 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)', 
                        p: 1.5, 
                        borderRadius: 2,
                        display: 'flex'
                      }}>
                        👤
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>Employee Details</Typography>
                    </Box>
                    <Grid container spacing={2}>
                      {/* Employee Code and Name Row */}
                      <Grid item xs={12}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          bgcolor: 'rgba(25, 118, 210, 0.05)',
                          p: 1.5,
                          borderRadius: 1
                        }}>
                          <Box>
                            <Typography sx={{ opacity: 0.7, fontSize: '0.75rem' }}>Employee Code</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>{formData.employeeCode || '-'}</Typography>
                          </Box>
                          <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ opacity: 0.7, fontSize: '0.75rem' }}>Employee Name</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {(formData.firstName || formData.middleName || formData.lastName)
                                ? `${formData.firstName || ''}${formData.middleName ? ' ' + formData.middleName : ''}${formData.lastName ? ' ' + formData.lastName : ''}`.replace(/\s+/g, ' ').trim()
                                : formData.employeeName || '-'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      
                      {/* Department and Designation Row */}
                      <Grid item xs={6}>
                        <Typography sx={{ opacity: 0.7, fontSize: '0.875rem' }}>Department</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{formData.department || '-'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography sx={{ opacity: 0.7, fontSize: '0.875rem' }}>Designation</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{formData.designation || '-'}</Typography>
                      </Grid>
                    </Grid>
                  </HeaderCard>
                </Grid>

                {/* Expense Summary Card */}
                <Grid item xs={12} md={4}>
                  <HeaderCard backgroundColor="rgba(255, 243, 224, 0.95)" sx={{ width: '100%', maxWidth: { xs: '100%', md: 1500 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)', 
                        p: 1.5, 
                        borderRadius: 2,
                        display: 'flex'
                      }}>
                        💰
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#ed6c02' }}>Expense Summary</Typography>
                    </Box>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Typography sx={{ opacity: 0.7, fontSize: '0.875rem' }}>Travel Fare</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#ed6c02', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                          ₹{calculateTotalTravelFare().toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography sx={{ opacity: 0.7, fontSize: '0.875rem' }}>Hotel Amount</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#0288d1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                          ₹{hotelTotal.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography sx={{ opacity: 0.7, fontSize: '0.875rem' }}>Food Amount</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#43a047', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                          ₹{foodTotal.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography sx={{ opacity: 0.7, fontSize: '0.875rem' }}>Total DA (Daily Allowance)</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#388e3c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                          ₹{Object.entries(getScopeTotals()).reduce((sum, [scope, data]) =>
                            sum + ((parseFloat(scopeAmounts[scope]) || 0) * data.totalDays), 0
                          ).toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </HeaderCard>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{
                    background: 'linear-gradient(135deg, #e3f2fd 60%, #c8e6c9 100%)',
                    p: 3.5,
                    borderRadius: 3,
                    boxShadow: '0 6px 24px rgba(56,142,60,0.10)',
                    border: '2px solid',
                    borderColor: 'primary.main',
                    textAlign: 'center',
                    mt: 2,
                    mb: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    position: 'relative',
                    width: '100%',
                    maxWidth: { xs: '100%', md: 1500 }
                  }}>
                    <Box sx={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      bgcolor: 'rgba(255,255,255,0.3)',
                      borderRadius: '50%',
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 28,
                      color: '#388e3c',
                      boxShadow: '0 2px 8px rgba(56,142,60,0.08)'
                    }}>
                      <AccountBalanceWalletIcon sx={{ fontSize: 28 }} />
                    </Box>
                    <Typography sx={{ fontSize: '1.15rem', fontWeight: 700, color: 'primary.main', mb: 1, mt: 1 }}>Claim Amount</Typography>
                    <Divider sx={{ width: '60%', mb: 2, bgcolor: 'primary.light' }} />
                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#388e3c', letterSpacing: 1, mb: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                      ₹{(
                        calculateTotalTravelFare() + foodTotal + hotelTotal + Object.entries(getScopeTotals()).reduce((sum, [scope, data]) =>
                          sum + ((parseFloat(scopeAmounts[scope]) || 0) * data.totalDays), 0
                        )
                      ).toFixed(2)}
                    </Typography>
                 
                  </Box>
                </Grid>
              </Grid>
            </HeaderSection>

            <StyledPaper sx={{ width: '100%', maxWidth: { xs: '100%', md: 1500 }, mx: 'auto' }}>
              <Box sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                background: 'linear-gradient(to right, #f8f9fa, #e9ecef)',
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                overflowX: 'auto',
                whiteSpace: 'nowrap',
                maxWidth: '100%',
                '@media (max-width:900px)': {
                  overflowX: 'auto',
                  whiteSpace: 'nowrap',
                  WebkitOverflowScrolling: 'touch',
                  msOverflowStyle: 'auto',
                  scrollbarWidth: 'thin',
                }
              }}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                  sx={{
                    minHeight: 64,
                    '& .MuiTabs-flexContainer': {
                      flexWrap: 'nowrap',
                    },
                    '& .MuiTab-root': {
                      display: 'inline-block',
                      minWidth: 120,
                      maxWidth: 220,
                      whiteSpace: 'normal',
                      '@media (max-width:600px)': {
                        minWidth: 100,
                        fontSize: '0.85rem',
                      }
                    },
                    '& .tab-content': {
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 1
                    },
                    '& .icon-container': {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.1)',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        inset: -2,
                        borderRadius: '14px',
                        background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.2), transparent)',
                        opacity: 0,
                        transition: 'opacity 0.3s'
                      }
                    },
                    '&:hover': {
                      '& .icon-container': {
                        transform: 'translateY(-2px)',
                        '&::after': { opacity: 1 }
                      }
                    },
                    '&.Mui-selected': {
                      '& .icon-container': {
                        background: 'rgba(255,255,255,0.2)',
                        transform: 'scale(1.1)',
                        '&::after': { opacity: 1 }
                      }
                    }
                  }}
                >
                  {[
                    { icon: <AssignmentIcon />, label: "Project Details" },
                    { icon: <WorkIcon />, label: "DA (Daily Allowance)" },
                    { icon: <DirectionsBusIcon />, label: "Travel Entries" },
                    { icon: <RestaurantIcon />, label: "Food Expense" },
                    { icon: <HotelIcon />, label: "Hotel Expense" },
                    { icon: <UploadFileIcon />, label: "Receipts" }
                  ].map((tab, index) => (
                    <Tab
                      key={index}
                      label={
                        <div className="tab-content">
                          <Badge
                            overlap="circular"
                            badgeContent={
                              tabCompletion[index] ? 
                                <CheckCircleIcon 
                                  sx={{ 
                                    fontSize: 16,
                                    color: 'success.main',
                                    background: '#fff',
                                    borderRadius: '50%'
                                  }}
                                /> : null
                            }
                          >
                            <div className="icon-container">
                              {tab.icon}
                            </div>
                          </Badge>
                          <span>{tab.label}</span>
                        </div>
                      }
                    />
                  ))}
                </Tabs>
              </Box>

              <Box sx={{ p: 3, width: '100%', maxWidth: { xs: '100%', md: 1500 }, mx: 'auto' }}>
                {activeTab === 0 && (
                  <FormSection title="Project Details" icon={<AssignmentIcon color="primary" />}>
                    <Grid container spacing={{ xs: 2, sm: 3, md: 4, lg: 5 }}>
                      <Grid item xs={12} sm={12} md={6} lg={6} sx={{ pr: { md: 6, lg: 8 } }}>
                        <Autocomplete
                          options={allProjects}
                          getOptionLabel={option => `${option.project_code} - ${option.project_name}`}
                          value={allProjects.find(p => p.project_code === formData.projectCode) || null}
                          onChange={handleProjectCodeChange}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Project Code"
                              required
                              variant="filled"
                              error={false}
                              helperText="Select project code"
                              sx={{
                                bgcolor: 'primary.lighter',
                                borderRadius: 2,
                                mb: 1,
                                '& .MuiFilledInput-root': {
                                  bgcolor: '#e3f2fd',
                                }
                              }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={12} md={6} lg={6} sx={{ pl: { md: 6, lg: 8 } }}>
                        <TextField
                          fullWidth
                          label="Project Name"
                          value={formData.projectName}
                          disabled
                          variant="filled"
                          required
                          sx={{
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            mb: 1
                          }}
                          helperText="Auto-filled from project code"
                        />
                      </Grid>
                      <Grid item xs={12} sm={12} md={6} lg={6} sx={{ pr: { md: 6, lg: 8 } }}>
                        <TextField
                          fullWidth
                          label="Site Location"
                          value={siteLocation}
                          onChange={e => {
                            // Only allow alphabets for general project
                            if (isGeneralProject) {
                              const value = onlyAlphabets(e.target.value);
                              setSiteLocation(value);
                              setFormData(prev => ({
                                ...prev,
                                site_location: value
                              }));
                            }
                          }}
                          disabled={!isGeneralProject}
                          required={isGeneralProject}
                          variant="filled"
                          inputRef={input => {
                            if (input && isGeneralProject) {
                              input.focus();
                            }
                          }}
                          sx={{
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            mb: 1
                          }}
                          InputProps={{
                            readOnly: !isGeneralProject,
                            sx: {
                              bgcolor: isGeneralProject ? 'background.paper' : '#f5f5f5'
                            }
                          }}
                          helperText={isGeneralProject ?
                            "Enter site location for general project" :
                            "Auto-filled from project code"}
                          inputProps={{ pattern: isGeneralProject ? '[a-zA-Z]*' : undefined }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={12} md={6} lg={6} sx={{ pl: { md: 6, lg: 8 } }}>
                        <Autocomplete
                          disabled={!isGeneralProject}
                          options={allEmployees}
                          getOptionLabel={option =>
                            option && (option.emp_code || option.first_name)
                              ? `${option.emp_code} - ${(option.first_name || '') + (option.middle_name ? ' ' + option.middle_name : '') + (option.last_name ? ' ' + option.last_name : '')}`.replace(/\s+/g, ' ').trim()
                              : ''
                          }
                          value={
                            allEmployees.find(emp => emp.emp_code === formData.site_incharge_emp_code) || null
                          }
                          onChange={(e, selected) => {
                            if (isGeneralProject) {
                              setFormData(prev => ({
                                ...prev,
                                site_incharge_emp_code: selected ? selected.emp_code : ''
                              }));
                            }
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Site Incharge / HOD "
                              required={!!formData.projectCode}
                              variant="filled"
                              sx={{
                                bgcolor: 'background.paper',
                                borderRadius: 2,
                                mb: 1,
                                '& .MuiInputBase-root': {
                                  bgcolor: !!formData.projectCode ? 'background.paper' : '#f5f5f5'
                                }
                              }}
                              helperText={
                                formData.site_incharge_emp_code
                                  ? `Selected: ${formData.site_incharge_emp_code} - ${
                                      (allEmployees.find(emp => emp.emp_code === formData.site_incharge_emp_code)?.first_name || '') +
                                      (allEmployees.find(emp => emp.emp_code === formData.site_incharge_emp_code)?.middle_name ? ' ' + allEmployees.find(emp => emp.emp_code === formData.site_incharge_emp_code)?.middle_name : '') +
                                      (allEmployees.find(emp => emp.emp_code === formData.site_incharge_emp_code)?.last_name ? ' ' + allEmployees.find(emp => emp.emp_code === formData.site_incharge_emp_code)?.last_name : '')
                                    }`
                                  : "Search by name or code"
                              }
                              InputProps={{
                                ...params.InputProps,
                                readOnly: !isGeneralProject,
                              }}
                            />
                          )}
                          isOptionEqualToValue={(option, value) => option.emp_code === value.emp_code}
                        />
                      </Grid>
                    </Grid>
                  </FormSection>
                )}

                {activeTab === 1 && (
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
                      DA (Daily Allowance)
                    </Typography>
                    <Paper elevation={4} sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 4, mb: 2, background: 'linear-gradient(90deg, #e3f2fd 60%, #f1f8e9 100%)', boxShadow: '0 8px 32px rgba(25,118,210,0.08)', width: '100%', maxWidth: { xs: '100%', md: 1500 }, mx: 'auto' }}>
                      <Box sx={{
                        overflowX: 'auto',
                        whiteSpace: 'nowrap',
                        mb: 2,
                        '@media (max-width:900px)': {
                          overflowX: 'auto',
                          whiteSpace: 'nowrap',
                          WebkitOverflowScrolling: 'touch',
                          msOverflowStyle: 'auto',
                          scrollbarWidth: 'thin',
                        }
                      }}>
                        <Tabs
                          value={allowanceTab}
                          onChange={(e, v) => setAllowanceTab(v)}
                          variant="scrollable"
                          scrollButtons="auto"
                          allowScrollButtonsMobile
                          sx={{
                            mb: 3,
                            px: 2,
                            '& .MuiTabs-flexContainer': {
                              justifyContent: 'space-evenly', // Equal gaps left/right
                            },
                            '& .MuiTab-root': {
                              fontSize: '1.1rem',
                              fontWeight: 600,
                              bgcolor: '#e3f2fd',
                              borderRadius: 2,
                              height: 56,
                            },
                          }}
                        >
                          <Tab label="Journey Details" />
                          <Tab label="Return Details" />
                          <Tab label="Stay Details" />
                          <Tab label="Allowance Scope Total" />
                        </Tabs>
 

                      </Box>
                      {allowanceTab === 0 && (
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, boxShadow: '0 2px 8px #e3f2fd', mb: 3 }}>
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'primary.dark', display: 'flex', alignItems: 'center', gap: 1 }}>
                              <FlightIcon color="primary" sx={{ mr: 1 }} /> Journey Details
                            </Typography>
                            {journeyAllowance.map((row, idx) => (
                              <Paper
                                key={idx}
                                elevation={3}
                                sx={{
                                  p: 2,
                                  mb: 2,
                                  borderRadius: 3,
                                  background: '#f7fbff',
                                  boxShadow: '0 2px 8px #e3f2fd',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 2
                                }}
                              >
                                <Grid container spacing={2} alignItems="center" sx={{ flex: 1 }}>
                                  <Grid item xs={12} sm={6} md={3}>
                                    <TextField
                                      label="From Date"
                                      type="date"
                                      value={row.from_date ? formatDate(row.from_date) : ''}
                                      onChange={e => handleChangeDate(idx, 'from_date', e.target.value)}
                                      InputLabelProps={{ shrink: true }}
                                      inputProps={{ max: new Date().toISOString().split('T')[0] }}
                                      fullWidth
                                      size="small"
                                      variant="filled"
                                      sx={{ bgcolor: '#e3f2fd', borderRadius: 2, boxShadow: '0 1px 4px rgba(25,118,210,0.08)', mb: 1 }}
                                    />
                                  </Grid>
                                  <Grid item xs={12} sm={6} md={3}>
                                    <TextField
                                      label="To Date"
                                      type="date"
                                      value={row.to_date ? formatDate(row.to_date) : ''}
                                      onChange={e => handleChangeDate(idx, 'to_date', e.target.value)}
                                      InputLabelProps={{ shrink: true }}
                                      inputProps={{ max: new Date().toISOString().split('T')[0] }}
                                      fullWidth
                                      size="small"
                                      variant="filled"
                                      sx={{ bgcolor: '#e3f2fd', borderRadius: 2, boxShadow: '0 1px 4px rgba(25,118,210,0.08)', mb: 1 }}
                                    />
                                  </Grid>
                                  <Grid item xs={12} sm={6} md={3}>
                                    <TextField
                                      select
                                      label="Scope"
                                      value={row.scope}
                                      onChange={e => {
                                        const updated = [...journeyAllowance];
                                        updated[idx].scope = e.target.value;
                                        setJourneyAllowance(updated);
                                      }}
                                      fullWidth
                                      size="small"
                                      variant="filled"
                                      sx={{ bgcolor: '#e3f2fd', borderRadius: 2, boxShadow: '0 1px 4px rgba(25,118,210,0.08)', mb: 1 }}
                                    >
                                      {ALLOWANCE_SCOPES.map(opt => (
                                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                      ))}
                                    </TextField>
                                  </Grid>
                                  <Grid item xs={12} sm={6} md={3}>
                                    <TextField
                                      label="No. of Days"
                                      value={row.no_of_days || calcDays(row.from_date, row.to_date)}
                                      InputProps={{ readOnly: true }}
                                      fullWidth
                                      size="small"
                                      variant="filled"
                                      sx={{ bgcolor: '#e3f2fd', borderRadius: 2, boxShadow: '0 1px 4px rgba(25,118,210,0.08)', mb: 1 }}
                                    />
                                  </Grid>
                                </Grid>
                                <Tooltip title="Delete Row">
                                  <IconButton
                                    color="error"
                                    sx={{ ml: 1 }}
                                    onClick={() => setJourneyAllowance(journeyAllowance.filter((_, i) => i !== idx))}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </Paper>
                            ))}
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => setJourneyAllowance([...journeyAllowance, { from_date: '', to_date: '', scope: '', no_of_days: 0, amount: '' }])}
                              sx={{ mt: 2, borderRadius: 2 }}
                              startIcon={<AddIcon />}
                            >
                              Add Journey Row
                            </Button>
                          </Box>
                        </Box>
                      )}
                      {allowanceTab === 1 && (
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, boxShadow: '0 2px 8px #e3f2fd', mb: 3 }}>
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'primary.dark', display: 'flex', alignItems: 'center', gap: 1 }}>
                              <FlightIcon color="primary" sx={{ mr: 1 }} /> Return Details
                            </Typography>
                            {returnAllowance.map((row, idx) => (
                              <Paper
                                key={idx}
                                elevation={3}
                                sx={{
                                  p: 2,
                                  mb: 2,
                                  borderRadius: 3,
                                  background: '#f7fbff',
                                  boxShadow: '0 2px 8px #e3f2fd',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 2
                                }}
                              >
                                <Grid container spacing={2} alignItems="center" sx={{ flex: 1 }}>
                                  <Grid item xs={12} sm={6} md={3}>
                                    <TextField
                                      label="From Date"
                                      type="date"
                                      value={row.from_date ? formatDate(row.from_date) : ''}
                                      onChange={e => {
                                        const updated = [...returnAllowance];
                                        updated[idx].from_date = e.target.value;
                                        updated[idx].no_of_days = calcDays(updated[idx].from_date, updated[idx].to_date);
                                        setReturnAllowance(updated);
                                      }}
                                      InputLabelProps={{ shrink: true }}
                                      inputProps={{ max: new Date().toISOString().split('T')[0] }}
                                      fullWidth
                                      size="small"
                                      variant="filled"
                                      sx={{ bgcolor: '#e3f2fd', borderRadius: 2, boxShadow: '0 1px 4px rgba(25,118,210,0.08)', mb: 1 }}
                                    />
                                  </Grid>
                                  <Grid item xs={12} sm={6} md={3}>
                                    <TextField
                                      label="To Date"
                                      type="date"
                                      value={row.to_date ? formatDate(row.to_date) : ''}
                                      onChange={e => {
                                        const updated = [...returnAllowance];
                                        updated[idx].to_date = e.target.value;
                                        updated[idx].no_of_days = calcDays(updated[idx].from_date, updated[idx].to_date);
                                        setReturnAllowance(updated);
                                      }}
                                      InputLabelProps={{ shrink: true }}
                                      inputProps={{ max: new Date().toISOString().split('T')[0] }}
                                      fullWidth
                                      size="small"
                                      variant="filled"
                                      sx={{ bgcolor: '#e3f2fd', borderRadius: 2, boxShadow: '0 1px 4px rgba(25,118,210,0.08)', mb: 1 }}
                                    />
                                  </Grid>
                                  <Grid item xs={12} sm={6} md={3}>
                                    <TextField
                                      select
                                      label="Scope"
                                      value={row.scope}
                                      onChange={e => {
                                        const updated = [...returnAllowance];
                                        updated[idx].scope = e.target.value;
                                        setReturnAllowance(updated);
                                      }}
                                      fullWidth
                                      size="small"
                                      variant="filled"
                                      sx={{ bgcolor: '#e3f2fd', borderRadius: 2, boxShadow: '0 1px 4px rgba(25,118,210,0.08)', mb: 1 }}
                                    >
                                      {ALLOWANCE_SCOPES.map(opt => (
                                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                      ))}
                                    </TextField>
                                  </Grid>
                                  <Grid item xs={12} sm={6} md={3}>
                                    <TextField
                                      label="No. of Days"
                                      value={row.no_of_days || calcDays(row.from_date, row.to_date)}
                                      InputProps={{ readOnly: true }}
                                      fullWidth
                                      size="small"
                                      variant="filled"
                                      sx={{ bgcolor: '#e3f2fd', borderRadius: 2, boxShadow: '0 1px 4px rgba(25,118,210,0.08)', mb: 1 }}
                                    />
                                  </Grid>
                                </Grid>
                                <Tooltip title="Delete Row">
                                  <IconButton
                                    color="error"
                                    sx={{ ml: 1 }}
                                    onClick={() => setReturnAllowance(returnAllowance.filter((_, i) => i !== idx))}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </Paper>
                            ))}
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => setReturnAllowance([...returnAllowance, { from_date: '', to_date: '', scope: '', no_of_days: 0, amount: '' }])}
                              sx={{ mt: 2, borderRadius: 2 }}
                              startIcon={<AddIcon />}
                            >
                              Add Return Row
                            </Button>
                          </Box>
                        </Box>
                      )}
                      {allowanceTab === 2 && (
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, boxShadow: '0 2px 8px #e3f2fd', mb: 3 }}>
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'primary.dark', display: 'flex', alignItems: 'center', gap: 1 }}>
                              <HotelIcon color="primary" sx={{ mr: 1 }} /> Stay Details
                            </Typography>
                            {stayAllowance.map((row, idx) => (
                              <Paper
                                key={idx}
                                elevation={3}
                                sx={{
                                  p: 2,
                                  mb: 2,
                                  borderRadius: 3,
                                  background: '#f7fbff',
                                  boxShadow: '0 2px 8px #e3f2fd',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 2
                                }}
                              >
                                <Grid container spacing={2} alignItems="center" sx={{ flex: 1 }}>
                                  <Grid item xs={12} sm={6} md={3}>
                                    <TextField
                                      label="From Date"
                                      type="date"
                                      value={row.from_date ? formatDate(row.from_date) : ''}
                                      onChange={e => {
                                        const updated = [...stayAllowance];
                                        updated[idx].from_date = e.target.value;
                                        updated[idx].no_of_days = calcDays(updated[idx].from_date, updated[idx].to_date);
                                        setStayAllowance(updated);
                                      }}
                                      InputLabelProps={{ shrink: true }}
                                      inputProps={{ max: new Date().toISOString().split('T')[0] }}
                                      fullWidth
                                      size="small"
                                      variant="filled"
                                      sx={{ bgcolor: '#e3f2fd', borderRadius: 2, boxShadow: '0 1px 4px rgba(25,118,210,0.08)', mb: 1 }}
                                    />
                                  </Grid>
                                  <Grid item xs={12} sm={6} md={3}>
                                    <TextField
                                      label="To Date"
                                      type="date"
                                      value={row.to_date ? formatDate(row.to_date) : ''}
                                      onChange={e => {
                                        const updated = [...stayAllowance];
                                        updated[idx].to_date = e.target.value;
                                        updated[idx].no_of_days = calcDays(updated[idx].from_date, updated[idx].to_date);
                                        setStayAllowance(updated);
                                      }}
                                      InputLabelProps={{ shrink: true }}
                                      inputProps={{ max: new Date().toISOString().split('T')[0] }}
                                      fullWidth
                                      size="small"
                                      variant="filled"
                                      sx={{ bgcolor: '#e3f2fd', borderRadius: 2, boxShadow: '0 1px 4px rgba(25,118,210,0.08)', mb: 1 }}
                                    />
                                  </Grid>
                                  <Grid item xs={12} sm={6} md={3}>
                                    <TextField
                                      select
                                      label="Scope"
                                      value={row.scope}
                                      onChange={e => {
                                        const updated = [...stayAllowance];
                                        updated[idx].scope = e.target.value;
                                        setStayAllowance(updated);
                                      }}
                                      fullWidth
                                      size="small"
                                      variant="filled"
                                      sx={{ bgcolor: '#e3f2fd', borderRadius: 2, boxShadow: '0 1px 4px rgba(25,118,210,0.08)', mb: 1 }}
                                    >
                                      {ALLOWANCE_SCOPES.map(opt => (
                                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                      ))}
                                    </TextField>
                                  </Grid>
                                  <Grid item xs={12} sm={6} md={3}>
                                    <TextField
                                      label="No. of Days"
                                      value={row.no_of_days || calcDays(row.from_date, row.to_date)}
                                      InputProps={{ readOnly: true }}
                                      fullWidth
                                      size="small"
                                      variant="filled"
                                      sx={{ bgcolor: '#e3f2fd', borderRadius: 2, boxShadow: '0 1px 4px rgba(25,118,210,0.08)', mb: 1 }}
                                    />
                                  </Grid>
                                </Grid>
                                <Tooltip title="Delete Row">
                                  <IconButton
                                    color="error"
                                    sx={{ ml: 1 }}
                                    onClick={() => setStayAllowance(stayAllowance.filter((_, i) => i !== idx))}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </Paper>
                            ))}
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => setStayAllowance([...stayAllowance, { from_date: '', to_date: '', scope: '', no_of_days: 0, amount: '' }])}
                              sx={{ mt: 2, borderRadius: 2 }}
                              startIcon={<AddIcon />}
                            >
                              Add Stay Row
                            </Button>
                          </Box>
                        </Box>
                      )}
                      {allowanceTab === 3 && (
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ p: 2, bgcolor: '#f1f8e9', borderRadius: 2, boxShadow: '0 2px 8px #e3f2fd', mb: 3 }}>
                            <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 700, color: 'primary.dark', fontSize: '1.15rem' }}>
                              Allowance Scope Total
                            </Typography>
                            <TableContainer component={Paper} elevation={2} sx={{ mb: 4, borderRadius: 3, background: '#fff', overflowX: 'auto', minWidth: 0 }}>
                              <Table size="small" sx={{ minWidth: 600 }}>
                                <TableHead>
                                  <TableRow sx={{ bgcolor: '#e3f2fd' }}>
                                    <TableCell sx={{ minWidth: 180, fontWeight: 700, fontSize: '1rem' }}>Scope</TableCell>
                                    <TableCell sx={{ minWidth: 180, fontWeight: 700, fontSize: '1rem' }}>Total Days (All Types)</TableCell>
                                    <TableCell sx={{ minWidth: 180, fontWeight: 700, fontSize: '1rem' }}>Amount per Day</TableCell>
                                    <TableCell sx={{ minWidth: 180, fontWeight: 700, fontSize: '1rem' }}>Total Amount</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {Object.entries(getScopeTotals()).map(([scope, data]) => (
                                    <TableRow key={scope}>
                                      <TableCell sx={{ fontWeight: 600, fontSize: '1.05rem', color: 'primary.main' }}>
                                        {scope}
                                      </TableCell>
                                      <TableCell sx={{ fontWeight: 500, fontSize: '1.05rem' }}>{data.totalDays}</TableCell>
                                      <TableCell>
                                        <TextField
                                          type="number"
                                          label="Amount per Day"
                                          value={scopeAmounts[scope]}
                                          onChange={e => setScopeAmounts(prev => ({
                                            ...prev,
                                            [scope]: e.target.value
                                          }))}
                                          helperText={allowanceRates[scope] ? `Estimated Rate: ₹${allowanceRates[scope]}` : ''}
                                          sx={{ width: 120, fontSize: '1.05rem', maxWidth: '100%', '& .MuiFormHelperText-root': { color: 'success.main', fontWeight: 500 } }}
                                          InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment>, style: { overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' } }}
                                          inputProps={{ style: { overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' } }}
                                        />
                                      </TableCell>
                                      <TableCell sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#388e3c' }}>
                                        ₹{(parseFloat(scopeAmounts[scope] || 0) * data.totalDays).toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Box>
                        </Box>
                      )}
                    </Paper>
                  </Box>
                )}

                {activeTab === 2 && (
                  <Box>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mb: 3 
                    }}>
                      <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
                        Travel Details
                      </Typography>
                      <Button
                        startIcon={<AddIcon />}
                        onClick={addTravelEntry}
                        variant="contained"
                        size="small"
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.25)',
                          '&:hover': {
                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.35)'
                          }
                        }}
                      >
                        Add Travel Entry
                      </Button>
                    </Box>

                    <TravelTableContainer
                      sx={{
                        width: '100%',
                        maxWidth: { xs: '100%', md: 1500 },
                        mx: 'auto',
                        overflowX: { xs: 'auto', md: 'visible' },
                        minWidth: 0
                      }}
                    >
                      <Table
                        size="small"
                        sx={{
                          backgroundColor: 'background.paper',
                          borderRadius: 2,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                          width: '100%',
                          minWidth: { xs: 900, md: '100%' },
                          tableLayout: 'fixed'
                        }}
                      >
                        <TableHead>
                          <TableRow>
                            <TableCell width="5%">#</TableCell>
                            <TableCell width="20%">Date</TableCell>
                            <TableCell width="20%">From</TableCell>
                            <TableCell width="20%">To</TableCell>
                            <TableCell width="15%">Mode</TableCell>
                            <TableCell width="15%">Amount</TableCell>
                            <TableCell width="5%">Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {formData.travelData.length > 0 && formData.travelData.map((travel, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {index + 1}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <TextField
                                  required
                                  fullWidth
                                  label="Travel Date"
                                  name="travel_date"
                                  type="date"
                                  value={travel.travelDate ? formatDate(travel.travelDate) : ''}
                                  onChange={(e) => handleTravelDataChange(index, 'travelDate', e.target.value)}
                                  variant="outlined"
                                  InputLabelProps={{ shrink: true }}
                                  inputProps={{ max: new Date().toISOString().split('T')[0] }}
                                  size="small"
                                  sx={{ bgcolor: 'background.default', height: 44, borderRadius: 2, mb: 0 }}
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  size="small"
                                  fullWidth
                                  value={travel.fromLocation}
                                  onChange={(e) => handleTravelDataChange(index, 'fromLocation', onlyAlphabets(e.target.value))}
                                  required
                                  placeholder="From"
                                  sx={{ bgcolor: 'background.default', height: 44, borderRadius: 2, mb: 0 }}
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  size="small"
                                  fullWidth
                                  value={travel.toLocation}
                                  onChange={(e) => handleTravelDataChange(index, 'toLocation', onlyAlphabets(e.target.value))}
                                  required
                                  placeholder="To"
                                  sx={{ bgcolor: 'background.default', height: 44, borderRadius: 2, mb: 0 }}
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  select
                                  size="small"
                                  fullWidth
                                  value={travel.modeOfTransport}
                                  onChange={(e) => handleTravelDataChange(index, 'modeOfTransport', e.target.value)}
                                  required
                                  sx={{ bgcolor: 'background.default', height: 44, borderRadius: 2, mb: 0 }}
                                >
                                  {['Bus', 'Train', 'Flight', 'Taxi/Cab','Bike','Car', 'Auto', 'SED Provided', 'Other'].map(mode => (
                                    <MenuItem key={mode} value={mode}>{mode}</MenuItem>
                                  ))}
                                </TextField>
                              </TableCell>
                              <TableCell>
                                <TextField
                                  size="small"
                                  fullWidth
                                  type="number"
                                  value={
                                    travelAmountFocusedIndex === index
                                      ? (travel.fareAmount === '0' ? '' : travel.fareAmount)
                                      : (travel.fareAmount || '0')
                                  }
                                  onFocus={() => setTravelAmountFocusedIndex(index)}
                                  onBlur={e => {
                                    setTravelAmountFocusedIndex(null);
                                    setFormData(prev => {
                                      const newTravelData = [...prev.travelData];
                                      newTravelData[index].fareAmount = e.target.value === '' ? '0' : e.target.value;
                                      return { ...prev, travelData: newTravelData };
                                    });
                                  }}
                                  onChange={e => {
                                    let val = e.target.value;
                                    // Remove leading zeros unless it's just "0"
                                    if (val.length > 1 && val.startsWith('0')) val = val.replace(/^0+/, '');
                                    setFormData(prev => {
                                      const newTravelData = [...prev.travelData];
                                      // If user types/backspaces to empty, keep it empty (not "0")
                                      newTravelData[index].fareAmount = val === '' ? '' : val;
                                      return { ...prev, travelData: newTravelData };
                                    });
                                  }}
                                  required
                                  InputProps={{
                                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                    style: { overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }
                                  }}
                                  sx={{ bgcolor: 'background.default', height: 44, borderRadius: 2, mb: 0 }}
                                  disabled={travel.modeOfTransport === 'SED Provided'}
                                  inputProps={{ min: 0, style: { overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' } }}
                                />
                              </TableCell>
                              <TableCell>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => removeTravelEntry(index)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TravelTableContainer>
                  </Box>
                )}

                {activeTab === 3 && (
                  <Box>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mb: 3 
                    }}>
                      <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
                        Food Expense
                      </Typography>
                      <Button
                        startIcon={<AddIcon />}
                        onClick={addFoodExpense}
                        variant="contained"
                        size="small"
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          background: 'linear-gradient(45deg, #43a047 30%, #66bb6a 90%)',
                          boxShadow: '0 2px 8px rgba(67, 160, 71, 0.18)',
                          '&:hover': {
                            boxShadow: '0 4px 12px rgba(67, 160, 71, 0.28)'
                          }
                        }}
                      >
                        Add Food Entry
                      </Button>
                    </Box>
                    <TravelTableContainer
                      sx={{
                        width: '100%',
                        maxWidth: { xs: '100%', md: 1500 },
                        mx: 'auto',
                        overflowX: { xs: 'auto', md: 'visible' },
                        minWidth: 0
                      }}
                    >
                      <Table
                        size="small"
                        sx={{
                          backgroundColor: 'background.paper',
                          borderRadius: 2,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                          width: '100%',
                          minWidth: { xs: 900, md: '100%' },
                          tableLayout: 'fixed'
                        }}
                      >
                        <TableHead>
                          <TableRow>
                            <TableCell width="16%">From Date</TableCell>
                            <TableCell width="16%">To Date</TableCell>
                            <TableCell width="16%">Sharing</TableCell>
                            <TableCell width="24%">Location</TableCell>
                            <TableCell width="20%">Bill Amount</TableCell>
                            <TableCell width="8%">Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {foodExpenses.length > 0 && foodExpenses.map((row, idx) => (
                            <TableRow key={idx}>
                              <TableCell>
                                <TextField
                                  label="From Date"
                                  type="date"
                                  value={row.fromDate ? formatDate(row.fromDate) : ''}
                                  onChange={e => handleFoodChange(idx, 'fromDate', e.target.value)}
                                  InputLabelProps={{ shrink: true }}
                                  inputProps={{ max: new Date().toISOString().split('T')[0] }}
                                  fullWidth
                                  size="small"
                                  variant="filled"
                                  sx={{
                                    bgcolor: 'background.default',
                                    height: 44,
                                    borderRadius: 2,
                                    mb: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    '& .MuiInputBase-root': { height: 44, minHeight: 44, alignItems: 'center' },
                                    '& .MuiSelect-select': { height: 44, minHeight: 44, display: 'flex', alignItems: 'center' },
                                    '& input': { height: 44, minHeight: 44, display: 'flex', alignItems: 'center' }
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  label="To Date"
                                  type="date"
                                  value={row.toDate ? formatDate(row.toDate) : ''}
                                  onChange={e => handleFoodChange(idx, 'toDate', e.target.value)}
                                  InputLabelProps={{ shrink: true }}
                                  inputProps={{ max: new Date().toISOString().split('T')[0] }}
                                  fullWidth
                                  size="small"
                                  variant="filled"
                                  sx={{
                                    bgcolor: 'background.default',
                                    height: 44,
                                    borderRadius: 2,
                                    mb: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    '& .MuiInputBase-root': { height: 44, minHeight: 44, alignItems: 'center' },
                                    '& .MuiSelect-select': { height: 44, minHeight: 44, display: 'flex', alignItems: 'center' },
                                    '& input': { height: 44, minHeight: 44, display: 'flex', alignItems: 'center' }
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  select
                                  label="Sharing"
                                  value={row.sharing}
                                  onChange={e => handleFoodChange(idx, 'sharing', e.target.value)}
                                  fullWidth
                                  size="small"
                                  sx={{
                                    bgcolor: 'background.default',
                                    height: 44,
                                    borderRadius: 2,
                                    mb: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    '& .MuiInputBase-root': { height: 44, minHeight: 44, alignItems: 'center' },
                                    '& .MuiSelect-select': { height: 44, minHeight: 44, display: 'flex', alignItems: 'center' },
                                    '& input': { height: 44, minHeight: 44, display: 'flex', alignItems: 'center' }
                                  }}
                                >
                                  {FOOD_SHARING_OPTIONS.map(opt => (
                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                  ))}
                                </TextField>
                              </TableCell>
                              <TableCell>
                                <TextField
                                  label="Location"
                                  value={row.location}
                                  onChange={e => handleFoodChange(idx, 'location', onlyAlphabets(e.target.value))}
                                  fullWidth
                                  required
                                  variant="outlined"
                                  autoComplete="new-password"
                                  inputProps={{ tabIndex: 0 }}
                                  onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
                                  InputLabelProps={{ shrink: true }}
                                  sx={{
                                    bgcolor: 'background.default',
                                    height: 44,
                                    borderRadius: 2,
                                    mb: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    '& .MuiInputBase-root': { height: 44, minHeight: 44, alignItems: 'center' },
                                    '& .MuiSelect-select': { height: 44, minHeight: 44, display: 'flex', alignItems: 'center' },
                                    '& input': { height: 44, minHeight: 44, display: 'flex', alignItems: 'center' }
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  label="Bill Amount"
                                  type="number"
                                  value={row.billAmount === '0' ? '' : row.billAmount}
                                  onFocus={e => { if (row.billAmount === '0') handleFoodChange(idx, 'billAmount', ''); }}
                                  onBlur={e => { if (e.target.value === '') handleFoodChange(idx, 'billAmount', '0'); }}
                                  onChange={e => {
                                    let val = e.target.value;
                                    if (val.length > 1 && val.startsWith('0')) val = val.replace(/^0+/, '');
                                    handleFoodChange(idx, 'billAmount', val === '' ? '' : val);
                                  }}
                                  fullWidth
                                  required
                                  variant="outlined"
                                  autoComplete="new-password"
                                  inputProps={{ min: 0, step: '0.01', tabIndex: 0, style: { overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' } }}
                                  onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
                                  InputProps={{
                                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                    style: { overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }
                                  }}
                                  InputLabelProps={{ shrink: true }}
                                  sx={{
                                    bgcolor: 'background.default',
                                    height: 44,
                                    borderRadius: 2,
                                    mb: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    '& .MuiInputBase-root': { height: 44, minHeight: 44, alignItems: 'center' },
                                    '& .MuiSelect-select': { height: 44, minHeight: 44, display: 'flex', alignItems: 'center' },
                                    '& input': { height: 44, minHeight: 44, display: 'flex', alignItems: 'center' }
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <IconButton onClick={() => removeFoodExpense(idx)}>
                                  <DeleteIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TravelTableContainer>
                  </Box>
                )}

                {activeTab === 4 && (
                  <Box>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mb: 3 
                    }}>
                      <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
                        Hotel Expense
                      </Typography>
                      <Button
                        startIcon={<AddIcon />}
                        onClick={addHotelExpense}
                        variant="contained"
                        size="small"
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          background: 'linear-gradient(45deg, #0288d1 30%, #4fc3f7 90%)',
                          boxShadow: '0 2px 8px rgba(2, 136, 209, 0.18)',
                          '&:hover': {
                            boxShadow: '0 4px 12px rgba(2, 136, 209, 0.28)'
                          }
                        }}
                      >
                        Add Hotel Entry
                      </Button>
                    </Box>
                    <TravelTableContainer
                      sx={{
                        width: '100%',
                        maxWidth: { xs: '100%', md: 1500 },
                        mx: 'auto',
                        overflowX: { xs: 'auto', md: 'visible' },
                        minWidth: 0
                      }}
                    >
                      <Table
                        size="small"
                        sx={{
                          backgroundColor: 'background.paper',
                          borderRadius: 2,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                          width: '100%',
                          minWidth: { xs: 900, md: '100%' },
                          tableLayout: 'fixed'
                        }}
                      >
                        <TableHead>
                          <TableRow>
                            <TableCell width="16%">From Date</TableCell>
                            <TableCell width="16%">To Date</TableCell>
                            <TableCell width="16%">Sharing</TableCell>
                            <TableCell width="24%">Location</TableCell>
                            <TableCell width="20%">Bill Amount</TableCell>
                            <TableCell width="8%">Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {hotelExpenses.length > 0 && hotelExpenses.map((row, idx) => (
                            <TableRow key={idx}>
                              <TableCell>
                                <TextField
                                  label="From Date"
                                  type="date"
                                  value={row.fromDate ? formatDate(row.fromDate) : ''}
                                  onChange={e => handleHotelChange(idx, 'fromDate', e.target.value)}
                                  InputLabelProps={{ shrink: true }}
                                  inputProps={{ max: new Date().toISOString().split('T')[0] }}
                                  fullWidth
                                  size="small"
                                  variant="filled"
                                  sx={{
                                    bgcolor: 'background.default',
                                    height: 44,
                                    borderRadius: 2,
                                    mb: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    '& .MuiInputBase-root': { height: 44, minHeight: 44, alignItems: 'center' },
                                    '& .MuiSelect-select': { height: 44, minHeight: 44, display: 'flex', alignItems: 'center' },
                                    '& input': { height: 44, minHeight: 44, display: 'flex', alignItems: 'center' }
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  label="To Date"
                                  type="date"
                                  value={row.toDate ? formatDate(row.toDate) : ''}
                                  onChange={e => handleHotelChange(idx, 'toDate', e.target.value)}
                                  InputLabelProps={{ shrink: true }}
                                  inputProps={{ max: new Date().toISOString().split('T')[0] }}
                                  fullWidth
                                  size="small"
                                  variant="filled"
                                  sx={{
                                    bgcolor: 'background.default',
                                    height: 44,
                                    borderRadius: 2,
                                    mb: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    '& .MuiInputBase-root': { height: 44, minHeight: 44, alignItems: 'center' },
                                    '& .MuiSelect-select': { height: 44, minHeight: 44, display: 'flex', alignItems: 'center' },
                                    '& input': { height: 44, minHeight: 44, display: 'flex', alignItems: 'center' }
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  select
                                  label="Sharing"
                                  value={row.sharing}
                                  onChange={e => handleHotelChange(idx, 'sharing', e.target.value)}
                                  fullWidth
                                  size="small"
                                  sx={{
                                    bgcolor: 'background.default',
                                    height: 44,
                                    borderRadius: 2,
                                    mb: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    '& .MuiInputBase-root': { height: 44, minHeight: 44, alignItems: 'center' },
                                    '& .MuiSelect-select': { height: 44, minHeight: 44, display: 'flex', alignItems: 'center' },
                                    '& input': { height: 44, minHeight: 44, display: 'flex', alignItems: 'center' }
                                  }}
                                >
                                  {HOTEL_SHARING_OPTIONS.map(opt => (
                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                  ))}
                                </TextField>
                              </TableCell>
                              <TableCell>
                                <TextField
                                  label="Location"
                                  value={row.location}
                                  onChange={e => handleHotelChange(idx, 'location', onlyAlphabets(e.target.value))}
                                  fullWidth
                                  required
                                  variant="outlined"
                                  autoComplete="new-password"
                                  inputProps={{ tabIndex: 0 }}
                                  onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
                                  InputLabelProps={{ shrink: true }}
                                  sx={{
                                    bgcolor: 'background.default',
                                    height: 44,
                                    borderRadius: 2,
                                    mb: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    '& .MuiInputBase-root': { height: 44, minHeight: 44, alignItems: 'center' },
                                    '& .MuiSelect-select': { height: 44, minHeight: 44, display: 'flex', alignItems: 'center' },
                                    '& input': { height: 44, minHeight: 44, display: 'flex', alignItems: 'center' }
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  label="Bill Amount"
                                  type="number"
                                  value={row.billAmount === '0' ? '' : row.billAmount}
                                  onFocus={e => { if (row.billAmount === '0') handleHotelChange(idx, 'billAmount', ''); }}
                                  onBlur={e => { if (e.target.value === '') handleHotelChange(idx, 'billAmount', '0'); }}
                                  onChange={e => {
                                    let val = e.target.value;
                                    if (val.length > 1 && val.startsWith('0')) val = val.replace(/^0+/, '');
                                    handleHotelChange(idx, 'billAmount', val === '' ? '' : val);
                                  }}
                                  fullWidth
                                  required
                                  variant="outlined"
                                  autoComplete="new-password"
                                  inputProps={{ min: 0, step: '0.01', tabIndex: 0, style: { overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' } }}
                                  onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
                                  InputProps={{
                                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                    style: { overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }
                                  }}
                                  InputLabelProps={{ shrink: true }}
                                  sx={{
                                    bgcolor: 'background.default',
                                    height: 44,
                                    borderRadius: 2,
                                    mb: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    '& .MuiInputBase-root': { height: 44, minHeight: 44, alignItems: 'center' },
                                    '& .MuiSelect-select': { height: 44, minHeight: 44, display: 'flex', alignItems: 'center' },
                                    '& input': { height: 44, minHeight: 44, display: 'flex', alignItems: 'center' }
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <IconButton onClick={() => removeHotelExpense(idx)}>
                                  <DeleteIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TravelTableContainer>
                  </Box>
                )}

                {activeTab === 5 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>Upload Receipts</Typography>
                    <Grid container spacing={2} sx={{ mb: 3, flexWrap: 'wrap' }}>
                      {["travelReceipt", "hotelReceipt"].map((type, idx) => (
                        <Grid item xs={12} sm={6} md={6} key={type} sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {type === "travelReceipt" ? "Travel Receipt" : "Hotel Receipt"}
                          </Typography>
                          {(
                            (type === "travelReceipt" && !receiptFileNames.travelReceipt && !localTravelReceiptPath) ||
                            (type === "hotelReceipt" && !receiptFileNames.hotelReceipt && !localHotelReceiptPath)
                          ) ? (
                            <TextField
                              fullWidth
                              type="file"
                              InputLabelProps={{ shrink: true }}
                              onChange={e => {
                                handleFileUpload(type)(e);
                                if (type === "travelReceipt") setLocalTravelReceiptPath("");
                                if (type === "hotelReceipt") setLocalHotelReceiptPath("");
                              }}
                              required={
                                (type === "travelReceipt" && calculateTotalTravelFare() > 0) ||
                                (type === "hotelReceipt" && hotelExpenses.length > 0)
                              }
                              disabled={
                                (type === "travelReceipt" && calculateTotalTravelFare() === 0) ||
                                (type === "hotelReceipt" && hotelExpenses.length === 0)
                              }
                              helperText={
                                (type === "travelReceipt" && calculateTotalTravelFare() === 0) ? "No travel expenses to upload receipt for" :
                                (type === "hotelReceipt" && hotelExpenses.length === 0) ? "No hotel expenses to upload receipt for" :
                                "Upload " + (type === "travelReceipt" ? "travel" : "hotel") + " receipt"
                              }
                              inputProps={{ style: { fontSize: '1rem' } }}
                              sx={{
                                mb: 2,
                                bgcolor: 'background.paper',
                                borderRadius: 2,
                                '@media (max-width:600px)': {
                                  fontSize: '0.95rem',
                                  mb: 1
                                }
                              }}
                            />
                          ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <CheckCircleIcon color="success" sx={{ fontSize: 28 }} />
                              <Typography variant="body2">
                                {`Selected: ${
                                  type === 'travelReceipt' ? (receiptFileNames.travelReceipt || localTravelReceiptPath || travelReceiptPath) :
                                  (receiptFileNames.hotelReceipt || localHotelReceiptPath)
                                }`}
                              </Typography>
                              <IconButton onClick={() => {
                                handleRemoveReceipt(type);
                                if (type === 'travelReceipt') {
                                  setLocalTravelReceiptPath('');
                                  setReceiptFileNames(prev => ({ ...prev, travelReceipt: '' }));
                                }
                                if (type === 'hotelReceipt') {
                                  setLocalHotelReceiptPath('');
                                  setReceiptFileNames(prev => ({ ...prev, hotelReceipt: '' }));
                                }
                              }} size="small" color="error">
                                <CancelIcon />
                              </IconButton>
                              {/* Show View button for uploaded file (new expense) or backend path (edit mode) - only once */}
                              {(receiptFileNames[type] || (type === 'travelReceipt' ? localTravelReceiptPath : localHotelReceiptPath)) && (
                                <Typography variant="caption" sx={{ ml: 2 }}>
                                  <a
                                    href={(() => {
                                      // For new upload, use object URL
                                      if (formData[type]) {
                                        return URL.createObjectURL(formData[type]);
                                      }
                                      // For edit mode, use backend path
                                      let path = type === 'travelReceipt' ? (localTravelReceiptPath || travelReceiptPath) : localHotelReceiptPath;
                                      if (!path) return '#';
                                      path = path.replace(/\\/g, '/');
                                      if (path.startsWith('http')) return path;
                                      if (path.startsWith('/uploads/')) return `${process.env.REACT_APP_API_URL}${path}`;
                                      if (path.startsWith('uploads/')) return `${process.env.REACT_APP_API_URL}/${path}`;
                                      return `${process.env.REACT_APP_API_URL}/uploads/${path}`;
                                    })()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    View
                                  </a>
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Grid>
                      ))}
                      {/* Food Receipt and Special Approval in one row */}
                      <Grid item xs={12} sm={6} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Food Receipt
                        </Typography>
                        {/* ...existing code for food receipt field... */}
                        {(!receiptFileNames.foodReceipt && !localFoodReceiptPath) ? (
                          <TextField
                            fullWidth
                            type="file"
                            InputLabelProps={{ shrink: true }}
                            onChange={e => {
                              handleFileUpload('foodReceipt')(e);
                              setLocalFoodReceiptPath("");
                            }}
                            required={foodExpenses.length > 0}
                            disabled={foodExpenses.length === 0}
                            helperText={
                              foodExpenses.length === 0 ? "No food expenses to upload receipt for" :
                              "Upload food receipt"
                            }
                            inputProps={{ style: { fontSize: '1rem' } }}
                            sx={{
                              mb: 2,
                              bgcolor: 'background.paper',
                              borderRadius: 2,
                              '@media (max-width:600px)': {
                                fontSize: '0.95rem',
                                mb: 1
                              }
                            }}
                          />
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <CheckCircleIcon color="success" sx={{ fontSize: 28 }} />
                            <Typography variant="body2">
                              {`Selected: ${receiptFileNames.foodReceipt || localFoodReceiptPath}`}
                            </Typography>
                            <IconButton onClick={() => {
                              handleRemoveReceipt('foodReceipt');
                              setLocalFoodReceiptPath('');
                              setReceiptFileNames(prev => ({ ...prev, foodReceipt: '' }));
                            }} size="small" color="error">
                              <CancelIcon />
                            </IconButton>
                            {/* Show View button for uploaded file (new expense) */}
                            {receiptFileNames.foodReceipt && (
                              <Typography variant="caption" sx={{ ml: 2 }}>
                                <a
                                  href={(() => {
                                    // For new upload, use object URL
                                    if (formData.foodReceipt) {
                                      return URL.createObjectURL(formData.foodReceipt);
                                    }
                                    // For edit mode, use backend path
                                    let path = localFoodReceiptPath;
                                    if (!path) return '#';
                                    path = path.replace(/\\/g, '/');
                                    if (path.startsWith('http')) return path;
                                    if (path.startsWith('/uploads/')) return `${process.env.REACT_APP_API_URL}${path}`;
                                    if (path.startsWith('uploads/')) return `${process.env.REACT_APP_API_URL}/${path}`;
                                    return `${process.env.REACT_APP_API_URL}/uploads/${path}`;
                                  })()}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  View
                                </a>
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Grid>
                      <Grid item xs={12} sm={6} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Special Approval
                        </Typography>
                        {/* ...existing code for special approval field... */}
                        {(!specialApprovalFileName && !localSpecialApprovalPath) ? (
                          <>
                            <TextField
                              fullWidth
                              type="file"

                              InputLabelProps={{ shrink: true }}
                              inputProps={{ accept: '.pdf' }}
                              onChange={e => {
                                setSpecialApprovalFile(e.target.files[0]);
                                setSpecialApprovalFileName(e.target.files[0]?.name || '');
                              }}
                              helperText={
                                specialApprovalFileName
                                  ? `Selected: ${specialApprovalFileName}`
                                  : 'Upload special approval document (PDF only)'
                              }
                              sx={{
                                mb: 2,
                                bgcolor: 'background.paper',
                                borderRadius: 2,
                                '@media (max-width:600px)': {
                                  fontSize: '0.95rem',
                                  mb: 1
                                }
                              }}
                            />
                            <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
                              When you have any special approval, then upload it.
                            </Typography>
                          </>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <CheckCircleIcon color="success" sx={{ fontSize: 28 }} />
                            <Typography variant="body2">
                              {`Selected: ${specialApprovalFileName || localSpecialApprovalPath}`}
                            </Typography>
                            <IconButton onClick={() => handleRemoveReceipt('specialApproval')} size="small" color="error">
                              <CancelIcon />
                            </IconButton>
                            {/* Show View button for uploaded special approval file (new expense) */}
                            {specialApprovalFile && (
                              <Typography variant="caption" sx={{ ml: 2 }}>
                                <a
                                  href={URL.createObjectURL(specialApprovalFile)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  View
                                </a>
                              </Typography>
                            )}
                            {/* Show View button for backend path in edit mode */}
                            {!specialApprovalFile && (specialApprovalFileName || localSpecialApprovalPath) && (
                              <Typography variant="caption" sx={{ ml: 2 }}>
                                <a
                                  href={(() => {
                                    let path = localSpecialApprovalPath;
                                    if (!path && specialApprovalFileName) return '#';
                                    if (!path) return '#';
                                    path = path.replace(/\\/g, '/');
                                    if (path.startsWith('http')) return path;
                                    if (path.startsWith('/uploads/')) return `${process.env.REACT_APP_API_URL}${path}`;
                                    if (path.startsWith('uploads/')) return `${process.env.REACT_APP_API_URL}/${path}`;
                                    return `${process.env.REACT_APP_API_URL}/uploads/${path}`;
                                  })()}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  View
                                </a>
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Box>

              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                p: 3, 
                borderTop: 1, 
                borderColor: 'divider',
                bgcolor: alpha('#fff', 0.9),
                backdropFilter: 'blur(8px)'
              }}>
                <Button
                  variant="outlined"
                  disabled={activeTab === 0}
                  onClick={() => setActiveTab(prev => prev - 1)}
                  startIcon={<ArrowBackIcon />}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    '&:not(:disabled)': {
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      '&:hover': {
                        borderColor: 'primary.dark',
                        bgcolor: alpha('#1976d2', 0.04)
                      }
                    }
                  }}
                >
                  Previous
                </Button>

                <Button
                  variant={activeTab === 5 ? "contained" : "outlined"}
                  onClick={() => {
                    if (activeTab === 5) {
                      if (Object.values(tabCompletion).every(Boolean)) {
                        handleSubmit();
                      } else {
                        const incomplete = getIncompleteSections();
                        setValidationError({
                          open: true,
                          message: "Please complete all required sections",
                          severity: 'warning',
                          incomplete
                        });
                      }
                    } else {
                      setActiveTab(prev => prev + 1);
                    }
                  }}
                  endIcon={activeTab === 5 ? <SendIcon /> : <ArrowForwardIcon />}
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    background: activeTab === 5 ? 
                      'linear-gradient(45deg, #1976d2  30%, #2196f3 90%)' : 
                      'transparent',
                    '&:hover': {
                      background: activeTab === 5 ?
                        'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)' :
                        alpha('#1976d2', 0.04)
                    }
                  }}
                >
                  {activeTab === 5 ? 'Submit' : 'Next'}
                </Button>
              </Box>
            </StyledPaper>
          </Box>

          {/* Enhanced Confirmation Dialog */}
          <ConfirmDialog
            open={openConfirm}
            onClose={() => setOpenConfirm(false)}
            TransitionProps={{
              onExited: () => setSubmissionStep(0)
            }}
          >
            <DialogTitle sx={{ pb: 2, textAlign: 'center' }}>
              <Typography variant="h5" color="primary" fontWeight="bold">
                Confirm Submission
             
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography paragraph>
                  Please review your expense claim details before submitting.
                </Typography>
                <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.lighter', borderRadius: 2 }}>
                  <Typography variant="subtitle1" color="primary.dark" gutterBottom>
                    Total Claim Amount: ₹{calculateTotalExpense().toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This action cannot be undone.
                  </Typography>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
              <Button 
                onClick={() => setOpenConfirm(false)}
                variant="outlined"
                color="inherit"
                startIcon={<CancelIcon />}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={() => handleSubmit()} // Remove direct event passing
                startIcon={<SendIcon />}
                sx={{
                  background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)'
                  }
                }}
              >
                Submit Expense
              </Button>
            </DialogActions>
          </ConfirmDialog>

          {/* Enhanced Success Dialog */}
          <SuccessDialog
            open={showSuccess}
            onClose={() => setShowSuccess(false)}
          >
            <Box sx={{ p: 3 }}>
              <CheckCircleIcon sx={{ 
                fontSize: 80, 
                color: 'success.main',
                mb: 2,
                animation: 'bounce 1s ease infinite'
              }} />
              <Typography variant="h5" sx={{ 
                color: 'success.main',
                fontWeight: 'bold',
                mt: 2 
              }}>
                Success!
                       </Typography>
              <Typography sx={{ color: 'text.secondary', mt: 1 }}>
                Your expense claim has been submitted successfully.
              </Typography>
              <Box sx={{ mt: 4 }}>
                <Button
                  fullWidth
                  variant="contained"
                               color="success"
                  onClick={() => setShowSuccess(false)}
                  sx={{ borderRadius: 2 }}
                >
                  Done
                </Button>
              </Box>
            </Box>
          </SuccessDialog>

          {/* Enhanced Loading Backdrop */}
          <Backdrop
            sx={{
              color: '#fff',
              zIndex: theme => theme.zIndex.drawer + 2,
              flexDirection: 'column',
              alignItems: 'center',
              backdropFilter: 'blur(4px)'
            }}
            open={isSubmitting}
          >
            <CircularProgress size={80} thickness={4} />
            <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
              {submissionStep === 1 && 'Preparing your submission...'}
              {submissionStep === 2 && 'Processing expense claim...'}
              {submissionStep === 3 && 'Almost done...'}
            </Typography>
          </Backdrop>

          {/* Validation Error Dialog */}
          <ValidationDialog
            open={validationError.open}
            onClose={() => setValidationError(prev => ({ ...prev, open: false }))}
            incomplete={validationError.incomplete}
            activeTab={activeTab}
            onNavigate={(tabIndex) => setActiveTab(tabIndex)}
            message={validationError.message}
          />

          <style global="true">{`
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
               50% { transform: translateY(-20px); }
            }
          `}</style>
        </LocalizationProvider>
      ) : null
  );
};

export default NewExpense;

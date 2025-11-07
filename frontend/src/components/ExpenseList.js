import React, { useState, useEffect } from 'react';
import { formatDisplayDate } from './NewExpense';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  MenuItem,
  CircularProgress,
  InputAdornment,
  Alert,
  Pagination,
  Snackbar,
  Tabs,
  Tab
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import BusinessIcon from '@mui/icons-material/Business';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import UpdateIcon from '@mui/icons-material/Update';
import ExcelJS from 'exceljs';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import EditIcon from '@mui/icons-material/Edit';
import TimelineIcon from '@mui/icons-material/Timeline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useNavigate } from 'react-router-dom';
import MuiAlert from '@mui/material/Alert';
import Slide from '@mui/material/Slide';
import Lottie from 'react-lottie';
import successAnimation from '../animations/success.json';
import loadingAnimation from '../animations/loading.json';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import CelebrationIcon from '@mui/icons-material/Celebration';
import SendIcon from '@mui/icons-material/Send';
import InfoIcon from '@mui/icons-material/Info';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import GppGoodIcon from '@mui/icons-material/GppGood';
import BlockIcon from '@mui/icons-material/Block';
import WarningIcon from '@mui/icons-material/Warning';
import HotelIcon from '@mui/icons-material/Hotel';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import BadgeIcon from '@mui/icons-material/Badge';
import jsPDF from 'jspdf';

import autoTable from 'jspdf-autotable';

const statusColors = {
  pending: 'default',
  coordinator_approved: 'info',
  coordinator_rejected: 'error',
  hr_approved: 'primary',
  hr_rejected: 'error',
  accounts_approved: 'success',
  accounts_rejected: 'error'
};

// Configure axios
axios.defaults.baseURL = process.env.REACT_APP_API_URL;

// Add this helper function before any other code

// Fix: Always treat travel_date as UTC and display as-is (no timezone shift)
const formatDisplayDateUTC = (date) => {
  if (!date) return '';
  // If already in YYYY-MM-DD, just return as DD/MM/YYYY
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }
  // If Date object, use getFullYear/getMonth/getDate (local, not UTC)
  if (date instanceof Date && !isNaN(date)) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  // Try parsing string as local date
  const d = new Date(date);
  if (!isNaN(d)) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
  return '';
};

// Add styled components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  backgroundImage: 'linear-gradient(45deg, #1976d2, #1565c0)',
  color: theme.palette.common.white,
  fontSize: '0.875rem',
  padding: '12px 16px',
  whiteSpace: 'nowrap',
  fontWeight: 600,
  '&.MuiTableCell-body': {
    fontSize: '0.875rem',
    color: theme.palette.text.primary,
    padding: '8px 16px'
  }
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.primary.lighter,
    cursor: 'pointer',
    '& .MuiTableCell-body': {
      color: theme.palette.primary.main
    }
  },
  transition: 'all 0.2s'
}));

// Enhance the DetailCard styling
const DetailCard = styled(Paper)(({ theme }) => ({
  height: '100%',
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
  },
  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.3)',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(3),
  color: theme.palette.primary.main,
  '& svg': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    padding: theme.spacing(0.5),
    borderRadius: theme.spacing(1),
  },
}));

const getCardStyles = (type) => {
  const styles = {
    total: {
      borderColor: '#1976d2',
      background: 'linear-gradient(120deg, rgba(229, 242, 255, 0.8) 0%, rgba(255, 255, 255, 0.95) 100%)',
      iconBg: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
      color: '#1565c0'
    },
    pending: {
      borderColor: '#ed6c02',
      background: 'linear-gradient(120deg, rgba(255, 244, 229, 0.8) 0%, rgba(255, 255, 255, 0.95) 100%)',
      iconBg: 'linear-gradient(45deg, #ed6c02 30%, #f57c00 90%)',
      color: '#e65100'
    },
    coordinator_approved: {
      borderColor: '#0288d1',
      background: 'linear-gradient(120deg, rgba(227, 242, 253, 0.8) 0%, rgba(255, 255, 255, 0.95) 100%)',
      iconBg: 'linear-gradient(45deg, #0288d1 30%, #03a9f4 90%)',
      color: '#0277bd'
    },
    coordinator_rejected: {
      borderColor: '#d32f2f',
      background: 'linear-gradient(120deg, rgba(255, 235, 238, 0.8) 0%, rgba(255, 255, 255, 0.95) 100%)',
      iconBg: 'linear-gradient(45deg, #d32f2f 30%, #f44336 90%)',
      color: '#c62828'
    },
    hr_approved: {
      borderColor: '#2e7d32',
      background: 'linear-gradient(120deg, rgba(232, 245, 233, 0.8) 0%, rgba(255, 255, 255, 0.95) 100%)',
      iconBg: 'linear-gradient(45deg, #2e7d32 30%, #43a047 90%)',
      color: '#2e7d32'
    },
    hr_rejected: {
      borderColor: '#d32f2f',
      background: 'linear-gradient(120deg, rgba(255, 235, 238, 0.8) 0%, rgba(255, 255, 255, 0.95) 100%)',
      iconBg: 'linear-gradient(45deg, #d32f2f 30%, #f44336 90%)',
      color: '#c62828'
    },
    accounts_approved: {
      borderColor: '#1b5e20',
      background: 'linear-gradient(120deg, rgba(232, 245, 233, 0.8) 0%, rgba(255, 255, 255, 0.95) 100%)',
      iconBg: 'linear-gradient(45deg, #1b5e20 30%, #388e3c 90%)',
      color: '#1b5e20'
    },
    accounts_rejected: {
      borderColor: '#d32f2f',
      background: 'linear-gradient(120deg, rgba(255, 235, 238, 0.8) 0%, rgba(255, 255, 255, 0.95) 100%)',
      iconBg: 'linear-gradient(45deg, #d32f2f 30%, #f44336 90%)',
      color: '#c62828'
    }
  };
  return styles[type] || styles.total;
};

const StatsCard = styled(Paper)(({ theme, status }) => {
  const colors = getCardStyles(status);
  return {
    padding: theme.spacing(3),
    background: colors.background,
    borderRadius: 16,
    backdropFilter: 'blur(10px)',
    border: '2px solid',
    borderColor: colors.borderColor,
    boxShadow: `inset 0 0 12px ${alpha(colors.borderColor, 0.1)}, 0 4px 20px rgba(0, 0, 0, 0.05)`,
    position: 'relative',
    overflow: 'hidden',
    minHeight: '120px',
    transition: 'all 0.3s ease',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '4px',
      background: colors.iconBg,
      boxShadow: `0 0 8px ${colors.borderColor}`
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: '30%',
      height: '4px',
      background: colors.iconBg,
      opacity: 0.5
    },
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: `inset 0 0 20px ${alpha(colors.borderColor, 0.2)}, 0 12px 40px rgba(0, 0, 0, 0.08)`,
      borderWidth: '3px',
      '& .MuiSvgIcon-root': {
        transform: 'scale(1.1)'
      }
    },
    '& .MuiSvgIcon-root': {
      fontSize: '2rem',
      background: colors.iconBg,
      padding: '8px',
      borderRadius: '12px',
      color: 'white',
      boxShadow: `0 4px 12px ${alpha(colors.borderColor, 0.4)}`,
      marginBottom: 2,
      transition: 'transform 0.3s ease'
    },
    '& .MuiTypography-h4': {
      fontSize: '2rem',
      fontWeight: 700,
      color: colors.color,
      marginBottom: theme.spacing(1),
      textShadow: `0 2px 4px ${alpha(colors.borderColor, 0.1)}`,
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    '& .MuiTypography-subtitle2': {
      fontSize: '0.875rem',
      color: alpha(colors.color, 0.85),
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }
  };
});

const NotificationDialog = ({ open, onClose, type, message }) => {
  const successOptions = {
    loop: false,
    autoplay: true,
    animationData: successAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  const loadingOptions = {
    loop: true,
    autoplay: true,
    animationData: loadingAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  const getIcon = () => {
    switch(type) {
      case 'success':
        return (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            animation: 'fadeIn 0.5s ease-out'
          }}>
            <TaskAltIcon sx={{ color: 'success.main', fontSize: 28 }} />
            <CelebrationIcon sx={{ color: 'success.main', fontSize: 28 }} />
          </Box>
        );
      case 'loading':
        return <HourglassTopIcon sx={{ color: 'primary.main', fontSize: 28 }} />;
      case 'error':
        return <ErrorOutlineIcon sx={{ color: 'error.main', fontSize: 28 }} />;
      default:
        return <InfoIcon sx={{ color: 'info.main', fontSize: 28 }} />;
    }
  };

  const buttonStyles = {
    mt: 3,
    borderRadius: 3,
    textTransform: 'none',
    minWidth: 150,
    py: 1.5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
    },
    '& .MuiSvgIcon-root': {
      fontSize: '1.5rem'
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 2,
          minWidth: 300,
          maxWidth: 400,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.98) 100%)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          animation: 'slideIn 0.3s ease-out',
          '@keyframes slideIn': {
            from: {
              transform: 'translateY(-20px)',
              opacity: 0
            },
            to: {
              transform: 'translateY(0)',
              opacity: 1
            }
          },
          '@keyframes fadeIn': {
            from: { opacity: 0 },
            to: { opacity: 1 }
          }
        }
      }}
    >
      <Box sx={{ 
        textAlign: 'center', 
        p: 3,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: type === 'success' 
            ? 'linear-gradient(45deg, #4caf50, #81c784)' 
            : type === 'error'
              ? 'linear-gradient(45deg, #f44336, #e57373)'
              : 'linear-gradient(45deg, #2196f3, #64b5f6)',
          borderRadius: '4px 4px 0 0'
        }
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
          mb: 3,
          '& .MuiSvgIcon-root': {
            fontSize: '2.5rem',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
            animation: 'iconPulse 2s infinite'
          },
          '@keyframes iconPulse': {
            '0%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.1)' },
            '100%': { transform: 'scale(1)' }
          }
        }}>
          {getIcon()}
        </Box>
        
        <Lottie
          options={type === 'loading' ? loadingOptions : successOptions}
          height={140}
          width={140}
          style={{ margin: '-10px auto' }}
        />

        <Typography
          variant="h5"
          sx={{
            mt: 2,
            mb: 2,
            color: type === 'success' 
              ? 'success.main' 
              : type === 'error'
                ? 'error.main'
                : 'primary.main',
            fontWeight: 600,
            textAlign: 'center'
          }}
        >
          {type === 'loading' ? 'Processing...' : type === 'error' ? 'Error!' : 'Success!'}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            maxWidth: '300px',
            margin: '0 auto 1.5rem',
            lineHeight: 1.6,
            textAlign: 'center'
          }}
        >
          {message}
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          gap: 2,
          mt: 3 
        }}>
          {type === 'success' && (
            <Button
              variant="contained"
              startIcon={<DoneAllIcon />}
              sx={{
                ...buttonStyles,
                background: 'linear-gradient(45deg, #4caf50, #81c784)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #43a047, #66bb6a)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 15px rgba(76, 175, 80, 0.3)',
                }
              }}
              onClick={onClose}
            >
              Complete
            </Button>
          )}

          {type === 'error' && (
            <Button
              variant="contained"
              color="error"
              startIcon={<CancelIcon />}
              sx={{
                ...buttonStyles,
                background: 'linear-gradient(45deg, #f44336, #e57373)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #d32f2f, #f44336)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 15px rgba(244, 67, 54, 0.3)',
                }
              }}
              onClick={onClose}
            >
              Close
            </Button>
          )}
        </Box>
      </Box>
    </Dialog>
  );
};

const exportToExcel = async (data, filterStatus, allEmployees) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Expenses');

  worksheet.columns = [
    { header: 'Expense ID', key: 'expense_id', width: 10 },
    { header: 'Employee Code', key: 'emp_code', width: 15 },
    { header: 'Employee Name', key: 'employee_name', width: 20 },
    { header: 'Department', key: 'department_name', width: 15 },
    { header: 'Designation', key: 'designation_name', width: 15 },
    { header: 'Project Code', key: 'project_code', width: 15 },
    { header: 'Project Name', key: 'project_name', width: 20 },
    { header: 'Site Location', key: 'site_location', width: 20 },
    { header: 'Site Incharge / HOD', key: 'site_incharge_full', width: 32 },
    { header: 'Claim Amount (₹)', key: 'claim_amount', width: 15 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Created Date', key: 'created_at', width: 20 },
    { header: 'Detail Type', key: 'detail_type', width: 18 },
    { header: 'From Date', key: 'from_date', width: 14 },
    { header: 'To Date', key: 'to_date', width: 14 },
    { header: 'Scope/Mode', key: 'scope_mode', width: 18 },
    { header: 'No. of Days', key: 'no_of_days', width: 10 },
    { header: 'Amount (₹)', key: 'amount', width: 14 },
    { header: 'Sharing', key: 'sharing', width: 10 },
    { header: 'Location', key: 'location', width: 20 },
    { header: 'Receipt', key: 'receipt', width: 30 }
  ];

  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '1976D2' }
  };

  // Group data by expense_id
  const grouped = data.reduce((acc, expense) => {
    acc[expense.expense_id] = expense;
    return acc;
  }, {});

  Object.values(grouped).forEach(expense => {
    const siteInchargeFull = expense.site_incharge_emp_code
      ? `${expense.site_incharge_emp_code} - ${getEmployeeNameByCode(expense.site_incharge_emp_code, allEmployees)}`
      : '';
    // Summary row
    worksheet.addRow({
      expense_id: expense.expense_id,
      emp_code: expense.emp_code,
      employee_name: (expense.first_name || expense.middle_name || expense.last_name)
        ? `${expense.first_name || ''}${expense.middle_name ? ' ' + expense.middle_name : ''}${expense.last_name ? ' ' + expense.last_name : ''}`.replace(/\s+/g, ' ').trim()
        : expense.employee_name,
      department_name: expense.department_name,
      designation_name: expense.designation_name,
      project_code: expense.project_code,
      project_name: expense.project_name,
      site_location: expense.site_location || '',
      site_incharge_full: siteInchargeFull,
      claim_amount: parseFloat(expense.claim_amount || 0).toFixed(2),
      status: expense.status?.toUpperCase(),
      created_at: new Date(expense.created_at).toLocaleString(),
      detail_type: '',
      from_date: '',
      to_date: '',
      scope_mode: '',
      no_of_days: '',
      amount: '',
      sharing: '',
      location: '',
      receipt: ''
    });
    // Travel details
    if (Array.isArray(expense.travel_data)) {
      expense.travel_data.forEach(travel => {
        worksheet.addRow({
          expense_id: '',
          emp_code: '',
          employee_name: '',
          department_name: '',
          designation_name: '',
          project_code: '',
          project_name: '',
          site_location: '',
          site_incharge_full: '',
          claim_amount: '',
          status: '',
          created_at: '',
          detail_type: 'Travel',
          from_date: formatDisplayDate(travel.travel_date),
          to_date: '',
          scope_mode: travel.mode_of_transport,
          no_of_days: '',
          amount: travel.fare_amount ? parseFloat(travel.fare_amount).toFixed(2) : '',
          sharing: '',
          location: `${travel.from_location} → ${travel.to_location}`,
          receipt: expense.travel_receipt_path
            ? `${process.env.REACT_APP_API_URL}/${expense.travel_receipt_path.replace(/\\/g, '/')}`
            : ''
        });
      });
    }
    // Allowance details
    function pushAllowanceRows(arr, type) {
      if (Array.isArray(arr)) {
        arr.forEach(a => {
          worksheet.addRow({
            expense_id: '',
            emp_code: '',
            employee_name: '',
            department_name: '',
            designation_name: '',
            project_code: '',
            project_name: '',
            site_location: '',
            site_incharge_full: '',
            claim_amount: '',
            status: '',
            created_at: '',
            detail_type: type,
            from_date: formatDisplayDate(a.from_date),
            to_date: formatDisplayDate(a.to_date),
            scope_mode: a.scope,
            no_of_days: a.no_of_days,
            amount: a.amount,
            sharing: '',
            location: '',
            receipt: ''
          });
        });
      }
    }
    pushAllowanceRows(expense.journey_allowance, 'Journey Allowance');
    pushAllowanceRows(expense.return_allowance, 'Return Allowance');
    pushAllowanceRows(expense.stay_allowance, 'Stay Allowance');
    // Hotel details
    if (Array.isArray(expense.hotel_expenses)) {
      expense.hotel_expenses.forEach(hotel => {
        worksheet.addRow({
          expense_id: '',
          emp_code: '',
          employee_name: '',
          department_name: '',
          designation_name: '',
          project_code: '',
          project_name: '',
          site_location: '',
          site_incharge_full: '',
          claim_amount: '',
          status: '',
          created_at: '',
          detail_type: 'Hotel',
          from_date: formatDisplayDate(hotel.from_date),
          to_date: formatDisplayDate(hotel.to_date),
          scope_mode: '',
          no_of_days: '',
          amount: hotel.bill_amount ? parseFloat(hotel.bill_amount).toFixed(2) : '',
          sharing: hotel.sharing,
          location: hotel.location,
          receipt: expense.hotel_receipt_path
            ? `${process.env.REACT_APP_API_URL}/${expense.hotel_receipt_path.replace(/\\/g, '/')}`
            : ''
        });
      });
    }
    // Food details
    if (Array.isArray(expense.food_expenses)) {
      expense.food_expenses.forEach(food => {
        worksheet.addRow({
          expense_id: '',
          emp_code: '',
          employee_name: '',
          department_name: '',
          designation_name: '',
          project_code: '',
          project_name: '',
          site_location: '',
          site_incharge_full: '',
          claim_amount: '',
          status: '',
          created_at: '',
          detail_type: 'Food',
          from_date: formatDisplayDate(food.from_date),
          to_date: formatDisplayDate(food.to_date),
          scope_mode: '',
          no_of_days: '',
          amount: food.bill_amount ? parseFloat(food.bill_amount).toFixed(2) : '',
          sharing: food.sharing,
          location: food.location,
          receipt: expense.food_receipt_path
            ? `${process.env.REACT_APP_API_URL}/${expense.food_receipt_path.replace(/\\/g, '/')}`
            : ''
        });
      });
    }
    // Special Approval row
    if (expense.special_approval_path) {
      worksheet.addRow({
        expense_id: '',
        emp_code: '',
        employee_name: '',
        department_name: '',
        designation_name: '',
        project_code: '',
        project_name: '',
        site_location: '',
        site_incharge_full: '',
        claim_amount: '',
        status: '',
        created_at: '',
        detail_type: 'Special Approval',
        from_date: '',
        to_date: '',
        scope_mode: '',
        no_of_days: '',
        amount: '',
        sharing: '',
        location: '',
        receipt: `${process.env.REACT_APP_API_URL}/${expense.special_approval_path.replace(/\\/g, '/')}`
      });
    }
    // Calculate totals
    const totalFood = Array.isArray(expense.food_expenses)
      ? expense.food_expenses.reduce((sum, f) => sum + (parseFloat(f.bill_amount) || 0), 0)
      : 0;
    const totalHotel = Array.isArray(expense.hotel_expenses)
      ? expense.hotel_expenses.reduce((sum, h) => sum + (parseFloat(h.bill_amount) || 0), 0)
      : 0;
    const totalTravel = Array.isArray(expense.travel_data)
      ? expense.travel_data.reduce((sum, t) => sum + (parseFloat(t.fare_amount) || 0), 0)
      : 0;
    const totalAllowance = [expense.journey_allowance, expense.return_allowance, expense.stay_allowance]
      .flat()
      .reduce((sum, a) => sum + ((parseFloat(a.amount) || 0) * (parseInt(a.no_of_days, 10) || 0)), 0);
    // Add summary rows for totals
    worksheet.addRow({
      expense_id: '',
      detail_type: 'Food Total',
      amount: totalFood.toFixed(2)
    });
    worksheet.addRow({
      expense_id: '',
      detail_type: 'Hotel Total',
      amount: totalHotel.toFixed(2)
    });
    worksheet.addRow({
      expense_id: '',
      detail_type: 'Travel Total',
      amount: totalTravel.toFixed(2)
    });
    worksheet.addRow({
      expense_id: '',
      detail_type: 'Allowance Total',
      amount: totalAllowance.toFixed(2)
    });
  });

  worksheet.autoFilter = {
    from: 'A1',
    to: worksheet.getRow(1).cellCount > 0 ? worksheet.getRow(1).getCell(worksheet.getRow(1).cellCount)._address : 'Z1'
  };

  const date = new Date().toISOString().split('T')[0];
  const statusText = filterStatus === 'all' ? 'All' : filterStatus.toUpperCase();
  const filename = `Expenses_${statusText}_${date}.xlsx`;

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'coordinator_approved', label: 'Coordinator Approved' },
  { value: 'coordinator_rejected', label: 'Coordinator Rejected' },
  { value: 'hr_approved', label: 'HR Approved' },
  { value: 'hr_rejected', label: 'HR Rejected' },
  { value: 'accounts_approved', label: 'Accounts Approved' },
  { value: 'accounts_rejected', label: 'Accounts Rejected' }
];

const ExportFilterModal = ({ open, onClose, onExport, departments }) => {
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [filterError, setFilterError] = useState('');

  const handleExport = () => {
    // Validation for date range
    if ((dateRange.startDate && !dateRange.endDate) || (!dateRange.startDate && dateRange.endDate)) {
      setFilterError('Please select both start and end dates or leave both empty');
      return;
    }

    if (dateRange.startDate && dateRange.endDate && dateRange.startDate > dateRange.endDate) {
      setFilterError('Start date cannot be after end date');
      return;
    }

    // If month is selected, clear date range
    const exportFilters = {
      dateRange: selectedMonth ? null : dateRange,
      selectedMonth,
      selectedStatus,
      selectedDepartment
    };

    onExport(exportFilters);
    onClose();
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setDateRange({ startDate: null, endDate: null });
      setSelectedMonth('');
      setSelectedStatus('all');
      setSelectedDepartment('all');
      setFilterError('');
    }
  }, [open]);

  const clearFilters = () => {
    setDateRange({ startDate: null, endDate: null });
    setSelectedMonth('');
    setSelectedStatus('all');
    setSelectedDepartment('all');
    setFilterError('');
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth 
      PaperProps={{ 
        elevation: 24,
        sx: {
          borderRadius: 2,
          '& .MuiDialogTitle-root': {
            py: 2,
            px: 3,
            bgcolor: 'primary.main',
            color: 'white'
          }
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <FileDownloadIcon />
        Export Expense Report
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {filterError && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            onClose={() => setFilterError('')}
          >
            {filterError}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Date Range Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2.5, bgcolor: '#f8f9fa' }}>
              <Typography variant="subtitle1" gutterBottom color="primary.main" sx={{ fontWeight: 500, mb: 2 }}>
                Choose one: Date Range OR Month
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Start Date"
                      value={dateRange.startDate}
                      onChange={(date) => {
                        setDateRange({ ...dateRange, startDate: date });
                        setSelectedMonth(''); // Clear month if date is selected
                        setFilterError('');
                      }}
                      disabled={Boolean(selectedMonth)}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          fullWidth 
                          size="small"
                          error={Boolean(filterError && filterError.includes('start'))}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={4}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="End Date"
                      value={dateRange.endDate}
                      onChange={(date) => {
                        setDateRange({ ...dateRange, endDate: date });
                        setSelectedMonth(''); // Clear month if date is selected
                        setFilterError('');
                      }}
                      disabled={Boolean(selectedMonth)}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          fullWidth 
                          size="small"
                          error={Boolean(filterError && filterError.includes('end'))}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Select Month"
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(e.target.value);
                      setDateRange({ startDate: null, endDate: null }); // Clear dates if month is selected
                      setFilterError('');
                    }}
                    disabled={Boolean(dateRange.startDate || dateRange.endDate)}
                  >
                    <MenuItem value="">None</MenuItem>
                    {[...Array(12)].map((_, i) => {
                      const date = new Date(2023, i, 1);
                      return (
                        <MenuItem key={i + 1} value={i + 1}>
                          {date.toLocaleString('default', { month: 'long' })}
                        </MenuItem>
                      );
                    })}
                  </TextField>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Additional Filters Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2.5, bgcolor: '#f8f9fa' }}>
              <Typography variant="subtitle1" gutterBottom color="primary.main" sx={{ fontWeight: 500, mb: 2 }}>
                Additional Filters
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Status"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {option.value !== 'all' && (
                            <Chip
                              size="small"
                              label=""
                              color={statusColors[option.value] || 'default'}
                              sx={{ minWidth: 20 }}
                            />
                          )}
                          {option.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Department"
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                  >
                    <MenuItem value="all">All Departments</MenuItem>
                    {departments?.map((dept) => (
                      <MenuItem key={dept.department_id} value={dept.department_id}>
                        {dept.department_name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <Button 
          onClick={clearFilters}
          startIcon={<FilterListIcon />}
          color="inherit"
        >
          Clear Filters
        </Button>
        <Button 
          onClick={onClose}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleExport}
          variant="contained"
          startIcon={<FileDownloadIcon />}
        >
          Export
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const STATUS_LABELS = {
  pending: 'Pending',
  coordinator_approved: 'Coordinator Approved',
  coordinator_rejected: 'Coordinator Rejected',
  hr_approved: 'HR Approved',
  hr_rejected: 'HR Rejected',
  accounts_approved: 'Accounts Approved',
  accounts_rejected: 'Accounts Rejected'
};

const HistoryTimeline = ({ history }) => {
  // Filter out duplicate resubmitted entries using a Set to track unique timestamps
  const seenResubmissions = new Set();
  const filteredHistory = history?.reduce((acc, current) => {
    if (current.action === 'resubmitted') {
      const timestamp = new Date(current.created_at).getTime();
      if (!seenResubmissions.has(timestamp)) {
        seenResubmissions.add(timestamp);
        acc.push(current);
      } else {
        acc.push(current);
      }
    } else {
      acc.push(current);
    }
    return acc;
  }, []) || [];

  // Sort the filtered history by timestamp
  filteredHistory.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const getStatusIcon = (action) => {
    switch(action) {
      case 'submitted':
        return <SendIcon sx={{ color: 'info.main' }} />;
      case 'coordinator_approved':
        return <ThumbUpAltIcon sx={{ color: 'success.main' }} />;
      case 'coordinator_rejected':
        return <ThumbDownAltIcon sx={{ color: 'error.main' }} />;
      case 'hr_approved':
        return <TaskAltIcon sx={{ color: 'success.main' }} />;
      case 'hr_rejected':
        return <BlockIcon sx={{ color: 'error.main' }} />;
      case 'accounts_approved':
        return <DoneAllIcon sx={{ color: 'success.main' }} />;
      case 'accounts_rejected':
        return <ErrorOutlineIcon sx={{ color: 'error.main' }} />;
      default:
        return <InfoIcon sx={{ color: 'action.active' }} />;
    }
  };

  if (!history || history.length === 0) {
    return (
      <Box sx={{ 
        p: 3,
        textAlign: 'center',
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: '1px dashed',
        borderColor: 'divider',
      }}>
        <InfoIcon sx={{ 
          fontSize: 40,
          color: 'action.disabled',
          mb: 1
        }} />
        <Typography variant="body2" color="text.secondary">
          No history available yet
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        left: 16,
        top: 0,
        bottom: 0,
        width: 2,
        bgcolor: 'divider',
        zIndex: 0
      }
    }}>
      {filteredHistory.map((record, index) => (
        <Box
          key={record.history_id || index}
          sx={{
            display: 'flex',
            gap: 2,
            mb: 2,
            position: 'relative'
          }}
        >
          <Box
            className="timeline-icon"
            sx={{ 
              width: 34,
              height: 34,
              borderRadius: '50%',
              bgcolor: 'background.paper',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid',
              borderColor: record.action.includes('rejected') ? 'error.main' : 
                          record.action.includes('approved') ? 'success.main' : 
                          'primary.main',
              zIndex: 1,
              transition: 'transform 0.2s ease',
              '& svg': {
                fontSize: '1.2rem'
              }
            }}
          >
            {getStatusIcon(record.action)}
          </Box>

          <Box sx={{ flex: 1 }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 0.5
            }}>
              <Typography 
                variant="subtitle2"
                sx={{ 
                  color: record.action.includes('rejected') ? 'error.main' :
                         record.action.includes('approved') ? 'success.main' :
                         'primary.main',
                  fontWeight: 600
                }}
              >
                {record.action.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                <AccessTimeIcon sx={{ fontSize: 12 }} />
                {record.formatted_date}
              </Typography>
            </Box>
            
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: record.comment ? 1 : 0
              }}
            >
              <PersonIcon sx={{ fontSize: 14 }} />
              {(record.first_name || record.middle_name || record.last_name)
                ? `${record.first_name || ''}${record.middle_name ? ' ' + record.middle_name : ''}${record.last_name ? ' ' + record.last_name : ''}`.replace(/\s+/g, ' ').trim()
                : record.actor_name}
              <Chip 
                label={record.actor_role?.toUpperCase()}
                size="small"
                variant="outlined"
                sx={{ 
                  height: 20,
                  '& .MuiChip-label': {
                    px: 1,
                    fontSize: '0.7rem'
                  }
                }}
              />
            </Typography>
            
            {record.comment && (
              <Typography 
                variant="body2"
                sx={{ 
                  color: 'text.secondary',
                  bgcolor: 'background.default',
                  p: 1,
                  borderRadius: 1,
                  borderLeft: '3px solid',
                  borderColor: record.action.includes('rejected') ? 'error.main' :
                             record.action.includes('approved') ? 'success.main' :
                             'primary.main'
                }}
              >
                {record.comment}
              </Typography>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

// Add a new component for expense details dialog
const ExpenseDetailDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(3),
    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.98) 100%)',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.5)',
  },
  '& .MuiDialogTitle-root': {
    padding: theme.spacing(3),
    background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
    color: theme.palette.common.white,
    '& .MuiTypography-root': {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
      fontSize: '1.5rem',
      fontWeight: 600,
    },
  },
  '& .MuiDialogContent-root': {
    padding: theme.spacing(4),
  },
}));

// Add animated chips for status display
const AnimatedStatusChip = styled(Chip)(({ theme }) => ({
  transition: 'all 0.3s ease',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    '&::after': {
      opacity: 1,
    },
  },
}));

// Enhance the table styling
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  border: '1px solid',
  borderColor: theme.palette.divider,
  background: theme.palette.background.paper,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  '& .MuiTable-root': {
    borderCollapse: 'separate',
    borderSpacing: 0,
  },
  '& .MuiTableCell-root': {
    borderBottom: '1px solid',
    borderColor: theme.palette.divider,
  },
}));

const LoadingButton = ({ loading, onClick, children, variant, color, startIcon, ...props }) => (
  <Button
    variant={variant}
    color={color}
    onClick={onClick}
    disabled={loading}
    sx={{
      position: 'relative',
      minWidth: '120px',
      '& .MuiCircularProgress-root': {
        position: 'absolute',
        left: '50%',
        marginLeft: '-12px',
        marginTop: '-12px',
      },
    }}
    {...props}
  >
    {loading ? (
      <>
        <Box sx={{ opacity: 0 }}>{children}</Box>
        <CircularProgress 
          size={24} 
          color="inherit" 
          sx={{ 
            position: 'absolute',
            animation: 'spin 1s linear infinite',
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' }
            }
          }} 
        />
      </>
    ) : (
      <>
        {startIcon}
        {children}
      </>
    )}
  </Button>
);

const ConfirmationDialog = ({ open, onClose, type, onConfirm, loading, userRole }) => {
  const isApprove = type === 'approve';
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 2,
          minWidth: 400,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.98) 100%)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: `2px solid ${isApprove ? '#4caf50' : '#f44336'}`,
          animation: 'confirmScale 0.3s ease-out',
          '@keyframes confirmScale': {
            '0%': { transform: 'scale(0.9)', opacity: 0 },
            '100%': { transform: 'scale(1)', opacity: 1 }
          }
        }
      }}
    >
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Box sx={{ 
          mb: 3,
          display: 'flex',
          justifyContent: 'center',
          gap: 2
        }}>
          {isApprove ? (
            <>
              <GppGoodIcon sx={{ 
                fontSize: 40, 
                color: 'success.main',
                animation: 'iconPop 0.5s ease-out'
              }} />
              <ThumbUpAltIcon sx={{ 
                fontSize: 40, 
                color: 'success.main',
                animation: 'iconPop 0.5s ease-out 0.1s'
              }} />
            </>
          ) : (
            <>
              <BlockIcon sx={{ 
                fontSize: 40, 
                color: 'error.main',
                animation: 'iconPop 0.5s ease-out'
              }} />
              <WarningIcon sx={{ 
                fontSize: 40, 
                color: 'error.main',
                animation: 'iconPop 0.5s ease-out 0.1s'
              }} />
            </>
          )}
        </Box>

        <Typography variant="h5" sx={{ 
          mb: 2,
          color: isApprove ? 'success.main' : 'error.main',
          fontWeight: 600
        }}>
          {isApprove ? 'Confirm Approval' : 'Confirm Rejection'}
        </Typography>

        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          {isApprove 
            ? userRole === 'accounts'
              ? 'Are you sure you want to approve this expense? Now Claim amount will be successfully transferred to Employee Account.'
              : 'Are you sure you want to approve this expense? This will forward it for next level review.'
            : 'Are you sure you want to reject this expense? This cannot be undone.'}
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 2,
          '& .MuiButton-root': {
            minWidth: 120,
            py: 1,
            px: 3
          }
        }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={onClose}
            startIcon={<CancelIcon />}
            disabled={loading}
          >
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            color={isApprove ? 'success' : 'error'}
            onClick={onConfirm}
            loading={loading}
            loadingPosition="start"
            startIcon={isApprove ? <CheckCircleIcon /> : <BlockIcon />}
            sx={{
              minWidth: 150,
              py: 1,
              borderRadius: 2,
              background: isApprove 
                ? 'linear-gradient(45deg, #4caf50, #81c784)'
                : 'linear-gradient(45deg, #f44336, #e57373)',
              '&:hover': {
                background: isApprove 
                  ? 'linear-gradient(45deg, #43a047, #66bb6a)'
                  : 'linear-gradient(45deg, #d32f2f, #f44336)',
                transform: 'translateY(-2px)',
                boxShadow: isApprove 
                  ? '0 6px 15px rgba(76, 175, 80, 0.3)'
                  : '0 6px 15px rgba(244, 67, 54, 0.3)',
              }
            }}
          >
            {isApprove ? 'Approve' : 'Reject'}
          </LoadingButton>
        </Box>
      </Box>
    </Dialog>
  );
};

// Helper to calculate total allowance scope amount for an expense
const calculateTotalAllowanceScopeAmount = (expense) => {
  const sumAllowance = (arr) => Array.isArray(arr)
    ? arr.reduce((sum, row) => {
        const amt = parseFloat(row.amount) || 0;
        const days = parseInt(row.no_of_days, 10) || 0;
        return sum + (amt * days);
      }, 0)
    : 0;
  return (
    sumAllowance(expense.journey_allowance) +
    sumAllowance(expense.return_allowance) +
    sumAllowance(expense.stay_allowance)
  );
};

// Add a helper to get employee name from code (using allEmployees list)
const getEmployeeNameByCode = (code, allEmployees) => {
  const emp = allEmployees?.find(e => e.emp_code === code);
  if (!emp) return '';
  // Compose full name with spaces, handle missing middle name
  return [emp.first_name, emp.middle_name, emp.last_name].filter(Boolean).join(' ');
};

const ExpenseList = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [comment, setComment] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMode, setFilterMode] = useState('all'); // 'own' or 'all'
  const [filterEmpCode, setFilterEmpCode] = useState('');
  const [openExportModal, setOpenExportModal] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(6); // Changed from 8 to 6
  const [expenseHistory, setExpenseHistory] = useState([]);
  const [commentError, setCommentError] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
    transition: Slide
  });
  const [notificationDialog, setNotificationDialog] = useState({
    open: false,
    type: 'loading',
    message: ''
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: null
  });
  const [filterMonthYear, setFilterMonthYear] = useState('');

  // Fetch all employees for mapping code to name
  const [allEmployees, setAllEmployees] = useState([]);
  useEffect(() => {
    axios.get('/api/employees/all', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setAllEmployees(res.data || []))
      .catch(() => setAllEmployees([]));
  }, [token]);

  // Configure axios headers whenever token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchExpenses();
      fetchDepartments();
      // Remove auto-refresh interval to prevent flicker
      // If you want manual refresh, add a button to call fetchExpenses()
    }
  }, [token]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/expenses');
      const sortedExpenses = (response.data || []).sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      setExpenses(sortedExpenses);
    } catch (error) {
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/employees/departments');
      setDepartments(response.data);
    } catch (error) {
      // Handle error silently
    }
  };

  const handleViewExpense = async (expense) => {
    setOpenDialog(true);
    setLoading(true);
    try {
      // Always fetch full expense details from backend to get allowance_rates
      const response = await axios.get(`/api/expenses/${expense.expense_id}`);
      const expenseDetail = response.data;
      setSelectedExpense(expenseDetail);

      // Fetch history as before
      const historyRes = await axios.get(`/api/expenses/${expense.expense_id}/history`);
      setExpenseHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
    } catch (error) {
      setSelectedExpense(expense); // fallback to list data
      setExpenseHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity,
      transition: Slide
    });
  };

  const handleReview = async (expenseId, action) => {
    if (!comment.trim()) {
      setCommentError(true);
      handleNotification('Please add a comment before reviewing', 'error');
      return;
    }
    setCommentError(false);
    setConfirmDialog({ open: true, type: action });
  };

  const handleConfirmReview = async () => {
    const action = confirmDialog.type;
    setConfirmDialog({ open: false, type: null });
    
    // Show loading dialog
    setNotificationDialog({
      open: true,
      type: 'loading',
      message: `${action === 'approve' ? 'Approving' : 'Rejecting'} expense...`
    });

    try {
      const actionText = action === 'approve' ? 'approved' : 'rejected';
      const response = await axios.post(`/api/expenses/${selectedExpense.expense_id}/review`, {
        action,
        comment: comment.trim()
      });

      if (response.status === 200) {
        // Show success dialog
        setNotificationDialog({
          open: true,
          type: 'success',
          message: `Expense ${actionText} successfully! ${
            action === 'approve'
              ? 'The expense has been forwarded for next level review.'
              : 'The employee will be notified.'
          }`
        });
        setComment('');
        setOpenDialog(false);
        await fetchExpenses();
      }
    } catch (error) {
      setNotificationDialog({
        open: true,
        type: 'error',
        message: error.response?.data?.message || 'Error processing your review. Please try again.'
      });
    }
  };

  // Update canReviewExpense logic to restrict self-approval for coordinators if department does not match assignment
  const canReviewExpense = (expense) => {
    if (!user || !expense) return false;
    if (user.role === 'admin') return false;
  
    // Self-approval for coordinator of their own department only if assignment matches
    if (user.role === 'coordinator' && user.emp_id === expense.emp_id) {
      // Check if user is mapped as coordinator for their department
      if (expense.department_id && Array.isArray(expense.coordinators)) {
        const isSelfCoordinator = expense.coordinators.some(c => c.emp_id === user.emp_id && expense.department_id === c.department_id);
        return isSelfCoordinator && expense.status === 'pending';
      }
      return false;
    }
  
    switch (expense.status) {
      case 'pending':
        return user.role === 'coordinator' && user.emp_id !== expense.emp_id;
      case 'coordinator_approved':
        return user.role === 'hr';
      case 'hr_approved':
        return user.role === 'accounts';
      default:
        return false;
    }
  };
  
  // Disable comment box if cannot review
  const isReviewDisabled = (expense) => {
    return !canReviewExpense(expense);
  };

  const canEditExpense = (expense) => {
    if (!user || !expense) return false;
    return user.emp_id === expense.emp_id && 
           (expense.status.includes('rejected'));
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      pending: 'PENDING',
      coordinator_approved: 'COORDINATOR APPROVED',
      coordinator_rejected: 'COORDINATOR REJECTED',
      hr_approved: 'HR APPROVED',
      hr_rejected: 'HR REJECTED',
      accounts_approved: 'ACCOUNTS APPROVED',
      accounts_rejected: 'ACCOUNTS REJECTED'
    };
    return statusMap[status || 'pending'] || 'PENDING';
  };

  const handleExportWithFilters = (filters) => {
    const filteredData = expenses.filter(expense => {
      const expenseDate = new Date(expense.created_at);
      let includeExpense = true;
  
      // Date range filter
      if (filters.dateRange && filters.dateRange.startDate && filters.dateRange.endDate) {
        const startDate = new Date(filters.dateRange.startDate);
        const endDate = new Date(filters.dateRange.endDate);
        if (expenseDate < startDate || expenseDate > endDate) {
          includeExpense = false;
        }
      }
  
      // Month filter
      if (filters.selectedMonth) {
        if (expenseDate.getMonth() + 1 !== parseInt(filters.selectedMonth)) {
          includeExpense = false;
        }
      }
  
      // Status filter
      if (filters.selectedStatus !== 'all' && expense.status !== filters.selectedStatus) {
        includeExpense = false;
      }
  
      // Department filter
      if (filters.selectedDepartment && filters.selectedDepartment !== 'all') {
        if (String(expense.department_id) !== String(filters.selectedDepartment)) {
          includeExpense = false;
        }
      }
  
      return includeExpense;
    });
  
    exportToExcel(filteredData, filters.selectedStatus, allEmployees);
  };

  // Use displayedExpenses for export as well
  const handleExportClick = () => {
    // Use displayedExpenses instead of filteredExpenses
    exportToExcel(displayedExpenses, 'Expenses');
  };

  const filteredExpenses = expenses.filter(expense => {
    const searchValue = searchTerm.toLowerCase().trim();
    const empCodeValue = filterEmpCode.trim().toLowerCase();
    
    // Search through all relevant fields
    const searchableFields = [
      expense.emp_code,
      expense.employee_name,
      expense.project_name,
      expense.project_code,
      expense.department_name,
      expense.designation_name,
    ];

    const matchesSearch = !searchValue || searchableFields.some(field => 
      field && field.toString().toLowerCase().includes(searchValue)
    );

    const matchesStatus = filterStatus === 'all' || expense.status === filterStatus;

    // Month/Year filter
    let matchesMonthYear = true;
    if (filterMonthYear) {
      if (!expense.created_at) return false;
      const d = new Date(expense.created_at);
      if (isNaN(d)) return false;
      const monthYear = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      matchesMonthYear = monthYear === filterMonthYear;
    }

    // If filterMode is 'own', only show logged-in user's expenses
    if (filterMode === 'own') {
      return (
        expense.emp_code === user?.emp_code &&
        matchesSearch &&
        matchesStatus &&
        matchesMonthYear
      );
    }

    // If filterMode is 'all', use employee code filter as before
    const matchesEmpCode = !empCodeValue || (expense.emp_code && expense.emp_code.toLowerCase().includes(empCodeValue));
    return matchesSearch && matchesStatus && matchesEmpCode && matchesMonthYear;
  });

  // Define displayedExpenses at the top of the component, after filteredExpenses is defined
  const displayedExpenses = filterMode === 'own'
    ? filteredExpenses.filter(e => e.emp_id === user?.emp_id)
    : filteredExpenses;

  const paginatedExpenses = filteredExpenses.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  // Add this helper function before any other code
const formatCreatedDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d)) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${day}:${month}:${year} ${hours}:${minutes}:${seconds}`;
};

  // PDF export function (multi-page support)
  const handleDownloadPDF = async () => {
    const dialogContent = document.querySelector('.expense-detail-dialog-content');
    if (!dialogContent) return;
    // Temporarily expand modal to show all content for PDF
    dialogContent.style.overflow = 'visible';
    dialogContent.style.maxHeight = 'none';
    dialogContent.scrollTop = 0;
    await new Promise(resolve => setTimeout(resolve, 200));
    const pdf = new jsPDF('p', 'mm', 'a4');
    let y = 10;

    // Helper to add a section header
    const addSectionHeader = (title) => {
      pdf.setFontSize(16);
      pdf.setTextColor(33, 150, 243);
      pdf.text(title, 10, y);
      y += 10;
    };

    // Helper to add a table using autoTable
    const addTable = (columns, rows) => {
      autoTable(pdf, {
        startY: y,
        head: [columns],
        body: rows,
        theme: 'grid',
        headStyles: { fillColor: [33, 150, 243], textColor: 255 },
        margin: { left: 10, right: 10 },
        styles: { fontSize: 10 },
        didDrawPage: (data) => { y = data.cursor.y + 10; }
      });
    };

    // Basic Information
    addSectionHeader('Basic Information');
    addTable(
      ['Field', 'Value'],
      [
        ['Employee Code', selectedExpense.emp_code],
        ['Employee Name', selectedExpense.first_name || selectedExpense.middle_name || selectedExpense.last_name
          ? `${selectedExpense.first_name || ''} ${selectedExpense.middle_name || ''} ${selectedExpense.last_name || ''}`.trim()
          : selectedExpense.employee_name],
        ['Department', selectedExpense.department_name],
        ['Designation', selectedExpense.designation_name]
      ]
    );

    // Project Information
    addSectionHeader('Project Information');
    addTable(
      ['Field', 'Value'],
      [
        ['Project Code', selectedExpense.project_code],
        ['Project Name', selectedExpense.project_name],
        ['Site Location', selectedExpense.site_location || 'N/A'],
        ['Site Incharge / HOD', selectedExpense.site_incharge_emp_code
          ? `${selectedExpense.site_incharge_emp_code} - ${getEmployeeNameByCode(selectedExpense.site_incharge_emp_code, allEmployees)}`
          : 'N/A']
      ]
    );

    // Actual DA (Daily Allowance) - All Tabs
    if (selectedExpense.journey_allowance?.length > 0) {
      addSectionHeader('Actual DA (Daily Allowance) - Journey Details');
      addTable(
        ['Scope', 'From Date', 'To Date', 'No. of Days', 'Amount/Day (Rs)', 'Total Amount (Rs)'],
        selectedExpense.journey_allowance.map(row => [
          row.scope,
          formatDisplayDate(row.from_date),
          formatDisplayDate(row.to_date),
          row.no_of_days,
          `Rs ${parseFloat(row.amount).toFixed(2)}`,
          `Rs ${(parseFloat(row.amount) * row.no_of_days).toFixed(2)}`
        ])
      );
    }
    if (selectedExpense.return_allowance?.length > 0) {
      addSectionHeader('Actual DA (Daily Allowance) - Return Details');
      addTable(
        ['Scope', 'From Date', 'To Date', 'No. of Days', 'Amount/Day (Rs)', 'Total Amount (Rs)'],
        selectedExpense.return_allowance.map(row => [
          row.scope,
          formatDisplayDate(row.from_date),
          formatDisplayDate(row.to_date),
          row.no_of_days,
          `Rs ${parseFloat(row.amount).toFixed(2)}`,
          `Rs ${(parseFloat(row.amount) * row.no_of_days).toFixed(2)}`
        ])
      );
    }
    if (selectedExpense.stay_allowance?.length > 0) {
      addSectionHeader('Actual DA (Daily Allowance) - Stay Details');
      addTable(
        ['Scope', 'From Date', 'To Date', 'No. of Days', 'Amount/Day (Rs)', 'Total Amount (Rs)'],
        selectedExpense.stay_allowance.map(row => [
          row.scope,
          formatDisplayDate(row.from_date),
          formatDisplayDate(row.to_date),
          row.no_of_days,
          `Rs ${parseFloat(row.amount).toFixed(2)}`,
          `Rs ${(parseFloat(row.amount) * row.no_of_days).toFixed(2)}`
        ])
      );
    }
    const scopeTotals = getScopeTotals(selectedExpense);
    if (Object.keys(scopeTotals).length > 0) {
      addSectionHeader('Actual DA (Daily Allowance) - Scope Totals');
      addTable(
        ['Scope', 'Total Days (All Types)', 'Amount per Day (Rs)', 'Estimated Rate (Rs)', 'Total Amount (Rs)'],
        Object.entries(scopeTotals).map(([scope, data]) => [
          scope,
          data.totalDays,
          `Rs ${parseFloat(data.amountPerDay || 0).toFixed(2)}`,
          `Rs ${getEstimatedRate(scope, selectedExpense.allowance_rates).replace('₹', '')}`,
          `Rs ${(parseFloat(data.amountPerDay || 0) * data.totalDays).toFixed(2)}`
        ])
      );
    }

    // Travel Details
    if (selectedExpense.travel_data?.length > 0) {
      addSectionHeader('Travel Details');
      addTable(
        ['Date', 'From Location', 'To Location', 'Mode of Transport', 'Fare Amount (Rs)'],
        selectedExpense.travel_data.map(travel => [
          formatDisplayDateUTC(travel.travel_date),
          travel.from_location || 'N/A',
          travel.to_location || 'N/A',
          travel.mode_of_transport || 'N/A',
          `Rs ${parseFloat(travel.fare_amount || 0).toFixed(2)}`
        ])
      );
    }

    // Food Expenses
    if (selectedExpense.food_expenses?.length > 0) {
      addSectionHeader('Food Expenses');
      addTable(
        ['From Date', 'To Date', 'Sharing', 'Location', 'Bill Amount (Rs)'],
        selectedExpense.food_expenses.map(food => [
          formatDisplayDate(food.from_date),
          formatDisplayDate(food.to_date),
          food.sharing,
          food.location,
          `Rs ${parseFloat(food.bill_amount || 0).toFixed(2)}`
        ])
      );
    }

    // Hotel Expenses
    if (selectedExpense.hotel_expenses?.length > 0) {
      addSectionHeader('Hotel Expenses');
      addTable(
        ['From Date', 'To Date', 'Sharing', 'Location', 'Bill Amount (Rs)'],
        selectedExpense.hotel_expenses.map(hotel => [
          formatDisplayDate(hotel.from_date),
          formatDisplayDate(hotel.to_date),
          hotel.sharing,
          hotel.location,
          `Rs ${parseFloat(hotel.bill_amount || 0).toFixed(2)}`
        ])
      );
    }

    // Estimated DA (Daily Allowance)
    // if (selectedExpense.allowance_rates && selectedExpense.allowance_rates.length > 0) {
    //   addSectionHeader('Estimated DA (Daily Allowance)');
    //   addTable(
    //     ['Scope', 'Estimated Rate (Rs)', 'Total Days', 'Estimated Amount (Rs)'],
    //     selectedExpense.allowance_rates.map(rate => {
    //       const totalDays = selectedExpense.allowance_scope_totals?.[rate.scope] || 0;
    //       return [
    //         rate.scope,
    //         `Rs ${parseFloat(rate.amount).toFixed(2)}`,
    //         totalDays,
    //         `Rs ${(parseFloat(rate.amount) * totalDays).toFixed(2)}`
    //       ];
    //     })
    //   );
    //   // Total Estimated DA (Daily Allowance)
    //   pdf.setFontSize(12);
    //   pdf.setTextColor(0, 0, 0);
    //   const totalEstimated = selectedExpense.allowance_rates.reduce((sum, rate) => {
    //     const totalDays = selectedExpense.allowance_scope_totals?.[rate.scope] || 0;
    //     return sum + (parseFloat(rate.amount) * totalDays);
    //   }, 0);
    //   pdf.text(`Total Estimated DA (Daily Allowance): Rs ${totalEstimated.toFixed(2)}`, 10, y); y += 10;
    // }

    // Expense Summary
    addSectionHeader('Expense Summary');
    addTable(
      ['Type', 'Amount (Rs)'],
      [
        ['Total Actual DA (Daily Allowance)', `Rs ${calculateTotalAllowanceScopeAmount(selectedExpense).toFixed(2)}`],
        ['Total Travel Fare', `Rs ${selectedExpense.travel_data ? selectedExpense.travel_data.reduce((sum, travel) => sum + parseFloat(travel.fare_amount || 0), 0).toFixed(2) : parseFloat(selectedExpense.total_travel_fare || 0).toFixed(2)}`],
        ['Total Food Amount', `Rs ${selectedExpense.food_expenses ? selectedExpense.food_expenses.reduce((sum, f) => sum + parseFloat(f.bill_amount || 0), 0).toFixed(2) : '0.00'}`],
        ['Total Hotel Amount', `Rs ${selectedExpense.hotel_expenses ? selectedExpense.hotel_expenses.reduce((sum, h) => sum + parseFloat(h.bill_amount || 0), 0).toFixed(2) : '0.00'}`],
        ['Claim Amount', `Rs ${parseFloat(selectedExpense.claim_amount || 0).toFixed(2)}`]
      ]
    );

    // Uploaded Receipts
    addSectionHeader('Uploaded Receipts');
    const receiptRows = [];
    if (selectedExpense.travel_receipt_path) receiptRows.push(['Travel Receipt', `${process.env.REACT_APP_API_URL}/${selectedExpense.travel_receipt_path.replace(/\\/g, '/')}`]);
    if (selectedExpense.hotel_receipt_path) receiptRows.push(['Hotel Receipt', `${process.env.REACT_APP_API_URL}/${selectedExpense.hotel_receipt_path.replace(/\\/g, '/')}`]);
    if (selectedExpense.food_receipt_path) receiptRows.push(['Food Receipt', `${process.env.REACT_APP_API_URL}/${selectedExpense.food_receipt_path.replace(/\\/g, '/')}`]);
    if (selectedExpense.special_approval_path) receiptRows.push(['Special Approval', `${process.env.REACT_APP_API_URL}/${selectedExpense.special_approval_path.replace(/\\/g, '/')}`]);
    if (receiptRows.length > 0) {
      addTable(['Type', 'Receipt Link'], receiptRows);
    }

    // Status History
    if (expenseHistory && expenseHistory.length > 0) {
      addSectionHeader('Status History');
      addTable(
        ['Action', 'Date', 'Actor', 'Role', 'Comment'],
        expenseHistory.map(record => [
          record.action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          record.formatted_date,
          (record.first_name || record.middle_name || record.last_name)
            ? `${record.first_name || ''}${record.middle_name ? ' ' + record.middle_name : ''}${record.last_name ? ' ' + record.last_name : ''}`.replace(/\s+/g, ' ').trim()
            : record.actor_name,
          record.actor_role?.toUpperCase(),
          record.comment || ''
        ])
      );
    }

    // Compose PDF filename with claim amount, emp code, emp name, created date
    const pdfFileName = `Expense_${selectedExpense.emp_code}_${selectedExpense.first_name || selectedExpense.middle_name || selectedExpense.last_name
      ? `${selectedExpense.first_name || ''}${selectedExpense.middle_name ? ' ' + selectedExpense.middle_name : ''}${selectedExpense.last_name ? ' ' + selectedExpense.last_name : ''}`.replace(/\s+/g, ' ').trim()
      : selectedExpense.employee_name}_${parseFloat(selectedExpense.claim_amount || 0).toFixed(2)}_${formatCreatedDate(selectedExpense.created_at).replace(/[: ]/g, '-')}.pdf`;
    pdf.save(pdfFileName);
    setOpenDialog(false);
  };

  // Add missing state for allowanceTab and setAllowanceTab
  const [allowanceTab, setAllowanceTab] = useState(0);

  // Add missing helper functions getScopeTotals and getEstimatedRate
  const getScopeTotals = (expense) => {
    const scopes = {};
    const addDays = (arr) => {
      arr.forEach(row => {
        if (!row.scope) return;
        if (!scopes[row.scope]) scopes[row.scope] = { totalDays: 0, amountPerDay: 0 };
        scopes[row.scope].totalDays += Number(row.no_of_days) || 0;
        scopes[row.scope].amountPerDay = parseFloat(row.amount) || 0;
      });
    };
    addDays(expense.journey_allowance || []);
    addDays(expense.return_allowance || []);
    addDays(expense.stay_allowance || []);
    return scopes;
  };

  const getEstimatedRate = (scope, allowanceRates) => {
    if (!Array.isArray(allowanceRates)) return '-';
    const found = allowanceRates.find(r => r.scope === scope);
    return found ? parseFloat(found.amount).toFixed(2) : '-';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          {/* Calculate totals before rendering */}
          {(() => {
            // Add a derived variable for the currently displayed expenses (filtered by mode)
            const displayedExpenses = filterMode === 'own' ? filteredExpenses.filter(e => e.emp_id === user?.emp_id) : filteredExpenses;

            const totalAmount = displayedExpenses.reduce((sum, exp) => {
              return sum + parseFloat(exp.claim_amount || 0);
            }, 0);

            const pending = displayedExpenses.filter(e => e.status === 'pending');
            const coordinatorApproved = displayedExpenses.filter(e => e.status === 'coordinator_approved');
            const coordinatorRejected = displayedExpenses.filter(e => e.status === 'coordinator_rejected');
            const hrApproved = displayedExpenses.filter(e => e.status === 'hr_approved');
            const hrRejected = displayedExpenses.filter(e => e.status === 'hr_rejected');
            const accountsApproved = displayedExpenses.filter(e => e.status === 'accounts_approved');
            const accountsRejected = displayedExpenses.filter(e => e.status === 'accounts_rejected');

            return (
              <Grid container spacing={2} sx={{ 
                flexWrap: 'nowrap', 
                overflowX: 'auto',
                pb: 1,
                '&::-webkit-scrollbar': {
                  height: '8px',
                  borderRadius: '4px'
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  borderRadius: '4px'
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(25, 118, 210, 0.3)',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.4)'
                  }
                }
              }}>
                {[
                  { 
                    title: "Total Amount", 
                    value: `₹${totalAmount.toFixed(2)}`,
                    status: 'total',
                    isTotal: true  // Add this flag
                  },
                  { title: "Pending", value: pending.length, status: 'pending' },
                  { title: "Coordinator Approved", value: coordinatorApproved.length, status: 'coordinator_approved' },
                  { title: "Coordinator Rejected", value: coordinatorRejected.length, status: 'coordinator_rejected' },
                  { title: "HR Approved", value: hrApproved.length, status: 'hr_approved' },
                  { title: "HR Rejected", value: hrRejected.length, status: 'hr_rejected' },
                  { title: "Accounts Approved", value: accountsApproved.length, status: 'accounts_approved' },
                  { title: "Accounts Rejected", value: accountsRejected.length, status: 'accounts_rejected' }
                ].map((stat, index) => (
                  <Grid item key={index} sx={{ 
                    flex: stat.isTotal ? '0 0 300px' : '0 0 200px',  // Make Total Amount card wider
                    minWidth: stat.isTotal ? '300px' : '200px',
                    maxWidth: stat.isTotal ? '300px' : '200px',
                    '& .MuiTypography-h4': {
                      fontSize: stat.isTotal ? '2.2rem' : '2rem'  // Bigger font for Total Amount
                    }
                  }}>
                    <StatsCard status={stat.status} sx={{ height: '100%' }}>
                      <Typography variant="h4">
                        {stat.value}
                      </Typography>
                      <Typography variant="subtitle2">
                        {stat.title}
                      </Typography>
                    </StatsCard>
                  </Grid>
                ))}
              </Grid>
            );
          })()}
        </Box>

        {/* Enhanced Search and Filter Section */}
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          alignItems: { xs: 'stretch', sm: 'center' },
          flexWrap: 'wrap',
          width: '100%',
          mb: 2
        }}>
          <Box sx={{
            display: 'flex',
            gap: 2,
            width: { xs: '100%', sm: 'auto' },
            flexGrow: 1,
            flexWrap: 'wrap'
          }}>
            {/* Show filter buttons only if user role is not 'user' */}
            {user?.role !== 'user' && (
              <>
                <Button
                  variant={filterMode === 'own' ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => setFilterMode('own')}
                  sx={{ minWidth: 100, width: { xs: '100%', sm: 'auto' } }}
                >
                  My Expenses
                </Button>
                <Button
                  variant={filterMode === 'all' ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => setFilterMode('all')}
                  sx={{ minWidth: 100, width: { xs: '100%', sm: 'auto' } }}
                >
                  All Expenses
                </Button>
              </>
            )}
            <TextField
              placeholder="Search expenses..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                width: { xs: '100%', sm: '250px' },
                flexGrow: { sm: 1 },
                maxWidth: '400px',
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'background.paper'
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              placeholder="Filter by Employee Code"
              variant="outlined"
              size="small"
              value={filterEmpCode}
              onChange={(e) => setFilterEmpCode(e.target.value)}
              sx={{ display: 'none', maxWidth: 180, '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeIcon color="action" />
                  </InputAdornment>
                ),
              }}
              disabled={filterMode === 'own'}
            />
            <TextField
              select
              size="small"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Filter by Status"
              sx={{
                width: { xs: '100%', sm: '180px' },
                '& .MuiSelect-select': {
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }
              }}
              SelectProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterListIcon color="action" />
                  </InputAdornment>
                ),
              }}
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.value !== 'all' && (
                    <Chip
                      size="small"
                      label={option.label}
                      color={statusColors[option.value] || 'default'}
                      sx={{ mr: 1, width: 20, height: 20, '& .MuiChip-label': { p: 0 } }}
                    />
                  )}
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            {/* Created Date (Month/Year) Filter */}
            <TextField
              select
              size="small"
              value={filterMonthYear || ''}
              onChange={e => setFilterMonthYear(e.target.value)}
              label="Filter by Month/Year"
              sx={{ width: { xs: '100%', sm: '200px' } }}
            >
              <MenuItem value="">All Months</MenuItem>
              {Array.from(new Set(expenses.map(exp => {
                if (!exp.created_at) return '';
                const d = new Date(exp.created_at);
                if (isNaN(d)) return '';
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
              })).values())
                .filter(Boolean)
                .sort((a, b) => b.localeCompare(a))
                .map(monthYear => {
                  const [year, month] = monthYear.split('-');
                  const date = new Date(year, month - 1);
                  return (
                    <MenuItem key={monthYear} value={monthYear}>
                      {date.toLocaleString('default', { month: 'long' })} {year}
                    </MenuItem>
                  );
                })}
            </TextField>
          </Box>
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportClick}
            disabled={filteredExpenses.length === 0}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              height: 40,
              minWidth: 180,
              borderRadius: 2,
              background: 'linear-gradient(45deg, #388e3c 30%, #4caf50 90%)',
              color: 'white',
              boxShadow: '0 2px 8px rgba(76, 175, 80, 0.25)',
              '&:hover': {
                background: 'linear-gradient(45deg, #388e3c 30%, #4caf50 90%)',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.35)'
              },
              '&.Mui-disabled': {
                background: '#e0e0e0',
                color: 'rgba(0, 0, 0, 0.26)'
              }
            }}
          >
            Export to Excel
          </Button>
        </Box>

        {/* Enhanced Table Container */}
        <StyledTableContainer>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <StyledTableCell sx={{ width: '8%' }}>Employee Code</StyledTableCell>
                <StyledTableCell sx={{ width: '16%' }}>Employee Name</StyledTableCell>
                <StyledTableCell sx={{ width: '10%' }}>Department</StyledTableCell>
                <StyledTableCell sx={{ width: '8%' }}>Designation</StyledTableCell>
                <StyledTableCell sx={{ width: '10%' }}>Project Code</StyledTableCell>
                <StyledTableCell sx={{ width: '10%' }}>Project Name</StyledTableCell>
                <StyledTableCell sx={{ width: '8%' }}>Site Incharge / HOD</StyledTableCell>
                <StyledTableCell sx={{ width: '10%' }}>Claim Amount (₹)</StyledTableCell>
                <StyledTableCell sx={{ width: '12%' }}>Created Date</StyledTableCell>
                <StyledTableCell sx={{ width: '10%' }}>Status</StyledTableCell>
                <StyledTableCell sx={{ width: '4%' }}>Actions</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={16} sx={{ textAlign: 'center', py: 8 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2, color: 'text.secondary' }}>
                      Loading expenses...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={16} sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                      No expenses found
                    </Typography>
                    <Typography color="text.secondary">
                      Try adjusting your search or filters
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedExpenses.map((expense) => {
                  // Compose full name with middle name if present
                  // Always prefer first_name, middle_name, last_name if present, else fallback to employee_name
                  const fullName = (
                    (expense.first_name || expense.middle_name || expense.last_name)
                      ? [expense.first_name, expense.middle_name, expense.last_name].filter(Boolean).join(' ')
                      : expense.employee_name
                  );

                  return (
                    <StyledTableRow 
                      key={expense.expense_id}
                      onClick={() => handleViewExpense(expense)}
                    >
                      <TableCell>{expense.emp_code}</TableCell>
                      <TableCell sx={{ fontWeight: 'medium', maxWidth: 220, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                        {fullName}
                      </TableCell>
                      <TableCell>{expense.department_name}</TableCell>
                      <TableCell>{expense.designation_name}</TableCell>
                      <TableCell>{expense.project_code}</TableCell>
                      <TableCell>{expense.project_name}</TableCell>
                      <TableCell>{expense.site_incharge_emp_code ? `${expense.site_incharge_emp_code} - ${getEmployeeNameByCode(expense.site_incharge_emp_code, allEmployees)}` : ''}</TableCell>
                      <TableCell>
                        {parseFloat(expense.claim_amount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>{formatCreatedDate(expense.created_at)}</TableCell>
                      <TableCell>{STATUS_LABELS[expense.status] || expense.status}</TableCell>
                      <TableCell>
                        <Tooltip title="View Details" arrow>
                          <IconButton 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewExpense(expense);
                            }}
                            sx={{ 
                              '&:hover': { 
                                color: 'primary.main',
                                bgcolor: 'primary.lighter'
                              }
                            }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </StyledTableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </StyledTableContainer>
        <Box sx={{ 
          mt: 2, 
          display: 'flex', 
          justifyContent: 'center',
          '& .MuiPagination-ul': {
            gap: 1
          }
        }}>
          <Pagination
            count={Math.ceil(filteredExpenses.length / rowsPerPage)}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      </Paper>

      <ExpenseDetailDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 24,
            maxHeight: '90vh',
            bgcolor: '#f8f9fa'
          }
        }}
        TransitionProps={{
          onExited: () => setSelectedExpense(null)
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ReceiptIcon />
            Expense Details
            <AnimatedStatusChip
              label={STATUS_LABELS[selectedExpense?.status] || 'Unknown'}
              color={statusColors[selectedExpense?.status] || 'default'}
              size="small"
              sx={{ ml: 'auto' }}
            />
          </Box>
        </DialogTitle>
        <DialogContent className="expense-detail-dialog-content" sx={{ p: 3 }}>
          {selectedExpense && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                {/* 1. Basic Information */}
                <Grid item xs={12}>
                  <DetailCard elevation={0} sx={{ bgcolor: '#f8f9fa' }}>
                    <SectionTitle variant="h6">
                      <PersonIcon />
                      Basic Information
                    </SectionTitle>
                    <Grid container spacing={3}>
                      {['emp_code', 'employee_name', 'department_name', 'designation_name'].map((field, idx) => (
                        <Grid item xs={12} md={3} key={field}>
                          <Box sx={{
                            bgcolor: 'rgba(227,242,253,0.25)',
                            p: 1.2,
                            borderRadius: 2,
                            minHeight: 80,
                            height: '100%',
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: '0 2px 8px rgba(25,118,210,0.05)',
                            mb: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                          }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              {field === 'emp_code' ? 'Employee Code' :
                              field === 'employee_name' ? 'Employee Name' :
                              field === 'department_name' ? 'Department' :
                              'Designation'}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', wordBreak: 'break-word', whiteSpace: 'normal', fontSize: '1rem' }}>
                              {field === 'employee_name'
                                ? (selectedExpense.first_name || selectedExpense.middle_name || selectedExpense.last_name)
                                  ? `${selectedExpense.first_name || ''}${selectedExpense.middle_name ? ' ' + selectedExpense.middle_name : ''}${selectedExpense.last_name ? ' ' + selectedExpense.last_name : ''}`.replace(/\s+/g, ' ').trim()
                                  : selectedExpense.employee_name
                                : selectedExpense[field]}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </DetailCard>
                </Grid>

                {/* 2. Project Information */}
                <Grid item xs={12}>
                  <DetailCard elevation={0} sx={{ bgcolor: '#f8f9fa' }}>
                    <SectionTitle variant="h6">
                      <BusinessIcon />
                      Project Information
                    </SectionTitle>
                    <Grid container spacing={3} alignItems="center">
                      {['project_code', 'project_name', 'site_location', 'site_incharge_emp_code'].map((field, idx) => (
                        <Grid item xs={12} md={3} key={field}>
                          <Box sx={{
                            bgcolor: 'rgba(227,242,253,0.25)',
                            p: 1.2,
                            borderRadius: 2,
                            minHeight: 80,
                            height: '100%',
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: '0 2px 8px rgba(25,118,210,0.05)',
                            mb: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                          }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              {field === 'project_code' ? 'Project Code' :
                              field === 'project_name' ? 'Project Name' :
                              field === 'site_location' ? 'Site Location' :
                              'Site Incharge / HOD '}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', wordBreak: 'break-word', whiteSpace: 'normal', fontSize: '1rem' }}>
                              {field === 'site_location'
                                ? selectedExpense.site_location && selectedExpense.site_location !== 'null'
                                  ? selectedExpense.site_location
                                  : 'N/A'
                                : field === 'site_incharge_emp_code'
                                  ? selectedExpense.site_incharge_emp_code
                                    ? `${selectedExpense.site_incharge_emp_code} - ${getEmployeeNameByCode(selectedExpense.site_incharge_emp_code, allEmployees)}`
                                    : 'N/A'
                                  : selectedExpense[field]}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </DetailCard>
                </Grid>

                {/* 3.Actual DA (Daily Allowance) */}
                <Grid item xs={12}>
                  <DetailCard elevation={0} sx={{ bgcolor: '#f8f9fa' }}>
                    <SectionTitle variant="h6">
                      <AccountBalanceIcon />
                      Actual DA (Daily Allowance)
                    </SectionTitle>
                    <Box>
                      <Tabs
                        value={allowanceTab}
                        onChange={(e, v) => setAllowanceTab(v)}
                        variant="fullWidth"
                        sx={{ mb: 2 }}
                      >
                        <Tab label="journey details" />
                        <Tab label="Return details" />
                        <Tab label="Stay details" />
                        <Tab label="Scope Totals" /> {/* <-- NEW TAB */}
                      </Tabs>
                      {allowanceTab === 0 && (
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Scope</TableCell>
                                <TableCell>From Date</TableCell>
                                <TableCell>To Date</TableCell>
                                <TableCell>No. of Days</TableCell>
                                <TableCell>Amount/Day (₹)</TableCell>
                                <TableCell>Total Amount (₹)</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {selectedExpense.journey_allowance?.length > 0 ? selectedExpense.journey_allowance.map((row, idx) => (
                                <TableRow key={row.id || idx}>
                                  <TableCell>{row.scope}</TableCell>
                                  <TableCell>{formatDisplayDate(row.from_date)}</TableCell>
                                  <TableCell>{formatDisplayDate(row.to_date)}</TableCell>
                                  <TableCell>{row.no_of_days}</TableCell>
                                  <TableCell>₹{parseFloat(row.amount).toFixed(2)}</TableCell>
                                  <TableCell>₹{(parseFloat(row.amount) * row.no_of_days).toFixed(2)}</TableCell>
                                </TableRow>
                              )) : (
                                <TableRow>
                                  <TableCell colSpan={6} align="center" style={{ color: '#888' }}>
                                    No journey details entries
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                      {allowanceTab === 1 && (
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Scope</TableCell>
                                <TableCell>From Date</TableCell>
                                <TableCell>To Date</TableCell>
                                <TableCell>No. of Days</TableCell>
                                <TableCell>Amount/Day (₹)</TableCell>
                                <TableCell>Total Amount (₹)</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {selectedExpense.return_allowance?.length > 0 ? selectedExpense.return_allowance.map((row, idx) => (
                                <TableRow key={row.id || idx}>
                                  <TableCell>{row.scope}</TableCell>
                                  <TableCell>{formatDisplayDate(row.from_date)}</TableCell>
                                  <TableCell>{formatDisplayDate(row.to_date)}</TableCell>
                                  <TableCell>{row.no_of_days}</TableCell>
                                  <TableCell>₹{parseFloat(row.amount).toFixed(2)}</TableCell>
                                  <TableCell>₹{(parseFloat(row.amount) * row.no_of_days).toFixed(2)}</TableCell>
                                </TableRow>
                              )) : (
                                <TableRow>
                                  <TableCell colSpan={6} align="center" style={{ color: '#888' }}>
                                    No Return details entries
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                      {allowanceTab === 2 && (
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Scope</TableCell>
                                <TableCell>From Date</TableCell>
                                <TableCell>To Date</TableCell>
                                <TableCell>No. of Days</TableCell>
                                <TableCell>Amount/Day (₹)</TableCell>
                                <TableCell>Total Amount (₹)</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {selectedExpense.stay_allowance?.length > 0 ? selectedExpense.stay_allowance.map((row, idx) => (
                                <TableRow key={row.id || idx}>
                                  <TableCell>{row.scope}</TableCell>
                                  <TableCell>{formatDisplayDate(row.from_date)}</TableCell>
                                  <TableCell>{formatDisplayDate(row.to_date)}</TableCell>
                                  <TableCell>{row.no_of_days}</TableCell>
                                  <TableCell>₹{parseFloat(row.amount).toFixed(2)}</TableCell>
                                  <TableCell>₹{(parseFloat(row.amount) * row.no_of_days).toFixed(2)}</TableCell>
                                </TableRow>
                              )) : (
                                <TableRow>
                                  <TableCell colSpan={6} align="center" style={{ color: '#888' }}>
                                    No Stay details entries
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                      {allowanceTab === 3 && selectedExpense && (
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Scope</TableCell>
                                <TableCell>Total Days (All Types)</TableCell>
                                <TableCell>Amount per Day (₹)</TableCell>
                                {/* <TableCell>Estimated Rate (₹)</TableCell> */}
                                <TableCell>Total Amount (₹)</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {Object.entries(getScopeTotals(selectedExpense)).map(([scope, data]) => (
                                <TableRow key={scope}>
                                  <TableCell>{scope}</TableCell>
                                  <TableCell>{data.totalDays}</TableCell>
                                  <TableCell>₹{parseFloat(data.amountPerDay || 0).toFixed(2)}</TableCell>
                                  {/* <TableCell>{getEstimatedRate(scope, selectedExpense.allowance_rates)}</TableCell> */}
                                  <TableCell>₹{(parseFloat(data.amountPerDay || 0) * data.totalDays).toFixed(2)}</TableCell>
                                </TableRow>
                              ))}
                              {Object.keys(getScopeTotals(selectedExpense)).length === 0 && (
                                <TableRow>
                                  <TableCell colSpan={5} align="center" style={{ color: '#888' }}>
                                    No Allowance scope total
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                      {allowanceTab === 3 && selectedExpense && (
                        <Typography variant="subtitle2" sx={{ mt: 2, color: 'primary.main', fontWeight: 600 }}>
                          Total Actual DA (Daily Allowance): ₹{calculateTotalAllowanceScopeAmount(selectedExpense).toFixed(2)}
                        </Typography>
                      )}
                    </Box>
                  </DetailCard>
                </Grid>

                {/* 4.Estimated DA (Daily Allowance) */}
                {/* {selectedExpense && selectedExpense.allowance_rates && selectedExpense.allowance_rates.length > 0 && (
                  <Grid item xs={12}>
                    <DetailCard elevation={0} sx={{ bgcolor: '#e3f2fd', mt: 2 }}>
                      <SectionTitle variant="h6">
                        <AccountBalanceIcon />
                       Estimated DA (Daily Allowance)
                      </SectionTitle>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 'bold' }}>Scope</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Estimated Rate (₹)</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Total Days</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Estimated Amount (₹)</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedExpense.allowance_rates.map(rate => {
                              // Find total days for this scope
                              const totalDays = selectedExpense.allowance_scope_totals?.[rate.scope] || 0;
                              return (
                                <TableRow key={rate.scope}>
                                  <TableCell>{rate.scope}</TableCell>
                                  <TableCell>₹{parseFloat(rate.amount).toFixed(2)}</TableCell>
                                  <TableCell>{totalDays}</TableCell>
                                  <TableCell>
                                    ₹{(parseFloat(rate.amount) * totalDays).toFixed(2)}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      <Typography variant="subtitle2" sx={{ mt: 2, color: 'primary.main', fontWeight: 600 }}>
                        Total Estimated DA (Daily Allowance): ₹{selectedExpense.allowance_rates.reduce((sum, rate) => {
                          const totalDays = selectedExpense.allowance_scope_totals?.[rate.scope] || 0;
                          return sum + (parseFloat(rate.amount) * totalDays);
                        }, 0).toFixed(2)}
                      </Typography>
                    </DetailCard>
                  </Grid>
                )} */}

                {/* 5. Travel Details */}
                <Grid item xs={12}>
                  <DetailCard elevation={0} sx={{ bgcolor: '#f8f9fa' }}>
                    <SectionTitle variant="h6">
                      <DirectionsCarIcon />
                      Travel Details
                    </SectionTitle>
                    {selectedExpense.travel_data && selectedExpense.travel_data.length > 0 ? (
                      <TableContainer sx={{ 
                        borderRadius: 2,
                        border: '1px solid rgba(224, 224, 224, 1)',
                        '& .MuiTableCell-head': {
                          bgcolor: 'primary.main',
                          color: 'common.white',
                        }
                      }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>From Location</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>To Location</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Mode of Transport</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }} align="right">Fare Amount (₹)</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedExpense.travel_data.map((travel, index) => (
                              <TableRow key={index}>
                                <TableCell>{formatDisplayDateUTC(travel.travel_date)}</TableCell>
                                <TableCell>{travel.from_location || 'N/A'}</TableCell>
                                <TableCell>{travel.to_location || 'N/A'}</TableCell>
                                <TableCell>{travel.mode_of_transport || 'N/A'}</TableCell>
                                <TableCell align="right">₹{parseFloat(travel.fare_amount || 0).toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                            <TableRow sx={{ 
                              backgroundColor: '#f5f5f5',
                              '& td': { fontWeight: 'bold' }
                            }}>
                              <TableCell colSpan={4} align="right">Total Travel Amount:</TableCell>
                              <TableCell align="right">
                                ₹{selectedExpense.travel_data.reduce((sum, travel) => 
                                  sum + parseFloat(travel.fare_amount || 0), 0
                                ).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                        No travel details available
                      </Typography>
                    )}
                  </DetailCard>
                </Grid>

                {/* 6. Food Expenses */}
                <Grid item xs={12}>
                  <DetailCard elevation={0} sx={{ bgcolor: '#f8f9fa' }}>
                    <SectionTitle variant="h6">
                      <RestaurantIcon />
                      Food Expenses
                    </SectionTitle>
                    {selectedExpense.food_expenses && selectedExpense.food_expenses.length > 0 ? (
                      <TableContainer sx={{
                        borderRadius: 2,
                        border: '1px solid rgba(224, 224, 224, 1)',
                        '& .MuiTableCell-head': {
                          bgcolor: 'primary.main',
                          color: 'common.white',
                        }
                      }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 'bold' }}>From Date</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>To Date</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Sharing</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }} align="right">Bill Amount (₹)</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedExpense.food_expenses.map((food, idx) => (
                              <TableRow key={food.id || idx}>
                                <TableCell>{formatDisplayDate(food.from_date)}</TableCell>
                                <TableCell>{formatDisplayDate(food.to_date)}</TableCell>
                                <TableCell>{food.sharing}</TableCell>
                                <TableCell>{food.location}</TableCell>
                                <TableCell align="right">₹{parseFloat(food.bill_amount || 0).toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                            <TableRow sx={{
                              backgroundColor: '#f5f5f5',
                              '& td': { fontWeight: 'bold' }
                            }}>
                              <TableCell colSpan={4} align="right">Total Food Amount:</TableCell>
                              <TableCell align="right">
                                ₹{selectedExpense.food_expenses.reduce((sum, f) =>
                                  sum + parseFloat(f.bill_amount || 0), 0
                                ).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                        No food expenses available
                      </Typography>
                    )}
                  </DetailCard>
                </Grid>

                {/* 7. Hotel Expenses */}
                <Grid item xs={12}>
                  <DetailCard elevation={0} sx={{ bgcolor: '#f8f9fa' }}>
                    <SectionTitle variant="h6">
                      <HotelIcon />
                      Hotel Expenses
                    </SectionTitle>
                    {selectedExpense.hotel_expenses && selectedExpense.hotel_expenses.length > 0 ? (
                      <TableContainer sx={{
                        borderRadius: 2,
                        border: '1px solid rgba(224, 224, 224, 1)',
                        '& .MuiTableCell-head': {
                          bgcolor: 'primary.main',
                          color: 'common.white',
                        }
                      }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 'bold' }}>From Date</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>To Date</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Sharing</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }} align="right">Bill Amount (₹)</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedExpense.hotel_expenses.map((hotel, idx) => (
                              <TableRow key={hotel.id || idx}>
                                <TableCell>{formatDisplayDate(hotel.from_date)}</TableCell>
                                <TableCell>{formatDisplayDate(hotel.to_date)}</TableCell>
                                <TableCell>{hotel.sharing}</TableCell>
                                <TableCell>{hotel.location}</TableCell>
                                <TableCell align="right">₹{parseFloat(hotel.bill_amount || 0).toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                            <TableRow sx={{
                              backgroundColor: '#f5f5f5',
                              '& td': { fontWeight: 'bold' }
                            }}>
                              <TableCell colSpan={4} align="right">Total Hotel Amount:</TableCell>
                              <TableCell align="right">
                                ₹{selectedExpense.hotel_expenses.reduce((sum, h) =>
                                  sum + parseFloat(h.bill_amount || 0), 0
                                ).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                        No hotel expenses available
                      </Typography>
                    )}
                  </DetailCard>
                </Grid>

                {/* 8. Uploaded Receipts */}
                <Grid item xs={12}>
                  <DetailCard elevation={0} sx={{ bgcolor: '#f8f9fa' }}>
                    <SectionTitle variant="h6">
                      <ReceiptIcon />
                      Uploaded Receipts
                    </SectionTitle>
                    <Grid container spacing={2}>
                      {[
                        { label: 'Travel Receipt', path: selectedExpense.travel_receipt_path },
                        { label: 'Hotel Receipt', path: selectedExpense.hotel_receipt_path },
                        { label: 'Food Receipt', path: selectedExpense.food_receipt_path },
                        { 
                          label: 'Special Approval', 
                          path: selectedExpense.special_approval_path,
                          isSpecial: true
                        }
                      ].map((receipt, index) => (
                        receipt.path && (
                          <Grid item xs={12} sm={6} md={3} key={index}>
                            <Paper sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                              <Typography variant="subtitle2" color="text.secondary">{receipt.label}</Typography>
                              <Button
                                variant="outlined"
                                size="small"
                                sx={{ mt: 1 }}
                                onClick={() => {
                                  const url = `${process.env.REACT_APP_API_URL}/${receipt.path.replace(/\\/g, '/')}`;
                                  window.open(url, '_blank');
                                }}
                              >
                                View Receipt
                              </Button>
                            </Paper>
                          </Grid>
                        )
                      ))}
                    </Grid>
                  </DetailCard>
                </Grid>

                {/* 9. Expense Summary */}
                <Grid item xs={12}>
                  <DetailCard elevation={0} sx={{ bgcolor: '#f8f9fa' }}>
                    <SectionTitle variant="h6">
                      <AccountBalanceIcon />
                      Expense Summary
                    </SectionTitle>
                    <Grid container spacing={2}>
                       {/* Total Actual DA (Daily Allowance) */}
                      <Grid item xs={12} sm={6} md>
                        <Paper sx={{
                          p: 2,
                          bgcolor: alpha('#388e3c', 0.03),
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: '#388e3c',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          justifyContent: 'center',
                          minHeight: '100px',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 4px 12px ${alpha('#388e3c', 0.1)}`
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            background: 'linear-gradient(90deg, #388e3c, #43a047)',
                            opacity: 0.7
                          }
                        }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 500, mb: 1 }}>
                            Total Actual DA (Daily Allowance)
                          </Typography>
                          <Typography variant="body1" sx={{ color: '#388e3c', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.25px' }}>
                            ₹{calculateTotalAllowanceScopeAmount(selectedExpense).toFixed(2)}
                          </Typography>
                        </Paper>
                      </Grid>
                      {/* Travel Fare */}
                      <Grid item xs={12} sm={6} md>
                        <Paper sx={{
                          p: 2,
                          bgcolor: alpha('#1976d2', 0.03),
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: '#1976d2',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          justifyContent: 'center',
                          minHeight: '100px',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 4px 12px ${alpha('#1976d2', 0.1)}`
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            background: 'linear-gradient(90deg, #1976d2, #2196f3)',
                            opacity: 0.7
                          }
                        }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 500, mb: 1 }}>
                            Total Travel Fare
                          </Typography>
                          <Typography variant="body1" sx={{ color: '#1976d2', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.25px' }}>
                            ₹{selectedExpense.travel_data ? selectedExpense.travel_data.reduce((sum, travel) => sum + parseFloat(travel.fare_amount || 0), 0).toFixed(2) : parseFloat(selectedExpense.total_travel_fare || 0).toFixed(2)}
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      {/* Total Food Amount */}
                      <Grid item xs={12} sm={6} md>
                        <Paper sx={{
                          p: 2,
                          bgcolor: alpha('#43a047', 0.03),
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: '#43a047',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          justifyContent: 'center',
                          minHeight: '100px',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 4px 12px ${alpha('#43a047', 0.1)}`
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            background: 'linear-gradient(90deg, #43a047, #66bb6a)',
                            opacity: 0.7
                          }
                        }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 500, mb: 1 }}>
                            Total Food Amount
                          </Typography>
                          <Typography variant="body1" sx={{ color: '#43a047', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.25px' }}>
                            ₹{selectedExpense.food_expenses ? selectedExpense.food_expenses.reduce((sum, f) => sum + parseFloat(f.bill_amount || 0), 0).toFixed(2) : '0.00'}
                          </Typography>
                        </Paper>
                      </Grid>
                      {/* Total Hotel Amount */}
                      <Grid item xs={12} sm={6} md>
                        <Paper sx={{
                          p: 2,
                          bgcolor: alpha('#0288d1', 0.03),
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: '#0288d1',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          justifyContent: 'center',
                          minHeight: '100px',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 4px 12px ${alpha('#0288d1', 0.1)}`
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            background: 'linear-gradient(90deg, #0288d1, #03a9f4)',
                            opacity: 0.7
                          }
                        }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 500, mb: 1 }}>
                            Total Hotel Amount
                          </Typography>
                          <Typography variant="body1" sx={{ color: '#0288d1', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.25px' }}>
                            ₹{selectedExpense.hotel_expenses ? selectedExpense.hotel_expenses.reduce((sum, h) => sum + parseFloat(h.bill_amount || 0), 0).toFixed(2) : '0.00'}
                          </Typography>
                        </Paper>
                      </Grid>
                      {/* Claim Amount */}
                      <Grid item xs={12} sm={6} md>
                        <Paper sx={{
                          p: 2,
                          bgcolor: alpha('#1976d2', 0.03),
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: '#1976d2',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          justifyContent: 'center',
                          minHeight: '100px',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 4px 12px ${alpha('#1976d2', 0.1)}`
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            background: 'linear-gradient(90deg, #1976d2, #2196f3)',
                            opacity: 0.7
                          }
                        }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 500, mb: 1 }}>
                            Claim Amount
                          </Typography>
                          <Typography variant="body1" sx={{ color: '#1976d2', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.25px' }}>
                            ₹{parseFloat(selectedExpense.claim_amount || 0).toFixed(2)}
                          </Typography>
                        </Paper>
                      </Grid>
                     
                    </Grid>
                  </DetailCard>
                </Grid>

                <Grid item xs={12}>
                  <DetailCard elevation={0} sx={{ bgcolor: '#f8f9fa' }}>
                    <SectionTitle variant="h6">
                      <UpdateIcon />
                      Status & Review History
                    </SectionTitle>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Current Status
                      </Typography>
                      <Chip 
                        label={getStatusLabel(selectedExpense.status)}
                        color={statusColors[selectedExpense.status]}
                        sx={{ p: 1 }}
                      />
                    </Box>
                  </DetailCard>
                </Grid>

                <Grid item xs={12}>
                  <DetailCard elevation={0} sx={{ bgcolor: '#f8f9fa' }}>
                    <SectionTitle variant="h6">
                      <TimelineIcon />
                      Status History
                    </SectionTitle>
                    <Box sx={{ mt: 2 }}>
                      <HistoryTimeline history={expenseHistory} />
                    </Box>
                  </DetailCard>
                </Grid>
              </Grid>

              {canReviewExpense(selectedExpense) && (
                <Paper sx={{ p: 2, mt: 3, borderRadius: 2 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    label="Review Comment"
                    value={comment}
                    onChange={(e) => {
                      setComment(e.target.value);
                      if (e.target.value.trim()) {
                        setCommentError(false);
                      }
                    }}
                    required
                    error={commentError}
                    helperText={commentError ? "Comment is required before approving/rejecting" : ""}
                    sx={{
                      '& .MuiFormHelperText-root': {
                        color: 'error.main',
                        fontWeight: 500
                      }
                    }}
                    disabled={isReviewDisabled(selectedExpense)}
                  />
                </Paper>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions 
          sx={{ 
            p: 3, 
            bgcolor: '#fff',
            borderTop: '1px solid rgba(0, 0, 0, 0.12)',
            gap: 2,
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <Button 
            onClick={handleDownloadPDF}
            variant="contained"
            color="secondary"
            startIcon={<FileDownloadIcon />}
            sx={{ minWidth: 150 }}
          >
            Download PDF
          </Button>
          <Button 
            onClick={() => setOpenDialog(false)}
            variant="outlined"
            startIcon={<CancelIcon />}
          >
            Close
          </Button>
          {canEditExpense(selectedExpense) && (
            <Button
              startIcon={<EditIcon />}
              variant="contained"
              color="primary"
              onClick={() => navigate(`/edit-expense/${selectedExpense.expense_id}`)}
            >
              Edit & Resubmit
            </Button>
          )}
          {canReviewExpense(selectedExpense) && user.role !== 'admin' && (
            <Box sx={{ 
              display: 'flex', 
              gap: 2,
              justifyContent: 'center'
            }}>
              <LoadingButton 
                onClick={() => handleReview(selectedExpense.expense_id, 'reject')} 
                variant="contained" 
                color="error"
                startIcon={<CancelIcon />}
                sx={{
                  minWidth: 150,
                  py: 1,
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(244, 67, 54, 0.2)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 15px rgba(244, 67, 54, 0.3)',
                  }
                }}
              >
                Reject
              </LoadingButton>
              <LoadingButton 
                onClick={() => handleReview(selectedExpense.expense_id, 'approve')} 
                variant="contained" 
                color="primary"
                startIcon={<CheckCircleIcon />}
                sx={{
                  minWidth: 150,
                  py: 1,
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #4caf50, #81c784)',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #43a047, #66bb6a)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 15px rgba(76, 175, 80, 0.3)',
                  }
                }}
              >
                Approve
              </LoadingButton>
            </Box>
          )}
        </DialogActions>
      </ExpenseDetailDialog>

      <ExportFilterModal
        open={openExportModal}
        onClose={() => setOpenExportModal(false)}
        onExport={handleExportWithFilters}
        departments={departments}
      />

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        TransitionComponent={notification.transition}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          severity={notification.severity}
          sx={{ 
            minWidth: '300px',
            display: 'flex',
            alignItems: 'center',
            '& .MuiAlert-message': {
              flex: 1,
              textAlign: 'center'
            }
          }}
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        >
          {notification.message}
        </MuiAlert>
      </Snackbar>

      <NotificationDialog
        open={notificationDialog.open}
        onClose={() => setNotificationDialog(prev => ({ ...prev, open: false }))}
        type={notificationDialog.type}
        message={notificationDialog.message}
      />

      <ConfirmationDialog
        open={confirmDialog.open}
        type={confirmDialog.type}
        onClose={() => setConfirmDialog({ open: false, type: null })}
        onConfirm={handleConfirmReview}
        userRole={user?.role} // Pass the user role here
      />
    </Box>
  );
};

export default ExpenseList;

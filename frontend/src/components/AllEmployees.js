import React, { useState, useEffect, useCallback } from 'react';
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
  TextField,
  InputAdornment,
  CircularProgress,
  Chip,
  IconButton,
  Grid,
  ButtonGroup,
  Tooltip,
  Pagination,
  MenuItem,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import GroupsIcon from '@mui/icons-material/Groups';
import WorkOffIcon from '@mui/icons-material/WorkOff';
import BadgeIcon from '@mui/icons-material/Badge';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { styled, alpha } from '@mui/material/styles';
import axios from 'axios';
import ExcelJS from 'exceljs';
import bcrypt from 'bcryptjs';
import { useAuth } from '../context/AuthContext';
import EditEmployeeDialog from './EditEmployeeDialog';
import TerminateEmployeeDialog from './TerminateEmployeeDialog';
import LockResetIcon from '@mui/icons-material/LockReset';
import SettingsIcon from '@mui/icons-material/Settings';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DomainIcon from '@mui/icons-material/Domain';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.dark,
  backgroundImage: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
  color: theme.palette.common.white,
  fontSize: '0.75rem',
  padding: '12px 8px', // Increased vertical padding
  whiteSpace: 'nowrap',
  fontWeight: 600,
  borderBottom: 'none',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  height: '48px', // Fixed height for header cells
  '&.MuiTableCell-body': {
    fontSize: '0.75rem',
    padding: '8px', // Increased padding for body cells
    transition: 'all 0.2s ease',
    height: '40px' // Fixed height for body cells
  }
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: alpha(theme.palette.primary.light, 0.03),
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.light, 0.07),
    cursor: 'pointer',
    '& .MuiTableCell-body': {
      color: theme.palette.primary.main
    },
    '& .MuiChip-root': {
      transform: 'scale(1.05)',
    }
  },
  '& .MuiTableCell-root': {
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
  },
  '& .MuiChip-root': {
    transition: 'transform 0.2s ease',
  }
}));

const DashboardCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 6px 16px 0 rgba(0,0,0,0.1)',
  },
}));

const getCardStyles = (type) => {
  const styles = {
    total: {
      borderColor: '#1976d2',
      background: 'linear-gradient(135deg, #e3f2fd 0%, rgba(255, 255, 255, 0.95) 100%)',
      iconBg: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)'
    },
    active: {
      borderColor: '#2e7d32',
      background: 'linear-gradient(135deg, #e8f5e9 0%, rgba(255, 255, 255, 0.95) 100%)',
      iconBg: 'linear-gradient(45deg, #2e7d32 30%, #4caf50 90%)'
    },
    inactive: {
      borderColor: '#d32f2f',
      background: 'linear-gradient(135deg, #ffebee 0%, rgba(255, 255, 255, 0.95) 100%)',
      iconBg: 'linear-gradient(45deg, #d32f2f 30%, #f44336 90%)'
    },
    admin: {
      borderColor: '#7b1fa2',
      background: 'linear-gradient(135deg, #f3e5f5 0%, rgba(255, 255, 255, 0.95) 100%)',
      iconBg: 'linear-gradient(45deg, #7b1fa2 30%, #9c27b0 90%)'
    },
    hr: {
      borderColor: '#0288d1',
      background: 'linear-gradient(135deg, #e1f5fe 0%, rgba(255, 255, 255, 0.95) 100%)',
      iconBg: 'linear-gradient(45deg, #0288d1 30%, #03a9f4 90%)'
    },
    accounts: {
      borderColor: '#f57c00',
      background: 'linear-gradient(135deg, #fff3e0 0%, rgba(255, 255, 255, 0.95) 100%)',
      iconBg: 'linear-gradient(45deg, #f57c00 30%, #ff9800 90%)'
    },
    coordinator: {
      borderColor: '#00796b',
      background: 'linear-gradient(135deg, #e0f2f1 0%, rgba(255, 255, 255, 0.95) 100%)',
      iconBg: 'linear-gradient(45deg, #00796b 30%, #009688 90%)'
    },
    users: {
      borderColor: '#303f9f',
      background: 'linear-gradient(135deg, #e8eaf6 0%, rgba(255, 255, 255, 0.95) 100%)',
      iconBg: 'linear-gradient(45deg, #303f9f 30%, #3f51b5 90%)'
    },
    pending: {
      borderColor: '#ef6c00',
      background: 'linear-gradient(135deg, #fff3e0 0%, rgba(255, 255, 255, 0.95) 100%)',
      iconBg: 'linear-gradient(45deg, #ef6c00 30%, #ff9800 90%)'
    }
  };
  return styles[type] || styles.total;
};

const StatsCard = styled(Paper)(({ theme, cardtype }) => {
  const colors = getCardStyles(cardtype);
  return {
    padding: theme.spacing(2),
    background: colors.background,
    borderRadius: 16,
    backdropFilter: 'blur(10px)',
    border: '2px solid',
    borderColor: colors.borderColor,
    boxShadow: `inset 0 0 12px ${alpha(colors.borderColor, 0.1)}, 0 4px 20px rgba(0, 0, 0, 0.05)`,
    position: 'relative',
    overflow: 'hidden',
    height: '100%',
    minWidth: '130px',
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
      fontSize: 28,
      background: colors.iconBg,
      borderRadius: '10px',
      padding: 6,
      color: 'white',
      marginBottom: 8,
      boxShadow: `0 4px 12px ${alpha(colors.borderColor, 0.4)}`,
      transition: 'transform 0.3s ease'
    },
    '& .MuiTypography-h4': {
      fontSize: '1.25rem',
      marginBottom: 2,
      fontWeight: 700,
      color: colors.borderColor,
      textShadow: `0 2px 4px ${alpha(colors.borderColor, 0.1)}`
    },
    '& .MuiTypography-subtitle2': {
      fontSize: '0.7rem',
      color: alpha(colors.borderColor, 0.85),
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      fontWeight: 500
    }
  };
});

const StatCategory = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .category-title': {
    marginBottom: theme.spacing(2),
    color: theme.palette.text.secondary,
    fontWeight: 500,
  }
}));

// Update tableContainerStyles: Remove minWidth/maxWidth from TableContainer itself, set horizontal scroll only for table section, and ensure table is wide enough for all columns
const tableContainerStyles = {
  borderRadius: '16px',
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
  boxShadow: (theme) => `0 0 20px ${alpha(theme.palette.primary.main, 0.08)}`,
  position: 'relative',
  maxHeight: '70vh',
  overflowX: 'auto', // Only horizontal scroll for table section
  overflowY: 'auto',
  // Remove minWidth here, set it on table below
  '&::-webkit-scrollbar': {
    height: '10px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: '10px',
    '&:hover': {
      backgroundColor: 'rgba(0,0,0,0.28)'
    }
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: 'rgba(0,0,0,0.03)'
  },
  '& .MuiTableCell-root': {
    padding: '10px 10px',
    fontSize: '0.95rem',
    lineHeight: 1.5,
    verticalAlign: 'middle'
  },
  '& .MuiTableRow-root': {
    minHeight: '44px'
  },
};

// In TableCellContent, remove text truncation and allow full content to be visible
const TableCellContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  maxWidth: '100%',
  minHeight: '24px',
  '& .MuiTypography-root': {
    whiteSpace: 'normal', // Allow wrapping
    overflow: 'visible',  // Show full content
    textOverflow: 'unset',
    fontSize: '0.95rem',
    lineHeight: 1.5
  }
}));

const ActionButton = styled(IconButton)(({ theme, color = 'primary' }) => ({
  padding: 6,
  backgroundColor: alpha(theme.palette[color].main, 0.08),
  border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
  '&:hover': {
    backgroundColor: alpha(theme.palette[color].main, 0.15),
    transform: 'translateY(-2px)'
  },
  transition: 'all 0.2s ease'
}));

// Define all columns and their properties
const ALL_COLUMNS = [
  { key: 'emp_code', label: 'Employee Code', minWidth: 120 },
  { key: 'full_name', label: 'Full Name', minWidth: 220 },
  { key: 'username', label: 'Username', minWidth: 180 },
  { key: 'email', label: 'Email', minWidth: 260 },
  { key: 'role', label: 'Role', minWidth: 180 },
  { key: 'mobile_number', label: 'Mobile', minWidth: 160 },
  { key: 'designation_name', label: 'Designation', minWidth: 180 },
  { key: 'department_name', label: 'Department', minWidth: 180 },
  { key: 'location_name', label: 'Location', minWidth: 180 },
  { key: 'gender', label: 'Gender', minWidth: 120 },
  { key: 'category', label: 'Category', minWidth: 120 },
  { key: 'birth_of_date', label: 'Birth Date', minWidth: 160 },
  { key: 'first_reporting_manager_name', label: 'First Manager', minWidth: 220 },
  { key: 'second_reporting_manager_name', label: 'Second Manager', minWidth: 220 },
  { key: 'last_employment_date', label: 'Last Date', minWidth: 160 },
  { key: 'date_of_joining', label: 'Date of Joining', minWidth: 160 },
  { key: 'status', label: 'Status', minWidth: 180 },
  { key: 'actions', label: 'Actions', minWidth: 180, align: 'center' }
];

const DEFAULT_SELECTED = ALL_COLUMNS.map(col => col.key);

// Replace headerColors array with a single color
const headerColor = '#e3f2fd'; // lighter blue
const headerTextColor = '#1565c0'; // deep blue for text

const formatDisplayDate = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d)) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const AllEmployees = () => {
  const { token, user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editEmployee, setEditEmployee] = useState(null);
  const [terminateEmployee, setTerminateEmployee] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(6);
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedColumns, setSelectedColumns] = useState(DEFAULT_SELECTED);
  const [columnModalOpen, setColumnModalOpen] = useState(false);
  const [reactivateEmployee, setReactivateEmployee] = useState(null); // Add state for confirmation dialog
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [columnFilters, setColumnFilters] = useState({});
  const [resetLoading, setResetLoading] = useState(false);
  const [resetEmployee, setResetEmployee] = useState(null); // For confirmation dialog
  const [tabPermDialog, setTabPermDialog] = useState({ open: false, employee: null, value: [] });

  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [expiredEmployees, setExpiredEmployees] = useState([]);
  const [selectedExpiredIds, setSelectedExpiredIds] = useState([]);
  const [resendExpiredLoading, setResendExpiredLoading] = useState(false);
  const [resendExpiredResult, setResendExpiredResult] = useState('');

  const fetchExpiredEmployees = useCallback(async () => {
    try {
      const response = await axios.get('/api/employees/not-activated', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpiredEmployees(response.data || []);
    } catch (error) {
      setExpiredEmployees([]);
    }
  }, [token]);

  const handleSelectExpired = (empId) => {
    setSelectedExpiredIds(prev =>
      prev.includes(empId)
        ? prev.filter(id => id !== empId)
        : [...prev, empId]
    );
  };

  const handleResendSelectedExpired = async () => {
    setResendExpiredLoading(true);
    setResendExpiredResult('');
    try {
      const response = await axios.post('/api/employees/bulk-resend-activation', {
        emp_ids: selectedExpiredIds
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResendExpiredResult(response.data.message || 'Activation links resent.');
      fetchExpiredEmployees(); // Refresh modal list after sending
      setSelectedExpiredIds([]); // Clear selection
    } catch (error) {
      setResendExpiredResult(error.response?.data?.message || 'Error sending activation links.');
    } finally {
      setResendExpiredLoading(false);
    }
  };

  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'hr', label: 'HR' },
    { value: 'accounts', label: 'Accounts' },
    { value: 'coordinator', label: 'Coordinator' },
    { value: 'user', label: 'User' },
    { value: 'pending', label: 'PENDING ACTIVATION' } // <-- Add this option for filter
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'terminated', label: 'Terminated' },
    { value: 'reassigned', label: 'Reassigned' },
    { value: 'deceased', label: 'Deceased' },
    { value: 'pending', label: 'Pending Activation' }
  ];

  // Add these option arrays after departments, designations, locations state is defined
  const departmentOptions = [
    { value: '', label: 'All Departments' },
    ...departments.map(dep => ({ value: dep.department_name, label: dep.department_name }))
  ];
  const designationOptions = [
    { value: '', label: 'All Designations' },
    ...designations.map(des => ({ value: des.designation_name, label: des.designation_name }))
  ];
  const locationOptions = [
    { value: '', label: 'All Locations' },
    ...locations.map(loc => ({ value: loc.location_name, label: loc.location_name }))
  ];

  // Color palettes for chips
  const departmentColors = [
    '#1976d2', '#388e3c', '#fbc02d', '#d32f2f', '#7b1fa2', '#0288d1', '#f57c00', '#00796b', '#303f9f'
  ];
  const designationColors = [
    '#4caf50', '#ff9800', '#9c27b0', '#00bcd4', '#e91e63', '#3f51b5', '#cddc39', '#795548', '#607d8b'
  ];
  const locationColors = [
    '#2196f3', '#8bc34a', '#ffc107', '#e53935', '#ab47bc', '#26c6da', '#ffa726', '#00897b', '#5c6bc0'
  ];

  // Helper to get color for value
  const getColor = (arr, value) => {
    if (!value) return arr[0];
    let hash = 0;
    for (let i = 0; i < value.length; i++) hash += value.charCodeAt(i);
    return arr[hash % arr.length];
  };

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/employees/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(response.data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchDepartments = useCallback(async () => {
    try {
      const response = await axios.get('/api/employees/departments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  }, [token]);

  const fetchDesignations = useCallback(async () => {
    try {
      const response = await axios.get('/api/employees/designations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDesignations(response.data);
    } catch (error) {
      console.error('Error fetching designations:', error);
    }
  }, [token]);

  const fetchLocations = useCallback(async () => {
    try {
      const response = await axios.get('/api/employees/locations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLocations(response.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchEmployees();
      fetchDepartments();
      fetchDesignations();
      fetchLocations();
    }
  }, [token, fetchEmployees, fetchDepartments, fetchDesignations, fetchLocations]);

  const handleEdit = (employee) => {
    setEditEmployee(employee);
  };

  const handleTerminate = (employee) => {
    setTerminateEmployee(employee);
  };

  const handleReactivate = async (employee) => {
    setReactivateEmployee(employee); // Open confirmation dialog
  };

  const confirmReactivate = async () => {
    if (!reactivateEmployee) return;
    try {
      await axios.put(
        `/api/employees/${reactivateEmployee.emp_id}/reactivate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchEmployees();
    } catch (error) {
      console.error('Error reactivating employee:', error);
    } finally {
      setReactivateEmployee(null); // Close dialog
    }
  };

  const handleSave = async (updatedEmployee) => {
    try {
      // If password is being updated
      if (updatedEmployee.password) {
        // Generate salt and hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(updatedEmployee.password, salt);
        
        // Update the employee object with hashed password
        updatedEmployee = {
          ...updatedEmployee,
          password: hashedPassword
        };
      }

      // Use relative URL for API call (proxy handles /api)
      await axios.put(`/api/employees/${updatedEmployee.emp_id}`, updatedEmployee, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Refetch employees to reflect any changes, including inactive reason
      await fetchEmployees();
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Employees');

    worksheet.columns = [
      { header: 'Employee Code', key: 'emp_code', width: 15 },
      { header: 'Full Name', key: 'full_name', width: 30 },
      { header: 'Username', key: 'username', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Role', key: 'role', width: 15 },
      { header: 'Mobile', key: 'mobile', width: 15 },
      { header: 'Designation', key: 'designation', width: 20 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Location', key: 'location', width: 20 },
      { header: 'Gender', key: 'gender', width: 10 },
      { header: 'Category', key: 'category', width: 10 },
      { header: 'Birth Date', key: 'birth_of_date', width: 15 },
      { header: 'First Manager', key: 'first_manager', width: 20 },
      { header: 'Second Manager', key: 'second_manager', width: 20 },
      { header: 'Last Employment Date', key: 'last_employment_date', width: 20 },
      { header: 'Date of Joining', key: 'date_of_joining', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Inactive Reason', key: 'inactive_reason', width: 18 }
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1976D2' }
    };

    const rows = filteredEmployees.map(emp => {
      const fullName = (
        (emp.first_name || emp.middle_name || emp.last_name)
          ? `${emp.first_name || ''}${emp.middle_name ? ' ' + emp.middle_name : ''}${emp.last_name ? ' ' + emp.last_name : ''}`.replace(/\s+/g, ' ').trim()
          : emp.full_name
      );
      // Role: show "PENDING ACTIVATION" if not activated
      const roleValue = (!emp.role || emp.role === 'Not Activated')
        ? 'PENDING ACTIVATION'
        : emp.role?.toUpperCase();

      // Status: show "PENDING ACTIVATION" if blank or not activated
      let statusValue = '';
      if (!emp.role || emp.role === 'Not Activated' || !emp.status) {
        statusValue = 'PENDING ACTIVATION';
      } else if (emp.status === 'inactive') {
        statusValue = emp.inactive_reason
          ? emp.inactive_reason.toUpperCase()
          : 'TERMINATED';
      } else if (emp.status === 'active') {
        statusValue = 'ACTIVE';
      } else {
        statusValue = emp.status?.toUpperCase() || '';
      }

      return {
        emp_code: emp.emp_code,
        full_name: fullName,
        username: emp.username,
        email: emp.email,
        role: roleValue,
        mobile: emp.mobile_number || 'N/A',
        designation: emp.designation_name || 'N/A',
        department: emp.department_name || 'N/A',
        location: emp.location_name || 'N/A',
        gender: emp.gender || 'N/A',
        category: emp.category || 'N/A',
        birth_of_date: emp.birth_of_date ? new Date(emp.birth_of_date).toLocaleDateString() : '',
        first_manager: emp.first_reporting_manager_emp_code || 'N/A',
        second_manager: emp.second_reporting_manager_emp_code || 'N/A',
        last_employment_date: emp.last_employment_date
          ? new Date(emp.last_employment_date).toLocaleDateString()
          : '',
        date_of_joining: emp.date_of_joining
          ? new Date(emp.date_of_joining).toLocaleDateString()
          : 'N/A',
        status: statusValue,
        inactive_reason: emp.inactive_reason ? emp.inactive_reason.toUpperCase() : '',
      };
    });

    worksheet.addRows(rows);

    worksheet.autoFilter = {
      from: 'A1',
      to: `N${rows.length + 1}`,
    };

    const date = new Date().toISOString().split('T')[0];
    const filename = `Employees_${date}.xlsx`;

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const getMobileDisplay = (mobile_number) => {
    if (!mobile_number) return 'N/A';
    const match = mobile_number.match(/^(\+\d{1,3})(\d{10})$/);
    if (match) {
      return `${match[1]} ${match[2]}`;
    }
    return mobile_number;
  };

  // Helper: get column type for filter UI
  const getColumnType = (key) => {
    if (key === 'status' || key === 'role' || key === 'department_name' || key === 'designation_name' || key === 'location_name') return 'select';
    if (key === 'birth_of_date' || key === 'last_employment_date' || key === 'date_of_joining') return 'date';
    return 'text';
  };

  // Sorting handler
  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  // Column filter handler
  const handleColumnFilterChange = (key, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPage(1); // Reset to first page on filter
  };

  // Compose filteredEmployees with column filters
  const filteredEmployees = employees.filter(employee => {
    const searchValue = searchTerm.toLowerCase().trim();

    // Search match
    const matchesSearch = Object.entries(employee).some(([key, value]) => {
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchValue);
      }
      return false;
    });

    // Role match (case-insensitive, handle Not Activated and pending)
    let matchesRole = false;
    if (filterRole === 'all') {
      matchesRole = true;
    } else if (filterRole === 'user' || filterRole === 'admin' || filterRole === 'hr' || filterRole === 'accounts' || filterRole === 'coordinator') {
      matchesRole = (employee.role && employee.role.toLowerCase() === filterRole);
    } else if (filterRole === 'pending') {
      matchesRole = !employee.role || employee.role === 'Not Activated';
    }

    // Status match (case-insensitive, handle inactive reasons and pending)
    let matchesStatus = false;
    if (filterStatus === 'all') {
      matchesStatus = true;
    } else if (filterStatus === 'active') {
      matchesStatus = employee.status && employee.status.toLowerCase() === 'active';
    } else if (filterStatus === 'terminated') {
      matchesStatus = employee.status && employee.status.toLowerCase() === 'inactive' && employee.inactive_reason === 'terminated';
    } else if (filterStatus === 'reassigned') {
      matchesStatus = employee.status && employee.status.toLowerCase() === 'inactive' && employee.inactive_reason === 'reassigned';
    } else if (filterStatus === 'deceased') {
      matchesStatus = employee.status && employee.status.toLowerCase() === 'inactive' && employee.inactive_reason === 'deceased';
    } else if (filterStatus === 'pending') {
      matchesStatus = !employee.role || employee.role === 'Not Activated';
    }

    // Column-level filters
    for (const key of Object.keys(columnFilters)) {
      const filterValue = columnFilters[key];
      if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) continue;
      const colType = getColumnType(key);
      if (colType === 'text') {
        if (!String(employee[key] || '').toLowerCase().includes(filterValue.toLowerCase())) return false;
      } else if (colType === 'select') {
        const values = Array.isArray(filterValue) ? filterValue : [filterValue];
        if (key === 'role') {
          if (!values.includes('all')) {
            if (values.includes('pending')) {
              if (employee.role && employee.role !== 'Not Activated') return false;
            } else if (!values.includes(employee.role?.toLowerCase())) return false;
          }
        } else if (key === 'status') {
          if (!values.includes('all')) {
            let statusMatched = false;
            for (const val of values) {
              if (val === 'pending') {
                if (!employee.role || employee.role === 'Not Activated') statusMatched = true;
              } else if (val === 'active') {
                if (employee.status && employee.status.toLowerCase() === 'active') statusMatched = true;
              } else if (val === 'terminated') {
                if (employee.status && employee.status.toLowerCase() === 'inactive' && employee.inactive_reason === 'terminated') statusMatched = true;
              } else if (val === 'reassigned') {
                if (employee.status && employee.status.toLowerCase() === 'inactive' && employee.inactive_reason === 'reassigned') statusMatched = true;
              } else if (val === 'deceased') {
                if (employee.status && employee.status.toLowerCase() === 'inactive' && employee.inactive_reason === 'deceased') statusMatched = true;
              }
            }
            if (!statusMatched) return false;
          }
        } else if (key === 'department_name') {
          if (!values.includes('') && !values.includes(employee.department_name)) return false;
        } else if (key === 'designation_name') {
          if (!values.includes('') && !values.includes(employee.designation_name)) return false;
        } else if (key === 'location_name') {
          if (!values.includes('') && !values.includes(employee.location_name)) return false;
        }
      } else if (colType === 'date') {
        if (filterValue && employee[key]) {
          const empDate = new Date(employee[key]).toISOString().split('T')[0];
          if (empDate !== filterValue) return false;
        }
      }
    }

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Sorting logic
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    if (!sortBy) return 0;
    let aVal = a[sortBy], bVal = b[sortBy];
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    }
  });

  const paginatedEmployees = sortedEmployees.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleColumnToggle = (key) => {
    setSelectedColumns(prev =>
      prev.includes(key)
        ? prev.filter(col => col !== key)
        : [...prev, key]
    );
  };

  // Handler for admin password reset (opens confirmation dialog)
  const handleResetPasswordClick = (employee) => {
    setResetEmployee(employee);
  };

  // Actually send the reset link after confirmation
  const handleConfirmResetPassword = async () => {
    if (!resetEmployee) return;
    setResetLoading(true);
    try {
      await axios.post(
        '/api/employees/admin/send-reset-password-link',
        { emp_id: resetEmployee.emp_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Failed to send reset link:', error);
    } finally {
      setResetLoading(false);
      setResetEmployee(null);
    }
  };

  // Handler to open tab permission dialog
  const handleTabPermOpen = (employee) => {
    // For admin and hr, include 'allowance_rates' tab in tab options
    let tabOptions = getTabOptionsForRole(employee.role);
    if ((employee.role === 'admin' || employee.role === 'hr') && !tabOptions.some(tab => tab.key === 'allowance_rates')) {
      tabOptions = [
        ...tabOptions,
        { label: 'DA (Daily Allowance)', key: 'allowance_rates' }
      ];
    }
    // Ensure 'new_expense' and 'expense_list' are present for admin by default
    if (employee.role === 'admin') {
      if (!tabOptions.some(tab => tab.key === 'new_expense')) tabOptions.push({ key: 'new_expense', label: 'New Expense', criticalTabs: true });
      if (!tabOptions.some(tab => tab.key === 'expense_list')) tabOptions.push({ key: 'expense_list', label: 'Expense List', criticalTabs: true });
    }
    let initialValue = [];
    // Always check all tabs by default, including DA/Allowance, New Expense, Expense List, unless tab_permissions is a non-empty array
    if (Array.isArray(employee.tab_permissions) && employee.tab_permissions.length > 0) {
      // Only keep tab keys that are still valid for this role (including allowance_rates, new_expense, expense_list)
      initialValue = tabOptions.map(tab => tab.key).filter(key => employee.tab_permissions.includes(key));
      // If none of the saved permissions are valid, default to all
      if (initialValue.length === 0) {
        initialValue = tabOptions.map(tab => tab.key);
      }
    } else {
      initialValue = tabOptions.map(tab => tab.key);
    }
    setTabPermDialog({
      open: true,
      employee,
      value: initialValue,
      tabOptions // Save for rendering
    });
  };

  // Handler to save tab permissions
  const handleTabPermSave = async () => {
    try {
      await axios.put(
        `/api/employees/${tabPermDialog.employee.emp_id}/tab-permissions`,
        { tab_permissions: tabPermDialog.value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTabPermDialog({ open: false, employee: null, value: [] });
      fetchEmployees();
    } catch (error) {
      console.error('Failed to update tab permissions:', error);
    }
  };

  // Define tab options by role
  const TAB_OPTIONS_BY_ROLE = {
    admin: [
      { key: 'all_employees', label: 'All Employees', criticalTabs: false },
      { key: 'add_user', label: 'Add User', criticalTabs: false },
      { key: 'bulk_upload', label: 'Bulk Upload', criticalTabs: false },
      { key: 'employee', label: 'Employee', criticalTabs: false },
      { key: 'coordinator_departments', label: 'Department Coordinators', criticalTabs: false },
      { key: 'projects', label: 'Projects', criticalTabs: false },
      { key: 'departments', label: 'Departments', criticalTabs: false },
      { key: 'designations', label: 'Designations', criticalTabs: false },
      { key: 'locations', label: 'Locations', criticalTabs: false },
      { key: 'expense_list', label: 'Expense List', criticalTabs: true },
      { key: 'new_expense', label: 'New Expense', criticalTabs: true }
    ],
    hr: [
      { key: 'all_employees', label: 'All Employees', criticalTabs: false },
      { key: 'add_user', label: 'Add User', criticalTabs: false },
      { key: 'bulk_upload', label: 'Bulk Upload', criticalTabs: false },
      { key: 'employee', label: 'Employee', criticalTabs: false },
      { key: 'coordinator_departments', label: 'Department Coordinators', criticalTabs: false },
      { key: 'projects', label: 'Projects', criticalTabs: false },
      { key: 'departments', label: 'Departments', criticalTabs: false },
      { key: 'designations', label: 'Designations', criticalTabs: false },
      { key: 'locations', label: 'Locations', criticalTabs: false },
      { key: 'expense_list', label: 'Expense List', criticalTabs: true },
      { key: 'new_expense', label: 'New Expense', criticalTabs: true }
    ],
    accounts: [
      { key: 'expense_list', label: 'Expense List', criticalTabs: true },
      { key: 'new_expense', label: 'New Expense', criticalTabs: true }
    ],
    coordinator: [
      { key: 'expense_list', label: 'Expense List', criticalTabs: true },
      { key: 'new_expense', label: 'New Expense', criticalTabs: true }
    ],
    user: [
      { key: 'new_expense', label: 'New Expense', criticalTabs: true },
      { key: 'expense_list', label: 'Expense List', criticalTabs: true }
    ]
  };

  // Helper to get tab options for a given role
  function getTabOptionsForRole(role) {
    if (!role) return [];
    if (role === 'admin') return TAB_OPTIONS_BY_ROLE.admin;
    if (role === 'hr') return TAB_OPTIONS_BY_ROLE.hr;
    if (role === 'accounts') return TAB_OPTIONS_BY_ROLE.accounts;
    if (role === 'coordinator') return TAB_OPTIONS_BY_ROLE.coordinator;
    if (role === 'user') return TAB_OPTIONS_BY_ROLE.user;
    return [];
  }

  // Helper to get a description for each role
  function getRoleDescription(role) {
    switch (role) {
      case 'admin': return 'Admin can access all tabs and manage the system.';
      case 'hr': return 'HR can manage employees, users, and organization data.';
      case 'accounts': return 'Accounts can manage financial and project data.';
      case 'coordinator': return 'Coordinator can review and manage department expenses.';
      case 'user': return 'User can submit and view their own expenses.';
      default: return '';
    }
  }

  // Add this helper to get icon for each tab key
  const TAB_ICONS = {
    all_employees: <DashboardIcon color="primary" />,
    add_user: <ManageAccountsIcon color="primary" />,
    bulk_upload: <CloudUploadIcon color="primary" />,
    employee: <BadgeIcon color="primary" />,
    coordinator_departments: <SupervisorAccountIcon color="primary" />,
    projects: <AssignmentIndIcon color="primary" />,
    departments: <DomainIcon color="primary" />,
    designations: <WorkOffIcon color="primary" />,
    locations: <LocationOnIcon color="primary" />,
    new_expense: <PlayArrowIcon color="primary" />,
    expense_list: <GroupsIcon color="primary" />
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <DashboardCard sx={{ mb: 3, bgcolor: 'primary.lighter' }}>
      

        {/* Stats Section */}
        <Box sx={{ 
          background: 'linear-gradient(145deg, rgba(25, 118, 210, 0.05), rgba(33, 150, 243, 0.05))',
          p: 2,
          borderRadius: 3 
        }}>
          <StatCategory>
           
            <Grid container spacing={1} sx={{ flexWrap: 'wrap' }}>
              {[
                { icon: <GroupsIcon />, title: "Total", value: employees.length, type: 'total' },
                { icon: <GroupIcon />, title: "Active", value: employees.filter(e => e.status === 'active').length, type: 'active' },
                { icon: <WorkOffIcon />, title: "Inactive", value: employees.filter(e => e.status === 'inactive').length, type: 'inactive' },
                { icon: <SupervisorAccountIcon />, title: "Admins", value: employees.filter(e => e.role === 'admin' && e.status === 'active').length, type: 'admin' },
                { icon: <ManageAccountsIcon />, title: "HR", value: employees.filter(e => e.role === 'hr' && e.status === 'active').length, type: 'hr' },
                { icon: <AccountBalanceIcon />, title: "Accounts", value: employees.filter(e => e.role === 'accounts' && e.status === 'active').length, type: 'accounts' },
                { icon: <AssignmentIndIcon />, title: "Coordinators", value: employees.filter(e => e.role === 'coordinator' && e.status === 'active').length, type: 'coordinator' },
                { icon: <GroupIcon />, title: "Users", value: employees.filter(e => e.role === 'user' && e.status === 'active').length, type: 'users' },
                { icon: <BadgeIcon />, title: "Pending", value: employees.filter(e => !e.role || e.role === 'Not Activated').length, type: 'pending' }
              ].map((stat, index) => (
                <Grid item xs={6} sm={4} md={3} lg="auto" key={index} sx={{ 
                  flex: { lg: '1 1 0' },
                  minWidth: { lg: 0 }
                }}>
                  <StatsCard cardtype={stat.type}>
                    {stat.icon}
                    <Typography variant="h4" fontWeight="bold">
                      {stat.value}
                    </Typography>
                    <Typography variant="subtitle2">{stat.title}</Typography>
                  </StatsCard>
                </Grid>
              ))}
            </Grid>
          </StatCategory>
        </Box>
      </DashboardCard>

      {/* Search and Filter Section */}
      <DashboardCard sx={{ mb: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          alignItems: { xs: 'stretch', sm: 'center' },
          flexWrap: 'wrap',
          width: '100%'
        }}>
          <Box sx={{ 
            display: 'flex', 
            gap: 2,
            width: { xs: '100%', sm: 'auto' },
            flexGrow: 1,
            flexWrap: 'wrap'
          }}>
            <TextField
              placeholder="Search employees..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ 
                width: { xs: '100%', sm: '250px' },
                flexGrow: { sm: 1 },
                maxWidth: '400px',
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper'
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
              select
              size="small"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              label="Filter by Role"
              sx={{ 
                width: { xs: '100%', sm: '200px' }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterListIcon color="action" />
                  </InputAdornment>
                ),
              }}
            >
              {roleOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      size="small"
                      label=""
                      color={option.value === 'Not Activated' ? 'warning' : 'primary'}
                      sx={{ 
                        minWidth: 20,
                        visibility: option.value === 'all' ? 'hidden' : 'visible'
                      }}
                    />
                    {option.label}
                  </Box>
                </MenuItem>
              ))}
            </TextField>
            {/* Add status filter */}
            <TextField
              select
              size="small"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Filter by Status"
              sx={{ 
                width: { xs: '100%', sm: '180px' }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterListIcon color="action" />
                  </InputAdornment>
                ),
              }}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' }, alignItems: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<FileDownloadIcon />}
              onClick={exportToExcel}
              disabled={filteredEmployees.length === 0}
              sx={{
                width: { xs: '100%', sm: 'auto' },
                height: 40,
                minWidth: 180,
                borderRadius: 2,
                background: 'linear-gradient(45deg, #388e3c 30%, #4caf50 90%)',
                color: 'white',
                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.25)',
                flexShrink: 0,
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
            {(user?.role === 'admin' || user?.role === 'hr') && (
              <Button
                variant="outlined"
                color="warning"
                onClick={() => { setShowExpiredModal(true); fetchExpiredEmployees(); }}
                sx={{
                  width: { xs: '100%', sm: 'auto' },
                  height: 40,
                  minWidth: 220,
                  borderRadius: 2,
                  ml: { xs: 0, sm: 2 },
                  flexShrink: 0
                }}
              >
                Show Expired Activation Employees
              </Button>
            )}
          </Box>
        </Box>
      </DashboardCard>

      {/* Column Selector Modal */}
      <Dialog open={columnModalOpen} onClose={() => setColumnModalOpen(false)} maxWidth="md" fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            width: { xs: '100vw', sm: 'auto' },
            maxWidth: { xs: '100vw', sm: '100%' }
          }
        }}
      >
        <DialogTitle>Select Columns to Display</DialogTitle>
        <DialogContent>
          <FormGroup row sx={{ flexWrap: 'wrap', gap: 2 }}>
            {ALL_COLUMNS.filter(col => col.key !== 'actions').map(col => (
              <FormControlLabel
                key={col.key}
                control={
                  <Checkbox
                    checked={selectedColumns.includes(col.key)}
                    onChange={() => handleColumnToggle(col.key)}
                    color="primary"
                    size="small"
                  />
                }
                label={col.label}
                sx={{ mr: 2, minWidth: 180 }}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setColumnModalOpen(false)} variant="contained" color="primary">
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* Button to open column selector modal */}
      <Box sx={{ mb: 2, px: { xs: 1, sm: 2 }, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => setColumnModalOpen(true)}
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          Select Columns
        </Button>
      </Box>

      {/* Table Section */}
      <TableContainer sx={{
        ...tableContainerStyles,
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'auto',
        // Responsive height for mobile/tablet/desktop
        maxHeight: { xs: '60vh', sm: '70vh' }
      }}>
        <Table
          size="small"
          stickyHeader
          sx={{
            minWidth: selectedColumns.length * 220 + 220,
            tableLayout: 'fixed',
            width: '100%',
            maxWidth: '100vw'
          }}
        >
          <TableHead>
            <TableRow>
              {ALL_COLUMNS.filter(col => selectedColumns.includes(col.key) || col.key === 'actions').map((col) => (
                <StyledTableCell
                  key={col.key}
                  sx={{
                    minWidth: col.minWidth + 60,
                    ...(col.align ? { textAlign: col.align } : {}),
                    position: 'relative',
                    bgcolor: headerColor,
                    background: `linear-gradient(90deg, ${headerColor} 0%, #ffffff 100%)`,
                    boxShadow: '0 1px 4px rgba(21,101,192,0.07)',
                    borderBottom: `1.5px solid #bbdefb`,
                    height: '32px', // further decreased height
                    transition: 'background 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      background: `linear-gradient(90deg, #ffffff 0%, ${headerColor} 100%)`,
                      boxShadow: `0 2px 8px #bbdefb`
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title={`Sort by ${col.label}`} arrow>
                      <IconButton
                        size="small"
                        onClick={() => handleSort(col.key)}
                        sx={{
                          p: 0.5,
                          ml: -0.5,
                          color: sortBy === col.key ? headerTextColor : '#90caf9'
                        }}
                      >
                        {sortBy === col.key
                          ? (sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)
                          : <UnfoldMoreIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        color: headerTextColor,
                        fontFamily: 'Roboto, Arial, sans-serif',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        textShadow: `0 1px 4px #bbdefb`
                      }}
                    >
                      {col.label}
                    </Typography>
                  </Box>
                  {/* Colored underline */}
                  {/* <Box sx={{
                    height: 1.5,
                    width: '60%',
                    background: '#90caf9',
                    borderRadius: 2,
                    mt: 0.5,
                    mx: 'auto'
                  }} /> */}
                  {/* Column filter UI */}
                  {col.key !== 'actions' && (
                    <Box sx={{
                      mt: 0.5,
                      px: 1,
                      py: 0.5,
                      bgcolor: '#f5faff',
                      borderRadius: 2,
                      boxShadow: '0 1px 4px #e3f2fd',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      minHeight: 40
                    }}>
                      {getColumnType(col.key) === 'text' && (
                        <TextField
                          size="small"
                          variant="outlined"
                          placeholder={`${col.label}`}
                          value={columnFilters[col.key] || ''}
                          onChange={e => handleColumnFilterChange(col.key, e.target.value)}
                          sx={{
                            width: '100%',
                            fontSize: '0.85rem',
                            bgcolor: '#fff',
                            borderRadius: 1,
                            boxShadow: '0 1px 2px #e3f2fd'
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon fontSize="small" color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                      {getColumnType(col.key) === 'select' && (
                        <TextField
                          select
                          SelectProps={{
                            multiple: true,
                            renderValue: (selected) => Array.isArray(selected) && selected.length
                              ? selected.map(val => {
                                  // Find label for value
                                  let label = val;
                                  if (col.key === 'role') {
                                    const found = roleOptions.find(opt => opt.value === val);
                                    label = found ? found.label : val;
                                  } else if (col.key === 'status') {
                                    const found = statusOptions.find(opt => opt.value === val);
                                    label = found ? found.label : val;
                                  } else if (col.key === 'department_name') {
                                    const found = departmentOptions.find(opt => opt.value === val);
                                    label = found ? found.label : val;
                                  } else if (col.key === 'designation_name') {
                                    const found = designationOptions.find(opt => opt.value === val);
                                    label = found ? found.label : val;
                                  } else if (col.key === 'location_name') {
                                    const found = locationOptions.find(opt => opt.value === val);
                                    label = found ? found.label : val;
                                  }
                                  return (
                                    <Chip
                                      key={val}
                                      label={label}
                                      size="small"
                                      sx={{ mr: 0.5, bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 500 }}
                                    />
                                  );
                                })
                              : <span style={{ color: '#90caf9' }}>Select...</span>
                          }}
                          size="small"
                          variant="outlined"
                          value={columnFilters[col.key] || []}
                          onChange={e => handleColumnFilterChange(col.key, typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                          sx={{
                            width: '100%',
                            fontSize: '0.85rem',
                            bgcolor: '#fff',
                            borderRadius: 1,
                            boxShadow: '0 1px 2px #e3f2fd'
                          }}
                        >
                          {/* Role/Status/Department/Designation/Location options */}
                          {col.key === 'role' && roleOptions.map(opt => (
                            <MenuItem key={opt.value} value={opt.value}>
                              <Chip label={opt.label} size="small" sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 500 }} />
                            </MenuItem>
                          ))}
                          {col.key === 'status' && statusOptions.map(opt => (
                            <MenuItem key={opt.value} value={opt.value}>
                              <Chip label={opt.label} size="small" sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 500 }} />
                            </MenuItem>
                          ))}
                          {col.key === 'department_name' && departmentOptions.map(opt => (
                            <MenuItem key={opt.value} value={opt.value}>
                              <Chip label={opt.label} size="small" sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 500 }} />
                            </MenuItem>
                          ))}
                          {col.key === 'designation_name' && designationOptions.map(opt => (
                            <MenuItem key={opt.value} value={opt.value}>
                              <Chip label={opt.label} size="small" sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 500 }} />
                            </MenuItem>
                          ))}
                          {col.key === 'location_name' && locationOptions.map(opt => (
                            <MenuItem key={opt.value} value={opt.value}>
                              <Chip label={opt.label} size="small" sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 500 }} />
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                      {getColumnType(col.key) === 'date' && (
                        <TextField
                          type="date"
                          size="small"
                          variant="outlined"
                          value={columnFilters[col.key] || ''}
                          onChange={e => handleColumnFilterChange(col.key, e.target.value)}
                          sx={{
                            width: '100%',
                            fontSize: '0.85rem',
                            bgcolor: '#fff',
                            borderRadius: 1,
                            boxShadow: '0 1px 2px #e3f2fd'
                          }}
                        />
                      )}
                    </Box>
                  )}
                </StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={selectedColumns.length + 1} sx={{ textAlign: 'center', py: 8 }}>
                  <CircularProgress />
                  <Typography sx={{ mt: 2, color: 'text.secondary' }}>
                    Loading employees...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : paginatedEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={selectedColumns.length + 1} sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary">
                    No employees found
                  </Typography>
                  <Typography color="text.secondary">
                    Try adjusting your search or filters
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedEmployees.map((employee) => {
                // Compose full name with middle name if present
                const fullName = (
                  (employee.first_name || employee.middle_name || employee.last_name)
                    ? `${employee.first_name || ''}${employee.middle_name ? ' ' + employee.middle_name : ''}${employee.last_name ? ' ' + employee.last_name : ''}`.replace(/\s+/g, ' ').trim()
                    : employee.full_name
                );
                let chipBg = '#e3f2fd';
                let chipText = '#1976d2';
                if (!employee.role || employee.role === 'Not Activated') {
                  chipBg = '#fff3e0';
                  chipText = '#ef6c00';
                } else if (employee.status === 'inactive') {
                  chipBg = '#ffebee';
                  chipText = '#d32f2f';
                } else if (employee.status === 'active') {
                  chipBg = '#e8f5e9';
                  chipText = '#2e7d32';
                }
                return (
                  <StyledTableRow key={employee.emp_id}>
                    {ALL_COLUMNS.filter(col => selectedColumns.includes(col.key) || col.key === 'actions').map(col => {
                      if (col.key === 'emp_code') {
                        return (
                          <TableCell key="emp_code">
                            <TableCellContent>
                              <Typography variant="body2">{employee.emp_code}</Typography>
                            </TableCellContent>
                          </TableCell>
                        );
                      }
                      if (col.key === 'full_name') {
                        return (
                          <TableCell key="full_name">
                            <TableCellContent>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {fullName}
                              </Typography>
                            </TableCellContent>
                          </TableCell>
                        );
                      }
                        if (col.key === 'username') {
                        return (
                          <TableCell key="username" sx={{ maxWidth: 220, wordBreak: 'break-word', whiteSpace: 'normal', overflowWrap: 'anywhere' }}>
                            <TableCellContent>
                              <Typography variant="body2" sx={{ wordBreak: 'break-word', whiteSpace: 'normal', overflowWrap: 'anywhere' }}>{employee.username}</Typography>
                            </TableCellContent>
                          </TableCell>
                        );
                      }
                      if (col.key === 'email') {
                        return (
                          <TableCell key="email" sx={{ maxWidth: 260, wordBreak: 'break-word', whiteSpace: 'normal', overflowWrap: 'anywhere' }}>
                            <TableCellContent>
                              <Typography variant="body2" sx={{ wordBreak: 'break-word', whiteSpace: 'normal', overflowWrap: 'anywhere' }}>{employee.email}</Typography>
                            </TableCellContent>
                          </TableCell>
                        );
                      }
                      if (col.key === 'role') {
                        return (
                          <TableCell key="role">
                            <Box sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '100%',
                            }}>
                              <Chip 
                                label={
                                  !employee.role || employee.role === 'Not Activated'
                                    ? (
                                      <Box sx={{
                                        textAlign: 'center',
                                        lineHeight: 1.2,
                                        fontWeight: 700,
                                        fontSize: '1.15rem',
                                        letterSpacing: '1px',
                                        py: 0.5,
                                        px: 0.5,
                                        background: 'linear-gradient(135deg, #fff3e0 60%, #ffe0b2 100%)',
                                        borderRadius: 1,
                                        color: '#ef6c00',
                                        boxShadow: '0 2px 8px rgba(239,108,0,0.08)',
                                        minWidth: 120,
                                        display: 'inline-block'
                                      }}>
                                        <span style={{ fontSize: '1.15rem', fontWeight: 700 }}>PENDING</span>
                                        <br />
                                        <span style={{ fontSize: '1.05rem', fontWeight: 600, letterSpacing: '0.5px' }}>ACTIVATION</span>
                                      </Box>
                                    )
                                    : employee.role?.toUpperCase()
                                }
                                sx={{
                                  fontWeight: 700,
                                  fontSize: '1rem',
                                  px: 2.5,
                                  py: 1,
                                  borderRadius: 2,
                                  background: chipBg,
                                  color: chipText,
                                  border: `1px solid ${chipText}`,
                                  boxShadow: '0 2px 8px rgba(25,118,210,0.08)',
                                  minWidth: 160,
                                  maxWidth: 400,
                                  whiteSpace: 'normal',
                                  overflow: 'visible',
                                  textOverflow: 'unset',
                                  textAlign: 'center',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  display: 'inline-flex'
                                }}
                                size="medium"
                              />
                            </Box>
                          </TableCell>
                        );
                      }
                      if (col.key === 'mobile_number') {
                        return (
                          <TableCell key="mobile_number">{getMobileDisplay(employee.mobile_number)}</TableCell>
                        );
                      }
                      if (col.key === 'designation_name') {
                        return (
                          <TableCell key="designation_name">
                            <Chip
                              label={employee.designation_name || 'N/A'}
                              sx={{
                                background: getColor(designationColors, employee.designation_name),
                                color: '#fff',
                                fontWeight: 600,
                                px: 2,
                                py: 0.5,
                                borderRadius: 2,
                                fontSize: '0.95rem'
                              }}
                              size="small"
                            />
                          </TableCell>
                        );
                      }
                      if (col.key === 'department_name') {
                        return (
                          <TableCell key="department_name">
                            <Chip
                              label={employee.department_name || 'N/A'}
                              sx={{
                                background: getColor(departmentColors, employee.department_name),
                                color: '#fff',
                                fontWeight: 600,
                                px: 2,
                                py: 0.5,
                                borderRadius: 2,
                                fontSize: '0.95rem'
                              }}
                              size="small"
                            />
                          </TableCell>
                        );
                      }
                      if (col.key === 'location_name') {
                        return (
                          <TableCell key="location_name">
                            <Chip
                              label={employee.location_name || 'N/A'}
                              sx={{
                                background: getColor(locationColors, employee.location_name),
                                color: '#fff',
                                fontWeight: 600,
                                px: 2,
                                py: 0.5,
                                borderRadius: 2,
                                fontSize: '0.95rem'
                              }}
                              size="small"
                            />
                          </TableCell>
                        );
                      }
                      if (col.key === 'gender') {
                        return (
                          <TableCell key="gender">{employee.gender || 'N/A'}</TableCell>
                        );
                      }
                      if (col.key === 'category') {
                        return (
                          <TableCell key="category">{employee.category || 'N/A'}</TableCell>
                        );
                      }
                      if (col.key === 'birth_of_date') {
                        return (
                          <TableCell key="birth_of_date">{employee.birth_of_date ? formatDisplayDate(employee.birth_of_date) : 'N/A'}</TableCell>
                        );
                      }
                      if (col.key === 'first_reporting_manager_name') {
                        return (
                          <TableCell key="first_reporting_manager_name">{employee.first_reporting_manager_name || 'N/A'}</TableCell>
                        );
                      }
                      if (col.key === 'second_reporting_manager_name') {
                        return (
                          <TableCell key="second_reporting_manager_name">{employee.second_reporting_manager_name || 'N/A'}</TableCell>
                        );
                      }
                      if (col.key === 'last_employment_date') {
                        return (
                          <TableCell key="last_employment_date">
                            {employee.last_employment_date ? (
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {formatDisplayDate(employee.last_employment_date)}
                              </Typography>
                            ) : (
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                &nbsp;
                              </Typography>
                            )}
                          </TableCell>
                        );
                      }
                      if (col.key === 'date_of_joining') {
                        return (
                          <TableCell key="date_of_joining">
                            {employee.date_of_joining ? (
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {formatDisplayDate(employee.date_of_joining)}
                              </Typography>
                            ) : (
                              <Typography variant="body2" color="text.secondary">N/A</Typography>
                            )}
                          </TableCell>
                        );
                      }
                      if (col.key === 'status') {
                        let statusLabel = '';
                        if (!employee.role || employee.role === 'Not Activated') {
                          statusLabel = (
                            <Box sx={{
                              textAlign: 'center',
                              lineHeight: 1.2,
                              fontWeight: 700,
                              fontSize: '1.15rem',
                              letterSpacing: '1px',
                              py: 0.5,
                              px: 0.5,
                              background: 'linear-gradient(135deg, #fff3e0 60%, #ffe0b2 100%)',
                              borderRadius: 1,
                              color: '#ef6c00',
                              boxShadow: '0 2px 8px rgba(239,108,0,0.08)',
                              minWidth: 120,
                              display: 'inline-block'
                            }}>
                              <span style={{ fontSize: '1.15rem', fontWeight: 700 }}>PENDING</span>
                              <br />
                              <span style={{ fontSize: '1.05rem', fontWeight: 600, letterSpacing: '0.5px' }}>ACTIVATION</span>
                            </Box>
                          );
                        } else if (employee.status === 'inactive') {
                          statusLabel = employee.inactive_reason
                            ? employee.inactive_reason.toUpperCase()
                            : 'TERMINATED';
                        } else if (employee.status === 'active') {
                          statusLabel = 'ACTIVE';
                        } else {
                          statusLabel = employee.status?.toUpperCase() || '';
                        }
                        return (
                          <TableCell key="status">
                            <Box sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '100%',
                            }}>
                              <Chip 
                                label={statusLabel}
                                sx={{
                                  fontWeight: 700,
                                  fontSize: '1rem',
                                  px: 2.5,
                                  py: 1,
                                  borderRadius: 2,
                                  background: chipBg,
                                  color: chipText,
                                  border: `1px solid ${chipText}`,
                                  boxShadow: '0 2px 8px rgba(25,118,210,0.08)',
                                  minWidth: 160,
                                  maxWidth: 400,
                                  whiteSpace: 'normal',
                                  overflow: 'visible',
                                  textOverflow: 'unset',
                                  textAlign: 'center',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  display: 'inline-flex'
                                }}
                                size="medium"
                              />
                            </Box>
                          </TableCell>
                        );
                      }
                      if (col.key === 'actions') {
                        return (
                          <TableCell key="actions" sx={{ minWidth: 180 }}>
                            <Box sx={{ 
                              display: 'flex',
                              gap: 1,
                              justifyContent: 'center',
                              '& .MuiButtonGroup-root': {
                                boxShadow: 1,
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                  boxShadow: 2,
                                  transform: 'translateY(-2px)'
                                }
                              }
                            }}>
                              <ButtonGroup 
                                size="small" 
                                sx={{ 
                                  bgcolor: 'transparent',
                                  borderRadius: 2,
                                  '& .MuiIconButton-root': {
                                    bgcolor: 'background.paper',
                                    borderRadius: '8px',
                                    m: 0.5,
                                    '&:hover': {
                                      transform: 'scale(1.1)',
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    },
                                    transition: 'all 0.3s'
                                  }
                                }}
                              >
                                <Tooltip title="Edit Employee" arrow placement="top">
                                  <ActionButton
                                    color="primary"
                                    onClick={() => handleEdit(employee)}
                                    size="small"
                                  >
                                    <EditIcon fontSize="small" />
                                  </ActionButton>
                                </Tooltip>
                                {/* Password Reset Button for admin */}
                                {user.role === 'admin' && employee.email && (
                                  <Tooltip title="Reset Password" arrow placement="top">
                                    <span>
                                      <ActionButton
                                        color="warning"
                                        onClick={() => handleResetPasswordClick(employee)}
                                        size="small"
                                        disabled={resetLoading}
                                      >
                                        <LockResetIcon fontSize="small" />
                                      </ActionButton>
                                    </span>
                                  </Tooltip>
                                )}
                                {(user.role === 'admin' || user.role === 'hr') && (
                                  <>
                                    {employee.status !== 'inactive' ? (
                                      <Tooltip title="Terminate Employee" arrow placement="top">
                                        <ActionButton
                                          color="error"
                                          onClick={() => handleTerminate(employee)}
                                          size="small"
                                        >
                                          <BlockIcon fontSize="small" />
                                        </ActionButton>
                                      </Tooltip>
                                    ) : (
                                      <Tooltip title="Reactivate Employee" arrow placement="top">
                                        <ActionButton
                                          color="success"
                                          onClick={() => handleReactivate(employee)}
                                          size="small"
                                        >
                                          <PlayArrowIcon fontSize="small" />
                                        </ActionButton>
                                      </Tooltip>
                                    )}
                                  </>
                                )}
                                {user.role === 'admin' && (
                                  <Tooltip title="Set Tab Permissions">
                                    <IconButton onClick={() => handleTabPermOpen(employee)}>
                                      <SettingsIcon color="primary" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </ButtonGroup>
                            </Box>
                          </TableCell>
                        );
                      }
                      return null;
                    })}
                  </StyledTableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Add pagination below table */}
      <Box sx={{ 
        mt: 2, 
        display: 'flex', 
        justifyContent: 'center',
        '& .MuiPagination-ul': {
          gap: 1
        }
      }}>
        <Pagination
          count={Math.ceil(filteredEmployees.length / rowsPerPage)}
          page={page}
          onChange={handlePageChange}
          color="primary"
          size="large"
          showFirstButton
          showLastButton
        />
      </Box>

      <EditEmployeeDialog
        open={Boolean(editEmployee)}
        onClose={() => setEditEmployee(null)}
        employee={editEmployee}
        onSave={handleSave}
        departments={departments}
        designations={designations}
        locations={locations}
        employees={employees}
      />

      <TerminateEmployeeDialog
        open={Boolean(terminateEmployee)}
        onClose={() => setTerminateEmployee(null)}
        employee={terminateEmployee}
        onSuccess={fetchEmployees}
      />

      {/* Improved Reactivate confirmation dialog */}
      <Dialog
        open={Boolean(reactivateEmployee)}
        onClose={() => setReactivateEmployee(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PlayArrowIcon color="success" sx={{ fontSize: 32 }} />
          Confirm Reactivation
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
            <Box sx={{ color: 'warning.main', display: 'flex', alignItems: 'center' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="12" fill="#FFF3E0"/>
                <path d="M12 8v4m0 4h.01" stroke="#EF6C00" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Are you sure you want to <b style={{ color: '#2e7d32' }}>reactivate</b>{' '}
              <span style={{ fontWeight: 700 }}>
                {reactivateEmployee?.first_name} {reactivateEmployee?.last_name}
              </span>
              ?
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This will restore the employee's access and status to <b>active</b>.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setReactivateEmployee(null)}
            color="inherit"
            variant="outlined"
            sx={{ borderRadius: 2, minWidth: 100 }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmReactivate}
            color="success"
            variant="contained"
            sx={{
              borderRadius: 2,
              minWidth: 160,
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(46,125,50,0.12)',
              background: 'linear-gradient(90deg, #43a047 0%, #66bb6a 100%)'
            }}
          >
            Yes, Reactivate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Confirmation Dialog */}
      <Dialog
        open={Boolean(resetEmployee)}
        onClose={() => setResetEmployee(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LockResetIcon color="warning" sx={{ fontSize: 32 }} />
          Confirm Password Reset
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            Are you sure you want to send a password reset link to{' '}
            <span style={{ fontWeight: 700 }}>{resetEmployee?.first_name} {resetEmployee?.last_name}</span>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This will send a reset link to <b>{resetEmployee?.email}</b> allowing the user to set a new password.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setResetEmployee(null)}
            color="inherit"
            variant="outlined"
            sx={{ borderRadius: 2, minWidth: 100 }}
            disabled={resetLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmResetPassword}
            color="warning"
            variant="contained"
            sx={{
              borderRadius: 2,
              minWidth: 160,
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(239,108,0,0.12)',
              background: 'linear-gradient(90deg, #ffa726 0%, #ffb74d 100%)'
            }}
            disabled={resetLoading}
          >
            {resetLoading ? 'Sending...' : 'Yes, Send Link'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tab Permission Dialog */}
      <Dialog
        open={tabPermDialog.open}
        onClose={() => setTabPermDialog({ open: false, employee: null, value: [] })}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(25,118,210,0.10)',
            background: 'linear-gradient(135deg, #f8fafd 0%, #e3f2fd 100%)',
            p: 2
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon color="primary" sx={{ fontSize: 28, mr: 1 }} />
          Set Tab Permissions
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={tabPermDialog.employee?.role?.toUpperCase() || 'N/A'}
              color={
                tabPermDialog.employee?.role === 'admin' ? 'secondary'
                : tabPermDialog.employee?.role === 'hr' ? 'primary'
                : tabPermDialog.employee?.role === 'accounts' ? 'warning'
                : tabPermDialog.employee?.role === 'coordinator' ? 'success'
                : 'info'
              }
              sx={{
                fontWeight: 700,
                fontSize: '1rem',
                px: 2,
                py: 0.5,
                borderRadius: 2,
                letterSpacing: '1px'
              }}
            />
            <Typography variant="body2" color="text.secondary">
              {getRoleDescription(tabPermDialog.employee?.role)}
            </Typography>
          </Box>
          <FormGroup>
            {(tabPermDialog.tabOptions || getTabOptionsForRole(tabPermDialog.employee?.role)).length > 0 &&
              (tabPermDialog.tabOptions || getTabOptionsForRole(tabPermDialog.employee?.role)).map(tab => {
                // All roles: allow toggling all tabs, including expense_list and allowance_rates
                return (
                  <FormControlLabel
                    key={tab.key}
                    control={
                      <Checkbox
                        checked={tabPermDialog.value.includes(tab.key)}
                        onChange={e => {
                          const checked = e.target.checked;
                          setTabPermDialog(prev => ({
                            ...prev,
                            value: checked
                              ? [...prev.value, tab.key]
                              : prev.value.filter(k => k !== tab.key)
                          }));
                        }}
                        disabled={false}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {TAB_ICONS?.[tab.key] || <DashboardIcon color="primary" />}
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{tab.label}</Typography>
                        {tab.criticalTabs && (
                          <Chip
                            label="Critical"
                            size="small"
                            color="warning"
                            icon={<LockResetIcon fontSize="small" />}
                            sx={{ ml: 1, fontWeight: 600 }}
                          />
                        )}
                        <Chip
                          label={tab.key}
                          size="small"
                          sx={{
                            bgcolor: '#e3f2fd',
                            color: '#1565c0',
                            fontWeight: 500,
                            ml: 1
                          }}
                        />
                      </Box>
                    }
                  />
                );
              })}
            {/* Show message for user role or if no tabs */}
            {(getTabOptionsForRole(tabPermDialog.employee?.role).length === 0) && (
              <Typography color="text.secondary" sx={{ mt: 2 }}>
                No configurable tabs for this role.
              </Typography>
            )}
          </FormGroup>
          {/* Live Preview */}
          <Box sx={{ mt: 3, p: 2, bgcolor: '#f5faff', borderRadius: 2, border: '1px solid #e3f2fd' }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              This user will see these tabs:
            </Typography>
            {/* For no tabs, show nothing */}
            {getTabOptionsForRole(tabPermDialog.employee?.role).length === 0 ? (
              <Typography color="warning.main" sx={{ fontWeight: 500 }}>
                No configurable tabs for this role.
              </Typography>
            ) : tabPermDialog.value.length === 0 ? (
              <Typography color="warning.main" sx={{ fontWeight: 500 }}>
                No tabs selected. The user will only see the default tab(s).
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {getTabOptionsForRole(tabPermDialog.employee?.role)
                  .filter(tab => tabPermDialog.value.includes(tab.key))
                  .map(tab => (
                    <Chip
                      key={tab.key}
                      icon={TAB_ICONS[tab.key] || <DashboardIcon color="primary" />}
                      label={tab.label}
                      sx={{
                        bgcolor: '#e3f2fd',
                        color: '#1565c0',
                        fontWeight: 600,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                        fontSize: '0.95rem'
                      }}
                    />
                  ))}
              </Box>
            )}
          </Box>
          {/* Show current permissions if any */}
          {Array.isArray(tabPermDialog.employee?.tab_permissions) && tabPermDialog.employee.tab_permissions.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Current tab permissions: {tabPermDialog.employee.tab_permissions.map(k => getTabOptionsForRole(tabPermDialog.employee?.role).find(t => t.key === k)?.label || k).join(', ')}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTabPermDialog({ open: false, employee: null, value: [] })}>Cancel</Button>
          <Button onClick={handleTabPermSave} variant="contained" color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Expired Activation Modal */}
      <Dialog open={showExpiredModal} onClose={() => setShowExpiredModal(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Employees with Expired Activation Token</DialogTitle>
        <DialogContent>
          <Typography variant="h6" sx={{ mb: 2, color: 'error.main', fontWeight: 700 }}>
            Token Expired Employees
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Checkbox
                      checked={expiredEmployees.filter(emp => (!emp.status || emp.status === 'Not Activated' || emp.status === 'pending') && emp.expires_at && new Date(emp.expires_at) < new Date()).length > 0 &&
                        expiredEmployees.filter(emp => (!emp.status || emp.status === 'Not Activated' || emp.status === 'pending') && emp.expires_at && new Date(emp.expires_at) < new Date()).every(emp => selectedExpiredIds.includes(emp.emp_id))
                      }
                      indeterminate={selectedExpiredIds.length > 0 &&
                        selectedExpiredIds.length < expiredEmployees.filter(emp => (!emp.status || emp.status === 'Not Activated' || emp.status === 'pending') && emp.expires_at && new Date(emp.expires_at) < new Date()).length}
                      onChange={e => {
                        const checked = e.target.checked;
                        const filtered = expiredEmployees.filter(emp => (!emp.status || emp.status === 'Not Activated' || emp.status === 'pending') && emp.expires_at && new Date(emp.expires_at) < new Date());
                        setSelectedExpiredIds(checked ? filtered.map(emp => emp.emp_id) : []);
                      }}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>Employee Code</TableCell>
                  <TableCell>Full Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Token Expiry</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expiredEmployees
                  .filter(emp => (!emp.status || emp.status === 'Not Activated' || emp.status === 'pending') && emp.expires_at && new Date(emp.expires_at) < new Date())
                  .map(emp => (
                    <TableRow key={emp.emp_id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedExpiredIds.includes(emp.emp_id)}
                          onChange={() => handleSelectExpired(emp.emp_id)}
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>{emp.emp_code}</TableCell>
                      <TableCell>{emp.first_name}</TableCell>
                      <TableCell>{emp.email}</TableCell>
                      <TableCell>{emp.status || 'Pending Activation'}</TableCell>
                      <TableCell>{emp.expires_at ? new Date(emp.expires_at).toLocaleString() : '-'}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          {resendExpiredResult && (
            <Typography sx={{ mt: 2, color: resendExpiredResult.startsWith('Error') ? 'error.main' : 'success.main' }}>
              {resendExpiredResult}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExpiredModal(false)} color="primary" variant="outlined">Close</Button>
          <Button
            onClick={handleResendSelectedExpired}
            color="secondary"
            variant="contained"
            disabled={resendExpiredLoading || selectedExpiredIds.length === 0}
          >
            Resend Activation to Selected
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AllEmployees;

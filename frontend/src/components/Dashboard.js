import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Routes, Route } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Tab,
  Tabs,
  IconButton,
  Menu,
  Avatar,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  MenuItem
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { grey } from '@mui/material/colors';
import ArrowDropDownCircleIcon from '@mui/icons-material/ArrowDropDownCircle';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import AccountBoxRoundedIcon from '@mui/icons-material/AccountBoxRounded';
import EnhancedEncryptionIcon from '@mui/icons-material/EnhancedEncryption';
import AddCardIcon from '@mui/icons-material/AddCard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import DomainIcon from '@mui/icons-material/Domain';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../context/AuthContext';
import NewExpense from './NewExpense';
import ExpenseList from './ExpenseList';
import AddEmployee from './AddEmployee';
import AddUser from './AddUser';
import EmployeeInformation from './EmployeeInformation';
import AllEmployees from './AllEmployees';
import EditExpense from './EditExpense';
import ChangePassword from './ChangePassword';
import CsvUpload from './CsvUpload';
import ProjectsDashboard from './ProjectsDashboard';
import DepartmentsDashboard from './DepartmentsDashboard';
import DesignationsDashboard from './DesignationsDashboard';
import LocationsDashboard from './LocationsDashboard';
import CoordinatorDepartmentsDashboard from './CoordinatorDepartmentsDashboard';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import DashboardAllowance from './DashboardAllowance';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

// Canonical tab list for admin/HR/accounts/coordinator/accounts
const CANONICAL_TABS = [
  { label: 'All Employees', component: <AllEmployees />, icon: <PeopleAltRoundedIcon />, key: 'all_employees', criticalTabs: false },
  { label: 'Add User', component: <AddUser />, icon: <PersonAddAlt1Icon />, key: 'add_user', criticalTabs: false },
  { label: 'Bulk Upload', component: <CsvUpload />, icon: <CloudUploadIcon />, key: 'bulk_upload', criticalTabs: false },
  { label: 'Employee', component: <AddEmployee />, icon: <BadgeRoundedIcon />, key: 'employee', criticalTabs: false },
  { label: 'Department Coordinators', component: <CoordinatorDepartmentsDashboard />, icon: <SupervisorAccountIcon />, key: 'coordinator_departments', criticalTabs: false },
  { label: 'DA (Daily Allowance)', component: <DashboardAllowance />, icon: <MonetizationOnIcon />, key: 'allowance_rates', criticalTabs: false },
  { label: 'Projects', component: <ProjectsDashboard />, icon: <FolderSharedIcon />, key: 'projects', criticalTabs: false },
  { label: 'Departments', component: <DepartmentsDashboard />, icon: <DomainIcon />, key: 'departments', criticalTabs: false },
  { label: 'Designations', component: <DesignationsDashboard />, icon: <WorkIcon />, key: 'designations', criticalTabs: false },
  { label: 'Locations', component: <LocationsDashboard />, icon: <LocationOnIcon />, key: 'locations', criticalTabs: false }
];

// Add criticalTabs to these
const CRITICAL_TABS = [
  { label: 'Expense List', component: <ExpenseList />, icon: <ReceiptLongIcon />, key: 'expense_list', criticalTabs: true },
  { label: 'New Expense', component: <NewExpense />, icon: <AddCardIcon />, key: 'new_expense', criticalTabs: true }
];

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const DashboardHome = () => {
  const { user, logout } = useAuth();
  const [employeeData, setEmployeeData] = useState(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openEmpInfo, setOpenEmpInfo] = useState(false);
  const [openChangePass, setOpenChangePass] = useState(false);

  const BASE_URL = process.env.REACT_APP_API_URL;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleEmpInfoOpen = () => {
    setOpenEmpInfo(true);
    handleMenuClose();
  };

  const handleChangePassOpen = () => {
    setOpenChangePass(true);
    handleMenuClose();
  };

  // Prevent flicker: Only fetch employee data if user.emp_id changes and not on every render
  useEffect(() => {
    let isMounted = true;
    const fetchEmployeeData = async () => {
      try {
        const response = await axios.get(`/api/employees/${user.emp_id}`);
        if (isMounted) setEmployeeData(response.data);
      } catch (err) {
        if (isMounted) setEmployeeData(null);
      }
    };
    if (user?.emp_id) {
      fetchEmployeeData();
    }
    return () => { isMounted = false; };
  }, [user?.emp_id]);

  // Calculate tabs based on role
  const getTabs = () => {
    // If tab_permissions is set and non-empty, use only those tabs (by key)
    if (Array.isArray(user?.tab_permissions) && user.tab_permissions.length > 0) {
      // Only show tabs present in tab_permissions, including critical tabs only if present
      const allowedKeys = user.tab_permissions;
      // Compose tabs: only those in tab_permissions (do not force critical tabs)
      const allTabs = [...CRITICAL_TABS, ...CANONICAL_TABS];
      const permissionTabs = allTabs.filter(tab => allowedKeys.includes(tab.key));
      return permissionTabs;
    }
    // Default: show all tabs including allowance_rates for admin/hr
    if (user?.role === 'admin' || user?.role === 'hr') {
      return [
        ...CRITICAL_TABS,
        ...CANONICAL_TABS
      ];
    }
    // Show New Expense for user, coordinator, hr, accounts
    if (['user', 'coordinator', 'hr', 'accounts'].includes(user?.role)) {
      return [
        CRITICAL_TABS.find(t => t.key === 'new_expense'),
        CRITICAL_TABS.find(t => t.key === 'expense_list')
      ];
    }
    return [
      CRITICAL_TABS.find(t => t.key === 'expense_list')
    ];
  };

  const tabs = getTabs();

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${grey[50]} 0%, ${grey[100]} 100%)`,
      backgroundAttachment: 'fixed',
      '&::before': {
        content: '""',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          linear-gradient(30deg, ${alpha('#1976d2', 0.03)} 12%, transparent 12.5%, transparent 87%, ${alpha('#1976d2', 0.03)} 87.5%, ${alpha('#1976d2', 0.03)}),
          linear-gradient(150deg, ${alpha('#1976d2', 0.03)} 12%, transparent 12.5%, transparent 87%, ${alpha('#1976d2', 0.03)} 87.5%, ${alpha('#1976d2', 0.03)}),
          linear-gradient(30deg, ${alpha('#1976d2', 0.03)} 12%, transparent 12.5%, transparent 87%, ${alpha('#1976d2', 0.03)} 87.5%, ${alpha('#1976d2', 0.03)}),
          linear-gradient(150deg, ${alpha('#1976d2', 0.03)} 12%, transparent 12.5%, transparent 87%, ${alpha('#1976d2', 0.03)} 87.5%, ${alpha('#1976d2', 0.03)})
        `,
        backgroundSize: '80px 140px',
        backgroundPosition: '0 0, 0 0, 40px 70px, 40px 70px',
        zIndex: 0,
        pointerEvents: 'none',
      }
    }}>
      <AppBar 
        position="sticky" 
        elevation={0} 
        sx={{ 
          background: alpha('#ffffff', 0.85),
          backdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          boxShadow: `0 4px 30px ${alpha('#000', 0.05)}`,
          zIndex: 1100,
        }}
      >
        <Toolbar sx={{ 
          p: { xs: 1, md: 2 },
          gap: 2,
          minHeight: '70px',
          background: `linear-gradient(90deg, ${alpha('#1976d2', 0.03)} 0%, transparent 50%)`
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2 
          }}>
            {/* Professional company logo with subtle styling */}
            <Box
              component="img"
              src="/logo192.png"
              alt="Company Logo"
              sx={{
                width: 55,
                height: 55,
                borderRadius: 2,
                objectFit: 'contain',
                background: 'linear-gradient(135deg, #fff 60%, #e3f2fd 100%)',
                boxShadow: '0 2px 12px 0 rgba(25, 118, 210, 0.10), 0 1.5px 6px 0 rgba(33, 150, 243, 0.08)',
                border: '1.5px solid #e3eafc',
                p: 0.5,
                mr: 1
              }}
            />
            <Typography 
              variant="h4" 
              sx={{ 
                background: 'none',
                fontWeight: 900,
                letterSpacing: '-0.5px',
                fontSize: { xs: '1.5rem', sm: '2.2rem' },
                textShadow: '0 2px 15px rgba(33,150,243,0.10)',
                position: 'relative',
                lineHeight: 1.1,
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -4,
                  left: 0,
                  width: '100%',
                  height: 2,
                  background: 'linear-gradient(90deg, transparent, #2196f3, transparent)',
                  opacity: 0.5,
                }
              }}
            >
              <span style={{
                marginRight: '10px',
                fontWeight: 1100,
                letterSpacing: '2px',
                background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: "'Playfair Display', 'Dancing Script', 'Pacifico', serif",
                fontSize: '3rem',
                fontStyle: 'italic',
                textShadow: '0 2px 16px rgba(33,150,243,0.18)'
              }}>
                Expense
              </span>
              <span style={{
                background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 1100,
                letterSpacing: '2px',
                fontFamily: "'Playfair Display', 'Dancing Script', 'Pacifico', serif",
                fontSize: '3rem',
                fontStyle: 'italic',
                textShadow: '0 2px 16px rgba(33,150,243,0.18)'
              }}>
                Tracker
              </span>
            </Typography>
          </Box>

          <Box sx={{ 
            ml: 'auto',
            display: 'flex', 
            alignItems: 'center', 
            gap: 2 
          }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleMenuClick}
              endIcon={<ArrowDropDownCircleIcon />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 2,
                py: 1,
                background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.25)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.35)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {(employeeData?.profile_image_path || user?.profile_image_path) ? (
                  <Avatar
                    src={(employeeData?.profile_image_path || user?.profile_image_path).startsWith('uploads/images/')
                      ? BASE_URL + (employeeData?.profile_image_path || user?.profile_image_path)
                      : BASE_URL + 'uploads/images/' + (employeeData?.profile_image_path || user?.profile_image_path).replace(/^uploads\//, '')}
                    sx={{ width: 32, height: 32, bgcolor: 'primary.dark', fontSize: '1rem', fontWeight: 'bold' }}
                  />
                ) : (
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark', fontSize: '1rem', fontWeight: 'bold' }}>
                    {user?.first_name?.[0]}
                  </Avatar>
                )}
                <Box sx={{ 
                  display: { xs: 'none', sm: 'block' },
                  textAlign: 'left'
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'white' }}>
                    {(user?.first_name || '') + (user?.middle_name ? ' ' + user.middle_name : '') + (user?.last_name ? ' ' + user.last_name : '')}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    {user?.role?.toUpperCase() || 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </Button>
          </Box>
        </Toolbar>

        <Box sx={{ 
          background: `linear-gradient(90deg, #f8fafc 0%, #e3f2fd 40%, #b6c8e6 100%)`, // Subtle cloud to light industrial blue
          px: 2,
          boxShadow: `0 4px 24px ${alpha('#90caf9', 0.13)}`,
          borderBottomLeftRadius: 22,
          borderBottomRightRadius: 22,
          border: '2px solid',
          borderImage: 'linear-gradient(90deg, #b0bec5 0%, #1976d2 60%, #90caf9 100%) 1', // industrial blue-grey to blue gradient border
          minHeight: 58,
          transition: 'background 0.4s',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: 7,
            background: 'linear-gradient(90deg, #e3f2fd 0%, #b6c8e6 100%)',
            opacity: 0.9,
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
            zIndex: 0
          }
        }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                color: '#1976d2',
                minHeight: 56,
                fontSize: '1.05rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '12px 12px 0 0',
                mx: 0.5,
                position: 'relative',
                overflow: 'hidden',
                background: 'rgba(255,255,255,0.7)',
                transition: 'all 0.3s',
                '&.Mui-selected': {
                  color: '#fff',
                  fontWeight: 700,
                  background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                  boxShadow: '0 2px 12px rgba(33,150,243,0.10)',
                },
                '&:hover': {
                  background: 'rgba(33,150,243,0.08)',
                  color: '#1565c0'
                }
              },
              '& .MuiTabs-indicator': {
                height: 4,
                borderRadius: '3px 3px 0 0',
                background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                boxShadow: '0 0 10px rgba(33,150,243,0.18)'
              }
            }}
          >
            {tabs.map((tab, index) => (
              <Tab 
                key={tab.label} 
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
              />
            ))}
          </Tabs>
        </Box>
      </AppBar>

      <Box sx={{ 
        flexGrow: 1,
        p: { xs: 2, md: 4 },
        minHeight: 'calc(100vh - 126px)',
        maxWidth: '100%',
        mx: 'auto',
        position: 'relative',
        zIndex: 1,
        '& .MuiPaper-root': {
          backdropFilter: 'blur(10px)',
          background: alpha('#fff', 0.9),
          borderRadius: 3,
          border: `1px solid ${alpha('#000', 0.05)}`,
          boxShadow: `0 8px 32px ${alpha('#1976d2', 0.08)}`,
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 12px 40px ${alpha('#1976d2', 0.12)}`
          }
        }
      }}>
        {tabs.map((tab, index) => (
          <TabPanel key={index} value={activeTab} index={index}>
            {tab.component}
          </TabPanel>
        ))}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: { 
            mt: 1.5, 
            minWidth: 260,
            maxWidth: '90vw',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(249, 250, 251, 0.94))',
            backdropFilter: 'blur(25px) saturate(200%)',
            border: '1px solid rgba(255, 255, 255, 0.7)',
            boxShadow: `
              0 8px 25px -5px rgba(0, 0, 0, 0.12),
              0 5px 12px -4px rgba(25, 118, 210, 0.25),
              0 0 0 1px rgba(255, 255, 255, 0.15) inset
            `,
            overflow: 'hidden',
            animation: 'menuPopup 0.2s ease-out',
            '@keyframes menuPopup': {
              from: { opacity: 0, transform: 'scale(0.98) translateY(-8px)' },
              to: { opacity: 1, transform: 'scale(1) translateY(0)' }
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at top right, rgba(25, 118, 210, 0.08), transparent 70%)',
              borderRadius: 'inherit',
              zIndex: 0
            }
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* User Profile Banner */}
        <Box sx={{ 
          p: 2,
          background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.08), rgba(30, 136, 229, 0.12))',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, #42a5f5, #1976d2)',
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Avatar
              sx={{
                width: 38,
                height: 38,
                background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                fontSize: '1rem',
                fontWeight: 'bold',
                border: '2px solid #fff',
                boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
                transition: 'all 0.2s ease'
              }}
            >
              {user?.first_name?.[0]}
            </Avatar>
            <Box>
              <Typography sx={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#0d47a1',
                lineHeight: 1.2,
                mb: 0.2
              }}>
                {(user?.first_name || '') + (user?.middle_name ? ' ' + user.middle_name : '') + (user?.last_name ? ' ' + user.last_name : '')}
              </Typography>
              <Typography sx={{
                fontSize: '0.7rem',
                color: 'text.secondary',
              }}>
                {user?.email}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={user?.role?.toUpperCase() || 'N/A'}
            size="small"
            sx={{
              height: 18,
              fontSize: '0.65rem',
              fontWeight: 600,
              background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
              color: 'white',
              '.MuiChip-label': { px: 1 },
              boxShadow: '0 2px 4px rgba(25, 118, 210, 0.15)'
            }}
          />
        </Box>

        {/* Quick Actions */}
        <Box sx={{ py: 1 }}>
          {[
            { icon: <AccountBoxRoundedIcon />, label: 'Profile', color: '#1976d2', onClick: handleEmpInfoOpen },
            { icon: <EnhancedEncryptionIcon />, label: 'Password', color: '#0d47a1', onClick: handleChangePassOpen }
          ].map((item, index) => (
            <MenuItem
              key={index}
              onClick={item.onClick}
              sx={{
                py: 1,
                px: 2,
                mx: 1,
                my: 0.3,
                borderRadius: 1.5,
                gap: 1.5,
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: `linear-gradient(45deg, ${alpha(item.color, 0.04)}, ${alpha(item.color, 0.08)})`,
                  '& .menu-icon': {
                    background: `linear-gradient(135deg, ${item.color}, ${alpha(item.color, 0.8)})`,
                    color: 'white',
                    transform: 'scale(1.05)'
                  }
                }
              }}
            >
              <Box 
                className="menu-icon"
                sx={{ 
                  p: 0.8,
                  borderRadius: '8px',
                  background: alpha(item.color, 0.1),
                  color: item.color,
                  transition: 'all 0.2s ease',
                  display: 'flex'
                }}
              >
                {React.cloneElement(item.icon, { sx: { fontSize: 18 } })}
              </Box>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                {item.label}
              </Typography>
            </MenuItem>
          ))}
        </Box>

        <Divider sx={{ 
          my: 0.5,
          opacity: 0.6,
          mx: 2,
          background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.08), transparent)'
        }} />

        <Box sx={{ p: 1 }}>
          <MenuItem
            onClick={handleLogout}
            sx={{
              py: 1,
              px: 2,
              mx: 1,
              my: 0.3,
              borderRadius: 1.5,
              gap: 1.5,
              color: '#d32f2f',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: alpha('#f44336', 0.06),
                '& .logout-icon': {
                  background: 'linear-gradient(135deg, #f44336, #d32f2f)',
                  color: 'white',
                  transform: 'scale(1.05)'
                }
              }
            }}
          >
            <Box 
              className="logout-icon"
              sx={{ 
                p: 0.8,
                borderRadius: '8px',
                background: alpha('#f44336', 0.1),
                color: 'inherit',
                transition: 'all 0.2s ease',
                display: 'flex'
              }}
            >
              <LogoutRoundedIcon sx={{ fontSize: 18 }} />
            </Box>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
              Log Out
            </Typography>
          </MenuItem>
        </Box>
      </Menu>

      <Dialog
        open={openEmpInfo}
        onClose={() => setOpenEmpInfo(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            background: alpha('#fff', 0.9),
            backdropFilter: 'blur(20px) saturate(180%)',
            minHeight: '80vh',
            m: 2,
            position: 'relative'
          }
        }}
      >
        <IconButton
          onClick={() => setOpenEmpInfo(false)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            zIndex: 1,
            color: '#fff',
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(5px)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              transform: 'rotate(90deg)',
              transition: 'all 0.3s ease-in-out'
            },
            transition: 'all 0.3s ease-in-out'
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: 'linear-gradient(90deg, #1976d2, #2196f3)',
          color: 'white',
          px: 3,
          py: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountBoxRoundedIcon />
            <Typography variant="h6" component="span">
              Employee Information
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <EmployeeInformation user={employeeData || user} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={openChangePass}
        onClose={() => setOpenChangePass(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            background: 'linear-gradient(145deg, rgba(255,255,255,0.98), rgba(249,250,251,0.96))',
            backdropFilter: 'blur(25px) saturate(200%)',
            p: 3,
            border: '1px solid rgba(255,255,255,0.8)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at top right, rgba(25, 118, 210, 0.08), transparent 70%)',
              borderRadius: 'inherit',
              zIndex: 0
            }
          }
        }}
      >
        <IconButton
          onClick={() => setOpenChangePass(false)}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            zIndex: 1,
            color: 'text.secondary',
            bgcolor: 'background.paper',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': {
              bgcolor: 'background.paper',
              color: 'primary.main',
              transform: 'rotate(90deg)',
              transition: 'all 0.3s ease-in-out'
            },
            transition: 'all 0.3s ease-in-out'
          }}
        >
          <CloseIcon />
        </IconButton>
        <ChangePassword onSuccess={() => setOpenChangePass(false)} />
      </Dialog>
    </Box>
  );
};

const Dashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardHome />} />
      <Route path="/edit-expense/:expenseId" element={<EditExpense />} />
    </Routes>
  );
};

export default Dashboard;




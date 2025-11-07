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
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  styled,
  alpha
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DomainIcon from '@mui/icons-material/Domain';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

const StyledDepartment = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  background: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(10px)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #1976d2, #2196f3)'
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at bottom left, rgba(25, 118, 210, 0.05), transparent)',
    pointerEvents: 'none'
  }
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(3),
  '& .MuiTableCell-root': {
    borderColor: alpha(theme.palette.divider, 0.5)
  },
  '& .MuiTableRow-root:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04)
  },
  '& .MuiTableHead-root .MuiTableCell-root': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    color: theme.palette.primary.main,
    fontWeight: 600
  }
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.light, 0.1)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  marginBottom: theme.spacing(3),
  transform: 'translateY(0)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`
  }
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.2)} 100%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
  animation: 'pulse 2s infinite'
}));

const DepartmentsDashboard = () => {
  const { token, user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [newDepartment, setNewDepartment] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });

  const fetchDepartments = useCallback(async () => {
    try {
      const response = await axios.get('/api/employees/departments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(response.data);
    } catch (error) {
      showAlert('Error fetching departments', 'error');
    }
  }, [token]);

  useEffect(() => {
    fetchDepartments();
  }, [token, fetchDepartments]);

  const showAlert = (message, severity = 'success') => {
    setAlert({ open: true, message, severity });
  };

  const handleAdd = async () => {
    try {
      await axios.post('/api/employees/departments', 
        { department_name: newDepartment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDepartments();
      setNewDepartment('');
      setOpenDialog(false);
      showAlert('Department added successfully');
    } catch (error) {
      showAlert('Error adding department', 'error');
    }
  };

  const handleEdit = async (departmentId) => {
    try {
      const response = await axios.put(`/api/employees/departments/${departmentId}`,
        { department_name: editValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update the departments list immediately with new name
      setDepartments(departments.map(dept => 
        dept.department_id === departmentId 
          ? { ...dept, department_name: response.data.department_name }
          : dept
      ));
      
      setEditingId(null);
      showAlert('Department updated successfully', 'success');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error updating department';
      showAlert(errorMessage, 'error');
      setEditingId(null);
    }
  };

  const handleDelete = (departmentId, departmentName) => {
    setDeleteDialog({ open: true, id: departmentId, name: departmentName });
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`/api/employees/departments/${deleteDialog.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update departments list by removing the deleted department
      setDepartments(departments.filter(dept => dept.department_id !== deleteDialog.id));
      showAlert('Department deleted successfully', 'success');
      setDeleteDialog({ open: false, id: null, name: '' });

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete department';
      showAlert(errorMessage, 'error');
      setDeleteDialog({ open: false, id: null, name: '' });
    }
  };

  if (user?.role !== 'admin' && user?.role !== 'hr') {
    return <Box p={3}>You don't have permission to access this page.</Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <StyledDepartment>
        <HeaderBox>
          <IconWrapper>
            <DomainIcon sx={{ 
              fontSize: 40, 
              color: 'primary.main',
              filter: 'drop-shadow(0 2px 4px rgba(25, 118, 210, 0.3))'
            }} />
          </IconWrapper>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ 
              fontWeight: 700, 
              color: 'primary.main',
              mb: 0.5,
              background: 'linear-gradient(45deg, #1976d2, #2196f3)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 10px rgba(25, 118, 210, 0.2)'
            }}>
              Departments Management
            </Typography>
         
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{
              borderRadius: 2,
              py: 1.2,
              px: 3,
              background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 8px 2px rgba(33, 150, 243, .4)'
              }
            }}
          >
            Add Department
          </Button>
        </HeaderBox>

        <StyledTableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="60%">Department Name</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {departments.map((dept) => (
                <TableRow key={dept.department_id}>
                  <TableCell>
                    {editingId === dept.department_id ? (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          size="small"
                          fullWidth
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          autoFocus
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: 'background.paper'
                            }
                          }}
                        />
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEdit(dept.department_id)}
                          sx={{
                            '&:hover': {
                              bgcolor: alpha('#1976d2', 0.1)
                            }
                          }}
                        >
                          <SaveIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setEditingId(null)}
                          sx={{
                            '&:hover': {
                              bgcolor: alpha('#f44336', 0.1)
                            }
                          }}
                        >
                          <CancelIcon />
                        </IconButton>
                      </Box>
                    ) : (
                      <Typography sx={{ fontWeight: 500 }}>
                        {dept.department_name}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {!editingId && (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditingId(dept.department_id);
                            setEditValue(dept.department_name);
                          }}
                          sx={{
                            color: 'primary.main',
                            '&:hover': {
                              bgcolor: alpha('#1976d2', 0.1)
                            }
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(dept.department_id, dept.department_name)}
                          sx={{
                            '&:hover': {
                              bgcolor: alpha('#f44336', 0.1)
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
      </StyledDepartment>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid',
            borderColor: 'divider'
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 2,
          '::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 20,
            right: 20,
            height: '1px',
            bgcolor: 'divider'
          }
        }}>
          Add New Department
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            autoFocus
            label="Department Name"
            fullWidth
            value={newDepartment}
            onChange={(e) => setNewDepartment(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAdd} 
            variant="contained"
            sx={{ 
              borderRadius: 2,
              background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)'
            }}
          >
            Add Department
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>

      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null, name: '' })}
        onConfirm={handleConfirmDelete}
        itemName={deleteDialog.name}
        itemType="Department"
      />
    </Box>
  );
};

export default DepartmentsDashboard;

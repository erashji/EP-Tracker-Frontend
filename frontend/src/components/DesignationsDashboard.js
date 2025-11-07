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
import WorkIcon from '@mui/icons-material/Work';
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
    background: 'radial-gradient(circle at top left, rgba(25, 118, 210, 0.05), transparent)',
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

const DesignationsDashboard = () => {
  const { token } = useAuth();
  const [designations, setDesignations] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [newDesignation, setNewDesignation] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });

  const fetchDesignations = useCallback(async () => {
    try {
      const response = await axios.get('/api/employees/designations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDesignations(response.data);
    } catch (error) {
      showAlert('Error fetching designations', 'error');
    }
  }, [token]);

  useEffect(() => {
    fetchDesignations();
  }, [token, fetchDesignations]);

  const showAlert = (message, severity = 'success') => {
    setAlert({ open: true, message, severity });
  };

  const handleAdd = async () => {
    try {
      await axios.post('/api/employees/designations', 
        { designation_name: newDesignation },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDesignations();
      setNewDesignation('');
      setOpenDialog(false);
      showAlert('Designation added successfully');
    } catch (error) {
      showAlert('Error adding designation', 'error');
    }
  };

  const handleEdit = async (designationId) => {
    try {
      const response = await axios.put(`/api/employees/designations/${designationId}`,
        { designation_name: editValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update the designations list immediately with new name
      setDesignations(designations.map(desig => 
        desig.designation_id === designationId 
          ? { ...desig, designation_name: response.data.designation_name }
          : desig
      ));
      
      setEditingId(null);
      showAlert('Designation updated successfully', 'success');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error updating designation';
      showAlert(errorMessage, 'error');
      setEditingId(null);
    }
  };

  const handleDelete = (designationId, designationName) => {
    setDeleteDialog({ open: true, id: designationId, name: designationName });
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`/api/employees/designations/${deleteDialog.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update designations list by removing the deleted designation
      setDesignations(designations.filter(desig => desig.designation_id !== deleteDialog.id));
      showAlert('Designation deleted successfully', 'success');
      setDeleteDialog({ open: false, id: null, name: '' });

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete designation';
      showAlert(errorMessage, 'error');
      setDeleteDialog({ open: false, id: null, name: '' });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <StyledDepartment>
        <HeaderBox>
          <IconWrapper>
            <WorkIcon sx={{ 
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
              Designations Management
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
            Add Designation
          </Button>
        </HeaderBox>

        <StyledTableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="60%">Designation Name</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {designations.map((desig) => (
                <TableRow key={desig.designation_id}>
                  <TableCell>
                    {editingId === desig.designation_id ? (
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
                          onClick={() => handleEdit(desig.designation_id)}
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
                        {desig.designation_name}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {!editingId && (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditingId(desig.designation_id);
                            setEditValue(desig.designation_name);
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
                          onClick={() => handleDelete(desig.designation_id, desig.designation_name)}
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
          Add New Designation
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            autoFocus
            label="Designation Name"
            fullWidth
            value={newDesignation}
            onChange={(e) => setNewDesignation(e.target.value)}
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
            Add Designation
          </Button>
        </DialogActions>
      </Dialog>

      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null, name: '' })}
        onConfirm={handleConfirmDelete}
        itemName={deleteDialog.name}
        itemType="Designation"
      />

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </Box>
  );
};

export default DesignationsDashboard;

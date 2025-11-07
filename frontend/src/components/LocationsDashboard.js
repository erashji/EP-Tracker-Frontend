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
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const StyledLocation = styled(Paper)(({ theme }) => ({
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
    background: 'linear-gradient(90deg, #1976d2, #2196f3)',
    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)'
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at top right, rgba(25, 118, 210, 0.05), transparent)',
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
  padding: theme.spacing(2),
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

const DeleteDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    padding: theme.spacing(2),
    maxWidth: '400px',
    background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.12)'
  }
}));

const DeleteConfirmationDialog = ({ open, onClose, onConfirm, itemName }) => (
  <DeleteDialog open={open} onClose={onClose}>
    <Box sx={{ p: 2, textAlign: 'center' }}>
      <Box sx={{ 
        width: 80,
        height: 80,
        borderRadius: '50%',
        bgcolor: 'error.lighter',
        color: 'error.main',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 24px',
        animation: 'pulse 1s infinite'
      }}>
        <WarningRoundedIcon sx={{ fontSize: 40 }} />
      </Box>
      
      <Typography variant="h6" sx={{ mb: 1, color: 'error.main', fontWeight: 600 }}>
        Delete {itemName}?
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        This action cannot be undone. This will permanently delete the {itemName.toLowerCase()}.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            borderRadius: 2,
            px: 3,
            borderColor: 'grey.300',
            color: 'text.primary',
            '&:hover': {
              borderColor: 'grey.500',
              bgcolor: 'grey.50'
            }
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          startIcon={<DeleteOutlineIcon />}
          sx={{
            borderRadius: 2,
            px: 3,
            background: 'linear-gradient(45deg, #f44336 30%, #e57373 90%)',
            boxShadow: '0 4px 12px rgba(244, 67, 54, 0.25)',
            '&:hover': {
              background: 'linear-gradient(45deg, #d32f2f 30%, #f44336 90%)',
              boxShadow: '0 6px 15px rgba(244, 67, 54, 0.35)'
            }
          }}
        >
          Delete
        </Button>
      </Box>
    </Box>
  </DeleteDialog>
);

const LocationsDashboard = () => {
  const { token, user } = useAuth();
  const [locations, setLocations] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });

  const fetchLocations = useCallback(async () => {
    try {
      const response = await axios.get('/api/employees/locations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLocations(response.data);
    } catch (error) {
      showAlert('Error fetching locations', 'error');
    }
  }, [token]);

  useEffect(() => {
    fetchLocations();
  }, [token, fetchLocations]);

  const showAlert = (message, severity = 'success') => {
    setAlert({ open: true, message, severity });
  };

  const handleAdd = async () => {
    try {
      await axios.post('/api/employees/locations', 
        { location_name: newLocation },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchLocations();
      setNewLocation('');
      setOpenDialog(false);
      showAlert('Location added successfully');
    } catch (error) {
      showAlert('Error adding location', 'error');
    }
  };

  const handleEdit = async (locationId) => {
    try {
      const response = await axios.put(`/api/employees/locations/${locationId}`,
        { location_name: editValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update the locations list immediately with new name
      setLocations(locations.map(loc => 
        loc.location_id === locationId 
          ? { ...loc, location_name: response.data.location_name }
          : loc
      ));
      
      setEditingId(null);
      showAlert('Location updated successfully', 'success');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error updating location';
      showAlert(errorMessage, 'error');
      setEditingId(null);
    }
  };

  const handleDelete = async (locationId, locationName) => {
    setDeleteConfirm({ open: true, id: locationId, name: locationName });
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`/api/employees/locations/${deleteConfirm.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update locations list by removing the deleted location
      setLocations(locations.filter(loc => loc.location_id !== deleteConfirm.id));
      showAlert('Location deleted successfully', 'success');
      setDeleteConfirm({ open: false, id: null, name: '' });

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error deleting location';
      showAlert(errorMessage, 'error');
      setDeleteConfirm({ open: false, id: null, name: '' });
    }
  };

  // If you have a role check, update to:
  if (user?.role !== 'admin' && user?.role !== 'hr') {
    return <Box p={3}>You don't have permission to access this page.</Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <StyledLocation>
        <HeaderBox>
          <IconWrapper>
            <LocationOnIcon sx={{ 
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
              Locations Management
            </Typography>
          
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{
              borderRadius: 3,
              py: 1.5,
              px: 4,
              background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
              boxShadow: '0 4px 20px rgba(25, 118, 210, 0.25)',
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 25px rgba(25, 118, 210, 0.35)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Add New Location
          </Button>
        </HeaderBox>

        <StyledTableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="60%">Location Name</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {locations.map((loc) => (
                <TableRow key={loc.location_id}>
                  <TableCell>
                    {editingId === loc.location_id ? (
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
                          onClick={() => handleEdit(loc.location_id)}
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
                        {loc.location_name}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {!editingId && (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditingId(loc.location_id);
                            setEditValue(loc.location_name);
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
                          onClick={() => handleDelete(loc.location_id, loc.location_name)}
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
      </StyledLocation>

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
          Add New Location
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            autoFocus
            label="Location Name"
            fullWidth
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
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
            Add Location
          </Button>
        </DialogActions>
      </Dialog>

      <DeleteConfirmationDialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null, name: '' })}
        onConfirm={handleConfirmDelete}
        itemName={deleteConfirm.name}
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

export default LocationsDashboard;

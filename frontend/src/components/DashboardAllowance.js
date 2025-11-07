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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Typography,
  Snackbar,
  Alert,
  InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const SCOPES = [
  'Daily Allowance Metro',
  'Daily Allowance Non-Metro',
  'Site Allowance'
];

const DashboardAllowance = () => {
  const { user } = useAuth();
  const [allowanceRates, setAllowanceRates] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [formData, setFormData] = useState({
    designation_id: '',
    scope: '',
    amount: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

  const fetchAllowanceRates = useCallback(async () => {
    try {
      const response = await api.get('/api/allowance-rates');
      setAllowanceRates(response.data);
    } catch (error) {
      showSnackbar('Error fetching allowance rates', 'error');
    }
  }, []);

  const fetchDesignations = useCallback(async () => {
    try {
      const response = await api.get('/api/employees/designations');
      setDesignations(response.data);
    } catch (error) {
      showSnackbar('Error fetching designations', 'error');
    }
  }, []);

  useEffect(() => {
    fetchAllowanceRates();
    fetchDesignations();
  }, [fetchAllowanceRates, fetchDesignations]);

  const handleSubmit = async () => {
    try {
      if (editingRate) {
        await api.put(`/api/allowance-rates/${editingRate.id}`, formData);
      } else {
        await api.post('/api/allowance-rates', formData);
      }
      fetchAllowanceRates();
      handleCloseDialog();
      showSnackbar(
        `Allowance rate ${editingRate ? 'updated' : 'added'} successfully`
      );
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Error saving allowance rate', 'error');
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteDialog({ open: true, id });
  };

  const handleDeleteConfirm = async () => {
    const id = deleteDialog.id;
    setDeleteDialog({ open: false, id: null });
    try {
      await api.delete(`/api/allowance-rates/${id}`);
      fetchAllowanceRates();
      showSnackbar('Allowance rate deleted successfully');
    } catch (error) {
      showSnackbar('Error deleting allowance rate', 'error');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, id: null });
  };

  const handleEdit = (rate) => {
    setEditingRate(rate);
    setFormData({
      designation_id: rate.designation_id,
      scope: rate.scope,
      amount: rate.amount
    });
    setOpenDialog(true);
  };

  const handleAdd = () => {
    setEditingRate(null);
    setFormData({
      designation_id: '',
      scope: '',
      amount: ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRate(null);
    setFormData({
      designation_id: '',
      scope: '',
      amount: ''
    });
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Move role check here
  if (!user || (user.role !== 'hr' && user.role !== 'admin')) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" color="error">
          Access Denied. Only HR and Admin can access this page.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Manage Allowance Rates
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{ borderRadius: 2 }}
          >
            Add New Rate
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Designation</TableCell>
                <TableCell>Scope</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allowanceRates.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell>
                    {designations.find(d => d.designation_id === rate.designation_id)?.designation_name || ''}
                  </TableCell>
                  <TableCell>{rate.scope}</TableCell>
                  <TableCell>₹{parseFloat(rate.amount).toFixed(2)}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEdit(rate)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(rate.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingRate ? 'Edit Allowance Rate' : 'Add New DA (Daily Allowance) Rate'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Designation</InputLabel>
                <Select
                  value={formData.designation_id}
                  onChange={(e) => setFormData({ ...formData, designation_id: e.target.value })}
                  label="Designation"
                >
                  {designations.map((designation) => (
                    <MenuItem key={designation.designation_id} value={designation.designation_id}>
                      {designation.designation_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Scope</InputLabel>
                <Select
                  value={formData.scope}
                  onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                  label="Scope"
                >
                  {SCOPES.map((scope) => (
                    <MenuItem key={scope} value={scope}>
                      {scope}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>
                }}
                inputProps={{ min: 0, step: "0.01" }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              onClick={handleSubmit}
              variant="contained"
              disabled={!formData.designation_id || !formData.scope || !formData.amount}
            >
              {editingRate ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={deleteDialog.open} onClose={handleDeleteCancel}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this allowance rate?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default DashboardAllowance;

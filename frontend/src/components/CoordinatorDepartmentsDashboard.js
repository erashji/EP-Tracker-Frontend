import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Snackbar, Alert
} from '@mui/material';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { green } from '@mui/material/colors';

const CoordinatorDepartmentsDashboard = () => {
  const { token, user } = useAuth();
  const [mappings, setMappings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [editing, setEditing] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState({ coordinator_emp_id: '', department_id: '' });
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [recentlyAddedId, setRecentlyAddedId] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, department_id: null });
  const [newCoordinatorId, setNewCoordinatorId] = useState('');

  const fetchMappings = useCallback(async () => {
    const res = await axios.get('/api/employees/coordinator-departments', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setMappings(res.data);
  }, [token]);

  const fetchEmployees = useCallback(async () => {
    const res = await axios.get('/api/employees/all', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setEmployees(res.data.filter(emp => emp.role === 'coordinator'));
  }, [token]);

  const fetchDepartments = useCallback(async () => {
    const res = await axios.get('/api/employees/departments', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setDepartments(res.data);
  }, [token]);

  useEffect(() => {
    fetchMappings();
    fetchEmployees();
    fetchDepartments();
  }, [token, fetchMappings, fetchEmployees, fetchDepartments]);

  const handleAdd = async () => {
    try {
      await axios.post('/api/employees/coordinator-departments', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOpenDialog(false);
      setForm({ coordinator_emp_id: '', department_id: '' });
      setAlert({ open: true, message: 'Mapping added', severity: 'success' });

      // Fetch the latest mapping list and highlight the new one
      await fetchMappings();
      // Find the latest mapping (assume last in array)
      setTimeout(() => {
        if (mappings.length > 0) {
          setRecentlyAddedId(mappings[mappings.length - 1].id);
          setTimeout(() => setRecentlyAddedId(null), 2500); // Highlight for 2.5s
        }
      }, 200);
    } catch (error) {
      setAlert({ open: true, message: 'Error adding mapping', severity: 'error' });
    }
  };

  const handleEdit = async () => {
    try {
      await axios.put(`/api/employees/coordinator-departments/${editing.id}`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditing(null);
      setForm({ coordinator_emp_id: '', department_id: '' });
      setAlert({ open: true, message: 'Mapping updated', severity: 'success' });
      fetchMappings();
    } catch (error) {
      setEditing(null);
      setAlert({
        open: true,
        message: error.response?.data?.message || 'Error updating mapping',
        severity: 'error'
      });
    }
  };

  const handleDeleteClick = (row) => {
    setDeleteDialog({ open: true, id: row.id, department_id: row.department_id });
    setNewCoordinatorId('');
  };

  const handleAssignNewCoordinator = async () => {
    if (!newCoordinatorId) return;
    try {
      await axios.put(`/api/employees/coordinator-departments/${deleteDialog.id}`, {
        coordinator_emp_id: newCoordinatorId,
        department_id: deleteDialog.department_id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlert({ open: true, message: 'Coordinator reassigned successfully', severity: 'success' });
      setDeleteDialog({ open: false, id: null, department_id: null });
      fetchMappings();
    } catch (error) {
      setAlert({ open: true, message: 'Error reassigning coordinator', severity: 'error' });
    }
  };

  if (user?.role !== 'admin' && user?.role !== 'hr') {
    return <Box p={3}>You don't have permission to access this page.</Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <SupervisorAccountIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
           Department Coordinators
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{ ml: 'auto', borderRadius: 2 }}
          >
            Add Department Coordinators
          </Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Coordinator</TableCell>
                <TableCell>Department</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mappings.map((row) => (
                <TableRow
                  key={row.id}
                  sx={recentlyAddedId === row.id ? {
                    background: green[50],
                    transition: 'background 0.5s',
                    boxShadow: `0 0 8px ${green[200]}`,
                  } : {}}
                >
                  <TableCell>
                    {editing?.id === row.id ? (
                      <TextField
                        select
                        value={form.coordinator_emp_id}
                        onChange={e => setForm(f => ({ ...f, coordinator_emp_id: e.target.value }))}
                        size="small"
                        sx={{ minWidth: 180 }}
                      >
                        {employees.map(emp => (
                          <MenuItem key={emp.emp_id} value={emp.emp_id}>
                            {emp.emp_code} - {emp.first_name} {emp.last_name}
                          </MenuItem>
                        ))}
                      </TextField>
                    ) : (
                      `${row.coordinator_emp_code} - ${row.coordinator_name}`
                    )}
                  </TableCell>
                  <TableCell>
                    {editing?.id === row.id ? (
                      <TextField
                        select
                        value={form.department_id}
                        onChange={e => setForm(f => ({ ...f, department_id: e.target.value }))}
                        size="small"
                        sx={{ minWidth: 180 }}
                      >
                        {departments.map(dept => (
                          <MenuItem key={dept.department_id} value={dept.department_id}>
                            {dept.department_name}
                          </MenuItem>
                        ))}
                      </TextField>
                    ) : (
                      row.department_name
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {editing?.id === row.id ? (
                      <>
                        <IconButton color="primary" onClick={handleEdit}><SaveIcon /></IconButton>
                        <IconButton color="error" onClick={() => setEditing(null)}><CancelIcon /></IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton color="primary" onClick={() => {
                          setEditing(row);
                          setForm({
                            coordinator_emp_id: row.coordinator_emp_id,
                            department_id: row.department_id
                          });
                        }}><EditIcon /></IconButton>
                        <IconButton color="error" onClick={() => handleDeleteClick(row)}><DeleteIcon /></IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add Coordinator-Department Mapping</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Coordinator"
            value={form.coordinator_emp_id}
            onChange={e => setForm(f => ({ ...f, coordinator_emp_id: e.target.value }))}
            fullWidth
            sx={{ mb: 2 }}
          >
            {employees.map(emp => (
              <MenuItem key={emp.emp_id} value={emp.emp_id}>
                {emp.emp_code} - {emp.first_name} {emp.last_name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Department"
            value={form.department_id}
            onChange={e => setForm(f => ({ ...f, department_id: e.target.value }))}
            fullWidth
          >
            {departments.map(dept => (
              <MenuItem key={dept.department_id} value={dept.department_id}>
                {dept.department_name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Add</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null, department_id: null })}>
        <DialogTitle>Reassign Coordinator</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Before deleting, please assign a new coordinator for this department.
          </Typography>
          <TextField
            select
            label="New Coordinator"
            value={newCoordinatorId}
            onChange={e => setNewCoordinatorId(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          >
            {employees.map(emp => (
              <MenuItem key={emp.emp_id} value={emp.emp_id}>
                {emp.emp_code} - {emp.first_name} {emp.last_name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null, department_id: null })}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!newCoordinatorId}
            onClick={handleAssignNewCoordinator}
          >
            Assign & Replace
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={() => setAlert(a => ({ ...a, open: false }))}
      >
        <Alert severity={alert.severity}>{alert.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default CoordinatorDepartmentsDashboard;

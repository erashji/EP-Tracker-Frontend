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
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Alert,
  Chip,
  styled,
  alpha,
  Button,
  Divider,
  Autocomplete
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import FolderIcon from '@mui/icons-material/Folder';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import ExcelJS from 'exceljs';

// Add styled components
const StyledHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.light, 0.1)} 100%)`,
  borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2)
}));

const StyledSearch = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    transition: 'all 0.3s ease',
    '&:hover': {
      background: alpha(theme.palette.common.white, 0.1),
    },
    '&.Mui-focused': {
      background: alpha(theme.palette.common.white, 0.15),
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
    }
  }
}));

const downloadTemplateXlsx = () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Projects Template');
  worksheet.columns = [
    { header: 'project_code', key: 'project_code', width: 15 },
    { header: 'project_name', key: 'project_name', width: 25 },
    { header: 'site_location', key: 'site_location', width: 20 },
    { header: 'site_incharge_emp_code', key: 'site_incharge_emp_code', width: 20 }
  ];
  worksheet.addRow({
    project_code: 'PRJ001',
    project_name: 'Sample Project 1',
    site_location: 'Location 1',
    site_incharge_emp_code: 'EMP001'
  });
  worksheet.addRow({
    project_code: 'PRJ002',
    project_name: 'Sample Project 2',
    site_location: 'Location 2',
    site_incharge_emp_code: 'EMP002'
  });
  workbook.xlsx.writeBuffer().then(buffer => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'projects_template.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  });
};

const ProjectsDashboard = () => {
  const { token, user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [editData, setEditData] = useState({
    id: null,
    projectCode: '',
    projectName: '',
    siteLocation: '',
    siteInchargeEmpCode: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadResults, setUploadResults] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newProject, setNewProject] = useState({
    projectCode: '',
    projectName: '',
    siteLocation: '',
    siteInchargeEmpCode: ''
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    projectId: null,
    projectCode: ''
  });
  const [allEmployees, setAllEmployees] = useState([]);

  const fetchProjects = useCallback(async () => {
    try {
      const response = await axios.get(
        (user?.role === 'admin' || user?.role === 'hr')
          ? '/api/expenses/projects/all-fields'
          : '/api/expenses/projects',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setProjects(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch projects';
      setError(errorMessage);
    }
  }, [token, user?.role]);

  useEffect(() => {
    fetchProjects();
    // Fetch all employees for site incharge dropdown
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('/api/employees/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAllEmployees(response.data || []);
      } catch (error) {
        // handle error
      }
    };
    fetchEmployees();
  }, [token, fetchProjects]);

  const filteredProjects = projects.filter(project => {
    const term = searchTerm.trim().toLowerCase();
    return (
      project.project_code?.toLowerCase().includes(term) ||
      project.project_name?.toLowerCase().includes(term) ||
      project.site_location?.toLowerCase().includes(term) ||
      project.site_incharge_emp_code?.toLowerCase().includes(term)
    );
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (project) => {
    setEditData({
      id: project.project_id,
      projectCode: project.project_code,
      projectName: project.project_name,
      siteLocation: project.site_location || '',
      siteInchargeEmpCode: project.site_incharge_emp_code || ''
    });
  };

  const handleSave = async (projectId) => {
    try {
      // Validate input
      if (!editData.projectCode || !editData.projectName) {
        setError('Project code and name are required');
        return;
      }

      // Make API call to update project (include site_location and site_incharge_emp_code)
      await axios.put(`/api/expenses/projects/${projectId}`, {
        project_code: editData.projectCode.trim(),
        project_name: editData.projectName.trim(),
        site_location: editData.siteLocation.trim(),
        site_incharge_emp_code: editData.siteInchargeEmpCode.trim()
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      await fetchProjects();
      setEditData({ id: null, projectCode: '', projectName: '', siteLocation: '', siteInchargeEmpCode: '' });
      setSuccess('Project updated successfully');
      setTimeout(() => setSuccess(''), 3004);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update project');
      setTimeout(() => setError(''), 8000);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Accept .csv and .xlsx files
    if (!(file.name.endsWith('.csv') || file.name.endsWith('.xlsx'))) {
      setError('Please select a valid CSV or Excel (.xlsx) file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/expenses/projects/upload-csv', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      setUploadResults(response.data);
      setSuccess('CSV file processed successfully');
      setTimeout(() => setSuccess(''), 3004);
      fetchProjects(); // Refresh project list
    } catch (error) {
      setError('Error processing CSV file: ' + (error.response?.data?.message || error.message));
      setTimeout(() => setError(''), 3004);
    }
  };

  const handleAddProject = async () => {
    try {
      if (!newProject.projectCode || !newProject.projectName) {
        setError('Project code and name are required');
        return;
      }

      // Send all fields including site_location and site_incharge_emp_code
      await axios.post('/api/expenses/projects', {
        project_code: newProject.projectCode.trim(),
        project_name: newProject.projectName.trim(),
        site_location: newProject.siteLocation.trim(),
        site_incharge_emp_code: newProject.siteInchargeEmpCode.trim()
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      await fetchProjects();
      setOpenDialog(false);
      setNewProject({ projectCode: '', projectName: '', siteLocation: '', siteInchargeEmpCode: '' });
      setSuccess('Project added successfully');
      setTimeout(() => setSuccess(''), 3004);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add project');
      setTimeout(() => setError(''), 8000);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewProject({ projectCode: '', projectName: '', siteLocation: '', siteInchargeEmpCode: '' });
  };

  const handleDeleteClick = (project) => {
    if (!project?.project_id) {
      console.error('Invalid project:', project);
      setError('Invalid project selected');
      return;
    }

    setDeleteDialog({
      open: true,
      projectId: project.project_id,
      projectCode: project.project_code
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.projectId) {
      setError('Invalid project ID');
      return;
    }

    try {
      await axios.delete(`/api/expenses/projects/${deleteDialog.projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await fetchProjects(); // Refresh the list
      setSuccess('Project deleted successfully');
      handleDeleteCancel(); // Clean up dialog state
    } catch (error) {
      console.error('Delete error:', error);
      setError(error.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({
      open: false,
      projectId: null,
      projectCode: ''
    });
    setError(''); // Clear any existing errors
  };

  // Helper to get employee name from code
  const getEmployeeNameByCode = (code) => {
    const emp = allEmployees.find(e => e.emp_code === code);
    if (!emp) return '';
    return [emp.first_name, emp.middle_name, emp.last_name].filter(Boolean).join(' ');
  };

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <StyledHeader>
        <FolderIcon sx={{ 
          fontSize: 40, 
          color: 'primary.main',
          filter: 'drop-shadow(0 2px 4px rgba(25, 118, 210, 0.2))'
        }} />
        <Box>
          <Typography variant="h5" sx={{ 
            fontWeight: 600,
            color: 'primary.main',
            mb: 0.5
          }}>
            Projects Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage all project details
          </Typography>
        </Box>
      </StyledHeader>

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        mb: 3,
        gap: 2 
      }}>
        <StyledSearch
          fullWidth
          variant="outlined"
          placeholder="Search projects by code or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="primary" />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => {
                const csvContent = "project_code,project_name,site_location,site_incharge_emp_code\nPRJ001,Sample Project 1,Location 1,EMP001\nPRJ002,Sample Project 2,Location 2,EMP002";
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'projects_template.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
              }}
              sx={{
                borderRadius: 2,
                borderColor: 'success.main',
                color: 'success.main',
                '&:hover': {
                  borderColor: 'success.dark',
                  bgcolor: alpha('#2e7d32', 0.04)
                }
              }}
            >
              Download CSV Template
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={downloadTemplateXlsx}
              sx={{
                borderRadius: 2,
                borderColor: 'success.main',
                color: 'success.main',
                '&:hover': {
                  borderColor: 'success.dark',
                  bgcolor: alpha('#2e7d32', 0.04)
                }
              }}
            >
              Download XLSX Template
            </Button>
            {(user?.role === 'admin' || user?.role === 'hr') ? (
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                sx={{
                  borderRadius: 2,
                  borderColor: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.dark',
                    bgcolor: alpha('#1976d2', 0.04)
                  }
                }}
              >
                Upload CSV/XLSX
                <input
                  type="file"
                  hidden
                  accept=".csv,.xlsx"
                  onChange={handleFileUpload}
                />
              </Button>
            ) : (
              <Tooltip title="Only Admin and HR can upload project data">
                <span>
                  <Button
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    disabled
                    sx={{
                      borderRadius: 2,
                      borderColor: 'primary.main',
                      color: 'grey.500',
                      '&:hover': {
                        borderColor: 'primary.dark',
                        bgcolor: alpha('#1976d2', 0.04)
                      }
                    }}
                  >
                    Upload CSV/XLSX
                  </Button>
                </span>
              </Tooltip>
            )}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              sx={{
                borderRadius: 2,
                background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)'
              }}
            >
              Add Project
            </Button>
          </Box>
         
        </Box>
      </Box>

      {uploadResults && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.neutral' }}>
          <Typography variant="subtitle1" gutterBottom>
            CSV Upload Format:
          </Typography>
          <Typography variant="body2" color="text.secondary" component="div" sx={{ mb: 1 }}>
            The CSV file should have the following columns:
          </Typography>
          <Box sx={{ 
            bgcolor: 'background.paper', 
            p: 2, 
            borderRadius: 1,
            border: '1px dashed',
            borderColor: 'divider'
          }}>

            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" color="text.secondary">
              Example:<br />
              PRJ001,Project One,Location 1,EMP001<br />
              PRJ002,Project Two,Location 2,EMP002
            </Typography>
          </Box>
          <Alert 
            severity={uploadResults.errorCount > 0 ? 'warning' : 'success'}
            sx={{ mb: 2 }}
          >
            <Typography variant="subtitle2">CSV Upload Results:</Typography>
            <Typography variant="body2">
              Total Processed: {uploadResults.totalProcessed}<br />
              Successfully Added: {uploadResults.successCount}<br />
              Errors: {uploadResults.errorCount}
            </Typography>
          </Alert>
          {uploadResults.errors.length > 0 && (
            <Box sx={{ 
              maxHeight: 200, 
              overflowY: 'auto',
              bgcolor: 'error.lighter',
              p: 2,
              borderRadius: 1
            }}>
              <Typography variant="subtitle2" color="error">Errors:</Typography>
              {uploadResults.errors.map((error, index) => (
                <Typography key={index} variant="caption" component="div" color="error.dark">
                  • {error}
                </Typography>
              ))}
            </Box>
          )}
        </Paper>
      )}

      <TableContainer component={Paper} sx={{ 
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        overflow: 'hidden'
      }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.lighter' }}>
              <TableCell sx={{ 
                fontWeight: 600,
                color: 'primary.main',
                fontSize: '0.875rem'
              }}>
                Project Code
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 600,
                color: 'primary.main',
                fontSize: '0.875rem'
              }}>
                Project Name
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 600,
                color: 'primary.main',
                fontSize: '0.875rem'
              }}>
                Site Location
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 600,
                color: 'primary.main',
                fontSize: '0.875rem'
              }}>
                Site Incharge (Emp. Code)
              </TableCell>
              <TableCell align="right" sx={{ 
                fontWeight: 600,
                color: 'primary.main',
                fontSize: '0.875rem'
              }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProjects
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((project) => (
                <TableRow 
                  key={project.project_id} 
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: alpha('#1976d2', 0.04)
                    }
                  }}
                >
                  <TableCell>
                    {editData.id === project.project_id ? (
                      <TextField
                        size="small"
                        value={editData.projectCode}
                        onChange={(e) => setEditData(prev => ({
                          ...prev,
                          projectCode: e.target.value
                        }))}
                        sx={{ width: 150 }}
                      />
                    ) : (
                      <Chip
                        label={project.project_code}
                        size="small"
                        sx={{ 
                          bgcolor: 'primary.lighter',
                          color: 'primary.main',
                          fontWeight: 500
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {editData.id === project.project_id ? (
                      <TextField
                        size="small"
                        fullWidth
                        value={editData.projectName}
                        onChange={(e) => setEditData(prev => ({
                          ...prev,
                          projectName: e.target.value
                        }))}
                      />
                    ) : (
                      project.project_name
                    )}
                  </TableCell>
                  <TableCell>
                    {editData.id === project.project_id ? (
                      <TextField
                        size="small"
                        fullWidth
                        value={editData.siteLocation}
                        onChange={(e) => setEditData(prev => ({
                          ...prev,
                          siteLocation: e.target.value
                        }))}
                      />
                    ) : (
                      project.site_location
                    )}
                  </TableCell>
                  <TableCell>
                    {editData.id === project.project_id ? (
                      <Autocomplete
                        options={allEmployees}
                        getOptionLabel={option =>
                          option && option.emp_code
                            ? `${option.emp_code} - ${[option.first_name, option.middle_name, option.last_name].filter(Boolean).join(' ')}`
                            : ''
                        }
                        value={allEmployees.find(emp => emp.emp_code === editData.siteInchargeEmpCode) || null}
                        onChange={(event, newValue) => setEditData(prev => ({
                          ...prev,
                          siteInchargeEmpCode: newValue ? newValue.emp_code : ''
                        }))}
                        renderOption={(props, option) => (
                          <li {...props} key={option.emp_id}>
                            {option.emp_code} - {[option.first_name, option.middle_name, option.last_name].filter(Boolean).join(' ')}
                          </li>
                        )}
                        renderInput={params => (
                          <TextField
                            {...params}
                            label="Site Incharge (Emp. Code)"
                            placeholder="Select employee code"
                            fullWidth
                          />
                        )}
                        isOptionEqualToValue={(option, value) => option.emp_code === value.emp_code}
                      />
                    ) : (
                      project.site_incharge_emp_code
                        ? `${project.site_incharge_emp_code} - ${getEmployeeNameByCode(project.site_incharge_emp_code)}`
                        : ''
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {editData.id === project.project_id ? (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Tooltip title="Save">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleSave(project.project_id)}
                          >
                            <SaveIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setEditData({ id: null, projectCode: '', projectName: '', siteLocation: '', siteInchargeEmpCode: '' })}
                          >
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Tooltip title="Edit project">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(project)}
                            sx={{
                              color: 'primary.main',
                              '&:hover': {
                                bgcolor: alpha('#1976d2', 0.08)
                              }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete project">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(project)}
                            sx={{
                              color: 'error.main',
                              '&:hover': {
                                bgcolor: alpha('#dc004e', 0.08)
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredProjects.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          mt: 2,
          '.MuiTablePagination-select': {
            borderRadius: 1
          }
        }}
      />

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Project</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {error}
              </Alert>
            )}
            <TextField
              fullWidth
              label="Project Code"
              value={newProject.projectCode}
              onChange={(e) => setNewProject(prev => ({
                ...prev,
                projectCode: e.target.value.toUpperCase()
              }))}
              placeholder="Enter project code (e.g., PRJ001)"
              helperText="Project code must be unique"
            />
            <TextField
              fullWidth
              label="Project Name"
              value={newProject.projectName}
              onChange={(e) => setNewProject(prev => ({
                ...prev,
                projectName: e.target.value
              }))}
              placeholder="Enter project name"
            />
            <TextField
              fullWidth
              label="Site Location"
              value={newProject.siteLocation}
              onChange={(e) => setNewProject(prev => ({
                ...prev,
                siteLocation: e.target.value
              }))}
              placeholder="Enter site location"
            />
            <Autocomplete
              options={allEmployees}
              getOptionLabel={option =>
                option && option.emp_code
                  ? `${option.emp_code} - ${[option.first_name, option.middle_name, option.last_name].filter(Boolean).join(' ')}`
                  : ''
              }
              value={allEmployees.find(emp => emp.emp_code === newProject.siteInchargeEmpCode) || null}
              onChange={(event, newValue) => setNewProject(prev => ({
                ...prev,
                siteInchargeEmpCode: newValue ? newValue.emp_code : ''
              }))}
              renderOption={(props, option) => (
                <li {...props} key={option.emp_id}>
                  {option.emp_code} - {[option.first_name, option.middle_name, option.last_name].filter(Boolean).join(' ')}
                </li>
              )}
              renderInput={params => (
                <TextField
                  {...params}
                  label="Site Incharge (Emp. Code)"
                  placeholder="Select employee code"
                  fullWidth
                />
              )}
              isOptionEqualToValue={(option, value) => option.emp_code === value.emp_code}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleAddProject}
            variant="contained"
            disabled={!newProject.projectCode || !newProject.projectName}
          >
            Add Project
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon sx={{ color: 'warning.main' }} />
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: error ? 2 : 0 }}>
            <Typography>
              Are you sure you want to delete project <strong>{deleteDialog.projectCode}</strong>?
              This action cannot be undone.
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectsDashboard;

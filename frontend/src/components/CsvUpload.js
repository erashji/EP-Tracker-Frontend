import React, { useState } from 'react';
import {
  Button,
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  AlertTitle,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Tooltip,
  IconButton,
  Tab,
  Tabs
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import GroupIcon from '@mui/icons-material/Group';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import axios from 'axios';
import ExcelJS from 'exceljs';

const CsvUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tabIndex, setTabIndex] = useState(0);
  const [rmFile, setRmFile] = useState(null);
  const [rmLoading, setRmLoading] = useState(false);
  const [rmResult, setRmResult] = useState(null);
  const [rmError, setRmError] = useState(null);
  const [rmUploadProgress, setRmUploadProgress] = useState(0);

  const rmSampleCsvData = `emp_code,first_reporting_manager_emp_code,second_reporting_manager_emp_code\nEMP006,EMP001,EMP002\nEMP007,EMP001,EMP002`;

  const steps = ['Select CSV File', 'Validate Data', 'Upload & Process'];

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv') || selectedFile.name.endsWith('.xlsx'))) {
      setFile(selectedFile);
      setError(null);
      setActiveStep(1);
    } else {
      setFile(null);
      setError('Please select a valid CSV or Excel (.xlsx) file');
      setActiveStep(0);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setActiveStep(2);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post('/api/employees/upload-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          setUploadProgress(progress);
        }
      });

      setResult(response.data);
      if (response.data.successCount > 0) {
        setActiveStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error uploading file');
      setActiveStep(1);
    } finally {
      setLoading(false);
      setFile(null);
      setUploadProgress(0);
    }
  };

  const downloadTemplateXlsx = () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Employees Template');
    worksheet.columns = [
      { header: 'emp_code', key: 'emp_code', width: 15 },
      { header: 'username', key: 'username', width: 25 },
      { header: 'first_name', key: 'first_name', width: 15 },
      { header: 'middle_name', key: 'middle_name', width: 15 },
      { header: 'last_name', key: 'last_name', width: 15 },
      { header: 'full_name', key: 'full_name', width: 25 },
      { header: 'email', key: 'email', width: 25 },
      { header: 'mobile_number', key: 'mobile_number', width: 15 },
      { header: 'designation_id', key: 'designation_id', width: 10 },
      { header: 'department_id', key: 'department_id', width: 10 },
      { header: 'location_id', key: 'location_id', width: 10 },
      { header: 'date_of_joining', key: 'date_of_joining', width: 15 },
      { header: 'category', key: 'category', width: 10 },
      { header: 'gender', key: 'gender', width: 10 },
      { header: 'birth_of_date', key: 'birth_of_date', width: 15 }
    ];
    worksheet.addRow({
      emp_code: 'EMP006',
      username: 'sedl@sprayengineering.com',
      first_name: 'John',
      middle_name: 'Allen',
      last_name: 'Smith',
      full_name: 'John Allen Smith',
      email: 'sedl@sprayengineering.com',
      mobile_number: '9876543210',
      designation_id: 1,
      department_id: 1,
      location_id: 1,
      date_of_joining: '2023-01-15',
      category: 'Staff',
      gender: 'Male',
      birth_of_date: '1990-05-10'
    });
    worksheet.addRow({
      emp_code: 'EMP007',
      username: 'sedl@sprayengineering.com',
      first_name: 'Jane',
      middle_name: 'M.',
      last_name: 'Wilson',
      full_name: 'Jane M. Wilson',
      email: 'sedl@sprayengineering.com',
      mobile_number: '9876543211',
      designation_id: 2,
      department_id: 2,
      location_id: 2,
      date_of_joining: '2022-12-10',
      category: 'Worker',
      gender: 'Female',
      birth_of_date: '1992-08-20'
    });
    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'employee_template.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    });
  };

  const downloadRmTemplateXlsx = () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporting Managers Template');
    worksheet.columns = [
      { header: 'emp_code', key: 'emp_code', width: 15 },
      { header: 'first_reporting_manager_emp_code', key: 'first_reporting_manager_emp_code', width: 20 },
      { header: 'second_reporting_manager_emp_code', key: 'second_reporting_manager_emp_code', width: 20 }
    ];
    worksheet.addRow({ emp_code: 'EMP006', first_reporting_manager_emp_code: 'EMP001', second_reporting_manager_emp_code: 'EMP002' });
    worksheet.addRow({ emp_code: 'EMP007', first_reporting_manager_emp_code: 'EMP001', second_reporting_manager_emp_code: 'EMP002' });
    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reporting_manager_template.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    });
  };

  const handleRmFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv') || selectedFile.name.endsWith('.xlsx'))) {
      setRmFile(selectedFile);
      setRmError(null);
    } else {
      setRmFile(null);
      setRmError('Please select a valid CSV or Excel (.xlsx) file');
    }
  };

  const handleRmUpload = async () => {
    if (!rmFile) {
      setRmError('Please select a file first');
      return;
    }
    setRmLoading(true);
    setRmError(null);
    setRmResult(null);
    const formData = new FormData();
    formData.append('file', rmFile);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      const response = await axios.post('/api/employees/bulk-update-reporting-managers', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          setRmUploadProgress(progress);
        }
      });
      setRmResult(response.data);
    } catch (err) {
      setRmError(err.response?.data?.message || err.message || 'Error uploading file');
    } finally {
      setRmLoading(false);
      setRmFile(null);
      setRmUploadProgress(0);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        Bulk Upload Employees
        <Tooltip title="Upload multiple employees at once using CSV file">
          <IconButton size="small">
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Typography>
      <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)} sx={{ mb: 3 }} variant="fullWidth">
        <Tab icon={<GroupIcon />} iconPosition="start" label="Bulk Upload Employees" sx={{ fontWeight: 600, fontSize: 16 }} />
        <Tab icon={<SupervisorAccountIcon />} iconPosition="start" label="Bulk Assign Reporting Managers" sx={{ fontWeight: 600, fontSize: 16 }} />
      </Tabs>
      {tabIndex === 0 && (
        <React.Fragment>
          <Box sx={{ mb: 2 }}>
            <Alert severity="info">
              <b>Note:</b> Reporting manager fields <b>NOT required</b> during initial upload . First upload all employees Information. Then, use the 'Bulk Assign Reporting Managers' tab to set managers for existing employees after all <code>Employees</code>  are present now.<br />

            </Alert>
          </Box>
          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            {/* Note: CSV template expects date fields in YYYY-MM-DD format (e.g. 2023-01-15) */}
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => {
                // Backend expects columns in this order and date fields in YYYY-MM-DD
                const csvData = `emp_code,username,first_name,middle_name,last_name,full_name,email,mobile_number,designation_id,department_id,location_id,date_of_joining,category,gender,birth_of_date\nEMP006,sedl@sprayengineering.com,John,Allen,Smith,John Allen Smith,sedl@sprayengineering.com,9876543210,1,1,1,2023-01-15,Staff,Male,1990-05-10\nEMP007,sedl@sprayengineering.com,Jane,M.,Wilson,Jane M. Wilson,sedl@sprayengineering.com,9876543211,2,2,2,2022-12-10,Worker,Female,1992-08-20`;
                const blob = new Blob([csvData], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'employee_template.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
              }}
            >
              Download CSV Template
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={downloadTemplateXlsx}
            >
              Download XLSX Template
            </Button>

            <input
              accept=".csv,.xlsx"
              style={{ display: 'none' }}
              id="csv-file-upload"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="csv-file-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={<CloudUploadIcon />}
                disabled={loading}
              >
                Select CSV/XLSX File
              </Button>
            </label>
          </Box>

          {file && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Selected file: {file.name}
              <Button 
                variant="contained" 
                onClick={handleUpload}
                disabled={loading}
                sx={{ ml: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Upload & Process'}
              </Button>
            </Alert>
          )}

          {loading && (
            <Box sx={{ width: '100%', mb: 2 }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                Uploading... {Math.round(uploadProgress)}%
              </Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          )}

          {result && (
            <Box sx={{ mt: 3 }}>
              <Alert 
                severity={result.errorCount === 0 ? "success" : "warning"}
                sx={{ mb: 2 }}
              >
                <AlertTitle>Upload Summary</AlertTitle>
                Total Processed: {result.totalProcessed}<br />
                Successfully Added: {result.successCount}<br />
                Failed: {result.errorCount}
              </Alert>

              {result.successCount > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" color="success.main" gutterBottom>
                    Successfully Added Employees:
                  </Typography>
                  <List dense>
                    {result.successRecords.map((record, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={record.emp_code} secondary={record.message} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {result.errors.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" color="error" gutterBottom>
                    Errors:
                  </Typography>
                  <List dense>
                    {result.errors.map((error, index) => (
                      <ListItem key={index}>
                        <ListItemText 
                          primary={error.split(':')[0]} 
                          secondary={error.split(':')[1]} 
                          sx={{ 
                            '& .MuiListItemText-primary': { 
                              color: 'error.main',
                              fontWeight: 500
                            }
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}
        </React.Fragment>
      )}
      {tabIndex === 1 && (
        <React.Fragment>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => {
                const blob = new Blob([rmSampleCsvData], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'reporting_manager_template.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
            >
              Download CSV Template
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={downloadRmTemplateXlsx}
            >
              Download XLSX Template
            </Button>
            <input
              accept=".csv,.xlsx"
              style={{ display: 'none' }}
              id="rm-file-upload"
              type="file"
              onChange={handleRmFileChange}
            />
            <label htmlFor="rm-file-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={<CloudUploadIcon />}
                disabled={rmLoading}
              >
                Select CSV/XLSX File
              </Button>
            </label>
          </Box>
          {rmFile && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Selected file: {rmFile.name}
              <Button
                variant="contained"
                onClick={handleRmUpload}
                disabled={rmLoading}
                sx={{ ml: 2 }}
              >
                {rmLoading ? <CircularProgress size={24} /> : 'Upload & Update'}
              </Button>
            </Alert>
          )}
          {rmLoading && (
            <Box sx={{ width: '100%', mb: 2 }}>
              <LinearProgress variant="determinate" value={rmUploadProgress} />
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                Uploading... {Math.round(rmUploadProgress)}%
              </Typography>
            </Box>
          )}
          {rmError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <AlertTitle>Error</AlertTitle>
              {rmError}
            </Alert>
          )}
          {rmResult && (
            <Box sx={{ mt: 3 }}>
              <Alert
                severity={rmResult.errorCount === 0 ? "success" : "warning"}
                sx={{ mb: 2 }}
              >
                <AlertTitle>Update Summary</AlertTitle>
                Total Processed: {rmResult.totalProcessed}<br />
                Successfully Updated: {rmResult.successCount}<br />
                Failed: {rmResult.errorCount}
              </Alert>
              {rmResult.successCount > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" color="success.main" gutterBottom>
                    Successfully Updated Employees:
                  </Typography>
                  <List dense>
                    {rmResult.successRecords.map((record, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={record.emp_code} secondary={record.status} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
              {rmResult.errors.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" color="error" gutterBottom>
                    Errors:
                  </Typography>
                  <List dense>
                    {rmResult.errors.map((error, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={error} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}
        </React.Fragment>
      )}
    </Paper>
  );
};

export default CsvUpload;

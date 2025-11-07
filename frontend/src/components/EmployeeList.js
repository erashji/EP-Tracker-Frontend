import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useAuth } from '../hooks/useAuth';

const AllEmployees = () => {
  const { user, token } = useAuth();
  const [notActivatedEmployees, setNotActivatedEmployees] = useState([]);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendResult, setResendResult] = useState(null);

  useEffect(() => {
    // Only fetch if user is admin/hr
    if (user?.role === 'admin' || user?.role === 'hr') {
      fetch('/api/employees/not-activated', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setNotActivatedEmployees(data));
    }
  }, [user, token]);

  const handleBulkResendActivation = async () => {
    setResendLoading(true);
    setResendResult(null);
    try {
      const res = await fetch('/api/employees/bulk-resend-activation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setResendResult(data.message || 'Done');
      // Optionally refresh notActivatedEmployees
      const refreshed = await fetch('/api/employees/not-activated', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotActivatedEmployees(await refreshed.json());
    } catch (err) {
      setResendResult('Error sending activation links');
    }
    setResendLoading(false);
  };

  return (
    <Box>
      {(user?.role === 'admin' || user?.role === 'hr') && (
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleBulkResendActivation}
            disabled={resendLoading || notActivatedEmployees.length === 0}
            startIcon={<FileDownloadIcon />}
          >
            Resend Activation Links to All Expired/Inactive Employees
          </Button>
          {resendResult && (
            <Typography sx={{ mt: 1, color: resendResult.startsWith('Error') ? 'error.main' : 'success.main' }}>
              {resendResult}
            </Typography>
          )}
          <TableContainer sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Emp Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Token Expiry</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {notActivatedEmployees.map(emp => (
                  <TableRow key={emp.emp_id}>
                    <TableCell>{emp.emp_code}</TableCell>
                    <TableCell>{emp.first_name}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>{emp.status || 'Not Activated'}</TableCell>
                    <TableCell>{emp.expires_at ? new Date(emp.expires_at).toLocaleString() : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

// Ensure this component is used in the main All Employees tab/page
// If you use a tab system, import and render <AllEmployees /> in the correct tab
// Example:
// <TabPanel value={tabValue} index={ALL_EMPLOYEES_TAB_INDEX}>
//   <AllEmployees />
// </TabPanel>

export default AllEmployees;
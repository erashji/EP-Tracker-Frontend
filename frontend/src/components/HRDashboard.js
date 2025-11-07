import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import AllEmployees from './AllEmployees';
import AddEmployee from './AddEmployee';
import { useAuth } from '../context/AuthContext';

const HRDashboard = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const { user } = useAuth();

  // Example: show different tabs for HR and Accounts
  const tabs = [
    { label: 'All Employees', component: <AllEmployees /> },
    { label: 'Add Employee', component: <AddEmployee /> }
  ];

  // If you want to add more tabs for accounts, add here
  // if (user?.role === 'accounts') { ... }

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {tabs.map((tab, index) => (
            <Tab key={index} label={tab.label} />
          ))}
        </Tabs>
      </Paper>

      {tabs[currentTab].component}
    </Box>
  );
};

export default HRDashboard;
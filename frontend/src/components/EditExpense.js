import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, CircularProgress, Alert, Dialog, Typography, Button } from '@mui/material';
import axios from 'axios';
import NewExpense from './NewExpense';
import { useAuth } from '../context/AuthContext';
import { styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const SuccessDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(3),
    padding: theme.spacing(4),
    textAlign: 'center',
    maxWidth: 400,
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(90deg, #4caf50, #81c784)'
    }
  }
}));

const DiamondBackground = styled('div')(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  zIndex: -1, // Set to -1 so it appears behind all content
  pointerEvents: 'none',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 600,
    height: 600,
    background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
    opacity: 0.18,
    transform: 'translate(-50%, -50%) rotate(45deg)',
    borderRadius: 32,
    boxShadow: '0 8px 64px 16px rgba(33,150,243,0.10)',
  }
}));

// Styled background section for consistency with NewExpense
const HeaderSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
  padding: theme.spacing(3),
  borderRadius: theme.spacing(3),
  marginBottom: theme.spacing(3),
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  position: 'relative',
  overflow: 'hidden',
  width: '100%',
  maxWidth: 1500,
  marginLeft: 'auto',
  marginRight: 'auto',
}));

const EditExpense = () => {
  const { expenseId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const response = await axios.get(`/api/expenses/${expenseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Format travel data
        const formattedExpense = {
          ...response.data,
          travel_data: response.data.travel_data.map(travel => ({
            ...travel,
            travelDate: new Date(travel.travel_date),
            fromLocation: travel.from_location,
            toLocation: travel.to_location,
            modeOfTransport: travel.mode_of_transport,
            fareAmount: travel.fare_amount.toString()
          })),
          site_location: response.data.site_location || '',
          site_incharge_emp_code: response.data.site_incharge_emp_code || '',
          journey_allowance: Array.isArray(response.data.journey_allowance)
            ? response.data.journey_allowance.map(row => ({
                ...row,
                from_date: row.from_date ? new Date(row.from_date) : null,
                to_date: row.to_date ? new Date(row.to_date) : null,
                scope: row.scope || '',
                no_of_days: row.no_of_days ? Number(row.no_of_days) : '',
                amount: row.amount ? row.amount.toString() : ''
              }))
            : [],
          return_allowance: Array.isArray(response.data.return_allowance)
            ? response.data.return_allowance.map(row => ({
                ...row,
                from_date: row.from_date ? new Date(row.from_date) : null,
                to_date: row.to_date ? new Date(row.to_date) : null,
                scope: row.scope || '',
                no_of_days: row.no_of_days ? Number(row.no_of_days) : '',
                amount: row.amount ? row.amount.toString() : ''
              }))
            : [],
          stay_allowance: Array.isArray(response.data.stay_allowance)
            ? response.data.stay_allowance.map(row => ({
                ...row,
                from_date: row.from_date ? new Date(row.from_date) : null,
                to_date: row.to_date ? new Date(row.to_date) : null,
                scope: row.scope || '',
                no_of_days: row.no_of_days ? Number(row.no_of_days) : '',
                amount: row.amount ? row.amount.toString() : ''
              }))
            : [],
          // Pass receipt paths for editing
          travel_receipt_path: response.data.travel_receipt_path || '',
          hotel_receipt_path: response.data.hotel_receipt_path || '',
          food_receipt_path: response.data.food_receipt_path || '',
          special_approval_path: response.data.special_approval_path || '',
          // Pass hotel and food expenses for editing
          hotel_expenses: Array.isArray(response.data.hotel_expenses)
            ? response.data.hotel_expenses.map(h => ({
                fromDate: h.from_date ? new Date(h.from_date) : null,
                toDate: h.to_date ? new Date(h.to_date) : null,
                sharing: h.sharing || '',
                location: h.location || '',
                billAmount: h.bill_amount ? h.bill_amount.toString() : ''
              }))
            : [],
          food_expenses: Array.isArray(response.data.food_expenses)
            ? response.data.food_expenses.map(f => ({
                fromDate: f.from_date ? new Date(f.from_date) : null,
                toDate: f.to_date ? new Date(f.to_date) : null,
                sharing: f.sharing ? f.sharing.toString() : '',
                location: f.location || '',
                billAmount: f.bill_amount ? f.bill_amount.toString() : ''
              }))
            : []
        };
        setExpense(formattedExpense);
      } catch (error) {
        console.error('Error fetching expense:', error);
        setError(error.response?.data?.message || 'Failed to fetch expense details');
      } finally {
        setLoading(false);
      }
    };

    if (token && expenseId) {
      fetchExpense();
    }
  }, [expenseId, token]);

  const handleSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      navigate('/dashboard');
    }, 2000);
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <>
      <DiamondBackground />
      <HeaderSection>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, maxWidth: 1500, mx: 'auto', width: '100%', position: 'relative', zIndex: 1 }}>
          <NewExpense 
            isEditing={true}
            initialData={expense}
            expenseId={expenseId}
            onSuccess={handleSuccess}
            journeyAllowance={expense.journey_allowance || []}
            returnAllowance={expense.return_allowance || []}
            stayAllowance={expense.stay_allowance || []}
            // Pass receipt paths for edit mode
            travelReceiptPath={expense.travel_receipt_path}
            hotelReceiptPath={expense.hotel_receipt_path}
            foodReceiptPath={expense.food_receipt_path}
            specialApprovalPath={expense.special_approval_path}
            // Pass hotel and food expenses for edit mode
            hotelExpenses={expense.hotel_expenses}
            foodExpenses={expense.food_expenses}
            // Pass expense totals for receipt field disabling
            travelTotal={expense.travel_data?.reduce((sum, t) => sum + (parseFloat(t.fare_amount) || 0), 0) || 0}
            hotelTotal={expense.hotel_expenses?.reduce((sum, h) => sum + (parseFloat(h.billAmount) || 0), 0) || 0}
            foodTotal={expense.food_expenses?.reduce((sum, f) => sum + (parseFloat(f.billAmount) || 0), 0) || 0}
          />
        </Paper>
      </HeaderSection>

      <SuccessDialog
        open={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          navigate('/dashboard');
        }}
      >
        <Box sx={{ p: 3 }}>
          <CheckCircleIcon sx={{ 
            fontSize: 80, 
            color: 'success.main',
            mb: 2,
            animation: 'bounce 1s ease infinite'
          }} />
          <Typography variant="h5" sx={{ 
            color: 'success.main',
            fontWeight: 'bold',
            mt: 2 
          }}>
            Success!
          </Typography>
          <Typography sx={{ color: 'text.secondary', mt: 1 }}>
            Your expense has been updated successfully.
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button
              fullWidth
              variant="contained"
              color="success"
              onClick={() => {
                setShowSuccess(false);
                navigate('/dashboard');
              }}
              sx={{ borderRadius: 2 }}
            >
              Done
            </Button>
          </Box>
        </Box>
      </SuccessDialog>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </>
  );
};

export default EditExpense;

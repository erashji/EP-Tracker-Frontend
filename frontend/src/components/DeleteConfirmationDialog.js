import React from 'react';
import {
  Dialog,
  Box,
  Typography,
  Button,
  styled
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    padding: theme.spacing(2),
    maxWidth: '400px',
    background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.12)'
  }
}));

const DeleteConfirmationDialog = ({ open, onClose, onConfirm, itemName, itemType }) => (
  <StyledDialog open={open} onClose={onClose}>
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
        Delete {itemType}?
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Are you sure you want to delete "{itemName}"? This action cannot be undone.
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
  </StyledDialog>
);

export default DeleteConfirmationDialog;

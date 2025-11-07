import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, Paper, Grid, Avatar, Button, CircularProgress } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import { formatDisplayDate } from './NewExpense';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL + '/';

const InfoCard = ({ icon, title, value, chip, sx }) => (
  <Paper 
    elevation={0} 
    sx={{ 
      p: 2.5,
      height: '100%',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
        transform: 'translateY(-2px)',
      },
      ...sx
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1 }}>
      {icon}
      <Typography variant="subtitle2" color="text.secondary">
        {title}
      </Typography>
    </Box>
    {chip ? (
      // Avoid Chip inside Typography to fix DOM nesting warning
      <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 32 }}>
        <Chip
          label={value}
          color="primary"
          sx={{ 
            fontWeight: 'medium',
            fontSize: '1rem',
            height: 32
          }}
        />
      </Box>
    ) : (
      <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
        {value || 'N/A'}
      </Typography>
    )}
  </Paper>
);

const EmployeeInformation = ({ user }) => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profile_image_path);

  // Always fetch latest employee info on mount or user change
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await axios.get(`/api/employees/${user.emp_id}`);
        setProfileImage(res.data.profile_image_path);
      } catch (err) {
        setProfileImage(user?.profile_image_path);
      }
    };
    if (user?.emp_id) fetchEmployee();
  }, [user?.emp_id, user?.profile_image_path]);

  const getInitials = (firstName, middleName, lastName) => {
    return `${firstName?.[0] || ''}${middleName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  // Format date_of_joining for display
  const getDateOfJoining = () => {
    if (!user?.date_of_joining) return 'N/A';
    return formatDisplayDate(user.date_of_joining);
  };

  const getMobileDisplay = () => {
    if (!user?.mobile_number) return 'N/A';
    // Try to split country code if present
    const match = user.mobile_number.match(/^(\+\d{1,3})(\d{10})$/);
    if (match) {
      return `${match[1]} ${match[2]}`;
    }
    return user.mobile_number;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('profileImage', file);
    try {
      const res = await axios.post(`/api/employees/${user.emp_id}/profile-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfileImage(res.data.profile_image_path);
    } catch (err) {
      // handle error
    } finally {
      setUploading(false);
    }
  };

  const handleImageDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`/api/employees/${user.emp_id}/profile-image`);
      setProfileImage(null);
    } catch (err) {
      // handle error
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Profile Header */}
      <Paper 
        sx={{ 
          p: 3, 
          mb: 4, 
          display: 'flex', 
          alignItems: 'center',
          gap: 3,
          borderRadius: 2,
          bgcolor: 'primary.lighter'
        }}
      >
        {profileImage ? (
          <Avatar
            src={profileImage.startsWith('uploads/images/') ? BASE_URL + profileImage : BASE_URL + 'uploads/images/' + profileImage.replace(/^uploads\//, '')}
            sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem' }}
          />
        ) : (
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem' }}>
            {getInitials(user?.first_name, user?.middle_name, user?.last_name)}
          </Avatar>
        )}
        <Box>
          <Typography variant="h4" gutterBottom>
            {(user?.first_name || user?.middle_name || user?.last_name)
              ? `${user?.first_name || ''}${user?.middle_name ? ' ' + user.middle_name : ''}${user?.last_name ? ' ' + user.last_name : ''}`.replace(/\s+/g, ' ').trim()
              : user?.full_name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {user?.designation_name} • {user?.department_name}
          </Typography>
        </Box>
        <Box sx={{ ml: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            id="profile-image-upload"
            onChange={handleImageUpload}
          />
          <label htmlFor="profile-image-upload">
            <Button variant="outlined" component="span" size="small" disabled={uploading}>
              {uploading ? <CircularProgress size={18} /> : 'Upload Image'}
            </Button>
          </label>
          {profileImage && (
            <Button variant="outlined" color="error" size="small" onClick={handleImageDelete} disabled={deleting}>
              {deleting ? <CircularProgress size={18} /> : 'Delete Image'}
            </Button>
          )}
        </Box>
      </Paper>

      {/* Information Grid */}
      <Grid container spacing={3}>
        {/* First Row - Most important info */}
        <Grid item xs={12} md={4}>
          <InfoCard
            icon={<BadgeIcon color="primary" />}
            title="Employee Code"
            value={user?.emp_code}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <InfoCard
            icon={<EmailIcon color="primary" />}
            title="Email"
            value={user?.email}
            sx={{
              '& .MuiTypography-h6': {
                fontSize: '1.1rem',
                wordBreak: 'break-all',
                letterSpacing: '0.3px'
              }
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <InfoCard
            icon={<PersonIcon color="primary" />}
            title="Role"
            value={user?.role?.toUpperCase()}
            chip
          />
        </Grid>

        {/* Second Row */}
        <Grid item xs={12} md={4}>
          <InfoCard
            icon={<PhoneIcon color="primary" />}
            title="Mobile Number"
            value={getMobileDisplay()}
          />
        </Grid>
        {/* <Grid item xs={12} md={4}>
          <InfoCard
            icon={<BusinessIcon color="primary" />}
            title="Department"
            value={user?.department_name}
          />
        </Grid> */}
        {/* <Grid item xs={12} md={4}>
          <InfoCard
            icon={<WorkIcon color="primary" />}
            title="Designation"
            value={user?.designation_name}
          />
        </Grid> */}

        {/* Third Row */}
        <Grid item xs={12} md={4}>
          <InfoCard
            icon={<LocationOnIcon color="primary" />}
            title="Location"
            value={user?.location_name}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <InfoCard
            icon={<SupervisorAccountIcon color="primary" />}
            title="First Reporting Manager"
            value={user?.first_reporting_manager_name}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <InfoCard
            icon={<SupervisorAccountIcon color="primary" />}
            title="Second Reporting Manager"
            value={user?.second_reporting_manager_name}
          />
        </Grid>
        {/* New Row: Date of Joining */}
        <Grid item xs={12} md={4}>
          <InfoCard
            icon={<WorkIcon color="primary" />}
            title="Date of Joining"
            value={getDateOfJoining()}
          />
        </Grid>
        {/* New Fields */}
        {/* <Grid item xs={12} md={4}>
          <InfoCard
            icon={<PersonIcon color="primary" />}
            title="Full Name"
            value={
              (user?.first_name || user?.middle_name || user?.last_name)
                ? `${user?.first_name || ''}${user?.middle_name ? ' ' + user.middle_name : ''}${user?.last_name ? ' ' + user.last_name : ''}`.replace(/\s+/g, ' ').trim()
                : user?.full_name
            }
          />
        </Grid> */}
        <Grid item xs={12} md={4}>
          <InfoCard
            icon={<PersonIcon color="primary" />}
            title="Gender"
            value={user?.gender === 'Male' ? 'Male' : user?.gender === 'Female' ? 'Female' : user?.gender || 'N/A'}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <InfoCard
            icon={<PersonIcon color="primary" />}
            title="Category"
            value={user?.category === 'Staff' ? 'Staff' : user?.category === 'Worker' ? 'Worker' : user?.category || 'N/A'}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <InfoCard
            icon={<PersonIcon color="primary" />}
            title="Birth Date"
            value={user?.birth_of_date ? formatDisplayDate(user.birth_of_date) : 'N/A'}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeInformation;

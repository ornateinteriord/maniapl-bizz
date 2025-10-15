// ActivatePackage.tsx
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  Cancel,
  CheckCircle,
  Search,
  Warning,
} from '@mui/icons-material';
import { useGetMemberDetails } from '../../../api/Admin';
import { useActivatePackage } from '../../../api/Memeber';


interface PackageOption {
  value: string;
  label: string;
  amount: number;
}

const ActivatePackage = () => {
  // State management
  const [memberId, setMemberId] = useState<string>('');
  const [searchedMemberId, setSearchedMemberId] = useState<string>('');
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

  const { data: selectedMember, isLoading: isSearching } = useGetMemberDetails(searchedMemberId);


  const { mutate: activatePackage, isPending: isActivating } = useActivatePackage();


  const packageOptions: PackageOption[] = [
    { value: '2600', label: 'Standard Package - ₹2600', amount: 2600 },
  ];

  // Handle member ID search
  const handleSearchMember = () => {
    if (!memberId.trim()) return;
    setSearchedMemberId(memberId.trim());
  };

  // Handle activation
  const handleActivate = async () => {
    if (!selectedMember || selectedMember.status === 'active') return;

    activatePackage(selectedMember.Member_id, {
      onSuccess: (response) => {
        if (response.success) {
          setShowConfirmDialog(false);
          // Reset form after successful activation
          setMemberId('');
          setSearchedMemberId('');
          setSelectedPackage('');
          // You might want to refetch member details here to update the UI
        }
      },
      // Error is already handled in the mutation's onError
    });
  };

  // Reset form
  const handleReset = () => {
    setMemberId('');
    setSearchedMemberId('');
    setSelectedPackage('');
  };

  // Handle Enter key press in search field
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchMember();
    }
  };

  const primaryColor = '#6b21a8';
  const backgroundColor = '#ffff';

  return (
    <Box sx={{ minHeight: '100vh', py: 4, backgroundColor: backgroundColor , mt:4}}>
      <Container maxWidth="md">
        {/* Header */}
        <Box textAlign="center" mb={4}>
          <Typography 
            variant="h3" 
            component="h1" 
            fontWeight="bold" 
            color="#000" 
            gutterBottom
          >
            Activate Package
          </Typography>
          <Typography variant="h6" color="purple.100">
            Activate packages for members
          </Typography>
        </Box>

        {/* Main Card */}
        <Card 
          sx={{ 
            mb: 4, 
            backgroundColor: backgroundColor,
            boxShadow: 3
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Search Section */}
            <Box mb={4}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ color: 'text.primary' }}
              >
                Enter Member ID
              </Typography>
              <Box display="flex" gap={2} alignItems="flex-start">
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Enter member ID"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: primaryColor,
                      },
                      '&:hover fieldset': {
                        borderColor: primaryColor,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: primaryColor,
                      },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSearchMember}
                  disabled={!memberId.trim() || isSearching}
                  startIcon={isSearching ? <CircularProgress size={20} /> : <Search />}
                  sx={{
                    backgroundColor: primaryColor,
                    '&:hover': {
                      backgroundColor: '#581c87',
                    },
                    minWidth: '120px',
                    height: '56px'
                  }}
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
              </Box>
            </Box>

            {selectedMember && (
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 3, 
                  mb: 3, 
                  borderColor: primaryColor,
                  backgroundColor: 'background.default'
                }}
              >
                <Typography 
                  variant="h5" 
                  gutterBottom 
                  sx={{ color: primaryColor, fontWeight: 'medium' }}
                >
                  Member Details
                </Typography>
                
                <Grid container spacing={3} mb={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Member ID
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedMember.Member_id}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Name
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedMember.Name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      icon={
                        selectedMember.status === 'active' ? <CheckCircle /> : 
                        selectedMember.status === 'Inactive' ? <Cancel /> : <Warning/>
                      }
                      label={
                        selectedMember.status === 'active' ? 'active' : 
                        selectedMember.status === 'Inactive' ? 'Inactive' : 'Pending'
                      }
                      color={
                        selectedMember.status === 'active' ? 'success' : 
                        selectedMember.status === 'Inactive' ? 'error' : 'warning'
                      }
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Join Date
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedMember.Date_of_joining}
                    </Typography>
                  </Grid>
                </Grid>

                {selectedMember.status === 'Pending' && (
                  <Box mb={3}>
                    <FormControl fullWidth>
                      <InputLabel id="package-select-label">Select Package</InputLabel>
                      <Select
                        labelId="package-select-label"
                        value={selectedPackage}
                        label="Select Package"
                        onChange={(e) => setSelectedPackage(e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: primaryColor,
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: primaryColor,
                          },
                        }}
                      >
                        <MenuItem value="">
                          <em>Select a package</em>
                        </MenuItem>
                        {packageOptions.map((pkg) => (
                          <MenuItem key={pkg.value} value={pkg.value}>
                            {pkg.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      ₹2600 package is available for activation
                    </Typography>
                  </Box>
                )}

                {/* Action Buttons */}
               <Box display="flex" flexDirection="column" gap={2}>
  {selectedMember.status === 'Pending' ? (
    <>
    <Box display="flex" gap={2} justifyContent="space-between">
      <Button
        variant="contained"
        onClick={() => setShowConfirmDialog(true)}
        disabled={!selectedPackage}
        fullWidth
        sx={{
          backgroundColor: primaryColor,
          '&:hover': {
            backgroundColor: '#581c87',
          },
          py: 1.5,
        }}
      >
        Activate Package
      </Button>

      <Button
        variant="outlined"
        onClick={handleReset}
        sx={{
          borderColor: 'grey.400',
          color: 'text.primary',
          minWidth: '120px',
          py: 1.5,
        }}
      >
        Cancel
      </Button>
</Box>
    </>
  ) : selectedMember.status === 'Inactive' ? (
    <Box
      sx={{
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeeba',
        color: '#856404',
        p: 2,
        borderRadius: 1,
        textAlign: 'center',
        fontWeight: 500,
      }}
    >
      ⚠️ This member cannot be activated.
    </Box>
  ) : (
    <Button
      variant="contained"
      disabled
      fullWidth
      sx={{
        backgroundColor: 'grey.300',
        color: 'grey.500',
        py: 1.5,
      }}
    >
      <CheckCircle sx={{ mr: 1 }} />
      Already Active
    </Button>
  )}
</Box>

              </Paper>
            )}
          </CardContent>
        </Card>
      </Container>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => !isActivating && setShowConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { backgroundColor: backgroundColor }
        }}
      >
        <DialogTitle sx={{ color: primaryColor, fontWeight: 'medium' }}>
          Confirm Activation
        </DialogTitle>
        <DialogContent>
          <Box sx={{  backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body1" fontWeight="medium">
              Member ID: {selectedMember?.Member_id}
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              Member Name: {selectedMember?.Name}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to activate this package for the member?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowConfirmDialog(false)}
            disabled={isActivating}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleActivate}
            disabled={isActivating}
            variant="contained"
            startIcon={isActivating ? <CircularProgress size={20} /> : <CheckCircle />}
            sx={{
              backgroundColor: primaryColor,
              '&:hover': {
                backgroundColor: '#581c87',
              },
            }}
          >
            {isActivating ? 'Activating...' : 'Confirm '}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ActivatePackage;
import React from 'react';
import { Card, CardContent, Typography, Box, Button } from '@mui/material';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';

interface DashboardCardProps {
  amount: string | number;
  title: string;
  subTitle?: string; 
  IconComponent?: React.ElementType;
  type?: 'default' | 'loan'; // Add type prop to distinguish loan card
  dueAmount?: string | number; // For loan card
  onRepay?: () => void; // For loan card
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  amount, 
  title, 
  subTitle, 
  IconComponent,
  type = 'default',
  dueAmount = 0,
  onRepay
}) => {
  
  // If it's a loan card, render the special layout
  if (type === 'loan') {
    return (
      <Card
        sx={{
          background: 'linear-gradient(to right, #4f9de8, #a67bd5)',
          color: '#fff',
          borderRadius: '10px',
          padding: { xs: '6px', sm: '8px' },
          display: 'flex',
          alignItems: 'center',
          boxShadow: 3,
          height: '100%',
          minHeight: { xs: '120px', sm: '160px' },
          width: '100%',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Status Badge */}
        {/* <Box 
          sx={{ 
            position: 'absolute',
            top: -8,
            right: 8,
            backgroundColor: '#000',
            color: 'white',
            px: 1.2,
            py: 0.4,
            borderRadius: 1.5,
            fontSize: '0.7rem',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
        >
          APPROVED
        </Box> */}
        
        <CardContent sx={{ 
          textAlign: 'center', 
          p: { xs: '8px', sm: '12px' },
          width: '100%',
          '&:last-child': { paddingBottom: { xs: '8px', sm: '12px' } }
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 'bold',
              mb: 1.5,
              fontSize: { xs: '0.9rem', sm: '1rem' }
            }}
          >
            {title}
          </Typography>
          
          {/* Side by side layout */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            gap: { xs: 1, sm: 2 }, 
            mb: 2 
          }}>
            {/* Loan Amount */}
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '1.3rem', sm: '1.5rem' },
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                ₹{amount}
              </Typography>
            </Box>
            
            {/* Due Amount */}
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '0.75rem', sm: '1rem' },
                  mb: 0.5,
                  opacity: 0.9
                }}
              >
                Due Amount
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                ₹{dueAmount}
              </Typography>
            </Box>
          </Box>
          
          <Button
            variant="contained"
            onClick={onRepay}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              },
              fontWeight: 'bold',
              textTransform: 'none',
              px: { xs: 2, sm: 3 },
              py: 0.8,
              fontSize: { xs: '0.8rem', sm: '0.85rem' },
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              minWidth: '120px'
            }}
          >
            Repay Now
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Default card layout
  return (
    <Card
      sx={{
        background: 'linear-gradient(to right, #4f9de8, #a67bd5)',
        color: '#fff',
        borderRadius: '10px',
        padding: { xs: '12px', sm: '16px' },
        display: 'flex',
        alignItems: 'center',
        boxShadow: 3,
        height: '100%',
        minHeight: { xs: '120px', sm: '160px' },
        width: '100%',
        flexDirection: { xs: 'row', sm: 'row' },
      }}
    >
      <Box
        sx={{
          width: { xs: '100%', sm: '120px' },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
          mb: { xs: 1, sm: 0 },
        }}
      >
        {IconComponent ? <IconComponent sx={{ fontSize: { xs: '2rem', sm: '2.5rem' } }} /> : <CurrencyRupeeIcon sx={{ fontSize: { xs: '2rem', sm: '2.5rem' } }} />}
      </Box>
      <CardContent 
        sx={{ 
          padding: { xs: '8px', sm: '16px' },
          width: '100%',
          '&:last-child': { paddingBottom: { xs: '8px', sm: '16px' } }
        }}
      >
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 'bold', 
            textAlign: 'center',
            marginBottom: '5px',
            fontSize: { xs: '1.5rem', sm: '2rem' }
          }}
        >
          {amount}
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            textAlign: 'center', 
            fontWeight: '500',
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}
        >
          {title}
        </Typography>
        {subTitle && ( 
          <Typography 
            variant="body2" 
            sx={{ 
              textAlign: 'center', 
              fontWeight: '400',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              marginTop: '4px'
            }}
          >
            {subTitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
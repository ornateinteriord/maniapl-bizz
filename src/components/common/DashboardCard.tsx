import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';

interface DashboardCardProps {
  amount: string | number;
  title: string;
  subTitle?: string; 
  IconComponent?: React.ElementType; 
}

const DashboardCard: React.FC<DashboardCardProps> = ({ amount, title, subTitle, IconComponent }) => {
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

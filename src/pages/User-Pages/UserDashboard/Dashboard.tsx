import { useState } from 'react';
import { Card, CardContent, Grid, Typography, Button } from '@mui/material';
import { cn } from '../../../lib/utils';
import '../../Dashboard/dashboard.scss';
import DashboardTable from '../../Dashboard/DashboardTable';
import { MuiDatePicker } from '../../../components/common/DateFilterComponent';
import DashboardCard from '../../../components/common/DashboardCard';
import { getUserDashboardTableColumns } from '../../../utils/DataTableColumnsProvider';
import TokenService from '../../../api/token/tokenService';
import { useCheckSponsorReward, useGetWalletOverview, useGetSponsers,  useGetMemberDetails } from '../../../api/Memeber';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { toast } from 'react-toastify';
const UserDashboard = () => { 
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  const memberId = TokenService.getMemberId(); 
  
  const { data: sponsorRewardData } = useCheckSponsorReward(memberId);
  const { data: walletOverview, isLoading: walletLoading } = useGetWalletOverview(memberId);
  const { data: sponsersData, isLoading: sponsersLoading } = useGetSponsers(memberId);
  const { data: memberDetails, isLoading: memberLoading } = useGetMemberDetails(memberId);

  const loading = walletLoading  || sponsersLoading  || memberLoading;

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  const handleClaimReward = () => {
    console.log('Claiming reward for member:', memberId);
  };

              const handleCopyReferralLink = () => {
    if (!memberDetails?.Member_id) return;
    
    const referralLink = `https://mscs-beige.vercel.app/register?ref=${memberDetails.Member_id}`;
    
    navigator.clipboard.writeText(referralLink)
      .then(() => {
        toast.success('Referral link copied to clipboard!');
      })
      .catch(() => {
        toast.error('Failed to copy referral link');
      });
  };

  const levelBenefitsAmount = walletOverview?.levelBenefits ||  0;
  const directBenefitsAmount =  walletOverview?.directBenefits || 0;
  const totalEarningsAmount = walletOverview?.totalBenefits || 0;
  const totalWithdrawsAmount = walletOverview?.totalWithdrawal || 0;
  const walletBalanceAmount = walletOverview?.balance || 0;

  const tableData = [
    {
      title: "Today's Registration",
      direct: sponsersData?.sponsoredUsers?.length || 0,
      indirect: 0,
      total: (sponsersData?.sponsoredUsers?.length || 0),
    },
    {
      title: "Today's Activation",
      direct: 0,
      indirect: 0,
      total: 0,
    },
    {
      title: 'Total Registration',
      direct: memberDetails?.direct_referrals?.length || 0,
      indirect: (memberDetails?.total_team ? memberDetails.total_team - (memberDetails?.direct_referrals?.length || 0) : 0),
      total: memberDetails?.total_team || (memberDetails?.direct_referrals?.length || 0),
    },
    {
      title: 'Total Activation',
      direct: 0,
      indirect: 0,
      total: memberDetails?.status === 'active' ? 1 : 0,
    },
    {
      title: 'Current Month Activation',
      direct: 0,
      indirect: 0,
      total: 0,
    },
  ];

  return (
    <>
      <div className="h-auto md:h-40 relative w-full overflow-hidden bg-[#6b21a8] flex flex-col items-center justify-center mt-10 py-6 md:py-0">
        <div className="absolute inset-0 w-full h-full z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-evenly items-center w-full px-4 md:px-8 relative z-20 gap-6 md:gap-0">
          <div className="text-center md:text-left">
            <h1 className={cn("text-xl md:text-4xl text-white")}>
              Welcome to Dashboard
            </h1>
            <p className="mt-2 text-neutral-300 text-sm md:text-base">
              Manage your network and track your success
            </p>
          </div>

          <div className="flex items-center gap-6 md:gap-12 text-white">
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold mb-2">{memberDetails ? `${memberDetails.direct_referrals?.length || 0}/${memberDetails.direct_referrals?.length || 0}` : '—'}</div>
              <div className="text-xs md:text-sm flex items-center justify-center gap-1">
                <span className="material-icons text-base md:text-lg">person</span>
                Direct
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold mb-2">{memberDetails ? `${memberDetails.total_team || 0}/${memberDetails.total_team || 0}` : '—'}</div>
              <div className="text-xs md:text-sm flex items-center justify-center gap-1">
                <span className="material-icons text-base md:text-lg">groups</span>
                Team
              </div>
            </div>
          </div>

          {sponsorRewardData?.isEligibleForReward && (
            <div className="flex justify-center mt-4">
              <Button
                variant="contained"
                color="success"
                onClick={handleClaimReward}
                sx={{
                  textTransform: 'capitalize',
                  backgroundColor: '#DDAC17',
                  '&:hover': { backgroundColor: '#Ecc440' },
                  fontWeight: 'bold',
                  px: 4,
                  py: 1,
                }}
              >
                Claim Reward
              </Button>
            </div>
          )}

          <div className="flex flex-col items-center gap-1">
             
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#f3e8ff',
                  maxWidth: '200px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {memberDetails?.Member_id ? 
                  `https://mscs-beige.vercel.app/register?ref=${memberDetails.Member_id}` : 
                  'Loading...'
                }
              </Typography>
               <Button
                variant="contained"
                startIcon={<ContentCopyIcon />}
                onClick={handleCopyReferralLink}
                disabled={!memberDetails?.Member_id}
                sx={{
                  backgroundColor: '#ffffff',
                  color: '#6b21a8',
                  '&:hover': {
                    backgroundColor: '#f3e8ff',
                  },
                  fontWeight: 'bold',
                  textTransform: 'none',
                }}
              >
                Referral Link
              </Button>
            </div>

        </div>
      </div>

      <Grid 
        container 
        spacing={{ xs: 2, sm: 3 }} 
        sx={{ 
          mx: { xs: 1, sm: 2 }, 
          my: 2,
          pt: 5,
          pr: 7,
          width: 'auto',
          '& .MuiGrid-item': {
            display: 'flex',
          }
        }}
      >
      <Grid item xs={12} sm={6} md={4}>
  <DashboardCard amount={loading ? 0 : levelBenefitsAmount} title="Level Benefits" />
</Grid>
<Grid item xs={12} sm={6} md={4}>
  <DashboardCard amount={loading ? 0 : directBenefitsAmount} title="Direct Benefits" />
</Grid>
<Grid item xs={12} sm={6} md={4}>
  <DashboardCard amount={loading ? 0 : totalEarningsAmount} title="Total Earnings" />
</Grid>
<Grid item xs={12} sm={6} md={4}>
  <DashboardCard amount={loading ? 0 : totalWithdrawsAmount} title="Total Withdraws" />
</Grid>
<Grid item xs={12} sm={6} md={4}>
  <DashboardCard amount={loading ? 0 : walletBalanceAmount} title="Wallet Balance" />
</Grid>

      </Grid>

      <div className='mt-10 p-4 rounded shadow'>    
        <Card className='bg-gray-300'>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h6" style={{ fontWeight: 'bold', color: '#7e22ce' }}>Member Statistics</Typography>
              <MuiDatePicker
                date={selectedDate}
                setDate={handleDateChange}
                label="Filter by Date"
              />
            </div>

            <DashboardTable data={tableData} columns={getUserDashboardTableColumns()} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default UserDashboard;
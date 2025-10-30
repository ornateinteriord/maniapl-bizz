import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Grid, 
  Typography, 
  Button, 
  Link, 
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress // Added missing import
} from '@mui/material';
import { cn } from '../../../lib/utils';
import '../../Dashboard/dashboard.scss';
import DashboardTable from '../../Dashboard/DashboardTable';
import { MuiDatePicker } from '../../../components/common/DateFilterComponent';
import DashboardCard from '../../../components/common/DashboardCard';
import { getUserDashboardTableColumns } from '../../../utils/DataTableColumnsProvider';
import TokenService from '../../../api/token/tokenService';
import { useCheckSponsorReward, useGetWalletOverview, useGetSponsers,  useGetMemberDetails, useClimeLoan, useGetTransactionDetails } from '../../../api/Memeber';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import { toast } from 'react-toastify';

const UserDashboard = () => { 
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [repaymentDialogOpen, setRepaymentDialogOpen] = useState(false);
  const [selectedRepayAmount, setSelectedRepayAmount] = useState(500);
  const [isProcessing, setIsProcessing] = useState(false); // Added missing state

  const memberId = TokenService.getMemberId(); 
  
  const { data: sponsorRewardData } = useCheckSponsorReward(memberId);
  const { data: walletOverview, isLoading: walletLoading } = useGetWalletOverview(memberId);
  const { data: sponsersData, isLoading: sponsersLoading } = useGetSponsers(memberId);
  const { data: memberDetails, isLoading: memberLoading } = useGetMemberDetails(memberId);
  const { mutate: climeLoan, isPending: isClaiming } = useClimeLoan();

  const { data: transactionsResponse, isLoading: loanStatusLoading } = useGetTransactionDetails("all");

  const allTransactions = transactionsResponse?.data || [];
  const repayConfig = transactionsResponse?.repayConfig;

  const approvedLoan = Array.isArray(allTransactions) 
    ? allTransactions.find(transaction => 
        transaction.status?.toLowerCase() === 'approved' && 
        (transaction.transaction_type?.includes('Loan') || transaction.benefit_type === 'loan')
      )
    : null;

  const isLoanApproved = !!approvedLoan;
  const loanAmount = approvedLoan?.ew_credit || 0; 
  const dueAmount = approvedLoan?.ew_debit || 0;

  const loading = walletLoading  || sponsersLoading  || memberLoading || loanStatusLoading;
  const isRepayEnabled = repayConfig?.isEnabled || false;
  const repayMessage = repayConfig?.message || "";

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  const handleClaimReward = () => {
    setClaimDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setClaimDialogOpen(false);
  };

  const handleConfirmClaim = () => {
    if (!memberId) {
      toast.error("Member ID not found!");
      return;
    }
    const payload = {
      note: "Requesting reward loan",
    };

    climeLoan(
      { memberId, data: payload },
      {
        onSuccess: () => {
          setClaimDialogOpen(false);
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to submit loan request");
        }
      }
    );
  };

  // Added missing handleRepayment function
  const handleRepayment = () => {
    if (!memberId) {
      toast.error("Member ID not found!");
      return;
    }

    if (selectedRepayAmount === 0) {
      toast.error("Please select a repayment amount");
      return;
    }

    setIsProcessing(true);

    // Simulate API call - replace with your actual repayment API
    setTimeout(() => {
      setIsProcessing(false);
      setRepaymentDialogOpen(false);
      toast.success(`₹${selectedRepayAmount} repayment submitted successfully!`);
      
      // Reset selected amount
      setSelectedRepayAmount(500);
    }, 2000);
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

  const handleShareReferralLink = () => {
    if (!memberDetails?.Member_id) return;
    
    const referralLink = `https://mscs-beige.vercel.app/register?ref=${memberDetails.Member_id}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Join me!',
        text: 'Check out this amazing platform and join using my referral link!',
        url: referralLink,
      })
      .then(() => console.log('Successful share'))
      .catch((error) => console.log('Error sharing:', error));
    } else {
      handleCopyReferralLink();
    }
  };

  const levelBenefitsAmount = walletOverview?.levelBenefits ||  0;
  const directBenefitsAmount =  walletOverview?.directBenefits || 0;
  const totalEarningsAmount = walletOverview?.totalBenefits || 0;
  const totalWithdrawsAmount = walletOverview?.totalWithdrawal || 0;
  const walletBalanceAmount = walletOverview?.balance || 0;

  const tableData = [
    {
      title: "Today's Registration",
      direct: sponsersData?.sponsoredUsers?.filter((user:any) => user.status === 'active')?.length || 0,
      indirect: 0,
      total: sponsersData?.sponsoredUsers?.filter((user:any) => user.status === 'active')?.length || 0,
    },
    {
      title: "Today's Activation",
      direct: sponsersData?.sponsoredUsers?.filter((user:any) => 
        user.status === 'active' && 
        user.activationDate?.toDateString() === new Date().toDateString()
      )?.length || 0,
      indirect: 0,
      total: sponsersData?.sponsoredUsers?.filter((user:any) => 
        user.status === 'active' && 
        user.activationDate?.toDateString() === new Date().toDateString()
      )?.length || 0,
    },
    {
      title: 'Total Registration',
      direct: memberDetails?.direct_referrals?.filter((ref:any) => ref.status === 'active')?.length || 0,
      indirect: (memberDetails?.total_team || 0) - (memberDetails?.direct_referrals?.filter((ref:any) => ref.status === 'active')?.length || 0),
      total: memberDetails?.total_team || 0,
    },
    {
      title: 'Total Activation',
      direct: memberDetails?.direct_referrals?.filter((ref:any) => ref.status === 'active')?.length || 0,
      indirect: (memberDetails?.total_team || 0) - (memberDetails?.direct_referrals?.filter((ref:any) => ref.status === 'active')?.length || 0),
      total: memberDetails?.total_team || 0,
    },
    {
      title: 'Current Month Activation',
      direct: memberDetails?.direct_referrals?.filter((ref:any) => 
        ref.status === 'active' && 
        new Date(ref.activationDate).getMonth() === new Date().getMonth() &&
        new Date(ref.activationDate).getFullYear() === new Date().getFullYear()
      )?.length || 0,
      indirect: 0,
      total: memberDetails?.direct_referrals?.filter((ref:any) => 
        ref.status === 'active' && 
        new Date(ref.activationDate).getMonth() === new Date().getMonth() &&
        new Date(ref.activationDate).getFullYear() === new Date().getFullYear()
      )?.length || 0,
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
        </div>
      </div>

      {/* Claim Reward Dialog */}
      <Dialog
        open={claimDialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="claim-reward-dialog-title"
        aria-describedby="claim-reward-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: 2,
            padding: 1,
            minWidth: { xs: '300px', sm: '400px' }
          }
        }}
      >
        <DialogTitle 
          id="claim-reward-dialog-title"
          sx={{ 
            textAlign: 'center',
            color: '#7e22ce',
            fontWeight: 'bold',
            fontSize: '1.5rem',
            pb: 1
          }}
        >
          🎉 Congratulations!
        </DialogTitle>
        
        <DialogContent>
          <DialogContentText 
            id="claim-reward-dialog-description"
            sx={{
              textAlign: 'center',
              color: '#4b5563',
              fontSize: '1.1rem',
              mb: 2
            }}
          >
            <p>
              You are eligible for a reward loan of{" "}
              <span style={{ color: "gold", fontWeight: "bold" }}>₹5000</span>!
            </p>
          </DialogContentText>
          
          <DialogContentText 
            sx={{
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '0.9rem'
            }}
          >
            Submit your loan request and our admin team will review and approve the appropriate amount based on your eligibility.
          </DialogContentText>
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 3, pt: 1 }}>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{
              textTransform: 'capitalize',
              borderColor: '#6b7280',
              color: '#6b7280',
              '&:hover': {
                borderColor: '#4b5563',
                backgroundColor: '#f3f4f6',
              },
              fontWeight: 'bold',
              px: 4,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmClaim}
            variant="contained"
            autoFocus
            disabled={isClaiming}
            sx={{
              textTransform: 'capitalize',
              backgroundColor: '#DDAC17',
              '&:hover': { backgroundColor: '#Ecc440' },
              fontWeight: 'bold',
              px: 4,
            }}
          >
            {isClaiming ? 'Processing...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>

      <Box 
        sx={{ 
          mx: { xs: 2, sm: 3, md: 4 },
          my: 1.5,
          p: 2,
          backgroundColor: '#f8f5ff',
          borderRadius: 2,
          border: '1px solid #e9d5ff',
          boxShadow: '0 2px 8px rgba(107, 33, 168, 0.1)',
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 1, 
            color: '#7e22ce',
            fontWeight: 'bold',
            textAlign: 'center'
          }}
        >
          Your Referral Link
        </Typography>
        
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            gap: 2,
            justifyContent: 'center'
          }}
        >
          <Box 
            sx={{ 
              flexGrow: 1,
              maxWidth: { sm: '400px', md: '500px' },
              width: '100%'
            }}
          >
            <Link
              href={memberDetails?.Member_id ? `https://mscs-beige.vercel.app/register?ref=${memberDetails.Member_id}` : '#'}
              target="_blank" 
              rel="noopener noreferrer"
              sx={{
                color: '#6b21a8',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
                display: 'block',
                p: 1.5,
                backgroundColor: 'white',
                borderRadius: 1,
                border: '1px solid #d8b4fe',
                wordBreak: 'break-all',
                textAlign: 'center',
                fontSize: { xs: '0.8rem', sm: '0.9rem' }
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#6b21a8',
                  fontWeight: 'medium',
                }}
              >
                {memberDetails?.Member_id ? 
                  `https://mscs-beige.vercel.app/register?ref=${memberDetails.Member_id}` : 
                  'Loading...'
                }
              </Typography>
            </Link>
          </Box>

          <Box 
            sx={{ 
              display: 'flex', 
              gap: 1,
              flexDirection: { xs: 'row', sm: 'column', md: 'row' },
              width: { xs: '100%', sm: 'auto' },
              justifyContent: { xs: 'space-between', sm: 'center' }
            }}
          >
            <Button
              variant="contained"
              startIcon={<ContentCopyIcon />}
              onClick={handleCopyReferralLink}
              disabled={!memberDetails?.Member_id}
              sx={{
                backgroundColor: '#6b21a8',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#581c87',
                },
                fontWeight: 'bold',
                textTransform: 'none',
                minWidth: { xs: '140px', sm: 'auto' }
              }}
            >
              Copy Link
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<ShareIcon />}
              onClick={handleShareReferralLink}
              disabled={!memberDetails?.Member_id}
              sx={{
                borderColor: '#6b21a8',
                color: '#6b21a8',
                '&:hover': {
                  backgroundColor: '#f3e8ff',
                  borderColor: '#581c87',
                },
                fontWeight: 'bold',
                textTransform: 'none',
                minWidth: { xs: '140px', sm: 'auto' }
              }}
            >
              Share Link
            </Button>
          </Box>
        </Box>
        
        <Typography 
          variant="caption" 
          sx={{ 
            display: 'block',
            textAlign: 'center',
            mt: 1,
            color: '#6b21a8',
            opacity: 0.8
          }}
        >
          Share this link with friends and earn rewards when they join!
        </Typography>
      </Box>

      <Grid 
        container 
        spacing={{ xs: 2, sm: 3 }} 
        sx={{ 
          mx: { xs: 1, sm: 2 }, 
          my: 2,
          pt: 3,
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
        {isLoanApproved && (
          <Grid item xs={12} sm={6} md={4}>
            <DashboardCard
              amount={loanAmount}
              dueAmount={dueAmount}
              title="Loan Amount"
              type="loan"
              onRepay={() => {
                if (isRepayEnabled) {
                  setRepaymentDialogOpen(true);
                } else {
                  toast.warning(repayMessage || 'Repayment option is currently disabled.');
                }
              }}
            />
          </Grid>
        )}
      </Grid>

      {/* Repayment Dialog */}
      <Dialog
        open={repaymentDialogOpen}
        onClose={() => !isProcessing && setRepaymentDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
            minWidth: { xs: '320px', sm: '400px' },
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          },
        }}
      >
        <Box
          sx={{
            height: 4,
            background: 'linear-gradient(90deg, #6b21a8 0%, #a855f7 100%)',
            borderRadius: 2,
            mb: 1,
          }}
        />

        <DialogTitle
          sx={{
            textAlign: 'center',
            fontWeight: 'bold',
            color: '#6b21a8',
            fontSize: '1.4rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          <Box
            component="span"
            sx={{
              background: 'linear-gradient(135deg, #6b21a8 0%, #a855f7 100%)',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1rem',
            }}
          >
            💰
          </Box>
          Repay Your Loan
        </DialogTitle>

        <DialogContent>
          <DialogContentText
            sx={{
              textAlign: 'center',
              mb: 3,
              fontSize: '1rem',
              color: '#4b5563',
              lineHeight: 1.6,
            }}
          >
            Choose the repayment amount and confirm to proceed.
          </DialogContentText>

          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                color: '#6b7280', 
                mb: 1.5,
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Loan Summary
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                p: 1.5,
                backgroundColor: '#f8fafc',
                borderRadius: 2,
                border: '1px solid #e2e8f0'
              }}>
                <Typography sx={{ color: '#64748b' }}>Total Loan</Typography>
                <Typography sx={{ fontWeight: 600 }}>₹{loanAmount}</Typography>
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                p: 1.5,
                backgroundColor: '#f0fdf4',
                borderRadius: 2,
                border: '1px solid #bbf7d0'
              }}>
                <Typography sx={{ color: '#64748b' }}>Paid</Typography>
                <Typography sx={{ fontWeight: 600, color: '#059669' }}>
                  ₹{loanAmount - dueAmount}
                </Typography>
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                p: 1.5,
                backgroundColor: '#fef2f2',
                borderRadius: 2,
                border: '1px solid #fecaca'
              }}>
                <Typography sx={{ color: '#64748b' }}>Due Amount</Typography>
                <Typography sx={{ fontWeight: 700, color: '#dc2626' }}>
                  ₹{dueAmount}
                </Typography>
              </Box>
            </Box>
          </Box>

          <FormControl fullWidth size="medium" sx={{ mt: 2 }}>
            <InputLabel sx={{ fontWeight: 500 }}>Repayment Amount</InputLabel>
            <Select
              value={selectedRepayAmount}
              label="Repayment Amount"
              onChange={(e) => setSelectedRepayAmount(Number(e.target.value))}
              disabled={isProcessing}
              sx={{
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#d1d5db',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#6b21a8',
                },
              }}
            >
              {[500, 1000, 2000, dueAmount].filter(amount => amount <= dueAmount).map((amount) => (
                <MenuItem 
                  key={amount} 
                  value={amount}
                  sx={{ fontWeight: amount === dueAmount ? 600 : 400 }}
                >
                  ₹{amount} {amount === dueAmount && '(Full Payment)'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {isProcessing && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <CircularProgress size={20} sx={{ color: '#6b21a8' }} />
              <Typography variant="body2" sx={{ color: '#6b7280', mt: 1 }}>
                Processing your payment...
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ 
          justifyContent: 'center', 
          pb: 2,
          pt: 1,
          gap: 1,
        }}>
          <Button
            onClick={() => setRepaymentDialogOpen(false)}
            variant="outlined"
            disabled={isProcessing}
            sx={{
              borderColor: '#d1d5db',
              color: '#6b7280',
              fontWeight: 600,
              textTransform: 'capitalize',
              borderRadius: 2,
              px: 3,
              '&:hover': {
                backgroundColor: '#f3f4f6',
                borderColor: '#9ca3af',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRepayment}
            variant="contained"
            disabled={isProcessing || selectedRepayAmount === 0}
            sx={{
              background: 'linear-gradient(135deg, #6b21a8 0%, #a855f7 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #581c87 0%, #9333ea 100%)',
                boxShadow: '0 4px 12px rgba(107, 33, 168, 0.3)',
              },
              textTransform: 'capitalize',
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              boxShadow: 'none',
            }}
          >
            {isProcessing ? 'Processing...' : `Pay ₹${selectedRepayAmount}`}
          </Button>
        </DialogActions>
      </Dialog>

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
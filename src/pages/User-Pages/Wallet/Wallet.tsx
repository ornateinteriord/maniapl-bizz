import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Typography,
  Grid,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DataTable from "react-data-table-component";
import { useMediaQuery } from "@mui/material";
import {
  DASHBOARD_CUTSOM_STYLE,
  getWalletColumns,
} from "../../../utils/DataTableColumnsProvider";
import TokenService from "../../../api/token/tokenService";
import { useGetWalletOverview, useWalletWithdraw } from "../../../api/Memeber";

const Wallet = () => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [amount, setAmount] = useState("");
  const [deduction, setDeduction] = useState(0);
  const [netAmount, setNetAmount] = useState(0);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const [optimisticBalance, setOptimisticBalance] = useState<number | null>(null);

  const memberId = TokenService.getMemberId();

  const {
    data: walletData,
    isLoading,
    refetch,
  } = useGetWalletOverview(memberId);
  
  console.log("Wallet Data:", walletData); // Debug log

  const withdrawMutation = useWalletWithdraw(memberId);

  useEffect(() => {
    if (walletData?.data?.balance) {
      const balance = parseFloat(walletData.data.balance);
      setOptimisticBalance(balance);
    }
  }, [walletData?.data?.balance]);

  const handleAmountChange = (e: any) => {
    const selectedAmount = e.target.value;
    setAmount(selectedAmount);

    if (selectedAmount && selectedAmount !== "0") {
      const withdrawalAmount = parseFloat(selectedAmount);
      const calculatedDeduction = withdrawalAmount * 0.15;
      const calculatedNetAmount = withdrawalAmount - calculatedDeduction;

      setDeduction(calculatedDeduction);
      setNetAmount(calculatedNetAmount);
    } else {
      setDeduction(0);
      setNetAmount(0);
    }
  };

  const handleWithdraw = () => {
    if (!amount || amount === "0") {
      setAlert({
        open: true,
        message: "Please select withdrawal amount",
        severity: "warning",
      });
      return;
    }

    if (!memberId) {
      setAlert({
        open: true,
        message: "Member ID not found",
        severity: "error",
      });
      return;
    }

    const withdrawalAmount = parseFloat(amount);
    const currentBalance = optimisticBalance !== null ? optimisticBalance : parseFloat(walletData?.balance || 0);
    
    if (withdrawalAmount > currentBalance) {
      setAlert({
        open: true,
        message: `Insufficient balance. Available: ₹${currentBalance.toFixed(2)}`,
        severity: "error",
      });
      return;
    }

    if (withdrawalAmount < 500) {
      setAlert({
        open: true,
        message: "Minimum withdrawal amount is ₹500",
        severity: "warning",
      });
      return;
    }

    if (withdrawalAmount > 1000) {
      setAlert({
        open: true,
        message: "Maximum withdrawal amount is ₹1000",
        severity: "warning",
      });
      return;
    }

    // Optimistic UI update
    const newBalance = currentBalance - withdrawalAmount;
    setOptimisticBalance(newBalance);

    withdrawMutation.mutate(
      { memberId: memberId, amount: amount },
      {
        onSuccess: (data) => {
          setAmount("");
          setDeduction(0);
          setNetAmount(0);
          refetch();

          setAlert({
            open: true,
            message: data?.message || "Withdrawal completed successfully!",
            severity: "success",
          });
        },
        onError: (error) => {
          // Revert optimistic update on error
          setOptimisticBalance(parseFloat(walletData?.balance || 0));
          setAlert({
            open: true,
            message: error.message || "Withdrawal failed",
            severity: "error",
          });
        }
      }
    );
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  // Use optimistic balance if available, otherwise use server balance
  // Ensure balance is never negative (backend should handle this, but frontend safety)
  const displayBalance = Math.max(0, optimisticBalance !== null ? optimisticBalance : parseFloat(walletData?.balance || 0));

  // Debug: Check what's actually in the data
  console.log("Total Withdrawal from API:", walletData?.totalWithdrawal);
  console.log("Total Withdrawal type:", typeof walletData?.totalWithdrawal);

  if (isLoading) {
    return (
      <Card
        sx={{
          margin: isMobile ? "1rem" : "2rem",
          mt: 10,
          textAlign: "center",
          p: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
        }}
      >
        <CircularProgress sx={{ color: "#7e22ce" }} />
      </Card>
    );
  }

  return (
    <Card
      sx={{
        margin: isMobile ? "1rem" : "2rem",
        backgroundColor: "#fff",
        mt: 10,
      }}
    >
      <CardContent sx={{ padding: isMobile ? "12px" : "24px" }}>
        <Snackbar
          open={alert.open}
          autoHideDuration={5000}
          onClose={handleCloseAlert}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >

        </Snackbar>
        
        <Accordion
          defaultExpanded
          sx={{
            boxShadow: "none",
            "&.MuiAccordion-root": {
              backgroundColor: "#fff",
            },
          }}
        >
          <AccordionDetails>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: 3,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 2,
                    textAlign: "center",
                    border: "2px solid #7e22ce",
                    position: "relative",
                  }}
                >
                  {withdrawMutation.isPending && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                      }}
                    >
                      <CircularProgress size={20} sx={{ color: "#7e22ce" }} />
                    </Box>
                  )}
                  <Typography variant="subtitle1" color="textSecondary">
                    Available Balance
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ color: "#7e22ce", mt: 1, fontWeight: "bold" }}
                  >
                    ₹{displayBalance.toFixed(2)}
                  </Typography>
                  {/* <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ mt: 1, display: "block" }}
                  >
                    {walletData?.calculation?.formula || "Total Income - Total Expenses"}
                  </Typography> */}
                  {withdrawMutation.isPending && (
                    <Typography
                      variant="caption"
                      sx={{ color: "#7e22ce", mt: 1, display: "block" }}
                    >
                      Updating...
                    </Typography>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: 3,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 2,
                    textAlign: "center",
                  }}
                >
                  <Typography variant="subtitle1" color="textSecondary">
                    Total Income
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ color: "#7e22ce", mt: 1, fontWeight: "bold" }}
                  >
                    {walletData?.totalIncome ? `₹${walletData?.totalIncome}` : "₹0.00"}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: 3,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 2,
                    textAlign: "center",
                  }}
                >
                  <Typography variant="subtitle1" color="textSecondary">
                    Total Withdrawal
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ color: "#7e22ce", mt: 1, fontWeight: "bold" }}
                  >
                    {/* Fixed: Direct access to totalWithdrawal */}
                    {walletData?.totalWithdrawal ? `₹${walletData?.totalWithdrawal}` : "₹0.00"}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Withdrawal Section */}
        <Accordion
          defaultExpanded
          sx={{
            mt: isMobile ? 2 : 4,
            boxShadow: "none",
            "&.MuiAccordion-root": {
              backgroundColor: "#fff",
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              backgroundColor: "#7e22ce",
              color: "#fff",
              "& .MuiSvgIcon-root": { color: "#fff" },
              minHeight: isMobile ? "48px" : "64px",
            }}
          >
            Withdrawal Request
          </AccordionSummary>
          <AccordionDetails>
            <form
              style={{
                marginTop: 2,
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              <TextField
                label="Available Balance"
                value={`₹${displayBalance.toFixed(2)}`}
                fullWidth
                size="medium"
                InputProps={{ readOnly: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: "#7e22ce" },
                    "&.Mui-focused fieldset": { borderColor: "#7e22ce" },
                  },
                }}
              />

              <FormControl fullWidth size="medium">
                <InputLabel>Withdrawal Amount</InputLabel>
                <Select
                  value={amount}
                  onChange={handleAmountChange}
                  label="Withdrawal Amount"
                  disabled={withdrawMutation.isPending}
                >
                  <MenuItem value="0">
                    <em>Select Amount</em>
                  </MenuItem>
                  {[500, 1000].map((value) => (
                    <MenuItem 
                      key={value} 
                      value={value}
                      disabled={value > displayBalance}
                    >
                      ₹{value} {value > displayBalance ? "(Insufficient Balance)" : ""}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Deduction Amount (15%)"
                value={`₹${deduction.toFixed(2)}`}
                fullWidth
                size="medium"
                InputProps={{ readOnly: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: "#7e22ce" },
                    "&.Mui-focused fieldset": { borderColor: "#7e22ce" },
                  },
                }}
              />

              <TextField
                label="Net Amount Received"
                value={`₹${netAmount.toFixed(2)}`}
                fullWidth
                size="medium"
                InputProps={{ readOnly: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: "#7e22ce" },
                    "&.Mui-focused fieldset": { borderColor: "#7e22ce" },
                  },
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  justifyContent: "space-between",
                  alignItems: isMobile ? "stretch" : "center",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Terms & Conditions:</strong>
                  </Typography>
                  <Box sx={{ display: "flex", gap: 4 }}>
                    <Box>
                      <Typography variant="body2">• 15% deduction applied</Typography>
                      <Typography variant="body2">• Minimum withdrawal: ₹500</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">• Maximum withdrawal: ₹1000</Typography>
                      <Typography variant="body2">• One withdrawal per day allowed</Typography>
                    </Box>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  onClick={handleWithdraw}
                  disabled={
                    withdrawMutation.isPending || 
                    !amount || 
                    amount === "0" || 
                    parseFloat(amount) > displayBalance
                  }
                  sx={{
                    backgroundColor: "#7e22ce",
                    minWidth: "120px",
                    "&:hover": { backgroundColor: "#581c87" },
                    "&:disabled": { backgroundColor: "#cccccc" },
                  }}
                >
                  {withdrawMutation.isPending ? (
                    <CircularProgress size={24} sx={{ color: "white" }} />
                  ) : (
                    "Withdraw"
                  )}
                </Button>
              </Box>
            </form>
          </AccordionDetails>
        </Accordion>

        {/* Transaction History */}
        <Accordion
          defaultExpanded
          sx={{
            mt: isMobile ? 2 : 4,
            boxShadow: "none",
            "&.MuiAccordion-root": {
              backgroundColor: "#fff",
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              backgroundColor: "#7e22ce",
              color: "#fff",
              "& .MuiSvgIcon-root": { color: "#fff" },
              minHeight: isMobile ? "48px" : "64px",
            }}
          >
            Transaction History
          </AccordionSummary>
          <AccordionDetails>
            {walletData?.transactions && walletData.transactions.length > 0 ? (
              <DataTable
                columns={getWalletColumns()}
                data={walletData?.transactions}
                pagination
                customStyles={DASHBOARD_CUTSOM_STYLE}
                paginationPerPage={isMobile ? 10 : 25}
                paginationRowsPerPageOptions={
                  isMobile ? [10, 20, 50] : [25, 50, 100]
                }
                highlightOnHover
                responsive
              />
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="h6" color="textSecondary">
                  No transactions found
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mt: 1 }}
                >
                  Your transaction history will appear here
                </Typography>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default Wallet;
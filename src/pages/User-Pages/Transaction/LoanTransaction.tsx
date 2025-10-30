import DataTable from "react-data-table-component";
import {
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  DASHBOARD_CUTSOM_STYLE,
  getTransactionColumns,
} from "../../../utils/DataTableColumnsProvider";
import { useEffect } from "react";
import { toast } from "react-toastify";
import useSearch from "../../../hooks/SearchQuery";
import { useGetTransactionDetails } from "../../../api/Memeber";

const LoanTransaction = () => {
  const {
    data: transactions,
    isLoading,
    isError,
    error,
  } = useGetTransactionDetails();

  useEffect(() => {
    if (isError) {
      const err = error as any;
      toast.error(
        err?.response.data.message || "Failed to fetch Loan transactions"
      );
    }
  }, [isError, error]);

  // Filter only loan-related transactions
  const loanTransactions = transactions?.filter((tx:any) => {
    const transactionType = tx.transaction_type?.toLowerCase() || '';
    const description = tx.description?.toLowerCase() || '';
    
    return (
      transactionType.includes('loan') ||
      description.includes('loan') ||
      transactionType.includes('repayment') ||
      description.includes('repayment')
    );
  }) || [];

  const { searchQuery, setSearchQuery, filteredData } = useSearch(loanTransactions);

  const noDataComponent = (
    <div style={{ padding: "24px" }}>No loan transactions available</div>
  );

  return (
    <Card sx={{ margin: "2rem", mt: 10 }}>
      <CardContent>
        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              backgroundColor: "#7e22ce",
              color: "#fff",
              "& .MuiSvgIcon-root": { color: "#fff" },
            }}
          >
            Loan Transactions
          </AccordionSummary>
          <AccordionDetails>
            <DataTable
              columns={getTransactionColumns()}
              data={filteredData}
              pagination
              customStyles={DASHBOARD_CUTSOM_STYLE}
              paginationPerPage={25}
              paginationRowsPerPageOptions={[25, 50, 100]}
              highlightOnHover
              progressPending={isLoading}
              progressComponent={
                <CircularProgress size={"4rem"} sx={{ color: "#7e22ce" }} />
              }
              noDataComponent={noDataComponent}
              subHeader
              subHeaderComponent={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0.5rem' }}>
                  <div style={{ color: '#666', fontSize: '0.9rem' }}>
                    Showing {filteredData.length} loan transactions
                  </div>
                  <TextField
                    placeholder="Search loan transactions..."
                    variant="outlined"
                    size="small"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              }
            />
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default LoanTransaction;
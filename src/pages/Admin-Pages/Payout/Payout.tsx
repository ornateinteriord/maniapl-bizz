import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import "./Payout.scss";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DataTable from "react-data-table-component";
import { DASHBOARD_CUTSOM_STYLE, getProccessedColumns, getRequestColumns } from "../../../utils/DataTableColumnsProvider";
import { useApproveWithdrawal, useGetApprovedWithdrawals, useGetPendingWithdrawals } from "../../../api/Memeber";

interface PayoutTableProps {
  data: any[];
  columns: any;
  tabTitle: any[];
  loading?: boolean;
}

const Payout = () => {
  const [value, setValue] = useState(0);

  const handleChange = (_e: any, newValue: any) => {
    setValue(newValue);
  };

  const renderContent = () => {
    switch (value) {
      case 0:
        return <Requests tabTitle={"Requests"} />;
      case 1:
        return <Proccessed tabTitle={"Proccessed"} />;
    }
  };

  return (
    <>
      <Typography variant="h4" sx={{ margin: "2rem", mt: 10 }}>
        Payouts
      </Typography>
      <Card sx={{ margin: "2rem", mt: 2 }}>
        <CardContent>
          <Box className="tabs-list">
            <Tabs
              value={value}
              onChange={handleChange}
              variant="scrollable"
              scrollButtons="auto"
              className="tabs"
            >
              <Tab className="tab-list-1" label="Requests" />
              <Tab className="tab-list-2" label="Proccessed" />
            </Tabs>
            <Box className="tab-content">{renderContent()}</Box>
          </Box>
        </CardContent>
      </Card>
    </>
  );
};

export default Payout;

const PayoutTable = ({ data, columns, tabTitle, loading }: PayoutTableProps) => {
  return (
    <Accordion defaultExpanded>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          mt: 2,
          backgroundColor: "#7e22ce",
          color: "#fff",
          "& .MuiSvgIcon-root": { color: "#fff" },
        }}
      >
        {tabTitle}
      </AccordionSummary>
      <AccordionDetails>
        <Box
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "flex-end",
            marginBottom: "1rem",
          }}
        >
          <TextField
            size="small"
            placeholder="Search..."
            sx={{ minWidth: 200 }}
          />
        </Box>
        <DataTable
          columns={columns}
          data={data}
          pagination
          customStyles={DASHBOARD_CUTSOM_STYLE}
          paginationPerPage={25}
          progressPending={loading}
          paginationRowsPerPageOptions={[25, 50, 100]}
          highlightOnHover
          noDataComponent={<div>No data available</div>}
        />
      </AccordionDetails>
    </Accordion>
  );
};

export const Requests = ({ tabTitle }: { tabTitle: any }) => {
  const { data: pending = [], isFetching } = useGetPendingWithdrawals();
  const { mutate: approveTransaction, isPending } = useApproveWithdrawal();

  return (
    <PayoutTable
      data={pending?.length > 0 ? pending : []}
      columns={getRequestColumns(approveTransaction)}
      tabTitle={tabTitle}
      loading={isFetching || isPending}
    />
  );
};

export const Proccessed = ({ tabTitle }: { tabTitle: any }) => {
  const { data: Approved, isFetching } = useGetApprovedWithdrawals();

  // Filter out both level benefits and direct benefits
  const filteredData = Approved?.filter((transaction: any) => {
    const description = String(transaction.description || '').toLowerCase();
    const transactionType = String(transaction.transaction_type || '').toLowerCase();
    
    // Check if it's a level benefits transaction
    const isLevelBenefits = description.includes('level benefit') || 
                           description.includes('level benefits') ||
                           transactionType.includes('level benefit') ||
                           transactionType.includes('level benefits');

    // Check if it's a direct benefits transaction
    const isDirectBenefits = description.includes('direct benefit') || 
                            description.includes('direct benefits') ||
                            transactionType.includes('direct benefit') ||
                            transactionType.includes('direct benefits');

    // Keep only transactions that are NOT level benefits AND NOT direct benefits
    return !isLevelBenefits && !isDirectBenefits;
  }) || [];

  return (
    <PayoutTable
      data={filteredData}
      columns={getProccessedColumns()}
      tabTitle={tabTitle}
      loading={isFetching}
    />
  );
};
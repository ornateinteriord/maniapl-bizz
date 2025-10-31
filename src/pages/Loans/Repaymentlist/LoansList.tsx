import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';

import { MuiDatePicker } from '../../../components/common/DateFilterComponent';
import { getLoansListColumns } from '../../../utils/DataTableColumnsProvider';
import { useGetTransactionDetails } from '../../../api/Memeber';
import TokenService from '../../../api/token/tokenService';

export default function LoansList() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);

  const memberId = TokenService.getMemberId();
  
  // Fetch transaction data
  const { 
    data: transactionsResponse, 
    isLoading, 
    error,
    refetch 
  } = useGetTransactionDetails("all");

  // Extract loan transactions from the response
  const allTransactions = transactionsResponse?.data || [];
  
  // Filter only COMPLETED loan transactions and transform them for the table
  const loanTransactions = allTransactions
    .filter((transaction: any) => 
      (transaction.transaction_type?.includes('Loan') || 
       transaction.benefit_type === 'loan' ||
       transaction.transaction_type?.toLowerCase().includes('loan')) &&
      transaction.status === 'Completed'
    )
    .map((transaction: any) => ({
      id: transaction.id || transaction.transaction_id,
      transaction_date: transaction.transaction_date || transaction.created_at,
      member_id: transaction.member_id || memberId,
      Name: transaction.Name || 'N/A',
      mobileno: transaction.mobileno || 'N/A',
      net_amount: parseFloat(transaction.net_amount) || 0,
      ew_debit: parseFloat(transaction.ew_debit) || 0,
      ew_credit: parseFloat(transaction.ew_credit) || 0,
      status: transaction.status || 'Completed',
      transaction_type: transaction.transaction_type,
      benefit_type: transaction.benefit_type,
      originalData: transaction // Keep original data for reference
    }));

  const handleSearch = () => {
    // Refetch data with date filters if your API supports it
    // Otherwise, just use client-side filtering
    refetch();
  };

  const columns = getLoansListColumns();

  const handleSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter data based on search term
  const filteredData = loanTransactions.filter((row:any) =>
    Object.values(row).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!orderBy) return 0;
    
    const aValue = a[orderBy as keyof typeof a];
    const bValue = b[orderBy as keyof typeof b];
    
    if (order === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const renderCellContent = (row: any, column: any) => {
    if (column.name === 'Status' && column.cell) {
      return column.cell(row);
    }
    return column.selector ? column.selector(row) : '-';
  };

  if (error) {
    return (
      <Box sx={{ margin: '2rem', mt: 12 }}>
        <Alert severity="error">Error loading loan data: {error.message}</Alert>
      </Box>
    );
  }

  return (
    <>
      <Grid className="filter-container" sx={{ margin: '2rem', mt: 12 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Loans List
            </Typography>
          </Box>
        </Box>
        <Grid className="filter-actions" sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <MuiDatePicker date={fromDate} setDate={setFromDate} label="From Date" />
          <MuiDatePicker date={toDate} setDate={setToDate} label="To Date" />
         <Button
            variant="contained"
            onClick={handleSearch}
            sx={{
              textTransform:"capitalize",
              backgroundColor: '#7e22ce',
              '&:hover': { backgroundColor: '#6b21a8' }
            }}
          >
            Search
          </Button>
        </Grid>
      </Grid>

      <Card sx={{ margin: '2rem', mt: 2 }}>
        <CardContent>
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: '#7e22ce',
                color: '#fff',
                '& .MuiSvgIcon-root': { color: '#fff' }
              }}
            >
              List of Completed Loan Transactions {isLoading && <CircularProgress size={16} sx={{ color: '#fff', ml: 2 }} />}
            </AccordionSummary>
            <AccordionDetails>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : loanTransactions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="textSecondary">
                    No completed loan transactions found
                  </Typography>
                </Box>
              ) : (
                <>
                  <Box sx={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                    <TextField
                      size="small"
                      placeholder="Search loans..."
                      sx={{ minWidth: 200 }}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  <TableContainer component={Paper} elevation={1}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#7e22ce' }}>
                          {columns.map((column) => (
                            <TableCell 
                              key={column.name}
                              sx={{ 
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '14px'
                              }}
                            >
                              {column.sortable ? (
                                <TableSortLabel
                                  active={orderBy === column.name}
                                  onClick={() => handleSort(column.name)}
                                  sx={{ 
                                    color: 'white !important',
                                    '& .MuiTableSortLabel-icon': {
                                      color: 'white !important'
                                    }
                                  }}
                                >
                                  {column.name}
                                </TableSortLabel>
                              ) : (
                                column.name
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedData.map((row) => (
                          <TableRow 
                            key={row.id}
                            sx={{ 
                              '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                              '&:hover': { backgroundColor: 'action.selected' }
                            }}
                          >
                            {columns.map((column) => (
                              <TableCell key={`${row.id}-${column.name}`}>
                                {renderCellContent(row, column)}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </>
              )}
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>
    </>
  );
}

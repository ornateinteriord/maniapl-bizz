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
  Snackbar,
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { getPendingLoansColumns } from '../../../utils/DataTableColumnsProvider';
import { MuiDatePicker } from '../../../components/common/DateFilterComponent';
import { useGetPendingRewardLoans, useUpdateRewardLoanStatus } from '../../../api/Admin';




export default function PendingLoans() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const { 
    data: pendingLoansData, 
    error, 
    refetch 
  } = useGetPendingRewardLoans();
  console.log("pending loans adat:",pendingLoansData)

  const updateLoanMutation = useUpdateRewardLoanStatus();

  const pendingLoans = pendingLoansData?.pendingLoans || [];
  const totalCount = pendingLoansData?.totalCount || 0;

  const handleProcessLoan = async (loanId: string) => {
    try {
      await updateLoanMutation.mutateAsync({ 
        loanId, 
        status: 'Approved' 
      });
    } catch (err) {
      // Error handling is done in the mutation
    }
  };

  const columns = getPendingLoansColumns(handleProcessLoan);

  const handleSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Filter data based on search term
//   const filteredData = pendingLoans.filter(loan =>
//     Object.values(loan).some(value => {
//       if (typeof value === 'object' && value !== null) {
//         return Object.values(value).some(nestedValue =>
//           nestedValue?.toString().toLowerCase().includes(searchTerm.toLowerCase())
//         );
//       }
//       return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
//     })
//   );

  // Sort data
  const sortedData = [...pendingLoans].sort((a, b) => {
    if (orderBy) {
      const column = columns.find(col => col.name === orderBy);
      if (column?.selector) {
        const aValue = column.selector(a);
        const bValue = column.selector(b);
        
        if (order === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      }
    }
    return 0;
  });

  const paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const renderCellContent = (row: any, column: any) => {
    if (column.name === 'Status' && column.cell) {
      return column.cell(row);
    }
    if (column.name === 'Action' && column.selector) {
      return column.selector(row);
    }
    if (column.name === 'Loan Amount') {
      return `₹${row.loan_amount?.toLocaleString()}`;
    }
    return column.selector ? column.selector(row) : '-';
  };

//   if (loading) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
//         <CircularProgress />
//       </Box>
//     );
//   }

  if (error) {
    return (
      <Alert severity="error" sx={{ margin: '2rem', mt: 12 }}>
        Error loading pending loans: {error.message}
      </Alert>
    );
  }

  return (
    <>
      <Grid className="filter-container" sx={{ margin: '2rem', mt: 12 }}>
        <Typography variant="h4">
          Pending Loans
        </Typography>
        <Grid className="filter-actions" >
          <MuiDatePicker date={fromDate} setDate={setFromDate} label="From Date" />
          <MuiDatePicker date={toDate} setDate={setToDate} label="To Date" />
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#7e22ce',
              '&:hover': { backgroundColor: '#7e22ce' }
            }}
            onClick={() => refetch()}
          >
            Refresh
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
              List of Pending Loans ({totalCount})
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <TextField
                  size="small"
                  placeholder="Search..."
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
                    {paginatedData.length > 0 ? (
                      paginatedData.map((row) => (
                        <TableRow 
                          key={row._id}
                          sx={{ 
                            '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                            '&:hover': { backgroundColor: 'action.selected' }
                          }}
                        >
                          {columns.map((column) => (
                            <TableCell key={`${row._id}-${column.name}`}>
                              {renderCellContent(row, column)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.length} align="center">
                          No pending loans found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={sortedData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </>
  );
}
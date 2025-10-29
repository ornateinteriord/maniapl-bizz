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

} from '@mui/material';
import {
  Search as SearchIcon,
  ListAlt as ListAltIcon,
  ExpandMore as ExpandMoreIcon,

} from '@mui/icons-material';

import { MuiDatePicker } from '../../../components/common/DateFilterComponent';
import { getLoansListColumns } from '../../../utils/DataTableColumnsProvider';

// Mock data for loans list
const mockLoansList = [
  {
    id: 1,
    transaction_date: '2024-01-10',
    member_id: 'MEM001',
    memberDetails: { name: 'Rahul Sharma', mobileno: '9876543210' },
    loan_amount: 50000,
    total_paid: 13500,
    status: 'Active',
  },
  {
    id: 2,
    transaction_date: '2024-01-08',
    member_id: 'MEM003',
    memberDetails: { name: 'Amit Kumar', mobileno: '7654321098' },
    loan_amount: 100000,
    total_paid: 9450,
    status: 'Active',
  },
  {
    id: 3,
    transaction_date: '2024-01-05',
    member_id: 'MEM005',
    memberDetails: { name: 'Sneha Patel', mobileno: '6543210987' },
    loan_amount: 75000,
    total_paid: 7050,
    status: 'Overdue',
  },
  {
    id: 4,
    transaction_date: '2024-01-03',
    member_id: 'MEM007',
    memberDetails: { name: 'Rajesh Verma', mobileno: '5432109876' },
    loan_amount: 150000,
    total_paid: 10650,
    status: 'Active',
  },
];



export default function LoansList() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [data] = useState(mockLoansList);
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);

  const handleRepay = (loanId: number) => {
    // Add your repay logic here
    console.log('Repay loan:', loanId);
  };

  const columns = getLoansListColumns(handleRepay);

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

  const filteredData = data.filter(row =>
    Object.values(row).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );


  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const renderCellContent = (row: any, column: any) => {
    if (column.name === 'Status' && column.cell) {
      return column.cell(row);
    }
    if (column.name === 'Action' && column.cell) {
      return column.cell(row);
    }
    return column.selector ? column.selector(row) : '-';
  };

 

  return (
    <>
      <Grid className="filter-container" sx={{ margin: '2rem', mt: 12 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ListAltIcon color="primary" sx={{ fontSize: 32, mr: 2 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Loans List
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Comprehensive list of active loans for tracking and management
            </Typography>
          </Box>
        </Box>
        <Grid className="filter-actions" >
          <MuiDatePicker date={fromDate} setDate={setFromDate} label="From Date" />
          <MuiDatePicker date={toDate} setDate={setToDate} label="To Date" />
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#7e22ce',
              '&:hover': { backgroundColor: '#7e22ce' }
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
              List of All Loans
            </AccordionSummary>
            <AccordionDetails>
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
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>
    </>
  );
}
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
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { getProcessedLoansColumns } from '../../../utils/DataTableColumnsProvider';
import { MuiDatePicker } from '../../../components/common/DateFilterComponent';

// Mock data for processed loans
const mockProcessedLoans = [
  {
    id: 1,
    transaction_date: '2024-01-10',
    member_id: 'MEM001',
    memberDetails: { name: 'Rahul Sharma', mobileno: '9876543210' },
    loan_amount: 50000,
    status: 'Approved'
  },
  {
    id: 2,
    transaction_date: '2024-01-08',
    member_id: 'MEM003',
    memberDetails: { name: 'Amit Kumar', mobileno: '7654321098' },
    loan_amount: 100000,
    status: 'Approved'
  },
  {
    id: 3,
    transaction_date: '2024-01-05',
    member_id: 'MEM005',
    memberDetails: { name: 'Sneha Patel', mobileno: '6543210987' },
    loan_amount: 75000,
    status: 'Rejected'
  },
  {
    id: 4,
    transaction_date: '2024-01-03',
    member_id: 'MEM007',
    memberDetails: { name: 'Rajesh Verma', mobileno: '5432109876' },
    loan_amount: 150000,
    status: 'Approved'
  },
];

export default function Processed() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [data] = useState(mockProcessedLoans);
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);

  const columns = getProcessedLoansColumns();

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

  const filteredData = data.filter(row =>
    Object.values(row).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedData = filteredData.sort((a, b) => {
    if (orderBy) {
      const column = columns.find(col => col.name === orderBy);
      const aValue = column?.selector(a);
      const bValue = column?.selector(b);
      
      if (order === 'asc') {
        return aValue < bValue ? -1 : 1;
      } else {
        return aValue > bValue ? -1 : 1;
      }
    }
    return 0;
  });

  const paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const renderCellContent = (row: any, column: any) => {
    if (column.name === 'Status' && column.cell) {
      return column.cell(row);
    }
    return column.selector ? column.selector(row) : '-';
  };

//   const getStatusChipColor = (status: string) => {
//     switch (status?.toLowerCase()) {
//       case 'approved':
//         return 'success';
//       case 'rejected':
//         return 'error';
//       case 'pending':
//         return 'warning';
//       default:
//         return 'default';
//     }
//   };

  return (
    <>
      <Grid className="filter-container" sx={{ margin: '2rem', mt: 12 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 32, mr: 2 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Processed Loans
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View loans that have completed the approval workflow
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
              List of Processed Loans
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
                            {column.name === 'Status' ? (
                              <Chip 
                                label={row.status} 
                         
                                size="small"
                              />
                            ) : (
                              renderCellContent(row, column)
                            )}
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
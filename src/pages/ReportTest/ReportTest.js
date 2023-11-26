import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  TableSortLabel, TextField, InputLabel, FormControl, Select, ListItemText, OutlinedInput, Box
} from '@mui/material';
import MenuItem from "@mui/material/MenuItem";

const initialOrders = [
  {
    id: 12345,
    customerName: 'Jane Smith',
    date: 'November 18, 2023',
    product: 'Smart Watch',
    retailPrice: 200,
    discount: 60,
    totalRevenue: 140,
    productCost: 120,
    additionalCosts: 25,
    totalCost: 145,
    grossProfit: -5,
    profitMargin: '-3.57%'
  },
  {
    id: 12346,
    customerName: 'Bob Johnson',
    date: 'November 19, 2023',
    product: 'Wireless Earbuds',
    retailPrice: 150,
    discount: 15,
    totalRevenue: 135,
    productCost: 80,
    additionalCosts: 10,
    totalCost: 90,
    grossProfit: 45,
    profitMargin: '33.33%'
  },
  {
    id: 12347,
    customerName: 'Alice Green',
    date: 'November 20, 2023',
    product: 'Bluetooth Speaker',
    retailPrice: 100,
    discount: 20,
    totalRevenue: 80,
    productCost: 40,
    additionalCosts: 5,
    totalCost: 45,
    grossProfit: 35,
    profitMargin: '43.75%'
  },
  {
    id: 12348,
    customerName: 'John Doe',
    date: 'November 21, 2023',
    product: 'Fitness Tracker',
    retailPrice: 120,
    discount: 0,
    totalRevenue: 120,
    productCost: 60,
    additionalCosts: 15,
    totalCost: 75,
    grossProfit: 45,
    profitMargin: '37.50%'
  },
  {
    id: 12349,
    customerName: 'Emma Wilson',
    date: 'November 22, 2023',
    product: 'VR Headset',
    retailPrice: 300,
    discount: 50,
    totalRevenue: 250,
    productCost: 150,
    additionalCosts: 20,
    totalCost: 170,
    grossProfit: 80,
    profitMargin: '32.00%'
  },
  {
    id: 12350,
    customerName: 'Michael Brown',
    date: 'November 23, 2023',
    product: 'Smartphone',
    retailPrice: 500,
    discount: 75,
    totalRevenue: 425,
    productCost: 300,
    additionalCosts: 30,
    totalCost: 330,
    grossProfit: 95,
    profitMargin: '22.35%'
  },
  {
    id: 12351,
    customerName: 'Laura Martinez',
    date: 'November 24, 2023',
    product: 'Tablet',
    retailPrice: 250,
    discount: 25,
    totalRevenue: 225,
    productCost: 100,
    additionalCosts: 15,
    totalCost: 115,
    grossProfit: 110,
    profitMargin: '48.89%'
  },
  {
    id: 12352,
    customerName: 'Gary White',
    date: 'November 25, 2023',
    product: 'E-Reader',
    retailPrice: 180,
    discount: 30,
    totalRevenue: 150,
    productCost: 70,
    additionalCosts: 10,
    totalCost: 80,
    grossProfit: 70,
    profitMargin: '46.67%'
  },
  {
    id: 12353,
    customerName: 'Rachel Davis',
    date: 'November 26, 2023',
    product: 'Digital Camera',
    retailPrice: 400,
    discount: 50,
    totalRevenue: 350,
    productCost: 200,
    additionalCosts: 25,
    totalCost: 225,
    grossProfit: 125,
    profitMargin: '35.71%'
  },
  {
    id: 12354,
    customerName: 'David Harris',
    date: 'November 27, 2023',
    product: 'Portable Charger',
    retailPrice: 50,
    discount: 5,
    totalRevenue: 45,
    productCost: 20,
    additionalCosts: 3,
    totalCost: 23,
    grossProfit: 22,
    profitMargin: '48.89%'
  }
];
const columnData = [
  { id: 'id', label: 'Order ID' },
  { id: 'customerName', label: 'Customer Name' },
  { id: 'date', label: 'Date of Purchase' },
  { id: 'product', label: 'Product' },
  { id: 'retailPrice', label: 'Retail Price' },
  { id: 'discount', label: 'Discount Applied' },
  { id: 'totalRevenue', label: 'Total Revenue' },
  { id: 'productCost', label: 'Product Cost' },
  { id: 'additionalCosts', label: 'Additional Costs' },
  { id: 'totalCost', label: 'Total Cost' },
  { id: 'grossProfit', label: 'Gross Profit' },
  { id: 'profitMargin', label: 'Profit Margin' }
];


function ReportTest() {
  const [orders, setOrders] = useState(initialOrders);
  const [visibleColumns, setVisibleColumns] = useState(
    columnData.reduce((acc, col) => ({ ...acc, [col.id]: true }), {})
  );
  const [orderDirection, setOrderDirection] = useState('asc');
  const [orderBy, setOrderBy] = useState('id');
  const [showNegativeProfit, setShowNegativeProfit] = useState(false);
  const [minProfitMargin, setMinProfitMargin] = useState('');
  const [maxProfitMargin, setMaxProfitMargin] = useState('');

  const handleColumnVisibilityChange = (event) => {
    const value = event.target.value;
    // Check if 'Select All' is selected
    if (value[value.length - 1] === 'all') {
      if (value.length === columnData.length + 1) {
        // All items plus 'Select All' are selected, deselect all
        setVisibleColumns(columnData.reduce(
          (acc, col) => ({ ...acc, [col.id]: false }),
          {}
        ));
      } else {
        // 'Select All' is selected, select all items
        setVisibleColumns(columnData.reduce(
          (acc, col) => ({ ...acc, [col.id]: true }),
          {}
        ));
      }
    } else {
      // Create a new visibility state based on the selected values
      const newVisibleColumns = columnData.reduce(
        (acc, col) => ({ ...acc, [col.id]: value.includes(col.id) }),
        {}
      );
      setVisibleColumns(newVisibleColumns);
    }
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && orderDirection === 'asc';
    setOrderDirection(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    sortOrders(property, isAsc ? 'desc' : 'asc');
  };

  const sortOrders = (property, direction) => {
    const sortedOrders = [...orders].sort((a, b) => {
      let first = a[property];
      let second = b[property];

      // Handling different types of data
      if (property === 'date') { // Convert string dates to Date objects for sorting
        first = new Date(first);
        second = new Date(second);
      } else if (typeof first === 'string') { // Case insensitive comparison for strings
        first = first.toLowerCase();
        second = second.toLowerCase();
      }

      // Sorting logic
      if (direction === 'asc') {
        return first < second ? -1 : 1;
      } else {
        return first > second ? -1 : 1;
      }
    });
    setOrders(sortedOrders);
  };

  const handleShowNegativeProfitChange = (event) => {
    setShowNegativeProfit(event.target.checked);
  };

  const handleMinProfitMarginChange = (event) => {
    setMinProfitMargin(event.target.value);
  };

  const handleMaxProfitMarginChange = (event) => {
    setMaxProfitMargin(event.target.value);
  };

  const applyFilter = () => {
    let filteredOrders = initialOrders;

    if (showNegativeProfit) {
      filteredOrders = filteredOrders.filter(order => order.grossProfit < 0);
    }

    if (minProfitMargin !== '') {
      filteredOrders = filteredOrders.filter(order => parseFloat(order.profitMargin) >= parseFloat(minProfitMargin));
    }

    if (maxProfitMargin !== '') {
      filteredOrders = filteredOrders.filter(order => parseFloat(order.profitMargin) <= parseFloat(maxProfitMargin));
    }

    setOrders(filteredOrders);
  };

  const calculateTotals = () => {
    return orders.reduce((totals, order) => {
      // Add up the values for each relevant property
      totals.retailPrice += order.retailPrice;
      totals.discount += order.discount;
      totals.totalRevenue += order.totalRevenue;
      totals.productCost += order.productCost;
      totals.additionalCosts += order.additionalCosts;
      totals.totalCost += order.totalCost;
      totals.grossProfit += order.grossProfit;
      return totals;
    }, {
      retailPrice: 0,
      discount: 0,
      totalRevenue: 0,
      productCost: 0,
      additionalCosts: 0,
      totalCost: 0,
      grossProfit: 0
    });
  };

  const totals = calculateTotals();

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
        <Box>
          <FormControlLabel
            control={<Checkbox checked={showNegativeProfit} onChange={handleShowNegativeProfitChange}
                               sx={{ color: 'secondary.main' }}/>}
            label="Show Orders with Negative Gross Profit"
            sx={{ color: 'text.secondary', marginRight: 2 }}
          />
          <TextField
            label="Minimum Profit Margin (%)"
            value={minProfitMargin}
            onChange={handleMinProfitMarginChange}
            type="number"
            sx={{ input: { color: 'text.secondary' }, label: { color: 'text.secondary' }, marginRight: 2 }}
          />
          <TextField
            label="Maximum Profit Margin (%)"
            value={maxProfitMargin}
            onChange={handleMaxProfitMarginChange}
            type="number"
            sx={{ input: { color: 'text.secondary' }, label: { color: 'text.secondary' }, marginRight: 2 }}
          />
          <Button variant="contained" onClick={applyFilter} sx={{ margin: 1 }}>Apply Filter</Button>
        </Box>

        {/* Column Visibility Dropdown */}
        <FormControl sx={{ m: 1, width: 300 }}>
          <InputLabel id="column-visibility-select-label" sx={{ color: 'text.secondary' }}>Columns</InputLabel>
          <Select
            labelId="column-visibility-select-label"
            id="column-visibility-select"
            multiple
            value={Object.keys(visibleColumns).filter(key => visibleColumns[key])}
            onChange={handleColumnVisibilityChange}
            input={<OutlinedInput label="Columns" sx={{ color: 'text.secondary', borderColor: 'action.active' }}/>}
            sx={{ color: 'text.secondary', '.MuiSvgIcon-root': { color: 'action.active' } }}
            renderValue={(selected) =>
              selected
              .map(s => columnData.find(c => c.id === s))
              .filter(Boolean) // Filter out any undefined values
              .map(col => col.label)
              .join(', ')
            }
          >
            <MenuItem value="all">
              <Checkbox
                checked={Object.keys(visibleColumns).length === columnData.length && visibleColumns[columnData[0].id]}/>
              <ListItemText primary="Select All"/>
            </MenuItem>
            {columnData.map((column) => (
              <MenuItem key={column.id} value={column.id}>
                <Checkbox checked={visibleColumns[column.id]}/>
                <ListItemText primary={column.label}/>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {columnData.map((column) => visibleColumns[column.id] && (
                <TableCell key={column.id}>
                  <TableSortLabel
                    active={orderBy === column.id}
                    direction={orderBy === column.id ? orderDirection : 'asc'}
                    onClick={() => handleRequestSort(column.id)}
                  >
                    {column.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                {columnData.map((column) => {
                  if (visibleColumns[column.id]) {
                    return (
                      <TableCell key={`${order.id}-${column.id}`}>
                        {typeof order[column.id] === 'number' ? `${order[column.id]}` : order[column.id]}
                      </TableCell>
                    );
                  }
                  return null;
                })}
              </TableRow>
            ))}
            <TableRow>
              {columnData.map((column) => {
                if (visibleColumns[column.id]) {
                  return (
                    <TableCell key={`total-${column.id}`}>
                      {typeof totals[column.id] === 'number' ? `$${totals[column.id].toFixed(2)}` : ''}
                    </TableCell>
                  );
                }
                return null;
              })}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default ReportTest;

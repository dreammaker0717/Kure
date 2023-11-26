import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import GroupIcon from '@mui/icons-material/Group';
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';
import PermContactCalendarIcon from '@mui/icons-material/PermContactCalendar';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { ROUTE } from 'routes/CONSTANTS';

export const sideMenuItems = [
    {
        id: 'Dashboard',
        title: 'Dashboard',
        url: ROUTE.DASHBOARD.OVERVIEW,
        icon: DashboardIcon
    },
    {
        id: 'Inventory',
        title: 'Inventory',
        url: ROUTE.DASHBOARD.INVENTORY,
        icon: InventoryIcon
    },
    {
        id: "Customer",
        title: "Customer",
        url: ROUTE.DASHBOARD.CUSTOMER,
        icon: GroupIcon,
    },
    {
        id: "Sales & Marketing",
        title: "Sales & Marketing",
        url: ROUTE.DASHBOARD.SALES_MARKETING,
        icon: LocalGroceryStoreIcon,
    },
    {
        id: "Employee",
        title: "Employee",
        url: ROUTE.DASHBOARD.EMPLOYEE,
        icon: PermContactCalendarIcon,
    },
    {
        id: "Reports & Analytics",
        title: "Reports & Analytics",
        url: ROUTE.DASHBOARD.REPORTS_ANALYTICS,
        icon: AnalyticsIcon,
    },
]
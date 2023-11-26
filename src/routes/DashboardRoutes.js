import DashboardLayout from "layout/DashboardLayout/DashboardLayout";
import { ROUTE } from "./CONSTANTS";
import OverviewPage from "pages/DashboardPages/OverviewPage/OverviewPage";
import InventoryPage from "pages/DashboardPages/InventoryPage/InventoryPage";
import CustomerPage from "pages/DashboardPages/CustomerPage/CustomerPage";
import SalesMarketingPage from "pages/DashboardPages/SalesMarketingPage/SalesMarketingPage";
import EmployeePage from "pages/DashboardPages/EmployeePage/EmployeePage";
import ReportAnalyticsPage from "pages/DashboardPages/ReportAnalyticsPage/ReportAnalyticsPage";

const DashboardRoutes = {
    path: ROUTE.DASHBOARD_ROUTE,
    element: <DashboardLayout />,
    children: [
        {
            path: ROUTE.DASHBOARD_ROUTE,
            element: <OverviewPage />,
        },
        {
            path: ROUTE.DASHBOARD.OVERVIEW,
            element: <OverviewPage />,
        },
        {
            path: ROUTE.DASHBOARD.INVENTORY,
            element: <InventoryPage />,
        },
        {
            path: ROUTE.DASHBOARD.CUSTOMER,
            element: <CustomerPage />,
        },
        {
            path: ROUTE.DASHBOARD.SALES_MARKETING,
            element: <SalesMarketingPage />,
        },
        {
            path: ROUTE.DASHBOARD.EMPLOYEE,
            element: <EmployeePage />,
        },
        {
            path: ROUTE.DASHBOARD.REPORTS_ANALYTICS,
            element: <ReportAnalyticsPage />,
        },
    ]
};
export default DashboardRoutes;
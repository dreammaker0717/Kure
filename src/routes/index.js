import { useRoutes } from 'react-router-dom';
import HomeRoutes from './HomeRoutes';
import DashboardRoutes from './DashboardRoutes';


export default function ThemeRoutes() {
  return useRoutes([HomeRoutes
    // , DashboardRoutes
  ]);
}

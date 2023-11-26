import HomeLayout from 'layout/HomeLayout/HomeLayout';
import { ROUTE } from './CONSTANTS';
import HomePage from 'pages/Home/HomePage';
import CategoryPage from 'pages/Category/CategoryPage';
import LoginPage from 'pages/Login/LoginPage';
import RegisterPage from 'pages/Register/RegisterPage';
import PwResetPage from 'pages/Pw_reset/PwResetPage';
import UserVerifyPage from 'pages/UserVerify/UserVerifyPage';
import UserReset from 'pages/UserReset/UserReset';
import PressReleasePage from 'pages/PressRelease/PressReleasePage';
import FarmStoriesPage from 'pages/FarmStories/FarmStoriesPage';
import ProductDetailPage from 'pages/ProductDetail/ProductDetailPage';
import FarmDetailPage from 'pages/FarmDetail/FarmDetailPage';
import TestPieChart from 'pages/TestPieChart';
import Reconciliation from "pages/Reconciliation/Reconciliation";
import ContentDrawer from "layout/HomeLayout/Drawer/NotificationDrawer/ContentDrawer";
import ReportTest from "pages/ReportTest/ReportTest";

const HomeRoutes = {
  path: ROUTE.HOME,
  element: <HomeLayout />,
  children: [
    {
      path: ROUTE.HOME,
      element: <HomePage />
    },
    {
      path: ROUTE.CATEGORY + '/:product_category',
      element: <CategoryPage />
    },
    // It's safe to pass the product_name as a parameter because Drupal ensures each title is unique.
    {
      path: ROUTE.HOME + ':drupal_variation_link',
      element: <ProductDetailPage />
    },
    {
      path: ROUTE.HOME + ':drupal_variation_link/:drupal_variation_id',
      element: <ProductDetailPage />
    },
    {
      path: ROUTE.LOGIN,
      element: <LoginPage />
    },
    {
      path: ROUTE.REGISTER,
      element: <RegisterPage />
    },
    {
      path: ROUTE.PW_RESET,
      element: <PwResetPage />
    },
    {
      path: ROUTE.USER_RESET + '/:uid/:timestamp/:hash',
      element: <UserReset />
    },
    {
      path: ROUTE.USER_VERIFY + '/:uid/:timestamp/:hash',
      element: <UserVerifyPage />
    },
    {
      path: ROUTE.RELEASE,
      element: <PressReleasePage />
    },
    {
      path: ROUTE.FARM_STORIES,
      element: <FarmStoriesPage />
    },
    {
      path: ROUTE.FARM_STORY_DETAIL,
      element: <FarmDetailPage />
    },
    {
      path: '/test-piechart',
      element: <TestPieChart />
    },
    {
      path: '/swipe',
      element: <ContentDrawer />
    },
    {
      path: '/inventory-reconciliation',
      element: <Reconciliation />
    },
    {
      path: '/report-test',
      element: <ReportTest />
    }
  ]
};
export default HomeRoutes;

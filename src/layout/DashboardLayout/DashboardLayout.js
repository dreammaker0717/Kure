import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import DHeader from './DHeader/DHeader';
import DSidebar from './DSidebar/DSidebar';
import DFooter from './DFooter/DFooter';
import { Box, Toolbar } from '@mui/material'
import { Resource } from 'services/api_services/Resource';
import { useNavigate, useLocation } from 'react-router';
import { ROUTE } from 'routes/CONSTANTS';
import { idbGetConfig, idbToggleSidebar } from 'services/idb_services/configManager';

const resource = new Resource();
const DashboardLayout = (props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [openSidebar, setOpenSidebar] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  async function isLoggedInCheck() {
    const is_logged_in = await resource.isLoggedIn();
    if (is_logged_in == false) {
      navigate(ROUTE.LOGIN + "?redirect=" + location.pathname)
      return;
    } else {
      setIsLoggedIn(true);
    }

    idbGetConfig().then((config) => {
      const { sidebar } = config;
      setOpenSidebar(sidebar);
      console.log('configuration: ', config)
    });
  }

  useEffect(() => {
    isLoggedInCheck();
  }, []);

  const onToggleDrawer = () => {
    setOpenSidebar(!openSidebar);
    idbToggleSidebar(!openSidebar);
  }

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      {isLoggedIn && (
        <>
          <DHeader openSidebar={openSidebar} onToggleDrawer={onToggleDrawer}/>
          <DSidebar openSidebar={openSidebar} onToggleDrawer={onToggleDrawer}/>
          <Box component="main" sx={{ width: '100%', flexGrow: 1, p: { xs: 2, sm: 3 }, }}>
            <Toolbar/>
            <Outlet/>
            <DFooter/>
          </Box>
        </>
      )}
    </Box>
  );
};

export default DashboardLayout;
import React, { useContext, useState } from 'react';
import { Box, Typography, Drawer, Tabs, Tab, } from '@mui/material';

import { UsersProfileContext } from 'services/context_services/usersProfileContext';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import OrderContent from './OrderContent';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { makeStyles } from '@mui/styles';
import { IDB_TABLES, KureDatabase } from "services/idb_services/KureDatabase";
import UserContent from "layout/HomeLayout/NotificationsContainer/NotificationDrawerWidget/UserContent";

const useStyles = makeStyles({
  list: {
    width: 250
  },
  fullList: {
    width: "auto"
  },
  paper: {
    background: "#383737fa"
  }
});


const NotificationDrawerWidget = (props) => {
  const {
    orders,
    setOrders,
    openNotificationDrawer,
    setOpenNotificationDrawer,
  } = props;
  const classes = useStyles();
  const [activeField, setActiveField] = useState("1");
  return (
    <Drawer anchor={'left'}
            open={openNotificationDrawer}
            classes={{ paper: classes.paper }}
            onClose={() => setOpenNotificationDrawer(false)}
            ModalProps={{ keepMounted: true }}
    >
      <Box sx={{
        width: '98vw',
        maxWidth: '450px',
        minWidth: '250px',
        padding: "10px",
        color: 'white',
      }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: {
            xs: "10px",
            sm: "20px",
            lg: "30px"
          },
        }}>
          <Typography variant={'h3'}>Notifications</Typography>
          <HighlightOffIcon
            sx={{ width: '50px', minHeight: '50px', cursor: 'pointer' }}
            onClick={() => setOpenNotificationDrawer(false)}
          ></HighlightOffIcon>
        </Box>
        <TabContext value={activeField}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList
              onChange={(event, newValue) => setActiveField(newValue)}
              aria-label="tab for notification drawer"
              sx={{
                backgroundColor: 'inherit',
              }}
              variant="fullWidth"
            >
              <Tab sx={{ color: "white" }} label="Orders" value="1"/>
              <Tab sx={{ color: "white" }} label="User" value="2"/>
              <Tab sx={{ color: "white" }} label="Other" value="3"/>
            </TabList>
          </Box>
          <TabPanel value="1" sx={{ padding: 0, pt: "10px" }}>
            <OrderContent
              orders={orders}
              setOrders={setOrders}
              openNotificationDrawer={openNotificationDrawer}
            />
          </TabPanel>
          <TabPanel value="2">
            <UserContent openNotificationDrawer={openNotificationDrawer}/>
          </TabPanel>
          <TabPanel value="3">
            {/*    Create a button with a click event*/}
            <button onClick={async () => {
              const db = new KureDatabase();
              await db.clear(IDB_TABLES.users_profile_data)
              await db.clear(IDB_TABLES.users)
            }}>Clear user and users_profile_data from indexedDB
            </button>
          </TabPanel>
        </TabContext>
      </Box>
    </Drawer>
  );
};

export default NotificationDrawerWidget;
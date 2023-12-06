import React, { useEffect, useState } from 'react';
import { Badge, Box, IconButton, Typography } from '@mui/material';
import { Resource } from 'services/api_services/Resource';
import NotificationAlertButton from './NotificationAlertButton';
import { USER_TYPE } from 'Common/constants';
import NotificationDrawerWidget from './NotificationDrawerWidget/NotificationDrawerWidget';
import { IDB_TABLES, KureDatabase } from 'services/idb_services/KureDatabase';
import { SIG_CHANNEL, SIG_ORDER_SYNCHED, SIG_AUTH_CHANGED, SIG_ORDER_LIST_CHANGED } from 'Common/signals';
import { CommonDataIndex, useCommonData } from 'services/context_services/commonDataContext';
import { makeStyles } from '@mui/styles';
import { getNotificationPermission } from 'services/storage_services/state_services';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import StoreSelectModal from '../../../components/SetNotificationModal/SetNotificationModal';

const resource = new Resource();
const db = new KureDatabase();
const NotificationGroup = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "row-reverse",
  position: "fixed",
  right: "20px",
  bottom: "65px",
  cursor: "pointer",
  zIndex: 1200
};

const NotificationBtnStyle = {
  color: '#32BEB9',
  padding: '10px',
  width: '60px',
  height: '60px',
  fontSize: 15,
  background: "black",
  borderRadius: "0px 10px 10px 0px"
};

const NotificationTextStyle = {
  color: 'white',
  fontSize: 15,
  background: "black",
  maxHeight: "60px",
  fontFamily: "bold",
  padding: "20px 0px 20px 10px",
  borderRadius: "10px 0px 0px 10px",
  cursor: "pointer",
};

const NotificationTextStyle2 = {
  position: "fixed",
  right: "87px",
  bottom: "58px",
  color: 'white',
  fontSize: 15,
  fontFamily: "bold",
  background: "black",
  padding: "18px 10px",
  borderRadius: "10px 0px 0px 10px",
  cursor: "pointer",
}

const useStyles = makeStyles({
  animatedButton: {
    animation: '$moveDown 0.5s infinite alternate', // Animation properties
  },
  '@keyframes moveDown': {
    '0%': {
      transform: 'translateY(0)', // Initial position
    },
    '100%': {
      transform: 'translateY(10px)', // Translated 10px down
    },
  },
});

const NotificationsContainer = (props) => {
  const { values: commonData, setValue: setCommonValue } = useCommonData();
  const openNotificationDrawer = commonData[CommonDataIndex.OPEN_NOTIFICATION_DRAWER];
  const [orders, setOrders] = useState([]);
  const [openNotificationModal, setOpenNotificationModal] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(false);
  const [isEmployee, setIsEmployee] = useState(false);
  const classes = useStyles();
  const isLogin = localStorage.getItem('kure-user-info');

  const setOpenNotificationDrawer = (v) => {
    setCommonValue(CommonDataIndex.OPEN_NOTIFICATION_DRAWER, v);
  }

  async function getPermission() {
    const notificaionPermission = await getNotificationPermission();

    if (notificaionPermission) {
      setNotificationPermission(false);
    } else {
      setNotificationPermission(true);
      const isShowModal = localStorage.getItem('isNotificationNodalShow');
      if (isShowModal == null) {
        localStorage.setItem('isNotificationNodalShow', "true");
        setOpenNotificationModal(true);
      }
    }
  }

  useEffect(() => {
    getOrders();
    // SIG_ORDER_SYNCED
    const channel = new BroadcastChannel(SIG_CHANNEL);
    channel.addEventListener('message', async (event) => {
      const { data, type } = event.data;
      switch (type) {
        case SIG_ORDER_SYNCHED, SIG_ORDER_LIST_CHANGED:
          getOrders();
          break
        case SIG_AUTH_CHANGED:
          getPermission();
          if (resource.getUserRole() === USER_TYPE.KURE_EMPLOYEE) {
            setIsEmployee(true);
          }
          break;
      }
    });
  }, [openNotificationDrawer, commonData[CommonDataIndex.SEL_STORE]]);


  useEffect(() => {
    getPermission();
    if (resource.getUserRole() === USER_TYPE.KURE_EMPLOYEE) {
      setIsEmployee(true);
    }
  }, []);

  const getOrders = async () => {
    const orders_list = (await db.getAll(IDB_TABLES.commerce_order)).filter(x => x.store_id == commonData[CommonDataIndex.SEL_STORE]).sort(({ changed: a }, { changed: b }) => b - a);
    //console.log("orders_list: ", orders_list)
    setOrders(orders_list);
  }

  const onClickChangeNotification = () => {
    setOpenNotificationModal(true);
  };

  const setOpenNotification = () => {
    setOpenNotificationModal(false);
  }

  // console.log("USER ROLE: ", resource.getUserRole());
  // if (resource.getUserRole() !== USER_TYPE.KURE_EMPLOYEE) {
  //   return <></>
  // }

  return (
    <>
      {
        notificationPermission ?
          (
            isLogin == null ?
              <Box style={NotificationGroup} className={!isLogin && classes.animatedButton}>
                <NotificationsActiveIcon style={NotificationBtnStyle} variant="contained" onClick={onClickChangeNotification} />
                <Typography style={NotificationTextStyle} onClick={onClickChangeNotification}>Enable Notifications</Typography>
              </Box>
              : (
                isEmployee ?
                  <Box style={NotificationGroup}>
                    <Typography style={NotificationTextStyle2} onClick={onClickChangeNotification}>Enable Notifications</Typography>
                    <NotificationAlertButton
                      notificationCount={orders.length}
                      setOpenNotificationDrawer={setOpenNotificationDrawer}
                    />
                  </Box>
                  : <div style={NotificationGroup} className={classes.animatedButton}>
                    <NotificationsActiveIcon style={NotificationBtnStyle} variant="contained" onClick={onClickChangeNotification} />
                    <Typography style={NotificationTextStyle} onClick={onClickChangeNotification}>Enable Notifications</Typography>
                  </div>
              )
          )
          : <>
            {isLogin == null ? <></> : (
              isEmployee ?
                <NotificationAlertButton
                  notificationCount={orders.length}
                  setOpenNotificationDrawer={setOpenNotificationDrawer}
                />
              : <></>
            )}
          </>
      }

      <NotificationDrawerWidget
        orders={orders}
        setOrders={setOrders}
        openNotificationDrawer={openNotificationDrawer}
        setOpenNotificationDrawer={setOpenNotificationDrawer}
      />

      <StoreSelectModal
        open={openNotificationModal}
        onOK={(v) => {
          setOpenNotification();
        }}
        onCancel={(v) => {
          setOpenNotificationModal(false);
        }}
      />
    </>
  );
};

export default NotificationsContainer;
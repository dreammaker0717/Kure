import React, { useEffect, useState } from 'react';
import { Badge, Box, IconButton, Typography } from '@mui/material';
import { Resource } from 'services/api_services/Resource';
import NotificationAlertButton from './NotificationAlertButton';
import { USER_TYPE } from 'Common/constants';
import NotificationDrawerWidget from './NotificationDrawerWidget/NotificationDrawerWidget';
import { IDB_TABLES, KureDatabase } from 'services/idb_services/KureDatabase';
import { SIG_CHANNEL, SIG_ORDER_SYNCHED, SIG_AUTH_CHANGED, SIG_ORDER_LIST_CHANGED, SIG_ORDERS_SYNCHED, SIG_SYNCED_ORDERS_CONFIRM_MODAL, SIG_ON_REFRESH_MESSAGE } from 'Common/signals';
import { CommonDataIndex, useCommonData } from 'services/context_services/commonDataContext';
import { makeStyles } from '@mui/styles';
import { getNotificationPermission } from 'services/storage_services/state_services';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import StoreSelectModal from '../../../components/SetNotificationModal/SetNotificationModal';
import ShowSyncedOrderResultModal from 'components/ShowSyncedOrderResultModal/ShowSyncedOrderResultModal';
import { getAllUnreadMessageCount, getUnreadMessage } from 'services/idb_services/messageTracker';

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
  const [syncedOrders, setSyncedOrders] = useState([]);
  const [newMessageCounts, setNewMessageCounts] = useState(0);
  const [newMessages, setNewMessages] = useState([]);
  const [openNotificationModal, setOpenNotificationModal] = useState(false);
  const [openOrdersSyncedModal, setOpenOrdersSyncedModal] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(false);
  const [isEmployee, setIsEmployee] = useState(false);
  const [isAnimation, setIsAnimation] = useState(false);
  const classes = useStyles();
  const isLogin = localStorage.getItem('kure-user-info');
  let new_message_counts;

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
        case SIG_ORDERS_SYNCHED:
          let temp_orders = [];
          console.log("----------SyncedOrderResult----------");
          console.log(temp_orders);
          data.data?.forEach(element => {
            temp_orders.push(element.data);
          });
          if (temp_orders.length > 1) {
            setOpenOrdersSyncedModal(true);
            setSyncedOrders(temp_orders);
          }
          console.log(temp_orders);
          break;
        case SIG_SYNCED_ORDERS_CONFIRM_MODAL:
          console.log("----------SIG_SYNCED_ORDERS_CONFIRM_MODAL----------");
          if (data.length > 1 && !isEmployee) {
            setOpenOrdersSyncedModal(true);
            setSyncedOrders(data);
          }
          new_message_counts = await getAllUnreadMessageCount();
          if (new_message_counts > 0) {
            setIsAnimation(true);
          } else {
            setIsAnimation(false);
          }
          break
        case SIG_ON_REFRESH_MESSAGE:
          console.log("----------SIG_ON_REFRESH_MESSAGE----------");
          new_message_counts = await getAllUnreadMessageCount();
          console.log("new_message_counts == ",new_message_counts);
          setNewMessageCounts(new_message_counts);
          if (new_message_counts > 0) {
            setIsAnimation(true);
          } else {
            setIsAnimation(false);
          }
          break;

      }
    });
  }, [openNotificationDrawer, commonData[CommonDataIndex.SEL_STORE]]);


  useEffect(() => {
    const fetchData = async () => {
      let temp = await getMessageCounts();
      if (temp > 0) {
        setIsAnimation(true);
      } else {
        setIsAnimation(false);
      }
    };

    getPermission();
    fetchData();

    if (resource.getUserRole() === USER_TYPE.KURE_EMPLOYEE) {
      setIsEmployee(true);
    }
  }, [newMessageCounts]);

  const getOrders = async () => {
    const orders_list = (await db.getAll(IDB_TABLES.commerce_order)).filter(x => x.store_id == commonData[CommonDataIndex.SEL_STORE]).sort(({ changed: a }, { changed: b }) => b - a);
    setOrders(orders_list);
  }

  const getMessageCounts = async () => {
    new_message_counts = await getAllUnreadMessageCount();
    setNewMessageCounts(new_message_counts);
    let new_messages = await getUnreadMessage();
    setNewMessages(new_messages);
    return new_message_counts;
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
                      notificationCount={newMessageCounts}
                      newMessages={newMessages}
                      isAnimation={isAnimation}
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
                  notificationCount={newMessageCounts}
                  newMessages={newMessages}
                  isAnimation={isAnimation}
                  setOpenNotificationDrawer={setOpenNotificationDrawer}
                />
                : <></>
            )}
          </>
      }

      <NotificationDrawerWidget
        orders={orders}
        setOrders={setOrders}
        newMessageCounts={newMessageCounts}
        newMessages={newMessages}
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
      <ShowSyncedOrderResultModal
        open={openOrdersSyncedModal}
        orders={syncedOrders}
        onOK={(v) => {
          setOpenOrdersSyncedModal(false);
        }}
        onCancel={(v) => {
          setOpenOrdersSyncedModal(false);
        }}
      />
    </>
  );
};

export default NotificationsContainer;
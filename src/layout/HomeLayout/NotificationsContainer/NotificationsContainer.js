import React, { useEffect, useState } from 'react';
import { Badge, Box, IconButton, Stack } from '@mui/material';
import { Resource } from 'services/api_services/Resource';
import NotificationAlertButton from './NotificationAlertButton';
import { USER_TYPE } from 'Common/constants';
import NotificationDrawerWidget from './NotificationDrawerWidget/NotificationDrawerWidget';
import { IDB_TABLES, KureDatabase } from 'services/idb_services/KureDatabase';
import { SIG_CHANNEL, SIG_ORDER_SYNCHED } from 'Common/signals';
import { CommonDataIndex, useCommonData } from 'services/context_services/commonDataContext';

const resource = new Resource();
const db = new KureDatabase();
const NotificationsContainer = (props) => {
  const { values: commonData, setValue: setCommonValue } = useCommonData();
  const openNotificationDrawer = commonData[CommonDataIndex.OPEN_NOTIFICATION_DRAWER];
  const setOpenNotificationDrawer = (v) => {
    setCommonValue(CommonDataIndex.OPEN_NOTIFICATION_DRAWER, v);
  }

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    getOrders();
    // SIG_ORDER_SYNCED
    const channel = new BroadcastChannel(SIG_CHANNEL);
    channel.addEventListener('message', async (event) => {
      const { data, type } = event.data;
      switch (type) {
        case SIG_ORDER_SYNCHED:
          getOrders();
      }
    });
  }, [openNotificationDrawer, commonData[CommonDataIndex.SEL_STORE]]);

  const getOrders = async () => {
    const orders_list = (await db.getAll(IDB_TABLES.commerce_order)).filter(x => x.store_id == commonData[CommonDataIndex.SEL_STORE]).sort(({ changed: a }, { changed: b }) => b - a);
    //console.log("orders_list: ", orders_list)
    setOrders(orders_list);
  }

  // console.log("USER ROLE: ", resource.getUserRole());
  if (resource.getUserRole() !== USER_TYPE.KURE_EMPLOYEE) {
    return <></>
  }

  return (
    <>
      <NotificationAlertButton
        notificationCount={orders.length}
        setOpenNotificationDrawer={setOpenNotificationDrawer}
      />
      <NotificationDrawerWidget
        orders={orders}
        setOrders={setOrders}
        openNotificationDrawer={openNotificationDrawer}
        setOpenNotificationDrawer={setOpenNotificationDrawer}
      />
    </>
  );
};

export default NotificationsContainer;
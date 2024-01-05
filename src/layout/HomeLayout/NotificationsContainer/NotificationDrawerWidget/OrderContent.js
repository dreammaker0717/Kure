import React, { useContext, useEffect, useState } from 'react';
import {
  Button,
  Grid,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Skeleton,
  Typography,
  Accordion,
  AccordionDetails,
  AccordionSummary
} from "@mui/material";
import { UsersProfileContext } from 'services/context_services/usersProfileContext';
import OrderContentRow from './OrderContentRow';
import { CartDataIndex, useCartData } from 'services/context_services/cartDataContext';
import { setUnreadMessage } from 'services/idb_services/messageTracker';
import { IDB_TABLES, KureDatabase } from 'services/idb_services/KureDatabase';
import { broadcastMessage } from 'Common/functions';
import { SIG_ON_REFRESH_CART, SIG_ON_REFRESH_MESSAGE } from 'Common/signals';
import { CART_STATUS } from 'Common/constants';
import {
  idbAddOrderIdHistory,
  idbGetActiveStoreId,
  idbGetOrderHistory,
  idbSetActiveCart,
  idbSetActiveStoreId
} from 'services/idb_services/configManager';
import { CommonDataIndex, useCommonData } from 'services/context_services/commonDataContext';
import CommonConfirmModal from 'components/CommonConfirmModal/CommonConfirmModal';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { makeStyles } from '@mui/styles';

const typeHeader = {
  fontWeight: "bold",
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: {
    xs: 14,
    md: 18
  },
  color: "white",
  background: "#444444",
}

const typeContainer = {
  color: "white",
  background: "#2e2e2e",
  alignItems: 'center'
}

const useStyles = makeStyles({
  animatedButton: {
    animation: '$blinker 1s infinite alternate',
  },
  '@keyframes blinker': {
    '0%': {
      background: "#333333"
    },
    '50%': {
      background: "#555555"
    },
    '100%': {
      background: "#333333"
    },
  },
});

const db = new KureDatabase();
const OrdersAccordion = ({ orders, title, activeOrderId, onClickOrder, newMessageCount, readNewMessages, type, newMessages, classes }) => (
  <Accordion sx={typeContainer} defaultExpanded={false}>
    <AccordionSummary
      sx={typeHeader}
      expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
      aria-controls={`${title} orders`}
      id={`${title} orders`}
      onClick={() => readNewMessages(type)}
    >
      <Typography sx={{ fontWeight: 'bold', fontSize: "18px" }}>{title}</Typography>
      {newMessageCount > 0 ? <Typography sx={{
        fontWeight: 'bold',
        fontSize: "13px",
        cursor: 'pointer',
        display: 'flex',
        width: '30px',
        height: '30px',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px solid',
        borderRadius: '50%',
        margin: '0px 0px 0px 5px',
      }}>
        {newMessageCount}
      </Typography> : <></>}
    </AccordionSummary>
    <AccordionDetails>
      {orders.map(order => {
        if (
          newMessages &&
          newMessages.some(element => element.type === type && element.entity_id.includes(order.order_id))
        ) {
          return (
            <Box key={order.order_id} className={classes.animatedButton}>
              <OrderContentRow order={order} selOrderId={activeOrderId} onClickOrder={onClickOrder} />
            </Box>
          );
        } else {
          return (
            <Box key={order.order_id}>
              <OrderContentRow order={order} selOrderId={activeOrderId} onClickOrder={onClickOrder} />
            </Box>
          );
        }
      })}
    </AccordionDetails>
  </Accordion >
);

const OrderContent = (props) => {
  const { orders, setOrders, openNotificationDrawer, newMessageCounts, newMessages } = props;
  const { profileData } = useContext(UsersProfileContext);
  const { values: cartData, setValue: setCartValue } = useCartData();
  const { values: commonData, setValueObjects: setCommonDataList } = useCommonData();
  const [tempOrder, setTempOrder] = useState();
  const [openConfirmDlg, setOpenConfirmDlg] = useState(false);
  const [historyOrders, setHistoryOrders] = useState([]);
  const active_order_id = cartData?.cart?.order_id;
  const classes = useStyles();

  useEffect(() => {
    readCartHistory();
    console.log(newMessages);
  }, [openNotificationDrawer])

  const readCartHistory = async () => {
    const historyList = await idbGetOrderHistory();
    const tmpList = historyList.map(orderId => orders.find(x => x.order_id === orderId)).filter(order => order).sort(({ changed: a }, { changed: b }) => b - a);
    setHistoryOrders(tmpList);
  }

  const onClickOrder = async (order) => {
    console.log("CC ORDER: ", order);
    newMessages.forEach(element => {
      if (element.type == order.state) {
        element.entity_id.pop(order.order_id);
      }
    });

    console.log(newMessages);
    await setUnreadMessage(newMessages);
    broadcastMessage(SIG_ON_REFRESH_MESSAGE, 0);
    // await readNewMessages(order);
    const store_id = await idbGetActiveStoreId();
    setTempOrder(order);
    if (order.store_id !== store_id) {
      setOpenConfirmDlg(true);
    } else {
      await onChangeOrder(order);
    }
  }

  const readNewMessages = async (type) => {
    console.log(type);
    let discount = 0;
    newMessages.forEach(element => {
      if (element.type == type) {
        discount = element.count;
        element.count = 0;
      }
    });

    console.log(newMessages);
    await setUnreadMessage(newMessages);
    broadcastMessage(SIG_ON_REFRESH_MESSAGE, discount);
  }

  const onChangeOrder = async (init_order) => {
    const order = init_order ? init_order : tempOrder;
    setOpenConfirmDlg(false);
    console.log("selected order ", order)
    await idbSetActiveStoreId(order.store_id)
    await idbSetActiveCart(order.order_id);
    broadcastMessage(SIG_ON_REFRESH_CART);
    setCommonDataList({
      [CommonDataIndex.OPEN_CART_DRAWER]: true
    });
    await idbAddOrderIdHistory(order.order_id);
  }

  const ordersFilteredByStatus = (status) => orders.filter(x => x.state === status).sort(({ changed: a }, { changed: b }) => b - a);

  const newMessageCountsFilter = (status) => {
    if (newMessages) {
      const filtercounts = newMessages.filter(x => x.type == status);
      return filtercounts[0]?.count;
    }
    return 0;
  };

  return (
    <Box>
      {openConfirmDlg && tempOrder &&
        <CommonConfirmModal
          open={openConfirmDlg}
          onOk={() => onChangeOrder()}
          onCancel={() => setOpenConfirmDlg(false)}
          okTitle={"Yes, do it"}
          title="Warning"
          description="To check this order, the store will be changed."
        />
      }
      {ordersFilteredByStatus(CART_STATUS.DRAFT).length > 0 &&
        <OrdersAccordion title="Draft"
          orders={ordersFilteredByStatus(CART_STATUS.DRAFT)}
          activeOrderId={active_order_id}
          onClickOrder={onClickOrder}
          newMessages={newMessages}
          classes={classes}
          newMessageCount={newMessageCountsFilter(CART_STATUS.DRAFT)}
          readNewMessages={readNewMessages}
          type={CART_STATUS.DRAFT} />
      }
      {ordersFilteredByStatus(CART_STATUS.NEEDS_PROCESSING).length > 0 &&
        <OrdersAccordion title="Needs processing"
          orders={ordersFilteredByStatus(CART_STATUS.NEEDS_PROCESSING)}
          activeOrderId={active_order_id}
          onClickOrder={onClickOrder}
          newMessages={newMessages}
          classes={classes}
          newMessageCount={newMessageCountsFilter(CART_STATUS.NEEDS_PROCESSING)}
          readNewMessages={readNewMessages}
          type={CART_STATUS.NEEDS_PROCESSING} />
      }
      {ordersFilteredByStatus(CART_STATUS.PARKED).length > 0 &&
        <OrdersAccordion title="Parked"
          orders={ordersFilteredByStatus(CART_STATUS.PARKED)}
          activeOrderId={active_order_id}
          onClickOrder={onClickOrder}
          newMessages={newMessages}
          classes={classes}
          newMessageCount={newMessageCountsFilter(CART_STATUS.PARKED)}
          readNewMessages={readNewMessages}
          type={CART_STATUS.PARKED} />
      }
      {ordersFilteredByStatus(CART_STATUS.COMPLETED).length > 0 &&
        <OrdersAccordion title="Completed"
          orders={ordersFilteredByStatus(CART_STATUS.COMPLETED)}
          activeOrderId={active_order_id}
          onClickOrder={onClickOrder}
          newMessages={newMessages}
          classes={classes}
          newMessageCount={newMessageCountsFilter(CART_STATUS.COMPLETED)}
          readNewMessages={readNewMessages}
          type={CART_STATUS.COMPLETED} />
      }
      {historyOrders.length > 0 &&
        <OrdersAccordion title="Recently opened"
          orders={historyOrders}
          newMessages={newMessages}
          classes={classes}
          activeOrderId={active_order_id}
          onClickOrder={onClickOrder}
          readNewMessages={readNewMessages}
          type={null} />
      }
    </Box>
  );
};

export default OrderContent;

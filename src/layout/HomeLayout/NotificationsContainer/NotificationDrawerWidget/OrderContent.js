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
import { IDB_TABLES, KureDatabase } from 'services/idb_services/KureDatabase';
import { broadcastMessage } from 'Common/functions';
import { SIG_ON_REFRESH_CART } from 'Common/signals';
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

const typeHeader = {
  fontWeight: "bold",
  fontSize: {
    xs: 14,
    md: 18
  },
  color: "white",
  background: "#333333",
}
const typeContainer = {
  color: "white",
  background: "#2e2e2e"
}
const db = new KureDatabase();

const OrdersAccordion = ({ orders, title, activeOrderId, onClickOrder }) => (
  <Accordion sx={typeContainer} defaultExpanded={true}>
    <AccordionSummary
      sx={typeHeader}
      expandIcon={<ExpandMoreIcon sx={{ color: "white" }}/>}
      aria-controls={`${title} orders`}
      id={`${title} orders`}
    >
      <Typography sx={{ fontWeight: 'bold', fontSize: "18px" }}>{title}</Typography>
    </AccordionSummary>
    <AccordionDetails>
      {orders.map(order => (
        <Box key={order.order_id}>
          <OrderContentRow order={order} selOrderId={activeOrderId} onClickOrder={onClickOrder}/>
        </Box>
      ))}
    </AccordionDetails>
  </Accordion>
);

const OrderContent = (props) => {
  const { orders, setOrders, openNotificationDrawer } = props;
  const { profileData } = useContext(UsersProfileContext);
  const { values: cartData, setValue: setCartValue } = useCartData();
  const { values: commonData, setValueObjects: setCommonDataList } = useCommonData();
  const [tempOrder, setTempOrder] = useState();
  const [openConfirmDlg, setOpenConfirmDlg] = useState(false);
  const [historyOrders, setHistoryOrders] = useState([]);
  const active_order_id = cartData?.cart?.order_id;

  useEffect(() => {
    readCartHistory();
  }, [openNotificationDrawer])

  const readCartHistory = async () => {
    const historyList = await idbGetOrderHistory();
    const tmpList = historyList.map(orderId => orders.find(x => x.order_id === orderId)).filter(order => order).sort(({ changed: a }, { changed: b }) => b - a);
    setHistoryOrders(tmpList);
  }

  const onClickOrder = async (order) => {
    console.log("CC ORDER: ", order)
    const store_id = await idbGetActiveStoreId();
    setTempOrder(order);
    if (order.store_id !== store_id) {
      setOpenConfirmDlg(true);
    } else {
      await onChangeOrder(order);
    }
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

  const ordersFilteredByStatus = (status) => orders.filter(x => x.state === status).sort(({ changed: a }, { changed: b }) => parseInt(b) - parseInt(a));

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
        <OrdersAccordion title="Draft" orders={ordersFilteredByStatus(CART_STATUS.DRAFT)}
                         activeOrderId={active_order_id} onClickOrder={onClickOrder}/>
      }
      {ordersFilteredByStatus(CART_STATUS.NEEDS_PROCESSING).length > 0 &&
        <OrdersAccordion title="Needs processing" orders={ordersFilteredByStatus(CART_STATUS.NEEDS_PROCESSING)}
                         activeOrderId={active_order_id} onClickOrder={onClickOrder}/>
      }
      {ordersFilteredByStatus(CART_STATUS.PARKED).length > 0 &&
        <OrdersAccordion title="Parked" orders={ordersFilteredByStatus(CART_STATUS.PARKED)}
                         activeOrderId={active_order_id} onClickOrder={onClickOrder}/>
      }
      {ordersFilteredByStatus(CART_STATUS.COMPLETED).length > 0 &&
        <OrdersAccordion title="Completed" orders={ordersFilteredByStatus(CART_STATUS.COMPLETED)}
                         activeOrderId={active_order_id} onClickOrder={onClickOrder}/>
      }
      {historyOrders.length > 0 &&
        <OrdersAccordion title="Recently opened" orders={historyOrders} activeOrderId={active_order_id}
                         onClickOrder={onClickOrder}/>
      }
    </Box>
  );
};

export default OrderContent;

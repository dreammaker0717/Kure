import React, { useContext } from 'react';
import {
  Button,
  Grid,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Boxider,
  Skeleton,
  Typography
} from "@mui/material";
import { UsersProfileContext } from 'services/context_services/usersProfileContext';
import { convertTimestampToDate, firstLetterUpperCase, getLastFiveString, machineNameToLabel } from 'Common/functions';
import { CHECKOUT_TYPE } from "Common/constants";

const OrderContentRow = (props) => {
  const { order, selOrderId, onClickOrder } = props;
  const { profileData } = useContext(UsersProfileContext);
  const styles = {
    spacing: {
      marginRight: '10px',
    },
  };

  const getProfileById = (profile_id) => {
    const profile = profileData[profile_id];
    if (profile == undefined) return "";
    return profile['name']
  }

  return (
    <Box sx={{
      fontSize: "14px",
      p: "5px",
      borderBottom: "1px solid gray",
      transition: "all 500ms ease",
      background: order['order_id'] == selOrderId ? "#161616" : "transparent",
      "&:hover": {
        cursor: "pointer",
        background: order['order_id'] == selOrderId ? "#161616" : "gray",
      },
    }}
      onClick={() => onClickOrder(order)}
    >
      {/* {console.log("order: ", order)} */}
      <Box>
        <span style={styles.spacing}>Order: {order.order_id.slice(-6)}</span>
        <span>Changed: {order.changed ? convertTimestampToDate(order.changed) : 'N/A'}</span>
      </Box>
      <Box>
        <span
          style={styles.spacing}>Type: {order.type !== null ? machineNameToLabel(order.type) : 'N/A'}</span>
        <span>Customer: {order.customer_id ? getProfileById(order.customer_id) : 'N/A'}</span>
      </Box>
    </Box>
  );
};

export default OrderContentRow;
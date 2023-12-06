import React, { useEffect, useState } from 'react';
import { storeGetCashierName } from 'services/storage_services/storage_functions';
import {
  Stack,
  Typography,
  Tooltip,
  Box
} from '@mui/material';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import CashierPinDialog from 'components/CashierPinDialog';
import { getCart } from 'services/idb_services/orderManager';

const CashierNameWidget = (props) => {
  const { is_disabled, cart } = props;
  const [openPinPopup, setOpenPinPopup] = useState(false);
  const onClickCashier = () => {
    if (is_disabled) return;
    setOpenPinPopup(true);
  }


  return (
    <div>
      <CashierPinDialog
        openPinPopup={openPinPopup}
        setOpenPinPopup={setOpenPinPopup}
      />
      <Stack
        direction="row"
        spacing={1}
        justifyContent="space-between"
        alignItems="center"
        paddingTop="15px"
      >
        <div className=''>
          {cart && cart.order_id ? <Box sx={{ fontSize: "15px", lineHeight: "25px" }}>
            Order ID: {cart.order_id?.slice(-6)}
          </Box> : <></>
          }
          {cart && cart.type ? <Box sx={{ fontSize: "15px", lineHeight: "25px" }}>
            Order Type: {cart.type ? cart.type.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase()) : 'Delivery'}
          </Box> : <></>
          }
        </div>
        <div className='custom-button'>
          <Tooltip title="Cashier (click to switch)">
            <Box sx={{ fontSize: "20px" }} onClick={onClickCashier}>
              Cashier: {storeGetCashierName() ? storeGetCashierName() : 'Not selected'}
            </Box>
          </Tooltip>
        </div>
      </Stack>
    </div>
  );
};

export default CashierNameWidget;
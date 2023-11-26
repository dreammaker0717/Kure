import React, { useState } from 'react';
import { storeGetCashierName } from 'services/storage_services/storage_functions';
import {
  Stack,
  Typography,
  Tooltip,
  Box
} from '@mui/material';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import CashierPinDialog from 'components/CashierPinDialog';

const CashierNameWidget = (props) => {
  const { is_disabled } = props;
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
        justifyContent="flex-end"
        alignItems="center"
      >
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
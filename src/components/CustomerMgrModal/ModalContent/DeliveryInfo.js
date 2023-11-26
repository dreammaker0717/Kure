import React from 'react';
import { Typography } from '@mui/material';

const DeliveryInfo = (props) => {
  const { selCustomer, setSelCustomer } = props;
  return (
    <div style={{ display: selCustomer['is_deliver'] == "true" ? "block" : "none" }}>
      <Typography sx={{ textAlign: 'center' }}>Delivery option has been set</Typography>
    </div>
  );
};

export default DeliveryInfo;
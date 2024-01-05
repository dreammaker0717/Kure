import React, { useEffect, useMemo, useState } from 'react';
import { Snackbar, Box, Grid, Button, Typography } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
// import ConfirmModal from '../../ConfirmModal/ConfirmModal';

import { CART_STATUS, DELIVERY_STATUS } from 'Common/constants';
import {
  addBillingProfileToCart,
  postOrderMessage,
  refreshCart,
  isConfirmDeliveryAddress
} from "services/idb_services/orderManager";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
const SelectDeliveryAdrWidget = (props) => {
  const { cartInfo, onClickNext, deliveryStatus, setDeliveryStatus, addressList } = props;
  const [addressInfoList, setAddressInfoList] = useState([]);
  // const { addressList, deliveryInfo, setDeliveryInfo  } = props;
  const [alertInfo, setAlertInfo] = useState({ message: '', open: false });
  // console.log("addressList: ", addressList);
  // const [selAddressUID, setSelAddressUID] = useState();
  const selected_address = useMemo(() => {
    const billing_info = cartInfo.billing_profile;
    if (!billing_info || Object.keys(billing_info).length == 0) {
      setAddressInfoList(addressList);
      return Object.entries(addressList)[0];
    }

    console.log(billing_info);
    const address_uid = Object.keys(billing_info)[0];
    const temp_address = Object.entries(addressList).find(([key, value]) => key == address_uid);

    if (temp_address) {
      setAddressInfoList(addressList);
    } else {
      setAddressInfoList(billing_info);
    }

    return Object.entries(billing_info)[0];
  }, [cartInfo]);

  const is_completed = cartInfo.state == CART_STATUS.COMPLETED
  const error_message = useMemo(() => {
    if (selected_address == undefined) return "Please add at least one address.";

    let message = "";
    const profile_id = selected_address[0];
    const address_body = selected_address[1];
    const { phone, is_default } = address_body;
    const {
      address_line1,
      locality,
      administrative_area,
      postal_code,
      given_name,
      family_name
    } = address_body.address;

    if (!address_line1 || address_line1 == '') message = 'Address is required.';
    if (!locality || locality == '') message = 'City is required.';
    if (!administrative_area || administrative_area == '') message = 'State is required.';
    if (!phone || phone == '') message = 'Phone number is required.';
    if (given_name == '') message = 'First name is required.';
    if (family_name == '') message = 'Last name is required.';
    if (postal_code == '') message = 'Zip code is required.';
    if (phone && phone.length != 12) message = 'Phone number is not valid.';
    if (message != "") {
      message = message + " Please edit your address.";
    }
    return message;
  }, [selected_address]);

  useEffect(() => {
    const billing_info = cartInfo.billing_profile;
    if (!billing_info || Object.keys(billing_info).length == 0) {
      console.log("addressList>>>", addressInfoList)
      if (Object.keys(addressInfoList).length == 0) return;
      const first_uid = Object.keys(addressInfoList)[0];
      onChangeAddress(first_uid);
    }
  }, []);

  const onChangeAddress = async (address_uid) => {
    // console.log("address_uid: ", address_uid);
    // console.log('billing>>', addressList[address_uid])
    addBillingProfileToCart({ [address_uid]: addressInfoList[address_uid] });
  };
  // console.log("cur addr list: ", addressList)
  // console.log("selected_address: ", selected_address)

  const onClickEdit = () => {
    setDeliveryStatus(DELIVERY_STATUS.EditAddress);
  };

  const onClickAdd = () => {
    setTimeout(() => {
      setDeliveryStatus(DELIVERY_STATUS.AddAddress);
    }, 300)
  }

  const onClickDoProcess = async () => {
    let message = '';
    let is_available_address = false;

    if (selected_address === null) {
      message = 'At least one address is required.';
      return;
    } else {
      console.log("selected_address == ", selected_address);
      const address_body = selected_address[1];
      let temp_country_code = address_body.address?.country_code;
      let temp_administrative_area = address_body.address?.administrative_area;
      is_available_address = await isConfirmDeliveryAddress(temp_country_code, temp_administrative_area);
      console.log("is_available_address == ", is_available_address);
    }

    if (is_available_address) {
      // Notify the system that the cart should be refreshed.
      // This is needed because the user has chosen an address.
      postOrderMessage();
      onClickNext();
    } else {
      setAlertInfo({ open: true, message: "This product cannot be delivered to that address.\n Please check your address again." });
    }
  };

  return (
    <div>
      <Snackbar
        open={alertInfo.open === true}
        autoHideDuration={3000}
        onClose={() => setAlertInfo({ open: false, message: '' })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          {alertInfo.message.split("\n").map((item, index) => (
            <React.Fragment key={index}>
              {item}
              <br />
            </React.Fragment>
          ))}
        </Alert>
      </Snackbar>
      <Box sx={{ pt: '10px' }}>
        <Typography
          style={{
            color: '#fa7274'
          }}>
          {error_message}
        </Typography>
        <Grid container alignItems={'center'} columnSpacing={{ xs: 2, sm: 2 }}>
          <Grid item xs={12} sm={8}>
            <select
              value={selected_address == null ? '' : selected_address[0]}
              onChange={e => onChangeAddress(e.target.value)}
              style={{
                background: '#373636',
                // Set border based on error message.
                border: '1px solid #A8A8A8',
                fontSize: { xs: '1rem', sm: '1.5rem' },
                //color: deliveryAddressErrorMessage.length > 0 ? '#fa7274' : '#f7f7f7',
                color: '#f7f7f7',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                padding: '8px',
                width: '100%',
                borderRadius: 3
              }}
              disabled={is_completed}
            >
              {Object.entries(addressInfoList).map(([key, value]) => {
                return (
                  <option value={key} key={`deliver-address-${key}`}
                    style={{ color: value.phone == '' ? '#fa7274' : '' }}>
                    {value.address.address_line1} {value.address.address_line2} {value.address.locality}, {value.address.administrative_area} {value.address.postal_code}: {value.phone == '' ? ' (Phone # is required)' : value.phone}
                  </option>
                );
              })}
            </select>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Grid container spacing={"5px"}>
              <Grid item xs={6}>
                <Button
                  onClick={onClickEdit}
                  disabled={
                    Object.keys(addressInfoList).length === 0 && addressInfoList.constructor === Object
                  }
                  variant="outlined"
                  color="info"
                  fullWidth
                  sx={{
                    color: 'white',
                    border: '1px solid',
                    background: '#32beb9'
                  }}
                >
                  Edit
                </Button></Grid>
              <Grid item xs={6}>
                <Button
                  onClick={onClickAdd}
                  variant="outlined"
                  color="info"
                  fullWidth
                  sx={{
                    color: 'white',
                    border: '1px solid',
                    background: '#32beb9'
                  }}
                >
                  Add
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>

      <Button
        disabled={error_message.length > 0}
        onClick={onClickDoProcess}
        variant="outlined"
        color="info"
        fullWidth
        sx={{
          color: 'white',
          mt: '24px',
          border: '1px solid',
          background: '#32beb9'
        }}
      >
        {deliveryStatus['next_button'].toUpperCase()}
      </Button>
      {deliveryStatus['skip_button'] !== null && (
        <Button
          onClick={onClickNext}
          variant="outlined"
          color="info"
          fullWidth
          sx={{
            color: 'white',
            mt: '24px',
            border: '1px solid',
            background: '#32beb9'
          }}
        >
          {deliveryStatus['skip_button'].toUpperCase()}
        </Button>
      )}
    </div>
  );
};

export default SelectDeliveryAdrWidget;

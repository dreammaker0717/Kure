import React, { useContext, useEffect, useState } from 'react';
import { Typography, Grid, Box, Button } from '@mui/material';
import CustomerMgrModal from 'components/CustomerMgrModal/CustomerMgrModal';
import ConfirmModal from 'components/ConfirmModal/ConfirmModal';
import {
  addUpdateCustomerData, getCustomerDataByUid, removeSelectedCustomer
} from 'services/idb_services/customerManager';
import moment from 'moment';
import {
  SIG_ADDRESS_LIST_CHANGED,
  SIG_CHANNEL,
  SIG_CUSTOMER_REMOVED, SIG_CUSTOMER_SYNCED,
} from 'Common/signals';
import { UsersProfileContext } from 'services/context_services/usersProfileContext';
import {
  addOrderTypeToCart,
  getCart,
  getCustomerIdFromCart, refreshCart,
  removeCustomerFromCart
} from "services/idb_services/orderManager";
import { broadcastMessage, formatUser } from "Common/functions";
import { getStoreId } from "services/storage_services/storage_functions";
import { CartDataIndex, useCartData } from 'services/context_services/cartDataContext';
import { customToast } from 'components/CustomToast/CustomToast';
import { getTokenworksDataAll } from 'services/idb_services/userManager';

const SelectCustomerInfoWidget = (props) => {
  const { cart, method, is_disabled } = props;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [tokenworks, setTokenworks] = useState(null);
  const { profileData, setProfileData } = useContext(UsersProfileContext);
  const { values: cartData, setValue: setCartData } = useCartData();
  useEffect(() => {
    getSelectedCustomer();
  }, [cart, profileData]);

  const getSelectedCustomer = async () => {
    if (!profileData) return;
    // console.log("CART >>", cart);
    // const customer = await getCustomerDataByUid(cart.customer_id);
    const customer = await profileData[cart.customer_id];
    // console.log("CART CUSTOMER >>", customer)
    if (customer) {
      setSelectedCustomer(customer);
      const customer_name = formatUser(customer);
      setCartData(CartDataIndex.CUSTOMER_KEYWORD, customer_name);
    } else {
      setSelectedCustomer(null);
      setCartData(CartDataIndex.CUSTOMER_KEYWORD, "");
    }
  };

  useEffect(() => {
    const channel = new BroadcastChannel(SIG_CHANNEL);
    channel.addEventListener('message', async (event) => {
      switch (event.data.type) {
        case SIG_ADDRESS_LIST_CHANGED:
          getSelectedCustomer();
          break;

        case SIG_CUSTOMER_SYNCED:
          break;
      }
    });

    getTokenworksDataAll().then((rows) => {
      setTokenworks(rows);
    }).catch((err) => {
      console.log(err);
    });
  }, [])

  const onClickRemoveCustomer = async () => {
    const customer_id = await getCustomerIdFromCart();
    /**
     * @TODO: We may not want to remove the customer once we've added them to the customer_data. Do we want to sync
     *        their data first then have an event clear the customer_data?
     */
    //await removeSelectedCustomer(customer_id);
    await removeCustomerFromCart();
    await addOrderTypeToCart(null);
    console.log("onClickRemoveCustomer");
    await refreshCart();

    setSelectedCustomer(null);
    broadcastMessage(SIG_CUSTOMER_REMOVED);
  }

  const onClickEditCustomer = async () => {
    setDialogOpen(true);

    const selected_tokenworks_customer_id = tokenworks && tokenworks.find(item => item.uid === selectedCustomer.uid)?.customer_id || '';
    const temp = {
      ...selectedCustomer,
      tokenworks_customer_id: selected_tokenworks_customer_id
    };
    console.log(selected_tokenworks_customer_id);
    setSelectedCustomer(temp);
  }

  const AddOrUpdateCustomerInfo = async (selected_customer) => {
    const { status, data, message } = await addUpdateCustomerData(selected_customer);
    const new_customer = data;

    if (status == false) {
      customToast.error(message);
      if (new_customer == null) {
        return;
      }
    }

    // Update context with newly updated customer.
    let new_profile = { ...profileData };
    new_profile[new_customer.uid] = { ...new_customer };
    setProfileData(new_profile);
    // Update the UI - just in case there were changes.
    setSelectedCustomer(new_customer);
  }

  if (selectedCustomer == null) {
    return <></>;
  }
  if (selectedCustomer.length === 0) {
    return <></>;
  }

  return (
    <>
      <CustomerMgrModal
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false)
        }}
        profileData={profileData}
        onOK={async (selected_customer) => {
          setDialogOpen(false);
          AddOrUpdateCustomerInfo(selected_customer);
        }}
        selectedCustomer={selectedCustomer}
        setSelectedCustomer={setSelectedCustomer}
      />
      <Box sx={{ mt: is_disabled ? "0px" : "10px", ml: "20px" }}>
        {!is_disabled &&
          <div
            style={{
              opacity: !method ? 1 : 0,
              transition: "opacity 0.5s ease-in-out"
            }}
          >
            <div style={{ display: !method ? "block" : "none" }}>
              <Grid container direction={'row'} justifyContent="space-evenly"
              >
                <Grid item>
                  <Button color="info"
                    sx={{
                      color: 'white',
                      mt: '10px',
                      border: '1px solid',
                      background: '#32beb9'
                    }}
                    variant="outlined"
                    onClick={onClickRemoveCustomer}
                  >Remove Customer</Button>
                </Grid>
                <Grid item>
                  <Button color="info"
                    sx={{
                      color: 'white',
                      mt: '10px',
                      border: '1px solid',
                      background: '#32beb9'
                    }}
                    variant="outlined"
                    onClick={onClickEditCustomer}
                  >Edit Customer</Button>
                </Grid>
              </Grid>
            </div>
            <Box sx={{ paddingBottom: '23px' }}></Box>
          </div>
        }
        <Box sx={{ mt: "10px" }}>
          {/*
              @TODO: We may not want to display the customer address here. Plus, we need to find the default address.
          */}
          {/*<Box sx={{ pl: "10px" }}>*/}
          {/*  <Typography className="text-size-h7">{selectedCustomer['Address1']}</Typography>*/}
          {/*  <Typography className="text-size-h7">{selectedCustomer['Address2']}</Typography>*/}
          {/*  <Typography className="text-size-h7">{selectedCustomer['City']}</Typography>*/}
          {/*  <Typography className="text-size-h7">{selectedCustomer['State']}</Typography>*/}
          {/*  <Typography className="text-size-h7">{selectedCustomer['Zip']}</Typography>*/}
          {/*</Box>*/}
        </Box>
        <Box sx={{ mt: "10px" }}>
          <Typography className="text-size-h6">
            <strong>Username: </strong> {selectedCustomer.name}
          </Typography>
          <Typography className="text-size-h6">
            <strong>Email: </strong> {selectedCustomer.mail}
          </Typography>
          <Typography className="text-size-h6">
            {/* The phone has to be retrieved from the address object, not sure how to do that yet. */}
            {/*<strong>Telephone</strong> 000-000-0000*/}
            {/*<strong>Telephone</strong> {selectedCustomer.phone}*/}
          </Typography>
        </Box>
        <Box sx={{ mt: "10px" }}>
          <Typography className="text-size-h6">
            <strong>Medical user: </strong> {selectedCustomer.is_medical_user}
          </Typography>
          <Typography className="text-size-h6">
            <strong>License #: </strong> {selectedCustomer.medical_user_info.license}
          </Typography>
          <Typography className="text-size-h6">
            <strong>Expiration date: </strong> {
              selectedCustomer.medical_user_info.expiration_date == "" ? ""
                : moment(selectedCustomer.medical_user_info.expiration_date, "MM-DD-YYYY").format("MM-DD-YYYY")
            }
          </Typography>
        </Box>
        <Box sx={{ mt: "10px" }}>
          <Typography className="text-size-h6">
            <strong>Membership level: </strong> {selectedCustomer['membership_level']}
          </Typography>
          <Typography className="text-size-h6">
            <strong>Till next level: </strong> {selectedCustomer['till_next_level']}
          </Typography>
          <Typography className="text-size-h6">
            <strong>Credit: </strong> {selectedCustomer['credit']}
          </Typography>
          <Typography className="text-size-h6">
            <strong>Total paid (subtotal - discount): </strong>
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default SelectCustomerInfoWidget;
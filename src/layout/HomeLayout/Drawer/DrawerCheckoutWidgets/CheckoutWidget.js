import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { CART_STATUS, CHECKOUT_METHOD, CHECKOUT_TYPE, FCM_TYPE, USER_TYPE } from 'Common/constants';
import SmallPinNumPad from 'utils/SmallPinNumPad';
import {
  SIG_AUTH_CHANGED,
  SIG_CHANNEL,
  SIG_CHECKOUT_COMPLETE,
  SIG_CUSTOMER_REMOVED,
  SIG_CUSTOMER_SELECTED, SIG_FETCH_USER_PROFILE_DATA,
  SIG_ONE_CUSTOMER_RECEIVED, SIG_PARSE_USER_PROFILE_DATA,
  SIG_RECEIVE_NOTIFICATION,
} from 'Common/signals';
import CheckoutAddressDelivery from './CheckoutAddressDelivery';
import CheckoutAddressPickup from './CheckoutAddressPickup';
import LoadingWidget from 'components/Loading/LoadingWidget';
import { Resource } from 'services/api_services/Resource';
import {
  addBillingProfileToCart,
  addOrderTypeToCart,
  getCustomerIdFromCart, refreshCart,
  updateCartObject,
  updateCartObjectById
} from 'services/idb_services/orderManager';
import { customToast } from 'components/CustomToast/CustomToast';
import { broadcastMessage, convertToNumber } from 'Common/functions';
import { UsersProfileContext } from "services/context_services/usersProfileContext";
import CartDrupalSyncWidget from './CartDrupalSyncWidget';
import LinearWithValueLabel from "components/LinearLoaderWithLabel";
import { clearAllData } from "services/idb_services/initiateData";
import { getTokenworksData } from "services/idb_services/userManager";

const resource = new Resource();

const CheckoutWidget = (props) => {
  const { cart, processingUserProfileData, cashierIdExists, processCartSubmission, cartTotals, cartReturnTotals } = props;
  const { method, setMethod } = props;
  const { profileData } = useContext(UsersProfileContext);

  const enablePickUp = useMemo(() => {
    if (!cart) return false;
    if (!cart.order_items) return false;
    if (cart.order_items?.length == 0) return false;

    // // User is signed in and is a customer.
    // if (resource.getUserRole() === USER_TYPE.CUSTOMER) {
    //   // For some reason there is no customer_id. When will this happen? It shouldn't!
    //   if (!cart.customer_id) return false;
    //   if (cart.customer_id == "") return false;
    // }

    // This condition isn't necessary because the conditions above will catch it.
    // if (resource.getUserRole() === USER_TYPE.CUSTOMER) return true;

    return true;
  }, [cart]);

  const enableDelivery = useMemo(() => {
    if (!cart) return false;
    if (!cart.order_items) return false;
    if (cart.order_items?.length == 0) return false;
    if (!cart.customer_id) return true;
    if (cart.customer_id == "") return false;

    // I don't think this is necessary because the conditions above will catch it.
    // if (resource.getUserRole() === USER_TYPE.CUSTOMER) return true;

    return true;
  }, [cart])

  const is_completed = cart && cart.state == CART_STATUS.COMPLETED
  /**
   * The user might have updated the quantity, changed order to a pick up or a change to a delivery, update
   * the cart and notifiy the UI.
   */
  const refreshCartHelper = async (order_type) => {
    // console.log("SETTING RODER TYPE", order_type);
    await addOrderTypeToCart(order_type);

    console.log('refreshCarthelper');
    // Refresh the cart totals.
    await refreshCart();

  };

  const onClickBack = async () => {
    setMethod(null);
    await refreshCartHelper(null);
  }

  useEffect(() => {
    const channel = new BroadcastChannel(SIG_CHANNEL);
    channel.addEventListener('message', async (event) => {
      const { type, data } = event.data;
      switch (type) {
        // Only a Kure employee will receive this message. They must have selected a customer or assigned one to an
        // order. The 'remove customer' button also fires this.
        // case SIG_CUSTOMER_SELECTED:
        case SIG_CUSTOMER_REMOVED:
          setMethod(null);
          addBillingProfileToCart(null);
          break;
        // // When an order was completed, we want to reset the UI.
        case SIG_CHECKOUT_COMPLETE:
          setMethod(null);
          break;
      }
    });
  }, []);

  useEffect(() => {
    if (cart) {
      if (cart.type == "pick_up") {
        setMethod(CHECKOUT_TYPE.PICK_UP);
      } else if (cart.type == "delivery") {
        setMethod(CHECKOUT_TYPE.DELIVERY);
      } else {
        setMethod(null);
      }
    }
  }, [cart]);

  // const [customerCount, setCustomerCount] = useState(0);
  const [progressFetch, setProgressFetch] = useState(100);
  const [progressParse, setProgressParse] = useState(0);

  useEffect(() => {
    const channel = new BroadcastChannel(SIG_CHANNEL);
    channel.addEventListener('message', async (event) => {
      const { data, type } = event.data;
      switch (type) {
        case SIG_FETCH_USER_PROFILE_DATA:
          // setCustomerCount(data.user_count);
          setProgressFetch(data.progress);
          break;

        case SIG_PARSE_USER_PROFILE_DATA:
          setProgressParse(data.progress);
          break;
      }
    });
  }, []);

  const onClickConfirmCheckout = async () => {
    processCartSubmission();
  }

  // There's data in the background which hasn't been processed yet.
  if (processingUserProfileData) {
    return <div style={{ textAlign: 'center' }}>
      <LoadingWidget text={`Downloading customer data...`} />
      <LinearWithValueLabel value={progressFetch} />
      <Box sx={{ color: "#C3915B" }}>
        Preparing customer data for use...
      </Box>
      <LinearWithValueLabel value={progressParse} />
    </div>
  }

  if (cart === null) {
    return <div style={{ textAlign: 'center' }}>
      <LoadingWidget text={"Fetching cart data, please wait."} />
    </div>
  }
  const can_submit = resource.getUserRole() != USER_TYPE.KURE_EMPLOYEE
    ? true
    : (!cart
      ? false
      : Math.round((convertToNumber(cart.payment, 0) - convertToNumber(cartTotals.total, 0) + convertToNumber(cartReturnTotals.total, 0)) * 100) / 100 >= 0);
  // console.log("change: ", cartTotals)
  return (
    <>
      {/* We have a role but no cashier_id exists: User is an employee, a PIN is a requirement. */}
      {(resource.getUserRole() === USER_TYPE.KURE_EMPLOYEE && !cashierIdExists)
        ? <div style={{ maxWidth: "300px", margin: 'auto', paddingTop: "20px" }}>
          <SmallPinNumPad />
        </div>
        :
        <div style={{ display: cart.order_items?.length > 0 ? "block" : "none" }}>
          {
            method === null && <Box sx={{ mt: '20px' }}>
              <Box>
                <Typography variant={'h3'}>
                  Are you picking up or is this a delivery?
                </Typography>
              </Box>
              <Box sx={{ ml: "20px" }}>
                <Button
                  key={'button-pick-up'}
                  onClick={async () => {
                    await refreshCartHelper(CHECKOUT_TYPE.PICK_UP);
                    setMethod(CHECKOUT_TYPE.PICK_UP);
                  }}
                  variant="outlined"
                  color="info"
                  fullWidth
                  sx={{
                    color: 'white',
                    mt: '10px',
                    border: '1px solid',
                    background: '#32beb9'
                  }}
                  disabled={!enablePickUp || (is_completed && cart.type == CHECKOUT_TYPE.DELIVERY)}
                >
                  I WANT TO PICK UP
                </Button>
                <Button
                  key={'button-delivery'}
                  onClick={async () => {
                    if ((!cart.customer_id || cart.customer_id == 0) && resource.getUserRole() == USER_TYPE.KURE_EMPLOYEE) {
                      customToast.warn("Before proceeding, it's essential to select the customer.");
                      return;
                    }
                    await refreshCartHelper(CHECKOUT_TYPE.DELIVERY);
                    setMethod(CHECKOUT_TYPE.DELIVERY);
                  }}
                  variant="outlined"
                  color="info"
                  fullWidth
                  sx={{
                    color: 'white',
                    mt: '10px',
                    border: '1px solid',
                    background: '#32beb9'
                  }}
                  disabled={!enableDelivery || (is_completed && cart.type == CHECKOUT_TYPE.PICK_UP)}
                >
                  DELIVER MY ORDER
                </Button>
              </Box>
            </Box>
          }

          <Box sx={{ mt: '20px', mb: "30px" }}>
            {method === CHECKOUT_TYPE.PICK_UP &&
              <CheckoutAddressPickup
                onClickChooseMethod={onClickBack}
                onClickConfirmCheckout={onClickConfirmCheckout}
                cartInfo={cart}
                can_submit={can_submit}
              />
            }
            {(method === CHECKOUT_TYPE.DELIVERY) &&
              <CheckoutAddressDelivery
                onClickChooseMethod={onClickBack}
                onClickConfirmCheckout={onClickConfirmCheckout}
                profileData={profileData}
                cartInfo={cart}
                can_submit={can_submit}
              />
            }
          </Box>

        </div>
      }
    </>
  );
};

export default CheckoutWidget;
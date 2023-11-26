import { Box, Stack, Typography, Link, Divider, Drawer } from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CartProductListWidget from './DrawerCheckoutWidgets/CartProductListWidget';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import DrawerAuth from './DrawerCheckoutWidgets/DrawerAuth';
import { CART_STATUS, CHECKOUT_TYPE, DEVICE_SIZE, TEMP_CART_STATUS, USER_TYPE } from 'Common/constants';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { makeStyles } from '@mui/styles';
import SelectCustomerInfoWidget from './DrawerCheckoutWidgets/SelectCustomerInfoWidget';
import CheckoutWidget from './DrawerCheckoutWidgets/CheckoutWidget';
import CartSummaryWidget from './DrawerCheckoutWidgets/CartSummaryWidget';
import CartButtonsWidget from './DrawerCheckoutWidgets/CartButtonsWidget';
import {
  SIG_AUTH_CHANGED,
  SIG_CHANNEL,
  SIG_CHECKOUT_COMPLETE,
  SIG_CUSTOMER_REMOVED,
  SIG_DRUPAL_COMPLETE_ORDER,
  SIG_FINISH_REQUEST_USERS_PROFILE,
  SIG_ON_REFRESH_CART,
  SIG_ORDER_SYNCHED
} from 'Common/signals';
import {
  checkCartProductInventories,
  finishCartObject,
  getCart,
  refreshCart,
  syncOrdersWithDrupal,
  syncOrderWithDrupal,
  updateCartObjectById
} from 'services/idb_services/orderManager';
import { customToast } from 'components/CustomToast/CustomToast';
import { getUserInfo } from 'services/idb_services/userManager';
import { UsersProfileContext } from 'services/context_services/usersProfileContext';
import { Resource } from 'services/api_services/Resource';
import {
  storeGetCashierId,
  getStoreId,
  storeGetCashierName,
  storeSetCashierId,
  getLoggedInUserId
} from 'services/storage_services/storage_functions';
import CustomerSelectWidget from 'layout/HomeLayout/Drawer/DrawerCheckoutWidgets/CustomerSelectWidget';
import { localStorageCashierName } from 'services/storage_services/CONSTANTS';
import CashierNameWidget from './DrawerCheckoutWidgets/CashierNameWidget';
import {
  backgroundServiceMessenger,
  broadcastMessage,
  convertToNumber,
  formatUser,
  getAddressString, getCalculatedCartReturnTotals,
  getCalculatedCartTotals,
  getDeviceSize
} from 'Common/functions';
import CartDrupalSyncWidget from './DrawerCheckoutWidgets/CartDrupalSyncWidget';
import { CommonDataIndex, useCommonData } from 'services/context_services/commonDataContext';
import { CartDataIndex, useCartData } from 'services/context_services/cartDataContext';
import { idbSetActiveCart } from 'services/idb_services/configManager';
import CompletedCartWidget from './DrawerCheckoutWidgets/CompletedCartWidget';
import StoreSelectModal from 'components/StoreSelectModal/StoreSelectModal';
import OrderNotice from 'layout/HomeLayout/Drawer/OrderNotice';
import { getCommerceStoreById } from 'services/idb_services/commerceStoreManager';

const useStyles = makeStyles({
  list: {
    width: 250
  },
  fullList: {
    width: 'auto'
  },
  paper: {
    background: '#383737fa'
  }
});

const resource = new Resource();

function DrawerCheckout() {
  const { values: commonData, setValue: setCommonData } = useCommonData();
  const { values: cartData, setValue: setCartData } = useCartData();
  const { profileData } = useContext(UsersProfileContext);
  const ref = useRef();
  const is_logged_in = commonData[CommonDataIndex.IS_LOGGED_IN];
  const open = commonData[CommonDataIndex.OPEN_CART_DRAWER];
  const setOpen = (is_open) => setCommonData(CommonDataIndex.OPEN_CART_DRAWER, is_open);
  const [submitTempData, setSubmitTempData] = useState(null);
  const cart = cartData[CartDataIndex.CART];
  const setCart = (info) => setCartData(CartDataIndex.CART, info);
  const [method, setMethod] = useState(null);
  const cartTotals = useMemo(() => getCalculatedCartTotals(cart), [cart]);
  const cartReturnTotals = useMemo(() => getCalculatedCartReturnTotals(cart), [cart]);
  const classes = useStyles();
  const [cashierIdExists, setCashierIdExists] = useState(false);
  const [openStoreModal, setOpenStoreModal] = useState(false);
  // const [userRole, setUserRole] = useState(null);
  // const [processingUserProfileData, setProcessingUserProfileData] = useState(true);
  const virtual_product_count = !cart ? 0 : cart.order_items.length;
  const processingUserProfileData = !profileData || Object.keys(profileData).length == 0;
  // console.log(profileData)
  const resource = new Resource();
  useEffect(() => {
    if (!cart) return;
    // console.log("cart.order_id : ", cart.order_id);
    checkCartProductInventories(cart);
  }, [cart && cart.order_id]);
  //
  // const getUsrRole = async () => {
  //   const role = await resource.getUserRole();
  //   console.log(role);
  //   setUserRole(role);
  // };
  //
  // useEffect(() => {
  //   getUsrRole();
  // }, []);

  // console.log("submitTempData: ", submitTempData)
  // console.log("currentCart: ", cart)
  const getCartData = async () => {
    console.log("getCartData")
    const toast_response = await refreshCart();
    const { status, data, message } = toast_response;
    if (status === false) {
      setCart(null);
      // customToast.error(message);
      return;
    }

    // this is to remove temporary data that was set when the order is submitted.
    if (submitTempData) {
      setSubmitTempData(null);
    }

    // this logic is to set completed when switching cart
    if (!cart && !data && cart.order_id != data.order_id) {
      setMethod(data.type);
      // console.log("NEW ORDER: ", data);
      if (profileData[data.customer_id] != null) {
        const customer = profileData[data.customer_id];
        const customer_formatted = formatUser(customer);
        setCartData(CartDataIndex.CUSTOMER_KEYWORD, customer_formatted);
      }
    }

    // I commented below code, but it will give an issue when a user click complete order.
    /*
    if (resource.getUserRole() === USER_TYPE.CUSTOMER && data.customer_id == null) {
      // I add this, because the customer can not set customer_id
      updateCartObjectById(data.order_id, {
        customer_id: getLoggedInUserId()
      }, false);
      setCart({
        ...data,
        customer_id: getLoggedInUserId()
      });
    } else {
      */
    setCart(data);
    // }
  };

  useEffect(() => {
    const channel = new BroadcastChannel(SIG_CHANNEL);
    channel.addEventListener('message', async (event) => {
      const { type, data } = event.data;
      const _data = data;
      switch (type) {
        case SIG_AUTH_CHANGED:
          // If an employee successfully enters their PIN, this message is fired.
          // Remove the PIN pad.
          if (storeGetCashierId()) {
            setCashierIdExists(true);
          }
          getCartData();
          break;

        case SIG_ON_REFRESH_CART:
          getCartData();
          break;

        case SIG_DRUPAL_COMPLETE_ORDER:
          onCompleteOrder(_data);
          break;

        case SIG_FINISH_REQUEST_USERS_PROFILE:
          // The decryption process finished and the notice can be removed.
          // setProcessingUserProfileData(false);
          break;

        case SIG_ORDER_SYNCHED:
          const { status, data, message } = _data;
          console.log('DrawerCheckout.js: SIG_ORDER_SYNCHED', status, data, message);
          if (status == true) {
            console.log('SENT DATA: ', data);
            await idbSetActiveCart(null);
            customToast.success(message);
            broadcastMessage(SIG_CUSTOMER_REMOVED);
            broadcastMessage(SIG_ON_REFRESH_CART);

            storeSetCashierId(null);
            setCashierIdExists(false);
            if (data) {
              const store_info = await getCommerceStoreById(data.store_id);
              setSubmitTempData({
                order_id: data.order_id,
                store_name: store_info.name,
                store_address: getAddressString(store_info),
                store_phone: store_info.phone,
                status: TEMP_CART_STATUS.SUCCESS
              });
            } else {
              setSubmitTempData(null);
            }
          } else {
            setSubmitTempData(null);
            await finishCartObject(data.order_id, {
              submission_ready: false
            });
            customToast.error(message);
            setCart({
              ...cart,
              is_busy: false
            });
          }
          break;
      }
    });

    getCartData();

    // On page reload, check if the cashier ID exists. If so, remove the PIN pad.
    if (storeGetCashierId()) {
      setCashierIdExists(true);
    }
  }, []);

  // useEffect(() => {
  //   // If profileData is not null, the decryption process finished and the notice can be removed.
  //   // if (profileData.length > 0) {
  //   if (Object.keys(profileData).length > 0) {
  //     setProcessingUserProfileData(false);
  //   }
  // }, [profileData]);
  // console.log("profileData:", profileData);

  const setCartFreeze = async () => {
    const store = await getCommerceStoreById(cart.store_id);

    setSubmitTempData({
      order_id: cart.order_id,
      store_name: store.name,
      store_address: getAddressString(store),
      store_phone: store.phone,
      status: TEMP_CART_STATUS.CHECKING
    });

    const is_employee = resource.getUserRole() === USER_TYPE.KURE_EMPLOYEE;

    let can_submit = true;

    if (is_employee) {
      if (!cart) {
        can_submit = false;
      } else {
        const payment_amount = convertToNumber(cart.payment, 0);
        const cart_total = convertToNumber(cartTotals.total, 0);
        const cart_return_total = convertToNumber(cartReturnTotals.total, 0);
        const balance = ((payment_amount - cart_total + cart_return_total) * 100) / 100;
        can_submit = balance >= 0;
      }
    }
    if (!can_submit) {
      customToast.error('The cash amount you input is not correct.');
      setSubmitTempData(null);
      return;
    }

    const invalid_products = await checkCartProductInventories(cart);
    if (!invalid_products) {
      customToast.error(`Please check the connection.`);
      setSubmitTempData(null);
      return;
    }
    console.log('invalid_products: ', invalid_products);
    if (invalid_products.length > 0) {
      customToast.error(`One or more products are out of stock. Please check product list again.`);
      // if (ref && ref.current) {
      //   ref.current.scrollTo(0, 0);
      // }
      console.log('REF: ', ref);
      if (resource.getUserRole() === USER_TYPE.KURE_EMPLOYEE) {
        setMethod(null);
      }
      setSubmitTempData(null);
      return;
    }

    const order = await finishCartObject(cart.order_id, {
      submission_ready: true
    });
    console.log('focusing order: ', cart);

    setCart({
      ...cart,
      is_busy: true
    });

    customToast.success("We're preparing to send your order in a few seconds...");
    setSubmitTempData({ ...submitTempData, status: TEMP_CART_STATUS.SENDING });

    // 1. Attempt to add to the background sync api.
    // 2. If that fails, attempt to send the order to Drupal.
    // 3. Broadcast a message that the order submission completed, failed or is pending.
    // First we attempt to log a background sync API request in case the user is offline.
    const sync_order_result = await backgroundServiceMessenger('order-data-sync');
    console.log('sync_order_result: ', sync_order_result);
    // Our background sync API call failed.
    if (!sync_order_result) {
      await syncOrderWithDrupal(order);
    }
  };

  const onCompleteOrder = async (order_id) => {
    const order = await finishCartObject(order_id, {
      state: CART_STATUS.COMPLETED
    });
  };

  const onClickChangeStore = () => {
    setOpenStoreModal(true);
  };
  const sel_store_id = commonData[CommonDataIndex.SEL_STORE];
  const sel_store_info = commonData[CommonDataIndex.STORES].find((x) => x.store_id == sel_store_id);

  const can_show_drawer_info = cart && !cart.is_busy;
  const can_show_customers = resource.getUserRole() === USER_TYPE.KURE_EMPLOYEE && cashierIdExists;
  // && virtual_product_count > 0
  const drawerAnchor = getDeviceSize(commonData[CommonDataIndex.WIDTH]) == DEVICE_SIZE.xs ? 'bottom' : 'right';
  return (
    <>
      <StoreSelectModal
        open={openStoreModal}
        onOK={(v) => {
          setOpenStoreModal(false);
        }}
        onCancel={(v) => {
          setOpenStoreModal(false);
        }}
      />
      <Drawer
        anchor={drawerAnchor}
        open={open}
        onClose={() => setOpen(false)}
        ModalProps={{ keepMounted: true }}
        classes={{ paper: classes.paper }}
      >
        <Box
          sx={{
            width: '98vw',
            maxWidth: '600px',
            minWidth: '250px',
            minHeight: '100vh',
            padding: { xs: '15px', md: '38px' },
            color: 'white'
          }}
          ref={ref}
        >
          <Stack
            direction="column"
            spacing={0}
            sx={{
              paddingBottom: '53px',
              fontSize: { xs: '20px', md: '36px' },
              fontWeight: 'bold',
              lineHeight: '45px'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant={'h2'} sx={{ fontSize: { xs: '20px', md: '36px' } }}>
                Hi there!
              </Typography>
              <HighlightOffIcon
                sx={{ width: '50px', minHeight: '50px', cursor: 'pointer' }}
                onClick={() => setOpen(false)}
              ></HighlightOffIcon>
            </Box>
            <Typography variant={'h2'} sx={{ fontSize: { xs: '20px', md: '36px' } }}>
              Here is your shopping cart.
            </Typography>
            {resource.getUserRole() === USER_TYPE.KURE_EMPLOYEE && !processingUserProfileData && can_show_customers && (
              <CashierNameWidget is_disabled={cart && cart.state == CART_STATUS.COMPLETED}/>
            )}
          </Stack>

          {!cart && submitTempData ? (
            <OrderNotice
              orderNumber={submitTempData.order_id}
              destinationName={submitTempData.store_name}
              address={submitTempData.store_address}
              phone={submitTempData.store_phone}
            />
          ) : (
            <>
              {cart && cart.state == CART_STATUS.COMPLETED ? (
                <CompletedCartWidget cart={cart} cartTotals={cartTotals} cartReturnTotals={cartReturnTotals}/>
              ) : (
                <>
                  {(!cart || cart.order_items.length == 0) && sel_store_info && (
                    <>
                      <Box sx={{ ml: '10px', mb: '40px', textAlign: 'center' }}>
                        <Typography variant="h5">
                          <ReportProblemIcon sx={{ color: '#E67D04', mr: '10px' }} fontSize={'small'}/>
                          It seems there's no product in your cart for current store
                          <br/>
                          {sel_store_info.name} [{getAddressString(sel_store_info)}]
                          <br/>
                          Please add products to your cart or &nbsp;
                          <Typography onClick={onClickChangeStore}
                                      sx={{ textDecoration: 'underline', cursor: 'pointer' }} display="inline">
                            change the store here
                          </Typography>
                          .
                        </Typography>
                      </Box>
                    </>
                  )}
                  {cart && cart.is_busy && (
                    <Box>
                      <CartDrupalSyncWidget cart={cart}/>
                    </Box>
                  )}

                  {resource.getUserRole() === USER_TYPE.KURE_EMPLOYEE ? (
                    <>
                      <CartButtonsWidget paneIsOpen={open}/>
                      {cart && !cart.is_busy && <CartProductListWidget cart={cart} setCart={setCart}/>}
                    </>
                  ) : (
                    cart &&
                    !cart.is_busy && (
                      <>
                        <CartButtonsWidget paneIsOpen={open}/>
                        <CartProductListWidget cart={cart} setCart={setCart}/>
                      </>
                    )
                  )}

                  {can_show_drawer_info && virtual_product_count > 0 && (
                    <CartSummaryWidget cartTotals={cartTotals} cartReturnTotals={cartReturnTotals} cart={cart}/>
                  )}

                  {can_show_drawer_info && can_show_customers && (
                    <div
                      style={{
                        opacity: !method ? 1 : 0,
                        transition: 'opacity 0.5s ease-in-out'
                      }}
                    >
                      <Box sx={{ paddingBottom: '0px', display: !method ? 'block' : 'none' }}>
                        <CustomerSelectWidget/>
                      </Box>
                    </div>
                  )}

                  {can_show_drawer_info && can_show_customers && (
                    <Box sx={{ pt: '10px' }}>
                      {!cart.is_busy && resource.getUserRole() === USER_TYPE.KURE_EMPLOYEE && !processingUserProfileData && (
                        <SelectCustomerInfoWidget cart={cart} method={method}/>
                      )}
                    </Box>
                  )}

                  {is_logged_in ? (
                    <>
                      {can_show_drawer_info && (
                        <Box sx={{ paddingBottom: '33px' }}>
                          <CheckoutWidget
                            cart={cart}
                            setCartFreeze={setCartFreeze}
                            processingUserProfileData={processingUserProfileData}
                            cashierIdExists={cashierIdExists}
                            method={method}
                            setMethod={setMethod}
                            cartTotals={cartTotals}
                            cartReturnTotals={cartReturnTotals}
                          />
                        </Box>
                      )}
                    </>
                  ) : (
                    <DrawerAuth/>
                  )}
                </>
              )}
              <Box sx={{ paddingBottom: '53px' }}></Box>
              {cart && cart.order_items.length > 0 && (
                <>
                  <Typography>
                    <CancelOutlinedIcon color={'error'} fontSize={'small'}/>
                    *WARNING: Products sold here can expose you to chemicals including Δ9-Tetrahydrocannabinol (Δ9 -
                    THC), which are known
                    to the State of California to cause birth defects or other reproductive harm. For more information
                    go to:&nbsp;
                    <Link href="https://www.P65Warnings.ca.gov" underline="hover" sx={{ color: '#32BEB9' }}>
                      P65Warnings.ca.gov
                    </Link>
                  </Typography>
                </>
              )}
            </>
          )}
        </Box>
      </Drawer>
    </>
  );
}

export default DrawerCheckout;

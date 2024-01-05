import { Grid, Box, Button, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import SelectDeliveryAdrWidget from 'components/DrawerCheckout/SelectDeliveryAdrWidget';
import { DELIVERY_STATUS, USER_TYPE } from 'Common/constants';
import EditDeliveryAdrWidget from 'components/DrawerCheckout/EditDeliveryAdrWidget';
import AddInstructionWidget from 'components/DrawerCheckout/AddInstructionWidget';
import AddCouponWidget from 'components/DrawerCheckout/AddCouponWidget';
import DeliverCheckoutWidget from 'components/DrawerCheckout/DeliverCheckoutWidget';
import { Resource } from 'services/api_services/Resource';

import {
  SIG_ADDRESS_LIST_CHANGED,
  SIG_CASH_AMOUNT_PANEL,
  SIG_AUTH_CHANGED,
  SIG_CHANNEL,
  SIG_CHECKOUT_COMPLETE,
} from 'Common/signals';
import {
  getCalculatedCartReturnTotals,
  getCalculatedCartTotals,
  convertToNumber
} from 'Common/functions';
import DeliverCompleteWidget from 'components/DrawerCheckout/DeliverCompleteWidget';
import { refreshCart } from "services/idb_services/orderManager";

function CheckoutAddressDelivery(props) {
  const { onClickChooseMethod, onClickConfirmCheckout, profileData, cartInfo, can_submit } = props;
  const cartTotals = useMemo(() => getCalculatedCartTotals(cartInfo), [cartInfo]);
  const cartReturnTotals = useMemo(() => getCalculatedCartReturnTotals(cartInfo), [cartInfo]);
  const cashAmount = useMemo(() => {
    if (cartInfo != null && cartInfo.payment && cartInfo.payment != "") {
      return convertToNumber(cartInfo.payment);
    } else {
      return 0;
    }
  }, [cartInfo]);
  const total = convertToNumber(cartTotals.total, 0);
  const return_total = convertToNumber(cartReturnTotals.total, 0);
  const overpaid_amount = Math.round((cashAmount - total + return_total) * 100) / 100;
  const [deliveryStatus, setDeliveryStatus] = useState(DELIVERY_STATUS.SelectAddress);
  const resource = new Resource();

  const addressList = useMemo(() => {
    try {
      const customer_id = cartInfo.customer_id;
      // Maybe the customer was removed.
      if (customer_id == null) {
        return [];
      }
      const user_addresses = profileData[customer_id].user_addresses;
      // console.log("Sel Customer: ", profileData[customer_id])
      // await refreshCart();
      return user_addresses;
    } catch (err) {
      return [];
    }
  }, [deliveryStatus, profileData])

  useEffect(() => {
    const channel = new BroadcastChannel(SIG_CHANNEL);
    channel.addEventListener('message', async (event) => {
      switch (event.data.type) {
        case SIG_AUTH_CHANGED:
        case SIG_CHECKOUT_COMPLETE:
          setDeliveryStatus(DELIVERY_STATUS.SelectAddress);
          break;
        case SIG_CASH_AMOUNT_PANEL:
          setDeliveryStatus(DELIVERY_STATUS.Checkout);
          break;
      }
    });
  }, []);

  // useEffect(() => {
  //   //console.log("addressList: ", addressList);
  //   updateAddressList(address_list);
  // }, [address_list]);

  const onClickBack = () => {
    if (deliveryStatus.value === DELIVERY_STATUS.SelectAddress.value) {
      onClickChooseMethod();
    } else if (deliveryStatus.value === DELIVERY_STATUS.EditAddress.value || deliveryStatus.value === DELIVERY_STATUS.AddAddress.value) {
      setDeliveryStatus(DELIVERY_STATUS.SelectAddress);
    } else if (deliveryStatus.value === DELIVERY_STATUS.AddInstruction.value) {
      setDeliveryStatus(DELIVERY_STATUS.SelectAddress);
    } else if (deliveryStatus.value === DELIVERY_STATUS.AddCoupon.value) {
      setDeliveryStatus(DELIVERY_STATUS.AddInstruction);
    } else if (deliveryStatus.value === DELIVERY_STATUS.Checkout.value) {
      setDeliveryStatus(DELIVERY_STATUS.AddCoupon);
    } else if (deliveryStatus.value === DELIVERY_STATUS.Complete.value && resource.getUserRole() === USER_TYPE.CUSTOMER) {
      setDeliveryStatus(DELIVERY_STATUS.AddCoupon);
    } else if (deliveryStatus.value === DELIVERY_STATUS.Complete.value && resource.getUserRole() !== USER_TYPE.CUSTOMER) {
      setDeliveryStatus(DELIVERY_STATUS.Checkout);
      if (overpaid_amount == 0) {
        setDeliveryStatus(DELIVERY_STATUS.AddCoupon);
      } else {
        setDeliveryStatus(DELIVERY_STATUS.Checkout);
      }
    }
  };
  const onClickNext = () => {
    if (deliveryStatus.value === DELIVERY_STATUS.SelectAddress.value) {
      setDeliveryStatus(DELIVERY_STATUS.AddInstruction);
    } else if (deliveryStatus.value === DELIVERY_STATUS.EditAddress.value || deliveryStatus.value === DELIVERY_STATUS.AddAddress.value) {
      setDeliveryStatus(DELIVERY_STATUS.SelectAddress);
    } else if (deliveryStatus.value === DELIVERY_STATUS.AddInstruction.value) {
      setDeliveryStatus(DELIVERY_STATUS.AddCoupon);
    } else if (deliveryStatus.value === DELIVERY_STATUS.AddCoupon.value && resource.getUserRole() === USER_TYPE.CUSTOMER) {
      setDeliveryStatus(DELIVERY_STATUS.Complete);
    } else if (deliveryStatus.value === DELIVERY_STATUS.AddCoupon.value && resource.getUserRole() !== USER_TYPE.CUSTOMER) {
      if (overpaid_amount == 0) {
        setDeliveryStatus(DELIVERY_STATUS.Complete);
      } else {
        setDeliveryStatus(DELIVERY_STATUS.Checkout);
      }
    } else if (deliveryStatus.value === DELIVERY_STATUS.Checkout.value) {
      setDeliveryStatus(DELIVERY_STATUS.Complete);
    } else if (deliveryStatus.value === DELIVERY_STATUS.Complete.value) {
      // Checkout logic here.
      onClickConfirmCheckout();
    }
  };

  const onChangeAddress = async (address) => {
    // const address_object = {
    //   [address.profile_id]: {
    //     is_default: 1,
    //     phone: address.phone,
    //     /**
    //      * @TODO: This is a very bad idea, if something changes in the address object, we have to change it here too.
    //      */
    //     address: {
    //       "langcode": address.langcode,
    //       "country_code": address.country_code,
    //       "administrative_area": address.administrative_area,
    //       "locality": address.locality,
    //       "dependent_locality": address.dependent_locality,
    //       "postal_code": address.postal_code,
    //       "sorting_code": address.sorting_code,
    //       "address_line1": address.address_line1,
    //       "address_line2": address.address_line2,
    //       "organization": address.organization,
    //       "given_name": address.given_name,
    //       "additional_name": address.additional_name,
    //       "family_name": address.family_name,
    //     }
    //   }
    // };

    // // Before we merge our new/edited address, we ensure previous addresses are not set as default.
    // for (const key in addressList) {
    //   addressList[key].is_edit = false;
    // }

    // setAddressList(prevState => ({ ...prevState, ...address_object }));
  };


  return (
    <Box sx={{ pt: '5px' }}>
      <Grid container direction="row">
        <Grid item xs={10}>
          <Typography style={{ fontSize: 24, lineHeight: '24px' }}>{deliveryStatus.title}</Typography>
        </Grid>
        <Grid item xs={2} sx={{ textAlign: 'right' }}>
          <Button onClick={onClickBack} sx={{ color: '#32beb9', padding: "1px 10px" }}>
            <ArrowBackIosIcon />
            Back
          </Button>
        </Grid>
      </Grid>

      <Box sx={{ fontSize: 14, paddingLeft: "10px", pt: "5px" }}>
        <Typography >{deliveryStatus.sub_title}</Typography>
        {
          deliveryStatus.value === DELIVERY_STATUS.Complete.value && can_submit == false && <Box>
            <Typography sx={{ color: '#F84C4E' }}>
              The cash amount you input is not correct.
              Please correct the cash amount by clicking &quot;Back&quot; button.
            </Typography>
          </Box>
        }
      </Box>

      {deliveryStatus.value === DELIVERY_STATUS.SelectAddress.value && (
        <SelectDeliveryAdrWidget
          onClickNext={onClickNext}
          deliveryStatus={deliveryStatus}
          setDeliveryStatus={setDeliveryStatus}
          cartInfo={cartInfo}
          addressList={addressList}
        />
      )}

      {deliveryStatus.value === DELIVERY_STATUS.EditAddress.value && (
        <EditDeliveryAdrWidget
          onClickNext={onClickNext}
          onChangeAddress={onChangeAddress}
          setDeliveryStatus={setDeliveryStatus}
          addressList={addressList}
        />
      )}

      {deliveryStatus.value === DELIVERY_STATUS.AddAddress.value && (
        <EditDeliveryAdrWidget
          onClickNext={onClickNext}
          onChangeAddress={onChangeAddress}
          setDeliveryStatus={setDeliveryStatus}
          addressList={[]}
        />
      )}

      {deliveryStatus.value === DELIVERY_STATUS.AddInstruction.value && (
        <>
          <AddInstructionWidget
            onClickNext={onClickNext}
            deliveryStatus={deliveryStatus}
          />
        </>
      )}

      {deliveryStatus.value === DELIVERY_STATUS.AddCoupon.value && (
        <>
          <AddCouponWidget
            cartInfo={cartInfo}
            onClickNext={onClickNext}
            orderStatus={deliveryStatus}
          />
        </>
      )}

      {deliveryStatus.value === DELIVERY_STATUS.Checkout.value && (
        <>
          <DeliverCheckoutWidget
            onClickNext={onClickNext}
            deliveryStatus={deliveryStatus}
            cartInfo={cartInfo}
          />
        </>
      )}

      {deliveryStatus.value === DELIVERY_STATUS.Complete.value && (
        <>
          <DeliverCompleteWidget
            onClickNext={onClickNext}
            deliveryStatus={deliveryStatus}
            can_submit={can_submit}
          />
        </>
      )}
    </Box>
  );
}

export default CheckoutAddressDelivery;

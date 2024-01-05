import { Box, Button, Grid, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { PICKUP_STATUS, USER_TYPE } from 'Common/constants';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { KureDatabase } from 'services/idb_services/KureDatabase';
import SelectPickupStoreWidget from 'components/DrawerCheckout/SelectPickupStoreWidget';
import AddCouponWidget from 'components/DrawerCheckout/AddCouponWidget';
import PickupCheckoutWidget from 'components/DrawerCheckout/PickupCheckoutWidget';
import { Resource } from 'services/api_services/Resource';
import {
  SIG_AUTH_CHANGED,
  SIG_CHANNEL,
  SIG_CHECKOUT_COMPLETE,
} from 'Common/signals';
import { getStoreId } from 'services/storage_services/storage_functions';
import { broadcastMessage } from 'Common/functions';
import PickupCompleteWidget from 'components/DrawerCheckout/PickupCompleteWidget';

const db = new KureDatabase();

function CheckoutAddressPickup(props) {
  const { onClickChooseMethod, onClickConfirmCheckout, cartInfo, can_submit } = props;
  const [pickUpStatus, setPickUpStatus] = useState(PICKUP_STATUS.SelectStore);
  const [pickUpInfo, setPickUpInfo] = useState({});
  const [validStoreList, setValidStoreList] = useState([]);
  const storeId = getStoreId();
  const resource = new Resource();

  useEffect(() => {
    onChangedStoreId(storeId);
  }, [storeId]);
  useEffect(() => {
    const channel = new BroadcastChannel(SIG_CHANNEL);
    channel.addEventListener('message', (event) => {
      switch (event.data.type) {
        case SIG_AUTH_CHANGED:
        case SIG_CHECKOUT_COMPLETE:
          setPickUpStatus(PICKUP_STATUS.SelectStore);
          break;
      }
    });

  }, []);

  const onChangedStoreId = (store_id) => {
    db.storeData().get(`${store_id}`).then((data) => {
      if (data === undefined) return;
      setValidStoreList([data]);
    });
  };

  const onClickBack = () => {
    if (pickUpStatus.value === PICKUP_STATUS.SelectStore.value) {
      onClickChooseMethod();
    } else if (pickUpStatus.value === PICKUP_STATUS.AddCoupon.value) {
      setPickUpStatus(PICKUP_STATUS.SelectStore);
    } else if (pickUpStatus.value === PICKUP_STATUS.Checkout.value) {
      setPickUpStatus(PICKUP_STATUS.AddCoupon);
    } else if (pickUpStatus.value === PICKUP_STATUS.Complete.value && resource.getUserRole() === USER_TYPE.CUSTOMER) {
      setPickUpStatus(PICKUP_STATUS.AddCoupon);
    } else if (pickUpStatus.value === PICKUP_STATUS.Complete.value && resource.getUserRole() !== USER_TYPE.CUSTOMER) {
      setPickUpStatus(PICKUP_STATUS.Checkout);
      if (can_submit) {
        setPickUpStatus(PICKUP_STATUS.AddCoupon);
      } else {
        setPickUpStatus(PICKUP_STATUS.Checkout);
      }
    }
    // switch (pickUpStatus.value) {
    //   case PICKUP_STATUS.SelectStore.value:
    //     onClickChooseMethod();
    //     break;
    //   case PICKUP_STATUS.AddCoupon.value:
    //     setPickUpStatus(PICKUP_STATUS.SelectStore);
    //     break;
    //   case PICKUP_STATUS.Checkout.value:
    //     setPickUpStatus(PICKUP_STATUS.AddCoupon);
    //     break;
    //   case PICKUP_STATUS.Complete.value:
    //     setPickUpStatus(PICKUP_STATUS.Checkout);
    //     break;
    //   default:
    //     // Handle other cases or do nothing
    //     break;
    // }
  };

  const onClickNext = () => {
    if (pickUpStatus.value === PICKUP_STATUS.SelectStore.value) {
      setPickUpStatus(PICKUP_STATUS.AddCoupon);
    } else if (pickUpStatus.value === PICKUP_STATUS.AddCoupon.value && resource.getUserRole() === USER_TYPE.CUSTOMER) {
      setPickUpStatus(PICKUP_STATUS.Complete);
    } else if (pickUpStatus.value === PICKUP_STATUS.AddCoupon.value && resource.getUserRole() !== USER_TYPE.CUSTOMER) {
      if (can_submit) {
        setPickUpStatus(PICKUP_STATUS.Complete);
      } else {
        setPickUpStatus(PICKUP_STATUS.Checkout);
      }
    } else if (pickUpStatus.value === PICKUP_STATUS.Checkout.value) {
      setPickUpStatus(PICKUP_STATUS.Complete);
    } else if (pickUpStatus.value === PICKUP_STATUS.Complete.value) {
      onClickConfirmCheckout();
    }
    // switch (pickUpStatus.value) {
    //   case PICKUP_STATUS.SelectStore.value:
    //     setPickUpStatus(PICKUP_STATUS.AddCoupon);
    //     break;
    //   case PICKUP_STATUS.AddCoupon.value && resource.getUserRole() === USER_TYPE.CUSTOMER:

    //     setPickUpStatus(PICKUP_STATUS.Complete);
    //     break;
    //   case PICKUP_STATUS.AddCoupon.value && resource.getUserRole() !== USER_TYPE.CUSTOMER:
    //     setPickUpStatus(PICKUP_STATUS.Checkout);
    //     break;
    //   case PICKUP_STATUS.Checkout.value:
    //     setPickUpStatus(PICKUP_STATUS.Complete);
    //     break;
    //   case PICKUP_STATUS.Complete.value:
    //     onClickConfirmCheckout();
    //     break;
    //   default:
    //     // Handle other cases or do nothing
    //     break;
    // }
  };

  if (validStoreList.length === 0) {
    return <div style={{ textAlign: 'center' }}>No valid stores</div>;
  }
  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={10}>
          <Typography variant={'h3'}>{pickUpStatus.title}</Typography>
        </Grid>
        <Grid item xs={2} sx={{ textAlign: 'right' }}>
          <Button onClick={onClickBack} sx={{ color: '#32beb9' }}>
            <ArrowBackIosIcon />
            Back
          </Button>
        </Grid>
      </Grid>

      <Box sx={{ fontSize: 14, paddingLeft: "10px", paddingTop: 0 }}>
        <Typography >{pickUpStatus.sub_title}</Typography>
        {
          pickUpStatus.value === PICKUP_STATUS.Complete.value && can_submit == false && <Box>
            <Typography sx={{ color: '#F84C4E' }}>
              The cash amount you input is not correct.
              Please correct the cash amount by clicking &quot;Back&quot; button.
            </Typography>
          </Box>
        }
      </Box>
      {pickUpStatus.value === PICKUP_STATUS.SelectStore.value && (
        <>
          <SelectPickupStoreWidget
            onClickNext={onClickNext}
            pickupStatus={pickUpStatus}
            cartInfo={cartInfo}
            storeList={validStoreList}
          />
        </>
      )}
      {pickUpStatus.value === PICKUP_STATUS.AddCoupon.value && (
        <>
          <AddCouponWidget
            onClickNext={onClickNext}
            orderStatus={pickUpStatus}
            cartInfo={cartInfo}
          />
        </>
      )}
      {pickUpStatus.value === PICKUP_STATUS.Checkout.value && (
        <>
          <PickupCheckoutWidget
            onClickNext={onClickNext}
            pickupStatus={pickUpStatus}
            cartInfo={cartInfo}
          />
        </>
      )}
      {pickUpStatus.value === PICKUP_STATUS.Complete.value && (
        <>
          <PickupCompleteWidget
            onClickNext={onClickNext}
            pickupStatus={pickUpStatus}
            can_submit={can_submit}
          />
        </>
      )}
    </Box>
  );
}

export default CheckoutAddressPickup;

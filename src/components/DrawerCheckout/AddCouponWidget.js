import React, { useContext, useState } from 'react';
import { Box, Grid, Button, OutlinedInput } from '@mui/material';
import { CouponDataContext } from 'services/context_services/couponDataContext';
import { customToast } from 'components/CustomToast/CustomToast';
import { broadcastMessage } from 'Common/functions';
import { SIG_APPLY_COUPON, } from 'Common/signals';
import { modifyCart } from 'services/idb_services/orderManager';
import { CART_STATUS } from 'Common/constants';

const AddCouponWidget = (props) => {
  const couponData = useContext(CouponDataContext);
  const { onClickNext, orderStatus, cartInfo } = props;
  const [coupon, setCoupon] = useState(cartInfo['coupon_info'] === undefined ? '' : cartInfo['coupon_info']['coupon_details']['coupon_code']);
  console.log("coupon: ", coupon)
  const [isWrong, setIsWrong] = useState(false);
  const is_completed = cartInfo.state == CART_STATUS.COMPLETED
  const onClickDoProcess = async () => {
    const selCoupon = couponData.find((x) => x['coupon_details']['coupon_code'] == coupon);
    if (selCoupon == undefined) {
      customToast.warn("The coupon code is incorrect.");
      setIsWrong(true);
      return;
    }
    await modifyCart({
      coupon: coupon,
      coupon_info: selCoupon
    })
    onClickNext();
  };
  const onClickSkip = async () => {
    if (!is_completed) {
      await modifyCart({
        coupon: '',
        coupon_info: undefined
      })
    }
    onClickNext();
  }

  return (
    <div style={{ marginTop: 10 }}>
      <OutlinedInput
        fullWidth
        value={coupon}
        placeholder={'Add your coupon code here'}
        sx={{ background: '#FFF' }}
        onChange={(e) => {
          setCoupon(e.target.value);
          if (isWrong == true) {
            setIsWrong(false)
          }
        }}
        disabled={is_completed}
      />
      {
        isWrong && <div style={{ textAlign: 'right', color: 'var(--error)' }}>
          The coupon code is incorrect. Try again or skip.
        </div>
      }
      <Button
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
        {orderStatus['next_button'].toUpperCase()}
      </Button>
      {orderStatus['skip_button'] !== null && (
        <Button
          onClick={onClickSkip}
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
          {orderStatus['skip_button'].toUpperCase()}
        </Button>
      )}
    </div>
  );
};

export default AddCouponWidget;

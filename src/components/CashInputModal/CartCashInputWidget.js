import { broadcastMessage, convertToNumber, getCalculatedCartTotals } from 'Common/functions';
import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import CashNumpadWidget from './CashNumpadWidget';
import { CART_STATUS } from 'Common/constants';

const CartCashInputWidget = (props) => {
  const { cartInfo, onSubmitValue, buttonText } = props;
  const [cartTotals, setCartTotals] = useState({});
  const [cartReturnTotals, setCartReturnTotals] = useState({});
  const is_completed = cartInfo.state == CART_STATUS.COMPLETED
  useEffect(() => {
    if (cartInfo == null) {
      return;
    }
    const total_info = getCalculatedCartTotals(cartInfo);
    setCartTotals(total_info);

    const return_total_info = getCalculatedCartTotals(cartInfo, true);
    setCartReturnTotals(return_total_info);
    // console.log("total_info: ", total_info)
    // if (convertToNumber(total_info.total) == 0) {
    //     onSubmitValue(0);
    // }
  }, [cartInfo]);

  const onClickSubmit = (v) => {
    onSubmitValue(v);
  }

  const safelyGetTotal = (obj) => {
    return obj && typeof obj.total !== 'undefined' ? parseFloat(obj.total) : 0;
  };

  // console.log("cartTotals: ", cartTotals);
  const initValue = (cartInfo.payment && cartInfo.payment != "") ? cartInfo.payment : safelyGetTotal(cartTotals) - safelyGetTotal(cartReturnTotals);

  return (
    <CashNumpadWidget
      minVal={Math.round((safelyGetTotal(cartTotals) - safelyGetTotal(cartReturnTotals)) * 100) / 100}
      initVal={Math.round((initValue) * 100) / 100}
      onSubmitValue={onClickSubmit}
      buttonText={buttonText}
      is_completed={is_completed}
    />
  );

};

export default CartCashInputWidget;
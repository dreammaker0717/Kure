import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Grid,
  Divider
} from '@mui/material';
import { convertToNumber, getCalculatedCartTotals, monetizeToLocal } from 'Common/functions';
import { SIG_CHANNEL, SIG_CHECKOUT_PREPARE, } from 'Common/signals';
import { USER_TYPE } from 'Common/constants';
import { cashAmountPanel } from "../../../../services/idb_services/orderManager"
import { Resource } from 'services/api_services/Resource';

const OneSummaryItem = (props) => {
  const { title, value, sx, onClick } = props;
  const style = {
    position: 'relative',
    zIndex: 9999,
    cursor: 'pointer'
  };

  return <Grid container direction={'row'} justifyContent={'space-between'}
    sx={sx ? sx : {}}
    spacing={2}
    style={title === "Cash Amount" ? style : undefined}
    onClick={onClick}
  >
    <Grid item
      xs={9.5}
      sx={{
        // maxWidth:"250px",
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {title}
    </Grid>
    <Grid item xs={2.5} style={{ textAlign: 'right' }}>
      {value}
    </Grid>
  </Grid>
}

const CartSummaryWidget = (props) => {
  const { cart, cartTotals, cartReturnTotals } = props;
  const resource = new Resource();
  const cashAmount = useMemo(() => {
    if (cart != null && cart.payment && cart.payment != "") {
      return convertToNumber(cart.payment);
    } else {
      return 0;
    }
  }, [cart]);

  if (cart == null) {
    return <></>
  }
  const is_customer = resource.getUserRole() === USER_TYPE.CUSTOMER ? true : false;

  const total = convertToNumber(cartTotals.total, 0);
  const return_total = convertToNumber(cartReturnTotals.total, 0);
  const overpaid_amount = Math.round((cashAmount - total + return_total) * 100) / 100;
  // const return_total = convertToNumber(cartTotals.return_total, 0);
  // console.log("cashAmount: ", cashAmount);
  // console.log("total: ", total);
  // console.log("overpaid_amount: ", overpaid_amount);

  const cashAmountPrompt = async () => {
    await cashAmountPanel();
  }

  return (
    <>
      {total > 0 && (
        <Box sx={{ pt: '18px' }}>
          {is_customer && <OneSummaryItem
            title={"Order Type: "}
            value={cart.type ? cart.type.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase()) : 'Delivery'}
            sx={{ py: "5px" }}
          />}
          <Box sx={{ fontWeight: "bold", fontSize: "18px" }}>Purchasing:</Box>
          <Box sx={{ pl: "10px" }}>
            <OneSummaryItem
              title={"Subtotal"}
              value={monetizeToLocal(cartTotals.subtotal)}
              sx={{ py: "5px" }}
            />

            {cartTotals.adjustments.map((adjustment, index) => (
              <OneSummaryItem
                key={index}
                title={adjustment.label}
                value={monetizeToLocal(adjustment.value)}
                sx={{ py: "3px" }}
              />
            ))}

            <OneSummaryItem
              title={"Total"}
              value={monetizeToLocal(cartTotals.total)}
              sx={{ py: "5px" }}
            />
            <Divider sx={{ borderColor: "gray" }} />
          </Box>
        </Box>
      )}
      {return_total > 0 && (
        <Box sx={{ pt: '18px' }}>
          <Box sx={{ fontWeight: "bold", fontSize: "18px" }}>Returning:</Box>
          <Box sx={{ pl: "10px" }}>
            <OneSummaryItem
              title={"Subtotal"}
              value={monetizeToLocal(cartReturnTotals.subtotal)}
              sx={{ py: "5px" }}
            />

            {cartReturnTotals.adjustments.map((taxItem) => (
              <OneSummaryItem
                key={taxItem.label}
                title={taxItem.label}
                value={monetizeToLocal(taxItem.value)}
                sx={{ py: "3px" }}
              />
            ))}

            <OneSummaryItem
              title={"Total"}
              value={monetizeToLocal(cartReturnTotals.total)}
              sx={{ py: "5px" }}
            />
            <Divider sx={{ borderColor: "gray" }} />
          </Box>
        </Box>
      )}
      <Box sx={{ mt: '16px' }}>


        <OneSummaryItem
          title={"Total"}
          value={monetizeToLocal(total - return_total)}
          sx={{ color: '#32BEB9', py: '0px', fontSize: "16px" }}
        />

        {
          (cart != null && cart.payment && cart.payment != "") &&
          <OneSummaryItem
            onClick={cashAmountPrompt}
            title={"Cash Amount"}
            value={monetizeToLocal(convertToNumber(cart.payment, 0))}
            sx={{ color: '#32BEB9', py: '0px', fontSize: "16px" }}
          />
        }

        {/* {(overpaid_amount > 0) && */}
        {(cart != null && cart.payment && cart.payment != "") &&

          <OneSummaryItem
            title={"Change"}
            value={monetizeToLocal(overpaid_amount)}
            sx={{ color: '#32BEB9', py: '0px', fontSize: "16px" }}
          />
        }
      </Box>
      {/* <Divider sx={{ borderColor: "gray" }} /> */}
    </>
  );
}

export default CartSummaryWidget;
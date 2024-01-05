import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Typography, Card, CardContent, Box, Divider, Grid, } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { UsersProfileContext } from 'services/context_services/usersProfileContext';
import { convertToNumber, monetizeToLocal, getCalculatedCartReturnTotals, getCalculatedCartTotals } from 'Common/functions';
import { Resource } from 'services/api_services/Resource';
import { USER_TYPE } from 'Common/constants';
import CartProductListWidget from './DrawerCheckoutWidgets/CartProductListWidget';

const useStyles = makeStyles((theme) => ({
  card: {
    margin: '20px 0',
    overflow: 'visible !important',
    backgroundColor: "#272727",
  },
  title: {
    color: "#ffffff",
  },
  bodyText: {
    color: theme.palette.text.secondary,
  },
  strongText: {
    color: theme.palette.text.primary,
    fontWeight: 'bold',
  },
}));

const OneSummaryItem = (props) => {
  const { title, value, sx } = props;
  return <Grid container direction={'row'} justifyContent={'space-between'}
    sx={sx ? sx : {}}
    spacing={2}
  >
    <Grid item
      xs={9.5}
      sx={{
        // maxWidth:"250px",
        color: "#ffffff",
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {title}
    </Grid>
    <Grid item xs={2.5} style={{ textAlign: 'right', color: "#ffffff" }}>
      {value}
    </Grid>
  </Grid>
}

function SyncedOrderNotice({ submitTempData }) {
  const classes = useStyles();
  const resource = new Resource();
  const [tempCart, setTempCart] = useState(submitTempData);
  const { profileData } = useContext(UsersProfileContext);
  const cartTotals = useMemo(() => getCalculatedCartTotals(tempCart), [tempCart]);
  const cartReturnTotals = useMemo(() => getCalculatedCartReturnTotals(tempCart), [tempCart]);
  const cashAmount = useMemo(() => {
    if (tempCart != null && tempCart.payment && tempCart.payment != "") {
      return convertToNumber(tempCart.payment);
    } else {
      return 0;
    }
  }, [tempCart]);
  const total = convertToNumber(cartTotals.total, 0);
  const return_total = convertToNumber(cartReturnTotals.total, 0);
  const overpaid_amount = Math.round((cashAmount - total + return_total) * 100) / 100;
  const is_customer = resource.getUserRole() === USER_TYPE.CUSTOMER ? false : true;

  const getProfileById = (profile_id) => {
    const profile = profileData[profile_id];
    if (profile == undefined) return "";
    return profile['name']
  }

  return (
    <Card className={classes.card}>
      <CardContent>
        <Box marginBottom={2}>
          <Typography variant="h5" component="h2" className={classes.title} gutterBottom>
            Your order #{submitTempData.order_id}
          </Typography>
          {/* <Typography variant="body1" className={classes.bodyText} gutterBottom>
            Store Name: {submitTempData.data.store_name} <br />
            Store Address: {submitTempData.data.store_address} <br />
            Phone Number: {submitTempData.data.store_phone}
          </Typography> */}
        </Box>
        <Box>
          {/* {is_customer && <Typography variant="body1" className={classes.bodyText} gutterBottom>
            Sent to: {tempCart.customer_id ? getProfileById(tempCart.customer_id) : 'N/A'}
          </Typography>} */}
          <CartProductListWidget
            cart={tempCart}
            is_disabled={true}
            color={"white"}
          />
          {total > 0 && (
            <Box sx={{ pt: '18px' }}>
              {<OneSummaryItem
                title={"Order Type: "}
                value={tempCart.type ? tempCart.type.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase()) : 'Delivery'}
                sx={{ py: "3px", pl: "10px" }}
              />}
              <Box sx={{ fontWeight: "bold", fontSize: "18px", pl: "10px" }}>Purchasing:</Box>
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
              sx={{ py: "3px", pl: "10px" }}
            />
            {
              (tempCart != null && tempCart.payment && tempCart.payment != "") &&
              <OneSummaryItem
                title={"Cash Amount"}
                value={monetizeToLocal(convertToNumber(tempCart.payment, 0))}
                sx={{ py: "3px", pl: "10px" }}
              />
            }
            {/* {(overpaid_amount > 0) && */}
            {(tempCart != null && tempCart.payment && tempCart.payment != "") &&
              <OneSummaryItem
                title={"Change"}
                value={monetizeToLocal(overpaid_amount)}
                sx={{ py: "3px", pl: "10px" }}
              />
            }
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default SyncedOrderNotice;

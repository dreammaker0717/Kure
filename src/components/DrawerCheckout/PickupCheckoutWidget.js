import React, { useEffect, useState } from 'react';
import { Box, Grid, Button, OutlinedInput } from '@mui/material';
import CashNumpadWidget from 'components/CashInputModal/CashNumpadWidget';
import { addOverPaid, modifyCart } from 'services/idb_services/orderManager';
import CartCashInputWidget from 'components/CashInputModal/CartCashInputWidget';

const PickupCheckoutWidget = (props) => {
    const { onClickNext, pickupStatus, cartInfo } = props;

    const onSubmitValue = async (v) => {
        await modifyCart({
            payment: v
        })
        onClickNext();
    }

    return (
        <div style={{ marginTop: 10 }}>
            <CartCashInputWidget
                cartInfo={cartInfo}
                onSubmitValue={onSubmitValue}
                buttonText={pickupStatus['next_button'].toUpperCase()}
            />

            {pickupStatus['skip_button'] !== null && (
                <Button
                    onClick={() => {
                        onClickNext();
                    }}
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
                    {pickupStatus['skip_button'].toUpperCase()}
                </Button>
            )}
        </div>
    );
};

export default PickupCheckoutWidget;

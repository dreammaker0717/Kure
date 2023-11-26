import React, { useState } from 'react';
import { Box, Grid, Button, OutlinedInput } from '@mui/material';
import CashNumpadWidget from 'components/CashInputModal/CashNumpadWidget';
import CartCashInputWidget from 'components/CashInputModal/CartCashInputWidget';
import { modifyCart } from 'services/idb_services/orderManager';

const DeliverCheckoutWidget = (props) => {
    const { onClickNext, deliveryStatus, cartInfo } = props;

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
                buttonText={deliveryStatus['next_button'].toUpperCase()}
            />

            {deliveryStatus['skip_button'] !== null && (
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
                    {deliveryStatus['skip_button'].toUpperCase()}
                </Button>
            )}
        </div>
    );
};

export default DeliverCheckoutWidget;

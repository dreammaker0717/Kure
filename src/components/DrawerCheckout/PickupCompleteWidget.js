import React, { useEffect, useState } from 'react';
import { Box, Grid, Button, OutlinedInput } from '@mui/material';
import { Resource } from 'services/api_services/Resource';
import { USER_TYPE } from 'Common/constants';
const resource = new Resource();
const PickupCompleteWidget = (props) => {
    const { onClickNext, pickupStatus, can_submit } = props;

    console.log('can_submit: ', can_submit)
    const onClickDoProcess = () => {
        if (!can_submit) return;
        onClickNext();
    };
    return (
        <div style={{ marginTop: 10 }}>
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
                disabled={!can_submit}
            >
                {resource.getUserRole() === USER_TYPE.KURE_EMPLOYEE
                    ? pickupStatus['next_button']
                    : "SUBMIT ORDER NOW"}
            </Button>
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

export default PickupCompleteWidget;
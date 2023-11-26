import React, { useState } from 'react';
import { Box, Grid, Button, OutlinedInput } from '@mui/material';
import { Resource } from 'services/api_services/Resource';
import { USER_TYPE } from 'Common/constants';
const resource = new Resource();
const DeliverCompleteWidget = (props) => {
    const { onClickNext, deliveryStatus, can_submit } = props;
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
                    ? deliveryStatus['next_button']
                    : "SUBMIT ORDER NOW"}

            </Button>
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

export default DeliverCompleteWidget;
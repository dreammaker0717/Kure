import React, { useEffect, useState } from 'react';
import { Box, Grid, Button } from '@mui/material';
import { modifyCart } from 'services/idb_services/orderManager';
import { CART_STATUS } from 'Common/constants';

const SelectPickupStoreWidget = (props) => {
    const { onClickNext, pickupStatus } = props;
    const { cartInfo, storeList } = props;
    const is_completed = cartInfo.state == CART_STATUS.COMPLETED
    const onChangeStore = (event) => {
        const selStore = storeList.find((x) => x.store_id == event.target.value);
        modifyCart({
            store: { ...selStore }
        })
    };
    const onClickDoProcess = () => {
        onClickNext();
    };
    useEffect(() => {
        modifyCart({
            store: storeList[0]
        });
    }, [storeList]);
    return (
        <div style={{ marginTop: 10 }}>
            {storeList.length === 1 ? (
                <div
                    style={{
                        background: '#373636',
                        border: '1px solid #A8A8A8',
                        fontSize: { xs: '1rem', sm: '1.5rem' },
                        color: '#f7f7f7',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        padding: '8px',
                        width: '100%'
                    }}
                >
                    {storeList[0]['name']}
                </div>
            ) : (
                <select
                    value={cartInfo['store'] === undefined ? '' : cartInfo['store']['store_id']}
                    onChange={onChangeStore}
                    style={{
                        background: '#373636',
                        border: '1px solid #A8A8A8',
                        fontSize: { xs: '1rem', sm: '1.5rem' },
                        color: '#f7f7f7',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        padding: '8px',
                        width: '100%'
                    }}
                    disabled={is_completed}
                >
                    {storeList.map((info) => {
                        return (
                            <option value={info['store_id']} key={`pickup-store-${info['store_id']}`}>
                                {info['name']}
                            </option>
                        );
                    })}
                </select>
            )}
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
                {pickupStatus['next_button'].toUpperCase()}
            </Button>
            {pickupStatus['skip_button'] !== null && (
                <Button
                    onClick={onClickNext}
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

export default SelectPickupStoreWidget;

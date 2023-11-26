import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { Stack } from '@mui/material'
const CartDrupalSyncWidget = (props) => {
    const { cart } = props;
    return (
        <Stack sx={{pl:"20px"}} direction="row" alignItems={"center"} spacing={1}>
            <div>
                <CircularProgress />
            </div>
            <div> We're preparing to send your order in a few seconds...
            </div>
        </Stack>
    );
};

export default CartDrupalSyncWidget;
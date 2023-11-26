import React, { useEffect, useState } from 'react';
import { Fab, Badge, Popper, Fade, Paper, Typography } from '@mui/material';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import OrderListWidget from 'components/OrderListWidget/OrderListWidget';
import { fakeOrders } from 'services/idb_services/fakeData/fakeOrders';
import { SIG_CHANNEL, SIG_ORDER_LIST_CHANGED } from 'Common/signals';

const fabShoppingStyle = {
    color: 'white',
    bgcolor: "#2490F1",
    '&:hover': {
        bgcolor: "#1480E1",
    },
};

const OrderListButton = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [open, setOpen] = useState(false);
    const [orderCount, setOrderCount] = useState(0);
    const [orderList, setOrderList] = useState([]);
    const onClickOrderListButton = (event) => {
        setAnchorEl(event.currentTarget);
        setOpen((prev) => !prev);
    };
    useEffect(() => {
        const channel = new BroadcastChannel(SIG_CHANNEL);
        channel.addEventListener('message', async (event) => {
            const { type, data } = event.data;
            switch (type) {
                case SIG_ORDER_LIST_CHANGED:
                    const { count, order_data } = data;
                    setOrderCount(count);
                    setOrderList(order_data);
                    break;
            }
        });
    }, []);
    // console.log("orderList:",orderList)
    return (
        <Fab
            aria-label="add"
            sx={{ ...fabShoppingStyle }}
            size="small"
            onClick={(e) => {
                onClickOrderListButton(e);
            }}
        >
            <Badge
                badgeContent={orderCount}
                color='error'
            >
                <Popper
                    open={open}
                    anchorEl={anchorEl}
                    placement="top-end"
                    transition
                >
                    {({ TransitionProps }) => (
                        <Fade {...TransitionProps} timeout={350}>
                            <Paper sx={{
                                p: "10px",
                                borderRadius: "5px",
                                minWidth: "400px",
                                minHeight: "200px"
                            }}>
                                <OrderListWidget
                                    orderList={orderList}
                                />
                            </Paper>
                        </Fade>
                    )}
                </Popper>
                <ShoppingBasketIcon />
            </Badge>
        </Fab>
    );
};

export default OrderListButton;
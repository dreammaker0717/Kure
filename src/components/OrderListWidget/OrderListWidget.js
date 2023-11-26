import React from 'react';
import { Divider, Box } from '@mui/material';

const OrderListWidget = (props) => {
    const { orderList } = props;
    const processing_list = orderList.filter(x => x.order_state == "processing");
    const pending_list = orderList.filter(x => x.order_state == "pending");
    const need_payment_list = orderList.filter(x => x.order_state == "need_payment");

    const onClickOrder = (order_info) => {
        console.log('order info: ', order_info);
    }
    return (
        <div>
            <div>
                <div><strong>Orders</strong> (needing processing)</div>
                {processing_list.map(info => {
                    return <div key={`processing_list-${info['id']}`}>
                        <Box
                            className='custom-button'
                            style={{ textDecoration: 'underline' }}
                            onClick={() => onClickOrder(info)}
                        >
                            #{info['id']}
                        </Box>
                    </div>
                })}
                <Divider />
            </div>

            <div>
                <div><strong>Orders</strong> (needing payment)</div>
                {need_payment_list.map(info => {
                    return <div key={`need_payment_list-${info['id']}`}>
                        <Box
                            className='custom-button'
                            style={{ textDecoration: 'underline' }}
                            onClick={() => onClickOrder(info)}
                        >
                            #{info['id']}
                        </Box>
                    </div>
                })}
                <Divider />
            </div>


            <div>
                <div><strong>Orders</strong> (pending)</div>
                {pending_list.map(info => {
                    return <div key={`pending_list-${info['id']}`}>
                        <Box
                            className='custom-button'
                            style={{ textDecoration: 'underline' }}
                            onClick={() => onClickOrder(info)}
                        >
                            #{info['id']}
                        </Box>
                    </div>
                })}
                <Divider />
            </div>

        </div>
    );
};

export default OrderListWidget;
import React from 'react';
import CartProductListWidget from './CartProductListWidget';
import CartSummaryWidget from './CartSummaryWidget';
import SelectCustomerInfoWidget from './SelectCustomerInfoWidget';
import { Box, Button, Typography } from '@mui/material';
import { createCart, postOrderMessage } from 'services/idb_services/orderManager';
import { CommonDataIndex, useCommonData } from 'services/context_services/commonDataContext';
import { getAddressString } from 'Common/functions';
const CompletedCartWidget = (props) => {
    const { cart, cartReturnTotals, cartTotals } = props;
    const { values: commonData } = useCommonData();
    const createNewOrder = async () => {
        const new_cart = await createCart();
        postOrderMessage(new_cart.data);
    }
    const store_info = commonData[CommonDataIndex.STORES].find(x => x.store_id == cart.store_id);
    const store_address = getAddressString(store_info);
    // console.log("compled cart: ", cart)
    return (
        <div>
            <Box sx={{ textAlign: "right" }}>
                <Button
                    onClick={createNewOrder}
                    variant="outlined"
                    color="warning"
                    sx={{
                        color: 'white',
                        border: '1px solid',
                    }}
                >
                    Create new order
                </Button>
            </Box>

            <Box sx={{ mt: "20px" }}>
                <Typography variant={'h2'} sx={{ fontSize: { xs: "16px", md: '20px' }, }}>
                    The {cart.type.replace("_", " ")} order #{cart.order_id} [{store_info.store_name} {store_address}] has been completed.
                </Typography>
            </Box>

            <Box sx={{ mb: "5px", mt: "20px", fontSize: "20px" }}>Products</Box>
            <Box sx={{ ml: "10px" }}>
                <CartProductListWidget
                    cart={cart}
                    is_disabled={true}
                />
            </Box>

            <Box sx={{ mb: "5px", mt: "20px", fontSize: "20px" }}>Purchase Summary:</Box>
            <Box sx={{ ml: "20px" }}>
                <CartSummaryWidget
                    cart={cart}
                    cartReturnTotals={cartReturnTotals}
                    cartTotals={cartTotals}
                />
            </Box>

            {cart['customer_id'] &&
                <>
                    <Box sx={{ mb: "5px", mt: "20px", fontSize: "20px" }}>The cart owner</Box>
                    <Box sx={{ ml: "10px" }}>
                        <Box>
                            <SelectCustomerInfoWidget
                                cart={cart}
                                method={cart.method}
                                is_disabled={true}
                            />
                        </Box>
                    </Box>
                </>
            }

            {(cart['coupon'] || cart['instructions']) &&
                <>
                    <Box sx={{ mb: "5px", mt: "20px", fontSize: "20px" }}>The order detail</Box>
                    <Box sx={{ ml: "10px" }}>
                        {cart['coupon'] &&
                            <Typography className="text-size-h6">
                                <strong>Coupon Used: </strong> {cart['coupon']}
                            </Typography>
                        }
                        {cart['instructions'] &&
                            <Typography className="text-size-h6">
                                <strong>Delivery Instruction: </strong> {cart['instructions']}
                            </Typography>
                        }
                    </Box>
                </>
            }
        </div>
    );
};

export default CompletedCartWidget;
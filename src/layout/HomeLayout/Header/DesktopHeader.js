import React from 'react';
import { Box } from '@mui/material';
import LogoWidget from './LogoWidget/LogoWidget';
import MenuWidget from './MenuWidget/MenuWidget';
import { KureDatabase } from 'services/idb_services/KureDatabase';

const db = new KureDatabase();
const DesktopHeader = () => {

    return (
        <Box
            sx={{
                height: { sm: '166px', md: '120px', lg: '145px' },
                m: '15px',
                display: 'flex',
                position: 'relative',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexDirection: { xs: 'row' }
            }}
        >
            <LogoWidget />
            {/* <button onClick={async () => {
                // make completed order
                const test = await db.get("553197", IDB_TABLES.commerce_order);
                test.state = CART_STATUS.COMPLETED;
                await db.put([test], IDB_TABLES.commerce_order);

                // delete not valid orders
                const cart_list = await db.getAll(IDB_TABLES.commerce_order);
                let no_valid = [];
                for (let i = 0; i < cart_list.length; i++) {
                    if (cart_list[i].type != null && cart_list[i].type != CHECKOUT_TYPE.DELIVERY && cart_list[i].type != CHECKOUT_TYPE.PICK_UP) {
                        no_valid.push(cart_list[i]);
                    }
                }
                await db.deleteAllByIdList(no_valid.map(x=>x.order_id), IDB_TABLES.commerce_order);
            }}>test</button> */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                // flexDirection: { xs: 'column', sm: 'column', md: 'row' }
            }}>
                {/* <StoreSelectWidget /> */}
            </Box>
            <Box sx={{ py: '10px' }}>
                <MenuWidget />
            </Box>
        </Box>
    );
};

export default DesktopHeader;
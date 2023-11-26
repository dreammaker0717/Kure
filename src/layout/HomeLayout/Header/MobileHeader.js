import React from 'react';
import { Box } from '@mui/material';
import LogoWidget from './LogoWidget/LogoWidget';
import MenuWidget from './MenuWidget/MenuWidget';
import { CommonDataIndex, useCommonData } from 'services/context_services/commonDataContext';

const MobileHeader = () => {
    const { values: commonData } = useCommonData();
    const is_scrolled = commonData[CommonDataIndex.IS_SCROLLED];
    // console.log("is_scrolled:::", is_scrolled)

    return (
        <>
            <Box sx={{
                boxShadow: is_scrolled ? 3 : 0,
                position: "fixed",
                background: "#272727",
                width: "100vw",
                // height:"100px",
                zIndex: 999,
            }}>
                <Box
                    sx={{
                        px: "25px",
                        py: "10px",
                        display: 'flex',
                        position: 'relative',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexDirection: { xs: 'row' },
                        background: "#272727",
                    }}

                >
                    <LogoWidget />
                    <MenuWidget />
                </Box>
            </Box>
            <div style={{ height: "90px" }}></div>
            {/* <Box sx={{
                display: 'flex',
                position: 'relative',
                alignItems: 'center',
                flexDirection: "row",
                pl: '10px'
            }}>
                <StoreSelectWidget />
            </Box> */}
        </>
    );
};

export default MobileHeader;
import React from 'react';

import { useMemo } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Drawer, useMediaQuery } from '@mui/material';
import SidebarContent from './SidebarContent/SidebarContent';
import SidebarHeader from './SidebarHeader/SidebarHeader';
import MiniDrawerStyled from './MiniDrawerStyled';
import { DrawerWidth } from 'Common/constants';
import './styles.css';


const DSidebar = (props) => {
    const { openSidebar, onToggleDrawer } = props;
    const theme = useTheme();
    const matchDownMD = useMediaQuery(theme.breakpoints.down('lg'));

    const drawerContent = useMemo(() => <SidebarContent />, []);
    const drawerHeader = useMemo(() => <SidebarHeader open={openSidebar} />, [openSidebar]);

    return (
        <Box
            component="nav"
            sx={{
                flexShrink: { md: 0 },
                zIndex: 1300,
            }}
            aria-label="d-sidebar">
            {!matchDownMD ? (
                <MiniDrawerStyled variant="permanent" open={openSidebar}>
                    {drawerHeader}
                    {drawerContent}
                </MiniDrawerStyled>
            ) : (
                <Drawer
                    variant="temporary"
                    open={openSidebar}
                    onClose={onToggleDrawer}
                    ModalProps={{ keepMounted: true }}
                    PaperProps={{
                        sx: {
                            // backgroundColor: "var(--background)",
                        }
                    }}
                    sx={{
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: DrawerWidth,
                            borderRight: `1px solid ${theme.palette.divider}`,
                            backgroundImage: 'none',
                            boxShadow: 'inherit',
                        }
                    }}
                >
                    {openSidebar && drawerHeader}
                    {openSidebar && drawerContent}
                </Drawer>
            )
            }
        </Box >
    );
};

export default DSidebar;
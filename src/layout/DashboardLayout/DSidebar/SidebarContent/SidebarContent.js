import SimpleBarScroll from 'components/third-party/SimpleBarScroll';
import { useEffect, useState, } from 'react';
import { Avatar, Chip, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { sideMenuItems } from './MenuItems';
import MenuItemWidget from './MenuItemWidget';
import './../styles.css';
import { useLocation, useNavigate } from 'react-router';


const SidebarContent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;
    const selMenu = sideMenuItems.find(x => x.url.toLowerCase() == pathname.toLowerCase());


    const onClickItem = (menu_info) => {
        navigate(menu_info.url);
    }
    return (
        <SimpleBarScroll
            sx={{
                '& .simplebar-content': {
                    display: 'flex',
                    flexDirection: 'column'
                }
            }}
        >
            {sideMenuItems.map((x, index) => {
                return <MenuItemWidget key={`side-menu-${x.id}`}
                    item_info={x}
                    onClickItem={onClickItem}
                    is_selected={
                        selMenu == undefined
                            ? index == 0
                            : x['id'] == selMenu['id']
                    }
                />
            })}

        </SimpleBarScroll>
    );
};

export default SidebarContent;
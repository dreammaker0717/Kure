import React from 'react';
import { ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
const drawerOpen = true;

const hoverBgColor = "#E6F7FF";
const selectedBgColor = "#E6F7FF";
const textColor = '#3e3e3e';
const selectedTextColor = 'black';

const MenuItemWidget = (props) => {
    const { item_info, is_selected, onClickItem } = props;
    const theme = useTheme();
    const Icon = item_info.icon;
    const itemIcon = item_info.icon ? <Icon style={{ fontSize: '1.25rem' }} /> : false;

    return <ListItemButton
        onClick={() => onClickItem(item_info)}
        selected={is_selected}
        sx={{
            zIndex: 1201,
            p: "10px",

            ...(drawerOpen && {
                '&:hover': {
                    bgcolor: hoverBgColor
                },
                '&.Mui-selected': {
                    bgcolor: selectedBgColor,
                    borderRight: `2px solid ${theme.palette.primary.main}`,
                    color: "white",
                    '&:hover': {
                        color: "white",
                        bgcolor: hoverBgColor
                    }
                }
            }),
            ...(!drawerOpen && {
                '&:hover': {
                    bgcolor: 'transparent'
                },
                '&.Mui-selected': {
                    '&:hover': {
                        bgcolor: 'transparent'
                    },
                    bgcolor: 'transparent'
                }
            })
        }}

    >
        <ListItemIcon
            sx={{
                minWidth: 28,
                color: is_selected ? selectedTextColor : textColor,
                ...(!drawerOpen && {
                    borderRadius: 1.5,
                    width: 36,
                    height: 36,
                    alignItems: 'center',
                    justifyContent: 'center',
                }),
                ...(!drawerOpen &&
                    is_selected && {
                    bgcolor: 'primary.lighter',
                    '&:hover': {
                        bgcolor: 'primary.lighter'
                    }
                })
            }}
        >
            {itemIcon}
        </ListItemIcon>
        <ListItemText
            primary={
                <Typography variant="h6" sx={{ color: is_selected ? selectedTextColor : textColor }}>
                    {item_info.title}
                </Typography>
            }
        />
    </ListItemButton>
};

export default MenuItemWidget;
import React, { useRef, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import './headerStyles.css';
import {
    Avatar,
    Badge,
    Box,
    ClickAwayListener,
    Divider,
    IconButton,
    List,
    ListItemButton,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    Paper,
    Popper,
    Typography,
    useMediaQuery
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';


// sx styles
const avatarSX = {
    width: 36,
    height: 36,
    fontSize: '1rem'
};

const actionSX = {
    mt: '6px',
    ml: 1,
    top: 'auto',
    right: 'auto',
    alignSelf: 'flex-start',

    transform: 'none'
};
const iconBackColorOpen = 'grey.300';
const iconBackColor = 'grey.100';

const NotificationWidget = () => {
    const theme = useTheme();
    const matchesXs = useMediaQuery(theme.breakpoints.down('md'));
    const [open, setOpen] = useState(false)
    const anchorRef = useRef(null);
    const onClickNotificationButton = () => {

    }
    return (
        <Box sx={{ flexShrink: 0, ml: 0.75 }}>
            <div className='notificationIcon'>
                <IconButton
                    disableRipple
                    color="secondary"
                    sx={{ color: 'text.primary', bgcolor: open ? iconBackColorOpen : iconBackColor }}
                    aria-label="open profile"
                    ref={anchorRef}
                    aria-controls={open ? 'profile-grow' : undefined}
                    aria-haspopup="true"
                    onClick={onClickNotificationButton}
                >
                    <Badge color="primary">
                        <NotificationsActiveIcon />
                    </Badge>
                </IconButton>

            </div>
        </Box>
    );
};

export default NotificationWidget;
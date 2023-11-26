import React, { useContext, useState, useRef } from 'react';
import { Badge, Box, IconButton, Stack } from '@mui/material';
import NotificationsTwoToneIcon from '@mui/icons-material/NotificationsTwoTone';
import { Resource } from 'services/api_services/Resource';
import { USER_TYPE } from 'Common/constants';
import { styled } from '@mui/material/styles';
import { UsersProfileContext } from 'services/context_services/usersProfileContext';
import { useEffect } from 'react';
import { getNotificationPermission } from '../../../services/storage_services/state_services';

const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        right: '7px',
        top: '9px',
        border: `1px solid #ff9300`,
        padding: '0 4px',
        backgroundColor: '#000000'
    }
}));
const style1 = {
    borderRadius: '10px',
}
const style2 = {
    borderRadius: '0px 10px 10px 0px',
}

const NotificationAlertButton = (props) => {
    const { notificationCount, setOpenNotificationDrawer } = props;
    const [notificationPermission, setNotificationPermission] = useState(false);
    const buttonRef = useRef(null);

    useEffect(() => {
        async function getPermission() {
            const notificaionPermission = await getNotificationPermission();
            if (notificaionPermission) {
                setNotificationPermission(false);
            } else {
                setNotificationPermission(true);
            }
        }

        getPermission();
    }, []);

    const handleClick = () => {
        if (cartData[CartDataIndex.CART]) {
            console.log("bufferbutton123123");
            buttonRef.current.click();
        }
    };

    return (
        <div>
            <Stack
                sx={{
                    position: 'fixed',
                    bottom: '50px',
                    right: '20px',
                    zIndex: 1050,
                    '& > :not(style)': { m: 1 }
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        backgroundColor: '#000000',
                        width: '60px',
                        height: '60px',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    style={notificationPermission ? style2 : style1}
                    ref={buttonRef}
                    onClick={() => setOpenNotificationDrawer(true)}
                >
                    <IconButton aria-label="notifications" color="success">
                        <StyledBadge color="error" badgeContent={notificationCount}>
                            <NotificationsTwoToneIcon
                                aria-label="add"
                                sx={{
                                    display: 'flex',
                                    color: 'rgb(255, 144, 77)',
                                    cursor: 'pointer',
                                    width: '40px',
                                    height: '40px'
                                }}

                            ></NotificationsTwoToneIcon>
                        </StyledBadge>
                    </IconButton>
                </Box>

            </Stack>
        </div>
    );
};

export default NotificationAlertButton;
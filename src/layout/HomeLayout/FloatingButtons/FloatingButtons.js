import React, { useContext, useState } from 'react';
import { Badge, Box, IconButton, Stack } from '@mui/material';
import OrderListButton from './OrderListButton';
import NotificationsTwoToneIcon from '@mui/icons-material/NotificationsTwoTone';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import { Resource } from 'services/api_services/Resource';
import { USER_TYPE } from 'Common/constants';
import cartIcon from 'assets/images/icons/icon-cart.svg';
import { styled } from '@mui/material/styles';
import { UsersProfileContext } from 'services/context_services/usersProfileContext';

const FloatingButtons = () => {
  let resource = new Resource();
  const [notificationCount, setNotificationCount] = useState(1);
  const { setOpenNotificationDrawer } = useContext(UsersProfileContext);

  const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
      right: '7px',
      top: '9px',
      border: `1px solid #ff9300`,
      padding: '0 4px',
      backgroundColor: '#000000'
    }
  }));

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
        {/*<OrderListButton />*/}
        {resource.getUserRole() === USER_TYPE.KURE_EMPLOYEE && (
          <Box
            sx={{
              display: 'flex',
              backgroundColor: '#000000',
              borderRadius: '10px',
              width: '60px',
              height: '60px',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <IconButton aria-label="notifications" color="success">
              <StyledBadge color="error" badgeContent={notificationCount} sx={{}}>
                <NotificationsTwoToneIcon
                  aria-label="add"
                  sx={{
                    display: 'flex',
                    color: 'rgb(255, 144, 77)',
                    cursor: 'pointer',
                    width: '40px',
                    height: '40px'
                  }}
                  onClick={() => setOpenNotificationDrawer(true)}
                ></NotificationsTwoToneIcon>
              </StyledBadge>
            </IconButton>
          </Box>
        )}
      </Stack>
    </div>
  );
};

export default FloatingButtons;

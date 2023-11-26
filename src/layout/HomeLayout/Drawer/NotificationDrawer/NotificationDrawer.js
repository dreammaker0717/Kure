import React, { useContext, useState } from 'react';
import { Box, Typography, Drawer } from '@mui/material';

import { UsersProfileContext } from 'services/context_services/usersProfileContext';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import ContentDrawer from './ContentDrawer';

const NotificationDrawer = () => {
  const { openNotificationDrawer, setOpenNotificationDrawer } = useContext(UsersProfileContext);
  const [activeField, setActiveField] = useState('firstField');

  const active = { borderBottom: 'solid black 1px', padding: '15px', cursor: 'pointer' };
  const disabled = { color: 'gray', padding: '15px', cursor: 'pointer' };

  return (
    <Drawer anchor={'left'} open={openNotificationDrawer} onClose={() => setOpenNotificationDrawer(false)}>
      <Box
        name="secondContainer"
        sx={{
          width: '98vw',
          maxWidth: '450px',
          minWidth: '250px',
          padding: '38px',
          display: 'flex',
          flexDirection: 'column',
          gap: '30px',
          backgroundColor: 'whitesmoke',
          height: '100%'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant={'h3'}>Notifications</Typography>
          <HighlightOffIcon
            sx={{ width: '30px', minHeight: '30px', cursor: 'pointer' }}
            onClick={() => setOpenNotificationDrawer(false)}
          ></HighlightOffIcon>
        </Box>
        <Box name="Header" sx={{ display: 'flex', backgroundColor: 'white', gap: '5px', borderRadius: '8px' }}>
          <Typography onClick={() => setActiveField('firstField')} variant={'h3'} sx={activeField === 'firstField' ? active : disabled}>
            First Field
          </Typography>
          <Typography onClick={() => setActiveField('secondField')} variant={'h3'} sx={activeField === 'secondField' ? active : disabled}>
            Second Field
          </Typography>
        </Box>
        <Box
          name="content"
          sx={{
            display: 'flex',
            gap: '20px',
            width: '100%',
            backgroundColor: 'white',
            height: '100%',
            justifyContent: 'center',
            padding: '15px',
            borderRadius: '8px'
          }}
        >
          {activeField === 'firstField' ? (
            <Box>
              <ContentDrawer />
            </Box>
          ) : null}
          {activeField === 'secondField' ? <Box>Content 2</Box> : null}
        </Box>
      </Box>
    </Drawer>
  );
};

export default NotificationDrawer;

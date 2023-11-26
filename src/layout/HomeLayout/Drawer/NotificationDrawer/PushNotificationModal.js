import React, { useContext, useState } from 'react';
import { Box, Typography, Modal, Button } from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

const PushNotificationModal = () => {
  // this will be substituted for the notifications
  const [open, setOpen] = useState(false);

  const style = {
    position: 'absolute',
    bottom: '1%',
    left: { xs: '0%', sm: '0%', md: '35%', lg: '35%', xl: '35%' },
    width: { xs: '100%', sm: '100%', md: '500px', lg: '500px', xl: '600px' },
    bgcolor: 'background.paper',
    border: '',
    boxShadow: 24,
    p: 5,
    backgroundColor: 'white',
    outline: 'none',
    borderRadius: '5px'
  };

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <Box name="positionContainer" sx={style}>
        <Box
          name="contentContainer"
          sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
        >
          <HighlightOffIcon
            sx={{ width: '22px', minHeight: '22px', cursor: 'pointer', position: 'absolute', right: '10px', top: '15px' }}
            onClick={() => setOpen(false)}
          ></HighlightOffIcon>
          <Typography variant={'h5'} sx={{ color: '#7C7D7D' }}>
            INTRODUCTION
          </Typography>
          <Typography variant={'h4'}>Push Notifications</Typography>
          <Typography variant={'body1'}>Get Your notification when deals are assigned to you</Typography>
          <Button variant="contained">Notify me</Button>
          <Button variant="text">Do not notify me</Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default PushNotificationModal;

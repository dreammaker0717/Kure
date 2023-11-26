import React, { useEffect, useState } from 'react';
import { Grid, Modal, Button, Typography, Box } from '@mui/material';
import { CommonDataIndex, useCommonData } from 'services/context_services/commonDataContext';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import Avatar from '@mui/material/Avatar';

import StoreIcon from '@mui/icons-material/Store';
import { getAddressString } from 'Common/functions';
import ModalTitle from './ModalTitle';
import { idbGetActiveStoreId, idbSetActiveStoreId } from 'services/idb_services/configManager';
import { extractValidCategories } from 'services/idb_services/productManager';
import { storeStoreId, storeValidCategoryList } from 'services/storage_services/storage_functions';
import { eventUserSwitchedStores, postOrderMessage } from 'services/idb_services/orderManager';

const style = {
  position: 'absolute',
  top: '50vh',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90vw', sm: '360px' },
  border: "1px solid gray",
  bgcolor: "#272727",
  boxShadow: 24,
  borderRadius: "20px",
  p: '0px',
  display: 'flex',
  justifyContent: 'center',
  alignCenter: 'center',
  flexDirection: 'column',
  padding: '15px'
};

const stylebottom = {
  display: "flex",
  justifyContent: "end",
  padding: "10px 0px 10px 0px"
}

const stylebutton = {
  marginLeft: "10px",
  color: "white"
}

const SetNotificationModal = (props) => {
  const { open, onOK, onCancel } = props;
  const modalTitle = 'Please enable notifications to use this application.\n';
  const modalContent = 'To manage notification permissions:\n1. Open your browser settings.\n2. Navigate to the permissions or site settings section.\n3. Look for "Notifications" and manage permissions there.';

  return (
    <Modal
      disableEnforceFocus
      open={open}
      onClose={(e, reason) => {
        onCancel();
      }}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      keepMounted={false}
    >
      <Box sx={style}>
        <ModalTitle onClose={onCancel} />
        <Typography children={modalTitle} component="span" sx={{ fontSize: '18px', color: "white" }} />
        <Typography children={modalContent} component="span" sx={{ fontSize: '15px', color: "white", whiteSpace: 'pre-line' }} />
        <div style={stylebottom}>
          <Button variant="outlined" style={stylebutton} onClick={onOK}>Ok</Button>
        </div>
      </Box>
    </Modal>
  );
};

export default SetNotificationModal;
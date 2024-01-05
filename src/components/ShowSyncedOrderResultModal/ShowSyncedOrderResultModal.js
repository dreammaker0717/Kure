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
import SyncedOrderNotice from 'layout/HomeLayout/Drawer/SyncedOrderNotice';

const style = {
  position: 'absolute',
  top: '50vh',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90vw', sm: '500px' },
  border: "1px solid gray",
  bgcolor: "#272727",
  boxShadow: 24,
  borderRadius: "20px",
  p: '0px',
  padding: '15px',
  overflowY: 'auto',
  overflow: 'auto !important',
  maxHeight: '80%'
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

const orderCardStyle = {
  overflowY: 'auto !important'
}

const ShowSyncedOrderResultModal = (props) => {
  const { open, onOK, onCancel, orders } = props;
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
        {orders.map((element, index) => {
          return <SyncedOrderNotice
            key={index}
            style={orderCardStyle}
            submitTempData={element}
          />
        })}
        <div style={stylebottom}>
          <Button variant="outlined" style={stylebutton} onClick={onOK}>Ok</Button>
        </div>
      </Box>
    </Modal>
  );
};

export default ShowSyncedOrderResultModal;
import React, { useEffect, useState } from 'react';
import { Grid, Modal, Button, Typography, Box } from '@mui/material';
import ModalTitle from './ModalTitle';

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
  padding: '15px 25px 15px 25px'
};

const stylebottom = {
  display: "flex",
  justifyContent: "end",
  padding: "10px 10px 10px 0px"
}

const stylebutton = {
  marginLeft: "10px",
  color: "white"
}

const ConfirmModal = (props) => {
  const { open, onOK, onCancel, name } = props;
  const modalTitle = 'Already linked with ' + name;
  const modalContent = "Are you sure you want to switch accounts?";

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
        <ModalTitle title={modalTitle} onClose={onCancel} />
        <Typography children={modalContent} component="span" sx={{ fontSize: '15px', color: "white", whiteSpace: 'pre-line' }} />
        <div style={stylebottom}>
          <Button variant="outlined" style={stylebutton} onClick={onOK}>Ok</Button>
          <Button variant="outlined" style={stylebutton} onClick={onCancel}>Cancel</Button>
        </div>
      </Box>
    </Modal>
  );
};

export default ConfirmModal;
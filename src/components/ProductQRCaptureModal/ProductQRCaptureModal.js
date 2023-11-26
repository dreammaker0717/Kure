import React, { useEffect, useState } from 'react';
import { Grid, Modal, Button, Typography, Box } from '@mui/material';
import './ProductQRCaptureModal.css'
import ProductQrCaptureWidget from './ProductQrCaptureWidget';
import CloseIcon from '@mui/icons-material/Close';

const style = {
  position: 'absolute',
  top: '50vh',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: "304px",
  bgcolor: 'black',
  boxShadow: 24,
  p: '0px',
  borderRadius: "10px"
};
const btn_close_style = {
  fontSize: "20px",
  color: "gray",
  cursor: 'pointer',
  ':hover': {
    color: 'white'
  },
}
const ProductQRCaptureModal = (props) => {
  const { open, onClose, isDeletion, onQrScan, onCapturedImage } = props;
  const [openQRPane, setOpenQRPane] = useState(false);
  useEffect(() => {
    setOpenQRPane(true);

  }, [])
  const onClickClose = () => {
    setOpenQRPane(false);
    setTimeout(() => {
      onClose();
    }, 200);
  }
  return (
    <Modal
      disableEnforceFocus
      open={open}
      onClose={onClickClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      keepMounted={false}
    >
      <Box sx={{ ...style, border: !isDeletion ? "2px solid #000" : "2px solid red" }}>
        <Box
          sx={{
            display: 'flex',
            flexGrow: '0',
            flexDirection: 'row',
            justifyContent: 'space-between',
            mt: "5px",
          }}
        >
          <Box sx={{
            pl: "10px",
            color: !isDeletion ? "green" : "red"
          }}>
            {!isDeletion ?
              <>Scan to <b>ADD</b> products</> :
              <>Scan to <b>REMOVE</b> products</>
            }
          </Box>
          <Box sx={{
            pr: "10px",
          }}>
            <CloseIcon sx={btn_close_style} onClick={onClickClose} />
          </Box>
        </Box>
        <ProductQrCaptureWidget
          openQRPane={openQRPane}
          isDeletion={isDeletion}
          setOpenQRPane={setOpenQRPane}
          onQrScan={onQrScan}
          onCapturedImage={onCapturedImage}
        />
      </Box>
    </Modal>
  );
};

export default ProductQRCaptureModal;
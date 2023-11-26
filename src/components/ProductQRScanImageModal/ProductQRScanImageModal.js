import React, { useEffect, useState } from 'react';
import { Grid, Modal, Button, Typography, Box } from '@mui/material';
import ProductQRScanImageWidget from './ProductQRScanImageWidget';
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
  border: "2px solid #000",
  ':hover': {
    color: 'white'
  },
}
const ProductQRScanImageModal = (props) => {
  const { open, onClose, onQrScan } = props;
  const [openQRPane, setOpenQRPane] = useState(false);
  useEffect(() => {
    setOpenQRPane(true);
  }, [])
  const onClickClose = () => {

    setTimeout(() => {
      onClose();
    }, 200);
  }
  const onDetectedProduct = async (v) => {
    setOpenQRPane(false);
    onQrScan(v);
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
      <Box sx={style}>
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
            color: "green"
          }}>
            Scan Product QR Code
          </Box>
          <Box sx={{
            pr: "10px",
          }}>
            <CloseIcon sx={btn_close_style} onClick={onClickClose} />
          </Box>
        </Box>
        <ProductQRScanImageWidget
          openQRPane={openQRPane}
          onDetectedProduct={onDetectedProduct}
        />
      </Box>
    </Modal>
  );
};

export default ProductQRScanImageModal;
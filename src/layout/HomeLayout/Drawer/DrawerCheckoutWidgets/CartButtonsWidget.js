import React, { useEffect, useState } from 'react';
import { Box, Grid } from '@mui/material';
import CameraEnhanceIcon from '@mui/icons-material/CameraEnhance';
import AdfScannerIcon from '@mui/icons-material/AdfScanner';
import CustomerSelectWidget from './CustomerSelectWidget';
import ProductScanWidget from './ProductScanWidget';
import { USER_TYPE } from "Common/constants";
import { Resource } from "services/api_services/Resource";
import LayersClearIcon from "@mui/icons-material/LayersClear";
import { customToast } from "components/CustomToast/CustomToast";
import { broadcastMessage } from "Common/functions";
import DrawerProductAddWidget from './DrawerProductAddWidget';
import ProductQRCaptureModal from 'components/ProductQRCaptureModal/ProductQRCaptureModal';

const CartButtonsWidget = ({ paneIsOpen }) => {
  const resource = new Resource();
  const [openQRPane, setOpenQRPane] = useState(false);
  const [isDeletion, setIsDeletion] = useState(false);

  const cssCamera = {
    display: 'flex',
    cursor: 'pointer',
    color: '#32BEB9',
    ':hover': {
      color: '#44ffbb'
    },
    width: '40px',
    height: '40px',
  };
  const cssRemove = {
    display: 'flex',
    width: '40px',
    height: '40px',
    cursor: 'pointer',
    color: 'rgb(255 144 77 / 41%)',
    ':hover': {
      color: 'rgb(255 144 77 )',
    },
  };

  const onClickOpenQR = (is_delete) => {
    setIsDeletion(is_delete);
    console.log('will qr scan: ', is_delete)
    if (is_delete) {
      customToast.warn('Scan to remove: Turned on');
    } else {
      customToast.success('Scan to remove: Off');
    }
    setOpenQRPane(true);
  };

  if (resource.getUserRole() !== USER_TYPE.KURE_EMPLOYEE) {
    return <></>;
  }

  return (
    <>
      {openQRPane &&
        <ProductQRCaptureModal
          open={openQRPane}
          isDeletion={isDeletion}
          onClose={() => {
            setOpenQRPane(false)
          }} />
      }
      <Box sx={{ mb: '15px' }}>
        <DrawerProductAddWidget />
      </Box>
      <Box sx={{ display: 'flex', gap: '8px', flexDirection: 'row', paddingBottom: '53px' }}>
        <Box sx={{ display: 'flex', flexGrow: '2' }}>
        </Box>
        <Box sx={{ display: 'flex', flexGrow: '0', flexDirection: 'row', justifyContent: 'space-between', gap: '20px', }}>
          <CameraEnhanceIcon
            sx={cssCamera}
            onClick={() => onClickOpenQR(false)}
          />
          <LayersClearIcon
            sx={cssRemove}
            onClick={() => onClickOpenQR(true)}
          />
        </Box>
      </Box>
    </>
  );
};

export default CartButtonsWidget;
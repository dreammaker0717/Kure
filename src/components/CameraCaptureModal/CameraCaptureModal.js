import React, { useState } from 'react';
import { Grid, Modal, Button, Typography, Box } from '@mui/material';
import CameraCaptureWidget from './CameraCaptureWidget';
const style = {
    position: 'absolute',
    top: '50vh',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "304px",
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: '0px'
};

const CameraCaptureModal = (props) => {
    const { open, onOK } = props;

    const onClickOk = (imgSrc) => {
        onOK(imgSrc);
    }
    return (
        <Modal
            disableEnforceFocus
            open={open}
            onClose={(e, reason) => {
                onOK(null);
            }}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            keepMounted={false}
        >
            <Box sx={style}>
                <CameraCaptureWidget
                    onCaptureImage={onClickOk}
                />
            </Box>
        </Modal>
    );
};

export default CameraCaptureModal;
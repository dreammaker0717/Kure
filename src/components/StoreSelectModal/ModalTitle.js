import React from 'react';
import { Grid, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ModalTitle = (props) => {
  const { onClose } = props;
  return (
    <Grid sx={{ p: "15px", }} container justifyContent={"space-between"}>
      <Grid item>
        <Typography className="text-size-h4" sx={{ color: "white" }}>Select a store</Typography>
      </Grid>
      <Grid item>
        <CloseIcon onClick={onClose} className="custom-button" sx={{ color: "white" }}/>
      </Grid>
    </Grid>
  );
};

export default ModalTitle;
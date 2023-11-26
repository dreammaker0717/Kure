import React from 'react';
import { Grid, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ModalTitle = (props) => {
  const { onClose, title } = props;
  const style = {
    padding: "15px 15px 15px 0px"
  }
  return (
    <Grid sx={{ p: "15px", }} container justifyContent={"space-between"} style={style}>
      <Grid item>
        <Typography className="text-size-h5" sx={{ color: "white" }}>{title}</Typography>
      </Grid>
      <Grid item>
        <CloseIcon onClick={onClose} className="custom-button" sx={{ color: "white" }} />
      </Grid>
    </Grid>
  );
};

export default ModalTitle;
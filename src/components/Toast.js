import { Snackbar } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import React, { forwardRef, useEffect, useState } from "react";

function Toast({ messageToast, setMessageToast }) {
  const Alert = forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  const [state, setState] = useState({
    open: false,
    vertical: 'top',
    horizontal: 'left',
  });

  const { open, vertical, horizontal } = state;

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setState({ ...state, open: false, message: '' });
    setMessageToast('');
  };

  useEffect(() => {
    if (messageToast) {
      setState({ ...state, open: true, message: messageToast });
    }
  }, [messageToast]);

  return (
    <>
      <Snackbar anchorOrigin={{ vertical, horizontal }}
                open={state.open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          {messageToast}
        </Alert>
      </Snackbar>
    </>
  );
}

export default Toast;

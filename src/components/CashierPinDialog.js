import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import PinNumPad from "utils/PinNumPad";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function CashierPinDialog(props) {
  const { openPinPopup, setOpenPinPopup } = props;
  const handleClose = () => {
    setOpenPinPopup(false);
  };

  return (
    <div>
      <Dialog
        open={openPinPopup}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogContent>
          <PinNumPad
            openPinPopup={openPinPopup}
            setOpenPinPopup={setOpenPinPopup}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
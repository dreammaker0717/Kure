/**
 * Not being used.
 */
// import * as React from 'react';
// import Dialog from '@mui/material/Dialog';
// import DialogContent from '@mui/material/DialogContent';
// import DialogTitle from '@mui/material/DialogTitle';
// import Slide from '@mui/material/Slide';
// import Qr from "utils/Qr";
//
// const Transition = React.forwardRef(function Transition(props, ref) {
//   return <Slide direction="up" ref={ref} {...props} />;
// });
//
// export default function QrScannerDialog(props) {
//   const {openPopup, setOpenPopup} = props;
//   const handleClose = () => {
//     setOpenPopup(false);
//   };
//
//   return (
//     <div>
//       <Dialog
//         open={openPopup}
//         TransitionComponent={Transition}
//         keepMounted
//         onClose={handleClose}
//         aria-describedby="alert-dialog-slide-description"
//       >
//         <DialogTitle>{"Scan Product"}</DialogTitle>
//         <DialogContent>
//           {/*for now scanner is not starting properly*/}
//           <Qr open={openPopup}/>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
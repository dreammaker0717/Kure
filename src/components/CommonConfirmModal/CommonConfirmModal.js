import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
const CommonConfirmModal = (props) => {
    const { open, onOk, onCancel, title, description, okTitle, cancelTitle } = props;

    return (
        <Dialog
            open={open}
            onClose={onCancel}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            PaperProps={{
                style: {
                    backgroundColor: '#0e0e0e',
                    color: "white"
                },
            }}
        >
            <DialogTitle id="alert-dialog-title">
                {title}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {description}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} sx={{ color: "red" }}>
                    {cancelTitle ? cancelTitle : "No, don't do it"}
                </Button>
                <Button onClick={onOk}>
                    {okTitle ? okTitle : "Yes, clear cart"}

                </Button>
            </DialogActions>
        </Dialog>

    );
};

export default CommonConfirmModal;
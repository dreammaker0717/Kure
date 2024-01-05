import React, { useEffect, useState } from 'react';
import { Grid, Modal, Button, Typography, Box } from '@mui/material';
import ModalTitle from './ModalTitle';
import ModalContent from './ModalContent/ModalContent';
import { customToast } from 'components/CustomToast/CustomToast';
import moment from "moment";

const style = {
  position: 'absolute',
  top: '50vh',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90vw', sm: '60vw' },
  maxWidth: '500px',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: '0px'
};

const CustomerMgrModal = (props) => {
  const { open, profileData, onOK, onClose, selectedCustomer, setSelectedCustomer } = props;
  const [submitIsDisabled, setSubmitIsDisabled] = useState(true);
  const [prevStateCustomer, setprevStateCustomer] = useState(selectedCustomer);

  // const [customerData, setCustomerData] = useState({
  //   mail: '',
  //   name: '',
  //   is_medical_user: "No",
  //   is_deliver: "false",
  //   date_of_birth: "",
  //   document_expire_date: "",
  //   medical_user_user_info: [],
  //   user_addresses: []
  // });
  //
  // useEffect(() => {
  //   if (selectedCustomer == undefined) {
  //     setCustomerData({
  //       mail: '',
  //       name: '',
  //       is_medical_user: "No",
  //       is_deliver: "false",
  //       date_of_birth: "",
  //       document_expire_date: "",
  //       medical_user_user_info: [],
  //       user_addresses: []
  //     });
  //   } else {
  //     console.log(selectedCustomer);
  //     const { user_addresses } = selectedCustomer;
  //     const default_address = user_addresses.find(x => x.is_default == true);
  //     if (default_address !== undefined) {
  //       setCustomerData({
  //         ...selectedCustomer,
  //         address: default_address,
  //       });
  //     }
  //     // We couldn't find a default address, choose the first one available.
  //     else {
  //       setCustomerData({
  //         ...selectedCustomer,
  //         address: user_addresses[0]
  //       });
  //     }
  //   }
  // }, [selectedCustomer]);

  const validate = () => {
    let response = {
      error: false,
      message: ''
    };

    const users_array = Object.values(profileData);
    const email = selectedCustomer['mail'].toLowerCase();
    const name = selectedCustomer['name'].toLowerCase();
    const uid = selectedCustomer['uid'].toLowerCase();
    const existing = users_array.find(x => {
      if (x.uid === uid) {
        return false;
      }
      if (x.mail.toLowerCase() === email) {
        return true;
      }
      return x.name.toLowerCase() === name;
    })

    if (existing) {
      response.error = true;
      if (existing.mail.toLowerCase() === email) {
        response.message = 'This email already exists';
      }
      if (existing.name.toLowerCase() === name) {
        response.message = 'This Username already exists';
      }
    }

    /**
     * Verify the medical fields for selectedCustomer object:
     * {
     *     "uid": "1057",
     *     "name": "Josh",
     *     "is_medical_user": "Yes",
     *     "medical_user_info": {
     *         "license": "12312312",
     *         "expiration_date": "2023-10-10",
     *         "field_medical_license_documents": [
     *             "iVBORw0KGgoAAAANSUhEU...=="
     *         ]
     *     },
     * }
     */
    const expiration_date = selectedCustomer.medical_user_info.expiration_date;
    // If is_medical_user is 'Yes', then we need to validate the medical_user_info object.
    if (selectedCustomer.is_medical_user === 'Yes') {
      if (selectedCustomer.medical_user_info.license === undefined || selectedCustomer.medical_user_info.license === '') {
        response.error = true;
        response.message = 'Please enter a valid license number';
      }
      // Verify that expiration_date is in the format of YYYY-MM-DD using moment() and it isn't today minus 1 day or less.
      else if (expiration_date === undefined || expiration_date === '' || !moment(expiration_date, "YYYY-MM-DD", true).isValid() || moment(expiration_date).isBefore(moment().subtract(1, 'days'))) {
        response.error = true;
        response.message = 'Please enter a valid expiration date';
      }
      // selectedCustomer.field_medical_license_documents should be an array of strings.
      else if (selectedCustomer.medical_user_info.field_medical_license_documents === undefined || selectedCustomer.medical_user_info.field_medical_license_documents.length === 0) {
        response.error = true;
        response.message = 'Please upload a valid license document';
      }
    }
    return response;
  };

  const onClickSubmit = async () => {
    const validation_res = validate();

    if (validation_res.error) {
      customToast.error(validation_res.message, { autoClose: 1000 });
      return;
    }

    onOK(selectedCustomer);
  };

  const onClickCancel = () => {
    onClose();
    setSelectedCustomer(prevStateCustomer);
  };

  return (
    <Modal
      disableEnforceFocus
      open={open}
      onClose={(e, reason) => {
        // console.log('reason', reason)
        if (reason == 'backdropClick') {
          return;
        }

        onClose();
      }}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      keepMounted={false}
    >
      <Box sx={style}>
        <ModalTitle onClose={onClose}/>
        <ModalContent
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          setSubmitIsDisabled={setSubmitIsDisabled}
        />
        <Box
          sx={{
            pb: '10px',
            borderTop: '1px solid gray',
            background: '#9A9A98'
          }}
        >
          <Grid container justifyContent="space-evenly">
            <Grid item>
              <Button
                color="info"
                sx={{
                  color: 'white',
                  mt: '10px',
                  border: '1px solid',
                  background: '#32beb9',
                  '&:hover': {
                    background: '#5CA300'
                  }
                }}
                onClick={onClickSubmit}
                disabled={submitIsDisabled}
              >
                Submit
              </Button>
            </Grid>
            <Grid item>
              <Button
                color="info"
                sx={{
                  color: 'white',
                  mt: '10px',
                  border: '1px solid',
                  background: '#FF4D4F',
                  '&:hover': {
                    background: 'red'
                  }
                }}
                onClick={onClickCancel}
              >
                Cancel
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Modal>
  );
};

export default CustomerMgrModal;

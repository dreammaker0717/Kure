import React, { useEffect, useState } from 'react';
import { FormControlLabel, Checkbox, Input, Box, Typography } from '@mui/material';
import './ModalContent.css'
import MedicalUserInfo from './MedicalUserInfo';
import { customToast } from "components/CustomToast/CustomToast";
import { getTokenworksDataAll } from 'services/idb_services/userManager';
import ConfirmModal from '../../ConfirmModal/ConfirmModal';

const ModalContent = ({ selectedCustomer, setSelectedCustomer, setSubmitIsDisabled }) => {
  const [isMedicalUser, setIsMedicalUser] = useState(selectedCustomer.is_medical_user === "Yes" ? true : false);
  const [warning, setWarning] = useState('');
  const [tokenworks, setTokenworks] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [currentTokenWorksId, setCurrentTokenWorksId] = useState('default');
  const [linkedCustomerName, setLinkedCustomerName] = useState('');

  useEffect(() => {
    if (selectedCustomer.mail === "" || selectedCustomer.name === "") {
      setSubmitIsDisabled(true);
      return;
    } else {
      setSubmitIsDisabled(false);
    }

    // Is 'selectedCustomer.mail' a valid email?
    if (selectedCustomer.mail !== '' && !selectedCustomer.mail.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i)) {
      setSubmitIsDisabled(true);
      setWarning('Invalid email address.');
    } else {
      setSubmitIsDisabled(false);
      setWarning('');
    }

  }, [selectedCustomer]);

  useEffect(() => {
    getTokenworksDataAll().then((rows) => {
      setTokenworks(rows);
    }).catch((err) => {
      console.log(err);
    });


  }, []);


  useEffect(() => {
    if (tokenworks) {
      const temp = tokenworks.find(item => item.uid === selectedCustomer.uid)?.customer_id || '';
      const selected_customer = {
        ...selectedCustomer,
        tokenworks_customer_id: temp
      };

      setCurrentTokenWorksId(temp);
      setSelectedCustomer(selected_customer);
    }
  }, [tokenworks]);

  const onChangeTokenWorksId = (tokenworks_id) => {
    if (tokenworks_id == 'default') {
      tokenworks_id = '';
    }
    console.log("selectedCustomer==", tokenworks_id);
    const islink_uid = tokenworks.find(item => item.customer_id === tokenworks_id)?.uid || '';
    setSelectedCustomer({
      ...selectedCustomer,
      tokenworks_customer_id: tokenworks_id
    });
    if (islink_uid) {
      setConfirmDialogOpen(true);
      const customer_name = tokenworks.find(item => item.customer_id === currentTokenWorksId)?.first_name || '';
      console.log(customer_name);
      setLinkedCustomerName(customer_name)
    } else {
      setCurrentTokenWorksId(selectedCustomer.tokenworks_id);
    }
  };

  return (
    <Box sx={{
      marginLeft: { xs: '10px', sm: '28px' },
      marginRight: { xs: '10px', sm: '0px' },
      maxHeight: "80vh",
      overflowY: "scroll",
      mb: "44px"
    }}>

      <ConfirmModal
        open={confirmDialogOpen}
        onCancel={() => {
          setConfirmDialogOpen(false);
          setSelectedCustomer({
            ...selectedCustomer,
            tokenworks_customer_id: currentTokenWorksId
          });
          setCurrentTokenWorksId(currentTokenWorksId);
        }}
        onOK={() => {
          setCurrentTokenWorksId(selectedCustomer.tokenworks_customer_id);
          setConfirmDialogOpen(false);
        }}
        name={linkedCustomerName}
      />

      <Box sx={{ height: '44px' }}>
        <Typography sx={{ fontWeight: 'bold', color: '#eb0000' }}>
          {warning}
        </Typography>
      </Box>
      <Box sx={{ height: '64px' }}>
        <Typography sx={{ fontWeight: 'bold' }}>
          Select Customers
        </Typography>
        <select
          onChange={(e) => onChangeTokenWorksId(e.target.value)}
          style={{
            background: 'white',
            border: '1px solid #A8A8A8',
            fontSize: { xs: '1rem', sm: '1.5rem' },
            color: 'black',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            padding: '8px',
            width: '40%'
          }}
          value={currentTokenWorksId ? currentTokenWorksId : 'default'}
        >
          <option value="default">--- Select One ---</option>
          {tokenworks && tokenworks.map((info, index) => {
            return (
              <option value={info['customer_id']} key={index}>
                {info['first_name'] + " " + info['last_name']}
              </option>
            );
          })}
        </select>
      </Box>
      <Box sx={{ pt: "10px" }}>
        <Typography sx={{ fontWeight: 'bold' }}>
          Email Address <code style={{ color: 'red' }}>*</code>
        </Typography>
        <input className='customer-mgr-modal-input' type={'email'}
          value={selectedCustomer.mail || ''}
          onChange={e => {
            setSelectedCustomer({ ...selectedCustomer, mail: e.target.value });
          }
          } />
      </Box>
      <Box sx={{ pt: "10px" }}>
        <Typography sx={{ fontWeight: 'bold' }}>
          Username <code style={{ color: 'red' }}>*</code>
        </Typography>
        <input className='customer-mgr-modal-input'
          value={selectedCustomer.name || ''}
          onChange={e => {
            setSelectedCustomer({ ...selectedCustomer, name: e.target.value });
          }
          } />
      </Box>

      <Box sx={{ pt: "10px" }}>
        <FormControlLabel
          label="Medical user?"
          control={
            <Checkbox
              sx={{ color: "#32BEB9" }}
              checked={isMedicalUser}
              onChange={e => {
                setIsMedicalUser(e.target.checked);
                //setSelectedCustomer.is_medical_user = e.target.checked == true ? "Yes" : "No";
                setSelectedCustomer({ ...selectedCustomer, is_medical_user: e.target.checked == true ? "Yes" : "No" })
              }}
            />
          }
        />
      </Box>

      <MedicalUserInfo
        selectedCustomer={selectedCustomer}
        setSelectedCustomer={setSelectedCustomer}
      />

      {/*
      @TODO: I don't think changing the delivery type is necessary. The delivery type is determined by the
             'delivery my order' button within the checkout page.
      */}
      {/*<Box sx={{ pt: "10px" }}>*/}
      {/*  <FormControlLabel*/}
      {/*    label="Delivery order"*/}
      {/*    control={<Checkbox sx={{ color: "#32BEB9" }} checked={cart.type === CHECKOUT_TYPE.DELIVERY} onChange={e => {*/}
      {/*      setcustomer({ ...customer, is_deliver: e.target.checked == true ? "true" : "false" })*/}
      {/*    }}/>}*/}
      {/*  />*/}
      {/*</Box>*/}
      {/*<DeliveryInfo selCustomer={selCustomer} setSelCustomer={setSelCustomer}/>*/}
      {/*<AddressInfo customer={customer} selCustomer={selCustomer} setSelCustomer={setSelCustomer}/>*/}
    </Box >
  );
};

export default ModalContent;
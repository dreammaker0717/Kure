import React, { useEffect, useState } from 'react';
import { Grid, Modal, Button, Typography, Box } from '@mui/material';
import { CommonDataIndex, useCommonData } from 'services/context_services/commonDataContext';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import Avatar from '@mui/material/Avatar';

import StoreIcon from '@mui/icons-material/Store';
import { getAddressString } from 'Common/functions';
import ModalTitle from './ModalTitle';
import { idbGetActiveStoreId, idbSetActiveStoreId } from 'services/idb_services/configManager';
import { extractValidCategories } from 'services/idb_services/productManager';
import { storeStoreId, storeValidCategoryList } from 'services/storage_services/storage_functions';
import { eventUserSwitchedStores, postOrderMessage } from 'services/idb_services/orderManager';

const style = {
  position: 'absolute',
  top: '50vh',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90vw', sm: '360px' },
  // maxWidth: '360px',
  // bgcolor: 'background.paper',
  border: "1px solid gray",
  bgcolor: "#272727",
  boxShadow: 24,
  borderRadius: "20px",
  p: '0px'
};

const StoreSelectModal = (props) => {
  const { open, onOK, onCancel } = props;
  const { values: commonData, setValueObjects: setCommonDataList  } = useCommonData();
  const [selStoreId, setSelStoreId] = useState(commonData[CommonDataIndex.SEL_STORE]);
  const stores = commonData[CommonDataIndex.STORES];
  // const sel_store = commonData[CommonDataIndex.SEL_STORE];
  useEffect(() => {
    idbGetActiveStoreId().then((store_id) => {
      setSelStoreId(store_id)
    })
  }, [open])
  const onClickStore =async (store_id) => {
    const valid_category_list = await extractValidCategories(store_id);
    storeValidCategoryList(store_id, valid_category_list);

    setCommonDataList({
      [CommonDataIndex.SEL_STORE]: store_id,
      [CommonDataIndex.VALID_CATEGORIES]: valid_category_list
    });

    storeStoreId(store_id);
    await idbSetActiveStoreId(store_id);
    await eventUserSwitchedStores();
    postOrderMessage();

    onOK(store_id);
  }
  const onCancelStoreDlg = () => {
    setOpenStoreSelector(false);

    onOK(store_id)
  }
  return (
    <Modal
      disableEnforceFocus
      open={open}
      onClose={(e, reason) => {
        onCancel();
      }}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      keepMounted={false}
    >
      <Box sx={style}>
        <ModalTitle onClose={onCancel}/>
        <List sx={{ width: '100%', maxWidth: 360, }}>
          {stores.map(store_info => {
            return <ListItemButton
              key={store_info.store_id}
              selected={selStoreId == store_info.store_id}
              onClick={() => onClickStore(store_info['store_id'])}
              sx={{ p: 0, ':hover': { bgcolor: '#32BEB9', borderRadius: '10px' } }}
            >
              <ListItemAvatar>
                <Avatar>
                  <StoreIcon/>
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primaryTypographyProps={{
                  style: {
                    color: "white"
                  }
                }}
                primary={store_info.name.replace('Kure Wellness - ', '')}
                secondary={
                  <>
                    {getAddressString(store_info).map((line, index) => (
                      <React.Fragment key={index}>
                        {line}
                        {index !== getAddressString(store_info).length - 1 && <br/>}
                      </React.Fragment>
                    ))}
                  </>
                }
              />
            </ListItemButton>
          })}
        </List>
      </Box>
    </Modal>
  );
};

export default StoreSelectModal;
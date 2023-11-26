import { Box, Typography, Link, Dialog, } from '@mui/material';
import logo from '../assets/images/kure_logo_transparent.png';
import { ageGate, storeStoreId, storeValidCategoryList } from 'services/storage_services/storage_functions';
import { extractValidCategories } from 'services/idb_services/productManager';
import { broadcastMessage } from 'Common/functions';
import { useState } from 'react';
import { postOrderMessage } from 'services/idb_services/orderManager';
import { CommonDataIndex, useCommonData } from 'services/context_services/commonDataContext';
import { idbSetActiveStoreId } from 'services/idb_services/configManager';

const AgeGatePopup = () => {
  const { values: commonData, setValue: setCommonData, setValueObjects: setCommonDataList } = useCommonData();
  const stores = commonData[CommonDataIndex.STORES];
  const [displayAgeGate, setDisplayAgeGate] = useState(ageGate());

  const changeStoreId = async (store_id) => {
    console.log("clicked store", store_id);
    // Don't open the age gate again.
    ageGate('false');
    setDisplayAgeGate(false);
    const validCategoryList = await extractValidCategories(store_id);
    console.log("validCategories: ", validCategoryList)
    storeValidCategoryList(store_id, validCategoryList);
    setCommonDataList({
      [CommonDataIndex.SEL_STORE]: store_id,
      [CommonDataIndex.VALID_CATEGORIES]: validCategoryList
    });

    storeStoreId(store_id);
    await idbSetActiveStoreId(store_id);
    postOrderMessage();
  };

  return (
    <Dialog
      open={displayAgeGate}
      style={{ backgroundColor: '#373737', opacity: '90%' }}
      PaperProps={{
        style: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
          margin: 5
        }
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          margin: 0
        }}
      >
        <img alt="logo" src={logo} style={{ maxWidth: '298px', width: '100%' }} />
        <Typography className="text-size-h2" sx={{ color: '#FFFFFF' }}>
          Welcome to Kure Wellness
        </Typography>
        <Typography className="text-size-h3" sx={{ color: '#FFFFFF' }}>
          You must be 21+ years old to use this website
        </Typography>
        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <Typography className="text-size-h3" sx={{ color: '#FFFFFF' }}>
            Select your closest store
          </Typography>
        </div>
        <Box sx={{ textAlign: { xs: 'left', md: 'center' } }}>
          {stores.map((store, index) => {
            return (
              <div key={index}>
                <Link sx={{ cursor: 'pointer' }} onClick={() => changeStoreId(store.store_id)}>
                  <Typography className="text-size-h4" sx={{ color: '#52b4b1' }}>
                    {store.name}
                  </Typography>
                </Link>
                <Typography className="text-size-h6" sx={{ color: '#FFFFFF' }}>
                  {store.address1} {store.address2} {store.city} {store.state} {store.postal_code}
                </Typography>
              </div>
            );
          })}
        </Box>
      </div>
    </Dialog>
  );
};

export default AgeGatePopup;

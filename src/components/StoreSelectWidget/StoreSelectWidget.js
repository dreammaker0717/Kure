/**
 * Note: Appears this is no longer used.
 */

import React, { useState } from 'react';
import {
  Box,
  ButtonBase,
  FormHelperText,
  FormControl,
  BottomNavigation,
  BottomNavigationAction,
  Input,
  Dialog,
  Badge,
  IconButton,
} from '@mui/material';
import cameraIcon from 'assets/images/icons/cash-only-icon-two.png';
import { CommonDataIndex, useCommonData } from 'services/context_services/commonDataContext';
import { storeStoreId, storeValidCategoryList } from 'services/storage_services/storage_functions';
import { extractValidCategories } from 'services/idb_services/productManager';
import { postOrderMessage } from 'services/idb_services/orderManager';
import StoreIcon from '@mui/icons-material/Store';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import StoreSelectModal from 'components/StoreSelectModal/StoreSelectModal';
import { async } from 'q';
import { idbSetActiveStoreId } from 'services/idb_services/configManager';

/**
 * @deprecated: Is no longer active.
 *
 * @returns {JSX.Element}
 * @constructor
 */
const StoreSelectWidget = () => {
  const { values: commonData, setValue: setCommonData, setValueObjects: setCommonDataList } = useCommonData();
  const [openStoreSelector, setOpenStoreSelector] = useState(false);
  const stores = commonData[CommonDataIndex.STORES];
  const storeId = commonData[CommonDataIndex.SEL_STORE];
  const storeInfo = stores.find(x => x.store_id == storeId)
  // console.log(stores)
  const onChangeStoreId = async (event) => {
    const store_id = event.target.value;
    const validCategoryList = await extractValidCategories(store_id);

    setCommonDataList({
      [CommonDataIndex.SEL_STORE]: store_id,
      [CommonDataIndex.VALID_CATEGORIES]: validCategoryList
    });

    storeStoreId(store_id);
    await idbSetActiveStoreId(store_id);
    postOrderMessage();
    storeValidCategoryList(store_id, validCategoryList);
  };
  const onClickChangeStore = () => {
    setOpenStoreSelector(true);
  }

  const onSelectedStore = async (store_id) => {
    setOpenStoreSelector(false);
  }
  const onCancelStoreDlg = () => {
    setOpenStoreSelector(false);
  }

  return <>
    <StoreSelectModal
      open={openStoreSelector}
      onOK={onSelectedStore}
      onCancel={onCancelStoreDlg}
    />
    <StoreIcon fontSize="large" />
    {storeInfo && <>
      <Box sx={{ fontSize: { xs: "14px", md: "18px" } }}>
        {storeInfo?.name}
      </Box>
      <IconButton onClick={onClickChangeStore} aria-label="delete" color="primary">
        <OpenInNewIcon sx={{ color: "#32BEB9" }} fontSize="small" />
      </IconButton>
    </>
    }
  </>
  return (
    <Box sx={{ p: '10px 16px 10px 0px', display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
      <Box sx={{ width: { xs: '40px', sm: '52px' }, height: { xs: '40px', sm: '52px' } }}>
        <img src={cameraIcon} style={{ width: '100%', height: '100%' }} alt="" />
      </Box>
      <FormControl sx={{ width: { xs: '180px', sm: 'auto' } }}>
        <FormHelperText sx={{ color: '#f7f7f7', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          Select store:
        </FormHelperText>
        <select
          value={storeId === null ? 2 : storeId}
          onChange={onChangeStoreId}
          style={{
            background: '#272727',
            border: 0,
            fontSize: { xs: '0.875rem', sm: '1rem' },
            color: '#f7f7f7',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {stores.map((store, index) => (
            <option key={index} value={Number(store.store_id)}>
              {store.name}
            </option>
          ))}
        </select>
      </FormControl>
    </Box>
  );
};

export default StoreSelectWidget;
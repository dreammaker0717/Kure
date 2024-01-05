import { Box, Grid, List, Stack, Typography, ListItem, Link, Drawer } from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { Resource } from "../../../services/api_services/Resource";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "components/Toast";
import { firstLetterUpperCase, getDeviceSize } from 'Common/functions';
import { ROUTE } from 'routes/CONSTANTS';
import { idbLogoutUser } from 'services/idb_services/userManager';
import { CommonDataIndex, useCommonData } from 'services/context_services/commonDataContext';
import { DEVICE_SIZE } from 'Common/constants';
import { storeStoreId, storeValidCategoryList } from 'services/storage_services/storage_functions';
import { extractValidCategories } from 'services/idb_services/productManager';
import { eventUserLoggedIn, eventUserSwitchedStores, postOrderMessage } from 'services/idb_services/orderManager';
import StoreSelectModal from 'components/StoreSelectModal/StoreSelectModal';
import { UsersProfileContext } from 'services/context_services/usersProfileContext';
import { idbSetActiveStoreId } from 'services/idb_services/configManager';

const cssDrawerRight = [
  {
    background: 'white',

    width: '98vw',
    maxWidth: '440px',
    minWidth: '250px',

    padding: '10px',
    minHeight: "100vh"
  },
  // open && { right: '0' }
];
const cssH2 = {
  padding: '20px 24px',
  fontSize: '35px',
  fontWeight: 'bold',
  lineHeight: '45px',
  color: 'black'
};
const cssLink = {
  fontSize: '23px',
  fontWeight: 'bold',
  color: '#000',
  ml: '50px',
  cursor: 'pointer'
};
let menuAnonymous = [
  {
    type: 'create_account',
    label: 'Create account',
    path: ROUTE.REGISTER,
  },
  {
    type: 'login',
    label: 'Login',
    path: ROUTE.LOGIN,
  },
];
let menuLoggedIn = [
  {
    type: 'my_account',
    label: 'My account',
    path: '/user',
  },
  {
    type: 'dashboard',
    label: 'Dashboard',
    path: ROUTE.DASHBOARD.OVERVIEW,
  },
  {
    type: 'logout',
    label: 'Logout',
    path: '/user/logout',
  }
];
const resource = new Resource();

function DrawerAccount() {
  const navigate = useNavigate();
  const { values: commonData, setValue: setCommonData, setValueObjects: setCommonDataList } = useCommonData();
  const { profileData, setProfileData } = useContext(UsersProfileContext);
  // console.log("PORFILE DATA: ", profileData);

  const open = commonData[CommonDataIndex.OPEN_ACCOUNT_DRAWER];
  const setOpen = (is_open) => setCommonData(CommonDataIndex.OPEN_ACCOUNT_DRAWER, is_open);
  const stores = commonData[CommonDataIndex.STORES];
  const storeId = commonData[CommonDataIndex.SEL_STORE];
  const storeInfo = stores.find(x => x.store_id == storeId);
  const device = getDeviceSize(commonData[CommonDataIndex.WIDTH])
  const [openStoreSelector, setOpenStoreSelector] = useState(false);

  const user_name = resource.userGetName();

  const [messageToast, setMessageToast] = useState('');

  const isLoggedIn = commonData[CommonDataIndex.IS_LOGGED_IN];

  const menu = useMemo(() => {
    return isLoggedIn ? menuLoggedIn : menuAnonymous
  }, [isLoggedIn])

  const onClickChangeStore = () => {
    setOpenStoreSelector(true);
  }

  const onSelectedStore = async (store_id) => {
    setOpenStoreSelector(false);

    if (device == DEVICE_SIZE.xs) {
      setOpen(false);
    }
  }

  const onCancelStoreDlg = () => {
    setOpenStoreSelector(false);
  }

  const onClickLink = (item) => {
    console.log(item)
    switch (item.type) {
      case 'logout':
        // setProfileData([]);
        idbLogoutUser().then(res => {
          setMessageToast('Logged out successfully');
          setOpen(false);
          navigate(0);
        })
        break;

      default:
        navigate(item.path);
        break;
    }
    if (item.type != 'logout') {
      setOpen(false);
    }
  };
  const drawerAnchor = getDeviceSize(commonData[CommonDataIndex.WIDTH]) == DEVICE_SIZE.xs ? "bottom" : "right"
  return (
    <Drawer anchor={drawerAnchor}
      open={open} onClose={() => setOpen(false)}
    >
      <StoreSelectModal
        open={openStoreSelector}
        onOK={onSelectedStore}
        onCancel={onCancelStoreDlg}
      />
      <Toast messageToast={messageToast} setMessageToast={setMessageToast} />
      <Grid sx={cssDrawerRight}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={0} sx={cssH2}>

          <Typography variant={'h2'}>Hi
            there{user_name == "" ? "" : ", " + firstLetterUpperCase(user_name)}!</Typography>
          <HighlightOffIcon
            sx={{ width: '50px', minHeight: '50px', cursor: 'pointer' }}
            onClick={() => setOpen(false)}
          ></HighlightOffIcon>
        </Stack>
        <List sx={{ mt: '45px' }}>
          <ListItem sx={{ p: '20px' }}>
            <Link onClick={onClickChangeStore} underline="hover"
              sx={cssLink}>
              <Box>
                Change Store
              </Box>
              <Box sx={{ color: 'gray', fontSize: "14px", ml: "20px" }}>
                {storeInfo?.name}
              </Box>
            </Link>
          </ListItem>
          {menu.map((item, index) => (
            <ListItem key={index} sx={{ p: '20px' }}>
              <Link onClick={() => onClickLink(item)} underline="hover"
                sx={cssLink}>
                {item.label}
              </Link>
            </ListItem>
          ))}
        </List>
      </Grid>
    </Drawer>
  );
}

export default DrawerAccount;

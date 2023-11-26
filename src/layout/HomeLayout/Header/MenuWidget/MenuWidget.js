import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Badge,
  Button,
  Tooltip
} from '@mui/material';
import homeIcon from 'assets/images/icons/icon-home.svg';
import cartIcon from 'assets/images/icons/icon-cart.svg';
import emojiIcon from 'assets/images/icons/icon-emoji-sunglasses.svg';
import { CommonDataIndex, useCommonData } from 'services/context_services/commonDataContext';
import {
  eventUserLoggedIn,
  eventUserSwitchedStores,
  getProductCountFromCart,
  postOrderMessage
} from 'services/idb_services/orderManager';
import { ROUTE } from 'routes/CONSTANTS';
import { Resource } from 'services/api_services/Resource';
import { CartDataIndex, useCartData } from 'services/context_services/cartDataContext';
import { broadcastMessage, getDeviceSize } from 'Common/functions';
import { DEVICE_SIZE } from 'Common/constants';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import StoreIcon from '@mui/icons-material/Store';
import { extractValidCategories } from 'services/idb_services/productManager';
import { storeStoreId, storeValidCategoryList } from 'services/storage_services/storage_functions';
import StoreSelectModal from 'components/StoreSelectModal/StoreSelectModal';
import { idbSetActiveStoreId } from 'services/idb_services/configManager';
import { SIG_VALID_CATEGORY_CHANGED } from 'Common/signals';

const style = {
  width: { xs: '35px', sm: '40px' },
  height: { xs: '35px', sm: '40px' },
  color: "#32BEB9",
  m: 0,
  p: 0,
};
const resource = new Resource();
const MenuWidget = () => {
  const { values: commonData, setValue: setCommonData, setValueObjects: setCommonDataList } = useCommonData();
  const { values: cartData, setValue: setCartData, } = useCartData();
  const navigate = useNavigate();
  const cart = cartData[CartDataIndex.CART];
  const cartProductCount = useMemo(() => getProductCountFromCart(cart), [cart]);
  const device = getDeviceSize(commonData[CommonDataIndex.WIDTH]);
  const [openStoreSelector, setOpenStoreSelector] = useState(false);
  const stores = commonData[CommonDataIndex.STORES];
  const storeId = commonData[CommonDataIndex.SEL_STORE];
  const storeInfo = stores.find(x => x.store_id == storeId)

  const onClickChangeStore = () => {
    setOpenStoreSelector(true);
  }

  const onSelectedStore = async (store_id) => {

    setOpenStoreSelector(false);

  }

  const onCancelStoreDlg = () => {
    setOpenStoreSelector(false);
  }

  const checkShowDrawer = (type) => {
    if (type === 'account') {
      setCommonData(CommonDataIndex.OPEN_ACCOUNT_DRAWER, true);
    } else if (type === 'cart') {
      setCommonData(CommonDataIndex.OPEN_CART_DRAWER, true);
    } else if (type == "search") {
      setCommonData(CommonDataIndex.OPEN_SEARCH_PRODUCT_DRAWER, true);
    } else if (type == "store") {
      onClickChangeStore();
    } else {
      navigate(ROUTE.HOME);
    }
  };
  const username = resource.userGetName() ? resource.userGetName() : "ACCOUNT";

  const menu_items = [
    {
      type: 'home',
      label: 'HOME',
      hide_device: "xs,sm,md,lg,xl",
      icon: (
        <Box sx={style}>
          <HomeIcon fontSize="large" />
        </Box>
      )
    },
    {
      type: 'store',
      label: 'STORE',
      hide_device: "",
      icon: (
        <Tooltip title={storeInfo?.name} placement="bottom">
          <Box sx={style}>
            <StoreIcon fontSize="large" />
          </Box>
        </Tooltip>
      )
    },
    {
      type: 'search',
      label: 'SEARCH',
      // hide_device: "sm,md,lg,xl",
      icon: (
        <Box sx={style}>
          <SearchIcon fontSize="large" />
        </Box>
      )
    },

    {
      type: 'cart',
      label: 'CART',
      icon: (
        <Badge color="error" badgeContent={cartProductCount}>
          <Box sx={style}>
            <ShoppingCartIcon fontSize="large" />
          </Box>
        </Badge>
      )
    },
    {
      type: 'account',
      label: username,
      icon: (
        <Box sx={style}>
          <SentimentVerySatisfiedIcon fontSize="large" />
        </Box>
      )
    }
  ];


  return (
    <>
      <StoreSelectModal
        open={openStoreSelector}
        onOK={onSelectedStore}
        onCancel={onCancelStoreDlg}
      />

      <BottomNavigation sx={{ backgroundColor: 'transparent', gap: '20px', alignItems: 'center' }}>
        {menu_items
          .filter(x => !x.hide_device || !x.hide_device.includes(device))
          .map((item, index) => (
            <BottomNavigationAction
              key={index}
              label={device == DEVICE_SIZE.xs ? null : item.label}
              icon={item.icon}
              sx={{
                p: 0,
                minWidth: 'auto',
                height: 'fit-content',
                fontSize: { xs: '0.75rem', sm: '1rem' },
                textTransform: 'uppercase',
                '&:hover': {
                  background: '#353535'
                },
                '& .MuiBottomNavigationAction-label': { color: '#fff', opacity: 1, mt: { xs: 0, sm: '5px' }, fontSize: '0.75rem' }
              }}
              onClick={() => checkShowDrawer(item.type)}
            />
          ))}
      </BottomNavigation>
    </>
  );
};

export default MenuWidget;
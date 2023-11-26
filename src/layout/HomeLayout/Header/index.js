import DrawerAccount from '../Drawer/DrawerAccount';
import DrawerCheckout from '../Drawer/DrawerCheckout';
import HeaderButton from './HeaderButtonSelect';
import DesktopHeader from './DesktopHeader';
import MobileHeader from './MobileHeader';
import { CommonDataIndex, useCommonData } from 'services/context_services/commonDataContext';
import { getDeviceSize } from 'Common/functions';
import { DEVICE_SIZE } from 'Common/constants';
import DrawerSearchProducts from '../Drawer/DrawerSearchProducts/DrawerSearchProducts';
import { extractValidCategories } from "services/idb_services/productManager";
import { storeStoreId, storeValidCategoryList } from "services/storage_services/storage_functions";
import { idbSetActiveStoreId } from "services/idb_services/configManager";
import { postOrderMessage } from "services/idb_services/orderManager";

function Header() {
  const { values: commonData } = useCommonData();
  const device = getDeviceSize(commonData[CommonDataIndex.WIDTH]);

  return (
    <>
      {
        device == DEVICE_SIZE.xs
          ? <MobileHeader/>
          : <DesktopHeader/>
      }

      <DrawerAccount/>
      <DrawerCheckout/>
      <DrawerSearchProducts/>
      <HeaderButton/>
    </>
  );
}

export default Header;

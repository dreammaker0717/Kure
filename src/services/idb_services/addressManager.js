import { IDB_TABLES, KureDatabase } from 'services/idb_services/KureDatabase';
import { Resource } from 'services/api_services/Resource';
import { broadcastMessage, generateKey, getUUID, toastPrepareMessage } from 'Common/functions';
import { SIG_ADDRESS_LIST_CHANGED } from 'Common/signals';
import { getLoggedInUserId } from 'services/storage_services/storage_functions';
import { getSelectedCustomer, addUpdateCustomerData } from './customerManager';
import { getCart } from './orderManager';

//const resource = new Resource();
const db = new KureDatabase();

// export const postUserAddressMessage = (data = '') => {
//   broadcastMessage(SIG_ADDRESS_LIST_CHANGED, data);
// };
// export const updateUserAddress = async (address_info, search_user_id = null) => {
//   const user_id = search_user_id == null ? getLoggedInUserId() : search_user_id;
//   if (user_id === null) return toastPrepareMessage(false, null, "Please login first.");
//
//   const keys = Object.keys(address_info);
//   // if it's new data
//   if (!keys.includes("user_id")) {
//     address_info['user_id'] = user_id;
//   }
//   const res = await db.userAddressData().updateOrAdd(address_info);
//   postUserAddressMessage();
//   return toastPrepareMessage(true, res);
// }
// export const getUserAddressList = async (search_user_id = null) => {
//   const user_id = search_user_id == null ? getLoggedInUserId() : search_user_id;
//   if (user_id === null) return toastPrepareMessage(false, null, "Please login first.");
//
//   let adrList = await db.userAddressData().getAll();
//   adrList = adrList.filter(x => x.user_id == user_id);
//   return toastPrepareMessage(true, adrList);
// }
export const addOrUpdateOneAddress = async (address_info, profileData) => {
  // console.log("update profileData: ", profileData);
  console.log("update address_info: ", address_info)
  const cart_info = await getCart();
  console.log('cart_info: ', cart_info);
  if (cart_info.status == false) return toastPrepareMessage(false, null, "Cart not found.");
  const customer_id = cart_info.data.customer_id;
  if (customer_id == null) return toastPrepareMessage(false, null, "Customer not found.");
  let old_uuid = address_info['profile_id'];
  if (address_info['profile_id'] != address_info['profile_id_react']) {
    address_info['profile_id_react'] = getUUID();
  }
  const tmpProfile = { ...profileData };
  let customer = tmpProfile[customer_id];
  let addresses = { ...customer.user_addresses };
  addresses[old_uuid] = {
    phone: address_info.phone,
    address: address_info,
  };
  console.log("Old address: ", { ...addresses })
  customer.user_addresses = { ...addresses };
  tmpProfile.customer_id = customer;
  const new_customer_res = await addUpdateCustomerData(customer, true);
  console.log("new_customer_res, ", new_customer_res)
  if (new_customer_res.status == 200) {
    const new_customer = new_customer_res.data;
    const new_addresses = new_customer.user_addresses;
    if (new_addresses[old_uuid] && new_addresses[old_uuid].data) {
      const new_uuid = new_addresses[old_uuid].data;
      // change uuid to new one
      addresses[new_uuid] = {
        phone: address_info.phone,
        address: {
          ...address_info,
          profile_id: new_uuid,
          profile_id_react: null,
        }
      };

      // delete old
      console.log("will remove old_uid", { ...addresses }, old_uuid)
      delete addresses[old_uuid];
      console.log("removed old_uid", { ...addresses })
      // update all carts that use old_uuid;
      const all_orders = await db.getAll(IDB_TABLES.commerce_order);
      const focusing_orders = all_orders.filter(x => x.billing_profile && x.billing_profile.old_uuid);
      for (let i = 0; i < focusing_orders; i++) {
        await db.put(
          [{
            ...focusing_orders[i],
            billing_profile: {
              [new_uuid]: addresses[new_uuid]
            }
          }],
          IDB_TABLES.commerce_order
        )
      }

      old_uuid = new_uuid;
    }
  }

  customer.user_addresses = { ...addresses };
  tmpProfile.customer_id = { ...customer };
  await db.put([customer], IDB_TABLES.customer_data);
  console.log("New address: ", { ...addresses })
  return toastPrepareMessage(true, {
    "new_profile_data": tmpProfile,
    "new_address": addresses[old_uuid],
    "new_uid": old_uuid,
  });
}

//
// export const updateCurAddress = async (address_info, search_user_id = null) => {
//   const user_id = search_user_id == null ? getLoggedInUserId() : search_user_id;
//   if (user_id === null) return toastPrepareMessage(false, null, "Please login first.");
//
//   let sel_customer = await getSelectedCustomer();
//   if (sel_customer == null) {
//     address_info['user_id'] = user_id;
//     await db.userAddressData().updateOrAdd(address_info);
//   } else {
//     const index = sel_customer['user_addresses'].findIndex(x => x['place_id'] == address_info['place_id']);
//     if (index == undefined) return;
//     sel_customer['user_addresses'][index] = { ...address_info };
//     await addUpdateCustomerData(sel_customer);
//   }
//
//   postUserAddressMessage();
//   return toastPrepareMessage(true);
// }
//
// /**
//  * @deprecated: No longer needed.
//  *
//  * @param search_user_id
//  * @returns {Promise<{data: null, message: string, status: boolean}>}
//  */
// export const getCurAddressList = async (search_user_id) => {
//   const user_id = search_user_id == null ? getLoggedInUserId() : search_user_id;
//
//   if (user_id === null) return toastPrepareMessage(false, null, "Please login first.");
//
//   const sel_customer = await getSelectedCustomer();
//   let adr_list = [];
//   if (sel_customer == null) {
//     adr_list = await db.userAddressData().getAll();
//     adr_list = adr_list.filter(x => x.user_id == user_id);
//   } else {
//     adr_list = sel_customer['user_addresses'];
//   }
//   return toastPrepareMessage(true, adr_list);
// }
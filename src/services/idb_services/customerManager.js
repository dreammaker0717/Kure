import {
  backgroundServiceMessenger,
  broadcastMessage,
  decryptData,
  encryptData,
  generateKey,
  getGUID,
  MySleep
} from "Common/functions";
import {
  SIG_AUTH_CHANGED,
  SIG_FINISH_REQUEST_USERS_PROFILE,
  SIG_ON_REFRESH_CART,
  SIG_REFILL_CUSTOMER_DATA,
  SIG_STORE_DATA_FETCHED,
  SIG_TOKENWORKS_SYNCED
} from "Common/signals";
import { Resource } from "services/api_services/Resource";
import { IDB_TABLES, KureDatabase } from "./KureDatabase";

/**
 * Anytime someone changes the user profile data, we save it here. We'll later use this IDB table to sync
 * the data to Drupal.
 *
 * @param selected_customer
 * @param only_address
 * @returns {Promise<void>}
 */
export const addUpdateCustomerData = async (selected_customer, only_address = false) => {
  const db = new KureDatabase();
  console.log("----------pppppp----------------");
  console.log(selected_customer);
  // We flag the record as being updated. Technically, this customer record may not have changed but we'll mark
  // it as changed anyway.
  selected_customer.has_changed = true;

  const { medical_user_info } = selected_customer;
  const field_medical_license_documents = medical_user_info ? medical_user_info.field_medical_license_documents : []
  let _customer = {
    ...selected_customer,
    medical_user_info: {
      ...medical_user_info,
      field_medical_license_documents: field_medical_license_documents,
      medical_ids: field_medical_license_documents
    }
  }

  await db.put([_customer], IDB_TABLES.customer_data);
  let sync_with_drupal = await syncOneCustomerWithDrupal(selected_customer, only_address);
  
  let new_tokenworks_customer;
  console.log("sync_with_drupal==", sync_with_drupal);

  if (sync_with_drupal.status) {   // online
    new_tokenworks_customer = sync_with_drupal.data;
  }else { //offline
    new_tokenworks_customer = selected_customer;
  }

  await linkAndUnlinkTokenWorksCustomer(new_tokenworks_customer, db);

  console.log("sync_with_drupal====", sync_with_drupal);
  return sync_with_drupal;
}

export const linkAndUnlinkTokenWorksCustomer = async (tokenworks_customer, db) => {
  if (tokenworks_customer.tokenworks_customer_id === "") {
    let unlink_customer = await db.getAllFromIndexList({ uid: tokenworks_customer.uid }, IDB_TABLES.tokenworks);
    let updated_unlink_customer = { ...unlink_customer[0], uid: null, mail: null };
    await db.updateOrAdd(updated_unlink_customer, IDB_TABLES.tokenworks);
  } else {
    //Remove link
    let unlink_customer = await db.getAllFromIndexList({ uid: tokenworks_customer.uid }, IDB_TABLES.tokenworks);
    if (unlink_customer.length > 0) {
      let updated_tokenworks_item = { ...unlink_customer[0], uid: null, mail: null };
      await db.updateOrAdd(updated_tokenworks_item, IDB_TABLES.tokenworks);
    }

    //Add link
    let link_customer = await db.getAllFromIndexList({ customer_id: tokenworks_customer.tokenworks_customer_id }, IDB_TABLES.tokenworks);
    if (link_customer.length > 0) {
      let updated_tokenworks_item = { ...link_customer[0], uid: tokenworks_customer.uid, mail: tokenworks_customer.mail };
      await db.updateOrAdd(updated_tokenworks_item, IDB_TABLES.tokenworks);
    }
  }

  return;
}

/**
 * Return all customer's profiles from the IDB table.
 *
 * @returns {Promise<*|null>}
 */
export const getCustomerDataAll = async () => {
  const db = new KureDatabase();
  const customers = await db.getAll(IDB_TABLES.customer_data);
  return customers;
}

export const getCustomerDataByUid = async (customer_id) => {
  const db = new KureDatabase();
  return await db.getAllFromIndexList({ uid: customer_id }, IDB_TABLES.customer_data);
}

export const initTokenworksList = async () => {
  /**
   * @TODO: This Tokenworks function appears to be causing conflicts with other pieces of code.
   */
  // const count = await db.count(IDB_TABLES.customer_data);
  // if (count > 0) {
  //   // remove all previous selected tokenwork when site is opened.
  //   // if not, the selected customer will be remained and users will be confused.
  //   const data = await db.getAll(IDB_TABLES.customer_data);
  //   await db.put(data.map(x => ({ ...x, is_selected: false })), IDB_TABLES.customer_data);
  // }
  // /**
  //  * @TODO: I think this is incorrect, we're not selecting any customer here.
  //  */
}

export const removeSelectedCustomer = async (customer_id) => {
  const db = new KureDatabase();
  //await initTokenworksList();
  // const count = await db.count(IDB_TABLES.customer_data);
  // if (count > 0) {
  //   // remove all previous selected tokenwork when site is opened.
  //   // if not, the selected customer will be remained and users will be confused.
  //   const data = await db.getAll(IDB_TABLES.customer_data);
  //   await db.put(data.map(x => ({ ...x, is_selected: false })), IDB_TABLES.customer_data);
  // }

  return db.deleteAllByIdList([customer_id], IDB_TABLES.customer_data);
}

export const syncWithDrupal = async (uid) => {
  console.log('synching customer', uid);
  if (uid.includes("new") == false) {
    // this shows that customer is not new.
    return;
  }
  //  customer info
  const stored_info = await db.get(uid, IDB_TABLES.users_profile_data);
  console.log('to be synch data:  ', stored_info);
  if (stored_info == undefined) {
    return;
  }
  const { profile_id_react, data, user_id } = stored_info;
  if (profile_id_react == undefined) {
    // in the case profile_id_react is empty, we can't identify
    return;
  }
  const dec_data = JSON.parse(decryptData(data));
  const customer_info = {
    uid: user_id,
    profile_id_react: profile_id_react,
    ...dec_data
  }
  console.log('to be synch data - decrypted:  ', customer_info);
  // sync
  const resource = new Resource();
  const sync_res = await resource.createUpdateCustomer(customer_info);
  //console.log('drupal id:  ', sync_res);
  // get new uid
  //const new_uid = sync_res['data'];

  //await db.replaceIndex(uid, new_uid, IDB_TABLES.users_profile_data);
  //broadcastMessage(SIG_USERS_PROFILE_ID_CHANGED, {
  //  old_id: uid,
  //  new_id: new_uid
  //})
  // updateCustomerRawData(new_uid);
}

/**
 * @deprecated: This shouldn't be used. We should never touch the users_profile_data IDB table unless it is to fetch
 *              new data.
 *
 * @param new_uid
 * @returns {Promise<void>}
 */
export const updateCustomerRawData = async (new_uid) => {
  const db = new KureDatabase();

  console.log('changing index ');
  //  customer info
  const stored_info = await db.get(new_uid, IDB_TABLES.users_profile_data);
  if (stored_info == undefined) {
    return;
  }
  console.log('stored_info: ', stored_info)
  const { profile_id_react, data, user_id } = stored_info;

  if (profile_id_react == undefined) {
    // in the case profile_id_react is empty, we can't identify
    return;
  }
  // get customer raw data
  const customer_raw_list = await db.getAllFromValueList('profile_id_react', [profile_id_react], IDB_TABLES.customer_data);
  console.log('same list: ', customer_raw_list);
  if (customer_raw_list.length == 0) return;
  const customer_raw = customer_raw_list[0];
  const old_id = customer_raw['uid'];
  console.log('old_id:', old_id)
  await db.replaceIndex(old_id, new_uid, IDB_TABLES.customer_data)
}

//
// function customerManagerPushNotificationFromServer(data) {
//   console.log('customerManagerPushNotificationFromServer():', data);
// }
//
// navigator.serviceWorker.addEventListener('message', event => {
//   if (event.data.type === 'push_notification') {
//     customerManagerPushNotificationFromServer(event.data.data);
//   }
// });

/**
 * This function is executed by the service worker. It is responsible for syncing customer data to Drupal.
 * @returns {Promise<void>}
 */

export const syncOneCustomerWithDrupal = async (customer, only_address = false) => {

  const db = new KureDatabase();
  const resource = new Resource();
  return await resource.createUpdateCustomer(customer).then(async (toast_response) => {
    console.log('!!!toast_response', toast_response);
    const { status, data, message } = toast_response;
    if (status != 200) {
      return toast_response;
    }
    if (only_address) {
      return toast_response;
    }

    const customer_new_data = { ...customer };
    const customer_old_data = { ...customer };

    customer_new_data.uid = data.uid;
    customer_new_data.uid_react = null;
    customer_new_data.has_changed = false;

    // Because our customer object now has a Drupal UID, let's update it. We must create a new object because
    // our IDB table uses the UID as the primary key.
    await db.put([customer_new_data], IDB_TABLES.customer_data);

    // Remove customer_old_data from IDB.
    if (customer_old_data.uid === customer_old_data.uid_react) {
      await db.deleteAllByIdList([customer_old_data.uid], IDB_TABLES.customer_data);
    }
    return {
      status: true,
      data: customer_new_data,
      message: null,
    }
  }).catch(err => {
    console.log("syncOneCustomerWithDrupal error: ", err.message);
    return {
      status: false,
      data: null,
      message: err.message
    }
  })
  // const toast_response = await resource.createUpdateCustomer(_customer);
}

export const syncCustomersWithDrupal = async () => {
  console.log("syncCustomersWithDrupal Method");
  const db = new KureDatabase();
  const customers = await db.getAll(IDB_TABLES.customer_data);
  const customers_to_sync = customers.filter(customer => customer.has_changed === true);
  // console.log('customers_to_sync', customers_to_sync);
  let changed_customers = {};
  if (customers_to_sync.length > 0) {
    await Promise.all(customers_to_sync.map(async customer => {
      // const { medical_user_info } = customer;
      // const field_medical_license_documents = medical_user_info ? medical_user_info.field_medical_license_documents : []
      // let _customer = {
      //   ...customer,
      //   medical_user_info: {
      //     ...medical_user_info,
      //     field_medical_license_documents: field_medical_license_documents,
      //     medical_ids: field_medical_license_documents
      //   }
      // }
      const { status, data, message } = await syncOneCustomerWithDrupal(customer);
      if (status == true) {
        changed_customers[customer.uid] = data.uid;
      }
    }));
  }

  // @TODO: I Need to change customer information of orders. IMPORTANT: In the orderManager.js file, it references this
  //        file. So I need to manage orders here.

  // We just finished syncing customer data to Drupal. The customer IDs might have changed. We need to update the
  // customer IDs in the orders table.

  // Convert to an array.
  const old_customer_id_list = Object.keys(changed_customers);
  if (old_customer_id_list.length == 0) {
    return;
  }

  // Find all array values that match a customer_id.
  const orders = (await db.getAll(IDB_TABLES.commerce_order)).filter(x => old_customer_id_list.includes(x.customer_id));
  for (let i = 0; i < orders.length; i++) {
    // Update customer_id or GUID to a Drupal UID.
    orders[i].customer_id = changed_customers[orders[i].customer_id];
  }
  await db.put(orders, IDB_TABLES.commerce_order);

  broadcastMessage(SIG_ON_REFRESH_CART, null);
  broadcastMessage(SIG_REFILL_CUSTOMER_DATA, null);
}
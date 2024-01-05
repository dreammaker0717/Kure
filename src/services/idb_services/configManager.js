import { getLoggedInUserId } from "services/storage_services/storage_functions";
import { IDB_TABLES, KureDatabase } from "./KureDatabase";
import { broadcastMessage, getGUID } from "Common/functions";
import { SIG_TOGGLE_SIDEBAR } from "Common/signals";
import { USER_TYPE } from "Common/constants";

const init_configuration = {
  sidebar: true,
}

export const CONFIG_CONSTANTS = {
  ACTIVE_CART_ID: "ACTIVE_CART_ID",
  ACTIVE_STORE_ID: "ACTIVE_STORE_ID",
  CART_HISTORY: "CART_HISTORY",
  LOGGED_IN_USER: "LOGGED_IN_USER",
  IS_ONLINE: "IS_ONLINE",
  PROFILE_SYNC_INFO: "PROFILE_SYNC_INFO",
  TOKEN: 'token',
}

export const idbGetProfileSyncInfo = async () => {
  const db = new KureDatabase();
  const data = await db.get(CONFIG_CONSTANTS.PROFILE_SYNC_INFO, IDB_TABLES.config_data);
  if (!data || data == undefined) {
    return null;
  }

  // return JSON.parse(data['value'])
  return data['value'];
}

export const idbSetProfileSyncInfo = async (sync_info) => {
  const db = new KureDatabase();
  await db.put(
    [{
      name: CONFIG_CONSTANTS.PROFILE_SYNC_INFO,
      value: sync_info
      // value: JSON.stringify(sync_info)
    }],
    IDB_TABLES.config_data
  );
}

export const idbGetProfileSyncTime = async () => {
  const sync_info = await idbGetProfileSyncInfo();
  if (!sync_info) return null;
  return sync_info['updated_at'];
}

export const idbSetProfileSyncTime = async (time = null) => {
  let sync_info = await idbGetProfileSyncInfo();
  if (!sync_info) sync_info = {};

  sync_info['updated_at'] = time ? time : Date.now();
  idbSetProfileSyncInfo(sync_info)
}

export const idbInitProfileSync = async (total) => {
  let sync_info = {
    "updated_at": Date.now(),
    "total": total,
    "synced": [],
    "decrypted": [],
  };
  await idbSetProfileSyncInfo(sync_info);
}

export const idbAddProfileSyncNo = async (page_no) => {
  let sync_info = await idbGetProfileSyncInfo();
  if (!sync_info) {
    sync_info = {
      "updated_at": Date.now(),
      "total": 0,
      "synced": [],
      "decrypted": [],
    };
  }
  sync_info['synced'].push(page_no);
  await idbSetProfileSyncInfo(sync_info);
}
export const idbGetProfileSyncExistingNoList = async () => {
  const sync_info = await idbGetProfileSyncInfo();
  if (!sync_info) return [];
  return sync_info['synced'];
}

export const idbAddProfileDecrypted = async (page_no) => {
  let sync_info = await idbGetProfileSyncInfo();
  if (!sync_info) {
    sync_info = {
      "updated_at": Date.now(),
      "total": 0,
      "synced": [],
      "decrypted": [],
    };
  }
  if (!sync_info['decrypted']) {
    sync_info['decrypted'] = [];
  }
  sync_info['decrypted'].push(page_no);
  await idbSetProfileSyncInfo(sync_info);
}
export const idbGetProfileDecryptedList = async () => {
  const sync_info = await idbGetProfileSyncInfo();
  if (!sync_info) return [];
  return sync_info['decrypted'];
}

export const idbGetConfig = async () => {
  const db = new KureDatabase();
  const user_id = getLoggedInUserId();
  const config = await db.get(user_id, IDB_TABLES.config_data);
  if (config != undefined) {
    return config;
  }

  await db.put([{
    user_id: user_id,
    ...init_configuration
  }], IDB_TABLES.config_data);
  return await db.get(user_id, IDB_TABLES.config_data);
}

export const idbSetConfig = async (info) => {
  const db = new KureDatabase();
  let config = await idbGetConfig();
  config = {
    ...config,
    ...info
  }
  await db.put([config], IDB_TABLES.config_data);
  return true;
}

export const idbSetIsOnline = async (is_online) => {
  const db = new KureDatabase();
  await db.put([{ name: CONFIG_CONSTANTS.IS_ONLINE, value: is_online }], IDB_TABLES.config_data);
}

export const idbGetIsOnline = async () => {
  const db = new KureDatabase();
  const data = await db.get(CONFIG_CONSTANTS.IS_ONLINE, IDB_TABLES.config_data);
  if (!data || data == undefined) {
    return true;
  }
  // Now parse the data. It's in JSON string format.
  return JSON.parse(data['value']);
}

export const idbSetActiveCart = async (cart_id) => {
  const db = new KureDatabase();
  const store_id = await idbGetActiveStoreId();
  let store_list = await idbGetActiveCartList();
  // If the user loaded into the page for the first time, no data will exist.
  if (store_list == null || store_list == undefined) {
    store_list = {
      [store_id]: cart_id
    };
  } else {
    store_list[store_id] = cart_id;
  }

  await db.put([{ name: CONFIG_CONSTANTS.ACTIVE_CART_ID, value: store_list }], IDB_TABLES.config_data);
}

export const idbGetActiveCartList = async () => {
  const db = new KureDatabase();
  const data = await db.get(CONFIG_CONSTANTS.ACTIVE_CART_ID, IDB_TABLES.config_data);
  if (!data || data == undefined) {
    return null;
  }

  return data['value'];
}

export const idbGetActiveCartId = async () => {
  const db = new KureDatabase();
  const data = await db.get(CONFIG_CONSTANTS.ACTIVE_CART_ID, IDB_TABLES.config_data);
  if (!data || data == undefined) {
    return null;
  }
  const store_id = await idbGetActiveStoreId();
  return data['value'][store_id];
}

export const idbSetLoggedInUser = async (user_info) => {
  const db = new KureDatabase();
  await db.put([{ name: CONFIG_CONSTANTS.LOGGED_IN_USER, value: user_info }], IDB_TABLES.config_data);
}

export const idbGetLoggedInUser = async () => {
  const db = new KureDatabase();
  const data = await db.get(CONFIG_CONSTANTS.LOGGED_IN_USER, IDB_TABLES.config_data);
  if (!data || data == undefined) {
    return null;
  }
  // Now parse the data. It's in JSON string format.
  return JSON.parse(data['value']);
}

export const idbGetUserRole = async () => {
  let user_info = await idbGetLoggedInUser();
  if (!user_info) return null;
  if (user_info?.roles?.includes(USER_TYPE.KURE_EMPLOYEE) || user_info?.roles?.includes(USER_TYPE.ADMIN)) {
    return USER_TYPE.KURE_EMPLOYEE;
  }
  // A customer is not an employee or an admin. We seem it's a customer if they are authenticated.
  else if (!user_info?.roles?.includes(USER_TYPE.KURE_EMPLOYEE) && !user_info?.roles?.includes(USER_TYPE.ADMIN) &&
    user_info?.roles?.includes(USER_TYPE.CUSTOMER)) {
    return USER_TYPE.CUSTOMER;
  }
  // They must not be authenticated/signed in.
  return null;
}

export const idbSetActiveStoreId = async (store_id) => {
  const db = new KureDatabase();
  await db.put([{ name: CONFIG_CONSTANTS.ACTIVE_STORE_ID, value: store_id }], IDB_TABLES.config_data);
}
export const idbGetOrderHistory = async () => {
  const db = new KureDatabase();
  let data = await db.get(CONFIG_CONSTANTS.CART_HISTORY, IDB_TABLES.config_data);
  if (!data || data == undefined) {
    data = []
  } else {
    data = data['value'].split(",");
  }
  let filtered_data = [];
  for (let i = 0; i < data.length; i++) {
    if (!filtered_data.includes(data[i])) {
      filtered_data.push(data[i]);
    }
  }
  return filtered_data;
}

export const idbAddOrderIdHistory = async (cart_id) => {
  const db = new KureDatabase();
  let data = await idbGetOrderHistory();
  if (data.length > 0 && data[0] == cart_id) {
    return;
  }
  data = [`${cart_id}`, ...data];
  data = data.join(",");
  console.log("history: ", data);
  await db.put([{ name: CONFIG_CONSTANTS.CART_HISTORY, value: data }], IDB_TABLES.config_data);
}

/**
 * Return the user's current store ID (Lake Mendocino, South, Kits, ...etc). Returns 2 (Lake Mendocino) if not set.
 *
 * @returns {Promise<*|string>}
 */
export const idbGetActiveStoreId = async () => {
  const db = new KureDatabase();
  const data = await db.get(CONFIG_CONSTANTS.ACTIVE_STORE_ID, IDB_TABLES.config_data);
  if (!data || data == undefined) {
    await idbSetActiveStoreId("2");
    return "2";
  }
  return data['value'];
}
export const idbToggleSidebar = async (is_open = undefined) => {
  let open = is_open;
  if (open == undefined) {
    const config = await idbGetConfig();
    open = !config.sidebar;
  }
  await idbSetConfig({ sidebar: open });
  broadcastMessage(SIG_TOGGLE_SIDEBAR)
}

/**
 * Based on a list of IDs, delete them from the config IDB table. See idbResetConfigAll(),
 *
 * @param ids_to_delete
 * @returns {Promise<void>}
 */
export const idbResetConfig = async (ids_to_delete) => {
  const db = new KureDatabase();
  console.log("WILL DELETE");
  await db.deleteAllByIdList(ids_to_delete, IDB_TABLES.config_data);

  /**
   * The code below shouldn't exist here. If we are going to remove specific rows from the config table, we should
   * have this functionality in a different function.
   */
  // // update users profile sync data
  // let sync_info = await idbGetProfileSyncInfo();
  // if (!sync_info) return;
  // sync_info = {
  //   ...sync_info,
  //   decrypted: []
  // };
  // await db.put([{
  //   name: CONFIG_CONSTANTS.PROFILE_SYNC_INFO,
  //   value: sync_info
  // }], IDB_TABLES.config_data);
}

export const idbResetConfigAll = () => {
  return [
    // CONFIG_CONSTANTS.ACTIVE_CART_ID,
    // CONFIG_CONSTANTS.ACTIVE_STORE_ID,
    CONFIG_CONSTANTS.CART_HISTORY,
    CONFIG_CONSTANTS.LOGGED_IN_USER,
    CONFIG_CONSTANTS.IS_ONLINE,
    // CONFIG_CONSTANTS.PROFILE_SYNC_INFO,
    CONFIG_CONSTANTS.TOKEN,
  ];
}
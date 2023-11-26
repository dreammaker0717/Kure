import { localStorageCashier, localStorageCashierName, localStorageUserKey } from "./CONSTANTS";

const getStorageUserInfo = () => {
  const drupal_user_info = localStorage.getItem(localStorageUserKey);
  if (drupal_user_info == null) return null;
  return JSON.parse(drupal_user_info);
}

export const getLoggedInUserId = () => {
  const drupal_user_info = getStorageUserInfo();
  if (drupal_user_info === null) {
    return null;
  }
  const { name, uid } = drupal_user_info;
  if (uid === undefined) {
    return null;
  }
  return uid;
}

export const storeGetCashierId = () => {
  // If the cashier_id is not set, return null. Doing this avoids the cashier_id being set to "null" - a string!
  if (localStorage.getItem(localStorageCashier) !== 'null') {
    return localStorage.getItem(localStorageCashier);
  } else {
    return null;
  }
}

export const storeSetCashierId = (cashier_id) => {
  return localStorage.setItem(localStorageCashier, cashier_id);
}

export const storeClearCashierId = () => {
  localStorage.removeItem(localStorageCashier);
}


/**
 * @deprecated: Is this function suppose to be deprecated? I ask because we're now using config_data to
 *              save the store_id.
 *
 * @param store_id
 */
export const storeStoreId = (store_id) => {
  localStorage.setItem('store_id', store_id)
}
/**
 * If no store_id is set, return 2 (the default store).
 * @returns {string|number}
 */
export const getStoreId = () => {
  return parseInt(localStorage.getItem('store_id') || 2);
}

/**
 * A new user will not have this storage item set. Display the age gate by default.
 *
 * Note: this function acts as a setter/getter. Send it a value to set it, and don't send a value to get it.
 * @returns {string|boolean}
 */
export const ageGate = (set_value = null) => {
  if (set_value == null) {
    if (localStorage.getItem('display_age_gate')) {
      // We must check on the string value, not the boolean value. This is because locaStorage stores/returns strings.
      return localStorage.getItem('display_age_gate') === 'true';
    }
    return true;
  } else {
    localStorage.setItem('display_age_gate', set_value);
  }
}

export const storeValidCategoryList = (store_id, category_list) => {
  const value_list = category_list.map(x => x.value);
  const value_str = store_id + "-" + value_list.join(",");
  localStorage.setItem('v_cat', value_str);
}

export const getValidCategoryList = (store_id) => {
  if (store_id == null) return null;
  const cat_str = localStorage.getItem('v_cat');
  if (cat_str == null || cat_str == "") return null;
  const tmp_list = cat_str.split("-");
  if (tmp_list[0] != store_id) {
    return null;
  }
  if (tmp_list.length < 2) {
    return null;
  }
  return tmp_list[1].split(",")
}

export const storeLastProductCount = (count) => {
  localStorage.setItem('last_count', count);
}

export const storeSetCashierName = (name) => {
  localStorage.setItem(localStorageCashierName, name);
}
export const storeGetCashierName = (default_value = "") => {
  const name = localStorage.getItem(localStorageCashierName);
  if (!name) return default_value;
  return name;
}

export const getLastProductCount = () => {
  const v = localStorage.getItem('last_count');
  if (v != null) {
    return parseInt(v);
  }
  return null;
}

export const clearAllStorage = () => {
  localStorage.clear();
}

export const clearAuthInfo = () => {
  localStorage.removeItem("drupal-oauth-token");
}
export const SIG_CHANNEL = "kure-app";
export const SIG_RECEIVE_NOTIFICATION = "SIG_RECEIVE_NOTIFICATION";
export const SIG_ALL_PRODUCT_FETCHED = "SIG_ALL_PRODUCT_FETCHED";
export const SIG_CHANGED_STORE = "SIG_CHANGED_STORE";
export const SIG_ADDRESS_LIST_CHANGED = "SIG_ADDRESS_LIST_CHANGED"; // this signal is when an employee changes his address. should be used in the future.
export const SIG_VALID_CATEGORY_CHANGED = "SIG_VALID_CATEGORY_CHANGED";
export const SIG_AUTH_CHANGED = "SIG_AUTH_CHANGED";
export const SIG_STORE_DATA_FETCHED = "SIG_STORE_DATA_FETCHED";
export const SIG_CUSTOMER_SELECTED = "SIG_CUSTOMER_SELECTED";
export const SIG_CUSTOMER_REMOVED = "SIG_CUSTOMER_REMOVED";
export const SIG_CUSTOMER_UPDATED = "SIG_CUSTOMER_UPDATED";
export const SIG_CUSTOMER_CREATED = "SIG_CUSTOMER_CREATED";
export const SIG_REFILL_CUSTOMER_DATA = "SIG_REFILL_CUSTOMER_DATA";
export const SIG_CUSTOMER_SYNCED = "SIG_CUSTOMER_SYNCED";
export const SIG_TOKENWORKS_SYNCED = "SIG_TOKENWORKS_SYNCED";
export const SIG_MESSAGE_MODAL_OPEN = "SIG_MESSAGE_MODAL_OPEN";

/**
 * This signal occurs when:When a user logs in.
 * 1) When a user logs in.
 *
 * @type {string}
 */
export const SIG_REQUEST_USERS_PROFILE = "SIG_REQUEST_USERS_PROFILE";
export const SIG_FINISH_REQUEST_USERS_PROFILE = "SIG_FINISH_REQUEST_USERS_PROFILE";
export const SIG_REQUEST_COUPON_DATA = "SIG_REQUEST_COUPON_DATA";
export const SIG_ONE_CUSTOMER_RECEIVED = "SIG_ONE_CUSTOMER_RECEIVED"; // this is to sync the context from the customer data based on push notification fro drupal.

/**
 * Can manage adjustment tax, shipping, promotion data.
 * @type {string}
 */
export const SIG_REQUEST_ADJUSTMENT_DATA = "SIG_REQUEST_ADJUSTMENT_DATA";
export const SIG_USERS_PROFILE_ID_CHANGED = "SIG_USERS_PROFILE_ID_CHANGED";


//////// IMPORTANT
export const SIG_DRUPAL_COMPLETE_ORDER = "SIG_DRUPAL_COMPLETE_ORDER";  // signal when drupal send notification sync is finished

// export const SIG_ORDER_CHECKED_OUT = "SIG_ORDER_CHECKED_OUT";
// export const SIG_CHECKOUT_PREPARE = "SIG_CHECKOUT_PREPARE";
export const SIG_ON_REFRESH_CART = "SIG_ON_REFRESH_CART";

export const SIG_CHECKOUT_COMPLETE = "SIG_CHECKOUT_COMPLETE";   // this is when the order is synched with drupal


export const SIG_ORDER_SYNCHED = "SIG_ORDER_SYNCHED";
export const SIG_ORDERS_SYNCHED = "SIG_ORDERS_SYNCHED";
export const SIG_ORDER_LIST_CHANGED = "SIG_ORDER_LIST_CHANGED";
export const SIG_SYNCED_ORDERS_CONFIRM_MODAL = "SIG_SYNCED_ORDERS_CONFIRM_MODAL";
export const SIG_ON_REFRESH_MESSAGE = "SIG_ON_REFRESH_MESSAGE";
export const SIG_PRODUCT_STOCK_CHANGED = "SIG_PRODUCT_STOCK_CHANGED";
export const SIG_CASH_AMOUNT_PANEL = "SIG_CASH_AMOUNT_PANEL";

/**
 * @deprecated: We're now using the cart object's state. When finished we set the order state to 'completed'.
 * @type {string}
 */



// signals for config manager
export const SIG_TOGGLE_SIDEBAR = "SIG_TOGGLE_SIDEBAR";

export const SIG_FETCH_USER_PROFILE_DATA = "SIG_FETCH_USER_PROFILE_DATA";
export const SIG_PARSE_USER_PROFILE_DATA = "SIG_PARSE_USER_PROFILE_DATA";

// DB updates.
export const SIG_DB_UPDATE_5 = "SIG_DB_UPDATE_5";
export const SIG_DB_UPDATE_7 = "SIG_DB_UPDATE_7";
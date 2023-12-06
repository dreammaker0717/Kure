/**
 * Events that require changes to the cart state:
 * 1. User adds an item to their cart and the cart is currently null.
 * 2. User logged in, merge carts.
 * 3. User switched stores.
 * 4. Order was submitted.
 * 5. User clicks on an order from the notification panel.
 */

import {
  broadcastMessage,
  generateKey,
  getGUID,
  toastPrepareMessage,
  MySleep,
  convertToNumber,
  getCalculatedCartTotals
} from 'Common/functions';
import {
  SIG_ON_REFRESH_CART,
  SIG_ORDER_SYNCHED,
  SIG_ORDER_LIST_CHANGED
} from 'Common/signals';
import { getStoreId, getLoggedInUserId, storeGetCashierId } from 'services/storage_services/storage_functions';
import { IDB_TABLES, KureDatabase } from 'services/idb_services/KureDatabase';
import { Resource } from 'services/api_services/Resource';
import { getCustomerDataByUid } from './customerManager';
import {
  ADJUST_TYPE,
  ADJUST_VALUE_TYPE,
  ADJUSTMENT_TYPE,
  CART_STATUS,
  CHECKOUT_TYPE,
  OrderProductType,
  USER_TYPE
} from 'Common/constants';
import { localStorageCashier, localStorageSelectedOrderId } from "services/storage_services/CONSTANTS";
import { json } from "react-router-dom";
import {
  fetchProductDataByVariationId,
  fetchProductDataByVariationIds,
  getProductByVariationId
} from './productManager';
import {
  idbAddOrderIdHistory,
  idbGetActiveCartId,
  idbGetActiveStoreId,
  idbGetLoggedInUser,
  idbGetUserRole,
  idbSetActiveCart,
  idbSetActiveStoreId
} from './configManager';
import { idbCustomerLoggedIn } from "services/idb_services/userManager";

const resource = new Resource();
const db = new KureDatabase();

/**
 * The eventUserSwitchedStores function manages the process when a user changes stores. Initially, the function
 * retrieves the ID of the active cart and the role of the user. If there's no active cart ID or user role identified,
 * the function stops. For logged-in users, the function establishes query conditions based on the active cart ID.
 * Depending on the user's role (customer or employee), the function modifies these conditions to align with the
 * relevant user's ID. The system then queries the database to fetch the cart based on the set conditions. If the
 * retrieved cart is either null or empty, indicating a mismatch between the user and the cart, the function clears
 * the active cart. Otherwise, it leaves the cart unchanged.
 *
 * @returns {Promise<void>}
 */
export const eventUserSwitchedStores = async () => {
  let conditions = {};
  const active_cart_id = await idbGetActiveCartId();
  const user_role = await idbGetUserRole();

  // console.log("eventUserSwitchedStores: active_cart_id: ", active_cart_id);

  // Need the active_cart_id or else there's nothing to do.
  // if (active_cart_id == null || active_cart_id == undefined) {
  //   return;
  // }
  // We're only interested in performing logic for a logged-in user.
  if (user_role == null || user_role == undefined) {
    return;
  }

  console.log("eventUserSwitchedStores: user_role: ", user_role);

  conditions = {
    order_id: active_cart_id,
  };

  // Depending on if a logged-in user is a customer or an employee, we'll need to query the database differently.
  switch (user_role) {
    case USER_TYPE.CUSTOMER:
      conditions.customer_id = getLoggedInUserId();
      break;

    case USER_TYPE.KURE_EMPLOYEE:
      await fetchOrderNotification();
      broadcastMessage(SIG_ORDER_LIST_CHANGED, null);
      conditions.cashier_id = getLoggedInUserId();
      console.log(USER_TYPE.KURE_EMPLOYEE);
      break;
  }

  console.log("eventUserSwitchedStores: conditions: ", conditions);

  let cart = await db.getAllFromIndexList(conditions, IDB_TABLES.commerce_order);
  // This shouldn't happen.
  if (cart == null || cart.length === 0) {
    console.log("eventUserSwitchedStores: cart is null or empty");
    // Hmm, appears this cart doesn't belong to the user. Clear the active cart.
    await idbSetActiveCart(null);
  } else {
    // Do nothing. The current active_cart_id is assigned to the user as it should be, allow the system to load the
    // cart.
    console.log("eventUserSwitchedStores: cart is not null or empty");
  }
}

/**
 * The eventUserLoggedIn function handles post-login actions based on the type of user who logs in.
 *
 * For a customer, after logging in, the function checks if they have any pre-existing cart and merges it with their
 * current session's cart using the mergeCart function. This ensures that any items they added to their cart before
 * logging in are retained.
 *
 * For an employee, the process is different. Merging carts for employees is avoided due to potential complications.
 * For instance, if an employee was interacting with a customer's order, merging their session's cart with a customer's
 * could lead to unintended consequences. If an employee logs in and there's an active cart ID (from their anonymous
 * session), this cart's ownership is transferred from being an anonymous cart to being associated with the employee's
 * ID (cashier_id). This transfer ensures that the cart retains its items and is now linked to the employee, but the
 * contents aren't merged with any other carts.
 *
 * @returns {Promise<void>}
 */
export const eventUserLoggedIn = async () => {
  // Get the type of user that logged in.
  const user_role = await idbGetUserRole();

  switch (user_role) {
    // If user_role is an customer, we may need to merge their cart with one they already have.
    case USER_TYPE.CUSTOMER:
      await idbCustomerLoggedIn();
      await mergeCart();
      break;

    // If user_role is an employee, don't merge their cart. For the moment, it isn't safe attempting to merge carts for
    // employees. Why? Imagine what will happen if the employee was editing or working with a customer's order. We wouldn't
    // want to merge their anonymous cart with the customer's cart.
    case USER_TYPE.KURE_EMPLOYEE:
      await fetchOrderNotification();
      broadcastMessage(SIG_ORDER_LIST_CHANGED, null);
      const user_info = await idbGetLoggedInUser();
      const active_cart_id = await idbGetActiveCartId();
      if (active_cart_id == null || active_cart_id == undefined) {
        return;
      }

      // Now get the anonymous cart.
      let cart_anonymous = await getCartById(active_cart_id);
      cart_anonymous = cart_anonymous.data;

      // The anonymous order should be converted to a cashier_id order.
      // Update the anonymous cart (it's now a cashier_id cart).
      cart_anonymous.cashier_id = user_info.uid;
      // Save the cart.
      await db.put([cart_anonymous], IDB_TABLES.commerce_order);
      break;
  }
}

/**
 * This function should only retrieve the latest active order/cart. It should not attempt to create a new order.
 *
 * @returns {Promise<{data: null, message: string, status: boolean}|null>}
 */
export const getCart = async () => {
  const active_cart_id = await idbGetActiveCartId();
  // Don't do any more logic, this function should only return cart data.
  if (active_cart_id == null || active_cart_id == undefined) {
    return toastPrepareMessage(false, null);
  }

  const cart = await db.get(active_cart_id, IDB_TABLES.commerce_order);
  return toastPrepareMessage(cart ? true : false, cart);
};

export const createCart = async (store_id) => {
  const active_store_id = await idbGetActiveStoreId();
  const guid = getGUID();
  const cart = {
    // Order ID uses a GUID but this is temporary. We will replace it with the order ID from the server.
    order_id: guid,
    order_id_react: guid,
    //user_id_logged_in: user_id,
    // If a customer is making a purchase, this will stay null.
    cashier_id: storeGetCashierId(),
    store_id: store_id ? store_id : active_store_id,
    // Below we check if we should add a user_id to the customer_id property.
    customer_id: null,
    adjustments: [],
    order_items: [],
    billing_profile: null,
    shipping_id: null,
    // CHECKOUT_TYPE.DELIVERY or CHECKOUT_TYPE.PICK_UP
    type: null,
    instructions: '',
    state: 'draft',
    changed: new Date().getTime(),
  };

  let user_info = await idbGetLoggedInUser();
  const user_role = await idbGetUserRole();
  if (user_role === USER_TYPE.CUSTOMER) {
    cart.customer_id = user_info ? user_info.uid : null;
  }

  await db.put([cart], IDB_TABLES.commerce_order);
  const new_cart = await db.get(guid, IDB_TABLES.commerce_order);
  await idbSetActiveCart(guid);
  await idbAddOrderIdHistory(guid);
  return toastPrepareMessage(true, new_cart);
}

export const getCartById = async (cart_id = "") => {
  // Initially the user will not be signed in.
  const conditions = {
    //user_id_logged_in: null,
    order_id: cart_id,
  };

  let cart = await db.getAllFromIndexList(conditions, IDB_TABLES.commerce_order);

  if (cart == null || cart.length === 0) {
    return toastPrepareMessage(false, null);
  }
  cart = cart[0];

  return toastPrepareMessage(true, cart);
};


/**
 * We use to refresh the cart values as well but this isn't efficient. Now this is gets current cart values and returns.
 */
export const refreshCart = async () => {
  // Does a cart/order exist? Keep in mind we create a new order for each store_id and for each user.
  let cart = await getCart();
  // console.log('refreshCart cart: ', cart);
  if (!cart || !cart.status) {
    return toastPrepareMessage(false, null, "Cart doesn't exist yet.");
  }
  // console.log("REFRESH CART: ", cart);
  cart = cart.data;

  // Before we loop through all of our sorted adjustments, we must clear the order_item.adjustments and
  // order.adjustments data. If we don't do this, we'll end up with duplicate adjustments.
  cart.order_items.forEach(x => x.adjustments = []);
  cart.adjustments = [];

  for (const order_item of cart.order_items) {
    /**
     * @TODO: This isn't efficient because processAdjustments() recalculates the cart/order level adjustments
     *        on each call.
     */
    await processAdjustments(cart, order_item.purchased_entity);
  }
  await db.updateOrAdd(cart, IDB_TABLES.commerce_order);
  // console.log("refreshCart", cart);

  return toastPrepareMessage(true, cart, 'Cart refreshed.');
};
export const resetOrder = async (cart) => {
  // delete all order in idb
  if (!cart.order_id) return;
  await db.deleteAllByIdList([cart.order_id], IDB_TABLES.commerce_order);
  await idbSetActiveCart(null);
  await getCart();
  postOrderMessage();
}

export const checkInventoriesOfAllCarts = async () => {
  console.log('all order syncing')
  const all_orders = (await db.getAll(IDB_TABLES.commerce_order)).filter(x => x.state != CART_STATUS.COMPLETED);
  for (let i = 0; i < all_orders.length; i++) {
    await checkCartProductInventories(all_orders[i], true);
    console.log('inventory check ', i, " / ", all_orders.length);
  }
}
export const checkCartProductInventories = async (cart = null, use_existing_products = false) => {

  // get cart if param is null
  if (!cart) {
    const cart_res = await getCart();
    if (cart_res.status == false) {
      return [];
    }
    cart = cart_res.data;
  }

  // get orders inventories
  const variations = cart.order_items.map(x => x.purchased_entity?.variation_id);
  let new_products = cart.order_items.map(x => x.purchased_entity);
  // if (!use_existing_products) {
  //   const drupal_data = await fetchProductDataByVariationIds(variations);
  //   if (!drupal_data) {
  //     new_products = drupal_data;
  //   }
  // }
  // console.log(new_products);

  console.log("new product list: ", new_products, variations)
  // check the quantity of cart products are valid.

  let invalid_products = [];

  for (let i = 0; i < cart.order_items.length; i++) {
    const new_product = new_products.find(x => x?.variation_id == cart.order_items[i].purchased_entity?.variation_id);
    // new_product?.stock = 1;
    if (!new_product) {
      invalid_products.push(cart.order_items[i].purchased_entity?.variation_id);
      if(cart.order_items[i].purchased_entity) {
        cart.order_items[i].purchased_entity.stock = 0;
      }
      continue;
    }

    cart.order_items[i].purchased_entity = new_product;
    if (new_product?.stock < cart.order_items[i].quantity) {
      invalid_products.push(cart.order_items[i].purchased_entity?.variation_id);
    }
  }
  await db.put([cart], IDB_TABLES.commerce_order);
  // console.log("INVALID: ", invalid_products);
  return invalid_products;

}
export const setOrderProductAsReturn = async (variation, is_return) => {
  const cart = (await getCart()).data;
  // Does an order_item exist that contains the same variation_id?
  const order_item = cart.order_items.find(x => x.purchased_entity?.variation_id === variation?.variation_id);
  // Update the quantity of the order_item.
  // console.log("OO", order_item)
  if (!order_item) return;

  const index = cart.order_items.indexOf(order_item);
  cart.order_items[index].type = is_return ? OrderProductType.return : OrderProductType.default;
  cart.changed = new Date().getTime();
  await db.updateOrAdd(cart, IDB_TABLES.commerce_order);
  // console.log("addRemoveProductFromCart", cart);
  await processAdjustments(cart, variation);
  postOrderMessage(cart);
};


export const addRemoveProductFromCart = async (variation, quantity = 1, package_uid = null, store_id = getStoreId()) => {

  // Does a cart/order exist? Keep in mind we create a new order for each store_id and for each user.
  let cart = await getCart();
  if (cart.status == false) {
    cart = await createCart();
  }
  cart = cart.data;

  if (cart.state === CART_STATUS.COMPLETED) {
    return toastPrepareMessage(false, null, "You can't modify a completed cart.");
  }

  console.log("addremove request: ", quantity);
  let message = 'Product added to cart.';
  console.log("add");
  let new_variation = variation;
  // if (quantity > 0) {
  //   new_variation = await fetchProductDataById(variation?.variation_id);
  //   console.log("new_variation: ", new_variation)
  //   if (!new_variation) {
  //     new_variation = variation;
  //   }
  // }

  // // Before we loop through all of our sorted adjustments, we must clear the order_item.adjustments and
  // // order.adjustments data. If we don't do this, we'll end up with duplicate adjustments.
  // cart.order_items.forEach(x => x.adjustments = []);
  // cart.adjustments = [];

  // console.log("product_info, ", product_info, variation?.variation_id);
  // We must first update the order_item property or the adjustments below can't properly calculate values.
  // User is adding a product to the cart.
  if (quantity > 0) {
    addUpdateOrderItemToCart(cart, new_variation, quantity, package_uid);
    // Now that our the order_item quantity updated, check stock, don't allow to add more than stock.
    const order_item = cart.order_items.find(x => x.purchased_entity?.variation_id === new_variation?.variation_id);
    console.log("variation?.stock:", new_variation?.stock)
    console.log("order quantity:", order_item.quantity)
    if (parseInt(order_item.quantity) > parseInt(new_variation?.stock)) {
      return toastPrepareMessage(false, null, 'We only have ' + new_variation?.stock + ' products in stock.');
    }
  } else {
    message = 'Product removed from cart.';
    removeOrderItemFromCart(cart, new_variation, package_uid, quantity);
  }

  // await processAdjustments(cart, new_variation);

  // in the case user paid, check amount
  if (quantity > 0 && cart.payment && cart.payment != "" && cart.state != CART_STATUS.DRAFT) {
    const paid_amount = convertToNumber(cart.payment);
    const current_amount = convertToNumber(getCalculatedCartTotals(cart).total);
    const over_paid_amount = paid_amount - current_amount;
    // console.log("paid_amount: ", paid_amount);
    // console.log("current_amount: ", current_amount);
    // console.log("over_paid_amount: ", over_paid_amount);
    if (over_paid_amount < 0) {
      return toastPrepareMessage(false, null, 'You can add products in the amount you paid.');
    }
  }
  cart.changed = new Date().getTime();
  await db.updateOrAdd(cart, IDB_TABLES.commerce_order);
  // console.log("addRemoveProductFromCart", cart);
  postOrderMessage(cart);
  return toastPrepareMessage(true, null, message);
};

export const processAdjustments = async (cart, variation) => {
  // console.log(">> processAdjustments: ", cart, variation);
  let profile_data = null;
  const customer_id = await getCustomerIdFromCart();
  const result = await getCustomerDataByUid(customer_id);
  if (result.length > 0) {
    profile_data = result[0];
  }

  // Order item level adjustments.
  const _result = await pullAdjustment();

  // Loop through the map.
  for (const [key, value] of _result.entries()) {
    // Loop through the array.
    for (const [key2, value2] of Object.entries(value)) {
      const adjustment = value2;
      switch (adjustment.type) {
        case 'promotion':
          await processAdjustmentPromotion(adjustment.data, cart, variation);
          break;

        case 'tax':
          await processAdjustmentTax(adjustment.data, cart, variation, profile_data);
          break;

        case 'shipping':
          await processAdjustmentShipping(adjustment.data, cart);
          break;
      }
    }
  }
};

async function pullAdjustment() {
  let map = new Map();

  let taxes = await db.getAll(IDB_TABLES.adjustment_tax);
  for (let i = 0; i < taxes.length; i++) {
    const object = taxes[i];
    let weight = parseInt(object.configuration.tax_weight);
    if (!map.has(weight)) {
      map.set(weight, []);
    }
    map.get(weight)[object.id] = {
      type: 'tax',
      data: object
    };
  }

  let promotions = await db.getAll(IDB_TABLES.adjustment_promotion);
  for (let i = 0; i < promotions.length; i++) {
    const object = promotions[i];
    let weight = parseInt(object.offer_configuration.promotion_weight);
    if (!map.has(weight)) {
      map.set(weight, []);
    }
    map.get(weight)[object.promotion_id] = {
      type: 'promotion',
      data: object
    };
  }

  let shipping = await db.getAll(IDB_TABLES.adjustment_shipping);
  const shipping_group = [];
  for (let i = 0; i < shipping.length; i++) {
    const id = shipping[i].id;
    const shipping_method_id = shipping[i].shipping_method_id;
    if (!shipping_group[shipping_method_id]) {
      shipping_group[shipping_method_id] = [];
    }
    shipping_group[shipping_method_id][id] = shipping[i];
  }

  // console.log('>> shipping_group:', shipping_group);
  shipping_group.forEach((item, index) => {
    // console.log(index, item);
    // The item variable is an array of objects. Get the first object's configuration.shipping_weight.
    item = Object.values(item);
    const object = item[0];
    let weight = parseInt(object.configuration.shipping_weight);
    if (!map.has(weight)) {
      map.set(weight, []);
    }
    map.get(weight)[index] = {
      type: 'shipping',
      data: item
    };
  });

  // Sort the map key by ascending order.
  map = new Map([...map.entries()].sort((a, b) => a[0] - b[0]));

  // console.log(map)

  return map;
}

async function processAdjustmentPromotion(promotion, cart, variation) {
  const order_item = cart.order_items.find(x => x.purchased_entity?.variation_id === variation?.variation_id);
  // This may happen if the user removes the item from the cart.
  if (order_item === undefined) {
    return;
  }

  const { name, offer_plugin_id, require_coupon, offer_configuration } = promotion;
  const { conditions } = offer_configuration;

  // Does the cart have a coupon ID that matches one of our promotion rules? Or, did someone enter a coupon code?
  if (require_coupon === "1" && cart.coupon_info && cart.coupon_info.coupon_details) {
    const coupon_details = cart.coupon_info.coupon_details;
    if (coupon_details.promotion_id == rule.promotion_id && rule.coupons.find(x => x.code == coupon_details.coupon_code)) {
      processAdjustmentPromotionHelper(promotion, offer_configuration, order_item);
    }
  }

  // Check promotion adjustment.
  switch (offer_plugin_id) {
    case 'order_item_percentage_off':
      if (conditions !== undefined) {
        const entities = conditions[0].configuration.entities;
        if (entities !== undefined) {
          const purchased_entity = conditions[0]?.configuration?.entities[variation?.variation_id];
          // The require_coupon, when set to zero, means this promotion should automatically apply if the rules match.
          // If the require_coupon is set to one, then the user must enter a coupon code.
          if (require_coupon === '0' && purchased_entity !== undefined) {
            processAdjustmentPromotionHelper(promotion, offer_configuration, order_item);
          }
        }
      }
      break;
  }
}

function processAdjustmentPromotionHelper(promotion, offer_configuration, order_item) {
  let adjustment = {
    type: ADJUSTMENT_TYPE.PROMOTION,
    label: promotion.name,
    amount: { number: 0, currency_code: 'USD' },
    percentage: offer_configuration.percentage,
    // The source_id property should be of the syntax/format: local_tax|default|e97ac695-0e8e-41d4-84bf-4785f8709dda.
    source_id: promotion.promotion_id + '|default|' + promotion.promotion_id,
    /**
     * @TODO: The two values below, I'm not sure what to do with them.
     */
    included: false,
    locked: false,
    weight: offer_configuration.promotion_weight,
  }
  if (promotion.offer_plugin_id.includes("percentage_off")) {
    adjustment = {
      ...adjustment,
      amount: {
        number: (order_item.retail_price * order_item.quantity) * -parseFloat(offer_configuration.percentage),
        currency_code: 'USD',
      },
      percentage: offer_configuration.percentage,
    }
  } else if (promotion.offer_plugin_id.includes("fixed_amount_off")) {
    adjustment = {
      ...adjustment,
      amount: {
        number: -parseFloat(offer_configuration.amount.number),
        currency_code: offer_configuration.amount.currency_code
      },
      percentage: 0,
    }
  }
  // Does this adjustment already exist in the order_item.adjustments array?
  const existing_adjustment = order_item.adjustments.find(x => x.source_id === adjustment.source_id);
  // We want to update the amount and percentage.
  if (existing_adjustment) {
    existing_adjustment.amount.number = adjustment.amount.number;
    existing_adjustment.percentage = adjustment.percentage;
  }
  // Doesn't exist, add it.
  else {
    order_item.adjustments.push(adjustment);
  }
}

async function processAdjustmentTax(tax, cart, variation, user_profile) {
  const order_item = cart.order_items.find(x => x.purchased_entity?.variation_id === variation?.variation_id);
  // This may happen if the user removes the item from the cart.
  if (order_item === undefined) {
    return;
  }

  // Within the tax type object the store_id is a string.
  if (tax.status && Object.values(tax.configuration.store_ids).includes(cart.store_id.toString())) {
    // console.log('Tax available:', tax);
    const config = tax.configuration;
    let is_medical_user = false;

    if (user_profile != null) {
      is_medical_user = (user_profile.is_medical_user === "Yes");
    }

    if (is_medical_user != config.apply_if_medical_user) {
      return;
    }

    // console.log('Available tax:', tax);

    // console.log('order item', order_item)

    let item_subtotal = order_item.quantity * convertToNumber(order_item.retail_price);
    // console.log(item_subtotal)

    // Get previous adjustments only if their tax.configuration.tax_weight is less than the current tax's weight.
    const previous_order_item_adjustments = order_item.adjustments.filter(x => x.weight < tax.configuration.tax_weight);
    // console.log(previous_order_item_adjustments)
    // Loop through the previous_adjustments.
    for (let k = 0; k < previous_order_item_adjustments.length; k++) {
      const previous_adjustment = previous_order_item_adjustments[k];
      // console.log(previous_adjustment.amount.number)
      item_subtotal += parseFloat(previous_adjustment.amount.number);
      // console.log(item_subtotal)
    }

    // console.log(item_subtotal)

    // Get previous adjustments only if their tax.configuration.tax_weight is less than the current tax's weight.
    const previous_order_adjustments = cart.adjustments.filter(x => x.weight < tax.configuration.tax_weight);
    // console.log(previous_order_adjustments)
    for (let k = 0; k < previous_order_adjustments.length; k++) {
      const previous_adjustment = previous_order_adjustments[k];
      item_subtotal += parseFloat(previous_adjustment.amount.number);
    }

    // console.log(item_subtotal)

    const avoid_medical_user = config.avoid_medical_user;
    const enable_rounding_adjustment = config.enable_rounding_adjustment;
    const round = config.round;
    const rates = config.rates;

    let config_is_cannabis = parseInt(config?.is_cannabis || false);
    let variation_is_cannabis = parseInt(variation?.is_cannabis || false);

    if ((config_is_cannabis && variation_is_cannabis) || (!config_is_cannabis)) {

      for (let j = 0; j < rates.length; j++) {
        const rate = rates[j];
        const { id, label, percentage } = rate;

        // console.log(percentage, item_subtotal)

        const source_id = tax.id + '|default|' + id;
        // Does source_id already exist in the order_item.adjustments array?
        const existing_adjustment = order_item.adjustments.find(x => x.source_id === source_id);

        // We want to update the amount and percentage.
        if (existing_adjustment) {
          // console.log('Existing adjustment:', existing_adjustment);
          existing_adjustment.amount.number = percentage * item_subtotal;
          existing_adjustment.percentage = percentage;
        }
        // Doesn't exist, add it.
        else {
          order_item.adjustments.push({
            type: ADJUSTMENT_TYPE.TAX,
            label: label,
            amount: {
              // number: percentage * ((order_item.quantity * convertToNumber(order_item.retail_price)) + promotion_adjustments_total),
              number: percentage * item_subtotal,
              currency_code: 'USD',
            },
            percentage: percentage,
            // local_tax|default|e97ac695-0e8e-41d4-84bf-4785f8709dda
            source_id: tax.id + '|default|' + id,
            /**
             * @TODO: The two values below, I'm not sure what to do with them.
             */
            included: false,
            locked: false,
            weight: tax.configuration.tax_weight,
          });
        }
      }
    }

  }
}

async function processAdjustmentShipping(shipment_conditions, cart) {
  // We wait until we know what the user decided. Type can be:
  // CHECKOUT_TYPE.DELIVERY or CHECKOUT_TYPE.PICK_UP.
  if (cart.type == null) {
    return;
  }

  let subtotal = 0;
  cart.order_items.filter(x => x.type != OrderProductType.return).forEach((order_item) => {
    subtotal += Number(order_item.retail_price) * order_item.quantity;
  });

  const result = filterShippingRules(shipment_conditions, cart.store_id, cart.type, subtotal, cart.billing_profile);

  for (const key in result) {
    const rule = result[key];
    // Does this rule already exist in the cart.adjustments array?
    const existing_adjustment = cart.adjustments.find(x => x.source_id === rule.shipping_method_id);
    // We want to update the amount and percentage.
    if (existing_adjustment) {
      existing_adjustment.amount.number = rule.configuration.rate_amount.number;
      existing_adjustment.percentage = rule.configuration.rate_amount.number;
    }
    // Doesn't exist, add it.
    else {
      // console.log("ADJ>>", key, rule);
      cart.adjustments.push({
        type: ADJUSTMENT_TYPE.SHIPPING,
        label: rule.configuration.rate_label,
        amount: {
          number: rule.configuration.rate_amount.number,
          currency_code: 'USD',
        },
        source_id: rule.shipping_method_id,
        weight: rule.configuration.shipping_weight,
      });
    }

    cart.shipping_id = rule.shipping_method_id;
  }
}

/**
 * A safe way to update the order_type in the cart object.
 *
 * @param order_type
 * @returns {Promise<{data: null, message: string, status: boolean}>}
 */
export const addOrderTypeToCart = async (order_type) => {
  return updateCartObject({ type: order_type });
};

export const addBillingProfileToCart = async (billing_profile) => {

  return updateCartObject({ billing_profile: billing_profile });
};

/**
 * A safe way to update the customer_id in the cart object.
 *
 * @param customer_id
 * @returns {Promise<{data: null, message: string, status: boolean}>}
 */
export const addCustomerToCart = async (customer_id) => {
  return await updateCartObject({ customer_id: customer_id });
};

export const getInstructionsFromCart = async () => {
  const cart = (await getCart()).data;
  return cart.instructions;
};

export const removeCustomerFromCart = async () => {
  return updateCartObject({ customer_id: null, payment: null });
};

/**
 * You can directly modify the cart object by passing an object of key/value pairs.
 *
 * @param object
 * @returns {Promise<{data: null, message: string, status: boolean}>}
 */
export const modifyCart = async (object) => {
  return updateCartObject(object);
};

export const updateCartObject = async (change) => {
  // Does a cart/order exist? Keep in mind we create a new order for each store_id and for each user.
  let cart = await getCart();
  if (cart.status == false) {
    return toastPrepareMessage(false, null, 'Order not found.');
  }
  if (cart.status == CART_STATUS.COMPLETED) {
    return toastPrepareMessage(true, cart, "This cart is completed.");
  }
  cart = cart.data;

  // console.log("updateCartObject", cart);

  // Loop through the change object.
  let is_changed = false;
  for (const [key, value] of Object.entries(change)) {
    // console.log('ccc: ', key, value);
    // I will set changed time when the data is changed.
    if (cart[key] != value) {
      console.log("cart is changed");
      is_changed = true;
    }
    cart[key] = value;
  }
  if (is_changed) {
    cart.changed = new Date().getTime();
  }
  // console.log("cart updates: ", cart);

  // Each time we update the cart, update the 'changed' timestamp.
  cart.changed = new Date().getTime();
  await db.updateOrAdd(cart, IDB_TABLES.commerce_order);

  // console.log("updated cart: ",cart);
  postOrderMessage(cart);
  return toastPrepareMessage(true, cart, 'Order updated.');
};

export const updateCartObjectById = async (cart_id, change, send_notification = true) => {
  // Does a cart/order exist? Keep in mind we create a new order for each store_id and for each user.
  const {
    status,
    data: cart,
    message
  } = await getCartById(cart_id);
  if (status == false || cart === null) {
    return toastPrepareMessage(false, null, 'Cart not found.');
  }
  // Loop through the change object.
  for (const [key, value] of Object.entries(change)) {
    cart[key] = value;
  }
  // console.log("cart updates: ", cart);

  await db.put([cart], IDB_TABLES.commerce_order);

  // console.log("updated cart: ",cart);
  if (send_notification) {
    postOrderMessage(cart);
    return toastPrepareMessage(true, cart, 'Order updated.');
  }
};

export const finishCartObject = async (cart_id, change) => {
  // Does a cart/order exist? Keep in mind we create a new order for each store_id and for each user.
  let cart = (await getCartById(cart_id)).data;
  if (cart == null) {
    return toastPrepareMessage(false, null, 'Order not found.');
  }
  // Loop through the change object.
  for (const [key, value] of Object.entries(change)) {
    cart[key] = value;
  }
  cart.cashier_id = storeGetCashierId();

  await db.updateOrAdd(cart, IDB_TABLES.commerce_order);

  // console.log(cart);
  // postOrderMessage(cart);

  // return toastPrepareMessage(true, cart, 'Order updated.');
  return cart;
};

/**
 *  Returns the ID of the currently selected customer, or the ID of the logged-in user if no customer is selected.
 *  If no user is logged in, the function returns null.
 *
 * @returns {Promise<*|null>}
 */
export const getCustomerIdFromCart = async () => {
  // Get the cart and see if a customer_id exists.
  const cart = (await getCart()).data;
  if (cart != null && cart.customer_id != null) {
    return cart.customer_id;
  }

  return null;
}
export const getValidQuantityOfProduct = async (variation_id) => {

  // get product quantity
  const data = await db.getAllFromIndex('variation_id', variation_id, IDB_TABLES.product_data);
  if (data.length == 0) return 0;

  const product = data[0];
  const quantity = product?.stock;
  // console.log("product>>", product)
  // check orders
  const order_list = await db.getAll(IDB_TABLES.commerce_order);
  let ordered_count = 0;
  for (let i = 0; i < order_list.length; i++) {
    const order_items = Object.entries(order_list[i]['order_items']).map(x => x[1]);
    const focusing_products = order_items.filter(x => x.purchased_entity?.variation_id == product?.variation_id);
    for (let j = 0; j < focusing_products.length; j++) {
      ordered_count += focusing_products[j].quantity;
    }
  }
  return quantity - ordered_count;
}

function addUpdateOrderItemToCart(cart, variation, quantity, package_uid = null) {
  // Does an order_item exist that contains the same variation_id?
  const order_item = cart.order_items.find(x => x.purchased_entity?.variation_id === variation?.variation_id);
  // Update the quantity of the order_item.
  if (order_item != undefined) {
    order_item.quantity += quantity;
    if (!order_item.type) {
      order_item.type = "default";
    }

    if (package_uid != null) {
      order_item.package_uids.push(package_uid);
    }
  }
  // Add a new order_item.
  else {
    cart.order_items.push({
      purchased_entity: variation,
      // retail_price should never be modified.
      retail_price: variation.retail_price,
      quantity: quantity,
      adjustments: [],
      package_uids: [],
      type: "default"
    });
    if (package_uid != null) {
      cart.order_items[0].package_uids = [package_uid];
    }
  }
}

function removeOrderItemFromCart(cart, variation, package_uid = null, remove_quantity = -1) {
  // Does an order_item exist that contains the same variation_id?
  const order_item = cart.order_items.find(x => x.purchased_entity?.variation_id === variation?.variation_id);

  // Update the quantity of the order_item.
  if (order_item != undefined) {
    if (package_uid != null) {
      // Does this package_uid exist in the order_item.package_uids array?
      const index = order_item.package_uids.indexOf(package_uid);
      if (index > -1) {
        order_item.package_uids.splice(index, 1);
      }
    }
    order_item.quantity += remove_quantity;
    // If the quantity is 0, remove the order_item.
    if (order_item.quantity === 0) {
      const index = cart.order_items.indexOf(order_item);
      if (index > -1) {
        cart.order_items.splice(index, 1);
      }
    }
  }
}

function filterShippingRules(data, store_id, order_type, order_total, shipment_address) {
  // console.log('data', data, 'store_id', store_id, 'order_type', order_type, 'order_total', order_total, 'shipment_address', shipment_address)
  let applicable = {};

  let shipping_result = [];
  let shipping_result_debug = [];

  // Loop through each object in the data array.
  data.forEach(item => {
    const conditionsPluginId = item.conditions_target_plugin_id;
    const conditionsConfig = item.conditions_target_plugin_configuration;

    if (conditionsPluginId === 'order_total_price') {
      const operator = conditionsConfig.operator;
      const targetAmount = parseFloat(conditionsConfig.amount.number);

      if (operator === '<=' && order_total <= targetAmount) {
        applicable[item.shipping_method_id] = item.shipping_method_id;
        shipping_result_debug[item.id] = true;
      } else if (operator === '>=' && order_total >= targetAmount) {
        applicable[item.shipping_method_id] = item.shipping_method_id;
        shipping_result_debug[item.id] = true;
      } else {
        shipping_result[item.shipping_method_id] = false;
        shipping_result_debug[item.id] = false;
      }
    } else if (conditionsPluginId === 'order_type') {
      // if (orderType === 'delivery') {
      //   //return conditionsConfig.bundles.includes(orderType);
      // } else {
      //   //return false;
      //   against++;
      // }
      if (conditionsConfig.bundles.includes(order_type)) {
        applicable[item.shipping_method_id] = item.shipping_method_id;
        shipping_result_debug[item.id] = true;
      } else {
        shipping_result[item.shipping_method_id] = false;
        shipping_result_debug[item.id] = false;
      }
    } else if (conditionsPluginId === 'shipment_address' && shipment_address !== null) {
      /**
       * In order for the AI (Copilot) to understand the object below, we need to use the following syntax:
       * shipment_address:
       * {
       *     "1010": {
       *         "phone": "720-441-4271",
       *         "address": {
       *             "langcode": null,
       *             "country_code": "US",
       *             "administrative_area": "CA",
       *             "locality": "Ukiah",
       *             "dependent_locality": null,
       *             "postal_code": "95490",
       *             "sorting_code": null,
       *             "address_line1": "123 One Way St",
       *             "address_line2": "",
       *             "organization": null,
       *             "given_name": "Joshua",
       *             "additional_name": null,
       *             "family_name": "Ramirez"
       *         },
       *         "is_default": "1"
       *     }
       * }
       */
      // Get the first key in the shipment_address object.
      const shipment_address_key = Object.keys(shipment_address)[0];
      // console.log("country_code", shipment_address[shipment_address_key].address.country_code);
      // console.log("administrative_area", shipment_address[shipment_address_key].address.administrative_area);
      const territories = conditionsConfig.zone.territories;
      const result = territories.some(territory => {
        return territory.country_code === shipment_address[shipment_address_key].address.country_code &&
          territory.administrative_area === shipment_address[shipment_address_key].address.administrative_area;
      });
      if (result) {
        applicable[item.shipping_method_id] = item.shipping_method_id;
        shipping_result_debug[item.id] = true;
      } else {
        shipping_result[item.shipping_method_id] = false;
        shipping_result_debug[item.id] = false;
      }
    }
    // Must be a global condition or where it should apply without conditions.
    else if (!conditionsPluginId) {
      applicable[item.shipping_method_id] = item.shipping_method_id;
      shipping_result_debug[item.id] = true;
    }
  });

  // console.log('shipping_result', shipping_result)
  // console.log('shipping_result_debug', shipping_result_debug)

  let rates = {};
  for (const shipping_id in applicable) {
    for (const _key in data) {
      if (data[_key].shipping_method_id === shipping_id) {
        // If the shipping_must_be_true is false, skip this shipping method.
        if (shipping_result[shipping_id] === false) {
          continue;
        }

        // Avoid duplicates, use data[_key].shipping_method_id.
        rates[data[_key].shipping_method_id] = data[_key];
      }
    }
  }

  // console.log("RATE: >> ", rates);
  return rates;
}

async function addAdjustmentShipping(cart) {

  // From the cart, remove all cart adjustments. Now we don't have to worry about incorrect calculations or
  // duplicate adjustments.
  cart.adjustments = cart.adjustments.filter(x => x.type !== ADJUSTMENT_TYPE.SHIPPING);

  // We wait until we know what the user decided. Type can be:
  // CHECKOUT_TYPE.DELIVERY or CHECKOUT_TYPE.PICK_UP.
  if (cart.type == null) {
    return;
  }

  let idb_shipping = await db.getAll(IDB_TABLES.adjustment_shipping);
  // console.log(idb_shipping);
  // console.log('filtering shipping cart: ', cart);

  let subtotal = 0;
  cart.order_items.filter(x => x.type != OrderProductType.return).forEach((order_item) => {
    subtotal += Number(order_item.retail_price) * order_item.quantity;
  });

  const result = filterShippingRules(idb_shipping, cart.store_id, cart.type, subtotal, cart.billing_profile);
  // console.log(result);

  for (const key in result) {
    const rule = result[key];
    // console.log("ADJ>>", key, rule);
    cart.adjustments.push({
      type: ADJUSTMENT_TYPE.SHIPPING,
      label: rule.configuration.rate_label,
      amount: {
        number: rule.configuration.rate_amount.number,
        currency_code: 'USD',
      },
      source_id: rule.shipping_method_id,
    });

    // console.log('cart.adjustments', cart.adjustments)

    cart.shipping_id = rule.shipping_method_id;
  }
}

/**
 * Adds a tax adjustment to an order_item. Before doing so it removes all tax adjustments from the order_item. This
 * is safe to do since a tax type might have changed since the last time the order was updated.
 */
async function addAdjustmentTaxes(cart, variation, user_profile) {
  let taxes = await db.getAll(IDB_TABLES.adjustment_tax);

  // Sort the taxes variable by taxes.configuration.tax_weight, sort ascending.
  taxes.sort((a, b) => {
    return a.configuration.tax_weight - b.configuration.tax_weight;
  });

  console.log('<< Taxes:', taxes);

  const order_item = cart.order_items.find(x => x.purchased_entity?.variation_id === variation?.variation_id);
  // This may happen if the user removes the item from the cart.
  if (order_item === undefined) {
    return;
  }

  // From the order_item, remove all tax type adjustments. Now we don't have to worry about incorrect calculations or
  // duplicate adjustments.
  order_item.adjustments = order_item.adjustments.filter(x => x.type !== ADJUSTMENT_TYPE.TAX);

  for (let i = 0; i < taxes.length; i++) {
    const tax = taxes[i];

    // Within the tax type object the store_id is a string.
    if (tax.status && Object.values(tax.configuration.store_ids).includes(cart.store_id.toString())) {
      const config = tax.configuration;
      let is_medical_user = false;

      if (user_profile != null) {
        is_medical_user = (user_profile.is_medical_user === "Yes");
      }

      if (is_medical_user != config.apply_if_medical_user) {
        continue;
      }

      // console.log('Available tax:', tax);

      const avoid_medical_user = config.avoid_medical_user;
      const enable_rounding_adjustment = config.enable_rounding_adjustment;
      const round = config.round;
      const rates = config.rates;
      for (let j = 0; j < rates.length; j++) {
        const rate = rates[j];
        const { id, label, percentage } = rate;

        // // Sum the order_item.adjustments.number values if the type is 'promotion'.
        // const promotion_adjustments = order_item.adjustments.filter(x => x.type === ADJUSTMENT_TYPE.PROMOTION);
        // let promotion_adjustments_total = 0;
        // for (let k = 0; k < promotion_adjustments.length; k++) {
        //   promotion_adjustments_total += promotion_adjustments[k].amount.number;
        // }

        // Get previous tax adjustment, if one exists.
        const previous_adjustments = order_item.adjustments.filter(x => x.type === ADJUSTMENT_TYPE.TAX);
        let item_subtotal = order_item.quantity * convertToNumber(order_item.retail_price);
        // Loop through the previous_adjustments.
        for (let k = 0; k < previous_adjustments.length; k++) {
          const previous_adjustment = previous_adjustments[k];
          item_subtotal += previous_adjustment.amount.number;
        }

        order_item.adjustments.push({
          type: ADJUSTMENT_TYPE.TAX,
          label: label,
          amount: {
            // number: percentage * ((order_item.quantity * convertToNumber(order_item.retail_price)) + promotion_adjustments_total),
            number: percentage * item_subtotal,
            currency_code: 'USD',
          },
          percentage: percentage,
          // local_tax|default|e97ac695-0e8e-41d4-84bf-4785f8709dda
          source_id: tax.id + '|default|' + id,
          /**
           * @TODO: The two values below, I'm not sure what to do with them.
           */
          included: false,
          locked: false,
        });
      }
    }
  }
}

export const deleteVariationFromCart = async (variation, store_id = getStoreId()) => {
  const cart = (await getCart()).data;
  deleteOrderItemFromCart(cart, variation);
  await db.commerceOrder().updateOrAdd(cart);
  postOrderMessage(cart);
};


/**
 * Deletes an order_item from the cart/order.
 *
 * @param cart
 * @param variation
 */
function deleteOrderItemFromCart(cart, variation) {
  cart.order_items = cart.order_items.filter(x => x.purchased_entity?.variation_id !== variation?.variation_id);
}

export const getProductFromPackageUID = async (package_uid, store_id = getStoreId()) => {
  // Before sending package_uid to getProductFromPackageUID(), remove the product count from the package_uid.
  const package_uid_split = package_uid.split('-')[0];
  // Filter by package_uid.
  let variation = await db.productData().getAllFromIndex("package_uid", package_uid_split, IDB_TABLES.product_data)
  if (variation.length == 0) {
    return toastPrepareMessage(false, null, `Product with ${package_uid} not found.`)
  }
  variation = variation[0];

  // console.log("variation", variation);

  // Filter by store ID.
  const product_store = variation.store_id.split(",").map(x => x.trim());
  // console.log("product_store", product_store);
  if (product_store.includes(`${store_id}`)) {
    // console.log('contains store_id');
    return toastPrepareMessage(true, variation, 'Product found.');
  }

  // console.log('does not contain store_id');
  return toastPrepareMessage(false, null, "The product is not in selected store.");
}

export const getProductCountFromCart = (cart) => {
  if (cart == null) {
    return 0;
  }
  // Count the number of order_item's quantity in the cart.
  let count = 0;
  if (cart.order_items !== undefined) {
    for (let i = 0; i < cart.order_items.length; i++) {
      const order_item = cart.order_items[i];
      count += parseInt(order_item.quantity);
    }
  }
  return count;
}

export const syncOrdersWithDrupal = async () => {
  const orders = await db.getAll(IDB_TABLES.commerce_order);
  // console.log("syncOrdersWithDrupal", orders);
  if (orders == undefined) return;

  // Filter orders which are not synced yet. We do this by comparing order_id and order_id_react.
  const waiting_for_submission = orders.filter(x => x.order_id == x.order_id_react && x.submission_ready == true);
  // console.log("waiting_for_submission", waiting_for_submission);
  for (let i = 0; i < waiting_for_submission.length; i++) {
    const order = waiting_for_submission[i];
    await syncOrderWithDrupal(order);
  }
}

export const syncOrderWithDrupal = async (order) => {
  if (order.submission_ready != true) {
    broadcastMessage(SIG_ORDER_SYNCHED, {
      status: false,
      data: order,
      message: "Order can not be processed because it's not finished."
    });
    return toastPrepareMessage(false, order, "Order can not be processed because it's not finished.");
  }
  // console.log('sync order: ', order);
  // If order.order_id and order.order_id_react are equal, then sync order with Drupal.
  // This means we don't have a Drupal ID (for order_id) yet or that it hasn't been synced yet.
  const user_role = await idbGetUserRole();
  if (!user_role) {
    broadcastMessage(SIG_ORDER_SYNCHED, { status: false, data: null, message: "Please login first." });
    return toastPrepareMessage(false, null, "Please login first.");
  }

  // console.log("USERINFO: ", user_role);
  const temp_state = user_role == USER_TYPE.KURE_EMPLOYEE ? CART_STATUS.COMPLETED : CART_STATUS.NEEDS_PROCESSING
  // if (order.state === CART_STATUS.DRAFT
  //   && order.order_id == order.order_id_react
  if (user_role == USER_TYPE.KURE_EMPLOYEE && order.state == CART_STATUS.NEEDS_PROCESSING) {
    // this code is for an employee to process needs_processing orders
    // needs_processing orders don't have order_id_react
    // so we need set temporary order_id_react value
    order.order_id_react = order.order_id;
  }
  if (order.order_id == order.order_id_react && order.order_items.length > 0) {
    // console.log('Syncing order with Drupal');
    let toast_response = {};
    try {
      toast_response = await resource.createNewOrder({ ...order, state: temp_state });
    } catch (err) {
      console.log("syncOneOrderWithDrupal createNewOrder error: ", err)
      broadcastMessage(SIG_ORDER_SYNCHED, { status: false, data: null, message: "Order failed: " + err });
      return toastPrepareMessage(false, null, "Order failed: " + err);
    }
    // console.log('Toast response: ', toast_response);
    const { status, data, message } = toast_response;
    if (status == 200) {
      // Update cart.order_id with the new order ID from Drupal. This tells us that this order has been synced.
      const old_order_id = order.order_id_react;
      order.order_id = data.order_id;
      order.order_id_react = null;
      order.state = temp_state;
      await db.put([order], IDB_TABLES.commerce_order);
      if (old_order_id != order.order_id) {
        await db.deleteAllByIdList([old_order_id], IDB_TABLES.commerce_order);
      }
      broadcastMessage(SIG_ORDER_SYNCHED, { status: true, data: order, message: "Order has been sent successfully." });
      return toastPrepareMessage(true, order, "Order has been sent successfully.");
    } else {
      console.log("syncOneOrderWithDrupal result error: ", message)
      broadcastMessage(SIG_ORDER_SYNCHED, { status: false, data: null, message: message });
      return toastPrepareMessage(false, null, message);
    }
  } else {
    broadcastMessage(SIG_ORDER_SYNCHED, { status: true, data: null, message: 'Order was already processed.' });
    return toastPrepareMessage(true, null, "Order was already processed.");
  }
}

export const postOrderMessage = (data) => {
  broadcastMessage(SIG_ON_REFRESH_CART, data);

};

export const fetchOrderNotification = async () => {
  console.log("fetchOrderNotification");
  const toast_response = await resource.getOrders({ store_id: getStoreId() });
  const { data } = toast_response;
  if (data == undefined) {
    return;
  }

  let orders = JSON.parse(data).order_data;
  for (let i = 0; i < orders.length; i++) {
    orders[i] = await orderParsing(orders[i]);
  }

  const kure_db = new KureDatabase();
  const res = await kure_db.put(orders, IDB_TABLES.commerce_order);
  console.log("---", res);
  return res;
}

export const fetchOrder = async (order_id = null) => {
  const toast_response = await resource.getOrders({ order_id: order_id });
  console.log('fetchOrder toast response', toast_response);
  const { data } = toast_response;
  if (data == undefined) {
    return;
  }
  const orders = JSON.parse(data).order_data;
  if (orders.length > 0) {
    orders[0] = await orderParsing(orders[0]);
  }
  
  console.log('fetchOrder orders:', orders[0]);
  const kure_db = new KureDatabase();
  const res = await kure_db.updateOrAdd(orders[0], IDB_TABLES.commerce_order);
  broadcastMessage(SIG_ORDER_LIST_CHANGED, null);
  return res;
}

export const orderParsing = async (order) => {
  for (let i = 0; i < order.order_items.length; i++) {
    const purchased_entity = await getProductByVariationId(order.order_items[i]?.variation_id);

    order.order_items[i] = {
      ...order.order_items[i],
      purchased_entity: purchased_entity,
      quantity: parseFloat(order.order_items[i].quantity),
      unit_price: parseFloat(order.order_items[i].unit_price),
      total_price: parseFloat(order.order_items[i].total_price),
      retail_price: parseFloat(order.order_items[i].unit_price),
      package_uids: []
    }
  }

  return order;
}

/**
 * Take the active cart and merge it with the authenticated user's cart.
 *
 * @returns {Promise<void>}
 */
const mergeCart = async () => {
  const active_cart_id = await idbGetActiveCartId();
  if (active_cart_id == null || active_cart_id == undefined) {
    return;
  }

  // Now get the anonymous cart.
  const toast_response = await getCartById(active_cart_id);
  let cart_anonymous = toast_response.data;
  const user_info = await idbGetLoggedInUser();

  // Does this user already have an order opened? We need to check the commerce_order table using the user ID matched
  // with the commerce_order customer_id property.
  const conditions = {
    customer_id: user_info.uid,
    state: CART_STATUS.DRAFT,
  };
  let cart_authenticated_user = await db.getAllFromIndexList(conditions, IDB_TABLES.commerce_order);
  if (cart_authenticated_user == null || cart_authenticated_user.length === 0) {
    console.log("mergeCart: User has no cart to merge with.");
    // Update the anonymous cart (it's now a user cart).
    cart_anonymous.customer_id = user_info.uid;
    console.log("cart_anonymous: ", cart_anonymous);
    // Save the cart.
    await db.put([cart_anonymous], IDB_TABLES.commerce_order);

  } else {
    console.log("mergeCart: User has a cart to merge with.");

    // If the user has a cart, we need to merge the cart with the active cart.
    cart_authenticated_user = cart_authenticated_user[0];

    // Now merge the two carts and save the result inside our IDB_TABLES.commerce_order table.

    // console.log("cart_anonymous: ", cart_anonymous);
    // console.log("cart_to_merge: ", cart_authenticated_user);
    /**
     * [
     *     {
     *         "purchased_entity": {
     *             "title": "Kure Lighter",
     *             "description": null,
     *             "description_format": null,
     *             "retail_price": "1.99",
     *             "promotional_retail_price": "1.99",
     *             "promotion_source_id": null,
     *             "category_name": "Accessories",
     *             "strain": null,
     *             "product_image": "https://kurereactjs.joshideas.com/sites/default/files/product_image/PXL_20221211_002319981.jpg",
     *             "variation_id": "14954",
     *             "product_id": "1421",
     *             "stock": "1477",
     *             "package_uid": "686c11de7939cb53",
     *             "changed": "1682587600",
     *             "store_id": "2",
     *             "link": "kure-lighter",
     *             "last_inventory_count_date": "1665443521"
     *         },
     *         "retail_price": "1.99",
     *         "quantity": 2,
     *         "adjustments": [
     *             {
     *                 "type": "tax",
     *                 "label": "Tax rate (7.875)",
     *                 "amount": {
     *                     "number": 0.1567125,
     *                     "currency_code": "USD"
     *                 },
     *                 "percentage": "0.07875",
     *                 "source_id": "local_tax|default|e97ac695-0e8e-41d4-84bf-4785f8709dda",
     *                 "included": false,
     *                 "locked": false
     *             }
     *         ],
     *         "package_uids": []
     *     }
     * ]
     */
    // Loop through the anonymous cart's order_items array.
    for (let i = 0; i < cart_anonymous.order_items.length; i++) {
      const order_item = cart_anonymous.order_items[i];
      // Check if the order_item exists in the authenticated user's cart.
      const index = cart_authenticated_user.order_items.findIndex((item) => item.purchased_entity?.variation_id === order_item.purchased_entity?.variation_id);
      if (index === -1) {
        // If it doesn't exist, add it to the authenticated user's cart.
        cart_authenticated_user.order_items.push(order_item);
      } else {
        // If it does exist, add the quantity to the existing order_item.
        cart_authenticated_user.order_items[index].quantity += order_item.quantity;
      }
    }

    //console.log("cart_to_merge after changes: ", cart_authenticated_user);
    // Now save the cart back to the IDB_TABLES.commerce_order table.
    await db.put([cart_authenticated_user], IDB_TABLES.commerce_order);
    // Now delete the anonymous cart.
    await db.deleteAllByIdList([active_cart_id], IDB_TABLES.commerce_order);

    await idbSetActiveCart(cart_authenticated_user.order_id);

    console.log('mergeCart: Cart has been merged.');
    // Now refresh the cart. We might have changed the quantity of an item.
    await refreshCart();
  }
}

/**
 * A push notification came in from Drupal.
 */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', async event => {
    const { type, entity_id } = event.data;
    switch (type) {
      case 'commerce_order':
        console.log('orderManager.js, fetch commerce_order data ' + entity_id);
        await fetchOrder(entity_id);
        broadcastMessage(SIG_ORDER_LIST_CHANGED);
        break;
    }
  });
}
import { Resource } from "services/api_services/Resource";
import { IDB_TABLES, KureDatabase } from "./KureDatabase";
import { broadcastMessage } from "Common/functions";
import { SIG_REQUEST_COUPON_DATA } from "Common/signals";

const db = new KureDatabase();
const resource = new Resource();

export const fetchAdjustmentData = async () => {
  await getTaxes();
  await getShipping();
  await getPromotionData();
  return true;
}

async function getTaxes() {
  const response = await resource.getAdjustmentTax();
  const { data } = response;
  if (data == undefined) {
    return;
  }

  const taxes = JSON.parse(data);

  await db.put(taxes, IDB_TABLES.adjustment_tax);
}

async function getShipping() {
  const response = await resource.getAdjustmentShipping();
  const { data } = response;
  if (data == undefined) {
    return;
  }

  const shipping = JSON.parse(data);

  await db.put(shipping, IDB_TABLES.adjustment_shipping);
}

async function getPromotionData() {
  const response = await resource.getAdjustmentPromotion();
  //console.log('Promotion request:', response);
  const { data } = response;
  if (data == undefined) {
    return;
  }
  //console.log('Promotion request:', data);

  const promotion = JSON.parse(data);
  // // Loop through each promotion object and console.log when you find one with promotion_id of 456.
  // for (let i = 0; i < promotion.length; i++) {
  //   if (promotion[i].promotion_id == 456) {
  //     console.log("Found promotion_id 456: ", promotion[i]);
  //   }
  // }
  //console.log("adjustment promotion data: ", promotion);

  await db.put(promotion, IDB_TABLES.adjustment_promotion);
}

export const fetchAdjustmentShippingDataById = async (entity_id) => {
  const toast_response = await resource.getAdjustmentShipping({ action: 'single', entity_id: entity_id });
  console.log(toast_response);
  const { data } = toast_response;
  if (data == undefined) {
    return;
  }
  const shipping_records = JSON.parse(data);
  await db.put(shipping_records, IDB_TABLES.adjustment_shipping);
}

export const fetchAdjustmentTaxDataById = async (entity_id) => {
  const toast_response = await resource.getAdjustmentTax({ action: 'single', entity_id: entity_id });
  console.log(toast_response);
  const { data } = toast_response;
  if (data == undefined) {
    return;
  }
  const tax_records = JSON.parse(data);
  await db.put(tax_records, IDB_TABLES.adjustment_tax);
}

export const fetchAdjustmentPromotionDataById = async (entity_id) => {
  const toast_response = await resource.getAdjustmentPromotion({ action: 'single', entity_id: entity_id });
  console.log(toast_response);
  const { data } = toast_response;
  if (data == undefined) {
    return;
  }
  const promotion_records = JSON.parse(data);
  broadcastMessage(SIG_REQUEST_COUPON_DATA);
  console.log("Will send SIG_REQUEST_COUPON_DATA to refetch coupon data");
  await db.put(promotion_records, IDB_TABLES.adjustment_promotion);
}

/**
 * A push notification came in from Drupal.
 */
navigator.serviceWorker.addEventListener('message', async event => {
  console.log("Event received: ", event);
  const { type, entity_id } = event.data;

  switch (type) {
    case 'adjustment_shipping':
      console.log('adjustmentManager.js, fetch shipping ' + entity_id);
      await fetchAdjustmentShippingDataById(entity_id);
      break;

    case 'adjustment_tax':
      console.log('adjustmentManager.js, fetch tax ' + entity_id);
      await fetchAdjustmentTaxDataById(entity_id);
      break;

    case 'adjustment_promotion':
      console.log('adjustmentManager.js, fetch promotion ' + entity_id);
      await fetchAdjustmentPromotionDataById(entity_id);
      break;
  }
});
import { ButtonCategories } from "Common/constants";
import { IDB_TABLES, KureDatabase } from "./KureDatabase";
import { Resource } from "services/api_services/Resource";

const db = new KureDatabase();
let resource = new Resource();

export const getProductByVariationId = async (variation_id) => {
  const product = db.get(variation_id, IDB_TABLES.product_data);
  return product;
}
export const extractValidCategories = async (store_id) => {

  const product_list_idb = await db.getAll(IDB_TABLES.product_data);
  // we can't change because, one product can be included in several stores, and store_id is string combined several stores.
  let categories = [...ButtonCategories];
  let valid_categories = [];
  if (product_list_idb.length == 0) {
    return categories;
  }
  product_list_idb.forEach((product) => {
    // Does this product.store_id match the store_id?
    if (product.store_id == null) {
      return
    }
    const product_store_id = product.store_id.split(',').map((s) => s.trim());
    if (product_store_id.includes(`${store_id}`)) {
      if (product.category_name != null) {
        // I understand this, so I removed comment.
        if (product.promotional_retail_price !== product.retail_price) {
          valid_categories['promotions'] = 'promotions';
        } else {
          valid_categories[product.category_name.toLowerCase()] = product.category_name.toLowerCase();
        }
      }
    }
  });

  // By default display all categories because we do not know which ones exist or not when switching a store.
  for (let index = 0; index < categories.length; index++) {
    categories[index].isHidden = false;
  }

  for (let index = 0; index < categories.length; index++) {
    const category = categories[index];
    // For this particular store, no index was found. Hide this category.
    if (valid_categories[category.value.toLowerCase()] === undefined) {
      categories[index].isHidden = true;
    }
  }

  // Because our logic above assumes if something doesn't exist, it will remove it but the 'all' category must remain.
  categories[0].isHidden = false;

  return categories.filter(x => x.isHidden != true);
}
export const fetchProductDataByProductId = async (product_id) => {
  // console.log("will check", product_id);
  const toast_response = await resource.commerceProductDataSync({ action: 'product_single', entity_id: product_id });
  // console.log("fetchProductDataById: ", toast_response);
  const { status, data } = toast_response;
  if (status == false || data == undefined) {
    return;
  }
  if (data.variations == undefined) {
    return;
  }
  // console.log("PARSE: ", data.variations[0]);
  const variation_record = JSON.parse(data.variations[0]);
  // console.log("variation_record: ", variation_record);
  await db.put(variation_record, IDB_TABLES.product_data);
  return variation_record;
}
export const fetchProductDataByProductIds = async (product_ids) => {
  // Convert entity_ids array to a string to pass to the API.
  product_ids = product_ids.join(',');
  console.log("entity ids: ", product_ids);
  const toast_response = await resource.commerceProductDataSync({
    action: 'product_multiple',
    entity_ids: product_ids
  });
  console.log("fetchProductDataByIds: ", toast_response);
  const { status, data } = toast_response;
  if (status == false || data == undefined) {
    return;
  }
  if (data.variations == undefined) {
    return;
  }

  /**
   * I commented the code below because it needs to work with an array. Please finish this Cai.
   */
  const variations = JSON.parse(data.variations[0]);
  // console.log('variations: ', variations)
  await db.put(variations, IDB_TABLES.product_data);
  return variations
}

export const fetchProductDataByVariationId = async (entity_id) => {
  console.log("will check", entity_id);
  const toast_response = await resource.commerceProductDataSync({ action: 'variation_single', entity_id: entity_id });
  console.log("fetchProductDataById: ", toast_response);
  const { status, data } = toast_response;
  if (status == false || data == undefined) {
    return;
  }
  if (data.variations == undefined) {
    return;
  }

  const variation_record = JSON.parse(data.variations[0]);
  // console.log("variation_record: ", variation_record);
  await db.put(variation_record, IDB_TABLES.product_data);
  return variation_record[0];
}

export const fetchProductDataByVariationIds = async (entity_ids) => {
  // Convert entity_ids array to a string to pass to the API.
  entity_ids = entity_ids.join(',');
  console.log("entity ids: ", entity_ids);
  const toast_response = await resource.commerceProductDataSync({
    action: 'variation_multiple',
    entity_ids: entity_ids
  });
  console.log("fetchProductDataByIds: ", toast_response);
  const { status, data } = toast_response;
  if (status == false || data == undefined) {
    return;
  }
  if (data.variations == undefined) {
    return;
  }

  /**
   * I commented the code below because it needs to work with an array. Please finish this Cai.
   */
  const variations = JSON.parse(data.variations[0]);
  // console.log('variations: ', variations)
  await db.put(variations, IDB_TABLES.product_data);
  return variations
}

/**
 * A push notification came in from Drupal.
 */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', async event => {
    const { type, entity_id } = event.data;
    switch (type) {
      case 'product_data':
        console.log('productManager.js, fetch product data ' + entity_id);
        await fetchProductDataByVariationId(entity_id);
        break;
    }
  });
}
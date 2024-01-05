import { broadcastMessage, MySleep } from "Common/functions";
import { SIG_ALL_PRODUCT_FETCHED, SIG_STORE_DATA_FETCHED, SIG_VALID_CATEGORY_CHANGED } from "Common/signals";
import { Resource } from "services/api_services/Resource";
import { clearAllStorage, getStoreId, storeValidCategoryList } from "services/storage_services/storage_functions";
import { initTokenworksList } from "./customerManager";
import { fakeAddresses } from "./fakeData/fakeAddresses";
import { fakeTokenworks } from "./fakeData/fakeTokenworks";
import { IDB_TABLES, KureDatabase } from "./KureDatabase";
import { postOrderMessage } from "./orderManager";
import { extractValidCategories } from "./productManager";

const db = new KureDatabase();
const resource = new Resource();

const sendCategoryUpdateMessage = async () => {
  const store_id = getStoreId();
  const valid_category_list = await extractValidCategories(store_id);
  storeValidCategoryList(store_id, valid_category_list)
  // console.log("VALID CATEGORIES", valid_category_list);
  broadcastMessage(SIG_VALID_CATEGORY_CHANGED);
};

// export const checkCritical = async () => {
//   return false;
// }

export const clearAllData = () => {
  db.clearDB();
  clearAllStorage();
}

export const initiateData = async () => {
  // Wait for 100ms, this is to wait for initialization idb, if we don't, all count() returns 0.
  await MySleep(100);

  let count = 0;
  // Initialize Tokenworks data.
  await initTokenworksList();

  // Initialize store data.
  // convert to callback functions to await, because there are conflicts depends on idb table operation
  count = await db.storeData().count();
  if (count == 0) {
    const res = await resource.commerceStores();
    await db.put(res.data.rows, IDB_TABLES.commerce_store);
    broadcastMessage(SIG_STORE_DATA_FETCHED);
  }

  // Initialize product data.
  count = await db.count(IDB_TABLES.product_data);
  if (count == 0) {
    console.log("Start product fetching")
    const first_products = await resource.commerceProductDataSync({ page: 0 });
    let variations = JSON.parse(first_products.data.variations[0]);
    await db.put(variations, IDB_TABLES.product_data);
    broadcastMessage(SIG_ALL_PRODUCT_FETCHED);

    const total_pages = first_products.data.pager.total_pages;

    let product_task_list = [];

    for (let page = 1; page <= total_pages - 1; page++) {
      const one_task = new Promise(async (resolve, reject) => {
        const products = await resource.commerceProductDataSync({ page: page });
        variations = JSON.parse(products.data.variations[page]);
        await db.put(variations, IDB_TABLES.product_data)
        broadcastMessage(SIG_ALL_PRODUCT_FETCHED);
        resolve();
      });
      product_task_list.push(one_task)
    }
    await Promise.all(product_task_list);
    // broadcastMessage(SIG_ALL_PRODUCT_FETCHED);
    await sendCategoryUpdateMessage();
    console.log("Finished")

  } else {
    await sendCategoryUpdateMessage();
  }

  //// Init user address data.
  //count = await db.userAddressData().count();
}
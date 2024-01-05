import * as idb from 'idb';
import { fakeTokenworks } from './fakeData/fakeTokenworks';
import { db_updates } from "services/idb_services/KureDatabaseUpdates";

export const IDB_TABLES = {
  adjustment_tax: "adjustment_tax",
  adjustment_shipping: "adjustment_shipping",
  adjustment_promotion: "adjustment_promotion",
  product_data: "product_data",
  commerce_store: "commerce_store",
  users_pin_data: "users_pin_data",
  users_profile_data: "users_profile_data",
  users: "users",
  config_data: "config_data",
  cart_product_data: "cart_product_data",
  tokenworks: "tokenworks",
  customer_data: "customer_data",
  user_address_data: "user_address_data",
  coupon_data: "coupon_data",
  commerce_order: "commerce_order",
  cart_session: "cart_session",
  product_history: "product_history",
  background_messages: "background_messages",
  unread_messages: "unread_messages",
  //product_category: "product_category",
  //order_data: "order_data",
  //order_item: "order_item",
}

class KureDatabase {
  databaseDefinition = {
    dbName: 'kure-db',
    dbVer: 8,
  };

  currentTable = '';

  productData() {
    this.currentTable = IDB_TABLES.product_data;
    return this;
  }

  storeData() {
    this.currentTable = IDB_TABLES.commerce_store;
    return this;
  }

  usersPinData() {
    this.currentTable = IDB_TABLES.users_pin_data;
    return this;
  }

  usersProfileData() {
    this.currentTable = IDB_TABLES.users_profile_data;
    return this;
  }

  cartProductData() {
    this.currentTable = IDB_TABLES.cart_product_data;
    return this;
  }

  orderData() {
    this.currentTable = IDB_TABLES.order_data;
    return this;
  }

  commerceOrder() {
    this.currentTable = IDB_TABLES.commerce_order;
    return this;
  }

  cartSession() {
    this.currentTable = IDB_TABLES.cart_session;
  }

  tokenworksData() {
    this.currentTable = IDB_TABLES.tokenworks;
    return this;
  }

  customerData() {
    this.currentTable = IDB_TABLES.customer_data;
    return this;
  }

  /**
   * @deprecated We may end up using customer_data instead.
   *
   * @returns {KureDatabase}
   */
  userAddressData() {
    this.currentTable = IDB_TABLES.user_address_data;
    return this;
  }

  couponData() {
    this.currentTable = IDB_TABLES.coupon_data;
    return this;
  }

  createTable(tableName, keyPath, indexList = []) {
    // not working, I need to fix this.
    var request = idb.openDB(this.databaseDefinition.dbName, this.databaseDefinition.dbVer);
    request.onerror = (event) => {
      console.error("Why didn't you allow my web app to use IndexedDB?!");
    };
    request.onsuccess = (event) => {
      const db = event.target.result;
      console.log(db);
      db.createObjectStore(tableName, { keyPath: keyPath });
      if (indexList.length > 0) {
        indexList.forEach((index) => {
          objectStore.createIndex(index, index, { unique: false });
        });
      }
    };
  }

  clearDB() {
    idb.deleteDB(this.databaseDefinition.dbName);
  }

  async initialize() {
    return await idb.openDB(this.databaseDefinition.dbName, this.databaseDefinition.dbVer, {
      upgrade(db, oldVersion, newVersion, transaction, event) {
        if (oldVersion < 1) {
          console.log('Creating the database for the first time.');
          const tables = [
            { name: IDB_TABLES.commerce_store, keyPath: 'store_id' },
            {
              name: IDB_TABLES.product_data,
              keyPath: 'variation_id',
              indexes: ['variation_id', 'store_id', 'link', 'category_name', 'package_uid', 'variation_uid']
            },
            // { name: IDB_TABLES.commerce_order, keyPath: 'order_id_react' },
            { name: IDB_TABLES.commerce_order, keyPath: 'order_id' },
            { name: IDB_TABLES.cart_session, keyPath: 'order_id' },
            { name: IDB_TABLES.adjustment_shipping, keyPath: 'id' },
            { name: IDB_TABLES.adjustment_promotion, keyPath: 'promotion_id' },
            { name: IDB_TABLES.coupon_data, keyPath: 'id' },
            { name: IDB_TABLES.adjustment_tax, keyPath: 'id' },
            { name: IDB_TABLES.user_address_data, keyPath: 'place_id' },
            // A table of data to be synced to Drupal.
            { name: IDB_TABLES.customer_data, keyPath: 'uid' },
            { name: IDB_TABLES.tokenworks, keyPath: 'customer_id', indexes: ['add_date'] },
            { name: IDB_TABLES.users_pin_data, keyPath: 'key' },
            { name: IDB_TABLES.users_profile_data, keyPath: 'page' },
            { name: IDB_TABLES.users, keyPath: 'uid' },
            { name: IDB_TABLES.cart_product_data, keyPath: 'cart_product_id' },
            { name: IDB_TABLES.config_data, keyPath: 'name' },
            { name: IDB_TABLES.product_history, keyPath: 'id', indexes: ['package_uid', 'id', 'variation_id'] },
            { name: IDB_TABLES.background_messages, keyPath: 'id', auto_increment: true, indexes: ['type'] },
            { name: IDB_TABLES.unread_messages, keyPath: 'type'},
            //{ name: IDB_TABLES.product_category, keyPath: 'name' },
            //{ name: IDB_TABLES.order_data, keyPath: 'order_id' },
            //{ name: IDB_TABLES.order_item, keyPath: 'order_item_id' },
          ];
          tables.forEach((el) => {
            // Creates the object store(table) and accepts keyPath (primary key).
            const objectStore = db.createObjectStore(el.name, {
              keyPath: el.keyPath,
              autoIncrement: el.auto_increment ? el.auto_increment : false
            });
            if (el.indexes) {
              el.indexes.forEach((index) => {
                objectStore.createIndex(index, index, { unique: false });
              });
            }
            objectStore.transaction.oncomplete = (e) => {
              console.log(`[createTables] ${db.name}, task finished`);
            };
            objectStore.transaction.onerror = (event) => {
              console.log(`[createTables] ${db.name}, ${event.request.errorCode}`);
            };
          });
        }

        // If any additional changes need to happen, add them here.
        db_updates(db, oldVersion, newVersion, transaction, event);
      },
      blocked(currentVersion, blockedVersion, event) {
      },
      blocking(currentVersion, blockedVersion, event) {
      },
      terminated() {
      }
    });
  }

  async count(table = "") {
    const db = await this.initialize();
    const _table = table == "" ? this.currentTable : table;
    try {
      return await db.count(_table);
    } catch (err) {
      console.log('DB count error: ', _table, " /", err.message);
    }
  }

  async clear(table = "") {
    const db = await this.initialize();
    const _table = table == "" ? this.currentTable : table;
    try {
      return await db.clear(_table);
    } catch (err) {
      console.log('DB clear error: ', _table, " /", err.message);
    }
  }

  async put(rows, table = "") {
    if (rows.length == 0) {
      return;
    }
    const db = await this.initialize();
    const _table = table == "" ? this.currentTable : table;
    // if (_table == IDB_TABLES.users_profile_data) {
    //   console.log(rows)
    // }
    try {
      let transaction = db.transaction(_table, 'readwrite');
      let object_store = transaction.objectStore(_table);
      rows.forEach((row) => {
        if (Object.keys(row).length > 0) {
          object_store.put(row);
        }
      });

      return transaction;
    } catch (err) {
      console.log('DB put error: ', rows, _table, " /", err.message);
    }
  }

  async getAll(table = "") {
    const db = await this.initialize();
    const _table = table == "" ? this.currentTable : table;
    try {
      return await db.getAll(_table);
    } catch (err) {
      console.log('DB getAll error: ', _table, " /", err.message);
    }
  }

  async get(key, table = "") {
    const db = await this.initialize();
    const _table = table == "" ? this.currentTable : table;
    try {
      return await db.get(_table, key);
    } catch (err) {
      console.log('DB get error: ', _table, " /", err.message);
    }
  }

  async getAllKeysAndValues(table) {
    const db = await this.initialize();
    const _table = table == "" ? this.currentTable : table;
    const data = {};
    let cursor = await db.transaction(_table).store.openCursor();

    while (cursor) {
      data[cursor.key] = cursor.value;
      cursor = await cursor.continue();
    }

    return data;
  }

  async getSorted(index, direction = 'prev', table = "") {
    const db = await this.initialize();
    const _table = table == "" ? this.currentTable : table;
    // Fetch data sorted by timestamp in descending order
    const tx = db.transaction(_table);
    const store = tx.store;
    const _index = store.index(index);
    const range = IDBKeyRange.lowerBound(0);
    const items = [];

    // Direction can be 'next' or 'prev'. 'prev' means descending order. 'next' means ascending order.
    let cursor = await _index.openCursor(range, direction);
    while (cursor) {
      items.push(cursor.value);
      cursor = await cursor.continue();
    }
    return items;
  }

  async updateOrAdd(data, table = "") {
    if (data == null || data == undefined) {
      return;
    }
    const db = await this.initialize();
    const _table = table == "" ? this.currentTable : table;
    try {
      let transaction = db.transaction(_table, 'readwrite');
      let object_store = transaction.objectStore(_table);
      // console.log(object_store.keyPath, data);
      let new_data = { ...data };
      if (Object.keys(data).includes(object_store.keyPath)) {
        //console.log(data)
        //console.log(data[object_store.keyPath])
        let exist = await object_store.get(data[object_store.keyPath]);
        //console.log(exist);
        if (exist) {
          exist = {
            ...exist,
            ...data
          };
          new_data = { ...exist };
          await object_store.put(exist);
        } else {
          console.log('error', 'Item not found.');
          await object_store.add(data);
          // return null;
        }
      } else {
        //const current_date_time = new Date();
        //const result_in_seconds = Math.round(current_date_time.getTime());
        //new_data[object_store.keyPath] = `new-${result_in_seconds}`;
        await object_store.add(data);
      }

      await transaction.complete;
      return new_data;
    } catch (err) {
      console.log('error', err.message, " :", _table);
    }
  }

  async replaceIndex(old_id, new_id, table = "") {
    const db = await this.initialize();
    const _table = table == "" ? this.currentTable : table;
    let transaction = db.transaction(_table, 'readwrite');
    let object_store = transaction.objectStore(_table);

    const old_item = await object_store.get(old_id);
    if (old_item == undefined) {
      return false;
    }
    console.log('oldITem: ', old_item)
    let new_item = { ...old_item };
    new_item[object_store.keyPath] = new_id;

    await object_store.put(new_item);
    object_store.delete(old_id);
    return true;
  }

  async getAllFromIndex(index_name, key, table = "") {
    const db = await this.initialize();
    const _table = table == "" ? this.currentTable : table;
    try {
      return await db.getAllFromIndex(_table, index_name, key);
    } catch (err) {
      console.log('error', err.message);
    }
  }

  async getAllFromIndexList(index_list, table = this.currentTable) {
    if (index_list === undefined || index_list.length == 0) {
      return null;
    }
    try {
      let data_list = await this.getAll(table);
      data_list = data_list.filter((x) => {
        let res = true;
        const key_list = Object.keys(index_list);
        for (let i = 0; i < key_list.length; i++) {
          const key = key_list[i];
          const value = index_list[key];
          if (x[key] != value) {
            res = false;
            break;
          }
        }
        return res;
      });

      return data_list;
    } catch (err) {
      console.log('error', err.message);
    }
    return null;
  }

  async getAllFromValueList(index_key, valueList, table = "") {
    if (index_key == undefined || valueList === undefined || valueList.length == 0) {
      return null;
    }
    try {
      let dataList = await this.getAll(table);
      dataList = dataList.filter((x) => valueList.includes(x[index_key]));
      return dataList;
    } catch (err) {
    }
    return null;
  }

  async clearTable(table = "") {
    const db = await this.initialize();
    const _table = table == "" ? this.currentTable : table;
    try {
      let transaction = db.transaction(_table, 'readwrite');
      let object_store = transaction.objectStore(_table);
      await object_store.clear();
      return true;
    } catch (err) {
      console.log('error', err.message);
    }
  }

  async deleteAllByIdList(index_list, table = "") {
    const db = await this.initialize();
    const _table = table == "" ? this.currentTable : table;
    try {
      let transaction = db.transaction(_table, 'readwrite');
      let object_store = transaction.objectStore(_table);

      for (let i = 0; i < index_list.length; i++) {
        // await object_store.deleteIndex(indexList[i]);
        console.log("DELETE: ", index_list[i]);
        await object_store.delete(index_list[i]);
      }

      return true;
    } catch (err) {
      console.log('error', err.message);
    }
    return false;
  }
}

export { KureDatabase };

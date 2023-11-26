import { IDB_TABLES } from "services/idb_services/KureDatabase";
import { broadcastMessage } from "Common/functions";
import { SIG_DB_UPDATE_5, SIG_DB_UPDATE_6, SIG_DB_UPDATE_7 } from "Common/signals";


export const db_updates = (db, oldVersion, newVersion, transaction) => {
  console.log("version: ",  oldVersion)
  if (oldVersion < 2) {
    console.log('Upgrade from 1 to 2');
    // Clear the IDB_TABLES.product_data object store
    const productDataStore = transaction.objectStore(IDB_TABLES.product_data);
    productDataStore.clear();
  }
  if (oldVersion < 3) {
    console.log('Upgrade from 2 to 3');
  }
  if (oldVersion < 4 && !db.objectStoreNames.contains(IDB_TABLES.users)) {
    console.log('Upgrade from 3 to 4');

    // Create a new IDB object store named 'users' with the keyPath: 'uid'
    const usersObjectStore = db.createObjectStore(IDB_TABLES.users, { keyPath: 'uid' });

    usersObjectStore.transaction.oncomplete = (e) => {
      console.log(`[createStore] ${db.name}, users store created successfully`);
    };

    usersObjectStore.transaction.onerror = (event) => {
      console.log(`[createStore] ${db.name}, error in creating users store: ${event.target.errorCode}`);
    };
  }
  if (oldVersion < 5) {
    console.log('Upgrade from 4 to 5');
    broadcastMessage(SIG_DB_UPDATE_5);
  }
  if (oldVersion < 6) {
    console.log('Upgrade from 5 to 6');
  }
  if (oldVersion < 7) {
    console.log('Upgrade from 6 to 7');
    broadcastMessage(SIG_DB_UPDATE_7);
  }
  if (oldVersion < 8 && !db.objectStoreNames.contains(IDB_TABLES.background_messages)) {
    console.log('Upgrade from 7 to 8');

    // Create a new IDB object store named 'background messages' with the keyPath: 'id'
    const usersObjectStore = db.createObjectStore(IDB_TABLES.background_messages, {
      keyPath: 'id',
      autoIncrement: true
    });
    // Add index to the object store named 'type'.
    usersObjectStore.createIndex('type', 'type', { unique: false });

    usersObjectStore.transaction.oncomplete = (e) => {
      console.log(`[createStore] ${db.name}, background messages store created successfully`);
    };

    usersObjectStore.transaction.onerror = (event) => {
      console.log(`[createStore] ${db.name}, error in creating background messages store: ${event.target.errorCode}`);
    };
  }
}
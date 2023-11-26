import { IDB_TABLES, KureDatabase } from "services/idb_services/KureDatabase";

export const getCommerceStoreById = async (store_id) => {
  const db = new KureDatabase();
  return await db.get(store_id, IDB_TABLES.commerce_store);
}
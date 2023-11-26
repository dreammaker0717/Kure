import { IDB_TABLES, KureDatabase } from "services/idb_services/KureDatabase";
import { Resource } from "services/api_services/Resource";

const resource = new Resource();
const db = new KureDatabase();

self.onmessage = async function (event) {
  try {
    const page_index = event.data;
    // console.log("Fetch user's profile data:", page_index);
    let res = await resource.getUsersProfileData({ page: page_index });
    let user_data = res['data']['users'];
    let users_list = Object.keys(user_data).map(x => ({ page: parseInt(x), value: user_data[x] }));
    const transaction = await db.put(users_list, IDB_TABLES.users_profile_data);
    transaction.oncomplete = function () {
      self.postMessage('Finished fetching user profile data.');
    }
    transaction.onerror = function (e) {
      console.error('Transaction error:', e);
      self.postMessage('Error during transaction');
    };
    transaction.onabort = function (e) {
      console.error('Transaction aborted:', e);
      self.postMessage('Transaction was aborted');
    };
  } catch (error) {
    console.error(error);
    self.postMessage(error);
  }
};
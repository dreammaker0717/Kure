import { decryptData } from "Common/functions";
import { IDB_TABLES, KureDatabase } from "services/idb_services/KureDatabase";
import { getCustomerDataAll } from "services/idb_services/customerManager";

const db = new KureDatabase();

self.onmessage = async function (event) {
  // console.log('starting user_profile_parse');
  try {
    const profile_data_chunk = await db.get(event.data, IDB_TABLES.users_profile_data);
    // const profile_data_chunk = await db.getAll(IDB_TABLES.users_profile_data);
    let customer_data = await getCustomerDataAll();
    customer_data = customer_data.reduce((acc, user) => {
      const { uid, ...rest } = user;
      // We must include the uid as part of the object property.
      rest.uid = uid;
      acc[uid] = rest;
      return acc;
    }, {});

    if (profile_data_chunk == undefined) {
      self.postMessage('Profile data chunk is undefined');
      return;
    }

    let decrypted_data = JSON.parse(decryptData(profile_data_chunk.value));
    let users_list = [];

    for (let j = 0; j < decrypted_data.length; j++) {
      let { user_id, data } = decrypted_data[j];
      if (data == undefined || user_id == undefined) {
        continue;
      }
      // Let's "hook" into this process. If we see we have data found in our customers_data table, we use it instead.
      // This is necessary to avoid overly complicated code.
      if (customer_data[user_id] != undefined) {
        // if (user_id == 1057) {
        // }
        data = customer_data[user_id];

        // Remove the customer data from the list, so we don't have to process it again.
        // We're going to merge the data from the customer_data table into the data from the user_profile table.
        delete customer_data[user_id];
      }

      users_list[user_id] = {
        uid: user_id,
        name: data['name'],
        roles: data['roles'],
        mail: data['mail'],
        user_addresses: data['user_addresses'],
        is_medical_user: data['is_medical_user'],
        medical_user_info: data['medical_user_info'],
      };
    }

    const transaction = await db.put(users_list, IDB_TABLES.users);
    transaction.oncomplete = function () {
      // console.log('Finished parsing user profile data.')
      self.postMessage('Finished parsing user profile data.');
    };

    transaction.onerror = function (e) {
      console.error('Transaction error:', e);
      self.postMessage({ error: 'Error during transaction' });
    };

    transaction.onabort = function (e) {
      console.error('Transaction aborted:', e);
      self.postMessage({ error: 'Transaction was aborted' });
    };

    // console.log('end of file user_profile_parse');
  } catch (error) {
    console.error(error);
    self.postMessage(error);
  }
};
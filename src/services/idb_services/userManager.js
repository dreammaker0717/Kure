import { Resource } from "services/api_services/Resource";
import { localStorageCashier } from "services/storage_services/CONSTANTS";
import { getLoggedInUserId } from "services/storage_services/storage_functions";
import { IDB_TABLES, KureDatabase } from "./KureDatabase";
import { decryptData, broadcastMessage, MySleep } from "Common/functions";
import { SIG_FETCH_USER_PROFILE_DATA, SIG_ONE_CUSTOMER_RECEIVED, SIG_PARSE_USER_PROFILE_DATA } from "Common/signals";
import {
  idbAddProfileDecrypted,
  idbAddProfileSyncNo,
  idbGetProfileSyncInfo,
  idbInitProfileSync, idbResetConfig, idbResetConfigAll
} from "./configManager";

const db = new KureDatabase();
const resource = new Resource();

export const getUserInfo = async (profile_data) => {
  if (profile_data == null || profile_data.length == 0) {
    return null;
  }
  const user_id = getLoggedInUserId();

  const _profile_data = profile_data.filter(x => x.uid == user_id);
  return _profile_data[0];
}

/**
 * Fetches the user's profile data from Drupal. This is a concurrent sliding window process. We allow a max number of
 * connections to this resource. When one finishes, we start another. This ensures we always have the max number of
 * connections to the resource.
 *
 * @returns {Promise<void>}
 */
export const fetchUsersProfileData = async () => {
  // Get existing synced info
  const sync_info = await idbGetProfileSyncInfo();
  const count = await db.count(IDB_TABLES.users_profile_data);
  // console.log("SYNC INFO: ", sync_info)
  // console.log("COUNT: ", count)
  let existing_no_list = [];
  let existing_total_count = 0;
  if (count > 0) {
    if (sync_info) {
      const sync_time = sync_info['updated_at'];
      existing_no_list = sync_info['synced'];
      existing_total_count = sync_info['total'];
      const now_time = Date.now();

      // Don't allow execution of this function if we already have data.
      if (count == existing_total_count) {
        // we need to fetch if we fetched data 3 days ago.
        if ((now_time - sync_time) / 1000 / 3600 / 24 <= 3) {
          return;
        } else {
          existing_total_count = 0;
          existing_no_list = [];
        }
      } else {
        if ((now_time - sync_time) / 1000 / 3600 / 24 > 1) {
          existing_total_count = 0;
          existing_no_list = [];
        }
      }
    }
  }

  console.log('Starting workers to fetch user profile data');

  let total_res = await resource.getUsersProfileData({ page: 0 })
  let { data } = total_res;
  if (data == undefined) {
    return;
  }

  let { pager, users } = data;
  let { total_pages } = pager;
  // if there's a difference in existing count, we need to initialize
  if (total_pages != existing_total_count) {
    existing_no_list = [];
    existing_total_count = 0;
    console.log("INITIALIZE SYNC INFO");
    await idbInitProfileSync(total_pages);
  }
  // console.log("Fetch user's profile data:", 0, 'Pages:', total_pages);

  await db.put(users.map(x => ({ page: 0, value: x })), IDB_TABLES.users_profile_data);
  await idbAddProfileSyncNo(0);
  broadcastMessage(SIG_FETCH_USER_PROFILE_DATA, {
    user_count: total_pages * 100,
    progress: 1,
  })

  const processChunk = async (i) => new Promise((resolve, reject) => {
    if (existing_no_list.includes(i)) {
      console.log("IGNORE ", i);
      resolve(i);
      return;
    }
    console.log("Start fetch: ", i)
    const worker = new Worker(new URL('../../user_profile_fetch.worker.js', import.meta.url), { type: 'module' });
    worker.postMessage(i);

    worker.onmessage = async (event) => {
      // console.log(`Processed data from key ${i}.`);
      await idbAddProfileSyncNo(i);
      worker.terminate();
      console.log("finsih fetch: ", i)
      resolve(event.data);
    };

    worker.onerror = (error) => {
      // console.error(`Error processing data from key ${i}:`, error);
      worker.terminate();
      console.log("error fetch: ", i)
      reject(error);
    };
  });

  const CONCURRENT_REQUESTS = 3;
  const tasks = [];
  let next_index_to_process = 0;
  let finished_tasks_count = 0;

  // Initial filling of tasks array.
  for (let i = 1; i <= CONCURRENT_REQUESTS && i < total_pages; i++) {
    tasks.push(processChunk(i));
    next_index_to_process++;
  }

  while (tasks.length > 0) {
    const finishedTaskIndex = await Promise.race(tasks.map((task, index) => task.then(() => index)));
    // Remove the finished task.
    tasks.splice(finishedTaskIndex, 1);
    finished_tasks_count++;

    if (next_index_to_process < total_pages) {
      tasks.push(processChunk(next_index_to_process));
      next_index_to_process++;
    }

    // Broadcasting the message only if all tasks in the current group are finished.
    if (finished_tasks_count % CONCURRENT_REQUESTS === 0) {
      broadcastMessage(SIG_FETCH_USER_PROFILE_DATA, {
        // Last page of the last completed group.
        user_count: total_pages * 100,
        progress: (finished_tasks_count / total_pages) * 100,
      });
    }
  }

  // Show 100%.
  broadcastMessage(SIG_FETCH_USER_PROFILE_DATA, {
    // Last page of the last completed group.
    user_count: total_pages * 100,
    progress: 100,
  });

  console.log('Finished fetching user profile data.');
};

/**
 * A concurrent sliding window process to parse the user profile data. We allow a max number of connections to this
 * resource. When one finishes, we start another. This ensures we always have the max number of connections to the
 * resource.
 *
 * @returns {Promise<boolean>}
 */
export const parseUserProfileData = async () => {
  const sync_info = await idbGetProfileSyncInfo();
  const existing_no_list = sync_info['decrypted'];
  const existing_total_count = sync_info['total'];
  // const count = await db.count(IDB_TABLES.users);
  // if (count > 0) {
  //   return false; // Return false or throw an error if necessary
  // }

  console.log('Starting workers to parse user profile data');

  const rowCount = await db.count(IDB_TABLES.users_profile_data);

  const processChunk = async (i) => new Promise((resolve, reject) => {
    if (existing_no_list.includes(i)) {
      resolve();
      return;
    }
    console.log("start decryption: ", i)
    const worker = new Worker(new URL('../../user_profile_parse.worker.js', import.meta.url), { type: 'module' });
    worker.postMessage(i);

    worker.onmessage = async (event) => {
      worker.terminate();
      console.log("finished decryption: ", i)
      await idbAddProfileDecrypted(i);
      resolve();
    };

    worker.onerror = (error) => {
      worker.terminate();
      reject(new Error(`Error processing data from key ${i}: ${error.message}`));
    };
  });

  const CONCURRENT_REQUESTS = 1;
  const tasks = [];
  let nextIndexToProcess = 0;
  let finishedTasksCount = 0;

  // Initial filling of tasks array
  for (let i = 0; i < CONCURRENT_REQUESTS && i < rowCount; i++) {
    tasks.push(processChunk(i));
    nextIndexToProcess++;
  }

  while (tasks.length > 0) {

    const finishedTaskIndex = await Promise.race(tasks.map((task, index) => task.then(() => index)));
    tasks.splice(finishedTaskIndex, 1);  // Remove the finished task
    finishedTasksCount++;

    if (nextIndexToProcess < rowCount) {
      tasks.push(processChunk(nextIndexToProcess));
      nextIndexToProcess++;
    }

    // Broadcasting the progress.
    broadcastMessage(SIG_PARSE_USER_PROFILE_DATA, {
      progress: (finishedTasksCount / rowCount) * 100,
    });
  }

  // Final broadcast message to signify 100% completion.
  broadcastMessage(SIG_PARSE_USER_PROFILE_DATA, {
    progress: 100,
  });

  console.log('Finished parsing user profile data.');
  return true;
};

export const fetchUsersProfileDataById = async (entity_id) => {
  const toast_response = await resource.getUsersProfileData({ action: 'single_user', entity_id: entity_id });
  // console.log("fetchUsersProfileDataById:", toast_response);
  const { data } = toast_response;
  if (data == undefined) {
    return;
  }
  const { users } = data;
  // First get the last page key.
  const rows = await db.getAll(IDB_TABLES.users_profile_data);
  const last_page = rows.length;
  await db.put([{ page: last_page, value: users[0] }], IDB_TABLES.users_profile_data)

  // Give a notification to sync.
  const user = decryptData(users[0]);
  broadcastMessage(SIG_ONE_CUSTOMER_RECEIVED, user);
}

export const getTokenworksDataAll = async () => {
  let tokenworks_list = await db.getSorted('add_date', 'prev', IDB_TABLES.tokenworks);

  if (tokenworks_list.length > 15) {
    tokenworks_list = tokenworks_list.slice(0, 15);
  }
  
  return tokenworks_list;
}

export const getTokenworksData = async (force_fetch = false) => {
  const count = await db.count(IDB_TABLES.tokenworks);

  if (count == 0 || force_fetch == true) {
    // If tokenworks is empty, get from drupal backend.
    try {
      const response = await resource.getTokenworks();
      const { data, status, message } = response;
      if (status != 200) return null;
      const tokenworks = JSON.parse(data);
      await db.put(tokenworks, IDB_TABLES.tokenworks);
    } catch (err) {
      console.log(err);
      return null;
    }
  }
  const all_token_works = await db.getAll(IDB_TABLES.tokenworks);
  return all_token_works;
}

export const getTokenworksWithProfile = async (profileData, force_fetch) => {
  // get tokenworks data
  let all_token_works = await getTokenworksData(force_fetch);
  if (all_token_works == null) return null;

  // get users_profile_data
  const usersProfileData = profileData;

  for (let i = 0; i < all_token_works.length; i++) {
    if (`${all_token_works[i]['uid']}` == "null") {
      continue;
    }
    const uid = parseInt(all_token_works[i]['uid']);
    // const uid = 1693;

    all_token_works[i]['profile'] = usersProfileData.find(x => x['uid'] == uid);
  }
  return all_token_works;
}

export const idbLogoutUser = async () => {
  await resource.userLogout();
  await db.clearTable(IDB_TABLES.coupon_data);
  // await db.clearTable(IDB_TABLES.users_pin_data);
  // await db.clearTable(IDB_TABLES.users);
  await idbResetConfig(idbResetConfigAll());
  // Note: We might not have to delete this, what if the user logs out when they are offline and data hasn't synced yet?
  // await db.clearTable(IDB_TABLES.customer_data);
  localStorage.removeItem(localStorageCashier);
  return true;
}

/**
 * Since a customer logged in, ensure we clear tables that they shouldn't have access to.
 * @returns {Promise<boolean>}
 */
export const idbCustomerLoggedIn = async () => {
  await db.clearTable(IDB_TABLES.users);
  await db.clearTable(IDB_TABLES.users_profile_data);
  return true
}

/**
 * A push notification came in from Drupal.
 */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', async event => {
    const { type, entity_id } = event.data;
    switch (type) {
      case 'users_profile_data':
        console.log('userManager.js, fetch user ' + entity_id);
        await fetchUsersProfileDataById(entity_id);
        break;
    }
  });
}
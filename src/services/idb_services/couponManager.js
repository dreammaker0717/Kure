import { encryptData } from "Common/functions";
import { Resource } from "services/api_services/Resource";
import { IDB_TABLES, KureDatabase } from "./KureDatabase";

const db = new KureDatabase();
const resource = new Resource();

export const fetchCouponData = async () => {
  // console.log("Coupon fetch start");
  try {
    const total_res = await resource.couponCodeData({ page: 0 });
    const { data } = total_res;
    if (data == undefined) {
      return;
    }
    const { pager, } = data;
    const { total_pages } = pager;

    // db.put(data.data, IDB_TABLES.coupon_data)
    // console.log("coupon data: ", data.data);
    db.put(data.data, IDB_TABLES.coupon_data);
    let coupon_tasks = [];

    for (let i = 1; i < total_pages; i++) {
      const one_task = new Promise(async (resolve, reject) => {
        try {
          const res = await resource.couponCodeData({ page: i });
          const coupon_data = res['data']['data'];
          // db.put(coupon_data);
          await db.put(coupon_data, IDB_TABLES.coupon_data);
          resolve(true);
        } catch (err) {
          reject();
        }
      });
      coupon_tasks.push(one_task);
    }
    await Promise.all(coupon_tasks)
    // console.log("Coupon fetch finished");
    const coupon_all = await db.getAll(IDB_TABLES.coupon_data);
    // console.log("coupon data: ", coupon_all)
    return true;
  } catch (err) {
    console.log("Coupon fetch error: ", err);
    return false;
  }
}


export const decryptCouponData = async (data) => {
  return await new Promise((resolve, reject) => {
    const worker = new Worker(new URL('../../coupon.worker.js', import.meta.url), { type: 'module' });
    worker.postMessage(data);

    worker.onmessage = (event) => {
      // console.log('coupon event data: ', event.data.data)
      resolve(event.data.data);
    };

    worker.onerror = (error) => {
      reject(error);
    };
  });
}
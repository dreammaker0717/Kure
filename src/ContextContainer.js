import React, { useEffect, useState } from 'react';
import { UsersProfileContext } from 'services/context_services/usersProfileContext';
import { IDB_TABLES, KureDatabase } from 'services/idb_services/KureDatabase';
import {
  fetchUsersProfileData,
  idbLogoutUser,
  parseUserProfileData
} from 'services/idb_services/userManager';
import {
  SIG_CHANNEL, SIG_DB_UPDATE_5, SIG_DB_UPDATE_6, SIG_DB_UPDATE_7,
  SIG_FINISH_REQUEST_USERS_PROFILE,
  SIG_REFILL_CUSTOMER_DATA,
  SIG_REQUEST_ADJUSTMENT_DATA,
  SIG_REQUEST_COUPON_DATA,
  SIG_REQUEST_USERS_PROFILE,
  SIG_ORDER_LIST_CHANGED
} from 'Common/signals';
import { decryptCouponData, fetchCouponData } from 'services/idb_services/couponManager';
import { CouponDataContext } from 'services/context_services/couponDataContext';
import { broadcastMessage } from 'Common/functions';
import { fetchAdjustmentData } from 'services/idb_services/adjustmentManager';
import { CommonDataProvider } from 'services/context_services/commonDataContext';
import { CartDataProvider } from 'services/context_services/cartDataContext';
import { Resource } from "services/api_services/Resource";
import { useNavigate } from "react-router-dom";
import { fetchOrderNotification } from 'services/idb_services/orderManager';

const ContextContainer = (props) => {
  const db = new KureDatabase();
  const navigate = useNavigate();
  const [tick, setTick] = useState(true);
  const [intervalId, setIntervalID] = useState(null);
  const [profileData, setProfileData] = useState([]);
  const [profileToggle, setProfileToggle] = useState({ t: false });
  const [couponToggle, setCouponToggle] = useState({ t: false });
  const [couponData, setCouponData] = useState([]);
  const [openNotificationDrawer, setOpenNotificationDrawer] = useState(false);
  const resource = new Resource();
  // Check every 5 mins.
  // const checkTime = 300000;

  useEffect(() => {
    setTimeout(async () => {
      // Only a logged in user should execute this function.
      const is_logged_in = await resource.isLoggedIn();
      if (!is_logged_in) return;
      await fetchUsersProfileData();
      await parseUserProfileData().then(async () => {
        // console.log("FINISHED PARSE USER PROFILE DATA 1")
        setProfileData(await db.getAllKeysAndValues(IDB_TABLES.users));
      });
      await parseCouponData();
    }, 200);
  }, []);

  // useEffect(() => {
  //   setIntervalID(setInterval(timer, checkTime));
  //   return () => {
  //     clearInterval(intervalId);
  //   };
  // }, []);
  //
  // const timer = () => setTick((t) => !t);
  //
  // useEffect(() => {
  //   /**
  //    * We don't have a background service (yet) that can make this request.
  //    *
  //    * @returns {Promise<void>}
  //    */
  //   async function onPageLoadSyncOrdersToDrupal() {
  //     // console.log("CALL FROM ContextContainer");
  //     await syncOrderWithDrupal();
  //   }
  //
  //   onPageLoadSyncOrdersToDrupal();
  // }, [tick]);

  // useEffect(() => {
  //   if (profileToggle['t'] == false) return;
  //   parseUserProfileData();
  // }, [profileToggle]);

  const parseCouponData = async () => {
    const count = await db.count(IDB_TABLES.coupon_data);
    if (count == 0) {
      return;
    }
    const data = await db.getAll(IDB_TABLES.coupon_data);
    const decrypted = await decryptCouponData(data);
    // console.log("decrypted coupon data: ", decrypted);
    setCouponData(decrypted);
  };


  useEffect(() => {
    const channel = new BroadcastChannel(SIG_CHANNEL);
    channel.addEventListener('message', async (event) => {
      const { data, type } = event.data;
      switch (type) {
        case SIG_REQUEST_USERS_PROFILE:
          // We don't require special permission for this call because Drupal will handle this via the permissions
          // assigned to a user when they log in.
          fetchUsersProfileData().then(() => {
            // Now fire the parsing function. This will take the encrypted data and parse it into a users IDB store.
            // setProfileToggle({ t: true });

            // We're using a broadcast message in hopes this will force the garbage collector to clean up the memory.
            broadcastMessage(SIG_FINISH_REQUEST_USERS_PROFILE)
          });
          break;

        case SIG_REQUEST_COUPON_DATA:
          fetchCouponData().then(() => {
            parseCouponData();
          });
          break;

        case SIG_REQUEST_ADJUSTMENT_DATA:
          fetchAdjustmentData().then(() => {
          });
          break;

        /**
         * We never want to update the profile data directly. This is the job of a push notification process or the
         * first time download process.
         */
        // case SIG_CUSTOMER_CREATED:
        //   setProfileData((p) => [...p, data]);
        //   break;

        case SIG_REFILL_CUSTOMER_DATA:
          setProfileToggle({ t: true });
          break;

        // case SIG_USERS_PROFILE_ID_CHANGED:
        //   const { old_id, new_id } = data;
        //   if (profileData == null || Object.keys(profileData).length == 0) return;
        //   let tmp = [...profileData];
        //   const index = tmp.findIndex((x) => x.uid == old_id);
        //   if (index == undefined) return;
        //   tmp[index]['uid'] = new_id;
        //   setProfileData(tmp);
        //   // broadcastMessage(SIG_CUSTOMER_SELECTED);
        //   break;

        case SIG_FINISH_REQUEST_USERS_PROFILE:
          // console.log("SIG_FINISH_REQUEST_USERS_PROFILE")

          await parseUserProfileData().then(async () => {
            setProfileData(await db.getAllKeysAndValues(IDB_TABLES.users));
          });
          break;

        // Clear IDB_TABLES.users and IDB_TABLES.users_profile_data IDB tables and fire a broadcast message to clear
        // the profileData context.
        case SIG_DB_UPDATE_5:
          console.log("SIG_DB_UPDATE_5");
          // setProfileData([])
          // await db.clear(IDB_TABLES.users_profile_data);
          await idbLogoutUser();
          // navigate('/login');
          break;

        // To ensure users have the latest product data, remove it.
        case SIG_DB_UPDATE_7:
          await db.clear(IDB_TABLES.product_data);
          break;
      }
    });

    // Try to get coupon data at first.
    fetchCouponData().then(() => {
      parseCouponData();
    });
  }, []);

  return (
    <>
      <CommonDataProvider>
        <UsersProfileContext.Provider
          value={{ profileData, setProfileData, openNotificationDrawer, setOpenNotificationDrawer }}>
          <CouponDataContext.Provider value={couponData == undefined ? [] : couponData}>
            <CartDataProvider>
              {props.children}
            </CartDataProvider>
          </CouponDataContext.Provider>
        </UsersProfileContext.Provider>
      </CommonDataProvider>
    </>
  );
};

export default ContextContainer;

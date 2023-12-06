import { USER_TYPE } from 'Common/constants';
import { backgroundServiceMessenger } from 'Common/functions';
import { customToast } from 'components/CustomToast/CustomToast';
import React, { useEffect, useState } from 'react';
import { Resource } from 'services/api_services/Resource';
import { idbSetIsOnline } from 'services/idb_services/configManager';
import { syncOrdersWithDrupal } from "services/idb_services/orderManager";
import { syncCustomersWithDrupal } from "services/idb_services/customerManager";

const resource = new Resource();
const checkTime = 300000;
// const checkTime = 3000;
const BackgroundContainer = (props) => {
  const { isPageVisible } = props;
  const [tick, setTick] = useState(true);
  const [intervalId, setIntervalID] = useState(null);

  // this tick and interval are very important.
  // if we don't use like this, then useEffect can not get the current state.
  useEffect(() => {
    setIntervalID(setInterval(timer, checkTime));
    return () => {
            clearInterval(intervalId);
    };
  }, []);
  const timer = () => setTick((t) => !t);

  useEffect(() => {
    if (resource.getUserRole() != USER_TYPE.KURE_EMPLOYEE) {
      return;
    }
    if (!isPageVisible) {
      return;
    }

    syncImportantData();
  }, [tick]);


  useEffect(() => {

    const handleOnline = () => {
      customToast.success("The device is online.");
      idbSetIsOnline(true);
      syncImportantData();
    };

    const handleOffline = () => {
      customToast.warn("The device is offline.")
      idbSetIsOnline(false)
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [])

  /**
   * To ensure data is synced, we want to fire important requests as soon as possible. We use the background service
   * in case the user is offline. We fall back to a standard function if the background service call fails.
   *
   * @returns {Promise<void>}
   */
  const syncImportantData = async () => {
    const sync_customer_result = await backgroundServiceMessenger('customer-data-sync');
    if (!sync_customer_result) {
      await syncCustomersWithDrupal();
    }

    const sync_order_result = await backgroundServiceMessenger('order-data-sync');
    if (!sync_order_result) {
      await syncOrdersWithDrupal();
    }
      }
  return (
    <div>
    </div>
  );
};

export default BackgroundContainer;
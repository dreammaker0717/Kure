import Routes from './routes';
import ThemeCustomization from './themes';
import { useEffect, useState, } from 'react';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { initiateData } from 'services/idb_services/initiateData';
import ContextContainer from './ContextContainer';
import { Resource } from "services/api_services/Resource";
import { KureDatabase } from "services/idb_services/KureDatabase";
import createActivityDetector from 'activity-detector';
import { USER_TYPE } from "Common/constants";
import PushNotificationContainer from './PushNotificationContainer';
import BackgroundContainer from './BackgroundContainer';
import { getTokenworksData } from 'services/idb_services/userManager';
import { idbResetConfig, idbResetConfigAll, idbSetLoggedInUser } from 'services/idb_services/configManager';
import { IDB_TABLES } from "services/idb_services/KureDatabase";

const App = () => {
  const resource = new Resource();
  const db = new KureDatabase();
  const isIdle = useIdle({ timeToIdle: 5000 });
  const [isPageVisible, setIsPageVisible] = useState(true);

  const handleVisibilityChange = () => {
    setIsPageVisible(!document.hidden);
    // console.log("app visibility: ", !document.hidden, new Date());
  };


  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange, false);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange, false);
    };
  }, []);


  function useIdle(options) {
    const [isIdle, setIsIdle] = useState(false);
    useEffect(() => {
      const activityDetector = createActivityDetector(options);
      activityDetector.on('idle', () => setIsIdle(true));
      activityDetector.on('active', () => setIsIdle(false));
      return () => activityDetector.stop();
    }, []);
    return isIdle;
  }

  function sendDataToServiceWorker(type, data) {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: type,
        data: data
      });
    }
  }

  useEffect(() => {
    async function fetch() {
      await initiateData();
    }

    fetch();
    // resource.commerceProductDataSync().then((response) => {
    //   const variation_record = JSON.parse(response.data.variations);
    // });

    //backgroundServiceMessenger('','Hello from React');
    //sendDataToServiceWorker('customer_data_sync', 'From app.js, syncing data.');

    // getTokenworksWithProfile().then((data) => {
    // }).catch((err) => {
    // });
    //refreshCart();
    //
    // fetchUsersProfileData().then(() => {
    // })
    // const data = decryptData()
    // console.log(data)
  }, []);

  /**
   * @TODO: An overly simple way to call our /tokenworks endpoint but it works for now. This needs to be a push
   *        push notification from Drupal instead - this way we can save the battery life of the device.
   */
  useEffect(() => {
    // !!!!!!!!!!!!!!!!!!!! THIS MUST BE REMOVED
    if (resource.getUserRole() == USER_TYPE.KURE_EMPLOYEE) {
      getTokenworksData(true);
    }
  }, []);

  /**
   * Using the activity-detector package, we can detect when the user is idle. If they are idle for 30 minutes, log
   * them out.
   */
  useEffect(() => {
    async function fetch() {
      let user_data = localStorage.getItem(resource.config.user_info);
      if (user_data) {
        try {
          user_data = JSON.parse(user_data);
          const keep_me_signed_in = localStorage.getItem('keep_me_signed_in') === 'true'

          if (!keep_me_signed_in) {
            // Compare active_timestamp to current time. If it's been more than 30 minutes, log the user out.
            if (user_data && user_data.active_timestamp && (Date.now() - user_data.active_timestamp) > 1800000) {
              // if (data && data.active_timestamp && (Date.now() - data.active_timestamp) > 5000) {
              localStorage.removeItem(resource.config.user_info);
              localStorage.removeItem(resource.config.token_name);
              // let's keep it.
              // await db.clear(IDB_TABLES.config_data);
              await idbResetConfig(idbResetConfigAll());
              window.location.reload();
            } else if (user_data) {
              // Update the active_timestamp.
              user_data.active_timestamp = Date.now();
              localStorage.setItem(resource.config.user_info, JSON.stringify(user_data));
              idbSetLoggedInUser(JSON.stringify(user_data));
            }
          }
        } catch (e) {
        }
      }
    }

    fetch();
  }, [isIdle]);

  return (
    <>
      <BackgroundContainer
        isPageVisible={isPageVisible}
      />
      <ThemeCustomization>
        <ToastContainer />
        <ContextContainer>
          <PushNotificationContainer />
          <Routes />
        </ContextContainer>
      </ThemeCustomization>
    </>
  );
};
export default App;

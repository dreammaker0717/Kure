import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from 'layout/HomeLayout/Header';
import Footer from 'layout/HomeLayout/Footer';
import GlobalStyle from 'Common/GlobalStyle/index';
import FloatingButtons from './FloatingButtons/FloatingButtons';
import NotificationModal from 'layout/HomeLayout/Drawer/NotificationDrawer/NotificationDrawer';
import PushNotificationModal from './Drawer/NotificationDrawer/PushNotificationModal';
import { useEffect, useState } from 'react';
import { SIG_AUTH_CHANGED, SIG_CHANNEL, SIG_STORE_DATA_FETCHED } from 'Common/signals';
import { IDB_TABLES, KureDatabase } from 'services/idb_services/KureDatabase';
import { Resource } from 'services/api_services/Resource';
import { CommonDataIndex, useCommonData } from 'services/context_services/commonDataContext';
import AgeGatePopup from 'components/AgeGatePopup';
import NotificationsContainer from './NotificationsContainer/NotificationsContainer';


const db = new KureDatabase();
const resource = new Resource();
const HomeLayout = () => {
  const screenSize = useWindowSize();
  // const scrollPosition = useScrollPosition();


  const { values: commonData, setValue: setCommonData, setValueObjects: setCommonDataObjects } = useCommonData();


  const setIsLoggedIn = async () => {
    const is_logged_in = await resource.isLoggedIn();
    setCommonData(CommonDataIndex.IS_LOGGED_IN, is_logged_in);
  }
  const setStores = async () => {
    const stores = await db.getAll(IDB_TABLES.commerce_store);
    if (!stores || stores.length == 0) {
      setCommonData(CommonDataIndex.STORES, []);
    } else {
      setCommonData(CommonDataIndex.STORES, stores);
    }
  }

  useEffect(() => {
    // console.log('scrensize changed', screenSize)
    if (screenSize == undefined || screenSize.width == undefined) return;
    setCommonDataObjects({
      [CommonDataIndex.WIDTH]: screenSize.width,
      [CommonDataIndex.HEIGHT]: screenSize.height,
    })

  }, [screenSize]);

  // useEffect(() => {
  //   const viewport_height = window.innerHeight;
  //   const is_scrolled = commonData[CommonDataIndex.IS_SCROLLED];
  //   if (scrollPosition > viewport_height / 5) {
  //     if (is_scrolled == false) {
  //       setCommonData(CommonDataIndex.IS_SCROLLED, true);
  //     }
  //   } else {
  //     if (is_scrolled == true) {
  //       setCommonData(CommonDataIndex.IS_SCROLLED, false);
  //     }
  //   }
  // }, [scrollPosition])

  useEffect(() => {
    const channel = new BroadcastChannel(SIG_CHANNEL);
    channel.addEventListener('message', (event) => {
      const { data, type } = event.data;
      switch (type) {
        case SIG_STORE_DATA_FETCHED:
          setStores();
          break;

        case SIG_AUTH_CHANGED:
          setIsLoggedIn();
          break;
      }
    });

    setIsLoggedIn();
    setStores();
  }, []);

  return (
    <GlobalStyle>
      <Box sx={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AgeGatePopup />
        <Header />
        <NotificationsContainer />
        {/* <NotificationModal />
        <PushNotificationModal />
        <FloatingButtons /> */}
        <Box sx={{ flex: 1 }}>
          <Outlet />
        </Box>
        <Footer />
      </Box>
    </GlobalStyle>
  );
};
export default HomeLayout;


// Hook
function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount

  return windowSize;
}

// function useScrollPosition() {
//   // Initialize state with undefined width/height so server and client renders match
//   // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
//   const [position, setPosition] = useState(0);

//   useEffect(() => {
//     function scrollChange() {
//       setPosition(window.scrollY);
//     }

//     window.addEventListener('scroll', scrollChange);
//     return () => window.removeEventListener('scroll', scrollChange);

//   }, []); // Empty array ensures that effect is only run on mount

//   return position;
// }

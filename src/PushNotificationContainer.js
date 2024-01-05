import { SIG_AUTH_CHANGED, SIG_CHANNEL, SIG_ONE_CUSTOMER_RECEIVED, SIG_RECEIVE_NOTIFICATION, SIG_MESSAGE_MODAL_OPEN } from 'Common/signals';
import React, { useContext, useEffect, useState } from 'react';
import "react-toastify/dist/ReactToastify.css";
import { clearAllData, } from 'services/idb_services/initiateData';
import { Dialog } from '@mui/material';
import CriticalRefreshPopup from 'components/CriticalRefreshPopup';
import ShowMessageModal from 'components/ShowMessageModal/ConfirmModal';
import { getLoggedInUserId } from 'services/storage_services/storage_functions';
import { FCM_TYPE } from 'Common/constants';
import { fetchOrderNotification } from 'services/idb_services/orderManager';
import { fakeOrders } from 'services/idb_services/fakeData/fakeOrders';
import { broadcastMessage } from 'Common/functions';
import { getTokenworksData } from 'services/idb_services/userManager';
import { UsersProfileContext } from 'services/context_services/usersProfileContext';


const PushNotificationContainer = (props) => {

  const [showCritical, setShowCritical] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const { profileData, setProfileData } = useContext(UsersProfileContext);

  useEffect(() => {
    const channel = new BroadcastChannel(SIG_CHANNEL);
    channel.addEventListener('message', async (event) => {
      const { data, type } = event.data;
      switch (type) {
        case SIG_RECEIVE_NOTIFICATION:
          if (data == "" || data == undefined) return;
          let param = {};
          try {
            param = JSON.parse(data);
          } catch (err) {
          }
          const { type } = param;
          if (type == FCM_TYPE.CLEAR_ALL) {
            // // when receive clear all notification
            // if (dest_user_id == undefined) return;
            // const registered_id = getUserId();
            // if (dest_user_id != registered_id) {
            //   return;
            // }
            clearAllData();
            setShowCritical(true);
          }
          break;
        case SIG_ONE_CUSTOMER_RECEIVED:
          if (data && data.length > 0 && profileData) {
            let newProfile = { ...profileData, [data[0].user_id]: data[0].data }
            setProfileData(newProfile);
          }
          break;
        case SIG_AUTH_CHANGED:
          getTokenworksData(true).then((res) => {
          });
          break;
        case SIG_MESSAGE_MODAL_OPEN:
          setShowMessageModal(true);
          setMessageContent(data);
          break;
      }
    });

    // fetchOrderNotification().then((res) => {
    //   console.log(res);
    //   // broadcastMessage(SIG_ORDER_LIST_CHANGED, order_data);
    // })
  }, []);

  return (
    <>
      <Dialog
        open={showCritical}
        style={{ backgroundColor: '#373737', opacity: '97%' }}
        PaperProps={{
          style: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            margin: '5x',
          }
        }}
      >
        <CriticalRefreshPopup />
      </Dialog>
      <ShowMessageModal
        open={showMessageModal}
        onOK={(v) => {
          setShowMessageModal(false);
        }}
        onCancel={(v) => {
          setShowMessageModal(false);
        }}
        content={messageContent}
      />
    </>
  );
};

export default PushNotificationContainer;
import { message } from "./utils/firebaseInit";
import firebase from 'firebase/app';
messaging.requestPermission()
  .then(async function () {
    const token = await messaging.getToken();
    // Token can be sent to server from here.
    console.log(token)
  })
  .catch(function (err) {
    console.log("Unable to get permission to notify.", err);
  });

navigator.serviceWorker.addEventListener("message", (message) => console.log(message));



const messaging = firebase.messaging();
messaging.setBackgroundMessageHandler(function (payload) {
  const promiseChain = clients
    .matchAll({
      type: "window",
      includeUncontrolled: true,
    })
    .then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const windowClient = windowClients[i];
        windowClient.postMessage(payload);
      }
    })
    .then(() => {
      return registration.showNotification("my notification title ");
    });
  return promiseChain;
}); self.addEventListener("notificationclick", function (event) {
  console.log(event);
});

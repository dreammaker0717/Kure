export const getNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications.');
      return false;
    }
  
    // Add an event listener for when a notification is clicked
    document.addEventListener('notificationclick', (event) => {
      console.log('Notification clicked:', event);
    });
  
    // Add an event listener for changes in notification permission
    const permission = await Notification.requestPermission();
    if (permission == 'granted') {
      return true;
    }
  
    return false;
  }
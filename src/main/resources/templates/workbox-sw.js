importScripts('{{appUrl}}js/workbox-sw.prod.v2.0.1.js');

const swVersion = '{{appVersion}}';
const workboxSW = new self.WorkboxSW({
    skipWaiting: true,
    clientsClaim: true
});

// This is a placeholder for manifest dynamically injected from webpack.config.js
workboxSW.precache([]);

// Here we precache custom defined Urls
workboxSW.precache([
    '{{appUrl}}'
]);

workboxSW.router.setDefaultHandler({
    handler: workboxSW.strategies.networkFirst()
});



// Handling the receiving of a push in the subscription
self.addEventListener('push', function(event) {
    console.log('[Service Worker] Push Received.');
    console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

    const title = 'Push Codelab';
    const options = {
        body: event.data.text(),
        icon: 'images/icon.png',
        badge: 'images/badge.png'
    };

    const notificationPromise = self.registration.showNotification(title, options);
    event.waitUntil(notificationPromise);
});


// Clicking on the notification
self.addEventListener('notificationclick', function(event) {
    console.log('[Service Worker] Notification click Received.');

    event.notification.close();

    event.waitUntil(
        clients.openWindow('https://developers.google.com/web/')
    );
});

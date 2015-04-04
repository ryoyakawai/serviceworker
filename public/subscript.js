
var isPushEnabled = false;


// Once the service worker is registered set the initial state  
function initialiseState() {
  console.log("initialiseState");
  // Are Notifications supported in the service worker?  
  if (!('showNotification' in ServiceWorkerRegistration.prototype)) {  
    console.warn('Notifications aren\'t supported.');  
    return;  
  }

  // Check the current Notification permission.  
  // If its denied, it's a permanent block until the  
  // user changes the permission  
  if (Notification.permission === 'denied') {  
    console.warn('The user has blocked notifications.');  
    return;  
  }

  // Check if push messaging is supported  
  if (!('PushManager' in window)) {  
    console.warn('Push messaging isn\'t supported.');  
    return;  
  }

  console.log("ready");

  // We need the service worker registration to check for a subscription  
  navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {  
    // Do we already have a push message subscription?  
    console.log("getSubscription");
    serviceWorkerRegistration.pushManager.getSubscription()  
      .then(function(subscription) {  
        // Enable any UI which subscribes / unsubscribes from  
        // push messages.  
        console.log("be push button true");
        var pushButton = document.querySelector('.js-push-button');  
        pushButton.disabled = false;

        if (!subscription) {  
          // We aren't subscribed to push, so set UI  
          // to allow the user to enable push  
          return;  
        }
        
        // Keep your server in sync with the latest subscriptionId
        //sendSubscriptionToServer(subscription);

        // Set your UI to show they have subscribed for  
        // push messages  
        pushButton.textContent = '通知を受け取らない。';  
        isPushEnabled = true;  
      })  
      .catch(function(err) {  
        console.warn('Error during getSubscription()', err);  
      });  
  });  
}


function subscribe() {

  console.log("subscribe");
  // Disable the button so it can't be changed while  
  // we process the permission request  
  var pushButton = document.querySelector('.js-push-button');  
  pushButton.disabled = true;

  navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {  
    serviceWorkerRegistration.pushManager.subscribe()  
      .then(function(subscription) {  
        // The subscription was successful  
        isPushEnabled = true;  
        pushButton.textContent = '通知を受け取らない。';  
        pushButton.disabled = false;

        //console.log(subscription);
        console.log("subscription.subscriptionId");
        console.log(subscription.subscriptionId);
        console.log(subscription.endpoint);

        var infoDiv = document.querySelector('#subscription-info');
        var content = "<p>subscription ID : " + subscription.subscriptionId;

        var curlCommand = '<pre>' + 'curl --header "Authorization: key=AIzaSyBBbNPtCapKSyxBz788rdzTEzUP9gizS80" --header "Content-Type:application/json" https://android.googleapis.com/gcm/send -d "{\\"registration_ids\\":[\\"';
        curlCommand += subscription.subscriptionId;
        curlCommand += '\\"]}"';

        content += curlCommand;



        infoDiv.innerHTML = content;


        // TODO: Send the subscription.subscriptionId and   
        // subscription.endpoint to your server  
        // and save it to send a push message at a later date   
        //return sendSubscriptionToServer(subscription);  
      })  
      .catch(function(e) {  
        if (Notification.permission === 'denied') {  
          // The user denied the notification permission which  
          // means we failed to subscribe and the user will need  
          // to manually change the notification permission to  
          // subscribe to push messages  
          console.warn('Permission for Notifications was denied');  
          pushButton.disabled = true;  
        } else {  
          // A problem occurred with the subscription; common reasons  
          // include network errors, and lacking gcm_sender_id and/or  
          // gcm_user_visible_only in the manifest.  
          console.error('Unable to subscribe to push.', e);  
          pushButton.disabled = false;  
          pushButton.textContent = '通知を受け取るよ。';  
        }  
      });  
  });  
}



function unsubscribe() {  
  var pushButton = document.querySelector('.js-push-button');  
  pushButton.disabled = true;

  navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {  
    // To unsubscribe from push messaging, you need get the  
    // subscription object, which you can call unsubscribe() on.  
    serviceWorkerRegistration.pushManager.getSubscription().then(  
      function(pushSubscription) {  
        // Check we have a subscription to unsubscribe  
        if (!pushSubscription) {  
          // No subscription object, so set the state  
          // to allow the user to subscribe to push  
          isPushEnabled = false;  
          pushButton.disabled = false;  
          pushButton.textContent = '通知を受け取るよ。';  
          return;  
        }  
          
        var subscriptionId = pushSubscription.subscriptionId;  
        // TODO: Make a request to your server to remove  
        // the subscriptionId from your data store so you   
        // don't attempt to send them push messages anymore

        // We have a subscription, so call unsubscribe on it  
        pushSubscription.unsubscribe().then(function(successful) {  
          pushButton.disabled = false;  
          pushButton.textContent = '通知を受け取るよ。';  
          isPushEnabled = false;  
        }).catch(function(e) {  
          // We failed to unsubscribe, this can lead to  
          // an unusual state, so may be best to remove   
          // the users data from your data store and   
          // inform the user that you have done so

          console.log('Unsubscription error: ', e);  
          pushButton.disabled = false;
          pushButton.textContent = '通知を受け取るよ。'; 
        });  
      }).catch(function(e) {  
        console.error('Error thrown while unsubscribing from push messaging.', e);  
      });  
  });  
}


window.addEventListener('load', function() {  
  var pushButton = document.querySelector('.js-push-button');  
  pushButton.addEventListener('click', function() {  
    if (isPushEnabled) {  
      unsubscribe();  
    } else {  
      subscribe();  
    }  
  });

  // Check that service workers are supported, if so, progressively  
  // enhance and add push messaging support, otherwise continue without it.  
  if ('serviceWorker' in navigator) {

    navigator.serviceWorker.register('/sw.js')  
    .then(initialiseState);  
  } else {  
    console.warn('Service workers aren\'t supported in this browser.');  
  }  
});

window.addEventListener('message', function(e){
  console.log(e);
}, false);


window.onmessage = function(e){
    console.log(e);
    mapp.lChika();
    mapp.playMiku("なんかきたよ");
};


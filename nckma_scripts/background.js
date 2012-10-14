// background.js

if ( typeof(nckma) != 'object' ) {
	var nckma = {};
	nckma._bgTask = true;
} else {
	throw( 'background.js needs to load before narcikarma.js!!!');
}

// chrome.browserAction.setIcon( {}, function callback)

/*
// http://developer.chrome.com/extensions/notifications.html
var notification = webkitNotifications.createNotification(
  '../nckma_assets/img/icon.png',  // icon url - can be relative
  'Hello!',  // notification title
  'Lorem ipsum...'  // notification body text
);

// Or create an HTML notification:
var notification = webkitNotifications.createHTMLNotification(
  '../nckma_html/notification.html'  // html url - can be relative
);

// Then show the notification.
notification.show();
*/
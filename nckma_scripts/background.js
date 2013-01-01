// background.js

if ( typeof(nckma) != 'object' ) {
	var nckma = {}
	  , nkBgScrs = []
		, lE = null
		, sc = document.getElementsByTagName('script');
	nckma._bgTask = true;
	lE = nkBgScrs.length > 0 ? nkBgScrs.length + 1 : 0;
	nkBgScrs[lE] = document.createElement('script');
	nkBgScrs[lE].async = true;
	nkBgScrs[lE].src = '../nckma_scripts/narcikarma.js';
	sc[sc.length - 1].parentNode.appendChild( nkBgScrs[lE] );
} else {
	throw( 'background.js needs to load before narcikarma.js!!!');
}

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
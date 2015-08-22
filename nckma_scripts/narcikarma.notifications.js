// https://developer.chrome.com/apps/notifications#type-NotificationOptions
var notification = chrome.notifications.create('abcde', {
		type: 'basic',
		// icon url - can be relative
		iconUrl: '../nckma_assets/img/icon.png',
  		// notification title
  		title: 'Narcikamra v'+nckma.version().str+' startup!',
  		// notification body text
  		message: 'Testing those notifications...',
  		buttons: [
  			{
  				title: 'close'
  			}
		]
	},
	function(notId) {
		console.log('notified', arguments);
		setTimeout(function() {
			chrome.notifications.clear(notId, function() {
				console.log('notify closed', arguments);
			});
		}, 5000);
	}
);

/*
// Or create an HTML notification:
var notification = webkitNotifications.createHTMLNotification(
  '../nckma_html/notification.html'  // html url - can be relative
);

// Then show the notification.
notification.show();
*/

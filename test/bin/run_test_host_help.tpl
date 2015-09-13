<html>
	<head>
		<title>Help for {{utilName}} from {{project}} {{version}}</title>

		<link href="/assets/narcikarma.css" rel="stylesheet" type="text/css">

		<style type="text/css">
			body {
				font-size: 1em;
				font-family: arial, sans-serif;
			}
			.downvote {
				color: rgb(148, 148, 255);
			}
			.gold {
				color: rgb(176, 176, 21);
			}
			.negChange {
				color: rgb(235, 0, 0);
			}
			.noChange {
				color: rgb(0, 0, 0);
			}
			.orangered {
				color: rgb(255, 69, 0);
			}
			.perriwinkle {
				color: rgb(126, 111, 243);
			}
			.posChange {
				color: rgb(0, 190, 0);
			}
			.purple {
				color: rgb(77, 0, 102);
			}
			.upvote {
				color: rgb(255, 139, 96);
			}
		</style>

		<style>
			.nckContent code  {
				color: rgb(9, 125, 9);
			}
			.nckContent pre {
				max-width: 100%;
				overflow-wrap: break-word;
				width: 95%;
				margin: 0 auto;
				background: rgba(0, 0, 0, 0.65);
				padding: 5px;
				box-shadow: -3px 3px 8px rgba(0, 0, 0, 0.35);
			}
			.nckContent pre.file {
				background: rgba(255, 255, 255	, 0.65);
			}
			.nckContent pre code {
				color: rgba(180, 241, 180, 1) !important;
			}
			.nckContent pre.file code {
				color: rgba(119, 119, 208, 1) !important;
			}
			.nckContent {
				position: relative;
				padding: 5px 0;
			}
			.nckContent h1 code,
			.nckContent h2 code,
			.nckContent h4 code,
			.nckContent h5 code,
			.nckContent h6 code {
				color: rgb(255, 139, 96);
			}
			.nckContent h1 {
				font-size: 220%;
				line-height: 100%;
				font-weight: bold;
				margin: 0;
				padding: 2px 0;
			}
			.nckContent > h1 {
				line-height: 32px;
				letter-spacing: 1px;
				font-size: 30px;
				color: rgb(255, 139, 96);
			}
			.nckContent > h1 img {
				vertical-align: top;
			}
			.nckContent h2 {
				color: rgb(77, 0, 102);
				font-size: 180%;
				line-height: 100%;
				font-weight: bold;
				margin: 0;
				padding: 2px 0;
			}
			.nckContent h3 {
				font-size: 120%;
				line-height: 100%;
				font-weight: bold;
				margin: 0;
				padding: 2px 0;
				color: rgb(119, 119, 208);
				letter-spacing: 2px;
			}
			.nckContent h3 code {
				color: rgb(119, 119, 208);
			}
			.nckContent h4 {
				font-size: 100%;
				line-height: 100%;
				font-weight: bold;
				margin: 0;
				padding: 2px 0;
			}
			.nckContent h5 {
				font-size: 90%;
				line-height: 100%;
				font-weight: bold;
				margin: 0;
				padding: 2px 0;
			}
			.nckContent h6 {
				font-size: 80%;
				line-height: 80%;
				font-weight: bold;
				margin: 0;
				padding: 2px 0;
			}
			.nckContent #verblist {
				width: 100%;
			}
			.nckContent table code {
				font-size: 90%;
				white-space: pre;
			}
			.nckContent table code,
			.nckContent table code a {
				color: rgb(9, 125, 9);
			}
			.nckContent table {
				width: 100%;
				padding: 0;
				margin: 0;
				border-spacing: 0;
	 		}
			.nckContent table h3  {
				margin: 0;
			}
			.nckContent table tr {
				padding: 0;
				margin: 0;
				margin: 10px 0;
			}
			.nckContent table td {
				vertical-align: top;
			}
			.nckContent table thead td {
				font-weight: bold;
				color: rgb(119, 119, 208);
			}
			.nckContent table.verbListing thead td {
				font-weight: normal;
			}
			.nckContent table thead td:first-child {
				padding: 0;
			}
			.nckContent table thead,
			.nckContent table tbody {
				padding: 0;
				margin: 0;
			}
			.nckContent table tbody {
				background-color: rgba(255, 255, 255, 0.1) !important;
			}
			.nckContent table tbody tr:hover {
				background: linear-gradient(to bottom,
					rgba(255, 139, 96, 0.2) 0%,
					rgba(148, 148, 255, 0.2) 100%
				);
			}
			.nckContent table tbody tr:nth-child(odd) {
				background-color: rgba(255, 255, 255, 0.5);
			}
			.nckContent table tbody tr:nth-child(even) {
				background-color: rgba(255, 255, 255, 0.2);
			}
			.nckContent table tbody tr:first-child td {
				text-align: left;
				border-top: 1px solid rgb(148, 148, 255);
			}
			.nckContent table tbody td {
				margin: 0;
				padding: 5px;
			}
			.nckContent table tbody td {
				border-bottom: 1px solid rgb(148, 148, 255);
				border-left: 1px solid rgb(148, 148, 255);
			}
			.nckContent table tbody td:first-child {
				width: 20%;
				vertical-align: top;
			}
			.nckContent table.verbListing tbody td:first-child {
				text-align: right;
			}
			.nckContent table.verbListing tbody td[colspan]:first-child {
				text-align: left;
			}
			.nckContent table tbody td:last-child {
				border-right: 1px solid rgb(148, 148, 255);
			}
			.nckContent table tbody tr:first-child td[colspan]:first-child {
				border-radius: 5px 5px 0 0;
			}
			.nckContent table tbody tr:first-child td:first-child {
				border-radius: 5px 0px 0 0;
			}
			.nckContent table tbody tr:first-child td:last-child {
				border-radius: 0px 5px 0 0;
			}
			.nckContent table tbody tr:last-child td:first-child {
				border-radius: 0 0 0 5px;
			}
			.nckContent table tbody tr:last-child td:last-child {
				border-radius: 0 0 5px 0;
			}
			.nckContent table tbody em.verb-none {
				opacity: 0.4;
			}
			.nckContent .section {
				margin: 20px 0;
			}
		</style>

		<style>
			#toc {
				opacity: 0.1;
				margin: 0;
				padding: 0;
				position: fixed;
				top: 10px;
				right: 0;
				z-index: 200;
				background: white;
				border: 5px solid rgb(255, 139, 96);
				border-right: none;
				display: none;
				width: 300px;
				max-height: 80%;
				overflow: scroll;
				overflow-x: hidden;
				border-radius: 8px 0px 0px 8px;
				animation: toc-hover-out 3s ease;
				box-shadow: -3px 3px 8px rgba(0, 0, 0, 0);
			}
			@keyframes toc-hover-out {
				0% {
					opacity: 1.0;
					box-shadow: -3px 3px 8px rgba(0, 0, 0, 0.35);
				}
				10% {
					opacity: 0.9;
					box-shadow: -3px 3px 8px rgba(0, 0, 0, 0.35);
				}
				30%  {
					opacity: 0.5;
				}
				60%  {
					opacity: 0.3;
					box-shadow: -3px 3px 8px rgba(0, 0, 0, 0.05);
				}
				100% {
					opacity: 0.1;
				}
			}
			#toc:hover {
				opacity: 1.0;
				animation: toc-hover-in 1s ease;
				box-shadow: -3px 3px 8px rgba(0, 0, 0, 0.35);
			}
			@keyframes toc-hover-in {
				0%   {}
				10%   {
					opacity: 1.0;
					box-shadow: -3px 3px 8px rgba(0, 0, 0, 0.35);
				}
				100% {}
			}
			#toc_cont {
				position: relative;
			}
			#toc_ul {
				font-size: 10px;
				margin: 0;
				padding: 0;
				list-style: none;
				color: rgb(126, 111, 243);
				background: linear-gradient(to bottom,
					rgba( 255, 139, 96, 0.2 ) 0%,
					rgba( 148, 148, 255, 0.2 ) 100%
				);
			}
			#toc_ul li {
				margin: 0;
				padding: 1px 10px;
				font-size: 80%;
			}
			#toc_ul li.h1 code,
			#toc_ul li.h2 code,
			#toc_ul li.h3 code,
			#toc_ul li.h4 code,
			#toc_ul li.h5 code,
			#toc_ul li.h6 code {
				color: rgb(126, 111, 243);
			}
			#toc_ul li.h1 {
				max-width: 80%;
				font-size: 200%;
				font-weight: bold;
				padding-left: 10px;
			}
			#toc_ul li.h2 {
				font-size: 140%;
				font-weight: bold;
				padding-left: 20px;
				letter-spacing: 1px;
			}
			#toc_ul li.h3 {
				font-size: 120%;
				padding-left: 30px;
				letter-spacing: 1px;
			}
			#toc_ul li.h4 {
				font-size: 110%;
				padding-left: 40px;
				letter-spacing: 1px;
			}
			#toc_ul li.h5 {
				padding-left: 50px;
				letter-spacing: 1px;
			}
			#toc_ul li.h6 {
				font-size: 90%;
				padding-left: 60px;
				letter-spacing: 1px;
			}
			#toc_ul li:first-child {
				padding-top: 5px;
			}
			#toc_ul li:last-child {
				padding-bottom: 5px;
			}
			#toc_ul li:hover {
				color: rgb(255, 139, 96);
				cursor: pointer;
				background-color: #4D0066;
				text-decoration: underline;
			}
			#toc_ul li.h1:hover code,
			#toc_ul li.h2:hover code,
			#toc_ul li.h3:hover code,
			#toc_ul li.h4:hover code,
			#toc_ul li.h4:hover code,
			#toc_ul li.h6:hover code {
				color: rgb(255, 139, 96);
			}
			#toc_tog {
				opacity: 0.6;
				cursor: pointer;
				position: fixed;
				top: -20px;
				right: 0;
				margin: 0;
				padding: 5px 15px;
				border: 3px solid rgb(255, 139, 96);
				border-bottom: none;
				z-index: 2000;
				background: rgb(77, 0, 102);
				color: #ffffff;
				font-size: 12px;
				transform-origin: bottom right;
				transform: rotate( -90deg ); 
				border-radius: 8px 8px 0px 0px;
			}
			#toc:hover,
			#toc_tog:hover {
				opacity: 1.0;
			}
			#toc_close {
				position: absolute;
				top: -20px;
				right: 0;
				cursor: pointer;
				margin: 0;
				padding: 3px 10px;
				height: 15px;
				font-size: 10px;
				line-height: 15px;
				color: black;
				background-color: rgb(255, 139, 96);
				border-radius: 0px 0px 0px 8px;
			}
			#toc_close:hover {
				color: #eb7600;
				background-color: black;
			}
			#toc .logo32 {
				float: left;
				margin: 0 3px;
				margin-left: 0;
			}
			#toc_ul li[toc-to="0"] {
				min-height: 40px;
				font-size: 14px;
			}
			#toc_ul li[toc-to="0"]:hover {
				background-color: transparent!important;
			}
			.toc-clicked {
				padding-left: 4px !important;
				border-left: 1px solid rgba(77,0,102,1);
				border-radius: 5px;
				background: linear-gradient(to right,
					rgba(77,0,102,1) 0%,
					rgba(77,0,102,0) 70%,
					rgba(77,0,102,0) 100%
				);
				color: rgb(255, 139, 96)!important;
			}
		</style>
	</head>
	<body>
		<div class="nckContent">
			<div id="toc"></div>

			<h1><img class="logo32" src="/assets/img/icon32.png"> Help for <code>{{utilName}}</code> from {{project}} {{version}}</h1>

			<div id="about" class="section">
				<h2>What is this?</h2>

				<p>
					The script <code>{{utilName}}</code> is a test server for <a href="https://www.reddit.com/r/Narcikarma/">{{project}}</a> Chrome Extension development.
					It is not meant to serve public traffic nor scale at all.
					It doesn't sere a real website and doesn't host the {{project}} Chrome Extension.
				</p>

				<p>
					What it can do is simulate variations on the <a href="https://www.reddit.com/api/me.json"><code>me.json</code></a> file published by Reddit for users and serve them on localhost.
					With the <code>testing</code> flag turned on in {{project}}, the file will automatically start being retrieved from <code>http://narcikarma.net:8023/me/Narcikarma/me.json</code> (narcikarma.net is a hosts file entry for localhost).
				</p>

				<p>
					In fact, it can serve variations very well.
					By using GET parameters, one can control the values in the simulated file.
					The requests can be se using &quot;verbs&quot; as listed in this document.
				</p>
			</div>

			<div id="usage" class="section">
				<h2>Usage</h2>

				<div id="security" class="section">
					<h3>Security</h3>
					<p>
						There really aren't any security measures taken.
						You should run <code>{{utilName}}</code> manually as you need it.
						Sorry. It's a dev script. 
						It's not meant to be porudction-ready.
						The only thought I gave it was to prevent directory traversal.
					</p>
				</div>

				<div id="setup" class="section">
					<h3>Setup</h3>

					<p>
						The first thing you'll wan to do is add a hosts entry pointing natcikarma.net to your local IP address.
						This needs to be done to honor the permissions in manifest.json.
						Without the hosts entry, you'd need to constantly change the variables and deal with extension security failures.
					</p>

					<p>
						You'll also need <a href="https://nodejs.org/">node.js</a> to be able to run <code>{{utilName}}</code>.
						The script should work no matter the OS.
					</p>
				</div>

				<div id="starting" class="section">
					<h3>Starting the Server</h3>

					<p>
						Your test server file lives at <code>{{utilPath}}</code>.	
						To run it, use <a href="https://nodejs.org/">node.js</a>.
						The file has no module dependencies outside of the core node.js installation.
						The file also has no command line arguments.
						An example of starting the test server in Windows is below showing the first log line from startup.
					</p>

					<pre><code>{{runningWindows}}</code></pre>

					<p>
						To stop the server, just use [CTRL]+[C].
					</p>
				</div>

				<div id="logging" class="section">
					<h3>Server Logging</h3>

					<p>
						A log file is written at <code>{{logPath}}</code>.
						The output is identical to what is displayed on the console when running <code>{{utilName}}</code>.
					</p>

					<div class="section">
						<h4>Server Log Format</h4>
						<p>
							The log follows a general Common Log Format structure, but allows for open-ended columns after the mime-type column.
						</p>

						<pre class="file"><code>{{logFormat}}</code></pre>
					</div>
				</div>

				<div id="paths" class="section">
					<h3>Paths</h3>
					<p></p>

					<div class="section">
						<h4>Simulated Paths</h4>

						<p>
							<table>
								<thead>
									<tr>
										<td>path</td>
										<td>use</td>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>thang</td>
										<td>thang</td>
									</tr>
									<tr>
										<td>thang</td>
										<td>thang</td>
									</tr>
								</tbody>
							</table>
						</p>
					</div>

					<div class="section">
						<h4>Static Paths</h4>

						<p>
							<table>
								<thead>
									<tr>
										<td>path</td>
										<td>use</td>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>thang</td>
										<td>thang</td>
									</tr>
									<tr>
										<td>thang</td>
										<td>thang</td>
									</tr>
								</tbody>
							</table>
						</p>
					</div>
				</div>

				<div id="users" class="section">
					<h3>Simulated Users</h3>
					<ul></ul>
				</div>

				<div id="verbuse" class="section">
					<h3>Using Verbs</h3>
					<p></p>
				</div>

				<div id="workflow" class="section">
					<h3>Workflow</h3>
					<p></p>
				</div>
			</div>

			<div id="supported" class="section">
				<h3>Supported <code>me.json</code> Keys</h3>

				<p>
					<table>
						<thead>
							<tr>
								<td>key</td>
								<td>verbs</td>
								<td>result(s)</td>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>thang</td>
								<td>thang</td>
								<td>thang</td>
							</tr>
							<tr>
								<td>thang</td>
								<td>thang</td>
								<td>thang</td>
							</tr>
						</tbody>
					</table>
				</p>
			</div>

			<div id="additional" class="section">
				<h3>Additional <code>me.json</code> Output</h3>

				<div class="section">
					<h4><em>nkAltered</em></h4>
					<p></p>
				</div>

				<div class="section">
					<h4><em>nkSrc</em></h4>
					<p></p>
				</div>
			</div>

			<div id="verbs" class="section">
				<h2>Verb List</h2>

				<div id="verblist">
				</div>
			</div>
		</div>

		<template id="verbTemplate">
			<div class="section">
				<table class="verbListing" cellspacing="0">
					<thead style="width: 100%;">
						<tr>
							<td colspan="2">
								<h3>##verb##</h3>
							</td>
						</tr>
					</thead>

					<tbody>
						<tr>
							<td colspan="2">##desc##</td>
						</tr>

						<tr>
							<td><strong>Sample##samplesPlural##</strong></td>
							<td>
								<code>##samples##</code>
							</td>
						</tr>

						<tr>
							<td><strong>RegExp</strong></td>
							<td>
								<code>##rgx##</code>
							</td>
						</tr>

						<tr>
							<td><strong>Keys</strong></td>
							<td>
								<code>##keys##</code>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</template>

		<script src="/lib/underscore-min.js"></script>
		<script src="/lib/jquery-1.11.3.js"></script>
		<script src="/lib/bpmv.js"></script>

		<script>
			var tocCount = 0;

			function toc_handle_click (ev) {
				var cl = null
				var gotcha = null;

				if (bpmv.obj(ev) && bpmv.obj(ev.currentTarget)) {
					cl = $(ev.currentTarget);

					if (bpmv.obj(cl) && (cl.length > 0) && cl.is('li[toc-to]')) {
						gotcha = $('*[toc='+cl.attr('toc-to')+']');

						if (bpmv.obj(gotcha) && (gotcha.length > 0)) {
							toc_toggle();

							if (!gotcha.is('h1')) {
								$('h1,h2,h3,h4,h5,h6').removeClass('toc-clicked');
								gotcha.addClass('toc-clicked');
							}

							$('html,body').animate( {
									'scrollTop' : gotcha.offset().top - 40
							}, 300 );
						}
					}
				}

				ev.preventDefault();
			}

			function toc_check_scroll () {
				var currToc = $('#toc');
				var currTocCont = $('#toc_cont');

				if (currTocCont.outerHeight() <= currToc.innerHeight()) {
					currToc.css('overflow-y', 'hidden');
				} else {
					currToc.css('overflow-y', 'scroll');
				}

				$('#toc_close').hide(0).show(0).css('top', currToc.scrollTop()+'px');
			}

			function toc_toggle (ev, forceOff) {
				var currToc = $('#toc');
				var currTocCont = $('#toc_cont');
				var currTocTog = $('#toc_tog');

				if (bpmv.obj(currToc) && bpmv.obj(currTocTog)) {
					currToc.stop(true, true);
					currTocTog.stop(true, true);

					if (currToc.is(':visible') || forceOff) {
						currToc.fadeOut(200);
						currTocTog.fadeIn(200);
					} else {
						currToc.fadeIn(200, toc_check_scroll);
						currTocTog.fadeOut(200);
					}
				}

				if (bpmv.obj(ev)) {
					if (bpmv.func(ev.stopPropagation)) {
						ev.stopPropagation();
					}

					if (bpmv.func(ev.preventDefault)) {
						ev.preventDefault();
					}
				}

				return false;
			}

			function toc_body_click () {
				if($('#toc_cont').is(':visible')) {
					toc_toggle(null, true);
				}
			}

			function toc_update () {
				var currToc = $('#toc');
				var currTocTog = $('#toc_tog');
				var headers = $('h1,h2,h3,h4,h5,h6');
				var tH = null;
				var cont = [ '<div id="toc_cont">', '<div id="toc_close">close</div>' ];
				var node = '';

				if (bpmv.obj(headers) && (headers.length > 0)) {
					cont.push('<ul id="toc_ul">');

					for (var aH = 0; aH < headers.length; aH++) {
						tH = $(headers[aH]);
						node = tH.get(0).nodeName;
						isToc = tH.attr('toc');

						if (!bpmv.str(isToc))  {
							isToc = tocCount++;
							tH.attr('toc', isToc);
						}

						if (bpmv.obj(tH) && (tH.length == 1)) {
							cont.push('<li toc-to="'+isToc+'" class="'+node.toLowerCase()+'">'+tH.get(0).innerHTML+'</li>');
						}
					}

					cont.push('</ul>');
					cont.push('</div>'); // close toc_cont

					if (bpmv.obj(currToc) && (currToc.length > 0)) {
						currToc.replaceWith('<div id="toc">'+cont.join('\n')+'</div>');
					} else {
						currToc = $('<div id="toc"></div>');
						currToc.append(cont.join('\n'));
						$('body').prepend(currToc);
					}

					if (!bpmv.obj(currTocTog) || (currTocTog.length < 1)) {
						$('body').prepend('<div id="toc_tog">Contents</div>');
						currTocTog = $('#toc_tog');
						currTocTog.click(toc_toggle);
					}

					$('#toc_close').off('click', toc_toggle).on('click', toc_toggle);
					$('#toc_ul li').off('click', toc_handle_click).on('click', toc_handle_click);
					$('#toc').off('scroll', toc_check_scroll).on('scroll', toc_check_scroll);
					$('#toc').off('mousewheel', toc_on_wheel).on('mousewheel', toc_on_wheel);
				}
			}

			function toc_on_wheel (ev) {
				var $toc = $('#toc')

				if($toc.innerHeight() != $('#toc_cont').outerHeight()) {
					$toc[0].scrollTop -= ev.originalEvent.wheelDeltaY; 
					ev.preventDefault();
				}
			}

			function toc_init() {
				$(window).resize(toc_check_scroll);
				$('body').on('click', toc_body_click);
				toc_update();
				toc_toggle(null, true);
			}
		</script>

		<script>
			var $verblist = $('.nckContent #verblist');
			var verbTemplate = $('#verbTemplate').html();

			function populate () {
				populate_verbs();
				toc_init();
			}

			function populate_verbs () {
				var replacements;
				var iter;
				var tpl = ''+verbTemplate;
				var html = '';
				var hasNone = '<em class="verb-none">none</em>';

				for (iter in verbList) {
					replacements = {
						'verb': '<em>'+iter+'</em>',
						'rgx': verbList[iter].rgx,
						'len': verbList[iter].len,
						'keys': JSON.stringify(verbList[iter].keys),
						'desc': bpmv.arr(verbList[iter].desc) ? '<p>'+verbList[iter].desc.join('</p>\n<p>')+'</p>' : '<em class="verb-none">No description written.</em>',
						'samples': bpmv.arr(verbList[iter].samples) ? verbList[iter].samples.join('\n\n').replace(/(http\:[^\s\n]+)/g, '<a href="$1">$1</a>') : hasNone,
						'samplesPlural': bpmv.arr(verbList[iter].samples) && verbList[iter].samples.length > 1 ? 's' : ' ',
					};

					html += bpmv.toke(tpl, replacements, false, {l:'##', r:'##'})+'\n\n';
				}

				$verblist.html(html);
				console.log('verbList', verbList);
			}

			$(populate)
		</script>

		<script>{{/*payload*/}}</script>
	</body>
</html>

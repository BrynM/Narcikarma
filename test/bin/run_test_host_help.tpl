<html>
	<head>
		<title>Help for {{utilName}} from {{project}} {{version}}</title>

		<link href="/assets/narcikarma.css" rel="stylesheet" type="text/css">

		<style>/* basics */
			body {
				font-size: 16px;
				line-height: 105%;
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
			.nckContent {
				position: relative;
				padding: 5px 0;
			}
			.nckContent ul#listConventions {
				list-style-type: none;
				padding: 0;
				width: 50%;
				margin: 0 auto;
			}
			.hidden {
				display: hidden;
			}
			.none {
				display: none;
			}
		</style>

		<style>/* blocks */
			.nckContent code,
			.nckContent pre {
				font-size: 90%;
			}
			.nckContent code {
				color: rgb(9, 125, 9);
			}
			.nckContent pre {
				max-width: 100%;
				overflow-wrap: break-word;
			}
			.nckContent h1 code,
			.nckContent h2 code,
			.nckContent h4 code,
			.nckContent h5 code,
			.nckContent h6 code {
				color: rgb(255, 139, 96);
			}
			/* common blocks */
			.nckContent pre.file,
			.nckContent pre.shell,
			.nckContent pre.var {
				box-shadow: -3px 3px 8px rgba(0, 0, 0, 0.35);
				width: 95%;
				margin: 0 auto;
				padding: 5px;
			}
			.nckContent a:hover > code.file,
			.nckContent a:hover > code.get,
			.nckContent a:hover > code.shell,
			.nckContent a:hover > code.url,
			.nckContent a:hover > code.var {
				text-decoration: underline;
			}
			/* .file blocks */
			.nckContent code.file ,
			.nckContent pre.file {
				background: rgba(255, 255, 255	, 0.65);
				color: rgba(119, 119, 208, 1) !important;
			}
			.nckContent code.file {
				display: inline-block;
				padding: 1px 5px;
			}
			.nckContent pre.file code {
				color: rgba(119, 119, 208, 1) !important;
			}
			/* .get blocks */
			.nckContent td.get,
			.nckContent code.get {
				background: rgba(43, 130, 54, 0.35);
				color: rgb(249, 255, 0) !important;
			}
			.nckContent code.get {
				display: inline-block;
				padding: 1px 5px;
			}
			/* .rgx blocks */
			.nckContent td.rgx,
			.nckContent code.rgx {
				background: rgba(196, 67, 197, 0.11);
				color: rgb(78, 1, 75) !important;
			}
			.nckContent code.rgx {
				display: inline-block;
				padding: 1px 5px;
			}
			/* .shell blocks */
			.nckContent code.shell ,
			.nckContent pre.shell {
				background: rgba(0, 0, 0, 0.65);
				color: rgba(180, 241, 180, 1) !important;
			}
			.nckContent code.shell {
				display: inline-block;
				padding: 1px 5px;
			}
			.nckContent pre.shell code {
				color: rgba(180, 241, 180, 1) !important;
			}
			/* .url blocks */
			.nckContent code.url,
			.nckContent code.url a {
				background: rgba(190, 190, 250, 0.25);
				color: rgb(39, 39, 220) !important;
				display: inline-block;
				padding: 0 5px;
			}
			.nckContent code.url a {
				color: rgb(39, 39, 220) !important;
			}
			/* .var blocks */
			.nckContent code.var {
				background: rgba(56, 4, 4, 0.11);
				color: rgb(183, 35, 35) !important;
				display: inline-block;
				padding: 1px 5px;
			}
			.nckContent code.var a {
				color: rgb(183, 35, 35) !important;
			}
		</style>

		<style>/* headings */
			.nckContent .section h1,
			.nckContent .section h2,
			.nckContent .section h4,
			.nckContent .section h5,
			.nckContent .section h6 {
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
			.nckContent h2 code {
				color: rgb(77, 0, 102);
			}
			.nckContent h2:not(.heading-clicked):after {
				content: " ";
				display: block;
				overflow: hidden;
				height: 2px;
				width: 100%;
				margin-top: -2px;
				background: linear-gradient(to left,
					rgba(77, 0, 102, 0.4) 60%,
					rgba(77, 0, 102, 0) 100%
				);
			}
			.nckContent h3 {
				font-size: 120%;
				line-height: 100%;
				font-weight: bold;
				margin: 0;
				padding: 2px 0;
				color: rgb(176, 176, 21);
				letter-spacing: 2px;
			}
			.nckContent h3:not(.heading-clicked):after {
				content: " ";
				display: block;
				overflow: hidden;
				height: 2px;
				width: 25%;
				margin-top: -2px;
				background: linear-gradient(to right,
					rgba(176, 176, 21, 0.4) 20%,
					rgba(176, 176, 21, 0) 100%
				);
			}
			.nckContent h3 code {
				color: rgb(176, 176, 21);
			}
			.nckContent h4 {
				color: rgb(176, 176, 21);
				font-size: 100%;
				line-height: 100%;
				font-weight: bold;
				margin: 0;
				padding: 2px 0;
			}
			.nckContent h4 code {
				color: rgb(176, 176, 21);
			}
			.nckContent h4:not(.heading-clicked):after {
				content: " ";
				display: block;
				overflow: hidden;
				height: 2px;
				width: 15%;
				margin-top: -2px;
				background: linear-gradient(to right,
					rgba(176, 176, 21, 0.4) 20%,
					rgba(176, 176, 21, 0) 100%
				);
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
			.nckContent .heading-clicked {
				padding-left: 4px !important;
				border-left: none;
				border-radius: 5px;
				background: linear-gradient(to top right,
					rgba(255, 139, 96, 0.3) 0%,
					rgba(255, 139, 96, 0) 50%
				);
				color: rgba(255, 237, 96, 1)!important;
				text-shadow:
					-1px -1px 0px rgba(187, 83, 44, 1),
					 1px -1px 0px rgba(187, 83, 44, 1),
					-1px  1px 1px rgba(187, 83, 44, 1),
					 1px  1px 1px rgba(187, 83, 44, 1);
				box-shadow: -1px 1px 2px 0px rgba(255, 139, 96, 0.2);
			}
			.nckContent .heading-clicked code,
			.nckContent .heading-clicked a {
				color: rgba(255, 237, 96, 1)!important;
			}
		</style>

		<style>/* tables */
			.nckContent #listVerbs {
				width: 100%;
			}
			.nckContent .section {
				margin: 20px 0;
			}
			.nckContent table code {
				font-size: 90%;
				word-wrap: break-all;
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
			.nckContent table.verbListing {
				width: 100%;
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
				font-family: Times, "Times New Roman", Georgia, serif;
			}
			.nckContent table.verbListing thead td {
				font-weight: normal;
				text-align: left;
				padding: 0;
			}
			.nckContent table thead td:first-child {
			}
			.nckContent table.verbListing thead td:first-child h3 {
				font-size: 26px;
				line-height: 26px;
				padding-left: 4px;
			}
			.nckContent table.verbListing h3:after {
				display: none;
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
				vertical-align: top;
				text-align: right;
			}
			.nckContent table.paths tbody td:first-child {
				vertical-align: top;
				width: 150px;
				text-align: left;
			}
			.nckContent table.verbListing tbody td:first-child {
				width: 20%;
			}
			.nckContent table.verbListing tbody td[colspan]:first-child {
				text-align: left;
			}
			.nckContent table.verbListing tbody td:not([colspan]):first-child {
				color: rgb(119, 119, 208);
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
			.nckContent table tbody tr:first-child:only-child td:first-child {
				border-radius: 5px 0 0 5px;
			}
			.nckContent table tbody tr:first-child:only-child td:last-child {
				border-radius: 0 5px 5px 0;
			}
			.nckContent table tbody em.has-none {
				opacity: 0.4;
			}
			#listSupported td:nth-child(2) {
				max-width: 200px;
			}
			#listSupported td:nth-child(2) code {
				white-space: normal;
			}
		</style>

		<style>/* toc */
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
				max-height: calc(100% - 40px);
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
				font-size: 9px;
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
				line-height: 100%;
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
				opacity: 0.2;
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
			#toc_totop {
				opacity: 0.2;
				cursor: pointer;
				position: fixed;
				top: 0;
				width: 60px;
				height: 12px;
				right: calc(50% - 30px);
				margin: 0;
				border: 3px solid rgb(255, 139, 96);
				border-top: none;
				z-index: 2000;
				background: rgb(77, 0, 102);
				color: #ffffff;
				font-size: 10px;
				line-height: 10px;
				vertical-align: middle;
				text-align: center;
				border-radius: 0 0 8px 8px;
			}
			#toc:hover,
			#toc_tog:hover,
			#toc_totop:hover {
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
		</style>
	</head>
	<body>
		<div class="nckContent">
			<div id="toc"></div>

			<h1><img class="logo32" src="/assets/img/icon32.png"> Help for <code>{{utilName}}</code> from {{project}} {{version}}</h1>

			<div class="section">
				<h2 id="about">What is this?</h2>

				<div class="section">
					<h3 id="about">About This Help Page</h3>

					<p>
						This help page is meant to be viewed in Chrome.
						Since it's for development on a Chrome extension, I feel that's reasonable.
						No effort has been maded to make the JS or CSS on this page work on any other browser.
					</p>

					<p>
						The script <code class="shell">{{utilName}}</code> is a test server for <a href="https://www.reddit.com/r/Narcikarma/">{{project}}</a> Chrome Extension development.
						It is not meant to serve public traffic nor scale at all.
						It doesn't sere a real website and doesn't host the {{project}} Chrome Extension.
					</p>

					<p>
						What it can do is simulate variations on the <a href="https://www.reddit.com/api/me.json"><code class="file">me.json</code></a> file published by Reddit for users and serve them on localhost.
						With the <code class="var">testing</code> flag turned on in {{project}},
						the file will automatically start being retrieved from <a href="{{mainUrl}}"><code class="url">{{mainUrl}}</code></a>
						(narcikarma.net is a hosts file entry for localhost).
					</p>

					<p>
						In fact, it can serve variations very well.
						By using GET parameters, one can control the values in the simulated file.
						The requests can be se using &quot;verbs&quot; as listed in this document.
					</p>
				</div>

				<div class="section">
					<h3 id="conventions">Annotation Conventions</h3>

					<p>
						Below is a list of visual styles used for certain technical elements in this help page.
					</p>

					<ul id="listConventions">
						<li><p><code class="get">HTTP GET parameter me.json key</code></p></li>
						<li><p><code class="file">plain file name, file contents, or local file system path</code></p></li>
						<li><p><code class="rgx">RegExp regular expressions</code></p></li>
						<li><p><code class="shell">shell command or session</code></p></li>
						<li><p><code class="url">uniform resource locator (URL) or relative URL path</code></p></li>
						<li><p><code class="var">variable in {{project}}</code></p></li>
					</ul>
				</div>
			</div>

			<div class="section">
				<h2 id="usage">Usage</h2>

				<div class="section">
					<h3 id="setup">Setup</h3>

					<p>
						The first thing you'll wan to do is add a hosts entry pointing natcikarma.net to your local IP address.
						This needs to be done to honor the permissions in manifest.json.
						Without the hosts entry, you'd need to constantly change the variables and deal with extension security failures.
					</p>

					<p>
						You'll also need <a href="https://nodejs.org/">node.js</a> to be able to run <code class="shell">{{utilName}}</code>.
						The script should work no matter the OS.
					</p>
				</div>

				<div class="section">
					<h3 id="starting">Starting the Server</h3>

					<p>
						Your test server file lives at <code class="file">{{utilPath}}</code>.	
						To run it, use <code class="shell">node</code>.
						The file has no module dependencies outside of the core node.js installation.
						The file also has no command line arguments.
						An example of starting the test server on {{platform}} is below showing the first log line from startup.
					</p>

					<pre class="shell"><code>{{runningWindows}}</code></pre>

					<p>
						To stop the server, just use [CTRL]+[C].
					</p>
				</div>

				<div class="section">
					<h3 id="logging">Server Logging</h3>

					<p>
						A log file is written at <code class="file">{{logPath}}</code>.
						The output is identical to what is displayed on the console when running <code class="shell">{{utilName}}</code>.
					</p>

					<p>
						Logs are rotated when they reach {{logSizeMax}}.
						Rotated logs have the date and time of rotation inserted into the file name and are stored in <code class="file">{{logDir}}</code> alongside the regular log file.
						After rotation, the rotated file is zipped using <code class="shell">{{logZipper}}</code>.
						If zipping is successful, the uncompressed rotated file is removed.
					</p>

					<div class="section">
						<h4 id="log_format">Server Log Format</h4>
						<p>
							The log follows a general Common Log Format (CLF) structure, but allows for open-ended columns after the mime-type column.
							If you're not familiar with CLF, it's a comma-separated values list with strings enclosed in quotes.
							If you are familiar with CLF, yes I did bastardize it.
						</p>

						<pre class="file"><code>{{logFormat}}</code></pre>
					</div>
				</div>

				<div class="section">
					<h3 id="users">Simulated Users</h3>
					<ul></ul>
				</div>

				<div class="section">
					<h3 id="verbuse">Using Verbs</h3>
					<p></p>
				</div>

				<div class="section">
					<h3 id="workflow">Workflow</h3>
					<p></p>
				</div>
			</div>

			<div class="section">
				<h2 id="paths">Paths</h2>
				<p></p>

				<div class="section">
					<h3 id="paths_sim">Simulated Paths</h3>

					<p>
						<table class="paths">
							<thead>
								<tr>
									<td>Path</td>
									<td>Use</td>
								</tr>
							</thead>
							<tbody id="listPathsSim">
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
					<h3 id="paths_static">Static Paths</h3>

					<p>
						<table class="paths">
							<thead>
								<tr>
									<td>Path</td>
									<td>Use</td>
								</tr>
							</thead>
							<tbody id="listPathsStatic">
								<tr>
									<td>thang</td>
									<td>thang</td>
								</tr>
							</tbody>
						</table>
					</p>
				</div>

				<template id="tplPaths">
					<tr>
						<td><code class="url">##path##</code></td>
						<td>##desc##</td>
					</tr>
				</template>
			</div>


			<div class="section">
				<h2 id="me.json"><code>me.json</code> Output</h2>

				<div class="section">
					<h3 id="supported">Supported Keys</h3>

					<p>
						<table>
							<thead>
								<tr>
									<td>Key</td>
									<td>Primary Verbs</td>
									<td>Result(s)</td>
								</tr>
							</thead>
							<tbody id="listSupported">
							</tbody>
						</table>
					</p>

					<template id="tplSupported">
						<tr>
							<td><code class="get">##key##</code></td>
							<td><code>##verbs##</code></td>
							<td>##desc##</td>
						</tr>
					</template>
				</div>

				<div class="section">
					<h3 id="added">Additional <code>me.json</code> Output</h3>

					<div class="section">
						<h4 id="added_nkAltered"><em>nkAltered</em></h4>
						<p></p>
					</div>

					<div class="section">
						<h4 id="added_nkSrc"><em>nkSrc</em></h4>
						<p></p>
					</div>
				</div>
			</div>

			<div class="section">
				<h2 id="verbs">Verb List</h2>

				<div id="listVerbs">
				</div>

				<template id="tplVerbs">
					<div class="section">
						<table class="verbListing" cellspacing="0">
							<thead style="width: 100%;">
								<tr>
									<td colspan="2">
										<h3 id="verb_##verb##" class="verb-name"><em>##verb##</em></h3>
									</td>
								</tr>
							</thead>

							<tbody>
								<tr>
									<td colspan="2">##desc##</td>
								</tr>

								<tr>
									<td><strong>Sample##samplesPlural##</strong></td>
									<td>##samples##</td>
								</tr>

								<tr>
									<td><strong>RegExp</strong></td>
									<td class="rgx">
										<code>##rgx##</code>
									</td>
								</tr>

								<tr>
									<td><strong>RegExp Keys</strong></td>
									<td>
										<code>##keys##</code>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</template>
			</div>
		</div>

		<script src="/lib/underscore-min.js"></script>
		<script src="/lib/jquery-1.11.3.js"></script>
		<script src="/lib/bpmv.js"></script>

		<script>
			var tocCount = 0;
			var scrollPadding = 50;

			function toc_handle_click (ev) {
				var cl = null
				var gotcha = null;
				var clId;

				if (bpmv.obj(ev) && bpmv.obj(ev.currentTarget)) {
					cl = $(ev.currentTarget);

					if (bpmv.obj(cl) && (cl.length > 0) && cl.is('li[toc-to]')) {
						clId = cl.attr('toc-to');
						gotcha = $('*[toc='+clId+']');

						if (bpmv.obj(gotcha) && (gotcha.length > 0)) {
							toc_toggle();
							highlight_nav(gotcha);

							$('html,body').stop().animate( {
									'scrollTop' : gotcha.offset().top - scrollPadding
							}, 300 );

							if(gotcha.is('*[id]') && history.pushState) {
								history.pushState(null, null, '#'+gotcha.attr('id'));
							} else if (bpmv.str(window.location.hash)) {
								window.history.pushState(null, null, toc_plain_loc());
							}
						}
					}
				}

				ev.preventDefault();
			}

			function toc_plain_loc () {
				return ''+window.location.pathname+(bpmv.str(window.location.search) ? window.location.search : '');
			}

			function toc_body_scroll () {
				if ($('body')[0].scrollTop > 50) {
					$('#toc_totop').removeClass('none');
					return;
				}

				$('#toc_totop').addClass('none');
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

			function toc_totop () {
				if (bpmv.str(window.location.hash)) {
					window.history.pushState(null, null, toc_plain_loc());
				}

				$('html,body').stop().animate( {
						'scrollTop' : 0
				}, 300 );
			}

			function toc_body_click () {
				if($('#toc_cont').is(':visible')) {
					toc_toggle(null, true);
				}
			}

			function toc_update () {
				var currToc = $('#toc');
				var currTocTog = $('#toc_tog');
				var currToTop =  $('#toc_totop');
				var headers = $('h1,h2,h3,h4,h5,h6');
				var tH = null;
				var liHtml;
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
							cont.push('<li toc-to="'+isToc+'" class="'+node.toLowerCase()+'"'+(tH.is('*[id]') ? ' data-id="'+tH.attr('id')+'"' : '')+'>'+tH.get(0).innerHTML+'</li>');
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

					if (!bpmv.obj(currToTop) || (currToTop.length < 1)) {
						$('body').append('<div id="toc_totop" class="none">to top</div>');
						currToTop = $('#toc_totop');
						currToTop.click(toc_totop);
						toc_body_scroll();
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
				$(window).on('resize scroll', _.throttle(toc_body_scroll, 250));
				$('body').on('click', toc_body_click);
				toc_update();
				toc_toggle(null, true);
			}
		</script>

		<script>
			var $listSupported = $('.nckContent #listSupported');
			var $listPathsSim = $('.nckContent #listPathsSim');
			var $listPathsStatic = $('.nckContent #listPathsStatic');
			var $listVerbs = $('.nckContent #listVerbs');
			var tplPaths = $('#tplPaths').html();
			var tplSupported = $('#tplSupported').html();
			var tplVerbs = $('#tplVerbs').html();
			var hasNone = '<em class="has-none">none</em>';

			function highlight_nav ($el) {
				if (!bpmv.obj($el) || !bpmv.num($el.length) || !bpmv.func($el.is)) {
					return;
				}

				$('.heading-clicked').removeClass('heading-clicked');

				if ($el.is('h2,h3,h4,h5,h6')) {
					$el.addClass('heading-clicked');
				}
			}

			function hash_changed (ev) {
				var $targ = $(window.location.hash);

				if (!bpmv.num($targ.length)) {
					return;
				}

				highlight_nav($targ);
				$('html,body').animate( {
						'scrollTop' : $targ.offset().top - scrollPadding
				}, 300 );

				if (bpmv.obj(ev) && bpmv.func(ev.preventDefault)) {
					ev.preventDefault();
				}
			}

			function join_desc (desc) {
				var iter;
				var out = '';

				if (!bpmv.arr(desc)) {
					return '<em class="has-none">no description written</em>';
				}

				for (iter = 0; iter < desc.length; iter++) {
					if (bpmv.str(desc[iter])) {
						out += '<p>'+desc[iter]+'</p>\n';
					}

					if (bpmv.arr(desc[iter])) {
						out += '<p>'+desc[iter].join(' ')+'</p>\n';
					}
				}

				return out;
			}

			function populate () {
				populate_paths();
				populate_supported();
				populate_verbs();

				$(window).on('hashchange', hash_changed);
				$(window).trigger('hashchange');

				toc_init();
			}

			function populate_paths () {
				var replacements;
				var iter;
				var tpl = ''+tplPaths;
				var html = '';

				for (iter in paths.simulated) {
					replacements = {
						'path': iter,
						'desc': join_desc(paths.simulated[iter]),
					};

					html += bpmv.toke(tpl, replacements, false, {l:'##', r:'##'})+'\n\n';
				}

				$listPathsSim.html(html);

				html = '';

				for (iter in paths.static) {
					replacements = {
						'path': iter,
						'desc': join_desc(paths.static[iter]),
					};

					html += bpmv.toke(tpl, replacements, false, {l:'##', r:'##'})+'\n\n';
				}

				$listPathsStatic.html(html);
			}

			function populate_supported () {
				var replacements;
				var iter;
				var tpl = ''+tplSupported;
				var html = '';

				for (iter in supported) {
					replacements = {
						'key': iter,
						'verbs': bpmv.arr(supported[iter].verbs) ? supported[iter].verbs.join(', ').replace(/([a-z]+)/gi, '<a href="#verb_$1">$1</a>') : '<em class="has-none">no primary verbs</em>',
						'desc': join_desc(supported[iter].desc),
					};

					html += bpmv.toke(tpl, replacements, false, {l:'##', r:'##'})+'\n\n';
				}

				$listSupported.html(html);
			}

			function populate_verbs () {
				var replacements;
				var iter;
				var tpl = ''+tplVerbs;
				var html = '';
				var verbNames = bpmv.keys(verbList).sort();
				var key;

				for (iter = 0; iter < verbNames.length; iter++) {
					key = verbNames[iter];
					replacements = {
						'verb': key,
						'rgx': verbList[key].rgx,
						'len': verbList[key].len,
						'keys': JSON.stringify(verbList[key].keys),
						'desc': join_desc(verbList[key].desc),
						'samples': bpmv.arr(verbList[key].samples) ? '<pre><code>'+verbList[key].samples.join('\n\n').replace(/(http\:[^\s\n]+)/g, '<a href="$1"><code class="url">$1</code></a>')+'</code></pre>' : hasNone,
						'samplesPlural': bpmv.arr(verbList[key].samples) && verbList[key].samples.length > 1 ? 's' : ' ',
					};
					html += bpmv.toke(tpl, replacements, false, {l:'##', r:'##'})+'\n\n';
				}

				$listVerbs.html(html);
				console.log('verbList', verbList);
			}

			$(populate);
		</script>

		<script>{{/*payload*/}}</script>
	</body>
</html>

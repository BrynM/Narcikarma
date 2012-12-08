var _gaq = _gaq || [];

function load_nckma_ga () {
	var ga = null
		, s = null;
	_gaq.push(['_setAccount', 'UA-13262635-7']);
	_gaq.push(['_trackPageview']);
	ga = document.createElement('script');
	ga.type = 'text/javascript'; ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	s = document.getElementsByTagName('script')[0];
	s.parentNode.insertBefore(ga, s);
}


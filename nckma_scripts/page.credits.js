var bgP = chrome.extension.getBackgroundPage();
var bpmv = bgP.bpmv;
var _ = bgP._;
var keez = [];
var allD = false;
var roxin = false;

function roxor () {
	var jTs = $('ul:last li');
	var jH =  $('ul:last').parent().find( 'h3' );
	var jI = null;
	var rocking = $('.rocking');

	if (bpmv.obj(jTs) && bpmv.num(jTs.length)) {

		if (rocking.length == jTs.length) {
			rocking.removeClass('rocking');
			jH.removeClass('thoseWhoRock');

			return;
		} else if (!jH.is('.thoseWhoRock')) {
			jH.addClass('thoseWhoRock');

			return;
		}

		for (var i = 0; i < jTs.length; i++) {
			jI = $(jTs[i]);

			if (!jI.is('.rocking')) {
				jI.addClass('rocking');

				break;
			}
		}
	}
}

function roxit () {
	var extant = $('.thanksYouFolksRock');
	var vid = 'j8vPEjioirE';
	var auto = 1;

	if (!bpmv.num(extant.length) && !roxin) {
		$('body').append(
			'<div class="thanksYouFolksRock"><object width="400" height="300"><param name="movie" value="https://www.youtube.com/v/'+vid+'&autoplay='+auto+'"></param><embed src="https://www.youtube.com/v/'+vid+'&autoplay='+auto+'" type="application/x-shockwave-flash" width="400" height="300"></embed></object></div>'
		);

		setTimeout(function() {
			setInterval(roxor, 2100);
			Fireworks();
		}, 1800);

		roxin = true;
	}
}

$(document).ready(function () {
	$('.nckContent').append(bgP.nckma.credits.to_html());

	$('ul:last').parent().find('h3, li').click(function () {
		roxor();
		roxit();
	});

	$(document).keypress(function (ev) {
		if (bpmv.obj(ev) && bpmv.num(ev.keyCode)) {
			keez.push(String.fromCharCode(ev.keyCode)) ;

			while (keez.length > 4) {
				keez.shift();
			}

			if (!roxin && (keez.join('') == 'rock')) {
				roxit();
			}
		}
	} );
});

/* FIREWORKS */

// This script and many more from
//   http://rainbow.arch.scriptmania.com
// adapted further by badmonkey0001

var showerCol = [
		'#000',
		'#CCC',
		'#FF8B60',
		'#ffeae2',
		'#B25F43',
		'#000',
		'#9494FF',
		'#e8e8ff',
		'#646AAA',
		'#000',
		'#800080',
		'#D3D33D',
		'#F0F015',
		'#000',
		'#ABAB15',
		'#F00',
		'#0F0',
		'#00F'
	];
var launchCol = [
	'#000000',
	'#222222',
	'#555555',
	'#aaaaaa'
];
// setTimeout speed
var runSpeed = 70;
var numSparks = 50;
var yPos = 200;
var xPos = 200;
var explosionSize = 500;
var launchColour = '#ffff80';
var timer = null;
var dims = 1;
var evn = 360/numSparks;
var firework = new Array();
var ieType = (typeof window.innerWidth != 'number');
var ieRef = (ieType && document.compatMode && (document.compatMode.indexOf("CSS") != -1)) ? document.documentElement : document.body;
var thisStep = 0;
var step = 5;

for (i=0; i < numSparks; i++) {
	document.write('<div id="sparks'+i+'" style="position:absolute;top:0px;left:0px;height:1px;width:1px;font-size:1px;background-color:'+launchColour+'"><\/div>');
	firework[i] = document.getElementById('sparks'+i).style;
}

function winDims(){
	winH = (ieType) ? ieRef.clientHeight : window.innerHeight; 
	winW = (ieType) ? ieRef.clientWidth : window.innerWidth;
	bestFit = (winW >= winH) ? winH : winW;
}

winDims();
window.onresize=winDims;

function Reset(){
	var dsy=(ieType)?ieRef.scrollTop:window.pageYOffset; 

	thisStep=-1;

	launchColour = launchCol[Math.floor(Math.random() * launchCol.length)];
	explosionSize = Math.round(100+Math.random() * (bestFit/4));

	yPos = explosionSize+Math.round(Math.random() * (winH - (explosionSize * 2.2))) + dsy;
	xPos = explosionSize+Math.round(Math.random() * (winW - (explosionSize * 2.2)));

	dims = 1;

	for (i=0; i < numSparks; i++){
		firework[i].backgroundColor = launchColour;
		firework[i].width = dims+"px";
		firework[i].height = dims+"px";
		firework[i].fontSize = dims+"px";
	}

	Fireworks();
}

function Fireworks(){
	thisStep += step;
	timer = setTimeout(Fireworks, runSpeed);

	for (i=0; i < numSparks; i++) {
		firework[i].top = (yPos + explosionSize * Math.sin(i * evn * Math.PI/180) * Math.sin(thisStep/100))+"px";
		firework[i].left = (xPos + explosionSize * Math.cos(i * evn * Math.PI/180) * Math.sin(thisStep/100))+"px";

		if (thisStep > 100){
			dims = (explosionSize < 150) ? 1 : Math.round(1 + Math.random() * 2);

			firework[i].backgroundColor = showerCol[Math.floor(Math.random() * showerCol.length)];
			firework[i].width = dims+"px";
			firework[i].height = dims+"px";
			firework[i].fontSize = dims+"px";
		}
	}
	if (thisStep > 160){
		clearTimeout(timer);
		Reset();
	}
}



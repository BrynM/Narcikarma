/*!
* narcikarma.px.js
*/

(function () {

	/*
	********************************************************************************
	********************************************************************************
	* PIXEL/CANVAS
	********************************************************************************
	********************************************************************************
	*/

	/*
	* "Local" vars
	*/

	var nkCanvas = {
		'icon': null
	};
	var nkCx = null;
	var line0y = 0;
	var line1y = 9;
	var nkChars = {
		/* each char is a 4x6 grid of on/off */
		'p0': '010110100101101001011010', // test pattern,
		'p1': '111111011011110110111111', // test pattern
		'p2': '010111110101111101011111', // test pattern
		'f0': '000000001100110000000000', // flag off
		'f1': '110011001110111011001100', // flag on
		' ': '000000000000000000000000',
		'1': '010001000100010001000100',
		'2': '010010100010010010001110',
		'3': '110000100100001000101100',
		'4': '001010101110001000100010',
		'5': '111010001100001000101110',
		'6': '011010001100101010100100',
		'7': '111000100010010010001000',
		'8': '010010100100101010100100',
		'9': '010010100110001000101100',
		'0': '010010101010101010100100',
		'+': '000001001110010000000000',
		'-': '000000001110000000000000',
		'>': '100001000010001001001000',
		'k': '100010101100101010011001',
		'm': '000000000000111111111001',
		'A': '010010101010111010101010',
		'B': '111010101100101010101110',
		'C': '111010001000100010001110',
		'D': '110010101010101010101100',
		'E': '111010001100100010001110',
		'F': '111010001100100010001000',
		'G': '111010001000101010101110',
		'H': '101010101010111010101010',
		'I': '111001000100010001001110',
		'J': '001000100010001010100100',
		'K': '101010101100101010101010',
		'L': '100010001000100010001110',
		'M': '101011101010101010101010',
		'N': '101010101110111010101010',
		'O': '111010101010101010101110',
		'P': '111010101110100010001000',
		'Q': '111010101010101011101110',
		'R': '110010101100110010101010',
		'S': '111010000100001000101110',
		'T': '111001000100010001000100',
		'U': '101010101010101010100100',
		'V': '101010101010101001000100',
		'W': '101010101010101011101010',
		'X': '101010101110111010101010',
		'Y': '101010100100010001000100',
		'Z': '111000100100100010001110'
	};
	var nkFallbackColors = {
		'aliceblue':            [240, 248, 255,   1],
		'antiquewhite':         [250, 235, 215,   1],
		'aqua':                 [  0, 255, 255,   1],
		'aquamarine':           [127, 255, 212,   1],
		'azure':                [240, 255, 255,   1],
		'beige':                [245, 245, 220,   1],
		'bisque':               [255, 228, 196,   1],
		'black':                [  0,   0,   0,   1],
		'blanchedalmond':       [255, 235, 205,   1],
		'blue':                 [  0,   0, 235,   1],
		'blueviolet':           [138,  43, 226,   1],
		'brown':                [165,  42,  42,   1],
		'burlywood':            [222, 184, 135,   1],
		'cadetblue':            [ 95, 158, 160,   1],
		'chartreuse':           [127, 255,   0,   1],
		'chocolate':            [210, 105,  30,   1],
		'coral':                [255, 127,  80,   1],
		'cornflowerblue':       [100, 149, 237,   1],
		'cornsilk':             [255, 248, 220,   1],
		'crimson':              [220,  20,  60,   1],
		'cyan':                 [  0, 255, 255,   1],
		'darkblue':             [  0,   0, 139,   1],
		'darkcyan':             [  0, 139, 139,   1],
		'darkgray':             [169, 169, 169,   1],
		'darkgreen':            [  0, 100,   0,   1],
		'darkkhaki':            [189, 183, 107,   1],
		'darkmagenta':          [139,   0, 139,   1],
		'darkolivegreen':       [ 85, 107,  47,   1],
		'darkorange':           [255, 140,   0,   1],
		'darkorchid':           [153,  50, 204,   1],
		'darkred':              [139,   0,   0,   1],
		'darksalmon':           [233, 150, 122,   1],
		'darkseagreen':         [143, 188, 143,   1],
		'darkslateblue':        [ 72,  61, 139,   1],
		'darkslategray':        [ 47,  79,  79,   1],
		'darkturquoise':        [  0, 206, 209,   1],
		'darkviolet':           [148,   0, 211,   1],
		'deeppink':             [255,  20, 147,   1],
		'deepskyblue':          [  0, 191, 255,   1],
		'dimgray':              [105, 105, 105,   1],
		'dodgerblue':           [ 30, 144, 255,   1],
		'downvote':             [148, 148, 255,   1],
		'firebrick':            [178,  34,  34,   1],
		'floralwhite':          [255, 250, 240,   1],
		'forestgreen':          [ 34, 139,  34,   1],
		'fuchsia':              [255,   0, 255,   1],
		'gainsboro':            [220, 220, 220,   1],
		'ghostwhite':           [248, 248, 255,   1],
		'gold':                 [176, 176,  21,   1],
		'goldenrod':            [218, 165,  32,   1],
		'gray':                 [128, 128, 128,   1],
		'green':                [  0, 190,   0,   1],
		'greenyellow':          [173, 255,  47,   1],
		'grey':                 [128, 128, 128,   1],
		'honeydew':             [240, 255, 240,   1],
		'hotpink':              [255, 105, 180,   1],
		'indianred':            [205,  92,  92,   1],
		'indigo':               [ 75,   0, 130,   1],
		'ivory':                [255, 255, 240,   1],
		'khaki':                [240, 230, 140,   1],
		'lavender':             [230, 230, 250,   1],
		'lavenderblush':        [255, 240, 245,   1],
		'lawngreen':            [124, 252,   0,   1],
		'lemonchiffon':         [255, 250, 205,   1],
		'lightblue':            [173, 216, 230,   1],
		'lightcoral':           [240, 128, 128,   1],
		'lightcyan':            [224, 255, 255,   1],
		'lightgoldenrodyellow': [250, 250, 210,   1],
		'lightgray':            [211, 211, 211,   1],
		'lightgreen':           [144, 238, 144,   1],
		'lightpink':            [255, 182, 193,   1],
		'lightsalmon':          [255, 160, 122,   1],
		'lightseagreen':        [ 32, 178, 170,   1],
		'lightskyblue':         [135, 206, 250,   1],
		'lightslategray':       [119, 136, 153,   1],
		'lightsteelblue':       [176, 196, 222,   1],
		'lightyellow':          [255, 255, 224,   1],
		'lime':                 [  0, 255,   0,   1],
		'limegreen':            [ 50, 205,  50,   1],
		'linen':                [250, 240, 230,   1],
		'magenta':              [255,   0, 255,   1],
		'maroon':               [128,   0,   0,   1],
		'mediumaquamarine':     [102, 205, 170,   1],
		'mediumblue':           [  0,   0, 205,   1],
		'mediumorchid':         [186,  85, 211,   1],
		'mediumpurple':         [147, 112, 219,   1],
		'mediumseagreen':       [ 60, 179, 113,   1],
		'mediumslateblue':      [123, 104, 238,   1],
		'mediumspringgreen':    [  0, 250, 154,   1],
		'mediumturquoise':      [ 72, 209, 204,   1],
		'mediumvioletred':      [199,  21, 133,   1],
		'midnightblue':         [ 25,  25, 112,   1],
		'mintcream':            [245, 255, 250,   1],
		'mistyrose':            [255, 228, 225,   1],
		'moccasin':             [255, 228, 181,   1],
		'navajowhite':          [255, 222, 173,   1],
		'navy':                 [  0,   0, 128,   1],
		'negChange':            [235,   0,   0,   1],
		'noChange':             [  0,   0,   0,   1],
		'oldlace':              [253, 245, 230,   1],
		'olive':                [128, 128,   0,   1],
		'olivedrab':            [107, 142,  35,   1],
		'orange':               [255, 165,   0,   1],
		'orangered':            [255,  69,   0,   1],
		'orchid':               [218, 112, 214,   1],
		'palegoldenrod':        [238, 232, 170,   1],
		'palegreen':            [152, 251, 152,   1],
		'paleturquoise':        [175, 238, 238,   1],
		'palevioletred':        [219, 112, 147,   1],
		'papayawhip':           [255, 239, 213,   1],
		'peachpuff':            [255, 218, 185,   1],
		'peru':                 [205, 133,  63,   1],
		'pink':                 [255, 192, 203,   1],
		'plum':                 [221, 160, 221,   1],
		'posChange':            [  0, 190,   0,   1],
		'powderblue':           [176, 224, 230,   1],
		'purple':               [215,   0, 215,   1],
		'red':                  [235,   0,   0,   1],
		'rosybrown':            [188, 143, 143,   1],
		'royalblue':            [ 65, 105, 225,   1],
		'saddlebrown':          [139,  69,  19,   1],
		'salmon':               [250, 128, 114,   1],
		'sandybrown':           [244, 164,  96,   1],
		'seagreen':             [ 46, 139,  87,   1],
		'seashell':             [255, 245, 238,   1],
		'sienna':               [160,  82,  45,   1],
		'silver':               [192, 192, 192,   1],
		'skyblue':              [135, 206, 235,   1],
		'slateblue':            [106,  90, 205,   1],
		'slategray':            [112, 128, 144,   1],
		'snow':                 [255, 250, 250,   1],
		'springgreen':          [  0, 255, 127,   1],
		'steelblue':            [ 70, 130, 180,   1],
		'tan':                  [210, 180, 140,   1],
		'teal':                 [  0, 128, 128,   1],
		'thistle':              [216, 191, 216,   1],
		'tomato':               [255,  99,  71,   1],
		'turquoise':            [ 64, 224, 208,   1],
		'upvote':               [255, 139,  96,   1],
		'violet':               [238, 130, 238,   1],
		'wheat':                [245, 222, 179,   1],
		'white':                [255, 255, 255,   1],
		'whitesmoke':           [245, 245, 245,   1],
		'yellow':               [255, 255,   0,   1],
		'yellowgreen':          [154, 205,  50,   1],
	};

	/*
	* create
	*/

	nckma.px = {};

	/*
	* functions
	*/

	nckma.px.chars = function () {
		return $.extend({}, nkChars);
	};

	// get an RGBA array for a given color name
	nckma.px.color = function (color) {
		var cA = null;
		var cont = true;
		var locColor = 'color_' + color;

		if (bpmv.str(color) && bpmv.str(localStorage[locColor]) && /^\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\s*,\s*[0-9\.]+/.test(localStorage[locColor])) {
			cA = localStorage[locColor].split(/\s*,\s*/);

			for (var aI = 0; aI < 4; aI++) {
				cA[aI] = aI < 3 ? parseInt(cA[aI]) : parseFloat(cA[aI]);

				if (!bpmv.num(cA[aI], true) || (cA[aI] < 0 ) || (cA[aI] > (aI < 3 ? 255 : 1))) {
					nckma.warn('Bad color!', { 'color': color, 'val': localStorage[locColor] });
					cont = false;
				}
			}
		} else {
			cont = false;
		}

		if (cont && bpmv.arr(cA) && (cA.length === 4)) {
			return cA;
		}

		if (bpmv.arr(nkFallbackColors[color])) {
			nckma.debug('px', 'Used fallback color!', { 'color': color, 'val': nkFallbackColors[color] });

			return nkFallbackColors[color];
		}

		nckma.warn('Used fallback black!', { 'color': color, 'val': [0, 0, 0, 1] });

		return [0, 0, 0, 1];
	};

	// get a complete color list
	nckma.px.color_list = function () {
		return bpmv.keys(nkFallbackColors);
	};

	// get an Array containing the set of color names available as options
	nckma.px.color_options = function () {
		var ret = [];
		var optRx = /^color_/;
		var defs = nckma.opts.get();

		for (var aO in defs) {
			if (defs.hasOwnProperty(aO) && optRx.test(aO)) {
				ret.push((''+aO).replace(optRx, ''));
			}
		}

		return ret;
	};

	nckma.px.color_test = function (cArr) {
		var tC = null;
		var cA = null;
		var ret = true;

		if (bpmv.str(cArr)) {
			if (/^\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\s*,\s*[0-9\.]+/.test(cArr)) {
				cA = cArr.split(/\s*,\s*/);
			}
		} else {
			ret = false;
		}

		if (ret && bpmv.arr(cA) && (cA.length === 4)) {
			for (var aI = 0; aI < 4; aI++) {
				cA[aI] = aI < 3 ? parseInt(cA[aI]) : parseFloat(cA[aI]);

				if (!bpmv.num(cA[aI], true) || (cA[aI] < 0 ) || (cA[aI] > (aI < 3 ? 255 : 1))) {
					ret = false;
				}
			}
		} else {
			ret = false;
		}

		return ret;
	};

	nckma.px.color_to_str = function (color) {
		var col;

		if (bpmv.arr(color, 4)) {
			return 'rgba('+color.join(', ')+')';
		}

		if (bpmv.str(color)) {
			col = nckma.px.color(color);

			return 'rgba('+col.join(', ')+')';
		}
	};

	nckma.px.cx = function (type) {
		if(!nckma._bgTask) {
			return;
		}

		if (!bpmv.obj(nkCanvas.icon) || !bpmv.num(nkCanvas.icon.length) || !bpmv.obj(nkCx)) {
			nkCanvas.icon = $('#nck_canvas_icon_16');

			if (bpmv.obj(nkCanvas.icon) && bpmv.num(nkCanvas.icon.length)) {
				nkCx = nkCanvas.icon.get(0).getContext('2d');
				if (!bpmv.obj(nkCx)) {
					throw 'Narcikarma: Could not get incon canvas!';
				}
			}
		}

		return nkCx;
	};

	nckma.px.draw_change_comment = function (line) {
		var dat = null;
		var delt = nckma.pages.get_stat('comment_delta');
		var col = 'noCommentChange';

		if(!nckma._bgTask) {
			return;
		}

		if ((line != 1 ) && (line != 2)) {
			nckma.warn('Bad line for nckma.px.draw_change_comment()', line);
			return;
		}

		if(delt < 0) {
			col = 'negCommentChange';
		}

		if(delt > 0) {
			col = 'posCommentChange';
		}

		nckma.px.draw_line(nckma.abbrev_int(delt), line, nckma.px.color(col));
	};

	nckma.px.draw_change_flags = function (line) {
		var dat = null;
		var flag = 0;
		var ch = '';
		var x = 0;
		var y = line > 1 ? line1y : line0y;

		if(!nckma._bgTask) {
			return;
		}

		if ((line != 1 ) && (line != 2)) {
			nckma.warn('Bad line for nckma.px.draw_change_link()', line);

			return;
		}

		dat = nckma.get();

		if (bpmv.obj(dat, true) && bpmv.obj(dat.current, true)) {
			while (flag < 4) {
				switch (localStorage['flag'+flag]) {
					case 'has_mail_both':
						if (dat.current.has_mail || dat.current.has_mod_mail) {
							nckma.px.draw_char('f1', x, y, nckma.px.color('red'));
						} else {
							nckma.px.draw_char('f0', x, y, nckma.px.color('red'));
						}

						break;
					case 'has_mail':
						if (dat.current.has_mail) {
							nckma.px.draw_char('f1', x, y, nckma.px.color('hasMail'));
						} else {
							nckma.px.draw_char('f0', x, y, nckma.px.color('noMail'));
						}

						break;
					case 'has_mod_mail':
						if (dat.current.has_mod_mail) {
							nckma.px.draw_char('f1', x, y, nckma.px.color('hasModMail'));
						} else {
							nckma.px.draw_char('f0', x, y, nckma.px.color('noModMail'));
						}

						break;
					case 'is_mod':
						if (dat.current.is_gold) {
							nckma.px.draw_char('f1', x, y, nckma.px.color('purple'));
						} else {
							nckma.px.draw_char('f0', x, y, nckma.px.color('purple'));
						}

						break;
					case 'is_gold':
						if (dat.current.is_gold) {
							nckma.px.draw_char('f1', x, y, nckma.px.color('gold'));
						} else {
							nckma.px.draw_char('f0', x, y, nckma.px.color('gold'));
						}

						break;
					default:
						nckma.px.draw_char(' ', x, y, nckma.px.color('black'));

						break;
				}

				x += 4;
				flag++;
			}

			nckma.px.read();
		}
	};

	nckma.px.draw_change_link = function (line) {
		var dat = null;
		var delt = nckma.pages.get_stat('link_delta');
		var col = 'noLinkChange';

		if(!nckma._bgTask) {
			return;
		}

		if ((line != 1 ) && (line != 2)) {
			nckma.warn('Bad line for nckma.px.draw_change_link()', line);
			return;
		}

		if(delt < 0) {
			col = 'negLinkChange';
		}

		if(delt > 0) {
			col = 'posLinkChange';
		}

		nckma.px.draw_line(nckma.abbrev_int(delt), line, nckma.px.color(col));
	};

	nckma.px.draw_change_total = function (line) {
		var dat = null;
		var delt = nckma.pages.get_stat('total_delta');
		var col = 'noChange';

		if(!nckma._bgTask) {
			return;
		}

		if ((line != 1 ) && (line != 2)) {
			nckma.warn('Bad line for nckma.px.draw_change_link()', line);
			return;
		}

		if(delt < 0) {
			col = 'negChange';
		}

		if(delt > 0) {
			col = 'posChange';
		}

		nckma.px.draw_line(nckma.abbrev_int(delt), line, nckma.px.color(col));
	};

	nckma.px.draw_char = function (ch, x, y, color) {
		var cx = nckma.px.cx();
		var st = '';
		var rc = 0;
		var phil = '';
		var posX = 0;
		var posY = 0;
		var draw = false;
		var comp = null;
		var cChar = '';

		if(!nckma._bgTask) {
			return;
		}

		if (bpmv.obj(cx) && bpmv.str(ch, true)) {
			cChar = cChar.length === 1 ? ''+ch.toUpperCase() : ''+ch;
			comp = cx.globalCompositeOperation;

			if (bpmv.str(nkChars[cChar])) {
				x = parseInt(x, 10);
				y = parseInt(y, 10);

				if (!bpmv.num(x, true) || (x < 0 ) || (x > 15)) {
					nckma.warn('X is not an integer between 0 and 15!', x);
				} else if (!bpmv.num(y, true) || (y < 0 ) || (y > 15)) {
					nckma.warn('Y is not an integer between 0 and 15!', y);
				} else {
					st += nkChars[cChar];

					if (bpmv.str(color)) {
						var color = nckma.px.color(color);
					}

					if (!bpmv.arr(color) || (color.length != 4)) {
						nckma.debug('px', 'Substituting color for black.', color);
						phil = 'rgba(0, 0, 0, 1)';
					} else {
						phil = 'rgba('+color[0]+', '+color[1]+', '+color[2]+', '+color[3]+')';
					}

					posX = 0 + x;
					posY = 0 + y;

					for (var aC = 0; aC < st.length; aC++) {
						draw = false;
						cx.globalCompositeOperation = comp;

						if (st[aC] === '1') {
							cx.fillStyle = phil;
							draw = true;
						} else if ((st[aC] === '0' ) || (ch === ' ')) {
							cx.globalCompositeOperation = 'destination-out';
							cx.fillStyle = 'rgba(0, 0, 0, 1)';
							draw = true;
						} else {
							nckma.warn('Current character is not a flag! ('+cChar+')',  { 'char': cChar, 'set': nkChars, 'val': st[aC] });
						}

						if (draw) {
							cx.fillRect(posX, posY, 1, 1);
							rc++;
							if (rc > 3) {
								rc = 0;
								posX = 0 + x;
								posY++;
							} else {
								posX++;
							}
						}
					}
				}

				cx.globalCompositeOperation = comp;
			} else {
				nckma.warn('Character is not in set! ('+cChar+')', { 'char': cChar, 'set': nkChars });
			}
		} else {
			nckma.warn('Context failed!', cx);
		}
	};

	nckma.px.draw_line = function (str, line, color) {
		var cL = parseInt(line, 10);
		var dL = false;
		var dX = 12;
		var dY = line0y;
		var dS = ''; // last char first

		if(!nckma._bgTask) {
			return;
		}

		if (typeof(line) === 'undefined') {
			line = 1;
		}

		if (line === 1) {
			dL = true;
		} else if (line === 2) {
			dL = true;
			dY = line1y;
		} else {
			nckma.warn('Line must be wither 1 or 2!', line);
		}

		if (dL) {
			if (bpmv.arr(str)) {
				dS = $.extend([], str);
				dS.reverse();
			} else {
				dS = ''+str;

				while (dS.length < 4) {
					dS = ' '+dS;
				}

				dS = dS.split('').reverse();
			}

			for (var aC = 0; aC < dS.length; aC++) {
				if (dX >= 0) {
					nckma.px.draw_char(dS[aC], dX, dY, color);
					dX -= 4;
				} else {
					continue;
				}
			}

			if (nckma._bgTask) {
				nckma.px.read();
			}
		}
	};

	nckma.px.draw_status = function (stat) {
		var cl = '';
		var cx = nckma.px.cx();
		var comp = null;
		var noFill = false;

		if(!nckma._bgTask) {
			return;
		}

		switch (stat) {
			case 'err':
				cl = nckma.px.color('red');
				break;
			case 'load':
				cl = nckma.px.color('blue');
				break;
			case 'poll':
				cl = nckma.px.color('purple');
				break;
			case 'parse':
				cl = nckma.px.color('green');
				break;
			case 'idle':
			default:
				cl = nckma.px.color('gray');
				noFill = true;
				break;
		}

		if (bpmv.arr(cl) && (cl.length === 4)) {
			comp = cx.globalCompositeOperation;
			cx.globalCompositeOperation = 'destination-out';

			cx.fillStyle = 'rgba(0, 0, 0, 1)';
			cx.fillRect(0, 7, 15, 1);

			if (!noFill) {
				cx.globalCompositeOperation = 'source-over';

				cx.fillStyle = 'rgba('+cl[0]+', '+cl[1]+', '+cl[2]+', '+(cl[3]/2)+')';
				cx.fillRect(0, 7, 15, 1);
			}

			cx.globalCompositeOperation = comp;

			nckma.px.read();

			if (stat === 'idle') {
				nckma.px.draw_core_flags();
			}
		}
	};

	nckma.px.draw_core_flags = function () {
		var cx = nckma.px.cx();
		var comp;
		var flags = nckma.get_core_flags();
		var iter;
		var fPos = 0;
		var cl;
		var colors = [
			'tan',
			'darkcyan',
			'yellowgreen',
			'darkorchid',
		];
		var uColors = _.extend([], colors);

		if(!flags['dev'] || !nckma._bgTask || !cx) {
			return;
		}

		for (iter in flags) {
			if (!flags.hasOwnProperty(iter)) {
				continue;
			}

			if (uColors.length < 1) {
				uColors = _.extend([], colors);
			}

			cl = uColors.shift();
			comp = cx.globalCompositeOperation;

			if (flags[iter]) {
				cx.globalCompositeOperation = 'source-over';
				cx.fillStyle = nckma.px.color_to_str(cl);
			} else {
				cx.globalCompositeOperation = 'destination-out';
				cx.fillStyle = 'rgba(0, 0, 0, 1)';
			}

			cx.fillRect(fPos, 7, 2, 2);

			cx.globalCompositeOperation = comp;
			fPos +=3;

			nckma.px.read();
		}
	};

	nckma.px.read = function () {
		var cx = nckma.px.cx();
		var dat = null;
		var tT = '';

		if (bpmv.obj(cx)) {
			dat = cx.getImageData(0, 0, nkCanvas.icon.width(), nkCanvas.icon.height());
			chrome.browserAction.setIcon({ imageData : dat });

			return dat;
		}
	};

})();
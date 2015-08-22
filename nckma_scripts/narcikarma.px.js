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
		'black': [   0,   0,   0,   1 ],
		'blue': [   0,   0, 235,   1 ],
		'gold': [ 176, 176,  21,   1 ],
		'gray': [ 128, 128, 128,   1 ],
		'green': [   0, 190,   0,   1 ],
		'purple': [ 215,   0, 215,   1 ],
		'red': [ 235,   0,   0,   1 ],
		'negChange': [ 235,   0,   0,   1 ],
		'noChange': [   0,   0,   0,   1 ],
		'posChange': [   0, 190,   0,   1 ]
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

	// get an RGBA array for a given color name
	nckma.px.color = function (color) {
		var cA = null;
		var cont = true;
		var locColor = 'color_' + color;

		nckma.opts.defaults_set(true);

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
			nckma.warn('Used fallback color!', { 'color': color, 'val': nkFallbackColors[color] });

			return nkFallbackColors[color];
		}

		nckma.warn('Used fallback black!', { 'color': color, 'val': [0, 0, 0, 1] });

		return [0, 0, 0, 1];
	};

	// get an Array containing the set of color names for all known colors
	nckma.px.color_set = function () {
		var ret = [];
		var optRx = /^color_/;
		var defs = nckma.get_defaults();

		for (var aO in defs) {
			if (defs.hasOwnProperty(aO ) && optRx.test(aO)) {
				ret.push((''+aO).replace(optRx, ''));
			}
		}

		return ret;
	};

	nckma.px.cx = function (type) {
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
		var delt = 0;
		var col = 'noChange';

		if ((line != 1 ) && (line != 2)) {
			nckma.warn('Bad line for nckma.px.draw_change_comment()', line);
			return;
		}

		dat = nckma.get();

		if (bpmv.obj(dat, true) && bpmv.obj(dat.start, true) && bpmv.obj(dat.current, true)) {
			if (bpmv.num(dat.start.comment_karma, true) && bpmv.num(dat.current.comment_karma, true)) {
				delt = parseInt(dat.current.comment_karma, 10) - parseInt(dat.start.comment_karma, 10);

				if (delt < -999999) {
					delt = Math.round((0 - delt) / 1000000) + 'm';
					col = 'negChange';
				} else if (delt < -9999) {
					delt = Math.round((0 - delt) / 1000) + 'k';
					col = 'negChange';
				} else if (delt < 0) {
					delt = (0 - delt);
					col = 'negChange';
				} else if (delt > 999999) {
					delt = Math.round(delt / 1000000) + 'm';
					col = 'posChange';
				} else if (delt > 9999) {
					delt = Math.round(delt / 1000) + 'k';
					col = 'posChange';
				} else if (delt > 0) {
					col = 'posChange';
				}

				nckma.px.draw_line(''+delt, line, nckma.px.color(col));
			}
		}
	};

	nckma.px.draw_change_flags = function (line) {
		var dat = null;
		var flag = 0;
		var ch = '';
		var x = 0;
		var y = line > 1 ? line1y : line0y;

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
							nckma.px.draw_char('f1', x, y, nckma.px.color('red'));
						} else {
							nckma.px.draw_char('f0', x, y, nckma.px.color('red'));
						}

						break;
					case 'has_mod_mail':
						if (dat.current.has_mod_mail) {
							nckma.px.draw_char('f1', x, y, nckma.px.color('blue'));
						} else {
							nckma.px.draw_char('f0', x, y, nckma.px.color('blue'));
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
		var delt = 0;
		var col = 'noChange';

		if ((line != 1 ) && (line != 2)) {
			nckma.warn('Bad line for nckma.px.draw_change_link()', line);

			return;
		}

		dat = nckma.get();

		if (bpmv.obj(dat, true) && bpmv.obj(dat.start, true) && bpmv.obj(dat.current, true)) {
			if (bpmv.num(dat.start.link_karma, true) && bpmv.num(dat.current.link_karma, true)) {
				delt = parseInt(dat.current.link_karma, 10) - parseInt(dat.start.link_karma, 10);

				if (delt < -999999) {
					delt = Math.round((0 - delt) / 1000000) + 'm';
					col = 'negChange';
				} else if (delt < -9999) {
					delt = Math.round((0 - delt) / 1000) + 'k';
					col = 'negChange';
				} else if (delt < 0) {
					delt = (0 - delt);
					col = 'negChange';
				} else if (delt > 999999) {
					delt = Math.round(delt / 1000000) + 'm';
					col = 'posChange';
				} else if (delt > 9999) {
					delt = Math.round(delt / 1000) + 'k';
					col = 'posChange';
				} else if (delt > 0) {
					col = 'posChange';
				}

				nckma.px.draw_line(''+delt, line, nckma.px.color(col));
			}
		}
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
						nckma.debug(nckma._dL.px, 'Substituting color for black.', color);
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
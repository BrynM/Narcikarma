(function () {
	/**
	* bpmv - A Simple Validator
	* https://github.com/BrynM/bpmv
	*
	* These are tasks that I find myself repeating over and over again. The rules
	* for me including code in here are simple: nothing that tries to manipulate
	* the DOM itself and things that mainly revolve around testing or altering
	* different kinds of states or values.
	*
	* I provide no promises that I will follow my own rules or that any
	* of this code is fit for any purpose. This is a personal library and not
	* a full-blown open source project. I will add and remove what I see fit.
	* Consider yourself warned.
	*
	* That said, I do hope that you can find something you like here. I would
	* recommend that you use a descreet copy and do not load the file from a pulbic
	* source (as I may refactor on a whim). If you wish to use a copy of this code,
	* feel free, but also remember that it's GPL - meaning that if you distribute
	* your altered copy in any way (such as serving it publicly), you must follow
	* the conditions outlined in the GPL.
	*
	********************************************************************************
	* Optional Setup
	********************************************************************************
	* By default, the global variable `bpmv` will be created (attached to `window`).
	* If node.js is detected as the current environment, `exports.bpmv` will be
	* created. Additionally, there are two (admittadly sloppy) global settings you
	* can use to control bpmv.
	*
	* If you do not wish to have bpmv called `bpmv`, you can set BPMV_VARNAME to any
	* string you wish. For example:
	*    BPMV_VARNAME = 'validatorThingy';
	*    // ...bpmv.js is loaded via <script> tag or some other method
	*    validatorThingy.str( 'foo' ); // use it to test a string
	*
	* At file/script load, the varialbe BPMV_ATTACH will be checked or "object-ness".
	* If it is an object, you can use it to attach bpmv to a structure of your
	* choice. For example:
	*    var BPMV_ATTACH = my.big.construct;
	*    // ...bpmv.js is loaded via <script> tag or some other method
	*    // loading the file _after_ setting BPMV_ATTACH is important!
	*    // (I do realize that this pollutes the current scope some. Sorry.)
	*    my.big.construct.bpmv.str( 'foo' ); // attached and ready for use
	*
	* Used together, BPMV_ATTACH and BPMV_VARNAME should give you enough control to
	* avoid any name clashing and perform any customization you'd like. 
	*
	********************************************************************************
	* LICENSE
	********************************************************************************
	* Copyright (C) 2011, 2012, Bryn P. Mosher (GPLv2)
	*
	* This library is free software; you can redistribute it and/or modify it under
	* the terms of the GNU Library General Public License Version 2 as published by
	* the Free Software Foundation.
	*
	* This library is distributed in the hope that it will be useful, but WITHOUT
	* ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
	* FOR A PARTICULAR PURPOSE.  See the GNU Library General Public License for
	* more details.
	*
	* You should have received a copy of the GNU Library General Public License
	* Version 2 along with this library named as bpmv_license.txt; if not, you can
	* find it at http://www.gnu.org/licenses/old-licenses/gpl-2.0.html or write to
	* the Free Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
	* 02110-1301, USA.
	********************************************************************************
	* MINIFICATION
	********************************************************************************
	* A minified version using Google's Closure Compiler
	* (http://closure-compiler.appspot.com/home) named bpmv.min.js is available.
	* However, I may not always have the latest changes in it. To be sure you have,
	* the lastest changes, you may want to grab the normal version (bpmv.js) and
	* minify it yourself.
	********************************************************************************
	* VERSIONS
	********************************************************************************
	* The version naming convention is as follows. Optional portions are in square
	* brackets ("[" and  "]").
	*      (major).(minor)[.(patch number)][-(notation)]
	* Notation is as follows in chronological order:
	*      dev - currently under development
	*      rc - testing to finalize developemnt
	*      (none) - official version
	* The files at the top of the Git tree should be considered in development
	* always. If you want a stable version, please select one from the "releases"
	* subdirectory.
	* Releases:
	*    v1.0 April 19, 2012
	*      sha1sum: 24c7e295c20e1bcee743d4b18f9f4d0b7efa1272 *bpmv.1.0.min.js
	********************************************************************************
	*/
	var initialBpmv = {
		_cfg : {
			tag : (function(){
					var scripts = null;
					if ( ( typeof(document) == 'object' ) && ( typeof(document.getElementsByTagName) == 'function' ) ) {
						scripts = document.getElementsByTagName( 'script' );
						if ( ( typeof(scripts) == 'object' ) && ( scripts.length > 0 ) ) {
							return scripts[scripts.length - 1];
						}
					}
				})(),
			varName : typeof(BPMV_VARNAME) === 'string' ? ''+BPMV_VARNAME : 'bpmv',
			version : '1.1-dev'
		},
		/**
		* tests if something is not just an object, but is an Array and is not empty
		* @param {mixed} dIsArr The value you'd like to test
		* @param {boolean} okEmpty Will return true even if the array is empty
		* @return {boolean} Will return true if an array
		*/
		arr : function ( dIsArr, okEmpty ) {
			return this.obj( dIsArr ) && ( Object.prototype.toString.call(dIsArr) === '[object Array]' ) && ( okEmpty || (dIsArr.length > 0) );
		},
		/**
		* Get the basename of a path
		* @param {string} wellDuh Some sort of path
		* @return {string} The parsed dirname
		*/
		basename : function ( redOrBlue ) {
			var ret = false;
			if ( this.str( redOrBlue ) ) {
				var tstr = this.rtrim( redOrBlue, '/\\' ),
					capFlag = false;
				if ( /\//.test( tstr ) ) { // *nix dirs
					capFlag = tstr.split( '/' );
				} else if ( /\\/.test( tstr ) ) { // windows dirs
					capFlag = tstr.split( '\\' );
				}
				if ( this.arr( capFlag ) ) {
					ret = capFlag.pop();
				}
			}
			return this.str(ret) ? ret : redOrBlue;
		},
		/**
		* is a boolean
		* @param {mixed} fool The value you'd like to test
		* @return {boolean} Will return true if the value is a real boolean value
		*/
		bool : function ( fool ) {
			return ( typeof(fool) == 'boolean' );
		},
		/**
		* are we in a browser (returns bool, not UA!)
		*/
		brow : function () {
			return this.obj(window) && this.obj(navigator);
		},
		/**
		* camel case
		*/
		ccase : function ( hump, wspace ) {
			if ( !this.str( hump ) ) { return hump; }
			wspace = this.str( wspace ) ? wspace.split( /\,/ ) : wspace;
			wspace = this.arr( wspace ) ? wspace : [ ' ', '_', '-' ];
			var getChar = new RegExp( '(['+wspace.join( '\\' )+'][a-z])', 'g' ),
				camChar =  new RegExp( '['+wspace.join( '\\' )+']' );
			return hump.replace( getChar, function ( ltr ) {
				return ltr.toUpperCase().replace(camChar,'');
			} );
		},
		/**
		* get or set a simple, pathless browser cookie
		* @param {string} muppet The name of the cookie
		* if all parms are undefined, the full set of cookies will be returned
		* @param {string} chips The value of the cookie if you are setting one
		* @param {string} reruns Optional cookie expiration date to use when setting a cookie.
		* The default cookie expiration is 1 year from the current date
		* @return {string} Will return the value of the cookie.
		* If setting a cookie and setting fails, undefined will be returned instead of the value
		*/
		cook : function ( muppet, chips, reruns ) {
			if ( !this.obj(document) ) {
				// not in a browser...
				return;
			}
			var cookArr = new String(document.cookie).split( /; ?/ ),
				cookObj = {},
				newStr = null,
				muppet = this.trim( muppet );
				if ( this.str(muppet) && ( typeof(chips) != 'undefined' ) ) {
					// setting
					if ( !this.str(reruns) ) {
						reruns = new Date( new Date().getTime() + parseInt( 1000*60*60*24*365 ) ).toGMTString();
					}
					newStr = muppet+'='+escape(chips)+';expires='+reruns+';path=/';
					if ( document.cookie = newStr ) {
						return this.cook( muppet );
					};
				} else {
					// getting
					for ( aC in cookArr ) {
						if ( typeof(cookArr[aC].match) == 'function' ) {
							var kN = cookArr[aC].match( /[^=]+/ )+'';
							if ( kN !== '' ) {
								var reRex = new RegExp( '^'+kN+'=' );
								kV = unescape( cookArr[aC].replace( reRex, '' ) );
							}
							cookObj[kN] = kV;
						}
					}
					if ( muppet === undefined ) {
						// no pars, getting the full set
						return cookObj;
					} else if ( this.obj(cookObj) && this.str(cookObj[muppet]) ) {
						return cookObj[muppet];
					}
				}
			return;
		},
		/**
		* count number of elements an object actually owns
		* @param {mixed} ahAHah The object you'd like to count
		* @return {number} Will return the count of elements owned by the object
		*/
		count : function ( ahAHah ) {
			if ( this.arr(ahAHah) && this.num(ahAHah.length) ) {
				return ahAHah.length;
			}
			var objProps = 0;
			if ( this.obj(ahAHah) ) {
				for ( var bAtz in ahAHah ) {
					if ( ahAHah.hasOwnProperty(bAtz) ) {
						++objProps;
					}
				}
			}
			return objProps;
		},
		/**
		* is a date object (or in a future addition, a valid date string - todo)
		* @param {mixed} whEn The value you'd like to test
		* @return {boolean} Will return true if the value is a real Date object
		*/
		date : function ( whEn ) {
			return Object.prototype.toString.call(whEn) === '[object Date]';
		},
		/**
		* Get the dirname of a path
		* @param {string} wellDuh Some sort of path
		* @return {string} The parsed dirname
		*/
		dirname : function ( wellDuh ) {
			var ret = false;
			if ( this.str( wellDuh ) ) {
				if ( /\//.test( wellDuh ) ) { // *nix dirs
					ret = wellDuh.replace( /\/[^\/]+$/, '' );
				} else if ( /\\/.test( wellDuh ) ) { // windows dirs
					ret = wellDuh.replace( /\\[^\\]+$/, '' );
				}
			}
			return this.str(ret) ? ret : wellDuh;
		},
		/**
		* Generate a random valid html id using characters and a timestamp.
		* @param {object} fans An options object. us.ebpm.ego.defOpts is what will be used for defaults.
		* @class us.ebpm.ego
		* @namespace us.ebpm
		* @constructor
		*/
		ego : function ( fans ) {
			if ( !this.obj(this.ego.defOpts) ) {
				this.ego.defOpts = {
					// Length of the string to generate (see us.ebpm.ego.defOpts.absLen for forced truncation).
					'len' : 12,
					// A prefix to apply to the ID string generated
					'prefix' : '',
					// The character set to choose from for generating the &quot;random&quot; portion of the ID.
					'charset' : '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
					// If set to true, a delimiter and integer UNIX time stamp will be appended to the generated ID string.
					'useTime' : true,
					// If set to true, the entire return string will be truncated to the len setting.*
					// Note that this may truncate away desired portions such as timestamps.
					'absLen' : false,
					// The delimiter to use between portions of the ID string (prefix, id and time stamp).
					'delim' : '_'
				};
			}
			if ( !this.obj(this.ego.usedIds) ) { this.ego.usedIds = {}; }
			if ( !this.obj(fans) ) { fans = {}; }
			for ( var anO in this.ego.defOpts ) {
				if ( ( this.ego.defOpts.hasOwnProperty(anO) ) && ( typeof(fans[anO]) == 'undefined' ) ) {
					fans[anO] = this.ego.defOpts[anO];
				}
			}
			var tm = new Date();
			fans.ts = tm.getTime().toString();
			var rStr = '',
			first = false, // html elements must being with a letter!
			tsLen = fans.useTime == false ? 0 : fans.ts.length + fans.delim.toString().length;
			var iLen = fans.absLen == true ? fans.len - tsLen : fans.len;
			for ( var i=0; i < iLen; i++ ) {
				var rnum = Math.floor(Math.random() * fans.charset.length);
				c = fans.charset.substring(rnum,rnum+1);
				if ( first == false ) {
					if ( c.match(/[a-zA-Z]/) == null ) {
						i--;
					} else {
						rStr += c;
						first = true;
					}
				} else {
					var vId = new RegExp( '['+fans.charset+']' );
					if ( c.match(vId) == null ) {
						i--;
					} else {
						rStr += c;
					}
				}
			}
			rStr = fans.useTime == false ? rStr : rStr+fans.delim+fans.ts;
			rStr = this.str(fans.prefix) ? fans.prefix+fans.delim+rStr : rStr;
			if ( typeof(this.ego.usedIds[rStr]) == 'undefined' ) {
				this.ego.usedIds[rStr] = true;
				return rStr;
			} else {
				// we do this to avoid dupe strings. currently no limit on the recursive call.
				return this.ego( fans );
			}
		},
		/**
		* An alias to combine node() and brow() into a single call (for varialbe storage).
		* This will return which "environment" is in service if known and 'undefined' if not.
		* Currently, only 'undefined', 'browser' and 'node' are supported.
		*/
		env : function () {
			if ( this.node() ) {
				return 'node';
			} else if ( this.brow() ) {
				return 'browser';
			}
			return 'undefined';
		},
		/**
		 * Find the key name for a given element in an object or array.
		 * The first encountered match is what will be returned,
		 * so be carefult that what you are looking for is unique!
		 * If the key is not found, null is returned.
		 * @param {mixed} pin What you are looking for.
		 * Can be any valid value.
		 * @param stack The object or array you are looking in
		 * @param siv Assume the pin is not == and instead is the keyname
		 * of what you're looking for
		 * @return {mixed} the key if found or null if not found
		 */
		find : function ( pin, stack, siv ) {
			var ret = undefined, found = false;
			if ( this.arr(stack) || this.obj(stack) ) {
				for ( var aK in stack ) {
					if ( stack.hasOwnProperty( aK ) ) {
						if ( siv ) {
							if ( ( aK == pin ) && ( typeof(stack[aK]) != 'undefined' ) ) {
								found = true;
							}
						} else {
							if ( stack[aK] == pin ) {
								found = true;
							}
						}
						if ( found ) {
							ret = siv ? stack[aK] : aK;
							break;
						}
					}
				}
			}
			return ret;
		},
		/**
		* Tests strings and numbers for valid floating point format and greater than 0 (may be disabled)
		* @param {mixed} mFreak The value you'd like to test
		* @param {boolean} zeroOk Will return true even if the the value is 0 or less
		* @return {boolean} Will return true if the value is a valid floating point number
		*/
		'float' : function ( mFreak, zeroOk ) { // validates for formatting so '2.0b' is NOT valid
			return ( (/^(\-)?[0-9]*\.?[0-9]+([eE]\+[0-9]+)?$/).test(String(mFreak)) && this.num(mFreak, zeroOk) );
		},
		/**
		* is a function?
		* @param {mixed} boOtsy The value you'd like to test
		* @return {boolean} Will return true if the value is a real function
		*/
		func : function ( boOtsy ) {
			return ( typeof(boOtsy) === 'function' );
		},
		/**
		* Grab a deep key from an object
		* @param {string} leggo The deep key you are looking for. For example "foo.bar.baz".
		* @param {object} eggo The object you're looking in
		* @return {boolean} Will return the object by ref or undefined if not found
		*/
		grab : function ( leggo, eggo ) {
			var plate = null,
				waffle = null,
				myPlate = null;
			if ( this.str(leggo) && !leggo.match( /\s/ ) && this.obj(eggo) ) {
				plate = leggo.split( '.' );
				myPlate = eggo;
				if ( this.arr(plate) ) {
					for( waffle in plate ) {
						if ( plate.hasOwnProperty( waffle ) ) {
							if ( typeof(myPlate[plate[waffle]]) === 'undefined' ) {
								return; // undef
							} else {
								myPlate = myPlate[plate[waffle]];
							}
						}
					}
					if ( this.str(plate[waffle]) && ( typeof(myPlate) != 'undefined' ) ) {
						return myPlate;
					}
				}
			}
		},
		/**
		* is a valid hostname with at least a tld parent
		* @param {mixed} drinks The value you'd like to test
		* @param {bool} justaSingle Allow tests for just a single host name
		* @return {boolean} Will return true if the value is a valid host name with at least two levelc (name plus tld)
		*/
		host : function ( drinks, justaSingle ) {
			return  ( ( justaSingle && (/^([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])$/).test( drinks ) ) || (/^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$/).test( drinks ) ) ? true : false;
		},
		/**
		* Increment all numeric values in either an array or the top level of an object by a given amount.
		* Note that this will also increment numbers inside of strings.
		* @param {mixed} soil array or object to increment values in.
		* @param {number} fertilizer The amount you'd like the numbers incremented.
		* Defaults to 1.
		* @param {boolean} weeds Increment numeric strings too.
		* Defaults to true.
		* @param {boolean} flo If true, integers will not be rounded and may increment to float results.
		* @return {mixed} Will return the reultant version of soil.
		*/
		incall : function ( soil, fertilizer, weeds, flo ) {
			var wasStr = false, nVal = false;
			weeds = typeof(weeds) == 'undefined' ? true : weeds;
			fertilizer = typeof(fertilizer) == 'undefined' ? 1 : fertilizer;
			if ( this.obj(soil, true) || this.arr(soil) ) {
				if ( this.num(fertilizer, true) && ( fertilizer != 0 ) ) {
					for ( var aS in soil ) {
						nVal = false;
						if ( soil.hasOwnProperty( aS ) ) {
							wasStr = this.typeis( soil[aS], 'String' )
							if ( wasStr && !weeds ) {
								continue;
							}
							if ( (/^[0-9]+\.([0-9]+([eE]\+[0-9]+)?)?$/).test( soil[aS] ) ) { // float
								soil[aS] = parseFloat(soil[aS]) + parseFloat(fertilizer);
								nVal = true;
							} else if ( (/^[0-9]+$/).test( soil[aS] ) ) { // int
								soil[aS] = ( parseInt(soil[aS]) + parseFloat(fertilizer) );
								if ( !flo ) {
									soil[aS] = Math.round( soil[aS] );
								}
								nVal = true;
							}
							if ( nVal ) {
								soil[aS] = wasStr ? ''+soil[aS] : soil[aS];
							}
						}
					}
				}
			}
			return soil;
		},
		/**
		* Parse ini file contents into an object if possible with optional callback.
		* The contents may be a string with newlines or an Array() of strings.
		* This always returns an object, so check for emptiness.
		* @param {string} outie The string or array contents of an ini file
		* @param {function} gotDfunk an optional callback function to run  when parsing is complete
		* @return {object} Will return an object representing the parsed ini values and structure
		*/
		ini : function ( outie, gotDfunk ) {
			var outData = {},
				currKey = '';
			if ( this.str(outie) || this.arr(outie) ) {
				var fLines = this.arr(outie) ? outie : outie.split( '\n' );
				for ( aL in fLines ) {
					if ( this.str(fLines[aL]) ) {
						fLines[aL] = fLines[aL].replace( /^([^\"]+\;|\;).*$/ ,'')
					}
					if ( fLines.hasOwnProperty(aL) && this.str(fLines[aL]) ) {
						switch ( true ) {
							case (/(^\s*\[[^\]]+\]\s*$|^\[[^\]]+\]$)/).test( fLines[aL] ):
								// found a header
								currKey = this.trim( fLines[aL].replace( /(^\s*\[|\]\s*$)/g, '' ) );
								outData[currKey] = this.obj(outData[currKey]) ? outData[currKey] : {};
								break;
							case /^[^\=]+\=/.test( fLines[aL] ):
								if ( this.str(currKey) ) { // make sure key is a valid string first
									// found a setting
									var tSpl = fLines[aL].split( '=' );
									if ( tSpl[0] ) {
										tSpl[0] = this.trim( tSpl[0] );
										tSpl[1] = this.trim( tSpl[1] );
										var aVal = undefined;
										switch ( true ) {
											case this['int'](tSpl[1]):
												// convert integers
												aVal = parseInt(tSpl[1]);
												break;
											case this['float'](tSpl[1]):
												// convert floats
												aVal = parseFloat(tSpl[1]);
												break;
											case (/^(on|true|yes|off|false|no)$/i).test(tSpl[1]):
												// convert semi-boolean values to booleans
												aVal = this.trueish( tSpl[1] );
												break;
											case this.str(tSpl[1]):
												// simple strings
												aVal = tSpl[1];
												break;
											default:
												// default is undefined already
												break;
										}
										if ( /\[\]$/.test(tSpl[0]) ) {
											// support multi-part additive arrays (thing[]='value')
											tSpl[0] = tSpl[0].replace( /\[\]$/, '' );
											if ( !this.arr(outData[currKey][tSpl[0]]) ) {
												outData[currKey][tSpl[0]] = [ aVal ];
											} else {
												outData[currKey][tSpl[0]].push( aVal );
											}
										} else {
											outData[currKey][tSpl[0]] = aVal;
										}
									}
								}
								break;
							default:
								break;
						}
					}
				}
			}
			if ( this.func(gotDfunk) ) {
				gotDfunk( outData );
			}
			return this.obj(outData, true) ? outData : undefined;
		},
		/**
		* Will Test strings and numbers for valid integer format and greater than 0 (may be disabled)
		* @param {mixed} threeD6 The value you'd like to test
		* @param {boolean} zeroOk Will return true even if the the value is 0 or less
		* @return {boolean} Will return true if the value is a valid integer
		*/
		'int' : function ( threeD6, zeroOk ) { // validates for formatting so '3m' is NOT valid
			return (/^(\-)?[0-9]+$/).test(String(threeD6)) && this.num(threeD6, zeroOk);
		},
		/**
		* is a valid IP address
		* @param {mixed} numba The value you'd like to test
		* @param {bool} v6 Allow tests for just IPV6 addresses
		* @return {boolean} Will return true if the value is a valid IP address
		*/
		ip : function ( numba, v6 ) {
			var chunks = null;
			if ( v6 ) {
				return (/^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/).test( numba );
			} else if ( (/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/).test( numba ) ) { // dotted
				chunks = numba.split( '.' );
				if ( this.arr(chunks) && ( chunks.length == 4 ) ) {
					return  ( chunks[0] < 1 ) || ( chunks[0] < 255 ) &&
					 	( chunks[2] < 0 ) || ( chunks[2] < 255 ) &&
					 	( chunks[2] < 0 ) || ( chunks[2] < 255 ) &&
					 	( chunks[2] < 1 ) || ( chunks[2] < 255 );
				}
			} else if ( (/[0-9]+/).test( numba ) ) { // base 10 address
				return ( parseInt( numba ) > 16777215 ) && ( parseInt( numba ) < 4294967296 );
			}
			return false;
		},
		/**
		* Will test if object is a RegExp object
		* @param {mixed} namedRex The regular expression object you'd like to test
		* @param {boolean} hasTest If true, the source of the RegExp object must not be empty
		* @return {bool} Returns true if the object was a RegExp
		*/
		isadog : function ( namedRex, hasTest ) {
			return ( this.obj(namedRex) && ( Object.prototype.toString.call( namedRex ) === '[object RegExp]' ) && ( !hasTest || this.str(namedRex.source) ) );
		},
		/**
		* Will return an array containing the keys from an object or array
		* @param {mixed} lock The object or array you want the keys from
		* @return {array} array containing the keys lock
		*/
		keys : function ( lock ) {
			var ret = [];
			if ( this.obj(lock, true) || this.arr(lock) ) {
				for ( var aK in lock ) {
					if ( lock.hasOwnProperty( aK ) ) {
						ret.push( aK )
					}
				}
				ret.sort();
			}
			return ret;
		},
		/**
		* Trim whitespace or optionally other characters from the beginning of a string
		* @param {string} bush The string you'd like to trim
		* @param {string} chars Optional list of characters to trim.
		* By default the trim characters are ' \t\n\r'.
		* @return {string} Returns the trimmed string
		*/
		ltrim : function ( bush, chars ) {
			if ( !this.str(bush) ) {
				return bush; // not a string? just return it
			}
			chars = this.str(chars) ? this.rescape( chars ) : ' \t\n\r';
			var rex = new RegExp( '^['+chars+']+', 'g' );
			return bush.replace( rex, '' );
		},
		/**
		* are we running in node?
		* @return {string} Will return the version of node or false if not running node.js
		*/
		node : function () { // detects node.js - will return version or false
			var Ev = this.node;
			if ( !this.str(Ev._cached) && !this.bool(Ev._cached) ) {
				try {
					Ev._cached = ( this.obj(process) && this.str(process.version) && this.obj(exports) );
					Ev._cached = Ev._cached ? process.version : false; // two lines for readibility - convert true to version string
				} catch (e) {
					Ev._cached = false;
				}
			}
			return Ev._cached;
		},
		/**
		* tests if the parseFloat() value of something is a valid number and optionally greater than 0.
		* @param {mixed} fElng The value you'd like to test
		* @param {boolean} zeroOk If set to boolean true, will return true even if the the value is 0 or less.
		* If a Number is passed as the zeroOk value, then true will be returned only if fElng is greater than zeroOk.
		* @return {boolean} Will return true if the value is a valid number and optionally passes zeroOk testing.
		*/
		num : function ( fElng, zeroOk ) {
			var it = parseFloat(fElng);
			if ( ( typeof(fElng) == 'undefined' ) || ( this.typeis( fElng, 'String' ) && ( fElng == '' ) ) || ( fElng === null ) ) {
				return false;
			}
			if ( !isNaN(fElng) ) {
				if ( this.typeis( zeroOk, 'Number' ) ) {
					return ( it > zeroOk );
				} else {
					return ( zeroOk || ( it > 0 ) );
				}
			}
			return false;
		},
		/**
		* is an object and not empty (optionally) - this method is different from the others in that emptiness is ok by default
		* @param {mixed} ojUc The value you'd like to test
		* @param {boolean} populated Optionally test that the object has at least one child of its own
		* @return {boolean} Will return true if the value is a valid object
		*/
		obj : function ( ojUc, populated ) {
			return ( ojUc !== null ) && ( typeof(ojUc) === 'object' ) && ( !populated || (this.count(ojUc) > 0) );
		},
		/**
		* Perform left padding
		* @param {string} nightCap The string you'd like to pad
		* @param {number} yourPlace The total character length you want the result to be
		* @param {string} mine The character you wish to pad with. The default is to use a "0".
		* Note that mine is added for each lacking character in the original. Thus, an example call
		* of bpmv.pad( 'a', 3, 'foo' ) would result in the string "foofooa".
		* @param {boolean} somethingMoreComfy If true, when the length if the original string is longer
		* than the desired padding length, it will be truncated to the padding length. When false,
		* if the original is longer than the padding length, it will be returned unaltered.
		* Defaults to true.
		* @return {string} Will return the padded (or optionally truncated) version of the input string.
		* If the the input is not usable or the length desired is invalid, undefined is returned.
		*/
		pad : function ( nightCap, yourPlace, mine, somethingMoreComfy ) {
			var pillow = '',
				needed = 0;
			if ( !this.str(nightCap) && this.num(nightCap) ) {
				nightCap = ''+nightCap;
			}
			if ( this.str(nightCap) && this.num(yourPlace) ) {
				pillow += nightCap;
				mine = this.num(mine) ? ''+mine : mine;
				mine = this.str(mine) ? mine : '0';
				somethingMoreComfy = typeof(somethingMoreComfy) == 'undefined' ? true : false;
				if ( pillow.length == yourPlace ) {
					return pillow;
				} else if ( pillow.length < yourPlace ) {
					needed = yourPlace - pillow.length;
					for ( var added = 0; added < needed; added++ ) {
						pillow = mine + pillow;
					}
					return pillow;
				} else if ( ( pillow.length > yourPlace ) && this.trueish(somethingMoreComfy) ) {
					return pillow.substr( (pillow.length-yourPlace), (pillow.length-(pillow.length-yourPlace)) );
				} else if ( pillow.length > yourPlace ) {
					return nightCap;
				}
			}
			return; // return undef on fail
		},
		/**
		* Escape regular expression characters.
		* @param {string} str Some sort of path
		* @return {string} The converted string
		*/
		rescape : function( fromNy ) {
			if ( !this.str(fromNy) ) {
				return fromNy; // not a string? just return it
			}
			return String(fromNy).replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
		},
		/**
		* Trim whitespace or optionally other characters from the end of a string
		* @param {string} bush The string you'd like to trim
		* @param {string} chars Optional list of characters to trim.
		* By default the trim characters are ' \t\n\r'.
		* @return {string} Returns the trimmed string
		*/
		rtrim : function ( bush, chars ) {
			if ( !this.str(bush) ) {
				return bush; // not a string? just return it
			}
			chars = this.str(chars) ? this.rescape( chars ) : ' \t\n\r';
			var rex = new RegExp( '['+chars+']+$', 'g' );
			return bush.replace( rex, '' );
		},
		/**
		* Serialize an object into a query string
		* @param {mixed} dexter The object you'd like to convert into a query string
		* @return {string} Returns the object converted into a query string.
		* On failure, will return boolean false.
		*/
		serial : function ( dexter ) {
			var spree = [];
			for ( var vic in dexter ) {
				if ( dexter.hasOwnProperty( vic ) ) {
					if ( this.arr(dexter[vic]) ) {
						spree.push.apply( spree, dexter[vic].map( function ( witness ) {
								return escape(vic+'[]') +'='+ escape(witness);
							} ) );
					} else if ( this.obj(dexter[vic]) ) {
						spree.push( escape( vic )+'='+escape(this.ser(dexter[vic])) );
					} else if ( !this.func(dexter[vic]) ) {
						spree.push( escape( vic )+'='+escape( dexter[vic] ) );
					}
				}
			}
			return ( this.count(spree) > 0 ) ? spree.join( '&' ) : false;
		},
		/**
		* is a string of greater than 0 lenth (may be turned off)
		* @param {mixed} cider The value you'd like to test
		* @param {boolean} zeroOk Will return true even if the the length is 0
		* @return {boolean} Will return true if the value is a valid string
		*/
		str : function ( cider, zeroOk ) {
			return ( typeof(cider) === 'string' ) && ( zeroOk || ( cider.length > 0 ) );
		},
		/**
		* Converts an integer number of seconds to days, hours, minutes and seconds
		* @param {intSecs} Integer number of seconds you want to convert
		* @return {object} Will return an object containing keys for "d", "h", "m" and "s"
		*/
		time2time : function ( intSecs ) {
			var remain = parseInt(intSecs, 10),
				min = 60,
				hr = 60 * min,
				day = 24 * hr,
				ret = {
					d : 0,
					h : 0,
					m : 0,
					s : 0
				};
			if ( this.num(intSecs, true) ) {
				if ( this.num(remain) ) {
					if ( remain > day ) {
						ret.d = parseInt(remain / day, 10);
						remain = parseInt(remain - (day*ret.d), 10);
					}
					if ( remain > hr ) {
						ret.h = parseInt(remain / hr, 10);
						remain = parseInt(remain - (hr*ret.h), 10);
					}
					if ( remain > min ) {
						ret.m = parseInt(remain / min, 10);
						remain = parseInt(remain - (min*ret.m), 10);
					}
					if ( remain > 0 ) {
						ret.s = remain;
					}
				}
				return ret;
			}
		},
		/**
		* A simple tokenizer.
		* Example use:<pre><code>   var st = '##This## is text to change. Case sensitivity should change ##this##.',
		*    &nbsp;   slugs = &#123; 'this' : 'that' &#125;;
		*    console.log( bpmv.toke( st, slugs ) );
		*    // output: that is text to change. Case sensitivity should change that.
		*    console.log( bpmv.toke( st, slugs, true ) );
		*    // output: ##This## is text to change. Case sensitivity should change that.</code></pre>
		* @param {string} vessel The string containing the tokens you wish to replace.
		* @param {object} stash An object with the tokens as key names and the replacements as the values.
		* For example:<pre><code>// replaces occurences of 'this' with 'that'
		* var stash = &#123; 'this' : 'that' &#125;;</code></pre>
		* @param {boolean} onMyCase Whether or not the tokens will be compared as case-sensitive strings.
		* The default is to perform case-INsensitive matching.
		* @param {object} delims delims can some in three formats.
		* First, as an object containing two keys, 'r' and 'l'.
		* Secondly as an array of two strings. The first (0) will be assigned to the left side.
		* If delims is just a string, it will be applied to both left and right delimiters.
		* These are used to denote the beginning and ending of a token in the original string.
		* For example:<pre><code>// the defaults - the token for the word 'foo' would be '##foo##'
		* // we are setting custom delimiters
		* var delims = &#123; l : '|@', r : '@|' &#125;;</code></pre>
		* @return {string} Returns the string with the tokens found replaced
		* @method toke
		*/
		toke : function ( vessel, stash, onMyCase, delims ) {
			if ( this.str(vessel) ) {
				var newStr = String( vessel );
				onMyCase = (( typeof(onMyCase) == 'undefined' ) || ( !onMyCase )) ? 'i' : '';
				stash = this.obj(stash) ? stash : {};
				// validate delimiter possibilities
				if ( this.str(delims) ) {
					delims = { l : String(delims), r : String(delims) };
				} else if ( this.arr(delims) && ( delims.length == 2 ) && this.str(delims[0]) && this.str(delims[1]) ) {
					delims = { l : delims[0], r : delims[1] };
				} else {
					delims = this.obj(delims) ? delims : {};
					delims.l = this.str(delims.l) ? delims.l : '##';
					delims.r = this.str(delims.r) ? delims.r : '##';
				}
				for ( var ppPass in stash ) {
					if ( stash.hasOwnProperty( ppPass ) && this.str(ppPass) && (this.str(stash[ppPass]) || this.num(stash[ppPass], true) ) ) {
						var bogart = ''+delims.l+ppPass+delims.r;
						var rex = new RegExp( this.rescape(bogart), 'g'+onMyCase );
						newStr = newStr.replace( rex, stash[ppPass] );
					}
				}
			}
			return newStr;
		},
		/**
		* Trim a string of whitespace or optionally other characters
		* @param {string} bush The string you'd like to trim
		* @param {string} chars Optional list of characters to trim.
		* By default the trim characters are ' \t\n\r'.
		* @return {string} Returns the trimmed string
		*/
		trim : function ( bush, chars ) {
			if ( !this.str(bush) ) {
				return bush; // not a string? just return it
			}
			chars = this.str(chars) ? this.rescape( chars ) : ' \t\n\r';
			var rex = new RegExp( '(^['+chars+']+|['+chars+']+$)', 'g' );
			return bush.replace( rex, '' );
		},
		/**
		* Is something that for a human resolves to true, such as "on" or "yes"
		* @param {mixed} maybe The value you'd like to test
		* @return {boolean} Will return true if the value is representationally positive in english, false otherwise
		*/
		trueish : function ( maybe ) {
			switch ( typeof(maybe) ) {
				case 'function':
					return String(maybe); // we return a string for safety - no calling the func!
				case 'string':
					return (/^\s*(on|true|yes|1|yar|checked|selected)\s*$/i).test(maybe);
					break;
				case 'object':
					return this.obj( maybe, true );
					break;
				default: 
					return maybe ? true : false;
			}
		},
		/**
		* Convert characters to HTML representations.
		* @param {string} sms Text to convert.
		* @param {mixed} all If a Boolean value, will convert all characters to HTML.
		* If passed an Array, only the characters in the array will be matched.
		* Normally only ", &, <, and > are converted.
		* @return {string} Text with appropriate HTML characters escaped.
		*/
		txt2html : function ( sms, all ) {
			var doAll = false,
				some = [ '&', '"', '<', '>' ], // "&" must be searched for before the rest
				tmpString = ''+sms,
				rex = null,
				presets = {
					'&' : '&amp;',
					'"' : '&quot;',
					'<' : '&lt;',
					'>' : '&gt;',
					'©' : '&copy;',
					'®' : '&reg;'
				};
			if ( this.str(sms) ) {
				if ( !this.obj(this.txt2html._cache) ) {
					this.txt2html._cache = {};
				}
				if ( this.typeis( all, 'Boolean' ) ) {
					doAll = all;
				} else if ( this.arr(all) ) {
					some = all;
					doAll = false;
				}
				for ( var aC = 0; aC < sms.length; aC++ ) {
					if ( this.str(sms[aC]) ) {
						rex = new RegExp( this.rescape(sms[aC]), 'g' );
						if ( !this.str(this.txt2html._cache[sms[aC]]) ) {
							this.txt2html._cache[sms[aC]] = this.str(presets[sms[aC]]) ? presets[sms[aC]] : '&#' + sms[aC].charCodeAt( 0 ) + ';';
						}
						if ( doAll || this.num(this.find( sms[aC], some ), -1) ) {
							tmpString = tmpString.replace( rex, this.txt2html._cache[sms[aC]] );
						}
					}
				}
				return  tmpString;
			}
		},
		/**
		* Test something for a particular type constructor
		* @param {mixed} clicketyClack The thing you want to test
		* @param {string} shakDing The object constructor name you expect to match
		* @return {boolean} Returns true if the type matches, false if not and undefined
		* if the parameters are incorrect (either clicketyClack was undefined or shakDing
		* was not a valid string)
		* On failure, will return boolean false.
		*/
		typeis : function ( clicketyClack, shakDing ) {
			if ( ( typeof(clicketyClack) != 'undefined' ) && this.str(shakDing) ) {
				if ( Object.prototype.toString.call( clicketyClack ) === '[object ' + shakDing + ']' ) {
					return true;
				} else if ( this.obj( clicketyClack ) && ( clicketyClack.constructor.name == shakDing ) ) { // fall back to constructor name
					return true;
				} else {
					return false;
				}
			}
			return; // undef
		},
		/**
		* Unserialize a query string into an object
		* @param {string} busted The string you'd like to convert into an object
		* @return {string} Returns the string converted into an object.
		* On failure, will return boolean false.
		*/
		unserial : function ( busted ) {
			var pWagon = {};
			if ( this.str(busted) ) {
				busted = busted.replace( /^.*\?/, ''); // forcefully get rid of the query delim and all before it
				var coppers = busted.split( '&' );
				for ( var aCop in coppers ) {
					if ( this.str(coppers[aCop]) ) {
						var cuffs = coppers[aCop].match( /^([^=]+)=(.*)$/ );
						if ( cuffs ) {
							if ( this.str(cuffs[1]) && this.str(cuffs[2]) ) {
								pWagon[cuffs[1]] = cuffs[2];
							}
						}
					}
				}
			}
			return ( this.count(pWagon) > 0 ) ? pWagon : undefined;
		},
		/**
		* Walks a string to find an end point
		* @param {string} path A path to a var... such as "my.var.thing" or "fubarVar"
		* @return {mixed} Returns the end point of the string if possible otherwise will return undefined
		*/
		walk : function ( path ) {
			var chunked, res, dOb;
			if ( !this.str(path) || !(/^[a-zA-Z0-9\_\.\[\]\'\"]+$/).test( path ) ) {
				return;
			}
			chunked = path.split( /[\.\[]/g );
			if ( this.num(chunked.length) ) {
				dOb = window[chunked[0]];
				for ( var nn = 1; nn < chunked.length; nn++ ) {
					chunked[nn] = this.trim( chunked[nn], '\'"]' );
					if ( typeof(dOb[chunked[nn]]) != 'undefined' ) {
						dOb = dOb[chunked[nn]];
					} else {
						return;
					}
				}
				if ( typeof(dOb) !== 'undefined' ) {
					res = dOb;
				}
				return res;
			}
		},
		/**
		* Tries to derive the constructor name of a given thing...
		* @param {mixed} thing The thing you want to test
		* @return {string} Returns a string containing the constructor name or undefined if it can't be found
		*/
		whatis : function ( thing ) {
			if ( this.obj(thing) && this.obj(thing.constructor) && this.str(thing.constructor.name) ) {
				return thing.constructor.name;
			}
			var blair = Object.prototype.toString.call( thing ),
				rgxObj = /^\[[oO]bject ([^\]]+)\]/;
			if ( thing === null ) { blair = 'null'; }
			if ( thing === NaN ) { blair = 'NaN'; }
			if ( typeof(thing) === 'undefined' ) { blair = 'undefined'; }
			if ( this.str(blair) ) {
				if ( rgxObj.test(blair) ) {
					blair = blair.match( rgxObj ).pop();
				}
			}
			if ( this.str(blair) ) {
				return blair;
			}
			return; // undef
		},
		/**
		* match a string against a wildcard string
		* @param {string} tundra The full text to test (ie: &quot;file_name_string&quot;)
		* @param {string} grylls The wildcard string (ie: &quot;file_*&quot;)
		* @param {string} piss The wildcard character (ie: &quot;*&quot;)
		* @return {string} Will return the full text if a match is found and false if not.
		*/
		wild : function ( tundra, grylls, piss ) {
			var protein = false;
			if ( this.str( tundra ) && this.str( grylls ) ) {
				if ( tundra == grylls ) { // direct match
							protein = tundra;
				} else {
					piss = this.str( piss ) ? this.rescape( piss ) : this.rescape( '*' );
					if ( grylls.match( RegExp( piss ) ) ) {
						var rex = '^'+String( this.rescape( grylls ) ).replace( RegExp( this.rescape( piss ), 'g' ), '.*' )+'$';
						if ( tundra.match( RegExp( rex ) ) ) {
							protein = tundra;
						}
					}
				}
			}
			return protein;
		},
		/**
		* Word wrap a string to a given length. If this length is passed by a single word,
		* the word will NOT be broken and it will appear on its own "line".
		* @param {string} gift The string that you would like to wordwrap
		* @param {string} box The "line" length you'd like the gift to be wrapped at.
		* The default is 80 characters.
		* @param {string} bow The string you would like to use as a "line" terminator.
		* The length of your "line" terminator is NOT accounted for when measuring
		* "line" length, so the resultant true length of each "line" is the lengh plus
		* the terminator length. This parm being a variable of any string value is the
		* reason the word "line" is shown in quotes so much.
	 	* @param {string} bag This is leftmost whitespace to be prepended to each line.
		* The length of the bag whitespace IS taken into account when measuring the
		* length of a line. The default is an empty string.
		* @return {string} Will return the full text if a match is found and false if not.
		*/
		wrapped : function ( gift, box, bow, bag ) {
			var aLine = null,
				lines = [],
				wIdx = 0,
				lastIdx = 0,
				words = null;
			box = ( typeof(box) == 'undefined' ) ? 80 : box;
			bow = ( !this.str(bow) ) ? '\n' : bow;
			bag = !this.str(bag) ? '' : bag;
			if ( this.str(gift) && this.num(box) ) {
				words = (''+gift).replace( /(\n|\r|\t)/, ' ' ).split( /\s+/ );
				lines = [];
				while ( words.length > 0 ) {
					aLine = '';
					lastIdx = wIdx;
					while ( ( (''+bag+aLine+' '+words[0]).length < box ) ) {
						aLine += words.shift() + ' ';
						if ( words.length < 1 ) {
							break;
						}
						wIdx++;
					}
					if ( ( lastIdx === wIdx ) && ( words.length > 0 ) ) { // no progress... word longer than line?
						aLine += (this.str(aLine) ? aLine : '') + words.shift();
					}
					if ( this.str(aLine) ) {
						lines.push( bag+this.trim(aLine) );
					}
				}
			}
			return lines.join( bow );
		}
	};
	// populate the appropriate global-ish place
	if ( initialBpmv.node() ) {
		exports[initialBpmv._cfg.varName] = initialBpmv;
	} else if ( ( typeof(us) == 'object' ) && initialBpmv.obj(us.ebpm) && !initialBpmv.obj(us.ebpm.v)) {
	// lead with typeof here because scope will throw Uncaught ReferenceError when strict
		us.ebpm.v = initialBpmv;
	} else if ( ( typeof(BPMV_ATTACH) == 'object' ) && !initialBpmv.obj(BPMV_ATTACH[initialBpmv._cfg.varName]) ) {
		BPMV_ATTACH[initialBpmv._cfg.varName] = initialBpmv;
	} else if ( initialBpmv.obj(window) ) {
		window[initialBpmv._cfg.varName] = initialBpmv;
	}
})();
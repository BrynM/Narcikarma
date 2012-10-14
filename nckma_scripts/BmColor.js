function BmColor ( val ) {
	var colA = null
		, colR = null
		, colG = null
		, colB = null;

}

BmColor.prototype.add = function ( val ) {
	
};

BmColor.prototype.darken = function ( amt ) {
};

BmColor.prototype.get = function ( fmt, asArr, val ) {
	var fmt = ( typeof(format) == 'string' ) ? ''+fmt : 'hex'
		, aVal = ;
console.log( 'inpFmt', inpFmt );
console.log( 'inpFmt', fmt );
	switch ( fmt.toLowerCase() ) {
		case 'css':
			break;
		case 'rgb':
		case 'rgb_arr':
			break;
		case 'rgba':
		case 'rgba_arr':
			break;
		case 'hex':
		case 'hex_#':
		case 'hex_arr':
		default:
			break;
	}
};

BmColor.prototype.getFormat = function ( val ) {
	var ret = null;
	if ( ( typeof(val) == 'string' ) && !(/^\s*$/).test( val ) ) { // value is a string
		if ( /^\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\s*$/.test( val ) ) {
console.log( 'rgb/hsv', val );
		} else if ( /^\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\s*,\s*[0-9\.]{1,3}\s*$/.test( val ) ) {
console.log( 'rgba', val );
		} else if ( /^\s*[0-9A-Fa-f]{6}\s*$/.test( val ) ) {
console.log( 'rgba', val );
		}
	} else if ( ( typeof(val) === 'object' ) && ( Object.prototype.toString.call(val) === '[object Array]' ) ) { // value is an array
		if () {

		}
	}
}

BmColor.prototype.lighten = function ( amt ) {
	var rgba = [];
};

BmColor.prototype.neutral = function ( amt ) {
	var rgba = [];
};

BmColor.prototype.set = function ( val ) {
	var rgba = [];
};

BmColor.prototype.sub = function ( val ) {
	var rgba = [];
};

BmColor.prototype.toCss = function ( inp ) {
	var rgba = [];
};

BmColor.prototype.toHex = function ( inp, asArr ) {
	var rgba = [];
};

BmColor.prototype.toHsv = function ( inp, asArr ) {
	var rgba = [];
};

BmColor.prototype.toRgb = function ( inp, asArr ) {
	var rgba = [];
};

BmColor.prototype.toRgbA = function ( inp, asArr ) {
	var rgba = [];
};

BmColor.prototype.toString = function ( format, val ) {
	var ret = this.get( format, false, val );
	return ( ret && ( typeof(ret.toString) === 'function' ) ) ? ret.toString() : ret;
};

var boo = new BmColor( '' );






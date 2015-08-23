var bgP = chrome.extension.getBackgroundPage();
var nckma = bgP.nckma;
var bpmv = bgP.bpmv;

function populate () {
	var sD = null;
	var cDelt = 0;
	var lDelt = 0;
	var pClass = '';
	var pChar = '';
	var cDay = null;
	var info = null;
	var inf = '';

	status = nckma.get(true);

	if (bpmv.str(status)) {
		sD = JSON.parse(status);

		if ( bpmv.obj(sD.start, true) ) {
			$('#nck_user').text(sD.start.name+(sD.current.has_verified_email ? '' : ' (unverified email)'));

			cDay = new Date(0);
			cDay.setUTCSeconds(sD.start.created_utc);

			$('#nck_cakeday').text(nckma.str_date(cDay), localStorage['dateFormat'] );
			$('#nck_start_lkarma').text( bpmv.num(sD.start.link_karma, true) ? nckma.str_num(sD.start.link_karma) : 'unknown' );
			$('#nck_start_ckarma').text( bpmv.num(sD.start.comment_karma, true) ? nckma.str_num(sD.start.comment_karma) : 'unknown' );

			if (bpmv.num(sD.start.nkTimeStamp)) {
				$('#nck_start_timestamp').text(nckma.str_date(sD.start.nkTimeStamp), localStorage['dateFormat'] );
			} else {
				$('#nck_start_timestamp').text('unknown');
			}
		} else {
			$('#nck_user').text('unknown');
			$('#nck_cakeday').text('unknown');
			$('#nck_start_lkarma').text('unknown');
			$('#nck_start_ckarma').text('unknown');
		}

		if ( bpmv.obj(sD.current, true) ) {
			if (bpmv.num(sD.current.nkTimeStamp)) {
				$('#nck_curr_timestamp').text(nckma.str_date(sD.current.nkTimeStamp), localStorage['dateFormat'] );
			} else {
				$('#nck_curr_timestamp').text('unknown');
			}

			lDelt = parseInt( sD.current.link_karma, 10 ) - parseInt( sD.start.link_karma, 10 );

			if ( lDelt > 0 ) { // positive
				pChar = '+';
				pClass = 'color: rgba( ' + localStorage['color_posChange'] + ' );';
			} else if ( lDelt < 0 ) { // negative
				pClass = 'color: rgba( ' + localStorage['color_negChange'] + ' );';
			} else { // zero
				pClass = 'color: rgba( ' + localStorage['color_noChange'] + ' );';
			}

			$('#nck_curr_lkarma').html( ( bpmv.num(sD.current.link_karma, true) ? nckma.str_num(sD.current.link_karma) : 'unknown' ) + ' (<span style="'+pClass+'">' + pChar + nckma.str_num(lDelt) + '</span>)' );

			cDelt = parseInt( sD.current.comment_karma, 10 ) - parseInt( sD.start.comment_karma, 10 );
			pChar = '';

			if ( cDelt > 0 ) { // positive
				pChar = '+';
				pClass = 'color: rgba( ' + localStorage['color_posChange'] + ' );';
			} else if ( cDelt < 0 ) { // negative
				pClass = 'color: rgba( ' + localStorage['color_negChange'] + ' );';
			} else { // zero
				pClass = 'color: rgba( ' + localStorage['color_noChange'] + ' );';
			}

			$('#nck_curr_ckarma').html( ( bpmv.num(sD.current.comment_karma, true) ? nckma.str_num(sD.current.comment_karma) : 'unknown' ) + ' (<span style="'+pClass+'">' + pChar + nckma.str_num(cDelt) + '</span>)');

			$('#nck_is_gold').html(sD.current.is_gold ? '<a href="'+nckma.get_url('lounge')+'" target="_blank" style="color: rgba( ' + localStorage['color_gold'] + ' );">Like a Sir</a>' : '<a href="'+nckma.get_url('gold')+'" target="_blank">Not yet</a>');
			$('#nck_gold_credits').html(sD.current.gold_creddits > 0 ? '<span  style="color: rgba( ' + localStorage['color_gold'] + ' );">'+sD.current.gold_creddits+'</span>' : '0');
			$('#nck_has_mail').html('<a href="'+nckma.get_url('inbox')+'" target="_blank" style="color:red;">'+(sD.current.has_mail ? 'Yes ('+sD.current.inbox_count+')' : 'No')+'</a>');
			$('#nck_is_mod').html(sD.current.is_mod ? '<a href="'+nckma.get_url('modqueue')+'" target="_blank">Yes</a>' : 'No');
			$('#nck_has_mod_mail').html('<a href="'+nckma.get_url('modmail')+'" target="_blank" style="color:red;">'+(sD.current.has_mod_mail ? 'Yes' : 'No')+'</a>');
		} else {
			$('#nck_curr_lkarma').text('unknown');
			$('#nck_curr_ckarma').text('unknown');
			$('#nck_is_gold').text('unknown');
			$('#nck_has_mail').text('unknown');
			$('#nck_is_mod').text('unknown');
			$('#nck_has_mod_mail').text('unknown');
		}

		info = bgP.nckma.info(true);

		if (bpmv.str(info)) {
			inf = JSON.parse(info);
			$('#nck_name').text( '' + inf.name + ' v' + inf.version );
			$('#nck_desc').text( '' + inf.description );
		}

	}
}

/*
* startup cb
*/

$(function () {
	//$('#nck_close_x').click( function () { window.close(); } );
	//$('#nck_btn_graphs').click( function () { window.open('/nckma_html/graphs.html'); } );
	//$('#nck_btn_options').click( function () { window.open('/nckma_html/options.html'); } );
	//$('#nck_btn_close').click( function () { window.close(); } );
	//$('#nck_btn_user').click(go_to_user);
	//$('#nck_btn_credits').click( function () { window.open('/nckma_html/credits.html'); } );

	nckma.pages.bind_btns(window);

	populate();

	nckma.ev('parse', populate);
});

$(window).on('beforeunload', function () {
	nckma.ev_kill('parse', populate);
});
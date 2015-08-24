var bgP = chrome.extension.getBackgroundPage();
var nckma = bgP.nckma;
var bpmv = bgP.bpmv;

function populate () {
	var opts = nckma.opts.get();
	var sD = null;
	var cDay = null;
	var info = null;
	var inf = '';

	status = nckma.get(true);

	if (bpmv.str(status)) {
		sD = JSON.parse(status);

		if (bpmv.obj(sD.start, true)) {
			$('#nck_user').html(nckma.pages.tpl('name', true));

			cDay = new Date(0);
			cDay.setUTCSeconds(sD.start.created_utc);

			$('#nck_cakeday').text(nckma.str_date(cDay), opts['dateFormat'] );
			$('#nck_start_lkarma').text(nckma.pages.tpl('start_link_karma', true));
			$('#nck_start_ckarma').text(nckma.pages.tpl('start_comment_karma', true));

			if (bpmv.num(sD.start.nkTimeStamp)) {
				$('#nck_start_timestamp').text(nckma.str_date(sD.start.nkTimeStamp), opts['dateFormat']);
			} else {
				$('#nck_start_timestamp').text('unknown');
			}
		} else {
			$('#nck_user').text('unknown');
			$('#nck_cakeday').text('unknown');
			$('#nck_start_lkarma').text('unknown');
			$('#nck_start_ckarma').text('unknown');
		}

		if (bpmv.obj(sD.current, true)) {
			if (bpmv.num(sD.current.nkTimeStamp)) {
				$('#nck_curr_timestamp').text(nckma.str_date(sD.current.nkTimeStamp), opts['dateFormat'] );
			} else {
				$('#nck_curr_timestamp').text('unknown');
			}

			$('#nck_curr_lkarma').html(nckma.pages.tpl('current_link_karma', true));
			$('#nck_curr_ckarma').html(nckma.pages.tpl('current_comment_karma', true));
			$('#nck_total_karma').html(nckma.pages.tpl('total_karma', true));
			$('#nck_over_18').html(nckma.pages.tpl('over_18', true));
			$('#nck_is_gold').html(nckma.pages.tpl('is_gold', true));
			$('#nck_gold_creddits').html(nckma.pages.tpl('gold_creddits', true));
			$('#nck_has_mail').html(nckma.pages.tpl('has_mail', true));
			$('#nck_is_mod').html(nckma.pages.tpl('is_mod', true));
			$('#nck_has_mod_mail').html(nckma.pages.tpl('has_mod_mail', true));
		}

		info = nckma.info(true);

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
	nckma.pages.bind_btns(window);
	populate();
	nckma.ev('parse', populate);
});

$(window).on('beforeunload', function () {
	nckma.ev_kill('parse', populate);
});
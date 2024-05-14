"use strict";

/**
 * 날짜 범위 선택하기 클래스 생성자
 * @param {object}	target	- 초기화할 대상
 */
var DatePicker = function(target){
	if(!(target instanceof jQuery)){
		target = $(target);
	}
	var me = this,
		aniProp = {
			duration : 400,
			easing : "easeInSine",
			complete : aniComplete
		},
		today, curDate, month, range, tbody, title, input;

	var t_hd = "날짜선택",
		t_ok = "확인",
		t_d0 = "일",
		t_d1 = "월",
		t_d2 = "화",
		t_d3 = "수",
		t_d4 = "목",
		t_d5 = "금",
		t_d6 = "토",
		t_td = "오늘";
    if($("html").attr("lang") == "zh"){
        t_hd = "请选择日期。",
		t_ok = "确认",
		t_d0 = "日",
		t_d1 = "一",
		t_d2 = "二",
		t_d3 = "三",
		t_d4 = "四",
		t_d5 = "五",
		t_d6 = "六",
		t_td = "今日";
    }else if($("html").attr("lang") == "en"){
        t_hd = "Select Date",
		t_ok = "Confirm",
		t_d0 = "SUN",
		t_d1 = "MON",
		t_d2 = "TUE",
		t_d3 = "WED",
		t_d4 = "THU",
		t_d5 = "FRI",
		t_d6 = "SAT",
		t_td = "TODAY";
    }

	var template = '<div id="ui-datepicker" class="ui-datepicker dragDownWrapper" tabindex="0">';
		template += '<h3 class="titCal">'+t_hd+'</h3>';
		template += '<div class="datepicker_gui" style="max-height:calc(100vh - 220px);overflow:auto;">';
			template += '<div class="ui-datepicker-header">';
				template += '<button class="ui-datepicker-prev-year" title="Prev Year"><span class="ui-icon ui-icon-circle-triangle-e">이전 년도</span></button>';
				template += '<button class="ui-datepicker-prev" title="Prev"><span class="ui-icon ui-icon-circle-triangle-w">이전 달</span></button>';
				template += '<div class="ui-datepicker-title"></div>';
				template += '<button class="ui-datepicker-next" title="Next"><span class="ui-icon ui-icon-circle-triangle-e">다음 달</span></button>';
				template += '<button class="ui-datepicker-next-year" title="Next Year"><span class="ui-icon ui-icon-circle-triangle-e">다음 년도</span></button>';
			template += '</div>';
			template += '<div style="margin:0 12px;"><table class="ui-datepicker-calendar">';
				template += '<caption>날짜를 선택할 수 있는 calendar 표</caption>'
				template += '<thead>';
					template += '<tr>';
						template += '<th style="padding:0 !important;width:14.28%;" scope="col" class="ui-datepicker-week-end"><span title="Sunday">'+t_d0+'</span></th>';
						template += '<th style="padding:0 !important;width:14.28%;" scope="col"><span title="Monday">'+t_d1+'</span></th>';
						template += '<th style="padding:0 !important;width:14.28%;" scope="col"><span title="Tuesday">'+t_d2+'</span></th>';
						template += '<th style="padding:0 !important;width:14.28%;" scope="col"><span title="Wednesday">'+t_d3+'</span></th>';
						template += '<th style="padding:0 !important;width:14.28%;" scope="col"><span title="Thursday">'+t_d4+'</span></th>';
						template += '<th style="padding:0 !important;width:14.28%;" scope="col"><span title="Friday">'+t_d5+'</span></th>';
						template += '<th style="padding:0 !important;width:14.28%;" scope="col" class="ui-datepicker-week-end"><span title="Saturday">'+t_d6+'</span></th>';
					template += '</tr>';
				template += '</thead>';
				template += '<tbody></tbody>';
			template += '</table></div>';
		template += '</div>';
		template += '<div class="btnBtm">';
			template += '<div class="btnArea">';
				template += '<button type="button" class="btnSSG btnM action">'+t_ok+'</button>';
			template += '</div>';
		template += '</div>';
		template += '<button type="button" class="close dragDownClose">달력 닫기</button>';
	template += '</div>';

	/**
	 * 팝업 열기
	 */
	me.open = function(){
		curDate = getDate(input.val());
		month = curDate ? new Date(curDate.getTime()) : new Date(today.getTime());
		month.setDate(1);

		drawPopup();
		drawMonth();

		//overflow = $("body").css("overflow");
		//$("body").css("overflow", "hidden").addClass("hidePopupDimm");
		//$("body").addClass("hidePopupDimm");
		hidePopupDimm(true);
		var p = me.popup;
		p.addClass("on");
		p.stop(true).css("display", "block").animate({"bottom":"0"}, aniProp);
		p.focus();

		var v = checkIOSVersion();
		if(v > 0){
			p.closest(".layCont").css("overflow", "visible");
			p.closest(".lCont").css("overflow", "visible");
		}
		p.closest(".layCont").css("z-index", 200);
		p.closest(".lCont").css("z-index", 200);
		//lc.siblings(".btnBtm.shdBtns").css("display", "none");
	};

	/**
	 * 팝업 닫기
	 */
	me.close = function(){
		var p = me.popup;
		p.stop(true).animate({"bottom":"-100%"}, aniProp);
		//me.popup.removeClass("on");
		//$("body").removeClass("hidePopupDimm");
		p.addClass("closed");

		var v = checkIOSVersion();
		if(v > 0){
			//lc.removeAttr("style");
			p.closest(".layCont").css("overflow", "");
			p.closest(".lCont").css("overflow", "");
		}
		p.closest(".layCont").css("z-index", "");
		p.closest(".lCont").css("z-index", "");
		//lc.siblings(".btnBtm.shdBtns").css("display", "");

		/*if(typeof(overflow) != "undefined"){
			$("body").css("overflow", overflow);
			overflow = undefined;
		}*/
		//input.focus();
		me.wrapper.focus();
	};

	/**
	 * 달력 영역만 가져가기
	 */
	me.getGUI = function(){
		curDate = getDate(input.val());
		month = curDate ? new Date(curDate.getTime()) : new Date(today.getTime());
		month.setDate(1);

		drawPopup();
		drawMonth();

		me.getDate = function(){
			var str = getString(curDate);
			if(str == "1970.01.01" || str == "01.01.1970"){
				str = "";
			}
			return str;
		};

		return me.popup.find(".datepicker_gui");
	};

	/**
	 * 애니메이션 종료 이벤트
	 */
	function aniComplete(){
		if(me.popup.hasClass("closed")){
			me.popup.removeClass("on closed");
			//$("body").removeClass("hidePopupDimm");
			hidePopupDimm(false);
			me.popup.css("display", "none");
		}
	};

	/**
	 * 범위 선택 초기화하기
	 */
	function init(){
		$.each(target, function(idx, itm){
			if(idx > 0){ return false; }// 한 개만 초기화

			var wrap = $(itm),
				btn;
			if(wrap.data("initialized") == "Y"){ return; }
			wrap.data("initialized", "Y");

			input = wrap.find("input[data-id]");
			btn = wrap.find(".ui-datepicker-trigger");

			if(input.length * btn.length == 0){
				console.warn("Error: DatePicker, 인풋 또는 버튼 객체가 없습니다.");
				return false;
			}

			getRange(input.data("range"));

			today = new Date();
			today.setHours(0, 0, 0, 0);

			me.wrapper = wrap;

			btn.bind("click.datepicker", me.open);
			input.bind("click.datepicker", me.open);
		});
	};

	/**
	 * 선택가능 범위 설정
	 */
	function getRange(str){
		if(typeof(str) == "undefined"){ return; }
		try{
			var arr = str.split("-"),
				d1 = getDate(arr[0]),
				d2 = getDate(arr[1]),
				t1, t2;

			if(d1 == null && d2 == null){
				// no range
			}else if(d1 == null){
				d1 = new Date(2000, 0, 1);
			}else if(d2 == null){
				d2 = new Date(2100, 0, 1);
			}

			if(d1 && d2){
				t1 = d1.getTime();
				t2 = d2.getTime();

				if(d1 < d2){
					range = {
						start : d1,
						end : d2
					}
				}else{
					range = {
						start : d2,
						end : d1
					}
				}
			}

		}catch(e){
			console.log("잘못된 범위 설정: " + str);
		}
	};

	/**
	 * 스트링으로 날짜 구하기
	 */
	function getDate(str){
		var day;
		try{
			if(str.indexOf("-") >= 0 || str.indexOf("/") >= 0){
				str = str.replace(/-|\//g, ".");
			}
			var arr = str.split(".");
            if($("html").attr("lang") == "en"){
                day = new Date(parseInt(arr[2], 10), parseInt(arr[1], 10) - 1, parseInt(arr[0]));
            } else {
                day = new Date(parseInt(arr[0], 10), parseInt(arr[1], 10) - 1, parseInt(arr[2]));
            }
			
			if(day == "Invalid Date"){
				throw(new Error("Invalid Date"));
			}
		}catch(e){
			return null;
			/*if(flag == ""){
				return null;
			}
			day = new Date();
			if(flag == "s"){
				day.setDate(1);
			}else{
				day.setMonth(day.getMonth() + 1, 0);
			}*/
		}
		return day;
	};

	/**
	 * 날짜에서 YYYY.MM.DD 문자열 구하기
	 */
	function getString(date){
		var t = new Date(date),
			y = t.getFullYear(),
			m = t.getMonth() + 1,
			d = t.getDate();
		
        if($("html").attr("lang") == "en"){
            if(y < 1970){
			    return "01.01.1970";
		    }else{
                return (d < 10 ? "0" + d : d) + "." + (m < 10 ? "0" + m : m) + "." + y;
            }
        }else{
            if(y < 1970){
			    return "1970.01.01";
		    }else {
                return y + "." + (m < 10 ? "0" + m : m) + "." + (d < 10 ? "0" + d : d);
            }
        }
	};

	/**
	 * 최초 오픈 시에 팝업 생성
	 */
	function drawPopup(){
		if(typeof(me.popup) != "undefined"){ return; }

		me.popup = $(template);
		var wrap = me.wrapper,
			pop = me.popup;

		pop.find(".datepicker-inner").css("max-height", ($(window).height() - 115));// 기기높이값 - 115px
		wrap.append(pop);
		if(wrap.find(">.dimmed").length == 0){
			wrap.append('<div class="dimmed"></div>');
		}
		wrap.find(">.dimmed").bind("click.datepicker", me.close);
		pop.find("button.close").bind("click.datepicker", me.close);
		pop.find(".ui-datepicker-header button").bind("click.datepicker", changeMonth);
		pop.find(".btnBtm .btnArea button").bind("click.datepicker", ok);
		tbody = pop.find("tbody");
		title = pop.find(".ui-datepicker-title");
		/*pop.bind("click.datepicker", function(e){
			if($(e.target).hasClass("ui-datepicker")){
				me.close();
			}
		});*/

		//initTouchArea(pop);
		initDragDownArea();
	};

	/**
	 * 타이틀바 드래그 초기화
	 */
	/*function initTouchArea(pop){
		if(pop.hasClass("layPopFull")){ return; }

		var div = $('<div style="position:absolute;top:0;left:0;right:0;height:70px;background:transparent;"></div>');
		pop.find("h3.titCal").after(div);
		div.bind("touchstart.layerPopup", touchStartPopup);
	};*/

	/**
	 * 타이틀 아래로 드래그 시에 팝업 닫기
	 */
	/*function touchStartPopup(e){
		e.preventDefault();
		$win.bind("touchmove.layerPopup", touchMovePopup);
		$win.bind("touchend.layerPopup", touchEndPopup);
		touchTarget = $(e.currentTarget);
		touchStartY = e.originalEvent.touches[0].screenY;
	};

	function touchMovePopup(e){
		var y = e.originalEvent.touches[0].screenY,
			d = y - touchStartY;

		if(d < -20){
			touchEndPopup();
		}else if(d > 50){
			touchEndPopup();
			touchTarget.siblings("button.close").trigger("click.datepicker");
		}
	};

	function touchEndPopup(){
		$win.unbind("touchmove.layerPopup", touchMovePopup);
		$win.unbind("touchend.layerPopup", touchEndPopup);
	};*/

	/**
	 * 확인버튼 클릭 이벤트
	 */
	function ok(){
		if(curDate){
			input.val(getString(curDate));
			me.close();
			input.trigger("change");
		}else{
            if($("html").attr("lang") == "en") {
                alert("Select Date");
            } else if($("html").attr("lang") == "cn"){
                alert("请选择日期");
            } else {
                alert("날짜를 선택해 주세요.");
            }
		}
	};

	/**
	 * 월 번경
	 */
	function changeMonth(e){
		var btn = $(e.currentTarget);
		switch(btn.attr("title")){
		case "Prev Year":
			month.setFullYear(month.getFullYear() - 1);
			break;
		case "Prev":
			month.setMonth(month.getMonth() - 1);
			break;
		case "Next":
			month.setMonth(month.getMonth() + 1);
			break;
		case "Next Year":
			month.setFullYear(month.getFullYear() + 1);
			break;
		// no default
		}
		drawMonth();
	};

	/**
	 * 달력 그리기
	 */
	function drawMonth(){
		var s = new Date(month.getTime()),
			e = new Date(month.getTime()),
			arr = [],
			str = '',
			ttime = today.getTime(),
			ctime = 0,
			stime = 0,
			etime = 4102412400000,
			bf, af, dt, dtime, d, r, i, len, cls, txt, num;
		if(range){
			stime = range.start;
			etime = range.end;
		}
		if(curDate){
			ctime = curDate.getTime();
		}

		s.setDate(1);
		e.setMonth(e.getMonth() + 1, 0);
		bf = s.getDay();
		af = 6 - e.getDay();

		// prepare array
		for(i=0; i<bf; i++){
			arr.push(0);
		}
		len = e.getDate();
		for(i=1; i<=len; i++){
			arr.push(i);
		}
		for(i=0; i<af; i++){
			arr.push(0);
		}

		// make table
		ttime = today.getTime();
		dt = new Date(s.getTime());
		len = arr.length;
		for(i=0; i<len; i++){
			d = arr[i];
			r = i % 7;

			if(r == 0){ str += '<tr>'; }

			cls = '';
			if(r == 0 || r == 6){
				// 주말
				cls += 'ui-datepicker-week-end ';
			}
			if(d == 0){
				// 전월/익월 공백
				cls += 'ui-datepicker-other-month ui-datepicker-unselectable ui-state-disabled ';
				txt = '&nbsp;';
				num - "";
			}else{
				// 이번달
				dtime = dt.getTime();

				if(dtime >= stime && dtime <= etime){
					// 선택 가능
					txt = '<a class="ui-state-default" tabindex="0">' + d + '</a>';
				}else{
					// 선택 불가
					txt = d;
					cls += 'ui-datepicker-unselectable ui-state-disabled ';
				}
				// 오늘
				if(dtime == ttime){
					cls += 'ui-datepicker-today ';
				}
				if(dtime == ctime){
					cls += 'ui-datepicker-current-day ';
				}

				num = dt.getTime();
				dt.setDate(dt.getDate() + 1);
			}
			str += '<td class="' + cls + '" style="padding:0 !important;width:14.28%;" data-date="' + num + '">' + txt + '</td>';

			if(r == 6){ str += '</tr>'; }
		}
		tbody.empty();
		tbody.append(str);
		tbody.find("a").bind("click.datepicker keyup.datepicker", selectDate);

		d = s.getMonth() + 1;
        
        if($("html").attr("lang") == "en"){
            title.html('<div class="ui-datepicker-title"><span class="ui-datepicker-month">'+ (d < 10 ? '0'+d : d) +'</span>.<span class="ui-datepicker-year">'+ s.getFullYear() +'</span></div>');
        } else {
            title.html('<div class="ui-datepicker-title"><span class="ui-datepicker-year">'+ s.getFullYear() +'</span>.<span class="ui-datepicker-month">'+ (d < 10 ? '0'+d : d) +'</span></div>');
        }
		

		me.popup.find(".datepicker_gui").scrollTop(0);
	};

	/**
	 * 날짜 선택
	 */
	function selectDate(e){
		if(e.type == "keyup" && e.keyCode != 13){ return; }

		var a = $(e.currentTarget),
			td = a.parent(),
			date = td.data("date"),
			ctime = 0;
		if(curDate){
			ctime = curDate.getTime();
		}
		if(ctime == date){
			return;
		}

		var fn = input.data("validate");
		if(typeof(fn) == "string"){
			fn = window[fn];
		}
		if(typeof(fn) == "function"){
			var rtn = fn(date);
			if(rtn === false){
				return false;
			}
		}

		if(curDate){
			curDate.setTime(date);
		}else{
			curDate = new Date(date);
		}
		tbody.find("td.ui-datepicker-current-day").removeClass("ui-datepicker-current-day");
		td.addClass("ui-datepicker-current-day");

		// 날짜 선택 이벤트 발생 - 개발 요청
		//me.popup.get(0).dispatchEvent( (new CustomEvent("changedate", { detail : {date : curDate} })) );
		//me.popup.find(".datepicker_gui").get(0).dispatchEvent( (new CustomEvent("changedate", { detail : {date : curDate}, bubbles: true })) );
		$(e.currentTarget).closest(".datepicker_gui").get(0).dispatchEvent( (new CustomEvent("changedate", { detail : {date : curDate}, bubbles: true })) );
	};
	init();
	return me;
};

$(function(){
	$(".calenInp:not(.timeInp)").each(function(idx, itm){
		new DatePicker(itm);
	});
});
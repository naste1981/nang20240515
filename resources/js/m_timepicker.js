"use strict";

/**
 * 시간 범위 선택하기 클래스 생성자
 * @param {object}	target	- 초기화할 대상
 */
var TimePicker = function(target){
	if(!(target instanceof jQuery)){
		target = $(target);
	}
	var me = this,
		aniProp = {
			duration : 400,
			easing : "easeInSine",
			complete : aniComplete
		},
		swiper = {},
		$win = $(window),
		input;

	var korean = $("html").attr("lang") == "ko";
    var chinese = $("html").attr("lang") == "zh";
	var template = '<div class="layPop layPopBtm choiceDate dragDownWrapper" tabindex="0">';
		if(korean){
			template += '<h2 class="titLay">시간 선택</h2>';
		}else if(chinese){
			template += '<h2 class="titLay">选择时间</h2>';
		}else{
            template += '<h2 class="titLay">Select Time</h2>';
        }
		template += '<div class="layCont">';
			template += '<div class="lCont" tabindex="0">';
				template += '<div class="dateArea">';
					template += '<div class="dateAreaBlock"></div>';
					template += '<div class="swiper-container timeType">';
					template += '<ul class="swiper-wrapper" title="AM/PM 선택">';
					template += '<li class="swiper-slide"><a tabindex="0">AM</a></li>';
					template += '<li class="swiper-slide"><a tabindex="0">PM</a></li>';
					template += '</ul>';
					template += '</div>';
					template += '<div class="wheelSlider hourSlider">';
					template += '<div class="wsTrack"></div>';
					template += '</div>';
					template += '<div class="wheelSlider minuteSlider">';
					template += '<div class="wsTrack"></div>';
					template += '</div>';
					template += '<div class="wheelBorder"></div>';
				template += '</div>';
			template += '</div>';
		template += '</div>';
		template += '<div class="btnBtm">';
			template += '<div class="btnArea">';
				if(korean){
					template += '<button type="button" class="btnSSG btnM action">확인</button>';
				}else if(chinese){
					template += '<button type="button" class="btnSSG btnM action">确定</button>';
				}else{
					template += '<button type="button" class="btnSSG btnM action">Confirm</button>';
				}
			template += '</div>';
		template += '</div>';
		template += '<button type="button" class="closeL dragDownClose">닫기</button>';
	template += '</div>';

	var hourArray = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
		minuteArray = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"],
		PI = Math.PI / 180,
		RADIUS = 90,
		RATIO = 0.8,//0.7,
		HEIGHT = 25,//28.6,
		DUMMY_H = $('<div class="dummy_h"></div>'),
		DUMMY_M = $('<div class="dummy_m"></div>'),
		currentTop = 0,
		dragDistances = [],
		startTop, startY, diffY, currentTarget, dragDirection, dragTimer,
		hourTop, minuteTop, hourSlide, minuteSlide, currentType;

	setTimeout(() => {
		if(!$(".timeType").length > 0){
			hourArray = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"]
		}
	})
	
	/**
	 * 팝업 열기
	 */
	me.open = function(){
		/*curDate = getDate(input.val());
		month = curDate ? new Date(curDate.getTime()) : new Date(today.getTime());
		month.setDate(1);
		drawPopup();
		drawMonth();*/
		drawPopup();
		setTimeout(setInitialTime, 200);
		//overflow = $("body").css("overflow");
		//$("body").css("overflow", "hidden").addClass("hidePopupDimm");
		//$("body").addClass("hidePopupDimm");
		hidePopupDimm(true);
		var pop = me.popup;
		pop.addClass("on");
		pop.stop(true).css("display", "block").animate({"bottom":"0"}, aniProp);
		pop.focus();
		pop.find(".dateArea").scrollTop(0);
		pop.closest(".layCont").css("z-index", 200);
		pop.closest(".lCont").css("z-index", 200);
	};

	/**
	 * 팝업 닫기
	 */
	me.close = function(){
		var pop = me.popup;
		pop.stop(true).animate({"bottom":"-100%"}, aniProp);
		//me.popup.removeClass("on");
		//$("body").removeClass("hidePopupDimm");
		pop.addClass("closed");
		pop.closest(".layCont").css("z-index", "");
		pop.closest(".lCont").css("z-index", "");
		/*if(typeof(overflow) != "undefined"){
			$("body").css("overflow", overflow);
			overflow = undefined;
		}*/
		//input.focus();
		me.wrapper.focus();
	};

	/**
	 * 시간 선택 영역만 가져가기
	 */
	me.getGUI = function(param){
		var pop = $(template);
		me.popup = pop;

		if(typeof(input) == "undefined"){
			input = $('<input type="tel" />');
		}

		hourSlide = pop.find(".wheelSlider.hourSlider");
		minuteSlide = pop.find(".wheelSlider.minuteSlider");

		initSwipers(param);

		setTimeout(function(){
			swiper.ampm.update();
			setInitialTime(param);
			//swiper.hour.update();
			//swiper.minute.update();
		}, 10);

		me.swiper = swiper;
		me.getTime = function(){
			var a = $(swiper.ampm.slides[swiper.ampm.activeIndex]).find("a").text(),
				b = hourSlide.find(".wsSlide.on .wsCont").text(),//$(swiper.hour.slides[swiper.hour.activeIndex]).find("a").text(),
				c = minuteSlide.find(".wsSlide.on .wsCont").text();//$(swiper.minute.slides[swiper.minute.activeIndex]).find("a").text();
			return (a + " " + b + ":" + c);
		};
		me.setTime = function(str){
			setTimeout(function(){
				setInitialTime({time:str});
			}, 10);
		};
		return pop.find(".dateArea");
	};

	/**
	 * 애니메이션 종료 이벤트
	 */
	function aniComplete(){
		// IE 성능이 쓰레기라 모션이 안보이고 그냥 사라짐
		// IE는 안사라지게 처리
		//if(!IS_IE){
			if(me.popup.hasClass("closed")){
				DUMMY_H.stop(true);
				DUMMY_M.stop(true);
				me.popup.removeClass("on closed");
				//$("body").removeClass("hidePopupDimm");
				hidePopupDimm(false);
				if(!IS_IE){
					me.popup.css("display", "none");
				}
			}
		/*}else{
			if(me.popup.hasClass("closed")){
				DUMMY_H.stop(true);
				DUMMY_M.stop(true);
				me.popup.removeClass("on closed");
				$("body").removeClass("hidePopupDimm");
				//me.popup.css("display", "none");
			}
		}*/
	};

	/**
	 * 클래스 초기화하기
	 */
	function init(){
		$.each(target, function(idx, itm){
			if(idx > 0){ return false; }// 한 개만 초기화

			var wrap = $(itm),
				btn;
			if(wrap.data("initialized") == "Y"){ return; }
			wrap.data("initialized", "Y");

			//input = wrap.find("input[data-id]");
			input = wrap.find(">input");
			btn = wrap.find(".ui-datepicker-trigger");

			if(input.length * btn.length == 0){
				console.warn("Error: TimePicker, 인풋 또는 버튼 객체가 없습니다.");
				return false;
			}

			//getRange(input.data("range"));
			//today = new Date();
			//today.setHours(0, 0, 0, 0);
			me.wrapper = wrap;
			btn.bind("click.timepicker", me.open);
			input.bind("click.timepicker", me.open);
		});
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
		wrap.find(">.dimmed").bind("click.timepicker", me.close);
		pop.find("button.closeL").bind("click.timepicker", me.close);
		pop.find(".btnBtm .btnArea button").bind("click.timepicker", ok);

		setTimeout(initSwipers, 100);
		//initSwipers();

		//initTouchArea(pop);
		initDragDownArea();

		function fnTimeTypeRemove(){
			return new Promise((resolve) => {
				if(pop.find(".wheelSlider.hourSlider").length > 0){
					pop.addClass("exitTime");
					pop.find(".timeType").remove();
				}
				resolve();
			})
		}

		function fnTimeTypeSet(){
			if(!$(".timeType").length > 0){
				hourArray = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"]
			} else{
				hourArray = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
			}
		}

		fnTimeTypeRemove().then(() => {
			setTimeout(fnTimeTypeSet, 50);
		})
	};

	function rotateSlide(type){
		if(typeof(type) == "undefined"){ return; }
		var s, c, a, t;
		if(type == "h"){
			s = hourSlide;
			a = hourArray;
			t = hourTop;
		}else{
			s = minuteSlide;
			a = minuteArray;
			t = minuteTop;
		}
		c = a.length;

		var ang, ang2, rad, sin, div, n, dsp;
		s.find(".wsSlide").each(function(idx, itm){
			ang = (20 * idx) + (t * RATIO);
			ang2 = ((ang % 360) + 360) % 360;
			rad = ang * PI;
			sin = Math.sin(rad) * RADIUS;
			div = $(itm);
			if(ang2 <= 10 || ang2 >= 350){
				div.addClass("on");
				n = ((Math.round(-ang / 20) % c) + c + idx ) % c;
				fillSlideText(div, n, type);
			}else{
				div.removeClass("on");
			}
			if(ang2 <= 80 || ang2 >= 280){
				dsp = "block";
			}else{
				dsp = "none";
			}
			div.css({
				"display" : dsp,
				"top" : sin,
				"transform" : "rotateX("+ang+"deg)"
			});
		});
	};

	function fillSlideText(div, n, type){
		var sub = div.find(".wsCont"),
			idx = div.index(),
			divs = div.parent().find(".wsSlide"),
			len = divs.length,
			x, y, a, c;

		if(type == "h"){
			a = hourArray;
		}else{
			a = minuteArray;
		}
		c = a.length;
		sub.text(a[n]);

		for(var i=1; i<=3; i++){
			x = (idx + i + len) % len;
			y = (n + i + c) % c;
			divs.eq(x).find(".wsCont").text(a[y]);

			x = (idx - i + len) % len;
			y = (n - i + c) % c;
			divs.eq(x).find(".wsCont").text(a[y]);
		}
	};

	var oldY, moved;
	function slideDragStart($e){
		//DUMMY_H.stop(true);
		var e = $e.originalEvent;
		e.preventDefault();
		//currentSlide = $(e.currentTarget).closest(".wheelSlider");
		//currentArray = currentSlide.data("array");
		//arrayCount = currentArray.length;
		//currentTop = currentSlide.data("top");
		//startY = e.touches[0].screenY;
		//startTop = currentTop;
		moved = false;
		var s = $(e.currentTarget).closest(".wheelSlider");
		if(s.hasClass("hourSlider")){
			DUMMY_H.stop(true);
			currentType = "h";
			currentTop = hourTop;
			startTop = hourTop;
		}else{
			DUMMY_M.stop(true);
			currentType = "m";
			currentTop = minuteTop;
			startTop = minuteTop;
		}
		startY = e.touches[0].screenY;
		oldY = startY;

		var tg = $(e.target);
		if(tg.hasClass("wsCont")){
			currentTarget = tg;
		}else if(tg.hasClass("wsSlide")){
			currentTarget = tg.find(".wsCont");
		}

		dragDistances.length = 0;
		dragDirection = 0;
		$win.on("touchmove.timepicker", slideDragMove);
		$win.on("touchend.timepicker", slideDragEnd);
	};

	function slideDragMove($e){
		var e = $e.originalEvent,
			y = e.touches[0].screenY;
		diffY = y - startY;

		if(!moved && Math.abs(diffY) > 4){
			moved = true;
		}

		if(!moved){ return }

		currentTop = startTop + diffY;
		if(currentType == "h"){
			hourTop = currentTop;
		}else{
			minuteTop = currentTop;
		}
		rotateSlide(currentType);
		clearTimeout(dragTimer);
		var dir = 0,
			dif = y - oldY;
		oldY = y;
		if(dif < 0){
			dir = -1;
		}else if(dif > 0){
			dir = 1;
		}
		if(dragDirection != dir){
			dragDistances.length = 0;
		}
		dragDirection = dir;
		dragDistances.unshift({
			y : diffY,
			t : (new Date()).getTime()
		});
		if(dragDistances.length > 5){
			dragDistances.length = 5;
		}
		dragTimer = setTimeout(slideDragReset, 200);
	};

	function slideDragEnd($e){
		var e = $e.originalEvent;
		$win.off("touchmove.timepicker", slideDragMove);
		$win.off("touchend.timepicker", slideDragEnd);
		//currentSlide.data("top", currentTop);
		if(currentType == "h"){
			hourTop = currentTop;
		}else{
			minuteTop = currentTop;
		}
		clearTimeout(dragTimer);

		var len = dragDistances.length,
			mul = 0,
			ave = 0,
			abs = 0,
			dur, y, d1, d2, dy, dt;

		if(len > 1){
			d2 = dragDistances[0];
			d1 = dragDistances[len - 1];
			dy = d2.y - d1.y;
			dt = d2.t - d1.t;
			ave = dy / dt * 100;
			abs = Math.abs(ave);
			if(abs < 5){
				mul = 1;
			}else if(abs < 20){
				mul = 2;
			}else if(abs < 30){
				mul = 3;
			}else if(abs < 50){
				mul = 4;
			}else{
				mul = 5;
			}
			dur = mul * 100;
			y = Math.round((currentTop + mul * ave) / HEIGHT) * HEIGHT;
		/*}else if(len == 1){
			y = Math.round(currentTop / HEIGHT) * HEIGHT;
			dur = 100;*/
		}else{
			y = Math.round(currentTop / HEIGHT) * HEIGHT;
			dur = 100;
		}

		if(len == 0){
			currentTarget.trigger("click.timepicker");
		}else{
			slideAnimate(y, dur, currentType);
		}

		/*if(dur > 0){
			DUMMY_H.stop(true);
			DUMMY_H.css("left", currentTop);
			DUMMY_H.animate({
				"left": y
			},{
				"duration": dur,
				"easing": "easeOutQuad",
				"progress": slideProgress
			});
		}*/
	};

	function slideAnimate(y, dur, type){
		//dur = 2000;
		///////////////////////
		var dummy, t;
		if(type == "h"){
			dummy = DUMMY_H;
			t = hourTop;
		}else{
			dummy = DUMMY_M;
			t = minuteTop;
		}

		if(dur > 0){
			dummy.stop(true);
			dummy.css("left", t);
			dummy.animate({
				"left": y
			},{
				"duration": dur,
				"easing": "easeOutCirc",//"easeOutQuad",
				"progress": slideProgress
			});
		}
	};

	function slideDragReset(){
		dragDirection = 0;
		dragDistances.length = 0;
	};

	function slideProgress(t, p){
		var type = (t.elem.className == "dummy_h") ? "h" : "m";
		if(type == "h"){
			hourTop = parseInt(DUMMY_H.css("left"), 10);
		}else{
			minuteTop = parseInt(DUMMY_M.css("left"), 10);
		}
		//currentSlide.data("top", currentTop);
		rotateSlide(type);
	};

	function slideClick($e){
		var itm = $($e.currentTarget),
			itx = itm.text(),
			crs = itm.closest(".wheelSlider"),
			ctx = crs.find(".wsSlide.on .wsCont").text(),
			idx, cdx, dif, len, dur, y, type, a, t;

		type = crs.hasClass("hourSlider") ? "h" : "m";
		if(type == "h"){
			a = hourArray;
			t = hourTop;
		}else{
			a = minuteArray;
			t = minuteTop;
		}
		idx = a.indexOf(itx);
		cdx = a.indexOf(ctx);
		dif = cdx - idx;
		len = a.length;

		if(idx == cdx){ return false; }

		if(dif > 5){
			dif = dif - len;
		}else if(dif < -5){
			dif = dif + len;
		}
		y = t + dif * HEIGHT;
		y = Math.round(y / HEIGHT) * HEIGHT;
		dur = 50 + Math.abs(dif) * 80;
		slideAnimate(y, dur, type);
	};

	function initSwipers(param){
		var min = input.data("minute");
		if(typeof(param) != "undefined"){
			min = param.minute;
		}
		if(min === "1" || min === 1){
			//var ul = me.popup.find(".swiper-container.timeMinute ul.swiper-wrapper"),
			//	str = '';
			//ul.empty();

			minuteArray.length = 0;
			for(var i=0; i<60; i++){
				//str += '<li class="swiper-slide"><a tabindex="0">' + getTwoDigit(i) + '</a></li>';
				if(i % 5 == 0){
					minuteArray.push(getTwoDigit(i));
				}
			}
			//ul.append(str);
		}

		var pop = me.popup,
			curDate = ("" + input.val()).toUpperCase(),
			param;//, arr, idx, h, m;

		pop.find(".wheelSlider").on("touchstart.timepicker", slideDragStart);
		pop.find(".dateAreaBlock").on("touchstart.timepicker", function(e){
			e.preventDefault();
		});

		var str = '';
		for(var i=0; i<18; i++){
			//str += '<div class="wsSlide"><div class="wsCont" idx='+(i+1)+'></div></div>';
			str += '<div class="wsSlide"><div class="wsCont"></div></div>';
		}
		pop.find(".wheelSlider .wsTrack").append(str);
		pop.find(".wheelSlider .wsCont").on("click.timepicker", slideClick);

		/*param = {
			loop: true,
			direction: 'vertical',
			//loopAdditionalSlides : 12,
			slidesPerView : 5,
			centeredSlides : true,
			slideToClickedSlide : true
		};
		try{
			arr = curDate.replace(/(A|P)M[ ]{0,1}/g, "").split(":");
			h = parseInt(arr[0], 10);
			if(! isNaN(h)){
				if(h == 0){
					h = 11;
				}else if(h > 0){
					h--;
				}
				if(h >= 0 && h <= 12){
					param.initialSlide = h;
				}
			}
		}catch(e){}
		swiper.hour = new Swiper(pop.find('.swiper-container.timeHour'), param);*/

		/*param = {
			loop: true,
			direction: 'vertical',
			//loopAdditionalSlides : 12,
			slidesPerView : 5,
			centeredSlides : true,
			slideToClickedSlide : true
		};
		try{
			arr = curDate.replace(/(A|P)M[ ]{0,1}/g, "").split(":");
			m = parseInt(arr[1], 10);
			if(! isNaN(m)){
				if(min === "1" || min === 1){
					if(m >= 0 && m <= 60){
						param.initialSlide = m;
					}
				}else{
					m = Math.round(m / 5);
					if(m >= 0 && m <= 12){
						param.initialSlide = m;
					}
				}
			}
		}catch(e){}
		swiper.minute = new Swiper(pop.find('.swiper-container.timeMinute'), param);*/

		param = {
			direction: 'vertical',
			slideToClickedSlide : true
		};
		try{
			if(curDate.indexOf("PM") >= 0){
				param.initialSlide = 1;
			}
		}catch(e){}
		swiper.ampm = new Swiper(pop.find('.swiper-container.timeType'), param);
		//swiper.hour.on("transitionEnd", swipeTransitionEnd);
		//swiper.minute.on("transitionEnd", swipeTransitionEnd);
		pop.find(".swiper-slide > a").unbind("keyup.timepicker").bind("keyup.timepicker", selectItem);
	};

	function setInitialTime(param){
		var pop = me.popup,
			curDate = ("" + input.val()).toUpperCase(),
			arr, idx, h, m;

		if(typeof(param) != "undefined" && typeof(param.time) == "string"){
			curDate = param.time.toUpperCase();
			console.log(curDate)
		}

		// ampm
		try{
			if(curDate.indexOf("PM") >= 0){
				swiper.ampm.slideTo(1, 0);
			}else{
				swiper.ampm.slideTo(0, 0);
			}
		}catch(e){}

		// init hour slide
		hourTop = 0;
		if(typeof(hourSlide) == "undefined"){
			hourSlide = pop.find(".wheelSlider.hourSlider");
		}
		//hourSlide.data("array", hourArray);
		//currentArray = hourArray;
		try{
			arr = curDate.replace(/(A|P)M[ ]{0,1}/g, "").split(":");
			h = arr[0];
			idx = hourArray.indexOf(h);
			if(idx >= 0){
				hourTop = -idx * HEIGHT;
			}
		}catch(e){}
		//hourSlide.data("top", hourTop);
		rotateSlide("h");

		// init minute slide
		minuteTop = 0;
		if(typeof(minuteSlide) == "undefined"){
			minuteSlide = pop.find(".wheelSlider.minuteSlider");
		}
		//currentSlide.data("array", minuteArray);
		//currentArray = minuteArray;
		try{
			arr = curDate.replace(/(A|P)M[ ]{0,1}/g, "").split(":");
			m = arr[1];
			idx = minuteArray.indexOf(m);
			if(idx >= 0){
				minuteTop = -idx * HEIGHT;
			}
		}catch(e){}
		//minuteSlide.data("top", minuteTop);
		rotateSlide("m");
	};

	/*function swipeTransitionEnd(){
		var idx = this.activeIndex,
			len = this.slides.length;
		if(idx <= 1){
			this.slideToLoop(this.realIndex, 0);
		}
		if(idx >= len - 2){
			this.slideToLoop(this.realIndex, 0);
		}
	};*/

	/**
	 * 키 업 이벤트
	 */
	function selectItem(e){
		if(e.keyCode != 13){ return; }

		var li = $(e.currentTarget).parent();
		if(li.hasClass("swiper-slide-active")){ return; }

		var c = li.closest(".swiper-container");
		var s;
		if(c.hasClass("timeType")){
			s = swiper.ampm;
		}/*else if(c.hasClass("timeHour")){
			s = swiper.hour;
		}else if(c.hasClass("timeMinute")){
			s = swiper.minute;
		}*/
		if(typeof(s) != undefined){
			var idx;
			if($(s.el).closest(".timeType").length > 0){
				idx = li.index();
				s.slideTo(idx);
			}else{
				idx = li.data("swiperSlideIndex");
				li = $(s.el).find(".swiper-slide:not(.swiper-slide-duplicate)[data-swiper-slide-index=" + idx + "]");
				idx = li.index();
				s.slideTo(idx);
				$(s.el).find(".swiper-slide-active a").focus();
				me.popup.find(".dateArea").scrollTop(0);
			}
		}
	};

	function ok(){
		DUMMY_H.stop(true, true);
		DUMMY_M.stop(true, true);
		var pop = me.popup,
			// a = $(swiper.ampm.slides[swiper.ampm.activeIndex]).find("a").text(),
			b = pop.find(".wheelSlider.hourSlider .wsSlide.on .wsCont").text(),//$(swiper.hour.slides[swiper.hour.activeIndex]).find("a").text(),
			c = pop.find(".wheelSlider.minuteSlider .wsSlide.on .wsCont").text();//$(swiper.minute.slides[swiper.minute.activeIndex]).find("a").text();
		if(pop.find(".timeType").length > 0){
			var a = $(swiper.ampm.slides[swiper.ampm.activeIndex]).find("a").text();
			input.val(a + " " + b + ":" + c);
		} else{
			input.val(b + ":" + c);
		}
		me.close();
		input.trigger("change");
	};
	init();
	return me;
};

$(function(){
	$(".calenInp.timeInp").each(function(idx, itm){
		new TimePicker(itm);
	});
});
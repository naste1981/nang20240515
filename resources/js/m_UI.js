"use strict";

var m_uiLoaded = true;

if(location.search.indexOf("DEV_MODE=Y") >= 0){
	localStorage.setItem("DEV_MODE", "Y");
}
var DEV_MODE = (localStorage.getItem("DEV_MODE") == "Y");
if(location.search.indexOf("APP_MODE=Y") >= 0){
	localStorage.setItem("APP_MODE", "Y");
}
var APP_MODE = (localStorage.getItem("APP_MODE") == "Y");
var IS_IE = (navigator.userAgent.indexOf("MSIE") >= 0 || typeof(window.document.documentMode) == "number");
var IS_IOS = false;

window.trace = function(){};
if(DEV_MODE){
	window.trace = function(){
		var pop = $("#tracer");
		if(pop.length == 0){
			var tmp = '<div id="tracer" style="position:fixed;bottom:0;right:0;width:200px;height:100px;padding:5px;border:1px solid grey;border-radius:5px;background-color:rgba(255,255,255,0.6);z-index:99999;">';
				tmp += '<div style="height:100%;overflow:auto;font-size:12px;line-height:15px;"></div>';
			tmp += '</div>';
			pop = $(tmp);
			$("body").append(pop);
		}
		var div = pop.find("div"),
			arr = Array.from(arguments);
		div.prepend('<span style="display:block;margin-top:2px;border-top:1px dashed #ccc;padding:2px;padding-bottom:0;color:black;">' + JSON.stringify(arr) + '</span>');
		var spans = div.find("span");
		if(spans.length > 20){
			spans.last().remove();
		}
	}
};
if(APP_MODE){
	if(typeof(overpass) == "undefined"){
		window.overpass = {
				global : {
					isApp : true
				}
		};
	}else{
		overpass.global.isApp = true;
	}
	if(typeof(fnAppScheme) == "undefined"){
		window.fnAppScheme = function(obj){
			if(DEV_MODE){
				trace("APP SCHEME: ", obj);
			}else{
				console.log("APP SCHEME: ", obj);
			}
		}
	}
	if(DEV_MODE){
		$("#header").remove();
	}
}

function chkEnvironment(){
	const html = document.querySelector("html");
	html.classList.add("MO");

	const domain = window.location.hostname;
  
	// 모드 구분을 위한 키워드 배열
	const devKeywords = ['dev-', 'dev'];
	const stgKeywords = ['stg-', 'stg'];
	const ssgdfsKeywords = ['ssgdfs.com', 'www.ssgdfs.com'];
  
	// 개발 모드 체크
	function isDevMode(){
		for(let keyword of devKeywords){
			if(domain.startsWith(keyword)){
				return true;
			}
		}
		return false;
	}
  
	// 스테이징 모드 체크
	function isStgMode(){
		for(let keyword of stgKeywords){
			if(domain.startsWith(keyword)){
				return true;
			}
		}
		return false;
	}

	// 실서버 모드 체크
	function isRealMode(){
		for(let keyword of ssgdfsKeywords){
			if(domain.startsWith(keyword)){
				return true;
			}
		}
		return false;
	}
	
	function addClassToHTML(className){
		const html = document.querySelector("html");
		html.classList.add(className);
	}
  
	if(isDevMode()){
		addClassToHTML("devMode");
		console.log("devMode");
	} else if(isStgMode()){
		addClassToHTML("stgMode");
		console.log("stgMode");
	} else if(isRealMode()){
		addClassToHTML("realMode");
		// console.log("realMode");
	}
}
window.addEventListener('DOMContentLoaded', chkEnvironment);

// 순차적으로 증가하는 숫자 구하기
function getSerialNumber(){
	if(typeof(window.serialNum) == "undefined"){
		window.serialNum = 0;
	}
	return ++window.serialNum;
};

// 숫자 2자리 스트링 만들기
function getTwoDigit(n){
	if(n < 10){
		return "0" + n;
	}
	return "" + n;
};

// 숫자 1자리 스트링 만들기
function getOneDigit(n){
	return "" + n;
}

// iOS 버전 구하기
function checkIOSVersion(){
	var agent = window.navigator.userAgent,
		start = agent.indexOf("OS ");
	if((agent.indexOf("iPhone") > -1 || agent.indexOf("iPad") > -1) && start > -1){
		return window.Number(agent.substr(start + 3, 3).replace("_", "."));
	}
	return 0;
}
IS_IOS = checkIOSVersion() > 10;

// IOS인지 ANDROID인지 구분
if(IS_IOS){
	$("html, body").addClass("IOS");
} else{
	$("html, body").addClass("ANDROID");
}

/* 공통 스크롤 이벤트 */
var GlobalScroll = function(){
	var me = this,
		listeners = [],
		count = 0,
		prevScroll = 0,
		$win = $(window);
	
	if(typeof(GlobalScroll.addListener) == "undefined"){
		GlobalScroll.addListener = function(func){
			listeners.push(func);
			checkListeners();
			scrollEvent();
		};
		GlobalScroll.removeListener = function(func){
			$.each(listeners, function(idx, itm){
				if(itm === func){
					listeners.splice(idx, 1);
					return false;
				}
			});
			checkListeners();
		};
		GlobalScroll.scrollTo = function(t, d){
			if(typeof(d) != "number" || d < 0){
				d = 300;
			}
			$("html, body").stop().animate(
				{ scrollTop: t },
				{ duration : d }
			);
		};
		GlobalScroll.trigger = function(){
			scrollEvent();
		};
	}
	
	function checkListeners(){
		var len = listeners.length;
		if(count > 0 && len == 0){
			// stop
			$win.unbind("scroll.globalScroll");
			$win.unbind("resize.globalScroll orientationchange.globalScroll");
		}else if(count == 0 && len > 0){
			// start
			prevScroll = $win.scrollTop();
			$win.bind("scroll.globalScroll", scrollEvent);
			$win.bind("resize.globalScroll orientationchange.globalScroll", scrollEvent);
		}
		count = len;
	};
	
	function scrollEvent(){
		var scroll = $win.scrollTop(),
			docHeight = getDocHeight(),
			winHeight = window.outerHeight,
			data = {
				maxScroll : Math.ceil(docHeight - winHeight),
				scroll : Math.ceil(scroll),
				delta : scroll - prevScroll,
				winHeight : winHeight,
				docHeight : docHeight
			};
		prevScroll = scroll;
		for(var i=0; i<count; i++){
			listeners[i](data);
		}
	};
	
	function getDocHeight(){
		return (document.scrollingElement ? document.scrollingElement.scrollHeight : $(document).height());
	};
	
	if(window.globalScrollInited !== true){
		window.globalScrollInited = true;
		var intervalCount = 0,
			intervalHeight, intervalID;
		intervalID = setInterval(function(){
			intervalCount++;
			if(typeof(intervalHeight) == "undefined"){
				intervalHeight = getDocHeight();
			}else{
				var h = getDocHeight();
				if(h != intervalHeight){
					try{
						scrollEvent();
					}catch(e){
						console.log(e)
					}
				}
				intervalHeight = h;
				if(intervalCount > 6){
					clearInterval(intervalID);
				}
			}
		}, 1000);
	}
	return me;
};// GlobalScroll

//var serverTime = "2020-10-14 13:07:05";
/* 글로벌 타이머 */
var GlobalClock = function(){
	
	if(typeof(GlobalClock.addListener) == "undefined"){
		GlobalClock.addListener = function(func){
			listeners.push(func);
			checkListeners();
		};
		
		GlobalClock.removeListener = function(func){
			$.each(listeners, function(idx, itm){
				if(itm === func){
					listeners.splice(idx, 1);
					return false;
				}
			});
			checkListeners();
		};
		
		GlobalClock.getDate = function(str){
			var date;
			try{
				str = str.replace(/-/g, "/");
				date = new Date(str);
				if(date == "Invalid Date"){
					date = new Date();
				}
			}catch(e){
				date = new Date();
			}
			return date;
		};
	}// init static function
	
	var me = this,
		listeners = [],
		count = 0,
		timer = -1,
		diff = 0,
		date;
	
	date = GlobalClock.getDate(window.serverTime);
	diff = date.getTime() - (new Date()).getTime();
	
	function checkListeners(){
		var len = listeners.length;
		if(count > 0 && len == 0){
			// stop
			clearInterval(timer);
		}else if(count == 0 && len > 0){
			// start
			timer = setInterval(tick, 100);
		}
		count = len;
		tick();
	};
	
	function tick(){
		var now = new Date();
		now.setMilliseconds(diff)
		for(var i=0; i<count; i++){
			listeners[i](now);
		}
	};
	return me;
};// GlobalClock

/* 폼객체 초기화 */
function initFormText(){
	// 텍스트 에어리어 오토 리사이즈
	var tf, me, offset, h;
	$("textarea").each(function(idx, itm){
		tf = $(itm);
		var mh = $(window).height() - 100;
		tf.unbind("keyup.autoresize").bind("keyup.autoresize", function(e){
			me = $(e.currentTarget);
			offset = parseInt(me.css("padding-top"), 10) + parseInt(me.css("padding-top"), 10);
			if(e.currentTarget.scrollHeight < mh){
				me.height(0);
				h = e.currentTarget.scrollHeight - offset;
				me.height(h);
			}
			if(tf.parent().hasClass("chatingArea")){
				$('.chatBtms .chatMenuList').css('bottom', $('.chatContainer .chatBtms').outerHeight() + 'px');
			}
		});
	});// 텍스트 에어리어 오토 리사이즈
	
	// 텍스트필트 포커스 컨트롤
	$("textarea, input:not([type=radio]):not([type=checkbox]):not([type=file]):not([readonly])").unbind("focus.inpFocusAbs").bind("focus.inpFocusAbs", function(e){
		var txt = $(e.currentTarget),
			wrap = txt.closest(".formTextWrap");
		var pop = $(".layPop:visible").last();
		var sss = pop.find(".lCont").scrollTop();
		$("body").addClass("inpFocusAbs");
		if(typeof(sss) != "undefined"){
			pop.scrollTop(sss);
		}
		if(wrap.length > 0){
			wrap.addClass("on");
		}
		/* 20210607 검색창 포커스 시 스크롤 이동 ios 만 */
		if(IS_IOS && txt.attr("type") == "search"){
			if($(".u1286").length === 0){
				var fixH = $("#fixedWrap").height() || 0;
				var heaH = $("#header").height() || 0
				var navH = $("#header").find("nav").height() || 0
				$("body, html").animate({scrollTop:txt.offset().top - fixH - navH - heaH});
			}
		}
	})

	$("textarea, input:not([type=radio]):not([type=checkbox]):not([type=file]):not([readonly])").unbind("blur.inpFocusAbs").bind("blur.inpFocusAbs", function(e){
		var txt = $(e.currentTarget),
			wrap = txt.closest(".formTextWrap");
		$("body").removeClass("inpFocusAbs");
		if(wrap.length > 0){
			wrap.removeClass("on");
		}
	})// 텍스트필트 포커스 컨트롤

	// 파일명 입력
	$("input[type=file]").unbind("change.filetype").bind("change.filetype", function(e){
		var file = e.currentTarget,
			span = $(file).siblings(".attachFile");
		try{
			span.text(file.files[0].name);
		}catch(e){
			span.text("");
		}
	});// 파일명 입력
	
	// 검색
	$(".frmSearch input").unbind("keyup.formSearch").bind("keyup.formSearch", function(e){
		var tf = $(e.currentTarget),
			txt = tf.val();
		if(txt.length > 0){
			tf.addClass("notEmpty");
		}else{
			tf.removeClass("notEmpty");
		}
	});
	$(".frmSearch input").trigger("keyup.formSearch");
	$(".frmSearch .btIco.icDel").unbind("click.formSearch").bind("click.formSearch", function(e){
		var btn = $(e.currentTarget),
			tf = btn.siblings("input");
		tf.val("").removeClass("notEmpty").focus();
	});// 검색
	
	// 넘버 스텝퍼
	$(".frmNum:not(.disableCommon) .btnCtrl").unbind("click.formnum").bind("click.formnum", function(e){
		var btn = $(e.currentTarget),
			txt = btn.siblings("input[type=number]"),
			num = Number(txt.val()),
			min = Number(txt.attr("min")),
			max = Number(txt.attr("max")),
			step = Number(txt.attr("step"));
		if(isNaN(num)){
			num = 0;
		}
		if(isNaN(min)){
			min = Number.NEGATIVE_INFINITY;
		}
		if(isNaN(max)){
			max = Number.POSITIVE_INFINITY;
		}
		if(isNaN(step)){
			step = 1;
		}
		if(btn.hasClass("btnDecr")){
			num = Math.max((num - step), min);
		}else{
			num = Math.min((num + step), max);
		}
		txt.val(num);
	});
	// 넘버 스텝퍼
};

$(function(){
	function fn100vhCalc(){
		let vh = window.innerHeight * 0.01;
		document.documentElement.style.setProperty('--vh', `${vh}px`);
	
		window.addEventListener('resize', () => {
			let vh = window.innerHeight * 0.01;
			document.documentElement.style.setProperty('--vh', `${vh}px`);
		});
	}
	fn100vhCalc();
})

// 남은시간 타이머
function initTimers(){
	var timers = $(".remainTimer");

	function remainTimer(now){
		var H = 1000 * 60 * 60,
			M = 1000 * 60,
			S = 1000,
			n = now.getTime(),
			c = false,
			o, t, d, h, m, s;
		$.each(timers, function(idx, itm){
			o = $(itm);
			t = o.data("datetime");
			d = t - n;
			if(d <= 0){
				o.text("00:00:00");
				o.addClass("ended");
				c = true;
			}else{
				h = Math.floor(d / H);
				m = Math.floor((d % H) / M);
				s = Math.floor((d % M) / S);
				o.text(getTwoDigit(h) +":"+ getTwoDigit(m) +":"+ getTwoDigit(s));
			}
		});
		if(c){
			timers = $(".remainTimer:not(.ended)");
			if(timers.length == 0){
				GlobalClock.removeListener(remainTimer);
			}
		}
	};// remainTimer

	GlobalClock.removeListener(remainTimer);
	if(timers.length > 0){
		var o, d;
		timers.each(function(idx, itm){
			o = $(itm);
			d = GlobalClock.getDate(o.data("time"));
			o.data("date", d);
			o.data("datetime", d.getTime());
		});
		GlobalClock.addListener(remainTimer);
	}
};// initTimers


// 플립 타이머
function flipTimers(){
	setTimeout(() => {
		function CountdownTracker(label, value){
			var el = document.createElement('div');
			el.className = 'flip-clock__piece';
			el.innerHTML =
				`<div class="flip-clock__card card">
					<div class="card__top"></div>
					<div class="card__bottom"></div>
					<div class="card__back">
						<div class="card__bottom"></div>
					</div>
				</div>`;
			this.el = el;
			var top = el.querySelector('.card__top'),
				bottom = el.querySelector('.card__bottom'),
				back = el.querySelector('.card__back'),
				backBottom = el.querySelector('.card__back .card__bottom');
			this.update = function(val){
				val = ( '0' + val ).slice(-2);
				if(val !== this.currentValue){
					if(this.currentValue >= 0){
						back.setAttribute('data-value', this.currentValue);
						bottom.setAttribute('data-value', this.currentValue);
					}
					this.currentValue = val;
					top.innerText = this.currentValue;
					backBottom.setAttribute('data-value', this.currentValue);
					this.el.classList.remove('flip');
					void this.el.offsetWidth;
					this.el.classList.add('flip');
				}
			}
			this.update(value);
		}
		// Calculation adapted from https://www.sitepoint.com/build-javascript-countdown-timer-no-dependencies/
	
		function getTimeRemaining(endtime){
			var t = Date.parse(endtime) - Date.parse(new Date());
			return{
				'Total': t,
				//  'Days': Math.floor(t / (1000 * 60 * 60 * 24)),
				'Hours': Math.floor((t / (1000 * 60 * 60)) % 24),
				'Minutes': Math.floor((t / 1000 / 60) % 60),
				'Seconds': Math.floor((t / 1000) % 60)
			};
		}
	
		function getTime(){
			var t = new Date();
			return{
				'Total': t,
				'Hours': t.getHours() % 12,
				'Minutes': t.getMinutes(),
				'Seconds': t.getSeconds()
			};
		}
	
		function Clock(countdown,callback){
			countdown = countdown ? new Date(Date.parse(countdown)) : false;
			callback = callback || function(){};
			var updateFn = countdown ? getTimeRemaining : getTime;
			this.el = document.createElement('div');
			this.el.className = 'flip-clock';
			var trackers = {},
				t = updateFn(countdown),
				key, timeinterval;
			for(key in t){
				if(key === 'Total'){
					continue;
				}
				trackers[key] = new CountdownTracker(key, t[key]);
				this.el.appendChild(trackers[key].el);
			}
	
			var i = 0;
			function updateClock(){
				timeinterval = requestAnimationFrame(updateClock);
				// 시간을 지속적으로 업데이트하지 않도록 조절.
				if(i++ % 10){
					return;
				}
				var t = updateFn(countdown);
				if(t.Total < 0){
					cancelAnimationFrame(timeinterval);
					for(key in trackers){
						trackers[key].update( 0 );
					}
					callback();
					return;
				}
				for(key in trackers){
					trackers[key].update(t[key]);
				}
			}
			setTimeout(updateClock,500);
		}
		var timebanner = $(".flip-clock-banner"),
			time = timebanner.data("time"),
			reg = /[-]/gim,
			resultData = time.replace(reg, "/"),
			parseTime = new Date(resultData),
			deadline = new Date(Date.parse(new Date(parseTime)) + 0 * 24 * 60 * 60 * 1000);
	
		var c = new Clock(deadline, function(){
			return;
		});
	
		var clock = new Clock();
		timebanner.append(c.el);
		$(".flip-clock").wrapInner("<div class='flip-unit'></div>");
		if($(".flip-clock").length > 1){
			$(".flip-clock").eq(0).remove();
		}
	},500)
}

function observeLottie(){
	const targetNode = document.getElementById('lottie');
	const config = {attributes: true, childList: false, subtree: false};

	const callback = function(mutationsList){
		for(const mutation of mutationsList){
			if(mutation.type === 'attributes' && mutation.attributeName === 'style'){
				const displayStyle = targetNode.style.display;
				if(displayStyle !== 'none'){
					flipTimers();
				}
			}
		}
	};

	const observer = new MutationObserver(callback);
	observer.observe(targetNode, config);
}

$(document).ready(function(){
	if($(".flip-clock-banner").length > 0){
		flipTimers();
		observeLottie();
	}
})

// 요소를 셔플로 정렬하는 함수
$.fn.shuffle = function(){
	$.each(this.get(), function(index, el){
		let $el = $(el),
			$find = $el.children();
		$find.sort(function(){
			return 0.5 - Math.random();
		});
		$el.empty();
		$find.appendTo($el);
	});
};

// 스크롤 멈춤 감지 함수
$.fn.scrollStopped = function(callback){
	let that = this,
		$this = $(that);
	$this.scroll(function(ev){
		clearTimeout($this.data('scrollTimeout'));
		$this.data('scrollTimeout', setTimeout(callback.bind(that), 250, ev));
	});
};

function initAllAtOnce(pop){
	if(typeof(pop) != "undefined"){

	}else{

	}
	initFormText();
	initTimers();
};

$(function(){
	new GlobalScroll();
	new GlobalClock();
	initAllAtOnce();
});
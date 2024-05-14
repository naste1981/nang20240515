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

/* 헤더 초기화 */
function initHeader(){
	// 헤더 카테고리
	$("#header .titHead > a, #header .titHead .cateWrapL button.close").unbind("click.header").bind("click.header", function(){
		var a = $("#header .titHead > a"),
			aria = a.attr("aria-expanded"),
			body = $("body");
		if(aria === true || aria === "true"){
			a.attr({"aria-expanded":false, "href":"javascript:void(0);"});
			body.removeClass("hidePopupDimm2");
		}else{
			a.attr({"aria-expanded":true, "href":"javascript:void(0);"});
			body.addClass("hidePopupDimm2");
		}
	});
	
	// 서브헤더 카테고리
	$(".cateFixed .cateExtendArea button.btExtend").unbind("click.subCate").bind("click.subCate", function(e){
		var btn = $(e.currentTarget),
			aria = btn.attr("aria-expanded"),
			body = $("body"),
			list = $(".cateFixed .cateExtendArea .extendCateList"),
			$win = $(window);
		list.stop();
		if(aria === true || aria === "true"){
			list.animate({height : 0}, {
				duration : 400,
				easing : "easeInSine",
				complete : function(){
					$(".cateFixed .cateExtendArea button.btExtend").attr("aria-expanded", false);
					hidePopupDimm(false);
				}
			});
		}else{
			btn.attr("aria-expanded", true);
			hidePopupDimm(true);
			list.css("height", 0);
			var h = Math.min(($win.height() - 250), list.find(".cateListE").outerHeight());
			list.animate({height : h});
		}
	});
	$(".cateDimmed").unbind("click.subCate").bind("click.subCate", function(){
		$(".cateFixed .cateExtendArea button.btExtend").trigger("click.subCate");
	});
};// initHeader

/* 독바 초기화 */
function initDockBar(){
	if($("#asideWrap .dockArea").length == 0){ return; }
	
	var body = $("body"),
		$win = $(window),
		dock = $("#asideWrap .dockArea");
	/* 카테고리 초기화 */
	function initDockMenu(){
		var cateBtn = $("#asideWrap .dockArea .dockMenu .naviDraw button.cate"),
			cateWrap = $("#asideWrap .dockArea .dockMenu .naviDraw .cateWrap"),
			timer;
		
		function openCate(){
			clearTimeout(timer);
			cateWrap.css("display", "block");
			dock.addClass("cateOpen");
			setBodyNoScrolling(true);
			timer = setTimeout(function(){
				cateBtn.attr("aria-expanded", true);
				updateSwipe();
			}, 1);
		};
		
		function closeCate(){
			clearTimeout(timer);
			cateBtn.attr("aria-expanded", false);
			dock.removeClass("cateOpen");
			setBodyNoScrolling(false);
			timer = setTimeout(function(){
				cateWrap.css("display", "none");
			}, 401);
		};
		
		// 공식스토어 스와이프 갱신
		function updateSwipe(){
			setTimeout(function(){
				if($(".swiperWrap.swiperDivi.swiperStore:visible").length > 0){
					try{
						$(".swiperWrap.swiperDivi.swiperStore").data("swiper").update();
					}catch(e){}
				}
			}, 1);
		};
		
		// 아코디언 자식 높이 구하기
		function getContentHeight(div){
			var h = 0,
				d4 = div.hasClass("dep4List"),
				c, t, b, p;
			div.children().each(function(idx, itm){
				if(d4 && ((idx % 2) != 0)){ return true; }
				c = $(itm);
				t = parseInt(c.css("margin-top"), 10);
				b = parseInt(c.css("margin-bottom"), 10);
				if(isNaN(t)){
					t = 0;
				}
				if(isNaN(b)){
					b = 0;
				}
				h += c.outerHeight() + t + b;
			});
			p = parseInt(div.data("padding"), 10);
			if(!isNaN(p)){
				h += p;
			}
			return h;
		};
		
		// 애니메이션 시 상위 아코디언 크기 조정
		function accordProgress(){
			var div = $(this),
				d3, d2;
			if(div.hasClass("dep4List")){
				d3 = div.closest(".dep3List");
				d3.height(getContentHeight(d3));
			}
			if(div.hasClass("dep3List") || div.hasClass("dep4List")){
				d2 = div.closest(".dep2Area");
				d2.height(getContentHeight(d2));
			}
		};
		
		$("#asideWrap .dockArea .dockMenu .naviDraw button.cate").unbind("click.dockbar").bind("click.dockbar", openCate);
		$("#asideWrap .dockArea .dockMenu .naviDraw .cateWrap button.cateClose").unbind("click.dockbar").bind("click.dockbar", closeCate);
		$("#tabScript a[aria-controls=tabCategory]").unbind("click.dockbar").bind("click.dockbar", updateSwipe);
		$(".asideWrap .dockArea .dockMenu .cateWrap .cateScroll a[aria-expanded]").each(function(idx, itm){
			var btn = $(itm),
				div = btn.next(),
				pad;
			btn.attr("aria-expanded", false);
			
			// 패딩 초기화
			pad = parseInt(div.css("padding-bottom"), 10);
			if(isNaN(pad)){
				pad = 0;
			}
			if(pad > 0){
				div.data("padding", pad);
			}
			div.css({
				display : "block",
				height : 0,
				paddingBottom : 0,
				overflow : "hidden"
			});
		});
		$(".asideWrap .dockArea .dockMenu .cateWrap .cateScroll a[aria-expanded]").unbind("click.dockbar").bind("click.dockbar", function(e){
			var btn = $(e.currentTarget),
				aria = btn.attr("aria-expanded"),
				div = btn.next(),
				li, p;
			div.stop();
			if(aria === true || aria === "true"){
				btn.attr("aria-expanded", false);
				div.animate({
					height : 0
				},{
					duration:300,
					progress:accordProgress,
					complete:accordProgress
				});
			}else{
				btn.attr("aria-expanded", true);
				li = btn.parent();
				div.animate({
					height : getContentHeight(div)
				},{
					duration:300,
					progress:accordProgress,
					complete:accordProgress
				});
				li.siblings().find(">a[aria-expanded=true]").each(function(idx, itm){
					var btn = $(itm),
						div = btn.next();
						// 하위 아코디언 모두 닫기
						div.find("a[aria-expanded=true]").each(function(idx, itm){
							var btn = $(itm),
								div = btn.next();
							btn.attr("aria-expanded", false);
							div.stop().css("height", 0);
						});
						btn.trigger("click");
				});
			}
		});
	};
	
	/* 독바 펼침 내비 초기화 */
	function initDockNavi(){
		var navi = $("#asideWrap .dockArea .naviExtend button.navi"),
		close = navi.siblings(".extendArea").find("button.close"),
		touchStartY, touchStartX, moved;
		
		if(body.find(">.dimmed.dockBarDimmed").length == 0){
			body.append('<div class="dimmed dockBarDimmed"></div>');
		}
		
		navi.unbind("click.dockbar").bind("click.dockbar", function(){
			if(navi.attr("aria-expanded") === true || navi.attr("aria-expanded") === "true"){
				navi.attr("aria-expanded", false);
				navi.text("펼치기");
				body.removeClass("dockExpNaviOpened");
			}else{
				navi.attr("aria-expanded", true);
				navi.text("닫기");
				body.addClass("dockExpNaviOpened");
			}
		});
		
		body.find(">.dimmed.dockBarDimmed").unbind("click.dockbar").bind("click.dockbar", closeDockBar);
		close.unbind("click.dockbar").bind("click.dockbar", closeDockBar);
		var ea = $("#asideWrap .dockArea .extendArea");
		if( ! ea.hasClass("dragDownWrapper")){
			ea.addClass("dragDownWrapper");
			close.addClass("dragDownClose");
			initDragDownArea();
			ea.find(".dragDownArea").unbind("click.dockbar").bind("click.dockbar", function(){
				close.trigger("click.dockbar");
			});
		}
		
		/* 독바 닫기 */
		function closeDockBar(){
			if(navi.attr("aria-expanded") === true || navi.attr("aria-expanded") === "true"){
				navi.trigger("click.dockbar");
			}
		};
	}
	
	if($("#asideWrap .dockArea .naviExtend").length > 0){
		initDockNavi();
	}
	if($("#asideWrap .dockArea .dockMenu").length > 0){
		initDockMenu();
	}
};// initDockBar

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

// 라이브커머스
$(function(){
	let wrap = $(".liveWrap"),
		cont = wrap.find(".tabContentWrap"),
		flag = cont.find(".flag"),
		liveBannerArea = $(".liveBannerArea"),
		info = liveBannerArea.find(".liveBannerInfo");
	
	// flag의 background-color를 hex값으로 변환해서 반환
	flag.each(function(){
		let color = $(this).css("background-color"),
			cont = $(this).closest(".cont, .swiper-slide");
		color = rgb2hex(color);
		cont.find(".dataInfo > span").css({"opacity":"1"});

		if(color == "#00979f"){
			cont.addClass("preview").find(".favoNum.like, .viewNum").remove();
		}

		function rgb2hex(rgb){
			if(rgb.search("rgb") == -1){
				return rgb;
			} else{rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
			function hex(x){
				return("0" + parseInt(x).toString(16)).slice(-2);
			} return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
		}}
	})

	info.each(function(){
		if($(this).find(".viewNum").length > 0){
			$(this).find(".viewNum").remove();
		}
	})

	//onair 아이콘
	if($(".liveWrap.i20230110").length > 0){
		const onairIcon = bodymovin.loadAnimation({
			container : $(".onair")[0],
			path : 'https://img.ssgdfs.com/online_upload/animation/mo/ico_onair.json',
			renderer : 'svg',
			loop : true,
			autoplay : true
		})
	}

	// 방송 알림 아이콘
	const btnLiveAlarm = $(".btnLiveAlarm");
	if(btnLiveAlarm.length > 0){
		btnLiveAlarm.each(function(){
			const closestCont = $(this).closest(".cont");
			closestCont.find(".timeCont").css("top", "-24px");
		});
	}
})

// 라이브커머스 채팅 페이지
function funcLiveChat(){
	// 라이브커머스 채팅 페이지 뷰포트 고정
	function fixViewport(){
		let viewportParams2 = "width=device-width, initial-scale=1.0, user-scalable=no";
		let metaViewport = document.querySelector("meta[name=viewport]");
		let width = $(window).width();
		let height = $(window).height();
		let viewportParams = "width=" + width + ", height=" + height + viewportParams2;
		metaViewport.setAttribute("content", viewportParams);
	}

	function liveChatSubmit(){
		$(document).off("focus","#sendChatMessage").on("focus","#sendChatMessage",function(e){
			var txt = $(e.currentTarget),
				wrap = txt.closest(".formTextWrap");
			if(wrap.length > 0){
				wrap.addClass("on");
			}
		})
	
		$(document).off("blur","#sendChatMessage").on("blur","#sendChatMessage",function(e){
			var txt = $(e.currentTarget),
				wrap = txt.closest(".formTextWrap");
			$("body").removeClass("inpFocusAbs");
			if(wrap.length > 0){
				wrap.removeClass("on");
			}
		})
	}

	// 라이브커머스 채팅 페이지 화면 브라우저 꽉 차도록
	function height100vhCalc(){
		// 라이브커머스 모바일 브라우저 100vh 버그 개선
		let vh = window.innerHeight * 0.01;
		document.documentElement.style.setProperty('--vh', `${vh}px`);
	}
	if($(".liveChatWrap").length){
		let liveChatWrap = $(".liveChatWrap"),
			header = liveChatWrap.find(".header.imp"),
			sendChatMessage = liveChatWrap.find("#sendChatMessage"),
			sendChatBtn = liveChatWrap.find("#sendChatBtn"),
			chatWriteArea = liveChatWrap.find(".chatingArea.formTextWrap"),
			btFloating = $(".btFloating"),
			airBgArea = liveChatWrap.find(".airBgArea"),
			airBtmArea = liveChatWrap.find(".airBtmArea"),
			videoPlayButton = airBgArea.find(".liveVideoArea.videoPlayButton"),
			flag = liveChatWrap.find(".airInfoArea .flag");
	
		// vod 다시보기
		if(videoPlayButton.hasClass("videoArea") == false){
			videoPlayButton.addClass("videoArea");
		}
		
		//채팅화면 swiper 제거
		$(".liveChatWrap").find(".swiperWrap").removeClass("swiperWrap");
	
		btFloating.hide();
	
		sendChatMessage.on("click",function(){
			$("body").addClass("inpFocusAbs");
			$("#chatWriteArea").addClass("on"); 
			liveChatSubmit();
			btFloating.hide();
		})
	
		liveChatWrap.on("keyup",function(event){
			if(event.keyCode == 13){
				$("body").removeClass("inpFocusAbs");
				$("#chatWriteArea").removeClass("on");    
				$('#sendChatMessage').blur();
				liveChatSubmit();
				btFloating.hide();              
			}
		})
	
		sendChatBtn.on("click",function(){
			setTimeout(function(){
				$("body").removeClass("inpFocusAbs");
				$("#chatWriteArea").removeClass("on");
				$('#sendChatMessage').blur();
				liveChatSubmit();
				btFloating.hide();
			},10)
		})

		if(airBtmArea.length > 0){
			const liveFootBtnWrap = airBtmArea.find(".liveFootBtnWrap");
			const chatBtnWrap = airBtmArea.find(".chatBtnWrap");
			
			if(chatBtnWrap.children().length == 1){
				liveFootBtnWrap.css({"right":"60px"});
			} else if(chatBtnWrap.children().length == 2){
				liveFootBtnWrap.css({"right":"100px"});
			} else if(chatBtnWrap.children().length == 3){
				liveFootBtnWrap.css({"right":"140px"});
			}
		}

		// flag의 text가 VOD이면
		if(flag.text() == "VOD"){
			liveChatWrap.find(".airChatArea").addClass("vod");
		}

		// 앱에서 화면 로드 후 dockbar 가 사라지면서 화면 하단 여백이 발생하므로 시간 차를 두고 높이값 반환 함수를 재실행
		//fixViewport();
		height100vhCalc();
		liveChatSubmit();
		header.removeClass("imp");

		// iOS, Aos check
		function androidChk(){
			let IorA = navigator.userAgent.toLowerCase();
			if(IorA.indexOf("android") !== -1){
				fixViewport();
			}
		}
		function iosChk(){
			let IorA = navigator.userAgent.toLowerCase();
			if(IorA.indexOf("iphone") !== -1){
				window.addEventListener("resize", () => {
					let vh = window.innerHeight * 0.01;
					document.documentElement.style.setProperty("--vh", `${vh}px`);
				});
			}
		}
		androidChk();
		iosChk();
		
		let chkViewportHeight = setInterval(function(){
			height100vhCalc();
			liveChatSubmit();
			header.removeClass("imp");
		}, 500)
		setTimeout(function(){
			clearInterval(chkViewportHeight)
			chatWriteArea.css({"pointer-events":"auto"});
		}, 3500)
	}
}

// 좋아요(하트) 버튼 및 애니메이션
function liveChatLike(){
	const btHeart = document.querySelector(".airBtmArea .chkFavo.heart");
	if(btHeart){
		btHeart.addEventListener("click", function(){
			const aniDiv = document.createElement("div");
			aniDiv.classList.add("ani");
			document.querySelector(".airBtmArea .chatBtnWrap").appendChild(aniDiv);
	
			// 애니메이션 재생
			const animation = lottie.loadAnimation({
				container: aniDiv, 
				renderer: "svg",
				loop: false,
				autoplay: true,
				path: "https://img.ssgdfs.com/online_upload/animation/mo/heartAni.json"
			});
	
			// 애니메이션 재생이 완료될 때까지 기다리는 Promise 생성
			const animationPromise = new Promise((resolve, reject) => {
				animation.addEventListener("complete", () => {
					resolve();
				});
			});
	
			// Promise가 완료되면 .ani div 요소 제거
			animationPromise.then(() => {
				aniDiv.remove();
				// 애니메이션을 처음 상태로 돌리기
				animation.goToAndStop(0, true);
			});
	
			// 만약 btHeart에 on 클래스가 없다면 추가
			if(!btHeart.classList.contains("on")){
				btHeart.classList.add("on");
			}
		});
	}
}

// 라이브 채팅 화면에서 빈 영역 터치시 UI Show/Hide
function liveChatFnUiShowHide(){
	$(document).on("click","#btnUiShowHide",function(){
		let chatWrap = $(this).closest(".liveChatWrap"),
			hideElem = chatWrap.find("#chatArea, #chatWriteArea, .airBtmArea .prodThumArea, .airBtmArea .liveMore, .chatViewBtn");
		
		if(chatWrap.hasClass("ui-hidden")){
			chatWrap.removeClass("ui-hidden");
			hideElem.show();
		} else{
			chatWrap.addClass("ui-hidden");
			hideElem.hide();
		}

		if($("#chatArea").css("display") == "block"){
			$("#chatAreaCont").scrollTop($("#chatAreaCont")[0].scrollHeight);
		}
	});
}

// 라이브 방송 알림 팝업 애니메이션
function liveCmsNoticePopAni(){
	//알림설정 팝업
	const liveAlertAni = $(".liveAlertAni");
	liveAlertAni.empty();

	const liveAlertBellAction = bodymovin.loadAnimation({
		container : $(".liveAlertAni.bellAction")[0],
		path : 'https://img.ssgdfs.com/online_upload/animation/mo/liveAlertBellAction.json',
		renderer : 'svg',
		loop : true,
		autoplay : true
	})

	//알림설정 완료
	const liveAlert = bodymovin.loadAnimation({
		container : $(".liveAlertAni.bell")[0],
		path : 'https://img.ssgdfs.com/online_upload/animation/mo/liveAlertBell.json',
		renderer : 'svg',
		loop : true,
		autoplay : true
	})
	const liveAlertConfetti = bodymovin.loadAnimation({
		container : $(".liveAlertAni.confetti")[0],
		path : 'https://img.ssgdfs.com/online_upload/animation/mo/liveAlertConfetti.json',
		renderer : 'svg',
		loop : true,
		autoplay : true
	})
}

/* 공통 스크롤 이벤트 */
function initScrollEvt(){
	var aside = $("#asideWrap"),
		btn = $("#asideWrap .btTop"),
		head = $("#header"),
		bann = $(".marketingBanner"),
		body = $("body"),
		h = $("#header").outerHeight(),
		type1 = head.hasClass("actionHd"),
		type2 = head.hasClass("actionHdType02"),
		hasDock = $("#asideWrap .dockArea").length > 0,
		fixer = {
			top : {
				target : null,
				enable : false
			},
			btm : {
				target : null,
				enable : false
			}
		},
		fth = 440,
		ft;
	if(typeof(h) == "undefined"){
		h = 104;
	}
	if(head.length == 0){
		h = 0;
	}
	btn.attr("onclick", "");
	btn.on("click", function(){
		GlobalScroll.scrollTo(0, 200);
		return false;
	});
	
	if($(".subHeaderFixed").length > 0){
		h += $(".subHeaderFixed").outerHeight();
	}

	$(".fixedWrap:visible").each(function(idx, itm){
		try{
			$(itm).height($(itm).children().outerHeight());	
		}catch(e){}
	});
	// 헤더 아래 고정 영역
	fixer.top.target = $(".fixedWrap:visible");
	fixer.top.enable = fixer.top.target.length > 0;
	// 하단 고정
	fixer.btm.target = $(".fixBottomWrap:visible");
	fixer.btm.enable = fixer.btm.target.length > 0;
		
	function showDock(){
		aside.removeClass("hideDock");
		$(".fixBottomWrap").removeClass("hideDock");
	};
	
	function hideDock(){
		aside.addClass("hideDock");
		$(".fixBottomWrap").addClass("hideDock");
	};
	
	function fnDockBtnAct(){
		if($(".dockArea").length > 0){
			const dockArea = document.querySelector(".dockArea");
			const naviExtend = dockArea ? dockArea.querySelector(".naviExtend") : null;
			if(!naviExtend){
				return;
			}
			const extendArea = naviExtend.querySelector(".extendArea");
			const navi = naviExtend.querySelector(".navi");
			const contArea = extendArea.querySelector(".contArea");
			const btns = contArea.querySelectorAll("a, button");
			btns.forEach(function(btn){
				btn.addEventListener("click", function(){
					setTimeout(() => {
						$("body").removeClass("dockExpNaviOpened");
						showDock();
						navi.setAttribute("aria-expanded", "false").setAttribute("data-navi-button", "true");
					},1)
				})
			})
		}
	}
	fnDockBtnAct();

	GlobalScroll.addListener(function(data){
		var s = data.scroll,
			cnt = 0,
			cft, cftTopTabWrap, cftTopTabArea, cftTopTab, cftTopTabBgW, pft;
		// top btn
		if(s >= h){
			btn.addClass("on");
		}else{
			btn.removeClass("on");
		}
		/* 픽스 버그 수정 */
		var marketingBanner = $('.marketingBanner').height() || 0;
		// header
		if(s >= 50 + marketingBanner){
			head.addClass("headFixed");
			bann.addClass("scroll");
			if(type1){
				head.removeClass("actionHd");
			}
			if(type2){
				head.removeClass("actionHdType02");
			}
		} else{
			head.removeClass("headFixed");
			bann.removeClass("scroll");
			if(type1){
				head.addClass("actionHd");
			}
			if(type2){
				head.addClass("actionHdType02");
			}
		}

		// 헤더 아래 고정 영역
		fixer.top.target = $(".fixedWrap:visible");
		fixer.top.enable = fixer.top.target.length > 0;
		if(fixer.top.enable){
			ft = fixer.top.target;
			const shopArea = $(".shopArea.i2303");
			ft.each(function(){
				cft = $(this);
				if(cft.hasClass("imp topTab")){
					cftTopTabWrap = cft.addClass("imp topTab");
					cftTopTabArea = cft.find(".tabArea");
					cftTopTab = cftTopTabWrap.find(".tabType");
					cftTopTabBgW = cftTopTab.css("background-color") == "rgb(255, 255, 255)";
					if(cftTopTabWrap){
						if(cftTopTabBgW){
							cftTopTabArea.addClass("bdBtm");
						}
					}
				}
				if(cft.closest(".layPop").length > 0){ return true; }
				/* 픽스 버그 수정 */
				$('#header').each(function(){
					if($(this).hasClass('headFixed')){
						h = 56;
					};
					if($(this).hasClass('imp')){
						h = 60;
					};
				});

				if(cft.closest(".shopArea.i2303").length > 0){
					const tabArea = cft.find(".tabArea");
					tabArea.css({"top":0});
					cft.css({"padding-top": "", "height":"auto"});

					if(cft.offset().top <= s){
						cft.addClass("fixed");
						cft.closest(".shopArea.i2303").addClass("fixed");
					} else{
						cft.removeClass("fixed");
						cft.closest(".shopArea.i2303").removeClass("fixed");
					}
				}

				if(cft.hasClass("cateTabModuleFixedWrap") && cft.closest(".promotionType.moduleArea").length > 0){
					const h = 60;
					const hasTopTab = cft.closest(".promotionType").find(".topTab").length > 0;
					const hasMidAncTab = cft.closest(".promotionType").find(".midAncTab").not(".cateTabModuleFixedWrap").length > 0;
					if(hasTopTab || hasMidAncTab){
						const additionalHeight = hasMidAncTab ? 80 : 70;
						if(cft.offset().top <= s + h + additionalHeight){
							cft.addClass("fixed");
							if(hasTopTab && !hasMidAncTab){
								cft.addClass("onlyTopTab");
							} else{
								cft.removeClass("onlyTopTab");
							}
						} else{
							cft.removeClass("fixed");
						}
					} else{
						if(cft.offset().top <= s + h){
							cft.addClass("fixed");
						} else{
							cft.removeClass("fixed");
						}
					}
				} else{
					if(cft.offset().top <= s + h){
						/* 픽스 버그 수정 */
						if(!cft.hasClass('fixed') && !cft.hasClass('rankingCate')){
							if(cft.hasClass('departureEdtListNum')){
								cft.css({'padding-top' : cft.outerHeight()+'px'});
							}else{
								if(cft.hasClass("checkBoxtrue") && $(window).width() < 360){
									if(cft.find(".tabArea").length > 0){
										cft.css({'padding-top' : cft.outerHeight()+'px', height : ''});
									} else{
										cft.css({'padding-top' : '104' + 'px', height : ''});
									}
								} else{
									cft.css({'padding-top' : cft.outerHeight()+'px', height : ''});
								}
							}
						}
	
						/* 20220422 : 이벤트 탭모듈 중단탭 스크롤 위치 버그 수정 */
						/** 
						 * 20230104 : 재수정
						 * 중단탭의 높이값을 80px 고정으로 하기로 결정해 그에 맞는 스크립트를 작성했지만,
						 * 일부 페이지에서 높이값을 디자인 커스터마이징 하는 사례들이 있어 중단탭의 높이값을 체크해 가져오는 방식으로 변경.
						 * 이럴 경우 앵커타겟의 top값에도 영향을 미치기 때문에 앵커타겟의 top값도 동적으로 변경해줘야 함.
						 * 앵커타겟의 top값은 상단 header의 높이값과 중단탭의 높이값을 합한 값의 음수값으로 변경해야 함.
						 * App의 경우에는 header가 네이티브 영역이므로 모바일웹에서만 적용되도록 변경.
						 * App은 최상단 html 태그에 isApp 클래스가 붙어있음.
						*/
						if(cft.hasClass("topTab") || cft.hasClass("midAncTab")){
							cft.closest(".promotionType").addClass("hasStickyTab");
						}
						if(cft.hasClass("midAncTab") && !cft.closest(".cateTabModuleFixedWrap").length > 0){
							const tabH = cft.find(".tabType.anchorType.tabBasic").height();
							const tabTarget = cft.closest(".contents").find(".tabTarget.imp");
							cft.css({'padding-top' : tabH, height : ''});
							if(cft.closest(".rcmd").length > 0 && !cft.closest(".featureFrame").length > 0){
								cft.css({'padding-top' : tabH + 6, height : ''});
							} else if(cft.closest(".featureFrame").length > 0){
								const featureFrameTabH = cft.find(".tabType.anchorType.tabBasic").outerHeight();
								cft.css({'padding-top' : featureFrameTabH, height : ''});
							}
							// 모바일 웹이면서 헤더가 있을 때
							if(!cft.closest(".isApp").length > 0 && cft.closest(".wrapper").find(".header.imp").length > 0){
								const headerH = cft.closest(".wrapper").find(".header.imp").height();
								const hh = headerH + tabH;
								tabTarget.css({"top": -hh});
							}
						}
						
						if(!cft.hasClass('fixed') && cft.closest(".contents").is(".noDepth")){
							cft.css({'padding-top' : "60" + 'px'});
						}
	
						if(cft.closest(".shopArea.i2303").length > 0){
							cft.css({"padding-top": "", "height":"auto"});
						} else{
							cft.addClass("fixed");
						}
	
						if(pft){
							pft.removeClass("fixed");
						}
						cnt++;
					}else{
						cft.removeClass("fixed");
						/* 픽스 버그 수정 */
						if(!cft.hasClass('fixed') && !cft.hasClass('rankingCate')){
							cft.css({'padding-top':'', height:'auto'});
						}
	
						if(!cft.hasClass('fixed') && cft.closest(".contents").is(".noDepth")){
							cft.css({'padding-top':'', height:'auto'});
						}
					}
				}
				pft = cft;
				if(cnt > 0){
					head.addClass("noshade");
				}else{
					head.removeClass("noshade");
				}
			});
		}
		
		// 하단 고정
		fixer.btm.target = $(".fixBottomWrap:visible");
		fixer.btm.enable = fixer.btm.target.length > 0;
		var tolerance = 10;
		if(fixer.btm.enable){
			ft = fixer.btm.target;
			fth = Math.min(fth, ft.height());
			if(ft.is(":visible")){
				if(ft.offset().top + fth > data.scroll + data.winHeight + tolerance){
					body.removeClass("noneFix");
				}else{
					body.addClass("noneFix");
				}
			}
		}
		
		// dock bar
		if(hasDock){
			if(IS_IE && data.delta == 0){
			}else if(data.delta > 0){
				if(data.scroll >= data.maxScroll){
					showDock();
				}else if(data.scroll <= 0){
					showDock();
				}else{
					hideDock();
				}
			}else{
				showDock();
			}
		}
	});
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

/* 탭 에어리어 초기화 */
function initTabAreas(){
	var tabs = $(".tabArea:not(.inited)");
	if(tabs.length == 0){ return; }
	tabs.addClass("inited");
	
	function scrollIntoView(li, noani){
		if(li.length == 0){ return; }
		var ul = li.closest("ul"),
			wrap = li.closest(".tabArea"),
			w = wrap.width(),
			h = w / 2,
			mx = wrap.get(0).scrollWidth - w,
			x = Math.round(li.offset().left - ul.offset().left - h + li.width() / 2);
		if(x < 0){
			x = 0;
		}else if(x > mx){
			x = mx;
		}
		if(noani === true){
			wrap.stop(false).scrollLeft(x);
		}else{
			wrap.stop(false).animate({scrollLeft:x}, 300);
		}
	};
	
	function tabClicked(e){
		var a = $(e.currentTarget),
			li = a.parent(),
			ta = li.closest(".tabArea"),
			href = a.attr("href");
		if(a.hasClass("disabled") || li.hasClass("tabON")){ return false; }
		setTabIndex(li.index(), ta, "click");
		if(href == "#" || href == ""){
			return false;
		}
	};
	
	function setTabIndex(idx, ta, evtType){
		var li = ta.find(">ul>li").eq(idx),
			a = li.find(">a"),
			cl = li.siblings(".tabON"),
			ca = cl.find(">a"),
			targ, arr;
		if(li.hasClass("tabON")){ return false; }
		cl.removeClass("tabON");
		ca.attr("aria-selected", false);
		targ = ca.attr("aria-controls");
		if(targ){
			if(targ.indexOf("|") >= 0){
				arr = targ.split("|");
				$.each(arr, function(idx ,itm){
					$("#"+itm).removeClass("tabON");
				});
			}else{
				$("#"+targ).removeClass("tabON");
			}
		}
		li.addClass("tabON");
		a.attr("aria-selected", true);
		targ = a.attr("aria-controls");
		if(targ){
			if(targ.indexOf("|") >= 0){
				arr = targ.split("|");
				$.each(arr, function(idx ,itm){
					$("#"+itm).addClass("tabON");
					updateSwipers($("#"+itm));
				});
			}else{
				$("#"+targ).addClass("tabON");
				updateSwipers($("#"+targ));
			}
		}
		if(li.closest(".fixedWrap").length > 0){
			try{
				setTimeout(function(){
					var fix = li.closest(".fixedWrap");
					fix.height(fix.children().outerHeight());
				}, 100);
			}catch(e){}
		}
		scrollIntoView(li);
		if(evtType == "click"){
			var ts = ta.data("targetSwiper"),
				sww = $(ts),
				sw = sww.data("swiper");
			if(typeof(sw) != "undefined"){
				if(window.swiperVersion === 276){
					sw.swipeTo(li.index());
				}else{
					sw.slideToLoop(li.index());
				}
			}
		}
		if(!IS_IOS && li.closest(".layPop").length > 0){
			LayerPopup.resize();
		}
	};
	var tab;
	$.each(tabs, function(idx, itm){
		tab = $(itm);
		if(tab.css("position") == "static"){
			tab.css("position", "relative");
		}
		tab.find(">ul>li>a,>ul>li>button").bind("click.TabArea", tabClicked);
		tab.data("setTabIndex", setTabIndex);
		scrollIntoView(tab.find("li.tabON"), true);
	});
};

/* 탭 초기화 */
function initTabBasics(){
	// 탭 콘텐츠
	function tabClicked(e){
		var a = $(e.currentTarget),
			li = a.closest("li"),
			ta = li.closest(".tabBasic"),
			href = a.attr("href");
		var fn = a.data("validate");
		if(typeof(fn) == "function"){
			var rtn = fn(e);
			if(rtn === false){
				return false;
			}
		}
		if(a.hasClass("disabled") || li.hasClass("tabON")){ return false; }
		setTabIndex(li.index(), ta, "click");
		if(href == "#" || href == ""){
			return false;
		}
	};
	
	function setTabIndex(idx, ta, evtType){
		var li = ta.find(">li").eq(idx),
			a = li.find(">a"),
			cl = li.siblings(".tabON"),
			ca = cl.find("a"),
			ta = li.closest(".tabBasic"),
			targ, div;
		if(li.hasClass("tabON")){ return false; }
		cl.removeClass("tabON");
		ca.attr("aria-selected", false);
		targ = ca.attr("aria-controls");
		if(targ){
			$("#"+targ).removeClass("tabON");
			
			var vid = $("#"+targ).find(".videoPlayer.playing");
			if(vid > 0){
				vid.data("instance").stop();
			}
		}
		li.addClass("tabON");
		a.attr("aria-selected", true);
		targ = a.attr("aria-controls");
		if(targ){
			div = $("#"+targ);
			div.addClass("tabON");
			updateSwipers($("#"+targ));
			if(ta.hasClass("tabScrollTop")){
				var offset = $("#header").outerHeight() + ta.outerHeight();
				if($("#header").length == 0){
					offset = ta.outerHeight();
				}
				GlobalScroll.scrollTo(div.offset().top - offset);
			}
			GlobalScroll.trigger();
		}
		if(evtType == "click"){
			var ts = ta.data("targetSwiper"),
			sww = $(ts),
			sw = sww.data("swiper");
			if(typeof(sw) != "undefined"){
				if(window.swiperVersion === 276){
					sw.swipeTo(li.index());
				}else{
					sw.slideToLoop(li.index());
				}
			}
		}
		if(!IS_IOS && li.closest(".layPop").length > 0){
			LayerPopup.resize();
		}
		initTimeTracker();
	};
	
	var tabs = $(".tabBasic:not(.inited)");
	if(tabs.length > 0){
		tabs.addClass("inited");
		var tab, targ;
		$.each(tabs, function(idx, itm){
			tab = $(itm);
			if(tab.hasClass("tabToScroll")){
				initTabScroll(tab);
			}
			if(tab.closest(".tabArea").length > 0){return true;}
			tab.find(">li>a").bind("click.tabcontlist", tabClicked);
			tab.data("setTabIndex", setTabIndex);
		});
	}
	
	function initTabScroll(tab){
		var conts = [],
			skip = false,
			lis = tab.find(">li"),
			a, id, cont, t, s, curTab, li, si;
		tab.find(">li>a").each(function(idx, itm){
			a = $(itm);
			id = a.attr("href");
			cont = $(id);
			a.data("cont", cont);
			conts.push(cont);
			a.bind("click", function(e){
				e.preventDefault();
				skip = true;
				setTimeout(function(){
					skip = false;
				}, 600);
				
				if($(e.currentTarget).data("cont").length > 0){
					t = $(e.currentTarget).data("cont").offset().top;
					$("html, body").stop().animate(
						{ scrollTop: t },
						{ duration : 600 }
					);
				}
			});
		});

		GlobalScroll.addListener(function(data){
			if(skip){ return; }
			id = 0;
			s = data.scroll + 10;
			$.each(conts, function(idx, itm){
				cont = $(itm);
				if(cont.length > 0 && s >= cont.offset().top){
					id = idx;
				}
			});
			if(id != curTab){
				curTab = id;
				li = lis.eq(id);
				si = li.siblings();
				li.addClass("tabON");
				li.find("a").attr("aria-selected", true);
				si.removeClass("tabON");
				si.find("a").attr("aria-selected", false);
			}
		});
	};
};

// 탭 스크롤 초기화
function scrollTabInit(target){
    var $target = $(target);	
    if($target.length > 0){
        $target.animate({
            scrollLeft: 0
        }, 300);
    }
}
function initToggleContents(){
	var tg, targ, btn, cbtn, btns, idx, len;
	
	// 토글 컨텐츠
	$(".toggleContent").each(function(idx, itm){
		tg = $(itm);
		tg.find("button.toggleBt").unbind("click.toggleContent").bind("click.toggleContent", function(e){
			btn = $(e.currentTarget);
			if(btn.next(".toggleBt").length > 0){
				cbtn = btn.next(".toggleBt");
			}else{
				cbtn = btn.siblings(".toggleBt").eq(0);
			}
			if(btn.siblings(".toggleBt").length === 0){
				return;
			}
			btn.attr("aria-selected", false);
			btn.removeClass("on toggleON");
			targ = btn.attr("aria-controls");
			if($(".u1286").length && btn.closest(".u1286").length){
				if(targ && (targ.startsWith("searchKO") || targ.startsWith("searchEN"))){
					$(".u1286 .toggleCont#" + targ).removeClass("toggleON");
				}
			} else{
				if(targ){
					$("#" + targ).removeClass("toggleON");
				}
			}
			cbtn.attr("aria-selected", true);
			cbtn.addClass("on toggleON");
			targ = cbtn.attr("aria-controls");
			if($(".u1286").length && cbtn.closest(".u1286").length){
				if(targ && (targ.startsWith("searchKO") || targ.startsWith("searchEN"))){
					$(".u1286 .toggleCont#" + targ).addClass("toggleON");
				}
			} else{
				if(targ){
					$("#" + targ).addClass("toggleON");
				}
			}
		});
	});
	
	// 상품 리스트 아이콘
	$(".toggle3Cont").each(function(idx, itm){
		tg = $(itm);
		tg.find("button.funcAcct").unbind("click.toggleContent").bind("click.toggleContent", function(e){
			btn = $(e.currentTarget);
			btns = btn.parent().find(".funcAcct");
			len = btns.length;
			idx = (btn.index() + 1) % len;
			btn.attr("aria-selected", false);
			try{
				$("#" + btn.attr("aria-controls")).removeClass("listON");
			}catch(e){}
			btn = btns.eq(idx);
			btn.attr("aria-selected", true);
			try{
				$("#" + btn.attr("aria-controls")).addClass("listON");
			}catch(e){}
			fnFlagStateAdult();
		});
	});
	
	// 토글 클래스
	$(".toggleClassWrap .toggleClassBtn").unbind("click.toggleClass").bind("click.toggleClass", function(e){
		var btn = e.currentTarget,
			$btn = $(btn),
			wrap = $btn.closest(".toggleClassWrap"),
			cls = wrap.data("class"),
			targ = $(wrap.data("target"));
		if(typeof(cls) == "undefined"){
			cls = "on";
		}
		$btn.blur();
		wrap.toggleClass(cls);
		targ.toggleClass(cls);
		if(wrap.hasClass(cls)){
			var sw = wrap.find(".swiperWrap");
			if(sw.length > 0){
				sw.data("swiper").update();
			}
		}
		setTimeout(function(){
			btn.focus({preventScroll:true});
		}, 10);
	});
};

/* 툴팁 초기화 */
function initToolTips(){
	var tips = $(".tipWrap:not(.inited)");
	if(tips.length == 0){ return; }
	tips.addClass("inited");

	var win = $(window),
		tip, btn, cnt, dim, st, tx, wh, lc, pst, ttp;
	tips.each(function(idx, itm){
		tip = $(itm);
		btn = tip.find(".btTip");
		cnt = tip.find(".tipCont");
		dim = tip.find(".dimmed");
		btn.data("cnt", cnt);
		cnt.data("btn", btn);
		btn.bind("click.tooltip", function(e){
			var tip = $(e.currentTarget).closest(".tipWrap");
			if(tip.hasClass("on")){
				tip.removeClass("on");
				$("body").removeClass("extraDimmed");
				var pop = tip.closest(".layPop");
				if(pop.length > 0){
					var sss = pop.scrollTop();
					$("body").removeClass("tooltipShow extraDimmed");
					if(typeof(sss) != "undefined"){
						tip.closest(".lCont").scrollTop(sss);
					}
				}else{
					$("body").removeClass("tooltipShow extraDimmed");
					$('#container').each(function(){
						$(this).css({marginTop:'',paddingTop:''});
					});
				}
			}else{
				$(".tipWrap.on .closeT").trigger("click.tooltip");// 열려있는 툴팁 닫기
				tip.addClass("on");
				pst = tip.closest('.layCont').scrollTop();
				ttp = tip.find(".tipCont").offset().top;
				var pop = tip.closest(".layPop");
				setTimeout(function(){
					if(cnt.closest(".cashFill").length){
						$("body").addClass("extraDimmed");
					}
				},1)
				if(pop.length > 0){
					var sss = pop.find(".lCont").scrollTop();
					$("body").addClass("tooltipShow");
					if(typeof(sss) != "undefined"){
						pop.scrollTop(sss);
					}
					if($("body").hasClass("cartBody") && !$(".noscrolling").length > 0 && !$(".layerPopupOpened").length > 0){
						hidePopupDimm(false);
					}
				}else{
					$("body").addClass("tooltipShow");
				}
				lc = tip.closest(".lCont");
				cnt = tip.find(".tipCont");
				if(lc.length > 0){
					st = lc.scrollTop();
					wh = lc.height();
					tx = cnt.offset().top - lc.offset().top + cnt.outerHeight();
					if(lc.hasClass("benefitCustomizing")){
						st = pst;
						lc.scrollTop(st);
						return false;
					}
					if(tx > wh){
						lc.scrollTop(st + tx - wh);
					}
				}else{
					st = win.scrollTop();
					wh = win.height();
					tx = cnt.offset().top + cnt.outerHeight();
					if(tx > wh + st - 100){
						GlobalScroll.scrollTo(tx - wh + 100);
					}
				}
				cnt.css('z-index','999999');
			}
		});
		cnt.find(".closeT").bind("click.tooltip", function(e){
			$(e.currentTarget).closest(".tipArea").find(".btTip").trigger("click.tooltip");
		});
		dim.bind("click.tooltip", function(e){
			$(e.currentTarget).closest(".tipArea").find(".btTip").trigger("click.tooltip");
		});
		if(cnt.hasClass("tbl")){
			$(this).closest(".tipWrap").css({"overflow":"visible"});
		}
	});
};

// 마이페이지 tooltip dimmed 제어
$('.myPageContents .accordianList .tipArea .btTip').click(function(e){
	$('.myPageContents').addClass('myPageDimmedOn');
})
$('.tipArea .closeT').click(function(){
	$('.myPageContents').removeClass('myPageDimmedOn');
})

/*  아코디온 초기화 */
function initAccordions(){
	var accordion = $(".accordianList:not(.inited)");
	var $win = $(window);
	if(accordion.length == 0){ return; }
	accordion.addClass("inited");
	
	// 버튼 클릭 이벤트 설정
	accordion.find(".toggleAction > a[role=button]").unbind("click.accordion").bind("click.accordion", function(e){
		var btn = $(e.currentTarget),
			li = btn.closest(".toggleAction"),
			ul = btn.closest(".accordianList"),
			cl = ul.hasClass("closeOther"),
			con = btn.siblings(".accordCont, .dep2Area");
		if(btn.attr("aria-expanded") === true || btn.attr("aria-expanded") === "true"){
			btn.attr("aria-expanded", false);
			btn.children(".btnMors").show();
			if(btn.closest(".dfPickupPop").length > 0){
				let lCont = btn.closest(".dfPickupPop").find(".lCont");
				lCont.stop().animate({scrollTop:0}, 300);
			}
			if(btn.closest("#popup_menu").length > 0){
				fnMysMainMenuSafariBugFix();
			}
		}else{
			if(btn.closest("#popup_menu").length > 0){
				fnMysMainMenuSafariBugFix();
			}
			btn.attr("aria-expanded", true);
			btn.children(".btnMors").hide();
			if(cl){
				li.siblings(".toggleAction").find("> a[role=button]").attr("aria-expanded", false);
			}
			try{
				updateSwipers(con);
			}catch(e){}
			var st = ul.data("scrollTop");
			if(typeof(st) == "number"){
				GlobalScroll.scrollTo(li.offset().top - st, 250);
			}

			/* 아코디언 오픈 시 스크롤 이동 추가 */
			var conT = con.offset().top;
			var conB = conT + con.outerHeight(true);
			var headerH = $('#header').height() || 0;
			var docH = $('.dockArea').height() || 0;
			if(conB + docH > $win.scrollTop()+$win.height()){
				if(con.offset().top < conB - $win.height() + headerH){
					$('body,html').stop().animate({scrollTop:conT - headerH},300);
				} else{
					$('body,html').stop().animate({scrollTop:conB + docH - $win.height()},300);
				}
			}
			if(btn.closest(".dfPickupPop").length > 0){
				let lCont = btn.closest(".dfPickupPop").find(".lCont"),
					lContH = lCont.height();
				lCont.stop().animate({scrollTop:conB + lContH - $win.height()},500);
			}
		}
		if(ul.find(".toggleAction > a[role=button][aria-expanded=true]").length > 0){
			ul.addClass("accordianON");
		}else{
			ul.removeClass("accordianON");
		}
		return false;
	});
};

/* 레이어 팝업 클래스 */
var posY;
var LayerPopup = function(){
	var template = '<section id="layer_alert_popup" class="layPop layPopMid" tabindex="0">';
		template += '<h2 class="titLay"></h2>';
		template += '<div class="layCont">';
			template += '<div class="lCont" tabindex="0"></div>';
			template += '<div class="btnBtm">';
				template += '<div class="btnArea">';
					template += '<button type="button" class="btnSSG btnL btnCancel" data-action="cancel">취소</button>';
					template += '<button type="button" class="btnSSG btnL action btnOk" data-action="ok">확인</button>';
				template += '</div>';
			template += '</div>';
		template += '</div>';
		template += '<button type="button" class="closeL" data-action="close">닫기</button>';
	template += '</section>';
	var aniProp = {
			duration : 400,
			easing : "easeInSine",
			complete : aniComplete
		},
		$win = $(window),
		container, dimmed, alertPopup, alertContent, alertTitle, alertCancel, alertOk;
	
	/* 레이어 팝업 초기화 */
	function init(){
		/* 인라인에 마크업 되어 있는 팝업 가져오기 */
		LayerPopup.inline = $(document).find('.layPop');
		// 팝업 호출 버튼 초기화
		LayerPopup.initButtons();
		if($("#dummyVHLayer").length <= 0){
			$("body").append('<div style="position:fixed;top:0;left:-100px;bottom:0;width:0;" id="dummyVHLayer"></div>');
		}
	};
	
	/* 팝업 컨테이너 초기화 */
	function initContainer(){
		if(container instanceof jQuery){ return; }
		container = $("#layerPopupContainer");
		if(container.length == 0){
			container = $('<div id="layerPopupContainer"><div class="dimmed"></div></div>');
			$("body").append(container);
		}
		dimmed = container.find(".dimmed");
		if(dimmed.length == 0){
			dimmed = $('<div class="dimmed"></div>');
			container.append(dimmed);
		}
		dimmed.css("z-index", 99999);
		dimmed.bind("click.layerPopup", closePopup);
	};
	
	/* 버튼 클릭하여 팝업 로드하기 */
	function popupBtnClick(e){
		var a = $(e.currentTarget);
		if(a.closest(".app").length > 0){ return false; }
		if(typeof(a.data("path")) != "undefined"){
			LayerPopup.load(a.data("path"));
		}
	};
	
	/**
	 * 팝업 HTML 로드 성공
	 * @param {string}	data	- 로드된 HTML 텍스트
	 * @param {string}	url		- 로드한 팝업의 URL
	 */
	function loadSuccess(data, url, obj){
		var idx;
		idx = data.indexOf("<!-- layer popup end -->");
		if(idx >= 0){
			data = data.substr(0, idx);
		}
		idx = data.indexOf("<!-- layer popup start -->");
		if(idx >= 0){
			data = data.substr(idx) + 26;
		}
		initContainer();
		var pop = $(data).filter(".layPop");
		if(typeof(obj) != "undefined"){
			pop.data("remove", true);
		}else{
			getPopup(url, obj).popup = pop;
		}
		pop.find(".btnArea button:not(.btnPub), .optionArea .btnGroup button, button.closeL").unbind("click.layerPopup").bind("click.layerPopup", closePopup);
		openPopup(pop);
		initNestedForms(pop);
		if(typeof(obj) != "undefined"){
			pop.data("object", obj);
			
			// 콜백함수 있으면 호출하기
			if(typeof(obj.success) == "function"){
				obj.success(pop);
			}
		}
	};
	
	/* 팝업 로드 에러 */
	function loadError(){
		//console.log("LayerPopup load Error");
	};
	
	/**
	 * 이미 로드된 url 인지 확인
	 * @param {string}	url	- 로드할 팝업의 URL
	 */
	function getPopup(url, obj){
		if(typeof(obj) != "undefined"){ return; }
		
		var len = LayerPopup.popupList.length,
			i, pop;
		
		for(i=0; i<len; i++){
			pop = LayerPopup.popupList[i];
			if(pop.url == url){
				return pop;
			}
		}
		return;
	};
	
	/* 애니메이션 종료 이벤트 */
	function aniComplete(){
		var pop = $(this);
		if(!pop.hasClass("on")){
			pop.css("display", "none");
			if(pop.data("remove") === true){
				removePopup(pop);
			}
		}else{}
	};

	function resizePopCont(data){
		var pop = container.find(".layPop.on").last(),
			con = pop.find(".layCont"),
			listPaging = con.find(".btnBtm .listPaging"),
			h = 143,
			mh = pop.data("minHeight"),
			full = pop.hasClass("layPopFull"),
			mid = pop.hasClass("layPopMid"),
			ft = con.siblings(".filterTab"),
			popH = 520,
			titH = pop.find(".titLay").outerHeight(),
			calH = popH - titH,
			hh, ph, pt, dh;
		
			let winH = $(window).height();
			$(window).on('resize', function(){
				winH = $(this).height(); // window 높이 업데이트
			});

		var ip = pop.find("input[type=text]");
		if(listPaging.length){
			listPaging.closest(".btnBtm").addClass("isPaging");
		}
		
		if(pop.hasClass("btmType02")){
			h = pop.find(".titLay").outerHeight() + 105;
		}
		dh = $("#dummyVHLayer").height();
		hh = dh - h;
		if(ft.length > 0){
			hh -= ft.outerHeight();
		};
		
		if(IS_IOS){
			// iOS
			if(full){
				if(pop.attr("id") == "siteAddInfoLayer"){
					setTimeout(function(){
						var lc = pop.find(".layCont");
						if(lc.scrollTop() == 0){
							lc.scrollTop(1);
						}else{
							lc.scrollTop(0);
						}
					}, 100);
				}
			} else{
				if(typeof(mh) != "number"){
					mh = Math.round(hh * 0.8);
					con.data("minHeight", mh);
				}
				if(hh < mh){
					con.css("height", mh);
					hh = mh;
				}else{
					con.css("height", "");
				}
				if(!full){
					if(con.find(".cm_laypop").length > 0){
						// 신구단 필터 레이어 예외처리
						var ft = con.siblings(".filterTab.filtpotion");
						if(ft.length > 0){
							con.attr("style", "max-height:" + (hh - ft.outerHeight()) + "px !important");
						}else{
							con.css("max-height", hh);
						}
					} else{
						if(con.closest("#popSorting").length > 0 && con.closest(".appAgile").length > 0){
							// 아이폰SE(375 x 667) 단말기에서 상품 필터의 보기옵션 정렬 영역이 하단에 붙는 현상 수정
							function isSE(){
								let screenWidth = window.screen.width;
								let screenHeight = window.screen.height;
								return ((screenWidth === 375 && screenHeight === 667) || (screenWidth === 667 && screenHeight === 375));
							}
							if(isSE()){
								const $this = con.closest("#popSorting");
								const optionList = $this.find(".optionList");
								function isOptionListCloseToBottom(){
									var optionListBottom = optionList.offset().top + optionList.outerHeight();
									var windowScrollTop = $(window).scrollTop();
									var windowHeight = $(window).height();
									var distanceToBottom = windowHeight + windowScrollTop - optionListBottom;
									return distanceToBottom <= 5;
								}
								if(isOptionListCloseToBottom()){
									optionList.css({"margin-bottom": "24px"});
								}
							}
						}
						if(con.closest('.profileRegister').length){
							hh = dh + h - $(window).height() * 0.1;
							var registStep = con.find('.registStep');
							var h = con.find('.stepInfo').offset().top - registStep.offset().top;
							if(h > 0){
								registStep.css({paddingBottom:0,height:h});
							}
						}
						if(con.closest(".autoFilter").length > 0){
							con.css({
								"max-height" : hh + 20
							})
						} else if(con.closest(".layPop.layPopBtm.u646").length > 0){
							const layPop = con.closest(".layPop.layPopBtm.on.u646");
							const btnBtm = layPop.find(".btnBtm");
							const btnArea = btnBtm.find(".btnArea");
							const lCont = layPop.find(".lCont");
							const winW = $(window).width();
							const titH = 80;
							const calcH = winH - 100 - titH;
							btnBtm.height(btnArea.outerHeight());
							lCont.css({"height":lCont.outerHeight()});

							function checkWindowSize(){
								const lContH = con.find(".lCont").outerHeight();
								// con.css({"margin-bottom":btnArea.outerHeight()});
								con.find(".lCont").css({"padding-bottom":""});
								if(winW <= 320){
									setTimeout(() => {
										con.css({"height":lContH - 24,"margin-bottom":lContH});
										con.find(".lCont").css({"padding-bottom":""});
									}, 1)
								}
							}

							// layPop의 높이가 winH - 100보다 같거나 클 경우
							if(layPop.outerHeight() >= winH - 100){
								const prSelectViewH = layPop.find(".prSelectView").outerHeight();
								const prSelect = layPop.find(".prSelect");
								lCont.height(calcH - btnArea.outerHeight() - prSelectViewH - 20);
								checkWindowSize();
							}
							  
							$(window).resize(function(){
								checkWindowSize();
							});
						} else{
							con.css("max-height", hh);
						}
					}
				}
			}
		}else{
			// 안드로이드
			setTimeout(function(){
				if(con.length == 0){ return; }
				mh = con.data("minHeight");
				if(typeof(mh) != "number"){
					var tit = pop.find(".titLay"),
						tith = tit.outerHeight(),
						mgt = parseInt(tit.css("marginTop"), 10),
						mgb = parseInt(tit.css("marginBottom"), 10);
					if(!isNaN(mgt)){
						tith += mgt;
					}
					if(!isNaN(mgb)){
						tith += mgb;
					}
					mh = pop.outerHeight() - tith;
					if(ft.length > 0){
						mh -= ft.outerHeight();
					}
					con.data("minHeight", mh);
					con.css("height", mh);
				}else{
					con.css("height", "");
					var tit = pop.find(".titLay"),
						tith = tit.outerHeight(),
						mgt = parseInt(tit.css("marginTop"), 10),
						mgb = parseInt(tit.css("marginBottom"), 10);
					if(!isNaN(mgt)){
						tith += mgt;
					}
					if(!isNaN(mgb)){
						tith += mgb;
					}
					mh = pop.outerHeight() - tith;
					if(ft.length > 0){
						mh -= ft.outerHeight();
					}
					if(con.find(".addCartOption").length > 0){
						con.css("max-height", hh);
					} else{
						if(con.closest(".layPop.layPopBtm.u646").length > 0){
							const layPop = con.closest(".layPop.layPopBtm.on.u646");
							const btnBtm = layPop.find(".btnBtm");
							const btnArea = btnBtm.find(".btnArea");
							const lCont = layPop.find(".lCont");
							const winW = $(window).width();
							const winH = $(window).height();
							const titH = 80;
							const calcH = winH - 100 - titH;
							btnBtm.height(btnArea.outerHeight());

							function checkWindowSize(){
								const lContH = con.find(".lCont").outerHeight();
								con.css({"margin-bottom":btnArea.outerHeight()});
								con.find(".lCont").css({"padding-bottom":""});
								if(winW <= 320){
									con.css({"height":lContH - 24,"margin-bottom":lContH});
									con.find(".lCont").css({"padding-bottom":""});
								}
							}

							// layPop의 높이가 winH - 100보다 같거나 클 경우
							if(layPop.outerHeight() >= winH - 100){
								const prSelectViewH = layPop.find(".prSelectView").outerHeight();
								const prSelect = layPop.find(".prSelect");

								lCont.height(calcH - btnArea.outerHeight() - prSelectViewH - 20);
								checkWindowSize();
								if(prSelect.length > 1){
									btnBtm.css({"height":"","min-height":"initial"});
									// btnBtm.css("position","fixed");
									// lCont.css({"padding-bottom":btnArea.outerHeight()});
								}
							}
							  
							$(window).resize(function(){
								checkWindowSize();
							});
						} else{
							let elemToChk = [
								".typeV", "#popup_menu"
							];
							if(elemToChk.some(selector => con.closest(selector).length > 0)){
								return;
							} else{
								if(con.closest("#m_popup_filter.autoFilter").length > 0){
									return;
								} else{
									con.css("height", mh);
								}
								
							}
						}
					}
				}
				if(mid){
					ph = pop.data("minHeight");
					if(typeof(ph) != "number"){
						ph = pop.outerHeight();
						pop.data("minHeight", ph);
					}
					pt = pop.data("topPosi");
					if(typeof(pt) != "number"){
						pt = (dh - ph) / 2;
						pop.data("topPosi", pt);
					}
					pt = (dh - ph) / 2;
					if(pt < 20){
						pt = 20;
					}
					if(pop.attr("id") === "goosBeneInfoLayer" && pop.closest(".u646").length > 0){
						return;
					} else{
						pop.css({
							"height": ph
						});
					}
				}
			}, 100);
		}
	};
	
	/* 팝업 열기 */
	let savedScrollPosition = 0;
	function openPopup(pop){
		if(pop.hasClass("layPopBtm") || pop.hasClass("exitPopup")){
			pop.stop(true);
			pop.css({"display":"block", "bottom":"-100%", "-webkit-transition":"none", "transition":"none"});
			setTimeout(function(){
				pop.animate({"bottom":"0"}, aniProp);
			}, 1);
		}
		pop.addClass("on");
		GlobalScroll.removeListener(resizePopCont);
		GlobalScroll.addListener(resizePopCont);
		if(pop.hasClass("u646") && pop.hasClass("layPopBtm")){
			setTimeout(resizePopCont, 100);
			setTimeout(resizePopCont, 200);
		} else{
			setTimeout(resizePopCont, 200);
			setTimeout(resizePopCont, 1000);
		}
		container.append(dimmed);
		container.append(pop);
		pop.data("focus", $(":focus"));
		setBodyNoScrolling(true);
		if(typeof(pop.attr("tabindex")) == "undefined"){
			pop.attr("tabindex", 0);
		}
		setTimeout(function(){
			pop.focus();
		}, 10);
		
		checkMultiPopup();
		initNestedForms(pop);
		
		// 상품상세 이미지보기
		var det = pop.find(".layCont.picDetail");
		var dh = 0;
		if(det.length > 0){
			det.find(".swiper-slide").css("height","initial");
		}

		// 장바구니 팝업 추천상품 swiper
		if($(".cartBenefit").length > 0){
			cartRmdProdSW();
		}

		// 팝업의 스크롤 체크
		function popScrollCheck(){
			setTimeout(() => {
				const lCont = pop.find(".lCont");
				const btnBtm = pop.find(".btnBtm");
				if(lCont.prop("scrollHeight") > lCont.prop("clientHeight")){
					pop.addClass("shadeOn");
				} else{
					pop.removeClass("shadeOn");
				}
			},200)
		}
		popScrollCheck();

		if(pop.hasClass("u651Pop") && pop.hasClass("layPopMid")){
			const layPopFull = $(".u651Pop.layPopFull");
			const lCont = layPopFull.find(".lCont");
			savedScrollPosition = lCont.scrollTop();
		}

		if(pop.closest("body").find(".contents.liquor").length > 0){
			pop.addClass("liquor");
		}

		// 상품 리스팅 a태그 안에 장바구니 담기 등 버튼이 있는 경우
		prLiCnstrMod();

		// 상품상세 추천상품 영역
		fnRecommendedEtcPr();
		
		// 카테고리 UI 개선 관련 브랜드 검색 팝업 레이어 높이값 조절
		if(pop.attr("id") == "m_popup_brandSearch"){
			const con = pop.find(".layCont"),
				brandBtm = con.find(".brandBtm"),
				winH = $(window).height();
			pop.height(winH - 178);
			setTimeout(() => {
				const popH = pop.height();
				const titH = pop.find(".titLay").height();
				const brandTopH = pop.find(".brandTop").height();
				const calcH = popH - titH - brandTopH - 80;
				brandBtm.height(calcH);
			},500)
		}

		// 상품상세 개선 - 202305
		if(pop.hasClass("u646")){
			const con = pop.find(".layCont");
			const btm = con.find(".btnBtm");
			const winH = $(window).height();
			const prSelect = pop.find(".prSelect");
			const prList = prSelect.find(".prList");
			const prodSl = prList.find(".prodSl");
			const btnBtm = pop.find(".btnBtm");
			const btnArea = btnBtm.find(".btnArea");
			
			if(con.find(".infoWrap").length > 0){
				const infoWrap = con.find(".infoWrap");
				infoWrap.closest(".layPop.u646").addClass("infoPop");
			}

			if(con.find(".addCartOption").length > 0){
				pop.addClass("addCartOption");
			}

			if(pop.hasClass("layPopBtm")){
				fnFixBtmHeartChk();
				productDetailLikeAnimation();
			}

			// 팝업의 높이에 따라 버튼 영역에 그림자를 넣을지 말지 결정
			function fnShadowChk(){
				setTimeout(() => {
					const winH = $(window).height();
					const popH = pop.outerHeight();
					const calc = winH - 100;
					const lCont = pop.find(".lCont");
					const btnBtm = pop.find(".btnBtm");
				  
					if(popH >= calc && !pop.find(".btnArea.opt").length > 0){
						pop.addClass("shade");
					} else{
						pop.removeClass("shade");
					}
				}, 500);
			}
			fnShadowChk();
			
			if(prSelect.hasClass("imgOption") || prSelect.hasClass("txtOption")){
				prSelect.closest(".layPop.u646.on").find(".prSelectView").addClass("imgOption");
			}
			if(btnArea.find(".optionsReflection").length > 0){
				btnArea.addClass("opt");
				btnArea.closest(".layPop").find(".layCont").addClass("opt");
			}

			// 팝업의 높이값을 다시 체크해야하는 경우가 있어 resizePopCont를 호출한다.
			prList.on("click",".prodSl input[type='radio']",function(e){
				let observer = new MutationObserver((mutationsList, observer) => {
					for(let mutation of mutationsList){
						if(mutation.type === 'childList'){
							const maxH = $(window).height() - 100;
							const layPopH = $(this).closest(".layPop.u646").outerHeight();
							if(maxH < layPopH){
								setTimeout(resizePopCont, 10);
								setTimeout(resizePopCont, 20);
								setTimeout(() => {
									popScrollCheck();
								},100)
							}
						}
					}
				});
				let targetNode = $(this).closest(".layPopBtm.u646")[0];
				let config = { childList: true, subtree: true };
				observer.observe(targetNode, config);
				checkRadioButton(this);
			})

			// 옵션 선택 여부 확인 후 '옵션을 선택하세요' 문구의 show/hide 처리
			// setTimeout(function(){
			// 	$(".prodSl input[type='radio']").each(function(){
			// 		checkRadioButton(this);
			// 	});
			// });
		}

		// 필터 변경 작업
		if(pop.find(".searchBrandList.u1286").length > 0){
			brandFilterAddClassChk();
		}
		if(pop.hasClass("autoFilter")){
			const autoFilter = pop;
			const filterTab = autoFilter.find(".filterTab");
			const updateShadeClass = (selectedTab) => {
				setTimeout(() => {
					const winH = $(window).height();
					const reff = winH - 83;
					const filterH = autoFilter.outerHeight();
					const roundedfilterH = Math.ceil(filterH);
	
					if(roundedfilterH >= reff || selectedTab.find("a").attr("aria-controls") === "filterBrand"){
						pop.addClass("shade");
					} else{
						pop.removeClass("shade");
					}
				},100)
			};
			const initiallySelectedTab = filterTab.find("li.tabON");
    		updateShadeClass(initiallySelectedTab);
			filterTab.find("li > a").on("click", function(event){
				const clickedTab = $(event.target).closest("li");
				filterTab.find("li").removeClass("tabON");
				clickedTab.addClass("tabON");
				updateShadeClass(clickedTab);
			});
			setTimeout(() => {
				pop.addClass("fixedBtm");
			},420)
		}

		// 라이브커머스 채팅 화면 내 상품 팝업
		if(pop.hasClass("i20230110")){
			const popH = 520,
				con = pop.find(".layCont"),
				titH = pop.find(".titLay").outerHeight(),
				calH = popH - titH;
			pop.css("max-height", popH);
			con.css("max-height", calH);
		}

		// 쇼츠 상세 연관상품 더보기 팝업
		if(pop.closest("body").find(".sshortsDetail").length > 0){
			pop.addClass("sshortsDetailProdRel");
		}

		// 공식스토어 메인 비디오 팝업
		if(pop.hasClass("btqmainVideo") && pop.find(".lCont > iframe").length > 0){
			var ifr = pop.find(".lCont > iframe"),
				lc = pop.find(".lCont"),
				h = Math.round(ifr.width() * 0.57),
				t = Math.round((lc.height() - h) / 2);
			if(t < 0){
				t = 0;
			}
			ifr.css({
				"height" : h,
				"transform" : "translate(0, " + t + "px)"
			});
			lc.css({
				"padding-left" : 0,
				"padding-right" : 0
			});
		}

		// 탭 정렬 함수
		fnTabAdj();

		// 멤버십 등급, 혜택 팝업
		if(pop.find(".cont.membership").length > 0){
			const cont = pop.find(".cont.membership");
			cont.closest(".layCont").addClass("mbship");
		}

		// 메인 공지 팝업, 지점 공지 팝업 노출시 메인 빅배너 슬라이드 자동 재생 멈춤
		if(pop.hasClass("notiPop")){
			$(function(){
				var mainBigBanner = $(".swiperWrap.visualBanner"),
					btnStop = mainBigBanner.find(".btnStop");
				function bigBannerStop(){
					btnStop.trigger("click");
				}
				bigBannerStop();
			})
		}

		// 메인 공지 팝업의 경우에는 뷰저블 솔루션에서 분석이 불가능하여 스크롤을 막지 않는다.
		if(pop.hasClass("notiPopV211102")){
			setBodyNoScrolling(false);
		}

		// 공유하기 팝업인 경우
		if(pop.attr("id") == "ShareLayer"){
			setBodyNoScrolling(false);
		}

		// 전자영수증 팝업 내 swiper의 slide가 2개 이상일 때
		if(pop.hasClass("e_receipt")){
			let sw = pop.find(".swiperWrap"),
				slideLen = pop.find(".swiper-slide").length,
				cont = pop.find(".e_receiptCont"),
				rcptTbl = cont.find(".receipt_tbl");
			
			if(sw.length > 0){
				sw.closest(".e_receipt").find(".titLay").addClass("bd");
			} else{
				sw.closest(".e_receipt").find(".titLay").removeClass("bd");
			}

			rcptTbl.each(function(){
				const payment = $(this).find(".payment");
				payment.each(function(idx, itm){
					if(idx == 0){
						$(itm).addClass("first");
					}
					if(idx == payment.length - 1){
						$(itm).addClass("last");
					}
				})
			})

			if(slideLen > 1){
				let btnBtm = pop.find(".btnBtm"),
					btnArea = btnBtm.find(".btnArea");
				setTimeout(() => {
					btnArea.prepend(pop.find(".paging").clone(true));
					let swCont = cont.find(".swiper-container"),
						paging = btnArea.find(".paging"),
						btn = paging.find("button"),
						currentCnt = sw.find(".swiper-slide-active").index() + 1;
						h;
					btnArea.find(".current").addClass("eCurrent");
					btnArea.find(".current").text(currentCnt);
					
					setTimeout(function(){
						h = btnArea.outerHeight();
						btnBtm.css({"min-height":h});
					},1)
					swCont.find(".paging").hide();
					if(paging.css("display") == "none"){
						paging.show();
					}

					sw.on("slideChange",function(){
						let tBtn = cont.find(".paging button"),
							eBtn = btnArea.find(".paging button"),
							tCnt = cont.find(".current").text(),
							eCnt = btnArea.find(".current");

						eCnt.text(tCnt);

						tBtn.each(function(i){
							let $this = $(this),
								cls = $this.attr("class");
							eBtn.eq(i).attr("class",cls);
						});

						// swipe시 영수증 화면 상단으로 스크롤 이동
						sw.closest(".lCont").animate({
							scrollTop:$("html, body").offset().top
						}, 350);
					})

					btn.on("click",function(e){
						let $this = $(e.currentTarget),
							cls = $this.attr("class"),
							nextEl = cont.find(".swiper-button-next"),
							prevEl = cont.find(".swiper-button-prev"),
							current;

						setTimeout(function(){
							current = cont.find(".current").text();
							let tBtn = cont.find(".paging button"),
								eBtn = btnArea.find(".paging button");

							tBtn.each(function(i){
								let $this = $(this),
									cls = $this.attr("class");
								eBtn.eq(i).attr("class",cls);
							});
						})

						if(cls == "swiper-button-next"){
							nextEl.click();
						} else{
							prevEl.click();
						}
					})
				},100)
			} else{
				cont.find(".paging").hide();
			}
		}

		// 전자영수증 팝업 호출시
		if($(".r_content").length > 0){
			eRcptEtc();
		}

		// 라이브 방송 알림 팝업 애니메이션
		if(pop.hasClass("liveAlertPop")){
			liveCmsNoticePopAni();
		}

		// 공동회원 가입 유도 팝업
		if(pop.find(".mem_imp").length > 0){
			let memImp = pop.find(".mem_imp"),
				miSw = memImp.find("> .swiperWrap.autoHeight"),
				cont = miSw.find("> .swiper-container"),
				dp = cont.find(".swiper-slide-duplicate"),
				dpChk = dp.find("input[type='checkbox']"),
				dpBox = dp.find(".boxGray");

			if(dpChk.length > 0){
				dpChk.remove();
				dpBox.remove();
			}

			miSw.on("slideChange",function(){
				setTimeout(() =>{
					let activeSlide = $(this).find("> .swiper-container > .swiper-wrapper > .swiper-slide-active");
					if(activeSlide.find("> .memberJoinWrap").length > 0){
						miSw.addClass("memJoinComplete");
					} else{
						miSw.removeClass("memJoinComplete");
					}
				},1)
			})
		}

		// w컨셉 빅배너 전체보기 팝업
		if(pop.find(".visualBanner").length > 0){
			setTimeout(() => {
				const bannerImg = pop.find(".visualBanner img");
				const bannerImgW = bannerImg.width();
				const bannerImgH = bannerImg.height();
				if(bannerImgH > bannerImgW){
					pop.find(".visualBanner").addClass("vertical");
				}
			},25)
		}

		// 추천관 취향 선택 팝업 제어
		if(pop.hasClass("rcmd")){
			if(IS_IOS){
				pop.addClass("iOS");
			}
			function resetFloatingAnimation(selector){
				const $elements = selector ? $(selector) : $(".layPop.rcmd .select-container .taste");
				$elements.each(function(){
					const $taste = $(this);
					if($taste.data("animating")){
						$taste.stop(true, false).css("top", "").removeData("animating");
					}
				});
			}

			function applyAnimationToChecked(){
				$(".layPop.rcmd .select-container input[type='checkbox']:checked").each(function(){
					const $taste = $(this).closest(".taste");
					animateFloating($taste, 2000);
				});
			}
			applyAnimationToChecked();
			$(".layPop.rcmd .btnRefresh").on("click", function(){
				resetFloatingAnimation();
			})

			$(".layPop.rcmd .select-container input[type='checkbox']").on("change", function(){
				if(!this.checked){
					const $taste = $(this).closest(".taste");
					resetFloatingAnimation($taste);
				}
			});
		}

		stockNotiPop();
		tabletRespond();

		// 환불계좌관리
		fnRefundAccountMgmt();
		if(pop.find(".payMethod.toggleClassWrap").length > 0 && pop.find(".etcCardList").length > 0){
			pop.addClass("flexibleHeight");
		}

		// 주류 전문관 팝업
		fnChkLiquorStateFlag();

		// 출입국정보 프로세스 개선
		fnStepListActive();

		// 선물하기 - 카드 확인 팝업의 메시지 따옴표 노출
		giftMsgQutInt();
		
		// 선물하기 - 금액권 선택 팝업
		if(pop.find(".selectPriceUnitlistWrap").length > 0){
			const selectPriceUnitlistWrap = pop.find(".selectPriceUnitlistWrap");
			selectPriceUnitlistWrap.find("input[type='radio']").each(function(){
				const $this = $(this);
				if($this.prop("checked")){
					$this.closest("li").addClass("rd_checked");
				}
			})
		}

		// 선물하기 - 메시지 추천 팝업
		if(pop.find(".giftservice_msgWrap").length > 0){
			const giftMsgWrap = pop.find(".giftservice_msgWrap");
			const msgTab = pop.find(".msgCardTabType01");
			giftMsgWrap.closest(".layPop").addClass("msgPop");
			msgTab.find("li > a").on("click",function(){
				// 스크롤 탑으로 부드럽게 이동
				$(".msgPop .lCont").animate({
					scrollTop:0
				}, 350);
				
			})
		}

		// 선물하기 메인 - 선물하기 소개 팝업
		if(pop.find(".giftIntroBannerSwiper").length > 0){
			const giftIntroBannerSwiper = pop.find(".giftIntroBannerSwiper");
			giftIntroBannerSwiper.closest(".layPop").addClass("giftIntroPop");
			initSwipers();
		}

		// 빅배너 세로 타입 팝업
		if(pop.find(".visualBanner.typeV").length > 0){
			const banner = pop.find(".visualBanner.typeV");
			banner.closest(".layPop").addClass("typeV");
		}

		// 마이페이지 메뉴 레이어팝업 수정 - iOS17이상 safari에서 주소창이 하단에 있는 경우 스크롤 되는 body 위 레이어팝업의 스크롤되지 않는 이슈 수정
		if(pop.attr("id") == "popup_menu"){
			$("body").addClass("bodyStatic");
		}

		// 친환경 캠페인
		if(pop.find(".ecoCampaignCont").length > 0){
			pop.addClass("ecoCampaignPop");
		}
	};

	// sorting 버튼 클릭시 노출되는 하단 레이어팝업에서 조회 버튼이 없는 경우 선택 후 팝업 닫기
	$(function(){
		let layPopBtm, layPopSelectBtn;
		$(".layPop.layPopBtm").each(function(idx, itm){
			layPopBtm = $(itm);
			layPopSelectBtn = layPopBtm.find(".layCont input + label");
			if(layPopBtm.find(".btnBtm").length == 0){
				layPopSelectBtn.on("click",closePopup);
			}
		})
	});

	/* 팝업 닫기 */
	function closePopup(e, param){
		var btn = $(e.currentTarget),
			pop = btn.closest(".layPop"),
			delay = 0;

		GlobalScroll.removeListener(resizePopCont);

		const handlers = {
			"e_receipt" : closePopScrlChk_e_receipt,
			"layMapZoom" : closePopScrlChk
			// 이 객체에 새로운 클래스와 처리 함수를 매핑하여 추가
		};

		Object.keys(handlers).forEach(function(className){
			if(pop.hasClass(className)){
				handlers[className](pop, className);
			}
		});

		function closePopScrlChk_e_receipt($pop, className){
			const $this = $(".layPop.e_receipt");
			if($this.find("#btnBillSave").length === 0){ // 전자영수증 저장 버튼(#btnBillSave)이 없을 경우에만 함수 실행
				closePopScrlChk($pop, className);
				const $btnArea = $this.find(".btnArea");
				$btnArea.find(".paging").last().remove();
			}
		}

		function closePopScrlChk($pop, className){
			const $body = $("body");
			const top = $body.css("top");
		
			if($pop.length > 0){
				setTimeout(() => {
					$body.css("top", top);
				}, 1);
				fnScrlChk();
			}
		}

		// 딤드 클릭한 경우, 열린 팝업 레이어 할당
		if(btn.hasClass("dimmed")){
			pop = btn.siblings(":visible").last();
		}
		if(pop.is(':animated')){
			return false;
		}

		/* 닫은 팝업 가져오기 인라인 팝업 제어 시 필요 */
		LayerPopup.thisClose = pop;
		// 확인/취소 버튼에 noAutoClose 클래스가 있으면 어떤 동작으로도 팝업 닫을 수 없음
		// LayerPopup.close() 함수로만 닫을 수 있음
		/*if(param !== "forceClose" && pop.find(".noAutoClose").length > 0){
			return false;
		}*/
		// 개발 요청으로 클릭한 버튼에 noAutoClose 있을때만 닫기 안함
		if(param !== "forceClose"){
			if(btn.hasClass("noAutoClose")){
				return false;
			}
			// dimmed 클릭 시 닫기 버튼 noAutoClose 체크 해서 안닫기
			// 닫기 버튼 click 트리거
			if(btn.hasClass("dimmed")){
				var cbtn = pop.find(".noAutoClose");
				if(cbtn.length > 0){
					return false;
				}
			}
		}

		var cbo = pop.data("object");
		if(pop.hasClass("layPopBtm") || pop.hasClass("exitPopup")){
			pop.stop(true).css({"display":"block", "bottom":"0"}).animate({"bottom":"-100%"}, aniProp);
			delay = 410;
		}
		pop.removeClass("on");
		setBodyNoScrolling(false);

		var focus = pop.data("focus");
		if(focus && focus.length > 0){
			focus.focus();
		}

		var fi = pop.find("input:focus");
		if(fi.length > 0){
			fi.blur();
		}

		// 열린 툴팁 닫기
		pop.find(".tipWrap.on .tipCont .closeT").trigger("click.tooltip");

		if(!pop.hasClass("dragDownWrapper") && pop.data("remove") === true){
			removePopup(pop);
		}

		// 콜백함수 있으면 호출하기
		if(typeof(cbo) != "undefined" && typeof(cbo.close) == "function"){
			cbo.close(pop);
		}

		if(pop.hasClass("u651Pop") && pop.hasClass("layPopMid")){
			const layPopFull = $(".u651Pop.layPopFull");
			const lCont = layPopFull.find(".lCont");
			setTimeout(() => {
				lCont.scrollTop(savedScrollPosition);
			},1)
		}

		// 메인 공지 팝업, 지점 공지 팝업 닫을 때 메인 빅배너 슬라이드 자동 재생
		if(pop.hasClass("notiPop")){
			$(function(){
				var mainBigBanner = $(".swiperWrap.visualBanner"),
					btnPlay = mainBigBanner.find(".btnPlay");
				function bigBannerPlay(){
					btnPlay.trigger("click");
				}
				bigBannerPlay();
			})
			$("body").removeAttr("style");
		}

		// 필터 변경 작업
		if(pop.hasClass("autoFilter")){
			const autoFilter = pop;
			pop.removeClass("fixedBtm");
		}

		setTimeout(checkMultiPopup, delay);
		tabletRespond();

		// 상품상세 개선 - 202305
		if(pop.hasClass("u646")){
			const lCont = pop.find(".lCont");
			lCont.css({"height":""});
		}

		if(pop.hasClass("u651Pop")){
			$(document).on("click","button[data-target]",function(){
				const hasAttr = $(this).attr("data-target");
				if(hasAttr){
					let target = $($(this).data("target"));
					if(target.length > 0){
						$("html, body").animate({
							scrollTop: target.offset().top
						}, 1000);
					}
					return false;
				}
			})
		}

		if(pop.attr("id") == "popup_menu"){
			setTimeout(() => {
				$("body").removeClass("noscrolling layerPopupOpened bodyStatic");
			},1)
		}
	};

	/* 팝업 제거하기 */
	function removePopup(pop){
		// 자식 팝업들 삭제
		var arr = pop.data("children");
		if($.isArray(arr)){
			var popup, id, len, i, p;
			$.each(arr, function(idx, itm){
				popup = $(itm);
				id = popup.attr("id");
				len = LayerPopup.popupList.length;
				for(i=0; i<len; i++){
					p = LayerPopup.popupList[i];
					if(p.url == id){
						LayerPopup.popupList.splice(idx, 1);
						break;
					}
				}
				popup.remove();
			});
		}
		pop.remove();
	};// removePopup

	/* 다중 팝업인 경우 마지막 팝업을 상위로 노출하기 */
	function checkMultiPopup(){
		var pop = container.find(".layPop.on").last();
		var headFixedLogo = document.querySelectorAll(".headFixed .logo"),
			marketingBanner = document.querySelectorAll(".marketingBanner"),
			logo = document.querySelectorAll(".logo"),
			body = document.querySelector("body"),
			posY = document.querySelector("html").scrollTop;

		if(pop.length > 0){
			container.append(pop);
		}
		if(container.find(".layPop.on").length > 0){
			$("body").addClass("layerPopupOpened");
			dimmed.css("display", "block");
			if(headFixedLogo.length){
				if(marketingBanner.length){
					posY = posY + 48;
				} else{
					posY = posY - 56;
				}
				// body.style.position = "fixed";
				// body.style.top = -posY + "px";
			} else{
				function fnLayerPopTopInp(){
					const $body = $("body"),
						top = $body.css("top");
					setTimeout(function(){
						if(top !== "0px"){
							setTimeout(() => {
								$body.css("top", top);
							}, 100);
						}
					}, 550);
				}

				// 팝업이 열린 상태에서 또 다른 팝업을 호출하는 경우 스크롤 위치 제어
				// $("#billLst").find(".layerPopupButton").on("click", fnLayerPopTopInp);
				// $(".layPopStoreInfo").find(".layerPopupButton").on("click",fnLayerPopTopInp);
				// $(".u651Pop").find(".layerPopupButton").on("click",fnLayerPopTopInp);

				// 메인 공지 팝업의 경우에는 뷰저블 솔루션에서 분석이 불가능하여 스크롤을 막지 않는다.
				// if(container.find(".notiPopV211102").length > 0){
				// 	return;
				// } else{
				// 	posY = posY;
				// 	body.style.position = "fixed";
				// 	body.style.top = -posY + "px";
				// }
			}

			if(container.find(".notiPopV211102").length > 0){
				body.removeAttribute("style");
			}

			/* 기존 마크업 되어있는 있는 팝업만 호출 로드 되는 팝업은 개발쪽에서 호출 */
			LayerPopup.inline.each(function(){
				if($(this).attr('id') == pop.attr('id')){
					hidePopupDimm(true, true);
				}
			});
		}else{
			$("body").removeClass("layerPopupOpened");
			dimmed.css("display", "none");
			// $(".btnOrderCondition, .btnSelectPeriod").removeClass("open");
			// posY = body.style.top;
			// var logo = document.querySelectorAll(".logo"),
			// 	body = document.querySelector("body"),
			// 	convPosY = parseInt(posY);
			// body.removeAttribute("style");

			// if(container.find(".notiPopV211102").length > 0){
			// 	return;
			// } else{
			// 	if(logo.length){
			// 		if(marketingBanner.length){
			// 			document.querySelector("html").scrollTo(0, -convPosY - 48);
			// 		} else{
			// 			if($(".shopArea.i2303").length > 0){
			// 				document.querySelector("html").scrollTo(0, -convPosY + 56);
			// 			} else{
			// 				document.querySelector("html").scrollTo(0, -convPosY);
			// 			}
			// 		}
			// 	} else{
			// 		document.querySelector("html").scrollTo(0, -convPosY);
			// 	}
			// }

			// 앱카드 결제 수단 관련
			if($(".appCardlayer.on").length >0){
				const newCard = $(".appCardlayer").find(".newCard"),
				btChoice = newCard.find(".choiceCard");

				if(btChoice.hasClass("on")){
					btChoice.removeClass("on");
				}
			}

			/* 기존 마크업 되어있는 있는 팝업만 호출 로드 되는 팝업은 개발쪽에서 호출 */
			LayerPopup.inline.each(function(){
				if(LayerPopup.thisClose == undefined){
					return false;
				}
				if($(this).attr('id') == LayerPopup.thisClose.attr('id')){
					hidePopupDimm(false, true);
				}
			});
		}

		// 콘텐츠 스크롤 가능여부 체크
		if(pop.length > 0){
			clearInterval(timer_scrolling);
			timer_scrolling = setInterval(isContScrolling, 1000);
			isContScrolling();
		}else{
			clearInterval(timer_scrolling);
		}
	};// checkMultiPopup

	// 팝업 콘텐츠 스크롤 여부 판단
	var timer_scrolling;
	function isContScrolling(){
		var pop = container.find(".layPop.on").last();
		if(pop.length > 0){
			var cont = pop.find(".layCont:visible"),//.find(".lCont:visible")
				targ = pop.find(".layCont:visible");//find(".lCont:visible")
			var targHeightNum = 0,
				targScrollHeightNum = 0,
				targHeight = Math.round(targHeightNum),
				targScrollHeight = Math.round(targScrollHeightNum);
			targHeightNum = targ.outerHeight();
			targScrollHeightNum = targ.get(0).scrollHeight;
			if(cont.find(".stepContent .section").length > 0){
				targ = cont.find(".stepContent .section");
			}
			if(targHeight < targScrollHeight){
				cont.addClass("scrolling");
			} else{
				cont.removeClass("scrolling");
			}
		}
	};// isContScrolling

	/* 알러트/컴펌 팝업 초기화 */
	function initAlertUI(){
		if(alertPopup instanceof jQuery){ return; }
		alertPopup = $("#layer_alert_popup");
		if(alertPopup.length == 0){
			alertPopup = $(template);
			container.prepend(alertPopup);
			alertPopup.find("button").bind("click.layerAlert", alertBtnClicked);
			alertTitle = alertPopup.find("h2.titLay");
			alertContent = alertPopup.find(".layCont .lCont");
			alertCancel = alertPopup.find(".btnCancel");
			alertOk = alertPopup.find(".btnOk");
		}
	};// initAlertUI

	/* 버튼 클릭 이벤트 */
	function alertBtnClicked(e){
		var btn = $(e.currentTarget),
			data = alertPopup.data("data");
		alertPopup.removeClass("on");
		if($.isFunction(data.callback)){
			setTimeout(function(){
				if(data.type == "alert"){
					data.callback();
				}else{
					data.callback(btn.data("action") == "ok");
				}
			}, 0);
		}
		if(LayerPopup.queList.length > 0){
			setTimeout(showNextQue, 1);
		}
	};

	/**
	 * 알러트/컨펌 데이터 큐에 추가하기
	 * @param {string}		text			- 팝업 내용 텍스트
	 * @param {object}		[data]			- 팝업 데이터 오브젝트
	 * @param {string}		[data.title]	- 팝업 타이틀 텍스트
	 * @param {string}		[data.ok]		- 확인 버튼 텍스트
	 * @param {string}		[data.cancel]	- 취소 버튼 텍스트
	 * @param {function}	[data.callback]	- 팝업 닫을 때 호출할 콜백 함수
	 * @praam {string}		[type]			- 팝업 구분 [alert|confirm]
	 */
	function addQue(text, data, type){
		if(typeof(data) != "object" || $.isEmptyObject(data)){
			data = {};
		}
		if(typeof(data.ok) != "string" || data.ok.length == 0){
			data.ok = "확인";
		}
		if(typeof(data.cancel) != "string" || data.cancel.length == 0){
			data.cancel = "취소";
		}
		if(typeof(data.title) != "string"){
			data.title = "";
		}
		data.text = text;
		data.type = type;
		LayerPopup.queList.push(data);
		showNextQue();
	};

	/* 다음 큐 화면에 표시하기 */
	function showNextQue(){
		initContainer();
		initAlertUI();
		if(LayerPopup.queList.length == 0 || alertPopup.hasClass("on")){ return; }
		var data = LayerPopup.queList.shift();
		alertPopup.data("data", data);
		alertCancel.css("display", (data.type == "alert" ? "none" : "block"));
		alertCancel.text(data.cancel);
		alertOk.text(data.ok);
		alertTitle.text(data.title);
		alertContent.html(data.text);
		alertPopup.addClass("on");
	};

	/* 페이지에 코딩된 레이어 팝업인 경우 초기화 */
	function initPreloadPopBtns(parent){
		var btns, btn, id, pop;
		if(parent.length > 0){
			btns = parent.find(".layerPopupButton[data-id]:not(.inited)");
		}else{
			btns = $(".layerPopupButton[data-id]:not(.inited)");
		}

		initContainer();

		btns.each(function(idx, itm){
			btn = $(itm);
			id = btn.data("id");
			pop = $("#" + id);
			if(pop.length){
				btn.data("path", id);
				dimmed.before(pop);
				pop.css("display", "none");

				if(typeof(parent) != "undefined" && parent.length > 0 && parent.data("remove") === true){
					// 동적 로드
					var arr = parent.data("children");
					if(typeof(arr) == "undefined"){
						arr = [];
						parent.data("children", arr);
					}
					arr.push(pop);
				}
				LayerPopup.popupList.push({
					url : id,
					popup : pop
				});

				pop.find(".btnBtm .btnArea button:not(.btnPub), button.closeL").unbind("click.layerPopup").bind("click.layerPopup", closePopup);
				initNestedForms(pop);
				btn.addClass("inited").unbind("click.layerPopup").bind("click.layerPopup", popupBtnClick);
			}
		});
	};

	function initNestedForms(pop){
		pop.find(".selectWrap").each(function(){
			SelectMenu.update($(this).find('select'));
		});
		pop.find(".calenInp:not(.timeInp)").each(function(idx, itm){
			new DatePicker(itm);
		});
		pop.find(".calenInp.timeInp").each(function(idx, itm){
			new TimePicker(itm);
		});

		LayerPopup.initButtons(pop);
		initAllAtOnce(pop);
		initPopFixedWrap(pop);

		if(pop.hasClass("layPopBtm") || pop.hasClass("exitPopup")){
			pop.addClass("dragDownWrapper");
		}
		if(pop.hasClass("dragDownWrapper")){
			pop.find("button.closeL").addClass("dragDownClose");
			initDragDownArea();
			if(pop.closest("body").find(".liveChatWrap").length > 0 && pop.find(".btnBtm").length < 1){
				pop.find(".lCont").addClass("btmShadow");
			}
		}
	};

	if(!$.isArray(LayerPopup.popupList)){
		// 레이어 팝업 리스트
		LayerPopup.popupList = [];
		// 레이어 알러스/컴펌 리스트
		LayerPopup.queList = [];

		/**
		 * 레이어 팝업 URL 열기
		 * @param {string} url - 로드할 팝업의 URL
		 */
		LayerPopup.load = function(url, obj){
			if(typeof(url) != "string" || url == ""){ return; }
			var pop = getPopup(url, obj);
			
			if(pop){
				if(pop.popup){
					openPopup(pop.popup);
				}
			}else{
				var obj1 = {
					url : url,
					popup : null,
					data : obj
				}
				if(typeof(obj) == "undefined"){
					LayerPopup.popupList.push(obj1);
				}

				var obj2 = {
					url : url,
					dataType : "text",
					success : function(data){
						loadSuccess(data, url, obj);
					},
					error : (obj && obj.error) ? obj.error : loadError
				}
				if(typeof(obj) != "undefined"){
					if(("" + obj.method).toLowerCase() == "post"){
						obj2.method = "POST";
					}
					if(typeof(obj.data) != "undefined"){
						obj2.data = obj.data;
					}
				}
				$.ajax(obj2);
			}
		};

		/**
		 * 레이어 팝업 연결 버튼 초기화하기
		 * 페이지 로드 시에 한 번 실행되므로, 버튼이 동적으로 추가되지 않으면 다시 실행할 필요는 없음
		 * @param {object}	[target]	- 버튼을 찾을 부모 객체
		 */
		LayerPopup.initButtons = function(target){
			var parent = $(target),
				btns;
			if(parent.length > 0){
				btns = parent.find(".layerPopupButton[data-path]:not(.inited)");
			}else{
				btns = $(".layerPopupButton[data-path]:not(.inited)");
			}
			btns.addClass("inited").unbind("click.layerPopup").bind("click.layerPopup", popupBtnClick);
			initPreloadPopBtns(parent);
		};

		/* 레이어 팝업 닫기 */
		LayerPopup.close = function(target){
			$(target).find("button.closeL").trigger("click.layerPopup", "forceClose");
		};

		LayerPopup.resize = function(){
			resizePopCont();
		};

		/**
		 * 레이어 알러트 열기
		 * @param {string}		text			- 팝업 내용 텍스트
		 * @param {object}		[data]			- 팝업 데이터 오브젝트
		 * @param {string}		[data.title]	- 팝업 타이틀 텍스트
		 * @param {string}		[data.ok]		- 확인 버튼 텍스트
		 * @param {function}	[data.callback]	- 팝업 닫을 때 호출할 콜백 함수
		 */
		/**
		 * 레이어 컴펌 열기
		 * @param {string}		text			- 팝업 내용 텍스트
		 * @param {object}		[data]			- 팝업 데이터 오브젝트
		 * @param {string}		[data.title]	- 팝업 타이틀 텍스트
		 * @param {string}		[data.ok]		- 확인 버튼 텍스트
		 * @param {string}		[data.cancel]	- 취소 버튼 텍스트
		 * @param {function}	[data.callback]	- 팝업 닫을 때 호출할 콜백 함수
		 */
	}

	init();

	return this;
};// LayerPopup

/* 스와이퍼 초기화 */
function initSwipers(){
	var wraps = $(".swiperWrap:not(.inited)");
	if(wraps.length == 0){ return; }

	eRcptChgFn();

	/* 구버전 스와이프 이벤트 처리 */
	function onSlideChange(sw){
		var ul = $(sw.wrapper),
			wrap = ul.closest(".swiperWrap"),
			idx = sw.activeLoopIndex,
			len = wrap.find(".swiper-slide:not(.swiper-slide-duplicate)").length - 1;

		// number pagination
		if(wrap.find("> .swiper-container > .paging > .swiper-paging").length > 0){
			$(wrap).find("> .swiper-container > .paging > .swiper-paging .current").text(idx + 1);
		}

		// bullet pagination
		if(wrap.find(".swiper-pagination").length > 0){
			wrap.find(".swiper-pagination-bullet").removeClass("swiper-pagination-bullet-active")
				.eq(idx).addClass("swiper-pagination-bullet-active");
		}

		// prev/next btn
		if(wrap.find(".swiper-button-prev").length > 0){
			if(idx == 0){
				wrap.find(".swiper-button-prev").addClass("swiper-button-disabled");
			}else{
				wrap.find(".swiper-button-prev").removeClass("swiper-button-disabled");
			}
		}
		if(wrap.find(".swiper-button-next").length > 0){
			if(idx == len){
				wrap.find(".swiper-button-next").addClass("swiper-button-disabled");
			}else{
				wrap.find(".swiper-button-next").removeClass("swiper-button-disabled");
			}
		}

		// 탭 컨트롤
		data = wrap.data("targetTab");
		if(typeof(data) != "undefined"){
			var tab = $(wrap.data("targetTab")),
				fn = tab.data("setTabIndex");
			if(typeof(fn) == "function"){
				fn(idx, tab);
			}
		}
		onTransition(sw);
	};

	/* 구버전 트랜지션 이벤트 좌우 버튼 컨트롤 안되는 버그 대응 */
	function onTransition(sw){
		var ul = $(sw.wrapper),
			cont = ul.closest(".swiper-container"),
			wrap = ul.closest(".swiperWrap"),
			prev = wrap.find(".swiper-button-prev"),
			next = wrap.find(".swiper-button-next"),
			x = parseInt(ul.css("left"), 10);

		if(isNaN(x)){
			x = 0;
		}

		if(x >= 0){
			prev.addClass("swiper-button-disabled");
		}else{
			prev.removeClass("swiper-button-disabled");
		}

		if(cont.width() >= ul.width() + x){
			next.addClass("swiper-button-disabled");
		}else{
			next.removeClass("swiper-button-disabled");
		}
	};

	var arr = [],
		old = (window.swiperVersion === 276),
		wrap, prop, swiper, evts, len, i, obj, cont, opt, hasVideo, data;
	wraps.each(function(idx, itm){
		wrap = $(itm);
		if(!wrap.is(":visible")){ return; }
		wrap.addClass("inited");
		let sliderData = wrap.data("slider");
		prop = $.extend({
			pagination: {},
			navigation: {},
			on: {}
		}, sliderData);
		evts = [];
		opt = {};

		// pagination
		if(wrap.find(".swiper-pagination").length > 0){
			var pg = wrap.find(".swiper-pagination");

			// nested 슬라이더가 있을 때에도 슬라이딩이 되도록
			var pgh = wrap.find("swiper-pagination-h");
			var pgv = wrap.find("swiper-pagination-v");
			if(old){
				var cls = "swiper-pagination-" + getSerialNumber();

				pg.addClass(cls);
				prop.pagination = "." + cls;
				prop.paginationElementClass = "swiper-pagination-bullet";
				prop.paginationActiveClass = "swiper-pagination-bullet-active";
			}else{
				// 프로그레스바 타입 추가 : 220704
				if(pg.hasClass("progressbar")){
					prop.pagination = {
						el : ".swiper-pagination",
						type : "progressbar"
					}
				} else{
					if(pg.hasClass("dynamic")){
						prop.pagination = {
							el : ".swiper-pagination",
							type : "bullets",
							dynamicBullets : true
						}
					} else{
						prop.pagination = {
							el : ".swiper-pagination",
							type : "bullets",
						}
					}
				}

				if(pg.closest(".swiperWrap").hasClass("swiperEventFull") && wrap.data("slidePerView") == "2.019"){
					pg.addClass("progressbar");
					prop.pagination = {
						el : ".swiper-pagination",
						type : "progressbar"
					}
				}

				if(pg.hasClass("clickable")){
					prop.pagination.clickable = true;
				}
				if(wrap.hasClass("clickable")){
					prop.pagination.clickable = true;
				}
				//clickable
				if(pgh.hasClass("click")){
					prop.pagination.clickable = true;
				}
				if(pgv.hasClass("click")){
					prop.pagination.clickable = true;
				}
			}
		}

		// paging
		if(wrap.find("> .swiper-container > .paging > .swiper-paging").length > 0){
			evts.push({
				"name" : "slideChange",
				"func" : function(){
					$(this.$el).find("> .paging > .swiper-paging .current").text(this.realIndex + 1);
				}
			});
			wrap.find("> .swiper-container > .paging > .swiper-paging").html('<span class="current">1</span> / <span class="total">'+wrap.find("> .swiper-container > .swiper-wrapper > .swiper-slide").length+'</span>');
		}

		// arrow
		if(wrap.find(".swiper-button-prev, .swiper-button-next").length > 0){
			if(old){
				wrap.find(".swiper-button-prev, .swiper-button-next").bind("click.swiper", function(e){
					var btn = $(e.currentTarget),
						wrap = btn.closest(".swiperWrap"),
						sw = wrap.data("swiper");
					if(btn.hasClass("swiper-button-prev")){
						sw.swipePrev();
					}else if(btn.hasClass("swiper-button-next")){
						sw.swipeNext();
					}
				});
			}else{
				prop.navigation.nextEl = ".swiper-button-next";
				prop.navigation.prevEl = ".swiper-button-prev";
			}
		}

		// lazy load
		if(wrap.find(".swiper-lazy-preloader").length > 0){
			prop.lazy = true;
		}

		// zoom
		if(wrap.find(".swiper-zoom-container").length > 0){
			prop.zoom = {
				maxRatio : 3
			}
			wrap.find(".frmNum .btnCtrl").bind("click", function(e){
				try{
					var btn = $(e.currentTarget),
					wr = btn.closest(".swiperWrap"),
					sw = wr.data("swiper"),
					pr = sw.params.zoom,
					sc = Math.round(sw.zoom.scale);

					if(btn.hasClass("btnIncr")){
						if(sc < 3){
							sc++;
							pr.maxRatio = sc;
						}else{
							pr.maxRatio = 3;
						}
						sw.zoom.in();

						pr.maxRatio = 3;
					}else{
						if(sc > 1){
							sc--;
							pr.maxRatio = sc;
						}else{
							pr.maxRatio = 1;
						}
						sw.zoom.in();

						pr.maxRatio = 3;
					}
				}catch(e){}
			});
		}

		// slide per view
		data = wrap.data("slidePerView");
		if(data === "auto" || (typeof(data) == "number" && !isNaN(data) && data > 1)){
			prop.slidesPerView = data;
		}

		// slide per group
		data = wrap.data("slidePerGroup");
		if(typeof(data) == "number" && !isNaN(data) && data > 1){
			prop.slidesPerGroup = data;
		}

		// centered slides
		data = wrap.data("centeredSlides");
		if(data === true || data === "true"){
			prop.centeredSlides = data;
		}

		// loop
		data = wrap.data("loop");
		if(data === true || data === "true"){
			prop.loop = true;
			evts.push({
				"name" : "transitionEnd",
				"func" : function(){
					if(this.isEnd){
						this.slideToLoop(0, 0);
					}
					if(this.isBeginning){
						this.slideToLoop(this.slides.length - 3, 0);
					}
				}
			});
		}

		var data = wrap.data("additionalSlides");
		if(typeof(data) == "number" && !isNaN(data) && data > 0){
			prop.loopAdditionalSlides = data;
		}

		// fade
		data = wrap.data("fade");
		if(data === true || data === "true"){
			prop.effect = "fade";
			prop.fadeEffect = {
				crossFade: true,
			};
		}

		// 랜덤으로 슬라이드 index 설정
		function randomizeSlides(){
			let cont = wrap.find(">.swiper-container"),
				ul = cont.find(">ul.swiper-wrapper"),
				lis = ul.find(">li"),
				rd = lis.not(".swiper-slide-duplicate").length;
			prop.initialSlide = Math.floor(Math.random()*(rd));
			wrap.find(".paging").find(".swiper-paging .current").text(prop.initialSlide + 1);
		}

		// random index - 클래스 추가 타입
		if(wrap.hasClass("active")){
			randomizeSlides();
		}

		// shuffle - 슬라이드를 무작위로 재배치
		data = wrap.data("shuffle");
		if(data === true || data === "true"){
			wrap.find(".swiper-wrapper").shuffle();
		}

		// coverflow
		let effect = wrap.data("effect");
		if(effect){
			prop.effect = effect;
			prop.grabCursor = true;
			prop.centeredSlides = true;
			if(effect === "coverflow"){
				prop.coverflowEffect = prop.coverflowEffect ? 
				{
					rotate: 0,
					stretch: 0,
					depth: prop.coverflowEffect.depth || 100,
        			modifier: prop.coverflowEffect.modifier || 2,
					slideShadows: true
				}
				:
				{
					rotate: 0,
					stretch: 0,
					depth: 100,
					modifier: 2,
					slideShadows: true
				};
			}
		}

		// autoplay
		data = wrap.data("autoplay");
		if(typeof(data) == "number" && !isNaN(data) && data > 0){
			if(old){
				prop.autoplay = data;
			} else{
				opt.observer = true;
				opt.observeParents = true;
				prop.observer = true;
				prop.observeParents = true;
				if($(this).is(".swiperWrap.visualBanner.typeV") === true){
					prop.autoplay = {
						delay : 5000,
						disableOnInteraction : false
					}
				} else{
					prop.autoplay = {
						delay : data,
						disableOnInteraction : false
					}
				}
				prop.pagination.clickable = true;
			}

			// 공동회원 가입 유도 팝업 오토롤링 제어
			if(wrap.closest(".mem_imp").length){
				let miPop = wrap.closest(".mem_imp").closest(".layPop"),
					memImp = miPop.find(".mem_imp"),
					sw = memImp.find("> .swiperWrap"),
					cont = sw.find("> .swiper-container"),
					pg = cont.find(".swiper-pagination");

				miPop.find("input[type='checkbox'], .btDetail").on("click",function(e){
					let s = $(e.currentTarget).closest(".swiperWrap").data("swiper");
					s.autoplay.stop();
				})

				setTimeout(function(){
					let bult = pg.find(".swiper-pagination-bullet"),
						bultLen = bult.length;

					if(bultLen == 1){
						setTimeout(function(){
							let s = memImp.find(" > .swiperWrap").data("swiper");
							sw.removeAttr("data-loop, data-autoplay");
							cont.addClass("swiper-no-swiping");
							s.autoplay.stop();
						},10)
					}
				},100)
			}

			wrap.find(".swiper-autoControls button").unbind("click.swiper").bind("click.swiper", function(e){
				try{
					var s = $(e.currentTarget).closest(".swiperWrap").data("swiper"),
						w = $(e.currentTarget).closest(".swiper-autoControls");
					if(s.autoplay.running){
						s.autoplay.stop();
						w.addClass("paused");

						// 메인, 지점 메인 공지 팝업 노출시 빅배너 스와이프 멈춤
						if($(".notiPop.on").length){
							s.autoplay.stop();
							w.addClass("paused");
						}
					}else{
						s.autoplay.start();
						w.removeClass("paused");

						// 메인, 지점 메인 공지 팝업 노출시 빅배너 스와이프 멈춤
						if($(".notiPop.on").length){
							s.autoplay.stop();
							w.addClass("paused");
						}
					}
				}catch(e){}
			});
		}

		// direction
		prop.direction = ((wrap.data("direction") === "vertical") ? "vertical" : "horizontal");

		// space
		data = wrap.data("spaceBetween");
		if(typeof(data) == "number" && !isNaN(data) && data > 0){
			prop.spaceBetween = data;

			// 추천상품 스페이스 옵션 변경
			if(wrap.closest(".mytypeComponent").length > 0){
				const mytypeComponent = wrap.closest(".mytypeComponent"),
					prodCont = mytypeComponent.find(".prodCont");
				
				prodCont.each(function(){
					const $this = $(this);
					if(!$this.find(".optionBtns").length > 0){
						prop.spaceBetween = 15;
					}
				})
			}
		}

		// autoHeight
		if(wrap.hasClass("autoHeight")){
			prop.autoHeight = true;
		}

		// free mode
		data = wrap.data("freeMode");
		if(data === true || data === "true" || navigator.appVersion.indexOf("MSIE 9") > -1){
			prop.freeMode = true;
		}

		// cube effect
		data = wrap.data("cube");
		if(data === true || data === "true"){
			prop.effect = "cube";
			prop.grabCursor = true;
			prop.cubeEffect = {
				shadow: true,
				slideShadows: true,
				shadowOffset: 20,
				shadowScale: 0.94,
			};
		}

		// initial slide
		data = wrap.data("initial");
		if(typeof(data) == "number" && !isNaN(data) && data >= 0){
			prop.initialSlide = data;
		}

		// 컨트롤러
		data = wrap.data("targetTab");
		if(typeof(data) != "undefined"){
			evts.push({
				"name" : "slideChange",
				"func" : function(){
					var tab = $($(this.$el).closest(".swiperWrap").data("targetTab")),
					fn = tab.data("setTabIndex");

					if(typeof(fn) == "function"){
						fn(this.realIndex, tab);
					}
				}
			});
		}

		// 스와이프 내부 인라인 비디오 있는 경우
		hasVideo = false;
		wrap.find(".swiper-slide .videoPlayButton").each(function(vidx, vitm){
			if($(this).hasClass("u682")){
				return;
			} else{
				if($(vitm).data("target") !== "popup"){
					hasVideo = true;
				}
			}
		});
		if(hasVideo){
			// 스와이프 시에 재생중인 비디오 정지
			evts.push({
				"name" : "sliderMove",
				"func" : function(e){
					var vid = $(e.currentTarget).find(".videoPlayer.playing");
					if(vid.length > 0){
						vid.data("instance").stop();
					}
				}
			});
		}

		if(old){
			prop.onSlideChangeEnd = onSlideChange;
			prop.onSlideChangeStart = onSlideChange;
			prop.onSetWrapperTransform = onTransition;
			prop.onSetWrapperTransition = onTransition;
		}

		if(wrap.find(".swiper-slide").length <= 1){
			if(wrap.find(".swiper-zoom-container").length <= 0){
				wrap.addClass("swiper-no-swiping");
				wrap.addClass("hideSwiperControl");
			}
			prop.autoplay = false;
			prop.loop = false;
		}
		if(wrap.closest(".main_quickMnArea").length > 0){
			if(wrap.find(".swiper-slide").length <= 5){
				wrap.addClass("swiper-no-swiping");
				wrap.addClass("hideSwiperControl");
			}
		}

		if(wrap.hasClass("swiperEventFull") && wrap.data("slidePerView") == "2.019" && wrap.find(".swiper-slide").length <= 2){
			wrap.addClass("swiper-no-swiping");
		}

		cont = wrap.find(".swiper-container");
		if(cont.length > 1){
			cont = cont.eq(0);
		}
		if(old){
			var iecls = "swiperIE" + getSerialNumber();
			cont.addClass(iecls);
			swiper = new Swiper("." + iecls, prop);
		}else{
			swiper = new Swiper(cont, prop);
		}
		wrap.data("swiper", swiper);

		// nested swiper
		if(wrap.closest(".swiper-slide").length > 0){
			if(wrap.find(".swiper-slide").length <= 1){
				wrap.removeClass("swiper-no-swiping");
				swiper.allowSlideNext = false;
			}else{
				swiper.allowSlidePrev = false;
				evts.push(
					{
						"name" : "slideChange",
						"func" : function(){
							this.allowSlidePrev = ! this.isBeginning;
							this.allowSlideNext = ! this.isEnd;
						}
					}
				);
			}
		}

		if(old){
			onSlideChange(swiper);
		}

		// evtents
		if(!old){
			// 2.7.6은 이벤트 on 함수 지원 안함 (onSlideTouch, onSlideChangeStart/End 만 지원)
			len = evts.length;
			for(i=0; i<len; i++){
				obj = evts[i];
				swiper.on(obj.name, obj.func);
			}
			swiper.on("slideChange", function(){
				this.$el[0].dispatchEvent( (new CustomEvent("slideChange", { detail : {swiper : this, index : this.realIndex}, bubbles: true })) );
				// 스마일페이 주문서 페이지
				if(this.$el.parents(".smilePay").length){
					var smilePaySwiper = this.$el.closest(".swiperWrap"),
						smilePaySlideIdx = smilePaySwiper.find(".swiper-slide").eq(this.realIndex),
						boxSmileCash = $(".smilePay").find(".side > .box_smilecash"),
						cashFill = smilePaySlideIdx.find(".cashFill").length && !smilePaySlideIdx.find(".done").length,
						cashFillDone = smilePaySlideIdx.find(".done").length,
						smilecard = smilePaySlideIdx.find(".smilecard").length,
						plcc = smilePaySlideIdx.find(".plcc").length,
						bank = smilePaySlideIdx.find(".bank").length,
						flagShowEl = (smilePaySlideIdx.prev("li").find(".cashFill").length) ? true : false;// 현재 활성화된 슬라이드의 이전 슬라이드가 캐쉬충전결제 안내 슬라이드인지 확인

					if(flagShowEl){
						boxSmileCash.fadeIn();
					} else{
						boxSmileCash.fadeOut();
					}

					let cont, swp, slide, item, intFreeNum, curr;
					cont = this.$el;
					swp = cont.parents(".swiperWrap:not(.swiperBannerType)");
					slide = swp.find(".swiper-slide");

					if(swp.closest(".myPayList").length > 0){
						let combobox = swp.closest(".myPayList").find(".selInstallment").find("button");
						$(".intfree").remove();
						setTimeout(function(){
							curr = swp.find(".swiper-slide-active");
							item = curr.find(".payInfo");
							intFreeNum = item.attr("data-intfree");
							try{
								if(intFreeNum.length > 0){
									if(intFreeNum !== null){
										combobox.append("<span class='intfree'>최대 " + intFreeNum + "개월 무이자</span>");
									}
								}
							} catch(err){};
						},1)
					}
				}
			});

			swiper.on("slideChangeTransitionEnd", function(){
				// 쇼츠 메인 좌우 스와이퍼 영상 재생 관련
				if(this.$el.closest(".sshortsMain").length > 0 && this.$el.closest(".sshortsSwiper").length > 0){
					const updateVideos = () => {
						const activeSlide = $(this.slides[this.activeIndex]); // 현재 활성화된 슬라이드
						const videos = $(this.slides).find("video");

						videos.prop("muted", true);
			
						videos.each(function(){
							const $video = $(this);
							$video[0].pause();
							// $video[0].currentTime = 0;
							videos.closest("a").removeClass("pause");
							if($video.closest(".swiper-slide").is(activeSlide)){ // 활성 슬라이드의 비디오만 확인
								$video[0].play();
							}
						});
					};
					requestAnimationFrame(() => {
						requestAnimationFrame(updateVideos);
					});
				}

				// 쇼츠 상세 확인
				if(this.$el.closest(".sshortsDetail").length > 0 && this.$el.closest(".sshortsSwiper").length > 0){
					let hideControlTimeout;
					const updateVideos = () => {
						const activeSlide = $(this.slides[this.activeIndex]); // 현재 활성화된 슬라이드
						const videos = $(this.slides).find("video");
						const chkSound = videos.closest(".sshortsSwiper").find(".chkSound input[type='checkbox']");
			
						videos.prop("muted", true);
						chkSound.prop("checked", false);
			
						videos.each(function(){
							const $video = $(this);
							const $videoContent = $video.closest(".sshorts_content");
							$video[0].pause();
							$videoContent.removeClass("play stop hideControl");
							$video[0].currentTime = 0;
			
							if($video.closest(".swiper-slide").is(activeSlide)){ // 활성 슬라이드의 비디오만 확인
								$video[0].play().then(() => {
									$videoContent.addClass("play").removeClass("stop");
									clearTimeout(hideControlTimeout);
									hideControlTimeout = setTimeout(() => {
										if($videoContent.hasClass("play")){
											$videoContent.addClass("hideControl");
										}
									}, 3000);
								}).catch(e => {
									console.error("Video play failed:", e);
								});
							}
						});
					};
			
					// 다음 프레임에서 비디오 업데이트 실행
					requestAnimationFrame(() => {
						requestAnimationFrame(updateVideos);
					});
				}
			});
		}

		// controller
		data = wrap.data("targetSwiper");
		if(typeof(data) != "undefined"){
			arr.push({
				swiper : swiper,
				target : $(data)
			})
		}

		/* 알림 내부 스와이프 버튼 show/hide 기능 추가 */
		if(wrap.hasClass('swiperAlram')){
			var btn = wrap.find('button');
			var timeOut;
			btn.hide();
			wrap.unbind('touchstart.alram').bind('touchstart.alram',function(){
				var $this = $(this);
				btn.show();
				clearTimeout(timeOut);
				wrap.unbind('touchend.alram').bind('touchend.alram',function(){
					timeOut = setTimeout(function(){
						btn.hide();
					}, 3000);
				});
			});
		}
	});

	len = arr.length;
	for(i=0; i<len; i++){
		obj = arr[i];
		try{
			obj.swiper.controller.control = obj.target.data("swiper");
		}catch(e){}
	}
	/* 리뷰 상세 스와이프 이미지 없을 때 px 사이즈 적용 */
	$(window).on('resize.swiper',function(){
		if(wraps.hasClass('reviewSwipe')){
			wraps.find('.swiper-slide .vod > a').each(function(){
				var $this = $(this);
				$this.css({width:'',height:''});
				$this.width($(window).width());
				$this.height($this.closest('li').height());
			})
		}
	});
	$(window).trigger('resize.swiper')
};

$(function(){
	var notiPopSlide = $(".notiPopV211102 .swiper-container > .swiper-wrapper > .swiper-slide"),
		notiPopPaging = $(".notiPopV211102 .swiper-container > .paging");
	if(notiPopSlide.length === 1){
		notiPopPaging.css({display:"none"})
	}
})

function updateSwipers(targ){
	if($(".swiperWrap:not(.inited)").length > 0){
		initSwipers();
	}

	if((typeof(targ) == "undefined") || !(targ instanceof jQuery) || (targ.length  == 0)){
		targ = $("body");
	}

	setTimeout(function(){
		$(targ).find(".swiperWrap").each(function(idx, itm){
			var w = $(itm),
				s = w.data("swiper");
			if(w.find(".swiper-slide").length > 1){
				w.removeClass("swiper-no-swiping");
			}else{
				w.addClass("swiper-no-swiping");
			}
			if(typeof(s) != "undefined"){
				s.update();
			}
		});
	}, 1);
};

/* 정렬 조회기간 초기화 */
function initSortRange(target){
	var parent = $(target),
		terms;

	if(parent.length > 0){
		terms = parent.find(".termArea:not(.inited)");
	}else{
		terms = $(".termArea:not(.inited)");
	}
	terms.addClass("inited");

	terms.find("input[type=radio]").bind("click.sortRange", function(e){
		var btn = $(e.currentTarget),
			trg = btn.data("target");

		if(typeof(trg) != "undefined" && trg.length > 0){
			// 신규 타겟이 있는 경우
			btn.closest(".termArea").find("input[type=radio]").each(function(idx, itm){
				if(itm == btn.get(0)){
					$($(itm).data("target")).css("display", "block");
				}else{
					$($(itm).data("target")).css("display", "none");
				}
			});
		}else{
			// 기존 ID로 구분
			if(btn.attr("id").indexOf("sortingTerm") >= 0){
				btn.closest(".termArea").find(".calenWrap").css("display", "flex");
			}else{
				btn.closest(".termArea").find(".calenWrap").css("display", "none");
			}
		}
		LayerPopup.resize();
	});
};

/* 기타 간단한 스크립트 초기화 */
function initMiscellaneous(){
	// [로그인] SNS 리스트 더보기
	$(".snsList .moreArea button.snsMore").unbind("click.snslist").bind("click.snslist", function(e){
		$(e.currentTarget).attr("aria-expanded", true);
	});

	// [마이페이지] 신한은행 환전 통화선택 리스트 더보기 
	$(".shmoneyList .moreArea button.shmoneyMore").unbind("click.shmoneyList").bind("click.shmoneyList", function(e){
		$(e.currentTarget).attr("aria-expanded", true);
	});

	// 체크박스
	$(".frmSel input[type=checkbox]").each(function(idx, itm){
		var cb = $(itm);
		cb.unbind("change.formsel").bind("change.formsel", function(e){
			var cb = $(e.currentTarget),
				fs = cb.closest(".frmSel"),
				fw = cb.closest(".frmWrap");
			if(cb.is(":checked")){
				fs.addClass("cb_checked");
				fw.addClass("cb_checked");
				if($(this).closest(".inputPoint").length > 0){
					$(this).closest(".inputPoint").addClass("on");
				}
			}else{
				fs.removeClass("cb_checked");
				fw.removeClass("cb_checked");
				if($(this).closest(".inputPoint").length > 0){
					$(this).closest(".inputPoint").removeClass("on");
				}
			}
		});
		cb.trigger("change.formsel");
	});

	// 라디오
	var deselect_si;
	function deselectRadio(r){
		r.prop("checked", false);
		r.closest(".frmSel").removeClass("rd_checked");
		r.trigger("change");
	};

	$(".frmSel input[type=radio]").each(function(idx, itm){
		var r = $(itm);
		r.unbind("change.formsel").bind("change.formsel", function(e){
			var r = $(e.currentTarget),
				fs = r.closest(".frmSel"),
				fl = r.closest(".frmList"),
				ctr = r.attr("aria-controls"),
				id = r.attr("id");

			fs.addClass("rd_checked");
			fs.siblings(".frmSel").each(function(jdx, jtm){
				$(jtm).removeClass("rd_checked");
			});

			// aria-controls로 레이어 제어
			var tg = $("#" + ctr);
			tg.addClass("tabON");

			fs.siblings(".frmSel").each(function(jdx, jtm){
				var fss = $(jtm),
					jid = fss.find("input[type=radio][aria-controls]").attr("aria-controls"),
					jtg = $("#" + jid);

				fss.removeClass("rd_checked");
				jtg.removeClass("tabON");
			});

			// frmList 제어
			if(fl.length > 0 && typeof(id) != "undefined"){
				fl.attr("data-id", id);
			}
		});
	});
	$(".frmSel input[type=radio]").each(function(idx, itm){
		var rb = $(itm),
			fs = rb.closest(".frmSel");
		if(typeof(rb.attr("deselectable")) != "undefined"){
			fs.unbind("touchstart.deselect").bind("touchstart.deselect", function(e){
				var fs = $(e.currentTarget),
					rb = fs.find("input[type=radio]");
				rb.data("checkedBefore", rb.is(":checked"));
			});
			rb.unbind("click.deselect").bind("click.deselect", function(e){
				var rb = $(e.currentTarget);
				if(rb.data("checkedBefore") === true){
					deselectRadio(rb);
				}
			});
		}
	});

	// ABC/가나다
	var floater_id;
	$(".searchBrandList .list li a").unbind("click.searchBrandList").bind("click.searchBrandList", function(e){
		var floater = $(e.currentTarget).closest(".brandBtm").find(".selectToggle"),
			a = $(e.currentTarget),
			w = a.closest(".brandBtm").find(".cateBrandList"),
			h = a.attr("href"),
			t, li, lc, os;

		clearTimeout(floater_id);
		floater.css("display", "none");
		floater.text(a.text());
		setTimeout(function(){
			floater.css("display", "block");
		}, 1);
		floater_id = setTimeout(function(){
			floater.css("display", "none");
		}, 4000);

		try{
			if(h.indexOf("javascript") >= 0){ return false; }
			t = w.find(h);
			if(t.length > 0){
				li = t.closest("li");
				if(li.length == 0 && t.parent().hasClass("brandSearchList")){
					li = t;
				}

				if(w.height() >= w.get(0).scrollHeight){
					// 페이지 스크롤
					lc = w.closest(".lCont");
					if(lc.length > 0){
						lc.scrollTop(li.offset().top - lc.offset().top + lc.scrollTop());
					}else{
						os = 0;
						if($("#header").length > 0){
							os = $("#header").outerHeight();
						}
						if($(".fixedWrap:visible").length > 0){
							os += $(".fixedWrap:visible").outerHeight();
						}
						let $thisBranchWrap = $(this).closest(".branchWrap");
						let $branchDetail = $thisBranchWrap.find(".branchDetail.brandStoreInfo");
						let $brandTabs = $branchDetail.find(".brandTabs.u1286");
						let $specialOrderBrandTabs = $thisBranchWrap.find(".speicalOrderBrandTabs.u1286");
						let $trickEle = $brandTabs.find(".trickEle");
						let liOffsetTop = li.offset().top - os;
						let scrollToOffset;

						if($brandTabs.length > 0 || $specialOrderBrandTabs.length > 0){
							if(!$trickEle.length > 0){
								scrollToOffset = liOffsetTop - 46;
							} else if($specialOrderBrandTabs.length > 0){
								scrollToOffset = liOffsetTop - 45;
							} else{
								scrollToOffset = liOffsetTop - 45;
							}
						} else{
							scrollToOffset = liOffsetTop - 10;
						}
						GlobalScroll.scrollTo(scrollToOffset);
					}
				}else{
					// 레이어 스크롤
					w.scrollTop(li.position().top + w.scrollTop());
				}
				return false;
			}
		}catch(e){ console.warn(e) }
		return false;
	});

	// 트리링크
	$(".treeLink .btnLink").unbind("click.treelink").bind("click.treelink", function(e){
		var btn = $(e.currentTarget),
			tree = btn.closest(".treeLink"),
			aria = btn.attr("aria-selected");

		if(aria === true || aria === "true"){
			btn.attr("aria-selected", false)
				.attr("aria-expanded", false);
			tree.removeClass("opened");
		}else{
			var other = $(".treeLink .btnLink[aria-selected=true]");
			other.attr("aria-selected", false)
				.attr("aria-expanded", false);
			other.each(function(idx, itm){
				$(itm).closest(".treeLink").removeClass("opened");
			});

			btn.attr("aria-selected", true)
				.attr("aria-expanded", true);
			tree.addClass("opened");
		}
	});

	// 상품목록 장바구니버튼
	$(".btIco.icCart").unbind("click.prodList").bind("click.prodList", function(e){
		var btn = $(e.currentTarget);
		clearTimeout(btn.data("si"));
		btn.attr("aria-selected", true);
	});

	// 상품 카테고리 구분
	$(".categoryArea button").unbind("click.prodCate").bind("click.prodCate", function(e){
		var btn = $(e.currentTarget),
			li = btn.parent();
		if(btn.hasClass("on")){ return; }
		btn.addClass("on").attr("aria-expanded", true);
		li.siblings().find("button").removeClass("on").attr("aria-expanded", false);
	});

	function initFixTopList(){
		var ftl = $(".fixTopList"),
			head = $("#header"),
			ft = $(".fixedWrap"),
			list = $(".fixArea"),
			foot = $("footer"),
			h = 0,
			dif = 0;
		if(head.length > 0){
			h += head.outerHeight();
		}
		if(ft.length > 0){
			h += ft.outerHeight();
		}

		GlobalScroll.addListener(function(data){
			var s = data.scroll,
				ftl = $(".fixTopList:visible"),
				list = $(".fixArea:visible"),
				btn = $(".cateBrandList:visible");
			if(ftl.length == 0 || list.length == 0){ return; }

			if(s + h >= ftl.offset().top){
				ftl.addClass("fixed");
				list.addClass("fixed");
				if(list.closest(".branchWrap").find(".branchDetail.brandStoreInfo").find(".brandTabs.u1286").length > 0 || list.closest(".speicalOrderBrandTabs.u1286").length> 0){
					list.closest(".brandTabs.u1286").addClass("trickEle");
				}
				// 푸터로 밀어 올리기
				try{
					dif = (btn.offset().top + btn.outerHeight() - s) - (list.offset().top - dif - s + list.outerHeight());
					if(dif > 0){
						dif = 0;
					}
					list.css("transform", "translate(0, " + dif + "px)");
				}catch(e){}
			}else{
				ftl.removeClass("fixed");
				list.removeClass("fixed");
				list.css("transform", "translate(0, 0)");
				dif = 0;
				if(list.closest(".branchWrap").find(".branchDetail.brandStoreInfo").find(".brandTabs.u1286").length > 0){
					list.closest(".brandTabs.u1286").removeClass("trickEle");
				}
			}
		});

		$('.searchBrandList li a').unbind('click.searchbrand').bind('click.searchbrand',function(){
			list.addClass("up");
			setTimeout(function(){
				list.removeClass("up");
			}, 4000);
		});
	};// initFixTopList
	if($(".fixTopList").length > 0){
		// initFixTopList();
		$(document).ready(function(){
			initFixTopList();
		})
	};

	if($(".lCont .searchBrandList:visible").length > 0){
		$(".lCont .searchBrandList:visible").closest(".lCont").unbind("scroll.searchbrand").bind("scroll.searchbrand", function(e){
			var lc = $(e.currentTarget),
				list = lc.find(".searchBrandList"),
				btm = lc.find(".brandBtm"),
				btn = list.siblings(".toggleBt"),
				css = {
					"position" : "",
					"top" : "",
					"right" : ""
				},
				css2 = {
					"position" : "",
					"top" : "",
					"right" : ""
				};

			if(btm.position().top >= 0){
				css.position = "";
				css.top = "";
				css.right = "";
				css2.position = "";
				css2.top = "";
				css2.right = "";
			}else{
				css.position = "absolute";
				css.top = lc.scrollTop() - 75;
				css.right = 0;
				css2.position = "absolute";
				css2.top = lc.scrollTop() - 75 + 10;
				css2.right = 10;
			}
			list.css(css);
			btn.css(css2);
		});
	}

	// 주문서, 옵션레이어 고정
	if($(".orderOption").length > 0){
		GlobalScroll.addListener(function(data){
			if($(".orderOption").offset().top - data.scroll - data.winHeight < -140){
				$(".optionArea.orderFloating").css("display", "none");
			}else{
				$(".optionArea.orderFloating").css("display", "block");

				// 앱카드 간편결제
				// 만약 body에 appCardlayerOpen 클래스가 있으면 orderFloating을 닫는다.
				if($("body").hasClass("appCardlayerOpen")){
					$(".optionArea.orderFloating").css("display", "none");
				}
			}
			if($(".orderFloating").css("display") == "none"){
				$("body").addClass("floatingBody");
			}else{
				$("body").removeClass("floatingBody");
			}
		});
	}
};

function initSelectBox(wrap){
	var sels;
	if(wrap instanceof jQuery){
		sels = wrap.find(".selectWrap");
	}else{
		sels = $(".selectWrap");
	}
	sels.each(function(){
		SelectMenu.update($(this).find('select'));
	});
};// initSelectBox

/* 드래그해서 닫기 영역 추가하기 */
function initDragDownArea(){
	var $win = $(window),
		template = '<div class="dragDownArea"></div>',
		div, btn, touchTarget, touchStartX, touchStartY;
	// 아이폰 드래그 버그 대응
	// 다른곳 터치하여 영역으로 들어와도 touchStart 실행됨
	$win.unbind("touchstart.dragdown").bind("touchstart.dragdown", function(e){});

	$(".dragDownWrapper").each(function(idx, itm){
		var target = $(itm);
		if(target.find(">.dragDownArea").length > 0){ return; }

		div = $(template);
		btn = target.find(">.dragDownClose");
		if(btn.length > 0){
			btn.before(div);
		}else{
			target.append(div);
		}
		div.bind("touchstart.dragdown", touchStartPopup);
		/* 팝업 스위치 드래그 영역위로 오게 수정 */
		target.find('.frmSwitch').css('z-index','101');
	});

	function touchStartPopup(e){
		e.preventDefault();
		$win.bind("touchmove.dragdown", touchMovePopup);
		$win.bind("touchend.dragdown", touchEndPopup);
		touchTarget = $(e.currentTarget);
		touchStartX = e.originalEvent.touches[0].screenX;
		touchStartY = e.originalEvent.touches[0].screenY;
	};

	function touchMovePopup(e){
		var x = e.originalEvent.touches[0].screenX,
			y = e.originalEvent.touches[0].screenY,
			dx = x - touchStartX,
			dy = y - touchStartY,
			d = Math.sqrt(dx * dx + dy * dy),
			a = Math.atan2(dy, dx) * 180 / Math.PI;

		if(a >= 45 && a <= 135){
			if(dy > 50){
				touchEndPopup();
				touchTarget.siblings(".dragDownClose").trigger("click");
			}
		}else{
			if(d > 20){
				touchEndPopup();
			}
		}
	};

	function touchEndPopup(){
		$win.unbind("touchmove.dragdown", touchMovePopup);
		$win.unbind("touchend.dragdown", touchEndPopup);
	};

	// 3시간 전 페이지 출국정보 레이어 팝업 온오프
	const threeHoursLayer = $("#threeHours_layer");
	const bodyElement = $("body");
	const toggleLayer = (isVisible) => {
		const method = isVisible ? "addClass" : "removeClass";
		setBodyNoScrolling(isVisible);
		bodyElement[method]("layerPopupOpened bodyStatic");
		threeHoursLayer[method]("on");
	};
	const set3HoursBtns = () => {
		$("#threeHoursLayerPopup").on("click", () => toggleLayer(true));
		threeHoursLayer.find(".closeL").on("click", () => toggleLayer(false));
		$(document).on("click", "#threeHoursSet", () => toggleLayer(false));
	};
	set3HoursBtns();
};

var bodyScrollingCount = 0;
function setBodyNoScrolling(flag){
	if(flag){
		bodyScrollingCount++;
	}else{
		if(bodyScrollingCount > 0){
			bodyScrollingCount--;
		}
	}
	if(bodyScrollingCount > 0){
		$("body").addClass("noscrolling");
	}else{
		$("body").removeClass("noscrolling");
	}
};

var hideDimmCount = 0;
var popStat = 0;
function hidePopupDimm(flag, ispop, type){
	var cnt = hideDimmCount;
	if(flag){
		hideDimmCount++;
	}else{
		if(hideDimmCount > 0){
			hideDimmCount--;
		}
	}

	/* 팝업 출력 후 셀렉트 박스 출력 시 */
	var len = $(".layPop.on").length;
	if(len > 0 && type == 'select'){
		if(hideDimmCount > 1){
			$("body").addClass("hidePopupDimm");
		}else{
			$("body").removeClass("hidePopupDimm");
		}
	}

	var btmProdType = $(".promotionType .btmProdType.imp");
	if(cnt == 0 && hideDimmCount > 0){
		if(ispop !== true){
			if(btmProdType.length > 0){
				$(".container").css({"z-index":"98"});
				$(".swiperEventFull .swiper-container").css({"z-index":"0"});
				btmProdType.css({"z-index":"100"});
				$(".prodCont .optionBtns").css({"z-index":"98"});
				if($("#header").length > 0){
					$("#wrapper").append("<div class='headerDimm' style='position:fixed;left:0;top:0;width:100%;height:60px;z-index:100;background:rgba(0, 0, 0, .7)'></div>");
				}
			}
			$("body").addClass("hidePopupDimm");
		}
		// callAppScheme
		// 팝업이 show 되면 header와 dockbar는 hide되는데
		// args로 header를 show할지 여부를 전달한다.
		if(event.target.className == "btExtend"){
			callAppScheme({
				"group" : "popup",
				"function" : "show",
				"args" : {"header":"show"}
			});
		} else{
			callAppScheme({
				"group" : "popup",
				"function" : "show"
			});
		}
		
		// 신구단 selectbox를 클릭하면 앱헤더를 숨김 처리한다.
		var u651PopOnlayPopFull = $(event.currentTarget).closest(".u651Pop.on.layPopFull");
		if(u651PopOnlayPopFull.length > 0){
			callAppScheme({
				"group" : "popup",
				"function" : "show"
			});
		}
	}else if(cnt > 0 && hideDimmCount == 0){
		if(ispop !== true){
			if(btmProdType.length > 0){
				$(".container").css({"z-index":""});
				$(".swiperEventFull .swiper-container").css({"z-index":""});
				btmProdType.css({"z-index":""});
				$(".prodCont .optionBtns").css({"z-index":""});
				$(".headerDimm").remove();
			}
			$("body").removeClass("hidePopupDimm");
		}
		callAppScheme({
			"group" : "popup",
			"function" : "hide"
		});
	}
};

// 앱 호출
function callAppScheme(obj){
	try{
		if(overpass.global.isApp){
			fnAppScheme(obj);
		}
	}catch(e){}
};

var VideoPlayer = function(param){
	var template = '<div class="videoPlayer">';
		template += '<div class="youtube"><div></div></div>';
		template += '<div class="mp4">';
			template += '<video autoplay="true" playsinline muted>';
				template += '<source type="video/mp4">';
			template += '</video>';
			template += '<div class="vp_control">';
				template += '<a class="vp_play_btn" /></a>';
				template += '<button type="button" class="vp_fullscreen" /></button>';
				template += '<button type="button" class="vp_sound muted" /></button>';
				template += '<div class="vp_time"><span class="vp_cur"></span> / <span class="vp_dur"></span></div>';
				template += '<div class="vp_progress"><div class="vp_progbar"></div></div>';
			template += '</div>';
			template += '<a class="vp_cover"></a>';
		template += '</div>';
	template += '</div>';

	var isYoutube = false,
		playing = false,
		player, playerWrap, cover, prog, youtube, video, source, vid, cur, dur, bar, si, vurl, purl, media, control;
	var me = this;
	var forApp = $(".forApp").length;

	function init(){
		player = $(template);
		playerWrap = player.find(".videoPlayer");
		video = player.find("video");
		cover = player.find(".vp_cover");
		vid = video.get(0);
		cur = player.find(".vp_cur");
		dur = player.find(".vp_dur");
		prog = player.find(".vp_progress");
		bar = player.find(".vp_progbar");
		source = player.find("video source");
		control = player.find(".vp_control");

		if(typeof(param) != "undefined" && (param.auto === true || param.auto === "true")){
			vid.muted = true;
		}

		// App의 웹뷰 페이지에서는 음소거 모드여야 자동 재생 가능
		if(forApp){
			vid.muted = true;
		}

		video.bind("loadeddata", function(){
			if(video.closest(".userPlay").length > 0){
				setTimeout(() => {
					const playBtn = video.closest(".userPlay").find(".vp_play_btn");
					playBtn.trigger("click");
					const userPlay = playBtn.closest(".userPlay");
					if(userPlay.attr("data-autoplay") === "true"){
						userPlay.attr("data-autoplay", "false");
						video.attr("data-autoplay", "false");
						setTimeout(() => {
							video.removeAttr("data-autoplay autoplay muted");
						}, 1);
						if(vid.muted){
							vid.muted = false;
							playBtn.removeClass("muted");
						}
					}
				});
			}
			updateTime();
			var p = player.parent(),
				h = video.prop("videoHeight"),
				w = video.prop("videoWidth"),
				W = player.width(),
				vh = Math.ceil(h / w * W),
				H = p.height(),
				thumbH = p.find("a > img").height();
			if(vh >= H){
				player.height(vh);//h
				if(player.height() == "0"){
					player.height(thumbH);
				} else{
					player.height(vh);//h
				}
			}else{
				player.height(vh);//h
				if(player.height() == "0"){
					player.height(thumbH);
				} else{
					player.height(vh);//h
				}
			}
			play();
		});

		video.bind("pause play", function(e){
			clearTimeout(si);
			if(e.type == "play"){
				player.addClass("playing");
				playing = true;
				si = setTimeout(hideControl, 3000);
			}else{
				playing = false;
				player.removeClass("playing hide_ctr");
			}
		});

		control.find(".vp_fullscreen").on("click", function(event){
			if(VideoPopup.open){
				$(this).parents(".layPop.on").remove();
				$("body").removeClass("noscrolling");
				var hasDataTarget = $(".videoArea.open").data("target");
				if(hasDataTarget){
					//alert(1);
				} else{
					var curTime2 = vid.currentTime;
					$(".hidden").text(curTime2);
					$(".videoArea.open").find("video")[0].currentTime = curTime2;
				}
			}else{
				VideoPopup.open;
			}
		});

		control.find("button.vp_sound").unbind("click").bind("click", function(){
			var vid = $(this).parents('.videoPlayer').find('video');
			if(vid.prop('muted')){
				vid.prop('muted', false);
				$(this).removeClass('muted');
			} else{
				vid.prop('muted', true);
				$(this).addClass('muted');
			}
		});

		player.find(".vp_play_btn").bind("click", function(){
			if(vid.paused){
				play();
			}else{
				pause();
			}
		});

		video.bind("timeupdate", function(){
			updateTime(vid.currentTime, cur);
		});

		prog.bind("touchstart.videoplayer", function(e){
			e.preventDefault();
			clearTimeout(si);
			player.removeClass("hide_ctr");

			var played = false;

			$(document).unbind("touchmove.videoplayer touchend.videoplayer").bind("touchmove.videoplayer touchend.videoplayer", function(E){
				var e = E.originalEvent,
					w = prog.width(),
					l = prog.offset().left,
					x, t;

				if(e.touches.length > 0){
					if(playing == true){
						played = true;
						pause();
					}
					x = e.touches[0].clientX - l;
					if(x < 0){
						x = 0;
					}else if(x > w){
						x = w;
					}
					t = Math.round(x / w * vid.duration);
					vid.currentTime = t;
				}

				if(e.type == "touchend"){
					$(document).unbind("touchmove.videoplayer touchend.videoplayer");
					if(played){
						played = false;
						play();
						si = setTimeout(hideControl, 3000);
					}
				}
			})
		})

		cover.bind("click", function(){
			clearTimeout(si);
			player.removeClass("hide_ctr");
			si = setTimeout(hideControl, 3000);
		})

		$(document).on("click",".videoPlayButton.imp .vp_fullscreen",function(){
			clearTimeout(si);
			player.removeClass("hide_ctr");
			si = setTimeout(hideControl, 3000);
		})

		$(document).on("click",".videoPlayButton.imp .vp_sound",function(){
			clearTimeout(si);
			player.removeClass("hide_ctr");
			si = setTimeout(hideControl, 3000);
		})

		GlobalScroll.addListener(function(data){
			if(playing != true){ return; }

			var t = player.offset().top - data.scroll,
				b = t + player.height();

			if(t < 0 || b > data.winHeight){
				if(player.closest(".videoPlayButton").hasClass("imp open")){
					if(player.closest(".videoPlayButton").data("target") == "popup"){
						if(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement){
							return;
						} else{
							pause();
						}
					}
					if(typeof(player.closest(".videoPlayButton").data("target")) == "undefined"){
						if(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement){
							return;
						} else{
							pause();
						}
					}
				} else{
					if(player.closest(".videoPlayButton").hasClass("u682 open")){
						return;
					} else{
						pause();
					}
				}
			}
		});
	};

	function play(){
		pauseAll();
		if(isYoutube){
			if(typeof(youtube) != "undefined"){
				youtube.playVideo();
			}
		}else{
			vid.play();
		}
	};

	function pause(){
		if(isYoutube){
			if(typeof(youtube) != "undefined"){
				youtube.pauseVideo();
			}
		}else{
			vid.pause();
		}
	};

	// 재생중인 비디오 모두 정지
	function pauseAll(targ){
		$(".videoPlayer").each(function(idx, itm){
			if($(itm).data("instance") !== targ){
				$(itm).data("instance").stop();
			}
		});
	};

	// 비디오 컨트롤바 가리기
	function hideControl(){
		player.addClass("hide_ctr");
	};

	// 재생시간 업데이트
	function updateTime(){
		var c = vid.currentTime,
			d = vid.duration,
			mc = Math.floor(c / 60),
			sc = Math.floor(c % 60),
			md = Math.floor(d / 60),
			sd = Math.floor(d % 60),
			p = c / d * 100;

		cur.text(mc + ":" + getTwoDigit(sc));
		dur.text(md + ":" + getTwoDigit(sd));
		bar.css("width", p + "%");

		if(c >= d){
			var curVid = $(".videoPlayButton.imp.open"),
				player = curVid.find(".videoPlayer"),
				controls = curVid.find(".vp_fullscreen, .vp_sound");
			curVid.removeClass("open");
			player.remove();
			controls.remove();
		}
	};

	// 유튜브 API 로드완료
	function onYouTubeIframeAPIReady(){
		VideoPlayer.isYoutubeReady = true;
		$.each(VideoPlayer.youtubeList, function(idx, itm){
			itm.instance.load({
				video : itm.url,
				media : "youtube"
			});
		});
	};

	// 유튜브 초기화 하기
	function loadYoutubeAPI(url){
		if(typeof(VideoPlayer.youtubeList) == "undefined"){
			VideoPlayer.youtubeList = [];
		}
		VideoPlayer.youtubeList.push({
			instance : me,
			player : player,
			url : url
		});

		if(typeof(VideoPlayer.isYoutubeReady) == "undefined"){
			window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
			var tag = document.createElement("script");
			tag.src = "https://www.youtube.com/iframe_api";
			var firstScriptTag = document.getElementsByTagName("script")[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
		}
	};

	this.load = function(param){
		if(typeof(param) != "undefined"){
			vurl = param.video;
			purl = param.poster;
			media = param.media;
			if(param.target === "inline" && media === "youtube" && typeof(param.ratio) != "undefined"){
				player.find(".youtube").css("padding-top", param.ratio + "%");
			}
		}

		if(media === "youtube"){
			isYoutube = true;
			player.addClass("youtube");
			player.removeClass("mp4");
			if(typeof(VideoPlayer.isYoutubeReady) == "undefined"){
				loadYoutubeAPI(vurl);
			}else{
				youtube = new YT.Player(player.find(".youtube > div").get(0) , {
					height: "100%",
					width: "100%",
					playsinline : 1,
					videoId: vurl,
					events: {
						"onReady": YTonPlayerReady,
						"onStateChange": function(e){
							if(e.data == YT.PlayerState.PLAYING){
								playing = true;
								pauseAll(me);
							}else{
								playing = false;
							}
						}
					}
				});

				function YTonPlayerReady(){
					play();
					if(forApp){
						youtube.mute();
					}
					if(player.closest(".videoPlayButton.imp.typeYTB[data-target='popup']").length){
						var btnYTBFullscreen = player.find(".youtube");
						btnYTBFullscreen.on("click",function(){
							$(this).append("<div class='btn'></div>");
							function openFullscreenYTB(){
								setTimeout(function(){
									var iframe = player.find("iframe");
									function makeLandscapeYTB(){
										if(screen.orientation && screen.orientation.lock){
											setTimeout(function(){
												screen.orientation.lock('landscape');
											},300)
										}
									}
									iframe.webkitEnterFullscreen();
									makeLandscapeYTB();
									if(iframe.requestFullscreen){
										iframe.requestFullscreen();
										makeLandscapeYTB();
									} else if(iframe.mozRequestFullScreen){
										iframe.mozRequestFullScreen();
										makeLandscapeYTB();
									} else if(iframe.webkitRequestFullscreen){
										iframe.webkitRequestFullscreen();
										makeLandscapeYTB();
									} else if(iframe.msRequestFullscreen){
										iframe.msRequestFullscreen();
										makeLandscapeYTB();
									}
								},250)
							}
							openFullscreenYTB();
						});
						btnYTBFullscreen.click();
					}
				}
			}
		}else{
			isYoutube = false;
			player.removeClass("youtube");
			player.addClass("mp4");
			if(typeof(vurl) == "string"){
				source.attr("src", vurl);
			}
			if(typeof(purl) == "string"){
				video.attr("poster", purl);
			}
			setTimeout(() => {
				const videoComponentWrap = player.closest(".videoComponentWrap");
				const vidContent = videoComponentWrap.find(".content");
				if(vidContent.length > 0){
					const contentCopy = vidContent.clone(true);
				    const vpControlInMp4 = $(".vp_control").closest(".mp4");
				    vpControlInMp4.find(".content").remove();
				    vpControlInMp4.append(contentCopy);
				}
			})
		}
	};
	me.play = play;
	me.stop = pause;

	if(typeof(VideoPlayer.pauseAll) == "undefined"){
		VideoPlayer.pauseAll = pauseAll;
	}

	$("button.vp_sound").unbind("click").bind("click", function(){
		var vid = $(this).closest('.videoPlayer').find('video');
		if(vid.prop('muted')){
			vid.prop('muted', false);
			$(this).removeClass('muted');
		} else{
			vid.prop('muted', true);
			$(this).addClass('muted');
		}
	});

	init();
	me.load(param);
	me.gui = player;
	player.data("instance", this);

	return this;
};// 비디오 플레이어

/**
 * 비디오 팝업 레이어 열기
 * @param targ 비디오 썸네일 버튼
 */
var VideoPopup = function(){
	var template = '<section class="layPop layPopFull blackType on" tabindex="0">';
		template += '<h2 class="titLay"></h2>';
		template += '<div class="layCont">';
			template += '<div class="lCont" tabindex="0">';
				template += '<div class="vodPopup">';
					template += '<div class="vodArea"></div>';
				template += '</div>';
			template += '</div>';
		template += '</div>';
		template += '<button type="button" class="closeL">닫기</button>';
	template += '</section>';

	var body = $("body"),
		overflow, popup, player;

	/* 비디오 팝업 초기화 */
	function initPopup(){
		if(typeof(popup) == "undefined"){
			popup = $(template);
			popup.find(".closeL").bind("click", VideoPopup.close);
			player = new VideoPlayer();
			popup.find(".vodArea").append(player.gui);
		}
	};
	/**
	 * 비디오 팝업 열기
	 * @param {string}	param.vurl	- 비디오 URL
	 * @param {string}	param.purl	- 포스터 URL
	 * @param {string}	param.media	- 유튜브
	 * @param {string}	param.title	- 동영상 제목
	 */

	VideoPopup.open = function(param){
		initPopup();

		// 공식스토어 메인, 가운데 정렬
		setTimeout(function(){
			if($(".brandList.typeFrame").length > 0){
				popup.find(".vodPopup").css({left:0, right:0});
				var y = popup.find(".videoPlayer.youtube:visible");
				if(y.length > 0){
					var yy = y.find(".youtube");
					var h = (y.height() - y.width() * 0.75) / 2;
					if(h > 0){
						yy.css("transform", "translate(0, " + h + "px)");
					}
				}
			}
		}, 100);
		// 공식스토어 메인, 가운데 정렬

		VideoPlayer.pauseAll();
		body.append(popup);
		setBodyNoScrolling(true);
		if(typeof(param) != "undefined" && typeof(param.title) == "string"){
			popup.find(".titLay").text(param.title);
		}else{
			popup.find(".titLay").text("동영상");
		}
		player.load(param);
	};

	VideoPopup.close = function(){
		initPopup();
		player.stop();
		setBodyNoScrolling(false);
		popup.remove();
		$("body").removeClass("noscrolling");
		var forApp = $(".forApp").length;
		if(forApp){
			window.close();
		}
	};

	// 메인 동영상 팝업 제어
	setTimeout(function(){
		if($(".layPop").hasClass("imp")){
			$(function(){
				var videoPlayer = $(".layPop.on.imp .videoPlayer");
				var forApp = $(".forApp").length;
				var template = `
				<div class="vidBtnArea">
					<a class="vp_play_btn"></a>
					<button type="button" class="vp_fullscreen">전체화면</button>
					<button type="button" class="vp_sound">사운드</button>
				</div>
				`;
				setTimeout(function(){
					videoPlayer.append(template);
					var vp_fullscreen = $(".layPop .vodPopup .videoPlayer .vidBtnArea .vp_fullscreen");
					var vp_sound = popup.find(".vp_sound");
					if(videoPlayer.closest(".layPop").hasClass("vertical")){
						vp_fullscreen.remove();
					}
					if(forApp){
						vp_sound.addClass("muted");
					}
				},1)

				$(videoPlayer).off("click",".vidBtnArea button, .vidBtnArea > a").on("click",".vidBtnArea button, .vidBtnArea > a",function(){
					var $this = $(this);
					if($this.hasClass("vp_sound")){
						var vid = $(this).closest('.videoPlayer').find('video');
						if(vid.prop('muted')){
							vid.prop('muted', false);
							$(this).removeClass('muted');
						} else{
							vid.prop('muted', true);
							$(this).addClass('muted');
						}
					} else if($this.hasClass("vp_play_btn")){
						var vid = $(this).closest('.videoPlayer').find('video').get(0);
						if(vid.paused){
							player.play();
						}else{
							player.stop();
						}
					} else if($this.hasClass("vp_fullscreen")){
						var layPopMain = $(this).closest(".layPop.imp");
						if(layPopMain.hasClass("rotate")){
							layPopMain.removeClass("rotate");
						} else{
							layPopMain.addClass("rotate");
						}
					}
				})
			})
		}
	},1)
	return this;
};

// App용 동영상 영역 자동 재생, 팝업 닫기
$(document).ready(function(){
	var forApp = $(".forApp").length;
	if(forApp){
		setTimeout(function(){
			$(".videoPlayButton > a").click();
		},1)
	}
})

var iframeVideoPopup = function(){
	var template = '<section class="layPop layPopFull blackType on" tabindex="0">';
		template += '<h2 class="titLay"></h2>';
		template += '<div class="layCont">';
			template += '<div class="lCont" tabindex="0">';
				template += '<div class="vodPopup">';
					template += '<div class="vodArea"></div>';
				template += '</div>';
			template += '</div>';
		template += '</div>';
		template += '<button type="button" class="closeL">닫기</button>';
	template += '</section>';

	var body = $("body"),
		overflow, popup, player;

	/* 비디오 팝업 초기화 */
	function initPopup(){
		if(typeof(popup) == "undefined"){
			popup = $(template);
			popup.find(".closeL").bind("click", iframeVideoPopup.close);
			player = new VideoPlayer();
			popup.find(".vodArea").append(player.gui);
		}
	};

	/**
	 * 비디오 팝업 열기
	 * @param {string}	param.vurl	- 비디오 URL
	 * @param {string}	param.purl	- 포스터 URL
	 * @param {string}	param.media	- 유튜브
	 * @param {string}	param.title	- 동영상 제목
	 */
	iframeVideoPopup.open = function(param){
		initPopup();

		// 공식스토어 메인, 가운데 정렬
		setTimeout(function(){
			if($(".brandList.typeFrame").length > 0){
				popup.find(".vodPopup").css({left:0, right:0});
				var y = popup.find(".videoPlayer.youtube:visible");
				if(y.length > 0){
					var yy = y.find(".youtube");
					var h = (y.height() - y.width() * 0.75) / 2;
					if(h > 0){
						yy.css("transform", "translate(0, " + h + "px)");
					}
				}
			}
		}, 100);
		// 공식스토어 메인, 가운데 정렬
		VideoPlayer.pauseAll();
		body.append(popup);
		setBodyNoScrolling(true);
		if(typeof(param) != "undefined" && typeof(param.title) == "string"){
			popup.find(".titLay").text(param.title);
		}else{
			popup.find(".titLay").text("동영상");
		}
		player.load(param);
	};

	iframeVideoPopup.close = function(){
		player.stop();
		setBodyNoScrolling(false);
		popup.remove();
		$("body").removeClass("noscrolling");
	};
	return this;
};

// 동영상 전체 화면보기 상태 체크
$(document).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange', function(){
	var isFullScreen = document.fullScreen || document.mozFullScreen ||	document.webkitIsFullScreen || (document.msFullscreenElement != null);
	if(isFullScreen){
		$(".videoPlayButton.imp.open").addClass("full");
	} else{
		$(".videoPlayButton.imp.open").removeClass("full");
	}
})

function initVideoPlayers(){
	$(".videoPlayButton > a").unbind("click.videoplayer").bind("click.videoplayer", function(e){
		var btn = $(e.currentTarget),
			wrap = btn.closest(".videoPlayButton, .videoBox, .videoBox .iframeVideoWrap"),
			forApp = $(".forApp").length;
		$(".videoArea").removeClass("open");
		$(this).closest(".videoArea").addClass("open");

		if(wrap.data("target") == "popup"){
			// 개선 동영상 팝업인 경우에 실행
			if(wrap.hasClass("imp") && wrap.hasClass("typeYTB") == false){
				var ratio = wrap.height() / wrap.width() * 100;
				var player = new VideoPlayer({
					video : wrap.data("video"),
					poster : wrap.data("poster"),
					media : wrap.data("media"),
					auto : wrap.data("autoplay"),
					ratio : ratio,
					target : "popup"
				});

				var notVidEditInlineBtn = wrap.closest("body").find(".videoPlayButton.imp");
				notVidEditInlineBtn.removeClass("open");
				notVidEditInlineBtn.find(".videoPlayer").remove();
				wrap.data("player", player);
				wrap.append(player.gui);

				var elem = wrap.find("video").get(0);
				var player = wrap.find(".videoPlayer");

				setTimeout(function(){
					wrap.addClass("open");
					elem.play();
				},200)

				function openFullscreen(){
					setTimeout(function(){
						var elem = wrap.find("video").get(0);
						elem.webkitEnterFullscreen();
						if(elem.requestFullscreen){
							elem.webkitEnterFullscreen();
						} else if(elem.mozRequestFullScreen){
							elem.mozRequestFullScreen();
						} else if(elem.webkitRequestFullscreen){
							elem.webkitRequestFullscreen();
						} else if(elem.msRequestFullscreen){
							elem.msRequestFullscreen();
						}
					},250)
				}
				openFullscreen();

				// 전체화면 보기
				var btnFullscreen = wrap.find(".vp_fullscreen");
				btnFullscreen.on("click",function(){
					openFullscreen();
				})
			}
			// 유튜브 팝업 타입 개선
			else if(wrap.hasClass("imp") && wrap.hasClass("typeYTB")){
				var ratio = wrap.height() / wrap.width() * 100;
				var player = new VideoPlayer({
					video : wrap.data("video"),
					poster : wrap.data("poster"),
					media : wrap.data("media"),
					auto : wrap.data("autoplay"),
					ratio : ratio,
					target : "popup"
				});
				var notVidEditInlineBtn = wrap.closest("body").find(".videoPlayButton");
				notVidEditInlineBtn.removeClass("open");
				$(this).parents(".videoPlayButton").addClass("open");
				notVidEditInlineBtn.find(".videoPlayer").remove();
				wrap.data("player", player);
				wrap.append(player.gui);

			} else{
				// 기존 타입 팝업으로 열기
				if(typeof(VideoPopup.open == "undefined")){
					new VideoPopup();
				}
				VideoPopup.open({
					video : wrap.data("video"),
					poster : wrap.data("poster"),
					media : wrap.data("media"),
					auto : wrap.data("autoplay"),
					title : wrap.data("title")
				});
			}
		}else{

			// 인라인 재생 : data 타입이 player임이 확인되지 않거나 타겟이 확인되지 않을 때
			if(typeof(wrap.data("player")) == "undefined" || typeof(wrap.data("target")) == "undefined"){
				var ratio = wrap.height() / wrap.width() * 100;
				var player = new VideoPlayer({
					video : wrap.data("video"),
					poster : wrap.data("poster"),
					media : wrap.data("media"),
					auto : wrap.data("autoplay"),
					ratio : ratio,
					target : "inline"
				});

				// 개선 동영상이 아닌 경우에만 실행
				if(!wrap.hasClass("imp")){
					wrap.empty();
				}

				if(wrap.hasClass("typeYTB")){
					$(".videoPlayButton").find(".vp_fullscreen").remove();
					$(".videoPlayButton").find(".vp_sound").remove();
				}

				// 개선 직접 재생 동영상인 경우에 실행
				if(wrap.hasClass("imp") && wrap.hasClass("typeYTB") == false){
					var notVidEditInlineBtn = wrap.closest("body").find(".videoPlayButton.imp");
					notVidEditInlineBtn.removeClass("open");
					notVidEditInlineBtn.find(".videoPlayer").remove();
					wrap.data("player", player);
					wrap.append(player.gui);

					var elem = wrap.find("video").get(0);
					var player = wrap.find(".videoPlayer");

					setTimeout(function(){
						wrap.addClass("open");
						elem.play();
					},200)

					if(forApp){
						wrap.css({"opacity":"1"});
						wrap.find(".vp_sound").addClass("muted");
					}

					// 전체화면 보기
					var btnFullscreen = wrap.find(".vp_fullscreen");
					btnFullscreen.on("click",function(){
						function openFullscreen(){
							setTimeout(function(){
								var elem = wrap.find("video").get(0);
								elem.webkitEnterFullscreen();
								if(elem.requestFullscreen){
									elem.webkitEnterFullscreen();
								} else if(elem.mozRequestFullScreen){
									elem.mozRequestFullScreen();
								} else if(elem.webkitRequestFullscreen){
									elem.webkitRequestFullscreen();
								} else if(elem.msRequestFullscreen){
									elem.msRequestFullscreen();
								}
							},250)
						}
						openFullscreen();
					})
				} else{
					wrap.data("player", player);
					wrap.append(player.gui);
				}

				$(document).on("click", ".videoArea.open video[playsinline] + .vp_control .vidBtnArea .vp_fullscreen", function(){
					$(".videoArea").removeClass("open");
					$("video[playsinline] + .vp_control .vidBtnArea .vp_fullscreen").closest(".videoArea").addClass("open");
					new VideoPopup();
					VideoPopup.open({
						video : wrap.data("video"),
						poster : wrap.data("poster"),
						media : wrap.data("media"),
						auto : wrap.data("autoplay"),
						title : wrap.data("title"),
					});
					var curTime1 = $(this).closest(".videoPlayer").find("video")[0].currentTime;
					$("body").append('<div class="hidden"></div>');
					$(".hidden").text(curTime1);
					$(".layPop.on").prev(".hidden").remove();
					$(".layPop.on").find("video")[0].currentTime = curTime1;
				})

				$("video[playsinline] + .vp_control .vidBtnArea .vp_sound").unbind("click").bind("click",function(){
					var vid = $(this).closest('.videoPlayer').find('video');
					if(vid.prop('muted')){
						vid.prop('muted', false);
						$(this).removeClass('muted');
					} else{
						vid.prop('muted', true);
						$(this).addClass('muted');
					}
				});
			}
		}

		if($(this).data("target") == "popup"){
			if(typeof(VideoPopup.open == "undefined")){
				new VideoPopup();
			}
			VideoPopup.open({
				video : wrap.data("video"),
				poster : wrap.data("poster"),
				media : wrap.data("media"),
				auto : wrap.data("autoplay"),
				title : wrap.data("title")
			});
		}

		if(wrap.closest('.picDetail').length){
			var big = 0;
			wrap.closest('.swiper-wrapper').find('img').each(function(){
				var $this = $(this);
				var h = $this.height();
				if(big < h){
					big = h;
				}
			});
			wrap.find('.mp4>video').height(big);
		}
		return false;
	});

	$("button.vp_sound").unbind("click").bind("click", function(){
		var vid = $(this).parents('.videoPlayer').find('video');
		if(vid.prop('muted')){
			vid.prop('muted', false);
			$(this).removeClass('muted');
		} else{
			vid.prop('muted', true);
			$(this).addClass('muted');
		}
	});

	$(".videoPlayButton > a").each(function(idx, itm){
		var btn = $(itm),
			wrap = btn.parent();
		if(wrap.data("autoplay") === true || wrap.data("autoplay") === "true"){
			btn.trigger("click.videoplayer");
		}
	});

	GlobalScroll.removeListener(checkAutoPlayer);
	if($(".videoPlayerAuto").length > 0){
		GlobalScroll.addListener(checkAutoPlayer);
	}

	function checkAutoPlayer(d){
		var T = d.scroll,
			B = T + d.winHeight,
			v, vid, t, b, src;
		var template = '<span class="btnWrap btnPlayStop">';
		template += '<button type="button" class="btnPlay">재생</button>';
		template += '<button type="button" class="btnStop">정지</button>';
		template += '</span>';
		template += '<span class="btnWrap btnSound">';
		template += '<button type="button" class="btnOn">소리켬</button>';
		template += '<button type="button" class="btnOff">음소거</button>';
		template += '</span>';

		$(".videoPlayerAuto").each(function(idx, itm){
			v = $(itm);
			t = v.offset().top;
			b = t + v.outerHeight();

			if(t > T && b < B){
				if(!v.hasClass("attached")){
					v.addClass("attached");
					if(v.find("video").length <= 0){
						src = v.data("video");
						if(typeof(src) == "string" && src.length > 0){
							if(v.closest(".prevcast").length > 0){
								v.append('<video autoplay playsinline preload="auto" muted src="'+src+'"></video>');
								let videos = document.querySelectorAll('.prevcast .videoPlayerAuto video');
								for(let i=0 ; i<videos.length ; i++){
									let video = videos[i];
									video.onended = function(){
										video.currentTime = 0.5;
										video.play();
									};
								}
							} else{
								v.append('<video autoplay playsinline preload="auto" loop muted src="'+src+'"></video>');
							}
							v.append(template);
							v.find(".btnWrap button").bind("click", autoPlayerClick);
						}
					}else{
						if(!v.hasClass("paused")){
							v.find("video").get(0).play();
						}
					}
				}
			}else{
				if(v.hasClass("attached")){
					v.removeClass("attached");
					vid = v.find("video");
					if(vid.length > 0){
						v.find("video").get(0).pause();
					}
				}
			}
		});
	};// checkAutoPlayer

	function autoPlayerClick(e){
		var btn = $(e.currentTarget),
			cls = btn.attr("class"),
			v = btn.closest(".videoPlayerAuto"),
			vid = v.find("video").get(0);

		if(typeof(vid) == "undefined"){
			return false;
		}

		switch(cls){
		case "btnPlay":
			v.removeClass("paused");
			vid.play();
			break;
		case "btnStop":
			v.addClass("paused");
			vid.pause();
			break;
		case "btnOn":
			v.removeClass("soundOn");
			vid.muted = true;
			break;
		case "btnOff":
			v.addClass("soundOn");
			vid.muted = false;
			break;
		}
	};// autoPlayerClick

	$(".iframeVideoWrap a").unbind("click.iframebtn").bind("click.iframebtn", function(e){
		var div = $(e.currentTarget).closest(".iframeVideoWrap"),
			src = div.data("src");
		div.addClass("iframeVideoReady");
		var str = '<iframe name="vplayer" src="';
		str += src;
		str += '" frameborder="0" allowfullscreen=""';
		str += ' width="100%" height="' + div.height() + '"';
		str += '></iframe>';
		div.html(str);

		return false;
	});
};// 비디오 플레이어 버튼 초기화

function initVideoPlayersFullscreen(){
	$(".videoPlayButton > a + .vidBtnArea .vp_fullscreen").unbind("click.videoplayer").bind("click.videoplayer", function(e){
		$(".videoArea").removeClass("open");
		$(this).closest(".videoArea").addClass("open");
		var btn = event.currentTarget,
			wrap = btn.closest(".videoPlayButton, .videoBox, .videoBox .iframeVideoWrap");
		new VideoPopup();
		VideoPopup.open({
			video : wrap.data("video"),
			poster : wrap.data("poster"),
			media : wrap.data("media"),
			auto : wrap.data("autoplay"),
			title : wrap.data("title")
		});

		$(document).on("click", ".videoArea .videoPlayer vide[playsinline] + .vp_control .vidBtnArea .vp_fullscreen", function(){
			if($("body").find(".videoArea").hasClass("open")){
				var wrap = $(".videoArea.open");
				var ratio = wrap.height() / wrap.width() * 100;
				var player = new VideoPlayer({
					video : wrap.data("video"),
					poster : wrap.data("poster"),
					media : wrap.data("media"),
					auto : wrap.data("autoplay"),
					ratio : ratio,
					target : "inline"
				});
				wrap.data("player", player);
				wrap.empty();
				wrap.append(player.gui);
				var curTime2 = $(".videoArea.open").find("video")[0].currentTime;
				$(".hidden").text(curTime2);
				$(".videoArea.open").find("video")[0].currentTime = curTime2;
			}
		})

		if(wrap.closest('.picDetail').length){
			var big = 0;
			wrap.closest('.swiper-wrapper').find('img').each(function(){
				var $this = $(this);
				var h = $this.height();
				if(big < h){
					big = h;
				}
			});
			wrap.find('.mp4>video').height(big);
		}
		return false;
	});

	$("button.vp_sound").unbind("click").bind("click", function(){
		var vid = $(this).parents('.videoPlayer').find('video');
		if(vid.prop('muted')){
			vid.prop('muted', false);
			$(this).removeClass('muted');
		} else{
			vid.prop('muted', true);
			$(this).addClass('muted');
		}
	});

	$(".videoPlayButton > a").each(function(idx, itm){
		var btn = $(itm),
			wrap = btn.parent();
		if(wrap.data("autoplay") === true || wrap.data("autoplay") === "true"){
			btn.trigger("click.videoplayer");
		}
	});

	GlobalScroll.removeListener(checkAutoPlayer);
	if($(".videoPlayerAuto").length > 0){
		GlobalScroll.addListener(checkAutoPlayer);
	}

	function checkAutoPlayer(d){
		var T = d.scroll,
			B = T + d.winHeight,
			v, vid, t, b, src;
		var template = '<span class="btnWrap btnPlayStop">';
		template += '<button type="button" class="btnPlay">재생</button>';
		template += '<button type="button" class="btnStop">정지</button>';
		template += '</span>';
		template += '<span class="btnWrap btnSound">';
		template += '<button type="button" class="btnOn">소리켬</button>';
		template += '<button type="button" class="btnOff">음소거</button>';
		template += '</span>';

		$(".videoPlayerAuto").each(function(idx, itm){
			v = $(itm);
			t = v.offset().top;
			b = t + v.outerHeight();

			if(t > T && b < B){
				if(!v.hasClass("attached")){
					v.addClass("attached");
					if(v.find("video").length <= 0){
						src = v.data("video");
						if(typeof(src) == "string" && src.length > 0){
							v.append('<video autoplay playsinline preload="auto" loop muted src="'+src+'"></video>');
							v.append(template);
							v.find(".btnWrap button").bind("click", autoPlayerClick);
						}
					}else{
						if(!v.hasClass("paused")){
							v.find("video").get(0).play();
						}
					}
				}
			}else{
				if(v.hasClass("attached")){
					v.removeClass("attached");
					vid = v.find("video");
					if(vid.length > 0){
						v.find("video").get(0).pause();
					}
				}
			}
		});
	};// checkAutoPlayer

	function autoPlayerClick(e){
		var btn = $(e.currentTarget),
			cls = btn.attr("class"),
			v = btn.closest(".videoPlayerAuto"),
			vid = v.find("video").get(0);

		if(typeof(vid) == "undefined"){
			return false;
		}

		switch(cls){
		case "btnPlay":
			v.removeClass("paused");
			vid.play();
			break;
		case "btnStop":
			v.addClass("paused");
			vid.pause();
			break;
		case "btnOn":
			v.removeClass("soundOn");
			vid.muted = true;
			break;
		case "btnOff":
			v.addClass("soundOn");
			vid.muted = false;
			break;
		}
	};// autoPlayerClick

	$(".iframeVideoWrap + .vidBtnArea .vp_fullscreen").unbind("click.iframebtn").bind("click.iframebtn", function(e){
		var div = $(e.currentTarget).parents(".videoBox").find(".iframeVideoWrap"),
			src = div.data("src");

		new iframeVideoPopup();
		iframeVideoPopup.open({
			video : div.data("video"),
			poster : div.data("poster"),
			media : div.data("media"),
			auto : div.data("autoplay"),
			title : div.data("title")
		});

		var str = '<div class="iframeVplayerWrap" style="height:' + div.height() + 'px' + ' ">';
		str += '<iframe name="vplayer" src="';
		str += src;
		str += '" frameborder="0" allowfullscreen=""';
		str += ' width="100%" height="' + div.height() + '"';
		str += '></iframe>';
		//str += '<div class="vidBtnArea"><button type="button" class="vp_fullscreen">전체화면</button><button type="button" class="vp_sound">사운드</button></div>'// 210919 추가
		str += '</div>';
		$(".vodArea").html(str);

		$(".iframeVplayerWrap .vp_fullscreen").bind("click", function(){
			$(this).parents(".layPop.on").remove();
			$("body").removeClass("noscrolling");
		});
		return false;
	});
};// 비디오 플레이어 버튼 초기화

// 동영상 모듈 개선 - 202307
// 화면을 스크롤해 동영상이 노출되면 자동재생, 화면에서 사라지면 일시정지
function setupVideoAutoplay(){
    let currentPlayingVideo = null;
    let observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            let videoArea = entry.target;
            let aTag = videoArea.querySelector("a");
            let videoPlayer = videoArea.querySelector("video");
            if(entry.isIntersecting){
				// 화면에 들어온 경우
				if(aTag && !videoPlayer){
					aTag.click(); // A 태그 클릭하여 비디오 재생
				} else if(videoPlayer){
					setTimeout(() =>{
						videoPlayer.play().then(() => {
							currentPlayingVideo = videoPlayer;
						}).catch(e => {
							console.error("video play error", e);
						})
					}, 100)
				}
            } else{
                // 화면에서 벗어난 경우
                if(videoPlayer && videoPlayer === currentPlayingVideo){
                    videoPlayer.pause();
                    currentPlayingVideo = null;
                }
            }
        });
    }, { threshold:1 });
    document.querySelectorAll(".videoComponentWrap").forEach(videoWrap => {
        observer.observe(videoWrap);
    });
}
function updateVideoComponentHeight(){
    document.querySelectorAll(".videoComponentWrap").forEach(wrap => {
        const videoArea = wrap.querySelector(".videoArea");
        const padding = 38;
		wrap.style.width = `${videoArea.offsetWidth}px`;
        wrap.style.height = `${videoArea.offsetHeight + padding}px`;
        wrap.style.paddingBottom = `${padding}px`;
		const img = wrap.querySelector("a > img");
		if(img){
			wrap.style.background = `url(${img.src}) no-repeat left top`;
			wrap.style.backgroundSize = "contain";
		}
    });
}
$(document).ready(function(){
	if($(".videoComponentWrap").length > 0){
		setupVideoAutoplay();
		updateVideoComponentHeight();
	}
})
$(document).ajaxComplete(function(){
	if($(".videoComponentWrap").length > 0){
		setupVideoAutoplay();
		updateVideoComponentHeight();
	}
});

/**
 * 개별 페이지 스크립트 실행하기
 */
// 디올 상세 (DIOR_DETAIL)
function fn_dior_detail(){
	$(".colorList .moreColor").bind("click", function(){
		$(".colorList ul").addClass("all");
	});
};

// 샤넬 (M_CHANEL)
function fn_m_chanel(){
	// 아코디온 클릭 시에 상단 스와이프 삭제하고 아코디온 버튼 이벤트 제거
	$(".brandAccordWrap .brandAccordList li > button").bind("click.hideswipe", function(){
		var wrap = $(".brandAccordWrap .swiperWrap"),
			sw = wrap.data("swiper");
		if(sw && sw instanceof Swiper){
			sw.destroy();
		}
		wrap.remove();
		$(".brandAccordWrap .brandAccordList li > button").unbind("click.hideswipe");
	});
};

// 공식스토어 (OMDP11.1)
function fn_omdp11_1(){
	$(".storeWrap .brandList.typeFrame .videoPlayButton a").each(function(){
		var a = $(this),
			img = a.find("img");

		img.css("display", "none");
		a.css({
			"background" : "url("+img.attr("src")+") no-repeat 50% 50%",
			"background-size" : "cover"
		});
	});

	// 액자형 swipe
	var swiper, slides, slide, dummy, swipeHeight;

	function swiperTouchStart(){
		swiper.dragging = true;
	}

	function swiperTouchEnd(){
		swiper.dragging = false;
	}

	function setSlidesPosition(y){
		if(y >= -5){
			y = -swipeHeight * (slides.length - 2);
		}
		if(y <= -swipeHeight * (slides.length - 1)){
			y = -swipeHeight;
		}
		var t, d, o, s;
		slides.each(function(idx, itm){
			slide = $(itm);
			t = y + idx * swipeHeight;
			o = {
				"top" : t,
				"transform" : "scale(1, 1)"
			}
			if(t < 0){
				o.top = 0;
				s = 1 + t / swipeHeight / 5;
				if(s < 0.6){
					s = 0.6;
				}
				o.transform = "scale(" + s + ", " + s + ")"
			}
			slide.css(o);
		});
	}

	function progressDummy(){
		setSlidesPosition(parseInt(dummy.css("top"), 10));
	}

	function animateDummy(y){
		dummy.stop();
		dummy.css("top", swiper.oldTranslate);
		dummy.animate({top : y}, {duration : 200, progress : progressDummy, complete : progressDummy, easing : "easeOutSine"});
	}

	function setTranslate(){
		if(!swiper){ return; }

		var slide;
		var arr = [];
		var y = swiper.translate;
		if(swiper.dragging){
			swiper.oldTranslate = y;
			setSlidesPosition(y);
		}else{
			animateDummy(y);
		}
	}

	swiper = new Swiper(".sticky-swiper", {
		direction : "vertical",
		spaceBetween : 40,
		loop : true,
		virtualTranslate : true,
		pagination : {
			el : ".swiper-pagination",
			type : "fraction"
		},
		on : {
			setTranslate : setTranslate,
			touchStart : swiperTouchStart,
			touchEnd : swiperTouchEnd
		}
	});
	slides = swiper.slides;
	swipeHeight = swiper.height + swiper.params.spaceBetween;
	setSlidesPosition(swiper.translate);
	dummy = $('<div class="dummy"></div>');
	$(".sticky-swiper .swiper-slide-duplicate .icoArea input[type=checkbox]").attr("id", "");

	// 스와이프 생성후 비디오 초기화
	initVideoPlayers();

	$('.brandList.typeFrame').height(swipeHeight);

	// view type
	$('.brandList').css({"opacity":"1","position":"static"});
	$('.typeFrame').css({"opacity":"0","position":"absolute","left":"-10000px"});

	$('.viewType').on("click",function(){
		if($('.viewType').hasClass('thumb')){
			$(this).removeClass('thumb').addClass('frame');
			$(".typeFrame").removeClass("static");
			$('.typeFrame').css({"opacity":"0","position":"absolute","left":"-10000px"});
			$('.typeThumb').css({"opacity":"1","position":"static"});
		} else{
			$(this).removeClass('frame').addClass('thumb');
			$(".typeFrame").addClass("static");
			$('.typeThumb').css({"opacity":"0","position":"absolute","left":"-10000px"});
			$('.typeFrame').css({"opacity":"1","position":"static"});
		}
	});
};

// 시슬리 & case 3개 (OMDP12.1)
function fn_omdp12_1(){
	// 브랜드 텍스트 더보기 버튼
	//initViewMore();
	var type = "actionHd";
	//대표이미지 및 로고 미등록시 컨텐츠 높이값
	if($(".brandImg img, .brandLogo img").length == 0){
		$(".brandmallArea").addClass("no_imglogo");
		type = "actionHdType02";
	}else if($(".brandImg img").length == 0){
		$(".brandmallArea").addClass("no_img");
		type = "actionHdType02";
	}else if($(".brandLogo img").length == 0){
		$(".brandmallArea").addClass("no_logo");
	}

	// 스크롤 이벤트
	var head = $("#header");
	GlobalScroll.addListener(function(data){
		var hh = $(".brandmallCon").offset().top - 70;
		if(data.scroll >= hh){//158){
			head.removeClass(type);
		}else{
			head.addClass(type);
		}
	});
};

$(".storeTabType01 li a").on("click",function(){
	$(".viewType").removeClass('thumb').addClass('frame');
	$(".typeFrame").addClass("static");
	storeSwiperVertical();
	$('.typeFrame').css({"opacity":"0","position":"absolute","left":"-10000px"});
	$('.typeThumb').css({"opacity":"1","position":"static"});
})

$(".storeWrap .viewType.thumb").on("click",function(){
	storeSwiperVertical();
})

$(document).ready(function(){
	if($(".storeWrap").length){
		storeSwiperVertical();
		$(".typeFrame").addClass("static");
		$("body").addClass("store");
	}
})

// 공식스토어 탭 변경 시 vertical swiper 초기화
function storeSwiperVertical(){
	// 액자형 swipe
	var swiper, slides, slide, dummy, swipeHeight;
	function swiperTouchStart(){
		swiper.dragging = true;
		$(".typeFrame").removeClass("static");
	}

	function swiperTouchEnd(){
		swiper.dragging = false;
	}

	function setSlidesPosition(y){
	if(y >= -5){
		y = -swipeHeight * (slides.length - 2);
	}
		if(y <= -swipeHeight * (slides.length - 1)){
			y = -swipeHeight;
		}
		var t, d, o, s;
		slides.each(function(idx, itm){
			slide = $(itm);
			t = y + idx * swipeHeight;
			o = {
				"top" : t,
				"transform" : "scale(1, 1)"
			}
			if(t < 0){
				o.top = 0;
				s = 1 + t / swipeHeight / 5;
				if(s < 0.6){
					s = 0.6;
				}
				o.transform = "scale(" + s + ", " + s + ")"
			}
			slide.css(o);
		});
	}
	function progressDummy(){
		setSlidesPosition(parseInt(dummy.css("top"), 10));
	}
	function animateDummy(y){
		dummy.stop();
		dummy.css("top", swiper.oldTranslate);
		dummy.animate({top : y}, {duration : 200, progress : progressDummy, complete : progressDummy, easing : "easeOutSine"});
	}
	function setTranslate(){
		if(!swiper){ return; }

		var slide;
		var arr = [];
		var y = swiper.translate;
		if(swiper.dragging){
			swiper.oldTranslate = y;
			setSlidesPosition(y);
		}else{
			animateDummy(y);
		}
	}

//     $.easing.easeInSine = function(t){return 1-Math.cos(t*Math.PI/2)};
	swiper = new Swiper(".sticky-swiper", {
		direction : "vertical",
		spaceBetween : 40,
		loop : true,
		virtualTranslate : true,
		pagination : {
			el : ".swiper-pagination",
			type : "fraction"
		},
		on : {
			setTranslate : setTranslate,
			touchStart : swiperTouchStart,
			touchEnd : swiperTouchEnd
		}
	});
	slides = swiper.slides;
	swipeHeight = swiper.height + swiper.params.spaceBetween;
	setSlidesPosition(swiper.translate);
	dummy = $('<div class="dummy"></div>');
	$(".sticky-swiper .swiper-slide-duplicate .icoArea input[type=checkbox]").attr("id", "");

	// 스와이프 생성후 비디오 초기화
	$('.brandList.typeFrame').height(swipeHeight);
	if($(".swiper-notification").length > 1){
		$(".swiper-notification:first").remove();
	}
}

// 주문서 (OMOP3.1)
function fn_omop3_1(){
	$('.btnOrderList').on("click",function(){
		if($(this).hasClass('all')){
			$(this).removeClass('all').children('.text').html('주문상품 전체보기');
			$('.prodShow').css('height','235px');
		}else{
			$(this).addClass('all').children('.text').html('주문상품 간략보기');
			$('.prodShow').css('height','auto');
		}
	});
};

// 브랜드/상세 더보기 버튼
function initViewMore(){
	$(".viewMore button").unbind("click.viewmore").bind("click.viewmore", function(e){
		var btn = e.currentTarget,
			$btn = $(btn),
			div = $btn.closest(".viewMore"),
			em;
		if($btn.find("em").length > 0){
			em = $btn.find("em");
		}else{
			em = $btn;
		}

		$btn.blur();
		if(div.hasClass("expansion") && !div.closest(".featureFrame").length > 0){
			div.removeClass("expansion");
			if($("html").attr("lang") == "ko"){
				if(em.closest(".u646").length > 0){
					em.text("상품정보 더보기");
				} else{
					em.text("펼쳐보기");
				}
			}else if($("html").attr("lang") == "zh"){
				if(em.closest(".u646").length > 0){
					em.text("展开");
				} else{
					em.text("商品信息 更多");
				}
			}else if($("html").attr("lang") == "en"){
				em.text("See more");
			}
		}else{
			if(!div.closest(".featureFrame").length > 0){
				div.addClass("expansion");
				if($("html").attr("lang") == "ko"){
					em.text("접기");
				}else if($("html").attr("lang") == "zh"){
					em.text("收起");
				}else if($("html").attr("lang") == "en"){
					em.text("Close");
				}
			}
		}

		setTimeout(function(){
			btn.focus({preventScroll:true});
		}, 10);
	});

	var dc, vm, dcImg, dcHeight;
	$(".detaliCon").each(function(idx, itm){
		setTimeout(() => {
			dc = $(itm);
			vm = dc.closest(".viewMore");
			dcImg = dc.find("img");
			dcHeight = dc.find("div, img, p").height();
			dc.height(dcHeight);
			if(dc.height() <= vm.height()){ //1092 : 448 ~ 1174
				vm.addClass("short");
			}
		},250)
	});
};

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

				// 오늘의 특가
				if($(".fixBottomWrap .specialprice_imp").length > 0){
					o.parents(".specialprice_imp").find(".remainTimer").text(getOneDigit(h));
					if(o.parents(".specialprice_imp").find(".remainTimer").text() == "0"){
						$(".specialprice_imp").find(".timeInfo").empty().addClass("warn").append("오늘의 특가<em>얼마 남지 않았어요!</em>");
					}
				}

				if($(".fixBottomWrap .specialprice_imp").length || $(".timesale_imp").length){
					if(getTwoDigit(h) < 1){
						o.closest(".timeInfo").addClass("warn");
					}
				}
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

// 편성표 날짜 가로 스크롤
function initTimeTracker(){
	function scrollCenter(b){
		var w = b.closest(".timeTracker"),
			t = b.position().left + w.scrollLeft() - w.width() / 2 + b.outerWidth() / 2 + 4;

		w.stop().animate(
			{ scrollLeft: t },
			{ duration : 100 }
		);
	};

	if($(".timeTracker:visible").length > 0){
		$(".timeTracker button").unbind("click.timetracker").bind("click.timetracker", function(e){
			var b = $(e.currentTarget);

			if(b.hasClass("on")){ return; }

			b.addClass("on")
				.siblings(".on").removeClass("on");
			scrollCenter(b);
		});

		if($(".timeTracker button.on").length > 0){
			scrollCenter($(".timeTracker button.on"));
		}
	}
};// initTimeTracker
// 편성표 날짜 가로 스크롤
// 팝업내 픽스트랩 초기화
function initPopFixedWrap(pop){
	var wraps = pop.find(".fixedWrap");
	if(wraps.length == 0){ return; }
	pop.find(".layCont").unbind("scroll.fixedwrap").bind("scroll.fixedwrap", function(e){
		var lc = $(e.currentTarget),
			lct = lc.offset().top,
			s = lc.scrollTop(),
			h = parseInt(lc.css("padding-top"), 10),
			t, cft, pft;
		if(isNaN(h)){
			h = 0;
		}
		wraps.each(function(){
			cft = $(this);
			if(cft.is(":visible") === false){ return; }
			t = cft.offset().top + lct;
			if(t <= h){
				cft.addClass("fixed");
				if(pft){
					pft.removeClass("fixed");
				}
			}else{
				cft.removeClass("fixed");
			}
			pft = cft;
		});
	});
};

//신구단 메인 홈페이지 개편 20230517(고객정보 펼쳐짐,메뉴 딤처리&픽스)
function shingudanMainUpdateM(){
	var infoGradeElement = document.querySelector('.infoGrade');
	var shingudanIntroElement = document.querySelector('.shingudanIntro');

	if(infoGradeElement && shingudanIntroElement){
		infoGradeElement.addEventListener("click", function(){
		  var containerElement = document.querySelector('.container');
	
			if(containerElement.classList.contains('u651')){
				shingudanIntroElement.classList.toggle('active');
			}
		});
		const groupbuyingSwipe = $(".groupbuyingSwipe");
		const swiperWrapper = groupbuyingSwipe.find(".swiper-wrapper").eq(0);
		const recommendSwipe = swiperWrapper.find(".recommendSwipe");
		const figure = recommendSwipe.find("figure");
		setTimeout(() => {
			figure.each(function(){
				$(this).height($(this).width());
			})
		},1)
	}

	var tabLinks = document.querySelectorAll('.tabArea > .tabType01 > li > a');
	var shingudanMenu  = document.querySelector('.shingudanMenu ');
	var dimCloseElement = document.querySelector('.dim_close');

	if(tabLinks.length > 0 && shingudanMenu && dimCloseElement){
		var isMenuActive = false;
	  
		tabLinks.forEach(function(link){
		  link.addEventListener("click", function(event){
			event.preventDefault();
			if(!isMenuActive && !shingudanMenu.classList.contains('active')){
			  shingudanMenu.classList.add('active');
			  if(window.pageYOffset < 361){
				window.scrollTo({
				  top: 361,
				  behavior: 'smooth'
				});
			  }
			  isMenuActive = true;
			}
			event.stopPropagation();
		  });
		});
	  
		dimCloseElement.addEventListener("click", function(event){
		  event.preventDefault();
		  shingudanMenu.classList.remove('active');
		  shingudanMenu.style.removeProperty('padding-top');
		  isMenuActive = false;
		  event.stopPropagation();
		});
	}
	$(function(){		
		if($(".joinCongrat").length > 0){
            const joinCongratFireWork = bodymovin.loadAnimation({
                container : $(".joinFireWork")[0],
                path : 'https://img.ssgdfs.com/online_upload/animation/fo/fireworks.json',
                renderer : 'svg',
                loop : true,
                autoplay : true
            })
        }	
	})
	$(function(){
		if($(".verCompl").length > 0){
			const verCompl = bodymovin.loadAnimation({
				container : $(".verComplAction")[0],
				path : 'https://img.ssgdfs.com/online_upload/animation/fo/confetti.json',
				renderer : 'svg',
				loop : true,
				autoplay : true
			})
		}	
	});
}
shingudanMainUpdateM();

// 신구단 배송신청 화면 211001
// 팝업 닫기
function popAniComplete(){
	var pop = $(this);
	if(!pop.hasClass("on")){
		pop.css("display", "none");
		if(pop.data("remove") === true){
			removePopup(pop);
		}
	}
}

function selectEvtClosePop(e){
	var btn = $(e.target),
		pop = btn.closest(".layPop"),
		delay = 0;
	var aniProp = {
			duration : 400,
			easing : "easeInSine",
			complete : popAniComplete
		},
		dimmed = $(".dimmed"),
		btSorting = $(".btSorting.layerSorting");

		pop.stop(true).css({"display":"block", "bottom":"0"}).animate({"bottom":"-100%"}, aniProp);
		delay = 410;
		$("body").removeClass("layerPopupOpened");

		if(btn.closest("#layerPopupContainer").find(".dimmed").css("display") === "block"){
			setTimeout(function(){
				btn.closest("#layerPopupContainer").find(".dimmed").css("display", "none");
			}, 410)
		}
		pop.removeClass("on");
		setBodyNoScrolling(false);

		if( btSorting.hasClass("open")){
			btSorting.removeClass("open")
		}
}
$(function(){
	//통관 회사 선택
	$(".cmDeilveV2109 .custmClnceCorpV2109").unbind("click").bind("click", function(){
		setTimeout(function(){
			$("body").addClass("hidePopupDimm");
		}, 1);
		if( $("body").hasClass("hidePopupDimm") === true ){
			$("body.hidePopupDimm .wrapper .container .contents").css({overflow :"hidden"})
		}
		if( $(".layPop input").is(":checked") ){
			$("body").addClass("hidePopupDimm")
		}
	})
})

$(function(){
	// 주문상태
	var newBuyingActBtn = $(".btnOrderCondition, .btnSelectPeriod");
	newBuyingActBtn.click(function(){
		var thisBtn = $(this);
		if( thisBtn.hasClass("open") ){
			thisBtn.removeClass("open");
		} else{
			thisBtn.addClass("open");
		}
	})
})

$(function(){
	function newBuyngOrdCondPop(){
		var ordConditionsortNm = $("#orderCondition input[name=radSorting01]:checked").data("sortnm");
		$(".btnOrderCondition").html(ordConditionsortNm).addClass('txt');
	}

	var ordCondInp = $("#orderCondition input");
	ordCondInp.unbind("click").bind("click", function(e){
		newBuyngOrdCondPop();
		selectEvtClosePop(e);
		setTimeout(function(){
			ordCondInp.closest("#layerPopupContainer").find(".dimmed").css("display", "none");
		}, 410)
	})
})

$(function(){
	// 구매기간
	var newSelPeridBt = $("#popPeriodSorting .termArea li:lt(3) input"),
		newbSelPeridDrtInpBt = $("#popPeriodSorting .btnBtm button"),
		newfnsrhdtTxt = $(".cmDeilveV2109 #fnsearchDate");

	function newfnsrhdtTxtShowHide(){
	if( newfnsrhdtTxt.html() == '' ){
		newfnsrhdtTxt.addClass("hide");
	} else{
		newfnsrhdtTxt.removeClass("hide");
	}

	if( newSelPeridBt.is(":checked") ){
		var newSelPeridBtChk = $("#popPeriodSorting .termArea li:lt(3) input:checked + label");
		newfnsrhdtTxt.show();
		newfnsrhdtTxt.text(newSelPeridBtChk.text());
	}
	}
	newfnsrhdtTxtShowHide();

	// 구매기간 날짜 입력 버튼 3개(3, 6, 12 개월) 선택된 텍스트값 바닥 페이지에 노출
	newSelPeridBt.unbind("click").bind("click", function(e){
		selectEvtClosePop(e);
		newfnsrhdtTxtShowHide();
	})
})

// 화면 로드시 드롭다운 옵션 박스의 대표상품 선택
$(function(){
	const btnSortSelectOptDefSelect = $("#btnSortSelectOption .optListWrap input");
	if(btnSortSelectOptDefSelect.is(":checked")){
		const contentSelectOpt = $(".container .prSelect .btnSelect.layerPopupButton");
		const btnSortSelectOptEq = $("#btnSortSelectOption .dropdownSelect");
		btnSortSelectOptEq.each(function(index){
			const eqLabel = $(this).find("input:checked + label");
			contentSelectOpt.eq(index).text(eqLabel.text());
			$(this).find(".btnDropdownSelect").text(eqLabel.text());
		});
	}
});

// 메인 비쥬얼 배너 처음 로딩시 텍스트 엘리먼트들의 애니메이트 효과 제거
$(function(){
	let swBan = $(".visualBanner");
	function swBanInit(){
		swBan.removeClass("transitionOff");
	}
	setTimeout(function(){
		swBanInit()
	}, 300)
	$(document).ready(function(){
		setTimeout(function(){
			swBanInit();
		}, 300)
	})

	let wrap = $(".wrapper"),
		mainBanner = wrap.find(".swiperWrap.swipePage.visualBanner");
	// mainBanner.animate({ opacity: 1 });
})

// 체험단
$(document).ready(function(){
	if($(".promoExpe").length){
		$(".promoExpe").closest(".contents").addClass("expe");
	}
})

// MG 세트상품 구매 : 정수형일 경우 클래스 추가
$(function(){
	$(".quickOrderList .mgSetProd").each(function(){
		if(!$(this).find(".orderAmount").length){
			$(this).addClass("integer")
		}
	})
})

// MG 빠른구매 페이지 하단 스크롤시 구매하기 버튼 노출
$(function(){
	if($(".quickOrderList .mgSetProd").length){
		callAppScheme({
			"group" : "docbar",
			"function" : "hide"
		});

		$(window).scroll(function(){
			function getDocHeight(){
				return (document.scrollingElement ? document.scrollingElement.scrollHeight : $(document).height());
			};

			var scroll = $(window).scrollTop(),
				docHeight = getDocHeight(),
				winHeight = window.outerHeight,
				count = 0,
				prevScroll = 0,
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

			if(data.scroll >= data.maxScroll){
				$("body").addClass("chkON");
			} else{
				$("body").removeClass("chkON");
			}
		})
	}
})

// 상품상세에서 펼쳐보기를 활성화 시킨 후에 레이어팝업을 연 뒤에 닫을 경우 바닥화면의 접기 버튼이 사라지는 현상 수정
$(function(){
	$(document).on("click",".layPop .closeL",function(){
		if($("body").hasClass("quickBuyBody") && $(".viewMore.expansion").hasClass("short")){
			$(".viewMore.expansion").removeClass("short")
		}
	})
})

// 웨딩 멤버십 가입하기 수정
$(function(){
	$(document).on("click",".lCont.weddingInvitation .leaveDayArea .frmList > li",function(){
		$(this).closest(".frmList").removeClass("addExPadd");
	})

	$(document).on("click",".lCont.weddingInvitation .leaveDayArea .frmList > li:nth-child(3)",function(){
		$(this).closest(".frmList").addClass("addExPadd");
	})
})

// 검색결과 임시휴점 브랜드 안내
$(function(){
	$(".brandClosedNoti .btnClose").on("click",function(){
		$(this).closest(".brandClosedNoti").hide();
	})
})

// 신디페이스
function sindyFaceUI(){
	let badge = $(".sdface").closest(".prDetail_visual").find(".badge").not(".offLine");

	// 화면 로드 2초 후에 신디페이스 아이콘을 배너 형태로 전환, 다시 5초 후에 아이콘으로 전환
	function sdfaceBanStateExc(){
		let sdface = $(".sdface");
		let loadSdfaceBanStateExc = setTimeout(function(){
			sdface.removeClass("fold");
			badge.fadeOut(350);
		}, 2000)
		let clearSdfaceBanStateExc = setTimeout(function(){
			sdface.addClass("fold");
			badge.fadeIn(350);
		}, 5500)

		// 신디페이스 아이콘 탭 시 배너 형태로 전환, 그리고 5초 후에 다시 아이콘으로 변환
		var sdfaceTimer;
		$(document).on("click",".btn_sdface_run",function(){
			clearTimeout(loadSdfaceBanStateExc);
			clearTimeout(clearSdfaceBanStateExc);
			clearTimeout(sdfaceTimer);
			$(".sdface").addClass("fold");
			badge.fadeOut(350);
			setTimeout(function(){
				$(".sdface").removeClass("fold");
				badge.fadeOut(350);
			}, 1);
			sdfaceTimer = setTimeout(function(){
				$(".sdface").addClass("fold");
				badge.fadeIn(350);
			}, 3500)
		})
	}

	// 스크롤 시 상품상세 영역에 진입했을 때 우측 하단 플로팅 버튼 노출, 벗어났을 때 미노출
	function sdfaceScrollFloatingBtn(){
		$(window).scroll(function(){
			let prDetailCon = $(".prDetail .prDetail_con"),
				brandDetailCont = $(".detailWrap"),
				ty, by;
			if(brandDetailCont.length){
				by = brandDetailCont.find(".sectionR").offset().top;
				if($(this).scrollTop() >= by){
					$(".btFloating button.btn_sdface_run").addClass("on");
				} else{
					$(".btFloating button.btn_sdface_run").removeClass("on");
				}
			}
			if(prDetailCon.length){
				if($(".prDetail .u646").length > 0){
					if($("#dtlInfo").length > 0){
						ty = $("#dtlInfoCon").offset().top;
					} else{
						if($(".transformTab_area").length > 0){
							ty = $(".transformTab_area").offset().top;
						}
					}
				} else{
					if($(".transformTab_area").length > 0){
						ty = $(".transformTab_area").offset().top;
					}
				}

				if($(this).scrollTop() >= ty){
					$(".btFloating button.btn_sdface_run").addClass("on");
				} else{
					$(".btFloating button.btn_sdface_run").removeClass("on");
				}
			}
		});
	}

	// 신디페이스 배너 외 영역 탭 시 배너를 닫도록
	$("html").on("click",function(e){
		if(!$(e.target).hasClass('btn_sdface_run')){
			$(".sdface").addClass("fold");
			badge.fadeIn();
		}
	})

	// 신디페이스 상단 상품 이미지 영역의 아이콘의 위치 제어
	function badgePosControl(){
		let sdfaceUI = $(".prDetail_visual"),
			functionBtn = sdfaceUI.find(".functionBtn"),
			review = sdfaceUI.find(".review"),
			sdface = sdfaceUI.find(".sdface");

		if(functionBtn.length > 0 || review.length > 0 || sdface.length > 0){
			clearInterval(timer);
			timer = setInterval(badgeChk, 1000);
			badgeChk();
		}else{
			clearInterval(timer);
		}

		var timer;
		function badgeChk(){
			let sdfaceUI = $(".prDetail_visual"),
				functionBtn = sdfaceUI.find(".functionBtn"),
				review = sdfaceUI.find(".review"),
				sdface = sdfaceUI.find(".sdface");

			if(sdface.length == true){
				functionBtn.css({"bottom":"114px"});
				review.css({"bottom":"62px"});
				if(review.length == false){
					functionBtn.css({"bottom":"62px"});
				}
			} else{
				functionBtn.css({"bottom":"62px"});
				review.css({"bottom":"10px"});
				if(review.length == false){
					functionBtn.css({"bottom":"10px"});
				}
			}
		};
	}
	sdfaceBanStateExc();
	badgePosControl();
	sdfaceScrollFloatingBtn();
}

// 여권정보 수정 input의 delete 버튼 클릭 액션
$(function(){
	if($(".formList.passportInfo").length){
		let input = $(".formList.passportInfo .frmInp.labelTop input"),
			btnDel = $(".formList.passportInfo .frmInp.labelTop .icDel");
		if(input.val() === ""){
			btnDel.hide();
		} else{
			btnDel.show();
		}
		input.on("input",function(e){
			if($(this).val() == ""){
				$(this).prev(btnDel).hide();
			} else{
				$(this).prev(btnDel).show();
			}
		})
		$(document).on("click",".formList.passportInfo .frmInp.labelTop .icDel",function(){
			$(this).hide().next("input").val("").focus();
		})
	}
})

// 결제수단 과세/비과세 표기 개선
$(function(){
	if($(".orderProd.cancelOrdered").length && $(".orderPrice .titDep2 .tax").length){
		$(".tax").closest(".titDep2").css({"width":"auto"});
	}
})

// 면세 한도 레이어 프로그레스바 표현
function dfLimitLayerProg(){
	if($(".layPop.dfLimitLayer").length){
		var dfLimitLayer = $(".layPop.dfLimitLayer"),
		userLimit = dfLimitLayer.find(".userLimit"),
		limitProgress = userLimit.find(".limitProgress"),
		bar = limitProgress.find(".bar"),
		draw = bar.find(".draw"),
		usedLimit = bar.find(".usedLimit");

		// percentage 구하기
		var drawPercent = draw.width() / bar.width() * 100;

		// 소수점 반올림
		var round = Math.round(drawPercent);

		if(round <= 1){
			draw.addClass("less");
			limitProgress.removeClass("over");
		} else if(round == 100){
			draw.removeClass("less");
			limitProgress.addClass("over");
		} else{
			draw.removeClass("less");
			limitProgress.removeClass("over");
		}

		// usedLimit 레이어가 좌우 측 끝에 다다를 때의 제어
		var dfLimitLayerWidth = dfLimitLayer.outerWidth(),
			usedLimitWidth = usedLimit.outerWidth(),
			dfLimitLayerLeft = dfLimitLayer.offset().left,
			dfLimitLayerRight = dfLimitLayerLeft + dfLimitLayerWidth,
			usedLimitLeft = usedLimit.offset().left,
			usedLimitRight = usedLimitLeft + usedLimitWidth;

		if(usedLimitLeft - dfLimitLayerLeft <= 5){
			usedLimit.addClass("left");
		} else if(dfLimitLayerRight - usedLimitRight <= 5){
			usedLimit.addClass("right");
		}
	}
}

// 중첩 슬라이드의 자동롤링을 위한 기능 추가
let nestedSwiperTi;
let autoChkTimeout;
let previousTouchStartEvent;
let previousTouchStartEvent2;
let previousBtnClickEvent;
function nestedSwiper(){
    function nestedSwInit(){
        var swiperH = new Swiper('.swiper-container-h',{
            spaceBetween:50,
            pagination:{
                el:'.swiper-pagination-h',
                clickable:true,
            },
            nextButton:'.h-next',
            prevButton:'.h-prev',
            onInit:function(){
                if($('.swiper-container-h .swiper-slide-active').children().hasClass('swiper-container-h-inner')){
                    $('.prev, .next').hide();
                }
            },
            onSlideChangeStart:function(){
                if($('.swiper-container-h .swiper-slide-active').children().hasClass('swiper-container-v')){
                    $('.h-prev, .h-next').hide();
                } else{
                    $('.h-prev, .h-next').show();
                }
            },
            onSlideNextStart:function(){
                $('.h-prev').show();
            }
        });
        var swiperV = new Swiper('.swiper-container-v',{
            direction:'horizontal',
            spaceBetween:8,
            pagination:{
                el:'.swiper-pagination-v',
                clickable:true,
                type:'bullets',
                renderBullet:function(index, className){
                    return '<button type="button" class="' + className + ' autoroll-bullet">' + (index + 1) + "</button>";
                },
            },
            nextButton:'.v-next',
            prevButton:'.v-prev',
            nested:true,
            onReachBeginning:function(){
                $('.h-prev').show();
            },
            onReachEnd:function(){
                $('.h-next').show();
            },
        });
    }
    function autoChk(){
        let nestedWrap = $(".nestedSwiper.swiperWrap:not(.inted)");
        let btn = $("#benefitSwiper").find(".tabType02").find("li a");
        function autoSwipe(){
            if(previousTouchStartEvent){
                $(document).off('touchstart',previousTouchStartEvent);
            }
            if(previousTouchStartEvent2){
                $(document).off('touchstart',previousTouchStartEvent2);
            }
            function startTimeInterval(){
                return setInterval(function(){
                    let active = $(".autoroll-bullet").closest(".swiper-slide-active"),
                        bultAct = active.find(".swiper-pagination-bullet-active"),
                        autorollBult = bultAct.next(".autoroll-bullet"),
                        tab = $("#benefitSwiper").find(".tabType02"),
                        li = tab.find(".tabON").next("li");
                    if(autorollBult.length > 0){
                        autorollBult.trigger("click");
                    }
                    if(autorollBult.length == 0){
                        if(li.length > 0){
                            li.find("a").attr("id","noClick");
                            li.find("a").trigger("click");
                            li.find("a").removeAttr("id");
                        } else{
                            $(".autoroll-bullet").eq(0).click();
                            tab.find("li:first a").attr("id","noClick");
                            tab.find("li:first a").click();
                            tab.find("li:first a").removeAttr("id");
                            clearInterval(nestedSwiperTi);
                            nestedSwiperTi = startTimeInterval();
                        }
                    }
                }, 4000);
            }
            nestedSwiperTi = startTimeInterval();
            previousTouchStartEvent = function(){
                clearInterval(nestedSwiperTi);
                nestedSwiperTi = startTimeInterval();
            };
            nestedWrap.find(".swiper-slide, .swiper-pagination-bullet").on("touchstart",previousTouchStartEvent);
            previousTouchStartEvent2 = function(){
                clearInterval(nestedSwiperTi);
                nestedSwiperTi = startTimeInterval();
            };
            nestedWrap.prev(".tabArea").find("li a").on("touchstart",previousTouchStartEvent2);
        }
        if(previousBtnClickEvent){
            btn.off('click', previousBtnClickEvent);
        }

        previousBtnClickEvent = function(){
            let pagination = $(".nestedSwiper > .swiper-container > .swiper-wrapper > .swiper-slide-active .swiper-pagination");
            let btnFirst = pagination.find("button:first");
            btnFirst.trigger("click");
        };
        btn.on("click", previousBtnClickEvent);
        if($("#benefitTabArea.nestedSwiper").length > 0){
            autoSwipe();
        }
    }
    if(nestedSwiperTi){
        clearInterval(nestedSwiperTi);
    }
    if(autoChkTimeout){
        clearTimeout(autoChkTimeout);
    }
    nestedSwInit();
    autoChkTimeout = setTimeout(function(){
        autoChk();
    }, 2000);
}

// 페이지 뒤로가기 시 이벤트 처리
$(window).bind("pageshow", function(event){
	if(event.originalEvent.persisted || event.persisted || (window.performance && window.performance.navigation.type == 2)){
		// 이벤트 모듈 상단탭 중단탭 개선 - 220323
		if($(".promotionType .topTab").length > 0){
			setTimeout(function(){
				document.location.reload();
			},100)
		}
		// 뒤로가기로 라이브 커머스 채팅 페이지 재진입 시 화면 새로고침
		if($(".liveChatWrap").length > 0){
			setTimeout(function(){
				document.location.reload();
			},100)
		}
	}
});

function initPromoTabImp(){
	let wrap, tabMenu, tabMenuTxt, midAncTabArea, midAncTab, midAncTabLi, midAncTabW, midAncTabBgW, li, a, span, pageUrl, pageUrlSubString, topTabA, topTabUrl, topTabUrlSubString;
	$(".promotionType.moduleArea .fixedWrap.imp.topTab:visible").each(function(idx, itm){
		wrap = $(itm);
		li = wrap.find("li");

		li.each(function(idx, itm){
			let li = $(itm);
			pageUrl = $(location).attr("href");
			pageUrlSubString = pageUrl.slice(-10);
			topTabUrl = li.find("a").attr("href");
			topTabUrlSubString = topTabUrl.slice(-10);

			if(pageUrlSubString == topTabUrlSubString){
				var topTabCurrent = li.find("a[href$='" + topTabUrlSubString + "']");
				topTabCurrent.closest("li").addClass("tabON");
				topTabCurrent.attr("aria-selected",true);
			}

			setTimeout(function(){
				var tabWrap = li.closest(".tabType"),
					tabON = tabWrap.find(".tabON");
				if(tabON.length == 0 || tabON.length > 1){
					tabWrap.find("li").removeClass("tabON");
					tabWrap.find("li").find("a").attr("aria-selected",false);
					tabWrap.find("li:first").addClass("tabON");
					tabWrap.find("li:first").find("a").attr("aria-selected",true);
				}
			},100)
		})
	})

	$(".promotionType.moduleArea .fixedWrap.imp:visible").each(function(idx, itm){
		wrap = $(itm);
		if(wrap.is(".midAncTab") == true){
			midAncTabArea = wrap.find(".tabArea");
			midAncTab = wrap.find(".tabType");
			midAncTabW = midAncTab.is(".white");
			midAncTabBgW = midAncTab.css("background-color") == "rgb(255, 255, 255)";
			midAncTabLi = midAncTab.find("li");
			wrap.closest(".promotionType").find(".tabTarget").addClass("imp");
			if(midAncTabLi.length >= 3){
				midAncTabLi.css({"min-width":"28%"});
			}
			if(midAncTabBgW){
				midAncTabArea.addClass("bdBtm");
			}

			let tabBG = wrap.find(".tabType").css("background-color");
			wrap.find(".tabArea").css("background-color",tabBG);
		}
		wrap.closest(".promotionType").find(".btmProdType").addClass("imp");
	})

	$(".promotionType .imp .tabType li").each(function(idx, itm){
		tabMenu = $(itm),
		tabMenuTxt = tabMenu.find("a").text();
		tabMenu.find("a").empty();
		tabMenu.find("a").append("<span>"+tabMenuTxt+"</span>");

		let a = tabMenu.find("a"),
			span = a.find("span");
		if(span.height() > 30){
			a.addClass("line-clamp");
		} else{
			a.removeClass("line-clamp");
		}
	})

	if($(".txtType").closest(".promotionType").find(".imp").length){
		$(".txtType").addClass("imp");
	}
}

// 이벤트(프로모션) 페이지 탭 스크롤 액션
function fnEvtTabUrlScrlMove(target, index, activeTab){
	let targetElement = $(target).eq(index - 1);
	targetElement.find("a").on("click", function(){
        sessionStorage.setItem("navigatedFromClick", "true");
    });
    let navigatedFromClick = sessionStorage.getItem("navigatedFromClick");
    if(!navigatedFromClick) return;
    sessionStorage.removeItem("navigatedFromClick");
	let activateTab = function(tabWrap, activeTab){
		if(activeTab !== undefined){
			let activeLi = tabWrap.find("li").eq(activeTab - 1);
			activeLi.addClass("tabON");
			activeLi.find("a").attr("aria-selected",true);
			setTimeout(function(){
				scrollIntoView(activeLi);
			}, 500)
		} else{
			let pageUrl = new URL($(location).attr("href"));
            pageUrl.searchParams.delete("previewYn");
            let pageUrlString = pageUrl.toString();
            let pageUrlSubString = pageUrlString.slice(-10);
            let topTabCurrent = tabWrap.find("a[href$='" + pageUrlSubString + "']");
            if(topTabCurrent.length > 0){
                topTabCurrent.closest("li").addClass("tabON");
                topTabCurrent.attr("aria-selected",true);
            } else{
                tabWrap.find("li:first").addClass("tabON");
                tabWrap.find("li:first").find("a").attr("aria-selected",true);
            }
		}
	};

	$(target).eq(index - 1).each(function(){
		let wrap = $(this);
		let li = wrap.find("li");

		li.each(function(){
			let li = $(this);
            let pageUrl = new URL($(location).attr("href"));
            pageUrl.searchParams.delete("previewYn");
            let pageUrlString = pageUrl.toString();
            let pageUrlSubString = pageUrlString.slice(-10);
            let topTabUrl = li.find("a").attr("href");
            let topTabUrlSubString = topTabUrl.slice(-10);

            if(pageUrlSubString == topTabUrlSubString){
                let topTabCurrent = li.find("a[href$='" + topTabUrlSubString + "']");
                topTabCurrent.closest("li").addClass("tabON");
                topTabCurrent.attr("aria-selected",true);
            }
		})

		setTimeout(function(){
			let tabWrap = wrap,
				tabON = tabWrap.find(".tabON");
			if(tabON.length == 0 || tabON.length > 1){
				tabWrap.find("li").removeClass("tabON");
				tabWrap.find("li").find("a").attr("aria-selected",false);
			}
			activateTab(tabWrap, activeTab);
		},1000)

		setTimeout(function(){
			let targetOffset = wrap.offset().top - 58;
			$("html, body").animate({
				scrollTop:targetOffset
			}, 500);
		},1000)
	})

	function scrollIntoView(li, noani){
		if(li.length == 0){ return; }
		let wrap = li.closest(".tabArea"),
			w = wrap.width(),
			ul = li.closest("ul"),
			h = w / 2,
			mx = wrap.get(0).scrollWidth - w,
			x = Math.round(li.offset().left - ul.offset().left - h + li.width() / 2);
		
		if(x < 0){
			x = 0;
		}else if(x > mx){
			x = mx;
		}
		if(noani === true){
			wrap.stop(false).scrollLeft(x);
		}else{
			wrap.stop(false).animate({scrollLeft: x}, 300);
		}
	}
}
// fnEvtTabUrlScrlMove(".tabType", 2, 4);
// 타겟으로 받는 클래스명이 PC와 MO가 다름(PC - .tabType07 / MO - .tabType)
// 인덱스값이 아닌 사용자가 눈으로 보는 순서를 숫자로 호출.
// 2번째 tabType에 이벤트를 넣고 강제로 상위탭의 2번째를 활성화 시킨다는 의미.
// 마지막의 숫자를 제거하고 호출하면 강제로 상위탭을 활성화시키지 않음. 
// 즉, 3번째 인자는 3번째 탭으로 페이지 이동시 이동된 페이지에서 호출할때만 사용
// 이벤트 페이지에서 직접 함수 호출하는 식으로 사용

function tabScrollSpy(){
	// scrollspy
	$(".cateTabModuleFixedWrap").each(function() {
		$(this).find("a").each(function() {
			let href = $(this).attr("href");
			if (href.startsWith("#")) {
				let $target = $(href);
				if(!$target.hasClass("tabTarget imp")){
					if($target.children("em.tabTarget.imp").length === 0){
						let newEm = $("<em></em>").addClass("tabTarget imp").attr("id", $target.attr("id"));
						$target.prepend(newEm);
						$target.removeAttr("id");
					}
				}
			}
		});
	});
	
	if($(".midAncTab").length > 0){
		$(".midAncTab").not(".scrollSpyTab").each(function(idx, itm){
			let midAncTab = $(itm);
			let $menu = midAncTab,
				$menu_a = $("a", $menu),
				id = false,
				sections = [];
			let isAnimating = false; // 애니메이션 중인지 확인하는 변수 추가
	
			$menu_a.off("click").on("click",function(event){
				let target = $(this).attr("href");
				let $target = $(target);
	
				if($target.length === 0){
					console.error(target + "에 해당하는 요소가 없어 해당 요소로 스크롤되지 않습니다.");
					return;
				}
	
				let isCateTabModuleFixedWrap = $(this).closest(".midAncTab").hasClass("cateTabModuleFixedWrap");
				if(isCateTabModuleFixedWrap){
					event.preventDefault();
        			$(".tabCont").css("opacity",0);
					$(".tabCont").removeClass("show");
					setTimeout(() => {
						$("html, body").animate({
							scrollTop: $target.offset().top + 5
						},
						{
							duration: 5,
							complete: function(){
								$menu_a.parent("li").removeClass("tabON");
								$("a[href='" + target + "']", $menu).parent("li").addClass("tabON");
								$(".tabCont").removeAttr("style");
								$(".tabCont").addClass("show");
							}
						});
					}, 5);
				} else{
					event.preventDefault();
					$(this).closest(".midAncTab").css({ "height": "auto" });
					let scrollOffset = 2;
					let additionalOffset = 0;
					if(!$(".rcmd").length){
						scrollOffset = 2; // .rcmd 페이지가 아닌 경우에만 적용
					}
					if($(this).closest(".midAncTab").hasClass("fixed")){
						// additionalOffset = 50; // .fixed 클래스가 있는 경우에만 추가 오프셋 적용
					}
	
					$("html, body").animate({
						scrollTop: $target.offset().top + scrollOffset + additionalOffset
						},
						{
							duration: 500,
							complete: function(){
								$menu_a.parent("li").removeClass("tabON");
								$("a[href='" + target + "']", $menu).parent("li").addClass("tabON");
								isAnimating = false; // 애니메이션 완료
							}
					});
					
				}
			});
	
			$menu_a.each(function(){
				const href = $(this).attr("href");
				if(href.startsWith("#")){
					var target = $(href);
					if(target.length){
						sections.push(target);
					} else{
						console.warn(href + " not found on the page");
					}
				}
			});
	
			$(window).scroll(function(){
				if(isAnimating) return;
	
				let scrolling = $(this).scrollTop() - 7 + $(this).height() / 100,
					scroll_id;
				for(let i in sections){
					let section = sections[i];
					if(section.length === 0){
						continue;
					}
					if(scrolling > section.offset().top){
						scroll_id = section.attr("id");
					}
				}
				if(scroll_id !== id){
					id = scroll_id;
					setTimeout(() => {
						$menu_a.parent("li").removeClass("tabON");
						$menu_a.attr("aria-selected", "false");
						$("a[href='#" + id + "']", $menu).parent("li").addClass("tabON").children("a").attr("aria-selected", "true");
					},20)
					let li = $("a[href='#" + id + "']", $menu).parent("li"),
						ul = li.closest("ul"),
						wrap = li.closest(".tabArea"),
						w = wrap.width(),
						h = w / 2,
						x;
				
					if(li.length && ul.length){
						x = Math.round(li.offset().left - ul.offset().left - h + li.width() / 2);
					} else{
						x = 0;
					}
				
					if(x < 0){
						x = 0;
					}
					wrap.stop(false).animate({ scrollLeft: x }, 300);
				}
			});
		});
	}

	if($(".btmProdType.imp").length > 0){
		$(".btmProdType.imp .selectWrap .ui-selectmenu-button").on("click",function(){
			const btn = $(this);
			const wrap = btn.closest(".selectWrap");
			const selectMenu = wrap.find(".ui-selectmenu-menu");
			const list = selectMenu.find("li");
			const listA = list.find("a");
			if(!btn.closest(".fixedWrap.fixed").length > 0){
				listA.removeClass("ui-state-active").attr("aria-selected",false);
				list.eq(0).find("a").addClass("ui-state-active").attr("aria-selected",true);
			}
		})

		$(window).scroll(function(){
			let btmProdType = $(".btmProdType.imp"),
				prodStyleThumb = btmProdType.find("ul[id^='prodStyle-Thumb']"),
				uiSelectmenuText = btmProdType.find(".ui-selectmenu-text"),
				btmSelectPop = btmProdType.find("#inp_prod01-menu"),
				btn = btmSelectPop.find("li a");

			if(prodStyleThumb.length > 0){
				prodStyleThumb.each(function(index, item){
					if($(document).scrollTop() > $(item).offset().top - 200){
						btmProdType.find('option:eq(' + index + ')').prev().removeClass("selected");
						btmProdType.find('option:eq(' + index + ')').addClass("selected");
						btmProdType.find('option:eq(' + index + ')').next().removeClass("selected");
						uiSelectmenuText.text(btmProdType.find('option:eq(' + index + ')').text());
						btn.attr("aria-selected",false).removeClass("ui-state-active");
						btmProdType.find("#inp_prod01-menu li:eq(" + index + ") a").attr("aria-selected",true).addClass("ui-state-active");
					}
				})
			}
			if(btmProdType.find(".fixedWrap.fixed").length > 0){
				btmProdType.addClass("fixed");
			} else{
				btmProdType.removeClass("fixed");
			}
		});
	}
}
$(window).on("load",function(){
	tabScrollSpy();
})
$(function(){
	setTimeout(function(){
		if($(".promotionType .btmProdType.imp").length){
			let btmProdWrap = $(".promotionType .btmProdType.imp"),
				btmProdBtn = btmProdWrap.find(".ui-selectmenu-button"),
				btmProdSelect = btmProdWrap.find("select");

			btmProdBtn.wrap("<div class='fixedWrap'></div>");
			btmProdBtn.on("click",function(){
				btmProdWrap.find("#inp_prod01-menu li a").removeClass("ui-state-active").attr("aria-selected","");
				btmProdWrap.find("#inp_prod01-menu li:eq(" + btmProdSelect.find("option.selected").index() + ") a").addClass("ui-state-active").attr("aria-selected","true");
			});
		}
	},1)
})

// 쇼츠 관련
function tabScrollSpy2(){
	if($(".scrollSpyTab").length > 0){
		$(".scrollSpyTab").each(function(idx, itm){
			let scrollSpyTab = $(itm);
			let $menu = scrollSpyTab,
				$menu_a = $("a", $menu),
				id = false,
				sections = [];
			let isAnimating = false; // 애니메이션 중인지 확인하는 변수 추가

			$menu_a.off("click").on("click",function(event){
				isAnimating = true;
				let target = $(this).attr("href");
				let $target = $(target);
				if($target.length === 0){
					console.error(target + "에 해당하는 요소가 없어 해당 요소로 스크롤되지 않습니다.");
					return;
				}
				event.preventDefault();
				$("html, body").animate({
					scrollTop: $target.offset().top + 6
					},
					{
						duration: 300,
						complete: function(){
							$menu_a.parent("li").removeClass("tabON");
							$("a[href='" + target + "']", $menu).parent("li").addClass("tabON");
							isAnimating = false; // 애니메이션 완료
						}
				});
			});
	
			$menu_a.each(function(){
				const href = $(this).attr("href");
				if(href.startsWith("#")){
					var target = $(href);
					if(target.length){
						sections.push(target);
					} else{
						console.warn(href + " not found on the page");
					}
				}
			});
	
			$(window).scroll(function(){
				if(isAnimating) return;
				let scrolling = $(this).scrollTop() - 1 + $(this).height() / 100,
					scroll_id;
				for(let i in sections){
					let section = sections[i];
					if(section.length === 0){
						continue;
					}
					if(scrolling > section.offset().top){
						scroll_id = section.attr("id");
					}
				}
				if(scroll_id !== id){
					id = scroll_id;
					$menu_a.parent("li").removeClass("tabON");
					$("a[href='#" + id + "']", $menu).parent("li").addClass("tabON");
					let li = $("a[href='#" + id + "']", $menu).parent("li"),
						ul = li.closest("ul"),
						wrap = li.closest(".tabArea"),
						w = wrap.width(),
						h = w / 2,
						x;
	
					if(li.length && ul.length){
						x = Math.round(li.offset().left - ul.offset().left - h + li.width() / 2);
					} else{
						x = 0;
					}
	
					if(x < 0){
						x = 0;
					}
					wrap.stop(false).animate({ scrollLeft: x }, 300);
				}
			});
		});
	}
}

// 쇼츠 상세 좋아요 하트 애니메이션
function sshortsDetailHeartAnimation(){
    $(".sshortsDetail .chkFavo.heart").each(function(){
        $(this).on("click", function(){
            const $interactionArea = $(this).closest(".interaction");
            const aniDiv = $("<div></div>").addClass("ani");
            $interactionArea.append(aniDiv);
            const animation = bodymovin.loadAnimation({
                container:aniDiv[0],
				path:"https://img.ssgdfs.com/online_upload/animation/mo/heartAni.json",
                renderer:"svg",
                loop:false,
                autoplay:true
            });
            animation.addEventListener("complete",function(){
                aniDiv.remove();
            });
            if(!$(this).hasClass("on")){
                $(this).addClass("on");
            }
        });
    });
}

// 쇼츠 상세 동영상 제어 관련
function sshortsDetailVideoControl(){
    let hideControlTimeout;

    function playActiveSlideVideo(){
        const videos = document.querySelectorAll(".sshortsDetail .sshortsSwiper .swiper-slide video");
        videos.forEach(video => {
            video.pause();
            video.currentTime = 0;
            $(video).closest(".sshorts_content").removeClass("play stop");
            video.removeEventListener("timeupdate", handleTimeUpdate);
            video.addEventListener("timeupdate", handleTimeUpdate);
        });
        const activeVideo = document.querySelector(".sshortsDetail .sshortsSwiper .swiper-slide-active video");
        if(activeVideo){
            activeVideo.play();
            const $videoContent = $(activeVideo).closest(".sshorts_content");
            $videoContent.addClass("play");
            clearTimeout(hideControlTimeout);  // 기존 타이머를 취소
            hideControlTimeout = setTimeout(() => {  // 새 타이머 설정
                $videoContent.addClass("hideControl");
            }, 3000);
        }
    }

    function handleTimeUpdate(){
        const $videoContent = $(this).closest(".sshorts_content");
        const $progressBar = $videoContent.find(".progress-bar");
        const percent = (this.currentTime / this.duration) * 100;
        $progressBar.width(`${percent}%`);
    }

    playActiveSlideVideo();
    
    $(".sshortsDetail").on("click",".playPauseBtn",function(){
        const $video = $(this).closest(".sshorts_content").find("video")[0];
        const $videoContent = $(this).closest(".sshorts_content");
        if($video.paused){
            $video.play();
            $videoContent.addClass("play").removeClass("stop");
            clearTimeout(hideControlTimeout);
            hideControlTimeout = setTimeout(() => {
                if(!$video.paused){
                    $videoContent.addClass("hideControl");
                }
            }, 3000);
        } else{
            $video.pause();
            $videoContent.addClass("stop").removeClass("play");
            $videoContent.removeClass("hideControl");
            clearTimeout(hideControlTimeout);
        }
    });

    $(".sshortsDetail .sshortsSwiper .swiper-slide").each(function(index){
        const soundButton = $(this).find(".chkSound input[type='checkbox']");
        soundButton.attr("id", "chkSound" + index);
        soundButton.next("label").attr("for", "chkSound" + index);
    });
}

// 쇼츠 메인 좌우 스와이프 영상 영역
function sshortsMainHorizontalSwVideo(){
    const activeVideo = $(".sshortsMain .sshortsSwiper .swiper-slide-active video");
    if(activeVideo.length){
        activeVideo[0].play();
    }

    $(".sshortsMain .sshortsSwiper .swiper-slide > a figure").on("click",function(){
        const $this = $(this);
        const video = $this.parent("a").find("video").get(0);
        if(!video) return;
        if($this.closest(".con").hasClass("pause")){
            $this.closest(".con").removeClass("pause");
            video.play();
        } else{
            $this.closest(".con").addClass("pause");
            video.pause();
        }
    });
}

// 쇼츠 메인 Featured Brands
function sshortsMainThumbTabs(){
    const sshortsMain = $(".sshortsMain");
    const thumbTabContent = sshortsMain.find(".thumbTabContent");
    const thumbTabDisplay = thumbTabContent.find(".display");
    const thumbs = thumbTabContent.find(".thumb");
    
    if(thumbTabContent.length > 0){
        thumbTabContent.closest(".tabCont").addClass("thumbTabContentWrap");
    }

    thumbTabDisplay.each(function(){
        const video = $(this).find("video").get(0); // video 요소 가져오기
        if($(this).hasClass("on") && video){ // video 존재 여부 확인
            $(this).addClass("play");
            video.play();
        }
    });

    thumbs.on("click",function(){
        const targetDisplayId = $(this).data("target");
        const targetDisplay = $(targetDisplayId);

        thumbTabDisplay.removeClass("on play").each(function(){
            const video = $(this).find("video").get(0);
            if(video){
                video.pause();
                video.currentTime = 0;
            }
        });

        const videoToPlay = targetDisplay.find("video").get(0);
        if(videoToPlay){
            targetDisplay.addClass("on play");
            videoToPlay.play();
        }

        thumbs.removeClass("selected");
        $(this).addClass("selected");
    });

    // Play/Pause 버튼 기능 구현
    $(".playPauseBtn").on("click", function(){
        const parentDisplay = $(this).closest(".display");
        const video = parentDisplay.find("video").get(0);
        if(video){
            if(parentDisplay.hasClass("play")){
                video.pause();
                parentDisplay.removeClass("play");
            } else {
                video.play();
                parentDisplay.addClass("play");
            }
        }
    });
}

// 쇼츠 메인 스크롤에 따른 동영상 재생 제어
function sshortsMainVideoPlayControl(){
    const sshortsMain = $(".sshortsMain");
    const videos = sshortsMain.find("video");

    // Intersection Observer 설정
    const observerOptions = {
        root: null, // 뷰포트를 root로 사용
        rootMargin: '0px',
        threshold: 0.5 // 50% 이상 보여질 때 재생
    };

    // Observer 콜백 함수
    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            const displayContainer = $(entry.target).closest(".display");
            if(entry.isIntersecting){
                entry.target.play();
                displayContainer.addClass("play");
            } else {
                entry.target.pause(); // 비디오를 정지만 하고 currentTime은 변경하지 않음
                displayContainer.removeClass("play");
            }
        });
    };
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    videos.each(function() {
        observer.observe(this);
    });
}
$(window).on("load", function(){
	sshortsDetailHeartAnimation();
    sshortsDetailVideoControl();
	sshortsMainHorizontalSwVideo();
});
$(document).ready(function(){
	tabScrollSpy2();
    sshortsMainThumbTabs();
    sshortsMainVideoPlayControl();
});

// 키워드 모듈의 display 제어
function updateCateTabModuleFixedWrapDisplay() {
    var $cateTabModuleFixedWraps = $(".cateTabModuleFixedWrap");
    if ($cateTabModuleFixedWraps.length === 0) return;

    $cateTabModuleFixedWraps.each(function() {
        var $cateTabModuleFixedWrap = $(this);
        let allSectionsHidden = true;

        $cateTabModuleFixedWrap.find(".tabBox a").each(function() {
            var $tab = $(this);
            var targetId = $tab.attr("href").slice(1);
            var $targetElement = $("#" + targetId);

            if ($targetElement.length) {
                var rect;
                var $tabCont = $targetElement.closest(".tabCont");
                if ($tabCont.length) {
                    rect = $tabCont[0].getBoundingClientRect();
                } else {
                    var $parentElement = $targetElement.closest(".flexWrap");
                    rect = $parentElement.length ? $parentElement[0].getBoundingClientRect() : $targetElement[0].getBoundingClientRect();
                }

                var threshold;
                if ($(".midAncTab:not(.cateTabModuleFixedWrap)").length > 0 || $(".topTab").length > 0) {
                    threshold = 200;
                } else {
                    threshold = 0;
                }
                if (rect && rect.bottom > threshold) {
                    allSectionsHidden = false;
                }
            }
        });
        $cateTabModuleFixedWrap.css('display', allSectionsHidden ? 'none' : 'block');
    });
}
$(window).on("scroll", updateCateTabModuleFixedWrapDisplay);
$(document).ready(updateCateTabModuleFixedWrapDisplay);


// 역직구몰
/* 메인 - 카테고리 영역 : 상위 카테고리 선택시 하위 카테고리 노출 */
function cbsUiControl(){
	let cbsMainCate = $(".btnCateAll"),
		btn = cbsMainCate.find("a"),
		tab = cbsMainCate.closest(".fixedWrap.category"),
		tabParent = cbsMainCate.closest(".tabType01"),
		btnTabParent = tabParent.find("a"),
		childTab = tab.find(".tabType02").closest(".tabArea");

	btnTabParent.on("click",function(){
		if($(this).closest("li").hasClass("btnCateAll")){
			childTab.hide();
		} else{
			childTab.show();
			childTab.find("li").removeClass("tabON");
			childTab.find("li:first").addClass("tabON");
		}
	})
}

// 역직구몰 빠른구매 상품 체크시 App 하단 독바 컨트롤
$(function(){
	let cbsQuickBuyMain = $(".cbsQuickBuyMain");
	if(cbsQuickBuyMain.length){
		$('.frmSel input[type="checkbox"]').on("click",function(){
			if($('input:checked').length == 0){
				callAppScheme({
					"group" : "docbar",
					"function" : "show"
				});
			}else{
				callAppScheme({
					"group" : "docbar",
					"function" : "hide"
				});
			}
		});
	}
})

// 탭메뉴 수정
function dynamicTabTypeMenu(){
	function dyTabCalc(){
		let tab = $(".tabMultiWrap.imp, .tabType03.imp"),
			itm, li, winWidth;

		tab.each(function(idx, itm){
			itm = $(itm);
			li = itm.find("li");
			winWidth = $(window).width();
			let totalWidth = 0;
			if(li.length >= 5){
				itm.addClass("moreMenu");
			}
			li.each(function(){
				let liWidth = $(this).width();
				totalWidth = totalWidth + liWidth;
			})
			itm.addClass("m" + li.length);
			if(itm.width() > totalWidth){
				itm.addClass("ratio");
			}
		})
	}
	dyTabCalc();

	let dyTabMenu = $(".tabMultiWrap.imp, .tabType03.imp"),
		btn = dyTabMenu.find("li a");

	btn.on("click",dyTabCalc);
}

// 탭모듈 관련 수정 - 탭이 3개 이하일 때는 비율로 정렬하되 탭명이 길어져 영역을 넘치게 될 경우와 탭이 4개 이상인 경우에는 기본 모듈 형태 유지
function fnTabAdj(){
	const resvWrd = $([".benefitInfo"].join(", "));
	if(resvWrd.length > 0){
		const tabArea = $(".tabArea"),
			tabType01 = tabArea.find(".tabType01");
		tabType01.each(function(){
			const $this = $(this);
			if($this.closest(resvWrd).length > 0){
				const li = $this.find("> li");
				if(li.length <= 3){
					$this.addClass("flex");
				}
			}
		})
	}
}
fnTabAdj();

/* 카테고리 하위 탭 메뉴 관련 */
$(function(){
	let wrap = $(".categoryComponent .category"),
		tab = wrap.find(".tabType02.tabMultiWrap"),
		btn = tab.find("a"),
		tabType01 = wrap.find(".tabType01.tabBasic"),
		tabType01Btn = tabType01.find("a");

	tabType01Btn.on("click",function(){
		let tabBtn = $(".categoryComponent .category").find(".tabType02.tabMultiWrap a");
		setTimeout(function(){
			tabBtn.closest("ul").find("li:first").addClass("tabON");
			tabBtn.closest("ul").find("li:first a").attr("aria-selected", true);
			$(this).closest(".fixedWrap.category").css({"height":"auto"});
			btn.closest("li:first").addClass("tabON");
		},5)
	})
	btn.on("click",function(){
		btn.closest("li").removeClass("tabON");
		btn.attr("aria-selected", false);
		$(this).closest("li").addClass("tabON");
		$(this).attr("aria-selected", true);
	})
})

// 검색 레이어에서 카메라 아이콘을 제거하면서 남은 영역의 간격을 동일하게 맞춘다.
$(function(){
	let layerSearch = $(".layPop.layerSearch.on"),
		bticoList = layerSearch.find(".bticoList"),
		li = bticoList.find(">li");

	if(layerSearch.length){
		if(li.length == 2){
			bticoList.addClass("li2");
		}
	}
})

// 중문 메인, 상품상세 공통 페이지의 카메라 아이콘 제거
$(function(){
	let cMainWrapper = $(".cMainWrapper"),
		frmSearch = cMainWrapper.find(".frmSearch"),
		icoCamera = frmSearch.find(".icoCamera");

	if(cMainWrapper.length){
		if(icoCamera.length){
			icoCamera.remove();
		}
	}

	let prDetail = $(".container.prDetail"),
		prDetailCon = prDetail.find(".prDetail_con"),
		icoPic = prDetailCon.find(".icoPic");

	if(prDetail.length){
		if(icoPic.length){
			icoPic.remove();
		}
	}
})

// 스마일페이
$(function(){
	let wrap = $(".orderWrap"),
		paymentInfo = wrap.find(".paymentInfo"),
		ordPaymentsArea = paymentInfo.find("div[data-role='ord-payments-area']"),
		payBanner = paymentInfo.find(".payBanner"),
		myPay = paymentInfo.find(".tabContentWrap.myPayList"),
		radBox = paymentInfo.find(".radBox"),
		frmListInput = radBox.find("> li input"),
		btn = radBox.find("> li label"),
		smilePay = paymentInfo.find(".smilePay"),
		normalPay = paymentInfo.find(".normalPay"),
		sw = smilePay.find(".swiperCard"),
		cardPromo = smilePay.find(".card_promo"),
		btTip = sw.find(".btTip"),
		dimmed = sw.find(".tipArea .dimmed");

	cardPromo.closest(".payInfo").addClass("noShadow");
	frmListInput.on("click",function(){
		setTimeout(function(){
			if(myPay.css("display") == "block"){
				payBanner.show();
			} else{
				payBanner.hide();
			}
			let paymentInfo = frmListInput.closest(".paymentInfo"),
				rollingBanner = paymentInfo.find(".myPayList .rolling_banner"),
				sw = rollingBanner.find(".swiper-pagination"),
				btn = sw.find(".swiper-pagination-bullet"),
				active = sw.find(".swiper-pagination-bullet-active"),
				clickBtn = active.next("span");
			if(clickBtn.length == 0){
				setTimeout(function(){
					btn.first().click();
				}, 3000)
			} else{
				setTimeout(function(){
					clickBtn.click();

				}, 3000)
			}
		},1)
	})

	btTip.on("click",function(){
		setTimeout(function(){
			dimmed.offset({left:0,top:0});
			dimmed.height($(document).height());
		},1)

		let swiper = $(this).closest(".swiper-wrapper"),
			matrix = swiper.css("transform"),
			Ea = matrix.split(","),
			matrixX = Ea[4],
			tipArea = $(this).closest(".tipArea"),
			tipCont = tipArea.find(".tipCont"),
			dimmed = tipArea.find(".dimmed"),
			closeT = tipArea.find(".closeT");

		// tipCont 중앙 정렬
		tipCont.offset({left:($(window).width() / 2)});
		tipCont.css("margin-left",-tipCont.outerWidth() / 2);

		// swiper의 margin-left에 transform값 적용 후 제거
		swiper.css("transform","");
		swiper.css("margin-left", matrixX + "px");

		// swiper, tipCont 원위치
		dimmed.on("click",function(){
			swiper.css("margin-left", "");
			swiper.css("transform",matrix);
			tipCont.css("margin-left","");
			tipCont.offset({left:0});

		}),
		closeT.on("click",function(){
			swiper.css("margin-left", "");
			swiper.css("transform",matrix);
			tipCont.css("margin-left","");
			tipCont.offset({left:0});
		})
	});

	// btn.on("click",function(){
	// 	setTimeout(function(){
	// 		if(normalPay.hasClass("tabON") && $(".orderInfoContext").height() < 10){
	// 			$(".orderInfoContext").hide();
	// 		}
	// 	},1)
	// })

	if(smilePay.length > 0){
		paymentInfo.addClass("smilePayOrd");
	}

	let smilePayBanner = $(".banner-smilepay"),
		cashFill = $(".cashFill"),
		cardInfo = cashFill.find(".cardInfo.done"),
		myCashInfo = cardInfo.find(".myCashInfo");
	smilePayBanner.each(function(){
		let anchor = $(this).find("a");
		if(anchor.attr("href") == "#"){
			anchor.on("click",function(){
				return false;
			})
		}
	})

	myCashInfo.find(".balance").each(function(){
		let tipArea = $(this).find(".tipArea").clone(true),
			tit = $(this).closest(".cardInfo").find("strong");
		tit.addClass("tipWrap").append(tipArea);
		$(this).removeClass("tipWrap").find(".tipArea").remove();
	})

	if($(".prDetail_con").length > 0){
		let prDetail = $(".prDetail_con"),
			prInfo = prDetail.find(".prInfo"),
			priceInfo = prInfo.find(".priceInfo"),
			banner = prInfo.find(".banner-smilepay");

		if(banner.length > 0 && priceInfo.find(".reservesInfo:not(.loginInfo)").length > 0){
			priceInfo.find(".reservesInfo:not(.loginInfo)").addClass("force");
		}
	}
})

// GOS결제수단 관련
$(function(){
	let condition = $(".cancelOrdered, .oederPayMethod, .orderCancelDetail").length;
	if(condition){
		let payment = $(".payment"),
			payImg = payment.find("figure > img"),
			$this;

		payImg.each(function(idx, itm){
			$this = $(itm);
			let gosImgSrc = $this.is('[src$="pay_gos.png"]');
			if(gosImgSrc){
				$this.closest(".payment").addClass("gos");
			}
		})
	}
})

// 알리페이 플러스 로고 이미지 관련
$(function(){
	let condition = $(".payment").length;
	if(condition){
		let payment = $(".payment"),
			payImg = payment.find("figure > img"),
			$this;

		payImg.each(function(idx, itm){
			$this = $(itm);
			let aliPlusImgSrc = $this.is('[src$="pay_79.png"]');
			if(aliPlusImgSrc){
				$this.closest(".payment").addClass("newType");
			}
		})
	}
})

// 역직구몰 Dom 체크를 위한 옵저버 함수
function fnHasClassChk(){
	if($(".contents.cbs").length){
		let observer = new MutationObserver(function(mutations){
			let contents = $(".contents"),
				prodListWrap = contents.find(".prodList"),
				prReview = contents.find(".prReview"),
				reviewPrLi = prReview.find(".prodList"),
				reviewPr = reviewPrLi.find(".prodCont");

			// soldOut 클래스가 있는 상품은 부모 wrapper에 soldOut 클래스를 추가한다.
			prodListWrap.each(function(idx, itm){
				let $this = $(itm);
				if($this.find(".soldOut").length){
					let prodCont = $(".soldOut").closest(".prodCont");
					prodCont.addClass("soldOut");
				}
			})

			// 상품리뷰 페이지에 역직구 플래그가 있으면 해당 상품은 리뷰를 작성할 수 없다.
			reviewPr.each(function(idx, itm){
				if($(this).find(".prodFlag").length){
					$(this).addClass("disabled");
				}
			})
		});

		let target = document.querySelector(".contents.cbs");
		observer.observe(target,{
			childList: true,
			subtree: true
		});
	}
}

// temp
$(function(){
	function includeFileJs(filePath){
		const timestamp = new Date().getTime();
        const js = document.createElement("script");
        js.type = "text/javascript";
        js.src = filePath + '?t=' + timestamp;
        document.body.appendChild(js);
	}
	includeFileJs("https://img.ssgdfs.com/online_upload/temp/m_temp.js");

	function includeFileCss(filePath){
		const timestamp = new Date().getTime();
        const css = document.createElement("link");
        css.rel = "stylesheet";
        css.type = "text/css";
        css.href = filePath + '?t=' + timestamp;
        document.head.appendChild(css);
	}
	includeFileCss("https://img.ssgdfs.com/online_upload/temp/m_temp.min.css");
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

// 메인의 지금 받을 수 있는 혜택, 뷰티 키워드 영역의 탭 인덱스, randomInit 클래스를 가진 탭 인덱스를 랜덤으로 설정
function randomTabIdx(){
	let tabList = $("ul[role='tablist']"),
		tabIdVal = ['eventMenuTabList', 'beautyProfileTabList'],
		sw = $(".swiperWrap.randomInit");

	tabList.each(function(idx, itm){
		let $this = $(itm),
			$li = $this.children("li"),
			randomIdx = Math.floor(Math.random() * $li.length);
		// tabList의 id가 tabIdVal에 있거나, tabList에 randomInit 클래스가 있으면 랜덤으로 인덱스를 설정한다.
		if($.inArray($(this).attr('id'), tabIdVal) != -1 || $(this).hasClass("randomInit")){
			$li.removeClass("tabON").find("a").attr("aria-selected", false);
			$(window).on("load",function(){
				$li.eq(randomIdx).find("a").click();
			})
		}
	})
	sw.each(function(idx, itm){
		let sw = $(itm);
		sw.addClass("active");
	})
}

// cookie체크
function setCookieVal(key, value, exp){
	let date = new Date();
	//date.setTime(date.getTime() + exp * 24 * 60 * 60 * 1000);// 24시간 동안
	//date.setTime(date.getTime() + exp * 1 * 20 * 1000);// 20초 동안
	date.setDate(date.getDate() + exp);// 오늘 밤 12시까지만
	document.cookie = key + '=' + value + ';expires=' + date.toGMTString() + ';path=/';
}
function getCookieVal(key){
	let allcookies = document.cookie;
	let cookies = allcookies.split("; ");
	for(let i = 0; i < cookies.length; i++){
		let keyValues = cookies[i].split("=");
		if(keyValues[0] == key){
			return keyValues[1];
		}
	}
	return "";
}

let skipClasses = ['.spidx'];
if(getCookieVal('chkRandomInit') == "Y"){
	if($(skipClasses.join(', ')).length > 0){
		if(getCookieVal('skipRandomIdx') == "Y"){
			randomTabIdx();
		} else{
			setCookieVal('skipRandomIdx', "Y", 1);
		}
	} else{
		randomTabIdx();
	}
} else{
	setCookieVal('chkRandomInit', "Y", 1);
}

// 오버패스 html 등록시 경고창 호출
function alertMsgPopBos(){
	let template = `
	<div id="" class="layPop layerXS alertBox pop-alert-msg on">
		<div class="layCont" tabindex="0">
			<p class="txtAlert"></p>
		</div>
		<div class="btnArea">
			<button type="button" class="btnSSG btnM action"></button>
		</div>
	</div>
	<div class="dimmed"></div>
	`;
	// data-alert-msg 속성이 있는 경우에만 실행
	$("[data-alert-msg]").each(function(idx, itm){
		let $this = $(itm);
		$this.on("click",function(){
			let $this = $(this),
				$msg = $this.attr("data-alert-msg"),
				$body = $("body"),
				$dimmed = $(".dimmed");
			$(template).appendTo("#layerPopupContainer").find(".txtAlert").text($msg);
			if($("html[lang='zh']").length > 0){
				$(".pop-alert-msg").find(".btnArea .btnSSG").text("确认");
			} else{
				$(".pop-alert-msg").find(".btnArea .btnSSG").text("확인");
			}
			$body.addClass("layerPopupOpened");
			$(".layPop").focus();
			$(".layPop").on("keydown",function(e){
				if(e.keyCode == 13){
					$(this).find(".action").click();
				}
			}).find(".action").on("click",function(){
				$body.removeClass("layerPopupOpened");
				$(this).closest(".layPop").remove();
				$(".dimmed").remove();
			}).focus();
		})
	})
}

// 개인정보처리방침
function setupTermsLayout(){
	if($(".termsMemoInner.imp-modifier").length > 0){
		$(document).ready(function(){
			$(".terms-pop-wrap").appendTo("#layerPopupContainer");
			let wrap = $(".termsMemoInner.imp-modifier"),
				termsMenu = wrap.find(".terms-menu"),
				btn = termsMenu.find("a");
			btn.on("click", function(e){
				e.preventDefault();
				$("body").addClass("layerPopupOpened");
				let $this = $(this),
					hash = $this.attr('href');
				$('.terms-menu a').removeClass('on');
				$this.addClass('on');
				$(hash).addClass("on").show();
				$("#layerPopupContainer").find(".dimmed").show();
				callAppScheme({
					"group" : "popup",
					"function" : "show"
				});
				hidePopupDimm(true);
			});
			$("#layerPopupContainer .closeL, #layerPopupContainer .btnArea button").on("click",function(){
				$(this).closest(".layPop").removeClass("on").hide();
				$("#layerPopupContainer .dimmed").hide();
				$("body").removeClass("layerPopupOpened");
				$("body").removeClass("hidePopupDimm");
				$('.terms-menu a').removeClass('on');
			})
			$("#layerPopupContainer .dimmed").on("click",function(){
				$(this).hide();
				$(".terms-pop-wrap").show();
				$(".layPop").removeClass("on").hide();
				$("body").removeClass("layerPopupOpened");
				$("body").removeClass("hidePopupDimm");
				$('.terms-menu a').removeClass('on');
				callAppScheme({
					"group" : "popup",
					"function" : "hide"
				});
				hidePopupDimm(false);
			});

			if($(window).width() <= 768){
				$(".css_fo").remove();
				let breadcrumbs = $(".breadcrumbs"),
					li = breadcrumbs.find("li"),
					a = li.find("a"),
					customAnchor = $(".custom-anchor");
				a.on("click",function(){
					if($(this).hasClass("open")){
						$(this).removeClass("open");
						$(this).next(".custom-anchor").slideUp();
					}else{
						a.removeClass("open");
						$(this).addClass("open");
						$(".custom-anchor").slideUp();
						$(this).next(".custom-anchor").slideDown();
					}
					return false;
				});
				li.each(function(index){
					let customAnchorItem = customAnchor.eq(index);
					customAnchorItem.find("h3").remove();
					customAnchorItem.clone().appendTo($(this));
				});
				breadcrumbs.siblings(".custom-anchor").remove();
			}
		});
	}
};

// 페이지 로드 시 함수 실행
$(document).ready(function(){
    setupTermsLayout();
});

// 셀렉트 박스 값 변경 시 함수 재실행
$("#before_add_info_select").on("change",function(){
	setTimeout(() => {
		setupTermsLayout();
	},100);
});

// 카테고리 depth 개선
$(function(){
	setTimeout(function(){
		let cateWrap = $(".wrapper.cateWrapper"),
			contents = cateWrap.find(".contents"),
			cateFixed = contents.find(".cateFixed"),
			fixedWrap = contents.find(".fixedWrap");

		if(cateWrap.length > 0){
			if(cateFixed.length == 0){
				contents.addClass("noDepth");
			}
		}
	},1000)
})

// 매거진(여행의 신기술)
$(function(){
	let cont = $(".mz-container"),
		mzComment = $(".mz-comment, .gift_msgcardWrap"),
		cmtWrt = mzComment.find(".commentWrite"),
		txtCnt;

	if(cont.closest(".promotionType").length > 0){
		let promoCont = $(".promotionType");
		promoCont.addClass("mz-promoContainer");
	}

	cmtWrt.find("textarea").each(function(){
		$(this).on("keyup", function(e){
			let txt = $(this).val(),
				btn = $(this).closest(".commentWrite").find(".btnAreaBox > .btnType"),
				txtLen = txt.length,
				max = 300,
				giftMsgMax = 100;

			txtCnt = $(this).closest(".commentWrite").find(".maxText > span");
			if(txt){
				btn.attr("disabled",false);
				txtCnt.html(txtLen);
				
				// 선물하기 카드 메시지 작성 화면에서는 100자 제한
				if($(e.currentTarget).closest(".gift_msgcardWrap").length > 0){
					 if(txtLen > giftMsgMax){
					 	txtCnt.addClass("over");
					 	txtCnt.html(giftMsgMax - txtLen);
					 	btn.attr("disabled",true);
					 } else{
					 	txtCnt.removeClass("over");
					 }
				} else{
					txtLen > max ? (
						txtCnt.addClass("over"),
						txtCnt.html(max - txtLen),
						btn.attr("disabled",true)
					) : (
						txtCnt.removeClass("over")
					);
				}
			} else{
				btn.attr("disabled",true);
				txtCnt.html(0);
				setTimeout(function(){
					if($(e.currentTarget).closest(".gift_msgcardWrap").length > 0){
						$(e.currentTarget).css({"height":"102px"});
					} else{
						$(e.currentTarget).css({"height":"130px"});
					}
					if($(e.currentTarget).closest(".commentArea").length > 0){
						$(e.currentTarget).css({"height":"75px"});
					}
				},25)
			}
		})
	})

	let moduleWrap = $(".moduleWrap"),
		prodType = moduleWrap.find(".prodType.swipeType");

	moduleWrap.each(function(idx, itm){
		if($(itm).find(".mz-comment").length < 1 && idx == 0){
			$(itm).addClass("first");
		}
	})

	// 상품 모듈
	prodType.find(".swiperWrap").each(function(idx, itm){
		let $this = $(itm);
		if($this.find(".swiper-slide").length <= 3){
			let liLen = $this.find(".swiper-slide").length;
			$this.attr({
				"data-space-between":"8",
				"data-slide-per-view":liLen
			});
			$this.find(".swiper-pagination").remove();
		} else{
			$this.find(".swiper-container").css({"padding-bottom":"20px"});
		}
	})

	// 상단 비주얼 swiper 영역
	let origin = $(".section-original"),
		sw = origin.find(".swiperWrap"),
		slide = sw.find(".swiper-slide");

	slide.each(function(idx, itm){
		let _this = $(itm);
		if(_this.find(".prodInfo").length > 0){
			_this.addClass("prodType");
		}
	})

	// 스탬프 모듈
	if(moduleWrap.find(".stampModule").length > 0){
		let stampModule = $(".stampModule"),
			stampList = stampModule.find(".stampList"),
			stampWrap = stampList.find("span");

		stampWrap.each(function(idx, itm){
			let $this = $(itm),
				$stamp = $this.find("img");

			if($stamp.length > 0){
				$this.addClass("on");
			}
		})

		// 스탬프를 모두 모았을 때 처리
		stampList.each(function(idx, itm){
			let $this = $(itm),
				stampModule = $this.closest(".stampModule"),
				btnArea = stampModule.find(".btnArea");

			if($this.hasClass("col2")){
				stampModule.addClass("col2");
			} else if($this.hasClass("col3")){
				stampModule.addClass("col3");
			}

			if($this.find(".on").length == 9){
				stampModule.addClass("complete");
				btnArea.find(".btn-apply").removeAttr("disabled");
				btnArea.append("<div class='pop'><strong>우와, 스탬프가 완성됐네요!</strong><span>아래 버튼을 눌러,<br>이벤트 응모를 완료해요!</span></div>");
			}
		})
	}

	// 메인 - 매거진 목록
	let mzListWrap = $(".mz-container").closest(".cateWrapper");
	if(mzListWrap.length > 0){
		let catetab = mzListWrap.find(".cateArea > .tabArea > ul[role=tablist]"),
			tabBtn = catetab.find("li a span"),
			keybtn = mzListWrap.find("[data-keytabidx]"),
			conDpLiArea = mzListWrap.find(".contentsDpListArea"),
			conDpLiWrap = conDpLiArea.find(".contentsDpListWrap"),
			conDpLi = conDpLiWrap.find(".contentsDpList");

		$(".mz-container").closest(".contents").addClass("mz-listWrap");

		tabBtn.on("click",function(){ return; });

		keybtn.on("click",function(){
			let $this = $(this),
				keytab = $this.attr("data-keytabidx");
			$("[data-keytabidx="+keytab+"]").get(0).click();

			if(keytab == "key_all"){
				$(".extendCateList .keywordsType").find("li > a").attr("aria-selected",false);
			}

			if($("[data-keytabidx="+keytab+"]").closest(".extendCateList").length > 0){
				keybtn.attr("aria-selected",false);
				$("[data-keytabidx="+keytab+"]").attr("aria-selected",true);
			}
		})

		conDpLi.each(function(idx, itm){
			let $this = $(itm),
				conTxtArea = $this.find(".conTxtArea"),
				wrap = $this.closest(".contentsDpListWrap"),
				liLen = wrap.find(".contentsDpList").length;

			if(conTxtArea.find(".flag.original").length > 0){
				$this.addClass("origin");
			}
			if(liLen == 2){
				wrap.addClass("col2");
			}
		})

		if($(".keywordsComponent").length > 0){
			let keywordsComponent = $(".keywordsComponent"),
				keywords = keywordsComponent.find(".keyword");
			keywords.each(function(idx, itm){
				let $this = $(itm);
				$this.wrapInner("<span></span>");
			})
		}
	}
})

// 브랜드몰 하단 탭 클릭시 화면 스크롤 이슈 개선
function fnScrollDisable(){
	let brandMall = $(".container.brandmall");
	if(brandMall.length > 0){
		let brandPrlist = $(".brandPrlist"),
			tab = brandPrlist.find(".tabType01");

		tab.each(function(idx, itm){
			let $this = $(itm),
				li = $this.find("li"),
				a = li.find("a"),
				h;

			a.on("click",function(e){
				h = $(document).height();
				let currPos = $(window).scrollTop(),
					brandPrlist = $(this).parents(".brandPrlist"),
					fixedPos = 1078;

				brandPrlist.css({"min-height":fixedPos});

				function fnStateFixed(){
					$("html, body").animate({scrollTop:fixedPos}, 10);
					brandPrlist.css({"min-height":fixedPos});
					$(".brandPrHeader").addClass("fixed").css({"padding-top":""});
				}

				function fnStateDefault(){
					brandPrlist.css({"min-height":""});
				}

				if(currPos >= fixedPos){
					fnStateFixed();
				}
				if($("#totalNum").text() <= 2){
					fnStateDefault();
				}
				setTimeout(function(){
					brandPrlist.css({"min-height":fixedPos});
					if(currPos >= fixedPos){
						fnStateFixed();
					}
					if($("#totalNum").text() <= 2){
						fnStateDefault();
					}
				}, 650)
			});
		})
	}
}

// 주문서 : 주문상품 옵션 영역의 툴팁 관련
$(function(){
	let tipWrap = $(".tipWrap"),
		btTip = tipWrap.find(".btTip");
	tipWrap.each(function(){
		let $this = $(this);
		if($this.hasClass("tipPos") && $this.find(".amtTit").length > 0){
			let amtTit = $this.find(".amtTit"),
				br = amtTit.find("br");
			if(!br.length > 0){
				$this.find(".tipArea").css({"margin-top":"0"});
			}
		}
		if($this.closest(".contents").find(".frmSel").length > 0){
			let frmWrap = $this.closest(".contents").find(".frmWrap"),
				frmSel = $this.closest(".contents").find(".frmSel"),
				label = frmSel.find("label"),
				tipArea = $this.find(".tipArea"),
				tipCont = tipArea.find(".tipCont");

			frmSel.addClass("void");
			// tipCont 중앙 정렬
			setTimeout(function(){
				tipCont.offset({left:($(window).width() / 2)});
				tipCont.css("margin-left",-tipCont.outerWidth() / 2);
			},10)
		}
	})

	btTip.each(function(){
		let $this = $(this);
		$this.on("click",function(){
			setTimeout(function(){
				let tipWrap = $this.closest(".tipWrap"),
					setCont = $this.closest(".frmWrap").siblings(".setCont");
				if(setCont.length > 0){
					if(tipWrap.hasClass("on")){
						setCont.closest("li").css({"overflow":"visible"});
						setCont.closest(".setList").css({"overflow":"visible"});
					}
				}
			},1)
		})
	})
})

// listNum 영역의 버튼 영역 과대 설정 개선
$(function(){
	if($(".listNum.imp").length > 0){
		let listNum = $(".listNum");
		listNum.each(function(){
			let $this = $(this),
				totalNum = $this.find(".totalNum");
			if(totalNum.next().is("button") || $this.find("> button").length > 0){
				let btn = totalNum.next("button"),
					nxtEl = btn.next(),
					chldbt = $this.find("> button");

				if(!totalNum.length > 0 && chldbt.length > 0 && !nxtEl.length > 0 ||
					totalNum.length > 0 && chldbt.length > 0 && !nxtEl.length > 0){
					chldbt.wrapAll("<div class='elWrap'></div>");
				}

				if(btn.length > 0 && nxtEl.length > 0){
					btn.add(nxtEl).wrapAll("<div class='elWrap'></div>");
				}
			}
		})
	}
})

// 전자영수증 관련
$(function(){
	let ordPd = $(".orderProd"),
		titDep2 = ordPd.find("> .titDep2");
	if(titDep2.length > 0){
		let eBtn = titDep2.next("button");
		eBtn.each(function(){
			let $this = $(this);
			$this.closest(".orderProd").addClass("e_receipt");
		})
	}
})

// 팝업 닫기 시 화면 스크롤 위치 제어 후 불필요한 스타일 제거
function fnScrlChk(){
	if($(".orderHistory .btnExchange").length > 0 || $("#dtlInfo .storeInfo .layerPopupButton").length > 0){
		$(window).on("scroll", function(){
			const bodyTop = parseInt($("body").css("top"));
			if($("body").attr("class") == "" && bodyTop < 0){
				if($("body").attr("style") != undefined){
					$("body").css("top","");
				}
			}
		})
	}
}
fnScrlChk();

// 전자영수증 거스름돈(CHANGE) 영역 제어
function eRcptChgFn(){
	$(".receipt_tbl").each(function(){
		const rowChange = $(this).find(".row.change"),
			gwpInfo = $(this).find(".gwpInfo:not(.thead)"),
			gwpInfoHead = gwpInfo.prev(".gwpInfo.thead");

		// 만약 rowChange의 개수가 1개이면 rowChange에 only클래스 추가하고, 
		// 2개 이상이면 첫번째 rowChange에 first, 마지막 rowChange에 last 클래스 추가
		if(rowChange.length == 1){
			rowChange.addClass("only");
			rowChange.find("td:nth-child(4)").addClass("colspan");
			rowChange.find(".colspan").attr("colspan","2");
			rowChange.find("td:nth-child(3)").hide();
		} else if(rowChange.length > 1){
			rowChange.eq(0).addClass("first");
			rowChange.eq(rowChange.length - 1).addClass("last");
			rowChange.find("td:nth-child(4)").addClass("colspan");
			rowChange.find(".colspan").attr("colspan","2");
			rowChange.find("td:nth-child(3)").hide();
		}

		if(gwpInfo.length == 1){
			gwpInfo.addClass("only");
			gwpInfo.find("td:nth-child(4)").addClass("colspan");
			gwpInfo.find(".colspan").attr("colspan","2");
			gwpInfo.find("td:nth-child(3)").hide();
		} else if(gwpInfo.length > 1){
			gwpInfo.eq(0).addClass("first");
			gwpInfo.eq(gwpInfo.length - 1).addClass("last");
			gwpInfo.find("td:nth-child(4)").addClass("colspan");
			gwpInfo.find(".colspan").attr("colspan","2");
			gwpInfo.find("td:nth-child(3)").hide();
		}
		gwpInfoHead.find("td:nth-child(4)").addClass("colspan");
		gwpInfoHead.find(".colspan").attr("colspan","2");
		gwpInfoHead.find("td:nth-child(3)").hide();
	})
}
eRcptChgFn();

$(function(){
	$(document).on("click",".btnSSG.layerPopupButton[name='btnEReceipt'], .btnExchange[name='eReceipt']", function(){
		setTimeout(() => {
			eRcptChgFn();
		}, 1000)
	})
})

// 전자영수증 기타
function eRcptEtc(){
	if($(".r_content").length > 0){
		$(".r_content").each(function(){
			const $this = $(this);
			$this.closest(".cont").addClass("erciptCont");
		})
		const transacInfo = $(".row.transacInfo");
		transacInfo.find("span.label").each(function(){
			const $this = $(this);
			// $this의 text가 DEPARTURE 이거나 FLIGHT NO 이면, $this에 b 클래스 추가
			if($this.text() == "DEPARTURE" || $this.text() == "FLIGHT NO"){
				$this.addClass("b");
			}
		})
	}
}
eRcptEtc();

// 이미지 분석 페이지, 검색 결과 페이지
$(function(){
	// 분석 중 로딩 애니메이션
	const analysis = $(".analysis"),
		relSrch = $(".contents.relationSearch");

	const fnSrchRsltImp = function(){
		const srchImgLoading = function(){
			const photoArea = analysis.find(".photoArea"),
				loadingWrap = photoArea.find(".loadingWrap");
			$(".ani.loading").remove();
			loadingWrap.prepend("<div class='ani loading'></div>");

			const aniLoading = bodymovin.loadAnimation({
				container : $(".loading")[0],
				path : 'https://img.ssgdfs.com/online_upload/etc/ani_loading.json',
				renderer : 'svg',
				loop : true,
				autoplay : true
			})
		}

		if(analysis.length > 0){
			srchImgLoading();
		}

		// 이미지 검색 결과
		const srchImgRslt = function(){
			const relSrch = $(".contents.relationSearch"),
				relInner = relSrch.find(".relationInner"),
				photoArea = relSrch.find(".photoArea"),
				noDataList = relSrch.find(".noDataList");

			if(relSrch.length > 0){
				relSrch.addClass("imp");

				if(noDataList.length > 0){
					relSrch.addClass("resultNoData");
				} else{
					relSrch.removeClass("resultNoData");
				}

				// 상단 이미지 영역의 사이즈를 정방형으로 유지하기 위해 가로 사이즈를 세로 사이즈와 동일하게 설정
				const relSrchMt = function(){
					const winWid = $(window).width(),
						mtCalc = winWid - 18,
						head = relSrch.closest(".wrapper").find(".header.imp"),
						headH = head.height();
						photoArea.css({"width":winWid, "height":winWid});

					if(relInner.length > 0){
						// 앱과 모바일웹을 구분하기 위해
						if(head.length > 0){
							relSrch.css("margin-top", mtCalc + headH);
						} else{
							relSrch.css("margin-top", mtCalc);
						}
					}
				}
				relSrchMt();
			}
		}

		if(relSrch.length > 0){
			srchImgRslt();
		}
	}

	if(analysis.length > 0 || relSrch.length > 0){
		fnSrchRsltImp();
		$(window).on("resize", function(){
			fnSrchRsltImp();
		})
	}
})

// 모바일 인도장
$(function(){
	const dfPickup = $(".dfPickup");
	if(dfPickup.length > 0){
		dfPickup.closest(".container").addClass("dfPickupWrap");
		const usrviewArea = dfPickup.find(".usrviewArea"),
			txtPage = dfPickup.find(".txtPage"),
			aniBox = usrviewArea.find(".aniBox"),
			waitNoti = dfPickup.find(".waitNoti"),
			btnRefresh = dfPickup.find(".btn-refresh");

		function fnAni(){
			const chkPaper = bodymovin.loadAnimation({
				container : $(".chkPaper")[0],
				path : 'https://img.ssgdfs.com/online_upload/animation/mo/check_paper.json',
				renderer : 'svg',
				loop : true,
				autoplay : true
			})

			const ringBell = bodymovin.loadAnimation({
				container : $(".ringBell")[0],
				path : 'https://img.ssgdfs.com/online_upload/animation/mo/ring_bell.json',
				renderer : 'svg',
				loop : true,
				autoplay : true
			})

			const pin = bodymovin.loadAnimation({
				container : $(".pin")[0],
				path : 'https://img.ssgdfs.com/online_upload/animation/mo/pin.json',
				renderer : 'svg',
				loop : true,
				autoplay : true
			})

			// 중복 렌더링 방지
			const ani = $(".ani");
			if(ani.length > 0){
				ani.each(function(){
					let $this = $(this);
					if($this.find("svg").length > 0){
						$this.find("svg").remove();
					}
					$this.html($this.html().replace(/&nbsp;/gi,''));
				})
			}

			// 다른 곳에서도 사용할 수 있도록 return
			return{
				chkPaper : chkPaper,
				ringBell : ringBell,
				pin : pin
			}
		}

		// 번호표 발권 메인 페이지 애니메이션
		const pr1 = bodymovin.loadAnimation({
			container : $(".pr1")[0],
			path : 'https://img.ssgdfs.com/online_upload/animation/mo/pr1.json',
			renderer : 'svg',
			loop : false,
			autoplay : false
		})

		const pr2 = bodymovin.loadAnimation({
			container : $(".pr2")[0],
			path : 'https://img.ssgdfs.com/online_upload/animation/mo/pr2.json',
			renderer : 'svg',
			loop : false,
			autoplay : false
		})

		const intro1 = bodymovin.loadAnimation({
			container : $(".intro1")[0],
			path : 'https://img.ssgdfs.com/online_upload/animation/mo/intro1.json',
			renderer : 'svg',
			loop : false,
			autoplay : false
		})

		const intro2 = bodymovin.loadAnimation({
			container : $(".intro2")[0],
			path : 'https://img.ssgdfs.com/online_upload/animation/mo/intro2.json',
			renderer : 'svg',
			loop : false,
			autoplay : false
		})

		const intro3 = bodymovin.loadAnimation({
			container : $(".intro3")[0],
			path : 'https://img.ssgdfs.com/online_upload/animation/mo/intro3.json',
			renderer : 'svg',
			loop : false,
			autoplay : false
		})

		const intro4 = bodymovin.loadAnimation({
			container : $(".intro4")[0],
			path : 'https://img.ssgdfs.com/online_upload/animation/mo/intro4.json',
			renderer : 'svg',
			loop : false,
			autoplay : false
		})

		if($(".preview").length > 0){
			setTimeout(function(){
				pr1.play();
			}, 1000)

			// 스크롤 이벤트
			$(window).on("scroll", function(){
				const setIntro = dfPickup.find(".setIntro"),
					fb = dfPickup.find(".btnArea.floating").find(".btnWrap"),
					scT = $(window).scrollTop();

				// setIntro가 화면 상단으로부터 1/3지점에 도달하면 실행
				if(scT >= setIntro.offset().top - $(window).height() / 3){
					intro1.play();
				}

				// 플로팅 버튼 제어 - 스크롤이 화면 상단에 있으면 플로팅 버튼 나타나기
				if(scT <= 0){
					fb.addClass("fixed");
				} else{
					fb.removeClass("fixed");
				}
			})
		}

		const mainAniBox = $(".dfPickup .setIntro, .dfPickup .preview"),
			sw = mainAniBox.find(".swiperWrap");

		sw.on("slideChange",function(){
			setTimeout(() => {
				const $this = $(this),
					active = $this.find(".swiper-slide-active"),
					ani = active.find("figure > div");
				ani.each(function(i){
					const $this = $(this),
						aniName = $this.attr("class").replace("ani ","");
					setTimeout(() => {
						// aniName과 동일한 애니메이션 실행
						eval(aniName).play();
					}, 500);
				},1)
			})
		})

		btnRefresh.on("click", function(){
			$(this).addClass("clicked");
			if($(this).data("delay") == undefined || $(this).data("delay") == "0" || $(this).data("delay") == ""){
				setTimeout(() => {
					btnRefresh.removeClass("clicked");
				}, 2000)
			} else{
				setTimeout(() => {
					btnRefresh.removeClass("clicked");
				}, $(this).data("delay") * 1000)
			}
		})

		function initState(){
			aniBox.find(".ani").remove();
			if(dfPickup.hasClass("def")){
				aniBox.append("<div class='ani chkPaper'></div>");
			}
			if(dfPickup.hasClass("isComing")){
				aniBox.append("<div class='ani ringBell'></div>");
			}
			if(dfPickup.hasClass("location")){
				aniBox.append("<div class='ani pin'></div>");
			}
			fnAni();
		}

		// 화면 새로고침 없이 ajax 등으로 페이지 일정 부분만 변경될 것을 고려해 옵져버로 감시
		const observer = new MutationObserver(function(mutations){
			if(mutations[0].target.classList.contains("dfPickup")){
				initState();
			}
		});

		const target = document.querySelector(".contents.dfPickup");
		observer.observe(target,{
			attributes: true,
			attributeFilter: ['class'],
			childList: false,
			characterData: false
		});
		initState();
	}
})

// 인도장 관련
$(document).ready(function(){
	if($(".orderHistory").length > 0){
		function dpatEdtPdLi(){
			const pdLi = $(".orderHistory").find(".departureEdtProdList");
			const figure = pdLi.find("figure");
			figure.each(function(){
				const $this = $(this);
				if(!$this.closest(".prodCont").find(".frmSel.frmSmall.chkProd").length > 0){
					$this.css({"margin-top":"0"});
				}
			})
		}
		dpatEdtPdLi();
	}
})

// 앱카드 로그인 몇 결제수단 추가 관련
$(function(){
	if($(".orderWrap").length > 0){
		const wrap = $(".orderWrap"),
			paymentInfo = wrap.find(".paymentInfo"),
			payRadbox = paymentInfo.find("> .radBox"),
			sp = wrap.find(".simplePay"),
			bt = sp.find(".radBox > li > .appCard"),
			ly = sp.find(".appCardlayer"),
			sw = ly.find(".swiperWrap"),
			cont = sw.find(".swiper-container > .swiper-wrapper"),
			slide = cont.find(".swiper-slide"),
			sellIns = slide.find(".selInstallment"),
			btOther = ly.find(".btnOther"),
			newCard = ly.find(".newCard"),
			btChoice = newCard.find(".choiceCard"),
			btTip = newCard.find(".btTip"),
			dimmed = sw.find(".tipArea .dimmed"),
			appCardDimmed = ly.find(".dimmed");

		// appCardDimmed swipe를 막기 위해
		appCardDimmed.on("touchmove",function(e){
			e.preventDefault();
		})

		bt.on("click",function(){
			setTimeout(() => {
				const $this = $(this),
					radBox = $this.closest(".radBox");
				let lyH;
				if($this.prop("checked")){
					ly.addClass("on");
					lyH = $(".appCardlayer.on").height() + 4;
					radBox.height(lyH);
					initSwipers();
				} else{
					ly.removeClass("on");
				}
			},500)
		})

		btOther.on("click",function(){
			const $this = $(this),
				radBox = $this.closest(".simplePay").find(".radBox");
			ly.removeClass("on");
			radBox.css("height","");
			bt.prop("checked",false);
		})

		btChoice.on("click",function(){
			$(this).addClass("on");
		})

		btTip.on("click",function(){
			setTimeout(function(){
				dimmed.offset({left:0,top:0});
				dimmed.height($(document).height());
			},1)

			let swiper = $(this).closest(".swiper-wrapper"),
				matrix = swiper.css("transform"),
				Ea = matrix.split(","),
				matrixX = Ea[4],
				tipArea = $(this).closest(".tipArea"),
				tipCont = tipArea.find(".tipCont"),
				dimmed = tipArea.find(".dimmed"),
				closeT = tipArea.find(".closeT");

			// tipCont 중앙 정렬
			tipCont.offset({left:($(window).width() / 2)});
			tipCont.css("margin-left",-tipCont.outerWidth() / 2);

			swiper.css("transform","");
			swiper.css("margin-left", matrixX + "px");

			// swiper, tipCont 원위치
			dimmed.on("click",function(){
				swiper.css("margin-left", "");
				swiper.css("transform",matrix);
				tipCont.css("margin-left","");
				tipCont.offset({left:0});

			}),
			closeT.on("click",function(){
				swiper.css("margin-left", "");
				swiper.css("transform",matrix);
				tipCont.css("margin-left","");
				tipCont.offset({left:0});
			})
		})

		payRadbox.find("input").on("click",function(){
			if(ly.hasClass("on")){
				const radBox = $(".simplePay").find(".radBox");
				ly.removeClass("on");
				radBox.css("height","");
				bt.prop("checked",false);
			}
		})
	}
})

// 인천공항점 재고 알림
function stockNotiPop(){
	const restock = $(".restock");
	if(restock.length > 0){
		const storeInfo = restock.find(".storeInfo");
		if(storeInfo.closest(".layCont").length > 0){
			storeInfo.closest(".restock").addClass("storeInfoLay");
		}
	}
}
stockNotiPop();

// 폴드 디바이스 및 태블릿 대응
function tabletRespond(){
	const tabletSize = $(window).width() >= 500 && $(window).width() <= 1366,
		cMainContent = $(".contents.cMainContent"),
		onSaleToday = cMainContent.find(".onSaleToday"),
		onSaleTodaySw = onSaleToday.find(".swiperWrap");

	// 메인 라이브 커머스 영역
	function livehomeResponsive(){
		setTimeout(() =>{
			const liveArea = $(".liveListArea"),
				vodSwip = liveArea.find(".vodSwip"),
				imgWrap = vodSwip.find("a > figure"),
				laW = imgWrap.width(),
				laH = imgWrap.width() * 1.7696,
				liveList = $(".liveList.listCol02"),
				liveListThum = liveList.find(".thum"),
				liveListW = liveListThum.width(),
				liveListH = liveListW * 1.7696;
			imgWrap.height(laH);
			liveListThum.height(liveListH);

			if(laW == 0 || liveListW == 0){
				imgWrap.css({"height":"auto"});
				liveListThum.css({"height":"auto"});
				setTimeout(() =>{
					imgWrap.css({"height":laH});
				},100)
			}
		},250)
	}
	
	livehomeResponsive();
	
	if(tabletSize){
		let tarImgV = $([
				'.specialprice_imp .specialpriceList .prodTop figure',
				'.fashionTab .keywordSwipe figure',
				'.timeSaleArea .swiper-slide > a',
				'.timeSaleArea .swiper-slide a figure',
				'.rankingList.fashionList .prodCont figure',
				'.fashionHome .seeCatepr .prodList .prodCont figure',
				'.fashionHome .specialBrand .prodItems figure',
				'.todayPrice.fashion .fitSwipe .swiper-slide .prodCont figure',
				'.prodListCont.prodList.fashionList .prodCont figure',
				'.keyWordList li a',
				'.spidx_consec_type1 .prodCont figure'
			].join(', ')),
			tarImg = $([
				'.timesale_imp .saleprList .prodCont figure',
				'.categoryTabCon .prodCont figure',
				'.newEntryTabCon .brandpr_list figure',
				'.mytypeComponent .categoryPdSwipe .prodCont figure',
				'.onlyLink .prodCont figure',
				'#timeSaleList .prodList .prodCont figure',
				'.todayPriceArea .rmdProdSwiper .prodTop figure',
				'.eventListBanner .benefitsCon figure',
				'.eventListFrame .benefitsCon figure',
				'.rankingList .prodCont figure',
				'.categoryPd .categoryPdSwipe .prodList.listCol02 figure',
				'.ago3ohur.main #prodStyle-Thumb .prodCont figure',
				'.ago3ohur.main #prodStyle-Frame .prodCont figure',
				'.contents.cbs #prodStyle-Thumb .prodCont figure',
				'.contents.cbs #prodStyle-Frame .prodCont figure',
				'.recommendEtc_pr .recommendSwipe .prodCont figure',
				'.prodListCont.prodList .prodCont figure',
				'.brandmallArea .categorypdTabCon .categoryPdSwipe .prodCont figure',
				'.brandPrlist .prCon .prodList .prodCont figure',
				'.cartBenefit.cartCard .rmdProd .scrollWrap.scrollH.scrollViewNone .prodCont figure',
			].join(', ')),
			target = [tarImgV, tarImg],
			optBtns;

		$.each(target, function(idx, itm){
			const $this = $(itm);
			$this.addClass("tablet");
		})

		setTimeout(() => {
			$(".tablet").each(function(){
				const fnBtTgl3 = $(".funcBtns.toggle3Cont").find(".funcAcct");
				let $this = $(this),
					optBtns = $this.closest(".prodCont").find(".optionBtns"),
					imgRatioW = $this.width(),
					imgRatioV = imgRatioW * 1.5;

				function pdLiView(){
					if($this.closest(tarImgV).length > 0){
						$this.css({"height":imgRatioV});
						if($this.closest(".specialprice_imp").length > 0){
							return;
						} else{
							optBtns.css({"top":imgRatioV + 8});
							if($this.closest(".todayPrice.fashion").length > 0){
								optBtns.css({"top":imgRatioV});
							}
						}
					} else{
						$this.css({"height":imgRatioW});
						if($this.closest(".categoryPdSwipe").length > 0){
							optBtns.css({"top":imgRatioW});
						} else{
							optBtns.css({"top":imgRatioW + 8});
						}

						if($this.closest(".todayPriceArea").length > 0){
							let btMore = $this.closest(".todayPriceArea").find(".more");
							btMore.css({"height":imgRatioW});
						}
					}
	
					if(optBtns.closest("#prodStyle-List").length > 0){
						optBtns.removeAttr("style");
					}
	
					if($this.closest(".eventListBanner").length > 0){
						const evtLiBanH = imgRatioW * 0.399361;
						$this.css({"height":evtLiBanH});
					}
	
					if($this.closest(".eventListFrame").length > 0){
						const evtLiFraH = imgRatioW * 0.5990415,
							icoArea = $this.closest(".eventListFrame").find(".icoArea");
						$this.css({"height":evtLiFraH});
						icoArea.css({"top":evtLiFraH + 8});
						if(evtLiFraH == 0){
							setTimeout(() => {
								$this.css({"height":$this.width() * 0.5990415});
								icoArea.css({"top":$this.width() * 0.5990415 + 10});
							},100);
						}
					}

					if(imgRatioW == 0){
						$this.css({"height":"auto"});
						optBtns.css({"top":"auto"});

						setTimeout(() => {
							$this.css({"height":$this.width()});
							optBtns.css({"top":$this.width() + 8});
						},1)

						if($this.closest("#prodStyle-Thumb.listON").length > 0 || $this.closest(".listFrame.listON").length > 0){
							const listThumb = $("#prodStyle-Thumb.listON"),
								lthumFig = listThumb.find("figure"),
								lthumFigW = lthumFig.width(),
								lthumOptBtn = listThumb.find(".optionBtns"),
								lframe = $(".listFrame.listON"),
								lframeFig = lframe.find("figure"),
								lframeFigW = lframeFig.width(),
								lframeOptBtn = lframe.find(".optionBtns");
							lthumOptBtn.css({"top":lthumFigW + 8});
							lframeOptBtn.css({"top":lframeFigW + 8});
						}
					}
					if($this.closest(".brandmallArea").length > 0){
						const bmArea = $this.closest(".brandmallArea"),
							bmFigure = bmArea.find(".categorypdTabCon .categoryPdSwipe .prodCont figure");
						if(bmFigure.width() != bmFigure.height()){
							setTimeout(() => {
								bmFigure.css({"height":bmFigure.width()});
								bmFigure.closest(".prodCont").find(".optionBtns").css({"top":bmFigure.width() + 8});
							},500)
						}
					}
				}

				setTimeout(() => {
					pdLiView();
				},250)

				if($this.closest("#prodStyle-List").length > 0 || 
					$this.closest("#prodStyle-Thumb").length > 0 || 
					$this.closest("#prodStyle-Frame").length > 0){
					fnBtTgl3.on("click",function(){
						setTimeout(() => {
							if($(window).width() >= 500 && $(window).width() <= 1366){
								pdLiView();
							}
						},1)
					})
				}

				fnBtTgl3.on("click",function(){
					if($(this).closest(".tabContentWrap").find(".eventListFrame").length > 0){
						setTimeout(() => {
							const benefitEvtLiFrame = $(this).closest(".tabContentWrap").find(".eventListFrame"),
								benefitsCon = benefitEvtLiFrame.find(".benefitsCon"),
								icoArea = benefitsCon.find(".icoArea");
							icoArea.css({"top":benefitsCon.find("figure").height() + 10});
						},250)						
					}
				})
			})
		},250);
		onSaleTodaySw.attr("data-slide-per-view", "auto");
	} else{
		// 초기화
		$(".tablet").each(function(){
			let $this = $(this),
				optBtns = $this.closest(".prodCont").find(".optionBtns");
			optBtns.removeAttr("style");
			$this.removeClass("tablet").removeAttr("style");
		})
		onSaleTodaySw.attr("data-slide-per-view", "2");
		$(".eventListFrame").find(".benefitsCon .icoArea").removeAttr("style");
	}

	function responsiveBtnPos(){
		const resBtn = $([
			'.btPhoto', '.btMovie', 'figure .icCart', '.side .icCart'
		].join(', '));

		resBtn.each(function(){
			const $this = $(this),
				resBtnContainer = $([
					'.todayPrice.fashion .fitSwipe',
					'.fitProd.recomProdForU .categoryTabCon',
					'.fashionHome .seeCatepr .prodCont',
					'.cartBenefit.cartCard .rmdProd .scrollWrap.scrollH.scrollViewNone .prodCont'
				].join(', '));
			
			if(resBtnContainer.length > 0){
				const posRel = $this.closest(".prodCont").find("figure"),
					posRelW = posRel.width();

				resBtnContainer.find("figure").each(function(){
					const $this = $(this),
						$thisW = $this.width(),
						optBtns = $this.closest(".prodCont").find(".optionBtns");
					
					if($this.closest(".todayPrice.fashion").length > 0){
						$this.css({"height":$thisW * 1.5});
						optBtns.css({"top":$thisW * 1.5});
					} else{
						$this.css({"height":$thisW});
						optBtns.css({"top":$thisW});
					}
					if($this.closest(".seeCatepr").length > 0){
						$this.css({"height":$thisW * 1.5});
						optBtns.css({"top":$thisW * 1.5 + 8});
					}
				})
				if($this.closest(".prodCont").find(resBtn).length > 0){
					if($this.closest(".todayPrice.fashion").length > 0 || $this.closest(".fashionHome").length > 0){
						$this.css({"top":posRelW * 1.5 - $this.height() - 8});
						if($this.prev("button").length > 0){
							const $thisH = $this.height();
							$this.prev("button").css({"top":posRelW * 1.5 - $thisH * 2 - 12});
						}
					} else{
						$this.css({"top":posRelW - $this.height() - 8});
					}
				}
			}
		})
	}
	setTimeout(() => {
		responsiveBtnPos();
	},250)
}
$(window).on("load",function(){
	setTimeout(() => {
		tabletRespond();
	},1)
})
$(document).ajaxComplete(tabletRespond);

$(function(){
	const tabbt = $([
		'.beautyRanking .tabArea li a', 
		'.rankingCate .fixedInnerWrap li a',
		'.brandPrlist .tabArea li a',
		'.newEntry .tabArea li a',
		'.spidx_consec_type1.keywordDiv .tabBox li a'
	].join(', '));

	tabbt.on("click",function(){
		setTimeout(() => {
			tabletRespond();
		},350)
	})

	setTimeout(function(){
		if($(".contents").length > 0){
			const target = document.querySelector('.contents');
			const config = { attributes: true, childList: true, subtree: true };
			// 옵션 설명
			//  - childList : 대상 노드의 하위 요소가 추가되거나 제거되는 것을 감지.
			//  - attributes : 대상 노드의 속성 변화를 감지.
			//  - characterData : 대상 노드의 데이터 변화를 감지.
			//  - subtree : 대상의 하위의 하위의 요소들까지의 변화를 감지.
			//  - attributeFilter : 모든 속성의 변화를 감지할 필요가 없는 경우 속성을 배열로 설정.
			 
			const callback = function(mutationsList, observer){
				for(let mutation of mutationsList){
					if(mutation.type === 'childList'){
						if(mutation.addedNodes.length > 0 && $(mutation.addedNodes).find(".prodCont").length > 0){
							tabletRespond();
						  }
					}
				}
			};
			 
			// 콜백 함수가 연결된 옵저버 인스턴스를 생성.
			const observer = new MutationObserver(callback);
			 
			// 선택한 노드의 변화 감지를 시작.
			observer.observe(target, config);
		}
	},500)
})

$(function(){
	setTimeout(function(){
		if($('.prodList').length > 0){
			const target = document.querySelector('.prodList');
			const config = { attributes: true, childList: true, subtree: true };
			const callback = function(mutationsList, observer){
				for(let mutation of mutationsList){
					if(mutation.type === 'childList'){
						if(mutation.addedNodes.length > 0){
							tabletRespond();
						  }
					}
				}
			};
			 
			// 콜백 함수가 연결된 옵저버 인스턴스를 생성.
			const observer = new MutationObserver(callback);
			 
			// 선택한 노드의 변화 감지를 시작.
			observer.observe(target, config);
		}
	},500)
})

// 윈도우 창 사이즈 변경시 swiper초기화, 태블릿 대응 함수 실행
$(window).on("resize",function(){
	initSwipers();
	tabletRespond();
})

// recopick - recommendEtc_pr
function fnRecommendedEtcPr(){
	// 메인 페이지의 추천 영역
	if($(".wrapper.mainWrapper.footWrapper .mytypeComponent").length > 0){
		const mytypeComponent = $(".mytypeComponent"),
			prodCont = mytypeComponent.find(".prodCont");

		prodCont.each(function(){
			const $this = $(this);
			if(!$this.find(".optionBtns").length > 0){
				$this.closest(".mytypeComponent").addClass("recommendEtc_pr");
			}
		})
	}

	// 상품상세 페이지 추천 영역
	// if($(".prDetail_con").length > 0){
	// 	const prInfoTabCon = $(".prInfo_tabCon");
	// 	prInfoTabCon.each(function(){
	// 		const $this = $(this);
	// 		if($this.find(".recommendEtc_pr").length > 0){
	// 			$this.css({"padding-bottom":"40px"});
	// 		}
	// 	})
	// }

	// 레코픽 상품 공통
	if($(".recommendEtc_pr").length > 0){
		const recommendEtc_pr = $(".recommendEtc_pr"),
			figure = recommendEtc_pr.find("figure");
		figure.each(function(){
			const $this = $(this);
			setTimeout(() => {
				if($this.width() < $this.height()){
					$this.height($this.width());
				}
			},1)
		})
	}
}

function cartRmdProdSW(){
	// 장바구니 추천상품 swiper 만들기
	if($(".cartBenefit").length > 0){
		if($(".rmdProd").length > 0){
			const rmdProd = $(".rmdProd");
			rmdProd.each(function(){
				const $this = $(this);
				if($this.closest(".layPop.layPopBtm").length > 0){
					const layPop = $this.closest(".layPop.layPopBtm"),
						wrap = layPop.find(".scrollWrap.scrollH.scrollViewNone"),
						ul = wrap.find(".prodList.cartProd"),
						li = ul.find(".prodCont");
					if(wrap.length > 0){
						ul.addClass("swiper-wrapper");
						li.addClass("swiper-slide");
						ul.wrap('<div class="swiper-container"></div>');
						ul.closest(".swiper-container").wrap('<div class="swiperWrap swiperDivi" data-space-between="8" data-slide-per-view="2.04"></div>');
						li.find("figure").each(function(){
							const $this = $(this);
							if($this.width() < $this.height()){
								$this.height($this.width());
							}
						})
						initSwipers();
					}
				} else{
					const wrap = $this.find(".scrollWrap.scrollH.scrollViewNone"),
						ul = wrap.find(".prodList.cartProd"),
						li = ul.find(".prodCont");
					if(wrap.length > 0){
						ul.addClass("swiper-wrapper");
						li.addClass("swiper-slide");
						ul.wrap('<div class="swiper-container"></div>');
						ul.closest(".swiper-container").wrap('<div class="swiperWrap swiperDivi" data-space-between="8" data-slide-per-view="2.04"></div>');
						li.find("figure").each(function(){
							const $this = $(this);
							if($this.width() < $this.height()){
								$this.height($this.width());
							}
						})
						initSwipers();
					}
				}
			})
		} else{
			const target = document.querySelector(".cartBenefit");
			const callback = (mutationList, observer) => {
				const rmdProd = $(".rmdProd");
				rmdProd.each(function(){
					const $this = $(this);
					if($this.closest(".layPop.layPopBtm").length > 0){
						const layPop = $this.closest(".layPop.layPopBtm"),
							wrap = layPop.find(".scrollWrap.scrollH.scrollViewNone"),
							ul = wrap.find(".prodList.cartProd"),
							li = ul.find(".prodCont");
						if(wrap.length > 0){
							ul.addClass("swiper-wrapper");
							li.addClass("swiper-slide");
							ul.wrap('<div class="swiper-container"></div>');
							ul.closest(".swiper-container").wrap('<div class="swiperWrap swiperDivi" data-space-between="8" data-slide-per-view="2.04"></div>');
							li.find("figure").each(function(){
								const $this = $(this);
								if($this.width() < $this.height()){
									$this.height($this.width());
								}
							})
							initSwipers();
						}
					} else{
						const wrap = $this.find(".scrollWrap.scrollH.scrollViewNone"),
							ul = wrap.find(".prodList.cartProd"),
							li = ul.find(".prodCont");
						if(wrap.length > 0){
							ul.addClass("swiper-wrapper");
							li.addClass("swiper-slide");
							ul.wrap('<div class="swiper-container"></div>');
							ul.closest(".swiper-container").wrap('<div class="swiperWrap swiperDivi" data-space-between="8" data-slide-per-view="2.04"></div>');
							li.find("figure").each(function(){
								const $this = $(this);
								if($this.width() < $this.height()){
									$this.height($this.width());
								}
							})
							initSwipers();
						}
					}
				})
			};
			const observer = new MutationObserver(callback);
			const config = { 
				attributes: true,
				childList: true,
				//subtree: true
			};
			observer.observe(target, config);
		}
	}
}
$(document).ready(function(){
	fnRecommendedEtcPr();
	if($(".cartBenefit").length > 0){
		cartRmdProdSW();
	}
})

$(function(){
	if($(".frmSel.typeSqr").length > 0){
		const frmSel = $(".frmSel.typeSqr");
		frmSel.each(function(){
			const $this = $(this);
			if($this.closest(".agreeBox").length > 0){
				$this.closest(".agreeBox").addClass("intSqr");
			}
		})
	}
})

function prLiCnstrMod(){
	if($(".prodListCont.prodList").length > 0){
		$(".prodListCont.prodList").each(function(){
			const $this = $(this);
			$this.find(".prodCont").each(function(){
				const $this = $(this),
					a = $this.find("figure").closest("a"),
					figure = a.find("> figure"),
					btn = figure.find("> button");
				
				if(btn.length > 0){
					function btnPut(){
						btn.removeClass("show");
						a.next("button").remove();
						btn.insertAfter(a);
						setTimeout(() =>{
							const figure = btn.closest(".prodCont").find("figure"),
								w = figure.width(),
								h = figure.height(),
								calc = btn.width();
							
							btn.css({"top":h - calc, "left":w - calc});
							if($this.closest("#prodStyle-List").length > 0){
								btn.css({"top":h - calc + 18, "left":w - calc + 18});
							}
							if($this.closest("#prodStyle-Frame").length > 0){
								btn.css({"top":h - calc - 10, "left":w - calc - 10});
							}
							setTimeout(function(){
								btn.addClass("show");
							},1)
						},700)
					}
					btnPut();
					$(window).on("resize", btnPut);
					$($(".funcBtns.toggle3Cont").on("click", btnPut));
				}
			})
		})
	}
}
$(document).ready(function(){
	prLiCnstrMod();
	$(document).on("click",".funcBtns.toggle3Cont",function(){
		setTimeout(function(){
			prLiCnstrMod();
		},1)
	})
})

// 멤버십 개편 관련
function fnMbShipChk(){
	const myGrdView = $(".myGrdView");
	const badge = myGrdView.find(".badge");
	const gradeWrap = myGrdView.find(".gradeWrap");
	const benefit = myGrdView.find(".benefit");
	if(badge.closest(".contents").find(".tabType01").find("[aria-controls='memberOffline']").length > 0){
		$("[aria-controls='memberOffline']").on("click", function(){
			if(badge.closest(".tabContentWrap").hasClass("tabON")){
				return;
			} else{
				badge.removeClass("flip");
				setTimeout(function(){
					badge.addClass("flip");
				}, 1500)
			}
		})
	} else{
		setTimeout(function(){
			badge.addClass("flip");
		}, 1500)
	}

	gradeWrap.each(function(){
		const $this = $(this);
		const periodText = $this.find(".period span").text().trim();
		if(!periodText.length){
			$this.find(".contxt .inner").addClass("dpTbl");
		}
	})

	benefit.each(function(){
		const $this = $(this);
		if(!$this.find(".btnArea").length > 0){
			$this.css({"padding-bottom":"24px"});
		}
	})
}

// W컨셉 전문관 구축 관련
function fnSpidx(){
    const content = $(".contents.spidx, .contents.liquor, .wrapper.mainWrapper.footWrapper");
    if(content.length > 0){
        content.closest(".container").addClass("spidxContainer");
        const consec_type1 = $(".spidx_consec_type1, .liquor, .liquorComponent");
        const prodCont = consec_type1.find(".prodCont");
        const bigBannerArea = content.find(".bannerArea").eq(0);
        bigBannerArea.addClass("bigBannerArea");

        function optBtH(){
            prodCont.each(function(){
                setTimeout(() => {
                    const $this = $(this),
                        figure = $this.find("figure"),
                        optionBtns = $this.find(".optionBtns");
                    if($this.closest(".swiperWrap").length > 0){
                        optionBtns.css({"top":figure.height()});
                        if($this.closest(".inlineSwiper").find(".ratioExcep").length > 0 || $this.closest(".spidx.featureFrame").length > 0 && $this.closest(".keywordDiv").length > 0){
                            optionBtns.css({"top":figure.height() + 9});
                        }
                        if($this.find(".optionBtns").length > 0){
                            optionBtns.css({"margin":"0"});
                            $this.find(".prodInfo").css({"padding-top":"56px"});
                        }
                    } else{
                        optionBtns.css({"top":figure.height() + 8});
                    }
                },1)
            })
        }

        $(document).ready(function(){
            optBtH();
        })

        $(window).on("resize", optBtH);
        consec_type1.is(".keywordDiv") ? consec_type1.find(".tabBox li a").on("click", optBtH) : "";

		// 남성관
		if($(".spidx.featureFrame").length > 0){
			const videoProdModule = $(".videoProdModule:not(.inited)");
			if(videoProdModule.length == 0){ return; }
			videoProdModule.addClass("inited");

			function setupVideoPlayback(){
				const observer = new IntersectionObserver(entries => {
					entries.forEach(entry => {
						const video = entry.target.querySelector("video");
						const $videoContent = $(video).closest(".displayArea");
						if(video){
							if(entry.isIntersecting && $("html").hasClass("isApp")){
								video.play();
								$videoContent.addClass("play").removeClass("stop");
							} else {
								video.pause();
								$videoContent.addClass("stop").removeClass("play");
							}
						}
					});
				}, {
					threshold: 0.5  // 50% 이상 보여질 때
				});
		
				const videos = document.querySelectorAll(".videoProdModule video");
				videos.forEach(video => {
					observer.observe(video.closest(".displayArea"));
				});
			}

			function videoProdModuleVideoPlayControl(){
				let hideControlTimeout;
				function playActiveVideo(){
					const videos = document.querySelectorAll(".videoProdModule video");
					videos.forEach(video => {
						video.pause();
						video.currentTime = 0;
						$(video).closest(".displayArea").removeClass("play stop");
					});
					const activeVideo = document.querySelector(".videoProdModule video");
					if(activeVideo){
						activeVideo.play();
						const $videoContent = $(activeVideo).closest(".displayArea");
						$videoContent.addClass("play");
						clearTimeout(hideControlTimeout);  // 기존 타이머를 취소
						hideControlTimeout = setTimeout(() => {  // 새 타이머 설정
							$videoContent.addClass("hideControl");
						}, 3000);
					}
				}
				playActiveVideo();
				
				$(".displayArea").on("click",".playPauseBtn",function(){
					const $video = $(this).closest(".displayArea").find("video")[0];
					const $videoContent = $(this).closest(".displayArea");
					if($video.paused){
						$video.play();
						$videoContent.addClass("play").removeClass("stop");
						clearTimeout(hideControlTimeout);
						hideControlTimeout = setTimeout(() => {
							if(!$video.paused){
								$videoContent.addClass("hideControl");
							}
						}, 3000);
					} else{
						$video.pause();
						$videoContent.addClass("stop").removeClass("play");
						$videoContent.removeClass("hideControl");
						clearTimeout(hideControlTimeout);
					}
				});
			}
			videoProdModuleVideoPlayControl();
			setupVideoPlayback();
		}
    }
}
$(document).ready(function(){
    fnSpidx();
})

// 트렌드스토리 탭 -> selectbox로 변경
function fnTrendStory(){
	const trendStory = $(".contents.trendStory");
	if(trendStory.length > 0 && $("#selectCate").length > 0){
		const tabContentWrap = trendStory.find(".tabContentWrap");
		tabContentWrap.wrapAll("<div class='tabContentWrapWrapper'></div>");
		const tabContentWrapWrapper = trendStory.find(".tabContentWrapWrapper"),
			selectCate = trendStory.find("#selectCate");
		tabContentWrapWrapper.prepend(selectCate);
		selectCate.on("change", function(){
			const $this = $(this),
				idx = $this.find("option:selected").index();
			$this.closest(".tabContentWrapWrapper").find(".tabContentWrap").removeClass("tabON");
			$this.closest(".tabContentWrapWrapper").find(".tabContentWrap").eq(idx).addClass("tabON");
		})
	}
}
$(document).ready(function(){
	fnTrendStory();
})

$(function(){
	if($(".orderHistory").length > 0){
		const dpatEdtAcd = $(".departureEdtAccord");
		const toggle = dpatEdtAcd.find(".toggleAction");
		const ctrl = toggle.find(".ctrl");
		ctrl.each(function(){
			const $this = $(this);
			if(!$this.prev(".frmSel").length > 0){
				$this.addClass("pdNone");
			}
		})
	}
})

// 추천관
$(document).ready(function(){
    if($(".rcmd").length > 0){
		$(document).ready(function(){
			$(".contents.rcmd").css({"opacity":"1"});
		})
		const themeTab = $(".rcmd .fixedWrap.imp.midAncTab");
		const themeTabLi = themeTab.find("li");
		const themeTabLiCount = themeTabLi.length;
		const calcWP = (li) => {
			return li > 0 ? `calc(100% / ${li})` : '100%';
		};

		if(themeTabLiCount >= 1 && themeTabLiCount <= 3){
			themeTabLi.css({"width":calcWP(themeTabLiCount)});
		}

        const observerCallback = (mutationsList) => {
            for(const mutation of mutationsList){
                if(mutation.type === 'attributes' && mutation.attributeName === 'style'){
                    const $target = $(mutation.target);
                    const targetDisplay = $target.css('display');
                    const targetDataName = $target.data('name');

                    if(targetDisplay !== 'none'){
                        $('.rcmdFrontVisual').removeClass('tasteLogin tasteSelectBefore tasteSelectDone').addClass(targetDataName);
                    } else{
                        $('.rcmdFrontVisual').removeClass(targetDataName);
                    }
                }
            }
        };

        const observer = new MutationObserver(observerCallback);
        const observerOptions = { attributes: true, attributeFilter: ['style'] };

        $('.rcmd .rcmdFrontVisual .innerBox').each(function(){
            if($(this).css('display') !== 'none'){
                $('.rcmdFrontVisual').addClass($(this).data('name'));
            }
            observer.observe(this, observerOptions);
        });

		function updateAnchorOffset(isFirstTabClicked){
			const currentWidth = $(window).width();
			const currentDevice = deviceOffsets.find(device => currentWidth >= device.minWidth && currentWidth <= device.maxWidth);
			let currentOffset = currentDevice ? currentDevice.offset : ((currentWidth * 174) / 375);
		
			if(!$(".rcmd.featureFrame").length > 0){
				if(!isFirstTabClicked){
					currentOffset += 10;
				}
			}
			document.documentElement.style.setProperty("--anchor-offset", currentOffset + "px");
  		}
		
		const isFeatureFrame = $(".rcmd").hasClass("featureFrame");
		const deviceOffsets = isFeatureFrame ? [
            // featureFrame 페이지에서 사용할 deviceOffsets 설정
            {minWidth:280, maxWidth:319, offset:165},
            {minWidth:320, maxWidth:359, offset:172},
            {minWidth:360, maxWidth:374, offset:179},
            {minWidth:375, maxWidth:389, offset:183},
            {minWidth:390, maxWidth:396, offset:182},
            {minWidth:397, maxWidth:411, offset:183},
            {minWidth:412, maxWidth:413, offset:184},
            {minWidth:414, maxWidth:429, offset:183},
            {minWidth:430, maxWidth:673, offset:183},
            {minWidth:674, maxWidth:711, offset:225},
            {minWidth:712, maxWidth:767, offset:236},
            {minWidth:768, maxWidth:911, offset:248},
            {minWidth:912, maxWidth:1023, offset:250},
            {minWidth:1024, maxWidth:2560, offset:300},
        ] : [
            // 기존 페이지에서 사용할 deviceOffsets 설정
            {minWidth:280, maxWidth:280, offset:157},
            {minWidth:320, maxWidth:320, offset:167},
            {minWidth:360, maxWidth:360, offset:172},
            {minWidth:375, maxWidth:375, offset:176},
            {minWidth:390, maxWidth:390, offset:180},
            {minWidth:412, maxWidth:412, offset:186},
            {minWidth:414, maxWidth:414, offset:185},
            {minWidth:430, maxWidth:430, offset:180},
            {minWidth:674, maxWidth:674, offset:251},
            {minWidth:712, maxWidth:712, offset:260},
            {minWidth:768, maxWidth:768, offset:260},
            {minWidth:912, maxWidth:912, offset:260},
            {minWidth:1024, maxWidth:1024, offset:260},
        ];

		$(window).on("resize", function(){
			updateAnchorOffset(false);
		}).trigger("resize");

		function isIPhoneSE1(){
			const userAgent = navigator.userAgent;
			return(
				userAgent.match(/iPhone/i) &&
					window.screen.width === 320 &&
					window.screen.height === 568
			);
		}
		  
		function adjustMidAncTabHeight(){
			if(isIPhoneSE1()){
				setTimeout(() => {
					$(".fixedWrap.midAncTab").css("height", "auto");
				},100)
			}
		}

		$(".rcmd .fixedWrap.midAncTab .tabType li a").on("click", function(){
			const isFirstTabClicked = $(this).parent().is(":first-child");
			updateAnchorOffset(isFirstTabClicked);
			adjustMidAncTabHeight();
			if($(window).scrollTop() === 0){
				const currentOffset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--anchor-offset"));
				document.documentElement.style.setProperty("--anchor-offset", (currentOffset + 12) + "px");
			}
		});

		function adjustTabAreaTopImgSize(){
			const tabAreaTop = $(".rcmd .tabAreaTop");
			const imgWrap = tabAreaTop.find(".imgWrap");
			const imgWrapimg = imgWrap.find("img");
			imgWrapimg.each(function(){
				const $this = $(this);
				if($this.width() !== $this.height()){
					$this.closest(".imgWrap").css({"height":$this.width()});
				}
			})
		}
		adjustTabAreaTopImgSize();
		$(window).on("resize", adjustTabAreaTopImgSize);

		// 추천관 keyVisual 영역 정방형 처리
		function adjKeyVisualSize(){
			const rcmdThemeCont = $(".rcmd .rcmdThemeCont");
			const keyVisual = rcmdThemeCont.find(".keyVisual");
			const img = keyVisual.find("img");
			img.each(function(){
				const $this = $(this);
				$this.height($this.width());
			})
		}
		adjKeyVisualSize();
		$(window).on("resize", adjKeyVisualSize);

		// 탭메뉴 개수에 따른 정렬 처리
		const tab = $(".fixedWrap.scrollSpyTab .tabArea .tabBasic");
		if(tab.find("li").length <= 4){
			tab.closest(".tabArea").addClass("align");
		}

		// 팝업스토어 개선 브랜드 더보기 버튼 제어
		function featureFrameBrandShowHide(){
			const brandViewArea = $(".rcmd.featureFrame .brandViewArea");
			const viewMore = brandViewArea.find(".viewMore");
			const btn = viewMore.find("button");
		
			btn.on("click", function() {
				const $this = $(this);
				const brandViewArea = $this.closest(".brandViewArea");
				const brandList = brandViewArea.find(".brandList");
		
				if($this.hasClass("btn_open")) {
					brandViewArea.addClass("open");
					$('html, body').animate({
						scrollTop: brandList.offset().top + brandList.outerHeight() + 200 - $(window).height()
					}, 300);
				} else {
					brandViewArea.removeClass("open");
				}
			});
		}
		featureFrameBrandShowHide();

		$(document).ready(function(){
			const visual = $(".rcmdFrontVisual").length;
			const pageBanner = $(".pageBannerArea").length;
			const htmlBanner = $(".htmlBannerArea").length;
			const hasNoVisualElements = !visual && !pageBanner && !htmlBanner;
			if(hasNoVisualElements){
				$(".fixedWrap.midAncTab").addClass("mt0");
				$(window).scroll(function(){
					let scrollPosition = $(this).scrollTop();
					if(scrollPosition > 0){
						$(".fixedWrap.midAncTab").removeClass("mt0");
					} else{
						$(".fixedWrap.midAncTab").addClass("mt0");
					}
				});
			}
		});
    }
});

$(function(){
	if($(".i2303").length > 0 && !$(".liquor").length > 0){
		//혜택 모아보기 검색창
		const searchOpen = document.querySelector('.searchOpen');
		const frmSearch = document.querySelector('#tabareaCont1 .frmSearch');
		const searchInput = frmSearch.querySelector('#inp_notice01');

		searchOpen.addEventListener("click", function(){
			if(frmSearch.classList.contains('on')){
				frmSearch.classList.remove('on');
				frmSearch.classList.add('off');
			} else{
				frmSearch.classList.add('on');
				frmSearch.classList.remove('off');
				searchInput.focus();
			}
		});

		document.addEventListener("click", function(event){
			if(frmSearch.classList.contains('on') && !frmSearch.contains(event.target) && !searchOpen.contains(event.target) && searchInput.value.trim() === ''){
				frmSearch.classList.remove('on');
				frmSearch.classList.add('off');
			}
		});

		//탭 fiexd 부분 top 값 조정 subFixed 클래스 추가
		const benefitsSubLinks = document.querySelectorAll('.benefitsSub a');
		const shopArea = document.querySelector('.shopArea');

		for(let i = 0; i < benefitsSubLinks.length; i++){
			benefitsSubLinks[i].addEventListener("click", function(e){
				e.preventDefault();
				const tabId = this.getAttribute('aria-controls');
				const tabContent = document.getElementById(tabId);
				const benefitsTab = tabContent.querySelector('.benefitsTab');

				if(benefitsTab){
					shopArea.classList.add('subFixed');
				} else{
					shopArea.classList.remove('subFixed');
				}
			});			
		}
		const benefitsTabs = document.querySelectorAll('.benefitsTab');
		let hasTabON = false;
		for (let i = 0; i < benefitsTabs.length; i++){
			const parent = benefitsTabs[i].parentNode;
			if(parent.classList.contains('tabON')){
				hasTabON = true;
				break;
			}
		}  
		if(hasTabON){
			shopArea.classList.add('subFixed');
		} else {
			shopArea.classList.remove('subFixed');
		}

		//서브 탭 체크박스 클릭시 초기화버튼 block 초기화버튼 누르면 체크 해제후 초기화 버튼 none
		const subFlexboxes = document.querySelectorAll('.benefitsTab');
		subFlexboxes.forEach(function(benefitsTab){
			const checkboxes = benefitsTab.querySelectorAll('.frmSel');
			const btnRefresh = benefitsTab.querySelector('.benefitsExtendArea .btExtend');
			btnRefresh.style.display = 'none';
			btnRefresh.addEventListener("click", function(){
				checkboxes.forEach(function(checkbox){
					if(checkbox.classList.contains('cb_checked')){
						checkbox.classList.remove('cb_checked');
						let inputCheckbox = checkbox.querySelector('input[type="checkbox"]');
						if(inputCheckbox){
							inputCheckbox.checked = false;
						}
					}
				});
				btnRefresh.style.display = 'none';
			});

			checkboxes.forEach(function(checkbox){
				checkbox.addEventListener('change', function(){
					let anyChecked = false;
					checkboxes.forEach(function(checkbox){
						if(checkbox.classList.contains('cb_checked')){
							anyChecked = true;
						}
					});
					if(anyChecked){
						btnRefresh.style.display = 'block';
					} else{
						btnRefresh.style.display = 'none';
					}
				});
			});
		});

		//카테고리 버튼 클릭시 페이지 스트롤 top 0px되는 부분 차단
		$('.popupScrollBtn').click(function(event){
			event.preventDefault();
		});
	}
})

// 상품상세 개선 - 20202305
function prDetailImp(){
	const prDetail = $(".container.prDetail");
	const header = prDetail.prevAll(".header").eq(0);
	const prdHeaderWrap = $(".prdHeaderWrap");
	header.addClass("u646");

	// 상단 상품 썸네일 이미지 클릭시 화면 최상단 이동
	prdHeaderWrap.find(".prdThumb").on("click",function(){
		GlobalScroll.scrollTo(0, 200);
		return false;
	})

	// 혜택 영역의 사은품 영역 개선
	const benefitsInfo = $(".u646").find(".benefitsInfo");
	const giftBrand = benefitsInfo.find(".swiperWrap.giftBrand");
	const slideMore = giftBrand.find(".slideMore");
	giftBrand.closest("li").addClass("giftBrandWrap");

	// 바닥페이지 & 팝업 옵션 상품 선택 영역
	const prSelects = prDetail.find(".prSelect");

	prSelects.each(function(){
		const prSelect = $(this);
		const prList = prSelect.find(".prList");
		const prListHeadTit = prList.find(" > em");
		const prListInp = prList.find("input");
	
		let previous = null;
		const updatePrListHeadTitVisibility = () => {
			const checkedInputs = prListInp.filter(":checked");
			if(checkedInputs.length > 0){
				prListHeadTit.hide();
			} else{
				prListHeadTit.show();
			}
		}
	
		prListInp.on("click", function(){
			if(!$(this).closest(".layPop.u646").length > 0){
				updatePrListHeadTitVisibility();
			}
		});
		updatePrListHeadTitVisibility();
	});

	// 중문 상품 더보기 텍스트
	const pdViewMore = prDetail.find(".viewMore");
	const viewMoreTxt = pdViewMore.find("button em");
	if(viewMoreTxt.closest("html[lang='zh']").length > 0){
		viewMoreTxt.text("展开");
	}

	// 중문 역직구 페이지에서만 적용
	let updateStyles = (element, styles) => Object.entries(styles).forEach(([key, value]) => element.css(key, value));
	let flag = prDetail.find(".prodFlag");
	if(flag.find(".cbs").length > 0){
		prDetail.find("#dtlInfo, .ingdInfo").addClass("grayLine");
	}

	let tfrmTabLi = prDetail.find(".transformTab li");
	if(tfrmTabLi.length <= 3){
		updateStyles(tfrmTabLi.closest(".tabType01"), {"justify-content":"space-around"});
	}
}

// 상품상세 inited 클래스 추가
$(function(){
	$(document).ready(function(){
		const prDetail = $(".container.prDetail");
		if(prDetail.length > 0){
			setTimeout(function(){
				prDetail.addClass("inited");
			},250)
		}
	})
})

// 상품상세 진행중인 이벤트 배너 영역을 보스 입력 방식으로 변경하면서 배너 영역이 비어있을 때 처리
function chkPrDetailBannerZone(){
	const prDetail = $(".prDetail");
	const bannerZone = prDetail.find(".bannerZone");
	if(!bannerZone.length){
		prDetail.find(".eventInfo").addClass("empty");
		return;
	}
  
	if(!bannerZone.children().length || bannerZone.height() <= 10 || !bannerZone.find(".swiperBannerType").length){
		bannerZone.closest(".eventInfo").addClass("empty");
	}
}
$(document).ajaxComplete(function(){
	if($(".prDetail").length > 0 && $(".eventInfo").length > 0){
        chkPrDetailBannerZone();
    }
});
  
// 상품정보 영역 매장 정보
function fnStoreInfoSlideLenChk(){
	const prDetail = $(".prDetail");
	const storeInfo = prDetail.find(".storeInfo");
	const storeInfoSlide = storeInfo.find(".swiper-slide");
	if(storeInfoSlide.length == 1){
		storeInfoSlide.closest(".swiperStore").addClass("onlyOne");
	}
}

// prList의 input이 체크되어 있는지 여부 확인
function checkRadioButton(target){
    const nextPrSelect = $(target).closest(".prSelect").next(".prSelect");
    if($(target).prop("checked")){
        nextPrSelect.find("em").hide();
    } else{
        nextPrSelect.find("em").show();
    }
}

$(document).ready(function(){
	if($(".prDetail").find(".contents").hasClass("u646")){
		prDetailImp();
		timeMsg();
		fnStoreInfoSlideLenChk();
		$(document).ajaxComplete(fnStoreInfoSlideLenChk);
	}
	$(".u646").each(function(){
		const $this = $(this);
		$this.closest("body").addClass("u646");
	})
})
$(window).on("load",function(){
	// Q&A 답변 영역 답변완료일 영역이 비어있을 때 처리
	const qnaInfo = $(".qnaInfo");
	const date = qnaInfo.find(".date");
	date.each(function(){
		const $this = $(this);
		if($this.text().trim() ===""){
			$this.hide();
		}
	})
})

// 상품상세 하단 버튼 영역의 좋아요 카운트 숫자에 따른 클래스 추가, 제거
function fnFixBtmHeartChk(){
    const fixBtms = $(".fixBottomWrap.u646");
    fixBtms.each(function(index, fixBtm){
        const $fixBtm = $(fixBtm);
        const btnGroup = $fixBtm.find(".btnGroup");
        const heart = btnGroup.find(".chkFavo");
        const cnt = heart.find("em");

        function updateHeartClass(){
            const count = parseInt(cnt.text(), 10);
            if(isNaN(count) || count === 0){
                heart.addClass("noneCnt");
            } else{
                heart.removeClass("noneCnt");
            }
        }
        updateHeartClass();

        const observer = new MutationObserver(() => {
            updateHeartClass();
        });
		
        const targetNode = cnt.get(0);
        const config = { childList: true, subtree: true, characterData: true };
        observer.observe(targetNode, config);
    });
}

function isLoggedIn(){
    return $(".contents.u646").hasClass("isLogin");
}

function productDetailLikeAnimation(){
    const btHearts = $(".fixBottomWrap.u646 .chkFavo, .layPopBtm.u646 .chkFavo");
    if(btHearts.length > 0){
        btHearts.each(function (index, btHeart){
			const $btHeart = $(btHeart);
			$btHeart.find(".ani").remove();
			let aniDiv = document.createElement("div");
			aniDiv.classList.add("ani");
			$btHeart.append(aniDiv);
			
			let animation = lottie.loadAnimation({
				container: aniDiv,
				renderer: "svg",
				loop: false,
				autoplay: false,
				path: "https://img.ssgdfs.com/online_upload/animation/mo/ico_fixbtm_heart.json",
			});

			const $input = $btHeart.find("input");
			$input.off("click change");
			$input.on("click", function(e){
                if(!isLoggedIn()){
                    e.preventDefault();
                }
            });
			
			$input.on("change", function(e){
				e.preventDefault();
				if(!$btHeart.hasClass("on")){
					$btHeart.addClass("on");
					$btHeart.find("input").prop("checked", true);
					$btHeart.find("input").attr("checked", "checked");
					animation.play();
				} else{
					$btHeart.removeClass("on");
					$btHeart.find("input").prop("checked", false);
					$btHeart.find("input").removeAttr("checked");
					$btHeart.find("label").removeClass("view");
					// 애니메이션 영역 제거
					aniDiv.remove();
					aniDiv = document.createElement("div");
					aniDiv.classList.add("ani");
					$btHeart.append(aniDiv);
					animation.destroy();
					animation = lottie.loadAnimation({
						container: aniDiv,
						renderer: "svg",
						loop: false,
						autoplay: false,
						path: "https://img.ssgdfs.com/online_upload/animation/mo/ico_fixbtm_heart.json",
					});
				}
			});

			$btHeart.find("input").on("change", function(e){
                var isChecked = $(this).prop("checked");
                if(isChecked){
                    $(this).closest(".chkFavo").addClass("on");
                } else{
                    $(this).closest(".chkFavo").removeClass("on");
                }
            });
			
			// 체크된 상태에서는 클래스 'on'을 추가하고 애니메이션을 실행하지 않음
			if($btHeart.find("input").prop("checked")){
				$btHeart.find("label").addClass("view");
				$btHeart.addClass("on");
			}
		});
	}
}

$(document).ready(function(){
	if($(".fixBottomWrap.u646").length > 0){
		fnFixBtmHeartChk();
		if($(".contents.u646.isLogin").length > 0){
			productDetailLikeAnimation();
		} else{
			$(".btnGroup").find("input").on("click",function(){
				$(this).prop("checked",false);
			});
		}
	}

	// BTQ 상품상세 페이지의 brandHeader 가 있으면 앵커 이동의 위치를 변경시키기 위해
	if($(".container.prDetail").find(".brandHeader").length > 0){
		$(".brandHeader").closest(".prDetail").addClass("hasBrandHeader");
	}
})

function timeMsg(){
    setTimeout(() => {
        const spImp = $(".fixBottomWrap .specialprice_imp");
        spImp.each(function(){
            const timeInfo = $(this).find(".timeInfo");
            const remainTimeVal = $(this).find(".remainTimer").text();
            const remainTimeValParse = parseInt(remainTimeVal);

            if(timeInfo.parents($(this)).length > 0){
				const lang = $("html").attr("lang");
                if(remainTimeValParse >= 1){
                    if(lang === "zh"){
						$(this).find(timeInfo).html("每日特价<em>还剩下</em><em class='remainTimer'>" + remainTimeVal + "</em><em>个小时</em>");
					} else if(lang === "en"){
						$(this).find(timeInfo).html("Today's deal<em>about</em><em class='remainTimer'>" + remainTimeVal + "</em><em>hours left</em>");
					} else{
						$(this).find(timeInfo).html("오늘의 특가<em>약</em><em class='remainTimer'>" + remainTimeVal + "</em><em>시간 남았어요</em>");
					}
					if($(this).find(".remainTimer").length > 1){
						$(this).find(".remainTimer").eq(1).hide();
					}
                } else if(remainTimeValParse < 1){
					if(lang === "zh"){
						$(this).find(timeInfo).empty().addClass("warn").html("每日特价<em>今日特价马上结束了！</em>");
					} else if(lang === "en"){
						$(this).find(timeInfo).empty().addClass("warn").html("Today's deal<em>There's not much time left!</em>");
					} else{
						$(this).find(timeInfo).empty().addClass("warn").html("오늘의 특가<em>얼마 남지 않았어요!</em>");

					}
					$(".remainTimer").hide();
                }
            }
        });
    }, 1);
}

// 특정 영역 내 요소가 해당 영역을 넘치게 될 때 해당 영역에 말줄임 처리를 위한 함수(공통으로 사용 가능)
function ellipsisArea(){
	function applyEllipsis(){
		const ellipsisElements = document.querySelectorAll(".ellipsis"); // 말줄임 처리를 위한 영역에 ellipsis 클래스 추가
		ellipsisElements.forEach(ellipsis => {
			const children = Array.from(ellipsis.children);
			let ellipsisWidth = ellipsis.clientWidth;
			let totalChildWidth = 0;
			let isOverflow = false;
			
			children.forEach((child, index) => {
				child.style.width = ""; // 원래 상태로 복구
				child.style.overflow = "";
				child.style.whiteSpace = "";
				child.style.textOverflow = "";
				
				totalChildWidth += child.clientWidth;
				
				if(totalChildWidth > ellipsisWidth && !isOverflow){
					const availableWidth = ellipsisWidth - totalChildWidth + child.clientWidth;
					child.style.width = `${availableWidth}px`;
					child.style.overflow = "hidden";
					child.style.whiteSpace = "nowrap";
					child.style.textOverflow = "ellipsis";
					isOverflow = true;
				}
			});
		});
	}
	
	function debounce(func, wait){
		let timeout;
		return function(...args){
			const context = this;
			clearTimeout(timeout);
			timeout = setTimeout(() => func.apply(context, args), wait);
		};
	}
	
	const onResize = debounce(() => {
		applyEllipsis();
	}, 250);
  
	// 화면 상에 .ellipsis 클래스 존재 여부를 감시하는 observer
	const observer = new MutationObserver(debounce(mutations => {
		mutations.forEach(mutation => {
			if(mutation.type === "childList"){
				applyEllipsis();
			}
		});
	}, 250));
	const targetNode = document.body;
	const config = { childList: true, subtree: true };
	observer.observe(targetNode, config);
	window.addEventListener('resize', onResize);
	applyEllipsis();
}

// 추천관 애니메이션 함수
function animateFloating($elem, duration){
	if(!$elem) return;
	if($elem.data("animating")){
		$elem.stop(true, false).css("top", "");
	}
	$elem.data("animating", true);
	$elem.animate({
			top: "-=10",
		},
		{
			duration:duration / 4,
			easing:"swing",
			complete:function(){
				$elem.animate({
					top:"+=10",
				},
				{
					duration:duration / 4,
					easing:"swing",
					complete:function(){
						if($elem.hasClass("checked")){
							animateFloating($elem, duration);
						}
					},
				}
			);
		},
	});
}

// 아이폰에서 여권정보 수정 관련 페이지의 하단이 안전영역에 의해 플로팅 버튼 영역에 가려지는 현상을 해결하기 위해
$(function(){
	if($(".formList.passportInfo").length > 0 && $("html").hasClass("IOS") && $("html").hasClass("isApp")){
		if(!$("body").find("footer").length > 0){
			$(".contents").addClass("iOSsafeAreaDispose");
		}
	}
})

// 검색화면 내 리뷰 박스 영역
$(function(){
	const $contents = $(".contents.searchContents");
	if($contents.length > 0){
		$contents.find(".reviewList.searchReview .reviewCont").each(function(){
			const $reviewCont = $(this);
			if(!$reviewCont.find("figure").length){
				$reviewCont.find(".reSearchCont").addClass("fullWidth");
			}
		});
	
		// MutationObserver 생성
		const observer = new MutationObserver(function(mutationsList, observer){
			for(let mutation of mutationsList){
				if(mutation.type === "childList"){
					$(mutation.addedNodes).find(".reviewCont").each(function(){
						const $reviewCont = $(this);
						if(!$reviewCont.find("figure").length){
							$reviewCont.find(".reSearchCont").addClass("fullWidth");
						}
					});
				}
			}
		});
		observer.observe($contents.get(0), {
			childList: true,
			subtree: true,
		});
	}
});

// 환불계좌관리
function fnRefundAccountMgmt(){
    const rfacclayerPop = $(".rfacclayerPop");
    if(rfacclayerPop.length > 0){
		const parrentEle = rfacclayerPop.closest(".layPop");
        const bankSelect = rfacclayerPop.find(".bankSelect");
        const btnSelect = bankSelect.find(".btnSelect");
        const btnSelectSpan = btnSelect.find("span");
        const etcCardList = $(".etcCardList");

		parrentEle.addClass("rfacclayerPopParent");
        btnSelect.on("click", function(){
            const cardPopup = $(".cardPopup");
            const payMethod = cardPopup.find(".payMethod");
            const frmSel = payMethod.find(".frmSel");

            // 초기화
            frmSel.removeClass("rd_checked");
            frmSel.find("input").prop("checked", false);
            etcCardList.find("input").prop("checked", false);
            btnSelect.contents().filter(function(){
                return this.nodeType == 3; 
            }).remove();
			const lang = document.documentElement.lang;
            if(lang === "ko"){
                btnSelect.prepend(document.createTextNode("선택하세요."));
            } else if(lang === "zh"){
                btnSelect.prepend(document.createTextNode("请选择。"));
            }
            btnSelect.removeClass("selected etc");
            btnSelectSpan.empty();
            payMethod.removeClass("on");
        });

        $(document).on("click", ".closeL, .dimmed", function(){
            const cardPopup = $(".cardPopup");
            const payMethodInput = cardPopup.find(".payMethod").find("input:checked");
            const etcCardListInput = cardPopup.find(".etcCardList").find("input:checked");

            if(payMethodInput.length > 0){
                const label = $('label[for=' + payMethodInput.attr('id') + ']');
                const labelText = label.text();
                const imgEl = label.find("figure img").clone();

                btnSelect.contents().filter(function(){ 
                    return this.nodeType == 3; 
                }).remove();

                btnSelect.prepend(document.createTextNode(labelText));
                btnSelect.addClass("selected");
                btnSelectSpan.append(imgEl);

				// 만약 span에 이미지 태그가 2개 이상일 경우, 가장 마지막 것만 남긴다.
                while(btnSelectSpan.find('img').length > 1){
                    btnSelectSpan.find('img').first().remove();
                }
            }
            else if(etcCardListInput.length > 0){
                const label = $('label[for=' + etcCardListInput.attr('id') + ']');
                const labelText = label.text();

                btnSelect.contents().filter(function(){ 
                    return this.nodeType == 3; 
                }).remove();

                btnSelect.prepend(document.createTextNode(labelText));
                btnSelect.addClass("selected etc");
                btnSelectSpan.empty();
            }
        });
    }
}

// 주류 전문관
function fnLiquor(){
	if($(".liquor").length > 0){
		const liquor = $(".liquor");
		const qklinkBox = liquor.find(".quicklinkBox");
		const qklinkBoxFig = qklinkBox.find("figure");
		setTimeout(function(){
			liquor.addClass("show");
		}, 350)
		qklinkBoxFig.each(function(){
			const $this = $(this);
			$this.height($this.width());
		})
		liquor.closest(".container").addClass("liquorWrap");

		const bannerArea = $(".bannerArea");
		const sw = bannerArea.find(".swiperWrap");
		sw.each(function(){
			const $this = $(this);
			const slideLen = $this.find(".swiper-slide").length;
			const paging = $this.find(".paging");
			const swipeControls = $this.find(".swipeControls");
			if(slideLen < 2){
				paging.remove();
				swipeControls.remove();
			}
		})
		fnChkLiquorStateFlag();
	}
}

function fnChkLiquorStateFlag(){
	const liquorList = $(".liquor .prodCont, .liquorList, .liquorDiscList");
	const stateFlag = liquorList.find(".prodState");
	stateFlag.each(function(){
		const $this = $(this);
		let closestFigure = $this.closest("figure");
		closestFigure.addClass("isFlag").css({"background":"none"});
		if($this.hasClass("adult")){
            closestFigure.addClass("isFlagAdult");
        }
	})
}

// 임직원 혜택 - 배우자 동의 이용약관
function spouseTbl(){
    $(document).ready(function(){
        if($(".u729 .spouseWrap").length > 0){
			setTimeout(() => {
				const spouseWrap = $(".u729").find(".spouseWrap");
				const tabBtn = $(".u729").find("a[aria-controls='employeesWifeTab']");
				tabBtn.on("click", function(){
					setTimeout(() => {
						const tbl = spouseWrap.find(".tblH");
						tbl.each(function(){
							const $table = $(this);
							const $ths = $table.find("thead th");
							const $tds = $table.find("tbody td");
							for(let i = 0; i < $ths.length; i++){
								$($ths[i]).height('auto');
								$($tds[i]).height('auto');
								let thHeight = Math.round($($ths[i]).outerHeight());
								let tdHeight = Math.round($($tds[i]).outerHeight());
								let maxHeight = Math.max(thHeight, tdHeight);
	
								$($ths[i]).height(maxHeight);
								$($tds[i]).height(maxHeight);
	
								thHeight = $($ths[i]).height();
								tdHeight = $($tds[i]).height();
								maxHeight = Math.max(thHeight, tdHeight);
	
								$($ths[i]).height(maxHeight);
								$($tds[i]).height(maxHeight);
							}
						});
					}, 1);
				});
				$(window).off("resize", spouseTbl).on("resize", spouseTbl);
			},1)
        }
    });
}

// 상품 리스팅 이미지 비율, 버튼 위치, 패딩값 등등을 동적으로 제어
function adjustElements(){
	const fashionComponent = $(".fashionComponent");
	const keywordSwipe = fashionComponent.find(".keywordSwipe");
	keywordSwipe.attr("data-slide-per-view", "auto");
    const excludeClasses = [".saleprWrap", ".ratioExcep", ".spidx_consec_type1", ".layPop"];
    let prodList = $(".prodList.listCol02, .prodList.listFrame").not(excludeClasses.join(", "));
    prodList.find(".prodCont").each(function(){
		setTimeout(() => {
			const $this = $(this);
			if(excludeClasses.some(excludeClass => $this.closest(excludeClass).length)) return;
			let multiplier = $this.closest(".fashionList").length > 0 ? 1.5 : 1;
			setFigureSize($this, multiplier);
			setOptionBtnsPosition($this);
		})
    });

    $(".newEntry .newEntryTabCon .brandpr_list > li").each(function(){
        setFigureSize($(this));
    });

    function setFigureSize($element, multiplier = 1){
        let figure = $element.find("figure");
        let figureWidth = Math.floor(figure.parent().width());
		if(figureWidth === 0){
			let figWidth = figure.width();
			if(figWidth === 0){
				figure.css({"width":"100%", "height":"auto", "opacity":"1"});
			} else{
				figure.css({"width":"100%", "height":figWidth, "opacity":"1"});
			}
		} else{
			figure.css({
				"width": figureWidth,
				"height": figureWidth * multiplier
			});
		}
		if(figure.closest(".beautyHome").find(".categoryPd").length > 0){
			setTimeout(() => {
				figure.closest(".beautyHome").find(".categoryPd").css({"height":"auto"});
			},500)
		}
    }

    function setOptionBtnsPosition($element){
        let figure = $element.find("figure");
        let optionBtns = $element.find(".optionBtns");
        let paddingTop = parseInt($element.css("padding-top"));
        const topValue = Math.floor(figure.height()) + paddingTop;
        optionBtns.css("top", topValue);
    }
}

const debounce = (func, delay) => {
    let debounceTimer;
    return function(){
        const context = this;
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(context, args), delay);
    }
}

$(document).ready(adjustElements);
$(window).on("load", adjustElements);
$(document).ajaxSuccess(adjustElements);
$(window).resize(debounce(adjustElements, 100));
$(".newEntrySwipe").on("slideChange", adjustElements);
$(".newEntry .tabBasic li > a").on("click", function(){
	setTimeout(() => {
		adjustElements();
	},100)
});
$(".funcBtns.toggle3Cont").click(debounce(adjustElements, 100));
$(".keywordDiv .tabBox li a").click(debounce(adjustElements, 100));

// 19금 상품 처리
function fnFlagStateAdult(){
    const processProdState = (className) => {
        $(`.${className}:not(.processed)`).each(function(){
            const element = $(this);
            const siblingA = element.siblings("a");
            let a;
			
			element.closest("figure").css({"background":"none"});
            if(siblingA.length && siblingA[0].onclick){
                a = siblingA;
                element.addClass("processed").css({"cursor": "pointer"});
                if(a[0].onclick){
                    element[0].onclick = a[0].onclick;
                }
            }

            const nextATag = element.next("a");
            if(nextATag.length > 0){
                const figure = nextATag.find("figure");
                if(figure.length > 0){
                    const img = figure.find("img");
                    const soldOut = figure.find(".prodState.soldOut");
                    if(img.length > 0){
                        if(soldOut.length > 0 && className === "prodState.adult"){
                            soldOut.after(element);
                        } else{
                            img.before(element);
                        }
                        const elementsInFigure = figure.find(`.${className}`);
                        if(elementsInFigure.length > 1){
                            elementsInFigure.first().remove();
                        }
                    }
                }
            }

            // 이벤트 페이지 내 19금 상품 처리
            if(element.closest(".prodType.listType").length > 0 &&
                element.closest(".promotionType").length > 0 &&
                element.next("a[role='button']").find(`.${className}`).length > 0){
                element.remove();
            }

			// 오늘의 특가 영역의 '오특' 플래그 처리
			if(element.closest(".prodCont").find(".flag_specialprice").length > 0){
				element.closest(".prodCont").find(".flag_specialprice").remove();
			}
        });
    }
    const process = () => {
        processProdState("prodState.adult");
        processProdState("prodState.soldOut");
    }
    $(document).ready(process);
    $(document).ajaxComplete(process);
}

function fnFlagStateAge(){
    const processProdState = (className) => {
        $(`.${className}:not(.processed)`).each(function(){
            const element = $(this).addClass('processed');
            const siblingA = element.siblings("a");

            if(siblingA.length && siblingA[0].onclick){
                element.css({ "cursor": "pointer" }).on('click', siblingA[0].onclick);
            }

            const nextATag = element.next("a");
            if(nextATag.length > 0){
                const figure = nextATag.find("figure");
                if(figure.length > 0){
                    const img = figure.find("img");
                    const soldOut = figure.find(".prodState.soldOut");
                    if(img.length > 0){
                        if(soldOut.length > 0 && className === "prodState.adult"){
                            soldOut.after(element);
                        } else{
                            img.before(element);
                        }
                    }
                }
            }

            if(element.closest(".prodType.listType").length > 0 &&
                element.closest(".promotionType").length > 0 &&
                element.next("a[role='button']").find(`.${className}`).length > 0){
                element.remove();
            }

            if(element.closest(".prodCont").find(".flag_specialprice").length > 0){
                element.closest(".prodCont").find(".flag_specialprice").remove();
            }

            let targetElement = element.closest("figure").length > 0 ? element.closest("figure") : element.parent();
            let parentWidth = targetElement.width();
            targetElement.removeClass("sizeL sizeM sizeS");
            if(parentWidth > 199){
                targetElement.addClass("sizeL");
            } else if(parentWidth > 106 && parentWidth <= 199){
                targetElement.addClass("sizeM");
            } else{
                targetElement.addClass("sizeS");
            }

            if(targetElement.find("figure").length > 0){
                targetElement.find("figure").addClass("ref");
            } else if(targetElement.is("figure")){
                targetElement.addClass("ref");
            }

            if(element.siblings("img").length > 0){
                wrapImage(element.siblings("img"));
            } else if(element.parent().find("img").length > 0){
                wrapImage(element.parent().find("img"));
            }
        });
    };

    const wrapImage = (img) => {
        if(!img.closest(".imgWrap").length){
            img.wrap("<div class='imgWrap'></div>");
        }
    };

    const process = () => {
        processProdState("prodState.adult");
        processProdState("prodState.age");
        processProdState("prodState.soldOut");
    };

    $(document).ready(process);
    $(document).ajaxComplete(process);
}

function executeFnFlagState(){
	const clickableElements = [
        ".tabBox > li > a",
        ".funcBtns.toggle3Cont .funcAcct"
    ];
    if($(".prodState.age").length > 0){
        fnFlagStateAge();
        clickableElements.forEach(function(selector){
            $(selector).on("click",function(){
                $(".prodState.age.processed, .prodState.adult.processed, .prodState.soldOut.processed").removeClass("processed");
                setTimeout(fnFlagStateAge, 10);
            });
        });
    } else{
        fnFlagStateAdult();
    }
}
$(document).ready(executeFnFlagState);
$(document).ajaxComplete(executeFnFlagState);
$(window).on("resize", executeFnFlagState);
	
// 출입국정보관리 하단 stepList
function fnStepListActive(){
    const exitPopup = $(".exitPopup");
    const stepContent = exitPopup.find(".stepContent.u724");
    if(!stepContent.length) return;
    stepContent.find(".timeType").remove();
	
    function scrollIntoView(li, noani = false){
        if(!li.length) return;
        let wrap = li.closest(".stepList"),
            w = wrap.width(),
            ul = li.closest("ul"),
            h = w / 2,
            mx = wrap.get(0).scrollWidth - w,
            x = Math.round(li.offset().left - ul.offset().left - h + li.width() / 2);
        x = Math.max(0, Math.min(mx, x));
        if(noani){
            wrap.stop(false).scrollLeft(x);
        } else{
            wrap.stop(false).animate({ scrollLeft: x }, 300);
        }
    }

    function handleDOMChanges(mutationsList){
        for(let mutation of mutationsList){
            if(mutation.type === "attributes" && mutation.attributeName === "class"){
                const activeItem = $(".exitPopup .stepList > ul li.active");
                scrollIntoView(activeItem, false);
                stepContent.find(".timeType").remove();
            }
        }
    }

    const targetNode = document.querySelector(".exitPopup .stepList > ul");
    const observerConfig = { attributes: true, childList: true, subtree: true };
    const liObserver = new MutationObserver(handleDOMChanges);
    if(targetNode) liObserver.observe(targetNode, observerConfig);
    $(document).on("touchmove touchstart click", ".stopover .choiceList .frmSel input", function(){
        const scrollElement = $(".stopover").closest(".section");
        const scrollElementHeight = scrollElement.get(0).scrollHeight;
        setTimeout(() => {
			scrollElement.animate({scrollTop:scrollElementHeight}, 1000);
        }, 500);
		$(document).one("touchmove touchstart click",function(){
			scrollElement.stop();
		})
    });
}

// 공식스토어 브랜드별 페이지에 브랜드명을 클래스명으로 추가
function addBrandNameToClass(){
    const brandCont = $(".container.brandContainer");
    const brandName = brandCont.find(".logo, .brandLogo, h1 > a");
    brandName.each(function (){
        const $this = $(this);
        const href = $this.attr("href");
        if(href && href.includes(",") && href.includes(":")){
            const hrefSplit = href.split(",");
            hrefSplit.forEach(function (hrefSplitItem){
                const hrefSplitItemTrim = hrefSplitItem.trim();
                const hrefSplitItemTrimSplit = hrefSplitItemTrim.split(":");
                if(hrefSplitItemTrimSplit.length > 1){
                    const key = hrefSplitItemTrimSplit[0].trim();
                    const value = hrefSplitItemTrimSplit[1].trim();
                    if(key === "bran_nm" && value){
                        const clsBrandVal = value.replace(/'/g, "").replace("});", "");
                        if(clsBrandVal){
                            brandCont.addClass(clsBrandVal);
                        }
                    }
                }
            });
        }
    });
}

// 전시코너스탁 모듈이 페이지에 존재할 경우 모듈에 클래스를 추가한다.
function fnExhModule(){
    const exhModules = document.querySelectorAll(".area_lv1");
    if(exhModules.length > 0){
        exhModules.forEach(function(exhModule){
            exhModule.classList.add("exhModule");
            const children = Array.from(exhModule.children);
            const hasGrayLineChild = children.some(function(child){
                return child.classList.contains("grayLine");
            });
            // const previousElement = exhModule.previousElementSibling;
            // if(hasGrayLineChild && (!previousElement || !previousElement.classList.contains("grayLine"))){
                // const newLine = document.createElement("hr");
                // newLine.classList.add("exhModule", "grayLine");
                // exhModule.parentNode.insertBefore(newLine, exhModule);
            // }
			const messageComponents = exhModule.querySelectorAll(".messageComponent");
            messageComponents.forEach(function(messageComponent){
                if(!messageComponent.textContent.trim() && messageComponent.children.length === 0){
                    exhModule.style.marginBottom = "0";
                }
            });
        });
		if($(".messageComponent").length > 0 && $(".messageComponent").text().trim() === ""){
			$(".messageComponent").css({"margin":"0"});
		}
    }
	$("hr.exhModule.grayLine").each(function(){
		const $this = $(this);
		if($this.prev().hasClass("lineModule") || $this.next().hasClass("lineModule") || ($this.prev().is("script") && $this.prev().prev().hasClass("lineModule"))){
			$this.remove();
		}
	});
}
$(document).ready(function(){
	fnExhModule();
})
$(document).ajaxComplete(fnExhModule);

// 럭셔리관 프로그레스바 radius값 계산
function fnLuxPrgsbarRadiusCalc(){
	setTimeout(() =>{
		if($(".luxuryBrand .swiper-pagination-progressbar").length > 0){
			const luxuryBrand = $(".spidx .luxuryBrand");
			const sw = luxuryBrand.find(".swiperWrap");
			let progressbar = sw.find(".swiper-pagination-progressbar");
			let fill = progressbar.find(".swiper-pagination-progressbar-fill");
			
			function radiusCalc(){
				setTimeout(() => {
					let radius = 4;
					let fillScaleX = fill.css("transform").split("(")[1].split(")")[0].split(",")[0];
					let fillScaleY = fill.css("transform").split("(")[1].split(")")[0].split(",")[3];
					let fillScale = fillScaleY / fillScaleX;
					let radiusCalc = fillScale * radius;
					let radiusCalcCeil = Math.ceil(radiusCalc);
					fill.css({"border-radius": + radiusCalcCeil});
				},300)
			}
			radiusCalc();
			sw.on("slideChange", radiusCalc);
		}
	})
}
$(document).ready(fnLuxPrgsbarRadiusCalc);

// 장바구니 할인율 영역의 툴팁 이동
$(function(){
	if($(".cartBody .wrapType03 .cartProd").length > 0){
		const cartBody = $(".cartBody");
		const cartProd = cartBody.find(".wrapType03 .cartProd");
		const tipWrap = cartProd.find(".tipWrap");
		tipWrap.each(function(){
			const $this = $(this);
			const originWon = $this.closest(".prodInfo").find(".priceArea").find(".originWon");
			$this.appendTo(originWon);
		})
	}
})

// 선물하기
function fnGiftServiceInit(){
	// 받은 선물 등록 페이지 숫자만 입력
	const onlyNumInp = $(".onlyNumInp");
	onlyNumInp.on("keyup", function(){
		const $this = $(this);
		$this.val($this.val().replace(/[^0-9]/g,""));
	});

	// priceSummary 영역
	const orderOption = $(".orderBody").find(".orderOption");
	const priceSummary = orderOption.find(".priceSummary");
	priceSummary.each(function(){
		const $this = $(this);
		if(!$this.prev().length > 0){
			$this.closest(".orderOption").addClass("noneChk");
		}
	})

	// 메인 - 카드 추천 영역
	const recommendCardImg = $(".recommendCardImg");
	recommendCardImg.each(function(idx){
		$(this).addClass("idx" + idx);
	})

	// 메인 - 카드 권종 선택 영역의 할인율 포함 여부 체크
	const fnSelectGiftcardArea = () => {
		const selectGiftcardArea = $(".selectGiftcardArea");
		const sw = selectGiftcardArea.find(".swiperWrap");
		const slide = sw.find(".swiper-slide");
		slide.each(function(){
			const $this = $(this);
			const discount = $this.find(".discount");
			if(discount.length > 0){
				$this.addClass("discount");
			}
		})
	}
	$(document).ready(fnSelectGiftcardArea);
	$(document).ajaxComplete(fnSelectGiftcardArea);
}

// 선물하기 - 카드 확인 팝업의 출력된 메세지에 따옴표 삽입
function giftMsgQutInt(){
	if($(".messageArea").length > 0){
		const messageArea = $(".messageArea");
		const message = messageArea.find(".message");
		const txt = message.find("p");
		txt.closest(".layCont").addClass("qutInt");
		txt.each(function(){
			const $this = $(this);
			const txtVal = $this.html();
			if(!txtVal.startsWith('“') && !txtVal.endsWith('”')){
				$this.html('“' + txtVal + '”');
			}
		})
	}
}

// 선물하기 - 메시지 카드 작성
function giftMsgCardWrt(){
	if($(".gift_msgcardWrap").length > 0){
		const gift_msgcardWrap = $(".gift_msgcardWrap");
		const frmSwitch = gift_msgcardWrap.find(".frmSwitch");
		const frmSwitchInput = frmSwitch.find("input");
		frmSwitchInput.each(function(){
			const $this = $(this);
			if($this.prop("checked")){
				$this.closest(".optWrap").addClass("open");
			}
			$this.on("change", function(){
				$(this).closest(".optWrap").toggleClass("open", $(this).prop("checked"));
			})
		})
		let input = gift_msgcardWrap.find(".infoCont .frmInp input");
		input.each(function(){
			const $this = $(this);
			if($this.val() === ""){
				$this.next(".icDel").hide();
			} else{
				$this.next(".icDel").show();
			}
		})
		input.on("input",function(e){
			if($(this).val() == ""){
				$(this).next(".icDel").hide();
			} else{
				$(this).next(".icDel").show();
			}
		})
		input.siblings(".icDel").on("click",function(){
			$(this).hide().prev("input").val("").focus();
		})
		setTimeout(() => {
			if($(".fixBottomWrapBox").length > 0){
				const fixBottomWrapBox = $(".fixBottomWrapBox");
				const fixBottomWrap = fixBottomWrapBox.find(".fixBottomWrap");
				const floatingArea = fixBottomWrapBox.find(".floatingArea");
				if(floatingArea.find(".optionsReflection").length > 0){
					floatingArea.closest(".fixBottomWrapBox").addClass("opt");
				}
			}
		},100)
	}
}

// 선물하기 - 카드 전체 보기
function giftMsgCardView(){
	if($(".giftservice_msgWrap").length > 0){
		const msgWrap = $(".giftservice_msgWrap");
		const msgTab = msgWrap.closest(".wrapper").find(".msgCardTabType01");
		msgTab.each(function(){
			const $this = $(this);
			$this.closest(".wrapper").addClass("giftCardView");
			$this.find("li > a").on("click", function(){
				$("html, body").animate({scrollTop:0}, 300);
			})
		})
	}
}

// 세로로 긴 타입의 visualBanner 제어
function fnVtypeVisualBanner(){
	if($(".visualBanner.typeV").length > 0){
		const vTypeVisualBanner = $(".visualBanner.typeV");
		vTypeVisualBanner.each(function(){
			const $this = $(this);
			const swipeControls = $this.find(".swipeControls");
			const pagination = swipeControls.find(".swiper-pagination");
			const paging = $this.find(".paging");
			pagination.remove();
			swipeControls.prependTo(paging);
		})
	}
}
function setupMutationObserver(){
	const observer = new MutationObserver(function(mutations, obs){
		mutations.forEach(function(mutation){
			for(const node of mutation.addedNodes){
				if(node instanceof HTMLElement){
					if(node.matches(".visualBanner.typeV") || node.querySelector(".visualBanner.typeV")){
						fnVtypeVisualBanner();
						break;
					}
				}
			}
		});
	});
	observer.observe(document.body,{childList:true, subtree:true});
}
$(window).on("load", function(){
	fnVtypeVisualBanner();
	setupMutationObserver();
})

function fnMysMainMenuSafariBugFix(){
	let docScrollTop = document.documentElement.scrollTop;
	let winPageYOffset = window.pageYOffset;
	if(docScrollTop > 0 || winPageYOffset > 0){
		setTimeout(() => {
			docScrollTop = 0;
			winPageYOffset = 0;
			$("html, body").animate({scrollTop:0}, 100);
		},100)
	}
}
$(document).ajaxComplete(initMiscellaneous);

function popOrientChk(){
	$(window).on("orientationchange", function(){
		const IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
		const ANDROID = /Android/.test(navigator.userAgent) && !window.MSStream;
		const layPopBtm = $(".layPop.layPopBtm.u646");
		layPopBtm.each(function(){
			const $this = $(this);
			const layCont = $this.find(".layCont");
			const lCont = $this.find(".lCont");
			if($this.hasClass("on")){
				setTimeout(() => {
					if(window.matchMedia("(orientation: portrait)").matches){
						if(IOS){
							if(lCont.outerHeight() <= 100){
								lCont.css({"height":""});
							}
						} else if(ANDROID){
							if(layCont.css("margin-bottom") != "0px"){
								layCont.css({"margin-bottom":""});
								lCont.css({"height":""});
							}
						}
					};
				},320);
			};
		})
	});
}
popOrientChk();

function brandFilterAddClassChk(){
	const searchBrandList = $(".searchBrandList.u1286");
	if(searchBrandList.length > 0){
		const searchBrandList = $(".searchBrandList.u1286");
		searchBrandList.each(function(){
			const $this = $(this);
			$this.closest(".brandTabs").addClass("u1286");
		})
	}
}
$(document).ready(brandFilterAddClassChk);
$(document).ajaxComplete(brandFilterAddClassChk);

function brandFilterTabEdit(){
	if($(".u1286").length > 0){
		$("li[name='liStorBranTab'] > a").on("click", function(){
			var lang = $("html").attr("lang");
			var buttonToClick;
			if(lang === "ko"){
				buttonToClick = $(".u1286 .toggleBt[aria-controls^='searchEN']");
				buttonToClick.trigger("click");
			}
		});
	};
}
$(document).ready(brandFilterTabEdit);

// 기획전 템플릿
function fnPromoTemplate(){
	if($(".promoTemplateImgWrap").length > 0){
		const wrap = $(".promoTemplateImgWrap");
		wrap.each(function(){
			const $this = $(this);
			const promotionImg = $this.find(".promotionImg");
			const brandName = $this.find(".blurImg .bannerTxt .brandName");
			const titPromotion = $this.find(".titPromotion");
			const blurImg = $this.find(".blurImg");

			$this.closest(".contents.promotionType.moduleArea").addClass("promoTemplate");
			function checkAndUpdateLines(){
				const titPromotionHeight = titPromotion.height();
				const titPromotionLineHeight = parseInt(titPromotion.css("line-height"), 10);
				const lineNumCalc = titPromotionHeight / titPromotionLineHeight;
				if(lineNumCalc > 1){
					promotionImg.addClass("multiLine");
				} else{
					promotionImg.removeClass("multiLine");
				}
				if(brandName.length > 0){
					const promotionImgHeight = promotionImg.height();
					const promotionImgHeightVw = promotionImgHeight / $(window).width() * 100 + "vw";
					const blurImgHeight = blurImg.height(); 
					const blurImgHeightVw = blurImgHeight / $(window).width() * 100 + "vw";
					promotionImg.css({"height":promotionImgHeightVw});
					blurImg.css({"height":blurImgHeightVw});
				}
			}
			
			const observer = new MutationObserver(mutations => {
				mutations.forEach(mutation => {
					if(mutation.type === "childList" || mutation.type === "caracterData"){
						checkAndUpdateLines();
					}
				})
			});
			observer.observe(titPromotion[0], {childList : true, characterData : true, subtree : true});
			checkAndUpdateLines();
		});
	}
}
$(document).ready(fnPromoTemplate);
// $(document).ajaxComplete(fnPromoTemplate);

// 랭킹UI 개선
function rankingCateTab(){
	const rankingPage = $(".contents[name='rankingPage']");
	if(rankingPage.length > 0){
		const tab = $(".fixedInnerWrap > .tabArea > .tabType01");
		for(let i = 0; i < tab.length; i++){
			const $this = $(tab[i]);
			const li = $this.find(" > li");
			if(li.length <= 4){
				$this.addClass("flex" + li.length);
			}
		}
	}
}
$(document).ready(rankingCateTab);
$(document).ajaxComplete(rankingCateTab);

// html include - 퍼블 작업용
function fnHtmlInclude(){
    function isHtmlPage(){
        var url = document.location.href;
        return url.endsWith('.html') || url.includes('.html#');
    }

    function loadIncludedContent(){
        if(!isHtmlPage()){
            return; // .html 확장자가 아니거나 .html#이 아니면 함수 실행을 중단
        }

        var allElements = document.getElementsByTagName('*');
        Array.prototype.forEach.call(allElements, function(el){
            var includePath = el.dataset.includePath;
            if(includePath){
                loadContent(el, includePath);
            }
        });
		document.addEventListener('click', function(event){
			if(event.target.className == "cate"){
				initSwipers();
			}
		});
    }

    function loadContent(element, path){
        var xhttp = new XMLHttpRequest();
        $("html").addClass("htmlInclude");
        xhttp.onreadystatechange = function(){
            if(this.readyState == 4 && this.status == 200){
                if(element.parentNode){
                    element.outerHTML = this.responseText;
                    initializeDynamicContent();
                }
            }
        };
        xhttp.open('GET', path, true);
        xhttp.send();
    }

    function initializeDynamicContent(){
        initDockBar();
        initSwipers();
        // initScrollEvt();
        LayerPopup();
        initHeader();
        initToolTips();
        initFormText();
        initAccordions();
        fnHasClassChk();
        hidePopupDimm();
        initSelectBox();
        initTabAreas();
        funcLiveChat();
        initToggleContents();
        initStickyTabs();
        initMiscellaneous();
    }

    function initStickyTabs(){
        if($(".transformTab").length > 0){
            var skip = false;
            GlobalScroll.addListener(function(data){
                if(skip) return;
                var ty = calculateStickyTabOffset();
                if(data.scroll >= ty){
                    $(".transformTab").addClass("fixed");
                    $("#header").addClass("notvisible");
                } else {
                    $(".transformTab").removeClass("fixed");
                    $("#header").removeClass("notvisible");
                }
            });
        }
    }

    function calculateStickyTabOffset(){
        if($(".prDetail .u646").length > 0){
            if($("#beneInfo").length > 0){
                return $("#beneInfoCon").offset().top - 10;
            } else{
                return $(".prDetail .u646").parent().offset().top;
            }
        } else{
            return $(".transformTab").parent().offset().top;
        }
    }
    window.addEventListener('load', loadIncludedContent);
}
fnHtmlInclude();

// 프로모션 타이틀 조정
function fnProMotionTitle(){
	const proTopAni = document.querySelector('.proTopAni');
	if(!proTopAni) return;

	const promotionElements = proTopAni.querySelectorAll('.titPromotion, .promotionDate');
	const titHeadElements = document.querySelectorAll('.titHead');

	titHeadElements.forEach(function(titHead){
		titHead.textContent = '';
		titHead.appendChild(createErtBigBox(promotionElements));
	});
	AnimationToErtSpeed()
}

// 프로모션 페이지에서 슬라이스된 이미지의 높이가 소수점으로 계산되었을 때 소수점 이하를 정수로 내림해서 흰 줄이 생기는 현상 없애기
function normalizeImgHt(selector){
    var imgs = document.querySelectorAll(selector);
    imgs.forEach(function(img){
        const originHeight = img.clientHeight;
        const floorHeight = Math.floor(originHeight);
        img.style.height = floorHeight + "px";
    });
}

// 프로모션 페이지 사용 예시
// document.addEventListener("DOMContentLoaded", function(){
//     normalizeImgHt(".MO .evtWrap .evtSec img"); // 기본 선택자
// });

function createErtBigBox(promotionElements){
	const ertBigBox = createDivElementWithClass('ertBigBox');
	const ertBox = createErtBox(promotionElements);
	ertBigBox.appendChild(ertBox);
	return ertBigBox;
}

function createDivElementWithClass(className){
	const div = document.createElement('div');
	div.className = className;
	return div;
}

function createErtBox(promotionElements){
	const ertBox = createDivElementWithClass('ertBox');
	for (let i = 0; i < 5; i++){
		const ertDiv = createErtDiv(promotionElements);
		ertBox.appendChild(ertDiv);
	}
	return ertBox;
}

function createErtDiv(promotionElements){
	const ertDiv = createDivElementWithClass('ert');
	promotionElements.forEach(function(el){
		ertDiv.appendChild(el.cloneNode(true));
	});
	return ertDiv;
}

function AnimationToErtSpeed(){
    const textElements = document.querySelectorAll('.ert');
    const speed = 50;

    textElements.forEach(function(textElement){
        const textWidth = textElement.offsetWidth;
        const duration = textWidth / speed;

        textElement.style.animationDuration = `${duration}s`;
    });
}

fnProMotionTitle();

// fixedWrap 카테고리 탭모듈
function fnFixedWrapCateTab(){
	let cateTabModuleFixedWrap = $(".cateTabModuleFixedWrap:not(.inited)");
	if(cateTabModuleFixedWrap.length == 0){ return; }
	cateTabModuleFixedWrap.addClass("inited");

	$(".topTab").each(function() {
		const $topTab = $(this);
		let found = false;
		$topTab.nextAll(".cateTabModuleFixedWrap").each(function(){
			if(found){
				return false;
			}
			const $current = $(this);
			const prevIsMidAncTabFixedWrap = $current.prevAll(".midAncTab.fixedWrap:first").length > 0;
			if(!prevIsMidAncTabFixedWrap){
				$current.addClass("prevTopTab");
				found = true;
			}
		});
	});

	cateTabModuleFixedWrap.each(function(){
		const $this = $(this);
		const tabBox = $this.find(".tabBox");
		let totalWidth = 0;
		const liElements = tabBox.find("li");
		if(liElements.length === 0){
            $this.addClass("empty");
        } else{
            liElements.each(function(){
                const $li = $(this);
                const margin = parseInt($li.css("marginLeft")) + parseInt($li.css("marginRight"));
                const width = $li.outerWidth();
                totalWidth += width + margin;
            });

            const tabAreaWidth = tabBox.closest(".tabArea").width();
            if(totalWidth <= tabAreaWidth){
                liElements.last().css("margin-right", 0);
            }
        }
	});
}

// 메인 퀵메뉴 sorting 변경
function mainQuickMnSort(){
    const sw = $(".main_quickMnArea .swiper-wrapper");
    let lis = sw.find("li"); // 모든 li 태그를 찾음

    // 첫 5개 li에서 a 태그들을 추출
    let as = [];
    lis.slice(0, 5).each(function(){
        $(this).find("a").each(function(){
            as.push($(this)); // 현재 a 태그를 배열에 추가
        });
    });

    // 주어진 순서대로 a 태그들을 재배치
    const reordered = [
        as[0], as[5], // 첫 번째 li
        as[1], as[6], // 두 번째 li
        as[2], as[7], // 세 번째 li
        as[3], as[8], // 네 번째 li
        as[4], as[9], // 다섯 번째 li
    ];

    // 재배치된 a 태그들을 li에 다시 삽입
    lis.slice(0, 5).each(function(index) {
        $(this).empty(); // 현재 li의 내용을 비움
        $(this).append(reordered[index * 2]); // 첫 번째 a 태그 추가
        if(reordered[index * 2 + 1]) { // 두 번째 a 태그가 있다면 추가
            $(this).append(reordered[index * 2 + 1]);
        }
    });
}

if($("#wrapper.mainWrapper.footWrapper").length > 0){
    let observer;
    const observerConfig = { childList: true, subtree: true };
    const targetNode = document.querySelector('#wrapper');
    const callback = function(mutationsList, observer){
        for(let mutation of mutationsList){
            if(mutation.addedNodes.length){
                const quickMnAreaExists = document.querySelector(".main_quickMnArea");
                if(quickMnAreaExists){
                    mainQuickMnSort();
                    observer.disconnect();
                    break;
                }
            }
        }
    };
    observer = new MutationObserver(callback);
    observer.observe(targetNode, observerConfig);
    setTimeout(() => {
        observer.disconnect();
    }, 5000);
}

// 친환경 캠페인 관련
$(function(){
    if($(".btEditCampaign").length > 0 || $(".tright").filter(function(){
        return $(this).text().toLowerCase().indexOf("participation") !== -1;
    }).length > 0){
        $(".btEditCampaign").each(function(){
            $(this).closest("li").addClass("grid");
        });
        $(".tright").filter(function(){
            return $(this).text().toLowerCase().indexOf("participation") !== -1;
        }).each(function(){
            $(this).closest("li").addClass("grid");
        });
    }
});

// 올드배치 관련 수정
function addSalePselectBoxGrayLine(){
	const salePselectBox = $(".salePselectBox");
	if(salePselectBox.length > 0){
		salePselectBox.closest(".btmProdType.selProdType").addClass("grayLine");
	}
}

function oldSaleTabChange() {
	// .salePselectBox가 페이지에 존재하는지 확인
	const tabContainer = document.querySelector('.salePselectBox');
	if (tabContainer) {
	  // 탭 버튼과 탭 리스트
	  const tabButtons = document.querySelectorAll('.salePselectBox button');
	  const tabListItems = document.querySelectorAll('.clearanceSaleP .tabType02 li');
	  // 탭 버튼에 클릭 이벤트
	  tabButtons.forEach((button, index) => {
		button.addEventListener('click', () => {
		  // 모든 탭 리스트 아이템에서 'tabON' 클래스를 제거
		  tabListItems.forEach((item) => item.classList.remove('tabON'));
		  // 클릭된 버튼에 해당하는 탭 리스트 아이템에 'tabON' 클래스를 추가
		  tabListItems[index].classList.add('tabON');
		  // 탭 컨텐츠 전환 추가 (선택된 탭과 컨텐츠 활성화)
		  toggleTabContent(index);
		});
	  });
	  // 탭 컨텐츠를 관리하는 함수
	  function toggleTabContent(activeIndex) {
		const tabContents = document.querySelectorAll('.clearanceSaleP .lCont .tabContentWrap');
		// 모든 탭 컨텐츠에서 'tabON' 클래스를 제거
		tabContents.forEach((content) => content.classList.remove('tabON'));
		// 선택된 탭 컨텐츠에 'tabON' 클래스를 추가
		tabContents[activeIndex].classList.add('tabON');
	  }
	}
}
  // 페이지가 로드된 후 탭 전환
  window.addEventListener('DOMContentLoaded', () => {
	oldSaleTabChange();
  });

// 면세포인트 양도 말풍선(.dfSpeechBubble) close zmfflrtl none 처리
function dfBubbleClose() {
	const speechBubble = document.querySelector('.dfSpeechBubble');
	const dfGradient = document.querySelector('.dfGradient');
	// .dfSpeechBubble가 존재할 때만 실행
	if (speechBubble) {
	  const closeButton = speechBubble.querySelector('.dfBubbleClose');
	  closeButton.addEventListener('click', () => {
		dfGradient.remove();
	  });
	}
}
  
// DOMContentLoaded 이벤트에서 함수 실행
document.addEventListener('DOMContentLoaded', dfBubbleClose);

function initAllAtOnce(pop){
	if(typeof(pop) != "undefined"){
		initSortRange(pop);
	}else{
		initSortRange();
	}
	initFormText();
	initTabAreas();
	initTabBasics();
	initToggleContents();
	initToolTips();
	initAccordions();
	initSwipers();
	initVideoPlayers();
	initVideoPlayersFullscreen();
	initMiscellaneous();
	//$(window).on("load",function(){
		initViewMore();
	//})
	initTimers();
	initTimeTracker();
	dfLimitLayerProg();
};

$(function(){
	/*if($.isNumeric(window.serverTime) === false){
		window.serverTime = (new Date()).getTime();
	}*/
	new GlobalScroll();
	new GlobalClock();
	new LayerPopup();
	initHeader();
	initDockBar();
	initAllAtOnce();
	funcLiveChat();
	//initSortRange();
	//initFormText();
	//initTabAreas();
	//initTabBasics();
	//initToggleContents();
	//initTabFixed();
	//initToolTips();
	//initAccordions();
	//initSwipers();
	initScrollEvt();
	//initVideoPlayers();
	//initMiscellaneous();
	sindyFaceUI();
	nestedSwiper();
	initPromoTabImp();
	$(window).resize(function(){
		initPromoTabImp();
		prLiCnstrMod();
	})
	fnHtmlInclude();
	cbsUiControl();
	fnHasClassChk();
	dynamicTabTypeMenu();
	liveChatFnUiShowHide();
	alertMsgPopBos();
	fnScrollDisable();
	fnMbShipChk();
	liveChatLike();
	ellipsisArea();
	fnLiquor();
	spouseTbl();
	addBrandNameToClass();
	fnGiftServiceInit();
	giftMsgCardWrt();
	giftMsgCardView();
	fnVtypeVisualBanner();
	chkPrDetailBannerZone();
	fnFixedWrapCateTab();
	addSalePselectBoxGrayLine();
});
(function($, window){
    $(function(){
        // 상품상세 옵션선택 레이어 210927
        // 바닥 페이지 색상 선택 영역 버튼에 disabled 추가
        $(".contents .colorOption.v210927").find(".con .colorSl input").attr("disabled", true);

        // 옵션 선택 팝업에서 색상 더보기 버튼을 눌렀을 때 높이값 계산
        function calcColorViewMoreAreaHeight(e){
            var $target = $(e.target),
                content = $target.closest(".layCont"),
                targetSelect = $target.closest("div"),
                contentHeight = content.find(".colorSl").closest(".prSelect").height(),
                contentOpenHeight = content.height() + contentHeight - 2,
                contentCloseHeight = content.height() - contentHeight + 48;

            if( targetSelect.hasClass("open") ){
                targetSelect.removeClass("open");
                content.animate({
                    height:contentCloseHeight
                }, 0)
            } else{
                targetSelect.addClass("open");
                content.animate({
                    height:contentOpenHeight
                }, 0)
            }
        }

        // 옵션 선택 팝업에서 사이즈 더보기 버튼을 눌렀을 때 높이값 계산
        function calcSizeViewMoreAreaHeight(e){
            var $target = $(e.target),
                content = $target.closest(".layCont"),
                targetSelect = $target.closest("div"),
                contentHeight = content.find(".sizeSl").closest(".prSelect").height(),
                contentOpenHeight = content.height() + contentHeight - 11,
                contentCloseHeight = content.height() - contentHeight + 61;

            if( targetSelect.hasClass("open") ){
                targetSelect.removeClass("open");
                content.animate({
                    height:contentCloseHeight
                }, 0)
            } else{
                targetSelect.addClass("open");
                content.animate({
                    height:contentOpenHeight
                }, 0)
            }
        }

        // 옵션 선택 팝업에서 옵션 리스트가 펼쳐졌을 때 높이값 계산
        function calcDropdownSelectHeight(e){
            var $target = $(e.target),
                content = $target.closest(".layCont"),
                dropdownSelect = $target.closest(".dropdownSelect"),
                contentHeight = content.find(".optListWrap").height(),
                contentOpenHeight = content.height() + contentHeight,
                contentCloseHeight = content.height() - contentHeight;

            if( dropdownSelect.hasClass("open") ){
                dropdownSelect.removeClass("open");
                content.animate({
                    height:contentCloseHeight
                }, 250)
            } else{
                dropdownSelect.addClass("open");
                content.animate({
                    height:contentOpenHeight
                }, 250);

                if(dropdownSelect.closest("li").index() > 0){
                    $('.lCont').animate({
                        scrollTop: $(document).height()-$(window).height()},
                        250,
                        "easeOutQuint"
                    );
                }
            }
        }

        // 옵션 선택 팝업의 색상 선택 더보기 버튼 클릭 이벤트
        $("#btnSortSelectOption .prSelect.colorOption .prList .btn").unbind("click").bind("click", calcColorViewMoreAreaHeight);

        // 옵션 선택 팝업의 사이즈 선택 더보기 버튼 클릭 이벤트
        $("#btnSortSelectOption .prSelect .sizeSl").closest(".prList").find(".btn").unbind("click").bind("click", calcSizeViewMoreAreaHeight);

        // 옵션 선택 팝업의 선택하세요 버튼 클릭 이벤트
        $("#btnSortSelectOption .btnDropdownSelect").unbind("click").bind("click", calcDropdownSelectHeight);

        // 옵션 선택 팝업의 리스트가 펼쳐졌을 때 리스트 선택시 이벤트
        $("#btnSortSelectOption .optListWrap input").unbind("click").bind("click", function(e){
            var btnSortSelectOption = $("#btnSortSelectOption .optListWrap input");
            calcDropdownSelectHeight(e);
            doneLengthChk();
            var btnDropdownSelect = $(this).closest(".dropdownSelect").find(".btnDropdownSelect"),
                layCont = $(this).closest(".layCont"),
                idx = $("#btnSortSelectOption .dropdownSelect").index($(this).parents(".dropdownSelect")),
                pageBtnSortSelectOption = $(".container .btnSelect.layerPopupButton"),
                idxText = btnDropdownSelect.text($(this).next("label").text());

            pageBtnSortSelectOption.eq(idx).text($(this).next("label").text());
            layCont.addClass("selected");
        })

        // 옵션 선택 팝업 상태 초기화
        function btnSortSelectOptionConditionReset(){
            var colorSlInp = $("#btnSortSelectOption .colorSl input:checked"),
                sizeSlInp = $("#btnSortSelectOption .sizeSl input:checked"),
                colorCon = $(".container .colorSl").closest(".con"),
                colorSlLenght = $(".container .colorSl").closest(".con li").length,
                sizeCon = $(".container .sizeSl").closest(".con"),
                sizeSlLenght = $(".container .sizeSl").closest(".con li").length,
                dropdownSelect = $("#btnSortSelectOption .dropdownSelect");

            dropdownSelect.removeClass("open");
            colorSlInp.each(function(){
                if(colorSlLenght > 6){
                    colorCon.addClass("moreList");
                }
                if(this.checked){
                    var coloridx = $('#btnSortSelectOption .colorSl input').index(this);
                    if(coloridx < 6){
                        $(this).closest(".prList, .con").removeClass("moreListSelect");
                        $(".container .v210927 .colorSl").closest(".con").removeClass("moreListSelect");
                    }
                }
            })

            sizeSlInp.each(function(){
                if(sizeSlLenght > 6){
                    sizeCon.addClass("moreList");
                }

                if(this.checked){
                    var sizeidx = $('#btnSortSelectOption .sizeSl input').index(this);
                    if(sizeidx < 5){
                        $(this).closest(".prList, .con").removeClass("moreListSelect");
                        $(".container .v210927 .sizeSl").closest(".con").removeClass("moreListSelect");
                    }
                }
            })
        }
        // 옵션 선택 팝업의 하단 조회 버튼, 상단의 닫기 버튼 클릭시 이벤트
        $("#btnSortSelectOption .btnBtm button, #btnSortSelectOption .closeL").unbind("click").bind("click", btnSortSelectOptionConditionReset);

        // 옵션 선택 팝업의 팝업 외부 영역 클릭시 이벤트
        $(document).unbind("click").bind("click", function(e){
            var btnSortSelectOptionOutsideTarget = $("#btnSortSelectOption");
            if(btnSortSelectOptionOutsideTarget.has(e.target).length == 0){
                btnSortSelectOptionConditionReset();
                sortSelecOptionDefault(e);
            }
        })

        // 바닥 페이지의 옵션 선택 셀렉트 박스 클릭시
        $("button[data-id='btnSortSelectOption'").unbind("click").bind("click", function(){
            btnSortSelectOptionConditionReset();
            var btnSortSelectOption = $("button[data-id='btnSortSelectOption'"),
                $this = $(this);
            btnSortSelectOption.removeClass("on");
            $this.addClass("on");
        });

        // 바닥 페이지의 색상 선택 영역에 더보기 버튼이 있을 경우 팝업에도 동일하게 표현
        var prSelectColor = $(".container .prSelect.v210927 .colorSl").closest(".con");
        prSelectColor.closest(".prList").unbind("click").bind("click", function(){
            if(prSelectColor.hasClass("moreListSelect")){
                $("#btnSortSelectOption .con li .colorSl").closest(".con").addClass("moreList moreListSelect");
            }
        })

        // 바닥 페이지의 사이즈 선택 영역에 더보기 버튼이 있을 경우 팝업에도 동일하게 표현
        var prSelectSize = $(".container .prSelect.v210927 .sizeSl").closest(".con");
        prSelectSize.closest(".prList").unbind("click").bind("click", function(){
            if(prSelectSize.hasClass("moreListSelect")){
                $("#btnSortSelectOption .con li .sizeSl").closest(".con").addClass("moreList moreListSelect");
            }
        })

        function sortSelecOptionDefault(e){
            var LayerPopup = $("#btnSortSelectOption");
            if(LayerPopup.has(e.target).length === 0){}
        }

        // 옵션 선택 팝업의 최초 처음 선택시 상태값 초기화
        function btnSortSelectOptionResetAll(){
            $(this).addClass("change");
            var sizeSlInp = $("#btnSortSelectOption .sizeSl input"),
                colorSlInp = $("#btnSortSelectOption .colorSl input"),
                selectOpt = $("#btnSortSelectOption .optListWrap input"),
                btnSortSelectOpt = $("#btnSortSelectOption .btnDropdownSelect"),
                cnBtnSortSelectOpt = $("html:lang(zh) #btnSortSelectOption .btnDropdownSelect"),
                pageSortSelectOpt = $(".container .prSelect .btnSelect.layerPopupButton"),
                cnPageSortSelectOpt = $("html:lang(zh) .container .prSelect .btnSelect.layerPopupButton"),
                btnSortSelectBtnBtm = $("#btnSortSelectOption .btnBtm button"),
                pageColorSlInp = $(".container .layerPopupButton .colorSl input"),
                pageSizeSlInp = $(".container .layerPopupButton .sizeSl input");
                sizeSlInp.prop("checked", false);
                colorSlInp.prop("checked", false);
                pageColorSlInp.prop("checked", false);
                pageSizeSlInp.prop("checked", false);
                selectOpt.prop("checked", false);
                btnSortSelectOpt.text("선택하세요");
                cnBtnSortSelectOpt.text("请选择");
                pageSortSelectOpt.text("선택하세요");
                cnPageSortSelectOpt.text("请选择");
                btnSortSelectBtnBtm.prop("disabled", true);
        }
        $("#btnSortSelectOption .optionList").one("click", function(e){
            btnSortSelectOptionResetAll(e);
        })

        // 옵션 선택 팝업의 컬러칩 선택시
        $("#btnSortSelectOption .con li .colorSl input").unbind("click").bind("click", function(e){
            $(this).prop("checked", true);
            doneLengthChk();
            var $target = $(e.target),
                idx = $target.closest(".con").find("li .colorSl input").index(this),
                getColorSlInp = $(".container .layerPopupButton .colorSl input");
            getColorSlInp.eq(idx).prop("checked", true);

            if($target.closest(".con").hasClass("moreList moreListSelect")){
                getColorSlInp.closest(".con").addClass("moreList moreListSelect")
            } else{
                getColorSlInp.closest(".con").removeClass("moreList moreListSelect")
            }
        })

        // 옵션 선택 팝업의 사이즈 선택시
        $("#btnSortSelectOption .con li .sizeSl input").unbind("click").bind("click", function(e){
            $(this).prop("checked", true);
            doneLengthChk();
            var $target = $(e.target),
                idx = $target.closest(".con").find("li .sizeSl input").index(this),
                getSizeSlInp = $(".container .layerPopupButton .sizeSl input");
            getSizeSlInp.eq(idx).prop("checked", true);

            if($target.closest(".con").hasClass("moreList moreListSelect")){
                getSizeSlInp.closest(".con").addClass("moreList moreListSelect")
            } else{
                getSizeSlInp.closest(".con").removeClass("moreList moreListSelect")
            }
        })

        // 옵션 선택 팝업의 모든 옵션 선택시 하단 버튼 활성화
        function doneLengthChk(){
            var doneLengthChk1 = $("#btnSortSelectOption .optionList > li").length;
            var doneLengthChk2 = $("#btnSortSelectOption .optionList > li input:checked").length
            if(doneLengthChk1 === doneLengthChk2){
                $("#btnSortSelectOption .btnBtm button").prop("disabled", false);
            }
        }
    })

    // 가로 스크롤 생성 여부 체크
    $.fn.hasHorizontalScrollBar = function(){
        return this.get(0) ? this.get(0).scrollWidth - 3 >= this.innerWidth() : false;
    }

    // 세로 스크롤 생성 여부 체크
    $.fn.hasVerticalScrollBar = function(){
        return this.get(0) ? this.get(0).scrollHeight - 3 >= this.innerHeight() : false;
    }

    // 개발연동시 기본 셀렉트 변경후 디자인 셀렉트 반영
    $.fn.seletMenuUpdate = function(def){
        var parent = this.parent();
        parent.attr('first', true);
        if(def === true){
            parent.find(".ui-selectmenu-button").addClass("ui-selectmenu-button-default ui-default-option");
        }else{
            parent.find(".ui-selectmenu-button").removeClass("ui-selectmenu-button-default ui-default-option");
        }
        parent.find(".ui-menu").off("mousewheel DOMMouseScroll");
        parent.find(".ui-menu").off("scroll");
        parent.find(".scrollbar").off("mousedown");
        parent.find('.scrollbar-wrap').remove();
        this.customSelect("refresh");
    }

    $(function(){
        // Support: jQuery <1.8
        if(!$.fn.addBack){
            $.fn.addBack = function(selector){
                return this.add(selector == null ?
                    this.prevObject : this.prevObject.filter(selector)
                );
            };
        }

        // jquery ui 커스텀 셀렉트

        var aniProp = {
			duration : 400,
			easing : "easeInSine",
			complete : aniComplete
		};

        /**
    	 * 애니메이션 종료 이벤트
    	 */
        function aniComplete(){
            var me = $(this);
            if(!me.hasClass("ui-selectmenu-open")){
                me.css("display", "none");
            }
        };

        var t = $;
        var selectMenu = {
            init: function(){

                var agent = navigator.userAgent.toLowerCase();
                var ieTest = ((navigator.appName == 'Netscape' && agent.indexOf('trident') != -1) || (agent.indexOf("msie") != -1)) ? true : false;
                // var ieTest = false;
                var customSelect = {}

                customSelect._setAria = function(item){
                    var id = this.menuItems.eq(item.index).attr("id");
                    var ariaObj = {
                        "aria-labelledby": id
                    }

                    //ie Accessibility
                    if(!ieTest){
                        ariaObj["aria-activedescendant"] = id;
                        this.menu.attr("aria-activedescendant", id);
                    }
                    this.button.attr(ariaObj);
                    //ie Accessibility
                }

                customSelect._buttonEvents = {}
                customSelect._buttonEvents.click = function(event){
                    //ie Accessibility
                    var button = $(this.button);
                    if(!button.data('buttonObj')){

                        var obj = {
                            timer: null,
                            opend: false
                        }
                        button.data('buttonObj', obj)
                    }

                    var obj = button.data('buttonObj');
                    if(!obj.opend){
                        obj.opend = true;
                        obj.timer = setTimeout(function(){
                            obj.opend = false;
                        }, 1000)

                        this._setSelection();
                        this._toggle(event);
                    }

                    /*this.status = {
                        overflow : $("body").css("overflow"),
                        zindex : $("#container").css("z-index")
                    };*/
                    //$("body").css("overflow", "hidden").addClass("hidePopupDimm");
                    //$("body").addClass("hidePopupDimm");
                    hidePopupDimm(true,false,'select');
                    this.menuWrap.closest(".layCont").css("z-index", 200);
                    this.menuWrap.closest(".lCont").css("z-index", 200);
                    
                    this.menuWrap.stop(true).css("display", "block").animate({"bottom":"0"}, aniProp);
                    //ie Accessibility

                    // 재입고 알림 출국정보 선택 팝업 호출시 - 하단 취소 신청 버튼이 iOS에서 가려지는 현상이 있어 수정
                    if(this.menuWrap.closest(".selectWrap").find("#departure_info").length > 0){
                        this.menuWrap.closest(".layCont").addClass("departure_info");
                    }
                }

                customSelect._drawButton = function(){
                    // 추가 : 셀렉트 박스 메세지
                    if(this.element.attr('data-msg')){
                        var msg = this.element.attr('data-msg'),
                            ops = this.element.find('option'),
                            add = true,
                            op;
                        $.each(ops, function(idx, itm){
                            op = $(itm);
                            if(op.val() == "" && op.text() == msg){
                                add = false;
                                return false;
                            }
                        });

                    	// 중복 옵션이 없을 때만 추가
                        if(add){
                            if(ops.filter("[selected]").length > 0){
                                this.element.prepend('<option value="" hidden>' + msg + '</option>');
                            }else{
                                this.element.prepend('<option value="" hidden selected>' + msg + '</option>');
                            }
                            this.element[0].selectedIndex = 0;
                        }
                    }

                    var e, i = this,
                        s = this._parseOption(this.element.find("option[selected]"), this.element[0].selectedIndex);
                    this.labels = this.element.labels().attr("for", this.ids.button),
                        this.element.hide(),
                        this.button = t("<button type='button'>", {
                            tabindex: this.options.disabled ? -1 : 0,
                            id: this.ids.button,
                            role: "combobox",
                            "aria-expanded": "false",
                            "aria-autocomplete": "list",
                            "aria-owns": this.ids.menu,
                            "aria-haspopup": "true",
                            title: this.element.attr("title")
                        }).insertAfter(this.element),
                        this._addClass(this.button, "ui-selectmenu-button ui-selectmenu-button-closed ui-button ui-widget"), //접근성 수정 : ui-button ui-widget
                        this.buttonItem = this._renderButtonItem(s).appendTo(this.button),
                        this.options.width !== !1 && this._resizeButton(),
                        this._on(this.button, this._buttonEvents),
                        this.button.one("focusin", function(){
                            i._rendered || i._refreshMenu()
                        })
                        if(this.element.attr('data-msg') && this.element[0].selectedIndex == 0){
                            this.button.addClass("ui-selectmenu-button-default");
                        }

                    //.ui-selectmenu-text > 텍스트 구분자 태그 적용
                    var htmlText = this._fnMultiTxt(s.label, this.element.find("option:selected").attr('class'));
                    this.buttonItem.html(htmlText);
                    // 표시할 텍스트가 없으면 첫번째 옵션 표시
                    if(this.buttonItem.html() == ""){
                        this.buttonItem.html(this.element.find('option').eq(0).text());
                    }

                    var txt = s.element.data("multitext");
                    if(typeof(txt) == "string" && txt.length > 0){
                        txt = replaceURL(txt);
                        this.button.prepend('<span class="option" ' + txt + '></span>')
                        this.button.removeClass("ui-no-option");
                    }else{
                        this.button.addClass("ui-no-option");
                    }
                    if(this.element.val() == ""){
                        this.button.addClass("ui-default-option");
                    }

                    if(!this.element.find("option[selected]").is("[hidden]")){
                        this.button.removeClass("ui-default-option ui-selectmenu-button-default");
                    }
                }

                //option > 텍스트에 구분자를 지정하여 <span> 태그로 래핑
                customSelect._fnMultiTxt = function(label, clNm){
                    var optMultiTxt = this.element.attr('data-multiText');
                    var textArr = (optMultiTxt === undefined) ? [label] : label.split(optMultiTxt);
                    var classArr = (clNm === undefined) ? [] : clNm.split(' ');
                    var htmlText = "";
                    if($(textArr).length > 1){
                        $(textArr).each(function(idx){
                            cls = (classArr[idx] !== undefined) ? classArr[idx] : '';
                            htmlText += '<span' + ((classArr.length !== 0) ? ' class="' + cls + '"' : '') + '>' + textArr[idx] + '</span>';
                        });
                    } else{
                        htmlText = textArr[0];
                    }
                    return htmlText;
                }

                // list render
                customSelect._renderItem = function(ul, item){
                    var li = $("<li>"),
                        txt = item.element.data("multitext");
                        corpname = item.element.data("corpname");

                    // .ui-menu-item > 텍스트 구분자 태그 적용
                    var htmlText = this._fnMultiTxt(item.label, item.element.attr('class'));

                    // 첫 실행 시에 선택값 적용하기
                    var opt = {
                        html: htmlText

                    };
                    if(item.element.is("[selected]") || item.value == this.element.val()){
                        opt["aria-selected"] = "true";
                    }
                    var wrapper = $('<a>', opt);

                    if(typeof(txt) == "string" && txt.length > 0){
                        txt = replaceURL(txt);
                        wrapper.prepend('<span class="option" ' + txt + '></span>');
                        li.removeClass("ui-no-option");
                    }else{
                        li.addClass("ui-no-option");
                    }

                    if(typeof(corpname) == "string" && corpname.length > 0){
                        txt = replaceURL(corpname);
                        wrapper.prepend('<span class="corpName">' + corpname + '</span>');
                        li.removeClass("ui-no-option");
                    }

                    if(item.disabled){
                        li.addClass("ui-state-disabled");
                    }

                    // 추가 : 셀렉트 박스 메세지
                    if(item.element.attr('hidden')){
                        li.css('display', 'none');
                        //li.remove();
                    }

                    var action = item.element.data("action");
                    if(typeof(action) != "undefined"){
                        if(typeof(action.name) != "undefined" && typeof(action.func) != "undefined"){
                            var str = '<button class="ui-action-button"';
                            str += ' onclick=\'' + action.func + '\'';
                            str += '>' + action.name + '</button>';
                            li.append(str);
                        }
                    }
                    return li.append(wrapper).appendTo(ul);
                }

                customSelect._drawMenu = function(){
                    var that = this;

                    // Create menu
                    this.menu = $("<ul>", {
                        "aria-hidden": "true",
                        "aria-labelledby": this.ids.button,
                        id: this.ids.menu
                    });

                    this.listWrap = $('<div class="listWrap"></div>');
                    this.listWrap.append(this.menu);

                    // Wrap menu
                    this.menuWrap = $("<div>");//.append(this.menu);
                    this.menuWrap.append(this.listWrap);
                    this._addClass(this.menuWrap, "ui-selectmenu-menu", "ui-front");
                    this.menuWrap.appendTo(this._appendTo());
                    var header = this.element.data("header");
                    var label = this.element.data("label");
                    if(typeof(label) == "string" && label.length > 0){
                        this.menuWrap.prepend('<p class="labelSelect">' + label +'</p>');
                    }
                    if(typeof(header) == "string" && header.length > 0){
                        this.menuWrap.prepend('<p class="titSelect">' + header +'</p>');
                    }else{
                        this.menuWrap.prepend('<p class="titSelect">&nbsp;</p>');
                    }
                    this.closeBtn = $('<button type="button" class="closeS dragDownClose">닫기</button>');
                    this.closeBtn.bind("click", function(){
                        that.close();
                    });
                    this.menuWrap.append(this.closeBtn);
                    $('<div class="dimmed"></div>').appendTo(this._appendTo());

                    // 타이틀 아래로 드래그 시에 팝업 닫기
                    this.menuWrap.addClass("dragDownWrapper");
                    initDragDownArea();
                    //this.menuWrap.find("p.titSelect").bind("touchstart.layerPopup", touchStartPopup);

                    // Initialize menu widget
                    this.menuInstance = this.menu
                        .menu({
                            classes: {
                                "ui-menu": "ui-corner-bottom"
                            },
                            role: "listbox",
                            select: function(event, ui){
                                event.preventDefault();

                                // Support: IE8
                                // If the item was selected via a click, the text selection
                                // will be destroyed in IE
                                that._setSelection();
                                that._select(ui.item.data("ui-selectmenu-item"), event);
                            },
                            focus: function(event, ui){
                                /*
                            	 ****************************************************************************
                            	 ****************************************************************************
                            	 * 모바일 아닌 경우 닫힘 애니메이션과 겹치면서 무조건 첫번째까지 모든 메뉴가 선택되는 버그로 주석처리
                            	 ****************************************************************************
                            	 ****************************************************************************
                                var item = ui.item.data("ui-selectmenu-item");
                                // Prevent inital focus from firing and check if its a newly focused item
                                if(that.focusIndex != null && item.index !== that.focusIndex){
                                    that._trigger("focus", event, {
                                        item: item
                                    });
                                    if(!that.isOpen){
                                        that._select(item, event);
                                    }
                                }
                                that.focusIndex = item.index;

                                //ie Accessibility
                                if(!ieTest){
                                    that.button.attr("aria-activedescendant", that.menuItems.eq(item.index).attr("id"));
                                }
                                //ie Accessibility
                                */
                            }
                        })
                        .menu("instance");

                    // Don't close the menu on mouseleave
                    this.menuInstance._off(this.menu, "mouseleave");

                    // Cancel the menu's collapseAll on document click
                    this.menuInstance._closeOnDocumentClick = function(){
                        return false;
                    };

                    // Selects often contain empty items, but never contain dividers
                    this.menuInstance._isDivider = function(){
                        return false;
                    };

                    /**
                	 * 타이틀 아래로 드래그 시에 팝업 닫기
                	 */
                    /*var $win = $(window), touchTarget, touchStartY;
                    function touchStartPopup(e){
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
                            touchTarget.siblings("button.closeS").trigger("click");
                        }
                    };

                    function touchEndPopup(){
                        $win.unbind("touchmove.layerPopup", touchMovePopup);
                        $win.unbind("touchend.layerPopup", touchEndPopup);
                    };*/
                }

                customSelect.close = function(event){
                    if(!this.isOpen){
                        return;
                    }

                    /*if(typeof(this.status.overflow) != "undefined"){
                        $("body").css("overflow", this.status.overflow);
                        this.status.overflow = undefined;
                    }*/
                    //$("body").removeClass("hidePopupDimm");
                    // hidePopupDimm(false);

                    hidePopupDimm(false,false,'select');

                    // 신구단 배송서비스 신청내역 화면에서만 실행
                    if($("body").find(".cmDeilveV2109").length){
                        setTimeout(function(){
                            $("body").removeClass("hidePopupDimm");
                        }, 100)
                    }

                    this.menuWrap.closest(".layCont").css("z-index", "");
                    this.menuWrap.closest(".lCont").css("z-index", "");
                    //$("#container").css("z-index", this.status.zindex);
                    delete this.overflow;
                    this.menuWrap.stop(true).css("display", "block").animate({"bottom":"-100%"}, aniProp);

                    this.isOpen = false;
                    this._toggleAttr();

                    this.range = null;
                    this._off(this.document);

                    this._trigger("close", event);

                    //ie Accessibility
                    if($(this.button).data('buttonObj')){
                        $(this.button).data('buttonObj').opend = false;
                    }
                    $(this.button).focus()
                    //ie Accessibility

                    // 재입고 알림 출국정보 선택 팝업 호출시 - 하단 취소 신청 버튼이 iOS에서 가려지는 현상이 있어 수정
                    if(this.menuWrap.closest(".selectWrap").find("#departure_info").length > 0){
                        this.menuWrap.closest(".layCont").removeClass("departure_info");
                    }
                }

                $.widget("custom.customSelect", $.ui.selectmenu, customSelect);

                var customMenu = {}
                customMenu.refresh = function(){
                    var menus, items, newSubmenus, newItems, newWrappers,
                        that = this,
                        icon = this.options.icons.submenu,
                        submenus = this.element.find(this.options.menus);

                    this._toggleClass("ui-menu-icons", null, !!this.element.find(".ui-icon").length);

                    // Initialize nested menus
                    newSubmenus = submenus.filter(":not(.ui-menu)")
                        .hide()
                        .attr({
                            role: this.options.role,
                            "aria-hidden": "true",
                            "aria-expanded": "false"
                        })
                        .each(function(){
                            var menu = $(this),
                                item = menu.prev(),
                                submenuCaret = $("<span>").data("ui-menu-submenu-caret", true);

                            that._addClass(submenuCaret, "ui-menu-icon", "ui-icon " + icon);
                            item
                                .attr("aria-haspopup", "true")
                                .prepend(submenuCaret);
                            menu.attr("aria-labelledby", item.attr("id"));
                        });

                    this._addClass(newSubmenus, "ui-menu", "ui-widget ui-widget-content ui-front");

                    menus = submenus.add(this.element);
                    items = menus.find(this.options.items);
                    // Initialize menu-items containing spaces and/or dashes only as dividers
                    items.not(".ui-menu-item").each(function(){
                        var item = $(this);
                        if(that._isDivider(item)){
                            that._addClass(item, "ui-menu-divider", "ui-widget-content");
                        }

                        //ie Accessibility
                        item.on('click', function(){
                            that.focus('focus', item)
                        })
                        //ie Accessibility
                    });

                    // Don't refresh list items that are already adapted
                    newItems = items.not(".ui-menu-item, .ui-menu-divider");
                    newWrappers = newItems.children()
                        .not(".ui-menu")
                        .not(".ui-action-button")
                        .uniqueId()
                        .attr({
                            tabIndex: -1,
                            role: this._itemRole()
                        });
                    this._addClass(newItems, "ui-menu-item")
                        ._addClass(newWrappers, "ui-menu-item-wrapper");
                    // Add aria-disabled attribute to any disabled menu item
                    items.filter(".ui-state-disabled").attr("aria-disabled", "true");

                    // If the active item has been removed, blur the menu
                    if(this.active && !$.contains(this.element[0], this.active[0])){
                        this.blur();
                    }
                }

                customMenu.focus = function(event, item){
                    var nested, focused, activeParent;
                    this.blur(event, event && event.type === "focus");
                    this._scrollIntoView(item);
                    this.active = item.first();
                    focused = this.active.children(".ui-menu-item-wrapper");
                    this._addClass(focused, null, "ui-state-active");

                    // Only update aria-activedescendant if there's a role
                    // otherwise we assume focus is managed elsewhere

                    //ie Accessibility
                    if(this.options.role && ieTest){
                        this.element.attr("aria-activedescendant", focused.attr("id"));
                    }
                    //ie Accessibility

                    // Highlight active parent menu item, if any
                    activeParent = this.active
                        .parent()
                        .closest(".ui-menu-item")
                        .children(".ui-menu-item-wrapper");
                    this._addClass(activeParent, null, "ui-state-active");

                    if(event && event.type === "keydown"){
                        this._close();
                    } else{
                        this.timer = this._delay(function(){
                            this._close();
                        }, this.delay);
                    }

                    nested = item.children(".ui-menu");
                    if(nested.length && event && (/^mouse/.test(event.type))){
                        this._startOpening(nested);
                    }
                    this.activeMenu = item.parent();
                    this._trigger("focus", event, {
                        item: item
                    });
                }
                $.widget('custom.menu', $.ui.menu, customMenu)
            },

            update: function(target){
                var select = target;
                const windowWidth = $(window).width();
                if(select.data('selectBox')){
                    select.customSelect("refresh");
                } else{
                    select.parent().attr('first', true);
                    var opt = {
                        appendTo: select.parent(),
                        select: function(event, ui){
                            select.trigger('select');
                            var list = select.parent().find('.ui-menu-item');
                            var selectList = $(this).find("option");
                            list.find('a').removeAttr('aria-selected');
                            list.eq(ui.item.index).find('a').attr('aria-selected', true);
                            selectList.removeAttr('selected');
                            selectList.eq(ui.item.index).attr('selected', true);
                            $(this).siblings(".ui-selectmenu-button-default").removeClass("ui-selectmenu-button-default");
                            
                            //접근성 추가 : 포커스 이동
                            select.closest('.selectWrap').find('.ui-selectmenu-text').eq(0).attr('tabindex', 0).focus();

                            //.ui-selectmenu-text 에 선택한 메뉴의 html 적용
                            var spanCnt = list.eq(ui.item.index).find('a>span').length;
                            var btn = select.closest('.selectWrap').find('.ui-selectmenu-button');
                            if(spanCnt > 0){
                                var copySpan = list.eq(ui.item.index).find('a').html();
                                select.closest('.selectWrap').find('.ui-selectmenu-text').html(copySpan);
                                btn.removeClass("ui-no-option");
                            }else{
                                btn.addClass("ui-no-option");
                            }
                            if(select.val() == ""){
                                btn.addClass("ui-default-option");
                            }else{
                                btn.removeClass("ui-default-option");
                            }

                            // 이벤트 페이지의 하단 상품모듈이 있을 경우 상품을 선택했을 때 해당 영역으로 스크롤 이동
                            if($(this).closest(".promotionType").find(".btmProdType.imp").length > 0){
                                // 앵커형 관련 이벤트
                                $('html, body').animate({
                                    scrollTop : $("ul[id^='prodStyle-Thumb']").eq($(this).val()).offset().top - 180
                                }, 500);
                            }

                            // 주문서 : 스마일페이 카드UI 무이자 할부개월수 선택시 텍스트 노출 관련
                            if($(this).closest(".myPayList.smilePay").length){
                                if($(this).val() == "00"){
                                    $(this).closest(".selInstallment").find(".intfree").show();
                                } else{
                                    $(this).closest(".selInstallment").find(".intfree").hide();
                                }
                            }
                        },
                        close: function(){
                            // 주문서 앱카드 결제수단 관련
                            if($(this).closest(".appCardlayer").length){
                                const _this = $(this),
                                    wrap = _this.closest(".appCardlayer"),
                                    swiper = wrap.find(".swiper-wrapper");
                               // margin-left값이 없거나 0이면
                                if(!swiper.css("margin-left") || swiper.css("margin-left") == "0px"){
                                    swiper.css("margin-left", "0px");
                                }
                                const margin = parseInt(swiper.css("margin-left").replace("px", ""));
                                swiper.css("transform", "translate3d(" + margin + "px, 0px, 0px)");
                                swiper.removeAttr("style");
                                swiper.attr("style", "transform: translate3d(" + margin + "px, 0px, 0px);");
                                _this.closest(".container").find(".optionArea.orderFloating").show();
                                $("body").removeClass("appCardlayerOpen noscrolling layerPopupOpened");
                                swiper.closest(".swiperWrap").removeClass("swiper-no-swiping");

                                setTimeout(() => {
                                    const appCardlayerOpenSelectMenu = $(".appCardlayer .selectWrap .ui-selectmenu-open"),
                                        sw = $(".appCardlayer > .swiperWrap"),
                                        swWrap = sw.find(".swiper-wrapper"),
                                        contents = sw.closest(".contents");
                                    appCardlayerOpenSelectMenu.css({"width":""});
                                    sw.css({"width":""});
                                    swWrap.css({"width":""});
                                    contents.css({"overflow":"","width":""});
                                    $(".appCardlayer").css({"width":""});
                                    //let scrlT = -parseInt($("body").css("top"));
                                    //setTimeout(() => {
                                    //    $("body, html").animate({scrollTop: scrlT}, 0);
                                    //})
                                    //$("body").css({"position":"", "left":"", "right":"", "top":""});
                                },10);
                            }
                            select.trigger('close');
                        },
                        change: function(event, ui){
                            select.trigger('change');
                        },
                        open: function(){
                            var parent = select.parent();
                            var uiMenu = parent.find(".ui-menu");

                            //방향 설정
                            var direction = select.attr('data-direction') === "up" ? "up" : "down";
                            if(direction === "up"){
                                var menuH = parent.find('.ui-selectmenu-menu').outerHeight();
                                //parent.find('.ui-selectmenu-menu').css('top', -menuH);
                            }

                            uiMenu.css({
                                'width': ''
                            });
                            if(uiMenu.hasVerticalScrollBar() && parent.attr('first') == 'true'){
                                parent.attr('first', false);
                                uiMenu.css('overflow-y', 'hidden');

                                parent.find('.ui-selectmenu-menu').append(
                                    '<div class="scrollbar-wrap">' +
                                    '<div class="scrollbar"></div>' +
                                    '</div>'
                                );
                                var contentH = uiMenu.get(0).scrollHeight;
                                var screenH = uiMenu.height();
                                var cScrollH = contentH - screenH;

                                //추가 : 스크롤 높이 계산
                                parent.find('div.scrollbar-wrap').css('height', screenH);

                                var bar = parent.find('div.scrollbar');
                                var bgH = parent.find('div.scrollbar-wrap').height();
                                bar.height(bgH / 3);
                                var barH = bar.height();
                                var n = bgH - barH;

                                uiMenu.on("mousewheel DOMMouseScroll", function(e, delta){
                                    var E = e.originalEvent;
                                    delta = 0;
                                    if(E.detail){
                                        delta = E.detail * -40;
                                    } else{
                                        delta = E.wheelDelta;
                                    };

                                    var scrollTop = $(this).scrollTop() + (Math.round(delta * -1)) / 10;
                                    var tt = contentH - screenH;

                                    $(this).scrollTop(scrollTop);
                                    if(scrollTop < 0){
                                        scrollTop = 0;
                                    } else if(scrollTop > cScrollH){
                                        scrollTop = cScrollH;
                                    }

                                    var m = (scrollTop / cScrollH) * n;

                                    bar.css({
                                        'top': m + 'px'
                                    });
                                    e.preventDefault();
                                });

                                uiMenu.on('scroll', function(){
                                    var scrollTop = ($(this).scrollTop() / cScrollH) * n;
                                    bar.css({
                                        'top': scrollTop + 'px'
                                    })
                                });

                                var y1 = 0;

                                bar.on('mousedown', function(e){
                                    y1 = e.pageY - parseInt(bar.css('top'));
                                    $(document).on('mousemove', moveHandler);
                                    $(document).on('mouseleave , mouseup', mouseLeave);
                                });

                                function mouseLeave(){
                                    $(document).off('mousemove', moveHandler);
                                    $(document).off('mouseleave , mouseup , mouseout', mouseLeave);
                                }

                                function moveHandler(e){
                                    var y2 = e.pageY - y1;
                                    if(y2 < 0){
                                        y2 = 0;
                                    } else if(y2 >= n){
                                        y2 = n;
                                    }
                                    bar.css('top', y2);
                                    var cc = (y2 / n) * (cScrollH);
                                    uiMenu.scrollTop(cc);
                                }
                            }
                            select.trigger('open');

                            // 주문서 앱카드 결제수단 관련
                            if($(this).closest(".appCardlayer").length >0){
                                const _this = $(this),
                                    wrap = _this.closest(".appCardlayer"),
                                    swiper = wrap.find(".swiper-wrapper"),
                                    matrix = swiper.css("transform"),
                                    Ea = matrix.split(","),
                                    matrixX = Ea[4];

                                swiper.css("transform","");
                                swiper.css("margin-left", matrixX + "px");
                                _this.closest(".container").find(".optionArea.orderFloating").hide();
                                //$("body").addClass("appCardlayerOpen noscrolling layerPopupOpened");
                                $("body").addClass("appCardlayerOpen");

                                setTimeout(() => {
                                    const appCardlayerOpenSelectMenu = $(".appCardlayer.on .selectWrap .ui-selectmenu-open"),
                                        sw = $(".appCardlayer.on > .swiperWrap"),
                                        swWrap = sw.find(".swiper-wrapper"),
                                        contents = sw.closest(".contents");
                                    appCardlayerOpenSelectMenu.css({"width": windowWidth});
                                    sw.css({"width": windowWidth});
                                    swWrap.css({"width": windowWidth});
                                    contents.css({"overflow":"hidden","width": windowWidth});
                                    $(".appCardlayer.on").css({"width": windowWidth});
                                    //$("body").css({"position":"fixed", "left":"0", "right":"0", "top":-$(window).scrollTop()});
                                },10);
                                
                                swiper.closest(".swiperWrap").addClass("swiper-no-swiping");
                            }
                        }
                    }
                    if(select.attr('style')){
                        var w = parseInt(select.attr('style').replace('width:', ''));
                        opt.width = w;
                    }

                    select.customSelect(opt);
                    select.data('selectBox', true);

                    var maxHeight;
                    if(select.attr('data-height')){
                        // 높이 설정
                        maxHeight = select.attr('data-height');
                    } else{
                        //기본 높이 값
                        //maxHeight = '150px';
                        maxHeight = $(window).height() - 160;
                    }
                    //select.customSelect('menuWidget').css('max-height', maxHeight);
                    select.parent().find('.listWrap').css("max-height", maxHeight);

                    select.one('close', function(){
                        select.parent().find('.ui-menu-item').eq(select[0].selectedIndex).find('a').attr('aria-selected', true);
                    });

                    select.one('open', function(){
                        var a = select.parent().find('.ui-menu-item a');
                        a.removeAttr('tabindex');
                        a.on('click', function(){})
                    })
                }
            },
        }

        function replaceURL(txt){
            try{
                txt = txt.replace("url(/", "url(\"/");
                txt = txt.replace("url(http", "url(\"http");
                txt = txt.replace("jpg)", "jpg\")");
            }catch(e){
                return txt;
            }
            return txt;
        };

        // 셀렉트 생성
        //$(function(){
            selectMenu.init();
            $(document).find(".selectWrap").each(function(){
                selectMenu.update($(this).find("select"));
                $(this).addClass("rendered");
            });

            window.SelectMenu = selectMenu;
            if($(".contents.u1649").length > 0){
                $(document).ajaxComplete(function(){
                    $(".contents.u1649 .selectWrap:not(.rendered)").each(function(){
                        selectMenu.init();
                        selectMenu.update($(this).find("select"));
                        $(this).addClass("rendered");
                    });
                });
            }
        //});
    });
})(jQuery, window);
//左侧菜单的切换
$("[data-toggle='offcanvas']").click(function(e) {
	e.preventDefault();
        if ($(window).width() <= 992) {
            $('.row-offcanvas').toggleClass('active');
            $('.left-side').removeClass("collapse-left");
            $(".right-side").removeClass("strech");
            $('.row-offcanvas').toggleClass("relative");
        } else {
            //Else, enable content streching
            $('.left-side').toggleClass("collapse-left");
            $(".right-side").toggleClass("strech");
        }
});
$("#adminmenu .p_menu").click(function(event){
	event.preventDefault();
	var curLi = this;
	var next = $(curLi).next("li")[0];
	var isPmenu = false;
	// while(next){
	// 	if($(next).hasClass("treeview active")){
	// 		$(next).find(">a").click();
	// 	}else if($(next).hasClass("p_menu")){
	// 		next = null;
	// 		break;
	// 	}else{
	// 		next = $(next).next("li")[0];
	// 	}
	// }
	var child = curLi.nextSibling;
	if($(curLi).hasClass("hide")){
		while(child){
			if(child.nodeType===1){
				if($(child).hasClass("treeview")){
					$(child).show();
				}else{
					break;
				}
			}
			child = child.nextSibling;
		}
		$(curLi).removeClass("hide");
	}else{
		while(child){
			if(child.nodeType===1){
				if($(child).hasClass("treeview")){
					$(child).hide();
				}else{
					break;
				}
			}
			child = child.nextSibling;
		}
		$(curLi).addClass("hide");
	}
	//return;
});


$("#adminmenu .treeview").each(function() {
	var btn = $(this).children("a").first();
	var menu = $(this).children(".treeview-menu").first();
	var isActive = $(this).hasClass('active');
	if (isActive) {
        menu.show();
        btn.children(".fa-angle-left").first().removeClass("fa-angle-left").addClass("fa-angle-down");
	}
	btn.click(function(e) {
        //e.preventDefault();
        if (isActive) {
        	//Slide up to close menu
        	menu.slideUp();
        	isActive = false;
        	btn.children(".fa-angle-down").first().removeClass("fa-angle-down").addClass("fa-angle-left");
        	btn.parent("li").removeClass("active");
        } else {
        	//Slide down to open menu
        	menu.slideDown();
        	isActive = true;
        	btn.children(".fa-angle-left").first().removeClass("fa-angle-left").addClass("fa-angle-down");
        	btn.parent("li").addClass("active");
        }
	});

    /* Add margins to submenu elements to give it a tree look */
	menu.find("li > a").each(function() {
    	var pad = parseInt($(this).css("margin-left")) + 10;
    	$(this).css({"margin-left": pad + "px"});
	});
 });

//左侧菜单的切换---------------------结束
$("#addColor").spectrum();


//选择样式进入编辑器
function shifuMouseDownStyle(style_id){
	var curtop = document.body.scrollTop;
	//获取当前的式样
	if(!style_id){style_id = arguments[0];}
	var currentStyle = document.getElementById(style_id).outerHTML;
 	currentStyle = currentStyle.replace('onmousedown','donone');
 	//currentStyle = currentStyle+'<p class="shifubrush"></br></p>'; 
	//获取当前选中的文字-做为全局变量
	//得到range对象
	var range = UE.getEditor('content').selection.getRange();
	//在页面上高亮range所表示的选区
	range.select();
	//得到选区的文本
	selectedText = UE.getEditor('content').selection.getText();
	var styleContent;
	//currentStyle = '<div style="background: #fefefe;padding:13px;overflow: hidden;box-sizing: border-box;"><div style="overflow:hidden;font-size:16px;word-break:break-word;"><section style="margin:0;padding:0;text-align:center"><section style="text-align: center; display: inline-block; width: 100%; background-repeat: no-repeat; background-size: 100% 100%; background-image: url(\'./mobile/data/editor/14806626017929.png\');"><section style=\"padding:0;color:inherit;text-align:center;width:65%;margin:0 auto;\"><p class=\"bk_fontcolor\" style=\"font-size:16px;color:#fefefe;line-height:30px;margin:0;\">请输入标题</p></section></section></section></div></div>';
	//如果选中的内容为空则空式样插入
	if (selectedText == null || selectedText == undefined || selectedText == ''){
        //插入到当前编辑器中
        UE.getEditor('content').execCommand('insertHtml',currentStyle);
        return;
	}else{
    	var styleText = map.get(style_id);
    	//进行文字替换
    	styleContent = currentStyle.replace(styleText,selectedText);
    	//插入到当前编辑器中
    	UE.getEditor('content').execCommand('insertHtml',styleContent);
		
	}
}
/*选择的样式----------Title-----------进入文本编辑器*/
function shifuMouseDown(style_id){
	var curtop = document.body.scrollTop;
	//获取当前的式样
	var currentStyle = document.getElementById(style_id).outerHTML;
 	currentStyle = currentStyle.replace('onmousedown','donone');

	if(user_vip==2||user_vip==3){
    	currentStyle = currentStyle+'<p class="shifubrush"></br></p>'; 
	}else{
   		currentStyle = currentStyle+'<p class="shifubrush"></br></p>'; 
	}
	//获取当前选中的文字-做为全局变量
	var range = UE.getEditor('container').selection.getRange();
	range.select();
	selectedText = UE.getEditor('container').selection.getText();
	var styleContent;
	//如果选中的内容为空则空式样插入
	if (selectedText == null || selectedText == undefined || selectedText == ''){
      //插入到当前编辑器中
      UE.getEditor('container').execCommand('insertHtml',currentStyle);
      return;
	}
	//进行文字替换
	if(style_id=='shifu_t_002'||style_id=='shifu_t_003'){
    	styleContent = currentStyle.replace('大标题',selectedText);
	}else if(style_id=='shifu_t_004'){
    	styleContent = currentStyle.replace('请输入标题文字',selectedText);
	}else{
    	styleContent = currentStyle.replace('标题',selectedText);
	}
	//插入到当前编辑器中
	UE.getEditor('container').execCommand('insertHtml',styleContent);
}

///新闻和商品添加具体条目时左侧的tab
var _colorValue = "null";

//具体数组
var stylelist = [
					{
						"listitem": [ 
										{"itemname": "t_004.html","soucang": "0","itemid": "T04","itemnew": "0","itempath": "template/stylenew/title/t_004.html"},
										{"itemname": "t_042.html","soucang": "0","itemid": "T42","itemnew": "0","itempath": "template/stylenew/title/t_042.html"},
										{"itemname": "t_045.html","soucang": "0","itemid": "T45","itemnew": "0","itempath": "template/stylenew/title/t_045.html"},
										{"itemname": "t_048.html","soucang": "0","itemid": "T48","itemnew": "0","itempath": "template/stylenew/title/t_048.html"},
										{"itemname": "t_049.html","soucang": "0","itemid": "T49","itemnew": "0","itempath": "template/stylenew/title/t_049.html"},
										{"itemname": "t_050.html","soucang": "0","itemid": "T50","itemnew": "0","itempath": "template/stylenew/title/t_050.html"},
										{"itemname": "t_051.html","soucang": "0","itemid": "T51","itemnew": "0","itempath": "template/stylenew/title/t_051.html"},
										{"itemname": "t_052.html","soucang": "0","itemid": "T52","itemnew": "0","itempath": "template/stylenew/title/t_052.html"},
										{"itemname": "t_053.html","soucang": "0","itemid": "T53","itemnew": "0","itempath": "template/stylenew/title/t_053.html"},
										{"itemname": "t_054.html","soucang": "0","itemid": "T54","itemnew": "0","itempath": "template/stylenew/title/t_054.html"},
										{"itemname": "t_055.html","soucang": "0","itemid": "T55","itemnew": "0","itempath": "template/stylenew/title/t_055.html"},
										{"itemname": "t_056.html","soucang": "0","itemid": "T56","itemnew": "0","itempath": "template/stylenew/title/t_056.html"},
										{"itemname": "t_037.html","soucang": "0","itemid": "T37","itemnew": "0","itempath": "template/stylenew/title/t_037.html"}, 
										{"itemname": "t_039.html","soucang": "0","itemid": "T39","itemnew": "0","itempath": "template/stylenew/title/t_039.html"}, 
										{"itemname": "t_040.html","soucang": "0","itemid": "T40","itemnew": "0","itempath": "template/stylenew/title/t_040.html"}, 
										{"itemname": "t_033.html","soucang": "0","itemid": "T33","itemnew": "0","itempath": "template/stylenew/title/t_033.html"},
										{"itemname": "t_025.html","soucang": "0","itemid": "T25","itemnew": "0","itempath": "template/stylenew/title/t_025.html"}, 
										{"itemname": "t_026.html","soucang": "0","itemid": "T26","itemnew": "0","itempath": "template/stylenew/title/t_026.html"}, 
										{"itemname": "t_027.html","soucang": "0","itemid": "T27","itemnew": "0","itempath": "template/stylenew/title/t_027.html"}, 
										{"itemname": "t_028.html","soucang": "0","itemid": "T28","itemnew": "0","itempath": "template/stylenew/title/t_028.html"}, 
										{"itemname": "t_032.html","soucang": "0","itemid": "T32","itemnew": "0","itempath": "template/stylenew/title/t_032.html"}, 
										{"itemname": "t_001.html","soucang": "0","itemid": "T01","itemnew": "0","itempath": "template/stylenew/title/t_001.html"}, 
										{"itemname": "t_021.html","soucang": "0","itemid": "T021","itemnew": "0","itempath": "template/stylenew/title/t_021.html"}, 
										{"itemname": "t_022.html","soucang": "0","itemid": "T022","itemnew": "0","itempath": "template/stylenew/title/t_022.html"},  
										{"itemname": "t_002.html","soucang": "0","itemid": "T02","itemnew": "0","itempath": "template/stylenew/title/t_002.html"}, 
										{"itemname": "t_003.html","soucang": "0","itemid": "T03","itemnew": "0","itempath": "template/stylenew/title/t_003.html"},
										{"itemname": "t_023.html","soucang": "0","itemid": "T23","itemnew": "0","itempath": "template/stylenew/title/t_023.html"}, 
										{"itemname": "t_005.html","soucang": "0","itemid": "T05","itemnew": "0","itempath": "template/stylenew/title/t_005.html"}, 
										{"itemname": "t_024.html","soucang": "0","itemid": "T24","itemnew": "0","itempath": "template/stylenew/title/t_024.html"}, 
										{"itemname": "t_006.html","soucang": "0","itemid": "T06","itemnew": "0","itempath": "template/stylenew/title/t_006.html"}, 
										{"itemname": "t_007.html","soucang": "0","itemid": "T07","itemnew": "0","itempath": "template/stylenew/title/t_007.html"}, 
										{"itemname": "t_008.html","soucang": "0","itemid": "T08","itemnew": "0","itempath": "template/stylenew/title/t_008.html"}, 
										{"itemname": "t_009.html","soucang": "0","itemid": "T09","itemnew": "0","itempath": "template/stylenew/title/t_009.html"}, 
										{"itemname": "t_010.html","soucang": "0","itemid": "T10","itemnew": "0","itempath": "template/stylenew/title/t_010.html"}, 
										{"itemname": "t_011.html","soucang": "0","itemid": "T11","itemnew": "0","itempath": "template/stylenew/title/t_011.html"}, 
										{"itemname": "t_012.html","soucang": "0","itemid": "T12","itemnew": "0","itempath": "template/stylenew/title/t_012.html"}, 
										{"itemname": "t_013.html","soucang": "0","itemid": "T13","itemnew": "0","itempath": "template/stylenew/title/t_013.html"}, 
										{"itemname": "t_014.html","soucang": "0","itemid": "T14","itemnew": "0","itempath": "template/stylenew/title/t_014.html"}, 
										{"itemname": "t_015.html","soucang": "0","itemid": "T15","itemnew": "0","itempath": "template/stylenew/title/t_015.html"}, 
										{"itemname": "t_016.html","soucang": "0","itemid": "T16","itemnew": "0","itempath": "template/stylenew/title/t_016.html"}, 
										{"itemname": "t_017.html","soucang": "0","itemid": "T17","itemnew": "0","itempath": "template/stylenew/title/t_017.html"}, 
										{"itemname": "t_018.html","soucang": "0","itemid": "T18","itemnew": "0","itempath": "template/stylenew/title/t_018.html"}, 
										{"itemname": "t_019.html","soucang": "0","itemid": "T19","itemnew": "0","itempath": "template/stylenew/title/t_019.html"}, 
										{"itemname": "t_020.html","soucang": "0","itemid": "T20","itemnew": "0","itempath": "template/stylenew/title/t_020.html"}
									],
						"listid": "title",
						"listname": "标题"
					}, 
					{
						"listitem": [
										{"itemname": "c_039.html","soucang": "0","itemid": "C039","itemnew": "0","itempath": "template/stylenew/card/c_039.html"},
										{"itemname": "c_001.html","soucang": "0","itemid": "C001","itemnew": "0","itempath": "template/stylenew/card/c_001.html"},
										{"itemname": "c_037.html","soucang": "0","itemid": "C037","itemnew": "0","itempath": "template/stylenew/card/c_037.html"},
										{"itemname": "c_038.html","soucang": "0","itemid": "C038","itemnew": "0","itempath": "template/stylenew/card/c_038.html"},
										{"itemname": "c_011.html","soucang": "0","itemid": "C011","itemnew": "0","itempath": "template/stylenew/card/c_011.html"}, 
										{"itemname": "new_003.html","soucang": "0","itemid": "CN003","itemnew": "0","itempath": "template/stylenew/card/new_003.html"}, 
										{"itemname": "c_017.html","soucang": "0","itemid": "C017","itemnew": "0","itempath": "template/stylenew/card/c_017.html"},
										{"itemname": "c_002.html","soucang": "0","itemid": "C002","itemnew": "0","itempath": "template/stylenew/card/c_002.html"}, 
										{"itemname": "c_003.html","soucang": "0","itemid": "C003","itemnew": "0","itempath": "template/stylenew/card/c_003.html"}, 
										{"itemname": "c_005.html","soucang": "0","itemid": "C005","itemnew": "0","itempath": "template/stylenew/card/c_005.html"},
										{"itemname": "c_010.html","soucang": "0","itemid": "C010","itemnew": "0","itempath": "template/stylenew/card/c_010.html"},
										{"itemname": "c_006.html","soucang": "0","itemid": "C006","itemnew": "0","itempath": "template/stylenew/card/c_006.html"},
										{"itemname": "new_001.html","soucang": "0","itemid": "CN001","itemnew": "0","itempath": "template/stylenew/card/new_001.html"}, 
										{"itemname": "new_002.html","soucang": "0","itemid": "CN002","itemnew": "0","itempath": "template/stylenew/card/new_002.html"}, 
										{"itemname": "c_007.html","soucang": "0","itemid": "C007","itemnew": "0","itempath": "template/stylenew/card/c_007.html"}, 
										{"itemname": "c_008.html","soucang": "0","itemid": "C008","itemnew": "0","itempath": "template/stylenew/card/c_008.html"}, 
										{"itemname": "c_009.html","soucang": "0","itemid": "C009","itemnew": "0","itempath": "template/stylenew/card/c_009.html"}, 
										{"itemname": "c_013.html","soucang": "0","itemid": "C013","itemnew": "0","itempath": "template/stylenew/card/c_013.html"}, 
										{"itemname": "c_014.html","soucang": "0","itemid": "C014","itemnew": "0","itempath": "template/stylenew/card/c_014.html"}, 
										{"itemname": "c_015.html","soucang": "0","itemid": "C015","itemnew": "0","itempath": "template/stylenew/card/c_015.html"}, 
										{"itemname": "c_016.html","soucang": "0","itemid": "C016","itemnew": "0","itempath": "template/stylenew/card/c_016.html"}, 
										{"itemname": "c_018.html","soucang": "0","itemid": "C018","itemnew": "0","itempath": "template/stylenew/card/c_018.html"}, 
										{"itemname": "c_019.html","soucang": "0","itemid": "C019","itemnew": "0","itempath": "template/stylenew/card/c_019.html"}, 
										{"itemname": "c_020.html","soucang": "0","itemid": "C020","itemnew": "0","itempath": "template/stylenew/card/c_020.html"}, 
										{"itemname": "c_021.html","soucang": "0","itemid": "C021","itemnew": "0","itempath": "template/stylenew/card/c_021.html"}, 
										{"itemname": "c_022.html","soucang": "0","itemid": "C022","itemnew": "0","itempath": "template/stylenew/card/c_022.html"},
										{"itemname": "c_034.html","soucang": "0","itemid": "C034","itemnew": "0","itempath": "template/stylenew/card/c_034.html"}, 
										{"itemname": "c_023.html","soucang": "0","itemid": "C023","itemnew": "0","itempath": "template/stylenew/card/c_023.html"}, 
										{"itemname": "c_024.html","soucang": "0","itemid": "C024","itemnew": "0","itempath": "template/stylenew/card/c_024.html"}, 
										{"itemname": "c_025.html","soucang": "0","itemid": "C025","itemnew": "0","itempath": "template/stylenew/card/c_025.html"}, 
										{"itemname": "c_026.html","soucang": "0","itemid": "C026","itemnew": "0","itempath": "template/stylenew/card/c_026.html"}, 
										{"itemname": "c_027.html","soucang": "0","itemid": "C027","itemnew": "0","itempath": "template/stylenew/card/c_027.html"}, 
										{"itemname": "c_028.html","soucang": "0","itemid": "C028","itemnew": "0","itempath": "template/stylenew/card/c_028.html"}, 
										{"itemname": "c_029.html","soucang": "0","itemid": "C029","itemnew": "0","itempath": "template/stylenew/card/c_029.html"}, 
										{"itemname": "c_030.html","soucang": "0","itemid": "C030","itemnew": "0","itempath": "template/stylenew/card/c_030.html"},
										{"itemname": "c_032.html","soucang": "0","itemid": "C032","itemnew": "0","itempath": "template/stylenew/card/c_032.html"}, 
										{"itemname": "c_033.html","soucang": "0","itemid": "C033","itemnew": "0","itempath": "template/stylenew/card/c_033.html"}, 
										{"itemname": "c_035.html","soucang": "0","itemid": "C035","itemnew": "0","itempath": "template/stylenew/card/c_035.html"}
						],
						"listid": "card",
						"listname": "卡片"
					}, 
					{
						"listitem": [
										{"itemname": "p_001.html","soucang": "0","itemid": "P001","itemnew": "0","itempath": "template/stylenew/pic/p_001.html"},
										{"itemname": "p_041.html","soucang": "0","itemid": "P041","itemnew": "0","itempath": "template/stylenew/pic/p_041.html"},
										{"itemname": "p_042.html","soucang": "0","itemid": "P042","itemnew": "0","itempath": "template/stylenew/pic/p_042.html"},
										{"itemname": "p_043.html","soucang": "0","itemid": "P043","itemnew": "0","itempath": "template/stylenew/pic/p_043.html"},
										{"itemname": "p_044.html","soucang": "0","itemid": "P044","itemnew": "0","itempath": "template/stylenew/pic/p_044.html"},
										{"itemname": "p_045.html","soucang": "0","itemid": "P045","itemnew": "0","itempath": "template/stylenew/pic/p_045.html"},
										{"itemname": "p_046.html","soucang": "0","itemid": "P046","itemnew": "0","itempath": "template/stylenew/pic/p_046.html"},
										{"itemname": "p_047.html","soucang": "0","itemid": "P047","itemnew": "0","itempath": "template/stylenew/pic/p_047.html"},
										{"itemname": "p_048.html","soucang": "0","itemid": "P048","itemnew": "0","itempath": "template/stylenew/pic/p_048.html"},
										{"itemname": "p_049.html","soucang": "0","itemid": "P049","itemnew": "0","itempath": "template/stylenew/pic/p_049.html"},
										{"itemname": "p_050.html","soucang": "0","itemid": "P050","itemnew": "0","itempath": "template/stylenew/pic/p_050.html"},
										{"itemname": "p_051.html","soucang": "0","itemid": "P051","itemnew": "0","itempath": "template/stylenew/pic/p_051.html"},
										{"itemname": "p_052.html","soucang": "0","itemid": "P052","itemnew": "0","itempath": "template/stylenew/pic/p_052.html"},
										{"itemname": "new_021.html","soucang": "0","itemid": "PN021","itemnew": "0","itempath": "template/stylenew/pic/new_021.html"}, 
										{"itemname": "new_023.html","soucang": "0","itemid": "PN023","itemnew": "0","itempath": "template/stylenew/pic/new_023.html"},
										{"itemname": "p_021.html","soucang": "0","itemid": "P021","itemnew": "0","itempath": "template/stylenew/pic/p_021.html"}, 
										{"itemname": "p_015.html","soucang": "0","itemid": "P015","itemnew": "0","itempath": "template/stylenew/pic/p_015.html"}, 
										{"itemname": "new_007.html","soucang": "0","itemid": "PN007","itemnew": "0","itempath": "template/stylenew/pic/new_007.html"}, 
										{"itemname": "new_008.html","soucang": "0","itemid": "PN008","itemnew": "0","itempath": "template/stylenew/pic/new_008.html"}, 
										{"itemname": "new_009.html","soucang": "0","itemid": "PN009","itemnew": "0","itempath": "template/stylenew/pic/new_009.html"}, 
										{"itemname": "new_010.html","soucang": "0","itemid": "PN010","itemnew": "0","itempath": "template/stylenew/pic/new_010.html"}, 
										{"itemname": "new_011.html","soucang": "0","itemid": "PN011","itemnew": "0","itempath": "template/stylenew/pic/new_011.html"}, 
										{"itemname": "new_012.html","soucang": "0","itemid": "PN012","itemnew": "0","itempath": "template/stylenew/pic/new_012.html"}, 
										{"itemname": "new_013.html","soucang": "0","itemid": "PN013","itemnew": "0","itempath": "template/stylenew/pic/new_013.html"}, 
										{"itemname": "new_020.html","soucang": "0","itemid": "PN020","itemnew": "0","itempath": "template/stylenew/pic/new_020.html"}, 
										{"itemname": "new_022.html","soucang": "0","itemid": "PN022","itemnew": "0","itempath": "template/stylenew/pic/new_022.html"}, 
										{"itemname": "p_002.html","soucang": "0","itemid": "P002","itemnew": "0","itempath": "template/stylenew/pic/p_002.html"}, 
										{"itemname": "p_003.html","soucang": "0","itemid": "P003","itemnew": "0","itempath": "template/stylenew/pic/p_003.html"},
										{"itemname": "p_005.html","soucang": "0","itemid": "P05","itemnew": "0","itempath": "template/stylenew/pic/p_005.html"}, 
										{"itemname": "p_006.html","soucang": "0","itemid": "P006","itemnew": "0","itempath": "template/stylenew/pic/p_006.html"}, 
										{"itemname": "p_007.html","soucang": "0","itemid": "P007","itemnew": "0","itempath": "template/stylenew/pic/p_007.html"}, 
										{"itemname": "p_008.html","soucang": "0","itemid": "P08","itemnew": "0","itempath": "template/stylenew/pic/p_008.html"}, 
										{"itemname": "p_010.html","soucang": "0","itemid": "P010","itemnew": "0","itempath": "template/stylenew/pic/p_010.html"}, 
										{"itemname": "p_011.html","soucang": "0","itemid": "P011","itemnew": "0","itempath": "template/stylenew/pic/p_011.html"}, 
										{"itemname": "p_012.html","soucang": "0","itemid": "P012","itemnew": "0","itempath": "template/stylenew/pic/p_012.html"}, 
										{"itemname": "p_013.html","soucang": "0","itemid": "P013","itemnew": "0","itempath": "template/stylenew/pic/p_013.html"}, 
										{"itemname": "p_014.html","soucang": "0","itemid": "P014","itemnew": "0","itempath": "template/stylenew/pic/p_014.html"}, 
										{"itemname": "p_017.html","soucang": "0","itemid": "P017","itemnew": "0","itempath": "template/stylenew/pic/p_017.html"}, 
										{"itemname": "p_018.html","soucang": "0","itemid": "P018","itemnew": "0","itempath": "template/stylenew/pic/p_018.html"}, 
										{"itemname": "p_027.html","soucang": "0","itemid": "P027","itemnew": "0","itempath": "template/stylenew/pic/p_027.html"}, 
										{"itemname": "p_031.html","soucang": "0","itemid": "P31","itemnew": "0","itempath": "template/stylenew/pic/p_031.html"}, 
										{"itemname": "p_032.html","soucang": "0","itemid": "P032","itemnew": "0","itempath": "template/stylenew/pic/p_032.html"}, 
										{"itemname": "p_034.html","soucang": "0","itemid": "P034","itemnew": "0","itempath": "template/stylenew/pic/p_034.html"}, 
										{"itemname": "p_035.html","soucang": "0","itemid": "P035","itemnew": "0","itempath": "template/stylenew/pic/p_035.html"}, 
										{"itemname": "p_036.html","soucang": "0","itemid": "P036","itemnew": "0","itempath": "template/stylenew/pic/p_036.html"}, 
										{"itemname": "p_037.html","soucang": "0","itemid": "P037","itemnew": "0","itempath": "template/stylenew/pic/p_037.html"}, 
										{"itemname": "p_038.html","soucang": "0","itemid": "P038","itemnew": "0","itempath": "template/stylenew/pic/p_038.html"}, 
										{"itemname": "p_039.html","soucang": "0","itemid": "P039","itemnew": "0","itempath": "template/stylenew/pic/p_039.html"}, 
										{"itemname": "p_040.html","soucang": "0","itemid": "P040","itemnew": "0","itempath": "template/stylenew/pic/p_040.html"}
									],
						"listid": "pic",
						"listname": "图文"
					}, 
					{
						"listitem": [
										{"itemname": "o_008.html","soucang": "0","itemid": "TOP08","itemnew": "0","itempath": "template/stylenew/top/o_008.html"}, 
										{"itemname": "o_009.html","soucang": "0","itemid": "TOP09","itemnew": "0","itempath": "template/stylenew/top/o_009.html"},
										{"itemname": "o_010.html","soucang": "0","itemid": "TOP10","itemnew": "0","itempath": "template/stylenew/top/o_010.html"},
										{"itemname": "o_011.html","soucang": "0","itemid": "TOP11","itemnew": "0","itempath": "template/stylenew/top/o_011.html"},
										{"itemname": "o_012.html","soucang": "0","itemid": "TOP12","itemnew": "0","itempath": "template/stylenew/top/o_012.html"},
										{"itemname": "o_013.html","soucang": "0","itemid": "TOP13","itemnew": "0","itempath": "template/stylenew/top/o_013.html"},
										{"itemname": "o_017.html","soucang": "0","itemid": "TOP17","itemnew": "0","itempath": "template/stylenew/top/o_017.html"},
										{"itemname": "o_001.html","soucang": "0","itemid": "TOP01","itemnew": "0","itempath": "template/stylenew/top/o_001.html"}, 
										{"itemname": "o_002.html","soucang": "0","itemid": "TOP02","itemnew": "0","itempath": "template/stylenew/top/o_002.html"}, 
										{"itemname": "o_006.html","soucang": "0","itemid": "TOP06","itemnew": "0","itempath": "template/stylenew/top/o_006.html"}, 
										{"itemname": "o_007.html","soucang": "0","itemid": "TOP07","itemnew": "0","itempath": "template/stylenew/top/o_007.html"},
										{"itemname": "o_014.html","soucang": "0","itemid": "TOP014","itemnew": "0","itempath": "template/stylenew/top/o_014.html"}, 
										{"itemname": "o_016.html","soucang": "0","itemid": "TOP016","itemnew": "0","itempath": "template/stylenew/top/o_016.html"}, 
										{"itemname": "o_018.html","soucang": "0","itemid": "TOP018","itemnew": "0","itempath": "template/stylenew/top/o_018.html"}, 
										{"itemname": "o_020.html","soucang": "0","itemid": "TOP020","itemnew": "0","itempath": "template/stylenew/top/o_020.html"}, 
										{"itemname": "o_022.html","soucang": "0","itemid": "TOP022","itemnew": "0","itempath": "template/stylenew/top/o_022.html"}, 
										{"itemname": "o_024.html","soucang": "0","itemid": "TOP024","itemnew": "0","itempath": "template/stylenew/top/o_024.html"}
									],
						"listid": "top",
						"listname": "关注"
					}, 
					{
						"listitem": [
										{"itemname": "o_003.html","soucang": "0","itemid": "BOT03","itemnew": "0","itempath": "template/stylenew/bottom/o_003.html"},
										{"itemname": "o_004.html","soucang": "0","itemid": "BOT04","itemnew": "0","itempath": "template/stylenew/bottom/o_004.html"},
										{"itemname": "o_005.html","soucang": "0","itemid": "BOT05","itemnew": "0","itempath": "template/stylenew/bottom/o_005.html"},
										{"itemname": "o_002.html","soucang": "0","itemid": "BOT02","itemnew": "0","itempath": "template/stylenew/bottom/o_002.html"},
										{"itemname": "o_008.html","soucang": "0","itemid": "BOT08","itemnew": "0","itempath": "template/stylenew/bottom/o_008.html"}, 
										{"itemname": "o_009.html","soucang": "0","itemid": "BOT09","itemnew": "0","itempath": "template/stylenew/bottom/o_009.html"}, 
										{"itemname": "o_039.html","soucang": "0","itemid": "BOT39","itemnew": "0","itempath": "template/stylenew/bottom/o_039.html"}, 
										{"itemname": "o_038.html","soucang": "0","itemid": "BOT38","itemnew": "0","itempath": "template/stylenew/bottom/o_038.html"}, 
										{"itemname": "o_015.html","soucang": "0","itemid": "BOT15","itemnew": "0","itempath": "template/stylenew/bottom/o_015.html"}, 
										{"itemname": "o_017.html","soucang": "0","itemid": "BOT17","itemnew": "0","itempath": "template/stylenew/bottom/o_017.html"}, 
										{"itemname": "o_019.html","soucang": "0","itemid": "BOT19","itemnew": "0","itempath": "template/stylenew/bottom/o_019.html"}, 
										{"itemname": "o_025.html","soucang": "0","itemid": "BOT25","itemnew": "0","itempath": "template/stylenew/bottom/o_025.html"}, 
										{"itemname": "o_021.html","soucang": "0","itemid": "BOT21","itemnew": "0","itempath": "template/stylenew/bottom/o_021.html"}, 
										{"itemname": "o_023.html","soucang": "0","itemid": "BOT23","itemnew": "0","itempath": "template/stylenew/bottom/o_023.html"}
									],
						"listid": "bottom",
						"listname": "底提示"
					},  
					{
						"listitem": [
										{
											"itemname": "o_014.html",
											"soucang": "0",
											"itemid": "FG014",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_014.html"
										},{
											"itemname": "o_015.html",
											"soucang": "0",
											"itemid": "FG015",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_015.html"
										},{
											"itemname": "o_016.html",
											"soucang": "0",
											"itemid": "FG016",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_016.html"
										},{
											"itemname": "o_017.html",
											"soucang": "0",
											"itemid": "FG017",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_017.html"
										},{
											"itemname": "o_018.html",
											"soucang": "0",
											"itemid": "FG018",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_018.html"
										},{
											"itemname": "o_019.html",
											"soucang": "0",
											"itemid": "FG019",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_019.html"
										},{
											"itemname": "o_020.html",
											"soucang": "0",
											"itemid": "FG020",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_020.html"
										},{
											"itemname": "o_021.html",
											"soucang": "0",
											"itemid": "FG021",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_021.html"
										},{
											"itemname": "o_022.html",
											"soucang": "0",
											"itemid": "FG022",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_022.html"
										},{
											"itemname": "o_023.html",
											"soucang": "0",
											"itemid": "FG023",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_023.html"
										},{
											"itemname": "o_024.html",
											"soucang": "0",
											"itemid": "FG024",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_024.html"
										},{
											"itemname": "o_025.html",
											"soucang": "0",
											"itemid": "FG025",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_025.html"
										},{
											"itemname": "o_038.html",
											"soucang": "0",
											"itemid": "FG038",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_038.html"
										},{
											"itemname": "o_039.html",
											"soucang": "0",
											"itemid": "FG039",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_039.html"
										},{
											"itemname": "o_043.html",
											"soucang": "0",
											"itemid": "FG043",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_043.html"
										},{
											"itemname": "o_044.html",
											"soucang": "0",
											"itemid": "FG044",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_044.html"
										},{
											"itemname": "o_045.html",
											"soucang": "0",
											"itemid": "FG045",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_045.html"
										},{
											"itemname": "o_046.html",
											"soucang": "0",
											"itemid": "FG046",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_046.html"
										},{
											"itemname": "o_047.html",
											"soucang": "0",
											"itemid": "FG047",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_047.html"
										},{
											"itemname": "o_048.html",
											"soucang": "0",
											"itemid": "FG048",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_048.html"
										},{
											"itemname": "o_049.html",
											"soucang": "0",
											"itemid": "FG049",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_049.html"
										},{
											"itemname": "o_050.html",
											"soucang": "0",
											"itemid": "FG050",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_050.html"
										},{
											"itemname": "o_051.html",
											"soucang": "0",
											"itemid": "FG051",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_051.html"
										},{
											"itemname": "o_052.html",
											"soucang": "0",
											"itemid": "FG052",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_052.html"
										},{
											"itemname": "o_053.html",
											"soucang": "0",
											"itemid": "FG053",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_053.html"
										},{
											"itemname": "o_054.html",
											"soucang": "0",
											"itemid": "FG054",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_054.html"
										},{
											"itemname": "o_055.html",
											"soucang": "0",
											"itemid": "FG055",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_055.html"
										},{
											"itemname": "o_056.html",
											"soucang": "0",
											"itemid": "FG056",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_056.html"
										},{
											"itemname": "o_057.html",
											"soucang": "0",
											"itemid": "FG057",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_057.html"
										},{
											"itemname": "o_058.html",
											"soucang": "0",
											"itemid": "FG058",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_058.html"
										},{
											"itemname": "o_059.html",
											"soucang": "0",
											"itemid": "FG059",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_059.html"
										},{
											"itemname": "o_060.html",
											"soucang": "0",
											"itemid": "FG060",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_060.html"
										},{
											"itemname": "o_061.html",
											"soucang": "0",
											"itemid": "FG061",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_061.html"
										},{
											"itemname": "o_062.html",
											"soucang": "0",
											"itemid": "FG062",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_062.html"
										},{
											"itemname": "o_063.html",
											"soucang": "0",
											"itemid": "FG063",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_063.html"
										},{
											"itemname": "o_064.html",
											"soucang": "0",
											"itemid": "FG064",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_064.html"
										},{
											"itemname": "o_009.html",
											"soucang": "0",
											"itemid": "FG009",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_009.html"
										}, {
											"itemname": "o_006.html",
											"soucang": "0",
											"itemid": "FG006",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_006.html"
										}, {
											"itemname": "o_007.html",
											"soucang": "0",
											"itemid": "FG007",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_007.html"
										}, {
											"itemname": "o_008.html",
											"soucang": "0",
											"itemid": "FG008",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_008.html"
										}, {
											"itemname": "o_036.html",
											"soucang": "0",
											"itemid": "FG20",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_036.html"
										}, {
											"itemname": "o_040.html",
											"soucang": "0",
											"itemid": "FG040",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_040.html"
										}, {
											"itemname": "o_041.html",
											"soucang": "0",
											"itemid": "FG041",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_041.html"
										}, {
											"itemname": "o_042.html",
											"soucang": "0",
											"itemid": "FG042",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_042.html"
										}, {
											"itemname": "o_001.html",
											"soucang": "0",
											"itemid": "FG001",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_001.html"
										}, {
											"itemname": "o_002.html",
											"soucang": "0",
											"itemid": "FG002",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_002.html"
										},{
											"itemname": "o_004.html",
											"soucang": "0",
											"itemid": "FG004",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_004.html"
										}, {
											"itemname": "o_005.html",
											"soucang": "0",
											"itemid": "FG005",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_005.html"
										}, {
											"itemname": "o_035.html",
											"soucang": "0",
											"itemid": "FG035",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_035.html"
										}, {
											"itemname": "o_037.html",
											"soucang": "0",
											"itemid": "FG037",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_037.html"
										}, {
											"itemname": "o_033.html",
											"soucang": "0",
											"itemid": "FG033",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_033.html"
										}, {
											"itemname": "o_034.html",
											"soucang": "0",
											"itemid": "FG034",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_034.html"
										}, {
											"itemname": "o_032.html",
											"soucang": "0",
											"itemid": "FG032",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_032.html"
										},{
											"itemname": "o_031.html",
											"soucang": "0",
											"itemid": "FG031",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_031.html"
										}, {
											"itemname": "o_030.html",
											"soucang": "0",
											"itemid": "FG030",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_030.html"
										}, {
											"itemname": "o_010.html",
											"soucang": "0",
											"itemid": "FG010",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_010.html"
										}, {
											"itemname": "o_027.html",
											"soucang": "0",
											"itemid": "FG027",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_027.html"
										}, {
											"itemname": "o_011.html",
											"soucang": "0",
											"itemid": "FG011",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_011.html"
										}, {
											"itemname": "o_013.html",
											"soucang": "0",
											"itemid": "FG013",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_013.html"
										}, {
											"itemname": "o_003.html",
											"soucang": "0",
											"itemid": "FG003",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_003.html"
										}, {
											"itemname": "o_029.html",
											"soucang": "0",
											"itemid": "FG029",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_029.html"
										}, {
											"itemname": "o_026.html",
											"soucang": "0",
											"itemid": "FG026",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_026.html"
										}, {
											"itemname": "o_028.html",
											"soucang": "0",
											"itemid": "FG12",
											"itemnew": "0",
											"itempath": "template/stylenew/fengexian/o_028.html"
										}
									],
						"listid": "fengexian",
						"listname": "分隔线"
					}, 
					{
						"listitem": [
										{
											"itemname": "m_001.html",
											"soucang": "0",
											"itemid": "M01",
											"itemnew": "0",
											"itempath": "template/stylenew/mark/m_001.html"
										}
									],
						"listid": "mark",
						"listname": "小符号"
					}, 
					{
						"listitem": [
										{
											"itemname": "min_001.html",
											"soucang": "0",
											"itemid": "min_01",
											"itemnew": "0",
											"itempath": "template/stylenew/minions/min_001.html"
										}, {
											"itemname": "min_002.html",
											"soucang": "0",
											"itemid": "min_02",
											"itemnew": "0",
											"itempath": "template/stylenew/minions/min_002.html"
										}, {
											"itemname": "min_003.html",
											"soucang": "0",
											"itemid": "min_03",
											"itemnew": "0",
											"itempath": "template/stylenew/minions/min_003.html"
										},  {
											"itemname": "min_005.html",
											"soucang": "0",
											"itemid": "min_05",
											"itemnew": "0",
											"itempath": "template/stylenew/minions/min_005.html"
										}
									],
						"listid": "minions",
						"listname": "小黄人"
					},{
						"listitem": [
										{
											"itemname": "day_001.html",
											"soucang": "0",
											"itemid": "day001",
											"itemnew": "0",
											"itempath": "template/stylenew/holiday/day_001.html"
										},{
											"itemname": "day_004.html",
											"soucang": "0",
											"itemid": "day004",
											"itemnew": "0",
											"itempath": "template/stylenew/holiday/day_004.html"
										},{
											"itemname": "day_005.html",
											"soucang": "0",
											"itemid": "day005",
											"itemnew": "0",
											"itempath": "template/stylenew/holiday/day_005.html"
										}
									],
						"listid": "holiday",
						"listname": "节日"
					},{
						"listitem": [
										{
											"itemname": "img_007.html",
											"soucang": "0",
											"itemid": "DT007",
											"itemnew": "0",
											"itempath": "template/stylenew/duotu/img_007.html"
										},{
											"itemname": "img_002.html",
												"soucang": "0",
												"itemid": "DT002",
												"itemnew": "0",
												"itempath": "template/stylenew/duotu/img_002.html"
										},{
											"itemname": "img_003.html",
											"soucang": "0",
											"itemid": "DT003",
											"itemnew": "0",
											"itempath": "template/stylenew/duotu/img_003.html"
										},{
											"itemname": "img_004.html",
											"soucang": "0",
											"itemid": "DT004",
											"itemnew": "0",
											"itempath": "template/stylenew/duotu/img_004.html"
										},{
											"itemname": "img_006.html",
											"soucang": "0",
											"itemid": "DT006",
											"itemnew": "0",
											"itempath": "template/stylenew/duotu/img_006.html"
										}
									],
						"listid": "duotu",
						"listname": "多图"
					},{
						"listitem": [
										{
											"itemname": "dantu_010.html",
											"soucang": "0",
											"itemid": "DAT010",
											"itemnew": "0",
											"itempath": "template/stylenew/dantu/dantu_010.html"
										},{
											"itemname": "dantu_011.html",
											"soucang": "0",
											"itemid": "DAT011",
											"itemnew": "0",
											"itempath": "template/stylenew/dantu/dantu_011.html"
										},{
											"itemname": "dantu_012.html",
											"soucang": "0",
											"itemid": "DAT012",
											"itemnew": "0",
											"itempath": "template/stylenew/dantu/dantu_012.html"
										},{
											"itemname": "dantu_013.html",
											"soucang": "0",
											"itemid": "DAT013",
											"itemnew": "0",
											"itempath": "template/stylenew/dantu/dantu_013.html"
										},{
											"itemname": "dantu_014.html",
											"soucang": "0",
											"itemid": "DAT014",
											"itemnew": "0",
											"itempath": "template/stylenew/dantu/dantu_014.html"
										},{
											"itemname": "dantu_015.html",
											"soucang": "0",
											"itemid": "DAT015",
											"itemnew": "0",
											"itempath": "template/stylenew/dantu/dantu_015.html"
										},{
											"itemname": "dantu_001.html",
											"soucang": "0",
											"itemid": "DAT001",
											"itemnew": "0",
											"itempath": "template/stylenew/dantu/dantu_001.html"
										},{
											"itemname": "dantu_002.html",
											"soucang": "0",
											"itemid": "DAT002",
											"itemnew": "0",
											"itempath": "template/stylenew/dantu/dantu_002.html"
										},{
											"itemname": "dantu_003.html",
											"soucang": "0",
											"itemid": "DAT003",
											"itemnew": "0",
											"itempath": "template/stylenew/dantu/dantu_003.html"
										},{
											"itemname": "dantu_004.html",
											"soucang": "0",
											"itemid": "DAT004",
											"itemnew": "0",
											"itempath": "template/stylenew/dantu/dantu_004.html"
										},{
											"itemname": "dantu_005.html",
											"soucang": "0",
											"itemid": "DAT005",
											"itemnew": "0",
											"itempath": "template/stylenew/dantu/dantu_005.html"
										},{
											"itemname": "dantu_006.html",
											"soucang": "0",
											"itemid": "DAT006",
											"itemnew": "0",
											"itempath": "template/stylenew/dantu/dantu_006.html"
										},{
											"itemname": "dantu_007.html",
											"soucang": "0",
											"itemid": "DAT007",
											"itemnew": "0",
											"itempath": "template/stylenew/dantu/dantu_007.html"
										},{
											"itemname": "dantu_008.html",
											"soucang": "0",
											"itemid": "DAT008",
											"itemnew": "0",
											"itempath": "template/stylenew/dantu/dantu_008.html"
										},{
											"itemname": "dantu_009.html",
											"soucang": "0",
											"itemid": "DAT009",
											"itemnew": "0",
											"itempath": "template/stylenew/dantu/dantu_009.html"
										}
									],
						"listid": "dantu",
						"listname": "单图"
					}
				]; //登录前默认加载的样式
var nowdate = new Date(),
	nowMonth = nowdate.getMonth() + 1;
if(nowMonth >= 11 || nowMonth <= 2) {
	stylelist.push({
		"listitem": [
						{
							"itemname": "snow_005.html",
							"soucang": "0",
							"itemid": "S05",
							"itemnew": "0",
							"itempath": "template/stylenew/snow/snow_005.html"
						}, {
							"itemname": "snow_004.html",
							"soucang": "0",
							"itemid": "S04",
							"itemnew": "0",
							"itempath": "template/stylenew/snow/snow_004.html"
						}, {
							"itemname": "snow_001.html",
							"soucang": "0",
							"itemid": "S01",
							"itemnew": "0",
							"itempath": "template/stylenew/snow/snow_001.html"
						},{
							"itemname": "snow_003.html",
							"soucang": "0",
							"itemid": "S03",
							"itemnew": "0",
							"itempath": "template/stylenew/snow/snow_003.html"
						}, {
							"itemname": "snow_006.html",
							"soucang": "0",
							"itemid": "S06",
							"itemnew": "0",
							"itempath": "template/stylenew/snow/snow_006.html"
						},{
							"itemname": "snow_007.html",
							"soucang": "0",
							"itemid": "S07",
							"itemnew": "0",
							"itempath": "template/stylenew/snow/snow_007.html"
						}
					],
		"listid": "snow",
		"listname": "下雪啦"
	});
}
if(nowMonth >= 11 && nowMonth <= 12){
	stylelist.push({
		"listitem": [
						{
							"itemname": "chr_002.html",
							"soucang": "0",
							"itemid": "CHR02",
							"itemnew": "0",
							"itempath": "template/stylenew/christmas/chr_002.html"
						}, {
							"itemname": "chr_001.html",
							"soucang": "0",
							"itemid": "CHR01",
							"itemnew": "0",
							"itempath": "template/stylenew/christmas/chr_001.html"
						}, {
							"itemname": "chr_011.html",
							"soucang": "0",
							"itemid": "CHR11",
							"itemnew": "0",
							"itempath": "template/stylenew/christmas/chr_011.html"
						}, {
							"itemname": "chr_010.html",
							"soucang": "0",
							"itemid": "CHR10",
							"itemnew": "0",
							"itempath": "template/stylenew/christmas/chr_010.html"
						}, {
							"itemname": "chr_007.html",
							"soucang": "0",
							"itemid": "CHR07",
							"itemnew": "0",
							"itempath": "template/stylenew/christmas/chr_007.html"
						}, {
							"itemname": "chr_003.html",
							"soucang": "0",
							"itemid": "CHR03",
							"itemnew": "0",
							"itempath": "template/stylenew/christmas/chr_003.html"
						}, {
							"itemname": "chr_004.html",
							"soucang": "0",
							"itemid": "CHR04",
							"itemnew": "0",
							"itempath": "template/stylenew/christmas/chr_004.html"
						}, {
							"itemname": "chr_005.html",
							"soucang": "0",
							"itemid": "CHR05",
							"itemnew": "0",
							"itempath": "template/stylenew/christmas/chr_005.html"
						}, {
							"itemname": "chr_006.html",
							"soucang": "0",
							"itemid": "CHR06",
							"itemnew": "0",
							"itempath": "template/stylenew/christmas/chr_006.html"
						}
					],
		"listid": "christmas",
		"listname": "圣诞节"
	});
}
if(nowMonth >= 9 && nowMonth <= 11){
	stylelist.push({
		"listitem": [
						{
							"itemname": "aut_001.html",
							"soucang": "0",
							"itemid": "AUT01",
							"itemnew": "0",
							"itempath": "template/stylenew/autumn/aut_001.html"
						}, {
							"itemname": "aut_002.html",
							"soucang": "0",
							"itemid": "AUT02",
							"itemnew": "0",
							"itempath": "template/stylenew/autumn/aut_002.html"
						}, {
							"itemname": "aut_003.html",
							"soucang": "0",
							"itemid": "AUT03",
							"itemnew": "0",
							"itempath": "template/stylenew/autumn/aut_003.html"
						}, {
							"itemname": "aut_004.html",
							"soucang": "0",
							"itemid": "AUT04",
							"itemnew": "0",
							"itempath": "template/stylenew/autumn/aut_004.html"
						}, {
							"itemname": "aut_005.html",
							"soucang": "0",
							"itemid": "AUT05",
							"itemnew": "0",
							"itempath": "template/stylenew/autumn/aut_005.html"
						}, {
							"itemname": "aut_006.html",
							"soucang": "0",
							"itemid": "AUT06",
							"itemnew": "0",
							"itempath": "template/stylenew/autumn/aut_006.html"
						}, {
							"itemname": "aut_007.html",
							"soucang": "0",
							"itemid": "AUT07",
							"itemnew": "0",
							"itempath": "template/stylenew/autumn/aut_007.html"
						}, {
							"itemname": "aut_008.html",
							"soucang": "0",
							"itemid": "AUT08",
							"itemnew": "0",
							"itempath": "template/stylenew/autumn/aut_008.html"
						}, {
							"itemname": "aut_009.html",
							"soucang": "0",
							"itemid": "AUT09",
							"itemnew": "0",
							"itempath": "template/stylenew/autumn/aut_009.html"
						}
					],
		"listid": "autumn",
		"listname": "秋季"
	});
}


// 通过数组生成左侧样式列表
function refreshStylelist (tplId, container, stylelist, begin, end) {
	//console.log($("#"+tplId));
	!begin && (begin = 0);
	!end && (end = stylelist.length);
	$('#' + container).html(template(tplId, {
    	list: stylelist
	}));
}

//点击
$(document).on('click','#styleTab li',function (e) {
    e.preventDefault()
    $(this).addClass('active').siblings().removeClass("active"); //单击的当前卡片显示
    // 获得对应样式的id,点击时进行加载
    var listHref = $(this).attr('id').substr(0,15);
    //遍历样式数组，根据点击的样式ID，获取该对象的样式集合，通过该集合重绘右侧样式列表
    for(var i=0; i<stylelist.length; i++){
    	if(stylelist[i].listid==listHref){
        	refresStyle(stylelist[i].listitem);
        	break;
    	}
    }
});


//  **挖坑** 重绘样式列表
function refreshStyleitem (tplId, container, styleitem, begin, end) {
	!begin && (begin = 0);
	!end && (end = styleitem.length);

	// 设置屏幕分辨率
	var setHeight = $(window).height();

	// 编辑器的高度
	var editorHeight = setHeight-255;
	if(editorHeight<=475){
    	editorHeight=475;
	}
	$('#' + container).html(template(tplId, {
    	list: styleitem,
    	panelheight:editorHeight
	}));
}
// ** 栽萝卜* 向样式列表中插入样式 
function insertStyleitem (listitem) {
	for(var i=0; i<listitem.length; i++){
        $('#'+listitem[i].itemid).load(listitem[i].itempath, function () {
        	if(_colorValue!="null"){
            	changeColorValue(_colorValue);
        	}
        });
	}
}
// 点击不同样式名时，重绘右侧样式列表
function refresStyle (listitem) {
	refreshStyleitem('style-item','tab-content-style',listitem);//挖坑
	insertStyleitem(listitem);//栽萝卜
}

//自定义菜单点击显示
// $($(".b_item_list")[0]).click(function(event){
// 		var _self = event.target;
// 		$(_self).find(".sub_item").show();
// 		$(_self).siblings().find(".sub_item").hide();
// 	})

//预览
function look(){
	var html = UE.getEditor('content').getContent();
	$(".preview_box").show();
	$("#look").css({display: 'block'});
	$('#preview-background').show();
	$('#preview-box').animate({'top': '50%','marginTop':'-291px'}, 500);
	$("body").animate({
		"scrollTop":0
	},"slow");
	$('.erweima').css({
	    	display: 'block'
	});
}

// 定义全局变量，更改样式颜色
var _colorValue = "null";
function changeColor(color_value){
    	_colorValue = color_value;
    	changeColorValue(color_value);
}

/*根据颜色的不同进行选择*/
function changeColorValue(color_value){
	$("#tab-content-style .bk_fontcolor").css({color:color_value});
	$("#tab-content-style .bk_bordercolor").css({'border-color':color_value});
	$("#tab-content-style .bk_backgroundcolor").css({'background-color':color_value});
}
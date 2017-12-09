var left_side_width = 220;
var host_url = window.location.host,
logo_src = "/mobile/data/images/logo.png";
var colorSpectrum;
var page_success = false;
$(function(){
	$(".navbar-nav li.dropdown").click(function(event){
		var target = event.target;
		var curLi=$(this);
		if(curLi.hasClass("open")){
			curLi.removeClass("open");
		}else{
			curLi.addClass("open");
		}
	});

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
	$('.btn').bind('touchstart', function() {
	        $(this).addClass('hover');
	}).bind('touchend', function() {
	        $(this).removeClass('hover');
	});

    	_fix();
    	fix_sidebar();
	$(".wrapper").resize(function() {
		_fix();
	        fix_sidebar();
	});
	$(window).resize(function(){
	        _fix();
	        fix_sidebar();
	});
	if($(".navbar .menu")[0]){
		$(".navbar .menu").slimscroll({
		        height: "200px",
		        alwaysVisible: false,
		        size: "3px"
		}).css("width", "100%");
	}
	// $(".sidebar .treeview").tree();
});
function _fix() {
	var height = $(window).height() - $("body > .header").height() - ($("body > .footer").outerHeight() || 0);
	$(".wrapper").css("min-height", height + "px");
	var content = $(".wrapper").height();
	if (content > height)
		$(".left-side, html, body").css("min-height", content + "px");
	else {
		$(".left-side, html, body").css("min-height", height + "px");
	}
}
function fix_sidebar() {
    //Make sure the body tag has the .fixed class
    if (!$("body").hasClass("fixed")) {
        return;
    }
    //Add slimscroll
    $(".sidebar").slimscroll({
        height: ($(window).height() - $(".header").height()) + "px",
        color: "rgba(0,0,0,0.2)"
    });
}
function bindAclick(){
	$("a").click(function(event){
		if(this.className!='home'){
			event.preventDefault();
			if($(this).parents(".treeview").length==0){
				var url=this.getAttribute("href");
				var state = {
					url: url
				};
				if(url!="#" && url!="" && url!="javascript:;" && (!window.history.state || window.history.state.url.replace(httpurl+"/admin/","") != url.replace(httpurl+"/admin/",""))){
					window.history.pushState(state, document.title, url);
					menuclick(url,false);
				}
			}
		}
	});

}
function menuclick(url,isPush,isMenu){
	if(isPush == "undefined" || !isPush){
		var newurl = "index.php"+url.substr(url.indexOf("?"));
		var state = {
			url: newurl
		};
		if(!window.history.state || (window.history.state.url.replace(httpurl+"/admin/","") != newurl.replace(httpurl+"/admin/",""))){
			window.history.pushState(state, document.title, newurl);
		}
	}
	var rightSide=$(".right-side"),
		rCon=$(".right-side .content");
	if(url!="#" && url!=""){
		$("#add_bgcolor").colorpicker("destroy");
		$("#add_fontcolor").colorpicker("destroy");
    		$("#addColor").spectrum("destroy");
		rCon.html("");
		removeTipsBox();
		loadingBox("加载中...");
		$(window).unbind("scroll");
		$.ajax({
			url:url,
			type:"get",
			dataType:"html",
			success:function(con){
				removeTipsBox();
				if(colorSpectrum){
					colorSpectrum.destroy();
				}
				//$(".colorpicker").remove();
				rCon.html(con);
				$("body").scrollTop(0);
				_fix();
				fix_sidebar();
				if(window.innerWidth<992){
					if(isMenu){
						$("[data-toggle='offcanvas']").click();
					}
				}
			}
		});
	}
}
function ajaxclick(url,refreshurl,confirm,callback){
	if(typeof refreshurl === "function"){
                callback = arguments[1];
                refreshurl = null;
	}else if(typeof confirm === "function"){
                callback = arguments[2];
                confirm = "";
	}
	if(typeof confirm == "undefined" || confirm == ""){
                loadingBox("处理中...");
                $.ajax({
                        url: url,
                        dataType: "html",
                        success: function (ret) {
                                removeTipsBox();
                                var data = ret;
                                if(ret.indexOf("flag") > -1 && ret.indexOf("error") > -1){
                                        data = $.parseJSON(ret);
                                }
                                if(typeof data == "string"){
                                        if (data == 1) {
                                                tipsBox("成功", 1000);
                                                if(refreshurl){
                                                        menuclick(refreshurl);
                                                }
                                                callback && callback();
                                        } else {
                                                tipsBox(data, 2000);
                                        }
				}else{
                                        if (data.flag == 1) {
                                                tipsBox("成功", 1000);
                                                if(refreshurl){
                                                        menuclick(refreshurl);
                                                }
                                                callback && callback();
                                        } else {
                                                tipsBox(data.error, 2000);
                                        }
				}
                        }
                });
	}else{
                Dialog({
                        title:"提示",
                        content:confirm,
                        okCallback:function(form,callback){
                                callback && callback();
                                loadingBox("处理中...");
                                $.ajax({
                                        url: url,
                                        dataType: "html",
                                        success: function (ret) {
                                                removeTipsBox();
                                                var data = ret;
                                                if(ret.indexOf("flag") > -1 && ret.indexOf("error") > -1){
                                                        data = $.parseJSON(ret);
                                                }
                                                if (data == 1 || data.flag == 1) {
                                                        tipsBox("成功", 1000);
                                                        if(refreshurl){
                                                                menuclick(refreshurl);
                                                        }
                                                        callback && callback();
                                                } else {
                                                        if(data.error){
                                                                tipsBox(data.error, 2000);
                                                        }else{
                                                                tipsBox(data, 2000);
                                                        }
                                                }

                                        }
                                });
                        }
                });
	}
}
function trim(str){
	var ret = '';
	if(str){
		ret = str.replace(/\s+/g,"");
	}
	return ret;
}
function getLocalTime(nS) {
	var dt = new Date(parseInt(nS) * 1000);
	var year=dt.getFullYear(),
		month=dt.getMonth()+1,
		day=dt.getDate(),
		hour=dt.getHours(),
		minute=dt.getMinutes(),
		second=dt.getSeconds();
	if(month<10)month = "0"+month;
	if(day<10)day = "0"+day;
	if(hour<10)hour = "0"+hour;
	if(minute<10)minute = "0"+minute;
	return year+"-"+month+"-"+day+" "+hour+":"+minute+":"+second;
}
function getShortTime(nS) {
	var dt = new Date(parseInt(nS) * 1000);
	var year=dt.getFullYear(),
		month=dt.getMonth()+1,
		day=dt.getDate();
	if(month<10)month = "0"+month;
	if(day<10)day = "0"+day;
	return year+"-"+month+"-"+day;
}
function getParamByStr(param){//根据名称获取浏览器参数
	var ret;
	var linkurl=location.href;
	var paramStr=linkurl.substr(linkurl.indexOf("?")+1);
	var params=paramStr.split("&");
	for(var i=0;i<params.length;i++){
		var p=params[i].split("=");
		if(p[0]==param){
			ret=p[1];
			var last = ret.substr(ret.length-1,ret.length);
			if(last=="#"){
				ret = ret.substr(0,ret.length-1);
			}
			break;
		}
	}
	return ret;
}
function getParam(url){
	if(!url){
		url = location.href;
	}
	var query = {}, i, params, param,
		lastindex = url.lastIndexOf('?');
	if (lastindex >= 0) url = url.substr(lastindex+1);
	else return query;
	params = url.split('&');
	for (i = 0; i < params.length; i++) {
		param = params[i].split('=');
		query[param[0]] = param[1];
	}
	return query;
}
//筛选浏览器参数
function filterParams(options){
	var ret = [];
	var linkurl=location.href;
	var paramStr=linkurl.substr(linkurl.indexOf("?")+1);
	var params=paramStr.split("&");
	for(var i=0;i<params.length;i++){
		var p=params[i].split("=");
		var isAdd = true;
		for(var n=0;n<options.length;n++){
			var o = options[n];
			if(p[0]==o){
				isAdd = false;
				break;
			}
		}
		if(isAdd){
			ret.push(p[0]+"="+p[1]);
		}
	}
	return ret.join("&");
}
function getPhoto(photo){
	if(photo && photo!=""){
		photo = photo.split(",")[0];
		if(typeof uploadurl != 'undefined'){
			if(photo.indexOf('mobile/') < 0 && photo.indexOf(uploadurl)<0 && photo.indexOf("http")<0 && photo.indexOf('group1/') < 0){
				photo = uploadurl + photo;
			}
		}else{
			if(photo.indexOf('mobile/') < 0 && photo.indexOf(uploaddir)<0 && photo.indexOf("http")<0 && photo.indexOf('group1/') < 0){
				photo = uploaddir + photo;
			}
		}
	}
	return photo;
}
function tipsBox(text,delay){
	var delaytime = delay?delay:1000;
	if(delay>10000)delaytime=1000;
	var str ='';
	str += '<div class="ui-tipsbox">';
	str +=	'<div class="ui-tipsbox-inner">';
	str +=		'<span class="ui-tipsbox-text">';
	str +=			'<div style="min-width:100px;margin:auto;">';
	str +=				'<i class="fa fa-check"></i>';
	str +=				'<p>'+text+'</p>';
	str += 			'</div>';
	str +=		'</span>';
	str +=	'</div>';
	str += '</div>';
	var popLayout = $(str).appendTo(document.body);
	setTimeout(function(){
		popLayout.fadeOut('slow',function(){
			popLayout.remove();
		});
	},delay);
	return popLayout;
}

function okTipsBox(text,delay,callback){
	var delaytime = delay?delay:1000;
	if(delay>10000)delaytime=1000;
	var str ='';
	str += '<div class="ui-tipsbox tips-box">';
	str +=	'<div class="ui-tipsbox-inner">';
	str +=		'<span class="ui-tipsbox-text">';
	str +=			'<div class="txt-inner">';
	str +=				'<i class="fa fa-check"></i>';
	str +=				'<p>'+text+'</p>';
	str += 			'</div>';
	str +=		'</span>';
	str +=	'</div>';
	str += '</div>';
	var popLayout = $(str).appendTo(document.body);
	setTimeout(function(){
		popLayout.fadeOut('slow',function(){
			popLayout.remove();
			callback && callback();
		});
	},delay);
	return popLayout;
}
function errorTipsBox(text,delay,callback){
	var delaytime = delay?delay:1000;
	if(delay>10000)delaytime=1000;
	var str ='';
	str += '<div class="ui-tipsbox tips-box">';
	str +=	'<div class="ui-tipsbox-inner">';
	str +=		'<span class="ui-tipsbox-text">';
	str +=			'<div class="txt-inner">';
	str +=				'<i class="fa fa-warning"></i>';
	str +=				'<p>'+text+'</p>';
	str += 			'</div>';
	str +=		'</span>';
	str +=	'</div>';
	str += '</div>';
	var popLayout = $(str).appendTo(document.body);
	setTimeout(function(){
		popLayout.fadeOut('slow',function(){
			popLayout.remove();
			callback && callback();
		});
	},delay);
	return popLayout;
}
function removeTipsBox(){
	$(".ui-tipsbox").remove();
}
function loadingBox(text,delay){
	var str = '';
	str += '<div class="ui-tipsbox">';
	str +=	'<div class="ui-tipsbox-inner">';
	str +=		'<div class="ui-tipsbox-text">';
	str +=			'<div style="min-width:100px;margin:auto;">';
	str +=				'<div class="loading" ></div>';
	str +=				'<div>'+text+'</div>';
	str += 			'</div>';
	str += 		'</div>';
	str += '</div>';
	str += '</div>';
	var popLayout = $(str).appendTo(document.body);
	/*
	setTimeout(function(){
		popLayout.fadeOut('slow',function(){
			popLayout.remove();
		});
	},delay);
	*/
	return popLayout;
}
function setDefaultImg(container,defaultSrc){
	container.find("img").each(function(){
		var img = this;
		img.onerror=function(){
			img.src = defaultSrc;
		}
	});
}
function setDefaultByImg(img,defaultSrc,callback){
	img.onerror=function(){
		img.src = defaultSrc;
		callback && callback();
	}
}
function buildqrcode(target,type,moduleid,id)
{
	var nodeName = target.nodeName.toLowerCase(),
	curmodule = getParamByStr("module");
	if(type=='meeting'){
		url='/mobile/ajax/meeting.php?action=qrcode&type='+type+'&id='+id+'&moduleid='+moduleid;
	}else{
		url='/mobile/ajax/follow.php?action=qrcode&module='+curmodule+'&type='+type+'&id='+id+'&moduleid='+moduleid;
	}
	// $('#'+type+'_'+id).hide();
	loadingBox("提交中...");
	$.ajax({
		url:url,
		type:"get",
		dataType:"html",
		success:function(data)
		{
			removeTipsBox();
			if(data){
				tipsBox('二维码已生成',1000);
			//	$('#'+type+id).attr("src",data);
				var parent = $(target).parent();
				var img =parent.find("img");
				if(img[0]){
					img[0].src=data;
				}else{
					var str = "<div>";
						str += 	"<img id='"+type+id+"' src='"+data+"' style='width:100px' />";
						str +="</div>";
					$(target).html("重新生成");
					$(str).insertBefore($(target));
				}
			}
		}
	});
}
function Dialog(options){
	var title = options.title,
	content = options.content,
	okText = options.okText ? options.okText : "确定",
	cancelText = options.cancelText ? options.cancelText : "取消",
	css = options.css ? options.css : "",
	okCallback = options.okCallback,
	cancelCallback = options.cancelCallback,
	beforeClick = options.beforeClick,
	havfooter = options.havfooter == "undefined" || options.havfooter == undefined || options.havfooter ? true : false,
	idstr = (css=="") ? "" : "id='"+css+"'";
	var str = "";
	str += "<div class='modal fade "+css+"' "+idstr+" tabindex='-1'>";
	str += "<div class='modal-inner'>";
	str +=		"<div class='modal-dialog'>";
	str +=			"<div class='modal-content'>";
	str +=				"<div class='modal-header'>";
	str +=					"<button type='button' class='close'>×</button>";
	str +=					"<h4 class='modal-title'><i class='fa fa-envelope-o'></i> "+title+"</h4>";
	str += 				"</div>";
	str +=				"<form  method='post' enctype='multipart/form-data'>";
	str +=					"<div class='modal-body'>";
	str +=						content;
	str += 					"</div>";
	if(havfooter){
	str +=					"<div class='modal-footer clearfix'>";
	str +=						"<button type='submit' class='btn btn-primary'><i class='fa fa-envelope'></i> "+okText+"</button>";
	str +=						"<button type='button' class='btn btn-danger pull-left' data-dismiss='modal'><i class='fa fa-times'></i> "+cancelText+"</button>";
	str += 					"</div>";
	}
	str +=				"</form>";
	str += 			"</div>";
	str += 		"</div>";
	str += "</div>";
	str += "</div>";
	var dialog,
		cssName= (css=="") ? "modal" : css;
	if($("."+cssName)[0]){
		$("."+cssName).remove();
	}
	dialog=$(str).appendTo($("body"));
	dialog.show();
	dialog.addClass("in");
	var form=dialog.find('form');
	beforeClick && beforeClick(form,dialog);
	dialog.find(".close").click(function(event){
		event.preventDefault();
		dialog.removeClass("in");
		dialog.hide();
		dialog.remove();
	});
	dialog.find(".btn-danger").click(function(event){
		event.preventDefault();
		cancelCallback && cancelCallback();
		dialog.removeClass("in");
		dialog.hide();
		dialog.remove();
	});
	dialog.find(".btn-primary").click(function(event){
		event.preventDefault();
		okCallback && okCallback(form,function(){
			dialog.removeClass("in");
			dialog.hide();
			dialog.remove();
		});
	});
	return dialog;
}
function createNav(data){
	var str="";
	for(var i=0;i<data.length;i++){
		str += "<li ";
		if(i==data.length-1){
			str += "class='active'";
		}
		str += ">";
		if(i==0){
			str += "<a class='home' href='index.php'>";
			str += "<i class='fa fa-dashboard'></i>";
			str += data[i];
			str += "</a>";
		}else{
			str += data[i];
		}
	}
	return str;
}

function scan(){
	url='admin.php?action=security&module=tools';
	$.ajax({
		url:url,
		data:"id=1",
		type:"post",
		dataType:"html",
		success:function(data){
			if(data==1){
				tipsBox('安全扫描完成',1000);
			}else{
				alert(data);
			}
		}
	});
}
function preNode(node,nodeName){
	var pre = node.previousSibling;
	while(pre){
		if(pre.nodeType===1){
			if(nodeName && pre.nodeName.toLowerCase()==nodeName){
				break;
			}else{
				break;
			}
		}
		pre = pre.previousSibling;
	}
	return pre;
}
function nextNode(node,nodeName){
	var next = node.nextSibling;
	while(next){
		if(next.nodeType===1){
			if(nodeName && next.nodeName.toLowerCase()==nodeName){
				break;
			}else{
				break;
			}
		}
		next = next.nextSibling;
	}
	return next;
}
function preNodeByClass(node,classname){
	var pre = node.previousSibling;
	while(pre){
		if(pre.nodeType===1 && $(pre).hasClass(classname)){
			break;
		}
		pre = pre.previousSibling;
	}
	return pre;
}
function nextNodeByClass(node,classname){
	var next = node.nextSibling;
	while(next){
		if(next.nodeType===1 && $(next).hasClass(classname)){
			break;
		}
		next = next.nextSibling;
	}
	return next;
}
function getParentByNodeName(node,nodename){
	var ret;
	while(!ret){
		if(node && node.nodeType === 1 && node.nodeName.toLowerCase() == nodename){
			ret = $(node);
			break;
		}
		if(!node){
			break;
		}
		node = node.parentNode;
	}
	return ret;
}
function getParentByClass(node,classname){
	var ret;
	while(!ret){
		if(node && node.nodeType === 1 && $(node).hasClass(classname)){
			ret = $(node);
			break;
		}
		if(!node){
			break;
		}
		node = node.parentNode;
	}
	return ret;
}
function imgIsByWidth(img){
	var byWidth=true;
	var win_W = window.innerWidth,
		win_H = window.innerHeight,
		imgW = img.width,
		imgH = img.height,
		percent = win_W / win_H,
		imgPercent = imgW / imgH;
	if(percent >= 1){//宽大于高，宽100%
		if(imgPercent >= 1){
			byWidth = true;
		}else{
			byWidth = false;
		}
	}else{
		if(imgPercent >= 1){
			byWidth = false;
		}else{
			byWidth = true;
		}
	}
}
function getAvatar(uid){
	var avatar = uploaddir+"avatar/"+Math.ceil(uid/2000)+"/"+uid+".jpg";
	return avatar;
}
function viewBigImg(container,outerContainer,havDis,pageCon,test){
	var imgs=container.find("img"),
		clickarea= pageCon ? pageCon : container,
		clickimgs= clickarea.find("img");
	if(havDis){
		imgs=container.find("img[rol=dis]");
		clickimgs=clickarea.find("img[rol=dis]");
	}
	if(navigator.userAgent.toLowerCase().indexOf("micromessenger") > -1){
		var imglist=[];
		imgs.each(function(){
			var imgsrc=this.src;
			if(this.className.search(/lazy_load/g)>-1){
				imgsrc=this.getAttribute("data-original");
			}
			if(imgsrc.search(/http:/g)<0){
				imgsrc = "http://"+host_url+imgsrc;
			}
			var newImg=new Image();
			newImg.src=imgsrc;
			if(newImg.width==0){
				imgsrc = "http://"+host_url+logo_src;
			}
			imglist.push(imgsrc);
		});
		//document.addEventListener("WeixinJSBridgeReady",function(){
			//container.find("img").addEventListener("click",function(){
			clickimgs.each(function(){
				var that = this;
				that.addEventListener("click",function(){
					 WeixinJSBridge.invoke("imagePreview",{
						//"urls":imglist,
						"urls":[that.src],
						"current":"http://"+host_url+that.getAttribute("src")
					 });
				});
			});
		//});
	}else{
		clickimgs.click(function(){
			var imgStr="";
			imgs.each(function(){
				var src=this.getAttribute("src");
				var byWidth=imgIsByWidth(this),
					style_src="";
				if(byWidth){
					style_src="style='width:100%;'";
				}else{
					style_src="style='height:100%;'";
				}
				imgStr += "<div class='item'><img src='"+src+"' "+style_src+" /></div>";
			});

			var scroll_top=$("body")[0].scrollTop;
			outerContainer.css({"overflow":"hidden","height":window.innerHeight});
			var imgLayer=$("<div class='big-img-layer'><div id='owl-show-img' class='owl-carousel owl-theme'>"+imgStr+"</div></div>");
			imgLayer.appendTo($("body"));
			$("#owl-show-img",imgLayer).owlCarousel({
				navigation : true,
				singleItem : true
			});
			//imgLayer.height(window.innerHeight);
			var index=imgs.index($(this));
			$("#owl-show-img .owl-controls .owl-page").eq(index).click();
			$("#owl-show-img .owl-controls").hide();
			imgLayer.find(".item img").click(function(){
				imgLayer.remove();
				$(".big-img-layer").remove();
				outerContainer.css({"overflow":"","height":""});
				$("body").scrollTop(scroll_top);
			});
		});
	}
}
function viewCurBigImgByImg(imgs){
	var outerContainer = $("body");
	if(navigator.userAgent.toLowerCase().indexOf("micromessenger") > -1){
		imgs.each(function(){
			var cur = $(this),
			    cursrc = this.src;
			if(cursrc.search("http")<0){
				cursrc = httpurl + this.src;
			}
			var imglist=[];
			imglist.push(cursrc);
			cur[0].addEventListener("click",function(){
				 WeixinJSBridge.invoke("imagePreview",{
					"urls":imglist,
					"current":cursrc
				 });
			});
		});
	}else{
		imgs.each(function(){
			var cur = $(this);
			cur.click(function(){
				var imgStr="";
					var imgsrc = cur[0].src;
					var byWidth=imgIsByWidth(imgsrc),
					    style_src="";
					if(byWidth){
						style_src="style='width:100%;'";
					}else{
						style_src="style='height:100%;'";
					}
					imgStr += "<div class='item'><img src='"+imgsrc+"' "+style_src+" /></div>";
				var scroll_top=$("body")[0].scrollTop;
				outerContainer.css({"overflow":"hidden","height":window.innerHeight});
				var imgLayer=$("<div class='big-img-layer'><div id='owl-show-img' class='owl-carousel owl-theme'>"+imgStr+"</div></div>");
				imgLayer.appendTo($("body"));
				$("#owl-show-img",imgLayer).owlCarousel({
					navigation : true,
					singleItem : true
				});
				$("#owl-show-img .owl-controls").hide();
				imgLayer.find(".item img").click(function(){
					imgLayer.remove();
					$(".big-img-layer").remove();
					outerContainer.css({"overflow":"","height":""});
					$("body").scrollTop(scroll_top);
				});
			});
		});
	}
}

function setImgSize(that,callback){
	return function(done){
		var src = that.src;
		that.setAttribute("data-original",src);
		var newimg = new Image();
		newimg.src = src;
		newimg.onload = function(){
			callback && callback(newimg,that);
			done();
		}
		newimg.onerror = function(){
			that.src = "/mobile/data/images/nopic.jpg";
			callback && callback(that,that);
			done();
		}
	}
}
function taskData(options){
	var data = options.data,
		handleFunction = options.handleFunction;
	var tasks = [];
	for(var i=0;i<data.length;i++){
		tasks.push(handleFunction(data[i]));
	}
	var _serial = function(){
		if(tasks.length===0){
			return;
		}
		var task =tasks[0];
		tasks.splice(0,1);
		task(_serial);
	}
	_serial();
}
function handleImg(imglist,callback){
	var img_l = imglist.length;
	var tasks=[];
	if(img_l){
		for(var i = 0; i < img_l; i++){
			tasks.push(setImgSize(imglist[i],callback));
		}
		var _serial = function(){
    			if(tasks.length===0){
    				return;
    			}
    			var task =tasks[0];
    			tasks.splice(0,1);
    			task(_serial);
    		}
    		_serial();
	}
}

//选人
var unames=[],uids=[],vals=[];
var addUserDialogCon = function(){
	var groupid = getParamByStr('id');
	var groupStr = '';
	groupStr += '<div class="box">';
	groupStr += 	'<div class="box-body table-responsive">';
	groupStr +=			'<table class="table table-bordered table-hover">';
	groupStr +=				'<tbody>';
	groupStr +=					'<tr>';
	groupStr +=						'<td width="50%" class="user-list">';
	groupStr +=							'<div class="input-group sidebar-form">';
	groupStr +=								'<input type="text" id="sUser" class="form-control" placeholder="搜索用户...">';
	groupStr +=								'<span class="input-group-btn">';
	groupStr +=									'<span class="btn btn-flat"><i class="fa fa-search"></i></span>';
	groupStr +=								'</span>';
	groupStr +=							'</div>';
	groupStr +=						'</td>';
	groupStr +=						'<td class="bg-gray user-r" width="50%">';
	//groupStr +=							'<textarea class="form-control" style="height:100%" id="usernames" disabled ></textarea>';
	groupStr +=								'<input type="hidden" id="uid" name="uid">';
	groupStr +=								'<input type="hidden" id="unames" name="unames">';
	groupStr +=								'<input type="hidden" id="vals" name="vals">';
	groupStr +=								'<input type="hidden" name="groupid" value="'+groupid+'">';
	groupStr +=						'</td>';
	groupStr +=					'</tr>';
	groupStr +=				'</tbody>';
	groupStr += 		'</table>';
	groupStr += 	'</div>';
	groupStr += '</div>';
	return groupStr;
},
createSearchList = function(result){
	var content="";
	for(var i=0;i<result.length;i++){
		var user = result[i],uid=user.uid,uname=user.username;
		var avatar = getAvatar(uid);
		content += '<div class="input-group result-group" uid="'+uid+'">';
		content += 		'<span class="input-group-addon">';
		content +=			'<input type="checkbox" uid="'+uid+'" uname="'+uname+'" />';
		content +=		'</span>';
		content +=		'<label class="form-control">';
		content +=			'<img src="'+avatar+'" />';
		content +=			uname;
		content +=		'</label>';
		content += '</div>';
	}
	return content;
},
createSelectUser = function(uid,uname){
	var avatar = getAvatar(uid);
	var content="";
		content += '<div uid="'+uid+'" uname="'+uname+'" class="form-group">';
		content +=		'<label disabled>';
//content +=			'<input type="checkbox" checked uid="'+user.uid+'" uname="'+user.username+'" />';
		content +=			'<img src="'+avatar+'" />';
		content +=			uname;
		content +=		'</label>';
		content +=		'<i class="fa fa-del del"></i>';
		content += '</div>';
	return content;
},
setUserValue = function(form){
	$("#uid",form).val(uids.join(","));
	$("#unames",form).val(unames.join(","));
	$("#vals",form).val(JSON.stringify(vals));
},
addUserValue = function(uid,uname){
	vals.push({uid:uid,uname:uname});
	unames.push(uname);
	uids.push(uid);
},
delUserValue = function(uid,callback){
	for(var i=0;i<vals.length;i++){
		var val = vals[i];
		if(val.uid==uid){
			uids.splice(i,1);
			unames.splice(i,1);
			vals.splice(i,1);
			callback && callback();
			break;
		}
	}
},
delUserEvent = function(container,form){
	container.find(".del").click(function(event){
		var self = this;
		var delid = $(this).parent().attr("uid");
		delUserValue(delid,function(){
			$(self).parent().remove();
			var lBox = $(".user-list .result-group[uid="+delid+"] input[type=checkbox]")[0];
			if(lBox && lBox.checked){
				lBox.checked = false;
			}
			setUserValue(form);
		});
	});
},
searchUser = function(kw,form){
	$.ajax({
		url:"api.php?module=search&type=members",
		data:{"keyword":kw},
		type:"post",
		dataType:"json",
		success:function(ret){
			if(ret && ret.length>0){
				$(".user-list .result-group").remove();
				var searchUsers=$(createSearchList(ret)).appendTo($(".user-list"))
				.click(function(event){
					var target = event.target,cur = this,
						ckbox = $(cur).find("input[type=checkbox]")[0],
						uid = ckbox.getAttribute("uid"),
						uname = ckbox.getAttribute("uname");
					if(target != ckbox){
						if(ckbox.checked)ckbox.checked=false;
						else ckbox.checked=true;
					}
					var add =true;
					for(var i=0;i<vals.length;i++){
						var val = vals[i];
						if(val.uid==uid){
							add = false;
							break;
						}
					}
					if(ckbox.checked){
						if(add){
							addUserValue(uid,uname);
							var selectUsers=$(createSelectUser(uid,uname)).appendTo($(".user-r"))
							.find(".del").click(function(event){
								var self = this;
								var delid = $(this).parent().attr("uid");
								delUserValue(delid,function(){
									$(self).parent().remove();
									var lBox = $(".user-list .result-group[uid="+delid+"] input[type=checkbox]")[0];
									if(lBox && lBox.checked){
										lBox.checked = false;
									}
									setUserValue(form);
								});
							});
							setDefaultImg(selectUsers,uploaddir+"avatar/user.jpg");
						}
					}else{
						delUserValue(uid,function(){
							$(".user-r .form-group[uid="+uid+"]").remove();
						});
					}
					setUserValue(form);
				});
				setDefaultImg(searchUsers,uploaddir+"avatar/user.jpg");
			}else{
				$(".user-list .result-group").remove();
			}
		}
	});
};
//选产品
var ptitles=[],pids=[],pvals=[];
var addProductDialogCon = function(){
	var productStr = '';
	productStr += '<div class="box">';
	productStr += 	'<div class="box-body table-responsive">';
	productStr +=			'<table class="table table-bordered table-hover">';
	productStr +=				'<tbody>';
	productStr +=					'<tr>';
	productStr +=						'<td width="50%" class="user-list">';
	productStr +=							'<div class="input-group sidebar-form">';
	productStr +=								'<input type="text" id="sProduct" class="form-control" placeholder="搜索产品...">';
	productStr +=								'<span class="input-group-btn">';
	productStr +=									'<span class="btn btn-flat"><i class="fa fa-search"></i></span>';
	productStr +=								'</span>';
	productStr +=							'</div>';
	productStr +=						'</td>';
	productStr +=						'<td class="bg-gray user-r" width="50%">';
	//productStr +=							'<textarea class="form-control" style="height:100%" id="usernames" disabled ></textarea>';
	productStr +=								'<input type="hidden" id="pids" name="pids">';
	productStr +=								'<input type="hidden" id="ptitles" name="ptitles">';
	productStr +=								'<input type="hidden" id="pvals" name="pvals">';
	productStr +=						'</td>';
	productStr +=					'</tr>';
	productStr +=				'</tbody>';
	productStr += 		'</table>';
	productStr += 	'</div>';
	productStr += '</div>';
	return productStr;
},
createSearchProductList = function(result){
	var content="";
	for(var i=0;i<result.length;i++){
		var prod = result[i],id=prod.id;
		var title=prod.productname;
		if(prod.title)
		{
			title += "("+prod.title+")";
		}
		var photo ;
		if(prod.photo)
		{
			photo= getPhoto(prod.photo);
		}
		else
		{
			photo = '/data/images/nophoto.jpg';
		}
		content += '<div class="input-group result-group" uid="'+id+'">';
		content += 		'<span class="input-group-addon">';
		content +=			'<input type="checkbox" uid="'+id+'" title="'+title+'" />';
		content +=		'</span>';
		content +=		'<label class="form-control">';
		content +=			'<img src="'+photo+'" />';
		content +=			title;
		content +=		'</label>';
		content += '</div>';
	}
	return content;
},
searchProduct = function(kw,from,form){
	$.ajax({
		url:"api.php?module=searchproduct&from="+from,
		data:{"keyword":kw},
		type:"post",
		dataType:"json",
		success:function(ret){
			if(ret && ret.length>0){
				$(".user-list .result-group").remove();
				var searchUsers=$(createSearchProductList(ret)).appendTo($(".user-list"))
				.click(function(event){
					var target = event.target,cur = this,
						ckbox = $(cur).find("input[type=checkbox]")[0],
						id = ckbox.getAttribute("uid"),
						title = ckbox.getAttribute("title");
					if(target != ckbox){
						if(ckbox.checked)ckbox.checked=false;
						else ckbox.checked=true;
					}
					var add =true;
					for(var i=0;i<pvals.length;i++){
						var val = pvals[i];
						if(val.uid==id){
							add = false;
							break;
						}
					}
					if(ckbox.checked){
						if(add){
							addProductValue(id,title);
							var selectProducts=$(createSelectProduct(id,title)).appendTo($(".user-r"))
							.find(".del").click(function(event){
								var self = this;
								var delid = $(this).parent().attr("pid");
								console.log(delid);
								delProductValue(delid,function(){
									$(self).parent().remove();
									var lBox = $(".user-list .result-group[uid="+delid+"] input[type=checkbox]")[0];
									if(lBox && lBox.checked){
										lBox.checked = false;
									}
									setProductValue(form);
								});
							});
						}
					}else{
						delProductValue(id,function(){
							$(".user-r .form-group[pid="+id+"]").remove();
						});
					}
					setProductValue(form);
				});
			}else{
				$(".user-list .result-group").remove();
			}
		}
	});
},
addProductValue = function(pid,ptitle){
	pvals.push({pid:pid,title:ptitle});
	ptitles.push(ptitle);
	pids.push(pid);
},
setProductValue = function(form){
	$("#pids",form).val(pids.join(","));
	$("#ptitles",form).val(ptitles.join(","));
	$("#pvals",form).val(JSON.stringify(pvals));
},
delProductValue = function(pid,callback){
	for(var i=0;i<pvals.length;i++){
		var val = pvals[i];
		if(val.pid==pid){
			pids.splice(i,1);
			ptitles.splice(i,1);
			pvals.splice(i,1);
			callback && callback();
			break;
		}
	}
},
createSelectProduct = function(pid,ptitle){
	var content="";
		content += '<div pid="'+pid+'" ptitle="'+ptitle+'" class="form-group">';
		content +=		'<label disabled>';
		content +=			ptitle;
		content +=		'</label>';
		content +=		'<i class="fa fa-del del"></i>';
		content += '</div>';
	return content;
};
function getkeyword(value){
	var add = $("#add_keyword")[0],
		edit = $("#edit_keyword")[0],
		listarea;

	if(value && value!=""){
		$.ajax({
			url:"api.php?module=getkeyword",
			data:{title:value},
			type:"post",
			dataType:"json",
			success:function(data){
				if(data && data!=0 && data.length>0){
					if(add){
						listarea = $(add).parent().find(".keywordlist");
						add.value = data.join(",");
					}
					if(edit){
						listarea = $(add).parent().find(".keywordlist");
						edit.value = data.join(",");
					}
					if(listarea){
						for(var i=0;i<data.length;i++){
							if(!listarea.find(".item[key="+data[i]+"]")[0]){
								var str = '<div class="item" key="'+data[i]+'">'+data[i]+'<div class="del"></div></div>';
								listarea.prepend(str);
							}
						}
					}
				}
			}
		});
	}
}
function selectkeyword(additem){
	var keyarea = $(additem).parent(),
		hideinput = keyarea.parent().find("input[type=hidden]"),
		inputkey = hideinput.val(),
		inputkeyarr = [];
	if(trim(inputkey) != "")inputkeyarr = inputkey.split(",");
	var con = '';
	$.ajax({
		url:'api.php?module=getkeywords',
		data:{content:UE.getEditor('content').getContent()},
		type:"post",
		dataType:"json",
		async:false,
		success:function(data){
			if(data && data.length > 0){
				for(var i=0;i<data.length;i++){
					var d = data[i],isexist = false;
					for(j=0;j<inputkeyarr.length;j++){
						var c = inputkeyarr[j];
						if(c == d){
							isexist = true;
							break;
						}
					}
					if(isexist){
						con += '<div class="item active" key="'+d+'">'+d+'</div>';
					}else{
						con += '<div class="item" key="'+d+'">'+d+'</div>';
					}
				}
			}
		}
	});
	var dialogcon = '<div class="form-group">'+
			'<div class="input-group">'+
				'<input type="text" class="form-control" />'+
				'<span class="input-group-addon additem" style="background-color:#52B72A;color:#fff;">添加关键字</span>'+
			'</div>'+
		'</div>'+
		'<input type="hidden" id="keys" value="'+inputkey+'" />'+
		'<div class="keywordlist">'+con+'</div>';
		Dialog({
			title:"关键字",
			content:dialogcon,
			beforeClick:function(form){
				form.click(function(event){
					var node = event.target;
					while(node){
						var cur = $(node);
						if(node.nodeType === 1){
							if(cur.hasClass("item")){
								event.preventDefault();
								var curkey = cur.attr("key"),
									curinput = form.find("input[type=hidden]");
								if(cur.hasClass("active")){
									for(var i=0;i<inputkeyarr.length;i++){
										var k = inputkeyarr[i];
										if(k == curkey){
											inputkeyarr.splice(i,1);
											break;
										}
									}
									cur.removeClass("active");

								}else{
									inputkeyarr.push(curkey);
									cur.addClass("active");
								}
								curinput.val(inputkeyarr.join(","));
								break;
							}else if(cur.hasClass("additem")){
								event.preventDefault();
								var curinput = cur.parent().find("input"),
									inputval = curinput.val();
								if(trim(inputval) == ""){
									tipsBox("关键字不能为空",1000);
									return false;
								}
								if(!form.find(".item[key="+inputval+"]")[0]){
									$('<div class="item" key="'+inputval+'">'+inputval+'</div>').appendTo(form.find(".keywordlist"));
									curinput.val("");
								}
							}
						}
						node = node.parentNode;
					}
				});
			},
			okCallback:function(form,callback){
				keyarea.find(".item").each(function(){
					var cur = $(this);
					if(!cur.hasClass("addkey")){
						cur.remove();
					}
				});
				for(var i=0;i<inputkeyarr.length;i++){
					var k = inputkeyarr[i],
						str = '<div class="item" key="'+k+'">'+k+'<span class="del"></span></div>';
					if(!keyarea.find(".item[key="+k+"]")[0]) {
						keyarea.prepend(str);
					}
				}
				hideinput.val(inputkeyarr.join(","));
				callback && callback();
			}
		});
}
function basePwd(uname,pwd){
	var ret=uname.length+"\t"+uname+"\t"+pwd.length+"\t"+pwd;
	return Base64.encode(ret);
}

function scrollEvent(callback){
	var nDivHeight = document.documentElement.clientHeight;
	var nScrollTop = document.body.scrollTop || document.documentElement.scrollTop,
		nScrollHeight=document.body.offsetHeight;
	var total = nScrollTop + nDivHeight;
	var bodyCss=$("body")[0].className;
	if(bodyCss.search(/weixin/g)>-1 || bodyCss.search(/app/g)>-1){
		total += 50;
	}
	if(total >= nScrollHeight){
		callback && callback();
	}
}
function bindScroll(options){
	var data=options.data,
		limit=options.limit,
		pullUp=options.pullUp,
		pageid=options.pageid,
		isFirst=options.isFirst,
		isArray=options.isArray,
		callback=options.callback;
	if(isFirst){
		isFirst = false;
		$(window).bind("scroll",function(){
			scrollEvent(callback);
		});
	}else{
		if(isArray){
			if(data != null && data!=0 && data && data.length>=limit){
				$(window).bind("scroll",function(){
					scrollEvent(callback);
				});
			}else{
				pageid && pageid--;
				$(window).unbind("scroll");
			}
		}else{
			if(data && data!=""){
				$(window).bind("scroll",function(){
					scrollEvent(callback);
				});
			}else{
				pageid && pageid--;
				$(window).unbind("scroll");
			}
		}
	}
}
function bindScroll1(options){
	var data=options.data,
		limit=options.limit,
		isService=options.isService,
		callback=options.callback;
	var len=0,condition;
	if(data != null && data!=0 && data){
		if(isService){
			if(data.today)len += data.today.length;
			if(data.yesterday)len += data.yesterday.length;
			if(data.before)len += data.before.length;
		}else{
			len = data.length;
		}
		if(len>=limit){
			$(window).bind("scroll",function(){
				scrollEvent(callback);
			});
		}else{
			$(window).unbind("scroll");
		}
	}else{
		$(window).unbind("scroll");
	}
	setTimeout(function(){
	},2000);
}

//发送消息选项卡
var createTabStr = function(emoji,news){
	var news = !news ? "" : news;
	var content = "";
		content += 			"<div class='tab-title ts'>"
		content += 				"<ul class='nav-tabs'>";
		content += 					"<li class='active' role='text'><a><span>文本<span></span></span></a></li>";
		content += 					"<li role='photo'><a><span>图片<span></span></span></a></li>";
		content += 					"<li role='news'><a><span>新闻<span></span></span></a></li>";
		// content += 					"<li role='music'><a><span>音乐<span></span></span></a></li>";
		// content += 					"<li role='media'><a><span>语音<span></span></span></a></li>";
		// content += 					"<li role='video'><a><span>视频<span></span></span></a></li>";
		content += 				"</ul>";
		content += 			"</div>";
		content += 			"<div class='tab-content'>";
		content += 				"<div class='tab-item tab-text' style='display:block;opacity:1;'>";
		content += 					"<input type='hidden' name='sendtype' value='text' />";
		content += 					"<table class='table'>";
		content += 						"<tbody>";
		content += 							"<tr>";
		content += 								"<td>";
		content += 									"<textarea style='height:120px' name='content' class='form-control reply_con' placeholder='请输入要发送的内容 可以用{USERNAME}代替用户名称实现个性化推送。' ></textarea>";
		content += 								"</td>";
		content += 							"</tr>";

		content += 							"<tr>";
		content += 								"<td class='dis_emoji'>";
		content += 									"<i class='fa fa-smile-o' style='font-size:22px;'></i>";
		content += 								"</td>";
		content += 							"</tr>";
		content += 							"<tr>";
		content += 								"<td class='emoji_list' style='display:none;'>";
		content += 									emoji && emoji();
		content += 								"</td>";
		content += 							"</tr>";

		content += 						"</tbody>";
		content += 					"</table>";
		content += 				"</div>";
		content += 				"<div class='tab-item tab-photo'>";
		content += 					"<table class='table'>";
		content += 						"<tbody>";
		content += 							"<tr>";
		content += 								"<td>";
		content += 									"<input type='file' name='photo' class='form-control' />";
		content += 								"</td>";
		content += 							"</tr>";
		content += 						"</tbody>";
		content += 					"</table>";
		content += 				"</div>";
		content += 				"<div class='tab-item tab-news'>";
		content += 					"<table class='table'>";
		content += 						"<tbody>";
		content += 							"<tr>";
		content += 								"<td class='newslist'>";
		content += 									news;
		content += 								"</td>";
		content += 							"</tr>";
		content += 						"</tbody>";
		content += 					"</table>";
		content += 				"</div>";
		content += 				"<div class='tab-item tab-music'>";
		content += 					"<table class='table'>";
		content += 						"<tbody>";
		content += 							"<tr>";
		content += 								"<td>";
		content += 									"<input type='file' name='music' class='form-control' />";
		content += 								"</td>";
		content += 							"</tr>";
		content += 						"</tbody>";
		content += 					"</table>";
		content += 				"</div>";
		content += 				"<div class='tab-item tab-media'>";
		content += 					"<table class='table'>";
		content += 						"<tbody>";
		content += 							"<tr>";
		content += 								"<td>";
		content += 									"<input type='file' name='media' class='form-control' />";
		content += 								"</td>";
		content += 							"</tr>";
		content += 						"</tbody>";
		content += 					"</table>";
		content += 				"</div>";
		content += 				"<div class='tab-item tab-video'>";
		content += 					"<table class='table'>";
		content += 						"<tbody>";
		content += 							"<tr>";
		content += 								"<td>";
		content += 									"<input type='file' name='video' class='form-control' />";
		content += 								"</td>";
		content += 							"</tr>";
		content += 						"</tbody>";
		content += 					"</table>";
		content += 				"</div>";
		content += 			"</div>";
	return content;
},
tabEvent = function(form){
	$(".nav-tabs li",form).click(function(event){
		var role=this.getAttribute("role");
		$("input[name=sendtype]",form).val(role);
		var tabCon = $(this).parents(".input-group").find(".tab-content");
		var tab = $(this).parent();
		if(this.className.search(/active/g)<0){
			tab.find("li").removeClass("active");
			$(this).addClass("active");
			$(".tab-item",tabCon).hide();
			$(".tab-item",tabCon).css("opacity","0");
			$(".tab-"+role,tabCon).show();
			$(".tab-"+role,tabCon).css("opacity","1");
		}
	});
},
getPushList = function(form){
	$.ajax({
		url:"api.php?module=push",
		type:"get",
		dataType:"json",
		success:function(data){
			if(data && data.length>0){
				var str = "";
				for(var i=0;i<data.length;i++){
					var d = data[i];
					str += "<div class='input-group'>";
					str +=		"<span class='input-group-addon'>";
					str +=			"<input type='checkbox' name='id[]' checked value='"+d.id+"' />";
					str += 		"</span>";
					str +=		"<div class='form-control'>"+d.title+"</div>";
					str += "</div>";
				}
				$(".newslist",form).html("");
				var list = $(str).appendTo($(".newslist",form));
				list.click(function(event){
					var checkbox = $(this).find("input[type=checkbox]"),
						checked = checkbox[0].checked;
					if(event.target.nodeName.toLowerCase()!="input"){
						checkbox.click();
					}
				});
			}
		}
	});
};
function showsearchbox(id,from)
{
	Dialog({
		title : "搜索产品",
		content : addProductDialogCon(),
		css : "adduserDialog",
		beforeClick : function(form){
			pids.splice(0,pids.length);
			ptitles.splice(0,ptitles.length);
			pvals.splice(0,pvals.length);
			$("#sProduct",form).keyup(function(event){
				event.preventDefault();
				var kw = $("#sProduct").val();
				if(kw != ""){
					searchProduct(kw,from,form);
				}
			});
			$(".btn-flat",form).click(function(event){
				event.preventDefault();
				var kw = $("#sProduct").val();
				if(kw != ""){
					searchProduct(kw,from,form);
				}
			});
		},
		okCallback : function(form,callback){
			if(pids.length==0){
				tipsBox("请选择产品",1000,true);
			}else{
				console.log(pids);

				$("#add_"+id).val(pids[0]);
				$("#add_productname").val(ptitles[0]);
				if(from=='supplierproduct')
				{
					$.ajax({
						url:"/mobile/ajax/api.php?action=view&module=product",
						data:{"id":pids[0]},
						type:"post",
						dataType:"json",
						success:function(ret){
							$("#add_special").val(ret.special);
							$("#add_commission").val(ret.commission);
							var percent = Number(ret.commission*100/ret.special);
							percent = percent.toFixed(2);
							$("#per_commission").html(percent+"%");
						}
					});
				}
				callback && callback();
			}
		}
	})
}
var gAudioContext = new AudioContext();
function fetchBlob(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.onload = function() {
            callback(this.response);
        };
        xhr.onerror = function() {
            alert('Failed to fetch ' + url);
        };
        xhr.send();
}
function readBlob(blob, callback) {
        var reader = new FileReader();
        reader.onload = function(e) {
            	var data = new Uint8Array(e.target.result);
            	callback(data);
        };
        reader.readAsArrayBuffer(blob);
}
function getAudioContext() {
        if (!gAudioContext) {
            gAudioContext = new AudioContext();
        }
        return gAudioContext;
}
function playPcm(samples) {
        var ctx = getAudioContext();
        var src = ctx.createBufferSource();
        var buffer = ctx.createBuffer(1, samples.length, 8000);
        if (buffer.copyToChannel) {
            	buffer.copyToChannel(samples, 0, 0)
        } else {
            	var channelBuffer = buffer.getChannelData(0);
            	channelBuffer.set(samples);
        }
        src.buffer = buffer;
        src.connect(ctx.destination);
        src.start();
}
function playAmrArray(array) {
        var samples = AMR.decode(array);
        if (!samples) {
            alert('Failed to decode!');
            return;
        }
        playPcm(samples);
}
function playAmrBlob(blob, callback) {
        readBlob(blob, function(data) {
            	playAmrArray(data);
        });
}
(function(f) {
    jQuery.fn.extend({slimScroll: function(h) {
            var a = f.extend({width: "auto", height: "250px", size: "7px", color: "#000", position: "right", distance: "1px", start: "top", opacity: 0.4, alwaysVisible: !1, disableFadeOut: !1, railVisible: !1, railColor: "#333", railOpacity: 0.2, railDraggable: !0, railClass: "slimScrollRail", barClass: "slimScrollBar", wrapperClass: "slimScrollDiv", allowPageScroll: !1, wheelStep: 20, touchScrollStep: 200, borderRadius: "0px", railBorderRadius: "0px"}, h);
            this.each(function() {
                function r(d) {
                    if (s) {
                        d = d ||
                                window.event;
                        var c = 0;
                        d.wheelDelta && (c = -d.wheelDelta / 120);
                        d.detail && (c = d.detail / 3);
                        f(d.target || d.srcTarget || d.srcElement).closest("." + a.wrapperClass).is(b.parent()) && m(c, !0);
                        d.preventDefault && !k && d.preventDefault();
                        k || (d.returnValue = !1)
                    }
                }
                function m(d, f, h) {
                    k = !1;
                    var e = d, g = b.outerHeight() - c.outerHeight();
                    f && (e = parseInt(c.css("top")) + d * parseInt(a.wheelStep) / 100 * c.outerHeight(), e = Math.min(Math.max(e, 0), g), e = 0 < d ? Math.ceil(e) : Math.floor(e), c.css({top: e + "px"}));
                    l = parseInt(c.css("top")) / (b.outerHeight() - c.outerHeight());
                    e = l * (b[0].scrollHeight - b.outerHeight());
                    h && (e = d, d = e / b[0].scrollHeight * b.outerHeight(), d = Math.min(Math.max(d, 0), g), c.css({top: d + "px"}));
                    b.scrollTop(e);
                    b.trigger("slimscrolling", ~~e);
                    v();
                    p()
                }
                function C() {
                    window.addEventListener ? (this.addEventListener("DOMMouseScroll", r, !1), this.addEventListener("mousewheel", r, !1), this.addEventListener("MozMousePixelScroll", r, !1)) : document.attachEvent("onmousewheel", r)
                }
                function w() {
                    u = Math.max(b.outerHeight() / b[0].scrollHeight * b.outerHeight(), D);
                    c.css({height: u + "px"});
                    var a = u == b.outerHeight() ? "none" : "block";
                    c.css({display: a})
                }
                function v() {
                    w();
                    clearTimeout(A);
                    l == ~~l ? (k = a.allowPageScroll, B != l && b.trigger("slimscroll", 0 == ~~l ? "top" : "bottom")) : k = !1;
                    B = l;
                    u >= b.outerHeight() ? k = !0 : (c.stop(!0, !0).fadeIn("fast"), a.railVisible && g.stop(!0, !0).fadeIn("fast"))
                }
                function p() {
                    a.alwaysVisible || (A = setTimeout(function() {
                        a.disableFadeOut && s || (x || y) || (c.fadeOut("slow"), g.fadeOut("slow"))
                    }, 1E3))
                }
                var s, x, y, A, z, u, l, B, D = 30, k = !1, b = f(this);
                if (b.parent().hasClass(a.wrapperClass)) {
                    var n = b.scrollTop(),
                            c = b.parent().find("." + a.barClass), g = b.parent().find("." + a.railClass);
                    w();
                    if (f.isPlainObject(h)) {
                        if ("height"in h && "auto" == h.height) {
                            b.parent().css("height", "auto");
                            b.css("height", "auto");
                            var q = b.parent().parent().height();
                            b.parent().css("height", q);
                            b.css("height", q)
                        }
                        if ("scrollTo"in h)
                            n = parseInt(a.scrollTo);
                        else if ("scrollBy"in h)
                            n += parseInt(a.scrollBy);
                        else if ("destroy"in h) {
                            c.remove();
                            g.remove();
                            b.unwrap();
                            return
                        }
                        m(n, !1, !0)
                    }
                } else {
                    a.height = "auto" == a.height ? b.parent().height() : a.height;
                    n = f("<div></div>").addClass(a.wrapperClass).css({position: "relative",
                        overflow: "hidden", width: a.width, height: a.height});
                    b.css({overflow: "hidden", width: a.width, height: a.height});
                    var g = f("<div></div>").addClass(a.railClass).css({width: a.size, height: "100%", position: "absolute", top: 0, display: a.alwaysVisible && a.railVisible ? "block" : "none", "border-radius": a.railBorderRadius, background: a.railColor, opacity: a.railOpacity, zIndex: 90}), c = f("<div></div>").addClass(a.barClass).css({background: a.color, width: a.size, position: "absolute", top: 0, opacity: a.opacity, display: a.alwaysVisible ?
                                "block" : "none", "border-radius": a.borderRadius, BorderRadius: a.borderRadius, MozBorderRadius: a.borderRadius, WebkitBorderRadius: a.borderRadius, zIndex: 99}), q = "right" == a.position ? {right: a.distance} : {left: a.distance};
                    g.css(q);
                    c.css(q);
                    b.wrap(n);
                    b.parent().append(c);
                    b.parent().append(g);
                    a.railDraggable && c.bind("mousedown", function(a) {
                        var b = f(document);
                        y = !0;
                        t = parseFloat(c.css("top"));
                        pageY = a.pageY;
                        b.bind("mousemove.slimscroll", function(a) {
                            currTop = t + a.pageY - pageY;
                            c.css("top", currTop);
                            m(0, c.position().top, !1)
                        });
                        b.bind("mouseup.slimscroll", function(a) {
                            y = !1;
                            p();
                            b.unbind(".slimscroll")
                        });
                        return!1
                    }).bind("selectstart.slimscroll", function(a) {
                        a.stopPropagation();
                        a.preventDefault();
                        return!1
                    });
                    g.hover(function() {
                        v()
                    }, function() {
                        p()
                    });
                    c.hover(function() {
                        x = !0
                    }, function() {
                        x = !1
                    });
                    b.hover(function() {
                        s = !0;
                        v();
                        p()
                    }, function() {
                        s = !1;
                        p()
                    });
                    b.bind("touchstart", function(a, b) {
                        a.originalEvent.touches.length && (z = a.originalEvent.touches[0].pageY)
                    });
                    b.bind("touchmove", function(b) {
                        k || b.originalEvent.preventDefault();
                        b.originalEvent.touches.length &&
                                (m((z - b.originalEvent.touches[0].pageY) / a.touchScrollStep, !0), z = b.originalEvent.touches[0].pageY)
                    });
                    w();
                    "bottom" === a.start ? (c.css({top: b.outerHeight() - c.outerHeight()}), m(0, !0)) : "top" !== a.start && (m(f(a.start).position().top, null, !0), a.alwaysVisible || c.hide());
                    C()
                }
            });
            return this
        }});
    jQuery.fn.extend({slimscroll: jQuery.fn.slimScroll})
})(jQuery);

(function($) {
    "use strict";

    $.fn.tree = function() {
        return this.each(function() {
            var btn = $(this).children("a").first();
            var menu = $(this).children(".treeview-menu").first();
            var isActive = $(this).hasClass('active');

            //initialize already active menus
            if (isActive) {
                menu.show();
                btn.children(".fa-angle-left").first().removeClass("fa-angle-left").addClass("fa-angle-down");
            }
            //Slide open or close the menu on link click
            btn.click(function(e) {
                e.preventDefault();
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
    };
}(jQuery));
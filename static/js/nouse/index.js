window.onload=function()
{
	var homeUrl;
	if(typeof httpurl == undefined || typeof httpurl == "undefined"){
		var cur_domain = document.domain;
		homeUrl= cur_domain+"/admin/";
	}else{
		homeUrl= httpurl+"/admin/";
	}
	window.addEventListener('popstate', function(e){
	 	if (history.state){
	 		var state = e.state;
	 		if(state){
				if(state.url==homeUrl || state.url==homeUrl+"index.php"){
					location.href=homeUrl;
				}else{
					var backurl = "admin.php"+state.url.substr(state.url.indexOf("?"));
					menuclick(backurl,true);
				}
			}
	 	}
	}, false);
	if(location.href==homeUrl || location.href==homeUrl+"index.php"){
		if(!window.history.state || (window.history.state.url.replace(httpurl+"/admin/","") != homeUrl.replace(httpurl+"/admin/",""))){
			window.history.pushState({url:homeUrl}, document.title, homeUrl);
		}
	}
	$(".sidebar .menu-tabs li").click(function(event){
		var cur = this,
		    role = cur.getAttribute("role");
		if(!$(cur).hasClass("active")){
			$(".sidebar .menu-tabs li").removeClass("active");
			$(cur).addClass("active");
			$(".sidebar-menu").hide();
			$(".sidebar-menu[role="+role+"]").show();
		}
	});
	$.ajax({
		url:"admin.php?action=menu&module=admincp",
		type:"get",
		dataType:"html",
		success:function(data){
			//alert(data);
			// tt = '<li class="treeview"><a href="#"><i class="fa fa-folder"></i> <span>例子</span><i class="fa fa-angle-left pull-right"></i></a><ul class="treeview-menu"><li><a href="/admin1/pages/examples/invoice.php"><i class="fa fa-angle-double-right"></i> Invoice</a></li><li><a href="/admin1/pages/examples/login.php"><i class="fa fa-angle-double-right"></i> Login</a></li><li><a href="/admin1/pages/examples/register.php"><i class="fa fa-angle-double-right"></i> Register</a></li><li><a href="/admin1/pages/examples/lockscreen.php"><i class="fa fa-angle-double-right"></i> Lockscreen</a></li><li><a href="/admin1/pages/examples/404.php"><i class="fa fa-angle-double-right"></i> 404 Error</a></li><li><a href="/admin1/pages/examples/500.php"><i class="fa fa-angle-double-right"></i> 500 Error</a></li><li><a href="/admin1/pages/examples/blank.php"><i class="fa fa-angle-double-right"></i> Blank Page</a></li></ul></li>';
			$('#adminmenu').html(data);
			//$("#adminmenu .treeview").tree();
			$("#adminmenu .treeview").each(function() {
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
			$("#adminmenu .treeview a").click(function(event){
				event.preventDefault();
				var url=this.getAttribute("href");
				if(url!="#" && url!=""){
					var newurl = "index.php"+url.substr(url.indexOf("?"));
					var state = {
						url: newurl
					};
					if(!window.history.state || (window.history.state.url.replace(httpurl+"/admin/","") != newurl.replace(httpurl+"/admin/",""))){
						window.history.pushState(state, document.title, newurl);
					}
					menuclick(url,true,true);
				}
			});
			bindAclick();
			var module=getParamByStr("module");
			var action=getParamByStr("action");
			if(module && action)
			{
				var curlocation = window.location.href;
				var state = {
					url: curlocation
				};
				if(!window.history.state || (window.history.state.url.replace(httpurl+"/admin/","") != curlocation.replace(httpurl+"/admin/",""))){
					window.history.pushState(state, document.title, curlocation);
				}
				curlocation = curlocation.substr(curlocation.lastIndexOf('?'));
				menuclick('admin.php'+curlocation);
			}

			$("#adminmenu .p_menu").click(function(event){
				event.preventDefault();
				var curLi = this;
				var next = nextNode(curLi,"li");
				var isPmenu = false;
				while(next){
					if($(next).hasClass("treeview active")){
						$(next).find(">a").click();
					}else if($(next).hasClass("p_menu")){
						next = null;
						break;
					}else{
						next = nextNode(next,"li");
					}
				}
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
			});
		}
	});

	$('#search-btn').click(function(event){
		event.preventDefault();
		var keyword = $('#q').val();
		var params="?action=search&module=site&keyword="+keyword;
		var url = "admin.php"+params,
			newurl = "index.php"+params;
		var state = {
			url: newurl
		};
		if(!window.history.state || (window.history.state.url.replace(httpurl+"/admin/","") != newurl.replace(httpurl+"/admin/",""))){
			window.history.pushState(state, document.title, newurl);
		}
		menuclick(url,true);

		var ua = navigator.userAgent.toLowerCase();
		var isMobile = ua.match(/iPhone|iPad|iPod|Android|IEMobile/i);
		if(isMobile){
			$("[data-toggle='offcanvas']").click();
		}
		$("#searcharea").hide();
	});

	bindAclick();
	$("#logout").click(function(event){
		event.preventDefault();
		$.ajax({
			type: "GET",
			url: '../mobile/ajax/user.php?action=logout',
			dataType:"json",
			success: function(data){
				if(data=='1'){
					tipsBox("退出中", 1000);
					setTimeout(function(){
						document.location.href="index.php";
					} , 1000 );

				}else{
					tipsBox("退出失败", 2000);
				}
			}
		});
	});
	$("#login").click(function(event){
		event.preventDefault();
		var username=$('#u_username').val(),password=$('#u_password').val();
		if(username=='' || password==''){
			tipsBox("用户名密码不能为空", 2000);
		}else{
			$("#login_form").ajaxSubmit({
				url:"/mobile/ajax/user.php?action=login",
				data:{u_password:basePwd(username,password)},
				type:"post",
				dataType:"json",
				success:function(data){
					//-1 为已经登录
					if(data.flag == 1 ){
						tipsBox('登录成功', 2000);
						setTimeout(function(){
							document.location.href="index.php";
						} , 2000 );
					}else{
						tipsBox(data.error, 2000);
						$('#u_username').focus();
					}
				}
			});
		}
	});
	$(".messages-menu").hide();
	$(".notifications-menu").hide();
	var userMsgCount=0,sysMsgCount=0,wxMsgCount=3;
	if(userMsgCount){
		$(".messages-menu").show();
	}
	if(sysMsgCount){
		$(".notifications-menu").show();
	}
	function disMsg(){
		$.ajax({
			url:'api.php?module=message',
			type:'get',
			dataType:"json",
			success:function(data){
				if(data.count){
					$(".tasks-menu .label-danger").show();
					$(".tasks-menu .label-danger").html(data.count);
				}
			}
		});
	}
	//setInterval(disMsg,120000);
	disMsg();

	/*采集*/
	$("#fastInfo").click(function(event){
		event.preventDefault();

		//获取新闻分类
			$.ajax({
		url:'api.php?action=add&module=news',
		type:"get",
		dataType:"json",
		success:function(data){
				var content = "";
			content += "";
			content += '<div class="form-group">';
			content +=		'选择采集到的分类：<select id="news_select_index" name="classid"  ><option value=0 >qiqqqqq</option></select>';
			content += '</div>';
			content += '<div class="form-group">';
			content +=		'<input type="text" class="url_v" name="url[]" class="form-control" style="width:100%;" placeholder="请输入类似mp.weixin.qq.com链接地址..." />';
			content += '</div>';
			content += '<div class="form-group">';
			content +=		'<input type="file" name="photo" class="form-control" />';
			content += '</div>';
		Dialog({
			title : "快速发文",
			content : content,
			css : "fastDialog",
			beforeClick : function(form){
				var formData=data;
				formData.unshift({id:"-1",parentid:0,branch:0,title:"请选择"});
				$("#news_select_index").parent().find(".select-form").remove();;
				SelectTreeForm({
					element:$("#news_select_index"),
					data:formData,
					defaultvalue:"-1"
				});
				},
			okCallback : function(form,callback){
				var post_classid=$("#news_select_index").val();
				if(post_classid==''||post_classid==0||post_classid==-1)
				{
					tipsBox('请选择分类', 2000);
					return false;
				}
				var post_url=$(".url_v").val();
				if(post_url=='')
				{
					tipsBox('请填写地址', 2000);
					return false;
				}
				form.ajaxSubmit({
					url:'admin.php?action=fast&module=fast',
					type: 'post',
					dataType:"json",
					success:function(data)
					{
						console.log(data);
						tipsBox('采集成功', 2000);
					}
					})
				callback && callback();
			}
		});
		}
		})

	});
	$("#searchInfo").click(function(event){
		event.preventDefault();
		var searcharea = $("#searcharea");
		if(searcharea.is(":hidden")){
			searcharea.show();
		}else{
			searcharea.hide();
		}
	});

	$(".tab-title1 li").click(function(event){
		event.preventDefault();
		var curLi = this;
		var target = event.target;
		var role = curLi.getAttribute("role");
		var cons = $(".tab-title1").parent().find(".tab-content1");
		var curCon = $(".tab-title1").parent().find(".tab-content1[role="+role+"]");
		if(!$(target).hasClass("active")){
			$(curLi).parent().find("li").removeClass("active");
			$(curLi).addClass("active");
			cons.hide();
			curCon.show();
		}
	});
	$(".tasks-help").click(function(event){
		event.preventDefault();
		var curmodule = getParamByStr("module"),
		curaction = getParamByStr("action"),
		curdomain = $(".helptemplate input[name=domain]").val(),
		workhtml = '<iframe src="http://weixin.qiyeplus.com/mobile/index/user.php?action=addwork&modules='+curmodule+'&actions='+curaction+'&domain='+curdomain+'" style="width:100%;height:100%;"></iframe>';
		$(".helptemplate .tab-tab3 iframe").remove();
		//$(".helptemplate .tab-tab3").append(workhtml);
		$.ajax({
			url:"http://weixin.qiyeplus.com/mobile/help.php?action="+curaction+"&module="+curmodule,
			type:"get",
			dataType:"jsonp",
			jsonp:"jsoncallback",
			success:function(data){
				var helptem = $('<div style="display:none;">'+$(".helptemplate").html()+'</div>').appendTo($("body"));
				if(data && data.length > 0){
					for(var i=0;i<data.length;i++){
						var d = data[i];
						if(d.type == "common"){
							var contem = $('<div style="display:none;">'+$(".helptemplate1").html()+'</div>').appendTo($("body"));
							contem.find(".distitle").html(d.title);
							contem.find(".discontent").html(nl2br(d.content));
							helptem.find(".tab-tab1").append(contem.html());
							contem.remove();
						}else if(d.type == "video"){
							var videotem = $('<div style="display:none;">'+$(".helptemplate2").html()+'</div>').appendTo($("body"));
							videotem.find(".myvideo").attr("src","http://weixin.qiyeplus.com"+d.url);
							helptem.find(".tab-tab2").append(videotem.html());
							videotem.remove();
						}
					}
				}
				Dialog({
					title : "系统帮助",
					content : helptem.html(),
					havfooter:false,
					css : "helpDialog",
					beforeClick :function(form){
						helptem.remove();
						form.find(".tab-content").height($(".helpDialog").height()-56-74);
						$('<iframe width="100%" height="100%" src="http://weixin.qiyeplus.com/mobile/index/service.php?action=view&module=message&id=25699&uid=802"></iframe>').appendTo(form.find(".tab-tab4"));
						$('<iframe src="http://weixin.qiyeplus.com/mobile/index/user.php?action=addwork&modules='+curmodule+'&actions='+curaction+'&domain='+curdomain+'" style="width:100%;height:100%;"></iframe>').appendTo(form.find(".tab-tab3"));
						form.find(".tab-tab3 input[name=modules]").val(getParamByStr("module"));
						form.find(".tab-tab3 input[name=actions]").val(getParamByStr("action"));
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
						$(".discon",form).click(function(event){
							event.preventDefault();
							var cur = $(this),
							hrefcon = cur.parent().find(".hrefcon");
							$(".helpDialog .hrefcon").hide();
							hrefcon.show();
						});
						form.find("video").each(function(){
							var cur = $(this),fwidth=1,fheight=1;
							if(cur.attr("width")){
							    	fwidth = parseFloat(cur.attr("width"));
							}else{
								fwidth = parseFloat(cur.css("width"));
							}
							if(cur.attr("height")){
								fheight = parseFloat(cur.attr("height"));
							}else{
								fheight = parseFloat(cur.css("height"));
							}
							//var disW = form.find(".tab-content").width(),
							//disH = disW*fheight/fwidth;
							var disH = $(".helpDialog").height()-56-74,
							disW = disH*fwidth/fheight;
							cur.attr("width",disW);
							cur.attr("height",disH);
							cur.css({width:disW,height:disH,"z-index":1,"overfow":"hidden"});
						});
						form.find(".subadvice").click(function(event){
							event.preventDefault();
							var curtabcon = form.find(".tab-tab3"),
							postdata = {
								"content":curtabcon.find("textarea").val(),
								"modules":curtabcon.find("input[name=modules]").val(),
								"actions":curtabcon.find("input[name=actions]").val()
							};
							loadingBox("处理中...");
							//form.ajaxSubmit({
							$.ajax({
								url:"http://weixin.qiyeplus.com/mobile/service.php?module=work&action=add",
								type:"post",
								data:postdata,
								dataType:"json",
								jsonp:"callback",
								success:function(ret){
									removeTipsBox();
									if(ret.flag == 1){
										tipsBox("成功",1000);
									}else{
										tipsBox(ret.error,2000);
									}
								}
							});
						});
					},
					okCallback : function(form,callback){
					}
				});
			}
		});
	});
}

function nl2br (str, is_xhtml) {
 var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
 return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
}
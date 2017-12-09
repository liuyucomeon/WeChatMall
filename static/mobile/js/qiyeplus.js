define(function(require, exports, module) {
	var jQuery = $ = require("jquery"),
		base = require("base"),
		wx = require("jweixin");
	base.prventPc();
	if (!Function.prototype.bind) {
		Function.prototype.bind = function(oThis) {
			if (typeof this !== 'function') {
				// closest thing possible to the ECMAScript 5
				// internal IsCallable function
				throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
			}

			var aArgs   = Array.prototype.slice.call(arguments, 1),
				fToBind = this,
				fNOP    = function() {},
				fBound  = function() {
					return fToBind.apply(this instanceof fNOP
							? this
							: oThis,
						aArgs.concat(Array.prototype.slice.call(arguments)));
				};

			if (this.prototype) {
				// Function.prototype doesn't have a prototype property
				fNOP.prototype = this.prototype;
			}
			fBound.prototype = new fNOP();
			return fBound;
		};
	}
	var Dom = Dom7,headPhotoClip = null,photoClip = null,showAjaxIndicator = true,
		wxIsConfig = false,wxData = {},
		DefaultViewport = '<meta id="DefaultViewport" name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, minimal-ui">',
		MobileViewport = '<meta id="MobileViewport" name="viewport" content="width=320, initial-scale=1, maximum-scale=1, user-scalable=no" servergenerated="true">',
		myApp = new Framework7({
			modalTitle: '企业+',
			router:true,
			animateNavBackIcon: true,
			hideToolbarOnPageScroll:false,
			template7Pages:true,
			initImagesLazyLoad:true,
			modalButtonOk: '确定',
			modalButtonCancel: '取消'
		}),
		mainView = myApp.addView('.view-main', {
			dynamicNavbar: true
		}),
		locationurl = location.href,
		separateindex = locationurl.indexOf("#"),
		ISBACK = false,BACKPAGE,msgInterval,mpmsgInterval,slotInterVal,playaudioInterval,wxInterval,holidayAudioInterval,
		doshare = false,
		isrecordviewtime = false,
		minviewtitme = 3,
		ws,areacodeData;
	var urlparams = base.getParam(),
		getindexurl = urlparams.indexurl;
	if(getindexurl){
		setTimeout(function(){
                        mainView.router.load({url:decodeURIComponent(decodeURIComponent(getindexurl))});
		},200);
	}else{
		if(separateindex < 0 || separateindex == locationurl.length-1){
			mainView.router.load({url:"user.php"});
		}
        }
	Dom(document).on('ajaxStart', function(e){
		if (e.detail.xhr.requestUrl.indexOf('autocomplete-languages.json') >= 0) {
			return;
		}
		if(showAjaxIndicator){
			myApp.showIndicator();
		}
	});
	Dom(document).on('ajaxComplete', function(e){
		if (e.detail.xhr.requestUrl.indexOf('autocomplete-languages.json') >= 0) {
			return;
		}
		if(showAjaxIndicator){
			myApp.hideIndicator();
		}
	});
	function disWxAddress(p){
		var timestamp = base.getTimestamp()+"",
			nonceStr = base.getRandomStr(),
			token = pcontainer.find("#token").val();
		var addrSign =function(){
			var ret = "accesstoken="+token+
				"&appid="+weixin_appid+
				"&noncestr="+nonceStr+
				"&timestamp="+timestamp+
				"&url="+location.href;
			return base.SHA1(ret);
		};
		WeixinJSBridge.invoke('editAddress', {
				"appId":weixin_appid+"",
				"scope":"jsapi_address",
				"signType":"sha1",
				"addrSign":addrSign()+"",
				"timeStamp": timestamp+"",
				"nonceStr":nonceStr+"",
			}, function (res) {
				if(res.err_msg == "edit_address:ok"){
					var param = {
						"linkman":res.userName,
						"telephone":res.telNumber,
						"province":res.proviceFirstStageName,
						"city":res.addressCitySecondStageName,
						"counties":res.addressCountiesThirdStageName,
						"address":res.addressDetailInfo
					};
					$.ajax({
						url:"/mobile/ajax/shop.php?action=address&do=add",
						data:param,
						type:"post",
						dataType:"json",
						success:function(data){
							if(data.flag==1){
								param.id = data.id;
								base.setPageData(param,{
									curtemplate : p.curtemplate,
									scrollList : p.scrollList,
									pname : p.pname,
									container:p.pcontainer
								});
							}
						}
					});
				}
			}
		);
	}
	function handlePageData(d,container,pname,curtemplate){
		var curitem = curtemplate.find(".scroll_item");
		if(pname == "storeshoporder" || pname == "orders" || pname == "agencyorder"){
                        if(pname == "orders"){
                                if(d.backflag==0||d.backflag==150){
                                        var controlarea = curtemplate.find(".controlarea");
                                        base.setDishref(controlarea,d);
                                        if(d.flag=="1"){
                                                controlarea.find(".btn[role=flag1]").removeClass("hide");
                                        }else if(d.flag==2){
                                                if(d.module != "creditproduct"){
                                                        controlarea.find(".btn[role=flag2]").removeClass("hide");
                                                }
                                        }else if(d.flag==3){
                                                controlarea.find(".btn[role=flag3]").removeClass("hide");
                                        }else if(d.flag==4 && d.backflag==0){
                                                controlarea.find(".btn[role=flag4]").removeClass("hide");
                                        }
                                        controlarea.find(".btn.hide").remove();
                                        controlarea.find(".btn").removeAttr("role");
                                        if(curtemplate.find(".btn").length == 0){
                                                curtemplate.find(".controlarea").remove();
                                        }else{
                                                curtemplate.find(".controlarea").show();
                                        }
                                }
                        }
                        if(d.info && d.info.length > 0){
                                var insertafter = curitem.find(".insertafter");
                                base.taskData({
                                        data:d.info,
                                        handleFunction:function(p){
                                                return function(done){
                                                        base.createNewitem({
                                                                template:container.find(insertafter.attr("template")),
                                                                data:p,
                                                                area:insertafter,
                                                                insertType:"insertAfter",
                                                                container:container
                                                        });
                                                        done();
                                                }
                                        }
                                });
                        }
		}else if(pname == "credits" || pname == "share"){
			var credit = pname == "credits" ? d.credit+'' :d.credits+'',
				creditstr = credit.indexOf("-")<0 ? '+' : '';
			curtemplate.find(".discredit").html('金币'+creditstr+credit);
		}else if(pname == "agencyproduct"){
			if(d.commend == 1){
				curtemplate.find(".recomm").removeClass("recomm").addClass("delrecomm");
			}
		}
	}
	function operatorEvent(p){
		var id = p.id;
		$(".function_dig").click(function(event){
			event.preventDefault();
			base.ajax({
				myApp:myApp,
				url:"/mobile/ajax/api.php?action=comment&module=operator&edit=zan&id="+id,
				type:"post",
				success:function(ret){
					if(ret.flag == 1){
						base.tip("赞成功");
					}else{
						base.tip(ret.error);
					}
				}
			});
		});
		$(".function_sign").click(function(){
			base.ajax({
				myApp:myApp,
				url:"/mobile/ajax/operation.php?action=signin&module=operator&id="+id,
				type:"post",
				success:function(ret){
					if(ret.flag==1){
						base.tip("签到成功");
					}else{
						base.tip(ret.error);
					}
				}
			});
		});
		$(".function_shang").click(function(event){
			myApp.prompt('请输入打赏金额，不能低于<span class="color-red">1.00</span>元','',function(value){
				base.ajax({
					myApp:myApp,
					url:"/mobile/ajax/shop.php?action=gratuity",
					data:{id:id,money:value},
					type:"post",
					success:function(ret){
						if(ret.flag == 1){
							myApp.showIndicator();
							location.href='/mobile/ajax/pay.php?orderid='+ret.orderid;
						}else{
							base.tip(ret.error);
						}
					}
				});
			});
		});
	}
	function operatorSubscribe1(p){
		var pcontainer = p.pcontainer,
			havecontent = pcontainer.find("havecontent").val(),
			opercon = pcontainer.find(".opercon"),
			wH = window.innerHeight,
			toolbarH = topH = 0,
			curnavi = pcontainer.find(".naviarea");
		opercon.show();
		if($("#navitoolbar")[0] && curnavi[0] && base.trim(curnavi.html()) != ""){
			toolbarH = $("#navitoolbar").height();
		}
		if(havecontent == 1){
			if(pcontainer.find(".scene_top")[0]){
				topH = pcontainer.find(".scene_top").height();
			}
			pcontainer.find(".cont_t").css({height:(wH-topH-toolbarH-20)+"px"});
		}else{
			opercon.height(wH-toolbarH);
		}
	}
	function userCanvas(){
		var errorNum = parseInt(base.cookie("errorNum"));
		if(errorNum >= 10){
			base.tip("密码错误十次，请稍候再试");
		}else{
			var gesture = $("#admingesture").val(),
				hasGesture = !(gesture=='');
			if(myApp.device.android	 || myApp.device.ios){
				if(hasGesture){
					myApp.closePanel(".panel.panel-left");
					myApp.popup(".popup.admincanvas");
					var pwd = gesture,avatar = Dom(".admincanvas .avatar"),
						canvas = Dom("#adminCanvas");
					base.CanvasPwd({
						callback:function(sPwd,callback){
							var errorNum = parseInt(base.cookie("errorNum"));
							if(sPwd == pwd){
								base.cookie("errorNum",0);
								location.href = "/admin/index.php";
							}else{
								base.cookie("errorNum",errorNum+1,{expires:0.02});
								if(errorNum >= 10){
									base.tip("密码错误十次，请稍候再试",function(){
										myApp.closeModal(".popup.admincanvas");
									});
								}else{
									myApp.confirm("密码错误,忘记密码？","",function(){
										myApp.closeModal(".popup.admincanvas");
										mainView.router.load({url:"user.php?action=gesture&type=forget"});
									},function(){
										myApp.closeModal(".popup.admincanvas");
									});
								}
								errorNum++;
							}
						}
					});
				}else{
					myApp.confirm("您未设置手机密码,去设置","",function(){
						mainView.router.load({url:"user.php?action=gesture"});
					});
				}
			}else{
				location.href="/admin/index.php";
			}
		}
	}
	function ajaxListEvent(area,container){
		area.unbind("click").click(function(event){
			var node = event.target;
			while(node){
				var curtarget = $(node);
				if(node.nodeType === 1 && node.nodeName.toLowerCase() != 'a' && (curtarget.hasClass("ajax") || curtarget.parent().hasClass("ajax") || curtarget.parents(".ajax").length > 0)){
					event.preventDefault();
					var curnode = curtarget,
						curitem = curnode.parents(".scroll_item");
					var nodeurl = curnode.data("url"),
						nodechar = curnode.data("char"),
						chars,
						nodetype = curnode.data("type");
					if(nodeurl && nodeurl != ""){
						chars = nodechar.split(",");
						for(var j=0;j<chars.length;j++){
							var c = chars[j],
								cval = curnode.data(c);
							nodeurl +=  "&"+c+"="+cval;
						}
						if(nodetype == "window"){
							myApp.prompt("请输入内容","",function(value){
								base.ajax({
									myApp:myApp,
									url:nodeurl,
									data:{"message":value},
									type:"post",
									success:function(ret){
										base.tip(ret.error,1500,function(){
											if(ret.removeit){
												curitem.remove();
											}
										});
									}
								});
							});
						}else if(nodetype == "share"){
							handleShare({
								container:container,
                                                                listparams:scrollListparams,
								moduleid:curitem.attr("itemid"),
								ajaxurl:nodeurl
							})
						}else if(nodetype == "link"){
							mainView.router.load({url:nodeurl});
						}else{
							base.ajax({
								myApp:myApp,
								url:nodeurl,
								type:"post",
								success:function(ret){
									base.tip(ret.error,1500,function(){
										if(ret.removeit){
											curitem.remove();
										}
									});
								}
							});
						}
					}
					break;
				}
				node = node.parentNode;
			}
		});
	}
	function handleShare(os){
		var container = os.container,
			curmodule = os.module,
			curmoduleid = os.moduleid,
			ajaxurl = os.ajaxurl,
			sharetemplate = os.container.find(".sharetemplate"),
			pushmsgids = [],
                        listparams = os.listparams;
		if(sharetemplate[0]) {
			var curmodal = base.getPopup(myApp,sharetemplate,"share-popUp"),
				leftarea = curmodal.find(".leftclass"),
				activetype = leftarea.find(".item.active").attr("role"),
				activeurl = leftarea.find(".item.active").attr("ajaxurl"),
				curappendarea = curmodal.find(".appendarea"),
				appendtemplate = container.find(curappendarea.attr("template")),
				checkall = curmodal.find(".checkall");
			checkall.click(function(event){
				event.preventDefault();
				var curinput = checkall.find("input"),
					curchecked = curinput[0].checked;
				curappendarea.find("input").each(function(){
					if(this.checked == curchecked){
						this.checked = !curchecked;
					}
				});
				curinput[0].checked = !curchecked;
			});
			curappendarea.click(function(event){
				var node = event.target;
				while(node){
					var curitem = $(node);
					if(node.nodeType === 1 && curitem.hasClass("scroll_item")){
						event.preventDefault();
						var curinput = curitem.find("input");
						if(curinput[0].checked){
							checkall.find("input")[0].checked = false;
						}
						curinput[0].checked = !curinput[0].checked;
					}
					node = node.parentNode;
				}
			});
			function getrightCon(url,curtype){
				base.getJSON({
					url:url,
					success:function(data){
						var td = data.data ? data.data : data;
						base.taskData({
							data:td,
							handleFunction : function(d){
								return function(done){
									if(!curappendarea.find(".scroll_item[id="+d.id+"]")[0]){
										var newtmp = base.getNewTemplate(appendtemplate,container),
											curitem = newtmp.find(".scroll_item").appendTo(curappendarea);
										newtmp.remove();
                                                                                curitem.data("data",d);
										curitem.attr("id",d.id);
										base.setDisinfo(d,curitem);
										curitem.find("input").attr("value",d.id);
										if(curtype == "members" || curtype == "customer"){
											curitem.find("input").attr("name","touid[]");
										}else if(curtype == "meeting"){
											curitem.find("input").attr("name","meetingid[]");
										}
									}
									done();
								}
							}
						});
					}
				});
			}
			getrightCon(activeurl,activetype);
			leftarea.click(function(event){
				var node = event.target;
				while(node){
					var curitem = $(node);
					if(node.nodeType === 1 && curitem.hasClass("item") && !curitem.hasClass("active")){
						leftarea.find(".active").removeClass("active");
						curitem.addClass("active");
						curappendarea.html("");
						checkall.find("input")[0].checked = false;
						getrightCon(curitem.attr("ajaxurl"),curitem.attr("role"));
					}
					node = node.parentNode;
				}
			});
			base.searchEvent({
				myApp:myApp,
				container:container,
                                element:curmodal.find(".searchbar"),
                                resultarea:curmodal.find(".appendarea"),
                                listparams:os.listparams,
				callback:function(d,curitem){
                                        var nowitem = leftarea.find(".item.active"),
						curtype = nowitem.attr("role");
                                        if(curtype == "members" || curtype == "customer"){
                                                curitem.find("input").attr("name","touid[]");
                                        }else if(curtype == "meeting"){
                                                curitem.find("input").attr("name","meetingid[]");
                                        }
				},
                                searchCallback:function(resultarea,ajaxparams){
                                        resultarea.html("");
                                        checkall.find("input")[0].checked = false;
                                        var nowitem = leftarea.find(".item.active");
                                        ajaxparams.geturl = nowitem.attr("ajaxurl");
				}
			});
			curmodal.find(".btn-sub").click(function (event) {
                                var nowitem = leftarea.find(".item.active"),
                                        curpostdata = {"type":nowitem.attr("role"),"id":curmoduleid};
				if(ajaxurl){
					if(curmodule){
						curpostdata["module"] = curmodule;
					}
					base.ajaxSubmit({
						myApp: myApp,
						form: curmodal.find("form"),
						url: ajaxurl,
						data:curpostdata,
						success: function (ret) {
							if (ret.flag == 1) {
								base.tip("成功");
								myApp.closeModal(curmodal);
							} else {
								base.tip(ret.error, 1500);
							}
						}
					});
                                }else{
					os.callback && os.callback(nowitem.attr("role"),curappendarea,curmodal);
				}
			});
		}
	}
	function handleAddModule(os){
		var container = os.container,
			curmodule = os.module,
			element = os.element,
			beforeclick = os.beforeclick,
			callback = os.callback;
		var msgtemplate = container.find(".moduletemplate");
		if(msgtemplate[0]){
			if(msgtemplate.find(".leftclass .item").length == 0){
				var classindex = 0;
				base.getJSON({
					url:"ajax/service.php?module="+curmodule+"&action=cascade",
					async:false,
					success:function(data){
						if(data && data.length>0){
							base.taskData({
								data:data,
								handleFunction:function(d){
									return function(done){
										var classtmp = base.getNewTemplate(container.find(".classtemplate"),container);
										classtmp.find(".distitle").html(d.title);
										classtmp.find(".item").attr("id",d.id);
										classtmp.find(".item").attr("title",d.title);
										classtmp.find(".item").attr("havenext",d.havenext);
										classtmp.find(".item").attr("haveclass",d.haveclass);
										classtmp.find(".item").attr("haveitem",d.haveitem);
										if(classindex == 0){
											classtmp.find(".item").addClass("active");
										}
										msgtemplate.find(".leftclass").append(classtmp.html());
										classtmp.remove();
										classindex++;
										done();
									}
								}
							});
						}
					}
				});
			}
			var curmodal = base.getPopup(myApp,msgtemplate,"knowledgePopup"),
				classitems = curmodal.find(".leftclass .item"),
				resultarea = curmodal.find(".r-cell"),
				resultappend = resultarea.find(".appendarea"),
				curclassitem = curmodal.find(".item.active"),
				curclassid = curclassitem.attr("id");
			if(element){
				curmodal.data("element",element);
			}
			beforeclick && beforeclick(curmodal);
			function getCascadeNews(module,classid){
				resultappend.html("");
				var url = 'ajax/api.php?module='+module+'&action=list&pagestart=0&limit=20';
				if(classid){
					url += '&classid='+classid;
				}
				base.getJSON({
					url:url,
					success:function(data){
						if(data && data.length>0){
							base.taskData({
								data:data,
								handleFunction:function(d){
									return function(done){
										var newstmp = base.getNewTemplate(container.find(".moduleitemtemplate"),container);
										if(!resultappend.find(".scroll_item[itemid="+d.id+"]")[0]){
											var curitem = newstmp.find(".scroll_item").appendTo(resultappend);
											curitem.attr("itemid",d.id);
											curitem.find(".distitle").html(d.title);
											curitem.find("input").val(d.id);
											curitem.find("input").attr("value",d.id);
										}
										newstmp.remove();
										done();
									}
								}
							});
						}
					}
				});
			}
			function getCascade(cascade,classid){
				var url = "ajax/service.php?module="+curmodule+"&action=cascade&do="+cascade;
				if(classid){
					url += '&id='+classid;
				}
				base.getJSON({
					url:url,
					success:function(data){
						if(data && data.length>0){
							var selects = resultarea.find("select"),
								selectLen = selects.length,
								curselect = $("<select  class='no-fastclick'><option value='-1'>请选择</option></select>");
							if(selectLen == 0){
								curselect.prependTo(resultarea);
							}else{
								curselect.insertAfter(selects.eq(selectLen-1));
							}
							for(var i=0;i<data.length;i++){
								var d = data[i];
								curselect.append('<option value="'+d.id+'" haveclass="'+d.haveclass+'" haveitems="'+d.haveitems+'">'+d.title+'</option>');
							}
							curselect.change(function(){
								var curvalue = this.value,
									curoption = curselect.find("option:selected");
								curselect.next("select").remove();
								resultappend.html("");
								if(curvalue == "" || curvalue == "-1"){
								}else{
									if(curoption.attr("haveclass") == 1){
										getCascade(cascade,curvalue);
									}else{
										getCascadeNews(cascade,curvalue);
									}
								}
							});
						}
					}
				});
			}
			getCascade(curclassid);
			classitems.click(function(event){
				var cur = $(this);
				if(!cur.hasClass("active")){
					classitems.removeClass("active");
					cur.addClass("active");
					var curid = cur.attr("id"),
						haveclass = cur.attr("haveclass");
					resultarea.find("select").remove();
					resultappend.html("");
					if(haveclass == 1){
						getCascade(curid);
					}else{
						if(curid == "external"){
							resultappend.html(container.find(".externaltemplate").html());
						}else{
							getCascadeNews(curid);
						}
					}
				}
			});
			curmodal.find(".kw").keyup(function(event){
				if(event.keyCode == 13){
					event.preventDefault();
					curmodal.find(".searchbar-cancel").click();
				}
			})
			curmodal.find(".searchbar-cancel").click(function(event){
				event.preventDefault();
				var kw = curmodal.find(".kw").val(),
					curcascade = curmodal.find(".leftclass .item.active").attr("id");
				if(base.trim(kw) != ""){
					base.ajax({
						myApp:myApp,
						url:"ajax/service.php?action=search&module="+curcascade,
						data:{keyword:kw},
						type:"post",
						success:function(ret){
							resultappend.html("");
							base.taskData({
								data : ret.data,
								handleFunction : function(d){
									return function(done){
										if(!curmodal.find(".list_item[itemid="+d.id+"]")[0]){
											var newtmp = base.getNewTemplate(container.find(".moduleitemtemplate"),container);
											newtmp.find(".distitle").html(d.title);
											newtmp.find("input").val(d.id);
											newtmp.find("input").attr("value",d.id);
											resultappend.append(newtmp.html());
											newtmp.remove();
										}
										done();
									}
								}
							});
						}
					});
				}
			});
			curmodal.find(".btn-sub").click(function(){
				var subform = curmodal.find(".subform"),
					checkeditem = subform.find("input:checked");
				if(!os.ignorecheck || typeof os.ignorecheck == 'undefined'){
					if(!checkeditem[0]){
						base.tip("请选择一项");
						return false;
					}
				}
				var activemodule = curmodal.find(".leftclass .item.active"),
					ckid = checkeditem.val(),
					cktitle = checkeditem.parent().find(".distitle").html(),
					modulename = activemodule.attr("id"),
					moduleid = ckid;
				if(element){
					var hideaddmoule = curmodal.data("element").parent().find("input[name=addmodule]"),
						hidemouduleid = curmodal.data("element").parent().find("input[name=moduleid]");
					curmodal.data("element").val(activemodule.attr("title")+"："+cktitle);
					hideaddmoule.val(activemodule.attr("id"));
					hidemouduleid.val(ckid);
				}
				if(callback){
					callback(curmodal,modulename,moduleid);
				}else{
					myApp.closeModal(curmodal);
				}
			});
		}
	}
	function handlePhotoitem(opt){
		var datalist = opt.datalist,
			hideInput = opt.hideInput,
			area = opt.area,
			insertBeforeArea = opt.insertBeforeArea,
			curitem = opt.curitem,
			container = opt.container,
			maxcount = opt.maxcount ? opt.maxcount : 9;
		if(datalist.length >= maxcount){
			insertBeforeArea.addClass("hide");
		}else{
			insertBeforeArea.removeClass("hide");
		}
		base.taskData({
			data:opt.data,
			handleFunction:function(d){
				return function(done){
					var returl = base.getPhoto(d);
					var phototmp = base.getNewTemplate(container.find(".template5"),container);
					phototmp.find("img").attr("src",returl);
					phototmp.find(".bg").css("background-image","url("+returl+")");
					var newt = $(phototmp.children()[0].outerHTML).insertBefore(insertBeforeArea);
					var curitemInputarea = curitem.find(".item-input");
					if(curitemInputarea.find(".bg").length == 0){
						$('<div class="bg" style="background-image:url('+returl+');"></div>').prependTo(curitemInputarea);
					}else{
						$('<div class="bg" style="background-image:url('+returl+');"></div>').insertAfter(curitemInputarea.find(".bg:last"));
					}
					newt.css("display","inline-block");
					phototmp.remove();
					hideInput.val(datalist.join(","));
					var curphotolist = area.find(".disphoto");
					newt.find(".delete").click(function(){
						var delitem = $(this).parent(),
							photos = newt.parent().find(".disphoto"),
							itemsphotos = curitem.find(".item-input .bg"),
							curindex = photos.index(newt);
						delitem.remove();
						$(itemsphotos.eq(curindex)).remove();
						datalist.splice(curindex,1);
						hideInput.val(datalist.join(","));
						if(datalist.length >= maxcount){
							insertBeforeArea.addClass("hide");
						}else{
							insertBeforeArea.removeClass("hide");
						}
					});
					done();
				}
			},
			callback:function(){
				if(datalist.length >= maxcount){
					insertBeforeArea.addClass("hide");
				}else{
					insertBeforeArea.removeClass("hide");
				}
			}
		});
	}
	function clearAllInterval(){
		clearInterval(msgInterval);
		clearInterval(mpmsgInterval);
		clearInterval(slotInterVal);
		clearInterval(playaudioInterval);
		clearInterval(wxInterval);
	}
	Dom(document).on('pageBack', function (e) {
		ISBACK = true;
	});
	Dom(document).on('pageAfterBack', function (e) {
		ISBACK = true;
	});
	Dom(document).on('pageInit', function (e) {
		var page = e.detail.page,
			activePage = mainView.activePage,
			pcontainer = $(activePage.container),
			pname = activePage.name,
			params = base.getParam(),
			fromPage = activePage.fromPage.container,
			navitoolbar;
		if(fromPage){
			fromPage = $(fromPage);
			var pauseAudio = fromPage.find("audio");
			if(pauseAudio[0] && activePage.fromPage.name != pname){
				pauseAudio.each(function(){
					var cur = $(this),
						curaudio = cur.data("audio");
					if(curaudio){
						curaudio.pause();
					}else{
						this.pause();
					}
					cur.parent().removeClass("on");
				});
			}
			if(base.isAndroid()){
				fromPage.find("iframe").each(function(){
					var datasrc = this.getAttribute("data-src");
					if(datasrc){
						this.src = "";
					}
				});
			}
		}
		if(pname){
                        $("#scene_eqxiu").remove();
			pcontainer.find("iframe").each(function(){
				var datasrc = this.getAttribute("data-src");
				if(datasrc){
					this.src = datasrc;
				}
			});
			pcontainer.find("select").addClass("no-fastclick");
			if(websocket && websocket.readyState == 1){
				var saydata = {'type':"pageInit",'from_uid':myuid,"englishname":englishname,room_id:httpurl.toLowerCase().replace("http:\/\/","")+"-index"};
				if(pcontainer.find("#socket")[0]){
					var saymodule = pname;
					if(pcontainer.find("#module")[0]){
						saymodule = pcontainer.find("#module").val();
					}
					saydata['module'] = saymodule;
					saydata['moduleid'] = params.id;
					if(pname == "product"){
						saydata['moduleid'] = pcontainer.find("#productid").val();
					}
				}
				websocket.send(JSON.stringify(saydata));
			}
			clearAllInterval();
			$(".bodylayer").remove();
			if(pcontainer.find("#share_title")[0]){
				base.handleInit(pcontainer,ISBACK);
				navitoolbar = $("#navitoolbar");
			}
			if(base.isMobile() && pcontainer.find("#handlewx").val() != "false" && pcontainer.find("#share_title").val() !="" && pcontainer.find("#share_url").val() !="") {
				doshare = true;
				wxData = {
					appId : weixin_appid,
					title : pcontainer.find("#share_title").val(),
					link : pcontainer.find("#share_url").val(),
					imgUrl : pcontainer.find("#share_photo").val(),
					desc : pcontainer.find("#share_desc").val(),
					timelineTitle : pcontainer.find("#share_timeline_title").val(),
					type: pcontainer.find("#share_type").val(),
					dataUrl: pcontainer.find("#share_dataUrl").val(),
				};
				if(params.sharehongbaoid){
					wxData.beforeShare = function(){
						alert("该信息不能分享，分享后不能领取奖励哦");
					}
				}
			}
			if(doshare){
				if(!window.WeixinJSBridge){
					wxInterval = setInterval(function () {
						if(window.WeixinJSBridge) {
							base.handlewx(myApp,wxData);
							wxIsConfig = true;
							clearInterval(wxInterval);
						}
					},200);
				}else{
					base.handlewx(myApp,wxData);
					wxIsConfig = true;
					clearInterval(wxInterval);
				}
			}

			if(pcontainer.find(".navbartemplate")[0]){
				$(".panel-right .appendarea").append(pcontainer.find(".navbartemplate").html());
				//open submenu
				$(".panel-right").on("click",".cd-nav .has-children a",function(event){
					event.preventDefault();
					var selected = $(this);
					if( selected.next('ul').hasClass('is-hidden') ) {
						selected.addClass('selected').next('ul').removeClass('is-hidden').end().parent('.has-children').parent('ul').addClass('moves-out');
						selected.parent('.has-children').siblings('.has-children').children('ul').addClass('is-hidden').end().children('a').removeClass('selected');
						$('.cd-overlay').addClass('is-visible');
					} else {
						selected.removeClass('selected').next('ul').addClass('is-hidden').end().parent('.has-children').parent('ul').removeClass('moves-out');
						$('.cd-overlay').removeClass('is-visible');
					}
				});
				$(".panel-right").on("click",".cd-nav .go-back",function(event){
					$(this).parent('ul').addClass('is-hidden').parent('.has-children').parent('ul').removeClass('moves-out');
				});
			}
			if(!ISBACK && pcontainer.find(".raindrops")[0]){
				require(["jquery-ui"],function(){
					require(["raindrops"],function(){
                                                pcontainer.find(".raindrops").each(function(){
                                                	var curdrops = $(this);
							var curouter = curdrops.parent(),
								rdcolor = curdrops.attr("color"),
								canvasWidth = curdrops.attr("w"),
								canvasHeight = curdrops.attr("h"),
								waveLength = curdrops.attr("wave"),
								dropparams = {};
							if(!rdcolor)rdcolor = "#fe834a";
							if(!canvasHeight)canvasHeight = 20;
							if(!waveLength)waveLength = 100;
							dropparams = {color:rdcolor,canvasWidth:canvasWidth,canvasHeight:canvasHeight*2,waveLength: 100,rightPadding:0};
							curouter.css({height:canvasHeight});
							curdrops.raindrops(dropparams);
						});
					});
				});
			}
			$("#subscribeOperator .appendarea").html("");
			if(pcontainer.find(".audioarea")[0]){
				var audioarea = pcontainer.find(".audioarea"),
					curaudio = audioarea.find("audio");
				playaudioInterval = setInterval(function(){
					if(curaudio[0].ended){
						clearInterval(playaudioInterval);
						audioarea.removeClass("playing");
					}
				},100);
				audioarea.unbind("click").click(function(){
					clearInterval(playaudioInterval);
					if(audioarea.hasClass("playing")){
						audioarea.removeClass("playing");
						curaudio[0].pause();
					}else{
						audioarea.addClass("playing");
						curaudio[0].play();
						playaudioInterval = setInterval(function(){
							if(curaudio[0].ended){
								clearInterval(playaudioInterval);
								audioarea.removeClass("playing");
							}
						},100);
					}
				});
			}
			var lazyimgs = pcontainer.find("*[data-url]");
                        if(lazyimgs.length > 0){
                                lazyimgs.each(function(){
                                	var cur = $(this),
                                                scrollcontainer = pcontainer.find(">.page-content");
                                	if(cur.attr("scrollarea")){
                                                scrollcontainer = pcontainer.find(cur.attr("scrollarea"));
					}
                                        base.handleScrollLoading(cur.parent(),scrollcontainer);
				});
                        }
			var pmodule = params.module,
				paction = params.action,
				inputModule = pcontainer.find("#module").val(),
				inputAction = pcontainer.find("#action").val(),
				actiontype = pcontainer.find("#actiontype").val(),
				infiniteScroll = pcontainer.find(".infinite-scroll"),
				scrollList = pcontainer.find(".scroll_list"),
				scrollListparams = {
					myApp:myApp,
					postparams:params,
					getdata:{},
					pname:pname,
					container:pcontainer,
					scrollList:scrollList,
					infiniteScroll:infiniteScroll,
					loading:true,
					setPageData:base.setPageData,
					handlePageData:handlePageData,
					doneCallback:function(){this.loading=false;},
					emptytemplate:pcontainer.find(".emptytemplate"),
					successCallback:function(data){
						this.scrollList.find(".emptyitem").remove();
						if (this.infiniteScroll && this.infiniteScroll[0] && (!data || (this.getdata.limit && data.length < this.getdata.limit))){
							myApp.detachInfiniteScroll(this.infiniteScroll);
						}
						if(this.emptytemplate && this.emptytemplate[0] && this.scrollList.find(".scroll_item").length==0){
							this.scrollList.append(this.emptytemplate.html());
						}
					}
				},
				initparams = {
					myApp:myApp,
					pname:pname,
					pcontainer:pcontainer,
					params:params,
					ISBACK:ISBACK,
					scrollList:scrollList,
					infiniteScroll:infiniteScroll,
					mainView:mainView,
					wx:wx,
					wxData:wxData,
					wxIsConfig:wxIsConfig,
					scrollListparams : scrollListparams
				};
			if(havecustom){
				require(["custom"],function(custom){
					custom.pageInit(initparams);
				});
			}
			if(pname.indexOf("community") > -1){
				require(["community"],function(community){
					community.pageInit(initparams);
				});
			}
			if(pname.indexOf("meeting") > -1){
				initparams["wx"] = wx;
				initparams["wxData"] = wxData;
				initparams["wxIsConfig"] = wxIsConfig;
				require(["meeting"],function(Meeting){
					Meeting.pageInit(initparams);
				});
			}
			if(projectjs == 1){
				require(["plugin/project"],function(project){
					project.pageInit(initparams);
				});
			}
			if(window.SETTING){
				for(var k in window.SETTING){
					var dirval = window.SETTING[k];
					if(pname == k){
						require([dirval],function(pluginobj){
							pluginobj.pageInit(initparams);
						});
					}
				}
			}
			//活动页底部菜单处理
			var omenuarea = pcontainer.find("#operatorMenu");
			if(omenuarea[0] && base.trim(omenuarea.html()) != ""){
				$("body").append(omenuarea.html());
				$('.popover a').click(function() {
					myApp.closeModal('.popover');
				});
			}
			operatorEvent({id:params.id});
			//关闭所有打开着的弹层
			$(".popup").each(function(){
				var curpop = $(this);
				if(curpop.hasClass("modal-in")){
					myApp.closeModal(curpop);
				}
			});
			$(".prompt-modal").each(function(){
				var curpop = $(this);
				curpop.remove();
				$(".prompt-overlay").remove();
			});
			$("body").removeClass("sharenotify");
			//解决不能设置document.title的问题
			if(pcontainer.find("#webtitle")[0] && pcontainer.find("#webtitle").val()!=""){
				document.title = pcontainer.find("#webtitle").val();
				if(base.isIOS()){
					// hack在微信等webview中无法修改document.title的情况
					var iframe = $('<iframe src="/mobile/data/images/favicon.ico" style="display:none;"></iframe>');
					iframe.on('load',function() {
						setTimeout(function() {
							iframe.off('load').remove();
						}, 0);
					}).appendTo($('body'));
				}
			}
			var viewportInput = pcontainer.find("#viewport");
			if(viewportInput[0] && viewportInput.val()=="scene"){
				$("#DefaultViewport").remove();
				if(!$("#MobileViewport")[0]){
					$(MobileViewport).prependTo($("head"));
				}
			}else{
				$("#MobileViewport").remove();
				if(!$("#DefaultViewport")[0]){
					$(DefaultViewport).prependTo($("head"));
				}
			}
			if(location.href.indexOf("games.php") > -1 || location.href.indexOf("exam.php") > -1){
				require(["game"],function(Game){
					initparams["wxData"] = wxData;
					Game.pageInit(initparams);
				});
			}
			//打赏
			var gratuityuser = pcontainer.find(".gratuityuser");
			if(gratuityuser[0]){
				base.gratuityEvent({
					myApp:myApp,
					element:gratuityuser
				});
			}
			//收藏
			var favoritearea = pcontainer.find(".btnfavorite");
			if(favoritearea[0]){
				var favoriteid = pcontainer.find("#favoriteid").val();
				base.favoriteShop({
					pid : favoriteid ,
					module : inputModule,
					edit : "show",
					callback : function(data){
						if(data.flag==1){
							favoritearea.addClass("have");
						}else{
							favoritearea.addClass("none");
						}
						favoritearea.show();
					}
				});
				favoritearea.unbind("click").click(function(event){
					event.preventDefault();
					var cur = $(this),
						editstr = "";
					if(cur.hasClass("have")){
						editstr = "delete";
					}else if(cur.hasClass("none")){
						editstr = "add";
					}
					base.favoriteShop({
						pid : favoriteid ,
						module : inputModule,
						edit : editstr,
						callback : function(data){
							if(data.flag==1){
								if(cur.hasClass("have")){
									base.tip("取消收藏");
									cur.removeClass("have").addClass("none");
								}else if(cur.hasClass("none")){
									base.tip("收藏成功");
									cur.removeClass("none").addClass("have");
								}
							}else{
								base.tip(data.error);
							}
						}
					});
				});
			}
			if(SHARETIPS){
				$(".gold-info").each(function(){
					var curgold = $(this),
						disNum = parseInt(curgold.find(".coinattr").attr("coin")),
						disNumL = (disNum+"").length,
						numW=15,numH=30;
					curgold.find(".trans").html(base.createCoinNum(disNum+""));
					var tleft = (window.innerWidth - disNumL*numW)/2;
					curgold.find(".trans").css("left",tleft+"px");
				});
			}
			//客服
			$(".servicelink").unbind("click").click(function(event){
				event.preventDefault();
				var cur = $(this),
					frommodule = cur.attr("module"),
					frommoduleid = cur.attr("moduleid");
				base.ajax({
					myApp:myApp,
					url:"/mobile/ajax/misc.php?action=support&module="+frommodule+"&id="+frommoduleid,
					type:"post",
					success:function(data){
						if(data.flag == 1){
							mainView.router.load({url:"service.php?action=view&module=message&uid="+data.data+"&frommodule="+frommodule+"&moduleid="+frommoduleid});

						}else{
							base.tip(data.error);
						}
					}
				});
			});
			//服务中心底部消息字数
			if(pcontainer.find("#service")[0]){
				base.getJSON({
					url:"ajax/service.php?module=message&action=countmessage",
					success:function(d){
						if(d && d > 0){
							$("#navitoolbar .num").removeClass("hide");
							if(d > 99){
								$("#navitoolbar .num").html("99<sup>+</sup>");
								$("#navitoolbar .num").addClass("sup");
							}else{
								$("#navitoolbar .num").html(d);
							}
						}else{
							$("#navitoolbar .num").remove();
						}
					}
				});
			}
			pcontainer.find(".fixTipImg").unbind("click").click(function(){
				$(this).remove();;
			});
			pcontainer.find(".sign_box").unbind("click").click(function(){
				var cursign = $(this);
				if(!cursign.hasClass("ok")){
					base.ajax({
						myApp:myApp,
						url:"ajax/signin.php",
						success:function(ret){
							if(ret.flag == 1){
								$("#usercredit").html(ret.coinNew);
								cursign.addClass("ok");
								base.afterGoldinfo({myApp:myApp,modal:"signin",data:ret});
							}else{
								base.tip(ret.error);
							}
						}
					});
				}
			});
			pcontainer.find(".addcredit_box").unbind('click').click(function(){
				var curbox = $(this);
				base.prompt({
					myApp:myApp,
					title:"金币充值",
					text:pcontainer.find(curbox.attr("template")).html(),
					callbackOk:function(modal){
						var curmodal = modal.modal;
						base.ajaxSubmit({
							myApp:myApp,
							form:curmodal.find("form"),
							url:"ajax/api.php?module=hongbaotocredit&action=hongbaotocredit",
							success:function(data){
								if(data.flag == 1 && data.orderid){
									base.tip(data.error,function(){
										location.href='/mobile/ajax/pay.php?orderid='+data.orderid;
									});
								}else{
									base.tip(data.error);
								}
							}
						});
					}
				});
			});
			pcontainer.unbind("click").click(function(event){
				var node = event.target;
				while(node) {
					if (node.nodeType === 1){
                                                var curtarget = $(node);
						if(curtarget.hasClass("dig_div")){
							event.preventDefault();
							var curdig = $(node),
								digmodule = curdig.attr("module"),
								digid = curdig.attr("moduleid"),
								digurl = "ajax/api.php?action=dig&module="+digmodule+"&id="+digid;
							if(curdig.hasClass("diged")){
								digurl = "ajax/api.php?action=undig&module="+digmodule+"&id="+digid;
							}
							base.ajax({
								url:digurl,
								type:"post",
								success:function(ret){
									var numarea = curdig.find(".dig_num"),
										num = numarea.html() == "" ? 0 : parseInt(numarea.html());
									if(ret==1){
										if(curdig.hasClass("diged")){
											num = num-1 < 0 ? 0 : num-1;
											curdig.removeClass("diged");
											numarea.html(num);
										}else{
											curdig.addClass("diged");
											numarea.html(num+1);
										}
									}
								}
							});
							break;
                                                }else if(curtarget.parents(".commList")[0]){
							var curitem = curtarget.parents(".scroll_item"),
                                                                curitemid = curitem.attr("itemid");
                                                        if(curtarget.hasClass("pass")){
                                                                event.preventDefault();
                                                                myApp.confirm("确定要审批通过吗？","",function(){
                                                                        base.ajax({
                                                                                url:"/admin/admin.php?module=comments&action=moderate&id="+curitemid,
                                                                                type:"post",
                                                                                success:function(ret){
                                                                                        if(ret == 1){
                                                                                                curitem.find(".disusername .color-red").remove();
                                                                                                curitem.find(".censor").remove();
                                                                                        }else{
                                                                                                base.tip(ret);
                                                                                        }
                                                                                }
                                                                        });
                                                                });
                                                                break;
                                                        }else if(curtarget.hasClass("delete")){
                                                                event.preventDefault();
                                                                myApp.confirm("确定要删除吗？","",function(){
                                                                        base.ajax({
                                                                                url:"/admin/admin.php?module=comments&action=delete&id="+curitemid,
                                                                                type:"post",
                                                                                success:function(ret){
                                                                                        if(ret == 1){
                                                                                                curitem.remove();
                                                                                        }else{
                                                                                                base.tip(ret);
                                                                                        }
                                                                                }
                                                                        });
                                                                });
                                                                break;
                                                        }else if(curtarget.hasClass("replycomment")){
                                                                event.preventDefault();
                                                                mainView.router.load({url:"news.php?action=comment&module=comments&from=news&moduleid="+params.id+"&id="+curitemid+"&ntitle=回复评论"});
                                                                break;
                                                        }
						}
					}
					node = node.parentNode;
				}
			});
			$(".btn_ajaxSubmit").unbind("click").click(function(event){
				event.preventDefault();
				var curbtn = $(this),
					curform = pcontainer.find("#"+curbtn.attr("form")),
					suburl = curform.attr("action");
				if(!suburl || suburl == ""){
					suburl = "ajax/api.php?moudle=api&action="+paction;
				}
				if(pname == "service"){
					var pids = [];
					$(pcontainer).find(".list input[type=checkbox]").each(function(){
						var cur = $(this).parents(".scroll_item");
						if(this.checked){
							pids.push(cur.parents(".scroll_item").attr("pid"));
						}
					});
					pcontainer.find("#listid").val(pids.join(","));
				}else if(pname == "setproductprice"){
					var iscontinue = true;
					if(pcontainer.find(".optionsarea .optionitem").length > 0 && pcontainer.find(".optionsarea input:checked").length == 0){
						base.tip("至少选择一项");
						return false;
					}
				}else if(pname == "polls"){
					if(pcontainer.find(".answerlist input[type=checkbox]").length > 0 && pcontainer.find(".answerlist input[type=checkbox]:checked").length == 0){
						base.tip("至少选择一项");
						return false;
					}
				}
				var issubmit = base.checkRequired(curform);
				if(!issubmit){
					base.tip("必填项不能为空");
					return false;
				}
				base.ajaxSubmit({
					myApp:myApp,
					form:curform,
					url:suburl,
					success:function(data){
						if(data.flag == 1){
							var lasturl = pcontainer.find("#lasturl").val();
							base.tip(data.error,function(){
								if(data.orderid){
									location.href='/mobile/ajax/pay.php?orderid='+data.orderid;
								}else if(data.id){
									if(data.url){
										mainView.router.load({url:data.url});
									}else{
										if(pname == "addAddress" && lasturl && lasturl != ""){
											$("#haveaddress").val("haveaddress");
											mainView.router.load({url:lasturl});
										}else{
											mainView.router.load({url:"user.php?action=success"});
										}
									}
								}else{
									if(paction == "comment"){
										if(params.from){
											if(params.from == "news"){
												mainView.router.load({url:"news.php?id="+params.moduleid});
											}else if(params.from == "service"){
												if(params.id){
													mainView.router.load({url:"service.php?action=view&module="+pmodule+"&id="+params.id});
												}else{
													mainView.router.load({url:"service.php?action=view&module="+pmodule+"&id="+data.data});
												}
											}
										}else{
											history.go(-1);
										}
									}else if(pname == "operator_comments"){
										pcontainer.find("textarea[name=message]").val("");
									}else if(pname == "addAddress" && lasturl && lasturl != ""){
										$("#haveaddress").val("haveaddress");
										mainView.router.load({url:lasturl});
									}else if(pname == "bankcard"){
										myApp.showIndicator();
										mainView.router.load({url: "shopstore.php?action=myrevenue&module=" + pmodule});
									}else if(pname == "evaluate"){
										myApp.showIndicator();
										mainView.router.load({url:"user.php?action=orders&flag=4"});
									}else if(pname == "deliver"){
										myApp.showIndicator();
										mainView.router.load({url:"shopstore.php?action=storeshoporder&flag=0"});
									}else if(pname == "setdiscount"){
										myApp.showIndicator();
										mainView.router.load({url:"shopstore.php?action=discount"});
									}else if(pname == "setproductprice"){
										myApp.showIndicator();
										if (!params.isedit) {
											mainView.router.load({url: "shopstore.php?action=productmanager"});
										} else {
											mainView.router.load({url: "shopstore.php?action=storeproduct&moderate="+params.moderate});
										}
									}else{
										mainView.router.load({url:"user.php?action=success"});
									}
								}
							});
						}else{
							base.tip(data.error);
						}
					}
				});
			});
			//评论
			var commentslist = pcontainer.find("#commentslist");
			if(commentslist[0]){
				var viewarea = pcontainer.find(".viewarea"),
					curmodule = params.module,
					postviewdata = {"module":curmodule,"moduleid":params.id};
				if(!curmodule)curmodule = pcontainer.find("#module").val();
				base.viewBigImg(viewarea,myApp);
				if(curmodule == "teacher"){
					curmodule = "members";
				}
				var listparams = $.extend({}, scrollListparams),
					listtemplate = pcontainer.find(commentslist.attr("template")),
					commurl = "ajax/api.php?action=comment&edit=list&orderby=id&module="+curmodule;
				if(pcontainer.find("#service")[0] && pcontainer.find("#service").val() == "service"){
					commurl = "ajax/service.php?action=comment&type=list&orderby=id&module="+curmodule;
				}
				if(pcontainer.find("#moduleid")[0]){
					commurl += "&moduleid="+pcontainer.find("#moduleid").val();
				}else{
					commurl += "&moduleid="+params.id;
				}
				if(listparams.scrollList.attr("template")){
					listtemplate = pcontainer.find(listparams.scrollList.attr("template"));
				}
				listparams = $.extend(listparams,{
					geturl:commurl,
					getdata:{pagestart:0,limit:5},
					curtemplate:listtemplate,
					doneCallback:function(){listparams.loading=false;}
				});
				listparams.setcallback=function(d,ct){
					if(d.moderate == 0){
						ct.find(".censor").removeClass("hide");
						ct.find(".censor").find(".btn").attr("curid",d.id);
						ct.find(".replycomment").remove();
					}else{
						ct.find(".censor").remove();
						ct.find(".replycomment").removeClass("hide");
					}
					var replyarea = ct.find(".reply"),
						replytemplate = pcontainer.find(replyarea.attr("template"));
					if(replyarea[0] && d.comment && d.comment.length>0){
						base.taskData({
							data:d.comment,
							handleFunction:function(c){
								return function(done){
									var newtemplate1 = base.getNewTemplate(replytemplate,pcontainer);
									base.setDisinfo(c,newtemplate1);
									replyarea.append(newtemplate1.html());
									newtemplate1.remove();
									done();
								}
							}
						});
					}
				}
				function commlistScrollData1(){
					base.getListData(listparams);
					listparams.infiniteScroll.on('infinite', function() {
						if (listparams.loading) return;
						listparams.loading = true;
						listparams.getdata.pagestart = listparams.scrollList.find(".scroll_item").length - listparams.scrollList.find(".emptyitem").length;
						base.getListData(listparams);
					});
				}
				var isloadcomm = false;
				if(commentslist.find(".scroll_item").length == 0){
					if (viewarea.height() < window.innerHeight) {
						commlistScrollData1();
					} else {
						listparams.infiniteScroll.on('infinite', function () {
							if (!isloadcomm) {
								isloadcomm = true;
								commlistScrollData1();
							}
						});
					}
				}else{
					commentslist.find(".scroll_item").remove();
					commlistScrollData1();
				}
			}
			if(pcontainer.find("iframe")[0]){
				base.handleEleSize(pcontainer.find("iframe"));
			}
			if(pcontainer.find("embed")[0]){
				base.handleEleSize(pcontainer.find("embed"));
			}
			var shareuid = params.share_uid,
				useruid = pcontainer.find("#useruid").val();
			myApp.closeNotification(".sharetip");
			if(SHARETIPS && pcontainer.find("#sharenotify")[0]){
				if(shareuid && shareuid != useruid){
					var msgstr = '';
					if(params.sharehongbaoid){
						msgstr = '<span class="color-red" style="font-weight:bold;">往下看 红包在下面等你哦</span>';
					}
					base.getJSON({
						url:"ajax/api.php?action=getcredits&module="+inputModule,
						data:{id:params.id,uid:shareuid},
						success:function(data){
							if(data.username){
								$("body").addClass("sharenotify");
								myApp.addNotification({
									title: data.username+'推荐',
									subtitle: '分享信息获得了 '+(data.credits ? data.credits : "")+' 金币',
									message: msgstr,
									media:'<img src="'+base.getAvatar(shareuid)+'" onerror="javascript:this.src=\''+DEFAULT_AVATAR+'\';" width="40" height="40" />',
									additionalClass:"sharetip",
									onClose: function () {
										$("body").removeClass("sharenotify");
									}
								});
							}
						}
					});
				}else if(params.sharehongbaoid){
					$("body").addClass("sharenotify");
					myApp.addNotification({
						title: '<span class="color-red" style="font-weight:bold;">往下看 红包在下面等你哦</span>',
						subtitle: '',
						message: '',
						media:'',
						additionalClass:"sharetip",
						onClose: function () {
							$("body").removeClass("sharenotify");
						}
					});
				}
			}
			var qhbbtn = pcontainer.find(".qhbbtn");
                        if(!window.window.WeixinJSBridge){
                                qhbbtn.remove();
                        }else {
                                if (qhbbtn[0]) {
                                        require(["jquery.md5", "base64.min"], function () {
                                                var curticket = pcontainer.find("#curticket").val() == "" ? base.getTicket() : pcontainer.find("#curticket").val(),
                                                        muid = $.md5(pcontainer.find("#useruid").val()),
                                                        randomkey = pcontainer.find("#randomkey").val();
                                                qhbbtn.unbind("click").click(function (event) {
                                                        var curbtn = $(this);
                                                        if ($(".notifications")[0]) {
                                                                myApp.closeNotification($(".notifications"));
                                                                $("body").removeClass("sharenotify");
                                                        }
                                                        if (!curbtn.hasClass("disabled") && curbtn.css("opacity") > 0) {
                                                                curbtn.addClass("disabled");
                                                                curbtn.remove();
                                                                base.ajax({
                                                                        myApp: myApp,
                                                                        url: "ajax/api.php?action=getsharehongbao&sharehongbaoid=" + params.sharehongbaoid,
                                                                        data: {sign: Base64.encode(curticket + muid + randomkey)},
                                                                        type: "post",
                                                                        success: function (data) {
                                                                                if (data.needcomfirm) {
                                                                                        setTimeout(function () {
                                                                                                myApp.confirm(data.error + "<br>去验证地址吗？", "", function () {
                                                                                                        base.ajax({
                                                                                                                myApp: myApp,
                                                                                                                url: "ajax/api.php?action=checkip&module=user",
                                                                                                                success: function (ret) {
                                                                                                                        base.tip(ret.error);
                                                                                                                }
                                                                                                        });
                                                                                                });
                                                                                        }, 1000);
                                                                                } else if (data.needsubscribe) {
                                                                                        myApp.confirm("未关注，要去关注吗？", "", function () {
                                                                                                location.href = "subscribe.php";
                                                                                        });
                                                                                } else if (data.flag < 1) {
                                                                                        base.tip(data.error);
                                                                                } else {
                                                                                        base.tip(data.error);
                                                                                        var hongbaotemplate = pcontainer.find(".hongbaotemplate"),
                                                                                                newarea = $(hongbaotemplate.children()[0].outerHTML).appendTo($("body")).addClass("bodylayer"),
                                                                                                hblayer = newarea.find(".hblayer"),
                                                                                                hbchaibtn = hblayer.find(".chai"),
                                                                                                hbresult = newarea.find(".hbresultlayer"),
                                                                                                resultlist = hbresult.find(".resultlist"),
                                                                                                resulttemplate = hbresult.find(resultlist.attr("template"));
                                                                                        resultlist.css("height", hbresult.height() - 260);
                                                                                        hblayer.find(".close").unbind("click").click(function () {
                                                                                                curbtn.removeClass("disabled");
                                                                                                newarea.remove();
                                                                                        });
                                                                                        hbresult.find(".close").unbind("click").click(function () {
                                                                                                curbtn.removeClass("disabled");
                                                                                                newarea.remove();
                                                                                        });
                                                                                        hbresult.show();
                                                                                        var maxvalue = maxindex = curindex = 0;
                                                                                        base.getJSON({
                                                                                                url: "ajax/sharehongbao.php?module=sharehongbao&action=receivelist&id=" + params.sharehongbaoid,
                                                                                                success: function (ret) {
                                                                                                        var isfinished = ret.all == ret.data.length ? true : false;
                                                                                                        base.taskData({
                                                                                                                data: ret.data ? ret.data : ret,
                                                                                                                handleFunction: function (d) {
                                                                                                                        return function (done) {
                                                                                                                                base.setPageData(d, {
                                                                                                                                        curtemplate: resulttemplate,
                                                                                                                                        scrollList: resultlist,
                                                                                                                                        container: pcontainer,
                                                                                                                                        setcallback: function (d, tmp) {
                                                                                                                                                if (d.money) {
                                                                                                                                                        tmp.find(".moneyarea").show();
                                                                                                                                                        tmp.find(".creditarea").remove();
                                                                                                                                                        if (d.money > maxvalue) {
                                                                                                                                                                maxvalue = d.money;
                                                                                                                                                                maxindex = curindex;
                                                                                                                                                        }
                                                                                                                                                } else if (d.credit) {
                                                                                                                                                        tmp.find(".moneyarea").remove();
                                                                                                                                                        tmp.find(".creditarea").show();
                                                                                                                                                        if (d.credit > maxvalue) {
                                                                                                                                                                maxvalue = d.credit;
                                                                                                                                                                maxindex = curindex;
                                                                                                                                                        }
                                                                                                                                                }
                                                                                                                                                curindex++;
                                                                                                                                        }
                                                                                                                                });
                                                                                                                                done();
                                                                                                                        }
                                                                                                                },
                                                                                                                callback: function () {
                                                                                                                        if (maxvalue > 0) {
                                                                                                                                var bestitem = resultlist.find(".item").eq(maxindex);
                                                                                                                                bestitem.find(".best").removeClass("hide").show();
                                                                                                                        }
                                                                                                                        resultlist.find(".best.hide").remove();
                                                                                                                }
                                                                                                        });
                                                                                                }
                                                                                        });
                                                                                }
                                                                        }
                                                                });
                                                        }
                                                });
                                        });
                                }
                        }
			pcontainer.find(".shareproduct").unbind("click").click(function(){
				var cur = $(this),
					qrcodeurl = cur.attr("qrcode");
				if(qrcodeurl.indexOf("http") < 0){
					qrcodeurl = httpurl + qrcodeurl;
				}
				base.viewImglist([qrcodeurl],myApp);
			});
			pcontainer.find(".btnshare").unbind("click").click(function(){
				handleShare({
					container:pcontainer,
                                        listparams:scrollListparams,
					module:"news",
					moduleid:params.id,
					ajaxurl:"ajax/sharehongbao.php?module=holidayact&action=send"
				})
			});
			if(pname == "redirect" || pname == "exit"){
				myApp.showIndicator();
				if(base.isMobile()){
					wx.ready(function(){
						window.WeixinJSBridge && WeixinJSBridge.call("closeWindow");
					})
				}
			}else if(pname == "jumpurl"){
				myApp.showIndicator();
				var redirecturl = pcontainer.find("#redirecturl").val(),
					framein = pcontainer.find("#framein").val();
				setTimeout(function(){
					if(framein == 1){
						mainView.router.load({url:redirecturl});
					}else{
						location.href = redirecturl;
					}
				},500);
				/*
				if(framein == 1){
					mainView.router.load({url:redirecturl});
				}else{
					location.href = redirecturl;
				}
				*/
			}
			if(pmodule && paction){
				if(paction == "comment"){
					base.emojiEvent(pcontainer.find("#emoji_list"),pcontainer.find("textarea"));
				}else if((paction == "list" || actiontype == "list") && actiontype != "tablist" && pcontainer.find("#dolist").val() != "false"){
					var paramstr,paramarr = [];
					for(var k in params){
						paramarr.push(k+"="+params[k]);
					}
					paramstr = paramarr.join('&');
					var geturl = "";
					if(pcontainer.find("#listurl")[0]){
						geturl = pcontainer.find("#listurl").val();
					}else if(pcontainer.find("#service")[0] && pcontainer.find("#service").val() == "service"){
						geturl = "ajax/service.php?"+paramstr;
					}else{
						geturl = "ajax/api.php?"+paramstr;
					}
					var listparams = $.extend({}, scrollListparams),
						curtemplate = pcontainer.find(".template"),
						curpagestart = 0,
						curlimit = 20;
					if(scrollList.attr("template")){
						curtemplate = pcontainer.find(scrollList.attr("template"));
					}
					if(scrollList.attr("pagestart")) {
						curpagestart = parseInt(scrollList.attr("pagestart"));
					}
					if(scrollList.attr("limit")) {
						curlimit = parseInt(scrollList.attr("limit"));
					}
					listparams = $.extend(listparams,{
						module:pmodule,
						action:paction,
						geturl:geturl,
						getdata:{pagestart:curpagestart,limit:curlimit},
						curtemplate:curtemplate,
						emptytemplate:pcontainer.find(".emptytemplate"),
						setcallback:function(d,curtemplate){
							if(pname == "memberslist"){
								if(curtemplate.find("input")[0]){
									curtemplate.find("input").attr("value",d.uid);
									if(navitoolbar.find(".checkallpush input")[0].checked){
										curtemplate.find("input").attr("checked","checked");
									}
								}
								curtemplate.find(".viewuser").attr("href","service.php?action=view&module=members&id="+d.uid);
							}else if(pname == "usersubscribe"){
								curtemplate.find("input").attr("value",d.id);
							}else if(pname == "admingrouplist"){
								if(curtemplate.find("input")[0]){
									curtemplate.find("input").attr("value",d.uid);
								}
								if(d.manager){
									curtemplate.find(".qradio").hide();
									curtemplate.find(".manager-cell").removeClass("hide");
								}else{
									curtemplate.find(".manager-cell").addClass("hide");
								}
							}
						},
						doneCallback:function(){listparams.loading=false;}
					});
					function malistScrollData(){
						base.getListData(listparams);
						listparams.infiniteScroll.on('infinite', function() {
							if (listparams.loading) return;
							listparams.loading = true;
							listparams.getdata.pagestart = listparams.scrollList.find(".scroll_item").length;
							base.getListData(listparams);
						});
					}
					if(listparams.scrollList.find(".scroll_item").length == 0) {
						malistScrollData();
					}
					var searchbar = pcontainer.find(".searchbar"),
						kwInput = searchbar.find("input"),
						searcharea = scrollList,
						searchurl = "ajax/service.php?action=search&module="+pmodule;
					if(searchbar.attr("searchurl")){
						searchurl = searchbar.attr("searchurl");
					}
					searchbar.find(".searchbar-ok").click(function(event){
						var kw = kwInput.val();
						searcharea.html("");
						if(kw != ""){
							listparams.geturl = searchurl;
							if(pmodule == "members"){
								var radioarea = pcontainer.find(".radioarea");
								if(radioarea[0] && radioarea.find("input:checked").length > 0){
									var ckinput = radioarea.find("input:checked");
									listparams.geturl += "&filter="+ckinput.val();
								}
							}
							listparams.getdata.keyword = kw;
						}else{
							listparams.geturl = geturl;
							delete listparams.getdata.keyword;
						}
						listparams.getdata.pagestart = 0;
						malistScrollData();
					});
					kwInput.on("keyup",function(event){
						var kw = kwInput.val();
						if(base.trim(kw) != ""){
							searchbar.addClass("searchbar-not-empty");
						}else{
							searchbar.removeClass("searchbar-not-empty");
						}
						if(event.keyCode == 13){
							searchbar.find(".searchbar-ok")[0].click();
						}
					});
					if(pcontainer.find(".classarea")[0]){
						base.ajax({
							myApp:myApp,
							url:"/mobile/ajax/service.php?module="+pmodule+"&action=class",
							success:function(data){
								if(data && data.length>0){
									base.taskData({
										data : data,
										handleFunction : function(d){
											return function(done){
												var curtemplate = pcontainer.find(".template1"),
													classList = pcontainer.find(".class_list");
												if(classList.find("#class-"+d.id).length == 0){
													var newtemplate = base.getNewTemplate(curtemplate,pcontainer);
													var curitem = newtemplate.find(".scroll_item");
													curitem.attr("id","class-"+d.id);
													if(params.classid == d.id){
														classList.find(".active").removeClass("active");
														curitem.addClass("active");
													}
													newtemplate.find(".distitle").html(d.title);
													newtemplate.find(".dishref").attr("href","service.php?action="+paction+"&module="+pmodule+"&classid="+d.id);
													classList.append(newtemplate.html());
													newtemplate.remove();
												}
												done();
											}
										}
									});
								}
							}
						});
					}
					ajaxListEvent(listparams.scrollList,pcontainer);
				}else if(paction == "view"){
					var curid = params.id,
						viewarea = pcontainer.find(".viewarea");
					if(!params.id && params.uid){
						curid = params.uid;
					}
					if(params.orderid && pcontainer.find("#tiptext")[0]){
						$("body").addClass("sharenotify");
						myApp.addNotification({
							title: pcontainer.find("#tiptext").val(),
							subtitle: '',
							message: '',
							media:'',
							additionalClass:"sharetip",
							onClose: function () {
								$("body").removeClass("sharenotify");
							}
						});
					}
					if(curid){
						pcontainer.find(".sendmsg,.hongbao").unbind("click").click(function(event){
							var cur = $(this),
								cururl = "",
								pdata = {};
							myApp.prompt(cur.attr("title"),"",function(value){
								if(cur.hasClass("sendmsg")){
									cururl = "ajax/service.php?action=sendmessage&module="+pmodule+"&id="+params.id+"&uid="+params.id;
									pdata = {message:value};
								}else if(cur.hasClass("hongbao")){
									cururl = "ajax/service.php?action=hongbao&module=hongbao&uid="+params.id;
									pdata = {money:value};
								}
								base.ajax({
									url:cururl,
									data:pdata,
									type:"post",
									success:function(data){
										if(data.flag == 1){
											base.tip(data.error,function(){
												if(data.orderid){
													location.href = "/mobile/ajax/pay.php?orderid="+data.orderid;
												}
											});
										}else{
											base.tip(data.error);
										}
									}
								});
							});
						});
						pcontainer.find(".robber").unbind("click").click(function(event){
							base.ajax({
								url:"ajax/service.php?action=robber&module=members&id="+params.id,
								type:"post",
								success:function(data){
									if(data.flag == 1){
										base.tip("成功");
									}else{
										base.tip(data.error);
									}
								}
							});
						});
						pcontainer.find(".meeting").unbind("click").click(function(event){
							event.preventDefault();
							var cur = $(this),
								popupList = base.getPopup(myApp,pcontainer.find(cur.attr("template")),"meetinglistPopup"),
                                                                appendarea = popupList.find(".appendarea");
							base.getJSON({
								url:"ajax/service.php?action=meetinglist&module=meeting&ascdesc=desc",
								success:function(data){
									myApp.hideIndicator();
									if(data && data.length>0){
										var mindex = 0;
										base.taskData({
											data:data,
											handleFunction:function(d){
												return function(done){
													if(appendarea.find(".scroll_item[itemid="+d.id+"]").length == 0){
                                                                                                                var appendtmp = base.getNewTemplate(pcontainer.find(appendarea.attr("template")),pcontainer),
															newtmp = appendtmp.find(".scroll_item").appendTo(appendarea);
                                                                                                                appendtmp.remove();
                                                                                                                newtmp.attr("itemid",d.id);
                                                                                                                base.setDisinfo(d,newtmp);
                                                                                                                newtmp.find("input").attr("value",d.id);
														if(mindex == 0){
                                                                                                                        newtmp.find("input").attr("checked","checked");
														}
														mindex++;
													}
													done();
												}
											}
										});
									}
								}
							});
							popupList.find(".checkok").click(function(event){
								event.preventDefault();
								var curform = popupList.find(".joinForm");
								base.ajaxSubmit({
									myApp:myApp,
									form:curform,
									url:"ajax/service.php?action=joinmeeting&module=meeting",
									data:{uid:params.id},
									success:function(ret){
										base.tip(ret.error);
										myApp.closeModal(popupList);
									}
								});
							});
						});
						pcontainer.find(".item[type=9]").each(function(){
							var cur = $(this),
								inputitem = cur.find(".item-input");
                                                        base.setTimePicker({
                                                                myApp:myApp,
                                                                input:inputitem.find("input[type=text]"),
                                                                valinput:inputitem.find("input[type=hidden]")
                                                        });
						});
						viewarea.find(".btn_edit").unbind("click").click(function(event){
							event.preventDefault();
							var curnode = $(this),
								curitem = curnode.parent().parent(),
								curchar = curitem.attr("char"),
								curtitle = curitem.find(".title"),
								curtxt = curitem.find(".txt"),
								curprompt = myApp.prompt(curtitle.html(),"",function(updateval){
									if(base.trim(updateval) != ""){
										base.ajax({
											myApp:myApp,
											url:"/mobile/ajax/service.php?module="+pmodule+"&action=edit&char="+curchar+"&id="+params.id,
											data:{value:updateval},
											type:"post",
											success:function(data){
												if(data.flag == 1 || data == 1){
													curtxt.html(updateval);
												}else{
													base.tip(data.error);
												}
											}
										});
									}
								});
							$(curprompt).find(".modal-text-input").val(curtxt.html());
						});
						pcontainer.find(".updatechar").unbind("click").click(function(event){
                                                        var curnode = $(this),
                                                                curitem = curnode.parents(".item"),
                                                                //curchar = curitem.attr("char"),
                                                                curchar = curitem.find(".updateinput").attr("name"),
                                                                updateval = curitem.find(".updateinput").val();
                                                        if(base.trim(updateval) == ""){
                                                        	base.tip("更新内容不能为空");
                                                        	return false;
							}
                                                        base.ajax({
                                                                myApp:myApp,
                                                                url:"ajax/service.php?module="+pmodule+"&action=edit&char="+curchar+"&id="+params.id,
                                                                data:{value:updateval},
                                                                type:"post",
                                                                success:function(data){
                                                                        if(data.flag == 1 || data == 1){
                                                                        	base.tip("成功");
                                                                        }else{
                                                                                base.tip(data.error);
                                                                        }
                                                                }
                                                        });
						});
						viewarea.find(".btn_update").unbind("click").click(function(event){
							event.preventDefault();
							var curnode = $(this),
								curitem = curnode.parent().parent(),
								curchar = curitem.attr("char"),
								curtitle = curitem.find(".title"),
								curtxt = curitem.find(".txt"),
								curinputhidden = curitem.find("input[type=hidden]"),
								updateval;
							if(curitem.attr("type") == 4){
								updateval = curtxt.find("select").val();
							}else if(curitem.attr("type") == 9){
								updateval = curinputhidden.val();
							}
							base.ajax({
								myApp:myApp,
								url:"/mobile/ajax/service.php?module="+pmodule+"&action=edit&char="+curchar+"&id="+params.id,
								data:{value:updateval},
								type:"post",
								success:function(data){
									if(data.flag == 1 || data == 1){
										base.tip("成功");
									}else{
										base.tip(data.error);
									}
								}
							});
						});
					}
					if(pmodule == "message"){
						require(["message"],function(Message){
							initparams.wx = wx;
							initparams.wxIsConfig = wxIsConfig;
							initparams["wxData"] = wxData;
							Message.pageInit(initparams);
						});
					}
				}else if(paction == "add" || paction == "edit"){
					var curform = pcontainer.find("#addForm");
					curform.find(".item[type=9]").each(function(){
						var cur = $(this),
							inputitem = cur.find(".item-input");
                                                base.setTimePicker({
                                                        myApp:myApp,
                                                        input:inputitem.find("input[type=text]"),
                                                        valinput:inputitem.find("input[type=hidden]")
                                                });
					});
					curform.find(".item[type=13]").each(function(){
						var cur = $(this),
							inputitem = cur.find(".item-input"),
							curinput = inputitem.find("input[type=text]"),
							curhidden = inputitem.find("input[type=hidden]"),
							curtemplate = pcontainer.find(".template[type=13]");
						inputitem.unbind("click").click(function(){
							var curmodal = base.getPopup(myApp,curtemplate,"popup-"+new Date().getTime()),
								searchInput = curmodal.find("input[type=search]"),
								appendarea = curmodal.find(".appendarea"),
								appendtemplate = pcontainer.find(appendarea.attr("template"));
							searchInput.keyup(function(event){
								if(event.keyCode == 13){
									event.preventDefault();
									curmodal.find(".searchbar-ok").click();
								}
							});
							function handleresultitem(d){
								var itemid = d.id ? d.id : d.uid;
								if(!appendarea.find(".scroll_item[itemid="+itemid+"]")[0]){
									var newtemplate4 = base.getNewTemplate(appendtemplate,pcontainer),
										newitem = newtemplate4.find(".scroll_item").appendTo(appendarea),
										curck = newitem.find("label input");
									newtemplate4.remove();
									base.setDisinfo(d,newitem);
									newitem.attr("itemid",itemid);
									curck.val(itemid);
									curck.attr("vaulue",itemid);
									var attrtitle = d.linkman;
									if(d.title){
										attrtitle = d.title;
									}else if(d.username){
										attrtitle = d.username;
									}
									curck.attr("title",attrtitle);
									var disphoto = "";
									if(d.photo){
										disphoto = base.getPhoto(d.photo);
									}else if(d.avatar){
										disphoto = base.getPhoto(d.avatar);
									}else if(d.uid){
										disphoto = base.getAvatar(d.uid);
									}
									newitem.find(".disphoto").attr("data-url",disphoto);
                                                                        base.handleScrollLoading(newitem,curmodal.find(".popup-middle"));
									if(pmodule == "report"){
										if(curhidden.val() == d.uid && curinput.val() == d.title){
											newtemplate4.find("input").attr("checked","checked");
										}
									}
								}
							}
							base.ajax({
								myApp:myApp,
								url:curmodal.find(".searchbar").attr("searchurl"),
								data:{pagestart:0,limit:50},
								success:function(ret){
									curmodal.find(".search_result").html("");
									var retdata = ret.data ? ret.data : ret;
									base.taskData({
										data : retdata,
										handleFunction : function(d){
											return function(done){
												handleresultitem(d);
												done();
											}
										}
									});
								}
							});
							curmodal.find(".searchbar-ok").click(function(event){
								event.preventDefault();
								var kw = searchInput.val();
								if(base.trim(kw) != ""){
									base.ajax({
										myApp:myApp,
										url:curmodal.find(".searchbar").attr("searchurl"),
										data:{keyword:kw},
										type:"post",
										success:function(ret){
											curmodal.find(".search_result").html("");
											var retdata = ret.data ? ret.data : ret;
											base.taskData({
												data : retdata,
												handleFunction : function(d){
													return function(done){
														handleresultitem(d);
														done();
													}
												}
											});
										}
									});
								}
							});
							curmodal.find(".btn-sub").click(function(event){
								event.preventDefault();
								var ckuids = [],cknames = [];
								curmodal.find("label input").each(function(){
									if(this.checked){
										ckuids.push(this.value);
										cknames.push(this.getAttribute("title"));
									}
								});
								curinput.val(cknames.join(","));
								curhidden.val(ckuids.join(","));
								myApp.closeModal(curmodal);
							});
						});
					});
					pcontainer.find(".item[type=6]").each(function(){
						var cur = $(this),
							hideInput = cur.find("input[type=hidden]");
						cur.unbind("click").click(function(event){
							cur.find(".item-input .bg").remove();
							var popupUpload = base.getPopup(myApp,pcontainer.find(".template6"),"uploadphotoPopup");
							var curaddicon = popupUpload.find(".addicon"),
								fileInput = popupUpload.find("input[type=file]"),
								fileForm = popupUpload.find("form"),
								curphotolist = [];
							if(hideInput.val() != ""){
								curphotolist = hideInput.val().split(",");
								handlePhotoitem({
									data:curphotolist,
									area : cur,
									hideInput:hideInput,
									datalist : curphotolist,
									insertBeforeArea : curaddicon,
									curitem : cur,
									container : pcontainer
								});
							}
							if(window.WeixinJSBridge && !wxIsConfig) {
								base.handlewx(myApp, wxData);
								wxIsConfig = true;
							}
							base.uploadPhoto({
								myApp: myApp,
								input: fileInput,
								form: fileForm,
								callback: function (data) {
									if(data && data[0] && data[0].url){
										var returl = data[0].url;
										curphotolist.push(returl);
										handlePhotoitem({
											data:[returl],
											area : cur,
											hideInput:hideInput,
											datalist : curphotolist,
											insertBeforeArea : curaddicon,
											curitem : cur,
											container : pcontainer
										});
									}else{
										if(data && data.ret == "-1"){
											return false;
										}
										base.tip("图片上传失败");
									}
								}
							});
							popupUpload.find(".btn-sub").click(function(){
								myApp.closeModal(popupUpload);
							});
						});
					});
					pcontainer.find(".item[type=popup]").each(function() {
						var cur = $(this),
							inputitem = cur.find(".item-input"),
							curinput = inputitem.find("input[type=text]"),
							curhidden = inputitem.find("input[type=hidden]"),
							curtemplate = $(cur.attr("template"));
						cur.unbind("click").click(function(event) {
							var curmodal = base.getPopup(myApp, curtemplate, "addPopupArea"),
								searchInput = curmodal.find("input[type=search]");
							searchInput.keyup(function(event){
								if(event.keyCode == 13){
									event.preventDefault();
									curmodal.find(".searchbar-ok").click();
								}
							});
							base.ajax({
								myApp:myApp,
								url:curmodal.find(".searchbar").attr("searchurl"),
								data:{pagestart:0,limit:50},
								success:function(ret){
									curmodal.find(".search_result").html("");
									base.taskData({
										data : ret,
										handleFunction : function(d){
											return function(done){
												if(!curmodal.find(".list_item[itemid="+d.id+"]")[0]){
													var newtemplate4 = base.getNewTemplate(pcontainer.find(".template4"),pcontainer),
														newitem = $(newtemplate4.children()[0].outerHTML).appendTo(curmodal.find(".search_result"));
													curck = newitem.find("label input");
													newtemplate4.remove();
													newitem.data("data",d);
													newitem.find(".distitle").html(d.title);
													var curid = d.id ? d.id : d.uid;
													curck.val(curid);
													curck.attr("vaulue",curid);
													curck.attr("title",d.title);
													if(pmodule == "report"){
														if(curhidden.val() == d.uid && curinput.val() == d.title){
															newitem.find("input").attr("checked","checked");
														}
													}
												}
												done();
											}
										}
									});
								}
							});
							curmodal.find(".searchbar-ok").click(function(event){
								event.preventDefault();
								var kw = searchInput.val();
								if(base.trim(kw) != ""){
									base.ajax({
										myApp:myApp,
										url:curmodal.find(".searchbar").attr("searchurl"),
										data:{keyword:kw},
										type:"post",
										success:function(ret){
											curmodal.find(".search_result").html("");
											base.taskData({
												data : ret,
												handleFunction : function(d){
													return function(done){
														if(!curmodal.find(".list_item[itemid="+d.id+"]")[0]){
															var newtemplate4 = base.getNewTemplate(pcontainer.find(".template4"),pcontainer),
																newitem = $(newtemplate4.children()[0].outerHTML).appendTo(curmodal.find(".search_result"));
																curck = newitem.find("label input");
															newtemplate4.remove();
															newitem.data("data",d);
															newitem.find(".distitle").html(d.title);
															var curid = d.id ? d.id : d.uid;
															curck.val(curid);
															curck.attr("vaulue",curid);
															curck.attr("title",d.title);
														}
														done();
													}
												}
											});
										}
									});
								}
							});
							curmodal.find(".btn-sub").click(function(event){
								event.preventDefault();
								var ckuids = [],cknames = [];
								curmodal.find("label input").each(function(){
									if(this.checked){
										ckuids.push(this.value);
										cknames.push(this.getAttribute("title"));
										if(pcontainer.find("#operatormodule")[0]){
											var ckitem = $(this).parents(".scroll_item");
											pcontainer.find("#operatormodule").val(ckitem.data("data").module);
										}
									}
								});
								curinput.val(cknames.join(","));
								curhidden.val(ckuids.join(","));
								myApp.closeModal(curmodal);
							});
						});
					});
					//pcontainer.find("[name=addmodule_name]").click(function(){
					//	handleAddModule({container:pcontainer,params:params,element:$(this),module:params.module});
					//});
					pcontainer.find(".btn-delete").click(function(){
						myApp.confirm("确定要删除吗？","",function(){
							base.ajax({
								myApp:myApp,
								url:"ajax/admin.php?action=delete&module=work&id="+params.id,
								success:function(ret){
									if(ret.flag == 1){
										base.tip(ret.error,function(){
											mainView.router.load({url:"user.php?action=success"});
										});
									}else{
										base.tip(ret.error);
									}
								}
							});
						});
					});
				}
			}else{
				if(actiontype == "list"){
					var geturl = "";
					if(pcontainer.find("#module")[0] && pcontainer.find("#action")[0]){
						geturl = "ajax/api.php?module="+inputModule+"&action="+inputAction;
					}else{
						geturl = pcontainer.find("#listurl").val();
					}
					if(params.do){
						geturl += "&do="+params.do;
					}
					var listparams = $.extend({}, scrollListparams);
					listparams = $.extend(listparams,{
						geturl:geturl,
						getdata:{pagestart:0,limit:20},
						curtemplate:pcontainer.find(".template"),
						firstLoad:true,
						doneCallback:function(){listparams.loading=false;},
						successCallback:function(data){
							if(listparams.firstLoad){
								listparams.firstLoad = false;
								if(pname == "address" && (!data || data.length == 0)){
									if(window.WeixinJSBridge){
										disWxAddress({
											pcontainer : pcontainer,
											curtemplate : curtemplate,
											scrollList : scrollList,
											pname : pname
										});
									}
								}
							}
							if (listparams.infiniteScroll && listparams.infiniteScroll[0] && (!data || (listparams.getdata.limit && data.length < listparams.getdata.limit))){
								myApp.detachInfiniteScroll(listparams.infiniteScroll);
							}
							if(pcontainer.find(".emptytemplate")[0] && listparams.scrollList.find(".scroll_item").length==0){
								listparams.scrollList.append(pcontainer.find(".emptytemplate").html());
							}
						}
					});
					if(listparams.scrollList.attr("template")){
						listparams.curtemplate = pcontainer.find(listparams.scrollList.attr("template"));
					}
					if(pcontainer.find("#module")[0] && pcontainer.find("#action")[0]){
						listparams.module=inputModule;
						listparams.action=inputAction;
					}
					if(pname == "agencytemplate"){
						listparams.getdata.limit = 4;
						listparams.setcallback = function(d,template){
							template.find(".dishref").attr("href","product.php?id="+d.id+"&agencyuid="+params.agencyuid);
							var jmArea = pcontainer.find("#jmlist"),
								jmW = (jmArea.width()-15)/2;
							template.find(".pic").css({height:jmW+"px"});
							if(d.discount && d.discount.money){
								template.find(".pic").addClass("limit");
							}
						}
					}
					if(params.uid){
						listparams.getdata["uid"] = params.uid;
					}
					if(params.classid){
						listparams.getdata["classid"] = params.classid;
					}
					function hmalistScrollData(){
						base.getListData(listparams);
						if(listparams.infiniteScroll[0]){
							listparams.infiniteScroll.on('infinite', function() {
								if (listparams.loading) return;
								listparams.loading = true;
								listparams.getdata.pagestart = listparams.scrollList.find(".scroll_item").length - listparams.scrollList.find(".emptyitem").length;
								base.getListData(listparams);
							});
						}
					}
					if(inputModule == "poi" && inputAction == "list"){
						if(base.isWeixin() && window.WeixinJSBridge){
							if(!wxIsConfig){
								base.handlewx(myApp,wxData);
							}
							wx.ready(function(){
								wx.getLocation({
									type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
									success: function (res) {
										var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
										var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
										var speed = res.speed; // 速度，以米/每秒计
										var accuracy = res.accuracy; // 位置精度
										var curlocation = false;
										listparams.locationCallback = function(d,curitem,callback){
											if(d.latitude!="" && d.longitude!=""){
												curlocation = base.getFlatternDistance(latitude,longitude,parseFloat(d.latitude),parseFloat(d.longitude));
												curlocation = base.toDecimal(curlocation/1000);
												if(curlocation < 1){
													curlocation = curlocation*1000 + "米";
												}else{
													curlocation = curlocation + "公里";
												}
											}
											var daohang = 'http://api.map.baidu.com/direction?origin=latlng:'+latitude+','+longitude+"|name:我的位置&destination=latlng:"+d.latitude+','+d.longitude+'|name:北京宴&mode=driving&region=北京&output=html&coord_type=gcj02';
											if(curlocation){
												curitem.find(".position").show().html(curlocation);
												curitem.find(".dhhref").show().attr("href",daohang);
											}
											callback && callback();
										}
										if(listparams.scrollList.find(".scroll_item").length == 0){
											hmalistScrollData();
										}
									},
									fail : function(res){
										base.tip("请允许微信使用您的地理位置");
										if(listparams.scrollList.find(".scroll_item").length == 0){
											hmalistScrollData();
										}
										done();
									}
								});
							});
						}else{
							if(listparams.scrollList.find(".scroll_item").length == 0){
								hmalistScrollData();
							}
						}
					}else{
						if(listparams.scrollList.find(".scroll_item").length == 0){
							hmalistScrollData();
						}
					}
				}else if(actiontype == "view"){
					if(inputAction == "preorder"){
                                                base.setTimePicker({
                                                        myApp:myApp,
                                                        input:pcontainer.find("#addpretime"),
                                                        valinput:pcontainer.find("#pretime")
                                                });
					}else if(inputAction == "daohang"){
						myApp.showIndicator();
						if(window.WeixinJSBridge){
							if(base.isMobile() && !wxIsConfig){
								base.handlewx(myApp,wxData);
							}
							wx.ready(function(){
								wx.getLocation({
									type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
									success: function (res) {
										var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
										var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
										var speed = res.speed; // 速度，以米/每秒计
										var accuracy = res.accuracy; // 位置精度
										var dlatitude = pcontainer.find("#latitude").val();
										var dlongitude = pcontainer.find("#longitude").val();
										var daohang = 'http://api.map.baidu.com/direction?origin=latlng:'+latitude+','+longitude+"|name:我的位置&destination=latlng:"+dlatitude+','+dlongitude+'|name:北京宴&mode=driving&region=北京&output=html&coord_type=gcj02';
										window.location.href=daohang;
									},
									fail : function(res){
										base.tip("请允许微信使用您的地理位置");
									}
								});
							});
						}
					}
				}
			}
			if(actiontype == "tablist"){
				var tabparam = pcontainer.find("#tabparam").val(),
					defaultparam = pcontainer.find("#defaultparam").val(),
					taburl = pcontainer.find("#taburl").val();
				var shopstoreuid = pcontainer.find("#shopstoreuid").val(),
					curparam = pcontainer.find(".tab-link.active").attr(tabparam);
				if(curparam == undefined || curparam == "undefined"){
					curparam = defaultparam;
				}
				var listparams = $.extend({}, scrollListparams),
					getpagestart = listparams.scrollList.find(".scroll_item").length - listparams.scrollList.find(".emptyitem").length;
				if(getpagestart < 0)getpagestart = 0;
				var tabgeturl = taburl+"&"+tabparam+"="+curparam;
				listparams = $.extend(listparams,{
					geturl:tabgeturl,
					getdata:{
						pagestart:getpagestart,
						limit:20
					},
					scrollList:pcontainer.find(".tab.active .scroll_list"),
					curtemplate:pcontainer.find(".template["+tabparam+"="+curparam+"]"),
					emptytemplate:pcontainer.find(".emptytemplate"),
					doneCallback:function(){listparams.loading=false;},
					curparam:curparam,
					setcallback:function(d,tmp){
						tmp.find(".viewuser").attr("href","service.php?action=view&module=members&id="+d.uid);
					}
				});
				if(listparams.scrollList.attr("ajaxurl")){
                                        listparams.geturl = listparams.scrollList.attr("ajaxurl");
				}
				if(!listparams.curtemplate[0]){
					listparams.curtemplate = pcontainer.find(".template");
				}
				if(listparams.scrollList.attr("template")){
					listparams.curtemplate = pcontainer.find(listparams.scrollList.attr("template"));
				}
				if(pcontainer.find("#tabparam-"+curparam)[0]){
					listparams.geturl = taburl+"&"+tabparam+"="+pcontainer.find("#tabparam-"+curparam).val();
				}
				function spScrollData(){
					base.getListData(listparams);
					listparams.infiniteScroll.on('infinite', function() {
						if (listparams.loading) return;
						listparams.loading = true;
						getpagestart = listparams.scrollList.find(".scroll_item").length - listparams.scrollList.find(".emptyitem").length;
						if(getpagestart < 0)getpagestart = 0;
						listparams.getdata.pagestart = getpagestart;
						base.getListData(listparams);
					});
				}
				if(listparams.scrollList.find(".scroll_item").length == 0){
					spScrollData();
					pcontainer.find(".tab").each(function(){
						var cur = $(this);
						cur.on("show",function(){
							curparam = cur.attr(tabparam);
							listparams.scrollList = cur.find(".scroll_list");
							listparams.curtemplate = pcontainer.find(".template["+tabparam+"="+curparam+"]");
							if(!listparams.curtemplate[0]){
								listparams.curtemplate = pcontainer.find(".template");
							}
							if(listparams.scrollList.attr("template")){
								listparams.curtemplate = pcontainer.find(listparams.scrollList.attr("template"));
							}
                                                        if(listparams.scrollList.attr("ajaxurl")){
                                                                listparams.geturl = listparams.scrollList.attr("ajaxurl");
                                                        }else{
                                                                listparams.geturl = taburl+"&"+tabparam+"="+curparam;
							}
							if(pcontainer.find("#tabparam-"+curparam)[0]){
								listparams.geturl = taburl+"&"+tabparam+"="+pcontainer.find("#tabparam-"+curparam).val();
							}
							getpagestart = listparams.scrollList.find(".scroll_item").length - listparams.scrollList.find(".emptyitem").length;
							if(getpagestart < 0)getpagestart = 0;
							listparams.getdata.pagestart = getpagestart;
							if(listparams.infiniteScroll && listparams.infiniteScroll[0]){
								myApp.detachInfiniteScroll(listparams.infiniteScroll);
								myApp.attachInfiniteScroll(listparams.infiniteScroll);
							}
							if(listparams.scrollList.find(".scroll_item").length < 10){
								spScrollData();
							}else{
								if(getpagestart <= 0){
									spScrollData();
								}
							}
						});
					});
				}
				ajaxListEvent(pcontainer.find(".scroll_list"),pcontainer);
			}else if(actiontype == "slidelist"){
				var slideurl = pcontainer.find("#slideurl").val(),
					slideparam = pcontainer.find("#slideparam").val(),
					curslidearea = pcontainer.find(".swiper-slide"),
					listparams = $.extend({}, scrollListparams);
				listparams = $.extend(listparams,{
					geturl:slideurl,
					getdata:{pagestart:0,limit:20},
					curtemplate:pcontainer.find(".template"),
					doneCallback:function(){listparams.loading=false;},
					successCallback:function(data){
						if (listparams.infiniteScroll && listparams.infiniteScroll[0] && (!data || (listparams.getdata.limit && data.length < listparams.getdata.limit))){
							myApp.detachInfiniteScroll(listparams.infiniteScroll);
						}
					}
				});
				if(listparams.scrollList.attr("template")){
					listparams.curtemplate = pcontainer.find(listparams.scrollList.attr("template"));
				}
				listparams.getdata[slideparam] = pcontainer.find(".swiper-slide.selected").attr("curid");
				if(pcontainer.find("#slideparam")[0] && pcontainer.find("#defaultparam")[0]){
					listparams.getdata[slideparam] = pcontainer.find("#defaultparam").val();
				}
				if(listparams.infiniteScroll && listparams.infiniteScroll[0]){
					listparams.successCallback=function(data){
						if (listparams.infiniteScroll && listparams.infiniteScroll[0] && (!data || (listparams.getdata.limit && data.length < listparams.getdata.limit))){
							myApp.detachInfiniteScroll(listparams.infiniteScroll);
						}
					}
				}
				if(pname == "productclass" || pname == "creditproductclass"){
					var pW = (scrollList.width()-15)/2;
					listparams.setcallback = function(d,template){
						template.find(".pic").css({height:pW+"px"});
						if(d.discount && d.discount.money){
							template.find(".pic").addClass("limit");
						}
						if(d.fullcutid > 0){
							template.find(".fullcutitem").removeClass("hide");
						}else{
							template.find(".fullcutitem").remove();
						}
					}
				}
				function sproScrollData(){
					base.getListData(listparams);
					if(listparams.infiniteScroll && listparams.infiniteScroll[0]){
						listparams.infiniteScroll.on('infinite', function() {
							if (listparams.loading) return;
							listparams.loading = true;
							listparams.getdata.pagestart = listparams.scrollList.find(".scroll_item").length - listparams.scrollList.find(".emptyitem").length;
							base.getListData(listparams);
						});
					}
				}
				if(listparams.scrollList.find(".scroll_item").length == 0){
					sproScrollData();
					curslidearea.click(function(){
						var cur = $(this);
						if(!cur.hasClass("selected")){
							curslidearea.removeClass("selected");
							cur.addClass("selected");
							var curid = cur.attr("curid");
							listparams.getdata[slideparam] = curid;
							listparams.scrollList.html("");
							listparams.getdata.pagestart = listparams.scrollList.find(".scroll_item").length - listparams.scrollList.find(".emptyitem").length;
							if(listparams.infiniteScroll && listparams.infiniteScroll[0]){
								myApp.detachInfiniteScroll(listparams.infiniteScroll);
								myApp.attachInfiniteScroll(listparams.infiniteScroll);
							}
							sproScrollData();
						}
					});
					if(pname == "selectproduct"){
						pcontainer.find(".scroll_list").on("click",".add",function(event){
							event.preventDefault();
							var curtarget = $(this),
								curitem = curtarget.parents(".scroll_item"),
								originid = curitem.attr("originid"),
								curagencyuid = pcontainer.find("#agencyuid").val();
							base.ajax({
								myApp:myApp,
								url:"ajax/agency.php?action=agencyproduct&do=add",
								data:{productid:originid,agencyuid:curagencyuid},
								type:"post",
								success:function(data){
									if(data.flag==1){
										base.tip("成功");
										curitem.parent().find(".scroll_item[originid="+originid+"]").remove();
									}else{
										base.tip(data.error);
									}
								}
							});
						});
					}
				}
			}else if(actiontype == "swiperlist"){
				var swiperurl = pcontainer.find("#swiperurl").val(),
					swiperparam = pcontainer.find("#swiperparam").val(),
					curswiperarea = pcontainer.find(".swiper-slide");
				curswiperarea.each(function(){
					var curslide = $(this),
						curscrollarea = curslide.find(".scrollarea"),
						curlistparams = $.extend({}, scrollListparams);
					curlistparams = $.extend(curlistparams,{
						geturl:swiperurl,
						getdata:{pagestart:0,limit:10},
						scrollList:curslide.find(".scroll_list"),
						curtemplate:pcontainer.find(".template"),
						setcallback:function(d,curtemplate){
						},
						doneCallback:function(){
							curlistparams.loading=false;
						},
						successCallback:function(data){
							curscrollarea.unbind("scroll");
							if(data && data.length >= curlistparams.getdata.limit){
								curscrollarea.on('scroll',function(){
									base.bindScrollEvent({
										element:$(this),
										callback:function(){
											if(curlistparams.loading) return;
											curlistparams.loading = true;
											curlistparams.getdata.pagestart = curlistparams.scrollList.find(".scroll_item").length - curlistparams.scrollList.find(".emptyitem").length;
											base.getListData(curlistparams);
										}
									});
								});
							}
						}
					});
					curlistparams.getdata[swiperparam] = curlistparams.scrollList.attr("role");
					if(curlistparams.scrollList.attr("template")){
						curlistparams.curtemplate = pcontainer.find(curlistparams.scrollList.attr("template"));
					}
					base.getListData(curlistparams);
				});
			}else if(actiontype == "swiperinner"){
				var curSwiperContainer = pcontainer.find(".swiper-container.listswiper"),
					pagebullets = curSwiperContainer.find(".swiper-pagination-bullet"),
					slides = curSwiperContainer.find(".swiper-slide"),
					curslideindex = 0,
					curslide = slides.eq(0),
					mySwiper,
					targetslide;
				ajaxListEvent(curSwiperContainer,pcontainer);
				function getAjaxData(curscrollarea,curarea){
					var curscrolllist = curarea.find(".getAjaxData"),
						curlisttype = curscrolllist.attr("listtype"),
						curajaxurl = curscrolllist.attr("ajaxurl"),
						curtemplate = pcontainer.find(curscrolllist.attr("template")),
						getpagestart = curscrolllist.find(".scroll_item").length,
						getlimit = !curscrolllist.attr("limit") || isNaN(curscrolllist.attr("limit")) ? 20 : parseInt(curscrolllist.attr("limit")),
						getDataType = curscrolllist.attr("dataType"),
                                                paramarr = [];
					if(pcontainer.find(curscrolllist.attr("scrollarea"))[0]){
                                                curscrollarea = pcontainer.find(curscrolllist.attr("scrollarea"));
					}
					if(curlisttype == "list"){
                                                for(var k in params){
                                                	if(k != "module" && k != "action"){
                                                        	paramarr.push(k+"="+params[k]);
                                                        }
                                                }
                                                paramstr = paramarr.join('&');
                                                curajaxurl = curajaxurl+"&"+paramstr;
					}
					if (curajaxurl) {
						if(curscrolllist.attr("state") == "echart" && !curscrolllist.hasClass("echart")) {
                                                        curscrolllist.addClass("echart");
							curscrolllist.html("");
							var echarts = require("echart/echarts.smart");
							base.ajax({
								myApp:myApp,
								url:curajaxurl,
								success:function(ret){
									if(ret && ret.length > 0){
										base.taskData({
											data:ret,
											handleFunction:function(d){
												return function(done){
													var curchatarea = $("<div style='width:100%;height:100%;'></div>").appendTo(curscrolllist),
														curchart = echarts.init(curchatarea[0]);
													d = $.extend(d,{
														tooltip : {
															trigger: "axis"
														},toolbox: {
															show : true,
															right : '20',
															top : 20,
															bottom : 20,
															feature : {
																dataZoom: {},
																dataView: {readOnly: false},
																magicType: {type: ["line","bar"]},
																restore: {},
																saveAsImage: {}
															}
														},
														calculable : true,
														yAxis : [
															{
																type : "value"
															}
														]
													});
													if(d.title && d.title.textStyle){
														d.title.textStyle.fontSize = "18";
													}
													curchart.setOption(d);
													done();
												}
											}
										});
									}
								}
							});
						}else if(curtemplate[0]){
							var ajaxparams = $.extend({}, scrollListparams);
							ajaxparams = $.extend(ajaxparams, {
								geturl: curajaxurl,
								getdata: {pagestart: getpagestart, limit: getlimit},
								curtemplate: curtemplate,
								scrollList: curscrolllist,
								doneCallback: function () {
									ajaxparams.loading = false;
								},
								setcallback: function (d, tmp) {
									tmp.find(".viewuser").attr("href", "service.php?action=view&module=members&id=" + d.uid);
                                                                        if(pname == "memberslist"){
                                                                                if(tmp.find("input")[0]){
                                                                                        tmp.find("input").attr("value",d.uid);
                                                                                        if(navitoolbar.find(".checkallpush input")[0].checked){
                                                                                                tmp.find("input").attr("checked","checked");
                                                                                        }
                                                                                }
                                                                                curtemplate.find(".viewuser").attr("href","service.php?action=view&module=members&id="+d.uid);
                                                                        }else if(pname == "adminsetting" && curscrolllist.attr("role") == "setpush"){
										tmp.find("input").attr("value",d.id);
										if(d.selectid == d.id){
											tmp.find("input").attr("checked","checked");
										}
									}else if(pname == "pageslist"){
										tmp.find("input").attr("value",d.page_id);
										if(d.select){
                                                                                        tmp.find("input").attr("checked","checked");
										}
									}else if(pname == "deviceslist"){
										if(d.uid){
											tmp.find(".used").removeClass("hide");
                                                                                        tmp.find(".noused").remove("");
										}else{
                                                                                        tmp.find(".used").remove("");
                                                                                        tmp.find(".noused").removeClass("hide");

										}
									}else if(pname == "messagelist"){
										if(d.unreadNumber > 0){
											tmp.find(".readarea").removeClass("hide");
										}else{
                                                                                        tmp.find(".readarea").remove();
										}
									}
                                                                        var percentarea = tmp.find(".percentarea");
									if(d.percent && percentarea[0]){
                                                                                var curpercent = d.percent;
                                                                                percentarea.find(".inner").css({"width":curpercent+"%"});
                                                                                if(curpercent <= 40){
                                                                                        percentarea.addClass("percent1");
                                                                                }else if(curpercent <= 60){
                                                                                        percentarea.addClass("percent2");
                                                                                }else if(curpercent <= 80){
                                                                                        percentarea.addClass("percent3");
                                                                                }else if(curpercent <= 99){
                                                                                        percentarea.addClass("percent4");
                                                                                }else{
                                                                                        percentarea.addClass("percent5");
                                                                                }
									}
									if(pcontainer.find("#managearea").val() == "admin" && paction == "list"){
										tmp.find(".hrefedit").attr("href","admin.php?action=edit&module="+params.module+"&id="+d.id);
									}
								},
								aftersetCallback:function(d,tmp){
                                                                        if(tmp.find(".sharebadge")[0]) {
                                                                                tmp.find(".sharebadge").unbind("click").click(function () {
                                                                                        handleShare({
                                                                                                container: pcontainer,
                                                                                                listparams: scrollListparams,
                                                                                                module: params.module,
                                                                                                moduleid: d.id,
                                                                                                ajaxurl: "ajax/sharehongbao.php?module=" + params.module + "&action=send"
                                                                                        })
                                                                                });
                                                                        }
                                                                        var tostat = tmp.find(".tostat");
                                                                        if(tostat[0]){
                                                                                var statmodule = tostat.attr("module"),
                                                                                        statchar = tostat.attr("linkchar");
                                                                                if(statmodule){
                                                                                	tostat.attr("href","service.php?module="+statmodule+"&action=stat&id="+d[statchar]);
                                                                                }else{
                                                                                        tostat.attr("href","service.php?module="+d.module+"&action=stat&id="+d.moduleid);
										}
                                                                        }
                                                                        var percentarea = tmp.find(".percentarea");
                                                                        if(percentarea[0]){
                                                                        	var percentlayer = pcontainer.find(".percentlayer"),
											percentinner = percentlayer.find(".layerinner");
                                                                        	if(!percentlayer.hasClass("ok")){
                                                                                        var wW = window.innerWidth,
                                                                                                wH = window.innerHeight,
                                                                                                innerW = Math.floor(wW*0.8),
                                                                                                innerH = innerW;
                                                                                        if(innerH > wH * 0.8){
                                                                                        	innerH = innerW = Math.floor(wH*0.8);
											}
                                                                                        percentinner.css({width:innerW,height:innerH,"margin-left":-innerW/2,"margin-top":-innerW/2});
                                                                                        percentlayer.addClass("ok");
                                                                                        percentlayer.find(".bg").unbind("click").click(function(){
                                                                                                var cur = $(this);
                                                                                                if(percentlayer.hasClass("ing"))return false;
                                                                                                percentlayer.addClass("ing");
                                                                                                require(["jquery.transit.min"],function(){
                                                                                                        percentinner.transition({
                                                                                                                scale:0,
                                                                                                                complete: function(){
                                                                                                                        setTimeout(function(){
                                                                                                                                percentlayer.removeClass("ing");
                                                                                                                        },500);
                                                                                                                        percentlayer.hide();
                                                                                                                        percentlayer.css({"opacity":0});
                                                                                                                }
                                                                                                        });
                                                                                                });
                                                                                        });
										}
                                                                                percentarea.unbind("click").click(function(){
                                                                                        var cur = $(this);
                                                                                        if(percentlayer.hasClass("ing"))return false;
                                                                                        if(!percentlayer.is(":hidden"))return false;
                                                                                        percentlayer.addClass("ing");
                                                                                        percentlayer.show();
                                                                                        percentlayer.css({"opacity":1});
                                                                                        require(["jquery.transit.min"],function(){
                                                                                                percentinner.transition({
                                                                                                        scale:1,
                                                                                                        complete: function(){
                                                                                                                setTimeout(function(){
                                                                                                                        percentlayer.removeClass("ing");
                                                                                                                },500);
                                                                                                        }
                                                                                                });
                                                                                        });
                                                                                });
                                                                        }
                                                                        tmp.find(".admincensor").unbind("click").click(function(){
                                                                        	var cur = $(this),
											curitem = cur.parents(".scroll_item"),
                                                                                        ajaxurl = cur.attr("ajaxurl"),
                                                                                        ajaxchar = cur.attr("ajaxchar");
                                                                        	myApp.confirm("确实要审核通过吗？","",function(){
                                                                        		var ajaxdata = {};
                                                                        		ajaxdata[ajaxchar] = d[ajaxchar];
                                                                        		base.ajax({
                                                                        			myApp:myApp,
												url:cur.attr("ajaxurl"),
                                                                                                type:"post",
												data:ajaxdata,
												success:function(ret){
                                                                        				if(ret.flag == 1){
                                                                                                                base.tip(ret.error,function(){
                                                                                                                        curitem.remove();
														});
													}else{
                                                                                                                base.tip(ret.error);
													}
												}
											});
										});
									});
								},
								successCallback: function (data) {
                                                                        if(data.amount){
                                                                                pcontainer.find(".customeramount").html(data.amount);
                                                                        }
									var retdata = data.data ? data.data : data;
									curscrollarea.unbind("scroll");
									if (retdata && retdata.length == ajaxparams.getdata.limit) {
										curscrollarea.on('scroll', function () {
											base.bindScrollEvent({
												element: $(this),
												callback: function () {
													if (ajaxparams.loading) return;
													ajaxparams.loading = true;
													ajaxparams.getdata.pagestart = ajaxparams.scrollList.find(".scroll_item").length - ajaxparams.scrollList.find(".emptyitem").length;
													base.getListData(ajaxparams);
												}
											});
										});
									} else if (ajaxparams.scrollList.find(".scroll_item").length == 0) {
										if (ajaxparams.scrollList.attr("emptytemplate") && ajaxparams.scrollList.find(".emptyitem").length == 0) {
											ajaxparams.scrollList.append(pcontainer.find(ajaxparams.scrollList.attr("emptytemplate")).html());
										}
									}
								}
							});
							if(getpagestart <= 0){
								base.getListData(ajaxparams);
							}else{
								curscrollarea.unbind("scroll");
								ajaxparams.loading = false;
								curscrollarea.on('scroll', function () {
									base.bindScrollEvent({
										element: $(this),
										callback: function () {
											if (ajaxparams.loading) return;
											ajaxparams.loading = true;
											ajaxparams.getdata.pagestart = ajaxparams.scrollList.find(".scroll_item").length - ajaxparams.scrollList.find(".emptyitem").length;
											base.getListData(ajaxparams);
										}
									});
								});
							}
						}
					}
				}
				if(pagebullets.length == 0){
					if(params.target){
						targetslide = pcontainer.find(".swiper-slide[role="+params.target+"]");
						if(targetslide[0]){
							curslideindex = slides.index(targetslide);
							curslide = targetslide;
							isSlidetoTarget = true;
						}
					}
				}
				if((!ISBACK || pagebullets.length == 0) && curSwiperContainer[0]){
					mySwiper = myApp.swiper(curSwiperContainer, {
						pagination:curSwiperContainer.find(".swiper-pagination")
					});
					mySwiper.on("transitionEnd", function (event) {
						curslide = curSwiperContainer.find(".swiper-slide-active");
						var curindex = slides.index(curslide);
						pagebullets.eq(curindex).addClass("swiper-pagination-bullet-active");
						handleAjaxData();
						if (curslide.find(".detailtxt")[0]) {
							if (curslide.find(".detailtxt .getAjaxData")[0]) {
								getAjaxData(curslide.find(".detail-con .con"), curslide.find(".detailtxt"));
							}
						} else if (curslide.find(".detailtabs .getAjaxData")[0]) {
							getAjaxData(curslide.find(".detail-con .con"), curslide.find(".tab.active"));
						}
					});
				}
				if(targetslide && targetslide[0] && curslideindex > 0){
					mySwiper.slideTo(curslideindex);
				}
				if(!ISBACK && pagebullets.length == 0){
					if(params.target){
						var targetslide = pcontainer.find(".swiper-slide[role="+params.target+"]");
						if(targetslide[0]){
							curslideindex = slides.index(targetslide);
							curslide = targetslide;
						}
						if(targetslide[0] && curslideindex > 0){
							mySwiper.slideTo(curslideindex);
						}
					}
				}
				function handleAjaxData(){
					if(curslide.find(".tablist")[0]){
						var curdetailtab = curslide.find(".detailtabs"),
							curdetailtxt = curslide.find(".detailtxt");
						if(!curslide.data("tabevent")){
							curslide.data("tabevent",true);
							curslide.find(".tabs .tab").each(function(){
								var curtab = $(this);
								curtab.on("show",function(){
									var curscrollarea = curslide.find(".detail-con .con");
									curdetailtxt.hide();
									curdetailtab.show();
									curscrollarea.unbind("scroll");
									if(curtab.find(".getAjaxData")[0]) {
										getAjaxData(curslide.find(".detail-con .con"),curtab);
									}
								});
							});
						}
					}
				}
				if(curslide.find(".detailtxt")[0]){
					if(curslide.find(".detailtxt .getAjaxData")[0]) {
						getAjaxData(curslide.find(".detail-con .con"), curslide.find(".detailtxt"));
					}
				}else if(curslide.find(".detailtabs .getAjaxData")[0]){
					getAjaxData(curslide.find(".detail-con .con"), curslide.find(".tab.active"));
				}
				handleAjaxData(curslide.find(".getAjaxData")[0]);
				pcontainer.find(".searchbar.searchbar-list").each(function(){
					var cursearchbar = $(this),
						curresultarea = cursearchbar.parent().parent().find(".getAjaxData"),
						searchslide = cursearchbar.parents(".swiper-slide"),
						curscrollarea = searchslide.find(".detail-con .con");
					if(curresultarea.attr("scrollarea")){
                                                curscrollarea = searchslide.find(curresultarea.attr("scrollarea"));
					}
                                        base.searchEvent({
                                                myApp:myApp,
                                                element:cursearchbar,
                                                container:pcontainer,
                                                resultarea:curresultarea,
                                                listparams:scrollListparams,
                                                allowEmpty:true,
                                                scrollarea:curscrollarea,
                                                beforeSearch:function(sp){
                                                	var sdatepicker = cursearchbar.find(".datepicker"),
                                                		shidden = cursearchbar.find("input[type=hidden]");
                                                	if(sdatepicker[0]){
                                                                sp.getdata[shidden.attr("name")] = base.trim(sdatepicker.val());
                                                                delete sp.getdata['keyword'];
							}
						},
						callback:function(d,tmp){
                                                	if(tmp.find(".sharebadge")[0]){
								tmp.find(".sharebadge").unbind("click").click(function(){
									handleShare({
										container:pcontainer,
										listparams:scrollListparams,
										module:params.module,
										moduleid:d.id,
										ajaxurl:"ajax/sharehongbao.php?module="+params.module+"&action=send"
									})
								});
                                                        }
							var tostat = tmp.find(".tostat");
							if(tostat[0]){
								var statmodule = tostat.attr("module"),
									statchar = tostat.attr("linkchar");
								if(statmodule){
									tostat.attr("href","service.php?module="+statmodule+"&action=stat&id="+d[statchar]);
								}else{
									tostat.attr("href","service.php?module="+d.module+"&action=stat&id="+d.moduleid);
								}
							}
                                                        var percentarea = tmp.find(".percentarea");
                                                        if(d.percent && percentarea[0]){
                                                                var curpercent = d.percent;
                                                                percentarea.find(".inner").css({"width":curpercent+"%"});
                                                                if(curpercent <= 40){
                                                                        percentarea.addClass("percent1");
                                                                }else if(curpercent <= 60){
                                                                        percentarea.addClass("percent2");
                                                                }else if(curpercent <= 80){
                                                                        percentarea.addClass("percent3");
                                                                }else if(curpercent <= 99){
                                                                        percentarea.addClass("percent4");
                                                                }else{
                                                                        percentarea.addClass("percent5");
                                                                }
                                                                var percentlayer = pcontainer.find(".percentlayer"),
                                                                        percentinner = percentlayer.find(".layerinner");
                                                                percentarea.unbind("click").click(function(){
                                                                        var cur = $(this);
                                                                        if(percentlayer.hasClass("ing"))return false;
                                                                        if(!percentlayer.is(":hidden"))return false;
                                                                        percentlayer.addClass("ing");
                                                                        percentlayer.show();
                                                                        percentlayer.css({"opacity":1});
                                                                        require(["jquery.transit.min"],function(){
                                                                                percentinner.transition({
                                                                                        scale:1,
                                                                                        complete: function(){
                                                                                                setTimeout(function(){
                                                                                                        percentlayer.removeClass("ing");
                                                                                                },500);
                                                                                        }
                                                                                });
                                                                        });
                                                                });
                                                        }
                                                        if(pcontainer.find("#managearea").val() == "admin" && paction == "list"){
                                                                tmp.find(".hrefedit").attr("href","admin.php?action=edit&module="+params.module+"&id="+d.id);
                                                        }
                                                        tmp.find(".admincensor").unbind("click").click(function(){
                                                                var cur = $(this),
                                                                        curitem = cur.parents(".scroll_item"),
                                                                        ajaxurl = cur.attr("ajaxurl"),
                                                                        ajaxchar = cur.attr("ajaxchar");
                                                                myApp.confirm("确实要审核通过吗？","",function(){
                                                                        var ajaxdata = {};
                                                                        ajaxdata[ajaxchar] = d[ajaxchar];
                                                                        base.ajax({
                                                                                myApp:myApp,
                                                                                url:cur.attr("ajaxurl"),
										type:"post",
                                                                                data:ajaxdata,
                                                                                success:function(ret){
                                                                                        if(ret.flag == 1){
                                                                                                base.tip(ret.error,function(){
                                                                                                        curitem.remove();
                                                                                                });
                                                                                        }else{
                                                                                                base.tip(ret.error);
                                                                                        }
                                                                                }
                                                                        });
                                                                });
                                                        });
						}
                                        });
				});
				pcontainer.find(".searchbar .datepicker").each(function(){
					var curpicker = $(this),
						haveMonth = curpicker.attr("haveMonth"),
						haveDay = curpicker.attr("haveDay");
					if(!isNaN(haveMonth))haveMonth = parseInt(haveMonth);
                                        if(!isNaN(haveDay))haveDay = parseInt(haveDay);
                                        base.setTimePicker({
                                        	myApp:myApp,
                                                input:curpicker,
                                                valinput:curpicker.parent().find("input[type=hidden]"),
						haveTime:false,
                                                haveMonth:haveMonth,
                                                haveDay:haveDay,
						minYear:2000,
						maxYear:new Date().getFullYear()
					});
                                });
			}else if(actiontype == "tablist1"){
				var activetab = pcontainer.find(".tab.active"),
					activelist = activetab.find(".getAjaxData"),
                                        curscrollarea = pcontainer.find(">.page-content"),
                                	listparams = $.extend({}, scrollListparams),
                                        getpagestart = activelist.find(".scroll_item").length - activelist.find(".emptyitem").length;
				if(activelist.attr("scrollarea"))curscrollarea = pcontainer.find(activelist.attr("scrollarea"));
                                if(getpagestart < 0)getpagestart = 0;
                                listparams = $.extend(listparams,{
                                        geturl:activelist.attr("ajaxurl"),
                                        getdata:{pagestart:getpagestart,limit:20},
                                        scrollList:activelist,
                                        curtemplate:pcontainer.find(activelist.attr("template")),
                                        emptytemplate:pcontainer.find(activelist.attr("emptytemplate")),
                                        doneCallback:function(){listparams.loading=false;},
                                        setcallback:function(d,tmp){
                                                tmp.find(".viewuser").attr("href","service.php?action=view&module=members&id="+d.uid);
                                        }
                                });
                                function spScrollData(){
                                        base.getListData(listparams);
                                        /*
                                        listparams.infiniteScroll.on('infinite', function() {
                                                if (listparams.loading) return;
                                                listparams.loading = true;
                                                getpagestart = listparams.scrollList.find(".scroll_item").length - listparams.scrollList.find(".emptyitem").length;
                                                if(getpagestart < 0)getpagestart = 0;
                                                listparams.getdata.pagestart = getpagestart;
                                                base.getListData(listparams);
                                        });
                                        */

                                        curscrollarea.unbind("scroll");
                                        if(listparams.scrollList.attr("scrollarea"))curscrollarea = pcontainer.find(listparams.scrollList.attr("scrollarea"));
                                        listparams.loading = false;
                                        curscrollarea.on('scroll', function () {
                                                base.bindScrollEvent({
                                                        element: $(this),
                                                        callback: function () {
                                                                if (listparams.loading) return;
                                                                listparams.loading = true;
                                                                getpagestart = listparams.scrollList.find(".scroll_item").length - listparams.scrollList.find(".emptyitem").length;
                                                                if(getpagestart < 0)getpagestart = 0;
                                                                listparams.getdata.pagestart = getpagestart;
                                                                base.getListData(listparams);
                                                        }
                                                });
                                        });
                                }
                                if(activetab.find(".scroll_item").length == 0){
                                        spScrollData();
                                        pcontainer.find(".tab").each(function(){
                                                var cur = $(this);
                                                cur.on("show",function(){
                                                        listparams.scrollList = cur.find(".scroll_list");
                                                        listparams.curtemplate = pcontainer.find(listparams.scrollList.attr("template"));
                                                        if(!listparams.curtemplate[0]){
                                                                listparams.curtemplate = pcontainer.find(".template");
                                                        }
                                                        listparams.geturl = listparams.scrollList.attr("ajaxurl");
                                                        getpagestart = listparams.scrollList.find(".scroll_item").length - listparams.scrollList.find(".emptyitem").length;
                                                        if(getpagestart < 0)getpagestart = 0;
                                                        listparams.getdata.pagestart = getpagestart;
                                                        /*
                                                        if(listparams.infiniteScroll && listparams.infiniteScroll[0]){
                                                                myApp.detachInfiniteScroll(listparams.infiniteScroll);
                                                                myApp.attachInfiniteScroll(listparams.infiniteScroll);
                                                        }
                                                        */
                                                        if(listparams.scrollList.find(".scroll_item").length < 10){
                                                                spScrollData();
                                                        }else{
                                                                if(getpagestart <= 0){
                                                                        spScrollData();
                                                                }
                                                        }
                                                });
                                        });
                                }
                                ajaxListEvent(pcontainer.find(".scroll_list"),pcontainer);
			}
			if(pname == "newlist" || pname == "newcustomerlist" || pname == "oldcustomerlist"){
				var startlayer = pcontainer.find(".startlayer");
				if(startlayer[0]) {
					var listswiper = pcontainer.find(".swiper-container.listswiper"),
						startSwiperContainer = pcontainer.find(".swiper-container.startswiper"),
						pagebullets = startSwiperContainer.find(".swiper-pagination-bullet"),
						slides = startSwiperContainer.find(".swiper-slide"),
						curslideindex = 0,
						curslide = slides.eq(0),
						startSwiper,
						preindex = 0;
					if (startlayer.find("video")[0]) {
						base.handleEleSize(startlayer.find("video"));
					}
					if (startlayer.find("iframe")[0]) {
						base.handleEleSize(startlayer.find("iframe"));
					}
					if (!ISBACK || pagebullets.length == 0) {
						startSwiper = myApp.swiper(startSwiperContainer, {
							pagination: startSwiperContainer.find(".swiper-pagination")
						});
						startSwiper.on("transitionEnd", function (event) {
							curslide = startSwiperContainer.find(".swiper-slide-active");
							var curindex = slides.index(curslide);
							pagebullets.eq(curindex).addClass("swiper-pagination-bullet-active");
							if (curindex < preindex) preindex = curindex;
							if (preindex >= slides.length - 1) {
								startlayer.remove();
							}
							preindex = curindex;
						});
					}
					startlayer.find(".ignore,.startin").unbind("click").click(function (event) {
						event.preventDefault();
						startlayer.remove();
					});
				}
			}
			if( pname == "friends"){
				var curtemplate = pcontainer.find(scrollList.attr("template")),
					grouptemplate = pcontainer.find(scrollList.attr("grouptemplate"));
				if(scrollList.find(".item").length == 0){
					var listparams = $.extend({},scrollListparams);
					listparams = $.extend(listparams,{
						geturl:"ajax/api.php?action=friends&module=user",
                                                handleFunction:function(d){
							return function(done){
								var did = d.id ? d.id : d.uid;
                                                                if (!$(pcontainer).find(".item[itemid=" + did + "]")[0]) {
                                                                        var curGroup = pcontainer.find(".group-" + d.group);
                                                                        if (!curGroup[0]) {
                                                                                var grouptemp = base.getNewTemplate(grouptemplate, pcontainer);
                                                                                grouptemp.find(".disgroupname").addClass("group-" + d.group);
                                                                                grouptemp.find(".disgroupname").html(d.group);
                                                                                grouptemp.find(".list").addClass("list-" + d.group);
                                                                                pcontainer.find(".friend-group").append(grouptemp.html());
                                                                                pcontainer.find(".hrefgroup").find(".item[role="+d.group+"]").show();
                                                                                grouptemp.remove();
                                                                        }
                                                                        base.createNewitem({
                                                                                template:curtemplate,
										data:d,
                                                                                area:pcontainer.find(".list-" + d.group),
                                                                                container:pcontainer
									});
                                                                }
								done();
							}
						},
                                                doneCallback:function(){
                                                        var fgroup = $(pcontainer.find(".hreftemplate .hrefgroup")).clone().appendTo("body").addClass("bodylayer");
                                                        fgroup.find(".item").unbind("click").click(function(){
                                                                var cur = $(this),
                                                                        currole = cur.attr("role"),
                                                                        totarget = scrollList.find(".group-"+currole);
                                                                if(totarget[0]){
                                                                        var targetTop = totarget[0].offsetTop;
                                                                        pcontainer.find(".page-content").scrollTop(targetTop);
                                                                }
                                                        });
                                                }
					});
					base.getListData(listparams);
				}else{
					var fgroup = $(pcontainer.find(".hreftemplate .hrefgroup")).clone().appendTo("body").addClass("bodylayer");
					fgroup.find(".item").unbind("click").click(function(){
						var cur = $(this),
							currole = cur.attr("role"),
							totarget = scrollList.find(".group-"+currole);
						if(totarget[0]){
							var targetTop = totarget[0].offsetTop;
							pcontainer.find(".page-content").scrollTop(targetTop);
						}
					});
				}
			}else if(pname == "support"){
				var grouptemplate = pcontainer.find(scrollList.attr("grouptemplate")),
					curtemplate = pcontainer.find(scrollList.attr("template"));
				if(pcontainer.find(".support-group .scroll_item").length == 0){
					base.ajax({
						myApp:myApp,
						url:"ajax/api.php?module=user&action=support",
						success:function(data){
							if(data && data.length>0){
								base.taskData({
									data : data,
									handleFunction : function(d){
										return function(done){
											if(!$(pcontainer).find(".item[sid="+d.id+"]")[0] && d.uid != d.ownid){
												var curGroup = pcontainer.find(".disgroupname[role="+d.stype+"]");
												if(!curGroup[0]){
													var grouptemp = base.getNewTemplate(grouptemplate,pcontainer);
													grouptemp.find(".disgroupname").attr("role",d.stype);
													grouptemp.find(".disgroupname").html(d.stype);
													grouptemp.find(".list").attr("role",d.stype);
													pcontainer.find(".support-group").append(grouptemp.html());
													grouptemp.remove();
												}
												base.createNewitem({
													container:pcontainer,
													template:curtemplate,
													data:d,
													area:pcontainer.find(".list[role="+d.stype+"]"),
													callback:function(curitem){
                                                                                                                curitem.attr("sid",d.id);
                                                                                                                if(d.uid == d.ownid){
                                                                                                                        curitem.addClass("active");
                                                                                                                }
													}
												});
											}
											done();
										}
									}
								});
							}
						}
					});
				}
			}else if(pname == "favorites"){
				if(scrollList.find(".scroll_item").length == 0){
					pcontainer.find(".scroll_list").click(function(event){
						var target = event.target;
						if(Dom(target).hasClass("delete")){
							var curitem = Dom(target).parent().parent(),
								module = curitem.attr("module"),
								curid = curitem.attr("moduleid"),
								curlink = curitem.find(".dishref").attr("href"),
								curtitle = curitem.find(".distitle").html();
							myApp.confirm("确定要删除吗？","",function(){
								base.ajax({
									myApp:myApp,
									url:"ajax/api.php?action=user_favorites&module="+module+"&id="+curid+"&do=delete",
									type:"post",
									data:{'content':curlink,'title':curtitle},
									success:function(data){
										if(data.flag == 1){
											base.tip("成功");
											curitem.remove();
										}else{
											base.tip(data.error);
										}
									}
								});
							});
						}
					});
				}
			}else if(pname == "address"){
				if(scrollList.find(".scroll_item").length == 0){
					scrollList.click(function(event){
						var target = event.target;
						if(Dom(target).hasClass("delete")){
							var curitem = Dom(target).parent().parent(),
								curid = curitem.attr("itemid");
							myApp.confirm("确定要删除吗？","",function(){
								base.ajax({
                                                                        myApp:myApp,
									url:"ajax/shop.php?action=address&id="+curid+"&do=delete",
									type:"post",
									success:function(data){
										if(data.flag == 1){
											curitem.remove();
											if(scrollList.find(".scroll_item").length == 0){
												scrollList.append(pcontainer.find(".emptytemplate").html());
											}
										}else{
											base.tip(data.error);
										}
									}
								});
							});
						}
					});
				}
			}else if(pname == "addAddress"){
				myApp.hideIndicator();
				var dostr = "add",t,editid = params.id,isFirst = true;
				var addressData;
				var linkman = pcontainer.find("#linkman"),
					phone = pcontainer.find("#telephone"),
					address = pcontainer.find("#address"),
					inputAreacode = pcontainer.find("#areacode"),
					disInput = pcontainer.find("#address-picker"),
					inputPicker = disInput.parent().find(".disaddress"),
					inputProvince = pcontainer.find("#province"),
					inputCity = pcontainer.find("#city"),
					inputCounties = pcontainer.find("#counties");
				if(editid){
					dostr = "update";
					base.getJSON({
						url:"ajax/shop.php?action=address&id="+editid,
						async:false,
						success:function(data){
							if(data){
								var d = data[0];
								linkman.val(d.linkman);
								phone.val(d.telephone);
								address.val(d.address);
								inputPicker.val(d.province+" "+d.city+" "+d.counties);
								inputProvince.val(d.province);
								inputCity.val(d.city);
								inputCounties.val(d.counties);
								inputAreacode.val(d.areacode);
								if(d.isdefault=="1"){
									pcontainer.find("#isdefault")[0].checked=true;
								}
							}
						}
					});
				}
				base.setAddressPicker({
					myApp : myApp,
					disInput : disInput,
					inputPicker : inputPicker,
					inputProvince : inputProvince,
					inputCity : inputCity,
					inputCounties : inputCounties,
					inputAreacode : inputAreacode
				});
			}else if(pname == "profile"){
				pcontainer.find(".refreshdiv,.refreshimg").unbind("click").click(function(){
					Dom.ajax({
						url:"/mobile/ajax/api.php?action=refreshavatar&module=user",
						type:"get",
						dataType:"json",
						success:function(data){
							if(data.flag == 1){
								base.tip("成功",function(){
									pcontainer.find(".refreshimg")[0].src = data.data+"?"+new Date().getTime();
								});
							}else{
								base.tip(data.error);
							}
						}
					});
				});
				var userphotoarea = pcontainer.find(".userphoto");
				userphotoarea.find(".setphoto").unbind("click").click(function(){
					event.preventDefault();
					var curtarget = $(this);
					var userbgmodal = $(myApp.popup(pcontainer.find(".template").html()));
					var curForm = userbgmodal.find("form"),
						inputphoto = userbgmodal.find("input[type=hidden]"),
						curcliparea = userbgmodal.find(".cliparea");
					var clipW = 300,clipH = clipW*230/640;
					userbgmodal.find("input[type=file]").change(function(){
						base.ajaxSubmit({
							myApp:myApp,
							form:curForm,
							url:"ajax/api.php?action=app_upload_img&module=user",
							success:function(data){
								if(data.flag && data.flag==-1){
									base.tip("图片上传失败");
								}else{
									var imgurl = data[0].url;
									var photourl = base.getPhoto(imgurl),
										inputphoto = userbgmodal.find(".hideinput");
									userbgmodal.find(".disphoto img").attr("src",photourl);
									userbgmodal.find(".addicon").hide();
									userbgmodal.find(".disphoto").show();
									curcliparea.find("img").attr("src",photourl);
									curcliparea.show();
									curcliparea.find("img")[0].onload = function(){
										require(["clip"],function(){
											new Framework7({
												clip: {
													view : curcliparea,
													clipElement :curcliparea.find(".swapanim"),
													snapshot: curcliparea.find(".clipsnap"),
													clipWidth : clipW,
													clipHeight : clipH,
													setInCenter : true,
													onConfirm : function() {
														base.ajax({
															myApp:myApp,
															url:"/mobile/ajax/api.php?action=cutimage&module=user",
															data:{srcimg:photourl,cut_x:arguments[0],cut_y:arguments[1], cut_width:clipW, cut_height:clipH,ratio:arguments[6]},
															type:"post",
															async:false,
															success:function(d){
																if(d.flag==1){
																	curcliparea.find(".disphoto img").attr("src",d.data);
																	inputphoto.val(d.data);
																}else{
																	base.tip(d.error);
																}
															}
														});
													}
												}
											});
										})
									}
									inputphoto.val(imgurl);
								}
							}
						});
					});
					userbgmodal.find(".disphoto .delete").click(function(){
						userbgmodal.find(".disphoto img").attr("src","");
						userbgmodal.find(".addicon").show();
						userbgmodal.find(".disphoto").hide();
						inputphoto.val("");
					});
					userbgmodal.find(".btn-sub").click(function(){
						userbgmodal.find(".confirm-icon").parent().click();
						setTimeout(function(){
							if(inputphoto.val()!=""){
								pcontainer.find("#userphoto").val(inputphoto.val());
								var photoimg = userphotoarea.find("img");
								if(photoimg[0]){
									photoimg.attr("src",base.getPhoto(inputphoto.val()));
								}else{
									userphotoarea.prepend('<img src="'+base.getPhoto(inputphoto.val())+'" />');
									userphotoarea.append(pcontainer.find(".template1").html());
								}
								userbgmodal.find(".cliparea").hide();
								myApp.closeModal(userbgmodal);
							}
						},1000)
					});
				});
				userphotoarea.unbind("click").click(function(event){
					var node = event.target;
					while(node){
						var curtarget = $(node);
						if(node.nodeType === 1 && curtarget.hasClass("delphoto")){
							myApp.confirm("确定要恢复默认封面吗？","",function(){
								userphotoarea.find("img").remove();
								curtarget.remove();
								pcontainer.find("#userphoto").val("");
							});
							break;
						}
						node = node.parentNode;
					}
				});
			}else if(pname == "user"){
				var xtrans = pcontainer.find(".xtrans");
				if(xtrans[0]){
					if(!ISBACK){
						require(["jquery.transit.min"],function(){
							xtrans.transition({
								perspective: '500px',
								rotateX: 360,
								delay:800
							});
						});
					}
				}
				var adminitem = pcontainer.find("#user_group_li");
				if(adminitem[0]){
					adminitem.unbind("click").click(function(event){
						event.preventDefault();
						base.ajax({
							myApp:myApp,
							url:"/mobile/ajax/user.php?action=gesture",
							dataType:"html",
							success:function(data){
								$("#admingesture").val(data);
								userCanvas();
							}
						});
					});
				}
			}else if(pname == "gesture"){
				var flag = 1,isFirst = true,ptype = params.type,uid = pcontainer.find("#uid").val(),
					havPwd = false,oldPwd,fPwd,
					oldTip = pcontainer.find(".old_tip"),
					gesture = pcontainer.find("#gesture").val();
				if(gesture!="" && ptype!="forget"){
					havPwd = true;
					oldPwd = gesture;
					oldTip.show();
					flag = 0;
				}
				base.CanvasPwd({
					pcontainer : pcontainer,
					callback :function(sPwd,callback){
						if(flag==0 && havPwd){
							if(sPwd != oldPwd){
								flag = 0;
								base.tip("原密码输入错误",callback);
							}else{
								flag = 1;
								base.tip("请输入新密码",callback);
							}
						}else{
							if(isFirst && flag==1){
								fPwd = sPwd;
								isFirst = false;
								base.tip("请再次确认密码",callback);
							}else{
								if(sPwd != fPwd){
									base.tip("再次密码不同",callback);
									sPwd = "";
								}else{
									Dom.ajax({
										url : "/mobile/ajax/api.php?module=user&action=gesture",
										data : {uid:uid,gesture:sPwd},
										type:"post",
										dataType:"html",
										success:function(data){
											if(data == "1"){
												base.tip("密码设置成功",function(){
													mainView.router.load({url:"user.php"});
												});
											}else{
												base.tip(data);
											}
										}
									});
								}
							}
						}
					}
				});

			}else if(pname == "rule"){
				var template = pcontainer.find(".template"),
					appendarea = pcontainer.find(".ruleinfo .appendarea");
				if(appendarea.find(".item").length == 0) {
					base.getJSON({
						url: "ajax/api.php?action=rule&module=user",
						success: function (data) {
							if (data && data.length > 0) {
								pcontainer.find(".ruleinfo").show();
								base.taskData({
									data: data,
									handleFunction: function (d) {
										return function (done) {
											var newtemplate = base.getNewTemplate(template, pcontainer);
											newtemplate.find(".disdesc").html(d.desc);
											newtemplate.find(".discredit").html(d.credit);
											$(newtemplate.find("tbody tr")[0].outerHTML).appendTo(appendarea);
											newtemplate.remove();
											done();
										}
									}

								});
							} else {
								pcontainer.find(".ruleinfo").remove();
							}
						}
					});
				}
			}else if(pname == "operator"){
				var pticket = params.ticket,
					usersubscribe = pcontainer.find("#usersubscribe").val(),
					curid = params.id;
				if(usersubscribe != 1){
					base.handleSubscribe({myApp:myApp,pcontainer:pcontainer,pticket:pticket});
				}else{
					operatorSubscribe1({pcontainer:pcontainer,id:curid});
				}
			}else if(pname == "operatorsign"){
				var animateavatar = pcontainer.find(".avatar_animate .avatar"),
					lastid = 0,
					signInterval,
					wW = document.body.clientWidth,
					itemW,
					imgH,
					cols = Math.ceil(wW/110);
				if(cols < 3)cols=3;
				itemW = wW/cols;
				imgH = Math.floor(wW/cols-20);
				clearInterval(signInterval);
				var appendarea = pcontainer.find(".userlist");
				function getSignUser(){
					base.getJSON({
						url:"ajax/operation.php?module=operator&action=screenmembers&id="+params.id+"&lastid="+lastid,
						success:function(data){
							if(data && data.length>0){
								base.taskData({
									data:data,
									handleFunction:function(d){
										return function(done){
											if(!pcontainer.find(".scroll_item[itemid="+d.id+"]")[0]){
												lastid=d.id;
												var newtemp = base.getNewTemplate(pcontainer.find(appendarea.attr("template")),pcontainer);
												base.setDisinfo(d,newtemp);
												newtemp.find(".scroll_item").css("width",itemW);
												var curitem = newtemp.find(".scroll_item").appendTo(appendarea);
												newtemp.remove();
                                                                                                curitem.data("data",d);
												if(d.uid == pcontainer.find("#userid").val()){
													var animatetmp = base.getNewTemplate(pcontainer.find(appendarea.attr("animatetemplate")),pcontainer);
													animatetmp.find(".avatar").attr("src",d.avatar);
													var curanimate = $(animatetmp.children()[0].outerHTML).appendTo(pcontainer.find(".bg"));
													animatetmp.remove();
													curanimate.find(".avatar").addClass("animated");
													curanimate.find(".avatar").on("webkitAnimationEnd",function(){
														curitem.find(".disavatar").addClass("animated");
														curanimate.remove();
														done();
													});
												}else{
													curitem.find(".disavatar").addClass("animated");
													done();
												}

											}else{
												done();
											}
										}
									}
								});
							}
						}
					});
				}
				base.getJSON({
					url:"ajax/operation.php?action=qiandao&module=operator&id="+params.id,
					success:function(data){
						if(data.flag == 0){
							base.handleSubscribe({myApp:myApp,pcontainer:pcontainer});
						}else if(data.flag != -1){
							getSignUser();
							signInterval = setInterval(function(){
								getSignUser();
							},1000);
						}else{
							var newtmp = base.getNewTemplate(pcontainer.find(appendarea.attr("formtemplate")),pcontainer);
							newtmp.find("#linkman").attr("value",data.data.linkman);
							var pstr = '';
							for(var i=0;i<data.data.select.length;i++){
								var p = data.data.select[i];
								if(data.data.position == p){
									pstr += '<option selected value="'+p+'">'+p+'</option>';
								}else{
									pstr += '<option value="'+p+'">'+p+'</option>';
								}
							}
							newtmp.find("#position").append(pstr);
							var html = '<form class="signinfoForm">'+newtmp.html()+'</form>';
							newtmp.remove();
							base.prompt({
								myApp:myApp,
								title:"补充资料",
								text:html,
								callbackOk:function(promptmodal,closeModle){
									var curmodal = promptmodal.modal;
									if(base.trim(curmodal.find("#linkman").val()) == ""){
										base.tip("请填写姓名");
										return false;
									}
									if(base.trim(curmodal.find("#position").val()) == -1){
										base.tip("请选择部门");
										return false;
									}
									base.ajaxSubmit({
										myApp:myApp,
										form:curmodal.find("form"),
										url:"ajax/operation.php?action=position&module=operator&id="+params.id,
										success:function(ret){
											if(ret.flag != 1){
												base.tip(ret.error);
											}else{
												closeModle && closeModle();
												base.ajax({
													myApp:myApp,
													url:"ajax/operation.php?action=qiandao&module=operator&id="+params.id,
													success:function(r){
														getSignUser();
														signInterval = setInterval(function(){
															getSignUser();
														},1000);
													}
												});
											}
										}
									});
								}
							});
						}
					}
				});
			}else if(pname == "operatorscene") {
                                if(!$("#scene_eqxiu")[0]){
                                        $('<link id="scene_eqxiu" href="data/css/scene_eqxiu.css?v='+jsversion+'" rel="stylesheet" type="text/css"/>').prependTo(pcontainer);
                                }
                                if(!window.scene_success_txt){
                                        var scene_success_txt = '提交成功';
                                        window.scene_success_btn_txt = scene_success_btn_txt;
				}
				if(!window.scene_success_btn_txt){
                                        var scene_success_btn_txt = '确定';
                                        window.scene_success_btn_txt = scene_success_btn_txt;
				}
				var bgmusic = pcontainer.find("#bgmusic").val(),
					cover = pcontainer.find("#cover").val();
                                require(["jquery-2.0.3.min","scenedir/show/"+params.id+"/operator_"+params.id+"_json"],function(){
					window.scene = {
						id:55779198,
						code:"37Ykfi5f",
						name: pcontainer.find("#share_title").val(),
						description: pcontainer.find("#share_desc").val(),
						pageMode:0,
						cover:"/mobile/data/images/logo.png",
						property:'{"slideNumber":true,"eqAdType":1,"shareDes":{"title":{},"description":{},"avatar":false},"hideEqAd":false,"triggerLoop":true,"autoFlipTime":3}',
						createTime:1472113635000,
						publishTime:1472463332000,
						bizType:0,
						type:101,
						userId:"4a2d8af95479e3c00154a3e3c01b5997",
						userType: "1",
						memberType: "",
						expiryTime: "",
						isTemplate: 0,
						dsAppId: "",
						loadingLogo: "",
                                                eqAdType : "0"
					};
					if(bgmusic != ""){
						window.scene["bgAudio"] = {
							url:bgmusic,
							name:bgmusic
						};
					}
					if(cover != ""){
						window.scene["cover"] = cover;
					}
					require(["scene_eqxiu"],function(){
						EQX.bootstrap();
					});
				});
			}else if(pname == "lottery_main"){
				var pticket = params.ticket,
					usersubscribe = pcontainer.find("#usersubscribe").val(),
					curid = params.id,
					lotteryarea = pcontainer.find(".lotteryarea"),
					mainbg = lotteryarea.find(".mainbg"),
					lotteryinfo = lotteryarea.find(".info"),
					lottername = lotteryarea.find(".lotteryname .name"),
					lotterprize = lotteryarea.find(".prize .name"),
					shareinfo = lotteryarea.find(".shareinfo");
				if(usersubscribe != 1){
					base.handleSubscribe({myApp:myApp,pcontainer:pcontainer,pticket:pticket});
				}else{
					operatorSubscribe1({pcontainer:pcontainer,id:curid});
					if(pticket){
						shareinfo.remove();
						Dom.ajax({
							url:"/mobile/ajax/operation.php?action=operatorlottery&module=operator&id="+curid,
							type:"get",
							dataType:"json",
							success:function(data){
								var ret = data.data;
								if(data.flag == 1){
									lotteryarea.addClass("smile");
									lottername.html(ret.name);
									lotterprize.html(ret.prize);
								}else if(data.flag == -1){
									lotteryarea.addClass("cry");
								}else if(data.flag == 0){
									lotteryarea.addClass("smile");
									lottername.html(data.error);
								}
							}
						});
					}else{
						var shareuid = params.share_uid;
						shareinfo.show();
						if(shareuid){
							shareinfo.find(".info1").show();
							shareinfo.find(".info2").remove();
							pcontainer.find(".sharetip").remove();
							pcontainer.find(".shareimg").show();
							Dom.ajax({
								url:"/mobile/ajax/operation.php?action=getfriendprize&module=operator&id="+curid+"&share_uid="+shareuid,
								type:"get",
								dataType:"json",
								success:function(data){
									if(pcontainer.find(".coin_view")[0]){
										pcontainer.find(".coin_view").remove();
									}
									if(data.flag == 1){
										var ret = data.data;
										shareinfo.find(".linkman").html(ret.linkman);
										shareinfo.find(".lotteryname1").html(ret.name);
										shareinfo.find(".prize1").html(ret.prize);
									}
								}
							});
						}else{
							pcontainer.find(".sharetip").remove();
							pcontainer.find(".shareimg").remove();
							shareinfo.find(".info1").remove();
							shareinfo.find(".info2").show();
						}
					}
				}
			}else if( pname == "operator_comments"){
				base.emojiEvent(pcontainer.find("#emoji_list1"), pcontainer.find("#message"));
			}else if( pname == "operator_censor"){
				var curid = params.id,lastcensorid = 0;
				var listparams = $.extend({}, scrollListparams);
				listparams = $.extend(listparams,{
					geturl:"/mobile/ajax/api.php?action=comment&edit=list&module=operator&bcensor=1&nid="+curid+"&lastid2="+lastcensorid,
					curtemplate:pcontainer.find(".template1"),
					scrollList:pcontainer.find("#censortab1 .scroll_list"),
					successCallback:function(data){
						if(data && data.length>0){
							var fid = data[0].id , lid = data[data.length-1].id;
							lastcensorid = fid > lid ? fid : lid;
						}
					}
				});
				base.getListData(listparams);
				setInterval(function() {
					base.getListData(listparams);
				}, 6000);
				pcontainer.find("#censortab1 .scroll_list").unbind("click").click(function(event){
					var node = event.target;
					while(node){
						var curtarget = $(node);
						if(node.nodeType === 1){
							if(curtarget.hasClass("passcensor")){
								event.preventDefault();
								var curitem = curtarget.parents(".card"),
									curid = curitem.attr("itemid");
								base.ajax({
									myApp:myApp,
									url:"/mobile/ajax/api.php?action=comment&module=user&edit=censorok&id="+curid,
									type:"post",
									success:function(ret){
										if(ret.flag==1){
											var tempid = Date.parse(new Date());
											var str = '<div class="tempitem-'+tempid+'" style="display:none;">'+curitem[0].outerHTML+'</div>';
											$("body").append(str);
											curitem.remove();
											var tempitem = $(".tempitem-"+tempid);
											tempitem.find(".card-footer").remove();
											pcontainer.find("#censortab2 .scroll_list").prepend(tempitem.html());
											tempitem.remove();
										}else{
											base.tip(ret.error);
										}
									}
								});
							}else if(curtarget.hasClass("delcensor")){
								event.preventDefault();
								var curitem = curtarget.parents(".card"),
									curid = curitem.attr("itemid");
								base.ajax({
									myApp:myApp,
									url:"/mobile/ajax/api.php?action=comment&module=user&edit=censorcancel&id="+curid,
									type:"post",
									success:function(ret){
										if(ret.flag==1){
											curitem.remove();
										}else{
											base.tip(ret.error);
										}
									}
								});
							}
						}
						node = node.parentNode;
					}
				});
				var listparams1 = $.extend({}, scrollListparams);
				listparams1 = $.extend(listparams1,{
					geturl:"/mobile/ajax/api.php?action=comment&edit=list&module=operator&nid="+curid,
					getdata:{pagestart:0,limit:10},
					curtemplate:pcontainer.find(".template2"),
					scrollList:pcontainer.find("#censortab2 .scroll_list"),
					loading:false,
					doneCallback:function(){listparams1.loading = false;}
				});
				if(listparams1.scrollList.find(".scroll_item").length == 0) {
					base.getListData(listparams1);
					listparams1.infiniteScroll.on('infinite', function () {
						if (listparams1.loading) return;
						listparams1.loading = true;
						if (pcontainer.find("#censortab2.active")[0]) {
							listparams1.getdata.pagestart = listparams1.scrollList.find(".scroll_item").length - listparams1.scrollList.find(".emptyitem").length;
							base.getListData(listparams1);
						}
					});
				}
			}else if(pname == "pollsinput"){
				var template = pcontainer.find(".template"),
					answerlist = pcontainer.find(".answerlist"),
					selectlimit = 0;
				if (pcontainer.find("#usersubscribe").val() != 1) {
					base.handleSubscribe({
						myApp: myApp,
						pcontainer: pcontainer,
						pticket: params.pticket
					});
					return false;
				}
				if(answerlist.find(".scroll_item").length == 0){
					Dom.ajax({
						url: "/mobile/ajax/operation.php?action=getdata&id=" + params.id,
						type: "post",
						dataType: "json",
						success: function (data) {
							var polltype = data.maxselected == 1 ? 'checkbox' : 'radio',
								index = 0, html = '';
							selectlimit = data.selectlimit;
							pcontainer.find(".selectlimit").val(data.selectlimit);
							pcontainer.find(".p_title").html(data.title);
							base.taskData({
								data: data.answer,
								handleFunction: function (d) {
									return function (done) {
										var newtemplate = base.getNewTemplate(template, pcontainer);
										newtemplate.find("label").addClass("label-" + polltype);
										newtemplate.find("label input").attr("type", polltype);
										newtemplate.find("label input").attr("name", "name_" + data.id + "[]");
										newtemplate.find("label input").val(index);
										newtemplate.find("label .icon").addClass("icon-form-" + polltype);
										if (d.photo && d.photo != "") {
											newtemplate.find(".disphoto").attr("src", d.photo);
										} else {
											newtemplate.find(".img").remove();
										}
										newtemplate.find(".distitle").html(d.title);
										newtemplate.find(".disresult").html(d.results);
										html += newtemplate.html();
										newtemplate.remove();
										index++;
										done();
									}
								},
								callback: function () {
									answerlist.html(data.content.replace("{{answerdata}}", html));
								}
							});
						}
					});
					answerlist.on("click", ".label-checkbox", function (event) {
						event.preventDefault();
						var cur = $(this),
							curck = cur.find("input[type=checkbox]")[0],
							curchecked = curck.checked;
						if (!curchecked) {
							if (answerlist.find("input[type=checkbox]:checked").length >= selectlimit) {
								base.tip("最多选择" + selectlimit + "项");
								return false;
							} else {
								curck.checked = !curchecked;
							}
						} else {
							curck.checked = !curchecked;
						}
					});
				}
			}else if(pname == "pollsnews"){
				var answerlist = pcontainer.find(".answerlist"),
                                        template = pcontainer.find(answerlist.attr("template")),
					selectlimit = 0;
				if (pcontainer.find("#usersubscribe").val() != 1) {
					base.handleSubscribe({
						myApp: myApp,
						pcontainer: pcontainer,
						pticket: params.pticket
					});
					return false;
				}
				function getAanswerData(listtype){
					base.getJSON({
						url:"ajax/operation.php?action=pollsresult&listtype="+listtype+"&id="+params.id,
						success:function(data){
							var polltype = data.maxselected == 1 ? 'checkbox' : 'radio',
								index = 0, html = '';
							selectlimit = data.selectlimit;
							pcontainer.find(".selectlimit").val(data.selectlimit);
							pcontainer.find(".p_title").html(data.title);
							base.taskData({
								data: data,
								handleFunction: function (dt) {
									return function (done) {
										var d = dt.data;
										var newtemplate = base.getNewTemplate(template, pcontainer);
										newtemplate.find(".distitle").html(d.title);
										newtemplate.find(".disbg").css("background-image","url("+base.getPhoto(d.photo)+")");
										newtemplate.find(".disresult").html(dt.number);
										newtemplate.find(".disorder").html(dt.paihang);
										newtemplate.find(".discode").html(dt.code);
										newtemplate.find(".dishref").attr("href","news.php?id="+d.id);
										newtemplate.find(".pollvote").attr("key",dt.key);
										answerlist.append(newtemplate.html());
										newtemplate.remove();
										index++;
										done();
									}
								}
							});
						}
					});
				}
				pcontainer.find(".order").click(function(event){
					var cur = $(this),
						curtype = cur.attr("role");
					if(!cur.hasClass("active")){
						pcontainer.find(".order").removeClass("active");
						cur.addClass("active");
						answerlist.html("");
						if(curtype == "paihang"){
							answerlist.addClass("paihang");
						}else{
							answerlist.removeClass("paihang");
						}
						getAanswerData(curtype);
					}
				});
				if(answerlist.find(".scroll_item").length == 0){
					getAanswerData("question");
					answerlist.on("click", ".pollvote", function (event) {
						event.preventDefault();
						var cur = $(this),
							curitem = cur.parents(".scroll_item");
						base.ajax({
							myApp:myApp,
							url:"ajax/operation.php?action=addpollsnews",
							data:{id:params.id,answerkey:cur.attr("key")},
							type:"post",
							success:function(data){
								if(data.flag == 1){
									base.tip(data.error);
									var curresult = curitem.find(".disresult"),
										resultnum = parseInt(curresult.html()),
										polls = pcontainer.find("#polls"),
										pollsnum = parseInt(polls.html());
									curresult.html(resultnum+1);
									polls.html(pollsnum+1);
								}else{
									base.tip(data.error);
								}
							}
						});
					});
				}
			}else if(pname == "pollsranking"){
				var toplist = pcontainer.find(".ranktop"),
					answerlist = pcontainer.find(".answerlist"),
					selectlimit = 0;
				if (pcontainer.find("#usersubscribe").val() != 1) {
					base.handleSubscribe({
						myApp: myApp,
						pcontainer: pcontainer,
						pticket: params.pticket
					});
					return false;
				}
				function getAanswerData(listtype){
					base.getJSON({
						url:"ajax/operation.php?action=pollsresult&listtype="+listtype+"&id="+params.id,
						success:function(data){
							var polltype = data.maxselected == 1 ? 'checkbox' : 'radio',
								index = 0, html = '';
							selectlimit = data.selectlimit;
							pcontainer.find(".selectlimit").val(data.selectlimit);
							pcontainer.find(".p_title").html(data.title);
							base.taskData({
								data: data,
								handleFunction: function (dt) {
									return function (done) {
										var d = dt.data;
										var newtemplate,appendarea;
										if(index < 3){
											appendarea = toplist.find(".appendarea");
										}else{
											appendarea = answerlist;
										}
                                                                                newtemplate = base.getNewTemplate(pcontainer.find(appendarea.attr("template")), pcontainer);
										base.setDisinfo(dt,newtemplate);
                                                                                base.setDishref(newtemplate,dt);
										newtemplate.find(".disbg").css("background-image","url("+base.getPhoto(d.photo)+")");
										newtemplate.find(".pollvote").attr("key",dt.key);
										appendarea.append(newtemplate.html());
										newtemplate.remove();
										index++;
										done();
									}
								}
							});
						}
					});
				}
				if(answerlist.find(".scroll_item").length == 0){
					getAanswerData("question");
					pcontainer.on("click", ".pollvote", function (event) {
						event.preventDefault();
						var cur = $(this),
							curitem = cur.parents(".scroll_item");
						base.ajax({
							myApp:myApp,
							url:"ajax/operation.php?action=addpollsnews",
							data:{id:params.id,answerkey:cur.attr("key")},
							type:"post",
							success:function(data){
								if(data.flag == 1){
									base.tip(data.error);
									var curresult = curitem.find(".disnumber"),
										resultnum = parseInt(curresult.html()),
										polls = pcontainer.find("#polls"),
										pollsnum = parseInt(polls.html());
									curresult.html(resultnum+1);
									polls.html(pollsnum+1);
								}else{
									base.tip(data.error);
								}
							}
						});
					});
				}
			}else if(pname == "taskinfo"){
				var curid = params.id,
					newshref = pcontainer.find(".newshref"),
					receiveFlag = false,
					receivetask = pcontainer.find(".receive-task");
				receivetask.unbind("click").click(function (event) {
					base.ajax({
						myApp: myApp,
						url: "/mobile/ajax/tasks.php?action=get",
						data: {id: curid},
						type: "post",
						success: function (data) {
							if (data.flag == 1) {
								receiveFlag = true;
								receivetask.remove();
								pcontainer.find(".afterreceive").show();
								base.tip("领取成功，去做任务吧!");
							} else {
								base.tip(data.error);
							}
						}
					});
				});
				pcontainer.find(".complete-task").unbind("click").click(function (event) {
					base.ajax({
						myApp: myApp,
						url: "/mobile/ajax/tasks.php?action=submit",
						data: {id: curid},
						type: "post",
						success: function (data) {
							if (data.flag == 1) {
								receiveFlag = true;
								base.tip("任务完成,已经发放奖励!");
							} else {
								base.tip(data.error);
							}
						}
					});
				});
				newshref.unbind("click").click(function (event) {
					if (!receiveFlag) {
						base.tip("请先领取任务");
					}
				});
				var rankparams = $.extend({}, scrollListparams);
				rankparams = $.extend(rankparams, {
					geturl: "/mobile/ajax/tasks.php?action=ranklist&id=" + curid,
					curtemplate: pcontainer.find(".tempalte")
				});
				if(scrollList.find(".scroll_item").length == 0) {
					base.getListData(rankparams);
				}
			}else if(pname == "taskinfo1"){
				var curid = params.id,
					newshref = pcontainer.find(".newshref"),
					receiveFlag = false,
					receivetask = pcontainer.find(".receive-task");
				receivetask.unbind("click").click(function(event){
					base.ajax({
						myApp:myApp,
						url:"/mobile/ajax/tasks.php?action=get",
						data:{id:curid},
						type:"post",
						success:function(data){
							if(data.flag == 1){
								receiveFlag = true;
								receivetask.remove();
								pcontainer.find(".afterreceive").show();
								base.tip("领取成功，去做任务吧!");
							}else{
								base.tip(data.error);
							}
						}
					});
				});
				pcontainer.unbind("click").find(".complete-task").click(function(event){
					base.ajax({
						myApp:myApp,
						url:"/mobile/ajax/tasks.php?action=submit",
						data:{id:curid},
						type:"post",
						success:function(data){
							if(data.flag == 1){
								receiveFlag = true;
								base.tip("任务完成,已经发放奖励!");
							}else{
								base.tip(data.error);
							}
						}
					});
				});
				newshref.unbind("click").click(function(event){
					if(!receiveFlag){
						base.tip("请先领取任务");
					}
				});
				var rankparams = $.extend({}, scrollListparams);
				rankparams = $.extend(rankparams,{
					geturl:"/mobile/ajax/tasks.php?action=ranklist&id="+curid,
					curtemplate:pcontainer.find(".tempalte")
				});
				if(scrollList.find(".scroll_item").length == 0) {
					base.getListData(rankparams);
				}
			}else if(pname == "slotmachine_main"){
				var usecredits = parseInt(pcontainer.find("#usecredits").val()),
					allowarea = pcontainer.find("#allowcredit"),
					allowcredit = parseInt(allowarea.html()),
					startMarquee = false,
					addressflag = pcontainer.find("#addressflag").val(),
					gamearea = $(pcontainer).find(".gamearea"),
					gW = gamearea.width(),
					imgH = gW*33.333/100,
					pticket = params.ticket,
					usersubscribe = pcontainer.find("#usersubscribe").val(),
					curid = params.id,
					tigerAjax;
				gamearea.find(".slotMachine").height(imgH);
				gamearea.find(".slot").height(imgH);
				if(usersubscribe != 1){
					base.handleSubscribe({myApp:myApp,pcontainer:pcontainer,pticket:pticket});
				}else{
					base.getJSON({
						url:"/mobile/ajax/operation.php?action=gameinfo&id="+params.id,
						async:false,
						success:function(data){
							if(data){
								var template1 = pcontainer.find(".template1"),index=1;
								base.taskData({
									data:data.lotteryinfo,
									handleFunction:function(d){
										return function(done){
											var newtemplate1 = base.getNewTemplate(template1,pcontainer),
											curslot = newtemplate1.find(".slot");
											curslot.addClass("slot"+index);
											curslot.attr("index",d.id);
											curslot.css({height:imgH,"background-image":"url("+base.getPhoto(d.photo)+")"});
											pcontainer.find(".slotMachine").append(newtemplate1.html());
											newtemplate1.remove();
											index++;
											done();
										}
									}
								});
							}
						}
					});
					var marqueearea = $(pcontainer).find(".marqueearea");
					function setUserinfo(d){
						if(!pcontainer.find("#win-"+d.id)[0]){
							var template = pcontainer.find(".template"),
								newtemplate = base.getNewTemplate(template,pcontainer);
							newtemplate.find(".dislinkman").html(d.linkman);
							newtemplate.find(".disphone").html(d.telephone);
							newtemplate.find(".diswinning").html(d.winning);
							var lastli = marqueearea.find("li:last-child"),
								lilen = marqueearea.find("li").length;
							marqueearea.append('<li id="win-'+d.id+'">'+newtemplate.html()+'</li>');
							newtemplate.remove();
						}
					}
					var slotPagestart = 0,slotLimit = 4;
					slotInterVal = setInterval(function(){
						slotPagestart = marqueearea.find("li").length;
						getLotteryResult();
					},3000);
					function getLotteryResult(){
						base.getJSON({
							url:"ajax/operation.php?action=lotteryresult",
							data:{id:params.id,pagestart:slotPagestart,limit:slotLimit},
							success:function(data){
								if(data && data.length > 0){
									base.taskData({
										data:data,
										handleFunction:function(d){
											return function(done){
												setUserinfo(d);
												done();
											}
										},
										callback:function(){
											if(!startMarquee && marqueearea.find("li").length > 4){
												startMarquee = true;
												base.marqueeEvent({
													isStoped : false,
													scrollWrap : pcontainer.find(".scrollWrap"),
													scrollItem : pcontainer.find(".scrollMsg")
												});
											}
										}
									});
								}
							}
						});
					}
					getLotteryResult();
					window.rnd = {};
					window.plus=0;
					require(["slotMachine"],function(){
						var machine1 = $(pcontainer).find("#machine1").slotMachine({
							active	: 0,
							delay	: 100
						});
						var machine2 = $(pcontainer).find("#machine2").slotMachine({
							active	: 1,
							delay	: 100
						});
						var machine3 = $(pcontainer).find("#machine3").slotMachine({
							active	: 2,
							delay	: 100
						});
						tigerAjax = function(){
							window.res = {};
							base.getJSON({
								url:"ajax/operation.php?action=tigergame&id="+params.id,
								async:false,
								success:function(data){
									if(data.flag == 1){
										allowcredit = allowcredit - usecredits;
										if(data.credit){
											allowarea.html(data.credit);
											allowcredit = data.credit;
										}else{
											allowarea.html(allowcredit);
										}
										var dlocation = data.location;
										if(dlocation && dlocation.length > 0){
											for(var i=0;i<dlocation.length;i++){
												var cindex = i+1;
												window.res[cindex] = dlocation[i];
											}
										}
										window.plus=1;
										machine1.shuffle(3);
										setTimeout(function(){
											machine2.shuffle(3);
										}, 50);
										setTimeout(function(){
											machine3.shuffle(3,function(){
												if(data.isprize){
													myApp.alert("恭喜您,中了"+data.prizelevel+"等奖，奖品为"+data.prize,"",function(){
														if(addressflag != 1){
															promptAddress();
														}
													});
												}else{
													base.tip("很遗憾，未中奖");
												}
												if(data.winning){
													setUserinfo(data.winning);
												}
											});
										}, 100);
									}else{
										base.tip(data.error);
									}
								}
							});
						}
						pcontainer.find("#slotMachineButton1").click(function(){
							var cur = $(this);
							if(!cur.hasClass("disabled")){
								tigerAjax();
							}
						});
					});
					function promptAddress(){
						base.prompt({
							myApp:myApp,
							title:"补充资料",
							text:pcontainer.find(".edit_area").html(),
							beforeClick:function(promptmodal){
								var modalarea = promptmodal.modal;
								var addressData;
								var inputAreacode = modalarea.find("#areacode"),
									disInput = modalarea.find("#address-picker"),
									inputProvince = modalarea.find("#province"),
									inputCity = modalarea.find("#city"),
									inputCounties = modalarea.find("#counties");
								base.setAddressPicker({
									myApp : myApp,
									disInput : disInput,
									inputPicker : disInput.parent().find(".disaddress"),
									inputProvince : inputProvince,
									inputCity : inputCity,
									inputCounties : inputCounties,
									inputAreacode : inputAreacode
								});
							},
							callbackOk:function(promptmodal,closeModal){
								var infoForm = promptmodal.modal.find("form");
								base.ajaxSubmit({
									myApp:myApp,
									form:infoForm,
									url:"/mobile/ajax/operation.php?action=address",
									success:function(data){
										if(data.flag == 1){
											base.tip("数据提交成功",function(){
												addressflag = 1;
												pcontainer.find("#addressflag").val(1);
												tigerAjax();
											});
											closeModal && closeModal();
										}else{
											base.tip(data.error);
										}
									}
								});
							}
						});
					}
				}
			}else if(pname == "wheelmain"){
				if(!$("#awardRotateJs")[0]){
					$('<script id="awardRotateJs" src="data/js/wheel/awardRotate.js"></script>').appendTo($("head"));
				}
				var giftdata = {},
					wheelnameArr = pcontainer.find('#wheelname').val().split(","),
					wheelidArr = pcontainer.find('#wheelid').val().split(","),
					giftArr = [],colorArr = [],fontcolorArr = [],
					wheelcanvas = pcontainer.find(".wheelcanvas"),
					wheelTip = pcontainer.find(".wheel-tip"),
					tipinner = wheelTip.find(".tipinner"),
					tiptxt = wheelTip.find(".txtarea"),
					indexArr = [];
				for(var i=0;i<wheelnameArr.length;i++){
					giftdata[wheelidArr[i]] = {
						index:giftArr.length+1,
						id:wheelidArr[i],
						name:wheelnameArr[i]
					};
					giftArr.push(wheelnameArr[i]);
					colorArr.push("#FF8584");
					fontcolorArr.push("#CB0030");
					giftArr.push("谢谢参与");
					colorArr.push("#FFEE7B");
					fontcolorArr.push("#CB0030");

					/*
					giftArr.push(wheelnameArr[i]);
					colorArr.push("#ff2653");
					fontcolorArr.push("#fff");
					giftArr.push("谢谢参与");
					colorArr.push("#fff");
					fontcolorArr.push("#5b8edc");
					*/

					/*
					colorArr.push("#f4b53e");
					fontcolorArr.push("#fff");
					giftArr.push("谢谢参与");
					colorArr.push("#fff");
					fontcolorArr.push("#5b8edc");
					*/
				}
				for(var i=1;i<=giftArr.length;i++){
					if(i%2 == 0){
						indexArr.push(i);
					}
				}
				var turnplate={
					restaraunts:giftArr,				//大转盘奖品名称
					colors:colorArr,	                //大转盘奖品区块对应背景颜色
					fontcolors:fontcolorArr,				//大转盘奖品区块对应文字颜色
					outsideRadius:222,			//大转盘外圆的半径
					textRadius:165,				//大转盘奖品位置距离圆心的距离
					insideRadius:65,			//大转盘内圆的半径
					startAngle:0,				//开始角度
					bRotate:false				//false:停止;ture:旋转
				};
				var rotateTimeOut = function (){
					wheelcanvas.rotate({
						angle:0,
						animateTo:2160,
						duration:6000,
						callback:function (){
							base.tip('网络超时，请检查您的网络设置！');
						}
					});
				};
				//旋转转盘 item:奖品位置; txt：提示语;
				var rotateFn = function (item, callback){
					var angles = item * (360 / turnplate.restaraunts.length) - (360 / (turnplate.restaraunts.length*2));
					if(angles<270){
						angles = 270 - angles;
					}else{
						angles = 360 - angles + 270;
					}
					wheelcanvas.stopRotate();
					wheelcanvas.rotate({
						angle:0,
						animateTo:angles+1800,
						duration:6000,
						callback:function (){
							wheelTip.fadeIn();
							turnplate.bRotate = !turnplate.bRotate;
							callback && callback();
						}
					});
				};
				wheelTip.find(".close").unbind("click").click(function(){
					wheelTip.fadeOut();
				});
				function getRandom(n, m){
					var random = Math.floor(Math.random()*(m-n+1)+n);
					return random;
				}
				/********抽奖开始**********/
				pcontainer.find('.wheelbtn').click(function (){
					if(turnplate.bRotate)return;
					turnplate.bRotate = !turnplate.bRotate;
					//获取随机数(奖品个数范围内)
					var curindex;
					$.ajax({
						url:'ajax/operation.php?action=scratchcard&id='+params.id,
						type:"get",
						dataType:"json",
						success:function(data){
							tiptxt.html("");
							if(data.flag == 0){
								//超过次数
								base.tip(data.error);
							}else{
								var newtmp;
								if(data.flag == 1){
									curindex = giftdata[data.num].index;
									newtmp = base.getNewTemplate(pcontainer.find(".zjtemplate"),pcontainer);
									newtmp.find(".jiangpin").html(turnplate.restaraunts[curindex-1].replace(/[\r\n]/g,""));
								}
								else if(data.flag == -1){
									var thisIndex = getRandom(0,2);
									curindex = indexArr[thisIndex];
									newtmp = base.getNewTemplate(pcontainer.find(".xxcytemplate"),pcontainer);
								}
								$("#usercredit").html(data.credit);
								newtmp.find(".item").appendTo(tiptxt);
								wheelTip.css("opacity",0).show();
								tipinner.css("margin-top","-"+tipinner[0].offsetHeight/2+"px");
								wheelTip.css({"opacity":"","display":""});
								newtmp.remove();
								rotateFn(curindex);
							}
						}
					});
				});
				(function drawRouletteWheel() {
					if (wheelcanvas[0].getContext) {
						//根据奖品个数计算圆周角度
						var arc = Math.PI / (turnplate.restaraunts.length/2);
						var ctx = wheelcanvas[0].getContext("2d");
						//在给定矩形内清空一个矩形
						ctx.clearRect(0,0,516,516);
						//strokeStyle 属性设置或返回用于笔触的颜色、渐变或模式  
						ctx.strokeStyle = "#FFBE04";
						//ctx.strokeStyle = "#e5e5e5";
						//font 属性设置或返回画布上文本内容的当前字体属性
						ctx.font = 'bold 22px Microsoft YaHei';
						for(var i = 0; i < turnplate.restaraunts.length; i++) {
							var angle = turnplate.startAngle + i * arc;
							ctx.fillStyle = turnplate.colors[i];
							ctx.beginPath();
							//arc(x,y,r,起始角,结束角,绘制方向) 方法创建弧/曲线（用于创建圆或部分圆）    
							ctx.arc(258, 258, turnplate.outsideRadius, angle, angle + arc, false);
							ctx.arc(258, 258, turnplate.insideRadius, angle + arc, angle, true);
							ctx.stroke();
							ctx.fill();
							//锁画布(为了保存之前的画布状态)
							ctx.save();

							//----绘制奖品开始----
							ctx.fillStyle = turnplate.fontcolors[i];
							var text = turnplate.restaraunts[i];
							var line_height = 30;
							//translate方法重新映射画布上的 (0,0) 位置
							ctx.translate(258 + Math.cos(angle + arc / 2) * turnplate.textRadius, 258 + Math.sin(angle + arc / 2) * turnplate.textRadius);

							//rotate方法旋转当前的绘图
							ctx.rotate(angle + arc / 2 + Math.PI / 2);

							/** 下面代码根据奖品类型、奖品名称长度渲染不同效果，如字体、颜色、图片效果。(具体根据实际情况改变) **/
							if(text.indexOf("\n")>0){//换行
								var texts = text.split("\n");
								for(var j = 0; j<texts.length; j++){
									ctx.font = j == 0?'bold 22px Microsoft YaHei':'bold 22px Microsoft YaHei';
									//ctx.fillStyle = j == 0?'#FFFFFF':'#FFFFFF';
									if(j == 0){
										//ctx.fillText(texts[j]+"M", -ctx.measureText(texts[j]+"M").width / 2, j * line_height);
										ctx.fillText(texts[j], -ctx.measureText(texts[j]).width / 2, j * line_height);
									}else{
										ctx.fillText(texts[j], -ctx.measureText(texts[j]).width / 2, j * line_height);
									}
								}
							}else if(text.indexOf("\n") == -1 && text.length>6){//奖品名称长度超过一定范围 
								text = text.substring(0,6)+"||"+text.substring(6);
								var texts = text.split("||");
								for(var j = 0; j<texts.length; j++){
									ctx.fillText(texts[j], -ctx.measureText(texts[j]).width / 2, j * line_height);
								}
							}else{
								//在画布上绘制填色的文本。文本的默认颜色是黑色
								//measureText()方法返回包含一个对象，该对象包含以像素计的指定字体宽度
								ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
							}
							//把当前画布返回（调整）到上一个save()状态之前 
							ctx.restore();
							//----绘制奖品结束----
						}
					}
				})();
			}else if(pname == "yun"){
				require(["yun"],function(){
					var pi=Math.PI,
						sin=Math.sin,
						cos=Math.cos;
					void function(){
						var k=0; //元素上显示的数字
						var r=100; //半径
						var h=8; //半赤道的元素个数
						//遍历经线
						for(var i=0;i<=h;i++){
							var f=i/h*pi,
								s=sin(f)*r,
								c=cos(f)*r;
							//计算该纬线上最适合的元素个数
							//等于赤道的元素个数乘以当前纬线半径和赤道半径的比
							var l=Math.max(s/r*h*2|0,1);
							//遍历纬线
							for(var j=0;j<l;j++){
								//创建元素，并初始化
								var e=document.createElement("a");
								e.href="#"+k;
								e.textContent=k++;
								ball.appendChild(e);
								//调整好朝向，并平移旋转到初始位置
								e.style.transform=[
									"rotateY("+j/l*360+"deg)",
									"rotateZ("+i/h*180+"deg)",
									"translateY("+r+"px)",
									"rotateX(-90deg)",
									"rotateZ(-90deg)",
								].join(" ");
							};
						};
					}();
					Cloud({ scrollElement : "#container", actionElement : "#ball" });
				});
			}else if(pname == "crowdfund"){
				$(".linktarget").unbind("click").click(function (event) {
					var cur = $(this),
						curparent = cur.parent(),
						linktarget = $("#" + cur.attr("target")),
						offheight = linktarget[0].offsetTop;
					if (!curparent.hasClass("active")) {
						curparent.parent().find(".active").removeClass("active");
						curparent.addClass("active");
					}
					pcontainer.find(".page-content").animate({
						scrollTop: offheight
					}, "slow");
				});
				pcontainer.find(".btn-faqi").unbind("click").click(function (event) {
					myApp.popup(pcontainer.find(".template").html());
				});
				$(".faqipopup").unbind("click").click(function (event) {
					myApp.popup(pcontainer.find(".template").html());
				});
				if (base.isWeixin() && window.WeixinJSBridge) {
					if (!wxIsConfig) {
						base.handlewx(myApp, wxData);
					}
					wx.ready(function () {
						wx.getLocation({
							type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
							success: function (res) {
								var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
								var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
								var speed = res.speed; // 速度，以米/每秒计
								var accuracy = res.accuracy; // 位置精度
								var curlatitude = parseFloat(pcontainer.find("#maplatitude").val()),
									curlongitude = parseFloat(pcontainer.find("#maplongitude").val()),
									mapname = pcontainer.find("#mapname").val(),
									mapregion = pcontainer.find("#mapregion").val();
								var daohang = 'http://api.map.baidu.com/direction?origin=latlng:' + latitude + ',' + longitude + "|name:我的位置&destination=latlng:" + curlatitude + ',' + curlongitude + '|name:' + mapname + '&mode=driving&region=' + mapregion + '&output=html&coord_type=gcj02';
								pcontainer.find(".mapdh").attr("href", daohang);
							},
							fail: function (res) {
								base.tip("请允许微信使用您的地理位置");
								done();
							}
						});
					});
				}
			}else if(pname == "showdoc"){
				var menulist = $(".panel .menulist");
				var leftmenulist = pcontainer.find(".leftmenulist");
				function createList(cid,area){
					var childul = $(pcontainer.find(".template2").children()[0].outerHTML).appendTo(area);
					childul.attr("pid",cid);
					base.getJSON({
						url:"ajax/api.php?action=list&module=knowledge&classid="+cid,
						success:function(data){
							if(data && data.length > 0){
								base.taskData({
									data:data,
									handleFunction:function(d){
										return function(done){
											var ptmp1 = menulist.find("li[pid="+cid+"]"),
												appendmenu;
											if(ptmp1[0]){
												ptmp1.addClass("has-children");
												if(!ptmp1.find("ul")[0]){
													appendmenu = $('<ul style="padding-left:0;" class="cd-secondary-nav is-hidden"></ul>').appendTo(ptmp1);
													appendmenu.append(pcontainer.find(".template3").html());
												}else{
													appendmenu = ptmp1.find("ul");
												}
											}
											var tmp1 = base.getNewTemplate(pcontainer.find(".template"),pcontainer);
											tmp1.find(".distitle").html(d.title);
											var curtmp1 = $(tmp1.children()[0].outerHTML).appendTo(appendmenu);
											curtmp1.attr("pid",d.id);
											curtmp1.data("content",d.content);

											var tmp =base.getNewTemplate(pcontainer.find(".template"),pcontainer);
											tmp.find(".distitle").html(d.title);
											var curtmp = $(tmp.children()[0].outerHTML).appendTo(childul);
											curtmp.data("content",d.content);
											tmp.remove();
											done();
										}
									}
								});
							}else{
								area.find(".fa").remove();
							}
						}
					});
				}
				function createRoot(pid,deep,donefunc) {
					base.getJSON({
						url:"ajax/api.php?action=category&module=knowledge&parentid="+pid,
						success:function(data){
							if(data && data.length > 0){
								deep++;
								base.taskData({
									data:data,
									handleFunction:function(d){
										return function(done){
											var appendmenu = menulist;
											var ptmp1 = menulist.find("li[pid="+d.parentid+"]");
											if(ptmp1[0]){
												ptmp1.addClass("has-children");
												if(!ptmp1.find("ul")[0]){
													appendmenu = $('<ul style="padding-left:0;" class="cd-secondary-nav is-hidden"></ul>').appendTo(ptmp1);
													appendmenu.append(pcontainer.find(".template3").html());
												}else{
													appendmenu = ptmp1.find("ul");
												}
											}
											var tmp1 = base.getNewTemplate(pcontainer.find(".template"),pcontainer);
											tmp1.find(".distitle").html(d.title);
											var curtmp1 = $(tmp1.children()[0].outerHTML).appendTo(appendmenu);
											curtmp1.attr("pid",d.id);
											curtmp1.data("content",d.content);

											var appendarea = leftmenulist;
											if(deep > 1){
												appendarea = leftmenulist.find(".childlist[pid="+d.parentid+"]");
											}
											var tmp =base.getNewTemplate(pcontainer.find(".template1"),pcontainer);
											if(d.branch <= 0){
												//	tmp =base.getNewTemplate(pcontainer.find(".template"),pcontainer);
											}else{
												//	tmp =base.getNewTemplate(pcontainer.find(".template1"),pcontainer);
											}
											tmp.find(".distitle").html(d.title);
											var curtmp = $(tmp.children()[0].outerHTML).appendTo(appendarea);
											if(d.branch <= 0){
												createList(d.id,curtmp);
											}
											curtmp.data("content",d.content);
											tmp.remove();
											if(d.branch <= 0){
												done();
											}else{
												var childul = $(pcontainer.find(".template2").children()[0].outerHTML).appendTo(curtmp);
												childul.attr("pid",d.id);
												createRoot(d.id,deep,function(){
													done();
												});
											}
										}
									},
									callback:function(){
										donefunc && donefunc();
									}
								});
							}
						}
					});
				}
				if(menulist.find("li").length == 1){
					createRoot(0,0);
				}
				pcontainer.find(".left-side").unbind("click").click(function(event){
					var node = event.target;
					while(node){
						if(node.nodeType === 1 && node.nodeName.toLowerCase() == "a"){
							var cur = $(node),
								curbranch = cur.find(".fa-branch"),
								curchild = $(cur.parent().find(".childlist")[0]);
							if(cur.parents(".active").length > 0){
								cur.addClass("active");
							}else{
								leftmenulist.find(".active").removeClass("active");
								cur.addClass("active");
							}
							if(curbranch[0]){
								event.preventDefault();
								if(curbranch.hasClass("down")){
									curbranch.removeClass("down");
									curchild.hide();
								}else{
									curbranch.addClass("down");
									curchild.show();
								}
							}else{
								var curcontent = cur.parent().data("content");
								pcontainer.find(".rightcon").html(curcontent);
							}
							break;
						}
						node = node.parentNode;
					}
				});
				$(".panel .menulist").unbind("click").click(function(event){
					var node = event.target;
					while(node){
						if(node.nodeType === 1 && node.nodeName.toLowerCase() == "a"){
							var cur = $(node),
								curitem = cur.parent();
							if(!curitem.hasClass("has-children")){
								pcontainer.find(".rightcon").html(curitem.data("content"));
								if(!curitem.hasClass("go-back")){
									myApp.closePanel("panel-right");
								}
							}
							break;
						}
						node = node.parentNode;
					}
				});
			}else if(pname == "addwork"){
				pcontainer.find(".subwork").unbind("click").click(function(event){
					event.preventDefault();
					var postdata = {
						"content":pcontainer.find("textarea").val(),
						"modules":pcontainer.find("input[name=modules]").val(),
						"actions":pcontainer.find("input[name=actions]").val(),
						"domain":pcontainer.find("input[name=domain]").val()
					};
					$.ajax({
						url:"http://qiyeplus.qiyeplus.com/mobile/service.php?module=work&action=add",
						data:postdata,
						type:"post",
						dataType:"jsonp",
						jsonp:"jsoncallback",
						success:function(data){
							if(data.flag == 1){
								base.tip("成功");
								pcontainer.find("textarea").val("");
							}else{
								base.tip(data.error);
							}
						}
					});
				});
			}else if(pname == "cardlist"){
				var listparams = $.extend({}, scrollListparams);
				listparams = $.extend(listparams,{
					geturl:"ajax/api.php?action=getmycard&module=card",
					getdata:{pagestart:0,limit:20},
					curtemplate:pcontainer.find(".template"),
					doneCallback:function(){listparams.loading=false;},
					setPageData:function(d,o){
						var curt = o.curtemplate;
						curt.find(".dishref").attr("href","card.php?action=show&id="+d.id);
						curt.find(".distitle").html(d.title);
						var curitem = $(curt.children()[0].outerHTML).appendTo(o.scrollList);
						curitem.data("qrcode",d.filepath);
						curt.remove();
					}
				});
				function cardlistScrollData(){
					base.getListData(listparams);
					listparams.infiniteScroll.on('infinite', function() {
						if (listparams.loading) return;
						listparams.loading = true;
						listparams.getdata.pagestart = listparams.scrollList.find(".scroll_item").length- listparams.scrollList.find(".emptyitem").length;
						base.getListData(listparams);
					});
				}
				if(scrollList.find(".scroll_item").length == 0) {
					cardlistScrollData();
				}
			}else if(pname == "credittohongbao"){
				var dragarea = pcontainer.find(".dragarea"),
					dragareaW = dragarea[0].offsetWidth,
					targetline = pcontainer.find(".targetline"),
					targetlineW = dragarea.find(".handler")[0].offsetWidth,
					ramdomLeft = Math.floor(dragareaW/3+Math.random()*100*Math.floor(dragareaW/100));
				if(ramdomLeft + targetlineW > dragareaW){
					ramdomLeft = dragareaW - targetlineW;
				}
				targetline.css("left",ramdomLeft).show();
				var istohb = false,
					btnTohb = pcontainer.find(".btn-tohb");
				pcontainer.find('.dragarea').drag({
					target:{width:targetlineW,left:ramdomLeft},
					fail:function(){
						istohb = false;
						btnTohb.addClass("disabled");
					},
					success:function(){
						istohb = true;
						btnTohb.removeClass("disabled");
					}
				});
				var listparams = $.extend({}, scrollListparams);
				listparams = $.extend(listparams,{
					geturl:"ajax/api.php?action=mostshareview&module=news",
					getdata:{pagestart:0,limit:20},
					curtemplate:pcontainer.find(".template"),
					doneCallback:function(){listparams.loading=false;}
				});
				if(scrollList.find(".scroll_item").length == 0) {
					base.getListData(listparams);
				}
				require(["jquery.md5","base64.min"],function(){
					var curticket = pcontainer.find("#curticket").val() == "" ? base.getTicket() : pcontainer.find("#curticket").val(),
						muid = $.md5(pcontainer.find("#useruid").val()),
						randomkey = pcontainer.find("#randomkey").val();
					if(!window.window.WeixinJSBridge){
                                                pcontainer.find(".dragouter").remove();
                                                btnTohb.remove();
					}else{
						btnTohb.click(function(event){
							var curbtn = $(this);
							if(!istohb){
								base.tip("请先验证");
								return false;
							}
							if(!curbtn.hasClass("disabled") && istohb){
								curbtn.addClass("disabled");
								myApp.showIndicator();
									setTimeout(function(){
										base.ajaxSubmit({
											myApp:myApp,
											form:pcontainer.find("#creditForm"),
											url:"ajax/api.php?action=credittohongbao",
											data:{sign:Base64.encode(curticket+muid+randomkey)},
											success:function(data){
												curbtn.removeClass("disabled");
												if(data.flag == 1){
													myApp.alert(data.error,"",function(){
														window.WeixinJSBridge && WeixinJSBridge.call("closeWindow");
													});
												}else{
													base.tip(data.error);
												}
											}
										});
									},1000);
							}
						});
                                        }
				});
				var rulearea = pcontainer.find(".ruleinfo"),
					appendarea = rulearea.find(".appendarea");
				if(rulearea.find(".item").length == 0){
					base.getJSON({
						url: "ajax/api.php?action=rule&module=user",
						success: function (data) {
							if (data && data.length > 0) {
								pcontainer.find(".ruleinfo").show();
								base.taskData({
									data: data,
									handleFunction: function (d) {
										return function (done) {
											var newtemplate = base.getNewTemplate(pcontainer.find(".template1"), pcontainer);
											newtemplate.find(".disdesc").html(d.desc);
											newtemplate.find(".discredit").html(d.credit);
											$(newtemplate.find("tbody tr")[0].outerHTML).appendTo(appendarea);
											newtemplate.remove();
											done();
										}
									}

								});
							} else {
								pcontainer.find(".ruleinfo").remove();
							}
						}
					});
				}
			}else if(pname == "meetlist"){
				var listparams = $.extend({}, scrollListparams);
				listparams = $.extend(listparams,{
					geturl:"ajax/meeting.php?action=getlist",
					curtemplate:pcontainer.find(".template"),
					doneCallback:function(){listparams.loading=false;},
					setcallback:function(d,template){
						if(d.notread > 0){
							template.find(".disnotread").parent().removeClass("hide");
						}else{
							template.find(".disnotread").parent().remove();
						}
					}
				});
				if(scrollList.find(".scroll_item").length == 0) {
					base.getListData(listparams);
				}
			}else if(pname == "testingview"){
				pcontainer.find(".starttest").unbind("click").click(function (event) {
					event.preventDefault();
					base.ajax({
						myApp: myApp,
						url: "ajax/testing.php?module=testing&action=check&id=" + params.id,
						success: function (data) {
							if (data.flag == 1) {
								var popupTesting = base.getPopup(myApp, pcontainer.find(".template"), "testingPopup");
								popupTesting.find(".btn-sub").click(function (event) {
									event.preventDefault();
									var subform = popupTesting.find("form");
									if(base.trim(subform.find("textarea").val()) == ""){
										base.tip("内容不能为空");
										return false;
									}
									base.ajaxSubmit({
										myApp: myApp,
										form: popupTesting.find("form"),
										url: "ajax/testing.php?module=testing&action=check&id=" + params.id,
										success: function (ret) {
											if (ret.flag == 2 || ret.flag == 1) {
												base.tip("成功");
												mainView.router.load({url: "module.php?action=view&module=testing&id=" + ret.data});
											} else {
												base.tip(ret.error);
											}
										}
									});
								});
							} else if (data.flag == 2) {
								base.tip("成功");
								mainView.router.load({url: "module.php?action=view&module=testing&id=" + data.data});
							} else {
								base.tip(data.error);
							}
						}
					});
				});
			}else if(pname == "baomingview"){
				pcontainer.find(".confirmmoney").unbind("click").click(function(event){
					event.preventDefault();
					myApp.confirm("您确定要审批该信息?并且保证已经收费？","",function(){
						mainView.router.load({url:"service.php?module=baoming&action=moderate&id="+params.id});
					});
				});
			}else if(pname == "reportadd"){
				var subform = pcontainer.find("form"),
					reportitems = pcontainer.find(".reportitems"),
					curindex = 1 + reportitems.find(".newadditem").length,
					btnadditem = pcontainer.find(".additem");
				pcontainer.unbind("click").click(function(event){
					var node = event.target;
					while(node){
						var cur = $(node);
						if(node.nodeType === 1) {
							var curtype = cur.attr("type");
							if (curtype == 6) {
								var hideInput = cur.find("input[type=hidden]");
								cur.find(".item-input .bg").remove();
								var popupUpload = base.getPopup(myApp, pcontainer.find(".template6"), "uploadphotoPopup");
								var curaddicon = popupUpload.find(".addicon"),
									fileInput = popupUpload.find("input[type=file]"),
									fileForm = popupUpload.find("form"),
									curphotolist = [];
								if (hideInput.val() != "") {
									curphotolist = hideInput.val().split(",");
									handlePhotoitem({
										data: curphotolist,
										area: cur,
										hideInput: hideInput,
										datalist: curphotolist,
										insertBeforeArea: curaddicon,
										curitem: cur,
										container : pcontainer
									});
								}
								if (window.WeixinJSBridge && !wxIsConfig) {
									base.handlewx(myApp, wxData);
									wxIsConfig = true;
								}
								base.uploadPhoto({
									myApp: myApp,
									form: fileForm,
									input: fileInput,
									callback: function (data) {
										if (data && data[0] && data[0].url) {
											var returl = data[0].url;
											curphotolist.push(returl);
											handlePhotoitem({
												data: [returl],
												area: cur,
												hideInput: hideInput,
												datalist: curphotolist,
												insertBeforeArea: curaddicon,
												curitem: cur,
												container : pcontainer
											});
										} else {
											if (data && data.ret == "-1") {
												return false;
											}
											base.tip("图片上传失败");
										}
									}
								});
								popupUpload.find(".btn-sub").click(function () {
									myApp.closeModal(popupUpload);
								});
								break;
							} else if (cur.hasClass("delitem")) {
								cur.parents(".newadditem").remove();
								if (reportitems.find(".newadditem").length < 9)pcontainer.find(".additem").show();
								break;
							}else if(curtype == "video"){
								var videoInput = cur.find("input[type=file]");
								videoInput.change(function(event){
									var curfiles = event.target.files,
										filetext = cur.find(".filetext");
									if(curfiles.length == 0){
										videoInput.parent().removeClass("active");
										filetext.html(filetext.attr(""));
									}else{
										videoInput.parent().addClass("active");
										filetext.html(curfiles[0].name);
									}
								});
							}
						}
						node = node.parentNode;
					}
				});
				function createnewitem(){
					curindex++;
					if(reportitems.find(".newadditem").length >= 9)btnadditem.hide();
					var newitem = base.getNewTemplate(pcontainer.find(".template"),pcontainer);
					newitem.find(".disindex").html(curindex);
					newitem.find(".item").each(function(){
						var cur = $(this),
							hiderole = cur.find(".hiderole"),
							role = hiderole.attr("role");
						hiderole.attr("name",role+curindex);
					});
					var retitem = $(newitem.children()[0].outerHTML).appendTo(reportitems);
					newitem.remove();
					return retitem;
				}
				btnadditem.unbind("click").click(function(event){
					createnewitem();
				});
				if(params.id && subform.find(".contentitem").length == 1){
					base.ajax({
						myApp:myApp,
						url:"train/ajax.php?module=report&action=detail&id="+params.id,
						success:function(data){
							if(data){
								if(data.content && data.content.length > 0){
									var i = 0;
									base.taskData({
										data:data.content,
										handleFunction:function(d){
											return function(done){
												var contentitem = subform.find(".contentitem");
												if(i > 0){
													contentitem = createnewitem();
												}
												for(var k in d){
													var curarea = contentitem.find("*[field="+k+"]");
													if(curarea[0]){
														curarea.val(d[k]);
														if(k == "photos"){
															var photolist = d[k].split(",");
															var prependarea = curarea.parents(".item-input"),
																pstr = '';
															if(prependarea.find(".bg").length == 0){
																for(var j=0;j<photolist.length;j++){
																	var p = photolist[j];
																	pstr += '<div class="bg" style="background-image:url('+base.getPhoto(p)+');"></div>';
																}
																$(pstr).prependTo(prependarea);
															}
														}else if(k == "videos" && d[k]){
															var videolist = d[k].split(","),
																vstr = '';
															for(var j=0;j<photolist.length;j++){
																var v = videolist[j];
																vstr += '<div class="filetext" text="上传视频">'+v+'</div>';
															}
															$(vstr).appendTo(curarea.parent());
														}
													}
												}
												i++;
												done();
											}
										}
									});
								}
							}
						}
					});
				}
				$(".sub-report").click(function(event){
					var subbtn = $(this),
						postdata = {};
					if(subbtn.attr("role") == "preview"){
						postdata['preview'] = 1;
					}
					base.ajaxSubmit({
						myApp:myApp,
						form:subform,
						url:subform.attr("action"),
						data:postdata,
						success:function(data){
							if(data.flag == 1){
								mainView.router.load({url:"module.php?module=report&action=view&id="+data.data});
							}else{
								base.tip(data.error);
							}
						}
					});
				});
			}else if(pname == "reportview"){
				var btns = pcontainer.find(".qbtnlist .qbtn");
				btns.unbind("click").click(function(event){
					var cur = $(this),
						curmoderate = cur.attr("moderate"),
						confirmtxt = "确定要发布吗？";
					if(curmoderate){
						if(curmoderate == -1){
							confirmtxt = "确定要删除吗？";
						}
						myApp.confirm(confirmtxt,"",function(){
							base.ajax({
								myApp:myApp,
								url:"train/ajax.php?module=report&action=moderate&id="+params.id,
								data:{"moderate":curmoderate},
								type:"post",
								success:function(data){
									if(data.flag == 1){
										if(curmoderate == -1){
											mainView.router.load({url:"service.php?module="+params.module+"&action=list"});
										}else{
											base.tip("成功",function(){
												mainView.router.refreshPage();
											});
										}
									}else{
										base.tip(data.error);
									}
								}
							});
						});
					}
				});
			}else if(pname == "testaudio"){
				require(["wxAudio"],function(){
					$('.weixinAudio').weixinAudio();
				});
			}else if(pname == "pushshow"){
				var wW = document.body.clientWidth,
					itemW = wW - 20,
					imgW = itemW - 20,
					imgH = imgW*5/9,
					isAddCss = true,
					isfirst = true;
				if(wW > 900){
					pcontainer.find(".inner").addClass("pc");
					isAddCss = false;
				}else{
					pcontainer.find(".scroll_list").css("width",itemW);
				}
				base.getJSON({
					url:"ajax/api.php?module=push&action=view&id="+params.id,
					success:function(data){
						if(data && data.data && data.data.length > 0){
							base.taskData({
								data:data.data,
								handleFunction:function(d){
									return function(done){
										var curtemplate = pcontainer.find(".template");
										var curtmp = base.getNewTemplate(pcontainer.find(".template"),pcontainer);
										if(!isfirst){
											curtmp = base.getNewTemplate(pcontainer.find(".template1"),pcontainer);
                                                                                        curtemplate = pcontainer.find(".template1");
										}
										base.createNewitem({
                                                                                        template:curtemplate,
                                                                                        data:d,
                                                                                        area:scrollList,
											container:pcontainer,
											callback:function(curitem){
                                                                                                if(isAddCss && isfirst){
                                                                                                        curitem.find(".disphotobg").css("height",imgH);
                                                                                                }
											}
										});
										if(isfirst){
											isfirst = false;
										}
										done();
									}
								}
							});
							pcontainer.find(".btn-push").click(function(event){
								$.ajax({
									url:"ajax/api.php?action=pushmass&id="+params.id,
									dataType:"json",
									success:function(ret){
										base.tip(ret.error);
									}
								});
							});
						}
					}
				});
			}else if(pname == "bokashow"){
				pcontainer.find(".btn-cai").click(function(){
					base.ajaxSubmit({
						myApp:myApp,
						form:pcontainer.find("form"),
						url:"ajax/api.php?action=bokashow",
						success:function(data){
							base.tip(data.error);
						}
					});
				});
			}else if(pname == "registershow") {
				var appendarea = pcontainer.find(".container");
				base.getJSON({
					url:"ajax/operation.php?module=operator&action=getregisterdata&id="+params.classid,
					success:function(data){
						base.taskData({
							data:data,
							handleFunction:function(d){
								return function(done){
									if(!pcontainer.find(".scroll_item[itemid="+d.id+"]")[0]){
										base.createNewitem({
                                                                                        template:pcontainer.find(appendarea.attr("template")),
											area:appendarea,
											data:d
										});
									}
									done();
								}
							}
						});
					}
				});
			}else if(pname == "testyuyue"){
				var valinput = "#starthidetime";
				var yeardata = [],monthdata = [],daydata=[],
					hourdata = [],minutedata = [],
					today = new Date(),curYear = today.getFullYear(),curMonth = today.getMonth()+1,
					curDay = today.getDate(),curHour = today.getHours(),curMinute = today.getMinutes();
				if(curMonth < 10)curMonth = "0"+curMonth;
				if(curDay < 10)curDay = "0"+curDay;
				if(curMinute < 10)curMinute = "0"+curMinute;
				for(var i=0;i<20;i++){
					yeardata.push(curYear-2+i);
				}
				for(var i=1;i<=12;i++){
					if(i<10){
						monthdata.push("0"+i);
					}else{
						monthdata.push(i);
					}
				}
				for(var i=1;i<=31;i++){
					if(i<10){
						daydata.push("0"+i);
					}else{
						daydata.push(i);
					}
				}

				myApp.picker({
					input: pcontainer.find("#starttime"),
					rotateEffect: true,
					toolbarTemplate:
					'<div class="toolbar">' +
					'<div class="toolbar-inner">' +
					'<div class="left">' +
					'<a href="#" class="link toolbar-randomize-link"></a>' +
					'</div>' +
					'<div class="right">' +
					'<a href="#" class="link close-picker">完成</a>' +
					'</div>' +
					'</div>' +
					'</div>',
					cols: [
						{textAlign:'center',values: yeardata},
						{textAlign:'center',values:["-"]},
						{textAlign:'center',values: monthdata},
						{textAlign:'center',values:["-"]},
						{textAlign:'center',values:daydata}
					],
					onOpen: function (picker) {
						picker.cols[0].setValue(curYear);
						picker.cols[2].setValue(curMonth);
						picker.cols[4].setValue(curDay);
						picker.container.parent().parent().addClass("picker-time");
						picker.container.parent().parent().css("left","0px");
						pcontainer.find(valinput).val(picker.cols[0].value+"/"+picker.cols[2].value+"/"+picker.cols[4].value);
					},
					onChange: function (picker, values, displayValues) {
						var daysInMonth = new Date(picker.value[0], (picker.value[2]-1) * 1 + 1, 0).getDate();
						if (values[4] > daysInMonth) {
							picker.cols[4].setValue(daysInMonth);
						}
						pcontainer.find(valinput).val(values[0]+"/"+values[2]+"/"+values[4]);
					}
				});
				pcontainer.find(".timelist .item").click(function(){
					var cur = $(this);
					if(!cur.hasClass("disabled")){
						if(!cur.hasClass("active")){
							pcontainer.find(".timelist .item").removeClass("active");
							cur.addClass("active");
						}
					}
				});
			}else if(pname == "holiday_main"){
				var holidayimages,holidaymusic,
					holidayType = window.Holiday_Setting.holidayType,
					curholiday = pcontainer.find("#holiday").val(),
					audiobtn = pcontainer.find(".audiobtn"),
					curaudio = audiobtn.find("audio"),
					showmenubtn = pcontainer.find(".showmenu"),
					cardmenu = pcontainer.find(".cardmenu"),
					cardoverlay = pcontainer.find(".overlay"),
					bgarea = pcontainer.find(".bgarea"),
					bglist = pcontainer.find(".bglist"),
					bgtype = bgarea.find(".bgtype"),
					musicarea = pcontainer.find(".musicarea"),
					musictype = musicarea.find(".musictype"),
					musiclist = musicarea.find(".list"),
					subForm = pcontainer.find(".cardForm"),
					hidebackground = subForm.find("#background"),
					hideaudio = subForm.find("#bgmusic"),
					txtarea = pcontainer.find(".txtarea"),
					uploadvoicearea = pcontainer.find(".uploadvoicearea"),
					loadvoice = uploadvoicearea.find(".loadvoice"),
					dayWH = window.innerHeight,
					dayTitleArea = pcontainer.find(".holiday-title"),
					hconH = dayWH - dayTitleArea[0].offsetTop - dayTitleArea[0].offsetHeight - 40,
					holidaycontent = pcontainer.find(".holiday-content"),
					hconinner = holidaycontent.find(".inner"),
					hinnertext = hconinner.find(".innertext"),
					musicfile = pcontainer.find("#musicfile").val(),
					musicPlayer = curaudio.data("audio");
				if(!musicPlayer){
					musicPlayer = new Audio();
					curaudio.data("audio",musicPlayer);
				}
				musicPlayer.src = musicfile;
				if(base.isMobile()){
					wx.ready(function(){
						if(audiobtn.hasClass("on")){
							musicPlayer.play();
						}
					});
				}else{
					if(audiobtn.hasClass("on")){
						musicPlayer.play();
					}
				}
				audiobtn.unbind("click").click(function(){
					if(audiobtn.hasClass("on")){
						audiobtn.removeClass("on");
						musicPlayer.pause();
					}else{
						audiobtn.addClass("on");
						musicPlayer.play();
					}
				});
				holidayAudioInterval = setInterval(function(){
					if (musicPlayer && musicPlayer.ended) {
						audiobtn.removeClass("on");
						clearInterval(holidayAudioInterval);
					}
				},1000);
				if(pcontainer.find(".holiday-module")[0]){
					hconH = hconH - 90;
				}
				hconinner.css({"height":hconH}).show();
				holidaycontent.show();
				var innertextH = hinnertext[0].offsetHeight;
				if(innertextH > hconH){
					hinnertext.addClass("scrolltext");
				}
				var getdata = {};
				if(curholiday == ""){
					for(var k in holidayType){
						curholiday = holidayType[k].value;
						break;
					}
				}else{
					getdata['folder'] = curholiday;
				}
				base.getJSON({
					url:"ajax/api.php?module=_card&action=_card",
					data:getdata,
					async:false,
					success:function(data){
						if(data.flag == 1){
							holidayimages = data.data.images;
							holidaymusic = data.data.music;
						}
					}
				});
				function saveData(callback){
					base.ajaxSubmit({
						myApp:myApp,
						form:pcontainer.find(".cardForm"),
						url:"ajax/holidayact.php?action=uptpl",
						success:function(data){
							if(data.flag == 1){
								callback && callback(data);
							}else{
								base.tip(data.error);
							}
						}
					});
				}
				showmenubtn.unbind("click").click(function(){
					cardoverlay.show();
					cardmenu.css({"transform": "translateX(-150px)"});
				});
				cardoverlay.unbind("click").click(function(){
					cardmenu.css({"transform": "translateX(0px)"});
					cardoverlay.hide();
				});
				function uptplFunc(callback){
					musicPlayer.src = "";
					musicPlayer = null;
					mainView.router.refreshPage();
					callback && callback();
				}
				cardmenu.unbind("click").click(function(event){
					var node = event.target;
					while(node){
						var curtarget = $(node);
						if(node.nodeType === 1){
							if(curtarget.hasClass("item")){
								cardmenu.css({"transform": "translateX(0px)"});
								if(curtarget.hasClass("finish")){
									cardoverlay.hide();
									break;
								}else if(curtarget.hasClass("changepic")){
									bgarea.show();
									if(bglist.find(".list form").length == 0 && bglist.find(".list .item").length == 0){
										showBgpic(curholiday);
									}
									if(bgtype.find(".item").length == 1){
										var insertbefore = bgtype.find(".insertbefore");
										insertbefore.data('value','userupload');
										 for(var ht in holidayType){
											 var t  = holidayType[ht],
												 newtmp = base.getNewTemplate(pcontainer.find(".template"),pcontainer),
												 curitem,
												 isbreak = false;
											 if(getdata['folder']){
												if(getdata['folder'] == t.value){
													isbreak = true;
													curitem = newtmp.find(".item").insertBefore(insertbefore);
												}else{
													continue;
												}
											 }else{
												 curitem = newtmp.find(".item").insertBefore(insertbefore);
											 }
											 newtmp.remove();
											 curitem.find(".distype").html(t.disvalue);
											 curitem.data("value",t.value);
											 if(ht == curholiday){
												 curitem.addClass("active");
											 }
											 if(isbreak)break;
										 }
									}
									break;
								}else if(curtarget.hasClass("changemusic")){
									if(musictype.find(".item").length == 0){
										var insertbefore = musictype.find(".insertbefore");
										for(var ht in holidayType){
											var t  = holidayType[ht],
												newtmp = base.getNewTemplate(pcontainer.find(".template"),pcontainer),
												curitem,
												isbreak = false;
											if(getdata['folder']){
												if(getdata['folder'] == t.value){
													isbreak = true;
													curitem = newtmp.find(".item").insertBefore(insertbefore);
												}else{
													continue;
												}
											}else{
												curitem = newtmp.find(".item").insertBefore(insertbefore);
											}
											newtmp.remove();
											curitem.find(".distype").html(t.disvalue);
											curitem.data("value",t.value);
											if(ht == curholiday){
												curitem.addClass("active");
											}
											if(isbreak)break;
										}
										showMusiclist();
									}
									musicarea.show();
									break;
								}else if(curtarget.hasClass("changetxt")){
									cardoverlay.show();
									txtarea.css({"transform": "translateY(-290px)"});
									break;
								}else if(curtarget.hasClass("uploadvoice")){
									audiobtn.removeClass("on");
									musicPlayer.pause();
									cardoverlay.show();
									uploadvoicearea.css({"transform": "translateY(-290px)"});
									break;
								}else if(curtarget.hasClass("bindmodule")){
									cardoverlay.hide();
									var curmodal = base.getPopup(myApp,pcontainer.find(".moduletemplate"),"knowledgePopup"),
										resultappend = curmodal.find(".appendarea"),
										oldmodulname = subForm.find("#addmodule").val(),
										oldmoduleid = subForm.find("#moduleid").val();
									resultappend.html("");
									if(oldmodulname && oldmoduleid){
										base.getJSON({
											url:"ajax/api.php?module="+oldmodulname+"&action=getrowdata&id="+oldmoduleid,
											success:function(d){
												if(d){
													var newstmp = base.getNewTemplate(pcontainer.find(".moduleitemtemplate"),pcontainer),
														curitem = curmodal.find(".appendarea").find(".scroll_item[itemid="+d.id+"]");
													if(!curitem[0]){
														curitem = newstmp.find(".scroll_item").appendTo(curmodal.find(".appendarea")),
															curinput = curitem.find("input");
														curitem.attr("itemid",d.id);
														if(d.title){
															curitem.find(".distitle").html(d.title);
														}else if(d.productname){
															curitem.find(".distitle").html(d.productname);
														}
														curinput.val(d.id);
														curinput.attr("value",d.id);
														curinput.attr("checked","checked");
														curinput.attr("addmodule",d.orimodule);
														curinput.attr("moduleid",d.orimoduleid);
													}else{
														curitem.find("input").attr("checked","checked");
													}
													newstmp.remove();
												}
											}
										});
									}
									base.getJSON({
										url:"ajax/sharehongbao.php?action=mostselected",
										success:function(data){
											if(data && data.length>0){
												base.taskData({
													data:data,
													handleFunction:function(d){
														return function(done){
															var newstmp = base.getNewTemplate(pcontainer.find(".moduleitemtemplate"),pcontainer);
															if(!resultappend.find(".scroll_item[itemid="+d.id+"]")[0]){
																var curitem = newstmp.find(".scroll_item").appendTo(resultappend),
																	curinput = curitem.find("input");
																curitem.attr("itemid",d.id);
																curitem.find(".distitle").html(d.title);
																curinput.val(d.id);
																curinput.attr("value",d.id);
																curinput.attr("addmodule",d.orimodule);
																curinput.attr("moduleid",d.orimoduleid);
															}
															newstmp.remove();
															done();
														}
													}
												});
											}
										}
									});
									curmodal.find(".btn-sub").click(function(){
										var modalform = curmodal.find(".subform"),
											checkeditem = modalform.find("input:checked");
										if(!checkeditem[0]){
											base.tip("请选择一项");
											return false;
										}
										subForm.find("#addmodule").val(checkeditem.attr("addmodule"));
										subForm.find("#moduleid").val(checkeditem.attr("moduleid"));
										var submoney = curmodal.find("#money");
										if(base.trim(submoney.val()) != ""){
											var ckawardtype = curmodal.find("input[name=awardtype]:checked");
											if(ckawardtype.length == 0){
												base.tip('请选择红包类型');
												return false;
											}
											subForm.find("#total").val(submoney.val());
											subForm.find("#subawardtype").val(ckawardtype.val());
										}
										myApp.closeModal(curmodal);
										saveData(function(data){
											base.tip("成功",function(){
												if(data.orderid){
													location.href = "/mobile/ajax/pay.php?orderid=" + data.orderid;
												}else{
													uptplFunc();
												}
											});
										});
									});
									base.searchEvent({
										myApp:myApp,
										container:pcontainer,
										listparams:scrollListparams,
										element:curmodal.find(".searchbar"),
                                                                                resultarea:curmodal.find(".appendarea"),
										callback:function(d,curitem){
                                                                                        var curinput = curitem.find("input");
                                                                                        curinput.attr("value",d.id);
                                                                                        curinput.attr("addmodule",d.orimodule);
                                                                                        curinput.attr("moduleid",d.orimoduleid);
										}
									});
									break;
								}else if(curtarget.hasClass("addreward")){
									cardoverlay.hide();
									var curmodal = base.getPopup(myApp,pcontainer.find(curtarget.attr("template")),"rewardPopup"),
										addarea = curmodal.find(".addarea"),
										newitemarea = curmodal.find(".newitemarea"),
										modalform = curmodal.find("form");
									curmodal.find(".awardlabel").click(function(event){
										event.preventDefault();
										var curck = $(this).find("input"),
											curval = curck.val();
										//curmodal.find(".awardlabel").find("input").attr("checked",false);
										curck[0].checked = true;
										if(curval == 0){
											curmodal.find(".usercountarea").hide();
											curmodal.find(".sendcountarea").hide();
											curmodal.find(".sendcountarea #sendcount").val(1);
										}else{
											curmodal.find(".usercountarea").show();
											curmodal.find(".sendcountarea").show();
										}
									});
									curmodal.find(".additem").click(function(){
										var newitem = newitemarea.find(".newitem").appendTo(addarea);
										newitem.find(".delitem").unbind("click").click(function(){
											newitem.appendTo(newitemarea);
										});
									});
									curmodal.find(".btn-sub").click(function(){
										var usercount = modalform.find("#usercount"),
											postusercount = usercount.val(),
											sendcount = modalform.find("#sendcount"),
											postsendcount = sendcount.val();
										if(usercount[0]){
											if(base.trim(postusercount) == '' || isNaN(postusercount)){
												base.tip("请输入充值总额");
												return false;
											}
										}
										if(sendcount[0]){
											if(base.trim(postsendcount) == '' || isNaN(postsendcount)){
												base.tip("请输入每人最多发送数量");
												return false;
											}
										}

										base.ajaxSubmit({
											myApp:myApp,
											form:modalform,
											url:"ajax/holidayact.php?action=uptpl",
											success:function(data){
												if(data.flag == 1){
													if(data.orderid){
														myApp.closeModal(curmodal);
														location.href = "/mobile/ajax/pay.php?orderid=" + data.orderid;
													}else if(data.flag == 1){
														base.tip(data.error,function(){
															uptplFunc(function(){
																myApp.closeModal(curmodal);
															});
														});
													}
												}else{
													base.tip(data.error);
												}
											}
										});
									});
									break;
								}else if(curtarget.hasClass("modulearea")){
									cardoverlay.hide();
									var curmodal = base.getPopup(myApp,pcontainer.find(curtarget.attr("template")),"areaPopup"),
										addarea = curmodal.find(".addarea"),
										newitemarea = curmodal.find(".newitemarea"),
										modalform = curmodal.find("form");
									curmodal.find(".btn-sub").click(function(){
										base.ajaxSubmit({
											myApp:myApp,
											form:modalform,
											url:"ajax/holidayact.php?action=uptpl",
											success:function(data){
												if(data.flag == 1){
													base.tip(data.error,function(){
														myApp.closeModal(curmodal);
														musicPlayer.src = "";
														musicPlayer = null;
														mainView.router.refreshPage();
													});
												}else{
													base.tip(data.error);
												}
											}
										});
									});
									function findChild(pid,deep,data){
										var childdata = [];
										for(var j = 0;j<data.length;j++){
											var c = data[j];
											if(c.parentcode == pid){
												if(deep == 3 && (c.title == "市辖区" || c.title == "县")){

												}else{
													childdata.push(c);
												}
											}
										}
										return childdata;
									}
									if(!areacodeData){
										areacodeData = {};
										var retdata;
										$.ajax({
											url:"/mobile/ajax/api.php?action=getallarea",
											async:false,
											dataType:"json",
											success:function(data){
												retdata = data;
											}
										});
										if(retdata && retdata.length > 0){
											areacodeData["province"] = [];
											for(var i = 0;i<retdata.length;i++){
												var d = retdata[i];
												areacodeData[d.title] = {"data":d,"children":findChild(d.code,d.levels+1,retdata)};
												if(d.levels == 1){
													areacodeData["province"].push(d);
												}
											}
										}
									}
									var provinceSelect = curmodal.find(".province"),
										provinceData = areacodeData['province'],
										defaultarea = provinceSelect.attr("default");
									for(var i=0;i<provinceData.length;i++){
										var d = provinceData[i];
										if(defaultarea == d.title){
											provinceSelect.append('<option selected value="'+d.title+'">'+d.title+'</option>');
										}else{
											provinceSelect.append('<option value="'+d.title+'">'+d.title+'</option>');
										}
									}
									provinceSelect.change(function(){
										provinceSelect.nextAll().remove();
										var provinceVal = this.value,
											provinceData = areacodeData[provinceVal];
										if(provinceData){
											var curcity = provinceData.children;
											if(curcity.length > 0){
												var citySelect = $('<select class="no-fastclick" name="city" style="width:100%;height:30px;margin-top:5px;"><option value="">全部</option></select>'),
													cityoptions = '';
												for(var i=0;i<curcity.length;i++){
													var c = curcity[i];
													if(c.title != "市辖区" && c.title != '县'){
														//citySelect.append('<option value="'+c.code+'">'+c.title+'</option>');
														cityoptions += '<option value="'+c.title+'">'+c.title+'</option>';
													}
												}
												if(cityoptions != ''){
													citySelect.append(cityoptions);
													citySelect.insertAfter(provinceSelect);
												}
											}
										}
									});
									break;
								}
							}
						}
						node = node.parentNode;
					}
				});
				var loadfilearea1 = bgarea.find(".loadfile");
				base.uploadPhoto({
					myApp:myApp,
					input:bgarea.find("form input[type=file]"),
					form:bgarea.find("form"),
					callback:function(data){
						if(data && data[0] && data[0].url){
							var returl = base.getPhoto(data[0].url);
							loadfilearea1.addClass("active");
							loadfilearea1.css({"background-image":"url("+returl+")"});
							loadfilearea1.attr("img",returl);
						}else{
							loadfilearea1.removeClass("active");
							loadfilearea1.css({"background-image":""});
						}
					}
				});
				bgarea.find(".subimg").click(function(){
					if(loadfilearea1.hasClass("active")){
						var curbgimg = loadfilearea1.attr("img");
						subForm.find("#background").val(curbgimg);
						subForm.find("#postphoto").val(curbgimg);
						pcontainer.find(".background").css({"background-image":"url("+curbgimg+")"});
						saveData(function(data){
							base.tip("背景修改成功",function(){
								mainView.router.refreshPage();
							});
						});
						bgarea.hide();
						cardoverlay.hide();
					}else{
						base.tip("请选择图片");
					}
				});
				function showBgpic(showtype){
					var bglistW = parseInt(bglist.find(".list").width()),
						picW = Math.floor(bglistW/2 - 15),
						picH = Math.floor(picW*568/320);
					if(showtype == 'userupload'){
						bglist.find(".list").html("");
						bgarea.find("form").appendTo(bglist.find(".list")).show();
						bgarea.scrollTop(0);
					}else{
						bgarea.find("form").hide().appendTo(bgarea);
						bglist.find(".list").html("");
						bgarea.scrollTop(0);
						var images = holidayimages[showtype];
						if(images && images.length > 0) {
							for (var i = 0; i < images.length; i++) {
								var curpic = images[i],
									newtemplate = base.getNewTemplate(pcontainer.find(".template1"), pcontainer),
									curitem = newtemplate.find(".item").appendTo(bglist.find(".list"));
								curitem.data("bgsrc", curpic);
								curitem.find(".pic").css({
									"width": picW,
									"height": picH,
									"background-image": "url(" + curpic + ")"
								});
								newtemplate.remove();
							}
						}
					}
				}
				function showMusiclist(){
					musiclist.html("");
					var curtype = musictype.find(".item.active").data("value"),
						curmusic = holidaymusic[curtype];
					musicarea.scrollTop(0);
					if(curmusic && curmusic.length > 0){
						for(var i=0;i<curmusic.length;i++){
							var m  = curmusic[i],
								newtmp = base.getNewTemplate(pcontainer.find(".template2"),pcontainer),
								curitem = newtmp.find(".item").appendTo(musiclist);
							newtmp.remove();
							curitem.find(".disvalue").html(m.title);
							curitem.find("audio").attr("src",m.url);
							curitem.data("music",m);
						}
					}
				}
				bgtype.unbind("click").click(function(event){
					var node = event.target;
					while(node){
						var curtarget = $(node);
						if(node.nodeType === 1 && curtarget.hasClass("item")){
							if(!curtarget.hasClass("active")){
								bgtype.find(".item.active").removeClass("active");
								curtarget.addClass("active");
								showBgpic(curtarget.data("value"));
							}
							break;
						}
						node = node.parentNode;
					}
				});
				bglist.find(".list").unbind("click").click(function(event){
					var node = event.target;
					while(node){
						var curtarget = $(node);
						if(node.nodeType === 1){
							if(curtarget.hasClass("item")){
								var curpic = curtarget.data("bgsrc");
								pcontainer.find(".background").css({"background-image":"url('"+curpic+"')"});
								hidebackground.val(curpic);
								pcontainer.find("#background").val(curpic);
								subForm.find("#postphoto").val(curpic);
								saveData(function(data){
									base.tip("背景修改成功",function(){
										uptplFunc();
									});
								});
								bgarea.hide();
								cardoverlay.hide();
								break;
							}
						}
						node = node.parentNode;
					}
				});
				bgarea.find(".back").unbind("click").click(function(){
					bgarea.hide();
					cardoverlay.hide();
				});
				musicarea.find(".back").unbind("click").click(function(){
					musicarea.hide();
					cardoverlay.hide();
				});
				musictype.unbind("click").click(function(event){
					var node = event.target;
					while(node){
						var curtarget = $(node);
						if(node.nodeType === 1){
							if(curtarget.hasClass("item")){
								if(!curtarget.hasClass("active")){
									musictype.find(".item").removeClass("active");
									curtarget.addClass("active");
									showMusiclist();
								}
							}
						}
						node = node.parentNode;
					}
				});
				musiclist.unbind("click").click(function(event){
					var node = event.target;
					while(node){
						var curtarget = $(node);
						if(node.nodeType === 1){
							if(curtarget.hasClass("item")){
								musiclist.find(".item.active").removeClass("active");
								curtarget.addClass("active");
								var curmusic = curtarget.data("music");
								musicPlayer.pause();
								musicPlayer.src = curmusic.url;
								musicPlayer.play();
								pcontainer.find("#bgmusic").val(curmusic.url);
								saveData(function(data){
									base.tip(data.error,function(){
										if(data.flag == 1){
											base.tip(data.error,function(){
												uptplFunc();
											});
										}else{
											musicarea.hide();
											cardoverlay.hide();
										}
									});
								});
								break;
							}
						}
						node = node.parentNode;
					}
				});

				txtarea.find(".btns .cellbtn").unbind("click").click(function(){
					var curtarget = $(this),
						curtextarea = txtarea.find("textarea"),
						titleval = txtarea.find("#updatetitle").val(),
						conval = curtextarea.val();
					if(curtarget.hasClass("btn-sub")){
						hinnertext.removeClass("scrolltext");
						pcontainer.find(".holiday-title-text").html(titleval);
						pcontainer.find(".holiday-content-text").html(conval);
						pcontainer.find("#tplcontent").val(conval);
						pcontainer.find("#tpltitle").val(titleval);
						saveData(function(data){
							base.tip("修改成功",function(){
								var innertextH = hinnertext[0].offsetHeight;
								if(innertextH > hconH){
									hinnertext.addClass("scrolltext");
								}
								uptplFunc();
							});
						});
					}
					txtarea.css({"transform": "translateY(0px)"});
					cardoverlay.hide();
				});
				uploadvoicearea.find(".btns .cellbtn").unbind("click").click(function(){
					var curtarget = $(this);
					if(curtarget.hasClass("btn-sub")){
						saveData(function(data){
							base.tip("祝福语更新成功");
						});
					}
					uploadvoicearea.css({"transform": "translateY(0px)"});
					cardoverlay.hide();
				});
				var lvoicetimer = 0,lvoicetimerInterval;
				//开始录音
				loadvoice.unbind("click").click( function(event) {
					event.preventDefault();
					var curtarget = $(event.target);
					if(curtarget.hasClass("start")) {
						var cur = this;
						loadvoice.removeClass("start");
						loadvoice.addClass("stop")
						wx.ready(function () {
							wx.startRecord({
								success:function(){
									clearInterval(lvoicetimerInterval);
									lvoicetimer = 0;
									loadvoice.find(".stopvoice").html("59s");
									lvoicetimerInterval = setInterval(function () {
										loadvoice.find(".stopvoice").html((59 - lvoicetimer) + "s");
										if (lvoicetimer == 59) {
											clearInterval(lvoicetimerInterval);
											loadvoice[0].click();
										}
										lvoicetimer++;
									}, 1000);
								},
								fail: function (res) {
									base.tip("录音失败");
									loadvoice.removeClass("stop").addClass("start");
								}
							});
						});
					}else if(curtarget.hasClass("stopvoice")){
						loadvoice.removeClass("stop").addClass("start");
						loadvoice.find(".stopvoice").html("");
						wx.ready(function () {
							wx.stopRecord({
								success: function (res) {
									var voice = {};
									voice.localId = res.localId;
									clearInterval(lvoicetimerInterval);
									wx.uploadVoice({
										localId: voice.localId,
										success: function (res1) {
											if (lvoicetimer <= 0) lvoicetimer = 1;
											base.ajax({
												myApp:myApp,
												url:"ajax/api.php?action=uploadvoice&mediaid="+res1.serverId,
												success:function(ret){
													if(ret.flag == 1){
														pcontainer.find("#bgmusic").val(base.getPhoto(ret.data));
														musicPlayer.pause();
														musicPlayer.src = base.getPhoto(ret.data);
														musicPlayer.play();
														audiobtn.addClass("on");
														saveData(function(data){
															base.tip(data.error,function(){
																uptplFunc();
															});
														});
													}else{
														base.tip(ret.error);
													}
												}
											});
											//wx.playVoice({
											//	localId: voice.localId
											//});
										},
										fail: function () {
											lvoicetimer = 0;
											base.tip("语音发送失败");
										}
									});
								}
							});
						});
					}else if(curtarget.hasClass("cancelvoice")){
						wx.stopRecord();
						clearInterval(lvoicetimerInterval);
						lvoicetimer = 0;
						loadvoice.removeClass("stop").addClass("start");
						loadvoice.find(".stopvoice").html("");
					}
				});
			}else if(pname == "hongbao_main"){
				require(["jquery.md5","base64.min"],function(){
					var curticket = pcontainer.find("#curticket").val() == "" ? base.getTicket() : pcontainer.find("#curticket").val(),
						muid = $.md5(pcontainer.find("#useruid").val()),
						randomkey = pcontainer.find("#randomkey").val();
					var curbtn = $(this);
					if($(".notifications")[0]){
						myApp.closeNotification($(".notifications"));
						$("body").removeClass("sharenotify");
					}
					var hblayer = pcontainer.find(".hblayer"),
						hbchaibtn = hblayer.find(".chai"),
						hbresult = pcontainer.find(".hbresultlayer"),
						resultlist = hbresult.find(".resultlist"),
						resulttemplate = hbresult.find(resultlist.attr("template"));
					resultlist.css("height", hblayer.height() - 260);
					hblayer.find(".close").unbind("click").click(function () {
						window.WeixinJSBridge && WeixinJSBridge.call("closeWindow");
					});
					hbresult.find(".close").unbind("click").click(function () {
						window.WeixinJSBridge && WeixinJSBridge.call("closeWindow");
					});
					function afterChaihb(os){
						var curitem = os.curitem,
							area = os.area,
							btn = os.btn,
							data = os.data;
						curitem.removeClass("fan1");
						var timeout = 1000;
						if (data.flag == 1) {
							timeout = 1000;
						} else {
							timeout = 2000;
						}
						if (data.needsubscribe) {
                                                        if(params.ticket){
                                                        	myApp.showIndicator();
                                                                require(["zhoubian"],function(){
                                                                        BeaconAddContactJsBridge.ready(function(){
                                                                                BeaconAddContactJsBridge.invoke('checkAddContactStatus',{} ,function(apiResult){
                                                                                        if(apiResult.err_code == 0){
                                                                                                var status = apiResult.data;
                                                                                                if(status == 0){
                                                                                                        myApp.hideIndicator();
                                                                                                        curitem.removeClass("disabled");
                                                                                                        myApp.confirm("未关注，要去关注吗？", "", function () {
                                                                                                                BeaconAddContactJsBridge.invoke('jumpAddContact');
                                                                                                        });
                                                                                                }
                                                                                        }
                                                                                });
                                                                        });
                                                                });
							}else{
                                                                myApp.confirm("未关注，要去关注吗？", "", function () {
                                                                        location.href = "subscribe.php";
                                                                });
							}
						} else {
							if(data.flag != 1){
								base.tip(data.error,2000,function(){
									window.WeixinJSBridge && WeixinJSBridge.call("closeWindow");
								});
							}else{
								hbresult.find("#disprice").html(data.data);
								hblayer.hide();
								hbresult.show();
							}
						}
					}
					hbchaibtn.unbind("click").click(function () {
						var cur = $(this),
							btime = Date.parse(new Date());
						if (!cur.hasClass("disabled")) {
							cur.addClass("disabled");
							cur.removeClass("fan1").addClass("fan1");
							$.ajax({
								url: "ajax/operation.php?action=shakearoundhongbao&id=" + params.id,
								data:{sign:Base64.encode(curticket+muid+randomkey)},
								type:"post",
								dataType:"json",
								success: function (data) {
									var atime = Date.parse(new Date()),
										paramdata = {
											curitem: cur,
											data: data
										};
									if (atime - btime < 2000) {
										setTimeout(function () {
											afterChaihb(paramdata);
										}, (2000 - atime + btime));
									} else {
										afterChaihb(paramdata);
									}
								}
							});
						}
					});
				});
			}else if(pname == "indexpage"){
				var listparams = $.extend({}, scrollListparams);
				listparams = $.extend(listparams,{
					geturl:"ajax/api.php?action=list&module=channel&parentid="+params.id,
					curtemplate:pcontainer.find(".template")
				});
				base.getListData(listparams);
			}else if(pname == "holidayactadd" || pname == "calendaradd"){
				var set_holidayType = window.Holiday_Setting.holidayType,
					subbtn = $("#navitoolbar").find(".subFormBtn"),
					subForm = pcontainer.find(subbtn.attr("form")),
					subForm = pcontainer.find(".subForm"),
					subTitle = subForm.find("#title"),
					subPhoto = subForm.find("#postphoto"),
					subHolidayTitle = subForm.find("#holidaytitle"),
					subHolidayContent = subForm.find("#holidaycontent");
				if(!$("#wnl_calendar")[0]){
					$('<link id="wnl_calendar" href="data/css/wnl/calendar.css?v='+jsversion+'" rel="stylesheet" type="text/css"/>').appendTo($("head"));
				}
				var gNum;
				if(pcontainer.find(".wnl-content .colitem").length == 0) {
					base.taskData({
						data: [0, 1, 2, 3, 4, 5],
						handleFunction: function (row) {
							return function (done) {
								var rowtmp = base.getNewTemplate(pcontainer.find(".template"), pcontainer),
									rowitem = rowtmp.find(".item").appendTo(pcontainer.find(".wnl-content"));
								rowtmp.remove();
								base.taskData({
									data: [0, 1, 2, 3, 4, 5, 6],
									handleFunction: function (col) {
										return function (done1) {
											var coltmp = base.getNewTemplate(pcontainer.find(".template1"), pcontainer),
												colitem = coltmp.find(".colitem").appendTo(rowitem.find(".rowappend")),
												curNum = row * 7 + col;
											coltmp.remove();
											colitem.attr("on", 0);
											colitem.attr("id", "GD" + curNum);
											colitem.find(".disday").attr("id", "SD" + curNum);
											colitem.find(".disholiday").attr("id", "LD" + curNum);
											done1();
										}
									},
									callback: function () {
										done();
									}
								});
							}
						}
					});
				}
				require(['wnl/calendar'],function(){
					var nowdate = new Date();
					pcontainer.find(".wnl-container").calendar({
						minYear : nowdate.getFullYear(),
						minMonth : nowdate.getMonth(),
						minDay : nowdate.getDate(),
						callback : function(cur,dayJson){
							if(pname == "holidayactadd"){
								var curitem = $(cur),
									holidayEle = curitem.find(".disholiday"),
									holidayName = base.trim(curitem.attr("holiday")),
									cursetting = set_holidayType[holidayName];
								if(cursetting){
									subTitle.val(cursetting.title);
									subHolidayTitle.val(cursetting.title);
									subHolidayContent.val(cursetting.content);
									subPhoto.val(cursetting.photo);
								}else{
									subTitle.val(dayJson.zh_time+"活动");
									subHolidayTitle.val(dayJson.zh_time+"活动");
									subHolidayContent.val(dayJson.zh_time+"活动内容");
									subPhoto.val(pcontainer.find("#defaultavatar").val());
								}
								subForm.find("#holidaytype").val(holidayName);
								subForm.find("#starttime").val(dayJson.time);
                                                        }else if(pname == "calendaradd"){
								subForm.find("#calendartime").val(dayJson.time);
							}
						}
					});
				});
				if(pname == "holidayactadd"){
                                        subbtn.click(function(event){
						if(!subbtn.hasClass("disabled")) {
                                                        subbtn.addClass("disabled");
							base.ajaxSubmit({
								myApp: myApp,
								form: subForm,
								url: "ajax/service.php?action=addoperator&module=addoperator",
								success: function (data) {
                                                                        subbtn.removeClass("disabled");
									if (data.flag == 1) {
										if (data.orderid) {
											location.href = "/mobile/ajax/pay.php?orderid=" + data.orderid;
										} else {
											mainView.router.load({url: "holidayact.php?id=" + data.data});
										}
									} else {
										base.tip(data.error);
									}
								}
							});
						}
					});
                                }else if(pname == "calendaradd"){
                                        subbtn.click(function(event){
                                                if(!subbtn.hasClass("disabled")) {
                                                        subbtn.addClass("disabled");
                                                        var isSubmit = base.checkRequired(subForm);
                                                        if(!isSubmit){
                                                                base.tip("必填项不能为空");
                                                                return false;
                                                        }
                                                        base.ajaxSubmit({
                                                                myApp: myApp,
                                                                form: subForm,
                                                                url: "service.php?action=add&module=calendar",
								data:{},
                                                                success: function (data) {
                                                                        subbtn.removeClass("disabled");
                                                                        if (data.flag == 1) {
                                                                        	mainView.router.load({url:"user.php?action=success"});
                                                                        } else {
                                                                                base.tip(data.error);
                                                                        }
                                                                }
                                                        });
                                                }
                                        });
				}
			}else if(pname == "sharehongbao"){
				if(pcontainer.find(".hongbaolist")[0]){
					var hbparams = $.extend({}, scrollListparams);
					hbparams = $.extend(hbparams,{
						geturl:"ajax/sharehongbao.php?module=sharehongbao&action=receivelist&id="+params.id,
						scrollList:pcontainer.find(".hongbaolist"),
						curtemplate:pcontainer.find(".template")
					});
					base.getListData(hbparams);
				}
			}else if(pname == "sharehongbaoadd"){
				var curuploadfile = pcontainer.find(".uploadfile"),
					filetxt = curuploadfile.find(".filetxt"),
					postform = pcontainer.find("form");
				curuploadfile.find("input").change(function(event){
					var target = event.target,
						files = target.files;
					if(files.length == 0){
						curuploadfile.removeClass("active");
						filetxt.html("");
					}else{
						var filename = files[0].name;
						curuploadfile.addClass("active");
						filetxt.html(filename);
					}
				});
				$("#navitoolbar .sub-sharehongbao").click(function(event){
					var isSubmit = base.checkRequired(postform);
					if(!isSubmit){
						base.tip("必填项不能为空");
						return false;
					}
					var postmoney = pcontainer.find("#total").val();
					if(base.trim(postmoney) != ''){
						if(isNaN(postmoney)){
							base.tip("请输入正确的红包金额");
							return false;
						}
						if(pcontainer.find("#awardtype").val() == -1){
							base.tip("请选择红包类型");
							return false;
						}
						if(pcontainer.find("input[name=moduleid]").val() == ""){
							base.tip("请选择模块");
							return false;
						}
					}
					base.ajaxSubmit({
						myApp:myApp,
						form:pcontainer.find("form"),
						url:"service.php?module="+params.module+"&action=add",
						success:function(data){
							if(data.flag == 1){
								if(data.orderid){
									location.href = "/mobile/ajax/pay.php?orderid="+data.orderid;
								}else if(data.id){
									mainView.router.load({url:"sharehongbao.php?id="+data.id});
								}else{
									mainView.router.load({url:"user.php?action=success"});
								}
							}else{
								base.tip(data.error);
							}
						}
					});
				});
				var reportitems = pcontainer.find(".reportitems"),
					curindex = 1 + reportitems.find(".newadditem").length;
				pcontainer.unbind("click").click(function(event){
					var node = event.target;
					while(node){
						var cur = $(node);
						if(node.nodeType === 1) {
							var curtype = cur.attr("type");
							if (curtype == 6) {
								var hideInput = cur.find("input[type=hidden]");
								cur.find(".item-input .bg").remove();
								var popupUpload = base.getPopup(myApp, pcontainer.find(".template6"), "uploadphotoPopup");
								var curaddicon = popupUpload.find(".addicon"),
									fileInput = popupUpload.find("input[type=file]"),
									fileForm = popupUpload.find("form"),
									curphotolist = [];
								if (hideInput.val() != "") {
									curphotolist = hideInput.val().split(",");
									handlePhotoitem({
										data: curphotolist,
										area: cur,
										hideInput: hideInput,
										datalist: curphotolist,
										insertBeforeArea: curaddicon,
										curitem: cur,
										container : pcontainer
									});
								}
								if (window.WeixinJSBridge && !wxIsConfig) {
									base.handlewx(myApp, wxData);
									wxIsConfig = true;
								}
								base.uploadPhoto({
									myApp: myApp,
									form: fileForm,
									input: fileInput,
									callback: function (data) {
										if (data && data[0] && data[0].url) {
											var returl = data[0].url;
											curphotolist.push(returl);
											handlePhotoitem({
												data: [returl],
												area: cur,
												hideInput: hideInput,
												datalist: curphotolist,
												insertBeforeArea: curaddicon,
												curitem: cur,
												container : pcontainer
											});
										} else {
											if (data && data.ret == "-1") {
												return false;
											}
											base.tip("图片上传失败");
										}
									}
								});
								popupUpload.find(".btn-sub").click(function () {
									myApp.closeModal(popupUpload);
								});
								break;
							} else if (cur.hasClass("delitem")) {
								cur.parents(".newadditem").remove();
								if (reportitems.find(".newadditem").length < 9)pcontainer.find(".additem").show();
								break;
							}else if(curtype == "video"){
								var videoInput = cur.find("input[type=file]");
								videoInput.change(function(event){
									var curfiles = event.target.files,
										filetext = cur.find(".filetext");
									if(curfiles.length == 0){
										filetext.html(filetext.attr("text"));
									}else{
										filetext.html(curfiles[0].name);
									}
								});
							}else if(cur.attr("name") == "addmodule_name"){
								var moduleInput = cur,
									addmoduleInput = cur.parent().find("input[name=addmodule]"),
									moduleidInput = cur.parent().find("input[name=moduleid]");
								var curmodal = base.getPopup(myApp,pcontainer.find(".moduletemplate"),"knowledgePopup"),
									resultappend = curmodal.find(".appendarea");
								resultappend.html("");
								base.getJSON({
									url:"ajax/sharehongbao.php?action=mostselected",
									success:function(data){
										if(data && data.length>0){
											base.taskData({
												data:data,
												handleFunction:function(d){
													return function(done){
														var newstmp = base.getNewTemplate(pcontainer.find(".moduleitemtemplate"),pcontainer);
														if(!resultappend.find(".scroll_item[itemid="+d.id+"]")[0]){
															var curitem = newstmp.find(".scroll_item").appendTo(resultappend),
																curinput = curitem.find("input");
															curitem.attr("itemid",d.id);
															curitem.find(".distitle").html(d.title);
															curinput.val(d.id);
															curinput.attr("value",d.id);
															curinput.attr("addmodule",d.orimodule);
															curinput.attr("moduleid",d.orimoduleid);
														}
														newstmp.remove();
														done();
													}
												}
											});
										}
									}
								});
								curmodal.find(".btn-sub").click(function(){
									var modalform = curmodal.find(".subform"),
										checkeditem = modalform.find("input:checked");
									if(!checkeditem[0]){
										base.tip("请选择一项");
										return false;
									}
									addmoduleInput.val(checkeditem.attr("addmodule"));
									moduleidInput.val(checkeditem.attr("moduleid"));
									moduleInput.val(checkeditem.parent().find(".distitle").html());
									myApp.closeModal(curmodal);
								});
								curmodal.find(".kw").keyup(function(event){
									if(event.keyCode == 13){
										event.preventDefault();
										curmodal.find(".searchbar-cancel").click();
									}
								})
								curmodal.find(".searchbar-cancel").click(function(event){
									event.preventDefault();
									var kw = curmodal.find(".kw").val();
									if(base.trim(kw) != ""){
										base.ajax({
											myApp:myApp,
											url:"ajax/service.php?action=search&module=all",
											data:{keyword:kw},
											type:"post",
											success:function(ret){
												resultappend.html("");
												base.taskData({
													data : ret.data,
													handleFunction : function(d){
														return function(done){
															var newstmp = base.getNewTemplate(pcontainer.find(".moduleitemtemplate"),pcontainer);
															if(!resultappend.find(".scroll_item[itemid="+d.id+"]")[0]){
																var curitem = newstmp.find(".scroll_item").appendTo(resultappend),
																	curinput = curitem.find("input");
																curitem.attr("itemid",d.id);
																curitem.find(".distitle").html(d.title);
																curinput.val(d.id);
																curinput.attr("value",d.id);
																curinput.attr("addmodule",d.orimodule);
																curinput.attr("moduleid",d.orimoduleid);
															}
															newstmp.remove();
															done();
														}
													}
												});
											}
										});
									}
								});
							}
						}
						node = node.parentNode;
					}
				});
				pcontainer.find(".additem").unbind("click").click(function(event){
					var cur = $(this);
					curindex++;
					if(reportitems.find(".newadditem").length >= 9)cur.hide();
					var newitem = base.getNewTemplate(pcontainer.find(".template"),pcontainer);
					newitem.find(".disindex").html(curindex);
					newitem.find(".item").each(function(){
						var cur = $(this),
							hiderole = cur.find(".hiderole"),
							role = hiderole.attr("role");
						hiderole.attr("name",role+curindex);
					});
					reportitems.append(newitem.html());
					newitem.remove();
				});
			}else if(pname == "userlogin"){
				var loginForm = pcontainer.find("form"),
					loginname = loginForm.find("#loginname"),
					loginpwd = loginForm.find("#loginpwd");
				pcontainer.find(".btn-login").unbind("click").click(function(event){
					var nameVal = loginname.val(),
						pwdVal = loginpwd.val();
					if(nameVal == "" || pwdVal == ""){
						base.tip("用户名、密码不能为空");
						return false;
					}
					require(['base64.min'],function(){
						var basepwd = Base64.encode(nameVal.length+"\t"+nameVal+"\t"+pwdVal.length+"\t"+pwdVal);
						loginpwd.val(basepwd);
						base.ajaxSubmit({
							myApp:myApp,
							form:loginForm,
							url:"ajax/user.php?action=login",
							success:function(data){
								if(data.flag == 1){
									base.tip(data.error,function(){
										mainView.router.load({url:"user.php"});
									});
								}else{
									base.tip(data.error);
								}
							}
						});
					});
				});
			}else if(pname == "instantreply") {
				var replyinput = pcontainer.find(".replyInput"),
					subForm = pcontainer.find("form");
				pcontainer.find(".checkarea label").click(function(event){
					event.preventDefault();
					var cur = $(this),
						curinput = cur.find("input"),
						curchecked = curinput[0].checked,
						node = event.target,
						iscontinue = true,
						curselect = cur.find("select");
					while(node){
						if(node.nodeType === 1 && node.nodeName.toLowerCase() == "select"){
							iscontinue = false;
							break;
						}
						node = node.parentNode;
					}
					if(!iscontinue) return false;
					if(curselect[0]){
						if(curselect.val() == "-1"){
							base.tip(curselect.attr("tip"));
							return false;
						}else{
							subForm.find("input[role=select]").val("");
							subForm.find("input[name="+curselect.attr("name")+"]").val(curselect.val());
						}
					}else{
						subForm.find("input[role=select]").val("");
					}
					if(!curchecked){
						replyinput.val(curinput.val());
						replyinput.focus();
					}
					curinput[0].checked = !curchecked;
				});
				pcontainer.find(".cklist select").change(function(){
					var cur = $(this),
						curinput = cur.parent().find("input"),
						currole = curinput.attr("role"),
						curtext = curinput.attr("text"),
						curvalue = cur.val(),
						curhtml = cur.find("option:selected").html();
					if(curvalue == "-1"){
						curinput.val("");
					}else{
						var disval = curtext.replace("{"+currole+"}",curhtml);
						curinput.val(disval);
						if(curinput[0].checked){
							subForm.find("input[role=select]").val("");
							subForm.find("input[name="+currole+"]").val(curvalue);
							replyinput.val(curinput.val());
							replyinput.focus();
						}
					}
				});
				pcontainer.find(".btn-reply").click(function(){
					if(base.trim(replyinput.val()) == ""){
						base.tip("请输入回复内容");
						return false;
					}
					base.ajaxSubmit({
						myApp:myApp,
						form:subForm,
						url:"ajax/service.php?action=instantreply&module=service&uid="+params.uid,
						success:function(data){
							base.tip(data.error,function(){
								if(data.flag == 1){
									replyinput.val("");
								}
							});
						}
					});
				});
			}else if(pname == "memberslist"){
				var curlevel = params.level,
					checkallpush = navitoolbar.find(".checkallpush");
				if(curlevel) {
					navitoolbar.find(".pushtomember").unbind("click").click(function(){
						var cur = $(this),
							postform = pcontainer.find(cur.attr("form")),
							postdata = {};
						if(postform.find(".scroll_list input:checked").length == 0){
							base.tip("请选择客户");
							return false;
						}
						if(checkallpush.find("input:checked")[0]){
							postdata['selectall'] = 1;
						}
						if(!cur.hasClass("disabled") && params.level){
							cur.addClass("disabled");
							base.ajaxSubmit({
								myApp:myApp,
								form:postform,
								data:postdata,
								url:"ajax/service.php?module=newcustomer&action=customer&do=push&item="+curlevel,
								type:"post",
								success:function(data){
									base.tip(data.error);
									cur.removeClass("disabled");
								}
							});
						}
					});
					navitoolbar.find(".levelUpdate").unbind("click").click(function(event){
						base.ajax({
							myApp:myApp,
							url:"ajax/service.php?module=customerlevel&action=LevelUpdate",
							success:function(data){
								base.tip(data.error);
							}
						});
					});
					checkallpush.unbind("click").click(function(event){
						if(event.target.nodeName.toLowerCase() != "a"){
							event.preventDefault();
							var cur = $(this),
								curck = cur.find("input")[0],
								curchecked = !curck.checked;
							curck.checked = curchecked;
							scrollList.find("input").each(function(){
								if(this.checked != curchecked){
									this.checked = curchecked;
								}
							});
						}
					});
					pcontainer.find(".scroll_list").unbind("click").click(function(event){
						var node = event.target,
							curscroll = $(this),
							curckall = pcontainer.find(".checkallpush[role="+curlevel+"]");
						while(node){
							var curitem = $(node);
							if(node.nodeType === 1 && curitem.hasClass("scroll_item")){
								event.preventDefault;
								var curck = curitem.find("input")[0];
								if(checkallpush.find("input")[0].checked){
									checkallpush.find("input")[0].checked = false;
								}
								break;
							}
							node = node.parentNode;
						}
					});
				}
			}else if(pname == "customerlist"){
                                var pushsearchbar = pcontainer.find(".pushsearchbar");
                                pcontainer.find(".levelselect").change(function(){
                                        pushsearchbar.find("input[name=tolevel]").val(this.value);
                                });
                                base.searchEvent({
                                	container:pcontainer,
                                	element:pushsearchbar,
                                        resultarea:pcontainer.find(".listcon4 .appendarea"),
                                        listparams:scrollListparams,
					callback:function(d,curitem){
                                                curitem.find("input").attr("value",d.uid);
					},
                                        searchCallback:function(resultarea,ajaxparams){
                                                resultarea.find(".scroll_item").each(function(){
                                                        var cur = $(this);
                                                        if(cur.find("input:checked").length == 0){
                                                                cur.remove();
                                                        }
                                                });
                                        }
				});

                                pcontainer.find(".pushbtn").unbind("click").click(function(event){
                                	myApp.confirm("确定要推送吗？","",function(){
                                                var curlevel = pushsearchbar.find("input[name=level]").val(),
                                                        postdata = {},
                                                        subForm = pcontainer.find(".listcon4 .subform"),
                                                        suburl = subForm.attr("action");
                                                if(subForm.find("input:checked").length == 0){
                                                        postdata['selectall'] = 1;
                                                }
                                                if(curlevel == ""){
                                                        suburl = "";
                                                }
                                                postdata["item"] = curlevel;
                                                base.ajaxSubmit({
                                                        myApp:myApp,
                                                        form:subForm,
                                                        data:postdata,
                                                        url:suburl,
                                                        success:function(data){
                                                                if(data.flag == 1){
                                                                        base.tip(data.error,function(){
                                                                                pcontainer.find(".listcon4 .appendarea").html("");
                                                                        });
                                                                }else{
                                                                        base.tip(data.error);
                                                                }
                                                        }
                                                });
					});
                                });
                                pcontainer.find(".groupmsg").unbind("click").click(function(){
                                	var cur = $(this);
                                	base.prompt({
                                		myApp:myApp,
						title:cur.attr("prompttitle"),
                                                text:pcontainer.find(cur.attr("template")).html(),
                                                callbackOk:function(modal,closeModal){
                                                        var curmodal = modal.modal;
                                                        closeModal();
						}
					});
				});
			}else if(pname == "pageslist"){
				var pagesForm = pcontainer.find(".pagesForm"),
					clickelement = pagesForm.find(".clickelement"),
					hideInput = clickelement.parent().find("input[type=hidden]"),
					formavatar = pagesForm.find(".avatar");
                                clickelement.click(function(event){
                                	var cur = $(this),
						curmodal = base.getPopup(myApp,pcontainer.find(cur.attr("template")),"pagelistPopup"),
						modalForm = curmodal.find("form"),
						listparams = $.extend({
							scrollarea:curmodal.find(".popup-middle"),
							setcallback : function(d,tmp){
								tmp.find("input").attr("value",d.uid);
							}
						},scrollListparams);
                                        base.searchEvent({
                                                myApp:myApp,
                                                element:curmodal.find(".searchbar"),
                                                container:pcontainer,
                                                resultarea:curmodal.find(".appendarea"),
                                                listparams:listparams,
                                                allowEmpty:true,
                                                scrollarea:curmodal.find(".popup-middle")
                                        });
                                        curmodal.find(".btn-sub").click(function(){
                                        	var ckradio = modalForm.find("input:checked"),
							curitem = ckradio.parents(".scroll_item"),
							curdata = curitem.data("data");
                                        	if(ckradio.length == 0){
                                        		base.tip("请选择一项");
                                        		return false;
						}
                                                clickelement.val(curdata.nickname);
                                                hideInput.val(curdata.uid);
                                                formavatar.attr("src",curitem.find(".disavatar").attr("src"));
                                                myApp.closeModal(curmodal);
					});
				});
				navitoolbar.find(".binddevicepage").unbind("click").click(function(){
					var cur = $(this);
					if(pagesForm.find(".scroll_list input:checked").length == 0){
						base.tip("请至少选择一项");
						return false;
					}
					if(!cur.hasClass("disabled")){
						cur.addClass("disabled");
						base.ajaxSubmit({
							myApp:myApp,
							form:pagesForm,
							url:"ajax/admin.php?module=settings&type=pageSelect&deviceid="+params.deviceid,
							success:function(data){
								cur.removeClass("disabled");
                                                                base.tip(data.error);
							}
						});
					}
				});
                        }else if(pname == "makecredit"){
				var listparams = $.extend({}, scrollListparams);
				listparams = $.extend(listparams,{
					geturl:"ajax/api.php?action=mostshareview&module=news",
					getdata:{pagestart:0,limit:20},
					curtemplate:scrollList.attr("template") ? pcontainer.find(scrollList.attr("template")) : pcontainer.find(".template"),
					doneCallback:function(){listparams.loading=false;}
				});
				if(scrollList.find(".scroll_item").length == 0) {
					base.getListData(listparams);
				}
			}else if(pname == "newlist"){
				var userqrcode = pcontainer.find(".userqrcode");
				if(!userqrcode.attr("src")){
					$.ajax({
						url:"ajax/service.php?module=customer&action=new&do=userqrcode",
						dataType:"html",
						success:function(data){
							userqrcode.attr("src",data);
						}
					});
				}
			}else if(pname == "oldcustomerlist"){
				var searcharea = pcontainer.find(".jingzhunarea"),
					searchbar = searcharea.find(".searchbar"),
					kwarea = searchbar.find(".kw"),
					searchurl = searchbar.attr("searchurl"),
					resultarea = pcontainer.find(searchbar.attr("resultarea")),
					appendTemplate = pcontainer.find(searchbar.attr("template")),
                                        titleLayer = pcontainer.find(".titlelayer"),
					salesForm = pcontainer.find(".salesform"),
					salesTitle = salesForm.find(".title"),
					saleslistarea = pcontainer.find(".saleslistarea");
                                function handleSaleTitle(){
                                        var curval = salesTitle.val();
                                        console.log(curval);
                                        if(base.trim(curval) != ""){
                                                $.ajax({
                                                        url:"ajax/service.php?module=sales&action=sales&do=autofill",
                                                        data:{kw:curval},
                                                        type:"post",
                                                        dataType:"json",
                                                        success:function(data){
                                                                titleLayer.html("");
                                                                var retdata = data.data ? data.data : data;
                                                                if(retdata){
                                                                        base.taskData({
                                                                                data:retdata,
                                                                                handleFunction:function(d){
                                                                                        return function(done){
                                                                                                var newtmp = base.getNewTemplate(pcontainer.find(titleLayer.attr("template")),pcontainer),
                                                                                                        newitem = newtmp.find(".item").appendTo(titleLayer);
                                                                                                newtmp.remove();
                                                                                                newitem.data("data",d);
                                                                                                newitem.find(".distitle").html(d);
                                                                                                done();
                                                                                        }
                                                                                }
                                                                        });
                                                                }
                                                        }
                                                });
                                                titleLayer.show();
                                        }
                                }
                                salesTitle.unbind("keyup").keyup(function(event){
                                        handleSaleTitle();
                                });
                                salesTitle.unbind("focus").focus(function(event){
                                        handleSaleTitle();
                                });
                                titleLayer.unbind("click").click(function(event){
                                        var node = event.target;
                                        while(node){
                                                var curitem = $(node);
                                                if(node.nodeType === 1){
                                                        if(curitem.hasClass("item")){
                                                                var curdata = curitem.data("data");
                                                                salesTitle.val(curdata);
                                                                titleLayer.hide();
                                                                break;
                                                        }
                                                }
                                                node = node.parentNode;
                                        }
                                });
                                pcontainer.find(".btnprompt").unbind("click").click(function(){
                                	var cur = $(this);
                                        base.prompt({
                                                myApp:myApp,
                                                title:"搜索",
                                                text:pcontainer.find(cur.attr("template")).html(),
                                                beforeClick:function(promptmodal){
                                                        var modalarea = promptmodal.modal;
                                                        modalarea.find(".datepicker").each(function(){
                                                                var curpicker = $(this),
                                                                        maxYear = new Date().getFullYear(),
                                                                        minYear = maxYear - 10;
                                                                base.setTimePicker({
                                                                        myApp:myApp,
                                                                        input:curpicker,
                                                                        valinput:curpicker.parent().find("input[type=hidden]"),
                                                                        haveTime:false,
                                                                        minYear:minYear,
                                                                        maxYear:maxYear
                                                                });
                                                        });
                                                },
                                                callbackOk:function(promptmodal,closeModal){
                                                        var salesForm = promptmodal.modal.find("form");
                                                        var issubmit = base.checkRequired(salesForm);
                                                        if(!issubmit){
                                                                base.tip("必填项不能为空");
                                                                return false;
                                                        }
                                                        base.ajaxSubmit({
                                                                myApp:myApp,
                                                                form:salesForm,
                                                                url:"ajax/service.php?module=sales&action=sales&do=search",
                                                                success:function(ret){
                                                                        if(typeof ret.flag != "undefined" && ret.flag != 1){
                                                                                base.tip(ret.error);
                                                                        }else{
                                                                                saleslistarea.html("");
                                                                                closeModal();
                                                                                pcontainer.find(saleslistarea.attr("scrollarea")).unbind("scroll");
                                                                                base.taskData({
                                                                                        data:ret,
                                                                                        handleFunction:function(d){
                                                                                                return function(done){
                                                                                                        var did = d.id ? d.id : d.uid;
                                                                                                        if(!saleslistarea.find(".scroll_item[itemid="+did+"]")[0]){
                                                                                                                base.createNewitem({
                                                                                                                        template:pcontainer.find(saleslistarea.attr("template")),
                                                                                                                        data:d,
                                                                                                                        area:saleslistarea,
                                                                                                                        container:pcontainer
                                                                                                                });
                                                                                                        }
                                                                                                        done();
                                                                                                }
                                                                                        }
                                                                                });
                                                                        }
                                                                }
                                                        });
                                                }
                                        });
				});
				var buypusharea = pcontainer.find(".buypusharea"),
					buypushForm = buypusharea.find("form");
				buypusharea.find("[type=13] .clickelement").click(function(){
					var clickelement = $(this),
						curhideInput = clickelement.parent().find("input[type=hidden]"),
						modaltemplate = pcontainer.find(clickelement.attr("template")),
						idkey = clickelement.attr("idkey"),
						namekey = clickelement.attr("namekey"),
						curmodal = base.getPopup(myApp,modaltemplate,"popup"+new Date().getTime()),
						resultarea = curmodal.find(".appendarea"),
						idarray = [],
						namearray = [];
					base.searchEvent({
                                                myApp:myApp,
						element : curmodal.find(".searchbar"),
						container : pcontainer,
						resultarea : resultarea,
                                                listparams:scrollListparams
					});
					curmodal.find(".btn-sub").click(function(event){
						var ckitems = curmodal.find("input:checked");
						if(ckitems.length == 0){
							base.tip("请至少选择一项");
							return false;
						}
						ckitems.each(function(){
							var cur = $(this),
								curitem = cur.parents(".scroll_item"),
								curdata = curitem.data("data");
							idarray.push(curdata[idkey]);
							namearray.push(curdata[namekey]);
						});
						clickelement.val(namearray.join(","));
						curhideInput.val(idarray.join(","));
						myApp.closeModal(curmodal);
					});
				});
				buypusharea.find(".clickelement.search").unbind("click").click(function(){
					var clickelement = $(this),
                                                curhideInput = clickelement.parent().find("input[type=hidden]"),
                                                idkey = clickelement.attr("idkey"),
                                                namekey = clickelement.attr("namekey"),
                                                curmodal = base.getPopup(myApp,pcontainer.find(clickelement.attr("template")),"popup"+new Date().getTime()),
						searchForm = curmodal.find(".serarchform"),
                                                resultarea = curmodal.find(".appendarea"),
                                                idarray = [],
                                                namearray = [];
                                        curmodal.find(".datepicker").each(function(){
                                                var curpicker = $(this),
                                                        maxYear = new Date().getFullYear(),
                                                        minYear = maxYear - 10;
                                                base.setTimePicker({
                                                        myApp:myApp,
                                                        input:curpicker,
                                                        valinput:curpicker.parent().find("input[type=hidden]"),
                                                        haveTime:false,
                                                        minYear:minYear,
                                                        maxYear:maxYear
                                                });
                                        });
                                        curmodal.find(".btn-search").click(function(){
                                        	var issubmit = base.checkRequired(searchForm);
                                        	if(!issubmit){
                                                        base.tip("必填项不能为空");
                                                        return false;
						}
                                                resultarea.html("");
                                                base.ajaxSubmit({
                                                        myApp:myApp,
                                                        form:searchForm,
                                                        url:"ajax/service.php?module=customer&action=customer_search",
                                                        success:function(ret){
                                                        	if(!ret || ret.length == 0){
                                                                        resultarea.append(pcontainer.find(resultarea.attr("emptytemplate")).html());
								}else{
									base.taskData({
										data:ret,
										handleFunction:function(d){
											return function(done){
												var did = d.id ? d.id : d.uid;
												if(!resultarea.find(".scroll_item[itemid="+did+"]")[0]){
													base.createNewitem({
														template:pcontainer.find(resultarea.attr("template")),
														data:d,
														area:resultarea,
														container:pcontainer
													});
												}
												done();
											}
										}
									});
                                                                }
                                                        }
                                                });
					});
                                        curmodal.find(".btn-sub").click(function(event){
                                        	var subForm = curmodal.find(".subform"),
                                                	ckitems = subForm.find("input:checked");
                                                if(ckitems.length == 0){
                                                        base.tip("请至少选择一项");
                                                        return false;
                                                }
                                                ckitems.each(function(){
                                                        var cur = $(this),
                                                                curitem = cur.parents(".scroll_item"),
                                                                curdata = curitem.data("data");
                                                        idarray.push(curdata[idkey]);
                                                        namearray.push(curdata[namekey]);
                                                });
                                                clickelement.val(namearray.join(","));
                                                curhideInput.val(idarray.join(","));
                                                myApp.closeModal(curmodal);
                                        });
				});
				buypusharea.find(".btnpush").click(function(event){
					event.preventDefault();
					var issubmit = base.checkRequired(buypushForm);
					if(!issubmit) {
						base.tip("必填项不能为空");
						return false;
					}
					base.ajaxSubmit({
						myApp:myApp,
						form:buypushForm,
						url:"ajax/service.php?module=customer&action=precisepush",
						success:function(ret){
							if(ret.flag == 1){
								base.tip(ret.error,function(){
									buypusharea.find("[type=13] .clickelement").val("");
									buypusharea.find("[type=13] .clickelement").parent().find("input[type=hidden]").val("");
								});
							}else{
								base.tip(ret.error);
							}
						}
					});
				});
				base.getJSON({
					url:"ajax/service.php?module=customer&action=salesqrcode",
					success:function(data){
						if(data.flag){
							pcontainer.find(".salesqrcode").html('<img src="'+data.data+'" style="max-width:100%;" />');
						}
					}
				});
			}else if(pname == "usersubscribe"){
				var checkallpush = pcontainer.find(".checkallpush"),
					postform = scrollList.parent();
				pcontainer.find(".btn-state").unbind("click").click(function(){
					myApp.prompt("备注","",function(value){
						base.ajax({
							myApp:myApp,
							url:"ajax/api.php?module=user&action=position",
							data:{"name":value,"uid":params.uid},
							type:"post",
							success:function(data){
								base.tip(data.error);
							}
						});
					});
				});
				pcontainer.find(".pushtouser").unbind("click").click(function(){
					var cur = $(this),
						currole = cur.attr("role");
					if(postform.find("input:checked").length > 10){
						base.tip("最多可推送十条");
						return false;
					}
					if(!cur.hasClass("disabled")){
						cur.addClass("disabled");
						base.ajaxSubmit({
							myApp:myApp,
							form:postform,
							url:"ajax/service.php?module=customer&action=newcustomer&do=pushtouser",
							type:"post",
							success:function(data){
								base.tip(data.error);
								cur.removeClass("disabled");
							}
						});
					}
				});
				checkallpush.unbind("click").click(function(event){
					if(event.target.nodeName.toLowerCase() != "a"){
						event.preventDefault();
						var cur = $(this),
							curck = cur.find("input")[0],
							curchecked = !curck.checked;
						curck.checked = curchecked;
						scrollList.find("input").each(function(){
							if(this.checked != curchecked){
								this.checked = curchecked;
							}
						});
					}
				});
				pcontainer.find(".scroll_list").unbind("click").click(function(event){
					var node = event.target,
						curscroll = $(this),
						curckall = pcontainer.find(".checkallpush");
					while(node){
						var curitem = $(node);
						if(node.nodeType === 1 && curitem.hasClass("scroll_item")){
							event.preventDefault;
							var curck = curitem.find("input")[0];
							if(checkallpush.find("input")[0].checked){
								checkallpush.find("input")[0].checked = false;
							}
							break;
						}
						node = node.parentNode;
					}
				});
			}else if(pname == "adminsetting"){
				pcontainer.find(".adminsetpush").unbind("click").click(function(event){
					var cur = $(this),
						curForm = pcontainer.find(cur.attr("form")),
						posturl = cur.attr("ajaxurl");
					base.ajaxSubmit({
						myApp:myApp,
						form:curForm,
						url:posturl,
						success:function(data){
							var timeout = 1000;
							if(data.flag != 1)timeout = 1500;
							base.tip(data.error,timeout);
						}
					});
				});
				pcontainer.find(".setsaleshongbao").unbind("click").click(function(event){
					var curbtn = $(this),
						curForm = pcontainer.find(curbtn.attr("form"));
					base.ajaxSubmit({
						myApp:myApp,
						form:curForm,
						url:"ajax/admin.php?module=settings&type=saleshongbao",
						success:function(data){
							base.tip(data.error);
						}
					});
				});
				pcontainer.find(".setservicehongbao").unbind("click").click(function(event){
					var curbtn = $(this),
						curForm = pcontainer.find(curbtn.attr("form"));
					base.ajaxSubmit({
						myApp:myApp,
						form:curForm,
						url:"ajax/admin.php?module=settings&type=servicehongbao",
						success:function(data){
							base.tip(data.error);
						}
					});
				});
			}else if(pname == "adminmembers"){
                                pcontainer.find(".chooseuser").each(function(){
                                	var curobj = $(this);
                                	base.clickPopup({
                                		myApp:myApp,
						container:pcontainer,
						element:curobj,
						listparams:scrollListparams,
                                                searchcallback:function(d,curitem){
                                                        curitem.find("input").attr("value",d.uid);
                                                },
                                                subcallback:function(modalform,closeModal){
                                                        var ckInput = modalform.find("input:checked");
                                                        if(ckInput.length == 0){
                                                                base.tip("请选择用户");
                                                                return false;
                                                        }
                                                        var ckitem = ckInput.parents(".scroll_item"),
                                                                ckdata = ckitem.data("data");
                                                        curobj.parent().find("input[type=hidden]").val(ckdata.uid);
                                                        curobj.val(ckdata.nickname);
                                                        curobj.parents(".tableitem").find(".avatar").attr("src",base.getAvatar(ckdata.uid));
                                                        closeModal();
                                        	}
					});
				});
				pcontainer.find(".sublizhi").unbind("click").click(function(){
					var cur = $(this),
						subForm = pcontainer.find(cur.attr("form")),
						isSubmit = base.checkRequired(subForm);
					if(!isSubmit){
						base.tip("必填项不能为空");
						return false;
					}
					base.ajaxSubmit({
						myApp:myApp,
						form:subForm,
						url:"ajax/admin.php?module="+params.module+"&action="+params.action+"&type=delcustomer",
						success:function(data){
							if(data.flag == 1){
								base.tip(data.error,function(){
									subForm.find(".empty").val("");
									subForm.find(".avatar").attr("src",DEFAULT_AVATAR);
								});
							}else{
								base.tip(data.error);
							}
						}
					});
				});
				function handleDepartitem(d,appendTemplate,appendarea,callback){
					var newtmp = base.getNewTemplate(appendTemplate,pcontainer),
						curitem = newtmp.find(".scroll_item").appendTo(appendarea);
					newtmp.remove();
					curitem.attr("itemid",d.uid);
					base.setDisinfo(d,curitem);
					curitem.find(".disavatar").attr("src",base.getAvatar(d.uid));
					curitem.find("input").attr("value",d.uid);
					callback && callback(curitem);
				}
				function departPopup(os){
					var cur = os.element,
						curarea = cur.parents(".tab.active").find(".getAjaxData"),
						departdata = os.data,
						curtemplate = pcontainer.find(cur.attr("template")),
						curmodal = base.getPopup(myApp,curtemplate,"popup-addgroup"),
						appendarea = curmodal.find(".appendarea"),
						appendTemplate = pcontainer.find(appendarea.attr("template")),
						groupname = curmodal.find(".groupname"),
						modalForm = curmodal.find("form");
					if(departdata){
						curmodal.find(".btn-del").parent().removeClass("hide");
						groupname.val(departdata.title);
						if(departdata.manager){
							handleDepartitem(departdata.manager,appendTemplate,appendarea,function(curitem){
								curitem.find("input").attr("checked","checked");
							});
						}
					}else{
						curmodal.find(".btn-del").parent().remove();
					}
                                        base.searchEvent({
                                                myApp:myApp,
                                                element:curmodal.find(".searchbar"),
                                                container:pcontainer,
                                                resultarea:curmodal.find(".appendarea"),
                                                listparams:scrollListparams,
                                                callback:function(d,curitem){
                                                        curitem.find("input").attr("value",d.uid);
                                                }
                                        });
					curmodal.find(".btn-sub").click(function(){
						var suburl = "ajax/admin.php?module=groups&action=add",
							gname = groupname.val();
						if(base.trim(gname) == ""){
							base.tip("请填写名称");
							return false;
						}
						var postdata = {};
						if(departdata){
							postdata["id"] = departdata.id;
                                                        suburl = "ajax/admin.php?module=groups&action=edit";
						}
						base.ajaxSubmit({
							myApp:myApp,
							form:modalForm,
							data:postdata,
							url:suburl,
							success:function(ret){
								if(ret.flag == 1){
									if(ret.data){
										var newtmp = curarea.find(".scroll_item[itemid="+ret.data.id+"]");
										if(newtmp[0]){
											newtmp.data("data",ret.data);
											newtmp.find(".distitle").html(ret.data.title);
										}else{
											var datatemplate = base.getNewTemplate(pcontainer.find(modalForm.attr("template")),pcontainer),
											//	newtmp = datatemplate.find(".scroll_item").appendTo(curarea),
                                                                                                newtmp = datatemplate.find(".scroll_item").prependTo(curarea),
												hrefarea = newtmp.find(".dishref");
											if(newtmp.hasClass("dishref")){
												hrefarea = newtmp;
											}
											datatemplate.remove();
											newtmp.attr("id",pname+"-"+ret.data.id);
											newtmp.attr("itemid",ret.data.id);
											base.setDisinfo(ret.data,newtmp);
											base.setDatestate(ret.data.dateline,newtmp.find(".disdatestate"));
											newtmp.data("data",ret.data);
											base.setDishref(hrefarea,ret.data);
										}
									}
									base.tip(ret.error,function(){
										myApp.closeModal(curmodal);
									});
								}else{
									base.tip(ret.error);
								}
							}
						});
					});
					curmodal.find(".btn-del").click(function(){
						myApp.confirm("确定要删除吗？","",function(){
							base.ajax({
								myApp:myApp,
								url:"ajax/admin.php?module=groups&action=delete&id="+departdata.id,
								success:function(ret){
									if(ret.flag == 1){
										base.tip(ret.error,function(){
											myApp.closeModal(curmodal);
											curarea.find(".scroll_item[itemid="+departdata.id+"]").remove();
										});
									}else{
										base.tip(ret.error);
									}
								}
							});
						});
					});
				}
				pcontainer.find(".departlist").unbind("click").click(function(event){
					var node = event.target;
					while(node){
						var curtarget = $(node);
						if(node.nodeType === 1){
							if(curtarget.hasClass("edit")){
								var curitem = curtarget.parents(".scroll_item"),
									curdata = curitem.data("data");
								departPopup({element:pcontainer.find(".addgroup"),data:curdata});
								break;
							}
						}
						node = node.parentNode;
					}
				});
				pcontainer.find(".addgroup").unbind("click").click(function(){
					var cur = $(this);
					departPopup({element:cur});
				});
                                base.clickPopup({
                                        myApp:myApp,
                                        container:pcontainer,
                                        element:pcontainer.find(".addkfaccount"),
                                        listparams:scrollListparams,
                                        searchcallback:function(d,curitem){
                                                curitem.find("input").attr("value",d.uid);
                                        },
                                        beforeClicksub:function(curmodal){
                                                var groupSelect = curmodal.find(".groupSelect");
                                                base.getJSON({
                                                        url:"ajax/admin.php?module=groups&action=list&type=0",
                                                        async:false,
                                                        success:function(data){
                                                                if(data && data.length > 0){
                                                                        for(var i=0;i<data.length;i++){
                                                                                var d = data[i];
                                                                                $('<option value="'+d.id+'">'+d.title+'</option>').appendTo(groupSelect);
                                                                        }
                                                                }
                                                        }
                                                });
					},
                                        subcallback:function(modalForm,closeModal){
                                                var postdata = {};
                                                if(modalForm.find("input:checked").length == 0){
                                                        base.tip("请选择用户");
                                                        return false;
                                                }
                                                base.ajaxSubmit({
                                                        myApp:myApp,
                                                        form:modalForm,
                                                        url:"ajax/admin.php?module=usergroup&action=add",
                                                        success:function(ret){
                                                                if(ret.flag == 1){
                                                                        if(ret.data){
                                                                        	var did = ret.data.id ? ret.data.id : ret.data.uid;
                                                                                var curarea = pcontainer.find(".addkfaccount").parents(".tab.active").find(".getAjaxData"),
                                                                                        curitem = curarea.find(".scroll_item[itemid="+did+"]");
                                                                                if(!curitem[0]){
                                                                                        var datatemplate = base.getNewTemplate(pcontainer.find(curarea.attr("template")),pcontainer),
                                                                                                newtmp = datatemplate.find(".scroll_item").appendTo(curarea);
                                                                                        datatemplate.remove();
                                                                                        newtmp.attr("itemid",did);
                                                                                        base.setDisinfo(ret.data,newtmp);
                                                                                        newtmp.find(".disavatar").attr("src",base.getAvatar(ret.data.uid));
                                                                                        base.setDatestate(ret.data.dateline,newtmp.find(".disdatestate"));
                                                                                }else{
                                                                                        for(var k in ret.data){
                                                                                                if(curitem.find(".dis"+k)[0]){
                                                                                                        curitem.find(".dis"+k).html(ret.data[k]);
                                                                                                }
                                                                                        }
                                                                                }
                                                                        }
                                                                        base.tip(ret.error,function(){
                                                                                closeModal();
                                                                        });
                                                                }else{
                                                                        base.tip(ret.error);
                                                                }
                                                        }
                                                });
                                        }
                                });
				base.clickPopup({
					myApp:myApp,
					container:pcontainer,
                                        element:pcontainer.find(".setkfaccount"),
                                        listparams:scrollListparams,
                                        searchcallback:function(d,curitem){
                                                curitem.find("input").attr("value",d.uid);
					},
                                        subcallback:function(subform,closeModal){
                                                var lxnum = subform.find("input[name=laxinnumber]").val(),
                                                	cks = subform.find("input:checked");
                                                base.ajaxSubmit({
                                                        myApp:myApp,
                                                        form:subform,
                                                        url:"ajax/admin.php?module=settings&type=laxinnumber",
                                                        success:function(data){
                                                                if(data.flag == 1){
                                                                	var accountlist = pcontainer.find(".kfacountlist");
                                                                        if(cks.length > 0){
                                                                                var ckuid = subform.find("input:checked").val(),
                                                                                        updateitem = accountlist.find(".scroll_item[uid="+ckuid+"]");
                                                                                updateitem.find(".dislaxinnumber").html(lxnum);
                                                                        }else{
                                                                                accountlist.find(".scroll_item .dislaxinnumber").html(lxnum);
									}
                                                                        base.tip(data.error,function(){
                                                                                closeModal();
                                                                        })
                                                                }else{
                                                                        base.tip(data.error);
                                                                }
                                                        }
                                                });
					}
				});
			}else if(pname == "admingrouplist"){
				var staffmanger = $(".set-staffmanger"),
					staffdepart = $(".set-staffdepart"),
					addstaff = $(".add-staff");
				staffmanger.unbind("click").click(function(){
					var ckinput = scrollList.find("input[type=radio]:checked"),
						ckval = ckinput.val(),
						curitem = ckinput.parents(".scroll_item");
					if(ckinput.length == 0){
						base.tip("请选择员工");
						return false;
					}
					base.ajax({
						myApp:myApp,
						url:"ajax/admin.php?module=admin&action=members&type=manager&id="+params.id,
						data:{uid:ckval},
						type:"post",
						success:function(ret){
							if(ret.flag == 1){
								base.tip(ret.error,function(){
									curitem.find(".qradio").hide();
									curitem.find(".manager-cell").removeClass("hide");
								});
							}else{
								base.tip(ret.error);
							}
						}
					});
				});
                                base.clickPopup({
                                        myApp:myApp,
                                        container:pcontainer,
                                        element:staffdepart,
                                        listparams:scrollListparams,
                                        searchcallback:function(d,curitem){
                                                curitem.find("input").attr("value",d.uid);
                                        },
                                        afterClick:function(){
                                                if(scrollList.find("input[type=radio]:checked").length == 0){
                                                        base.tip("请选择员工");
                                                        return false;
                                                }
					},
                                        beforeClicksub:function(curmodal){
                                                var groupparams = $.extend({},scrollListparams);
                                                groupparams = $.extend(groupparams,{
                                                	geturl:"ajax/admin.php?module=groups&action=list&type=0",
							scrollList:curmodal.find(".appendarea"),
							curtemplate:pcontainer.find(curmodal.find(".appendarea").attr("template")),
							setcallback:function(d,tmp){
                                                                tmp.find("input").attr("value",d.id);
							}
						});
                                                base.getListData(groupparams);
                                        },
                                        subcallback:function(modalForm,closeModal){
                                        	var ckinput = scrollList.find("input:checked"),
							ckitem = ckinput.parents(".scroll_item");
                                                base.ajaxSubmit({
                                                        myApp:myApp,
                                                        form:modalForm,
                                                        data:{uid:ckinput.val()},
                                                        url:modalForm.attr("action"),
                                                        success:function(ret){
                                                                if(ret.flag == 1){
                                                                        base.tip(ret.error,function(){
                                                                                ckitem.remove();
                                                                                closeModal();
                                                                        });
                                                                }else{
                                                                        base.tip(ret.error);
                                                                }
                                                        }
                                                });
                                        }
                                });
				scrollList.unbind("click").click(function(event){
					var node = event.target;
					while(node){
						if(node.nodeType === 1){
							var curtarget = $(node),
								curitem = curtarget.parents(".scroll_item");
							if(curtarget.hasClass("cancelmange")){
								myApp.confirm("确定要取消吗？","",function(){
									base.ajax({
										myApp:myApp,
										url:"ajax/admin.php?module=admin&action=members&type=unmanager&id="+params.id,
										data:{uid:curitem.attr("itemid")},
										type:"post",
										success:function(ret){
											if(ret.flag == 1){
												base.tip(ret.error,function(){
													curitem.find(".qradio").show();
													curitem.find(".manager-cell").addClass("hide");
												});
											}else{
												base.tip(ret.error);
											}
										}
									});
								});
								break;
							}
						}
						node = node.parentNode;
					}
				});
				base.clickPopup({
					myApp:myApp,
					container:pcontainer,
					element:addstaff,
                                        listparams:scrollListparams,
                                        searchcallback:function(d,curitem){
						curitem.find("input").val(d.uid);
					},
                                        aftersearch:function(resultarea){
                                                resultarea.find(".scroll_item").each(function(){
                                                        if($(this).find("input:checked").length == 0){
                                                                $(this).remove();
                                                        }
                                                });
					},
                                        subcallback:function(modalForm){
                                                var postdata = {};
                                                base.ajaxSubmit({
                                                        myApp:myApp,
                                                        form:modalForm,
                                                        url:modalForm.attr("action"),
                                                        success:function(ret){
                                                                if(ret.flag == 1){
                                                                        if(ret.data){
                                                                                var curarea = scrollList,
                                                                                        curitem = curarea.find(".scroll_item[itemid="+ret.data.uid+"]");
                                                                                if(!curitem[0]){
                                                                                        var datatemplate = base.getNewTemplate(pcontainer.find(curarea.attr("template")),pcontainer),
                                                                                                newtmp = datatemplate.find(".scroll_item").appendTo(curarea);
                                                                                        datatemplate.remove();
                                                                                        newtmp.attr("itemid",ret.data.uid);
                                                                                        base.setDisinfo(ret.data,newtmp);
                                                                                        newtmp.find(".disavatar").attr("src",base.getAvatar(ret.data.uid));
                                                                                        base.setDatestate(ret.data.dateline,newtmp.find(".disdatestate"));
                                                                                }else{
                                                                                        for(var k in ret.data){
                                                                                                if(curitem.find(".dis"+k)[0]){
                                                                                                        curitem.find(".dis"+k).html(ret.data[k]);
                                                                                                }
                                                                                        }
                                                                                }
                                                                        }
                                                                        base.tip(ret.error,function(){
                                                                                myApp.closeModal(curmodal);
                                                                        });
                                                                }else{
                                                                        base.tip(ret.error);
                                                                }
                                                        }
                                                });
					}
				});
			}else if(pname == "salesadd"){
				var btnSub = $(".sub-sales"),
                                        notyfytxt = pcontainer.find("#notyfytxt").val(),
					curtitle = pcontainer.find("#title"),
					titleTop = curtitle[0] ? curtitle[0].offsetTop : 0,
					titleLayer = pcontainer.find(".titlelayer"),
					titletemplate = pcontainer.find(titleLayer.attr("template")),
					subform = pcontainer.find("form"),
					appendarea = subform.find(".appendarea"),
					attacharea = pcontainer.find(".attacharea"),
                                        thanksarea = pcontainer.find(".thanksarea"),
					thanksparam = $.extend({
						geturl:"ajax/service.php?module=sales&action=salesinfo&do=record&id="+params.id,
						curtemplate:pcontainer.find(scrollList.attr("template")),
						setcallback:function(d,tmp){
							if(d.type == "hongbao"){
								tmp.find(".priceobj").removeClass("hide");
							}else{
                                                                tmp.find(".priceobj").remove();
							}
						},
                                                successCallback:function(data){
							if(!data || data.length == 0){
                                                                thanksarea.hide();
							}else{
                                                                thanksarea.show();
							}
						}
					},scrollListparams);
				base.getListData(thanksparam);
				if(params.neednotify && notyfytxt != ""){
                                        $("body").addClass("sharenotify");
                                        myApp.addNotification({
                                                title: '<span class="color-red" style="font-weight:bold;">'+notyfytxt+'</span>',
                                                subtitle: '',
                                                message: '',
                                                media:'',
                                                additionalClass:"sharetip",
                                                onClose: function () {
                                                        $("body").removeClass("sharenotify");
                                                }
                                        });
				}
                                pcontainer.find(".attachck").unbind("click").click(function(event){
                                        event.preventDefault();
                                        var node = target = event.target,
                                                cur = $(this),
                                                curck = cur.find("input")[0],
                                                ckchecked = curck.checked;
                                        if(node != curck){
                                                ckchecked = !ckchecked;
                                                curck.checked = ckchecked;
                                        }
                                        if(ckchecked){
                                                appendarea.append(attacharea.html());
                                        }else{
                                                appendarea.find(".attachitem").remove();
                                        }
                                });
				var labelcredit = pcontainer.find(".labelcredit"),
					creditnum = pcontainer.find(".creditnum"),
					priceinput = pcontainer.find("#price"),
					pricepercent = parseFloat(labelcredit.attr("percent"));
                                priceinput.unbind("keyup").keyup(function(){
                                	var cur = $(this),
						curval = cur.val();
                                	if(curval.length > 8){
                                		cur.val(curval.substring(0,8));
					}
					curval = cur.val();
                                	if(isNaN(curval)) {
                                                creditnum.hide();
                                        }else{
                                		curval = Math.floor(curval);
                                		if(!creditnum.is(":hidden")){
                                                        creditnum.html(Math.floor(parseFloat(curval)*pricepercent));
						}
					}

				});
                                labelcredit.unbind("click").click(function(event){
                                        event.preventDefault();
                                        var node = target = event.target,
                                                cur = $(this),
                                                curck = cur.find("input")[0],
                                                ckchecked = curck.checked,
						priceval = priceinput.val();
					if(base.trim(priceval) == ""){
						priceval = 0;
					}else{
                                                priceval = parseFloat(priceval);
					}
                                        if(node != curck){
                                                ckchecked = !ckchecked;
                                                curck.checked = ckchecked;
                                        }
                                        creditnum.html(Math.floor(priceval*pricepercent));
                                        if(ckchecked){
                                                creditnum.show();
                                        }else{
                                                creditnum.hide();
                                        }
                                });
				btnSub.click(function(event){
					var phoneval = subform.find("#phone").val();
					var issubmit = base.checkRequired(subform);
					if(!issubmit){
						base.tip("必填项不能为空");
						return false;
					}
					if(base.trim(phoneval) != "" && !base.checkmobile(phoneval)){
                                                base.tip("手机号码格式错误");
                                                return false;
					}
					myApp.confirm("确定要提交吗？提交后不能修改","",function(){
						base.ajaxSubmit({
							myApp:myApp,
							form:subform,
							url:subform.attr("action"),
							success:function(data){
								if(data.flag == 1){
									if(data.orderid){
										location.href='/mobile/ajax/pay.php?orderid='+data.orderid;
									}else{
                                                                                base.tip(data.error,function(){
                                                                                        mainView.router.refreshPage();
										});
									}
								}else{
									base.tip(data.error);
								}
							}
						});
                                        });
				});
				function handleTitle(){
					var curval = curtitle.val();
					if(base.trim(curval) != ""){
						$.ajax({
							url:"ajax/service.php?module=sales&action=sales&do=autofill",
							data:{kw:curval},
							type:"post",
							dataType:"json",
							success:function(data){
								titleLayer.html("");
								var retdata = data.data ? data.data : data;
								if(retdata){
									base.taskData({
										data:retdata,
										handleFunction:function(d){
											return function(done){
												var newtmp = base.getNewTemplate(titletemplate,pcontainer),
													newitem = newtmp.find(".item").appendTo(titleLayer);
												newtmp.remove();
												newitem.data("data",d);
												newitem.find(".distitle").html(d);
												done();
											}
										}
									});
								}
							}
						});
						titleLayer.show();
					}
				}
				curtitle.unbind("keyup").keyup(function(event){
					handleTitle();
				});
				curtitle.unbind("focus").focus(function(event){
					handleTitle();
				});
				titleLayer.unbind("click").click(function(event){
					var node = event.target;
					while(node){
						var curitem = $(node);
						if(node.nodeType === 1){
							if(curitem.hasClass("item")){
								var curdata = curitem.data("data");
								curtitle.val(curdata);
								titleLayer.hide();
								break;
							}
						}
						node = node.parentNode;
					}
				});
                                pcontainer.find(".datepicker").each(function(){
                                        var curpicker = $(this),
                                                maxYear = new Date().getFullYear(),
						minYear = maxYear - 10,
						haveTime = true;
                                        if(curpicker.attr("role") == "birthday"){
                                                minYear = maxYear - 80;
                                                haveTime = false;
					}
                                        base.setTimePicker({
                                                myApp:myApp,
                                                input:curpicker,
                                                valinput:curpicker.parent().find("input[type=hidden]"),
                                                haveTime:haveTime,
                                                minYear:minYear,
                                                maxYear:maxYear
                                        });
                                });
			}else if(pname == "salesorders"){
				pcontainer.find(".scroll_list").unbind("click").click(function(event){
					var node = event.target;
					while(node){
						var curtarget = $(node);
						if(node.nodeType === 1){
							if(curtarget.hasClass("return")){
								myApp.confirm("确定要退货吗？","",function(){
									var curitem = curtarget.parents(".scroll_item");
									base.ajax({
										myApp:myApp,
										url:"ajax/service.php?module=sales&action=sales&do=auto&do=return",
										data:{id:curitem.attr("itemid")},
										type:"post",
										success:function(data){
											if(data.flag == 1){
												base.tip(data.error,function(){
													curitem.remove();
												});
											}else{
												base.tip(data.error);
											}

										}
									});
								});
								break;
							}
						}
						node = node.parentNode;
					}
				});
			}else if(pname == "servicework"){
				pcontainer.find(".raindrops").eq(0).addClass("ok");
				var activetab = pcontainer.find(".tab.active");
                                activetab.find(".ajaxdatalist").each(function(){
					var curlist = $(this);
					if(curlist.find(".scroll_item").length == 0){
						var listparams = $.extend({},scrollListparams);
						listparams = $.extend(listparams,{
							geturl:curlist.attr("ajaxurl"),
							scrollList:curlist,
							curtemplate:pcontainer.find(curlist.attr("template"))
						});
						base.getListData(listparams);
                                        }
				});
                                pcontainer.find(".tab").on("show",function(){
                                        var curtab = $(this);
                                        curtab.find(".ajaxdatalist").each(function(){
                                                var curlist = $(this);
                                                if(curlist.find(".scroll_item").length == 0){
                                                        var listparams = $.extend({},scrollListparams);
                                                        listparams = $.extend(listparams,{
                                                                geturl:curlist.attr("ajaxurl"),
                                                                scrollList:curlist,
                                                                curtemplate:pcontainer.find(curlist.attr("template"))
                                                        });
                                                        base.getListData(listparams);
                                                }
                                        });
                                });
			}else if(pname == "servicecenter"){
				var wW = window.innerWidth,
					wH = window.innerHeight,
					innerW = Math.floor(wW*0.8),
					innerH = innerW,
					itemH = 109,
					disrowNum = 2,
					discolNum = 3,
					totalitem = disrowNum * discolNum,
					childlayers = pcontainer.find(".childlayer"),
					layerparams = {},
					childitems = pcontainer.find(".service_bottom .getchilditem"),
					firstchildimg = childitems.eq(0).find("img"),
					childimgWidth = firstchildimg[0].offsetWidth,
					childimgTop = firstchildimg[0].offsetTop;
				if(innerW > wH){
					innerW = Math.floor(wH*0.6);
					innerH = innerW;
				}
				disrowNum = Math.floor(innerH/itemH);
				if(disrowNum < 2) disrowNum = 2;
				innerW = innerH = disrowNum*itemH + 25;
				totalitem = disrowNum * discolNum;
				childlayers.find(".layerinner").each(function(){
					var cur = $(this),
						curswiperwrap = cur.find(".swiper-wrapper"),
						curslides = curswiperwrap.find(".swiper-slide"),
						slidelen = curslides.length;
					for(var i = 0;i<slidelen;i++){
						var curslide = curslides.eq(i),
							curitems = curslide.find(".item"),
							curitemlen = curitems.length,
							nextslide = curslides.eq(i+1);
						if(curitemlen == 0){
							curslide.remove();
						}else if(curitemlen < totalitem && nextslide[0]){
							var cha = totalitem - curitemlen;
							for(var j = 0;j<cha;j++){
								nextslide.find(".item").eq(0).appendTo(curslides);
								if(nextslide.find(".item").length == 0){
									nextslide.remove();
									slidelen = curslides.length;
									i--;
									break;
								}
							}
						}else if(curitemlen > totalitem){
							if(!nextslide[0]){
								nextslide = $('<div class="swiper-slide clear"></div>').appendTo(curslide.parent());
							}
							curslides = curswiperwrap.find(".swiper-slide");
							slidelen = curslides.length;
							var cha = curitemlen - totalitem;
							for(var j = 0;j<cha;j++){
								curslide.find(".item:last").prependTo(nextslide);
							}
						}
					}
				});
				childlayers.find(".layerinner").css({
					width:innerW,
					height:innerH,
					"margin-left":-innerW/2,
					"margin-top":-innerW/2
				});
				pcontainer.find(".service_bottom .getchilditem").each(function(){
					var cur = $(this),
						currole = cur.attr("role"),
						curimg = cur.find("img"),
						itemdata = {};
					itemdata["element"] = cur;
					itemdata["position"] = {
						"left":curimg[0].offsetLeft,
						"top":childimgTop,
						"width":childimgWidth
					};
					layerparams[currole] = itemdata;
				});
				childlayers.find(".bg").unbind("click").click(function(){
					var cur = $(this),
                                                ising = false,
                                                ingitem = pcontainer.find(".childlayer.ing"),
						curlayer = cur.parent(),
						curinner = curlayer.find(".layerinner");
                                        if(ingitem[0]){
                                                ising = true;
                                        }
                                        if(ising)return false;
                                        curlayer.addClass("ing");
					require(["jquery.transit.min"],function(){
						curinner.transition({
							scale:0,
							complete: function(){
                                                                setTimeout(function(){
                                                                        curlayer.removeClass("ing");
                                                                },500);
								curlayer.hide();
								curlayer.css({"opacity":0});
							}
						});
					});
				});
				pcontainer.find(".service_bottom .getchilditem").click(function(){
					var cur = $(this),
						ising = false,
                                                ingitem = pcontainer.find(".service_bottom .getchilditem.ing"),
						currole = cur.attr("role"),
						curtarget = pcontainer.find(".childlayer[role="+currole+"]"),
						targetinner = curtarget.find(".layerinner");
					if(ingitem[0]){
                                                ising = true;
					}
					if(ising)return false;
                                        cur.addClass("ing");
					childlayers.hide();
					curtarget.show();
					curtarget.css({"opacity":1});
					require(["jquery.transit.min"],function(){
						targetinner.transition({
							scale:1,
							complete: function(){
								setTimeout(function(){
                                                                        cur.removeClass("ing");
								},500);
								if(targetinner.find(".item").length > totalitem){
									if(!targetinner.data("swiper")){
										var mySwiper = myApp.swiper(targetinner.find('.swiper-container'), {
											pagination:targetinner.find('.swiper-pagination')
										});
										targetinner.data("swiper",mySwiper);
									}
								}
							}
						});
					});
				});
			}else if(pname == "servicestart"){
				var startSwiperContainer = pcontainer.find(".swiper-container"),
					pagebullets = startSwiperContainer.find(".swiper-pagination-bullet"),
					slides = startSwiperContainer.find(".swiper-slide"),
					curslideindex = 0,
					curslide = slides.eq(0),
					startSwiper,
					preindex = 0;
				if (startSwiperContainer.find("video")[0]) {
					base.handleEleSize(startSwiperContainer.find("video"));
				}
				if (startSwiperContainer.find("iframe")[0]) {
					base.handleEleSize(startSwiperContainer.find("iframe"));
				}
				if (!ISBACK || pagebullets.length == 0) {
					startSwiper = myApp.swiper(startSwiperContainer, {
						pagination: startSwiperContainer.find(".swiper-pagination")
					});
				}
			}else if(pname == "servicetimeline"){
                                var userdictarea = pcontainer.find(".userdictlist"),
					directparams = $.extend({}, scrollListparams);
                                directparams = $.extend(directparams,{
                                        geturl:"ajax/service.php?module=userdict&action=list&uid="+params.uid,
                                        scrollList : userdictarea,
                                        loading:true,
                                        curtemplate : pcontainer.find(userdictarea.attr("template")),
                                        doneCallback:function(){directparams.loading=false;}
                                });
                                if(userdictarea.find(".scroll_item").length == 0) {
                                	base.getListData(directparams);
                                }
                                var timelinearea = pcontainer.find(".timelinearea"),
                                        tltmp = pcontainer.find(timelinearea.attr("template")),
                                        tlparams = $.extend({}, scrollListparams);
                                if(timelinearea.find(".scroll_item").length == 0){
                                        tlparams = $.extend(tlparams,{
                                                geturl:"ajax/timeline.php?module=user&action=timeline&uid="+params.uid,
                                                scrollList : timelinearea,
                                                loading:true,
                                                curtemplate : tltmp,
                                                doneCallback:function(){tlparams.loading=false;}
                                        });
                                        base.getListData(tlparams);
                                }
			}else if(pname == "messageadd"){
				var msgcontent = pcontainer.find(".msgcontent"),
					clickelement = pcontainer.find(".clickelement");
                                base.emojiEvent(pcontainer.find("#emoji_list"),msgcontent);
                                clickelement.data("data",null);
                                pcontainer.find(".clickelement").unbind("click").click(function(event){
                                	var cur = $(this),
                                                curtemplate = pcontainer.find(cur.attr("template")),
                                                curmodal = base.getPopup(myApp,curtemplate,"popup-msguser"),
                                                appendarea = curmodal.find(".appendarea"),
                                                appendTemplate = pcontainer.find(appendarea.attr("template")),
						leftarea = curmodal.find(".leftclass"),
						leftitems = leftarea.find(".item"),
                                                customerselect = curmodal.find(".customerselect"),
                                        	checkall = curmodal.find(".checkall");
                                        checkall.click(function(event){
                                                event.preventDefault();
                                                var curinput = checkall.find("input"),
                                                        curchecked = curinput[0].checked;
                                                appendarea.find("input").each(function(){
                                                        if(this.checked == curchecked){
                                                                this.checked = !curchecked;
                                                        }
                                                });
                                                curinput[0].checked = !curchecked;
                                        });
                                        appendarea.click(function(event){
                                                var node = event.target;
                                                while(node){
                                                        var curitem = $(node);
                                                        if(node.nodeType === 1 && curitem.hasClass("scroll_item")){
                                                                event.preventDefault();
                                                                var curinput = curitem.find("input");
                                                                if(curinput[0].checked){
                                                                        checkall.find("input")[0].checked = false;
                                                                }
                                                                curinput[0].checked = !curinput[0].checked;
                                                        }
                                                        node = node.parentNode;
                                                }
                                        });
                                	function getActiveContent(url){
                                                base.getJSON({
                                                        url:url,
                                                        success:function(data){
                                                                var td = data.data ? data.data : data;
                                                                base.taskData({
                                                                        data:td,
                                                                        handleFunction : function(d){
                                                                                return function(done){
                                                                                	var did = d.id ? d.id : d.uid;
                                                                                        if(!appendarea.find(".scroll_item[itemid="+did+"]")[0]){
                                                                                                var newtmp = base.getNewTemplate(appendTemplate,pcontainer),
                                                                                                        curitem = newtmp.find(".scroll_item").appendTo(appendarea);
                                                                                                newtmp.remove();
                                                                                                curitem.data("data",d);
                                                                                                curitem.attr("itemid",did);
                                                                                                base.setDisinfo(d,curitem);
                                                                                                curitem.find("input").attr("value",did);
                                                                                        }
                                                                                        done();
                                                                                }
                                                                        }
                                                                });
                                                        }
                                                });
					}
                                        leftitems.unbind("click").click(function(){
                                        	var curitem = $(this),
							currole = curitem.attr("role");
                                        	if(!curitem.hasClass("active")){
                                                        checkall.find("input")[0].checked = false;
                                                        leftitems.removeClass("active");
                                                        curitem.addClass("active");
                                                        if(currole == "customer"){
                                                                customerselect.show();
							}else{
                                                                customerselect.hide();
							}
                                                        appendarea.html("");
                                                        getActiveContent(curitem.attr("ajaxurl"));
						}
					});
                                        getActiveContent(leftarea.find(".item.active").attr("ajaxurl"));
                                        customerselect.change(function(){
                                                checkall.find("input")[0].checked = false;
                                        	var curval = this.value,
							geturl = leftarea.find(".item[role=customer]").attr("ajaxurl");
                                        	if(curval != -1){
                                                        geturl = "ajax/service.php?module=customer&action=customer&do=members&item="+curval;
						}
                                                appendarea.html("");
                                        	getActiveContent(geturl);
					});
                                        curmodal.find(".btn-sub").click(function(){
                                                var ckitems = appendarea.find("input:checked").parents(".scroll_item");
                                                if(ckitems.length == 0){
                                                        base.tip("请选择用户");
                                                        return false;
                                                }
                                                var selectdata = [],disnames = [];
                                                for(var i=0;i<ckitems.length;i++){
                                                        var ckdata = ckitems.eq(i).data("data");
                                                        selectdata.push(ckdata);
                                                        if(ckdata.linkman){
                                                                disnames.push(ckdata.linkman);
							}else if(ckdata.username){
                                                                disnames.push(ckdata.usernamevv);
							}else{
                                                                disnames.push(ckdata.title);
							}
                                                }
                                                clickelement.data("data",selectdata);
                                                clickelement.val(disnames.join(","));
                                                myApp.closeModal(curmodal);
                                        });
                                });
                                pcontainer.find(".btnsub").unbind("click").click(function(){
                                        var msgval = msgcontent.val(),
						sendtype = clickelement.data("sendtype");
                                        if(base.trim(msgval) == ""){
                                                base.tip("消息内容不能为空");
                                                return false;
                                        }
                                        //myApp.showIndicator();
                                        base.taskData({
                                                data:clickelement.data("data"),
                                                handleFunction:function(d){
                                                        return function(done){
                                                        	if(sendtype == "meeting"){
                                                                        base.ajax({
                                                                                myApp:myApp,
                                                                                url:"ajax/meeting.php?action=sendmessage&meetingid="+d.id,
                                                                                data:{content:msgval,module:"message",msgtype:"text"},
                                                                                type:"post",
                                                                                async:false,
                                                                                success:function(data){
                                                                                        if(data.flag == 1){
                                                                                                done();
                                                                                        }else{
                                                                                                myApp.hideIndicator();
                                                                                                base.tip(data.error);
                                                                                        }
                                                                                }
                                                                        });
								}else{
									var touid = d.uid;
                                                                        base.ajax({
                                                                                myApp:myApp,
										url:"ajax/service.php?module=message&action=sendmessage&from=chat",
										data:{content:msgval,module:"message",msgtype:"text",touid:touid},
										type:"post",
										async:false,
										success:function(data){
											if(data.flag == 1){
												done();
											}else{
												myApp.hideIndicator();
												base.tip(data.error);
											}
										}
									});
                                                                }
                                                        }
                                                },
                                                callback:function(){
                                                        //myApp.hideIndicator();
                                                        base.tip("成功",function(){
                                                                clickelement.data("data",null);
                                                                clickelement.val("");
                                                                msgcontent.val("");
                                                        });
                                                }
                                        });
				});
			}else if(pname == "newspay"){
				var paycontainer = pcontainer.find(".paycontainer"),
					paylayer = paycontainer.find(".layer"),
					payinner = paylayer.find(".inner"),
					wW = paycontainer.width(),
					wH = paycontainer.height(),
					innerW = wW*0.65 > 500 ? 500 : wW*0.65,
					innerH = innerW/1.5,
					marginTop = -(Math.floor(innerH/2+wH*0.1));
                                if(innerW < 300){
                                        innerW = wW * 0.8;
                                        innerH = innerW / 1.5;
                                        marginTop = -(Math.floor(innerH/2+wH*0.05));
                                }
                                var marginLeft = -(Math.floor(innerW/2));
                                payinner.css({width:innerW,height:innerH,"margin-left":marginLeft,"margin-top":marginTop});
                                paylayer.show();
				pcontainer.find(".btnpay").unbind("click").click(function(){
					var cur = $(this);
					if(!cur.hasClass("disabled")){
						cur.addClass("disabled");
						base.ajax({
							myApp:myApp,
							url:"ajax/api.php?module=news&action=newspayoderid&id="+params.id,
							type:"post",
							success:function(data){
								if(data.flag == 1 && data.orderid){
                                                                        location.href='/mobile/ajax/pay.php?orderid='+data.orderid;
								}else{
									base,tip(data.error,1500);
								}
							}
						});
					}
				});
			}else if(pname == "_shop"){
				var recommSlider = pcontainer.find(".shop-container"),
					winW = pcontainer.find(".shopcontainer").width(),
                                        recommH = winW / 2.5,
                                        recommSwiper;
                                recommSlider.css({height: recommH + "px"});
                                recommSlider.find(".swiper-wrapper").css({height: recommH + "px"});
				if(recommSlider.find(".swiper-slide").length > 1){
                                        recommSwiper = myApp.swiper(recommSlider, {
                                                pagination: '.swiper-pagination-comm',
                                                autoplay: 6000,
                                                speed: 1000,
                                                loop: true,
                                                onTouchStart: function () {
                                                        recommSwiper && recommSwiper.stopAutoplay();
                                                },
                                                onTransitionEnd: function () {
                                                        recommSwiper && recommSwiper.startAutoplay();
                                                },
                                                onTouchEnd: function () {
                                                        recommSwiper && recommSwiper.startAutoplay();
                                                }
                                        });
				}
				pcontainer.find(".getAjaxData").each(function(i){
					var cur = $(this);
					if(cur.find(".scroll_item").length == 0){
						var curajaxurl = cur.attr("ajaxurl"),
							curtemplate = pcontainer.find(cur.attr("template"));
						if(curajaxurl && curtemplate[0]){
							var j=0;
                                                        var curajaxparams = $.extend({}, scrollListparams);
                                                        curajaxparams = $.extend(curajaxparams,{
                                                                geturl:curajaxurl,
                                                                curtemplate:curtemplate,
                                                                scrollList:cur,
								setcallback:function(d,tmp){
                                                                	var picrate = cur.attr("picrate");
                                                                	if(picrate){
										var picheight = cur.attr("picheight");
										if(picheight){
											tmp.find(".pic").css({height:picheight});

										}
                                                                        }
								},
                                                                aftersetCallback:function(d,curitem){
                                                                        var picrate = cur.attr("picrate");
                                                                        if(picrate) {
                                                                                var picheight = cur.attr("picheight");
                                                                                if (!picheight) {
                                                                                        var picw = curitem.find(".pic").width(),
                                                                                                picheight = Math.floor(picw / picrate);
                                                                                        cur.attr("picheight", picheight);
                                                                                        curitem.find(".pic").css({height: picheight});
                                                                                }
                                                                        }
                                                                        if(i == 1){
                                                                                if(j == 0){
                                                                                        curitem.addClass("new");
                                                                                }else if(j == 1){
                                                                                        curitem.addClass("hot");
										}else if(j == 2){
                                                                                        curitem.addClass("cut");
										}
                                                                        }
                                                                        if(d.fullcutid){
                                                                        	curitem.removeClass("new").removeClass("hot").addClass("cut");
									}
                                                                        j++;
								}
                                                        });
							base.getListData(curajaxparams);
                                                }
					}
				});
			}else if(pname == "_test"){
				/*
				var wH = window.innerHeight,
					notifytmp = pcontainer.find(".nitifytemplate"),
					newtmp = base.getNewTemplate(notifytmp,pcontainer);
				newtmp.find(".bknotify").css("transform","translate3d(0px, "+(-wH)+"px, 0px)");
				var bknotify = newtmp.find(".bknotify").appendTo("body");
				bknotify.find(".close").click(function(){
					bknotify.css("transform","translate3d(0px, "+(-bknotify[0].offsetHeight)+"px, 0px)");
					var transitionEvent = base.whichTransitionEvent();
					bknotify[0].addEventListener(transitionEvent, function() {
						bknotify.remove();
					});
				});
				bknotify.show();
				setTimeout(function(){
					bknotify.css("transform","translate3d(0px, 0px, 0px)");
				},500);
				*/

				base.notify({
					media:DEFAULT_AVATAR,
					defaultmedia:DEFAULT_AVATAR,
					title:"大标题",
					subtitle:"小标题",
					aftertitle:"跟随标题",
					template:pcontainer.find(".nitifytemplate")
				});

			}
		}
		ISBACK = false;
	});
	Dom('.popover a').on('click', function() {
		myApp.closeModal('.popover');
	});
	Dom('.panel-left').on('open', function() {
		Dom('.statusbar-overlay').addClass('with-panel-left');
	});
	Dom('.panel-right').on('open', function() {
		Dom('.statusbar-overlay').addClass('with-panel-right');
	});
	Dom('.panel-left, .panel-right').on('close', function() {
		Dom('.statusbar-overlay').removeClass('with-panel-left with-panel-right');
	});
});
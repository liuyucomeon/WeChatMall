websocket = new WebSocket(wsServer);
// 当socket连接打开时，输入用户名
websocket.onopen = wsOpen;
// 当有消息时根据消息类型显示不同信息
websocket.onmessage = wsMessage;
websocket.onclose = function() {
	console.log("连接关闭，定时重连");
	wsConnect();
};
websocket.onerror = function() {
	console.log("出现错误");
};
function wsOpen(){
	var str_login_data = JSON.stringify(socket_logindata);
	console.log("websocket握手成功，发送登录数据:"+str_login_data);
	websocket.send(str_login_data);
}
function wsConnect() {
	// 创建websocket
	websocket = new WebSocket(wsServer);
	// 当socket连接打开时，输入用户名
	websocket.onopen = wsOpen;
	// 当有消息时根据消息类型显示不同信息
	websocket.onmessage = wsMessage;
	websocket.onclose = function(){
		console.log("连接关闭，定时重连");
		wsConnect();
	};
	websocket.onerror = function() {
		console.log("出现错误");
	};
}
function wsMessage(e){
	var data = JSON.parse(e.data),
		dcontent = data.content;
	if(data.content && data.content != ""){
		dcontent = dcontent.replace(/&lt;/g, '<');
		dcontent = dcontent.replace(/&gt;/g, '>');
		dcontent = dcontent.replace(/&amp;/g, '&');
		dcontent = dcontent.replace(/&quot;/g, '"');
		dcontent = dcontent.replace(/&#039;/g, "'");
	}
	var saydata = {
		uid : data.from_uid,
		content : dcontent,
		dateline : data.time,
		msgtype : data.msgtype ? data.msgtype : "text",
		picurl : data.picurl ? data.picurl : "",
		thumb : data.thumb ? data.thumb : "",
		username : data.from_client_name,
		id : data.msgid
	};
	if(data.type == "say"){
		meeting_message_say && meeting_message_say(saydata);
		msg_message_say && msg_message_say(saydata);
		if(data.sayroom) {
                        $(".bknotify").remove();
                        var transitionEvent;
                        var el = document.createElement('fakeelement'),
                                transitions = {
                                        'transition': 'transitionend',
                                        'OTransition': 'oTransitionEnd',
                                        'MozTransition': 'transitionend',
                                        'WebkitTransition': 'webkitTransitionEnd'
                                };
                        for (var t in transitions) {
                                if (el.style[t] !== undefined) {
                                        transitionEvent = transitions[t];
                                        break;
                                }
                        }
                        var bknotify = $(".msgtiptemplate .tipnotify").clone().appendTo("body");
                        bknotify.addClass("bknotify");
                        bknotify.find(".disusername").html(saydata.username);
                        var discon = saydata.content;
                        if(saydata.msgtype == "image"){
                        	discon = "图片消息";
			}else if(saydata.msgtype == "voice"){
                                discon = "语音消息";
			}else if(saydata.msgtype == "video"){
                                discon = "视频消息";
                        }else if(saydata.msgtype == "push" || saydata.msgtype == "news"){
                                discon = "图文消息";
                        }
                        bknotify.find(".discontent").html(discon);
                        bknotify.find(".dishref").attr("href","service.php?module=message&action=view&uid="+saydata.uid);
                        bknotify.show();
                        setTimeout(function () {
                                $("#newmsg")[0].pause();
                                $("#newmsg")[0].play();
                                bknotify.css("transform", "translate3d(0px, 0px, 0px)");
                                /*
                                setTimeout(function(){
                                        bknotify.css("transform", "translate3d(0px, -" + bknotify[0].offsetHeight + "px, 0px)");
                                        bknotify[0].addEventListener(transitionEvent, function () {
                                                bknotify.remove();
                                        });
				},2000)
				*/
                        }, 500);
                        bknotify.find(".close").click(function () {
                                $("#newmsg")[0].pause();
                                bknotify.css("transform", "translate3d(0px, -" + bknotify[0].offsetHeight + "px, 0px)");
                                bknotify[0].addEventListener(transitionEvent, function () {
                                        bknotify.remove();
                                });
                        });
                }
	}else if(data.type=='login'){
		meeting_message_login && meeting_message_login(data);
		msg_message_login && msg_message_login(data);
	}else if(data.type=='logout'){
		meeting_message_logout && meeting_message_logout(data);
		msg_message_logout && msg_message_logout(data);
	}else if(data.type == "setnospeak") {
		metting_message_setnospeak && metting_message_setnospeak(data);
	}

}
define(function(require, exports, module) {
	var $ = jQuery = require("jquery");
	//var framework7 = require("framework7");
	var wx = require("jweixin");
	var Dom = Dom7;
	var Time = function(dt){
		return new Time.prototype.init(parseInt(dt) * 1000);
	};
	Time.prototype = {
		init : function(isodate){ this._date = new Date(isodate); this._now = new Date(); },
		time : function(){ return this._date.getTime(); },
		date : function(){ return this._date.getDate(); },
		day : function(){ return this._date.getDay(); },
		year : function(){ return this._date.getFullYear(); },
		month : function() { return this._date.getMonth() + 1; },
		hour : function() { return this._date.getHours(); },
		minute : function() { return this._date.getMinutes(); },
		second : function() { return this._date.getSeconds(); },
		millisecond : function() { return this._date.getMilliseconds(); }
	}
	Time.prototype.init.prototype = Time.prototype;

	var CanvasPwd = function(options){
		return new CanvasPwd.prototype.init(options);
	};
	CanvasPwd.prototype = {
		init:function(options){
			var self = this;
			self.strokeColor = "#8e94ad";
			self.fillColor = "#222736";
	    		self.R = 26;
	    		self.CW = 300;
	    		self.CH = 300;
	    		self.OffsetX = 30;
	    		self.OffsetY = 30;
			self.PointLocationArr = [];
			self.cLeft;
			self.cTop;
			self.canvasPwd(options);
		},
		CaculateNinePointLotion : function(diffX, diffY) {
			var self = this;
			var Re = [];
			for (var row = 0; row < 3; row++) {
				for (var col = 0; col < 3; col++) {
	                		var Point = {
	                        		X: (self.OffsetX + col * diffX + ( col * 2 + 1) * self.R),
	                        		Y: (self.OffsetY + row * diffY + (row * 2 + 1) * self.R)
	                        	};
	                        	Re.push(Point);
	                	}
	             	}
	             	return Re;
	        },
	        Draw : function (cxt, _PointLocationArr, _LinePointArr,touchPoint) {
	        	var self = this;
	        	if (_LinePointArr.length > 0) {
	             		cxt.beginPath();
	                	for (var i = 0; i < _LinePointArr.length; i++) {
	                		var pointIndex = _LinePointArr[i];
	                		cxt.lineTo(_PointLocationArr[pointIndex].X, _PointLocationArr[pointIndex].Y);
	                	}
		                cxt.lineWidth = 5;
		                cxt.strokeStyle = self.strokeColor;
		                cxt.stroke();
		                cxt.closePath();
		                if(touchPoint != null){
		                	var lastPointIndex = _LinePointArr[_LinePointArr.length-1];
		                	var lastPoint = _PointLocationArr[lastPointIndex];
		                	cxt.beginPath();
		                	cxt.moveTo(lastPoint.X,lastPoint.Y);
		                	cxt.lineTo(touchPoint.X-self.cLeft,touchPoint.Y-self.cTop);
		                	cxt.stroke();
		                	cxt.closePath();
		                }
	             	}
	        	for (var i = 0; i < _PointLocationArr.length; i++) {
	             		var Point = _PointLocationArr[i];
	                	cxt.fillStyle = self.strokeColor;
	                	cxt.beginPath();
	                	cxt.arc(Point.X, Point.Y, self.R, 0, Math.PI * 2, true);
	                	cxt.closePath();
	                	cxt.fill();
	                	cxt.fillStyle = self.fillColor;
	                	cxt.beginPath();
	                	cxt.arc(Point.X, Point.Y, self.R - 3, 0, Math.PI * 2, true);
	                	cxt.closePath();
	                	cxt.fill();
	                	if(_LinePointArr.indexOf(i)>=0){
	                		cxt.fillStyle = self.strokeColor;
	                		cxt.beginPath();
	                		cxt.arc(Point.X, Point.Y, self.R -16, 0, Math.PI * 2, true);
	                		cxt.closePath();
	                		cxt.fill();
	                	}
	             	}
	        },
	        IsPointSelect : function(touches,LinePoint){
	        	var self = this;
	        	for (var i = 0; i < self.PointLocationArr.length; i++) {
	        		var currentPoint = self.PointLocationArr[i];
	        		var xdiff = Math.abs(self.cLeft+currentPoint.X - touches.pageX);
	        		var ydiff = Math.abs(self.cTop+currentPoint.Y - touches.pageY);
	        		var dir = Math.pow((xdiff * xdiff + ydiff * ydiff), 0.5);
	        		if (dir < self.R ) {
	        			if(LinePoint.indexOf(i) < 0){ LinePoint.push(i);}
	        			break;
	                	}
	             	}
	        },
	        InitEvent : function(canvasContainer, cxt,callback) {
	        	var self = this;
			var LinePoint = [];
	        	canvasContainer.addEventListener("touchstart", function (e) {
	        		self.IsPointSelect(e.touches[0],LinePoint);
	        	}, false);
	        	canvasContainer.addEventListener("touchmove", function (e) {
	        		e.preventDefault();
	        		var touches = e.touches[0];
	        		self.IsPointSelect(touches,LinePoint);
	        		cxt.clearRect(0,0,self.CW,self.CH);
	        		self.Draw(cxt,self.PointLocationArr,LinePoint,{X:touches.pageX,Y:touches.pageY});
	        	}, false);
	        	canvasContainer.addEventListener("touchend", function (e) {
	        		cxt.clearRect(0,0,self.CW,self.CH);
	        		self.Draw(cxt,self.PointLocationArr,LinePoint,null);
	        		var sPwd = LinePoint.join('');
		        	callback && callback(sPwd,function(){
					cxt.clearRect(0,0,self.CW,self.CH);
					self.Draw(cxt, self.PointLocationArr, [],null);
		        	});
	        		LinePoint=[];
	        	}, false);
	        },
	        canvasPwd : function(p){
	        	var self = this;
			self.strokeColor = "#8e94ad";
			self.fillColor = "#222736";
			var pcontainer = p.pcontainer,
			    callback = p.callback,
			    avatar = $(".admincanvas .avatar"),
			    pwd = $("#admingesture").val(),
			    c = $("#adminCanvas")[0];
			if(pcontainer){
				avatar = pcontainer.find(".canvas .avatar");
				pwd = pcontainer.find("#gesture").val();
				c = pcontainer.find("#myCanvas")[0];
			}
			var winW = window.innerWidth,winH = window.innerHeight;
		        if(avatar[0]){
		       		self.cLeft = (winW-300)/2;
		        	self.cTop = (winH-300)/2;
			        var aLeft = (winW-100)/2;
			        var aTop = (self.cTop-100)/2;
			        if(self.cTop<140){
			        	self.cTop = 120;
			        	aTop = 5;
			        }
			        $(c).css({
			        	left : self.cLeft+"px",
			        	top : self.cTop+"px"
			        });
			        avatar.css({
			        	left : aLeft+"px",
			        	top: aTop+"px"
			        });
		        }else{
		        	self.strokeColor = "#627eed";
		        	self.fillColor = "#ffffff";
		       		self.cLeft = c.offsetLeft;
		        	self.cTop = c.offsetTop;
		        }
			c.width = self.CW;
			c.height = self.CH;
		        var cxt = c.getContext("2d");
		        var X = (self.CW - 2 * self.OffsetX - self.R * 2 * 3) / 2;
		        var Y = (self.CH - 2 * self.OffsetY - self.R * 2 * 3) / 2;
		        self.PointLocationArr = self.CaculateNinePointLotion(X, Y);
		        self.InitEvent(c, cxt,callback);
		        self.Draw(cxt, self.PointLocationArr, [],null);
		}
	}
	CanvasPwd.prototype.init.prototype = CanvasPwd.prototype;

	var base = {
		Time : Time,
		CanvasPwd : CanvasPwd,
		isMobile : function(){
			var ua = navigator.userAgent.toLowerCase();
			return ua.match(/iPhone|iPad|iPod|Android|IEMobile/i);
		},
		isAndroid : function(){
			var ua = navigator.userAgent.toLowerCase();
			return ua.indexOf("android") != -1 ? 1 : 0;
		},
		isIOS : function (){
			var ua = navigator.userAgent.toLowerCase();
			return (ua.indexOf("iphone") != -1 || ua.indexOf("ipad") != -1 || ua.indexOf("ipod") != -1) ? 1 : 0;
		},
		isAPP : function (){
			var ua = navigator.userAgent.toLowerCase();
			return ua.indexOf(" boka/") != -1 ? 1 : 0;
		},
		isWeixin : function(){
			var ua = navigator.userAgent.toLowerCase();
			return ua.indexOf("micromessenger") != -1 ? 1 : 0;
		},
		prventPc : function(){
			var self = this;
			if($("#ipjudge").val() != 1 && (!self.isWeixin() || !window.WeixinJSBridge)){
				location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx3ad0d2917aa5f45b&redirect_uri=&connect_redirect=1#wechat_redirect";
			}
		},
		trim : function(str){
			var ret = '';
			if(str){
				ret = str.replace(/\s+/g,"");
			}
			return ret;
		},
                zeroize : function(value, length){
                        if (!length) length = 2;
                        value = String(value);
                        for (var i = 0, zeros = ''; i < (length - value.length); i++)
                        {
                                zeros += '0';
                        }
                        return zeros + value;
		},
                dateFormat : function (now,mask){
			var d = new Date(parseInt(now) * 1000);
			return mask.replace(/"[^"]*"|'[^']*'|\b(?:d{1,4}|m{1,4}|yy(?:yy)?|([hHMstT])\1?|[lLZ])\b/g, function ($0)
			{
				switch ($0)
				{
					case 'd': return d.getDate();
					case 'dd': return base.zeroize(d.getDate());
					case 'ddd': return ['Sun', 'Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat'][d.getDay()];
					case 'dddd': return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()];
					case 'M': return d.getMonth() + 1;
					case 'MM': return base.zeroize(d.getMonth() + 1);
					case 'MMM': return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
					case 'MMMM': return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][d.getMonth()];
					case 'yy': return String(d.getFullYear()).substr(2);
					case 'yyyy': return d.getFullYear();
					case 'h': return d.getHours() % 12 || 12;
					case 'hh': return base.zeroize(d.getHours() % 12 || 12);
					case 'H': return d.getHours();
					case 'HH': return base.zeroize(d.getHours());
					case 'm': return d.getMinutes();
					case 'mm': return base.zeroize(d.getMinutes());
					case 's': return d.getSeconds();
					case 'ss': return base.zeroize(d.getSeconds());
					case 'l': return base.zeroize(d.getMilliseconds(), 3);
					case 'L': var m = d.getMilliseconds();
						if (m > 99) m = Math.round(m / 10);
						return zeroize(m);
					case 'tt': return d.getHours() < 12 ? 'am' : 'pm';
					case 'TT': return d.getHours() < 12 ? 'AM' : 'PM';
					case 'Z': return d.toUTCString().match(/[A-Z]+$/);
					// Return quoted strings with the surrounding quotes removed
					default: return $0.substr(1, $0.length - 2);
				}
			});
		},
		checkemail : function(email){
			if(email!=null){
				var reg=/(^\w+[-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
				if(!reg.test(email)){
					return false;
				}
			}
			return true;
		},
		isCardNo : function(card){
		   	var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
		   	if(reg.test(card) === false){
			       	return  false;
		   	}
		   	return true;
		},
		checkmobile : function(mobile){
			if(isNaN(mobile))return false;
			if(!mobile || mobile=="" || mobile.length!=11){
				return false;
			}
			if(/^13\d{9}$/g.test(mobile)||(/^15[0-35-9]\d{8}$/g.test(mobile))|| (/^18[012345-9]\d{8}$/g.test(mobile))|| (/^17[0678]\d{8}$/g.test(mobile))){
				return true;
			}
			return false;
		},
		getParam : function(url){
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
		},
		getPhoto : function(photo){
			if(photo && photo!=""){
				photo = photo.split(",")[0];
				if(typeof uploadurl != 'undefined'){
					if(photo.indexOf('mobile/') < 0 && photo.indexOf(uploadurl)<0 && !base.hasHttp(photo) && photo.indexOf('group1/') < 0){
						photo = uploadurl + photo;
					}
				}else{
					if(photo.indexOf('mobile/') < 0 && photo.indexOf(uploaddir)<0 && !base.hasHttp(photo) && photo.indexOf('group1/') < 0){
						photo = uploaddir + photo;
					}
				}
			}
			return photo;
		},
		hasHttp : function(url){
			var ret = false;
			if(url.indexOf("http:") > -1 || url.indexOf("https:") > -1){
				ret = true;
			}
			return ret;
		},
		getAvatar : function(uid){
			var avatar = '';
			if(typeof uploadurl != 'undefined'){
				avatar = uploadurl+"avatar/"+Math.ceil(uid/2000)+"/"+uid+".jpg";
			}else{
				avatar = uploaddir+"avatar/"+Math.ceil(uid/2000)+"/"+uid+".jpg";
			}
			return avatar;
		},
		toDecimal : function(num){
			var ret = 0;
			if(!isNaN(num)){
				ret = num;
			}
			var o = new Number(ret);
			ret = o.toFixed(2);
			return ret;
		},
		cookie : function(name, value, options) {
			if (typeof value != 'undefined') { // name and value given, set cookie
				options = options || {};
				if (value === null) {
					value = '';
					options.expires = -1;
				}
				var expires = '';
				if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
					var date;
					if (typeof options.expires == 'number') {
						date = new Date();
						date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
					} else {
						date = options.expires;
					}
					expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
				}
				var path = options.path ? '; path=' + options.path : '';
				var domain = options.domain ? '; domain=' + options.domain : '';
				var secure = options.secure ? '; secure' : '';
				document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
			} else { // only name given, get cookie
				var cookieValue = null;
				if (document.cookie && document.cookie != '') {
					var cookies = document.cookie.split(';');
					for (var i = 0; i < cookies.length; i++) {
						var cookie = cookies[i];
						if (cookie.substring(0, name.length + 1) == (name + '=')) {
							cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
							break;
						}
					}
				}
				return cookieValue;
			}
		},
		SHA1 : function(msg) {
			function rotate_left(n,s) {
		        	var t4 = ( n<<s ) | (n>>>(32-s));
		        	return t4;
		    	};
		    	function lsb_hex(val) {
			        var str="",i,vh,vl;
			        for( i=0; i<=6; i+=2 ) {
			            vh = (val>>>(i*4+4))&0x0f;
			            vl = (val>>>(i*4))&0x0f;
			            str += vh.toString(16) + vl.toString(16);
			        }
			        return str;
		    	};
		    	function cvt_hex(val) {
			        var str="",i,v;
			        for( i=7; i>=0; i-- ) {
			            v = (val>>>(i*4))&0x0f;
			            str += v.toString(16);
			        }
			        return str;
		    	};
		    	function Utf8Encode(string) {
			        string = string.replace(/\r\n/g,"\n");
			        var utftext = "";
			        for (var n = 0; n < string.length; n++) {
			            	var c = string.charCodeAt(n);
			            	if (c < 128) {
			                	utftext += String.fromCharCode(c);
			            	}else if((c > 127) && (c < 2048)) {
			                	utftext += String.fromCharCode((c >> 6) | 192);
			                	utftext += String.fromCharCode((c & 63) | 128);
			            	}else {
			                	utftext += String.fromCharCode((c >> 12) | 224);
			                	utftext += String.fromCharCode(((c >> 6) & 63) | 128);
			                	utftext += String.fromCharCode((c & 63) | 128);
			            	}
			        }
			        return utftext;
		    	};
		    	var blockstart,i, j,W = new Array(80),H0 = 0x67452301,
		    	    H1 = 0xEFCDAB89,H2 = 0x98BADCFE,H3 = 0x10325476,
		    	    H4 = 0xC3D2E1F0,A, B, C, D, E,temp;
		    	msg = Utf8Encode(msg);
		    	var msg_len = msg.length;
		    	var word_array = new Array();
		    	for( i=0; i<msg_len-3; i+=4 ) {
			        j = msg.charCodeAt(i)<<24 | msg.charCodeAt(i+1)<<16 |
			        msg.charCodeAt(i+2)<<8 | msg.charCodeAt(i+3);
			        word_array.push( j );
		    	}
		    	switch( msg_len % 4 ) {
			        case 0:i = 0x080000000;break;
			        case 1:i = msg.charCodeAt(msg_len-1)<<24 | 0x0800000;break;
			        case 2:i = msg.charCodeAt(msg_len-2)<<24 | msg.charCodeAt(msg_len-1)<<16 | 0x08000;break;
			        case 3:i = msg.charCodeAt(msg_len-3)<<24 | msg.charCodeAt(msg_len-2)<<16 | msg.charCodeAt(msg_len-1)<<8    | 0x80;
			        break;
		    	}
		    	word_array.push( i );
		    	while( (word_array.length % 16) != 14 ) word_array.push( 0 );
		    	word_array.push( msg_len>>>29 );
		    	word_array.push( (msg_len<<3)&0x0ffffffff );
		    	for ( blockstart=0; blockstart<word_array.length; blockstart+=16 ) {
			        for( i=0; i<16; i++ ) W[i] = word_array[blockstart+i];
			        for( i=16; i<=79; i++ ) W[i] = rotate_left(W[i-3] ^ W[i-8] ^ W[i-14] ^ W[i-16], 1);
			        A = H0;
			        B = H1;
			        C = H2;
			        D = H3;
			        E = H4;
			        for( i= 0; i<=19; i++ ) {
			            	temp = (rotate_left(A,5) + ((B&C) | (~B&D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
			            	E = D;
			            	D = C;
			            	C = rotate_left(B,30);
			            	B = A;
			            	A = temp;
			        }
			        for( i=20; i<=39; i++ ) {
			            	temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
			            	E = D;
			            	D = C;
			            	C = rotate_left(B,30);
			            	B = A;
			            	A = temp;
			        }
			        for( i=40; i<=59; i++ ) {
			            	temp = (rotate_left(A,5) + ((B&C) | (B&D) | (C&D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
			            	E = D;
			            	D = C;
			            	C = rotate_left(B,30);
			            	B = A;
			            	A = temp;
			        }
			        for( i=60; i<=79; i++ ) {
			            	temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
			            	E = D;
			            	D = C;
			            	C = rotate_left(B,30);
			            	B = A;
			            	A = temp;
			        }
			        H0 = (H0 + A) & 0x0ffffffff;
			        H1 = (H1 + B) & 0x0ffffffff;
			        H2 = (H2 + C) & 0x0ffffffff;
			        H3 = (H3 + D) & 0x0ffffffff;
			        H4 = (H4 + E) & 0x0ffffffff;
		    	}
		    	var temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
		    	return temp.toLowerCase();
		},
		getTimestamp : function(){
			return Math.floor(new Date().getTime()/1000);
		},
		getRandomStr : function (len){
			if(!len){len = 16;}
			var Domchars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
			var maxPos = Domchars.length;
			var ret = '';
			for (i = 0; i < len; i++) {
				ret += Domchars.charAt(Math.floor(Math.random() * maxPos));
			}
			return ret;
		},
		handleImgCallback:function(area,newimg,that){
			var self = this;
			var curthat = $(that),
			    curstyle = curthat.attr("style");
			if(curthat.parents(".itembox").length == 0 && (!curstyle || curstyle == "" || (curstyle.indexOf("width") < 0 && curstyle.indexOf("height") < 0) || self.trim(curstyle).indexOf("width:auto") > -1 || self.trim(curstyle).indexOf("height:auto") > -1) ){
				var totalW = area.width(),
				    imgW = newimg.width,
				    imgH = newimg.height;
				curthat.removeAttr("style");
				if(imgW > totalW){
					curthat.css("width","100%");
				}
			}
		},
		setImgSize : function(area,that,callback){
			var self = this;
			return function(done){
				var src = that.src;
				var newimg = new Image();
				newimg.src = src;
				newimg.onload = function(){
					if(callback){
						callback(newimg,that);
					}else{
						self.handleImgCallback(area,newimg,that);
					}
					done();
				}
				newimg.onerror = function(){
					that.src = "";
					if(callback){
						callback(newimg,that);
					}else{
						self.handleImgCallback(area,newimg,that);
					}
					done();
				}
				if(src == ""){
					if(callback){
						callback(newimg,that);
					}else{
						self.handleImgCallback(area,newimg,that);
					}
					done();
				}
			}
		},
		handleImg : function(area,callback){
			var self = this,
			    imglist = area.find("img"),
			    img_l = imglist.length,
			    tasks=[];
			if(img_l){
				for(var i = 0; i < img_l; i++){
					tasks.push(self.setImgSize(area,imglist[i],callback));
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
		},
		checkAgencyTitle : function(titleVal,myApp){
			var reg = /^[\-a-zA-Z0-9_\u4e00-\u9fa5]+$/;
			var reg1 = /^[\u4e00-\u9fa5]+$/;
			var reg2 = /^[\dA-Za-z_\-]+$/;
			var zLen=0,eLen=0;
			if(!reg.test(titleVal)){
				base.tip("微店名为中文字母数字_-<br>最多八位中文",1500);
				return false;
			}else{
				for(var i=0;i<titleVal.length;i++){
					var v = titleVal[i];
					if(reg1.test(v)){
						zLen += 2;
					}
					if(reg2.test(v)){
						eLen += 1;
					}
				}
				if(zLen+eLen>16){
					base.tip("微店名为中文字母数字_-<br>最多八位中文",1500);
					return false;
				}
			}
			return true;
		},
		favoriteShop : function(params){//收藏操作
			var link = location.href;
			var title = document.title;
			if(params.edit){
				$.ajax({
					url:"/mobile/ajax/api.php?action=user_favorites&module="+params.module+"&id="+params.pid+"&do="+params.edit,
					type:"post",
					data:{'content':link,'title':title},
					dataType:"json",
					success:function(data){
						params.callback && params.callback(data);
					}
				});
			}
		},
		viewBigImg : function(area,myApp){
			var self = this,
			    imgs = area.find("img"),
			    imgarr = [];
			imgs.each(function(){
				var cur = this,imgsrc = cur.src;
				if(cur.getAttribute("data-original")){
					imgsrc = cur.getAttribute("data-original");
				}
				if($(cur).parent("a").length == 0 && $(cur).parents("a").length == 0 && imgsrc && imgsrc != ""){
					if(cur.className && cur.className.indexOf("lazy") > -1 && this.getAttribute("data-src")){
						imgsrc = this.getAttribute("data-src");
					}
					if(imgsrc.indexOf("http:") < 0){
						imgsrc = httpurl+imgsrc;
					}
					imgarr.push(imgsrc);
				}
			});
			if(window.WeixinJSBridge){
				imgs.each(function(i){
					var cur = $(this);
					if(cur.parent("a").length == 0 && cur.parents("a").length == 0){
						cur.unbind("click").click(function(){
							WeixinJSBridge.invoke("imagePreview",{
								"urls":imgarr,
								"current":imgarr[i]
							});
						});
					}
				});
			}else{
				var myPhotoBrowserStandalone = myApp.photoBrowser({
					backLinkText:"关闭",
					theme:"dark",
					photos : imgarr,
					ofText:"/"
				});
				imgs.each(function(i){
					var cur = $(this);
					if(cur.parent("a").length == 0 && cur.parents("a").length == 0){
						cur.unbind("click").click(function(){
							myPhotoBrowserStandalone.open(i);
						});
					}
				});
			}
		},
		viewBigImgEvent : function(img,myApp){
			var self = this,imgarr = [],
			    imgsrc = img.src;
			if(img.className.indexOf("lazy") > -1){
				imgsrc = img.getAttribute("data-src");
			}
			if(imgsrc.indexOf("http:") < 0){
				imgsrc = httpurl+imgsrc;
			}
			imgarr.push(imgsrc);
			if(window.WeixinJSBridge){
				WeixinJSBridge.invoke("imagePreview",{
					"urls":imgarr,
					"current":imgarr[0]
				});
			}else{
				var myPhotoBrowserStandalone = myApp.photoBrowser({
					backLinkText:"关闭",
					theme:"dark",
					photos : imgarr,
					ofText:"/"
				});
				myPhotoBrowserStandalone.open(0);
			}
		},
		viewImglist : function(srclist,myApp){
			var self = this,imgarr = [];
			for(var i = 0;i<srclist.length;i++){
				var imgsrc = srclist[i];
				if(imgsrc.indexOf("http:") < 0){
					imgsrc = httpurl+imgsrc;
				}
				imgarr.push(imgsrc);
			}
			if(window.WeixinJSBridge){
				WeixinJSBridge.invoke("imagePreview",{
					"urls":imgarr,
					"current":imgarr[0]
				});
			}else{
				var myPhotoBrowserStandalone = myApp.photoBrowser({
					backLinkText:"关闭",
					theme:"dark",
					photos : imgarr,
					ofText:"/"
				});
				myPhotoBrowserStandalone.open(0);
			}
		},
		emojiEvent : function(emojiarea,msgInput,callback){
			msgInput.unbind("focus").focus(function(){
				msgInput.data("pos",base.getCursortPosition(this));
			});
			msgInput.unbind("blur").blur(function(){
				msgInput.data("pos",base.getCursortPosition(this));
			});
			msgInput.unbind("keydown").keydown(function(event) {
				if(event.keyCode == 8) {
					var value = this.value;
					var reg = /\[[^\[\s]+\]$/g;
					var pValue, sValue,
					pos = base.getCursortPosition(this);
					pValue = value.substr(0, pos);
					sValue = value.substr(pos);
					var names = pValue.match(reg);
					if(names && names.length) {
						this.value = pValue.substr(0, pValue.length - names[0].length) + sValue;
						base.setCaretPosition(this, pos - names[0].length);
						msgInput.data("pos",pos - names[0].length);
						return false;
					}
				}
			});
			emojiarea.find("img").unbind("click").click(function(event){
				event.preventDefault();
				emojiarea.parent().find(".swiper-pagination").css("opacity",1);
				emojiarea.parent().find(".swiper-pagination").removeClass("swiper-pagination-hidden");
				setTimeout(function(){
					emojiarea.parent().find(".swiper-pagination").removeClass("swiper-pagination-hidden");
				},200);
				var cur = $(this);
				var message = msgInput,
				messageVal = message.val(),
				datapos = message.data("pos");
				if(cur.hasClass("delete")){
					var reg = /\[[^\[\s]+\]$/g;
					var pValue, sValue;
					if(!datapos){
						datapos = base.getCursortPosition(message[0]);
					}
					pValue = messageVal.substr(0, datapos);
					sValue = messageVal.substr(datapos);
					var names = pValue.match(reg);
					if(names && names.length) {
						message[0].value = pValue.substr(0, pValue.length - names[0].length) + sValue;
						base.setCaretPosition(this, datapos - names[0].length);
						message.data("pos",datapos - names[0].length);
						return false;
					}
				}else{
					var des = cur.attr("des");
					if(!datapos){
						datapos = base.getCursortPosition(message[0]);
					}
					var val1 = messageVal.substr(0,datapos),
					val2 = messageVal.substr(datapos);
					message.val(val1+des+val2);
					message.data("pos",datapos+des.length);
				}
				callback && callback();
			});
		},
		handleInit : function(pcontainer,ISBACK,callback){
		  	var naviarea = pcontainer.find(".naviarea"),
		  	    navitoolbar = $("#navitoolbar"),
				popoverarea = pcontainer.find(".popoverarea");
		  	if(naviarea[0]){
		  		navitoolbar.remove();
		  		if(base.trim(naviarea.html()) != ""){
			  		var navimenu =  pcontainer.find(".naviarea"),
			  		    navistr = '<div id="navitoolbar" class="toolbar">'+navimenu.html()+'</div>';
			  		var area = $(navistr).prependTo($(".view-main"));
					callback && callback(area);
			  	}
		  	}else{
				pcontainer.addClass("no-toolbar");
		  		navitoolbar.remove();
		  	}
			if(popoverarea[0]){
				var bodypopoverarea = $(".bodypopoverarea");
				bodypopoverarea.remove();
				$('<div class="bodypopoverarea"></div>').appendTo($("body"));
				$(popoverarea.children()).appendTo($(".bodypopoverarea"));
			}
		},
		ajax : function(options){
			var myApp = options.myApp;
			if(myApp){
				myApp.showIndicator();
			}
			var ajaxData = {};
			ajaxData.data = options.data ? options.data : {};
			ajaxData.url = options.url;
			ajaxData.type = options.type ? options.type : "get";
			ajaxData.dataType = options.dataType ? options.dataType : "json";
			ajaxData.timeout = options.timeout ? options.timeout : "60000";
			ajaxData.complete = options.complete ? options.complete : function(XMLHttpRequest,status){
				//超时,status还有success,error等值的情况
				if(status=='timeout'){
					if(myApp){
						myApp.hideIndicator();
					}
					base.tip("请求超时请重试");
				}
			};
			ajaxData.error = function(ret){
				if(myApp){
					myApp.hideIndicator();
				}
				options.error && options.error(ret);
			};
			ajaxData.success = function(ret){
				if(myApp){
					myApp.hideIndicator();
				}
				options.success && options.success(ret);
			};
			if(options.async != "undefined" && options.async != undefined){
				ajaxData.async = options.async;
			}
			if(options.dataType == "jsonp"){
				if(data != ""){
					data += "&jsonp=1";
				}else{
					data = "jsonp=1";
				}
				ajaxData.jsonp = "callback";
			}
			$.ajax(ajaxData);
		},
		getJSON : function(options){
			var ajaxData = {type:"get",dataType:"json"};
			ajaxData.data = options.data ? options.data : {};
			ajaxData.url = options.url;
			ajaxData.error = function(ret){
				options.error && options.error(ret);
			};
			ajaxData.success = function(ret){
				options.success && options.success(ret);
			};
			if(options.async != "undefined" && options.async != undefined){
				ajaxData.async = options.async;
			}
			$.ajax(ajaxData);
		},
		ajaxSubmit : function(options){
			var form = options.form,
			    	myApp = options.myApp,
			    	url = options.url,
			    	data = options.data ? options.data : {},
			    	dataType = options.dataType ? options.dataType : "json",
			    	success = options.success,
			    	error = options.error,
				timeout = options.timeout ? options.timeout : "60000";
				complete = options.complete ? options.complete : function(XMLHttpRequest,status){
					if(status=='timeout'){
						if(myApp){
							myApp.hideIndicator();
						}
						base.tip("请求超时请重试");
					}
				};
			require(["jqueryForm"],function(){
				if(myApp){
					myApp.showIndicator();
				}
				form.ajaxSubmit({
					url:url,
					data:data,
					type:"post",
					dataType:dataType,
					timeout:timeout,
					complete : complete,
					success:function(data){
						if(myApp) {
							myApp.hideIndicator();
						}
						success && success(data);
					},
					error:function(data){
						if(myApp) {
							myApp.hideIndicator();
						}
						error && error(data);
					}
				});
			});
		},
		tip : function(text,delay,callback){
			var len = text.length;
	            	if (typeof delay === 'function') {
	                	callback = arguments[1];
	                	delay = 1000;
	                	if(len < 5){
                                        delay = 1000;
				}else if(len < 10){
                                        delay = 1500;
                                }else if(len < 15){
                                        delay = 2000;
                                }else if(len < 25){
                                        delay = 3000;
                                }else{
                                        delay = 5000;
                                }
	            	}
	            	if(!delay || delay == "" || isNaN(delay)){
	            		delay = 1000;
                                if(len < 5){
                                        delay = 1000;
                                }else if(len < 10){
                                        delay = 1500;
                                }else if(len < 15){
                                        delay = 2000;
                                }else if(len < 25){
                                        delay = 3000;
                                }else{
                                        delay = 5000;
                                }
	            	}
            		var overlayHTML = '<div class="modal-overlay modal-overlay-visible" style="z-index:1000000;"></div>';
	                var textHTML = text ? '<div class="modal-text">' + text + '</div>' : '';
	                var modalHTML = '<div class="tipmodal" style="z-index:1100000;">'+
	                			'<div class="t-table">'+
	                				'<div class="t-cell">'+
	                					'<span class="modal-text">'+text+'</span>'+
	                				'</div>'+
	                			'</div>'+
	                		'</div>';

			var overlay = $(overlayHTML).appendTo($('body'));
  	         	var modal = $(modalHTML).appendTo($("body"));
  	         	modal.show();
  	         	modal.addClass("modal-in");
			setTimeout(function(){
				modal.removeClass("modal-in");
				modal.hide();
				modal.remove();
				overlay.remove();
				callback && callback();
			},delay*0.8);
		},
	        prompt : function (options) {
	        	var curmodal = {};
	        	var myApp = options.myApp,
	        	title = options.title,
	        	text = options.text,
	        	callbackOk = options.callbackOk,
	        	callbackCancel = options.callbackCancel,
	        	beforeClick = options.beforeClick,
			oktext = options.oktext ? options.oktext : '确定',
			canceltext = options.canceltext ? options.canceltext : '取消',
			okbutton = '<span class="modal-button modal-button-bold ok">'+oktext+'</span>',
			cancelbutton = '<span class="modal-button cancel">'+canceltext+'</span>',
			buttons = [],buttomHTML='';
			if(typeof options.nookbutton == undefined || !options.nookbutton){
				buttons.push(okbutton);
				buttomHTML += okbutton;
			}
			if(typeof options.nocancelbutton == undefined || !options.nocancelbutton){
				buttons.push(cancelbutton);
				buttomHTML += cancelbutton;
			}
			if(buttons.length > 0){
				buttomHTML = '<div class="modal-buttons modal-buttons-'+buttons.length+'">'+buttomHTML+'</div>';
			}
            		var overlayHTML = '<div class="modal-overlay modal-overlay-visible prompt-overlay"></div>';
            		var titleHTML = (title && title!="") ? '<div class="modal-title">'+title+'</div>' : '';
	                var textHTML = text ? '<div class="modal-text">' + text + '</div>' : '';
	                var modalHTML = '<div class="prompt-modal">'+
	                			'<div class="t-table">'+
	                				'<div class="t-cell">'+
	                					'<div class="inner">'+
	                						titleHTML+
	                						'<div class="modal-text prompt-con">'+text+'</div>'+
	                						buttomHTML+
	                					'</div>'+
	                				'</div>'+
	                			'</div>'+
	                		'</div>';

			var overlay = curmodal.overlay = $(overlayHTML).appendTo($('body'));
  	         	var modal = curmodal.modal = $(modalHTML).appendTo($("body"));
  	         	var promptCon = $(modal).find('.prompt-con');
  	         	beforeClick && beforeClick(curmodal);
  	         	modal.show();
  	         	modal.addClass("modal-in");
  	         	function closeModle(){
  	         		overlay.remove();
  	         		modal.remove();
  	         	}
	        	modal.find(".cancel").click(function(){
	        		callbackCancel && callbackCancel(curmodal);
	        		closeModle();
	        	});
	        	modal.find(".ok").click(function(){
	        		callbackOk && callbackOk(curmodal,function(){
	  	         		closeModle();
	        		});
	        	});
	        	return curmodal;
	        },
		getPre : function(node){
			var pre = node.previousSibling;
			while(pre){
				if(pre.nodeType === 1 || !pre){
					break;
				}
				pre = pre.previousSibling;
			}
			return pre;
		},
		getParent : function(node,cssName){
			var parentNode = node.parentNode;
			while(parentNode){
				if(parentNode.nodeType === 1 && $(parentNode).hasClass(cssName)){
					break;
				}
				parentNode = parentNode.parentNode;
			}
			return parentNode;
		},
		createCoinNum : function(creditStr){
			var numW=15,numH=30,
			    count = creditStr.length,
			    str = '';
			for(var i=0;i<count;i++){
				var curNum = creditStr.substr(i,1);
				str += '<div class="txt-outer trans-div" style="left:'+(i*numW)+'px;top:-'+curNum*numH+'px">';
				for(var j=0; j<=10; j++){
					str += '<div class="txt">'+j+"</div>";
				}
				str +=	'</div>';
			}
			return str;
		},
		coinAnimate : function(area,before,end){
			var self = this;
			var goldInfo = area.find(".gold-info"),numW=15,numH=30,
			    bstr = before+"",estr = end + "",cha = end-before,
			    chastr = cha+"",bLen = bstr.length,eLen = estr.length;
			if(eLen<bLen){
				for(var j=0;j<bLen-eLen;j++){
					goldInfo.find(" .trans .trans-div:nth-child(1)").remove();
				}
			}
			if(eLen<=bLen){
				for(var i=eLen-1,j=0;i>=0;i--,j++){
					var curNum = parseInt(estr.substr(i,1));
					if(j<bLen){
						goldInfo.find(".trans-div:nth-child("+(i+1)+")").css("top",(-(curNum*numH))+"px");
					}
				}
			}else{
				for(var i=bLen-1,j=eLen-1;i>=0;i--,j--){
					var curNum = parseInt(estr.substr(j,1));
					goldInfo.find(".trans-div:nth-child("+(i+1)+")").css("top",(-(curNum*numH))+"px");
				}
				for(var i=0;i<eLen-bLen;i++){
					var curNum = parseInt(estr.substr(i,1));
					goldInfo.find(".trans-div").each(function(){
						var left = parseInt($(this).css("left"));
						$(this).css("left",(left+numW)+"px");
					});
					var str = '<div class="txt-outer trans-div" style="left:0px;top:-'+curNum*numH+'px">';
					for(var j=0; j<=10; j++){
						str += '<div class="txt">'+j+"</div>";
					}
					str +=	'</div>';
					Dom(str).prepend(Dom(".gold-info .trans"));
				}
			}
		},
		dropCoinAnimate : function(area,num,type){
			var self = this;
			var goldInfo = area.find(".gold-info");
			goldInfo.show();
			goldInfo.addClass("animated");
			setTimeout(function(){
				var drop = area.find(".gold-info .drop");
				drop.show();
				setTimeout(function(){
					drop.css("top",area.find(".coinattr")[0].offsetTop+"px");
				},100);
				setTimeout(function(){
					drop.hide();
					var bCredits = parseInt(area.find(".gold-info .coinattr").attr("coin"));
					if(num!=0){
						area.find(".gold-info .coinattr").attr("coin",bCredits+num);
						self.coinAnimate(area,bCredits,bCredits+num);
					}
				},1000);
				var curmusic = area.find(".coinmusic")[0];
				if(curmusic){
					if(!type || type != "timeline"){
						curmusic.play();
					}
				}
			},300);
		},
		taskData : function(options){
			var data = options.data,
			    params = options.params,
			    handleFunction = options.handleFunction,
			    ascdesc = options.ascdesc ? options.ascdesc : "asc",
			    callback = options.callback;
			var tasks = [];
			if(ascdesc == "asc"){
				for(var i=0;i<data.length;i++){
					tasks.push(handleFunction(data[i],params));
				}
			}else{
				for(var i=data.length-1;i>=0;i--){
					tasks.push(handleFunction(data[i],params));
				}
			}
			var _serial = function(){
				if(tasks.length===0){
					callback && callback();
					return;
				}
				var task =tasks[0];
				tasks.splice(0,1);
				task(_serial);
			}
			_serial();
		},
		createDataData : function(d,options){
			return function(done){
				var did = d.id ? d.id : d.uid;
				if(options.scrollList.find(".scroll_item[itemid="+did+"]").length == 0){
					options.setPageData && options.setPageData(d,options);
				}
				done();
			}
		},
		getListData : function(options){
			var self = this;
			var handleFunction = options.handleFunction ? options.handleFunction : self.createDataData;
			self.ajax({
				myApp:options.myApp,
				url:options.geturl,
				data:options.getdata ? options.getdata : {},
				success:function(data){
					var retdata = data;
					if(data){
						if(data.member){
							retdata = data.member;
						}else if(data.data){
							retdata = data.data;
						}
						if(retdata.length > 0){
							if(data.operation){
								options.operation=data.operation;
							}
							self.taskData({
								data : retdata,
								params : options,
								handleFunction : handleFunction,
								callback : options.doneCallback
							});
						}
					}
					options.successCallback && options.successCallback(data);
				}
			});
		},
		handleEleSize : function(eles,area){
			eles.each(function(){
				var cur = $(this),fwidth=1,fheight=1,
					maxWidth = cur.attr("max-width"),
					maxHeight = cur.attr("max-height");
				if(!area)area = cur.parent();
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
				var disW = area.width(),
				disH = disW*fheight/fwidth;
				if(maxWidth){
					maxWidth = parseFloat(maxWidth);
					maxHeight = parseFloat(maxHeight);
					if(disW > maxWidth){
						disW = maxWidth;
						disH = maxHeight;
					}
				}
				cur.attr("width",disW);
				cur.attr("height",disH);
				cur.css({width:disW,height:disH,"z-index":1,"overfow":"hidden"});
			});
		},
		getRad : function (d){
			var PI = Math.PI;
		        return d*PI/180.0;
		},
		getFlatternDistance : function (lat1,lng1,lat2,lng2){
			var self = this;
			var EARTH_RADIUS = 6378137.0;
		        var f = self.getRad((lat1 + lat2)/2);
		        var g = self.getRad((lat1 - lat2)/2);
		        var l = self.getRad((lng1 - lng2)/2);
		        var sg = Math.sin(g);
		        var sl = Math.sin(l);
		        var sf = Math.sin(f);
		        var s,c,w,r,d,h1,h2;
		        var a = EARTH_RADIUS;
		        var fl = 1/298.257;
		        sg = sg*sg;
		        sl = sl*sl;
		        sf = sf*sf;

		        s = sg*(1-sl) + (1-sf)*sl;
		        c = (1-sg)*(1-sl) + sf*sl;

		        w = Math.atan(Math.sqrt(s/c));
		        r = Math.sqrt(s*c)/w;
		        d = 2*w*a;
		        h1 = (3*r -1)/2/c;
		        h2 = (3*r +1)/2/s;
		        return d*(1 + fl*(h1*sf*(1-sg) - h2*(1-sf)*sg));
		},
		setTimePicker : function(o){
			var myApp = o.myApp,
				input = o.input,
				valinput = o.valinput,
                                haveMonth,haveDay,haveTime,minYear,maxYear,colsdata = [];
                        if(typeof  o.haveMonth == "undefined"){
                                haveMonth = true;
                        }else{
                                haveMonth = o.haveMonth;
                        }
                        if(typeof  o.haveDay == "undefined"){
                                haveDay = true;
                        }else{
                                haveDay = o.haveDay;
                        }
                        if(typeof  o.haveTime == "undefined"){
                                haveTime = true;
                        }else{
                                haveTime = o.haveTime;
                        }
                        if(typeof o.minYear == "undefined" || isNaN(o.minYear)){
                                minYear = true;
                        }else{
                                minYear = o.minYear;
                        }
                        if(typeof o.maxYear == "undefined" || isNaN(o.maxYear)){
                                maxYear = true;
                        }else{
                                maxYear = o.maxYear;
                        }
			if(!haveMonth)haveDay = false;
			var yeardata = [],monthdata = [],daydata=[],
			    hourdata = [],minutedata = [],
			    today = new Date(),curYear = today.getFullYear(),curMonth = today.getMonth()+1,
			    curDay = today.getDate(),curHour = today.getHours(),curMinute = today.getMinutes();
			if(curMonth < 10)curMonth = "0"+curMonth;
			if(curDay < 10)curDay = "0"+curDay;
			if(curHour < 10) curHour = "0"+curHour;
			if(curMinute < 10)curMinute = "0"+curMinute;
                        if((typeof o.minYear == "undefined" || isNaN(o.minYear)) && (typeof o.maxYear == "undefined" || isNaN(o.maxYear))){
                        	minYear = curYear - 9;
                        	maxYear = curYear + 9;
                        }else{
				if(minYear){
                                        maxYear = minYear + 19;
				}else if(maxYear){
                                        minYear = maxYear - 19;
				}
                        }
			for(var i=minYear;i<=maxYear;i++){
				yeardata.push(i);
			}
			if(haveMonth){
				for(var i=1;i<=12;i++){
					if(i<10){
						monthdata.push("0"+i);
					}else{
						monthdata.push(i);
					}
				}
                        }
			if(haveDay){
				for(var i=1;i<=31;i++){
					if(i<10){
						daydata.push("0"+i);
					}else{
						daydata.push(i);
					}
				}
                        }
                        if(haveTime) {
                                for (var i = 0; i < 24; i++) {
                                        if (i < 10) {
                                                hourdata.push("0" + i);
                                        } else {
                                                hourdata.push(i);
                                        }
                                }
                                for (var i = 0; i < 60; i++) {
                                        if (i < 10) {
                                                minutedata.push("0" + i);
                                        } else {
                                                minutedata.push(i);
                                        }
                                }
                        }
                        colsdata.push({textAlign:'center',values: yeardata});
                        if(haveMonth) {
                                colsdata.push({textAlign: 'center', values: ["-"]});
                                colsdata.push({textAlign: 'center', values: monthdata});
                        }
                        if(haveDay) {
                                colsdata.push({textAlign: 'center', values: ["-"]});
                                colsdata.push({textAlign: 'center', values: daydata});
                        }
			if(haveTime){
                                colsdata.push({textAlign:'center',values: hourdata});
                                colsdata.push({textAlign:'center',values: [":"]});
                                colsdata.push({textAlign:'center',values: minutedata});
			}
			myApp.picker({
			        input: input,
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
			        cols: colsdata,
			        onOpen: function (picker) {
			        	picker.cols[0].setValue(curYear);
                                        if(haveMonth) {
                                                picker.cols[2].setValue(curMonth);
                                        }
                                        if(haveDay) {
                                                picker.cols[4].setValue(curDay);
                                        }
			        	if(haveTime){
                                                picker.cols[5].setValue(curHour);
                                                picker.cols[7].setValue(curMinute);
					}
			        	picker.container.parent().parent().addClass("picker-time");
			        	picker.container.parent().parent().css("left","0px");
			        	var disvals = picker.cols[0].value;
                                        if(haveMonth) {
                                                disvals += "/" + picker.cols[2].value;
                                        }
                                        if(haveDay) {
                                                disvals += "/" + picker.cols[4].value;
                                        }
                                        if(haveTime){
                                                disvals += " "+picker.cols[5].value+":"+picker.cols[7].value;
                                        }

                                        valinput.val(disvals);
			        },
			        onChange: function (picker, values, displayValues) {
                                        if(haveMonth) {
                                                var daysInMonth = new Date(picker.value[0], (picker.value[2]-1) * 1 + 1, 0).getDate();
                                                if (values[4] > daysInMonth) {
                                                        picker.cols[4].setValue(daysInMonth);
                                                }
                                        }
                                        var disvals = values[0];
                                        if(haveMonth) {
                                                disvals += "/" + values[2];
                                        }
                                        if(haveDay) {
                                                disvals += "/" + values[4];
                                        }
                                        if(haveTime){
                                                disvals += " "+values[5]+":"+values[7];
                                        }
                                        valinput.val(disvals);
				}
			});
		},
		setInputPickerVal1 : function(input,currentProvince,currentCity,currentCounties){
			var setval = "";
			if(currentCity.title !="市辖区" && currentCity.title != "县"){
				setval = currentProvince.title+" "+currentCity.title+" "+currentCounties.title;
			}else{
				setval = currentProvince.title+" "+currentCounties.title;
			}
			input.val(setval);
		},
		setAddressPicker1 : function(options){
			var myApp = options.myApp,
			    inputPicker = options.inputPicker,
			    inputProvince = options.inputProvince,
			    inputCity = options.inputCity,
			    inputCounties = options.inputCounties,
			    inputAreacode = options.inputAreacode,
			    callback = options.callback,
			    addressData = [],provincedata,citydata,countiesdata,
			    currentProvince,currentCity,currentCounties,
			    defaultProvince = inputProvince.val(),
			    defaultCity = inputCity.val(),
			    defaultCounties = inputCounties.val(),
			    defaultAreacode = inputAreacode.val(),
			    countiesCodedata = {},opendone = false;
			if(!defaultAreacode || defaultAreacode == ""){
				defaultProvince = defaultCity = defaultCounties = "";
			}
			$.ajax({
				url:"/mobile/ajax/api.php?action=getallarea",
				type:"get",
				dataType:"json",
				success:function(data){
					if(data){
						var addressData={"province":[]};
						for(var i=0;i<data.length;i++){
							var f = data[i];
							if(f.levels == 1){
								addressData.province.push(f);
								addressData[f.code] = [];
								if(defaultProvince != "" && (defaultProvince == f.title || f.title.indexOf(defaultProvince) > -1)){
									defaultProvince = f;
								}
								for(var j=0;j<data.length;j++){
									var s = data[j];
									if(s.levels == 2 && s.parentcode == f.code){
										addressData[f.code].push(s);
										addressData[s.code] = [];
										if(defaultCity != "" && (defaultCity == s.title || s.title.indexOf(defaultCity) > -1)){
											defaultCity = s;
										}else if(!defaultCity && s.parentcode == defaultProvince.code){
											defaultCity = s;
										}
										for(var m=0;m<data.length;m++){
											var t = data[m];
											if(t.levels == 3 && t.parentcode == s.code && t.title !="市辖区" && t.title != "县"){
												addressData[s.code].push(t);
												if(defaultCounties != "" && (defaultCounties == t.title || t.title.indexOf(defaultCounties) > -1)){
													defaultCounties = t;
												}else if(!defaultCounties && t.parentcode == defaultCity.code){
													defaultCounties = t;
												}
											}
										}
									}
								}
							}
						}
				    		provincedata = addressData.province;
				    		if(defaultProvince != ""){
					    		citydata = addressData[defaultProvince.code];
					    		countiesdata = addressData[defaultCity.code];
					    		currentProvince = defaultProvince;
							currentCity = defaultCity;
							currentCounties = defaultCounties;
						}else{
					    		citydata = addressData[provincedata[0].code];
					    		countiesdata = addressData[citydata[0].code];
					    		currentProvince = provincedata[0];
							currentCity = citydata[0];
							currentCounties = countiesdata[0];
						}
						inputProvince.val(currentProvince.title);
						inputCity.val(currentCity.title);
						inputCounties.val(currentCounties.title);
						inputAreacode.val(currentCounties.code);
						base.setInputPickerVal(inputPicker,currentProvince,currentCity,currentCounties);
						var colcode1=[],colvalue1=[];
		        			for(var i=0;i<provincedata.length;i++){
		        				colcode1.push(provincedata[i].code);
		        				colvalue1.push(provincedata[i].title);
		        			}
						var colcode2=[],colvalue2=[];
		        			for(var i=0;i<citydata.length;i++){
		        				colcode2.push(citydata[i].code);
		        				colvalue2.push(citydata[i].title);
		        			}
						var colcode3=[],colvalue3=[];
		        			for(var i=0;i<countiesdata.length;i++){
		        				colcode3.push(countiesdata[i].code);
		        				colvalue3.push(countiesdata[i].title);
		        			}
						var pickerAddress = myApp.picker({
						        input: inputPicker,
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
						        	{values: colcode1,displayValues:colvalue1},
						            	{textAlign:'left',values: colcode2,displayValues:colvalue2},
						            	{values: colcode3,displayValues:colvalue3}
						        ],
						        onOpen: function (picker) {
								base.setInputPickerVal(inputPicker,currentProvince,currentCity,currentCounties);
						        	if(defaultProvince && defaultProvince.title!=""){
							        	picker.setValue([defaultProvince.code, defaultCity.code, defaultCounties.code]);
							        }else{
									inputAreacode.val(currentCounties.code);
							        }
						        	setTimeout(function(){
						        		base.setInputPickerVal(inputPicker,currentProvince,currentCity,currentCounties);
						        	},200);
						        	var cityarr = [],newcityarr = addressData[provincedata[0].code];
								if(defaultProvince != ""){
		            						newcityarr = addressData[defaultProvince.code]
		            					}
					                	for(var i=0;i<newcityarr.length;i++){
					                		cityarr.push(newcityarr[i].title);
					                	}
					                        citydata = cityarr;
					                	var counarr = [],newcounarr = addressData[newcityarr[0].code],
					                	    councodearr = [];
								if(defaultProvince != ""){
									newcounarr = addressData[defaultCity.code]
								}
					                	for(var i=0;i<newcounarr.length;i++){
					                		counarr.push(newcounarr[i].title);
					                		councodearr.push(newcounarr[i].code);
					                		countiesCodedata[newcounarr[i].title] = newcounarr[i].code;
					                	}
								picker.container.parent().parent().addClass("picker-address");
						        	picker.container.parent().parent().css("left","0px");
						        },
						        onChange: function (picker, values, displayValues) {
						        	var changeProvince = {"title":displayValues[0],"code":values[0]},
						        	changeCity = {"title":displayValues[1],"code":values[1]},
						        	changeCounties = {"title":displayValues[2],"code":values[2]};
						        	if(defaultProvince && defaultProvince.title != "" && !opendone){
						        		if(changeProvince.code == defaultProvince.code && changeCity.code == defaultCity.code && changeCounties.code == defaultCounties.code){
						        			opendone = true;
										base.setInputPickerVal(inputPicker,currentProvince,currentCity,currentCounties);
										setTimeout(function(){
											base.setInputPickerVal(inputPicker,currentProvince,currentCity,currentCounties);
										},100);
						        		}
						        		return;
						        	}
						        	var newCity,newCounties,pindex=0,cindex=0,
						       		    newProvincedata,newCitydata,newCountiesdata;
						        	for(var i=0;i<provincedata.length;i++){
						        		if(changeProvince.code == provincedata[i].code){
						        			pindex = i;
						        			break;
						        		}
						        	}
						        	if(changeProvince.title !== currentProvince.title) {
							                currentProvince = changeProvince;
									inputPicker.val(changeProvince.title+" "+currentCity.title+" "+currentCounties.title);
							        	clearTimeout(t);
							                t = setTimeout(function(){
							                	var cityarr = [],citycodearr = [],newcityarr = addressData[provincedata[pindex].code];
							                	for(var i=0;i<newcityarr.length;i++){
							                		cityarr.push(newcityarr[i].title);
											citycodearr.push(newcityarr[i].code);
							                	}
							                    	currentCity = newcityarr[0];
							                	var counarr = [],councodearr = [],newcounarr = addressData[newcityarr[0].code];
							                	for(var i=0;i<newcounarr.length;i++){
							                		counarr.push(newcounarr[i].title);
											councodearr.push(newcounarr[i].code);
							                	}
							                    	currentCounties = newcounarr[0];
										picker.cols[1].replaceValues(citycodearr,cityarr);
										picker.cols[2].replaceValues(councodearr,counarr);
										picker.updateValue();
										inputProvince.val(currentProvince.title);
										inputCity.val(currentCity.title);
										inputCounties.val(currentCounties.title);
										inputAreacode.val(currentCounties.code);
						        			base.setInputPickerVal(inputPicker,currentProvince,currentCity,currentCounties);
									}, 200);
							                return;
							        }
						       		newCity = changeCity.title;
							        if(changeCity.title && changeCity.title !== currentCity.title) {
									inputPicker.val(currentProvince.title+" "+changeCity.title+" "+currentCounties.title);
							        	var newcityarr1 = addressData[provincedata[pindex].code];
							        	for(var i=0;i<newcityarr1.length;i++){
							        		if(changeCity.title == newcityarr1[i].title){
							        			cindex = i;
							        			break;
							        		}
							        	}
							        	clearTimeout(t);
							                t = setTimeout(function(){
							                	var counarr1 = [],councodearr1 = [],newcounarr1 = addressData[newcityarr1[cindex].code];
							                	for(var i=0;i<newcounarr1.length;i++){
							                		counarr1.push(newcounarr1[i].title);
											councodearr1.push(newcounarr1[i].code);
							                	}
								        	picker.cols[2].replaceValues(councodearr1,counarr1);
								        	currentCity = changeCity;
				    						currentCounties = newcounarr1[0];
										picker.updateValue();
										inputCity.val(currentCity.title);
										inputCounties.val(currentCounties.title);
										inputAreacode.val(currentCounties.code);
						        			base.setInputPickerVal(inputPicker,currentProvince,currentCity,currentCounties);
									},200);
							        	return;
							        }
						        	if(changeCounties && changeCounties != currentCounties.title){
							        	currentCounties = changeCounties;
									inputCounties.val(currentCounties.title);
									inputAreacode.val(currentCounties.code);
					        			base.setInputPickerVal(inputPicker,currentProvince,currentCity,currentCounties);
								}
							        setTimeout(function(){
					        			base.setInputPickerVal(inputPicker,currentProvince,currentCity,currentCounties);
								},200);
						        }
						});
						callback && callback();
					}
				}
			});
		},
		setInputPickerVal : function(input,input1,currentProvince,currentCity,currentCounties){
			var setval = "";
			if(currentProvince && currentProvince.title){
				setval += currentProvince.title;
			}
			if(currentCity && currentCity.title && currentCity.title !="市辖区" && currentCity.title != "县" && currentCity.title != "市" && currentCity.title != '省直辖县级行政单位'){
				setval += " " + currentCity.title;
			}
			if(currentCounties && currentCounties.title){
				setval += " " + currentCounties.title;
			}
			input.val(setval);
			input1 && input1.val(setval);
		},
		setAddressPicker : function(options){
			var myApp = options.myApp,
				inputPicker = options.inputPicker,
				disInput = options.disInput,
				inputProvince = options.inputProvince,
				inputCity = options.inputCity,
				inputCounties = options.inputCounties,
				inputAreacode = options.inputAreacode,
				callback = options.callback,
				addressData = provincedata = citydata = countiesdata = [],
				currentProvince,currentCity,currentCounties,
				defaultProvince = inputProvince.val(),
				defaultCity = inputCity.val(),
				defaultCounties = inputCounties.val(),
				defaultAreacode = inputAreacode.val(),
				countiesCodedata = {},opendone = false;
			if(!defaultAreacode || defaultAreacode == ""){
				defaultProvince = defaultCity = defaultCounties = "";
			}
			$.ajax({
				url:"/mobile/ajax/api.php?action=getallarea",
				type:"get",
				dataType:"json",
				success:function(data){
					if(data){
						var addressData={"province":[]};
						for(var i=0;i<data.length;i++){
							var f = data[i];
							if(f.levels == 1){
								addressData.province.push(f);
								addressData[f.code] = [];
								if(defaultProvince != "" && (defaultProvince == f.title || f.title.indexOf(defaultProvince) > -1)){
									defaultProvince = f;
								}
								for(var j=0;j<data.length;j++){
									var s = data[j];
									if(s.levels == 2 && s.parentcode == f.code){
										addressData[f.code].push(s);
										addressData[s.code] = [];
										if(defaultCity != "" && (defaultCity == s.title || s.title.indexOf(defaultCity) > -1)){
											defaultCity = s;
										}else if(!defaultCity && s.parentcode == defaultProvince.code){
											defaultCity = s;
										}
										for(var m=0;m<data.length;m++){
											var t = data[m];
											if(t.levels == 3 && t.parentcode == s.code && t.title !="市辖区" && t.title != "县"){
												addressData[s.code].push(t);
												if(defaultCounties != "" && (defaultCounties == t.title || t.title.indexOf(defaultCounties) > -1)){
													defaultCounties = t;
												}else if(!defaultCounties && t.parentcode == defaultCity.code){
													defaultCounties = t;
												}
											}
										}
									}
								}
							}
						}
						provincedata = addressData.province;
						if(defaultProvince != ""){
							citydata = addressData[defaultProvince.code];
							countiesdata = addressData[defaultCity.code] ? addressData[defaultCity.code] : [];
							currentProvince = defaultProvince;
							currentCity = defaultCity;
							currentCounties = defaultCounties;
						}else{
							citydata = addressData[provincedata[0].code];
							countiesdata = addressData[citydata[0].code];
							currentProvince = provincedata[0];
							currentCity = citydata[0];
							currentCounties = countiesdata[0];
						}
						inputProvince.val(currentProvince.title);
						inputCity.val(currentCity.title);
						inputCounties.val(currentCounties.title);
						inputAreacode.val(currentCounties.code);
						base.setInputPickerVal(inputPicker,disInput,currentProvince,currentCity,currentCounties);
						var colcode1=[],colvalue1=[];
						for(var i=0;i<provincedata.length;i++){
							colcode1.push(provincedata[i].code);
							colvalue1.push(provincedata[i].title);
						}
						var colcode2=[],colvalue2=[];
						if(citydata && citydata.length > 0){
							for(var i=0;i<citydata.length;i++){
								colcode2.push(citydata[i].code);
								colvalue2.push(citydata[i].title);
							}
						}else{
							colcode2 = [""];
							colvalue2 = [""];
						}
						var colcode3=[],colvalue3=[];
						if(countiesdata && countiesdata.length > 0){
							for(var i=0;i<countiesdata.length;i++){
								colcode3.push(countiesdata[i].code);
								colvalue3.push(countiesdata[i].title);
							}
						}else{
							colcode3 = [""];
							colvalue3 = [""];
						}
						var pickerAddress = myApp.picker({
							input: inputPicker,
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
								{values: colcode1,displayValues:colvalue1},
								{textAlign:'left',values: colcode2,displayValues:colvalue2},
								{values: colcode3,displayValues:colvalue3}
							],
							onOpen: function (picker) {
								base.setInputPickerVal(inputPicker,disInput,currentProvince,currentCity,currentCounties);
								if(defaultProvince && defaultProvince.title!=""){
									picker.setValue([defaultProvince.code, defaultCity.code, defaultCounties.code]);
								}else{
									inputAreacode.val(currentCounties.code);
								}
								setTimeout(function(){
									base.setInputPickerVal(inputPicker,disInput,currentProvince,currentCity,currentCounties);
								},200);
								var cityarr = [],newcityarr = addressData[provincedata[0].code];
								if(defaultProvince != ""){
									newcityarr = addressData[defaultProvince.code]
								}
								for(var i=0;i<newcityarr.length;i++){
									cityarr.push(newcityarr[i].title);
								}
								citydata = cityarr;
								var counarr = [],newcounarr = newcityarr.length > 0 ? addressData[newcityarr[0].code] : [],
									councodearr = [];
								if(defaultProvince != ""){
									newcounarr = addressData[defaultCity.code] ? addressData[defaultCity.code] : [];
								}
								if(newcounarr.length > 0){
									for(var i=0;i<newcounarr.length;i++){
										counarr.push(newcounarr[i].title);
										councodearr.push(newcounarr[i].code);
										countiesCodedata[newcounarr[i].title] = newcounarr[i].code;
									}
								}else{
									counarr = [];
									councodearr = [];
								}
								picker.container.parent().parent().addClass("picker-address");
								picker.container.parent().parent().css("left","0px");
							},
							onChange: function (picker, values, displayValues) {
								var changeProvince = {"title":displayValues[0],"code":values[0]},
									changeCity = {"title":displayValues[1],"code":values[1]},
									changeCounties = {"title":displayValues[2],"code":values[2]};
								if(defaultProvince && defaultProvince.title != "" && !opendone){
									if(changeCity.code == "" && changeCounties.code == ""){
										opendone = true;
										return;
									}
									if(changeProvince.code == defaultProvince.code && changeCity.code == defaultCity.code && changeCounties.code == defaultCounties.code){
										opendone = true;
										base.setInputPickerVal(inputPicker,disInput,currentProvince,currentCity,currentCounties);
										setTimeout(function(){
											base.setInputPickerVal(inputPicker,disInput,currentProvince,currentCity,currentCounties);
										},100);
									}
									return;
								}
								var newCity,newCounties,pindex=0,cindex=0,
									newProvincedata,newCitydata,newCountiesdata;
								for(var i=0;i<provincedata.length;i++){
									if(changeProvince.code == provincedata[i].code){
										pindex = i;
										break;
									}
								}
								if(changeProvince.title !== currentProvince.title) {
									currentProvince = changeProvince;
									var strval = "";
									if(changeProvince && changeProvince.title)strval += changeProvince.title;
									if(currentCity && currentCity.title)strval += " " + currentCity.title;
									if(currentCounties && currentCounties.title)strval += " " + currentCounties.title;
									inputPicker.val(strval);
									clearTimeout(t);
									t = setTimeout(function(){
										var cityarr = [],citycodearr = [],newcityarr = addressData[provincedata[pindex].code];
										if(newcityarr.length > 0){
											for(var i=0;i<newcityarr.length;i++){
												cityarr.push(newcityarr[i].title);
												citycodearr.push(newcityarr[i].code);
											}
										}else{
											cityarr = [""];
											citycodearr = [""];
										}
										currentCity = newcityarr[0];
										var counarr = [],councodearr = [],newcounarr = newcityarr.length > 0 ? addressData[newcityarr[0].code] : [];
										if(newcounarr.length > 0){
											for(var i=0;i<newcounarr.length;i++){
												counarr.push(newcounarr[i].title);
												councodearr.push(newcounarr[i].code);
											}
										}else{
											counarr = [""];
											councodearr = [""];
										}
										currentCounties = newcounarr.length > 0 ? newcounarr[0] : {title:"",code:""};
										picker.cols[1].replaceValues(citycodearr,cityarr);
										picker.cols[2].replaceValues(councodearr,counarr);
										picker.updateValue();
										inputProvince.val(currentProvince.title);
										inputCity.val(currentCity ? currentCity.title : "");
										inputCounties.val(currentCounties ? currentCounties.title : "");
										if(currentCounties && currentCounties.code){
											inputAreacode.val(currentCounties.code);
										}else if(currentCity && currentCity.code){
											inputAreacode.val(currentCity.code);
										}else{
											inputAreacode.val(currentProvince.code);
										}
										base.setInputPickerVal(inputPicker,disInput,currentProvince,currentCity,currentCounties);
									}, 200);
									return;
								}
								newCity = changeCity.title;
								if(changeCity.title && changeCity.title !== currentCity.title) {
									inputPicker.val(currentProvince.title+" "+changeCity.title+" "+currentCounties.title);
									var newcityarr1 = addressData[provincedata[pindex].code];
									for(var i=0;i<newcityarr1.length;i++){
										if(changeCity.title == newcityarr1[i].title){
											cindex = i;
											break;
										}
									}
									clearTimeout(t);
									t = setTimeout(function(){
										var counarr1 = [],councodearr1 = [],newcounarr1 = newcityarr1.length > 0 ? addressData[newcityarr1[cindex].code] : [];
										for(var i=0;i<newcounarr1.length;i++){
											counarr1.push(newcounarr1[i].title);
											councodearr1.push(newcounarr1[i].code);
										}
										if(newcounarr1.length == 0){
											counarr1 = [""];
											councodearr1 = [""];
										}
										picker.cols[2].replaceValues(councodearr1,counarr1);
										currentCity = changeCity;
										currentCounties = newcounarr1.length > 0 ? newcounarr1[0] : {title:"",code:""};
										picker.updateValue();
										inputCity.val(currentCity ? currentCity.title : "");
										inputCounties.val(currentCounties ? currentCounties.title : "");
										if(currentCounties && currentCounties.code){
											inputAreacode.val(currentCounties.code);
										}else if(currentCity && currentCity.code){
											inputAreacode.val(currentCity.code);
										}else{
											inputAreacode.val(currentProvince.code);
										}
										base.setInputPickerVal(inputPicker,disInput,currentProvince,currentCity,currentCounties);
									},200);
									return;
								}
								if(changeCounties && changeCounties != currentCounties.title){
									currentCounties = changeCounties;
									inputCounties.val(currentCounties.title);
									inputAreacode.val(currentCounties.code);
									base.setInputPickerVal(inputPicker,disInput,currentProvince,currentCity,currentCounties);
								}
								setTimeout(function(){
									base.setInputPickerVal(inputPicker,disInput,currentProvince,currentCity,currentCounties);
								},200);
							}
						});
						callback && callback();
					}
				}
			});
		},
		playamr : function(curamr){
			require(["amrnb"],function(){
				var gAudioContext = new AudioContext();
				function fetchBlob(url, callback) {
				        var xhr = new XMLHttpRequest();
				        xhr.open('GET', url);
				        xhr.responseType = 'blob';
				        xhr.onload = function() {
				            callback(this.response);
				        };
				        xhr.onerror = function() {
				            base.tip('Failed to fetch ' + url,1500);
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
				            base.tip('Failed to decode!');
				            return;
				        }
				        playPcm(samples);
				}
				function playAmrBlob(blob, callback) {
				        readBlob(blob, function(data) {
				            	playAmrArray(data);
				        });
				}
				fetchBlob(curamr, function(blob) {
			            	playAmrBlob(blob);
			        });
			});
		},
		afterGoldinfo : function(options){
			var myApp = options.myApp,
			    omodal = options.modal,
			    curmodal = $("."+omodal+"-success"),
			    curgold = curmodal.find(".gold-info"),
			    usercreditsarea = $("#usercredits"),
			    usercreditsnum = parseInt(usercreditsarea.val()),
		            num,coinTomorrow,days;
			if(omodal == "share"){
				num = options.num;
				myApp.closeNotification(".sharetip");
			}else if(omodal == "signin"){
				var data = options.data,
				creditarea = $(".user-info .creditnum"),
				curCredit = parseInt(creditarea.html());
				num = data.coinPlus;
				coinTomorrow = data.coinTomorrow;
				days = data.days;
				creditarea.html(curCredit+num);
			}
			usercreditsarea.html(usercreditsnum+num);
			myApp.pickerModal(curmodal);
			Dom(curmodal).on("opened",function(){
				curgold.find(" #addNum").html(num);
				curgold.find(".dropNum").html("+"+num);
				curgold.find("#signDay").html(days);
				curgold.find("#newNum").html(coinTomorrow);
				base.dropCoinAnimate(curmodal,num,options.type);
				curgold.find(".btn_close").click(function(){
					myApp.closeModal(curmodal);
					curgold.find('.friend_area').hide();
					curgold.find('.timeline_area').hide();
				});
			});
		},
		wxCallbacks : {
			favorite:true,
			async:true,
			ready : function() {},
			cancel : function(resp) {},
			fail : function(resp) {},
			success : function(resp,type,wxData,myApp) {
				var self= this;
				/*
				if(type == "timeline"){
					$('.share-success .friend_area').hide();
					$('.share-success .timeline_area').show();
				}else{
					$('.share-success .friend_area').show();
					$('.share-success .timeline_area').hide();
				}
				*/
				if(base.isAndroid()){
				}else if(base.isIOS()){
					if(resp.err_desc && resp.err_desc=="已分享"){
						type="favorite";
					}
				}
				base.ajax({
					myApp:myApp,
					url:"/mobile/ajax/credit.php?do=add&type="+type+"&title="+wxData.title,
					data:{shareurl:wxData.link},
					type:"post",
					dataType:"html",
					success:function(data){
						if(location.href.indexOf("gyp")>-1){
							alert(data);
						}
						if(isNaN(data)){
							base.tip(data);
						}else{
							var num = (data && data!="") ? parseInt(data) : 0;
							//if(num>0){
							if(SHARETIPS){
								base.afterGoldinfo({myApp:myApp,modal:"share",num:num,type:type});
							}
							//}else{
							//	base.tip("分享成功");
							//}
						}
					},
					error:function(res){
						base.tip("分享失败");
						if(location.href.indexOf("gyp")>-1){
							alert(JSON.stringify(res));
						}
					}
				});
			},
			all : function(resp) {}
		},
		getTicket : function(){
			var retticket = '';
			$.ajax({
				url: "/mobile/ajax/api.php?action=getticket",
				type: "get",
				async:false,
				dataType: "html",
				success: function (data) {
					if(data == ''){
						$.ajax({
							url: "/mobile/ajax/api.php?action=getticket",
							type: "get",
							async:false,
							dataType: "html",
							success: function (data) {
								retticket = data;
								$("#curticket").val(data);
							}
						});
					}else{
						retticket = data;
						$("#curticket").val(data);
					}
				}
			});
			return retticket;
		},
		handlewx : function(myApp,wxData){
			var isUpdate = false,
				retticket = this.getTicket();
			if(location.href.indexOf("gyp") > -1){
				alert(retticket);
			}
			var appid = weixin_appid,
			    timestamp = base.getTimestamp(),
			    nonceStr = base.getRandomStr(),
			    signature = retticket,
			    url = location.href,
			    index = url.indexOf("#");
			if(index>-1){
				url = url.substr(0,index);
			}
			var jsapi_ticket =function(){
				var ret = "jsapi_ticket="+signature+
					"&noncestr="+nonceStr+
					"&timestamp="+timestamp+
					"&url="+url;
				return base.SHA1(ret);
			};
			var config_sha = jsapi_ticket(),
			    jsApiList = [ 'checkJsApi','onMenuShareTimeline', 'onMenuShareAppMessage','onMenuShareQQ', 'onMenuShareWeibo',
				    'hideMenuItems','showMenuItems', 'hideAllNonBaseMenuItem','showAllNonBaseMenuItem',
				    'translateVoice','startRecord', 'stopRecord', 'onRecordEnd', 'playVoice',
				    'pauseVoice', 'stopVoice','uploadVoice','downloadVoice','chooseImage', 'previewImage',
				    'uploadImage', 'downloadImage', 'getNetworkType', 'openLocation',
				    'getLocation','hideOptionMenu','showOptionMenu', 'closeWindow', 'scanQRCode',
				    'chooseWXPay', 'openProductSpecificView', 'addCard','chooseCard', 'openCard'];
			if(!wxData || !wxData.title || wxData.title==""){
				wxData = {};
			}
			if(location.href.indexOf("gyp") > -1){
				wx.config({
					debug: true,
					appId: appid,
					timestamp: timestamp,
					nonceStr: nonceStr,
					signature: config_sha,
					jsApiList: jsApiList
				});
			}else{
				wx.config({
					debug: false,
					appId: appid,
					timestamp: timestamp,
					nonceStr: nonceStr,
					signature: config_sha,
					jsApiList: jsApiList
				});
			}
			wx.ready(function(){
				base.wxCallbacks.ready();
				wx.showMenuItems({
					menuList: [
						'menuItem:profile',
						'menuItem:addContact'
					]
				});
				wx.hideMenuItems({
					menuList: [
						'menuItem:exposeArticle',
						'menuItem:setFont',
						'menuItem:readMode',
						'menuItem:share:qq',
						'menuItem:share:QZone',
						'menuItem:share:weiboApp',
						'menuItem:share:facebook'
					]
				});
				var wxshareurl = wxData.link,
				urlparam = base.getParam(wxshareurl),
				paramopenid = urlparam.openid;
				if(paramopenid){
					wxshareurl = wxshareurl.replace("&openid="+paramopenid,"");
					wxshareurl = wxshareurl.replace("openid="+paramopenid,"");
				}
				wx.onMenuShareAppMessage({
					title: wxData.title,
					desc: wxData.desc,
					link: wxshareurl,
					imgUrl: wxData.imgUrl,
					type: wxData.type,
					dataUrl:wxData.dataUrl,
					trigger: function (res) {
						//分享之前执行
						//	alert('用户点击发送给朋友');
						wxData.beforeShare && wxData.beforeShare();
						if(wxData.desc == "undefined" || wxData.desc == undefined){
							alert("微信还没准备好分享，请稍后再试");
						}
					},
					success: function (resp) {
						if(isUpdate){
							base.tip("微信版本太低，请先升级微信客户端!");
						}
						base.wxCallbacks.success(resp,"friend",wxData,myApp);
					},
					cancel: function (resp) {
						base.wxCallbacks.cancel(resp,"friend");
					}
				});
				wx.checkJsApi({
					jsApiList: ['onMenuShareAppMessage'],
					success: function(res) {
						if(!res.checkResult.onMenuShareAppMessage){
							isUpdate = true;
						}
					}
				});
				wx.onMenuShareTimeline({
					title: wxData.timelineTitle,
					link: wxshareurl,
					imgUrl: wxData.imgUrl,
					trigger: function (res) {
						//分享之前执行
						//	alert('用户点击发送给朋友');
						wxData.beforeShare && wxData.beforeShare();
						if(wxData.desc == "undefined" || wxData.desc == undefined){
							alert("微信还没准备好分享，请稍后再试");
						}
					},
					success: function (resp) {
						base.wxCallbacks.success(resp,"timeline",wxData,myApp);
					},
					cancel: function (resp) {
						base.wxCallbacks.cancel(resp,"timeline");;
					}
				});
				wx.onMenuShareQQ({
					title: wxData.title,
					desc: wxData.desc,
					link: wxshareurl,
					imgUrl: wxData.imgUrl,
					trigger: function (res) {
						//分享之前执行
						//	alert('用户点击发送给朋友');
						wxData.beforeShare && wxData.beforeShare();
						if(wxData.desc == "undefined" || wxData.desc == undefined){
							alert("微信还没准备好分享，请稍后再试");
						}
					},
					success: function (resp) {
						base.wxCallbacks.success(resp,"qq",wxData,myApp);
					},
					cancel: function (resp) {
						base.wxCallbacks.cancel(resp,"qq");
					}
				});
			});
		},
		setDisinfo : function(d,area){
			var curitem = area.find(".scroll_item"),
				did = d.id ? d.id : d.uid,
                                distype = d.stype ? d.stype : d.type;
			curitem.attr("itemid",did);
                        if(d.uid || d.uid == 0)curitem.attr("uid",d.uid);
                        if(d.storage)curitem.attr("storage",d.storage);
                        if(d.aid)curitem.attr("aid",d.aid);
                        if(d.moduleid){
                                curitem.attr("moduleid",d.moduleid);
                                if(d.module){
                                        curitem.attr("module",d.module);

                                }else{
                                        curitem.attr("module",d.type);
                                }
                        }
                        if(d.productid){
                                curitem.attr("originid",d.productid);
                                curitem.attr("productid",d.productid);
                        }
                        if(d.sid)curitem.attr("sid",d.sid);
                        if(d.commission)curitem.attr("commission",d.commission);
                        if(d.agentfee)curitem.attr("agentfee",d.agentfee);
                        if(area.find(".optionstr")[0] && (!d.options || d.options == "")){
                                area.find(".optionstr").remove();
                        }
                        area.find(".disbusinessname").html(d.business_name);
                        if(d.discount_str){
                                area.find(".discount").html(d.discount_str);
                        }else{
                                area.find(".discount").html(d.count);
                        }
                        area.find(".disdeviceid").html(d.device_id);
                        area.find(".distimearea").html(d.starttime+" 至 "+d.endtime);
                        area.find(".distype").html(distype);
                        area.find(".dig_div").attr("moduleid",d.id);
                        if(d.isdig){
                                area.find(".dig_div").addClass("diged");
                        }
                        if(area.find(".disdatestate")[0]){
                                base.setDatestate(d.dateline,curitem.find(".disdatestate"));
                        }
			for(var key in d){
				var curdis = area.find(".dis"+key);
				if(curdis[0]){
                                        if(key != "stype" && key != "type" && key != "photo" && key != "avatar" && key != "discount_str" && key != "count" && key != "dateline" && key != "last_active_time"){
                                                curdis.html((d[key] == null) ? "" : d[key]);
                                        }
				}
			}
			var datearea = area.find(".disdate"),
				datestrarea = area.find(".disdatestr");
			if(datearea[0] || datestrarea[0]){
				var dateval;
				if(d.last_active_time){
					dateval = d.last_active_time;
				}else if(d.dateline){
					dateval = d.dateline;
				}
				if(dateval){
                                        var typeofkey = typeof dateval,
						datestr = "";
                                        if(typeofkey == "number" || !isNaN(dateval)){
                                                var formatstr = datearea.attr("formatstr") ? datearea.attr("formatstr") : "yyyy-MM-dd HH:mm";
                                                datestr = base.dateFormat(dateval,formatstr);
                                        }else if(typeofkey == "string"){
                                        	datestr = dateval;
                                        }
                                        datearea.html(datestr);
                                        datestrarea.html(datestr);
				}
                        }
		},
		setChatHref : function(d,area){
			var hrefarea = area.find(".chatuser");
			if(hrefarea[0]){
				var linkurl = hrefarea.attr("linkurl"),
					linkchar = hrefarea.attr("linkchar");
				if(linkurl){
					if(linkchar){
						var chararry = linkchar.split(","),charstr = [];
						for(var i=0;i<chararry.length;i++){
							var c = chararry[i],
								carr = c.split(" ");
							if(carr.length == 2){
								var cval = carr[1];
								charstr.push(carr[0]+"="+d[cval]);
							}else{
								charstr.push(c+"="+d[c]);
							}
						}
						if(charstr.length > 0){
							if(linkurl.indexOf('?') > -1){
								linkurl += "&"+charstr.join('&');
							}else{
								linkurl += "?"+charstr.join('&');
							}

						}
					}
					hrefarea.attr("href",linkurl);
				}
			}
		},
		setPhotoError : function(area){
                        area.attr("onerror","javascript:this.src='"+DEFAULT_IMG+"';");
		},
		setAvatarError : function(area){
                        area.attr("onerror","javascript:this.src='"+DEFAULT_AVATAR+"';");
		},
		setPic : function(d,area){
			var disphoto = area.find(".disphoto"),
				disavatar = area.find(".disavatar"),
                                lazyarea = area.find(".lazy"),photo = "",avatar = "";
                        if(d.thumb){
                                area.find(".disthumb").attr("src",base.getPhoto(d.thumb));
                                area.find(".disthumb").attr("data-original",base.getPhoto(d.photo));
                        }
                        if(d.photo){
                                if(d.photo == ""){
                                        photo = DEFAULT_IMG;
                                }else{
                                        photo = base.getPhoto(d.photo);
                                }
                        }
                        if(d.avatar){
                                avatar = base.getPhoto(d.avatar);
                        }else if(d.uid){
                                avatar = base.getAvatar(d.uid);
                        }
                        if(!disphoto.attr("onerror") || !disavatar.attr("onerror")){
				if((d.photo || d.photo == '' || d.photo == null) && d.photo != undefined && d.uid){
					base.setPhotoError(disphoto);
					base.setAvatarError(disavatar);
				}else{
					if(photo == '' && avatar ==  ''){
						base.setPhotoError(disphoto);
						base.setAvatarError(disavatar);
					}else if(photo != ''){
						avatar = photo;
						base.setPhotoError(disphoto);
						base.setPhotoError(disavatar);
					}else if(avatar != ''){
						photo = avatar;
						base.setAvatarError(disphoto);
						base.setAvatarError(disavatar);
					}
				}
                        }
                        if(lazyarea[0]){
                                if(lazyarea.is("img")){
                                        if(photo != ""){
                                                lazyarea.attr("data-src",photo);
                                        }else{
                                                lazyarea.attr("data-src",DEFAULT_IMG);
                                        }
                                }else{
                                        if(photo != ""){
                                                lazyarea.attr("data-background",photo);
                                        }else{
                                                lazyarea.attr("data-background",DEFAULT_IMG);
                                        }
                                }
                        }
                        var scrollLoading = area.find("*[data-url]");
                        if(scrollLoading.length > 0){
                                scrollLoading.each(function(){
                                        var cur = $(this);
                                        cur.attr("data-url",photo);
                                        if(cur.hasClass("disavatar")){
                                                cur.attr("data-url",avatar);
                                        }
                                });
                        }
                        if(!area.find(".disphoto").attr("data-url")){
                                area.find(".disphoto").attr("src",photo);
                        }
                        if(!area.find(".disphotobg").attr("data-url")){
                                area.find(".disphotobg").css("background-image","url('"+photo+"')");
                        }
                        if(!area.find(".disbg").attr("data-url")){
                                area.find(".disbg").css("background-image","url('"+photo+"')");
                        }
                        if(!area.find(".disavatar").attr("data-url")){
                                area.find(".disavatar").attr("src",avatar);
                        }
                        if(!area.find(".disavatarbg").attr("data-url")){
                                area.find(".disavatarbg").css("background-image","url('"+avatar+"')");
                        }
		},
		setPageData : function(d,params){
			var curtemplate = params.curtemplate,
			    scrollList = params.scrollList,
			    pname = params.pname,
			    postparams = params.postparams,
			    curpagearea = params.container,
			    operation = params.operation,
			    setcallback = params.setcallback,
			    pagecallback = params.pagecallback,
			    handlePageData = params.handlePageData,
			    aftersetCallback = params.aftersetCallback;
			curtemplate = base.getNewTemplate(curtemplate,curpagearea);
			var curitem = curtemplate.find(".scroll_item"),
			    did = d.id ? d.id : d.uid;
			curitem.attr("id",pname+"-"+did);
			base.setDisinfo(d,curtemplate);
			base.setChatHref(d,curtemplate);
			base.setPic(d,curtemplate);
			base.setDishref(curtemplate,d);
			handlePageData && handlePageData(d,curpagearea,pname,curtemplate);
			setcallback && setcallback(d,curtemplate);
			if(pagecallback){
				pagecallback(d,scrollList,curtemplate.children()[0].outerHTML);
				curtemplate.remove();
			}else{
				if(pname == "meetingcontent"){
					scrollList.append(curtemplate.html());
				}else if(params.module && params.module == "poi" && params.action && params.action == "list"){
					if(params.locationCallback){
						params.locationCallback(d,curtemplate,function(){
							scrollList.append(curtemplate.html());
							curtemplate.remove();
						});
					}else{
						scrollList.append(curtemplate.html());
						curtemplate.remove();
					}
				}else{
					scrollList.append(curtemplate.html());
					curtemplate.remove();
				}
			}
			var curitem = scrollList.find(".scroll_item[itemid="+did+"]");
			curitem.find('div.lazy').trigger('lazy');
			curitem.find('img.lazy').trigger('lazy');
			curitem.data("data",d);
			aftersetCallback && aftersetCallback(d,curitem);
                        var scrollcontainer = params.scrollarea ? params.scrollarea : curpagearea.find(">.page-content");
                        if(scrollList.attr("scrollarea")){
                                scrollcontainer = curpagearea.find(scrollList.attr("scrollarea"));
                        }
			base.handleScrollLoading(curitem,scrollcontainer);
			if(operation && operation.length>0){
				base.taskData({
					data:operation,
					handleFunction:function(o){
						return function(done){
							base.handleOperation(d,o,curitem,curpagearea);
							done();
						}
					}
				});
			}else{
                                if(curitem.find(".disdatestate")[0]){
                                        base.setDatestate(d.dateline,curitem.find(".disdatestate"));
                                }
			}
		},
		setDishref : function(area,d){
			var items = area.find(".dishref");
			if(area.hasClass("dishref"))items.push(area[0]);
			items.each(function(){
				var dishref = $(this),
					linkurl = dishref.attr("linkurl"),
					linkchar = dishref.attr("linkchar");
				if(d.url){
					if(d.url.indexOf("http") > -1 || d.url.indexOf("https") > -1){
						dishref.addClass("external");
					}
					dishref.attr("href",d.url);
				}else if(d.titleprofile && d.titleprofile!="" && (d.titleprofile.indexOf("http") > -1  || d.titleprofile.indexOf("https") > -1)){
					dishref.attr("href",d.titleprofile);
					dishref.addClass("external");
				}else if(linkurl && linkurl!=""){
					if(linkchar){
						var chararry = linkchar.split(","),charstr = [];
						for(var i=0;i<chararry.length;i++){
							var c = chararry[i],
								carr = c.split(" ");
							if(carr.length == 2){
								var cval = carr[1];
								charstr.push(carr[0]+"="+d[cval]);
							}else{
								charstr.push(c+"="+d[c]);
							}
						}
						if(charstr.length > 0){
							if(linkurl.indexOf('?') > -1){
								linkurl += "&"+charstr.join('&');
							}else{
								linkurl += "?"+charstr.join('&');
							}

						}
					}
					dishref.attr("href",linkurl);
				}
				dishref.removeAttr("linkurl");
				dishref.removeAttr("linkchar");
                        });
		},
		handleOperation : function(d,o,curitem,curpagearea){
			var appendarea = curitem.find(".appendarea"),
				appendtemplate = curpagearea.find(appendarea.attr("template")),
				hrefarea = curitem.hasClass("dishref") ? curitem : curitem.find(".dishref");
			if(!d.url && o.linkurl){
				var curlinkurl = o.linkurl,
					lcarr = [],
					lcstr = '';
				if(curlinkurl.indexOf("?") < 0) curlinkurl += '?';
				if(o.linkchar){
					var lc= o.linkchar.split(",");
					for(var i=0;i<lc.length;i++){
						var l = lc[i];
						lcarr.push(l+"="+d[l]);
					}
				}
				lcstr = lcarr.join('&');
				if(curlinkurl.indexOf('&') > -1) curlinkurl += '&';
				curlinkurl += lcstr;
				hrefarea.attr("href",curlinkurl);
			}
			if(o.title && appendarea[0] && appendtemplate[0]){
				var ot = o.title;
				var adddata = true;
				for(var k in d){
					if(k == ot && o.url ==""){
						adddata = false;
						break;
					}
				}
				var newtemplate = base.getNewTemplate(appendtemplate,curpagearea);
				if(adddata){
					if(typeof d[ot] != "undefined"){
						newtemplate.find(".ajax").html(d[ot]);
					}else{
						newtemplate.find(".ajax").html(ot);
					}
					var os = $(newtemplate.children()[0].outerHTML).appendTo(appendarea),
					chars = o.char.split(",");
					os.data("url",o.url);
					os.data("char",o.char);
					os.data("type",o.type);
					for(var j=0;j<chars.length;j++){
						var c = chars[j];
						os.data(c,d[c]);
					}
				}else{
					newtemplate.find(".ajax").html(d[ot]);
					var os = $(newtemplate.children()[0].outerHTML).appendTo(appendarea);
				}
				newtemplate.remove();
			}
			if(o.datelineflag == 1){
				base.setDatestate(d.dateline,curitem.find(".disdatestate"));
			}
		},
		setDatestate : function(dateline,area,callback1,callback2){
			var dt = new Date(parseInt(dateline) * 1000),
				year = dt.getFullYear(),
				month = dt.getMonth()+1,
				day = dt.getDate(),
				now = new Date(),
				nowyear = now.getFullYear(),
				nowmonth = now.getMonth()+1,
				nowday = now.getDate(),
				datestr = '';
			if(year == nowyear && month == nowmonth){
				if(day == nowday){
					datestr = "今";
					area.addClass("today");
				}else if(day+1 == nowday){
					datestr = "昨";
					area.addClass("yesterday");
				}else if(day+2 == nowday){
					datestr = "前";
				}
				if(datestr != ""){
					area.addClass("show").html(datestr);
				}
				callback1 && callback1();
			}else{
				area.remove();
				callback2 && callback2();
			}
			return datestr;
		},
		getNewTemplate : function(template,area){
			return $('<div class="template-'+(new Date().getTime())+' hide">'+template.html()+'</div>').appendTo(area);
		},
		createNewitem : function(os){
			var template = os.template,
				curdata = os.data,
				did = curdata.id ? curdata.id : curdata.uid,
				area = os.area,
				insertType = (typeof os.insertType == "undefined") ? "appendTo" : os.insertType,
				container = os.container,
				newtmp = base.getNewTemplate(template,container),
				curitem = newtmp.find(".scroll_item");
			if(!curitem[0])curitem = $(newtmp.children()[0].outerHTML);
			if(insertType == "appendTo"){
                                curitem.appendTo(area);
			}else if(insertType == "prependTo"){
                                curitem.prependTo(area);
                        }else if(insertType == "insertAfter"){
                                curitem.insertAfter(area);
                        }else if(insertType == "insertBefore"){
                                curitem.insertBefore(area);
                        }
			curitem.data("data",curdata);
                        curitem.attr("itemid",did);
                        base.setDisinfo(curdata,curitem);
                        base.setChatHref(curdata,curitem);
                        base.setDishref(curitem,curdata);
                        base.setPic(curdata,curitem);
                        var lazyimg = curitem.find("*[data-url]");
                        if(lazyimg[0]){
                                var scrollcontainer = os.scrollarea ? os.scrollarea : container.find(">.page-content");
                                base.handleScrollLoading(curitem,scrollcontainer);
                        }
                        os.callback && os.callback(curitem);
		},
		handleScrollLoading : function(area,scrollcontainer){
                        var loadingitems = area.find("*[data-url]");
                        if(loadingitems.length > 0){
                                require(['jquery.scrollLoading'],function(){
                                        loadingitems.each(function(){
                                                $(this).scrollLoading({
                                                        container:scrollcontainer
                                                });
					});
                                });
                        }
		},
		getPopup : function(myApp,template,css){
			$("."+css).remove();
			var popHTML = '<div class="popup '+css+'" style="bottom:45px;top:0px;">'+
				template.html()+
				'</div>';
			return $(myApp.popup(popHTML));
		},
		getPickerModal : function(myApp,template,css){
			$("."+css).remove();
			var popHTML = '<div class="picker-modal '+css+'">'+
				template.html()+
				'</div>';
			return $(myApp.pickerModal(popHTML));
		},
		marqueeEvent : function(options){
			var scrollWrap = options.scrollWrap,
			scrollItem = options.scrollItem,
			scrollHeight = options.scrollHeight ? options.scrollHeight+1 : 23;
			callback = options.callback;
			var oScroll = scrollWrap[0];
			var preTop = 0,curTop = 0,stopTime = 0,
			oScrollMsg = scrollItem[0];
			oScroll.appendChild(oScrollMsg.cloneNode(true));
			init_srolltext();
			function init_srolltext(){
				oScroll.scrollTop = 0;
				scrollUpInterval = setInterval(scrollUp, 15);
			}
			function scrollUp(){
				if(options.isStoped)return;
				curTop += 1;
				if(curTop == scrollHeight){
					stopTime += 1;
					curTop -= 1;
					if(stopTime == 180){
						curTop = 0;
						stopTime = 0;
					}
				}else{
					preTop = oScroll.scrollTop;
					oScroll.scrollTop += 1;
					if(preTop == oScroll.scrollTop){
						oScroll.scrollTop = 0;
						oScroll.scrollTop += 1;
					}
				}
			}
		},
		htmlspecialchars_decode : function(str){
			str = str.replace(/&amp;/g, '&');
			str = str.replace(/&lt;/g, '<');
			str = str.replace(/&gt;/g, '>');
			str = str.replace(/&quot;/g, "''");
			str = str.replace(/&#039;/g, "'");
			return str;
		},
		getCursortPosition : function(ctrl) {
			var CaretPos = 0;   // IE Support
			if (document.selection) {
				ctrl.focus ();
				var Sel = document.selection.createRange ();
				Sel.moveStart ('character', -ctrl.value.length);
				CaretPos = Sel.text.length;
			}
			// Firefox support
			else if (ctrl.selectionStart || ctrl.selectionStart == '0')
				CaretPos = ctrl.selectionStart;
			return (CaretPos);
		},
		setCaretPosition : function(ctrl, pos){
			if(ctrl.setSelectionRange) {
				ctrl.focus();
				ctrl.setSelectionRange(pos,pos);
			}
			else if (ctrl.createTextRange) {
				var range = ctrl.createTextRange();
				range.collapse(true);
				range.moveEnd('character', pos);
				range.moveStart('character', pos);
				range.select();
			}
		},
		handleSubscribe : function(p){
			var myApp = p.myApp,
			pcontainer = p.pcontainer,
			pticket = p.pticket;
			pcontainer.find(".opercon").remove();
			if(pticket){
				myApp.popup($("#subscribeTicketOperator"));
			}else{
				myApp.popup($("#subscribeOperator"));
			}
			if(pticket){
				require(["zhoubian"],function(){
					BeaconAddContactJsBridge.ready(function(){
						BeaconAddContactJsBridge.invoke('checkAddContactStatus',{} ,function(apiResult){
							if(apiResult.err_code == 0){
								var status = apiResult.data;
								if(status == 0){
									$(".popupOperator #oper_gz").click(function(){
										BeaconAddContactJsBridge.invoke('jumpAddContact');
									});
								}
							}
						});
					});
				});
			}
		},
		uploadPhoto : function(options){
			var myApp = options.myApp,
				input = options.input,
				form = options.form,
				callback = options.callback,
				afterclick = options.afterclick;
			input.change(function(){
				base.ajaxSubmit({
					myApp:myApp,
					form:form,
					url:"ajax/api.php?action=app_upload_img&module=user",
					success:function(data){
						callback(data);
					}
				});
			});
			if(window.WeixinJSBridge) {
				input.click(function (event) {
					event.preventDefault();
					afterclick && afterclick();
					wx.chooseImage({
						sourceType: ['camera'],
						success: function (res) {
							var localIds = res.localIds;
							//myApp.showIndicator();
							base.taskData({
								data: localIds,
								callback: function () {
									//myApp.hideIndicator();
								},
								handleFunction: function (d) {
									return function (done) {
										wx.uploadImage({
											localId: d,
											isShowProgressTips: 0,
											success: function (res1) {
												$.ajax({
													url: "ajax/api.php?action=app_upload_img&module=user",
													data: {imgid: res1.serverId},
													type: "post",
													dataType: "json",
													success: function (ret) {
														callback && callback(ret);
														done();
													}
												});
											},
											fail: function (res2) {
												base.tip("失败");
												done();
											}
										});
									}
								}
							});
						},
						fail: function (r) {
							//alert(JSON.stringify(r));
						}
					});

				});
			}
		},
		gratuityEvent : function(options){
			var myApp = options.myApp,
				ele = $(options.element);
			ele.click(function(event){
				event.preventDefault();
				$.ajax({
					url:"ajax/api.php?action=gratuitytemplate",
					success:function(html){
						var curpop = $(myApp.popup(html)),
							hbarea = curpop.find(".hblist"),
							shangmoney = curpop.find("#shangmoney"),
							touid = ele.attr("touid"),
							postdata = {module:ele.attr("module"),moduleid:ele.attr("moduleid")};
						if(touid){
							curpop.find(".touser").show();
							curpop.find(".dislinkman").html(ele.attr("linkman"));
							postdata['touid'] = touid;
						}else{
							curpop.find(".touserselect").show();
							var getuserurl = ele.attr("getuser");
							if(getuserurl){
								base.getJSON({
									url:getuserurl,
									success:function(users){
										var str = '';
										for(var i=0;i<users.length;i++){
											var u = users[i];
											str += '<option value="'+u.uid+'">'+u.linkman+'</option>';
										}
										curpop.find(".touserselect select").append(str);
									}
								});
							}
						}
						hbarea.find(".item").click(function(event){
							var cur = $(this);
							if(cur.hasClass("active")){
								cur.removeClass("active");
								shangmoney.val("");
							}else{
								hbarea.find(".item.active").removeClass("active");
								cur.addClass("active");
								shangmoney.val(cur.attr("money"));
							}
						});
						curpop.find(".btn-sub").click(function(){
							var moneyVal = shangmoney.val(),
								minmoney = parseFloat(shangmoney.attr("minmoney")),
								maxmoney = parseFloat(shangmoney.attr("maxmoney"));
							if(base.trim(moneyVal) == ""){
								base.tip("请输入打赏金额");
								return false;
							}
							if(isNaN(moneyVal)){
								base.tip("请输入正确的打赏金额",1500);
								return false;
							}
							if(parseFloat(moneyVal) < minmoney || parseFloat(moneyVal) > maxmoney){
								base.tip("打赏金额在"+minmoney+"-"+maxmoney+"之间",1500);
								return false;
							}
							base.ajaxSubmit({
								myApp:myApp,
								form:curpop.find("form"),
								url:"ajax/api.php?action=gratuity",
								data:postdata,
								success:function(ret){
									if(ret.orderid){
										location.href='/mobile/ajax/pay.php?orderid='+ret.orderid;
									}else{
										base.tip(ret.error);
									}
								}
							});
						});
					}
				});
			});
		},
		setViewport:function(viewport){
			if(!viewport){
				viewport = document.getElementById('MobileViewport');
			}
			viewport = $(viewport);
			var pageScale = 1;
			var width = document.documentElement.clientWidth || 320;
			var height = document.documentElement.clientHeight || 486;
			if (width / height >= 320 / 486) {
				pageScale = height / 486;
			} else {
				pageScale = width / 320;
			}
			// meta
			var content = 'width=320, initial-scale=' + pageScale + ', maximum-scale=' + pageScale + ', user-scalable=no';
			viewport.attr('content', content);
		},
		whichTransitionEvent :function(){
			var el = document.createElement('fakeelement'),
				transitions = {
					'transition': 'transitionend',
					'OTransition': 'oTransitionEnd',
					'MozTransition': 'transitionend',
					'WebkitTransition': 'webkitTransitionEnd'
				};
			for(var t in transitions){
				if( el.style[t] !== undefined ){
					return transitions[t];
				}
			}
		},
		notify:function(os) {
			var title = os.title,
				subtitle = os.subtitle,
				aftertitle = os.aftertitle,
				media = os.media,
				callback = os.callback,
				closecallback = os.closecallback,
				distitle = title && (typeof title != 'undefined') ? true : false,
				dissubtitle = subtitle && (typeof subtitle != 'undefined') ? true : false,
				disaftertitle = aftertitle && (typeof aftertitle != 'undefined') ? true : false,
				dismedia = media && (typeof media != 'undefined') ? true : false,
				notifytemplate = os.template,
				html = mediastr = titlestr = substr = afterstr = '',
				bknotify,
				wH = window.innerHeight;
			if (!notifytemplate || typeof notifytemplate == 'undefined') {
				if (dismedia) {
					var defaultmedia = os.defaultmedia ? os.defaultmedia : DEFAULT_IMG;
					mediastr = '<div class="t-cell pic">' +
						'<img src="' + media + '" onerror="javascript:this.src=\'' + defaultmedia + '\';" />' +
						'</div>';
				}
				if (distitle) {
					titlestr = '<div class="title">' + title + '</div>';
				}
				if (dissubtitle) {
					substr = '<div class="subtitle">' + subtitle + '</div>';
				}
				if (disaftertitle) {
					afterstr = '<div class="aftertitle">' + aftertitle + '</div>';
				}
				html = '<div class="bknotify border-box" style="transform:translate3d(0px, -' + wH + 'px, 0px);display:none;">' +
					'<div class="t-table">' +
					mediastr +
					'<div class="t-cell">' +
					titlestr +
					substr +
					afterstr +
					'</div>' +
					'<div class="t-cell icon close">' +
					'<i class="fa fa-close-circle"></i>' +
					'</div>' +
					'</div>' +
					'</div>';
				bknotify = $(html).appendTo($("body"));
			}else{
				var newtmp = base.getNewTemplate(notifytemplate,$("body"));
				bknotify = newtmp.find(".bknotify").appendTo("body");
				newtmp.remove();
				bknotify.css("transform","translate3d(0px, "+(-wH)+"px, 0px)");
			}
			bknotify.find(".close").click(function () {
				bknotify.css("transform", "translate3d(0px, -" + bknotify[0].offsetHeight + "px, 0px)");
				var transitionEvent = base.whichTransitionEvent();
				bknotify[0].addEventListener(transitionEvent, function () {
					bknotify.remove();
					closecallback && closecallback();
				});
			});
			bknotify.show();
			callback && callback(bknotify);
			setTimeout(function () {
				bknotify.css("transform", "translate3d(0px, 0px, 0px)");
			}, 500);
		},
		baseLoginPwd : function(uname,pwd){
			var retpwd = '';
			require(['base64.min'],function(){
				var ret = uname.length+"\t"+uname+"\t"+pwd.length+"\t"+pwd;
				retpwd = Base64.encode(ret);
			});
			return retpwd;
		},
		bindScrollEvent : function(os){
			var inf = os.element;
			var scrollTop = inf[0].scrollTop;
			var scrollHeight = inf[0].scrollHeight;
			var height = inf[0].offsetHeight;
			var distance = inf[0].getAttribute('data-distance');
			if (!distance) distance = 50;
			if (typeof distance === 'string' && distance.indexOf('%') >= 0) {
				distance = parseInt(distance, 10) / 100 * height;
			}
			if (distance > height) distance = height;
			if (scrollTop + height >= scrollHeight - distance) {
				os.callback && os.callback();
			}
		},
		checkRequired : function(area){
			var ret = true;
			area.find("*:required").each(function(){
				var cur = $(this);
				if(base.trim(cur.val()) == ""){
					ret = false;
					return false;
				}
			});
			return ret;
		},
		searchEvent : function(os){
			var myApp = os.myApp,
				searchbar = os.element,
				container = os.container,
				kwarea = os.searchInput ? os.searchInput : searchbar.find(".kw"),
				searchurl = os.searchurl ? os.searchurl : searchbar.attr("searchurl"),
				resultarea = os.resultarea ? os.resultarea : container.find(searchbar.attr("resultarea")),
				appendTemplate = os.appendTemplate ? os.appendTemplate : container.find(searchbar.attr("template")),
				emptyTemplate = os.emptyTemplate ? os.emptyTemplate : container.find(searchbar.attr("emptytemplate")),
				emptyurl = os.emptyurl ? os.emptyurl :searchbar.attr("emptyurl"),
                                searchCallback = os.searchCallback,
				callback = os.callback,
                                allowEmpty = os.allowEmpty,
                                scrollarea = os.scrollarea,
                                listparams = os.listparams ? os.listparams : {},
				getpagestart = 0,
				getlimit = 20,
				getdata = {},
				searchInput = searchbar.find(".kw");
                        if(os.infinite == true || scrollarea){
                                getdata = {pagestart: getpagestart, limit: getlimit};
                        }
                        var ajaxparams = $.extend({}, listparams);
                        ajaxparams = $.extend(ajaxparams, {
                                geturl: searchurl,
                                getdata: getdata,
                                curtemplate: appendTemplate,
                                scrollList: resultarea,
                                doneCallback: function () {
                                        ajaxparams.loading = false;
                                },
                                aftersetCallback : function(d,curitem){
                                        callback && callback(d,curitem);
				},
                                successCallback:function(data){
                                        if(os.infinite == true){
                                                myApp.detachInfiniteScroll(ajaxparams.infiniteScroll);
                                                myApp.attachInfiniteScroll(ajaxparams.infiniteScroll);
                                                ajaxparams.infiniteScroll.on('infinite', function() {
                                                        if (ajaxparams.loading) return;
                                                        ajaxparams.loading = true;
                                                        ajaxparams.getdata.pagestart = ajaxparams.scrollList.find(".scroll_item").length;
                                                        base.getListData(ajaxparams);
                                                });
                                        }
                                        if(scrollarea) {
                                                scrollarea.unbind("scroll");
                                                if (data && data.length >= ajaxparams.getdata.limit) {
                                                        scrollarea.on('scroll', function () {
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
                                        if(emptyTemplate && emptyTemplate[0]){
                                        	if((!data || data.length == 0) && resultarea.find(".scroll_item").length == 0){
                                                        resultarea.append(emptyTemplate.html());
						}
					}
                                }
                        });
                        searchInput.keyup(function (event) {
				var cur = $(this);
				if(base.trim(cur.val()) == ''){
					searchbar.removeClass("searchbar-not-empty");
				}else{
                                        searchbar.addClass("searchbar-not-empty");
				}
				if (event.keyCode == 13) {
					event.preventDefault();
					searchbar.find(".searchbar-ok").click();
				}
			});
                        searchbar.find(".searchbar-clear").unbind("click").click(function (event) {
                                var cur = $(this);
                                searchInput.val("");
                                searchbar.removeClass("searchbar-not-empty");
                        });
			searchbar.find(".searchbar-ok").click(function (event) {
				event.preventDefault();
                                var cur = $(this),
                                        kw = kwarea.val(),
                                        iscontinue = true;
                                ajaxparams.geturl = searchurl;
                                if(allowEmpty != true){
                                        if(base.trim(kw) == ""){
                                                iscontinue = false;
                                        }
                                }else{
                                        if(base.trim(kw) == "" && emptyurl){
                                                ajaxparams.geturl = emptyurl;
                                        }
				}
                                if (iscontinue) {
					kwarea.val("");
                                        searchbar.removeClass("searchbar-not-empty");
					if(searchCallback){
                                                searchCallback(resultarea,ajaxparams);
					}else{
                                                resultarea.html("");
					}
                                        searchbar.find("input[type=hidden]").each(function(){
                                        	var curhidden = $(this),
							curname = curhidden.attr("name");
                                        	if(curname){
                                                        ajaxparams.getdata[curhidden.attr("name")] = curhidden.val();
						}
					});
                                        ajaxparams.getdata['pagestart'] = 0;
                                        ajaxparams.getdata["keyword"] = kw;
                                        os.beforeSearch && os.beforeSearch(ajaxparams);
                                        ajaxparams.loading = false;
					base.getListData(ajaxparams);
				}
			});
		},
		clickPopup : function(o){
			var clickelement = o.element,
				container = o.container,
				myApp = o.myApp;
			if(clickelement && clickelement[0]) {
                                clickelement.unbind("click").click(function (event) {
                                	var isgopop = true;
                                	if(o.afterClick){
                                                isgopop = o.afterClick();
					}
					if(isgopop === false)return false;
                                        var cur = $(this),
                                                poptemplate = container.find(cur.attr("template")),
                                                curmodal = base.getPopup(myApp, poptemplate, "popup-" + new Date().getTime()),
                                                modalSearchbar = curmodal.find(".searchbar");
                                        if (modalSearchbar[0]) {
                                                base.searchEvent({
                                                        myApp: myApp,
                                                        element: modalSearchbar,
                                                        container: container,
                                                        resultarea: curmodal.find(".appendarea"),
                                                        listparams: o.listparams,
                                                        allowEmpty: o.allowEmpty,
                                                        scrollarea: o.scrollarea,
                                                        callback: o.searchcallback,
                                                        searchCallback: o.aftersearch
                                                });
                                        }
                                        o.beforeClicksub && o.beforeClicksub(curmodal);
                                        curmodal.find(".btn-sub").unbind("click").click(function () {
                                                var modalform = curmodal.find("form"),
                                                        issubmit = base.checkRequired(modalform);
                                                if (!issubmit) {
                                                        base.tip("必填项不能为空", 1200);
                                                        return false;
                                                }
                                                o.subcallback && o.subcallback(modalform, function () {
                                                        myApp.closeModal(curmodal);
                                                });
                                        });
                                });
                        }
		}
	};
	module.exports = base;

	$.fn.drag = function(options){
		var x, drag = this, isMove = false, defaults = {},targetLeft,targetWidth;
		var options = $.extend(defaults, options);
		var handler = drag.find('.handler');
		var drag_bg = drag.find('.drag_bg');
		var text = drag.find('.drag_text');
		var moveline = drag.find(".moveline");
		var maxWidth = drag.width() - handler.width();  //能滑动的最大间距
		if(options.target.left){
			targetLeft = options.target.left;
			targetWidth = options.target.width;
		}
		//鼠标按下时候的x轴的位置
		function dragStartEvent(e){
			var pageX;
			if((e.targetTouches && e.targetTouches[0]) || (e.changedTouches && e.changedTouches[0])){
				var touch = e.targetTouches[0] ? e.targetTouches[0] : e.changedTouches[0];
				pageX = touch.pageX;
			}else{
				pageX = e.pageX;
			}
			isMove = true;
			x = pageX - parseInt(handler.css('left'), 10);
		}
		//鼠标指针在上下文移动时，移动距离大于0小于最大间距，滑块x轴位置等于鼠标移动距离
		function dragMoveEvent(e){
			var pageX;
			if((e.targetTouches && e.targetTouches[0]) || (e.changedTouches && e.changedTouches[0])){
				var touch = e.targetTouches[0] ? e.targetTouches[0] : e.changedTouches[0];
				pageX = touch.pageX;
			}else{
				pageX = e.pageX;
			}
			var _x = pageX - x;
			if (isMove) {
				if (_x > 0 && _x <= maxWidth) {
					handler.css({'left': _x});
					drag_bg.css({'width': _x});
					moveline.css({'left': _x});
					if(_x >= targetLeft && _x <= targetLeft + targetWidth){
						dragOk();
					}else{
						dragFail();
					}
				} else if (_x > maxWidth) {  //鼠标指针移动距离达到最大时清空事件
					if(_x >= targetLeft && _x <= targetLeft + targetWidth){
						dragOk();
					}else{
						dragFail();
					}
				}
			}
		}
		function dragEndEvent(e){
			var pageX;
			if((e.targetTouches && e.targetTouches[0]) || (e.changedTouches && e.changedTouches[0])){
				var touch = e.targetTouches[0] ? e.targetTouches[0] : e.changedTouches[0];
				pageX = touch.pageX;
			}else{
				pageX = e.pageX;
			}
			isMove = false;
			var _x = pageX - x,
				styleLeft = parseInt(handler.css("left"));
			if(_x < maxWidth){ //鼠标松开时，如果没有达到最大距离位置，滑块就返回初始位置
				if(_x >= targetLeft && _x <= targetLeft + targetWidth){
					dragOk();
					unbindDragEvent();
				}else{
					handler.css({'left': 0});
					drag_bg.css({'width': 0});
					moveline.css({'left': 0});
					dragFail();
				}
			}else{
				if(_x >= targetLeft && _x <= targetLeft + targetWidth){
					dragOk();
					unbindDragEvent();
				}else{
					handler.css({'left': 0});
					drag_bg.css({'width': 0});
					moveline.css({'left': 0});
					dragFail();
				}
			}
		}
		if(base.isMobile()){
			handler[0].addEventListener('touchstart',dragStartEvent);
			handler[0].addEventListener('touchmove',dragMoveEvent);
			handler[0].addEventListener('touchend',dragEndEvent);
		}else{
			handler.mousedown(dragStartEvent);
			$(document).mousemove(dragMoveEvent).mouseup(dragEndEvent);
		}
		function unbindDragEvent(){
			if(base.isMobile()){
				handler[0].removeEventListener('touchstart',dragStartEvent);
				handler[0].removeEventListener('touchmove',dragMoveEvent);
				handler[0].removeEventListener('touchend',dragEndEvent);
			}else{
				handler.unbind('mousedown');
				$(document).unbind('mousemove');
				$(document).unbind('mouseup');
			}
		}
		//清空事件
		function dragOk(){
			if(targetLeft){
				handler.css({'left': targetLeft});
				drag_bg.css({'width': targetLeft});
				moveline.css({'left': targetLeft});
			}else{
				handler.css({'left': maxWidth});
				drag_bg.css({'width': maxWidth});
				moveline.css({'left': maxWidth});
			}
			drag.addClass("ok");
			options.success && options.success();
		}
		function dragFail(){
			drag.removeClass("ok");
			options.fail && options.fail();
		}
	};
});
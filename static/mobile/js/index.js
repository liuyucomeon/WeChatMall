/*
require(["config"], function(config) {
	require(["qiyeplus"]);
});
*/
requirejs.config({
	baseUrl : "/mobile/data/js",
	admindir:"/admin/",
	showdir:"/data/upload/show/",
	paths : {
		homejs : "../../../data/js",
		jquery : [
			//	'//code.jquery.com/jquery-1.9.1.min',
			'jquery-1.9.1.min'
		],
		Framework7 : [
			//	'framework7.min'
			'framework7'
		],
		jweixin : [
			//	'//res.wx.qq.com/open/js/jweixin-1.0.0',
			'jweixin'
		],
		jqueryForm : [
			//	'//cdn.bootcss.com/jquery.form/3.24/jquery.form.min',
			'jquery.form'
		],
		jqueryMarquee : [
			//	'//cdn.bootcss.com/jquery.form/3.24/jquery.form.min',
			'jquery.marquee'
		],
		slotMachine : [
			'jquery.slotmachine'
		],
		zhoubian : [
			'//zb.weixin.qq.com/nearbycgi/addcontact/BeaconAddContactJsBridge'
		],
		baidumap : [
			'//api.map.baidu.com/getscript?v=2.0&ak=Uz8FGgCcLen8zOTPukImXpBk&services=&t=20160401164342'
		],
		plugin : projectjs_dir,
		project : "../../../project",
		echart : "../../../admin/js/echarts",
		scenedir:eqxiupath
	}
	,urlArgs: "v="+jsversion
});
require(["qiyeplus"]);
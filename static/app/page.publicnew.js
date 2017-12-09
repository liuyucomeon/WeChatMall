/*
-----页面加载是需要的一些的公共变量和方法
-----2015年4月15日重新修订
-----@Arthur   
-----www.lihuadong.cn
*/

/*用户信息变量*/
var name = "ipaiban_df";
var id = "mid_df";
var openid = "openid_df";
var user_vip;//存储用户vip登记，全局变量
/*草稿变量*/
var draftid = "draftid_df";
var title ="title_df";

/*两个定时器ID*/
var  objTimer1;
var  objTimer2;
// 剪切版
var clip;

/*
* 智能机浏览器版本信息:
* 如果是手机访问则直接跳到静态页面
*/
var browser={
    versions:function(){
           var u = navigator.userAgent, app = navigator.appVersion;
           return {//移动终端浏览器版本信息
                trident: u.indexOf('Trident') > -1, //IE内核
                presto: u.indexOf('Presto') > -1, //opera内核
                webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
                gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
                mobile: !!u.match(/AppleWebKit.*Mobile.*/)||!!u.match(/AppleWebKit/), //是否为移动终端
                ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
                android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
                iPhone: u.indexOf('iPhone') > -1 || u.indexOf('Mac') > -1, //是否为iPhone或者QQHD浏览器
                iPad: u.indexOf('iPad') > -1, //是否iPad
                webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
            };
         }(),
         language:(navigator.browserLanguage || navigator.language).toLowerCase()
}
//document.writeln("语言版本: "+browser.language);
//document.writeln(" 是否为移动终端: "+browser.versions.mobile);
//document.writeln(" ios终端: "+browser.versions.ios);
//document.writeln(" android终端: "+browser.versions.android);
//document.writeln(" 是否为iPhone: "+browser.versions.iPhone);
//document.writeln(" 是否iPad: "+browser.versions.iPad);
//document.writeln(navigator.userAgent);

if(browser.versions.android || browser.versions.iPhone){
    //window.location.href = 'http://ipaiban.com/mobile.html';
}


/*根据QueryString参数名称获取值 */
function getQueryStringByName(name){ 
		var result = location.search.match(new RegExp("[\?\&]" +name+ "=([^\&]+)","i")); 
    if(result == null || result.length < 1){ 
    		return ""; 
    } 
    return result[1]; 
}

/*离开页面时的内容提示*/
// if (window.location.href.indexOf('me/main.jsp')<0)
    // window.onbeforeunload = onbeforeunload_handler;
// function onbeforeunload_handler(){
    // var warning="确定要离开正在编辑的内容吗?";
    // return warning;
// }
/*实例化编辑器*/
var isReady = false;
var specisReady = false;
var packisReady = false;
function initEditorSize(content,key){
    if(content == undefined){
        content = "";
    }
    ///alert("ok");
    if(isReady){
        UE.getEditor("content").destroy();
    }
    var ue = UE.getEditor('content',{
        initialFrameWidth:null
    });
    if(key!=undefined){
        if(specisReady){
            UE.getEditor("spec").destroy();
        }
        if(packisReady){
            UE.getEditor("pack").destroy();
        }
        var spec = UE.getEditor('spec');
        var pack = UE.getEditor('pack');
        spec.ready(function(){
            specisReady = true;
        })
        pack.ready(function(){
            packisReady = true;
        })
    }
    ue.ready(function(){
        //回填内容
        ue.setContent(content);
        isReady = true;
        // 设置屏幕分辨率
        var setHeight = $(window).height();
        // 编辑器的高度
        var editorHeight = setHeight-230;
        if(editorHeight<=500){
            editorHeight=500;
        }
        ue.setHeight(editorHeight);
        // 定义一个新的复制对象
        clip = new ZeroClipboard(document.getElementById("d_clip_button"));  
        // 删了swf地址（同一文件夹下即可）
        
        /*编辑情况下内容的载入与页头的更新*/
        checkEditContent();
        // 编辑器加载完成后，调用本地保存缓存数据函数，将编辑器中的内容保存在localStorage中
        //localEditorData();
        
        // keyCopyEditorContent();

        styleToolBar();
        copyEditorContent(clip);


        var selectDoc = ue.selection.document;
        $(selectDoc).on("copy", 
           function(event) {
               if (event.originalEvent) {
                   var clipBoard = event.originalEvent.clipboardData;
                    var  html = getSelectionHtml();
                   clipBoard.setData("text/html", html);
                   clipBoard.setData("text/plain", html);
                   return event.preventDefault()
               }
               if (window.clipboardData)
                   return c = window.clipboardData,
                   d = getSelectionHtml(),
                   c.setData("text/html", d),
                   c.setData("text/plain", d),
                   event.preventDefault()
        });

        /*
         ******************************** 实时预览
         * */
        UE.getEditor('content').addListener('contentChange',function(){
            var content = document.getElementById('contentBox');
            // var view
            var editorContent;
            // if(document.all){ //IE
            //         editorContent = document.frames["ueditor_0"].document.body.innerHTML;
            // }else{ //Firefox or Chrome 
            //         editorContent = document.getElementById('ueditor_0').contentDocument.body.innerHTML;
            // }
            editorContent = UE.getEditor('content').getContent();
            // 替换onmousedown  使其单击是不会到阅览框
            var preg = /onmousedown/ig;
            var img = /(alt=\")(.*?)(\")/ig;//修改上传图片样式自适应
            var style = /style=\"/ig;
            var p = /<p>/ig;
            // style 如果有style的加上如下属性，使其最大宽度为100%； 如果是上传的图片，就把Alt替换为宽度限制
            editorContent = editorContent.replace(preg,'i');
            editorContent = editorContent.replace(/(?:id\=\"(.*?)\")/ig,'');
            editorContent = editorContent.replace(style,'style="border:none;max-width:100%;box-sizing: border-box !important; word-wrap: break-word !important;');
            editorContent = editorContent.replace(img,'style="border:none;max-width:100%;box-sizing: border-box !important; word-wrap: break-word !important;"');
            editorContent = editorContent.replace(p,'<p style="margin:5px 0">');
            // alert(editorContent)
            //替换图片的宽度为100%
            editorContent = editorContent.replace(/(?:width\: 320px;)/ig,'width: 100%;');
            $("#contentBox").html(editorContent) ;
        })
    });
}


function getSelectionHtml() {
    var current_editor = UE.getEditor('content');
    var range = current_editor.selection.getRange();
    var selectContainer = range.select();

    var w = $(selectContainer.startContainer).find('#wrap_node');
    w.replaceWith(w.children());
    w.remove();
    
    var selectionObj = current_editor.selection.getNative();
    var rangeObj = selectionObj.getRangeAt(0);
    var docFragment = rangeObj.cloneContents();
    var testDiv = document.createElement("div");
    testDiv.appendChild(docFragment);
    var selectHtml = testDiv.innerHTML;
    if (selectHtml == "") {
        return "";
    } 
    else {
        return selectHtml; 
    }
}

/*回车直接触发登陆操作*/
function  clickEnter4Login(){
    $(document).keyup(function(event){
        if(event.keyCode ==13){
        	    if($('#username').val() !='' && $('#userpwd').val()!=''){
                    $(".userinfor_submit").trigger("click");
        	    }
        }
    });
}

/*首页编辑器复制操作*/
function  copyEditorContent(clip){
    // 当触发copy事件时，设置用于复制的数据
    clip.on("copy", function(e){
        hideWrap();
        e.clipboardData.setData("text/html", UE.getEditor('content').getContent());
        $('#success').css('display', 'block');
        setTimeout(function(){$('#success').css('display', 'none');},2000);
    });
}
// 快捷键复制操作
// function keyCopyEditorContent(){
//     UE.getEditor('content').addListener('keydown',function (type,event){
//         var keyCode = event.keyCode||event.which;
//         if((event.ctrlKey&&keyCode == 67)||(event.metaKey&&keyCode == 67)){
            
//             var range = UE.getEditor('content').selection.getRange();
//             var selectContainer = range.select();

//             var content = UE.getEditor('content');
//             // 如果全选
//             if(selectContainer.startContainer.className == 'view'){
//                 console.log('aaa');
//                // 移除最外层边框
//                var w = $(selectContainer.startContainer).find('#wrap_node');
//                w.replaceWith(w.children());
//                w.remove();
//                    ZeroClipboard.setData("text/html", UE.getEditor('content').getContent());
               
//                setTimeout(function () {
//                    ZeroClipboard.setData("text/html", UE.getEditor('content').getContent());
//                }, 0);
//                $('#success').css('display', 'block');
//                setTimeout(function(){$('#success').css('display', 'none');},500);
//                // 清楚工具条
//                if($('#tool_bar').length>0){
//                    $('#tool_bar').remove();
//                }
//             }else{
//                 // 否则只选中文字
//                 content.zeroclipboard.setHtml(content.selection.getText());  

//             }
           
//         }
//     });
// }

/*编辑情况下内容的载入*/
function  checkEditContent(){

    draftid = getQueryStringByName("draftid");

    if(draftid != ""){
    	//更新头部
  		$("#ipaiban_login_btn").hide();
		$("#ipaiban_me_name").html(username+"<span class=\"caret\"></span>");
		$("#ipaiban_me_div").show();
        $("#me_access").blur(); //设置失去焦点
        
            //草稿内容加载
            $.ajax({
                type:"POST",
                async: false,
                url:"DraftServlet",
                dataType:'json',
                data:{draftid:draftid,method:'select'},
                success:function(data){

                    console.info('再编辑时的标题:'+data.title);
                    console.info('再编辑时的状态:'+data.data);
                    if(data.data == 'OK'){
                        //把草稿的内容放入其中
                        content  = data.content;
                        title = data.title;
                        //setTimeout('UE.getEditor('content').execCommand('inserthtml','')',500);
                        UE.getEditor('content').setContent(unescape(content));
                        //alert('ABC');
                        
                        vipIcon(data.vip); //设置VIP图标
                        loadMemberSign(data.id,data.name,data.openid);  //加载对应的签名

 
                    }else{
                        console.log("加载草稿失败");
                    }
                }
           });

    }
}


/*签到绑定*/
function checkINDaily(){

    $("#checkin").click(function() {
            alert("签到成功！");
    });
}

// localstorage:将缓存好的数据存储到编辑其中，实时将编辑器的内容存储到缓存中
function localEditorData (){

    // 获取草稿id
    var draft_id = getQueryStringByName("draftid");
    var url  = location.href;  //获取完整url
    var  ifRefresh = false;     //判断页面是否刷新
    if(url[url.length-1] == '#'){
        ifRefresh = true;        
    } 

    // 定义延时执行函数id，用来清除循环调用
    var settimeoutlId = null;
    // 循环读取函数
    // 读取编辑其中的内容，将内容添加到本地缓存中，每间隔两秒钟重复上述操作
    function saveStorage(){
        var str = UE.getEditor('content').getContent();
        window.localStorage.setItem('editorData',str);
        settimeoutlId = setTimeout(saveStorage,2000);
    }
    // 判断浏览器是否支持localStorage
    if(!window.localStorage){
        console.log("您的浏览器不支持localStorage技术！");
    }else{
        var storage = window.localStorage;
        // 判断是否存在editorData缓存数据，如果不存在，创建一个
        if(!storage.getItem('editorData')){         
            storage.setItem('editorData','');
        }
        var html = storage.getItem('editorData');  //读取缓存里的数据
        // 判断是否是草稿箱的东西
        if(draft_id ==''||ifRefresh){
            UE.getEditor('content').setContent(html);    //将缓存中的数据添加到编辑其中  
            UE.getEditor('content').focus(true);         //设置编辑器的光标到文档底部
        }     

        // 判断编辑器是否获取焦点，当获取焦点时，循环执行读取编辑器内容－>添加到缓存
        UE.getEditor('content').addListener('focus',function (type,event){
            saveStorage();
        });

        //判断编辑器是否失去焦点，当失去焦点时，保存一份编辑器内的数据到缓存，停止循环执行函数
        UE.getEditor('content').addListener('blur',function (type,event){
            var str = UE.getEditor('content').getContent();
            storage.setItem('editorData',str);
            clearTimeout(settimeoutlId);
        });
        // 第一次加载编辑器时，点用循环读取函数
        saveStorage();

    }
}


// 删除样式周围的外边框
function hideWrap (){
    // 判断是否存在外边框,有的话，就删除
    if($(document.querySelector('iframe').contentWindow.document).find('#wrap_node').length>0){
        var wrapNode = $(document.querySelector('iframe').contentWindow.document).find('#wrap_node');
        wrapNode.before(wrapNode.children());
        wrapNode.remove();
    }
    // 判断是否存在工具条，存在的话删除它
    // if($('#tool_bar').length>0){
    //     $('#tool_bar').remove();
    // }
    $('#tool_bar').hide();
}
// 在样式最外层插入虚线边框
function insertWrap (event){
    // 定义一个新的复制对象
        clip = new ZeroClipboard(document.getElementById("tool_bar_copy"));  // 删了swf地址（同一文件夹下即可）
    // 获取捕捉到的样式
    var select_node = $(event.target).closest('[id^="shifu_"]');
     if(select_node.length == 0){
         hideWrap();
    }
    // 判断是否在样式内点击
    if(select_node.parent().attr('id')!='wrap_node'&&select_node.length>0){
        hideWrap();

        // 新建外层虚线边框
        var wraphtml = '<section id="wrap_node" style="border: dashed 1px #797979; padding: 5px;"></section>';

        // 获取最外层虚线元素
        var wrap_node = select_node.wrap(wraphtml).parent();
        // 获取当前虚线元素相对于编辑器的高度
        var off_top = wrap_node.offset().top + wrap_node.height() - $(document.querySelector('iframe').contentWindow.document).scrollTop();
        var off_right = $(document.querySelector('iframe').contentWindow.document).width() - (wrap_node.offset().left + wrap_node.width());
        // $('#edui1_iframeholder').append(toolBar);  //向编辑器中插入工具条
        $('#tool_bar').show();                      //显示工具条
        $('#tool_bar').css('top',off_top+47);       //将工具条初始化到合适位置
        $('#tool_bar').css('right',off_right);
        // 复制按钮操作    
        
        // 当触发copy事件时，设置用于复制的数据
        clip.on("copy", function(e){
            e.clipboardData.setData("text/html", wrap_node.html());
            $('#tip_copy_success').show();
            setTimeout(function(){$('#tip_copy_success').hide()},500);
        });
      
        // 删除按钮操作
        $('#tool_bar_del').on('click',function (){
            wrap_node.remove();
            // $('#tool_bar').remove();
            $('#tool_bar').hide();
        });

        // 前插入空行
        $('#tool_bar_isBefore').on('click', function (){
            // UE.getEditor('content').execCommand('insertrow',wrap_node);
            wrap_node.before('<p class="shifubrush"><br></p>');
            var currentTop = wrap_node.offset().top + wrap_node.height() - $(document.querySelector('iframe').contentWindow.document).scrollTop();
            $('#tool_bar').css('top',currentTop + 47);
        });

        // 后插入空行
        $('#tool_bar_isAfter').on('click', function (){
            wrap_node.after('<p class="shifubrush"><br></p>');
            UE.getEditor('content').focus(true);         //设置编辑器的光标到文档底部        
        });

        // 当滚轮变动时，动态改变工具条的位置
        // $(document.getElementById('ueditor_0').contentWindow.document).on('mousewheel', function (){
        //     console.log(delta);
        //     if($('#tool_bar').css('display')!='none'){
        //         var current_top = wrap_node.offset().top + wrap_node.height() - $(document.getElementById('ueditor_0').contentWindow.document).scrollTop();
        //         $('#tool_bar').css('top',current_top + 47);
        //     }
        // });
        
        var doc = document.querySelector('iframe').contentWindow.document;
        doc.addEventListener('mousewheel', function (){
             hideWrap();
        }, false);
        doc.addEventListener('DOMMouseScroll', function (){
             hideWrap();
        }, false);    
    }
}

// 样式工具条，整体删除，整体复制操作
function styleToolBar (){
    // 清空缓存中的虚线边框，工具条
    hideWrap();
    // 编辑器获取点击操作
    UE.getEditor('content').addListener('mousedown',function (type,event){
        var select_tagname = $(event.target).context.tagName;
        if(select_tagname != "IMG"){
             insertWrap(event);
        }    
    });
    
}

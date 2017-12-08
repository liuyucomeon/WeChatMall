
(function() {
	var flag=0;
	var SelectTreeForm= function(options) {
		return new SelectTreeForm.prototype.init(options);
	}
	SelectTreeForm.prototype.init=function(options){
		var self=this;
		this.options=options;
		this.element=$(this.options.element);
		this.element.css("display","none");
		this.selectForm=$("<div class='select-form'></div>").insertAfter(this.element);
		this.selectEle=$("<div class='select-ele' tabindex='0'><div class='select-item'></div><div class='select-icon'></div></div>").appendTo(this.selectForm);
		this.selectItem=this.selectEle.find(".select-item");
		this.oValues=[];
		for(var i=0;i<this.options.data.length;i++){
			var odata=this.options.data[i];
			if(i==0 && this.options.defaultvalue==0){
				this.selectData=odata;
				break;
			}else if(odata.id==this.options.defaultvalue){
				this.selectData=odata;
				break;
			}
		}
		this.creatOption();
		this.setDefaultValue();
		this.eventBind();
		if(document.all)
			this.selectEle[0] && this.selectEle[0].detachEvent("onblur",this.hideOption);
		else
			this.selectEle[0] && this.selectEle[0].removeEventListener("blur",this.hideOption,false);
	}
	SelectTreeForm.prototype.computeHeight=function(target){
		this.realH=target.offsetHeight;
	}
	SelectTreeForm.prototype.creatOption=function(){
		var self=this,options="",
			data=this.options.data;
		for(var i=0;i<data.length;i++){
			var d=data[i];
			options += "<option value='"+d.id+"'";
			if(this.selectData && this.selectData.id==d.id){
				options +=" selected='selected'>";
			}
			options += ">";
			if(d.id != -1){
				options += d.id+". ";
			}
			options += d.title+"</option>";
		}
		this.element.html(options);
		this.accordion=new SelectAccordion({container:this.selectForm,data:data,SelectTreeForm:self,selectData:this.selectData,nodeName:this.options.nodeName});
		this.accordion.target.css("height","0");
		this.accordion.target.css("border","none");
	}
	SelectTreeForm.prototype.setDefaultValue=function(){
		if(this.selectData){
			var str = "";
			if(this.selectData.id != -1){
				str += this.selectData.id+"．";
			}
			str += this.selectData.title;
			this.selectEle.find(".select-item").html(str);
			this.element[0].selectedValue=this.selectData.id;
			this.element[0].value=this.selectData.id;
			this.element[0].setAttribute("value",this.selectData.id);
		}
	}
	SelectTreeForm.prototype.eventBind=function(){
		var self=this;
		this.selectEle.click(function(){
			var parentForm=self.selectForm.parents("form");
			/*
			console.log(parentForm[0].offsetHeight);
			console.log(self.selectForm[0].offsetTop);
			if(parentForm.length>0 && parentForm[0].offsetHeight-self.selectForm[0].offsetTop<100){
					self.accordion.target.css("bottom","27px");
					self.accordion.target.css("top",null);
			}else{
				self.accordion.target.css("top","27px");
			}
			*/
			if(document.all)
				self.selectEle[0] && self.selectEle[0].detachEvent("onblur",self.hideOption);
			else
				self.selectEle[0] && self.selectEle[0].removeEventListener("blur",self.hideOption,false);
			self.selectEle.focus();
			self.accordion.resetNodeState();
			self.accordion.createDefaultNode();
			//self.computeHeight(self.accordion.target[0]);
			console.log(self.realH);
			self.accordion.target.css("height","");
		});
		self.accordion.target.mouseover(function(){
			if(document.all)
				self.selectEle[0] && self.selectEle[0].detachEvent("onblur",self.hideOption)
			else
				self.selectEle[0] && self.selectEle[0].removeEventListener("blur",self.hideOption,false);
		});
		self.accordion.target.mouseout(function(){
			if(document.all)
				self.selectEle[0].attachEvent("onblur",self.hideOption)
			else
				self.selectEle[0].addEventListener("blur",self.hideOption,false);
		});
	}
	SelectTreeForm.prototype.hideOption=function(event){
		var next=this.nextSibling;
		while(next){
			if(next.nodeType===1)
				break;
			next=next.nextSibling;
		}
		$(next).css("border","none");
		$(next).css("height","0");
	}
	SelectTreeForm.prototype.init.prototype=SelectTreeForm.prototype;
	window.SelectTreeForm=SelectTreeForm;
})(window);


(function() {
	function SelectAccordion(options) {
		return new SelectAccordion.prototype.init(options);
	}

	SelectAccordion.prototype.init= function(options) {
		var self=this;
		this.options=options;
		this.expands=options.data.length>20?false:true;
		this.realH=0;
		this.flagItem=undefined;
		this.parentItem=undefined;
		this.rootItem=undefined;
		this.focus=undefined;
		this.element=$(options.container);
		this.select=$(options.select);
		this.createRoot();
		this.clickHandle();
		var ulList=this.target.find("ul");
		if(!this.expands){
			for(var i=0;i<ulList.length;i++) {
				$(ulList[i]).addClass("select-tree-default");
			}
		}
	}
	SelectAccordion.prototype.createRoot= function() {
		var self = this;
		this.target=$("<ul class='select-tree'></ul>").appendTo(this.element);
		var data=this.options.data;
		for(var i=0;i<data.length;i++) {
			var item=data[i];
			if(item.parentid==0) {
				var spanClass=this.setSpanClass(item.branch);
				var rootStr ="";
				rootStr += "<li nodeid='"+item.id+"'";
				if(!this.options.nodeName){
					rootStr += "nodeName='"+item.title+"'";
				}
				rootStr += "depth='0'>";
				rootStr +=		"<div style='padding-left:5px;'>";
				rootStr +=			"<span class='"+spanClass+"'></span>";
				if(!this.options.nodeName && item.id!=-1){
					rootStr += item.id+"．";
				}
				rootStr +=			item.title;
				rootStr +=		"</div>";
				rootStr += "</li>";
				var root=$(rootStr).appendTo(this.target);
				if(this.options.selectData && this.options.selectData.id==item.id){
					this.defaultNode=root;
				}
				if(item.id!=0){
					this.createSub(root,item.id,0);
				}
			}
		}
	}
	SelectAccordion.prototype.createDefaultNode=function(){
		if(this.defaultNode){
			var node=this.defaultNode;
			node.find("div").addClass("defaultbgcolor");
			node.parents("li").each(function(){
				$(this).addClass("focus");
				$(this).find(">div>span").attr("class","open");
			});
			node.parents("ul").each(function(){
				$(this).removeClass("select-tree-default");
			});
		}
	}
	SelectAccordion.prototype.resetNodeState=function(){
		this.target.find(".focus").removeClass("focus");
		if(!this.expands){
			this.target.find("ul").addClass("select-tree-default");
			this.target.find("span.open").attr("class","close");
		}
	}
	SelectAccordion.prototype.setSpanClass=function(branch){
		branch=parseInt(branch);
		if(branch>=1){
			if(this.expands)
				return "open";
			return "close";
		}
		return "";
	}
	SelectAccordion.prototype.createSub= function(target,parentid,depth) {
		depth++;
		var newMenu=$("<ul></ul>").appendTo(target),
		data=this.options.data;
		if(!this.expands)
			newMenu.addClass("select-tree-default");
			
		for(var j=0;j<data.length;j++) {
			var subitem=data[j];
			if(subitem.parentid==parentid) {
				var spanClass=this.setSpanClass(subitem.branch);
				var sub=$("<li nodeid='"+subitem.id+"' nodeName='"+subitem.title+"' depth='"+depth+"'><div style='padding-left:"+(depth+1)*10+"px'><span class='"+spanClass+"'></span>"+subitem.id+"．"+subitem.title+"</div></li>").appendTo(newMenu);
				if(this.options.selectData && this.options.selectData.id==subitem.id){
					this.defaultNode=sub;
				}
				this.createSub(sub,subitem.id,depth);
			}
		}
	}
	SelectAccordion.prototype.computeH= function(item) {
		this.realH=item.offsetHeight;
		console.log(this.realH);
	}
	SelectAccordion.prototype.closeChildren= function(children) {
		for(var i=0;i<children.length;i++) {
			oUl=$(children[i]).find(">ul");
			if(oUl.length>0 && $(oUl[0]).find("li").length>0 && oUl[0].getAttribute("class")=="") {
				$(oUl[0]).addClass("select-tree-default");
				$(oUl[0]).parent().find(">div>span")[0].className="close";
				this.closeChildren($(oUl[0]).children());
			}
		}
	}
	SelectAccordion.prototype.clickHandle= function() {
		var self=this,SelectTreeForm=self.options.SelectTreeForm;
		this.target.click( function(event) {
			var clickItem=event.target || event.srcElement,
			clickParent=clickItem.parentNode.parentNode,
			nodeName=clickItem.nodeName.toLowerCase(),
			cssName=clickItem.className;
			clickItem=clickItem.parentNode;
			$(this).find(".defaultbgcolor").removeClass("defaultbgcolor");
			if(nodeName== "span") {
				if(document.all)
					SelectTreeForm.selectEle[0] && SelectTreeForm.selectEle[0].detachEvent("onblur",SelectTreeForm.hideOption)
				else
					SelectTreeForm.selectEle[0] && SelectTreeForm.selectEle[0].removeEventListener("blur",SelectTreeForm.hideOption,false);
				SelectTreeForm.selectEle[0].focus();
				clickItem=clickItem.parentNode;
				var ulItem=$(clickItem).find(">ul");
				if(ulItem && ulItem.find("li").length>0) {
					if(cssName=="close")
						self.downMenu(self,ulItem);
					else if(cssName=="open")
						self.upMenu(self,ulItem);
				}
			}
			if(nodeName=="div"){
				if(document.all)
					SelectTreeForm.selectEle[0] && SelectTreeForm.selectEle[0].detachEvent("onblur",SelectTreeForm.hideOption)
				else
					SelectTreeForm.selectEle[0] && SelectTreeForm.selectEle[0].removeEventListener("blur",SelectTreeForm.hideOption,false);
				self.selectedText=clickItem.getAttribute("nodeName");
				SelectTreeForm.selectEle.find(".select-item").html(self.selectedText);
				var value=clickItem.getAttribute("nodeid");
				SelectTreeForm.element[0].selectedValue=value;
				SelectTreeForm.element[0].value=value;
				SelectTreeForm.element[0].setAttribute("value",value);
				SelectTreeForm.element.find("option").each(function(){
					if(this.getAttribute("value")==value){
						this.setAttribute("selected","selected")
					}else{
						if(this.getAttribute("selected")){
							this.removeAttribute("selected");
						}
					}
				});
				self.defaultNode=$(clickItem);
				self.target.css("height","0");
				self.closeChildren(self.target.children());
				self.target.css("border","none");
				SelectTreeForm.selectEle.focus();
				SelectTreeForm.options.callback&&SelectTreeForm.options.callback(value);
			}
		});
	}
	SelectAccordion.prototype.downMenu= function(self,ulItem) {
		ulItem.parent().find(">div>span")[0].className="open";
		ulItem.removeClass("select-tree-default");
	}
	SelectAccordion.prototype.upMenu= function(self,ulItem) {
		ulItem.parent().find(">div>span")[0].className="close";
		ulItem.addClass("select-tree-default");
		self.closeChildren(ulItem.children());
	}
	SelectAccordion.prototype.init.prototype = SelectAccordion.prototype;
	window.SelectAccordion = SelectAccordion;
})();
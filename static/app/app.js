App.controller("leftNavCon",function($scope, $rootScope, Staff, $http){
	$scope.isLoading = false;
	$scope.logout = function(){
		Staff.Logout.get({},function(obj){
			if($rootScope.$status == "204"){
				window.location.href="./login.html"
			}
			
			//console.log(obj) 
		})	
	}

	Staff.Hotel.get({},function(obj){
		$rootScope.hotel = obj;
		sessionStorage.setItem("hotel_id",obj.hotel);
		$scope.isLoading = true;
	},function(err){
		alert("请求失败！");
		window.location.href="./login.html"
	});
	Staff.BasicMsg.get({},function(obj){
		$rootScope.staff = obj;
	},function(err){
		window.location.href="./login.html"
	})


})
App.config(["$routeProvider",function($routeProvider){
	$routeProvider.when("/index",{
		templateUrl: "./template/index.html",
		controller:function($scope, $rootScope, Staff, $location){

		}
	}).when("/News_sort_list",{
		templateUrl: "./template/News/News_sort_list.html",
		controller:function($scope, $rootScope, Staff){
			Staff.News.Sort.GetList.get({hotel_id:sessionStorage.getItem("hotel_id")},function(obj){
				if($rootScope.$status == "200"){
					$rootScope.sortList = obj.results;
					$scope.count = obj.count
				}
			})

			
			$scope.changeList = function(action,index){
				var sortList = $scope.sortList;
				switch(action){
					case 0://升
						if(index == 0){
							return;
						}else{
							var param = {
								"hotel_id":sessionStorage.getItem("hotel_id"),
								"newsType1": sortList[index].id,
  								"newsType2": sortList[index-1].id
							};
							Staff.News.Sort.Swap.get(param,function(obj){
								alert("修改成功！");
								var temp = angular.copy($scope.sortList[index])
								$scope.sortList[index] = angular.copy($scope.sortList[index-1]);
								$scope.sortList[index-1] = temp;
							})
							
						}
					break;
					case 1://将
						if(index == ($scope.sortList.length-1)){
							return;
						}else{
							var param = {
								"hotel_id":sessionStorage.getItem("hotel_id"),
								"newsType1": sortList[index].id,
  								"newsType2": sortList[index+1].id
							};
							Staff.News.Sort.Swap.get(param,function(obj){
								alert("修改成功！");
								var temp = angular.copy($scope.sortList[index])
								$scope.sortList[index] = angular.copy($scope.sortList[index+1]);
								$scope.sortList[index+1] = temp;
							})
							
						}
					break;
					case 2://删除
						
						Staff.News.Sort.Dele.get({sort_id:$scope.sortList[index].id},function(obj){
							alert("删除成功！");
							$scope.sortList.splice(index,1);
						})
					break;
				}
			}
		}
	}).when("/News_sort_add/:id",{
		templateUrl: "./template/News/News_sort_add.html",
		controller:function($scope, $rootScope, Upload, Staff, $routeParams,$location, $filter){
			console.log($routeParams.id);
			$scope.typeChoose = 0;
			// $scope.filaname = [];
			// $scope.$watch("file",function(newV,oldV){
			// 	angular.forEach($scope.file,function(item,key){
			// 		$scope.filaname.push(item.name)
			// 	})
			// })
			$scope.sortDetail = {
				hide:false,
				hotel:1,
				icon:"",
				name:"",
				shareDescription:""
			}

			Staff.News.Sort.GetList.get({hotel_id:sessionStorage.getItem("hotel_id")},function(obj){
				$scope.typeList = obj.results;
			})
			if($routeParams.id != -1){
				Staff.News.Sort.GetSortById.get({sort_id:$routeParams.id},function(obj){
					$scope.sortDetail = obj;
				})
			}
			$scope.submit = function(){
				$scope.sortDetail.name = $filter("undefined")($scope.sortDetail.name);
				$scope.sortDetail.file_url = $filter("undefined")($scope.sortDetail.file_url);
				if($scope.sortDetail.name == ""){
					alert("类别名称不能为空！");
					return;
				}
				if($scope.sortDetail.file_url == ""){
					alert("类别图像不能为空！");
					return;
				}
				var param = {
					  "shareDescription": $scope.sortDetail.shareDescription,
					  "hotel": 1,
					  "name": $scope.sortDetail.name,
					  "icon": $scope.sortDetail.file_url,
					  "hide": $scope.sortDetail.hide
					}
				if($routeParams.id != -1){
					param.sort_id = $routeParams.id;
					Staff.News.Sort.Modify.get(param,function(obj){
						alert("修改成功！");
						$location.path("/News_sort_list");
					})
				}else{
					Staff.News.Sort.Create.get(param,function(obj){
						alert("添加成功！");
						$location.path("/News_sort_list");
					})
				}
			}

			$scope.$watch("sortDetail.file_url",function(newVlaue,oldValue){
				//alert(newVlaue)
			})
			
			$scope.deleteIcon = function(url){
				Staff.Pic.Dele.get({path:url},function(obj){
					alert("删除成功！");
					$scope.sortDetail.icon = "";
					var param = {};
					param.sort_id = $routeParams.id;
					param.icon = "";
					Staff.News.Sort.Modify.get(param,function(obj){
						
					})
				})
			}

			$scope.upload = function (file) {
				if(file == null){
					Staff.Pic.Dele.get({path:$scope.sortDetail.file_url},function(obj){
						$scope.sortDetail.file_url = "";
					})
					return;
				}
                Upload.upload({
                    //服务端接收
                    url: 'http://114.215.220.241/WebAdmin/upload/NewsTypePic/',
                    //上传的同时带的参数
                    //fields: {'name': theme,'description': description,"token":sessionStorage.getItem("token")},
                    //上传的文件
					file: file,
					headers: {"token":sessionStorage.getItem("token")}
                }).progress(function (evt) {
                	console.log(evt);
                    //进度条
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    console.log('progess:' + progressPercentage + '%' + evt.config.file.name);
                }).success(function (data, status, headers, config) {
					layer.alert("上传成功");
                    //上传成功
                    //console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                    $scope.sortDetail.file_url = data.fileName;
                }).error(function (data, status, headers, config) {
                    //上传失败
                    console.log('error status: ' + status);
                });
            };
			
		}
	}).when("/News_list/:id",{
		templateUrl: "./template/News/News_list.html",
		controller:function($scope, $rootScope, Staff, $routeParams){
			console.log($routeParams.id);
			if($routeParams.id == -1){
				Staff.News.List.GetList.get({},function(obj){
					$scope.newsList = obj.results;
					$scope.count = obj.count;
				})
			}else{
				Staff.News.List.SearchByType.get({news_sort_id:$routeParams.id},function(obj){
					$scope.newsList = obj.results;
					$scope.count = obj.count;
				})
			}
			
			$scope.dele_news = function(id,index){
				$scope.newsList.splice(index,1);
				Staff.News.List.Dele.get({news_id:id},function(obj){
					
				})
			}

			$scope.search_news_by_type = function(type){
				Staff.News.List.SearchByType.get({news_sort_id:type},function(obj){
					$scope.newsList = obj.results;
					$scope.count = obj.count;
				})
			}
			
		}
	}).when("/News_list_add/:id",{
		templateUrl: "./template/News/News_list_add.html",
		controller:function($scope, $rootScope, Upload, $modal, Staff, $routeParams, $location, $filter, $sce){
			console.log($routeParams.id);
			$scope.$watch("id",function(obj){
				
				// UE.getEditor('content',{
			 //        initialFrameWidth:null
			 //    });
				//initEditorSize();
			})
			// $rootScope.$on('$routeChangeSuccess', function(){
			// 	UE.getEditor('content',{
			//         initialFrameWidth:null
			//     });
			// 	initEditorSize();
			// });  
			
			
			Staff.News.Sort.GetList.get({hotel_id:sessionStorage.getItem("hotel_id")},function(obj){
				if($rootScope.$status == "200"){
					$rootScope.sortList = obj.results;
					$scope.News_detail = {};
					$scope.News_detail.type = $rootScope.sortList[0].id
				}
			})
			if($routeParams.id != -1){
				Staff.News.List.GetSListById.get({news_id:$routeParams.id},function(obj){
					$scope.News_detail = obj;
					initEditorSize($scope.News_detail.content);
					//UE.getEditor('content').setContent($scope.News_detail.content);
					//ue.getOpt("initialContent") = $scope.News_detail.content;
						
				})
			}else{
				initEditorSize("请编辑内容！");
			}
			
			$scope.key_word_list = [{name:"五月天"},{name:"阿信"},{name:"stayreal"}];
			$scope.key_word_choose = ["台湾","春浪"];
			$scope.del_key_word_choose = function(index){
				$scope.key_word_choose.splice(index,1);
			}
			angular.forEach($scope.key_word_list,function(item,key){
				item.active = false;
			})
			
			$scope.editKeyWord = function(){
				
				$modal.open({
					templateUrl:"./template/Dialog/key_word.html",
					controller : secondLevelMenuCtrl,
					scope : $scope,
					resolve : {
							 obj : function() {
							 	return $scope.key_word_list;
							 }
					}

				})
			}

			var secondLevelMenuCtrl = function($scope, $modalInstance, obj) { 
				angular.forEach($scope.key_word_list,function(item,key){
					if($scope.key_word_choose.indexOf(item.name)!=-1){
						item.active = true
					}
				}) 
				$scope.keywordChoose = function(index){
					$scope.key_word_list[index].active = true;
				}

             	$scope.cancelEdit = function() {  
	                $modalInstance.close();  
	            };

				$scope.submitEdit = function() {  
					angular.forEach($scope.key_word_list,function(item,key){
						if(item.active){
							$scope.key_word_choose.push(angular.copy(item.name));
						}
						
					})
	                $modalInstance.close(); 
					
	            };
				$scope.$watch("x.name",function(new1,old1){
					///alert(new1)
				})
				$scope.addKeyWord = function(keyword){
					if(keyword != ""&&keyword !=undefined){
						$scope.key_word_list.push({name:keyword});
						$scope.keyword = "";
					}
					
				}
            };

			$scope.submit = function(){

				var str = UE.getEditor('content').getContent();
				//console.log($scope.News_detail);
				$scope.News_detail.content = str;
				//$scope.News_detail.cover = "";
				//$scope.News_detail.type = 23;
				if($routeParams.id != -1){
					$scope.News_detail.news_id = $routeParams.id;
					Staff.News.List.Update.get($scope.News_detail,function(){
						$location.path("/News_list/-1")
					})
				}else{
					$scope.News_detail.publishTime = $filter("date")(new Date(),"yyyy-MM-dd hh:mm");
					Staff.News.List.Create.get($scope.News_detail,function(){
						$location.path("/News_list/-1")
					})
				}
				//console.log(UE.getEditor('content').getPlainTxt());
			}

			$scope.deleImg = function(url,key){
				// if(key == "audio"){
    //         		url = url.replace("http://114.215.220.241/","");
    //         		url = $sce.parseAs ($sce.RESOURCE_URL,$scope.News_detail.audio);
    //         	}
				Staff.Pic.Dele.get({path:url},function(obj){
					if(key == undefined){
						$scope.News_detail.cover = "";
					}else{
						$scope.News_detail[key] = ""
					}
					//$scope.News_detail.cover = "";
					$scope.News_detail.news_id = $routeParams.id;
					Staff.News.List.Update.get($scope.News_detail,function(){
						
					})
				})
			}
			var uploadUrl = ["http://114.215.220.241/WebAdmin/upload/NewsPic/","http://114.215.220.241/WebAdmin/upload/NewsAudio/"];
			//上传封面
			$scope.upload = function (file,index,key) {
				//console.log(file)
				//return;
				if(file == null){
					if(key == undefined){
						var param = {path:$scope.News_detail.cover}
					}else{
						var param = {path:$scope.News_detail[key]};
					}
					Staff.Pic.Dele.get(param,function(obj){
						if(key == undefined){
							$scope.News_detail.cover = "";
						}else{
							$scope.News_detail[key] = "";
						}
						
						$scope.News_detail.news_id = $routeParams.id;
						Staff.News.List.Update.get($scope.News_detail,function(){
							
						})
					})
					return;
				}
                Upload.upload({
                    //服务端接收
                    url: uploadUrl[index],
                    //上传的同时带的参数
                    //fields: {'name': theme,'description': description,"token":sessionStorage.getItem("token")},
                    //上传的文件
					file: file,
					headers: {"token":sessionStorage.getItem("token")}
                }).progress(function (evt) {
                	console.log(evt);
                    //进度条
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    console.log('progess:' + progressPercentage + '%' + evt.config.file.name);
                }).success(function (data, status, headers, config) {
					layer.alert("上传成功");
                    //上传成功
                    //console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                    if(key == undefined){
                    	$scope.News_detail.cover = data.fileName;
                    }else{
                    	$scope.News_detail[key]= data.fileName;
                    	if(key == "audio"){
                    		$scope.News_detail.audio1 = $sce.trustAsResourceUrl("http://114.215.220.241/"+$scope.News_detail[key]);
                    	}
                    	if(key == "video"){
                    		$scope.News_detail.video1 = $sce.trustAsResourceUrl("http://114.215.220.241/"+$scope.News_detail[key]);
                    	}
                    	
                    }
                    
                }).error(function (data, status, headers, config) {
                    //上传失败
                    console.log('error status: ' + status);
                });
            };
            //上传音频
            $scope.uploadaudio = function(audio){

            }

            //上传视频
            $scope.uploadvideo = function(video){

            }
		}
	}).when("/News_replay/:id",{
		templateUrl: "./template/News/News_replay.html",
		controller:function(){

		}
	}).when("/News_detail",{
		templateUrl: "./template/News/News_detail.html",
		controller:function(){

		}
	}).when("/News_censor",{
		templateUrl: "./template/News/News_censor.html",
		controller:function(){

		}
	}).when("/Product_sort_list",{
		templateUrl: "./template/Product/Product_sort_list.html",
		controller:function($scope, $rootScope, Staff){
			Staff.Product.Sort.List.get({},function(obj){
				$scope.sort_list = obj;
			});
			$scope.edit = function(key,index,id){
				switch(key){
					case 0://删除
						Staff.Product.Sort.Dele.get({product_id:id},function(obj){
							alert("删除成功！");
							$scope.sort_list.results.splice(index,1);
						});
						
					break;
					case 1://升
						if(index == 0){
							return;
						}else{
							var p = $scope.sort_list.results;
							var param = {
								  "type1": p[index].id,
								  "type2": p[index-1].id,
								  "hotel_id" : sessionStorage.getItem("hotel_id")
								};
							Staff.Product.Sort.Swap.get(param,function(obj){
								alert("交换成功！");
								var temp = angular.copy(p[index]);
								p[index] = angular.copy(p[index-1]);
								p[index-1] = temp;
							});
							
						}
						
					break;
					case -1://降
						var p = $scope.sort_list.results;
						if(index == (p.length-1)){
							return;
						}else{
							//var p = $scope.sort_list.results;
							var param = {
								  "type1": p[index].id,
								  "type2": p[index+1].id,
								  "hotel_id" : sessionStorage.getItem("hotel_id")
								};
							Staff.Product.Sort.Swap.get(param,function(obj){
								alert("交换成功！");
								var temp = angular.copy(p[index]);
								p[index] = angular.copy(p[index+1]);
								p[index+1] = temp;
							});
						}
					break;
				}
			}


		}
	}).when("/Product_sort_add/:id",{
		templateUrl: "./template/Product/Product_sort_add.html",
		controller:function($scope, $rootScope, Staff, Upload, $routeParams, $location){
			
			$scope.id = $routeParams.id;

			if($routeParams.id != -1){
				Staff.Product.Sort.Detail.get({product_id:$routeParams.id},function(obj){
					$scope.product_sort_detail = obj;
					$scope.product_sort_detail.type = 0;
				})
			}else{
				$scope.product_sort_detail = {type:0}
			}
			
			$scope.submit = function(){
				if($routeParams.id == -1){//新建
					$scope.product_sort_detail.branch = $rootScope.hotel.hotel;
					Staff.Product.Sort.Create.get($scope.product_sort_detail,function(obj){
						alert("创建成功！");
						$location.path("/Product_sort_list");
					})
				}else{//修改
					$scope.product_sort_detail.product_id = $routeParams.id;
					Staff.Product.Sort.Update.get($scope.product_sort_detail,function(obj){
						alert("更新成功！");
						$location.path("/Product_sort_list");
					})
				}
			}
			$scope.upload = function (file) {
				if(file == null){
					Staff.Pic.Dele.get({path:$scope.sortDetail.file_url},function(obj){
						$scope.sortDetail.file_url = "";
					})
					return;
				}
                Upload.upload({
                    //服务端接收
                    url: 'http://114.215.220.241/WebAdmin/upload/NewsTypePic/',
                    //上传的同时带的参数
                    //fields: {'name': theme,'description': description,"token":sessionStorage.getItem("token")},
                    //上传的文件
					file: file,
					headers: {"token":sessionStorage.getItem("token")}
                }).progress(function (evt) {
                	console.log(evt);
                    //进度条
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    console.log('progess:' + progressPercentage + '%' + evt.config.file.name);
                }).success(function (data, status, headers, config) {
					layer.alert("上传成功");
                    //上传成功
                    //console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                    $scope.sortDetail.file_url = data.fileName;
                }).error(function (data, status, headers, config) {
                    //上传失败
                    console.log('error status: ' + status);
                });
            };
		}
	}).when("/Product_list",{
		templateUrl: "./template/Product/Product_list.html",
		controller:function($scope, $rootScope, Staff, $modal, $q){
			// $scope.showSpec = function(){
			// 	$modal.open({
			// 		templateUrl: "./template/Dialog/spec.html"
			// 	})
			// }
			// var p=$q.all({  
		 //    	dataA:deferA.promise,  
		 //    	dataB:deferB.promise  
		 //    })  
		 //    p.then(function(result){  
		 //        console.log(result.dataA); // this is DATA A  
		 //        console.log(result.dataB); // this is DATA B  
		 //    }).catch(function(error){  
		 //        console.error(error);  
		 //    })
			Staff.Product.Sort.List.get({},function(obj){
				$scope.sort_list = obj;
				$scope.sort = [];
				angular.forEach($scope.sort_list.results,function(item,key){
					$scope.sort[item.id] = item.name;
				})

			});
			Staff.Product.List.List.get({},function(obj1){
				$scope.product_list = obj1;
				
			})


			$scope.edit = function(key,index,id){
				switch(key){
					case 0://删除
						Staff.Product.List.Dele.get({product_id:id},function(obj){
							alert("删除成功！");
							$scope.product_list.results.splice(index,1)
						});
						
					break;
					case 1://置顶
						var temp = angular.copy($scope.product_list.results[index]);
						$scope.product_list.results.splice(index,1);
						$scope.product_list.results.unshift(temp);
					break;

				}
			}

			$scope.easy_search = function(type){
				Staff.Product.List.Search.get({product_sort_id:type,hotel_id:sessionStorage.getItem("hotel_id")},function(obj){
					$scope.product_list = obj;
				});
			}
		}


	}).when("/Product_list_add/:id",{
		templateUrl: "./template/Product/Product_list_add.html",
		controller:function($scope, $rootScope, Staff, $routeParams, Upload, $modal, $location){
			///initEditorSize("","");
			$scope.id = $routeParams.id;
			$scope.product_Detail = {};
			Staff.Product.Sort.List.get({},function(obj){
				$scope.sort_list = obj;
				$scope.type = $scope.sort_list.results[0]

			});
			if($routeParams.id != -1){
				Staff.Product.List.Detail.get({product_id:$routeParams.id},function(obj){
					$scope.product_Detail = obj;
					if(obj.icons != ""){
						obj.icon_list = obj.icons.split(",");
					}
					if(obj.details != ""){
						obj.details_list = obj.details.split(",");
					}
					
				})
			}else{
				$scope.product_Detail = {}
			}

			$scope.del_key_word_choose = function(index,id){
				Staff.Product.Spec.Dele.get({product_spec_id:id},function(obj){
					alert("删除成功！");
					$scope.product_Detail.formats.splice(index,1);
					
				},function(err){
					//$scope.obj = [];
				})
			}
			$scope.spec = [];
			$scope.addSpec = function(){
				var modalInstance = $modal.open({
					templateUrl : "./template/Dialog/spec.html",
					controller : specControl,
					scope : $scope,
					resolve : {
						obj : function() {
							return $scope.spec;
						}
					}
				});
				modalInstance.result.then(function(result) {
					if(result != undefined){
						$scope.spec = result;
		                console.log($scope.spec);
		                $scope.product_Detail.formats = angular.copy($scope.spec);
					}
                   
                }, function(reason) {
                    console.log(reason);// 点击空白区域，总会输出backdrop
                    // click，点击取消，则会暑促cancel
                    //$log.info('Modal dismissed at: ' + new Date());
                });

			}

			var specControl = function($scope, $modalInstance, obj){
				$scope.obj = [];
				angular.forEach(obj,function(item,key){
					item.contenteditable = false;
				})
				if($routeParams.id != -1){
					Staff.Product.Spec.Product_list.get({product_id:$routeParams.id},function(obj){
						$scope.obj = obj;
						
					},function(err){
						$scope.obj = [];
					})
				}
				$scope.submitEdit = function() {  
	                $modalInstance.close($scope.obj);  
	            };
				$scope.cancelEdit = function() {  
	                $modalInstance.close($scope.obj);  
	            };
				$scope.addSpecItem = function(){
					$scope.obj.push({});
					$scope.obj[$scope.obj.length-1].contenteditable = true;
					$scope.obj[$scope.obj.length-1].isNew = true
				}

				$scope.deleteSpec = function(index,id){
					if(id != undefined){
						if($scope.obj.length==1){
							alert("一个商品至少需要一条规格");
							return;
						}
						Staff.Product.Spec.Dele.get({product_spec_id:id},function(obj){
							alert("删除成功！");
							$scope.obj.splice(index,1);
							//console.log($scope.obj)
						},function(err){
							//$scope.obj = [];
						})
					}else{
						alert("删除成功！");
						$scope.obj.splice(index,1);
					}
					

				}
				$scope.update = function(index){
					$scope.obj[index].contenteditable = true
				}
				
				$scope.saveupdate = function(index,id){
					if($scope.obj[index].description == ""||$scope.obj[index].description == undefined){
						alert("商品名称不能为空！");
						return;
					}
					if($scope.obj[index].inventory == ""||$scope.obj[index].inventory == undefined){
						alert("商品库存不能为空！");
						return;
					}
					if($scope.obj[index].currentPrice == ""||$scope.obj[index].currentPrice == undefined){
						alert("商品价格不能为空！");
						return;
					}
					if($scope.obj[index].image == ""||$scope.obj[index].image == undefined){
						alert("商品图片不能为空！");
						return;
					}
					//commodity所属商品id
					if($routeParams.id != -1){
						$scope.obj[index].commodity = $routeParams.id;
						var param = $scope.obj[index];
						if($scope.obj[index].isNew == true){
							//param.image = "string"	;
							Staff.Product.Spec.Add.get(param,function(obj){
								alert("ok");
								$scope.obj[index].contenteditable = false;
								$scope.obj[index].id = obj.id;

							})
						}else{
							Staff.Product.Spec.Update.get({product_spec_id:id},function(obj){
								alert("ok");
								$scope.obj[index].contenteditable = false;
							})
						}
					}else{
						$scope.obj[index].contenteditable = false
					}
					
					
				}
			}

			$scope.submit = function(){
				if($scope.product_Detail.name ==undefined || $scope.product_Detail.name == ""){
					alert("商品名称不能为空");
					return;
				}
				if($scope.product_Detail.icon_list ==undefined || $scope.product_Detail.icon_list.length == 0){
					alert("需要上传轮播图片");
					return;
				}
				if($scope.product_Detail.details_list ==undefined || $scope.product_Detail.details_list.length == 0){
					alert("需要上传详情图片");
					return;
				}
				if($scope.product_Detail.description ==undefined || $scope.product_Detail.description == ""){
					alert("推荐理由不能为空");
					return;
				}
				if($scope.product_Detail.formats ==undefined || $scope.product_Detail.formats.length == 0){
					alert("商品规格至少需要一种");
					return;
				}
				var param = angular.copy($scope.product_Detail);
				// param.icons = "";
				// param.details = "";
				// param.saleCount = "";
				// param.isEnabled = "";
				param.type = $scope.type.id;
				if($routeParams.id == -1){
					
					param.icons = $scope.product_Detail.icon_list.toString();
					param.details = $scope.product_Detail.details_list.toString();
					//return;
					//console.log($scope.spec)
					Staff.Product.List.Add.get(param,function(obj){
						alert("创建成功！");
						angular.forEach($scope.spec,function(item,key){
							if(item.contenteditable == false){
								item.commodity = obj.id;
								Staff.Product.Spec.Add.get(item,function(obj){
									if(key == ($scope.spec.length-1)){
										//$location.path("/Product_list")
										//$scope.product_Detail = {};
										location.reload()
									}
								})
							}
						})
					})
				}else{
					param.product_id = $routeParams.id;
					param.icons = $scope.product_Detail.icon_list.toString();
					param.details = $scope.product_Detail.details_list.toString();
					
					Staff.Product.List.Update.get(param,function(obj){
						alert("修改成功！");
						$location.path("/Product_list")

						
					})

				}
			}


			$scope.upload = function (file,key,p) {
				if((key == "spec"&&file==null)||(file.length == 0&&key != "spec")){
					//return;
					if(key == "spec"){
						Staff.Pic.Dele.get({path:p.image},function(obj){
							p.image = ""
						})
					}else{
						angular.forEach($scope.product_Detail[key],function(item,i){
							Staff.Pic.Dele.get({path:item},function(obj){
								delete $scope.product_Detail[key][i]
							})
						})
					}
					return;
				}
				var url = "";
				var lastPath = "";
				if(key == "spec"){
					url = 'http://114.215.220.241/WebAdmin/upload/CommodityFormatPic/';
					if(p.image != "" && p.image != undefined){
						lastPath = p.image;
					}
				}else{
					url = 'http://114.215.220.241/WebAdmin/upload/CommodityPic/';
				}
				//return;
                Upload.upload({
                    //服务端接收
                    url: url,
                    //上传的同时带的参数
                    fields: {'lastPath': lastPath},
                    //上传的文件
					file: file,
					headers: {"token":sessionStorage.getItem("token")}
                }).progress(function (evt) {
                	console.log(evt);
                    //进度条
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    console.log('progess:' + progressPercentage + '%' + evt.config.file.name);
                }).success(function (data, status, headers, config) {
					alert("上传成功");
                    //上传成功
                    //console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                    //$scope.sortDetail.file_url = data.fileName;
                    
                    if(key == "spec"){
						p.image = data.fileName;
					}else{
						if($routeParams.id != -1){
							$scope.product_Detail[key] = $scope.product_Detail[key].concat(data.fileNameList);
						}else{
							$scope.product_Detail[key] = data.fileNameList;
						}
						
					}
                }).error(function (data, status, headers, config) {
                    //上传失败
                    console.log('error status: ' + status);
                });
            };


            $scope.dele = function(index,key){
            	if(key=="icon"){
            		Staff.Pic.Dele.get({path:$scope.product_Detail.icon_list[index]},function(obj){
						$scope.product_Detail.icon_list.splice(index,1);
            			$scope.product_Detail.icons = $scope.product_Detail.icon_list.join(",");
					})
            		
            	}else{
            		Staff.Pic.Dele.get({path:$scope.product_Detail.details_list[index]},function(obj){
						$scope.product_Detail.details_list.splice(index,1);
            			$scope.product_Detail.details = $scope.product_Detail.details_list.join(",");
					})
            		
            	}
            	console.log($scope.product_Detail);
            }
															        
		}
	}).when("/Product_detail",{
		templateUrl: "./template/Product/Product_detail.html",
		controller:function(){

		}
	}).when("/Product_censor",{
		templateUrl: "./template/Product/Product_censor.html",
		controller:function(){

		}
	}).when("/Order_list/:key",{
		templateUrl: "./template/Order/Order_list.html",
		controller:function($scope, $rootScope, $routeParams, Staff, $modal, $filter){
			$scope.key = $routeParams.key;
			$rootScope.$watch("hotel",function(){

			})
			var datepicker = {
				weekStart: 1,
		        todayBtn:  1,
				autoclose: 1,
				todayHighlight: 1,
				startView: 2,
				forceParse: 0,
		        showMeridian: 1
			}
			///$(".calender").(datepicker);
			$scope.createTimeTo = $filter("date")(new Date(),"yyyy-MM-dd");
			$scope.createTimeFrom = $filter("date")(new Date(),"yyyy-MM-dd");

			$scope.page = function(){

			}


			var param = {};
			param.hotel_id = sessionStorage.getItem("hotel_id");
			$scope.status = ["已失效","待支付","待发货","已发货","已完成","待退款"]
			if($routeParams.key=="all"){//查询所有历史订单
				
			}else if($routeParams.key=="2"){//带退款
				param.status = 5;
			}else if($routeParams.key=="1"){//已发货
				param.status = 4;
			}else if($routeParams.key=="0"){//待发货
				param.status = 2;
			}else{//24小时

			}
			Staff.Order.List.get(param,function(data){
				$scope.order_list = data.results;
			})

			$scope.search = function(status){
				if($scope.orderNum != ""&&$scope.orderNum != undefined){
					param.orderNum = $scope.orderNum;
				}
				if($scope.createTimeTo != ""&&$scope.createTimeTo != undefined){
					param.createTimeTo = $scope.createTimeTo;
				}
				if($scope.createTimeFrom != ""&&$scope.createTimeFrom != undefined){
					param.createTimeFrom = $scope.createTimeFrom;
				}
				if(status != undefined){
					param.status = status;
				}
				Staff.Order.List.get(param,function(data){
					$scope.order_list = data.results;
				})
			}
			$scope.dele = function(id){
				Staff.Order.Dele.get({order_id:id},function(data){
					//$scope.order_list = data.results;
					alert("删除成功！")
				})
			}

			$scope.deliver = function(index,orderNum){
				var modalInstance = $modal.open({
					templateUrl:"./template/Dialog/deliver.html",
					controller : secondLevelMenuCtrl,
					scope : $scope,
					resolve : {
							orderNum : function() {
								return orderNum
							}
					}

				})
				modalInstance.result.then(function(result) {
					if(result != undefined){
						$scope.order_list[index].status = 3;
					}
                   
                }, function(reason) {
                    console.log(reason);// 点击空白区域，总会输出backdrop
                    // click，点击取消，则会暑促cancel
                    //$log.info('Modal dismissed at: ' + new Date());
                });
			}

			var secondLevelMenuCtrl = function($scope, $modalInstance,orderNum) {
				//获取快递公司
				Staff.Order.Deliver_com.get({},function(obj){
					$scope.compny = obj;
					$scope.shortName = obj[0];
				})

				$scope.orderNum = orderNum; 
				$scope.remarks = "";
				$scope.trackingNumber = "";
             	$scope.cancelEdit = function() {  
	                $modalInstance.close();  
	            };
			            
				$scope.submitEdit = function(){
					var param = {
						"trackingNumber":$scope.trackingNumber,
						"remarks":$scope.remarks,
						"status":"3",
						"shortName":$scope.shortName.shortName,
						"orderNum":$scope.orderNum
					};
					Staff.Order.Update.get(param,function(obj){
						$modalInstance.close($scope.orderNum);
					})
					
				}	
            };
			$scope.express = function(x){
				$modal.open({
					templateUrl:"./template/Dialog/express.html",
					controller : secondLevelMenuCtrl1,
					scope : $scope,
					resolve : {
							obj : function() {
								return x;
							}
					}

				})
			}
			var secondLevelMenuCtrl1 = function($scope, $modalInstance, obj){

				Staff.Order.Search_deliver.get({orderNum:obj.orderNum},function(obj){
					$scope.express_detail = obj;
				})	
				$scope.cancelEdit = function() {  
	                $modalInstance.close();  
	            };
			}
		}
	}).when("/Poisubscribe",{
		templateUrl: "./template/poisubscribe.html",
		controller:function(){

		}
	}).when("/mpmenu",{
		templateUrl: "./template/mpmenu.html",
		controller:function($scope, $rootScope, $modal, $http, Staff){
			Staff.Menu.GetList.get({hotel_id:sessionStorage.getItem("hotel_id")},function(obj){
				if($rootScope.$status == "200"){
					$scope.menuList = obj.result;
				}
			})
			
			$scope.changeMenuList = function(key,action,i,j){
				if(key == 1){//第一层
					var menuList = $scope.menuList;
					switch(action){
						case 0://升
							if(i == 0){
								return;
							}else{
								Staff.Menu.Swap.get({hotel_id:sessionStorage.getItem("hotel_id"),"menu1": menuList[i].id,"menu2": menuList[i-1].id},function(obj){
									if($rootScope.$status == "200"){
										alert("修改成功！");
										var temp = angular.copy(menuList[i]);
										menuList[i] = angular.copy(menuList[i-1]);
										menuList[i-1] = temp;
									}
								})
							}
						break;
						case 1://降
							if(i == ($scope.menuList.length-1)){
								return;
							}else{
								Staff.Menu.Swap.get({hotel_id:sessionStorage.getItem("hotel_id"),"menu1": menuList[i].id,"menu2": menuList[i+1].id},function(obj){
									if($rootScope.$status == "200"){
										alert("修改成功！");
										var temp = angular.copy(menuList[i]);
										menuList[i] = angular.copy(menuList[i+1]);
										menuList[i+1] = temp;
									}
								})
							}
						break;
						case 2://删除
							Staff.Menu.Dele.get({menu_id:menuList[i].id},function(obj){
								if($rootScope.$status == "204"){
									alert("删除成功！");
									menuList[i].childMenuList.splice(j,1);
								}
							})
							$scope.menuList.splice(i,1)
						break;
					}
				}else{
					var menuList = $scope.menuList[i].childMenuList;
					switch(action){
						case 0://升
							if(j == 0){
								return;
							}else{
								Staff.Menu.Swap.get({hotel_id:sessionStorage.getItem("hotel_id"),"menu1": menuList[j].id,"menu2": menuList[j-1].id},function(obj){
									if($rootScope.$status == "200"){
										alert("修改成功！");
										var temp = angular.copy(menuList[j]);
										menuList[j] = angular.copy(menuList[j-1]);
										menuList[j-1] = temp;
									}
								})
								
							}
						break;
						case 1://降
							if(j == (menuList.length-1)){
								return;
							}else{
								Staff.Menu.Swap.get({hotel_id:sessionStorage.getItem("hotel_id"),"menu1": menuList[j].id,"menu2": menuList[j+1].id},function(obj){
									if($rootScope.$status == "200"){
										alert("修改成功！");
										var temp = angular.copy(menuList[j]);
										menuList[j] = angular.copy(menuList[j+1]);
										menuList[j+1] = temp;
									}
								})
							}
						break;
						case 2://删除
							Staff.Menu.Dele.get({menu_id:menuList[j].id},function(obj){
								if($rootScope.$status == "204"){
									alert("删除成功！");
									menuList.splice(j,1);
								}
							})
						break;
					}
				}
			}
			$scope.editMenu = function(key,index,x,j){
				if(key == 1&&x == undefined&&$scope.menuList.length==3){
					alert("最多只能添加三个一级菜单！");
					return;
				}else if(key == 2&&x == undefined&&$scope.menuList[index].childMenuList.length == 5){
					alert("最多只能添加五个二级菜单！");
					return;
				}
				$scope.obj = {menuList:$scope.menuList,x:x,index:index,j:j};
				$modal.open({
					templateUrl:"./template/Dialog/secondLevelMenu.html",
					controller : secondLevelMenuCtrl,
					scope : $scope,
					resolve : {
							obj : function() {
								return $scope.obj;
							}
					}

				})
			}

			var secondLevelMenuCtrl = function($scope, $modalInstance, obj) {  
				$scope.menu_show_obj = angular.copy(obj);
				$scope.obj = obj;
				console.log(obj);
				console.log(obj.index!=undefined&&obj.j==undefined);
				$scope.x = {name : ""};
             	$scope.cancelEdit = function() {  
	                $modalInstance.close();  
	            };

				$scope.submitEdit = function() {
					///alert("ok");
					if($scope.menu_show_obj.x != undefined){
						$scope.obj.x.menu_id = obj.x.id;
						Staff.Menu.Modify.get($scope.obj.x,function(obj){
							if($rootScope.$status == "200"){
								alert("修改成功！");
								$modalInstance.close($scope.x); 
							}
						})
					}else{
						///$scope.obj.x = {};
						var param = {
							  "name": $scope.obj.x.name,
							  "type": $scope.obj.x.type,
							  "url": $scope.obj.x.url,
							  "hotel": "1",
							  "parent": ""
							};
						if($scope.obj.x.view == -1){
							alert("请选择按钮类型！");
							return;
						}
						//判断二级菜单
						if($scope.obj.index!=undefined&&$scope.obj.j==undefined){
							param.parent = $scope.obj.menuList[$scope.obj.index].id;
							param.status = 1;
						}
						Staff.Menu.Create.get(param,function(obj){
							if($rootScope.$status == "201"){
								alert("添加菜单成功！");
								if($scope.obj.index!=undefined&&$scope.obj.j==undefined){
									$scope.menuList[$scope.obj.index].childMenuList.push(obj)
								}else{
									$scope.menuList.push(obj)
								}
								$modalInstance.close(); 
							}
						})
					}
	            };
				$scope.change_url = function(type){
					if(type="news"){
						$scope.url="新闻"
					}else if(type="mall"){
						$scope.url="微商城"
					}
				}	
            };
			$scope.showSecondMenu = function(target){
				if($(target).find(".sub_item").css("display")=="block"){
					$(target).find(".sub_item").hide()
				}else{
					$(target).find(".sub_item").show()
				}
				
				//console.log($(target).find(".sub_item"));
			}
			//发布
			$scope.publishMenu = function(){
				Staff.Menu.Publish.get({hotel_id:sessionStorage.getItem("hotel_id")},function(obj){
					alert("发布成功！取消关注重新关注后可看到效果，或24小时后看到效果！")
				})
			}
		}
	}).when("/User_list",{
		templateUrl: "./template/User/user_list.html",
		controller:function(){

		}
	}).when("/User_detail/",{
		templateUrl: "./template/User/user_detail.html",
		controller:function(){

		}
	}).when("/User_edit",{
		templateUrl: "./template/User/user_edit.html",
		controller:function(){

		}
	}).when("/Order_detail/:id",{
		templateUrl: "./template/Order/Order_detail.html",
		controller:function($scope, Staff, $routeParams, $modal
			){
			$scope.status = ["已失效","待支付","待发货","已完成","待退款"];
			Staff.Order.Order_detai.get({orderNum:$routeParams.id},function(obj){
				$scope.Order_detail = obj;
			})



		}
	}).when("/Replay_list/:id",{
		templateUrl: "./template/Replay/replay_list.html",
		controller:function($scope, $rootScope, Staff, $routeParams){
			$scope.id = $routeParams.id;
			console.log($scope.id);
			if($scope.id== 0){//被关注回复

			}else{

			}
			$scope.Replay_list = {count:10,list:[
				{
					"name":"test",
					"type":"文本",
					"id":1,
					"url":"",
					"icon":"./images/1458467024997.jpg"
				},
				{
					"name":"test11",
					"type":"图文",
					"id":2,
					"url":"http://www.baidu.com",
					"icon":"./images/1458467024997.jpg"
				},
			]};

			$scope.dele = function(id,index){
				//delete $scope.Replay_list.list[index];
				$scope.Replay_list.list.splice(index,1)
			}
		}
	}).when("/Replay_add/:id",{
		templateUrl: "./template/Replay/replay_add.html",
		controller:function($scope, $rootScope, Staff, $routeParams, Upload){
			var id = $routeParams.id;

			$scope.replay_detail = {type:0};

			$scope.upload = function (file) {
				if(file == null){
					Staff.Pic.Dele.get({path:$scope.sortDetail.file_url},function(obj){
						$scope.sortDetail.file_url = "";
					})
					return;
				}
                Upload.upload({
                    //服务端接收
                    url: 'http://114.215.220.241/WebAdmin/upload/NewsTypePic/',
                    //上传的同时带的参数
                    //fields: {'name': theme,'description': description,"token":sessionStorage.getItem("token")},
                    //上传的文件
					file: file,
					headers: {"token":sessionStorage.getItem("token")}
                }).progress(function (evt) {
                	console.log(evt);
                    //进度条
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    console.log('progess:' + progressPercentage + '%' + evt.config.file.name);
                }).success(function (data, status, headers, config) {
					layer.alert("上传成功");
                    //上传成功
                    //console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                    $scope.sortDetail.file_url = data.fileName;
                }).error(function (data, status, headers, config) {
                    //上传失败
                    console.log('error status: ' + status);
                });
            };
		}	
	})



	$routeProvider
        .otherwise({redirectTo: "/index"});
}])
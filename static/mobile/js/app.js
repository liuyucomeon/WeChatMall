// 模块注入
var App = angular.module('App', ['ui.router',"ngResource"]);
App.controller("mainCtrol",function($http, $scope, $rootScope){

})
var host = "http://114.215.220.241";
App.factory("Staff",["$resource",function($resource){
    return {
        newsTypes : $resource(host+"/WeChat/hotels/:hotel_id/newsTypes/",{},{
            get : {
                method : "GET" ,
                params : {hotel_id:"@hotel_id"},
                isArray : false
            }
        }),
        News_list : $resource(host+"/WeChat/hotels/:hotel_id/newsTypes/",{},{
            get : {
                method : "GET" ,
                params : {hotel_id:"@hotel_id"},
                isArray : false
            }
        }),
        search_news_list : $resource(host+"/WeChat/newsTypes/:news_type_id/news/",{},{
            get : {
                method : "GET" ,
                params : {news_type_id:"@news_type_id"},
                isArray : false
            }
        }),
        search_news_detail : $resource(host+"/WeChat/news/:news_id/",{},{
            get : {
                method : "GET" ,
                params : {news_id:"@news_id"},
                isArray : false
            }
        }),
        news_list : $resource(host+"/WeChat/hotels/:hotel_id/news/",{},{
            get : {
                method : "GET" ,
                params : {hotel_id:"@hotel_id"},
                isArray : false
            }
        })

    }
}])
App.filter(  
    'to_trusted', ['$sce', function ($sce) {  
        return function (text) {  
            return $sce.trustAsHtml(text);  
        }  
    }]  
)
App.config(function ($stateProvider, $urlRouterProvider){ 
	$urlRouterProvider.otherwise("/list");  
    $stateProvider     
    .state("/list", { //导航用的名字，如<a ui-sref="login">login</a>里的login
        url: '/list?hotel_id&type',    //访问路径 
        templateUrl : "./template/news.html",
        controller : function($stateParams, $http, $scope, Staff){
            console.log($stateParams);
            Staff.newsTypes.get({hotel_id:$stateParams.hotel_id},function(obj){
                $scope.typeList = obj.results;
            })
            if($stateParams.type == undefined){
                $scope.type = -1;
                Staff.news_list.get({hotel_id:$stateParams.hotel_id},function(obj){
                    //$scope.typeList = obj.results;
                    $scope.news_list = obj;
                    angular.forEach(obj.results, function(item,key){
                        item.url = host+"/"+item.cover;
                    })
                })
            }else{
                $scope.type = $stateParams.type;
                $scope.search_news($stateParams.type);
            }

            $scope.search_news = function(id){
                Staff.search_news_list.get({news_type_id:id},function(obj){
                    //$scope.typeList = obj.results;
                    $scope.news_list = obj;
                    $scope.type = id;
                    angular.forEach(obj.results, function(item,key){
                        item.url = host+"/"+item.cover;
                    })
                })
            }

            $(".droplist-trigger").click(function(){
                if($(".droplist").css("display")=="block"){
                    $(".droplist").hide()
                }else{
                    $(".droplist").show()
                }
            })
            $(".droplist").on("click","li",function(){
                $(".droplist").hide()
            })
        }
    }) 
    .state("/detail", { //导航用的名字，如<a ui-sref="login">login</a>里的login
        url: '/detail/:id',    //访问路径 
        templateUrl : "./template/detail.html",
        controller : function($stateParams, $http, $scope, Staff){
        	Staff.search_news_detail.get({news_id:$stateParams.id},function(obj){
                $scope.detail = obj;
            })
        }
    })     

 })



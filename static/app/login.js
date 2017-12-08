var LoginApp = angular.module('LoginApp', []);
LoginApp.controller('LoginCtrl', function ($scope, $http) {
	$scope.login = function(username,userpassword){
		$http({  
		    method:'post',  
		    url:'http://114.215.220.241/WebAdmin/login/',  
		    data:{"username": username,"password": userpassword}
			//headers: {'Content-Type':'application/json'}     
		}).success(function(req){  
		    //alert(req);
			if(req.token != undefined){
				window.location.href="./staff.html";
				sessionStorage.setItem("token",req.token)
			} 

		}).error(function(req){
			alert(req.error_msg);  
		}) 
	}
	// $scope.$watch("username",function(newVale,oldValue){
	// 	alert("ok");
	// })
})
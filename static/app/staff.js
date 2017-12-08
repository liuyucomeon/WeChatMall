// 模块注入
var App = angular.module('App', ['ngRoute', 'ngResource', 'ngTable', 'ngWebSocket', 'ui.bootstrap', 'infinite-scroll','ngFileUpload']);
//var host = window.location.host;
// App配置
App.config(['$resourceProvider','$httpProvider', function ($resourceProvider,$httpProvider) {

    $resourceProvider.defaults.stripTrailingSlashes = false;
    //$locationProvider.html5Mode(false);
    $httpProvider.interceptors.push('httpInterceptor');
}]);
//过滤器
App.filter("undefined",function(){
    return function(input){
        //input 过滤器接受的值
        //uppercase 是否要大小写，可选
        if(input != "" && input !=undefined){
            return input;
        }else{
            return "";
        } 

    }
})
App.directive("paging",function(){
    return {
        restrict : "EAC",
        transclude : false,
        link : function (scope, element, attrs, controller){
            if (!angular.isDefined(scope.currentPage)) {
                scope.currentPage = 0;
            }
            if (!angular.isDefined(scope.pageSize)) {
                scope.pageSize = 10;
            }
            scope.pageCount = function () {
                return parseInt(scope.totalCount / scope.pageSize + 1);
            };
            // 分页
            scope.pages = function () {
                // |---[----.----]-----------|
                var currentPage = parseInt(scope.currentPage);
                var numPerPage = parseInt(scope.numPerPage);
                // 起始页
                var start = 0;
                var halfPages = parseInt(numPerPage / 2);
                if (currentPage <= halfPages || scope.pageCount() < scope.numPerPage) {
                    // |[--.-|----]--------------|
                    start = 0;
                } else if (currentPage > halfPages && currentPage < scope.pageCount() - halfPages) {
                    start = currentPage - halfPages;
                } else {
                    // |--------------[----|--.-]|
                    start = scope.pageCount() - numPerPage;
                }
                // 显示条数
                var limit = 0;
                if (scope.pageCount() - start > numPerPage) {
                    limit = numPerPage;
                } else {
                    limit = scope.pageCount() - start;
                }
                // 构造快捷列表
                var pages = [];
                for (var i = 0; i < limit; i++) {
                    pages.push(start + i+1);
                }

                return pages;
            };
            // 快捷按钮
            scope.onPage = function (page) {
                if (page < scope.pageCount()) {
                    scope.currentPage = page < 0 ? 0 : page;
                }
            };
            // 左右导航
            scope.hasNext = function () {
                return scope.currentPage < scope.pageCount() - 1;
            };
            scope.onNext = function () {
                scope.onPage(scope.currentPage + 1);
            };
            scope.hasPrevious = function () {
                return scope.currentPage > 0;
            };
            scope.onPrev = function () {
                scope.onPage(scope.currentPage - 1);
            };
        },
        template : '<ul class="pagination">\
                        <li class="prev" ng-if="hasPrevious"><a href="javascript:;" ng-click="onPrev()">← Prev</a></li>\
                        <li ng-class="{active:(currentPage+1)===x}" ng-repeat="x in pages()"><a ng-click="onPage(x-1)" href="javascript:;">{{x}}</a></li>\
                        <li ng-if="hasNext"><a href="javascript:;" ng-click="onNext">Next →</a></li>\
                    </ul>',
        scope : {
            numPerPage : "=",
            totalCount : "=",
            currentPage : "=",
            pageSize : "=",
            onPagechange : "&"
        }

    }
})
var host = "http://114.215.220.241";
App.factory('Staff', ['$resource', function ($resource) {

    return {
    	Login: $resource(host+"/WebAdmin/login/",{},{
    		get: {
    			method: 'POST',
                params: {},
                isArray: false
    		}
    	}),
    	Logout: $resource(host+'/WebAdmin/logout/', {}, {
                get: {
                    method: 'POST',
                    params: {},
                    isArray: false,
                    headers: {
                        "token":sessionStorage.getItem("token")
                    }
                }
        }),
        Menu: {
            Create : $resource(host+'/WebAdmin/weChatMenus/', {}, {
                get: {
                    method: 'POST',
                    params: {},
                    isArray: false,
                    headers: {
                        "token":sessionStorage.getItem("token")
                    }
                }
            }),
            GetList : $resource(host+'/WebAdmin/hotels/:hotel_id/wechatMenus/', {}, {
                get: {
                    method: 'GET',
                    params: {hotel_id:"@hotel_id"},
                    isArray: false,
                    headers: {
                        "token":sessionStorage.getItem("token")
                    }
                }
            }),
            Modify : $resource(host+'/WebAdmin/weChatMenus/:menu_id/', {}, {
                get: {
                    method: 'PATCH',
                    params: {menu_id:"@menu_id"},
                    isArray: false,
                    headers: {
                        "token":sessionStorage.getItem("token")
                    }
                }
            }),
            Dele : $resource(host+'/WebAdmin/weChatMenus/:menu_id/', {}, {
                get: {
                    method: 'DELETE',
                    params: {menu_id:"@menu_id"},
                    isArray: false,
                    headers: {
                        "token":sessionStorage.getItem("token")
                    }
                }
            }),
            Swap : $resource(host+'/WebAdmin/hotels/:hotel_id/wechatMenus/swap/', {}, {
                get: {
                    method: 'POST',
                    params: {hotel_id:"@hotel_id"},
                    isArray: false,
                    headers: {
                        "token":sessionStorage.getItem("token")
                    }
                }
            }),
            Publish : $resource(host+'/WebAdmin/hotels/:hotel_id/wechatMenus/publish/', {}, {
                get: {
                    method: 'POST',
                    params: {hotel_id:"@hotel_id"},
                    isArray: false,
                    headers: {
                        "token":sessionStorage.getItem("token")
                    }
                }
            })
            
        },
        News: {
            Sort: {
                GetList : $resource(host+'/WebAdmin/hotels/:hotel_id/newsTypes/', {}, {
                        get: {
                            method: 'GET',
                            params: {hotel_id:"@hotel_id"},
                            isArray: false,
                            headers: {
                                "token":sessionStorage.getItem("token")
                            }
                        }
                }),
                Create : $resource(host+'/WebAdmin/newsTypes/', {}, {
                        get: {
                            method: 'POST',
                            params: {},
                            isArray: false,
                            headers: {
                                "token":sessionStorage.getItem("token")
                            }
                        }
                }),
                GetSortById: $resource(host+'/WebAdmin/newsTypes/:sort_id/', {}, {
                        get: {
                            method: 'GET',
                            params: {sort_id:"@sort_id"},
                            isArray: false,
                            headers: {
                                "token":sessionStorage.getItem("token")
                            }
                        }
                }),
                Modify : $resource(host+'/WebAdmin/newsTypes/:sort_id/', {}, {
                        get: {
                            method: 'PUT',
                            params: {sort_id:"@sort_id"},
                            isArray: false,
                            headers: {
                                "token":sessionStorage.getItem("token")
                            }
                        }
                }),
                UploadPic : $resource(host+'/WebAdmin/upload/NewsTypePic/', {}, {
                        get: {
                            method: 'POST',
                            params: {},
                            isArray: false,
                            headers: {
                                "token":sessionStorage.getItem("token")
                            }
                        }
                }),
                Dele : $resource(host+'/WebAdmin/newsTypes/:sort_id/', {}, {
                        get: {
                            method: 'DELETE',
                            params: {sort_id:"@sort_id"},
                            isArray: false,
                            headers: {
                                "token":sessionStorage.getItem("token")
                            }
                        }
                }),
                Swap : $resource(host+'/WebAdmin/hotels/:hotel_id/newsTypes/swap/', {}, {
                        get: {
                            method: 'POST',
                            params: {hotel_id:"@hotel_id"},
                            isArray: false,
                            headers: {
                                "token":sessionStorage.getItem("token")
                            }
                        }
                })
                
            },
            List: {
                GetList : $resource(host+'/WebAdmin/news/', {}, {
                        get: {
                            method: 'GET',
                            params: {},
                            isArray: false,
                            headers: {
                                "token":sessionStorage.getItem("token")
                            }
                        }
                }),
                GetSListById: $resource(host+'/WebAdmin/news/:news_id/', {}, {
                        get: {
                            method: 'GET',
                            params: {news_id:"@news_id"},
                            isArray: false,
                            headers: {
                                "token":sessionStorage.getItem("token")
                            }
                        }
                }),
                Create: $resource(host+'/WebAdmin/news/', {}, {
                        get: {
                            method: 'POST',
                            params: {},
                            isArray: false,
                            headers: {
                                "token":sessionStorage.getItem("token")
                            }
                        }
                }),
                Update: $resource(host+'/WebAdmin/news/:news_id/', {}, {
                        get: {
                            method: 'PUT',
                            params: {news_id:"@news_id"},
                            isArray: false,
                            headers: {
                                "token":sessionStorage.getItem("token")
                            }
                        }
                }),
                Dele: $resource(host+'/WebAdmin/news/:news_id/', {}, {
                        get: {
                            method: 'DELETE',
                            params: {news_id:"@news_id"},
                            isArray: false,
                            headers: {
                                "token":sessionStorage.getItem("token")
                            }
                        }
                }),
                SearchByType : $resource(host+'/WebAdmin/newsTypes/:news_sort_id/news/', {}, {
                        get: {
                            method: 'GET',
                            params: {news_sort_id:"@news_sort_id"},
                            isArray: false,
                            headers: {
                                "token":sessionStorage.getItem("token")
                            }
                        }
                })
            }
        },
        Pic : {
            Dele: $resource(host+'/WebAdmin/deleteFile/', {}, {
                    get: {
                        method: 'POST',
                        params: {},
                        isArray: false,
                        headers: {
                            "token":sessionStorage.getItem("token")
                        }
                    }
            }),
            
            Product : $resource(host+'/WebAdmin/upload/CommodityPic/', {}, {
                    get: {
                        method: 'POST',
                        params: {},
                        isArray: false,
                        headers: {
                            "token":sessionStorage.getItem("token")
                        }
                    }
            })
        },
        Hotel : $resource(host+'/WebAdmin/hotelBranchByToken/', {}, {
                get: {
                    method: 'GET',
                    params: {},
                    isArray: false,
                    headers: {
                        "token":sessionStorage.getItem("token")
                    }
                }
        }),
        BasicMsg:  $resource(host+'/WebAdmin/staffByToken/', {}, {
                get: {
                    method: 'GET',
                    params: {},
                    isArray: false,
                    headers: {
                        "token":sessionStorage.getItem("token")
                    }
                }
        }),
        Product: {
            Sort : {
                List : $resource(host+'/WebAdmin/commodityTypes/', {}, {
                        get: {
                            method: 'GET',
                            params: {},
                            isArray: false,
                            headers: {
                                "token":sessionStorage.getItem("token")
                            }
                        }
                }),
                Create : $resource(host+'/WebAdmin/commodityTypes/', {}, {
                        get: {
                            method: 'POST',
                            params: {},
                            isArray: false,
                            headers: {
                                "token":sessionStorage.getItem("token")
                            }
                        }
                }),
                Dele : $resource(host+'/WebAdmin/commodityTypes/:product_id/', {}, {
                        get: {
                            method: 'DELETE',
                            params: {product_id:"@product_id"},
                            isArray: false,
                            headers: {
                                "token":sessionStorage.getItem("token")
                            }
                        }
                }), 
                Swap : $resource(host+'/WebAdmin/hotelBranchs/:hotel_id/commodityTypes/swap/', {}, {
                        get: {
                            method: 'POST',
                            params: {hotel_id:"@hotel_id"},
                            isArray: false,
                            headers: {
                                "token":sessionStorage.getItem("token")
                            }
                        }
                }),
                Detail : $resource(host+'/WebAdmin/commodityTypes/:product_id/', {}, {
                        get: {
                            method: 'GET',
                            params: {product_id:"@product_id"},
                            isArray: false,
                            headers: {
                                "token":sessionStorage.getItem("token")
                            }
                        }
                }),
                Update : $resource(host+'/WebAdmin/commodityTypes/:product_id/', {}, {
                        get: {
                            method: 'PATCH',
                            params: {product_id:"@product_id"},
                            isArray: false,
                            headers: {
                                "token":sessionStorage.getItem("token")
                            }
                        }
                })

            },
            List : {
                List : $resource(host+'/WebAdmin/commoditys/', {}, {
                        get: {
                            method: 'GET',
                            params: {},
                            isArray: false,
                            headers: {
                                "token":sessionStorage.getItem("token")
                            }
                        }
                }),
                Add : $resource(host+'/WebAdmin/commoditys/', {}, {
                        get: {
                            method: 'POST',
                            params: {},
                            isArray: false,
                            headers: {
                                "token":sessionStorage.getItem("token")
                            }
                        }
                }),
                Dele : $resource(host+'/WebAdmin/commoditys/:product_id/', {}, {
                        get: {
                            method: 'DELETE',
                            params: {product_id:"@product_id"},
                            isArray: false,
                            headers: {
                                "token":sessionStorage.getItem("token")
                            }
                        }
                }),
                Search : $resource(host+'/WebAdmin/hotelBranchs/:hotel_id/commodityTypes/:product_sort_id/commoditys/', {}, {
                        get: {
                            method: 'GET',
                            params: {product_sort_id:"@product_sort_id",hotel_id:"@hotel_id"},
                            isArray: false,
                            headers: {
                                "token":sessionStorage.getItem("token")
                            }
                        }
                }),
                Detail : $resource(host+'/WebAdmin/commoditys/:product_id/', {}, {
                        get: {
                            method: 'GET',
                            params: {product_id:"@product_id"},
                            isArray: false,
                            headers: {
                                "token":sessionStorage.getItem("token")
                            }
                        }
                }),
                Update : $resource(host+'/WebAdmin/commoditys/:product_id/', {}, {
                        get: {
                            method: 'PATCH',
                            params: {product_id:"@product_id"},
                            isArray: false,
                            headers: {
                                "token":sessionStorage.getItem("token")
                            }
                        }
                })

            },
            Spec : {
                List : $resource(host+'/WebAdmin/commodityFormats/', {}, {
                        get: {
                            method: 'GET',
                            params: {},
                            isArray: false,
                            headers: {
                                "token":sessionStorage.getItem("token")
                            }
                        }
                }),
                Add : $resource(host+'/WebAdmin/commodityFormats/', {}, {
                        get: {
                            method: 'POST',
                            params: {},
                            isArray: false,
                            headers: {
                                "token":sessionStorage.getItem("token")
                            }
                        }
                }),
                Dele : $resource(host+'/WebAdmin/commodityFormats/:product_spec_id/', {}, {
                        get: {
                            method: 'DELETE',
                            params: {product_spec_id:"@product_spec_id"},
                            isArray: false,
                            headers: {
                                "token":sessionStorage.getItem("token")
                            }
                        }
                }),
                Update : $resource(host+'/WebAdmin/commodityFormats/:product_spec_id/', {}, {
                        get: {
                            method: 'PATCH',
                            params: {product_spec_id:"@product_spec_id"},
                            isArray: false,
                            headers: {
                                "token":sessionStorage.getItem("token")
                            }
                        }
                }),
                SearchById : $resource(host+'/WebAdmin/commodityFormats/:product_id/', {}, {
                        get: {
                            method: 'GET',
                            params: {product_id:"@product_id"},
                            isArray: false,
                            headers: {
                                "token":sessionStorage.getItem("token")
                            }
                        }
                }),
                Product_list : $resource(host+'/WebAdmin/commoditys/:product_id/commodityFormats/', {}, {
                        get: {
                            method: 'GET',
                            params: {product_id:"@product_id"},
                            isArray: true,
                            headers: {
                                "token":sessionStorage.getItem("token")
                            }
                        }
                })
            }
        },
        Order : {
            List : $resource(host+'/WebAdmin/hotelBranchs/:hotel_id/orders/', {}, {
                get: {
                    method: 'GET',
                    params: {hotel_id:"@hotel_id"},
                    isArray: false,
                    headers: {
                        "token":sessionStorage.getItem("token")
                    }
                }
            }),
            Dele : $resource(host+'/WebAdmin/orders/:order_id/', {}, {
                get: {
                    method: 'DELETE',
                    params: {order_id:"@order_id"},
                    isArray: false,
                    headers: {
                        "token":sessionStorage.getItem("token")
                    }
                }
            }),
            Order_detai : $resource(host+'/WebAdmin/orders/:orderNum/', {}, {
                get: {
                    method: 'GET',
                    params: {orderNum:"@orderNum"},
                    isArray: false,
                    headers: {
                        "token":sessionStorage.getItem("token")
                    }
                }
            }),
            Update : $resource(host+'/WebAdmin/orders/:orderNum/', {}, {
                get: {
                    method: 'PATCH',
                    params: {orderNum:"@orderNum"},
                    isArray: false,
                    headers: {
                        "token":sessionStorage.getItem("token")
                    }
                }
            }),
            Deliver_com : $resource(host+'/WebAdmin/trackCompanys/', {}, {
                get: {
                    method: 'GET',
                    params: {},
                    isArray: true,
                    headers: {
                        "token":sessionStorage.getItem("token")
                    }
                }
            }),
            Search_deliver : $resource(host+'/WeChat/queryTrack/', {}, {
                get: {
                    method: 'GET',
                    params: {},
                    isArray: false,
                    headers: {
                        "token":sessionStorage.getItem("token")
                    }
                }
            })
        }

    }

}])
//添加拦截器
App.factory('httpInterceptor', [ '$q', '$injector',function($q, $injector) { 
    var httpInterceptor = { 
        //响应失败的拦截器
        'responseError' : function(response) {
            return $q.reject(response);
        }, 
        //响应成功的拦截器
        'response' : function(response) {
            var rootScope = $injector.get('$rootScope'); 
            $injector.get('$rootScope').$status = response.status; 
            
            return response; 
        }, 
        'request' : function(config) {
            return config;
        },
        'requestError' : function(config){
            return $q.reject(config);
        } 
    } 
    return httpInterceptor; 
}])



// <div style="width:100%;white-space:nowrap;min-width:1440px;">
// 								<div class="dataTables_paginate paging_bootstrap">
// 									<ul class="pagination">
// 										<li class="active"><a href="javascript:;">1</a></li><li><a href="javascript:;" onclick="menuclick('/admin/admin.php?module=news&amp;action=list&amp;page=2');">2</a></li><li><a href="javascript:;" onclick="menuclick('/admin/admin.php?module=news&amp;action=list&amp;page=3');">3</a></li><li><a href="javascript:;" onclick="menuclick('/admin/admin.php?module=news&amp;action=list&amp;page=4');">4</a></li><li><a href="javascript:;" onclick="menuclick('/admin/admin.php?module=news&amp;action=list&amp;page=2');">Next →</a></li>
// 									</ul>
// 								</div>
// 							</div>
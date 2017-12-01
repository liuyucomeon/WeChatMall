from rest_framework.routers import DefaultRouter

from WeChat.views import auth, customer, news, order, login, commodity
from django.conf.urls import url, include

from WeChat.views.customer import CustomerAddressViewSet
from WeChat.views.order import ShoppingCartViewSet, OrderViewSet

router = DefaultRouter()
router.register(r'customerAddresses', CustomerAddressViewSet)
router.register(r'shoppingCarts', ShoppingCartViewSet)
router.register(r'orders', OrderViewSet)


urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^auth/$', auth.wechatVerify),
    url(r'^getAccessToken/$', auth.getAccessToken),
    # 用户授权回调
    url(r'^authRedirect/$', auth.authRedirect),
    # 授权认证时获取openid
    url(r'^webAccessToken/$', auth.getWebAccessToken),
    # 创建客户
    # url(r'^customers/$', customer.CustomerList.as_view(), name="customer-list1"),
    url(r'^customers/(?P<pk>[0-9]+)/$', customer.CustomerDetail.as_view(), name="customer-detail1"),
    url(r'^hotels/(?P<hotelId>[0-9]+)/newsTypes/$', news.NewsTypeView.as_view(),
        name='HotelNewsTypes-listw'),
    # 根据新闻类型获取新闻
    url(r'newsTypes/(?P<typeId>[0-9]+)/news/$', news.NewsByType.as_view(), name='newsByType-listw'),
    # 根据id获取新闻
    url(r'news/(?P<pk>[0-9]+)/$', news.NewsDetailView.as_view(), name='newsByType-list'),
    # 客户端根据酒店品牌获取新闻列表
    url(r'^hotels/(?P<hotelId>[0-9]+)/news/$', news.NewsView.as_view(),
        name='newsListByHotelw'),
    # 获取用户购物车商品列表(有效商品)
    url(r'^customers/(?P<pk>[0-9]+)/shoppingCarts/enabled/$', order.ShoppingCartByCustomer.as_view(),
        name='ShoppingCartByCustomer'),
    # 获取用户购物车商品列表(无效商品)
    url(r'^customers/(?P<pk>[0-9]+)/shoppingCarts/unabled/$', order.ShoppingCartByCustomer.as_view(),
        name='ShoppingCartByCustomer2'),
    # 微商城登录
    url(r'^customers/login/$', login.loginByOpenId, name='loginByOpenId'),
    # 查询商品
    url(r'^commoditys/(?P<pk>[0-9]+)/$', commodity.CommodityDetailView.as_view(), name='commmodityDetailw'),
    # 获取单个门店下的商品
    url(r'^hotelBranchs/(?P<branchId>[0-9]+)/commoditys/$', commodity.BranchCommoditysList.as_view()
        , name='BranchCommoditys-Listw'),
    # 获取单个门店下的商品（按类型）
    url(r'^hotelBranchs/(?P<branchId>[0-9]+)/commodityTypes/(?P<commodityType>[0-9]+)/commoditys/$',
        commodity.BranchCommoditysList.as_view(), name='BranchCommoditysByType-Listw'),
    # 获取单个门店商品类型
    url(r'^hotelBranchs/(?P<branchId>[0-9]+)/commodityTypes/$', commodity.BranchCommodityTypesList.as_view()
        , name='BranchCommodityTypes-List'),
]
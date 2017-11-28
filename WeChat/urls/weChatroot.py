from rest_framework.routers import DefaultRouter

from WeChat.views import auth, customer, news
from django.conf.urls import url, include

from WeChat.views.customer import CustomerAddressViewSet
from WeChat.views.order import ShoppingCartViewSet

router = DefaultRouter()
router.register(r'customerAddresses', CustomerAddressViewSet)
router.register(r'shoppingCarts', ShoppingCartViewSet)


urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^auth/$', auth.wechatVerify),
    url(r'^getAccessToken/$', auth.getAccessToken),
    # 用户授权回调
    url(r'^authRedirect/$', auth.authRedirect),
    url(r'^customers/$', customer.CustomerList.as_view(), name="customer-list1"),
    url(r'^customers/(?P<pk>[0-9]+)/$', customer.CustomerDetail.as_view(), name="customer-detail1"),
    url(r'^hotels/(?P<hotelId>[0-9]+)/newsTypes/$', news.NewsTypeView.as_view(),
        name='HotelNewsTypes-listw'),
    # 根据新闻类型获取新闻
    url(r'newsTypes/(?P<typeId>[0-9]+)/news/$', news.NewsByType.as_view(), name='newsByType-listw'),
    # 根据新闻类型获取新闻
    url(r'news/(?P<pk>[0-9]+)/$', news.NewsDetailView.as_view(), name='newsByType-list'),

]
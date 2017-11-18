from django.conf.urls import include, url
from rest_framework.routers import DefaultRouter

from WebAdmin.views import verification, login, news, common, menu, hotel, staff
from WebAdmin.views.hotel import HotelViewSet, HotelBranchViewSet
from WebAdmin.views.menu import WeChatMenuViewSet
from WebAdmin.views.news import NewsTypeViewSet, NewsViewSet
from WebAdmin.views.staff import  StaffViewSet

router = DefaultRouter()
# router.register(r'users', UserViewSet)
router.register(r'staffs', StaffViewSet)
router.register(r'hotels', HotelViewSet)
router.register(r'hotelBranchs', HotelBranchViewSet)
router.register(r'newsTypes', NewsTypeViewSet)
router.register(r'news', NewsViewSet)
router.register(r'weChatMenus', WeChatMenuViewSet)

# The API URLs are now determined automatically by the router.
# Additionally, we include the login URLs for the browsable API.
urlpatterns = [
    url(r'^', include(router.urls)),
    # url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^register_code/(?P<phone>[0-9]+)/$', verification.register_code),
    url(r'^login/$', login.login),
    url(r'^logout/$', login.logout),
    url(r'^hotels/(?P<hotelId>[0-9]+)/newsTypes/$', news.HotelNewsTypesList.as_view(),
        name='HotelNewsTypes-list'),
    # 交换新闻顺序
    url(r'^hotels/(?P<hotelId>[0-9]+)/newsTypes/swap/$',
        news.swapNewsTypeOrder, name='swapNewsOrder'),
    # 交换微信目录顺序
    url(r'^hotels/(?P<hotelId>[0-9]+)/wechatMenus/swap/$',
        menu.swapWechatMenuOrder, name='swapWechatMenuOrder'),
    # 酒店微信菜单
    url(r'^hotels/(?P<hotelId>[0-9]+)/wechatMenus/$', menu.HotelBranchMenusList.as_view(),
        name='HotelBranchWechatMenus-list'),
    # 发布菜单到微信公众号
    url(r'^hotels/(?P<hotelId>[0-9]+)/wechatMenus/publish/$', menu.publishWechatMenu,
        name='publishWechatMenu'),
    url(r'^upload/NewsTypePic/$', common.uploadNewsTypePic, name='uploadNewsTypePic'),
    url(r'^upload/NewsPic/$', common.uploadNewsPic, name='uploadNewsPic'),
    url(r'^upload/NewsAudio/$', common.uploadNewsAudio, name='uploadNewsAudio'),
    url(r'^deleteFile/$', common.deleteFile, name='deleteFile'),
    url(r'^wechatVerify/$', verification.wechatVerify),
    # 根据token获取酒店信息
    url(r'^hotelBranchByToken/$', hotel.getHotelBranchByToken, name="getHotelBranchByToken"),
    # 根据token获取员工信息
    url(r'^staffByToken/$', staff.getStaffByToken, name="getStaffByToken"),
]

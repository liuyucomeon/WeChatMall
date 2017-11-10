from django.conf.urls import include, url
from rest_framework.routers import DefaultRouter

from WebAdmin.views import verification, login, news, common
from WebAdmin.views.hotel import HotelViewSet, HotelBranchViewSet
from WebAdmin.views.news import NewsTypeViewSet, NewsViewSet
from WebAdmin.views.staff import  StaffViewSet

router = DefaultRouter()
# router.register(r'users', UserViewSet)
router.register(r'staffs', StaffViewSet)
router.register(r'hotels', HotelViewSet)
router.register(r'hotelBranchs', HotelBranchViewSet)
router.register(r'newsTypes', NewsTypeViewSet)
router.register(r'news', NewsViewSet)

# The API URLs are now determined automatically by the router.
# Additionally, we include the login URLs for the browsable API.
urlpatterns = [
    url(r'^', include(router.urls)),
    # url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^register_code/(?P<phone>[0-9]+)/$', verification.register_code),
    url(r'^login/$', login.login),
    url(r'^logout/$', login.logout),
    url(r'^hotelBranchs/(?P<branchId>[0-9]+)/newsTypes/$', news.HotelBranchNewsTypesList.as_view(),
        name='HotelBranchNewsTypes-list'),
    url(r'^hotelBranchs/(?P<branchId>[0-9]+)/newsTypes/swap/$',
        news.swapNewsTypeOrder, name='swapNewsOrder'),
    url(r'^upload/NewsTypePic/$', common.uploadNewsTypePic, name='uploadNewsTypePic'),
    url(r'^upload/NewsPic/$', common.uploadNewsPic, name='uploadNewsPic'),
    url(r'^upload/NewsAudio/$', common.uploadNewsAudio, name='uploadNewsAudio'),
    url(r'^deleteFile/$', common.deleteFile, name='deleteFile'),
    url(r'^wechatVerify/$', verification.wechatVerify),
]

from django.conf.urls import include, url
from rest_framework.routers import DefaultRouter

from WebAdmin.views import verification, login, news, common, menu, hotel, staff, commodity, order
from WebAdmin.views.commodity import CommodityTypeViewSet, CommodityViewSet, CommodityFormatViewSet
from WebAdmin.views.customer import CustomerViewSet
from WebAdmin.views.hotel import HotelViewSet, HotelBranchViewSet
from WebAdmin.views.menu import WeChatMenuViewSet
from WebAdmin.views.news import NewsTypeViewSet, NewsViewSet
from WebAdmin.views.order import OrderViewSet
from WebAdmin.views.staff import  StaffViewSet

router = DefaultRouter()
# router.register(r'users', UserViewSet)
router.register(r'staffs', StaffViewSet)
router.register(r'hotels', HotelViewSet)
router.register(r'hotelBranchs', HotelBranchViewSet)
router.register(r'newsTypes', NewsTypeViewSet)
router.register(r'news', NewsViewSet)
router.register(r'weChatMenus', WeChatMenuViewSet)
router.register(r'commodityTypes', CommodityTypeViewSet)
router.register(r'commoditys', CommodityViewSet)
router.register(r'commodityFormats', CommodityFormatViewSet)
router.register(r'customers', CustomerViewSet)
router.register(r'orders', OrderViewSet)


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
    # 根据新闻类型获取新闻
    url(r'newsTypes/(?P<typeId>[0-9]+)/news/$', news.NewsByType.as_view(), name='newsByType-list'),
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
    # 上传商品图片
    url(r'^upload/CommodityPic/$', common.uploadCommodityPic, name='uploadCommodityPic'),
    # 上传商品规格图片
    url(r'^upload/CommodityFormatPic/$', common.uploadCommodityFormatPic, name='uploadCommodityFormatPic'),
    # 上传商品类型图片
    url(r'^upload/CommodityTypePic/$', common.uploadCommodityTypePic, name='uploadCommodityTypePic'),
    url(r'^deleteFile/$', common.deleteFile, name='deleteFile'),
    url(r'^wechatVerify/$', verification.wechatVerify),
    # 根据token获取酒店信息
    url(r'^hotelBranchByToken/$', hotel.getHotelBranchByToken, name="getHotelBranchByToken"),
    # 根据token获取员工信息
    url(r'^staffByToken/$', staff.getStaffByToken, name="getStaffByToken"),
    # 交换商品类型
    url(r'^hotelBranchs/(?P<branchId>[0-9]+)/commodityTypes/swap/$',commodity.swapCommodityTypeOrder
        , name='swapCommodityTypeOrder'),
    # 获取单个门店商品类型
    url(r'^hotelBranchs/(?P<branchId>[0-9]+)/commodityTypes/$', commodity.BranchCommodityTypesList.as_view()
        , name='BranchCommodityTypes-List'),
    # 获取单个门店下的商品
    url(r'^hotelBranchs/(?P<branchId>[0-9]+)/commoditys/$', commodity.BranchCommoditysList.as_view()
        , name='BranchCommoditys-List'),
    # 获取单个门店下的商品（按类型）
    url(r'^hotelBranchs/(?P<branchId>[0-9]+)/commodityTypes/(?P<commodityType>[0-9]+)/commoditys/$',
        commodity.BranchCommoditysList.as_view(), name='BranchCommoditysByType-List'),
    # 订单搜索
    url(r'^hotelBranchs/(?P<branchId>[0-9]+)/orders/', order.OrderSearchView.as_view(), name='searchOrder'),
    # 根据商品id获取所以规格
    url(r'^commoditys/(?P<commodityId>[0-9]+)/commodityFormats/$', commodity.getCommodityFormatsByCommodity
        , name='CommodityFormatsByCommodity'),
    # 获取快递公司列表
    url(r'^trackCompanys/$', order.TrackCompanyListView.as_view(), name='trackCompanys')
]

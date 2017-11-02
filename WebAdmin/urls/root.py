from django.conf.urls import include, url
from rest_framework.routers import DefaultRouter

from WebAdmin.views import verification, login
from WebAdmin.views.hotel import HotelViewSet, HotelBranchViewSet
from WebAdmin.views.staff import UserViewSet, StaffViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'staffs', StaffViewSet)
router.register(r'hotels', HotelViewSet)
router.register(r'hotelBranchs', HotelBranchViewSet)

# The API URLs are now determined automatically by the router.
# Additionally, we include the login URLs for the browsable API.
urlpatterns = [
    url(r'^', include(router.urls)),
    # url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^register_code/(?P<phone>[0-9]+)/$', verification.register_code),
    url(r'^login/$', login.login)
]

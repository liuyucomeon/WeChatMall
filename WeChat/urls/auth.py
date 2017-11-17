from WeChat.views import auth
from django.conf.urls import url

urlpatterns = [
    url(r'^auth/$', auth.wechatVerify),
    url(r'^getAccessToken/$', auth.getAccessToken),
]
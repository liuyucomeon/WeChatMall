from django.conf.urls import include, url

from WeChat.urls import weChatroot

urlpatterns = [
    url(r'^', include(weChatroot.urlpatterns, namespace='weChatroot')),
]
from django.conf.urls import include, url

from WeChat.urls import auth

urlpatterns = [
    url(r'^', include(auth.urlpatterns ,namespace='auth')),
]
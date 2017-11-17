from django.conf.urls import include, url

from WebAdmin.urls import root

urlpatterns = [
    url(r'', include(root.urlpatterns, namespace='root')),
]

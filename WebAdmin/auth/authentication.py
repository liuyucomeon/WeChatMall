import pickle

from django_redis import get_redis_connection
from rest_framework import authentication, exceptions

NOT_AUTH_URL = ["/WebAdmin/","/docs/","/WebAdmin/login/","/WebAdmin/register_code/"]

class MyTokenAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        if request.path in NOT_AUTH_URL:
            return
        token = request.META.get('HTTP_TOKEN')
        if not token:
            raise exceptions.AuthenticationFailed('No token')
        redisDB = get_redis_connection('default')
        staffByte = redisDB.get("token:" + token)
        if not staffByte:
            raise exceptions.AuthenticationFailed('token错误')
        staff =  pickle.loads(staffByte)
        request.staff = staff
        return

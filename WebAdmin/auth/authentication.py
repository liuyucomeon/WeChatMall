import pickle
import re

from django_redis import get_redis_connection
from rest_framework import authentication, exceptions

NOT_AUTH_URL = [r"^/WebAdmin/$",r"^/docs/$",r"^/WebAdmin/login/$",r"^/WebAdmin/register_code/\d+/$",
                r"^/WebAdmin/wechatVerify/"]

class MyTokenAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        for path in NOT_AUTH_URL:
            if re.match(path, request.path):
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

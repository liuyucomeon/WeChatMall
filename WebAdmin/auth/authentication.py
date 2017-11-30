import pickle
import re

import logging

from django.core.exceptions import ObjectDoesNotExist
from django_redis import get_redis_connection
from rest_framework import authentication, exceptions
from WebAdmin.models import Customer

logger = logging.getLogger('django')
NOT_AUTH_URL = [r"^/WebAdmin/$",r"^/docs/$",r"^/WebAdmin/login/$",r"^/WebAdmin/register_code/\d+/$",
                r"^/WebAdmin/wechatVerify/",r'/WeChat/auth/$',r"/WeChat/.*"]


class MyTokenAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        logger.info("开始验证")

        for path in NOT_AUTH_URL:
            if re.match(path, request.path):
                logger.info("跳过验证")
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


def validateCustomer(id, openid):
    """
    验证顾客操作权限
    :param id: 顾客id
    :param openid: 公众号下唯一id
    :return: 
    """
    try:
        customer = Customer.objects.get(id=id, follower__openid=openid)
    except ObjectDoesNotExist:
        raise exceptions.PermissionDenied("没有权限")

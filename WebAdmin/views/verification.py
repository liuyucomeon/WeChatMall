import hashlib
import json
import logging

from django_redis import get_redis_connection
from rest_framework import response, status
from rest_framework.decorators import api_view, schema
from WebAdmin.schema.webSchema import registerSchema
from WebAdmin.utils.common import getRandomChar
from WebAdmin.utils.convertCoding import convertByteFromMap
from WebAdmin.utils.sendSMS import sendRegisterCode
from django.http import HttpResponse

logger = logging.getLogger('django')

@api_view(['GET'])
@schema(registerSchema)
def register_code(request, phone):
    """
    获取注册验证码
    """
    redisDB = get_redis_connection('default')
    key = "register:"+phone
    VerificationCode = getRandomChar(4)
    # 查看key是否存在
    telInfo = redisDB.hgetall(key)
    if telInfo:
        telInfo = convertByteFromMap(redisDB.hgetall(key))
        # 连续操作三次，需等待半小时
        if int(telInfo["count"]) >= 3:
            return response.Response({"error_msg": ["连续操作次数过多，请30分钟后尝试"]},
                                     status=status.HTTP_406_NOT_ACCEPTABLE)
        # 设置过期时间30分钟
        redisDB.expire(key, 15 * 60)
        redisDB.hincrby(key, "count", 1)
        redisDB.hset(key, "code", VerificationCode)
    else:
        redisDB.hmset(key, {"count": 1, "code": VerificationCode})
    # 发送短信
    if not sendRegisterCode(phone, VerificationCode):
        return response.Response({"error_msg": ["发送验证码失败"]},
                                 status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return response.Response(status=status.HTTP_200_OK)


@api_view(['GET'])
def wechatVerify(request):
    data = request.query_params
    if len(data) == 0:
        logger.info("未接收到微信验证参数")
    logger.info("微信服务器请求参数为："+str(data))

    signature = data['signature']
    timestamp = data['timestamp']
    nonce = data['nonce']
    echostr = data['echostr']
    token = "TcZHbjlQQqGTelkrk0phenaigaoke"  # 请按照公众平台官网\基本配置中信息填写

    parmList = [token, timestamp, nonce]
    parmList.sort()
    paramStr = ''.join(parmList)

    hashcode = hashlib.sha1(paramStr.encode()).hexdigest()
    if hashcode == signature:
        logger.info("相等")
        # return response.Response(data=echostr)
        return HttpResponse(echostr)
    else:
        logger.info("不相等")
        return HttpResponse()

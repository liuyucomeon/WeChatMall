from django_redis import get_redis_connection
from rest_framework import response, status
from rest_framework.decorators import api_view, schema
from WebAdmin.schema.webSchema import registerSchema
from WebAdmin.utils.common import getRandomChar
from WebAdmin.utils.convertCoding import convertByteFromMap
from WebAdmin.utils.sendSMS import sendRegisterCode


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

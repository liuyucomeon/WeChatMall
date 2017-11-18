import hashlib
import json
import logging

import requests
from django.http import HttpResponse
from django_redis import get_redis_connection
from rest_framework import response
from rest_framework.decorators import api_view, schema

from WebAdmin.schema.webSchema import tokenSchema

logger = logging.getLogger('django')

@api_view(['GET'])
# @parser_classes((XMLParser,))
def wechatVerify(request):
    """
    微信接口配置信息回调接口
    :param request: 
    :return: 
    """
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
        return ""

# @api_view(['POST'])
# def wechatVerify(request):
#     data = request.body
#     msg = parse_message(data.decode())
#     return response.Response()



@api_view(['GET'])
@schema(tokenSchema)
def getAccessToken(request):
    """
    获取access_token ,有效期目前为2个小时
    """
    hotel = request.staff.branch.hotel
    accessToken = _getAccessToken(hotel)
    return response.Response(data={"accessToken":accessToken})


def _getAccessToken(hotel):
    redisDB = get_redis_connection('default')
    # 将accessToken保存在redis（两小时）
    accessToken = redisDB.get("accessToken:"+str(hotel.id))
    if accessToken is None:
        result = requests.get("https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" +
                              hotel.appId + "&secret=" + hotel.appsecret)
        accessToken = json.loads(result.content.decode('utf-8'))['access_token']
        redisDB.set("accessToken:"+str(hotel.id), accessToken)
    return accessToken
import hashlib
import json
import logging

import requests
from django.db import IntegrityError
from django.http import HttpResponse
from django_redis import get_redis_connection
from rest_framework import response, status
from rest_framework.decorators import api_view, schema
from rest_framework.generics import get_object_or_404
from wechatpy import parse_message

from WeChatMall.settings import wechatUrl
from WebAdmin.models import Hotel, Follower
from WebAdmin.schema.webSchema import tokenSchema, webAccessTokenSchema
from WebAdmin.utils.common import formatTimeStamp, updateByDict

logger = logging.getLogger('django')



@api_view(['GET','POST'])
# @parser_classes((XMLParser,))
def wechatVerify(request):
    """
    微信接口配置信息回调接口
    :param request: 
    :return: 
    """
    # 验证微信公众号回调地址
    if request.method == "GET":
        echostr = verifyCallUrl(request)
        return HttpResponse(echostr)
    else:
        data = request.body
        msg = parse_message(data.decode('utf-8'))
        # 订阅
        if msg.event == "subscribe":
            saveUserInfo(msg)
        # 取消订阅
        elif msg.event == "unsubscribe":
            invalidUser(msg)
        logger.info(data)
        return response.Response()

@api_view(['GET'])
@schema(tokenSchema)
def getAccessToken(request):
    """
    获取access_token ,有效期目前为2个小时
    """
    hotel = request.staff.branch.hotel
    accessToken = _getAccessToken(hotel)
    return response.Response(data={"accessToken":accessToken})


@api_view(['GET'])
@schema(webAccessTokenSchema)
def getWebAccessToken(request):
    """
    获取web_access_token(网页授权)
        :param
            code:重定向url的code
            state:重定向url的state
    """
    data = request.query_params
    hotel = Hotel.objects.get(id=data["state"])
    url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" + str(hotel.appId) + \
            "&secret=" +  hotel.appsecret + "&code=" + data["code"] + "&grant_type=authorization_code"
    result = requests.get(url).text
    if "errcode" in result:
        return response.Response(data=result, status=status.HTTP_400_BAD_REQUEST)

    result = json.loads(result)
    openid = result["openid"]
    return response.Response(data={"openid":openid})


@api_view(['GET'])
def authRedirect(request):
    """
    用户授权后回调接口
    """
    logger.info(request.query_params)
    return response.Response()


def _getAccessToken(hotel):
    redisDB = get_redis_connection('default')
    # 将accessToken保存在redis（两小时）
    accessToken = redisDB.get("accessToken:"+str(hotel.id))
    if accessToken is None:
        result = requests.get("https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" +
                              hotel.appId + "&secret=" + hotel.appsecret)
        accessToken = json.loads(result.content.decode('utf-8'))['access_token']
        redisDB.setex("accessToken:"+str(hotel.id), 60*60*2, accessToken)
        return accessToken
    return accessToken.decode('utf-8')


def verifyCallUrl(request):
    data = request.query_params
    if len(data) == 0:
        logger.info("未接收到微信验证参数")
    logger.info("微信服务器请求参数为：" + str(data))

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
        return echostr
    else:
        logger.info("不相等")
        return ""

def saveUserInfo(msg):
    """
    关注时保存用户信息
    :param msg: 
    :return: 
    """
    fromUser = msg.source
    toUser = msg.target
    hotel = get_object_or_404(Hotel, originId=toUser)
    accessToken = _getAccessToken(hotel)
    url = wechatUrl + "user/info?access_token=" + accessToken + "&openid=" +  fromUser + "&lang=zh_CN"
    result = requests.get(url)
    data = json.loads(result.content.decode('utf-8'))
    logger.info("openid="+data['openid'] + ",nickname=" + data["nickname"] + "关注公众号")
    followers = Follower.objects.filter(openid=data["openid"], hotel_id=hotel.id)
    if followers.count() > 0:
        follower = followers[0]
        updateByDict(follower, data)
        follower.subscribe_time = formatTimeStamp(data["subscribe_time"])
        follower.isActive = True
        follower.save()
    else:
        follower = Follower(openid=data["openid"], nickname=data["nickname"], sex=data["sex"],
                        language=data["language"], city=data["city"], province=data["province"],
                        country=data["country"], headimgurl=data["headimgurl"],
                        subscribe_time=formatTimeStamp(data["subscribe_time"]),hotel_id=hotel.id)
        try:
            follower.save()
        except IntegrityError:
            logger.error("数据库唯一键重复，用户已存在")

def invalidUser(msg):
    """
    将用户变为未订阅状态
    :param msg: 
    :return: 
    """
    fromUser = msg.source
    toUser = msg.target
    hotel = get_object_or_404(Hotel, originId=toUser)
    follower = get_object_or_404(Follower, openid=fromUser, hotel_id=hotel.id)
    follower.isActive = False
    follower.save()


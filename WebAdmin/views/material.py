import json

import requests
from django_redis import get_redis_connection
from rest_framework import status
from rest_framework.decorators import api_view, schema
from rest_framework.response import Response

from WebAdmin.models import Hotel


def getAccessToken(hotel):
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


@api_view(['POST'])
def pubGraphicMt(request):
    """
    上传图文消息内的图片获取URL  \n
        :param request:
                    file:图片
                    hotelId:酒店id
        :return: 
    """
    data = request.data
    hotel = Hotel.objects.get(id=data["hotelId"])
    accessToken = getAccessToken(hotel)
    file = request.FILES['file']
    files =  { 'media' : ('tmp.jpg',file,'image/jpg')}
    url = "https://api.weixin.qq.com/cgi-bin/media/uploadimg?access_token=" + accessToken
    result = requests.post(url, files=files)
    if "errcode" in result.text:
        return Response(result.text, status=status.HTTP_400_BAD_REQUEST)
    return Response(result.text)
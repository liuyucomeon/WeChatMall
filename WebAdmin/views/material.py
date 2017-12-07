import json

import requests
from django_redis import get_redis_connection
from rest_framework.decorators import api_view, schema

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
@schema()
def pubGraphicMt(request):
    """
    新增图文素材 \n
        :param request: 
        :return: 
    """
    data = request.data
    hotel = Hotel.objects.get(data["hotelId"])
    accessToken = getAccessToken(hotel)
    url = "https://api.weixin.qq.com/cgi-bin/media/uploadimg?access_token=" + accessToken
    requests.post(url, )
    pass
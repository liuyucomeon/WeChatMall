import pickle

from django.core.exceptions import ObjectDoesNotExist
from django_redis import get_redis_connection
from rest_framework import response, status
from rest_framework.decorators import api_view, schema

from WebAdmin.models import Customer, Follower
from WebAdmin.schema.webSchema import weChatLoginSchema
from WebAdmin.utils.common import generateToken


@api_view(['POST'])
@schema(weChatLoginSchema)
def loginByOpenId(request):
    """
    微商城默认登录 
    """
    data = request.data
    try:
        customer = Customer.objects.get(follower__openid=data["openid"])
    except ObjectDoesNotExist:
        try:
            follower = Follower.objects.get(openid=data["openid"], isActive=True)
            customer = Customer.objects.create(name=follower.nickname, follower=follower)
        except ObjectDoesNotExist:
            return response.Response({"error_msg": ["客户信息不存在"]}, status=status.HTTP_400_BAD_REQUEST)

    redisDB = get_redis_connection('default')
    # 生成token
    token = generateToken()
    staffPic = pickle.dumps(customer)

    redisDB.setex("wtoken:" + token, 2 * 60 * 60, staffPic)
    return response.Response({"token": token}, status=status.HTTP_200_OK)
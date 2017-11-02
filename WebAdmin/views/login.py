import pickle

from django.core.exceptions import ObjectDoesNotExist
from django_redis import get_redis_connection
from rest_framework import response, status
from rest_framework.decorators import api_view, schema

from WebAdmin.models import Staff
from WebAdmin.schema.webSchema import loginSchema
from WebAdmin.utils.common import generateToken


@api_view(['POST'])
@schema(loginSchema)
def login(request):
    data = request.data
    try:
        staff = Staff.objects.get(user__username=data['username'])
    except ObjectDoesNotExist:
        return response.Response({"error_msg": ["用户名或密码错误"]}, status=status.HTTP_400_BAD_REQUEST)
    if staff.user.password != data['password']:
        return response.Response({"error_msg": ["用户名或密码错误"]}, status=status.HTTP_400_BAD_REQUEST)

    redisDB = get_redis_connection('default')
    # 生成token
    token = generateToken()
    staffPic = pickle.dumps(staff)
    redisDB.set("tokenU:"+staff.user.username, token)
    redisDB.set("token:"+token, staffPic)

    return response.Response({"token": token}, status=status.HTTP_200_OK)

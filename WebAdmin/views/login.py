import pickle

from django.core.exceptions import ObjectDoesNotExist
from django_redis import get_redis_connection
from rest_framework import response, status
from rest_framework.decorators import api_view, schema

from WebAdmin.models import Staff
from WebAdmin.schema.webSchema import loginSchema,logoutSchema
from WebAdmin.utils.common import generateToken


@api_view(['POST'])
@schema(loginSchema)
def login(request):
    """
    公众号管理员登录 
    """
    data = request.data
    try:
        staff = Staff.objects.get(user__username=data['username'])
    except ObjectDoesNotExist:
        return response.Response({"error_msg": ["用户名或密码错误"]}, status=status.HTTP_400_BAD_REQUEST)
    if staff.user.password != data['password'] or staff.user.is_superuser==False:
        return response.Response({"error_msg": ["用户名或密码错误"]}, status=status.HTTP_400_BAD_REQUEST)


    redisDB = get_redis_connection('default')
    # 生成token
    token = generateToken()
    staffPic = pickle.dumps(staff)

    redisDB.rpush("tokenList:" +staff.user.username, token)
    redisDB.expire("tokenList:"+staff.user.username, 24*60*60)
    redisDB.setex("token:"+token ,24*60*60, staffPic)

    return response.Response({"token": token}, status=status.HTTP_200_OK)


@api_view(['POST'])
@schema(logoutSchema)
def logout(request):
    """
    公众号管理员退出登录 
    """
    staff = request.staff
    redisDB = get_redis_connection('default')
    # 删除该用户所有token
    tokenList = redisDB.lrange("tokenList:"+staff.user.username, 0, -1)
    for token in tokenList:
        redisDB.delete("token:"+token.decode())
    redisDB.delete("tokenList:" + staff.user.username)
    return response.Response(status=status.HTTP_204_NO_CONTENT)

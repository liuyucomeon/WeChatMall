from django.contrib.auth.models import User
from django_redis import get_redis_connection
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.schemas import AutoSchema

from WebAdmin.models import Staff
from WebAdmin.schema.webSchema import CustomSchema
from WebAdmin.serializers.staff import UserSerializer, StaffSerializer
from WebAdmin.utils.convertCoding import convertByteFromMap


# class UserViewSet(viewsets.ModelViewSet):
#     """
#     This viewset automatically provides `list` and `detail` actions.
#     """
#     queryset = User.objects.all()
#     serializer_class = UserSerializer


class StaffViewSet(viewsets.ModelViewSet):
    """
    create:
        创建一个员工
        ---
        parameters:
            - user: 
                - code: 验证码
                - last_login: 上次登录
                - is_superuser: 是否是超级用户
                - username: 用户账号（0：不是，1：是）
                - password: 密码
                - email: 邮件
                - is_staff: 是否是员工（0：不是，1：是）
                - is_active: 是否激活（0：不是，1：是）
                - date_joined: 加入日期
            - id_number: 身份证
            - icon: 图标
            - gender: 性别
            - position: 职位
            - branch_id: 酒店id
            - user_id: 关联user_id
            - nickname: 昵称
        responseMessages:
            - code: 201
              message: Created
    
    partial_update:
        根据id局部更新员工
    update:
        根据id更新员工
    destroy:
        根据id删除员工
    list:
        查询员工列表
    retrieve:
        根据id查询员工
    login:
        登录
    """
    queryset = Staff.objects.all()
    serializer_class = StaffSerializer
    schema = CustomSchema()

    def create(self, request):
        serializer = StaffSerializer(data=request.data)
        if serializer.is_valid():
            staff = request.data
            # 验证码是否匹配
            redisDB = get_redis_connection('default')
            telInfo = redisDB.hgetall("register:"+ staff['user']['username'])
            # redis里没有验证码
            if not telInfo:
                return Response({"code": ["验证码错误"]}, status=status.HTTP_400_BAD_REQUEST)

            telInfo = convertByteFromMap(telInfo)
            if telInfo["code"] != staff["code"]:
                return Response({"code": ["验证码错误"]}, status=status.HTTP_400_BAD_REQUEST)
            if User.objects.filter(username=staff['user']['username']).exists():
                return Response({"username": ["用户名已存在"]}, status=status.HTTP_400_BAD_REQUEST)

            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def list(self, request):
        staffs = Staff.objects.all()
        page = self.paginate_queryset(staffs)
        # 去掉密码
        for staff in page:
            staff.user.password = ""

        if page is not None:
            serializer = StaffSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = StaffSerializer(staffs, many=True)
        return Response(serializer.data)


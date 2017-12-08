from rest_framework import viewsets

from WebAdmin.models import Follower
from WebAdmin.schema.webSchema import CustomSchema
from WebAdmin.serializers.follower import FollowerSerializer


class FollowerViewSet(viewsets.ModelViewSet):
    """
    create:
        创建微信关注者
    partial_update:
        根据id局部更新微信关注者
    update:
        根据id更新微信关注者
    destroy:
        根据id删除微信关注者
    list:
        查询微信关注者
    retrieve:
        根据id查询微信关注者
    """
    queryset = Follower.objects.all()
    serializer_class = FollowerSerializer
    schema = CustomSchema()


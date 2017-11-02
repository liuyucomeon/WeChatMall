from django.db.models import Max
from rest_framework import viewsets, status
from rest_framework.response import Response

from WebAdmin.models.news import NewsType
from WebAdmin.schema.webSchema import CustomSchema
from WebAdmin.serializers.news import NewsTypeSerializer


class NewsTypeViewSet(viewsets.ModelViewSet):
    """
    create:
        创建新闻类型
    partial_update:
        根据id局部更新新闻类型
    update:
        根据id更新新闻类型
    destroy:
        根据id删除新闻类型
    list:
        查询新闻类型列表
    retrieve:
        根据id查询新闻类型
    """
    queryset = NewsType.objects.all()
    serializer_class = NewsTypeSerializer
    schema = CustomSchema()

    def create(self, request, *args, **kwargs):
        data = request.data
        maxOrder = NewsType.objects.all().aggregate(Max('order'))
        data['order'] = maxOrder['order__max'] + 1
        serializer = NewsTypeSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

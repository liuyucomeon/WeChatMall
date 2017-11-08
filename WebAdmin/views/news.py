from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Max
from rest_framework import viewsets, status, mixins, generics
from rest_framework.decorators import api_view, schema
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response

from WebAdmin.models.news import NewsType
from WebAdmin.schema.webSchema import CustomSchema, swapNewsSchema
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
        maxOrder = NewsType.objects.filter(branch_id=data['branch']).aggregate(Max('order'))
        maxOrderNum = 0
        if maxOrder['order__max']:
            maxOrderNum = maxOrder['order__max']
        data['order'] = maxOrderNum + 1
        serializer = NewsTypeSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class HotelBranchNewsTypesList(mixins.ListModelMixin,
                               generics.GenericAPIView):

    queryset = NewsType.objects.all()
    serializer_class = NewsTypeSerializer
    schema = CustomSchema()

    def get(self, request, branchId):
        """
        获取单个酒店新闻类型
        """
        newsTypes = NewsType.objects.filter(branch_id=branchId)
        page = self.paginate_queryset(newsTypes)
        if page is not None:
            serializer = NewsTypeSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = NewsTypeSerializer(newsTypes, many=True)
        return Response(serializer.data)

@api_view(['POST'])
@schema(swapNewsSchema)
def swapNewsTypeOrder(request, branchId):
        """
        交换新闻类型顺序
        """
        data = request.data
        newsType1 = get_object_or_404(NewsType, pk=data['newsType1'], branch=branchId)
        newsType2 = get_object_or_404(NewsType, pk=data['newsType2'], branch=branchId)

        tmp = newsType1.order
        newsType1.order = newsType2.order
        newsType2.order = tmp
        newsType1.save()
        newsType2.save()
        return Response(status.HTTP_200_OK)
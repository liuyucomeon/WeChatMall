from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Max
from django.http import HttpResponseRedirect
from django.shortcuts import redirect
from django.urls import reverse
from rest_framework import viewsets, status, mixins, generics
from rest_framework.decorators import api_view, schema
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response

from WebAdmin.models.news import NewsType, News
from WebAdmin.schema.webSchema import CustomSchema, swapNewsSchema
from WebAdmin.serializers.news import NewsTypeSerializer, NewsSerializer
from WebAdmin.utils.page import TwentySetPagination


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
        maxOrder = NewsType.objects.filter(hotel_id=data['hotel']).aggregate(Max('order'))
        maxOrderNum = 0
        if maxOrder['order__max']:
            maxOrderNum = maxOrder['order__max']
        data['order'] = maxOrderNum + 1
        serializer = NewsTypeSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class HotelNewsTypesList(mixins.ListModelMixin,
                               generics.GenericAPIView):

    queryset = NewsType.objects.all()
    serializer_class = NewsTypeSerializer
    schema = CustomSchema()

    def get(self, request, hotelId):
        """
        获取单个酒店新闻类型
        """
        newsTypes = NewsType.objects.filter(hotel_id=hotelId)
        page = self.paginate_queryset(newsTypes)
        if page is not None:
            serializer = NewsTypeSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = NewsTypeSerializer(newsTypes, many=True)
        return Response(serializer.data)

@api_view(['POST'])
@schema(swapNewsSchema)
def swapNewsTypeOrder(request, hotelId):
        """
        交换新闻类型顺序
        """
        data = request.data
        newsType1 = get_object_or_404(NewsType, pk=data['newsType1'], hotel=hotelId)
        newsType2 = get_object_or_404(NewsType, pk=data['newsType2'], hotel=hotelId)

        tmp = newsType1.order
        newsType1.order = newsType2.order
        newsType2.order = tmp
        newsType1.save()
        newsType2.save()
        return Response(status.HTTP_200_OK)


class NewsByType(mixins.ListModelMixin,generics.GenericAPIView):
    """
    获取新闻类型下的所有新闻
    :param request:
    :param typeId: 新闻类型
    :return:
    """
    queryset = NewsType.objects.all()
    serializer_class = NewsSerializer
    schema = CustomSchema()
    pagination_class = TwentySetPagination

    def get(self, request, typeId):
        """
        获取新闻类型下的所有新闻
        """
        news = News.objects.filter(type_id=typeId)
        page = self.paginate_queryset(news)
        serializer = NewsSerializer(page, many=True)
        return self.get_paginated_response(serializer.data)


class NewsViewSet(viewsets.ModelViewSet):
    """
    create:
        创建新闻
    partial_update:
        根据id局部更新新闻
    update:
        根据id更新新闻
    destroy:
        根据id删除新闻
    list:
        查询新闻
    retrieve:
        根据id查询新闻
    """
    queryset = News.objects.all()
    serializer_class = NewsSerializer
    schema = CustomSchema()

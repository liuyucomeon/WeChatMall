from rest_framework.generics import ListAPIView, RetrieveAPIView, get_object_or_404
from rest_framework.response import Response

from WebAdmin.models import NewsType, News
from WebAdmin.schema.webSchema import CustomSchema
from WebAdmin.serializers.news import NewsTypeSerializer, NewsSerializer
from WebAdmin.utils.page import TwentySetPagination


class NewsTypeView(ListAPIView):

    queryset = NewsType.objects.all()
    serializer_class = NewsTypeSerializer

    def get(self, request, *args, **kwargs):
        """
        客户端获取新闻类型列表
        """
        hotelId = kwargs["hotelId"]
        newsTypes = NewsType.objects.filter(hotel_id=hotelId)
        page = self.paginate_queryset(newsTypes)
        if page is not None:
            serializer = NewsTypeSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = NewsTypeSerializer(newsTypes, many=True)
        return Response(serializer.data)


class NewsView(ListAPIView):

    queryset = News.objects.all()
    serializer_class = NewsSerializer

    def get(self, request, *args, **kwargs):
        """
        客户端根据酒店品牌获取新闻列表
        """
        hotelId = kwargs["hotelId"]
        news = News.objects.filter(type__hotel_id=hotelId)
        page = self.paginate_queryset(news)
        if page is not None:
            serializer = NewsSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = NewsTypeSerializer(news, many=True)
        return Response(serializer.data)


class NewsByType(ListAPIView):
    """
    获取新闻类型下的所有新闻
    :param request:
    :param typeId: 新闻类型
    :return:
    """
    queryset = NewsType.objects.all()
    serializer_class = NewsSerializer
    pagination_class = TwentySetPagination

    def get(self, request, typeId):
        """
        获取新闻类型下的所有新闻
        """
        news = News.objects.filter(type_id=typeId)
        page = self.paginate_queryset(news)
        serializer = NewsSerializer(page, many=True)
        return self.get_paginated_response(serializer.data)


class NewsDetailView(RetrieveAPIView):
    """
    get:
        根据id查询新闻
    """
    queryset = News.objects.all()
    serializer_class = NewsSerializer

    def get(self, request, *args, **kwargs):
        news = get_object_or_404(News, pk=kwargs["pk"])
        serializer = NewsSerializer(news)
        return Response(serializer.data)


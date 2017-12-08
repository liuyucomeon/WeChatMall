from rest_framework.decorators import api_view, schema
from rest_framework.generics import ListAPIView
from rest_framework.response import Response

from WebAdmin.models import HotelBranch
from WebAdmin.schema.webSchema import WeChatCommonSchema
from WebAdmin.serializers.hotel import HotelBranchSerializer
from WebAdmin.utils.page import TwentySetPagination


class BranchsByHotel(ListAPIView):
    """
    根据id获取
    :param request:
    :param pk: 酒店品牌id
    :return:
    """
    queryset = HotelBranch.objects.all()
    serializer_class = HotelBranchSerializer
    pagination_class = TwentySetPagination

    def get(self, request, pk):
        """
        酒店下所有门店 \n
            :param request:
            :param pk: 酒店品牌id
        """
        hotelBranchs = HotelBranch.objects.filter(hotel_id=pk, isEnabled=True)
        page = self.paginate_queryset(hotelBranchs)
        if page is not None:
            serializer = HotelBranchSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = HotelBranchSerializer(hotelBranchs, many=True)
        return Response(serializer.data)
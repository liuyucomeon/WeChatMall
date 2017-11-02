from django.core.cache import cache
from rest_framework import viewsets, status
from rest_framework.decorators import detail_route
from rest_framework.response import Response

from WebAdmin.models import Hotel, HotelBranch
from WebAdmin.schema.webSchema import  CustomSchema
from WebAdmin.serializers.hotel import HotelSerializer, HotelBranchSerializer


class HotelViewSet(viewsets.ModelViewSet):
    """
    create:
        创建酒店品牌
    partial_update:
        根据id局部更新酒店品牌
    update:
        根据id更新酒店品牌
    destroy:
        根据id删除酒店品牌
    list:
        查询酒店品牌列表
    retrieve:
        根据id查询酒店品牌
    allBranchs:
        获取酒店品牌下所有酒店
    """
    queryset = Hotel.objects.all()
    serializer_class = HotelSerializer
    schema = CustomSchema()

    @detail_route(methods=['get'])
    def allBranchs(self, request, pk=None):
        hotelBranchs = HotelBranch.objects.filter(hotel_id=pk, isEnabled=True)
        page = self.paginate_queryset(hotelBranchs)
        if page is not None:
            serializer = HotelBranchSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = HotelBranchSerializer(hotelBranchs, many=True)
        return Response(serializer.data)

    def list(self, request):
        hotels = Hotel.objects.filter(isEnabled=True)
        page = self.paginate_queryset(hotels)
        if page is not None:
            serializer = HotelSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = HotelSerializer(hotels, many=True)
        return Response(serializer.data)

    def destroy(self, request, pk=None):
        hotel = Hotel.objects.get(id=pk)
        hotel.isEnabled = False
        hotel.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class HotelBranchViewSet(viewsets.ModelViewSet):
    """
        create:
            创建酒店分支
        partial_update:
            根据id局部更新酒店分支
        update:
            根据id更新酒店分支
        destroy:
            根据id删除酒店分支
        list:
            查询酒店分支列表
        retrieve:
            根据id查询酒店分支
        """
    queryset = HotelBranch.objects.all()
    serializer_class = HotelBranchSerializer
    schema = CustomSchema()

    def list(self, request):
        hotelBranchs = HotelBranch.objects.filter(isEnabled=True)
        page = self.paginate_queryset(hotelBranchs)
        if page is not None:
            serializer = HotelBranchSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = HotelBranchSerializer(hotelBranchs, many=True)
        return Response(serializer.data)

    def destroy(self, request, pk=None):
        hotelBranch = HotelBranch.objects.get(id=pk)
        hotelBranch.isEnabled = False
        hotelBranch.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

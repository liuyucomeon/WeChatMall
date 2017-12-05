from django.db import transaction
from django.db.models import Max, Min
from django.forms import model_to_dict
from rest_framework import viewsets, status, mixins, generics
from rest_framework.decorators import api_view, schema
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response

from WeChatMall.settings import logger
from WebAdmin.models import CommodityType, Commodity, CommodityFormat
from WebAdmin.schema.webSchema import CustomSchema, swapCommodityTypeSchema, tokenSchema, CommodityFormatBySortSchema
from WebAdmin.serializers.commodity import CommodityTypeSerializer, CommoditySerializer, CommodityFormatSerializer
from WebAdmin.utils.common import updateByDict
from WebAdmin.utils.page import TwentySetPagination


class CommodityTypeViewSet(viewsets.ModelViewSet):
    """
    create:
        创建商品类型
    partial_update:
        根据id局部更新商品类型
    update:
        根据id更新商品类型
    destroy:
        根据id删除商品类型
    list:
        查询商品类型
    retrieve:
        根据id查询商品类型
    """
    queryset = CommodityType.objects.all()
    serializer_class = CommodityTypeSerializer
    schema = CustomSchema()

    def create(self, request, *args, **kwargs):
        data = request.data
        maxOrder = CommodityType.objects.filter(branch_id=data['branch']).aggregate(Max('order'))
        maxOrderNum = 0
        if maxOrder['order__max']:
            maxOrderNum = maxOrder['order__max']
        data['order'] = maxOrderNum + 1
        serializer = CommodityTypeSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        commodityType = get_object_or_404(CommodityType, pk=kwargs.get("pk", 0))
        commodityType.isEnabled = False
        commodityType.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@schema(swapCommodityTypeSchema)
def swapCommodityTypeOrder(request, branchId):
        """
        交换商品类型顺序
        :param
            type1:商品类型id
            type2:商品类型id
        """
        data = request.data
        commodityType1 = get_object_or_404(CommodityType, pk=data['type1'], branch=branchId)
        commodityType2 = get_object_or_404(CommodityType, pk=data['type2'], branch=branchId)

        tmp = commodityType1.order
        commodityType1.order = commodityType2.order
        commodityType2.order = tmp
        commodityType1.save()
        commodityType2.save()
        return Response(status.HTTP_200_OK)


class BranchCommodityTypesList(mixins.ListModelMixin,
                               generics.GenericAPIView):
    """
    查询门店下的商品类型列表
    """

    queryset = CommodityType.objects.all()
    serializer_class = CommodityTypeSerializer
    schema = CustomSchema()
    pagination_class = TwentySetPagination

    def get(self, request, branchId):
        """
        获取单个酒店商品类型
        """
        newsTypes = CommodityType.objects.filter(branch_id=branchId, isEnabled=True)
        page = self.paginate_queryset(newsTypes)
        if page is not None:
            serializer = CommodityTypeSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = CommodityTypeSerializer(newsTypes, many=True)
        return Response(serializer.data)


class CommodityViewSet(viewsets.ModelViewSet):
    """
    create:
        创建商品
    partial_update:
        根据id局部更新商品
    update:
        根据id更新商品
    destroy:
        根据id删除商品
    list:
        查询商品
    retrieve:
        根据id查询商品
    """
    queryset = Commodity.objects.all()
    serializer_class = CommoditySerializer
    pagination_class = TwentySetPagination
    schema = CustomSchema()

    # def create(self, request, *args, **kwargs):
    #     data = request.data
    #     maxOrder = Commodity.objects.filter(type=data['type']).aggregate(Max('order'))
    #     maxOrderNum = 0
    #     if maxOrder['order__max']:
    #         maxOrderNum = maxOrder['order__max']
    #     data['order'] = maxOrderNum + 1
    #     serializer = CommodityTypeSerializer(data=data)
    #     if serializer.is_valid():
    #         serializer.save()
    #         return Response(serializer.data, status=status.HTTP_201_CREATED)
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def retrieve(self, request, pk=None):
        commodity = get_object_or_404(Commodity, pk=pk)
        commoditySerializer = CommoditySerializer(commodity)
        data = commoditySerializer.data
        # 获取所有规格
        commodityFormats = CommodityFormat.objects.filter(commodity_id=pk)
        commodityFormatSerializer = CommodityFormatSerializer(commodityFormats, many=True)
        data["formats"] = commodityFormatSerializer.data
        return Response(data)


@api_view(['GET'])
@schema(CommodityFormatBySortSchema)
def getCommodityFormatsByCommodity(request, commodityId):
        """
        根据商品id获取所有规格
        :param
            commodityId:商品id
        """
        commodityFormats = CommodityFormat.objects.filter(commodity_id=commodityId, isEnabled=True)
        serializer = CommodityFormatSerializer(commodityFormats, many=True)
        return Response(serializer.data, status.HTTP_200_OK)


class CommodityFormatViewSet(viewsets.ModelViewSet):
    """
    create:
        创建商品规格
    partial_update:
        根据id局部更新商品规格
    update:
        根据id更新商品规格
    destroy:
        根据id删除商品规格
    list:
        查询商品规格
    retrieve:
        根据id查询商品规格
    """
    queryset = CommodityFormat.objects.all()
    serializer_class = CommodityFormatSerializer
    schema = CustomSchema()
    pagination_class = TwentySetPagination

    def create(self, request, *args, **kwargs):
        data = request.data
        serializer = CommodityFormatSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            updateCommoditylowPrice(data["currentPrice"], data["commodity"])
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, *args, **kwargs):
        data = request.data
        commodityFormat = get_object_or_404(CommodityFormat, pk=kwargs.get("pk", 0))
        # updateByDict(commodityFormat, data)
        serializer = CommodityFormatSerializer(commodityFormat, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            if data.get("currentPrice", None):
                updateCommoditylowPrice(data["currentPrice"], commodityFormat.commodity_id)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        commodityFormat = get_object_or_404(CommodityFormat, pk=kwargs.get("pk", 0))
        commodity = commodityFormat.commodity
        commodityFormat.isEnabled = False
        with transaction.atomic():
            commodityFormat.save()
            if commodityFormat.currentPrice <= commodity.lowPrice:
                lowPrice = commodity.formats.filter(isEnabled=True).aggregate(Min('currentPrice'))
                commodity.lowPrice = lowPrice["currentPrice__min"]
                commodity.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class BranchCommoditysList(mixins.ListModelMixin,
                            generics.GenericAPIView):

    queryset = Commodity.objects.all()
    serializer_class = CommoditySerializer
    schema = CustomSchema()
    pagination_class = TwentySetPagination

    def get(self, request, branchId, commodityType=None, order="-saleCount"):
        """
        查询门店下的商品列表 \n
            :param commodityType: 商品类型
            :param request: 
            :param branchId: 门店id
            :param order: 排序规则(+:由小->大, -:由大->小,可选字段[saleCount,createTime,originalPrice
            ,currentPrice])
            :return: 
        """
        commoditys = Commodity.objects.filter(type__branch_id=branchId, isEnabled=True).order_by(order)
        if commodityType is not None:
            commoditys = commoditys.filter(type=commodityType)
        page = self.paginate_queryset(commoditys)
        serializer = CommoditySerializer(page, many=True)
        return self.get_paginated_response(serializer.data)


def updateCommoditylowPrice(price, commodityId):
    commodity = Commodity.objects.get(id=commodityId)
    if price < commodity.lowPrice or commodity.lowPrice==0:
        commodity.lowPrice = price
        commodity.save()

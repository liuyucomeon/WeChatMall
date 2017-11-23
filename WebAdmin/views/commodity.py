from django.db.models import Max
from rest_framework import viewsets, status, mixins, generics
from rest_framework.decorators import api_view, schema
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response

from WebAdmin.models import CommodityType, Commodity
from WebAdmin.schema.webSchema import CustomSchema, swapCommodityTypeSchema
from WebAdmin.serializers.commodity import CommodityTypeSerializer, CommoditySerializer
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
        newsTypes = CommodityType.objects.filter(branch_id=branchId)
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


class BranchCommoditysList(mixins.ListModelMixin,
                               generics.GenericAPIView):

    queryset = Commodity.objects.all()
    serializer_class = CommoditySerializer
    schema = CustomSchema()
    pagination_class = TwentySetPagination

    def get(self, request, branchId, commodityType=None, order="-saleCount"):
        """
        查询门店下的商品列表
        :param commodityType: 商品类型
        :param request: 
        :param branchId: 门店id
        :param order: 排序规则(+:由小->大, -:由大->小,可选字段[saleCount,createTime,originalPrice
        ,currentPrice])
        :return: 
        """
        commoditys = Commodity.objects.filter(type__branch_id=branchId).order_by(order)
        if commodityType is not None:
            commoditys = commoditys.filter(type=commodityType)
        page = self.paginate_queryset(commoditys)
        serializer = CommoditySerializer(page, many=True)
        return self.get_paginated_response(serializer.data)

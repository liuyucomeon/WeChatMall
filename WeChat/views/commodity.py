from rest_framework import mixins, generics
from rest_framework.generics import RetrieveAPIView, get_object_or_404
from rest_framework.response import Response

from WebAdmin.models import Commodity, CommodityFormat, CommodityType
from WebAdmin.schema.webSchema import CustomSchema
from WebAdmin.serializers.commodity import CommoditySerializer, CommodityFormatSerializer, CommodityTypeSerializer
from WebAdmin.utils.page import TwentySetPagination


class CommodityDetailView(RetrieveAPIView):
    """
    retrieve:
        根据id查询商品
    """
    queryset = Commodity.objects.all()
    serializer_class = CommoditySerializer

    def get(self, request, *args, **kwargs):
        """
        根据id查询商品详情 
        """
        commodity = get_object_or_404(Commodity, pk=kwargs["pk"])
        commoditySerializer = CommoditySerializer(commodity)
        data = commoditySerializer.data
        # 获取所有规格
        commodityFormats = CommodityFormat.objects.filter(commodity_id=kwargs["pk"])
        commodityFormatSerializer = CommodityFormatSerializer(commodityFormats, many=True)
        data["formats"] = commodityFormatSerializer.data
        return Response(data)


class BranchCommoditysList(mixins.ListModelMixin,
                            generics.GenericAPIView):

    queryset = Commodity.objects.all()
    serializer_class = CommoditySerializer
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


class BranchCommodityTypesList(mixins.ListModelMixin,
                               generics.GenericAPIView):
    """
    查询门店下的商品类型列表
    """

    queryset = CommodityType.objects.all()
    serializer_class = CommodityTypeSerializer
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
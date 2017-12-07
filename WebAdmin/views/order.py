import copy
import json

import requests
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, schema
from rest_framework.generics import ListAPIView, UpdateAPIView, get_object_or_404, RetrieveAPIView, \
    RetrieveUpdateAPIView
from rest_framework.response import Response

from WebAdmin.models import Order, TrackCompany
from WebAdmin.permission.permission import OrderPermission
from WebAdmin.schema.webSchema import CustomSchema, searchOrderSchema, queryTrackSchema
from WebAdmin.serializers.order import OrderSerializer, TrackCompanySerializer, SimpOrderSerializer, \
    OrderDetailSerializer
from WebAdmin.utils.page import TwentySetPagination


class OrderViewSet(viewsets.ModelViewSet):
    """
    create:
        
    partial_update:
        根据id局部更新订单
    update:
        根据id更新订单
    destroy:
        根据id删除订单
    list:
        查询客户订单列表
    retrieve:
        根据id查询订单
    """
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = OrderPermission
    pagination_class = TwentySetPagination
    schema = CustomSchema()

    def create(self, request, *args, **kwargs):
        pass


class OrderDetailView(RetrieveUpdateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = (OrderPermission,)
    pagination_class = TwentySetPagination
    schema = CustomSchema()

    def get(self, request, *args, **kwargs):
        """
        根据订单号查询订单详情 \n
            :param request: 
            :param args: 
            :param kwargs: 
                        orderNum:订单号
            :return: 
        """
        order = get_object_or_404(Order, orderNum=kwargs["orderNum"])
        serializer = OrderDetailSerializer(order)
        return Response(serializer.data)

    def patch(self, request, *args, **kwargs):
        """
        管理员更新订单 \n
            :param request: 
                        trackingNumber:物流单号
                        shortName:快递公司简称
                        remarks:卖家备注
                        status:订单状态(0, '已失效'), (1, '待支付'), (2, '已完成支付|未发货')"
                        ", (3, '已发货'), (4, '交易完成'), (5, '退货')           
            :param args: 
            :param kwargs:
                        orderNum:订单号(path)                       
        :return: 
        """
        # with transaction.atomic():
        # data = request.data
        # data["orderNum"] = kwargs["orderNum"]
        # order = get_object_or_404(Order, orderNum=kwargs["orderNum"])
        #
        # orderCommodityFtMp = data.get("orderCommodityFtMp", None)
        # # 记录新增商品
        # newOrderCommodityFtMp = copy.copy(orderCommodityFtMp)
        #
        # if orderCommodityFtMp:
        #     for orderCommodityFt in order.commoditys:
        #         if orderCommodityFt.commodityFormat_id in newOrderCommodityFtMp.keys:
        #             newOrderCommodityFtMp.pop(orderCommodityFt.commodityFormat_id)
        #
        #         newCount = orderCommodityFtMp.get(orderCommodityFt.commodityFormat_id,None)
        #
        #         commodityFormat = orderCommodityFt.commodityFormat
        #         # 删除商品
        #         if newCount is None:
        #             commodityFormat.inventory -= orderCommodityFt.count
        #             orderCommodityFt.delete()
        #             continue
        #         # 数量发生变化
        #         if newCount != orderCommodityFt.count:
        #             # 改变库存
        #             commodityFormat.inventory += (newCount-orderCommodityFt.count)
        #             commodityFormat.save()
        #             orderCommodityFt.count = newCount
        #             orderCommodityFt.save()

        data = request.data
        insertData = {}
        if "trackingNumber" in data.keys():
            insertData["trackingNumber"] = data["trackingNumber"]
        if "remarks" in data.keys():
            insertData["remarks"] = data["remarks"]
        if "status" in data.keys():
            insertData["status"] = data["status"]
        if "shortName" in data.keys():
            insertData["shortName"] = data["shortName"]
        order = get_object_or_404(Order, orderNum=kwargs["orderNum"])
        serializer = OrderSerializer(order, data=insertData, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OrderSearchView(ListAPIView):

    queryset = Order.objects.all()
    serializer_class = SimpOrderSerializer
    schema = searchOrderSchema
    pagination_class = TwentySetPagination

    def get(self, request, *args, **kwargs):
        """
        搜索订单 \n
            :param request: 
            :param branchId: 酒店id 必须
                    status:状态 非必须
                    createTimeFrom: 起始日期 非必须
                    createTimeTo: 结束日期 非必须
                    orderNum: 订单号 非必须
            :return: 
        """

        data = request.query_params
        orders = Order.objects.filter(branch_id=kwargs["branchId"])
        if data.get("status", None):
            orders = orders.filter(status=data["status"])
        if data.get("createTimeFrom", None):
            orders = orders.filter(createTime__gte=data["createTimeFrom"])
        if data.get("createTimeTo", None):
            orders = orders.filter(createTime__lte=data["createTimeTo"])
        if data.get("orderNum", None):
            orders = orders.filter(orderNum=data["orderNum"])
        page = self.paginate_queryset(orders)
        serializer = SimpOrderSerializer(page, many=True)
        return self.get_paginated_response(serializer.data)


class TrackCompanyListView(ListAPIView):

    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    schema = CustomSchema()

    def get(self, request, *args, **kwargs):
        """
        获取快递公司列表 \n
            :param request: 
            :param args: 
            :param kwargs: 
            :return: 
        """

        companys = TrackCompany.objects.all().order_by("order")
        serializer = TrackCompanySerializer(companys, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@schema(queryTrackSchema)
def queryTrack(request):
    """
    根据订单号查询物流状态
    :param request:
    :return:
    """
    param = request.query_params
    orderNum = param["orderNum"]
    order = get_object_or_404(Order, orderNum=orderNum)
    key = "295b109e65aa680d0b3160a37f45d046"
    url = "http://v.juhe.cn/exp/index?key=" + key + "&com=" + order.shortName \
          + "&no=" + order.trackingNumber
    result = requests.get(url).text
    return Response(json.loads(result))
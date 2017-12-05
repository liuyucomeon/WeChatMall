from rest_framework import viewsets, status
from rest_framework.decorators import api_view, schema
from rest_framework.generics import ListAPIView
from rest_framework.response import Response

from WebAdmin.models import Order, TrackCompany
from WebAdmin.schema.webSchema import CustomSchema, searchOrderSchema
from WebAdmin.serializers.order import OrderSerializer, TrackCompanySerializer, SimpOrderSerializer
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
    pagination_class = TwentySetPagination


    def create(self, request, *args, **kwargs):
        pass



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
            orders = orders.filter(id__contains=data["orderNum"])
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


from rest_framework import viewsets, status
from rest_framework.generics import ListAPIView
from rest_framework.response import Response

from WebAdmin.models import Order, TrackCompany
from WebAdmin.schema.webSchema import CustomSchema
from WebAdmin.serializers.order import OrderSerializer, TrackCompanySerializer
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


from django.db.models import F
from rest_framework import viewsets, status
from rest_framework.generics import ListAPIView
from rest_framework.response import Response

from WeChat.permission.permission import ShoppingCartPermission
from WeChatMall.settings import logger
from WebAdmin.models import ShoppingCart, Order, CommodityFormat
from WebAdmin.schema.webSchema import WeChatCommonSchema, CustomSchema
from WebAdmin.serializers.order import ShoppingCartSerializer, OrderSerializer
from WebAdmin.utils.page import TwentySetPagination


class ShoppingCartViewSet(viewsets.ModelViewSet):
    """
    create:
        购物车添加商品
    partial_update:
        根据id局部更新购物车商品
    update:
        根据id更新购物车商品
    destroy:
        根据id删除购物车商品
    list:
        查询购物车商品列表
    retrieve:
        根据id查询购物车商品
    """
    queryset = ShoppingCart.objects.all()
    serializer_class = ShoppingCartSerializer
    pagination_class = TwentySetPagination
    permission_classes = (ShoppingCartPermission,)
    schema =  CustomSchema()

    def list(self, request, *args, **kwargs):
        return Response(status=status.HTTP_404_NOT_FOUND)


class ShoppingCartByCustomer(ListAPIView):
    """
    获取用户购物车商品列表
    :param request:
    :param customerId: 顾客id
    :return:
    """
    queryset = ShoppingCart.objects.all()
    serializer_class = ShoppingCartSerializer
    pagination_class = TwentySetPagination
    schema = WeChatCommonSchema()


    def get(self, request, pk):
        """
        获取用户购物车商品列表(有效或无效)
        """
        shoppings = ShoppingCart.objects.filter(customer_id=pk)
        if "enabled" in request.path:
            shoppings = shoppings.filter(isEnabled=True)
        else:
            shoppings = shoppings.filter(isEnabled=False)

        page = self.paginate_queryset(shoppings)
        serializer = ShoppingCartSerializer(page, many=True)
        return self.get_paginated_response(serializer.data)


class OrderViewSet(viewsets.ModelViewSet):
    """
    create:
        
    partial_update:
        根据id局部更新客户地址
    update:
        根据id更新客户地址
    destroy:
        根据id删除客户地址
    list:
        查询客户地址列表
    retrieve:
        根据id查询客户地址
    """
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    pagination_class = TwentySetPagination
    # permission_classes = (OrderPermission,)
    # schema = WeChatCommonSchema()

    def create(self, request, *args, **kwargs):
        """
        创建客户地址 \n
            status : 状态(0, '已失效'), (1, '待支付'), (2, '已完成支付'), (3, '交易完成'), 
            customer : 买家 
            leaveMessage :  买家留言, 
            customerAddress : 收货地址
            commoditys : [
                商品列表{commodityFormat:商品规格id,count:数量}
            ]
        """
        data = request.data

        orderSerializer = OrderSerializer(data=data)
        if orderSerializer.is_valid():
            orderSerializer.save()
            # 减少库存
            commoditys = data["commoditys"]
            for commodity in commoditys:
                commodityId = commodity["commodityFormat"]
                CommodityFormat.objects.filter(id=commodityId).update(
                    inventory=(F("inventory") - commodity["count"]))

            return Response(data=orderSerializer.data)
        else:
            return Response(orderSerializer.errors, status=status.HTTP_400_BAD_REQUEST)




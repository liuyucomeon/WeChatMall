from rest_framework import viewsets, status
from rest_framework.generics import ListAPIView
from rest_framework.response import Response

from WeChatMall.settings import logger
from WebAdmin.models import ShoppingCart
from WebAdmin.serializers.order import ShoppingCartSerializer
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


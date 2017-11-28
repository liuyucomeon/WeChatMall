from rest_framework import viewsets, status
from rest_framework.response import Response

from WebAdmin.models import ShoppingCart
from WebAdmin.serializers.order import ShoppingCartSerializer
from WebAdmin.utils.page import TwentySetPagination


class ShoppingCartViewSet(viewsets.ModelViewSet):
    """
    create:
        创建购物车
    partial_update:
        根据id局部更新购物车
    update:
        根据id更新购物车
    destroy:
        根据id删除购物车
    list:
        查询购物车列表
    retrieve:
        根据id查询购物车
    """
    queryset = ShoppingCart.objects.all()
    serializer_class = ShoppingCartSerializer
    pagination_class = TwentySetPagination

    def list(self, request, *args, **kwargs):
        return Response(status=status.HTTP_404_NOT_FOUND)


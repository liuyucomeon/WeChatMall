from rest_framework import serializers

from WebAdmin.models import ShoppingCart
from WebAdmin.serializers.commodity import CommodityFormatSerializer


class ShoppingCartSerializer(serializers.ModelSerializer):
    commodityFormatObj = CommodityFormatSerializer(read_only=True)
    createTime = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", required=False, read_only=True)

    class Meta:
        model = ShoppingCart
        fields = ('id', 'commodityFormat', 'commodityFormatObj', 'count', 'isEnabled', 'customer', 'createTime')


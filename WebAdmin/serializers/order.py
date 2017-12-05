from django.forms import model_to_dict
from rest_framework import serializers

from WebAdmin.models import ShoppingCart, Order, OrderCommodityFormatMapping, CommodityFormat, TrackCompany
from WebAdmin.serializers.commodity import CommodityFormatSerializer
from WebAdmin.serializers.customer import CustomerAddressSerializer


class ShoppingCartSerializer(serializers.ModelSerializer):
    commodityFormat = serializers.PrimaryKeyRelatedField(queryset=CommodityFormat.objects.all())
    createTime = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", required=False, read_only=True)
    isEnabled = serializers.BooleanField(read_only=True)

    class Meta:
        model = ShoppingCart
        fields = ('id','commodityFormat', 'count','customer',
                  'branch','isEnabled', 'createTime')


class ShoppingCartRSerializer(serializers.ModelSerializer):
    commodityFormat = CommodityFormatSerializer(read_only=True)
    createTime = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", required=False, read_only=True)
    isEnabled = serializers.BooleanField(read_only=True)
    description = serializers.CharField(read_only=True)

    class Meta:
        model = ShoppingCart
        fields = ('id','commodityFormat','count','customer', 'description',
                  'branch','isEnabled', 'createTime')


class OrderCommodityFormatMappingSerializer(serializers.ModelSerializer):
    order = serializers.PrimaryKeyRelatedField(queryset=Order.objects.all(), required=False)
    commodityFormat = CommodityFormatSerializer(read_only=True)

    class Meta:
        model = OrderCommodityFormatMapping
        fields = ('count', 'commodityFormat', 'order')


class OrderSerializer(serializers.ModelSerializer):
    commoditys = OrderCommodityFormatMappingSerializer(many=True)
    createTime = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", required=False, read_only=True)
    totalPrice = serializers.FloatField(required=False, read_only=True)
    status = serializers.IntegerField(required=False, read_only=True)

    class Meta:
        model = Order
        fields = ("id", "status", 'customer', 'branch', 'createTime', 'customerAddress', 'totalPrice',
                  'leaveMessage', 'commoditys', 'trackingNumber')

    def create(self, validated_data):
        commoditys = validated_data.pop('commoditys')
        # 订单总金额
        totalPrice = 0
        for commodity in commoditys:
            totalPrice += commodity["commodityFormat"].currentPrice * commodity["count"]

        validated_data['totalPrice'] = totalPrice
        order = Order.objects.create(**validated_data)
        orderCommodityFormatList = []
        for commodity in commoditys:
            orderCommodityFormat = OrderCommodityFormatMapping.objects.create(order=order,
                                        commodityFormat=commodity["commodityFormat"], count=commodity["count"])
            orderCommodityFormatList.append(orderCommodityFormat)

        order.commoditys = orderCommodityFormatList
        return order

class SimpOrderSerializer(serializers.ModelSerializer):
    customerAddress = CustomerAddressSerializer()
    createTime = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", required=False, read_only=True)
    totalPrice = serializers.FloatField(required=False, read_only=True)
    status = serializers.IntegerField(required=False, read_only=True)

    class Meta:
        model = Order
        fields = ("id", "status", 'customer', 'branch', 'createTime', 'customerAddress', 'totalPrice',
                  'leaveMessage', 'trackingNumber')

class TrackCompanySerializer(serializers.ModelSerializer):

    class Meta:
        model = TrackCompany
        fields = '__all__'


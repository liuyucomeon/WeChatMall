from rest_framework import serializers

from WebAdmin.models import Commodity, CommodityType, CommodityFormat, OrderCommodityFormatMapping, CommodityComment


class CommoditySerializer(serializers.ModelSerializer):
    createTime = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", required=False, read_only=True)
    updateTime = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", required=False, read_only=True)
    class Meta:
        model = Commodity
        fields = '__all__'


class CommodityFormatSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommodityFormat
        fields = '__all__'


class CommodityTypeSerializer(serializers.ModelSerializer):
    createTime = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", required=False, read_only=True)
    updateTime = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", required=False, read_only=True)
    class Meta:
        model = CommodityType
        fields = '__all__'
        extra_kwargs = {'order': {'write_only': True}}


class CommodityCommentSerializer(serializers.ModelSerializer):
    createTime = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", required=False, read_only=True)
    updateTime = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", required=False, read_only=True)

    class Meta:
        model = CommodityComment
        fields = '__all__'
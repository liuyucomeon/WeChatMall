from rest_framework import serializers
from rest_framework.generics import get_object_or_404

from WebAdmin.models import Customer, Follower, CustomerAddress


class CustomerSerializer(serializers.ModelSerializer):
    createTime = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", required=False, read_only=True)
    openid = serializers.CharField(required=False)
    hotelId = serializers.IntegerField(required=False)
    # follower = serializers.IntegerField(required=False)

    class Meta:
        model = Customer
        fields = ('id', 'name', 'openid', 'hotelId', 'createTime')

    def create(self, validated_data):
        openid = validated_data.pop('openid')
        hotelId = validated_data.pop('hotelId')
        follower = get_object_or_404(Follower, openid=openid, hotel_id=hotelId)
        validated_data["follower_id"] = follower.id
        customer = Customer.objects.create(**validated_data)
        return customer

    def update(self, instance, validated_data):

        for k, v in validated_data.items():
            setattr(instance, k, validated_data.get(k, v))

        instance.save()

        return instance


class CustomerAddressSerializer(serializers.ModelSerializer):
    createTime = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", required=False, read_only=True)

    class Meta:
        model = CustomerAddress
        fields = '__all__'
from rest_framework import serializers
from WebAdmin.models import Hotel, HotelBranch


class HotelSerializer(serializers.ModelSerializer):
    boss_name = serializers.ReadOnlyField(source='boss.nickname')
    createTime = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", required=False, read_only=True)

    class Meta:
        model = Hotel
        fields = ('name', 'icon', 'ownerName', 'isEnabled', 'createTime', 'boss', 'boss_name')


class HotelBranchSerializer(serializers.ModelSerializer):
    hotel_name = serializers.ReadOnlyField(source='hotel.name')
    manager_name = serializers.ReadOnlyField(source='manager.nickname')

    class Meta:
        model = HotelBranch
        fields = ('id', 'name', 'icon', 'pictures', 'province', 'city', 'county', 'address', 'line',
                  'navigation', 'meal_period', 'facility', 'pay_card', 'phone', 'cuisine', 'isEnabled',
                  'create_time', 'hotel', 'hotel_name', 'manager', 'manager_name')

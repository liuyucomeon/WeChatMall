from rest_framework import serializers

from WebAdmin.models import Follower


class FollowerSerializer(serializers.ModelSerializer):
    subscribe_time = serializers.DateTimeField(format = "%Y-%m-%d %H:%M:%S", required=False, read_only=True)
    class Meta:
        model = Follower
        fields = '__all__'
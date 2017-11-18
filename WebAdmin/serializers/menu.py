from rest_framework import serializers

from WebAdmin.models.menu import WeChatMenu


class WeChatMenuSerializer(serializers.ModelSerializer):
    createTime = serializers.DateTimeField(format = "%Y-%m-%d %H:%M:%S", required=False, read_only=True)
    updateTime = serializers.DateTimeField(format = "%Y-%m-%d %H:%M:%S", required=False, read_only=True)
    class Meta:
        model = WeChatMenu
        fields = ('id', 'name', 'type', 'key', 'url', 'parent', 'hotel', 'createTime', 'updateTime', 'order')
        extra_kwargs = {'order': {'write_only': True}}

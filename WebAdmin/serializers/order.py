from rest_framework import serializers

from WebAdmin.models import ShoppingCart


class ShoppingCartSerializer(serializers.ModelSerializer):
    createTime = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", required=False, read_only=True)

    class Meta:
        model = ShoppingCart
        fields = '__all__'
from rest_framework import serializers

from WebAdmin.models.news import NewsType


class NewsTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsType
        fields = '__all__'

from rest_framework import serializers

from WebAdmin.models.news import NewsType, News


class NewsTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsType
        fields = '__all__'

class NewsSerializer(serializers.ModelSerializer):
    newsTypeName = serializers.ReadOnlyField(source='type.name')
    class Meta:
        model = News
        fields = '__all__'
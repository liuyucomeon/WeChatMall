from django.contrib.auth.models import User
from django.contrib.auth.validators import UnicodeUsernameValidator
from rest_framework import serializers
from WebAdmin.models.staff import Staff


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('password', 'last_login', 'is_superuser', 'username', 'email', 'is_staff', 'is_active', 'date_joined')
        extra_kwargs = {
            'username': {
                'validators': [UnicodeUsernameValidator()],
            },
            'password': {'write_only': True}
        }


class StaffSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Staff
        fields = '__all__'

    def create(self, validated_data):
        user_data = validated_data.pop('user')

        user = User.objects.create(**user_data)
        staff = Staff.objects.create(user=user, **validated_data)
        return staff

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user')
        user = instance.user

        for k, v in validated_data.items():
            setattr(instance, k, validated_data.get(k, v))

        instance.save()

        for k, v in user_data.items():
            setattr(user, k, user_data.get(k, v))
        user.save()

        return instance


from django.db import models
from django.db.models import ForeignKey
from django.utils import timezone


class Customer(models.Model):
    """
    有消费的顾客
    """
    name = models.CharField(max_length=20, blank=True, default='', help_text="名字")
    phone = models.CharField(max_length=20, unique=True, help_text="手机号")
    birthday = models.DateTimeField(default=None, null=True, help_text="生日")
    createTime = models.DateTimeField(default=timezone.now, help_text="创建时间")
    followerId = ForeignKey('Follower', models.CASCADE, 'customers', help_text="关注者id")

    class Meta:
        ordering = ['name']
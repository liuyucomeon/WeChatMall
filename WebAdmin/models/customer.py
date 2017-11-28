from django.db import models
from django.utils import timezone

class Customer(models.Model):
    """
    有消费的顾客
    """
    follower = models.OneToOneField("Follower", help_text="关注者id(不填,通过openid确认身份)")
    name = models.CharField(max_length=20, blank=True, default='', help_text="名字")
    createTime = models.DateTimeField(default=timezone.now, help_text="创建时间")

    class Meta:
        ordering = ['name']

class CustomerAddress(models.Model):
    """
    收货地址
    """
    phone = models.CharField(max_length=20, default="", help_text="收获人手机号")
    address = models.CharField(max_length=70, default="", help_text="收获地址")
    receiver = models.CharField(max_length=20, default="", help_text="收获人")
    customer = models.ForeignKey('Customer', models.CASCADE, 'addresses', help_text="顾客id")
    createTime = models.DateTimeField(default=timezone.now, help_text="创建时间")

    class Meta:
        ordering = ['-createTime']

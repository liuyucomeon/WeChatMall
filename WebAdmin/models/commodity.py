from django.db import models
from django.utils import timezone

class Commodity(models.Model):
    """
    商品
    """
    name = models.CharField(max_length=20, help_text="名称")
    icons = models.CharField(max_length=500, default='', blank=True, help_text="商品图像,路径以逗号分隔，最多三张")
    description = models.CharField(max_length=300, default='', blank=True, help_text="商品描述")
    inventory = models.IntegerField(default=0, help_text="库存")
    saleCount = models.IntegerField(default=0, help_text="销量")
    originalPrice = models.FloatField(default=0, help_text="原价")
    currentPrice = models.FloatField(default=0, help_text="现价")
    isEnabled = models.BooleanField(default=True, help_text="是否可用")
    type = models.ForeignKey('CommodityType', models.CASCADE, 'commodities', help_text="所属类型")
    # order = models.IntegerField(help_text="排序")
    createTime = models.DateTimeField(default=timezone.now, help_text="创建时间")
    updateTime = models.DateTimeField(auto_now=timezone.now, help_text="更新时间")

    class Meta:
        ordering = ['-saleCount']


class CommodityType(models.Model):
    """
    商品类型
    """
    name = models.CharField(max_length=20, help_text="名称")
    description = models.CharField(max_length=300, default='', blank=True, help_text="类型描述")
    createTime = models.DateTimeField(default=timezone.now, help_text="创建时间")
    updateTime = models.DateTimeField(auto_now=timezone.now, help_text="更新时间")
    branch = models.ForeignKey('HotelBranch', models.CASCADE, 'commodities', help_text="所属酒店")
    order = models.IntegerField(help_text="排序(不用传)")

    class Meta:
        ordering = ['order']


class CommodityComment(models.Model):
    """
    商品评论
    """
    commodity = models.ForeignKey('Commodity', models.CASCADE, 'comments', help_text="所属商品")
    content = models.CharField(max_length=100, help_text="内容")
    icons = models.CharField(max_length=500, default='', blank=True, help_text="评论照片,路径以逗号分隔，最多三张")
    customer = models.ForeignKey('Customer', models.CASCADE, 'comments', help_text="评论者")
    createTime = models.DateTimeField(default=timezone.now, help_text="创建时间")
    updateTime = models.DateTimeField(auto_now=timezone.now, help_text="更新时间")

    class Meta:
        ordering = ['-createTime']
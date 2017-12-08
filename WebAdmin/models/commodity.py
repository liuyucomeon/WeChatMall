from django.db import models
from django.utils import timezone

class Commodity(models.Model):
    """
    商品
    """
    name = models.CharField(max_length=20, help_text="名称")
    icons = models.CharField(max_length=500, default='', blank=True, help_text="商品图像,路径以逗号分隔，最多三张")
    details = models.CharField(max_length=500, default='', blank=True, help_text="商品详情描述,路径以逗号分隔")
    description = models.CharField(max_length=300, default='', blank=True, help_text="商品描述")
    saleCount = models.IntegerField(default=0, help_text="销量")
    originalPrice = models.FloatField(default=0, help_text="原价")
    lowPrice = models.FloatField(default=0, help_text="商品列表展示的时候价格")
    isEnabled = models.BooleanField(default=True, help_text="是否可用")
    type = models.ForeignKey('CommodityType', models.CASCADE, 'commodities', help_text="所属类型")
    productionDateFrom = models.DateTimeField(default=timezone.now, help_text="生产日期开始")
    productionDateTo = models.DateTimeField(default=timezone.now, help_text="生产日期结束")
    netWeight = models.IntegerField(default=0, help_text="净含量")
    packing = models.CharField(max_length=20, default='', help_text="包装方式")
    brand = models.CharField(max_length=20, default='', help_text="品牌")
    origin = models.CharField(max_length=40, default='', help_text="产地")
    factoryName = models.CharField(max_length=30, default='', help_text="厂名")
    factoryAddress = models.CharField(max_length=50, default='', help_text="厂址")
    ingredients = models.CharField(max_length=100, default='', help_text="配料表")
    storageMethod = models.CharField(max_length=20, default='', help_text="储存方法")
    shelfLife = models.CharField(max_length=20, default='', help_text="保质期")
    # order = models.IntegerField(help_text="排序")
    createTime = models.DateTimeField(default=timezone.now, help_text="创建时间")
    updateTime = models.DateTimeField(auto_now=timezone.now, help_text="更新时间")

    class Meta:
        ordering = ['-saleCount']


class CommodityFormat(models.Model):
    """
    商品规格
    """
    description = models.CharField(max_length=50, help_text="描述")
    inventory = models.IntegerField(default=0, help_text="库存")
    currentPrice = models.FloatField(default=0, help_text="现价")
    commodity = models.ForeignKey('Commodity', models.CASCADE, 'formats', help_text="所属商品")
    image = models.CharField(max_length=100, default="", blank=True, help_text="规格图片")
    isEnabled = models.BooleanField(default=True, help_text="是否可用")


class CommodityType(models.Model):
    """
    商品类型
    """
    name = models.CharField(max_length=20, help_text="名称")
    icon = models.CharField(max_length=100, default='', blank=True, help_text="商品类型图像")
    description = models.CharField(max_length=300, default='', blank=True, help_text="类型描述")
    createTime = models.DateTimeField(default=timezone.now, help_text="创建时间")
    updateTime = models.DateTimeField(auto_now=timezone.now, help_text="更新时间")
    branch = models.ForeignKey('HotelBranch', models.CASCADE, 'commodities', help_text="所属酒店")
    order = models.IntegerField(help_text="排序(不用传)")
    isEnabled = models.BooleanField(default=True, help_text="是否可用")

    class Meta:
        ordering = ['order']


class CommodityComment(models.Model):
    """
    商品评论
    """
    commodity = models.ForeignKey('Commodity', models.CASCADE, 'comments', help_text="所属商品id")
    content = models.CharField(max_length=100, help_text="内容")
    icons = models.CharField(max_length=500, default='', blank=True, help_text="评论照片,路径以逗号分隔，最多六张")
    customer = models.ForeignKey('Customer', models.CASCADE, 'comments', help_text="评论者id")
    order = models.ForeignKey('Order', models.CASCADE, help_text="订单id")
    createTime = models.DateTimeField(default=timezone.now, help_text="创建时间")
    updateTime = models.DateTimeField(auto_now=timezone.now, help_text="更新时间")

    class Meta:
        ordering = ['-createTime']
from django.db import models
from django.utils import timezone


class ShoppingCart(models.Model):
    """
    购物车
    """
    commodityFormat = models.ForeignKey('CommodityFormat', models.CASCADE, help_text="商品规格ID")
    count = models.IntegerField(default=1, help_text="商品数量")
    isEnabled = models.BooleanField(default=True, help_text="是否有效")
    customer = models.ForeignKey('Customer', models.CASCADE, 'shoppingCartCommoditys', help_text="顾客id")
    createTime = models.DateTimeField(default=timezone.now, help_text="创建时间")

    class Meta:
        ordering = ['-createTime']


class Order(models.Model):
    """
    订单
    """
    commodityFormat = models.ForeignKey('CommodityFormat', models.CASCADE, help_text="商品ID")
    count = models.IntegerField(default=1, help_text="商品数量")
    isEnabled = models.BooleanField(default=True, help_text="是否有效")
    customer = models.ForeignKey('Customer', models.CASCADE, 'orders', help_text="顾客id")
    createTime = models.DateTimeField(default=timezone.now, help_text="创建时间")
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
    status = models.IntegerField(choices=((0, '已失效'), (1, '待支付'), (2, '已完成支付'), (3, '交易完成'))
                                 ,default=1, help_text="订单状态(0, '已失效'), (1, '待支付'), (2, '已完成支付'), (3, '交易完成')")
    customer = models.ForeignKey('Customer', models.CASCADE, 'orders', help_text="顾客id")
    createTime = models.DateTimeField(default=timezone.now, help_text="创建时间")
    totalPrice = models.FloatField(default=0, help_text="订单总金额")
    customerAddress = models.ForeignKey('CustomerAddress', models.CASCADE, help_text="收货地址")
    leaveMessage = models.CharField(max_length=100, default="", help_text="买家留言")

    class Meta:
        ordering = ['-createTime']


class OrderCommodityFormatMapping(models.Model):
    """
    订单商品规格对应关系
    """
    commodityFormat = models.ForeignKey('CommodityFormat', models.CASCADE, help_text="商品规格ID")
    count = models.IntegerField(default=1, help_text="商品数量")
    order = models.ForeignKey('Order', models.CASCADE, help_text="订单id")
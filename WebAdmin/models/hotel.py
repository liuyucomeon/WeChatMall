from django.db import models
from django.utils import timezone


class Hotel(models.Model):
    # 名称
    name = models.CharField(max_length=20, help_text="名称")
    # 头像
    icon = models.CharField(max_length=100, default='', blank=True, help_text="头像")
    # 法人代表
    ownerName = models.CharField(max_length=20, help_text="法人代表")
    # 是否有效
    isEnabled = models.BooleanField(default=True, db_index=True, help_text="是否有效")
    # 创建时间
    createTime = models.DateTimeField(default=timezone.now, db_index=True, help_text="创建时间")
    # 酒店董事长
    boss = models.ForeignKey('Staff', models.CASCADE, 'hotels', default=None,
                             null=True, help_text="酒店董事长")
    # 微信公众号id
    appId = models.CharField(max_length=100, default='', blank=True, help_text="微信公众号id")
    # 公众号密钥(先这样存着吧，不安全。。。)
    appsecret = models.CharField(max_length=100, default='', blank=True, help_text="公众号密钥")
    # 微信公众号原始id
    originId = models.CharField(max_length=50, default='', blank=True, help_text="微信公众号原始id,toUserName,"
                                                                                 "fromUserName需要")

    class Meta:
        ordering = ['-createTime']


class HotelBranch(models.Model):
    # 名称
    name = models.CharField(max_length=20, help_text="名称")
    # 头像
    icon = models.CharField(max_length=100, default='', blank=True, help_text="头像")
    # 酒店门店介绍图片，最多5张
    pictures = models.CharField(max_length=300, default='', blank=True, help_text="酒店门店介绍图片，最多5张")
    # 所属省
    province = models.CharField(max_length=20, default='', blank=True, help_text="所属省")
    # 所属市
    city = models.CharField(max_length=20, default='', blank=True, help_text="所属市")
    # 所属县/区
    county = models.CharField(max_length=20, default='', blank=True, help_text="所属县/区")
    # 详细地址
    address = models.CharField(max_length=50, default='', blank=True, help_text="详细地址")
    # 路线
    line = models.CharField(max_length=100, default='', blank=True, help_text="路线")
    # 导航
    navigation = models.CharField(max_length=100, default='', blank=True, help_text="导航")
    # 餐段
    meal_period = models.CharField(max_length=5000, default='', blank=True, help_text="餐段")
    # 设施
    facility = models.CharField(max_length=640, default='', blank=True, help_text="设施")
    # 可以刷哪些卡
    pay_card = models.CharField(max_length=120, default='', blank=True, help_text="可以刷哪些卡")
    # 电话(最多3个)
    phone = models.CharField(max_length=50, default='', blank=True, help_text="电话")
    # 菜系
    cuisine = models.CharField(max_length=1000, default='', blank=True, help_text="菜系")
    # 是否有效
    isEnabled = models.BooleanField(default=True, db_index=True, help_text="是否有效")
    # 创建时间
    create_time = models.DateTimeField(default=timezone.now, db_index=True, blank=True, help_text="创建时间")
    # 所属酒店
    hotel = models.ForeignKey('Hotel', models.CASCADE, 'branches', help_text="所属酒店")
    # 店长
    manager = models.ForeignKey('Staff', models.CASCADE, 'branches', default=None, null=True, help_text="店长")

    class Meta:
        ordering = ['-create_time']



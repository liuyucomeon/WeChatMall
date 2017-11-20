from django.db import models


class Follower(models.Model):
    """关注者"""
    openid = models.CharField(max_length=50, help_text="公众号平台下对应的用户id")
    nickname = models.CharField(max_length=30, default="", help_text="微信昵称")
    sex = models.IntegerField(choices=((1, '男'), (2, '女')),default=1, help_text="性别")
    language = models.CharField(max_length=20, default="", help_text="语言")
    city = models.CharField(max_length=20, default="", help_text="城市")
    province = models.CharField(max_length=20, default="", help_text="省份")
    country = models.CharField(max_length=20, default="", help_text="国家")
    headimgurl = models.CharField(max_length=100, default="", help_text="头像地址")
    subscribe_time = models.DateTimeField(help_text="订阅时间")
    hotel = models.ForeignKey('Hotel', models.CASCADE, 'follwers', default=None,
                              null=True, help_text="所属酒店")

    class Meta:
        ordering = ['-subscribe_time']

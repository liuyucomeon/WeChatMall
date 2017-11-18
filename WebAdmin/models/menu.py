from django.db import models
from django.utils import timezone


class WeChatMenu(models.Model):
    name = models.CharField(max_length=60, help_text="菜单标题")
    type = models.CharField(max_length=20, help_text="菜单的响应动作类型")
    key = models.CharField(max_length=128, default="", help_text="菜单KEY值，用于消息接口推送")
    url = models.CharField(max_length=128, default="", help_text="网页链接")
    order = models.IntegerField(default=0, help_text="排列顺序")
    parent = models.ForeignKey('self', default=None, null=True, help_text="父菜单")
    hotel = models.ForeignKey('Hotel', models.CASCADE, 'menus', default=None, null=True, help_text="所属酒店品牌")
    createTime =  models.DateTimeField(default=timezone.now)
    updateTime = models.DateTimeField(auto_now=timezone.now)

    class Meta:
        ordering = ['-createTime']
from django.db import models

class NewsType(models.Model):
    name = models.CharField(max_length=30, blank=True, default='', help_text="新闻类型名称")
    icon = models.CharField(max_length=100, blank=True, default='', help_text="图标")
    order = models.IntegerField(default=0, blank=True,  help_text="顺序(不填，填了也没用)")
    branch = models.ForeignKey('HotelBranch', models.CASCADE, 'branches',default=None,
                             null=True, help_text="所属酒店")
    shareDescription = models.CharField(max_length=300, blank=True, default='', help_text="分享描述")
    hide = models.BooleanField(default=False, help_text="是否隐藏")

    class Meta:
        ordering = ['order']
from django.db import models
from django.utils import timezone

class NewsType(models.Model):
    name = models.CharField(max_length=30, blank=True, default='', help_text="新闻类型名称")
    icon = models.CharField(max_length=100, blank=True, default='', help_text="图标")
    order = models.IntegerField(default=0, blank=True,  help_text="顺序(不填，填了也没用)")
    hotel = models.ForeignKey('Hotel', models.CASCADE, 'hotels',default=None,
                             null=True, help_text="所属酒店")
    shareDescription = models.CharField(max_length=300, blank=True, default='', help_text="分享描述")
    hide = models.BooleanField(default=False, help_text="是否隐藏")

    class Meta:
        ordering = ['order']

class News(models.Model):
    name = models.CharField(max_length=50, blank=True, default='', help_text="新闻名称")
    type = models.ForeignKey('NewsType', models.CASCADE, 'news', help_text="所属新闻类别")
    author = models.CharField(max_length=30, blank=True, default='', help_text="作者")
    content = models.TextField(default='', help_text="新闻内容")
    shareDescription = models.CharField(max_length=300, blank=True, default='', help_text="分享描述")
    shareTitle = models.CharField(max_length=50, blank=True, default='', help_text="分享标题")
    cover = models.CharField(max_length=100, blank=True, default='', help_text="图标")
    audio = models.CharField(max_length=100, blank=True, default='', help_text="音频")
    video = models.CharField(max_length=100, blank=True, default='', help_text="视频")
    summary = models.CharField(max_length=300, blank=True, default='', help_text="摘要")
    publishTime = models.DateTimeField(default=timezone.now)
    readCount = models.IntegerField(default=0, blank=True,  help_text="阅读次数")
    commentCount = models.IntegerField(default=0, blank=True,  help_text="评论次数")
    shareCount = models.IntegerField(default=0, blank=True,  help_text="评论次数")
    shareBringAccess = models.IntegerField(default=0, blank=True,  help_text="分享带来访问")
    shareBringAttention = models.IntegerField(default=0, blank=True,  help_text="分享带来关注")

    class Meta:
        ordering = ['-publishTime']

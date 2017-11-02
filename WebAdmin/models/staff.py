from django.contrib.auth.models import User
from django.db import models


class Staff(models.Model):
    user = models.OneToOneField(User, help_text="User对象")
    # 属于哪个酒店
    branch = models.ForeignKey('HotelBranch', models.CASCADE, 'staffs', help_text="酒店")
    # 身份证号
    id_number = models.CharField(max_length=18, blank=True, default='', unique=True, help_text="身份证号")
    # 头像
    icon = models.CharField(max_length=100, blank=True, default='', help_text="头像")
    # 性别
    gender = models.IntegerField(choices=((0, '保密'), (1, '男'), (2, '女')),
                                 default=0, db_index=True, help_text="性别")
    # 职位
    position = models.CharField(max_length=20, blank=True, default='', help_text="职位")
    # 昵称
    nickname = models.CharField(max_length=20, blank=True, default='', help_text="昵称")

    class Meta:
        ordering = ['nickname']
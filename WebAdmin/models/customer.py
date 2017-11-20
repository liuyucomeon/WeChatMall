from django.db import models
from django.utils import timezone


class Customer(models.Model):
    name = models.CharField(max_length=20, blank=True, default='', help_text="名字")
    phone = models.CharField(unique=True, help_text="手机号")
    birthday = models.DateTimeField(default=None, null=True, help_text="生日")
    id_number = models.CharField(max_length=18, blank=True, default='', help_text="身份证号")
    gender = models.IntegerField(choices=((1, '男'), (2, '女')),
                                 default=1, db_index=True, help_text="性别")
    password =  models.CharField(max_length=30, help_text="密码")
    createTime = models.DateTimeField(default=timezone.now, help_text="创建时间")

    class Meta:
        ordering = ['name']
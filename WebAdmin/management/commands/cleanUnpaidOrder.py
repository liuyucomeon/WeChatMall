import os

import django
from django.core.management import BaseCommand
from django.db.models import F

from django.utils import timezone
import datetime

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "WeChatMall.settings")

if django.VERSION >= (1, 7):  # 自动判断版本
    django.setup()

from WeChatMall.settings import logger
from WebAdmin.models import Order



class Command(BaseCommand):
    def handle(self, *args, **options):
        Order.objects.filter(status=1, createTime__lte=(timezone.now() -
                            datetime.timedelta(hours=1))).update(status=0)


if __name__ == "__main__":
    Order.objects.filter(status=1, createTime__lte=(timezone.now() -
            datetime.timedelta(hours=1))).update(status=0)
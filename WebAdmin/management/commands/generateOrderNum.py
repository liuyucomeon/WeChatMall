import datetime
import os
import random

import django
from django.core.management import BaseCommand
from django_redis import get_redis_connection

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "WeChatMall.settings")

if django.VERSION >= (1, 7):  # 自动判断版本
    django.setup()

from WeChatMall.settings import logger


class Command(BaseCommand):
    def handle(self, *args, **options):
        redisDB = get_redis_connection('default')
        logger.info("begin generate order")
        randomList = random.sample(range(0, 1000000), 100000);
        redisDB.delete("orderNum")
        redisDB.lpush("orderNum", *randomList)
        logger.info("end generate order")


if __name__ == "__main__":
    randomList = random.sample(range(0, 1000000), 100000);
    redisDB = get_redis_connection('default')
    redisDB.lpush("orderNum", *randomList)
    # redisDB = get_redis_connection('default')
    # a = redisDB.lpop("orderNum")
    # randomNum = str(redisDB.lpop("orderNum").decode('utf-8'))
    # zeroCount = 6 - len(randomNum)
    # randomNum = '0' * zeroCount + randomNum
    # now = datetime.datetime.now()
    # month = str(now.month) if len(str(now.month))==2 else '0'+ str(now.month)
    # day = str(now.day) if len(str(now.day))==2 else '0'+ str(now.day)
    # orderNum = str(now.year)[-2:] + month + day + randomNum
    # print(orderNum)
import os
import random
import string

import binascii

import time


def getRandomChar(num):
    return ''.join(random.sample(string.ascii_letters+string.digits, num))

def generateToken():
    """
    生成token
    :return: 
    """
    return binascii.b2a_base64(os.urandom(24))[:-1].decode()

def formatTimeStamp(timeStamp):
    """
    格式化时间戳
    :param timeStamp: 
    :return: 
    """
    timeArray = time.localtime(timeStamp)
    formatTime = time.strftime("%Y-%m-%d %H:%M:%S", timeArray)
    return formatTime

def updateByDict(targetObject,data):
    """
    根据字典更新对象
    :param targetObject: 目标对象
    :param data: 以这个字典更新目标对象
    :return: 
    """
    for (k,v) in data.items():
        if hasattr(targetObject, k):
            setattr(targetObject, k, v)


if __name__ == '__main__':
    print(formatTimeStamp(1381419600))

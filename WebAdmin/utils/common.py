import os
import random
import string

import binascii

import time
import urllib.parse

import requests


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

def urlEncode(url):
    print(urllib.parse.quote(url))
    print(urllib.parse.urlencode({"redirect":"https://6482cd77.ngrok.io/static/test.html"}))


if __name__ == '__main__':
    urlEncode("114.215.220.241:8083/WebAdmin/logout/")

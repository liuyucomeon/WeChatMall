import os

from django.utils import timezone


def uploadFile(file, dir_name):
    picture_time = timezone.now().strftime('%H%M%S%f')
    picture_tail = str(file).split('.')[-1]
    os.makedirs(dir_name, exist_ok=True)
    fileName = dir_name + '%s.%s' % (picture_time, picture_tail)
    destination = open(fileName, 'wb+')  # 打开特定的文件进行二进制的写操作
    for chunk in file.chunks():  # 分块写入文件
        destination.write(chunk)
    destination.close()
    return fileName

def removeFile(path):
    os.remove(path)
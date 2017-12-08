import os

from PIL import Image
from django.utils import timezone
from rest_framework import status, response
from rest_framework.decorators import api_view, schema

from WebAdmin.schema.webSchema import deleteFileSchema, uploadNewsTypeSchema, uploadNewsPicSchema, uploadNewsAudioSchema
from WebAdmin.utils.upload import uploadFile, removeFile


@api_view(['POST'])
@schema(uploadNewsTypeSchema)
def uploadNewsTypePic(request):
    """
    上传新闻类型图像
    """
    lastPath = request.data.get('lastPath', None)
    if lastPath:
        # 判断文件是否存在
        if os.path.exists(lastPath):
            removeFile(lastPath)
    file = request.data['file']
    dir_name = 'uploaded/hotel/%d/NewsType/pic/' % request.staff.branch.hotel_id
    fileName = uploadFile(file, dir_name)
    return response.Response({"fileName":fileName},status=status.HTTP_200_OK)


@api_view(['POST'])
@schema(uploadNewsPicSchema)
def uploadNewsPic(request):
    """
    上传新闻图像
    """
    lastPath = request.data.get('lastPath', None)
    if lastPath:
        # 判断文件是否存在
        if os.path.exists(lastPath):
            removeFile(lastPath)
    file = request.data['file']
    dir_name = 'uploaded/hotel/%d/News/pic' % request.staff.branch.hotel_id
    fileName = uploadFile(file, dir_name)
    return response.Response({"fileName":fileName},status=status.HTTP_200_OK)


@api_view(['POST'])
@schema(uploadNewsAudioSchema)
def uploadNewsAudio(request):
    """
    上传新闻音频
    """
    lastPath = request.data.get('lastPath', None)
    if lastPath:
        # 判断文件是否存在
        if os.path.exists(lastPath):
            removeFile(lastPath)
    file = request.data['file']
    dir_name = 'uploaded/hotel/%d/News/audio/' % request.staff.branch.hotel_id
    fileName = uploadFile(file, dir_name)
    return response.Response({"fileName":fileName},status=status.HTTP_200_OK)


@api_view(['POST'])
def uploadCommodityPic(request):
    """
    上传商品图片(可传十张)
    :param
       lastPath:需要删除的图片路径,多个以逗号分隔 
       file1:图片1
       file2:图片2
       file3:图片3
    """
    fileNameList = []
    # 缩略图
    # smallFileNameList = []
    data = request.data
    if "lastPath" in data.keys():
        lastPath = data.pop('lastPath')
        if lastPath:
            # 判断文件是否存在
            for path in lastPath.split(","):
                if os.path.exists(path):
                    removeFile(path)
    # 检查是否符合规范
    suffix = ["bmp", "jpg", "jpeg", "png"]
    if len(data) > 10:
        return response.Response({"error": "最多上传十张图片"},
                                 status=status.HTTP_400_BAD_REQUEST)
    for file in data.values():
        picture_tail = str(file).split('.')[-1].lower()
        if picture_tail not in suffix:
            return response.Response({"error": "图片格式不符合规范,仅支持bmp,jpg,jpeg,png"},
                                     status=status.HTTP_400_BAD_REQUEST)
        # if file.size > 3*1024*1024:
        #     return response.Response({"error":"单张图片大小不能超过3M"},status=status.HTTP_400_BAD_REQUEST)

    for file in data.values():
        dir_name = 'uploaded/hotel/%d/Commodity/pic/' % request.staff.branch.hotel_id
        # fileName = uploadFile(file, dir_name)
        # fileNameList.append(fileName)

        # 创建缩略图
        img = Image.open(file)
        # img.thumbnail((800, 800), Image.LANCZOS) 太模糊了
        img = img.resize((800, 800), Image.ANTIALIAS)
        picture_time = timezone.now().strftime('%H%M%S%f')
        picture_tail = str(file).split('.')[-1]
        os.makedirs(dir_name, exist_ok=True)
        fileName = dir_name + '%s.%s' % (picture_time, picture_tail)

        if len(img.split()) == 4:
            r, g, b, a = img.split()  # 利用split和merge将通道从四个转换为三个
            toImage = Image.merge("RGB", (r, g, b))
            toImage.save(fileName , quality=100)
        else:
            img.save(fileName, "JPEG",quality=100)
        fileNameList.append(fileName)

    return response.Response({"fileNameList":fileNameList},status=status.HTTP_200_OK)


@api_view(['POST'])
def uploadCommodityPic(request):
    """
    上传商品或商品详情图片(可传十张)
    :param
       lastPath:需要删除的图片路径,多个以逗号分隔 
       file1:图片1
       file2:图片2
       file3:图片3
    """
    fileNameList = []
    # 缩略图
    # smallFileNameList = []
    data = request.data
    if "lastPath" in data.keys():
        lastPath = data.pop('lastPath')[0]
        if lastPath:
            # 判断文件是否存在
            for path in lastPath.split(","):
                if os.path.exists(path):
                    removeFile(path)
    # 检查是否符合规范
    suffix = ["bmp", "jpg", "jpeg", "png"]
    if len(data) > 10:
        return response.Response({"error": "最多上传十张图片"},
                                 status=status.HTTP_400_BAD_REQUEST)
    for file in data.values():
        picture_tail = str(file).split('.')[-1].lower()
        if picture_tail not in suffix:
            return response.Response({"error": "图片格式不符合规范,仅支持bmp,jpg,jpeg,png"},
                                     status=status.HTTP_400_BAD_REQUEST)
        # if file.size > 3*1024*1024:
        #     return response.Response({"error":"单张图片大小不能超过3M"},status=status.HTTP_400_BAD_REQUEST)

    for file in data.values():
        dir_name = 'uploaded/hotel/%d/Commodity/pic/' % request.staff.branch.hotel_id
        # fileName = uploadFile(file, dir_name)
        # fileNameList.append(fileName)

        # 创建缩略图
        img = Image.open(file)
        # img.thumbnail((800, 800), Image.LANCZOS) 太模糊了
        img = img.resize((800, 800), Image.ANTIALIAS)
        picture_time = timezone.now().strftime('%H%M%S%f')
        picture_tail = str(file).split('.')[-1]
        os.makedirs(dir_name, exist_ok=True)
        fileName = dir_name + '%s.%s' % (picture_time, picture_tail)

        if len(img.split()) == 4:
            r, g, b, a = img.split()  # 利用split和merge将通道从四个转换为三个
            toImage = Image.merge("RGB", (r, g, b))
            toImage.save(fileName , quality=100)
        else:
            img.save(fileName, "JPEG",quality=100)
        fileNameList.append(fileName)

    return response.Response({"fileNameList":fileNameList},status=status.HTTP_200_OK)


@api_view(['POST'])
def uploadCommodityTypePic(request):
    """
    上传商品类型图片
    :param
       lastPath:需要删除的图片路径
       file1:图片1
    """
    data = request.data
    if "lastPath" in data.keys():
        lastPath = data.pop('lastPath')[0]
        if lastPath:
            # 判断文件是否存在
            if os.path.exists(lastPath):
                removeFile(lastPath)
    # 检查是否符合规范
    suffix = ["bmp", "jpg", "jpeg", "png"]

    for file in data.values():
        picture_tail = str(file).split('.')[-1].lower()
        if picture_tail not in suffix:
            return response.Response({"error": "图片格式不符合规范,仅支持bmp,jpg,jpeg,png"},
                                     status=status.HTTP_400_BAD_REQUEST)

    for file in data.values():
        dir_name = 'uploaded/hotel/%d/CommodityType/pic/' % request.staff.branch.hotel_id
        # fileName = uploadFile(file, dir_name)
        # fileNameList.append(fileName)

        # 创建缩略图
        img = Image.open(file)
        img = img.resize((800, 800), Image.ANTIALIAS)
        picture_time = timezone.now().strftime('%H%M%S%f')
        picture_tail = str(file).split('.')[-1]
        os.makedirs(dir_name, exist_ok=True)
        fileName = dir_name + '%s.%s' % (picture_time, picture_tail)
        if len(img.split()) == 4:
            r, g, b, a = img.split()  # 利用split和merge将通道从四个转换为三个
            toImage = Image.merge("RGB", (r, g, b))
            toImage.save(fileName , quality=100)
        else:
            img.save(fileName, "JPEG",quality=100)
    return response.Response({"fileName":fileName},status=status.HTTP_200_OK)


@api_view(['POST'])
def uploadCommodityFormatPic(request):
    """
    上传商品规格图片 \n
        :param
           lastPath:需要删除的图片路径
           file:图片
    """
    data = request.data
    if "lastPath" in data.keys():
        lastPath = data.pop('lastPath')[0]
        if lastPath:
            # 判断文件是否存在
            if os.path.exists(lastPath):
                removeFile(lastPath)
    # 检查是否符合规范
    suffix = ["bmp", "jpg", "jpeg", "png"]

    file = data.get("file", None)
    if file is None:
        return response.Response({"error": "请选择图片"},
                                     status=status.HTTP_400_BAD_REQUEST)
    else:
        picture_tail = str(file).split('.')[-1].lower()
        if picture_tail not in suffix:
            return response.Response({"error": "图片格式不符合规范,仅支持bmp,jpg,jpeg,png"},
                                     status=status.HTTP_400_BAD_REQUEST)

    dir_name = 'uploaded/hotel/%d/CommodityFormat/pic/' % request.staff.branch.hotel_id
    # fileName = uploadFile(file, dir_name)
    # fileNameList.append(fileName)

    # 创建缩略图
    img = Image.open(file)
    img = img.resize((800, 800), Image.ANTIALIAS)
    picture_time = timezone.now().strftime('%H%M%S%f')
    picture_tail = str(file).split('.')[-1]
    os.makedirs(dir_name, exist_ok=True)
    fileName = dir_name + '%s.%s' % (picture_time, picture_tail)
    if len(img.split()) == 4:
        r, g, b, a = img.split()  # 利用split和merge将通道从四个转换为三个
        toImage = Image.merge("RGB", (r, g, b))
        toImage.save(fileName , quality=100)
    else:
        img.save(fileName, "JPEG",quality=100)
    return response.Response({"fileName":fileName},status=status.HTTP_200_OK)


@api_view(['POST'])
@schema(deleteFileSchema)
def deleteFile(request):
    """
    删除文件
    """
    path = request.data['path']
    if os.path.exists(path):
        removeFile(path)
    return response.Response(status=status.HTTP_200_OK)

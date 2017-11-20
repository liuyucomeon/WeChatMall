import os

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
    dir_name = 'uploaded/picture/hotel/%d/NewsType/' % request.staff.branch.hotel_id
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
    dir_name = 'uploaded/picture/hotel/%d/News/' % request.staff.branch.hotel_id
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
    dir_name = 'uploaded/picture/hotel/%d/News/audio/' % request.staff.branch.hotel_id
    fileName = uploadFile(file, dir_name)
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

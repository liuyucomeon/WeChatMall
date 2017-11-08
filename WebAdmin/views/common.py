import os

from rest_framework import status, response
from rest_framework.decorators import api_view, schema

from WebAdmin.schema.webSchema import uploadFileSchema, deleteFileSchema
from WebAdmin.utils.upload import uploadFile, removeFile


@api_view(['POST'])
@schema(uploadFileSchema)
def uploadNewsTypePic(request):
    """
    上传图像
    """
    lastPath = request.data['lastPath']
    if lastPath:
        # 判断文件是否存在
        if os.path.exists(lastPath):
            removeFile(lastPath)
    file = request.data['file']
    dir_name = 'uploaded/picture/branch/%d/' % request.staff.branch.id
    fileName = uploadFile(file, dir_name)
    return response.Response({"fileName":fileName},status=status.HTTP_200_OK)


@api_view(['POST'])
@schema(deleteFileSchema)
def deleteFile(request):
    """
    删除图像
    """
    path = request.data['path']
    if os.path.exists(path):
        removeFile(path)

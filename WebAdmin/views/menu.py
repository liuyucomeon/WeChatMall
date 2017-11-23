import json

import requests
from django.db.models import Max
from rest_framework import viewsets, status, mixins, generics
from rest_framework.decorators import api_view, schema
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response

from WeChat.views.auth import _getAccessToken
from WeChatMall.settings import wechatUrl, logger
from WebAdmin.models import Hotel
from WebAdmin.models.menu import WeChatMenu
from WebAdmin.schema.webSchema import CustomSchema, swapMenuSchema, tokenSchema, publishMenuSchema
from WebAdmin.serializers.menu import WeChatMenuSerializer


class WeChatMenuViewSet(viewsets.ModelViewSet):
    """
    create:
        创建微信菜单
    partial_update:
        根据id局部更新微信菜单
    update:
        根据id更新微信菜单
    destroy:
        根据id删除微信菜单
    list:
        查询微信菜单类型
    retrieve:
        根据id查询微信菜单
    """
    queryset = WeChatMenu.objects.all()
    serializer_class = WeChatMenuSerializer
    schema = CustomSchema()

    def create(self, request, *args, **kwargs):
        data = request.data
        #主菜单不能大于五，子菜单不能大于三
        if not data.get("parent", None):
            mainMenus = WeChatMenu.objects.filter(hotel_id=data['hotel'], parent_id=None)
            if mainMenus.count() < 3:
                serializer=insertMenu(data, mainMenus)
                if serializer.is_valid():
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response({"error": ["主菜单最多只能创建三个"]}, status=status.HTTP_403_FORBIDDEN)
        else:
            childMenus = WeChatMenu.objects.filter(hotel_id=data['hotel'], parent_id=data['parent'])
            if childMenus.count() < 5:
                serializer = insertMenu(data, childMenus)
                if serializer.is_valid():
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response({"error": ["子菜单最多只能创建五个"]}, status=status.HTTP_403_FORBIDDEN)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class HotelBranchMenusList(mixins.ListModelMixin,
                               generics.GenericAPIView):
    queryset = WeChatMenu.objects.all()
    serializer_class = WeChatMenuSerializer
    schema = CustomSchema()

    def get(self, request, hotelId):
        """
        获取单个酒店微信菜单
        """
        menus = WeChatMenu.objects.filter(hotel_id=hotelId).order_by('order')
        result, childMenuMap = {},{}
        mainMenuList,resultList = [],[]
        for menu in menus:
            childMenuList = childMenuMap.get(menu.parent_id, [])
            if menu.parent_id is None:
                mainMenuList.append(menu)
                childMenuMap[menu.id] = childMenuList
            else:
                childSerializer = WeChatMenuSerializer(menu)
                childMenuList.append(childSerializer.data)
                childMenuMap[menu.parent_id] = childMenuList

        # 对主菜单排序
        # sortedMainMenuList = sorted(mainMenuList, key=lambda x:x.order)
        for menu in mainMenuList:
            mainSerializer = WeChatMenuSerializer(menu)
            data = mainSerializer.data
            data["childMenuList"] = childMenuMap[menu.id]
            resultList.append(data)

        result["result"] = resultList

        return Response(result)

@api_view(['POST'])
@schema(swapMenuSchema)
def swapWechatMenuOrder(request, hotelId):
        """
        交换目录类型顺序
        """
        data = request.data
        menu1 = get_object_or_404(WeChatMenu, pk=data['menu1'], hotel=hotelId)
        menu2 = get_object_or_404(WeChatMenu, pk=data['menu2'], hotel=hotelId)

        if menu1.parent_id != menu2.parent_id:
            return Response({"error": ["只能交换同一个父目录或同一个父目录的子目录"]}, status=status.HTTP_403_FORBIDDEN)

        tmp = menu1.order
        menu1.order = menu2.order
        menu2.order = tmp
        menu1.save()
        menu2.save()
        return Response(status.HTTP_200_OK)


@api_view(['POST'])
@schema(publishMenuSchema)
def publishWechatMenu(request, hotelId):
    """
    发布微信目录
    :param access_token: 微信验证token
    :param request: 
    :return: 
    """
    hotel = get_object_or_404(Hotel, pk=hotelId)
    access_token = _getAccessToken(hotel)
    url = wechatUrl + "menu/create?access_token=" + access_token
    #获取酒店所有微信目录
    menus = WeChatMenu.objects.filter(hotel_id=hotelId).order_by("order")
    result, childMenuMap = {}, {}
    mainMenuList, resultList = [], []
    for menu in menus:
        if menu.parent_id is None:
            mainMenuList.append(menu)
            childMenuMap[menu.id] = childMenuMap.get(menu.id, [])
        else:
            childMenuList = childMenuMap.get(menu.parent_id, [])
            childMenuList.append({"type":menu.type,"name":menu.name,"url":menu.url})
            childMenuMap[menu.parent_id] = childMenuList

    for menu in mainMenuList:
        data = dict()
        if len(childMenuMap[menu.id]) > 0:
            data["sub_button"] = childMenuMap[menu.id]
        else:
            data["type"] = menu.type
            data["url"] = menu.url
        data["name"] = menu.name
        resultList.append(data)
    result["button"] = resultList

    r = requests.post(url=url, data=json.dumps(result,ensure_ascii=False).encode('utf-8'))
    # req = urllib.request.Request()
    res = r.text
    logger.info(res)
    if json.loads(res)["errmsg"] == "ok":
        return Response(result)
    return Response(res, status=status.HTTP_400_BAD_REQUEST)


def insertMenu(data, menus):
    maxOrder = menus.aggregate(Max('order'))
    if maxOrder['order__max']:
        data['order'] = maxOrder['order__max'] + 1
    else:
        data['order'] = 1
    serializer = WeChatMenuSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
    return serializer
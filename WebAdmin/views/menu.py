from django.db.models import Max
from rest_framework import viewsets, status, mixins, generics
from rest_framework.decorators import detail_route
from rest_framework.response import Response

from WebAdmin.models.menu import WeChatMenu
from WebAdmin.schema.webSchema import CustomSchema
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
            mainMenus = WeChatMenu.objects.filter(branch_id=data['branch'], parent_id=None)
            if mainMenus.count() < 3:
                serializer=insertMenu(data, mainMenus)
                if serializer:
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response({"error": ["主菜单最多只能创建三个"]}, status=status.HTTP_403_FORBIDDEN)
        else:
            childMenus = WeChatMenu.objects.filter(branch_id=data['branch'], parent_id=data['parent'])
            if childMenus.count() < 5:
                serializer = insertMenu(data, childMenus)
                if serializer:
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response({"error": ["子菜单最多只能创建五个"]}, status=status.HTTP_403_FORBIDDEN)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class HotelBranchMenusList(mixins.ListModelMixin,
                               generics.GenericAPIView):
    """
    单个酒店的微信菜单
    """

    queryset = WeChatMenu.objects.all()
    serializer_class = WeChatMenuSerializer
    schema = CustomSchema()

    def get(self, request, branchId):
        """
        获取单个酒店微信菜单
        """
        menus = WeChatMenu.objects.filter(branch_id=branchId).order_by('order')
        result, childMenuMap = {},{}
        mainMenuList,resultList = [],[]
        for menu in menus:
            childMenuList = childMenuMap.get(menu.parent_id, [])
            if menu.parent_id is None:
                mainMenuList.append(menu)
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
import json

import requests
from django.db.models import F
from django.forms import model_to_dict
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, schema, permission_classes
from rest_framework.generics import ListAPIView, DestroyAPIView
from rest_framework.response import Response

from WeChat.permission.permission import ShoppingCartPermission, OrderPermission, ShoppingCartPermission2
from WeChatMall.settings import logger
from WebAdmin.models import ShoppingCart, Order, CommodityFormat, OrderCommodityFormatMapping, TrackCompany, Commodity
from WebAdmin.schema.webSchema import WeChatCommonSchema, CustomSchema, shoppingCartSchema, orderSchema, \
    queryTrackSchema, deleteSCartBatch
from WebAdmin.serializers.order import ShoppingCartSerializer, OrderSerializer, ShoppingCartRSerializer
from WebAdmin.utils.common import convertToMapByField, getFieldList, getFieldSet
from WebAdmin.utils.page import TwentySetPagination


class ShoppingCartViewSet(viewsets.ModelViewSet):
    """
    create:
        
    partial_update:
        根据id局部更新购物车商品
    update:
        根据id更新购物车商品
    destroy:
        根据id删除购物车商品
    list:
        查询购物车商品列表
    retrieve:
        根据id查询购物车商品
    """
    queryset = ShoppingCart.objects.all()
    serializer_class = ShoppingCartSerializer
    pagination_class = TwentySetPagination
    permission_classes = (ShoppingCartPermission,)
    schema =  CustomSchema()

    def list(self, request, *args, **kwargs):
        return Response(status=status.HTTP_404_NOT_FOUND)

    def create(self, request, *args, **kwargs):
        """
        购物车添加商品 \n
            :param request: 
            :param args: 
            :param kwargs: 
                    commodityFormat:商品规格ID
                    count:商品数量
                    branch_id
            :return: 
        """
        data = request.data
        data["customer"] = request.customer.id
        serializer = ShoppingCartSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(data=serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class ShoppingCartByCustomer(ListAPIView):

    queryset = ShoppingCart.objects.all()
    serializer_class = ShoppingCartRSerializer
    pagination_class = TwentySetPagination
    permission_classes = (ShoppingCartPermission2,)
    schema = shoppingCartSchema


    def get(self, request, pk):
        """
        获取用户购物车商品列表(有效或无效)
        """
        param = request.query_params
        shoppings = ShoppingCart.objects.filter(customer_id=pk)
        if param.get("branchId", None):
            shoppings = shoppings.filter(branch_id=param["branchId"])
        if "enabled" in request.path:
            shoppings = shoppings.filter(isEnabled=True)
        else:
            shoppings = shoppings.filter(isEnabled=False)

        page = self.paginate_queryset(shoppings)

        # 获取商品描述
        commodityIdSet = set()
        for one in page:
            commodityIdSet.add(one.commodityFormat.commodity_id)
        descriptions = Commodity.objects.filter(id__in=commodityIdSet).values("id", "description")
        descriptionMap = {}
        for description in descriptions:
            descriptionMap[description["id"]] = description["description"]
        for one in page:
            one.description = descriptionMap[one.commodityFormat.commodity_id]

        serializer = ShoppingCartRSerializer(page, many=True)
        return self.get_paginated_response(serializer.data)


@api_view(['DELETE'])
@permission_classes([ShoppingCartPermission2,])
@schema(deleteSCartBatch)
def deleteComInSCartBatch(request, pk):
    """
    批量删除购物车商品 \n
        :param pk: 顾客id
        :param request: 
        :param args: 
        :param kwargs:
                    idList:购物车id列表 e.g.[1,2,3]
        :return: 
    """
    idList = request.data["idList"]
    ShoppingCart.objects.filter(id__in=idList, customer_id=pk).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


class OrderViewSet(viewsets.ModelViewSet):
    """
    create:
        
    partial_update:
        根据id局部更新订单
    update:
        根据id更新订单
    destroy:
        根据id删除订单
    list:
        查询客户订单列表
    retrieve:
        根据id查询订单
    """
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    pagination_class = TwentySetPagination
    permission_classes = (OrderPermission,)
    schema = CustomSchema()

    def create(self, request, *args, **kwargs):
        """
        创建订单 \n
            status : 状态(0, '已失效'), (1, '待支付'), (2, '已完成支付'), (3, '交易完成'), 
            customer : 买家 
            leaveMessage :  买家留言, 
            customerAddress : 收货地址
            commoditys : [
                商品列表{commodityFormat:商品规格id,count:数量}
            ]
        """
        data = request.data

        orderSerializer = OrderSerializer(data=data)
        if orderSerializer.is_valid():
            orderSerializer.save()
            # 减少库存
            commoditys = data["commoditys"]
            for commodity in commoditys:
                commodityId = commodity["commodityFormat"]
                CommodityFormat.objects.filter(id=commodityId).update(
                    inventory=(F("inventory") - commodity["count"]))

            return Response(data=orderSerializer.data)
        else:
            return Response(orderSerializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OrderByCustomer(ListAPIView):
    """
    查询用户订单列表(根据不同门店)
    :param request:
    :param customerId: 顾客id
    :return:
    """
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    pagination_class = TwentySetPagination
    permission_classes = (OrderPermission,)
    schema = orderSchema

    def get(self, request, pk):
        param = request.query_params
        page = param.get("page", 1)
        pageSize = param.get("pageSize", 10)
        orders = Order.objects.filter(customer_id=pk)
        if param.get("branchId", None):
            orders = orders.filter(branch_id=param["branchId"])
        orders = orders[(int(page)-1)*int(pageSize) : int(pageSize)]

        orderIdList = getFieldList(orders)

        ocfms = OrderCommodityFormatMapping.objects.filter(order_id__in=orderIdList)
        # 商品id集合
        commodityFormatIdSet = getFieldSet(ocfms, "commodityFormat_id")
        commodityFormats = CommodityFormat.objects.filter(id__in=commodityFormatIdSet)

        commodityFormatMap = convertToMapByField(commodityFormats, "id")
        for k,v in commodityFormatMap.items():
            commodityFormatMap[k] = model_to_dict(v)

        orderCommodityFormatMap = {}
        for ocfm in ocfms:
            # ocfm.commodityFormat = commodityFormatMap[ocfm.commodityFormat_id]
            # 订单id为键，商品列表为值
            commodityFormatList = orderCommodityFormatMap.get(ocfm.order_id,[])
            commodityFormatList.append({"count":ocfm.count,
                                        "commodityFormat":commodityFormatMap[ocfm.commodityFormat_id]})
            orderCommodityFormatMap[ocfm.order_id] = commodityFormatList

        result=[]
        for order in orders:
            order = model_to_dict(order)
            order["commoditys"] = orderCommodityFormatMap.get(order["id"], [])
            result.append(order)

        return Response(result)

        # 这个方法简单，效率低。。。。
        # param = request.query_params
        # orders = Order.objects.filter(customer_id=pk)
        # if param.get("branchId", None):
        #     orders = orders.filter(branch_id=param["branchId"])
        # page = self.paginate_queryset(orders)
        # serializer = OrderSerializer(page, many=True)
        # return self.get_paginated_response(serializer.data)


@api_view(['GET'])
@schema(queryTrackSchema)
def queryTrack(request):
    """
    根据快递单号查询
    :param request:
    :return:
    """
    param = request.query_params
    key = "295b109e65aa680d0b3160a37f45d046"
    url = "http://v.juhe.cn/exp/index?key=" + key + "&com=" + param["com"] \
          + "&no=" + param["no"]
    result = requests.get(url).text
    return Response(json.loads(result))


@api_view(['GET'])
def TrackComNum(request):
    """
    把快递公司对照表导入自己数据库
    :param request: 
    :return: 
    """
    result = requests.get("http://v.juhe.cn/exp/com?key=295b109e65aa680d0b3160a37f45d046")
    companys = json.loads(result.text)["result"]
    order=1
    for one in companys:
        company = TrackCompany(fullName=one["com"], shortName=one["no"], order=order)
        company.save()
        order += 1
    return Response(status=status.HTTP_200_OK)



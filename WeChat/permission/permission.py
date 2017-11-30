import pickle
import re

from django_redis import get_redis_connection
from rest_framework import permissions, exceptions

from WeChatMall.settings import logger
from WebAdmin.models import CustomerAddress, ShoppingCart


def validateToken(request):
    token = request.META.get('HTTP_TOKEN')
    redisDB = get_redis_connection('default')
    customerByte = redisDB.get("wtoken:" + token)
    if not customerByte:
        raise exceptions.AuthenticationFailed('用户认证失败')
    customer = pickle.loads(customerByte)
    request.customer = customer
    return customer


class CustomerPermission(permissions.BasePermission):
    """
    验证顾客操作权限
    """

    def has_permission(self, request, view):
        # 不然文档显示不出来
        if re.match(r'^/docs/$', request.path):
            return True

        customer = validateToken(request)
        value = re.match(r'^/WeChat/customers/(\d+)/$', request.path)
        if value:
            if customer.id == int(value.group(1)):
                return True
        return False


class CustomerAddressPermission(permissions.BasePermission):
    """
    验证顾客地址操作权限
    """

    def has_permission(self, request, view):
        if re.match(r'^/docs/$', request.path):
            return True

        customer = validateToken(request)
        if re.match(r'^/WeChat/customerAddresses/$', request.path):
            return True
        value = re.match(r'^/WeChat/customerAddresses/(\d+)/$', request.path)
        if value:
            exists = CustomerAddress.objects.filter(id=value.group(1), customer_id=customer.id).exists()
            if exists:
                return True
        return False


class ShoppingCartPermission(permissions.BasePermission):
    """
    验证顾客地址操作权限
    """

    def has_permission(self, request, view):
        if re.match(r'^/docs/$', request.path):
            return True

        customer = validateToken(request)
        if re.match(r'^/WeChat/shoppingCarts/$', request.path):
            return True
        value = re.match(r'^/WeChat/shoppingCarts/(\d+)/$', request.path)
        if value:
            exists = ShoppingCart.objects.filter(id=value.group(1), customer_id=customer.id).exists()
            if exists:
                return True
        return False



import re
from rest_framework import permissions
from WebAdmin.models import Customer, CustomerAddress, ShoppingCart


class CustomerPermission(permissions.BasePermission):
    """
    验证顾客操作权限
    """

    def has_permission(self, request, view):
        # 不然文档显示不出来
        if re.match(r'^/docs/$', request.path):
            return True
        value = re.match(r'^/WeChat/customers/(\d+)/$', request.path)
        if value:
            exists = Customer.objects.filter(id=value.group(1),
                                    follower__openid=request.META.get('HTTP_OPENID')).exists()
            if exists:
                    return True
        return False

class CustomerAddressPermission(permissions.BasePermission):
    """
    验证顾客地址操作权限
    """

    def has_permission(self, request, view):
        if re.match(r'^/docs/$', request.path):
            return True

        value = re.match(r'^/WeChat/customerAddresses/(\d+)/$', request.path)
        if value:
            exists = CustomerAddress.objects.filter(id=value.group(1),
                            customer__follower__openid=request.META.get('HTTP_OPENID')).exists()
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

        value = re.match(r'^/WeChat/shoppingCarts/(\d+)/$', request.path)
        if value:
            exists = ShoppingCart.objects.filter(id=value.group(1),
                            customer__follower__openid=request.META.get('HTTP_OPENID')).exists()
            if exists:
                return True
        return False

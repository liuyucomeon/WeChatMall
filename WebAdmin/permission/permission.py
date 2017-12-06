import re

from rest_framework import permissions
from rest_framework.generics import get_object_or_404

from WebAdmin.models import Order


class OrderPermission(permissions.BasePermission):
    """
    验证顾客订单权限
    """

    def has_permission(self, request, view):
        if re.match(r'^/docs/$', request.path):
            return True

        value1 = re.match(r'^/WebAdmin/orders/(\d+)/$', request.path)

        if value1:
            order = get_object_or_404(Order, orderNum=value1.group(1))
            if order.branch_id == request.staff.branch_id:
                return True
        return False

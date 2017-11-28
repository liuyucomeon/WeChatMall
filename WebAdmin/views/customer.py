from rest_framework import viewsets

from WebAdmin.models import Customer
from WebAdmin.schema.webSchema import CustomSchema
from WebAdmin.serializers.customer import CustomerSerializer
from WebAdmin.utils.page import TwentySetPagination


class CustomerViewSet(viewsets.ModelViewSet):
    """
    create:
        创建客户
    partial_update:
        根据id局部更新客户
    update:
        根据id更新客户
    destroy:
        根据id删除客户
    list:
        查询客户列表
    retrieve:
        根据id查询客户
    """
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    pagination_class = TwentySetPagination
    schema = CustomSchema()
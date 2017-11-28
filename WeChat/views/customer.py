from rest_framework import mixins, generics, status, viewsets
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response

from WeChat.permission.permission import CustomerPermission, CustomerAddressPermission
from WebAdmin.models import Customer, CustomerAddress
from WebAdmin.schema.webSchema import WeChatCommonSchema
from WebAdmin.serializers.customer import CustomerSerializer, CustomerAddressSerializer
from WebAdmin.utils.page import TwentySetPagination


class CustomerList(mixins.CreateModelMixin,
                   generics.GenericAPIView):
    """
    post:
        创建一个客户
        ---
        parameters:
            - openid:每个公众号下标识用户身份
            - name:名字
        responseMessages:
            - code: 201
              message: Created
    """
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = (CustomerPermission,)

    def post(self, request, *args, **kwargs):
        data = request.data
        serializer = CustomerSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class CustomerDetail(mixins.RetrieveModelMixin,
                     mixins.UpdateModelMixin,
                     generics.GenericAPIView):
    """
    patch:
        更新一个客户
        ---
        parameters:
            - name:名字
        responseMessages:
            - code: 200
    """
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = (CustomerPermission,)
    schema = WeChatCommonSchema()

    def retrieve(self, request, *args, **kwargs):
        pass

    def patch(self, request, *args, **kwargs):
        data = request.data
        data["pk"] = kwargs["pk"]
        customer = get_object_or_404(Customer, pk=kwargs["pk"])

        serializer = CustomerSerializer(customer, data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomerAddressViewSet(viewsets.ModelViewSet):
    """
    create:
        创建客户地址
    partial_update:
        根据id局部更新客户地址
    update:
        根据id更新客户地址
    destroy:
        根据id删除客户地址
    list:
        查询客户地址列表
    retrieve:
        根据id查询客户地址
    """
    queryset = CustomerAddress.objects.all()
    serializer_class = CustomerAddressSerializer
    pagination_class = TwentySetPagination
    permission_classes = (CustomerAddressPermission,)
    schema = WeChatCommonSchema()

    def list(self, request, *args, **kwargs):
        pass


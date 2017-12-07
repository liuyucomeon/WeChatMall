from django.db import transaction
from rest_framework import mixins, generics, status, viewsets
from rest_framework.generics import get_object_or_404, RetrieveAPIView, RetrieveUpdateAPIView, ListAPIView
from rest_framework.response import Response

from WeChat.permission.permission import CustomerPermission, CustomerAddressPermission, DefaultAddressPermission
from WebAdmin.models import Customer, CustomerAddress
from WebAdmin.schema.webSchema import WeChatCommonSchema, CustomSchema
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
    schema = CustomSchema()

    def retrieve(self, request, *args, **kwargs):
        pass

    def patch(self, request, *args, **kwargs):
        data = request.data
        data["pk"] = kwargs["pk"]
        customer = get_object_or_404(Customer, pk=kwargs["pk"])

        serializer = CustomerSerializer(customer, data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
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
    schema = CustomSchema()

    def create(self, request, *args, **kwargs):
        data = request.data
        customer = request.customer
        if data.get("isDefault"):
            data["isDefault"] = False
        exists = CustomerAddress.objects.filter(customer_id=customer.id).exists()
        if not exists:
            data["isDefault"] = True
        serializer = CustomerAddressSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AddressByCustomer(ListAPIView):
    queryset = CustomerAddress.objects.all()
    serializer_class = CustomerAddressSerializer
    pagination_class = TwentySetPagination
    permission_classes = (DefaultAddressPermission,)
    schema = CustomSchema()

    def get(self, request, *args, **kwargs):
        """
        获取用户地址列表 \n
            :param request: 
            :param args: 
            :param kwargs: 
            :return: 
        """
        addresses = CustomerAddress.objects.filter(customer_id=kwargs["pk"])\
            .order_by("-isDefault")
        serializer = CustomerAddressSerializer(addresses, many=True)
        return Response(serializer.data)


class DefaultAddress(RetrieveUpdateAPIView):
    queryset = CustomerAddress.objects.all()
    serializer_class = CustomerAddressSerializer
    pagination_class = TwentySetPagination
    permission_classes = (DefaultAddressPermission,)
    schema = CustomSchema()

    def get(self, request, *args, **kwargs):
        """
        获取用户默认地址 
        """
        customerId = kwargs["pk"]
        defaultAddress = get_object_or_404(CustomerAddress, customer_id=customerId, isDefault=True)
        serializer = CustomerAddressSerializer(defaultAddress)
        return Response(serializer.data)

    def patch(self, request, *args, **kwargs):
        """
        修改用户默认地址 \n
            :param request: 
                        address:新地址id
            :param args: 
            :param kwargs: 
                        id:用户id
            :return: 
        """
        data = request.data
        newDefaultAddress = get_object_or_404(CustomerAddress, id=data["address"])
        newDefaultAddress.isDefault = True

        oldDefaultAddress = CustomerAddress.objects.get(customer_id=kwargs["pk"], isDefault=True)
        oldDefaultAddress.isDefault = False

        with transaction.atomic():
            newDefaultAddress.save()
            oldDefaultAddress.save()
        return Response(status=status.HTTP_200_OK)




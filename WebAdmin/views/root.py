# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse


# @api_view(['GET'])
# def api_root(request, format=None):
#     return Response({
#         'users': reverse("user-list", request=request, format=format),
#         'staffs': reverse("staff-list", request=request, format=format),
#         'hotels': reverse("hotel-list", request=request, format=format),
#         'hotelBranch': reverse("hotelBranch-list", request=request, format=format),
#     })



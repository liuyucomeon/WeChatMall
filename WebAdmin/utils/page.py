from rest_framework.pagination import PageNumberPagination


class TwentySetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'pageSize'
    max_page_size = 1000
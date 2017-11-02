import coreapi
import coreschema
from rest_framework.schemas import ManualSchema, AutoSchema


class CustomSchema(AutoSchema):
    def get_link(self, path, method, base_url):
        link = super().get_link(path, method, base_url)
        fields = list(link.fields)
        fields.append(tokenField)
        link._fields = fields
        return link

tokenField = coreapi.Field(
                "token",
                required=True,
                location="header",
                description="token",
                schema=coreschema.String()
        )

registerSchema = ManualSchema(fields=[
        coreapi.Field(
            "phone",
            required=True,
            location="path",
            description="电话",
            schema=coreschema.String()
        ),
        coreapi.Field(
            "token",
            required=True,
            location="header",
            description="token",
            schema=coreschema.String()
        ),
    ])

loginSchema = ManualSchema(fields=[
        coreapi.Field(
            "username",
            required=True,
            location="query",
            description="用户名",
            schema=coreschema.String()
        ),
        coreapi.Field(
            "password",
            required=True,
            location="query",
            description="密码",
            schema=coreschema.String()
        )
    ])

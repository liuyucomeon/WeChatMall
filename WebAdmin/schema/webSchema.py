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

tokenSchema = ManualSchema(fields=[
        tokenField
    ])

registerSchema = ManualSchema(
    description="获取注册验证码",
    fields=[
        coreapi.Field(
            "phone",
            required=True,
            location="path",
            description="电话",
            schema=coreschema.String()
        )
    ])

loginSchema = ManualSchema(
    description="公众号管理员登录 ",
    fields=[
        coreapi.Field(
            "username",
            required=True,
            location="form",
            description="用户名",
            schema=coreschema.String()
        ),
        coreapi.Field(
            "password",
            required=True,
            location="form",
            description="密码",
            schema=coreschema.String()
        )
    ])

logoutSchema = ManualSchema(
    description="公众号管理员退出登录 ",
    fields=[
        tokenField
    ]
)

# 交换新闻类型顺序
swapNewsSchema = ManualSchema(
    description="交换新闻类型顺序 ",
    fields=[
        tokenField,
        coreapi.Field(
            "branchId",
            required=True,
            location="path",
            description="酒店id",
            schema=coreschema.String()
        ),
        coreapi.Field(
            "newsType1",
            required=True,
            location="form",
            description="新闻类型1",
            schema=coreschema.String()
        ),
        coreapi.Field(
            "newsType2",
            required=True,
            location="form",
            description="新闻类型2",
            schema=coreschema.String()
        ),
    ]
)

# 交换目录顺序
swapMenuSchema= ManualSchema(
    description="交换新闻类型顺序 ",
    fields=[
        tokenField,
        coreapi.Field(
            "hotelId",
            required=True,
            location="path",
            description="酒店id",
            schema=coreschema.String()
        ),
        coreapi.Field(
            "menu1",
            required=True,
            location="form",
            description="目录一",
            schema=coreschema.String()
        ),
        coreapi.Field(
            "menu2",
            required=True,
            location="form",
            description="目录一",
            schema=coreschema.String()
        ),
    ]
)

# 发布目录
publishMenuSchema= ManualSchema(
    description="发布微信目录到公众号 ",
    fields=[
        tokenField,
        coreapi.Field(
            "hotelId",
            required=True,
            location="path",
            description="酒店id",
            schema=coreschema.String()
        )
    ]
)

# 上传文件
uploadNewsTypeSchema = ManualSchema(
    description="上传新闻类型图标",
    fields=[
        tokenField,
        coreapi.Field(
            "file",
            required=True,
            location="form",
            description="文件",
            schema=coreschema.String()
        ),
        coreapi.Field(
            "lastPath",
            required=False,
            location="form",
            description="上次路径",
            schema=coreschema.String()
        ),
    ]
)
# 上传新闻图像
uploadNewsPicSchema = ManualSchema(
    description="上传新闻图标",
    fields=[
        tokenField,
        coreapi.Field(
            "file",
            required=True,
            location="form",
            description="文件",
            schema=coreschema.String()
        ),
        coreapi.Field(
            "lastPath",
            required=False,
            location="form",
            description="上次路径",
            schema=coreschema.String()
        ),
    ]
)

# 上传新闻音频
uploadNewsAudioSchema = ManualSchema(
    description="上传新闻音频",
    fields=[
        tokenField,
        coreapi.Field(
            "file",
            required=True,
            location="form",
            description="文件",
            schema=coreschema.String()
        ),
        coreapi.Field(
            "lastPath",
            required=False,
            location="form",
            description="上次路径",
            schema=coreschema.String()
        ),
    ]
)

# 删除文件
deleteFileSchema = ManualSchema(
    description="删除文件",
    fields=[
        tokenField,
        coreapi.Field(
            "filePath",
            required=True,
            location="path",
            description="文件路径",
            schema=coreschema.String()
        )
    ]
)
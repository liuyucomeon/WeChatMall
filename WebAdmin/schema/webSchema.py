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

class WeChatCommonSchema(AutoSchema):
    def get_link(self, path, method, base_url):
        link = super().get_link(path, method, base_url)
        fields = list(link.fields)
        fields.append(openidField)
        link._fields = fields
        return link

tokenField = coreapi.Field(
                "token",
                required=True,
                location="header",
                description="token",
                schema=coreschema.String()
        )

openidField = coreapi.Field(
            "openid",
            required=True,
            location="form",
            description="客户身份",
            schema=coreschema.String()
        )

tokenSchema = ManualSchema(fields=[
        tokenField
    ])

# 微信端用户认证
# openidSchema = ManualSchema(fields=[
#         coreapi.Field(
#             "openid",
#             required=True,
#             location="header",
#             description="客户身份",
#             schema=coreschema.String()
#         )
#     ])

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

# 交换商品类型
swapCommodityTypeSchema = ManualSchema(
    description="交换商品类型顺序 ",
    fields=[
        tokenField,
        coreapi.Field(
            "branchId",
            required=True,
            location="path",
            description="门店id",
            schema=coreschema.String()
        ),
        coreapi.Field(
            "type1",
            required=True,
            location="form",
            description="商品类型1",
            schema=coreschema.String()
        ),
        coreapi.Field(
            "type2",
            required=True,
            location="form",
            description="商品类型1",
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

# 根据商品id获取所有规格
CommodityFormatBySortSchema = ManualSchema(
    description="根据商品id获取所有规格",
    fields=[
        tokenField,
        coreapi.Field(
            "commodityId",
            required=True,
            location="path",
            description="商品id",
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
            "path",
            required=True,
            location="path",
            description="文件路径",
            schema=coreschema.String()
        )
    ]
)

# 根据token获取酒店信息
hotelBranchTokenSchema = ManualSchema(
    description="根据token获取酒店信息",
    fields=[
        tokenField
    ]
)

# 根据token获取员工信息
staffTokenSchema = ManualSchema(
    description="根据token获取员工信息",
    fields=[
        tokenField
    ]
)

# 微商城登录
weChatLoginSchema = ManualSchema(
    description="微商城登录",
    fields=[
        openidField
    ]
)

# 获取accessToken和openid
webAccessTokenSchema = ManualSchema(
    description="获取openid",
    fields=[
        coreapi.Field(
            "code",
            required=True,
            location="query",
            description="验证码",
            schema=coreschema.String()
        ),
        coreapi.Field(
            "state",
            required=True,
            location="query",
            description="state参数",
            schema=coreschema.String()
        ),
    ]
)

# 顾客购物车
shoppingCartSchema = ManualSchema(
    description="获取用户不同门店下购物车列表",
    fields=[
        tokenField,
        coreapi.Field(
            "id",
            required=True,
            location="path",
            description="客户id",
            schema=coreschema.String()
        ),
        coreapi.Field(
            "branchId",
            required=True,
            location="query",
            description="门店id",
            schema=coreschema.String()
        ),
    ]
)

# 顾客订单列表
orderSchema = ManualSchema(
    description="获取用户不同门店下订单列表",
    fields=[
        tokenField,
        coreapi.Field(
            "id",
            required=True,
            location="path",
            description="客户id",
            schema=coreschema.String()
        ),
        coreapi.Field(
            "branchId",
            required=True,
            location="query",
            description="门店id",
            schema=coreschema.String()
        ),
        coreapi.Field(
            "page",
            required=True,
            location="query",
            description="页数",
            schema=coreschema.String()
        ),
        coreapi.Field(
            "pageSize",
            required=True,
            location="query",
            description="每页大小",
            schema=coreschema.String()
        ),
    ]
)

# 快递查询
queryTrackSchema = ManualSchema(
    description="快递单号查询",
    fields=[
        coreapi.Field(
            "com",
            required=True,
            location="query",
            description="快递公司编号",
            schema=coreschema.String()
        ),
        coreapi.Field(
            "no",
            required=True,
            location="query",
            description="快递单号",
            schema=coreschema.String()
        ),
    ]
)
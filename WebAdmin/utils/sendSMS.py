import urllib

import requests

# 应用APPKEY
APPKEY = "8c1e68771e359596efdf92866afed9db"


def sendRegisterCode(phone, code):
    # 短信模版id
    templateId = "50037"
    tplValue = "#code#="+code
    tplValue = urllib.parse.quote(tplValue)
    result = requests.get("http://v.juhe.cn/sms/send?mobile="+phone+"&tpl_id="+templateId+
                          "&tpl_value="+tplValue+"&key="+APPKEY)
    if result.status_code == 200:
        return True
    return False


if __name__ == "__main__":
    sendRegisterCode("1565524272", "1234")
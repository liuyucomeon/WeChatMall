import os
import random
import string

import binascii


def getRandomChar(num):
    return ''.join(random.sample(string.ascii_letters+string.digits, num))

def generateToken():
    """
    生成token
    :return: 
    """
    return binascii.b2a_base64(os.urandom(24))[:-1].decode()

if __name__ == '__main__':
    a = generateToken()
    print(a)

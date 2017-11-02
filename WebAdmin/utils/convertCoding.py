def convertByteFromMap(map):
    """
    map中的字节转字符
    :param map: 
    :return: 
    """
    result = {}
    for k, v in map.items():
        k = k.decode()
        v = v.decode()
        result[k] = v
    return result

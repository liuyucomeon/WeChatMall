import pymysql


def migrateHotelData():
    """
    迁移hotel
    :return: 
    """
    # 打开数据库连接
    db1 = pymysql.connect("114.215.220.241","root","beijingyan","banquetExpert",charset="utf8")
    # 使用cursor()方法获取操作游标
    cursor1 = db1.cursor()

    # 酒店查询SQL
    sql1 = "select * from webApp_hotel "
    sql2 = "insert into WebAdmin_hotel(name, icon, ownerName, isEnabled, createTime, boss_id) " \
           "VALUES(%s, %s, %s, %s, %s, %s) "
    # 执行SQL语句
    cursor1.execute(sql1)
    # 获取所有记录列表
    results = cursor1.fetchall()
    values = []

    for row in results:
        values.append((row[1], row[5],row[2],row[3],row[4],row[11]))

    db2 = pymysql.connect("127.0.0.1", "root", "liuyu1994", "WeChatMall",charset="utf8")
    # 使用cursor()方法获取操作游标
    cursor2 = db2.cursor()
    try:
        # 执行sql语句
        cursor2.executemany(sql2, values)
        # 提交到数据库执行
        db2.commit()
    except Exception as e:
        # 发生错误时回滚
        print(e)
        db2.rollback()

    #关闭数据库连接
    db1.close()
    db2.close()

def migrateBranchData():
    """
    迁移branch(无法插入manager_id)
    :return: 
    """
    # 打开数据库连接
    db1 = pymysql.connect("114.215.220.241", "root", "beijingyan", "banquetExpert", charset="utf8")
    # 使用cursor()方法获取操作游标
    cursor1 = db1.cursor()
    db2 = pymysql.connect("127.0.0.1", "root", "liuyu1994", "WeChatMall", charset="utf8")
    cursor2 = db2.cursor()

    # 酒店查询SQL
    sql1 = "select * from webApp_hotelbranch"
    sql2 = "insert into WebAdmin_hotelbranch(name, icon, pictures, province, city, county, address,line" \
           ",navigation,meal_period,facility,pay_card,phone,cuisine,create_time,hotel_id,manager_id,isEnabled)" \
           " VALUES(%s, %s, %s, %s, %s, %s,%s, %s, %s, %s, %s, %s,%s, %s, %s, %s, %s, %s)"
    # 执行SQL语句
    cursor1.execute(sql1)
    # 获取所有记录列表
    results = cursor1.fetchall()
    values = []
    for row in results:
        # 获取酒店品牌id
        hotelId = row[14]
        cursor1.execute("select name from webApp_hotel where id=" + str(hotelId))
        hotelName = cursor1.fetchone()[0]
        cursor2.execute("select id from WebAdmin_hotel where name='%s'" % hotelName)
        hotelId = cursor2.fetchone()[0]

        values.append((row[1], row[2],row[3],row[4],row[5],row[6],row[7],row[18],row[19],row[16],row[8]
                       ,row[9],row[10],row[11],row[13],hotelId,None,row[12]))

    try:
        # 执行sql语句
        cursor2.executemany(sql2, values)
        # 提交到数据库执行
        db2.commit()
    except Exception as e:
        # 发生错误时回滚
        print(e)
        db2.rollback()

    # 关闭数据库连接
    db1.close()
    db2.close()


def migrateStaffData():
    """
    迁移branch(无法插入manager_id)
    :return: 
    """
    # 打开数据库连接
    db1 = pymysql.connect("114.215.220.241", "root", "beijingyan", "banquetExpert", charset="utf8")
    # 使用cursor()方法获取操作游标
    cursor1 = db1.cursor()
    db2 = pymysql.connect("127.0.0.1", "root", "liuyu1994", "WeChatMall", charset="utf8")
    cursor2 = db2.cursor()

    # 酒店查询SQL
    sql1 = "select * from webApp_staff"

    sql2 = "insert into auth_user(password, is_superuser, username, first_name, last_name, " \
           "email, is_staff,is_active,date_joined)" \
           "VALUES(%s, %s, %s, %s, %s, %s,%s, %s, %s)"

    sql3 = "insert into WebAdmin_staff(id_number, icon, gender, position, branch_id, user_id, nickname)" \
           "VALUES(%s, %s, %s, %s, %s, %s,%s)"
    # 执行SQL语句
    cursor1.execute(sql1)
    # 获取所有记录列表
    results = cursor1.fetchall()
    valuesUser = []
    valuesStaff = []
    for row in results:
        valuesUser.append((row[3], 0, row[2], '', '', '', 1, row[14], row[15]))

    try:
        # 执行sql语句
        cursor2.executemany(sql2, valuesUser)
        # 提交到数据库执行
        db2.commit()

    except Exception as e:
        # 发生错误时回滚
        print(e)
        db2.rollback()

    for row in results:
        # 获取酒店品牌id
        branchId = row[25]
        cursor1.execute("select name from webApp_hotelbranch where id=" + str(branchId))
        branchName = cursor1.fetchone()[0]
        cursor2.execute("select id from WebAdmin_hotelbranch where name='%s'" % branchName)
        branchId = cursor2.fetchone()[0]
        # 获取userId
        phone = row[2]
        cursor2.execute("select id from auth_user where username='%s'" % phone)
        userId = cursor2.fetchone()[0]
        valuesStaff.append((row[6], row[7], row[8], row[9], branchId, userId, row[5]))

    try:
        cursor2.executemany(sql3, valuesStaff)
        db2.commit()
    except Exception as e:
        # 发生错误时回滚
        print(e)
        db2.rollback()

    # 关闭数据库连接
    db1.close()
    db2.close()


if __name__ == "__main__":
    # migrateHotelData()
    # migrateBranchData()
    migrateStaffData()
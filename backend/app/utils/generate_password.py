from passlib.hash import bcrypt

users = [
    "nguyen.van.a@email.com",
    "tran.thi.b@email.com",
    "le.van.c@email.com",
    "pham.thi.d@email.com",
    "hoang.van.e@email.com",
    "john.smith@email.com",
    "sarah.johnson@email.com",
    "michael.brown@email.com",
    "emily.davis@email.com",
    "david.wilson@email.com"
]

password = "123456"  # mật khẩu gốc cho tất cả user

for email in users:
    hashed = bcrypt.hash(password)
    print(f"UPDATE Users SET password = '{hashed}' WHERE email = '{email}';")

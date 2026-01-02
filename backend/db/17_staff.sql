-- Tên file: fix_staff_upsert.sql
-- Mục đích: chèn các bản ghi staff nếu email chưa tồn tại (an toàn dù không có UNIQUE constraint)

BEGIN;

-- Bản ghi 1
INSERT INTO staff (admin_name, password, full_name, role, email, is_active, avatar)
SELECT 'ngquynhanh', '123456', 'Nguyễn Thị Quỳnh Anh', 'Super Admin', 'quynhanh@airvn.com', TRUE, 'https://cdn.airvn.com/avatar/quynh_anh.jpg'
WHERE NOT EXISTS (SELECT 1 FROM staff WHERE email = 'quynhanh@airvn.com');

-- Bản ghi 2
INSERT INTO staff (admin_name, password, full_name, role, email, is_active, avatar)
SELECT 'daongocbich', '123456', 'Đào Thị Ngọc Bích', 'Admin', 'ngocbich@airvn.com', TRUE, 'https://cdn.airvn.com/avatar/ngoc_bich.jpg'
WHERE NOT EXISTS (SELECT 1 FROM staff WHERE email = 'ngocbich@airvn.com');

-- Bản ghi 3
INSERT INTO staff (admin_name, password, full_name, role, email, is_active, avatar)
SELECT 'duongdiemquynh', '123456', 'Dương Diễm Quỳnh', 'Admin', 'diemquynh@airvn.com', TRUE, 'https://cdn.airvn.com/avatar/diem_quynh.jpg'
WHERE NOT EXISTS (SELECT 1 FROM staff WHERE email = 'diemquynh@airvn.com');

-- Bản ghi 4
INSERT INTO staff (admin_name, password, full_name, role, email, is_active, avatar)
SELECT 'luuthuytien', '123456', 'Lưu Thị Thủy Tiên', 'Admin', 'thuytien@airvn.com', TRUE, 'https://cdn.airvn.com/avatar/thuy_tien.jpg'
WHERE NOT EXISTS (SELECT 1 FROM staff WHERE email = 'thuytien@airvn.com');

COMMIT;
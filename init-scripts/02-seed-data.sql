-- =====================================================
-- 🧑‍💼 BẢNG NHÂN VIÊN QUẢN TRỊ (STAFF)
-- =====================================================
INSERT INTO Staff (admin_name, password, full_name, role, email, avatar)
VALUES
('quynhanh', 'hashed_password1', 'Nguyen Thi Quynh Anh', 'Super Admin', 'quynhanh@example.com', 'https://example.com/avatars/quynhanh.png'),
('ngocbich', 'hashed_password2', 'Dao Thi Ngoc Bich', 'Admin', 'ngocbich@example.com', 'https://example.com/avatars/ngocbich.png'),
('diemquynh', 'hashed_password3', 'Duong Diem Quynh', 'Admin', 'diemquynh@example.com', 'https://example.com/avatars/diemquynh.png'),
('thuytien', 'hashed_password4', 'Luu Thi Thuy Tien', 'Admin', 'thuytien@example.com', 'https://example.com/avatars/thuytien.png');

-- =====================================================
-- 👥 BẢNG NGƯỜI DÙNG (USERS)
-- =====================================================
INSERT INTO Users (email, password, first_name, last_name, address, phone, date_of_birth, gender)
VALUES
('minh.nguyen@gmail.com', 'hashed_pw1', 'Minh', 'Nguyen', 'Ha Noi', '0901111111', '1998-02-10', 'male'),
('hoa.tran@gmail.com', 'hashed_pw2', 'Hoa', 'Tran', 'Da Nang', '0902222222', '2000-05-05', 'female'),
('long.pham@gmail.com', 'hashed_pw3', 'Long', 'Pham', 'Ho Chi Minh', '0903333333', '1995-07-15', 'male'),
('thao.le@gmail.com', 'hashed_pw4', 'Thao', 'Le', 'Can Tho', '0904444444', '1999-03-25', 'female'),
('an.vo@gmail.com', 'hashed_pw5', 'An', 'Vo', 'Hue', '0905555555', '1997-12-01', 'male'),
('mai.dang@gmail.com', 'hashed_pw6', 'Mai', 'Dang', 'Nha Trang', '0906666666', '2001-09-09', 'female');

-- =====================================================
-- 🎁 BẢNG KHUYẾN MÃI (PROMOTIONS)
-- =====================================================
INSERT INTO Promotions (code, name, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, start_date, end_date, is_active)
VALUES
('SUMMER25', 'Summer Sale 25%', 'Giảm 25% cho tất cả chuyến bay nội địa', 'percentage', 25, 0, 500000, 1000, '2025-06-01', '2025-08-31', TRUE),
('WELCOME100', 'Welcome Bonus', 'Giảm 100k cho khách hàng mới', 'fixed_amount', 100000, 0, NULL, 500, '2025-01-01', '2025-12-31', TRUE),
('TET2025', 'Tết 2025 Khuyến Mãi', 'Giảm 15% dịp Tết Nguyên Đán', 'percentage', 15, 0, 400000, 1500, '2025-01-10', '2025-02-15', TRUE),
('WEEKEND50', 'Weekend Flight', 'Giảm 50k cho chuyến bay cuối tuần', 'fixed_amount', 50000, 0, NULL, 2000, '2025-03-01', '2025-12-31', TRUE),
('LOYAL10', 'Khách hàng thân thiết', 'Giảm 10% cho khách hàng trung thành', 'percentage', 10, 500000, NULL, 9999, '2025-01-01', '2026-01-01', TRUE);

-- =====================================================
-- 🧾 SỬ DỤNG KHUYẾN MÃI (PROMOTION_USAGE)
-- =====================================================
INSERT INTO Promotion_Usage (promotion_id, reservation_id, user_id, discount_amount)
VALUES
(1, 101, 1, 250000),
(2, 102, 2, 100000),
(3, 103, 3, 150000),
(4, 104, 4, 50000),
(5, 105, 5, 80000);

-- =====================================================
-- ⭐ ĐÁNH GIÁ (REVIEWS)
-- =====================================================
INSERT INTO Reviews (user_id, flight_id, airline_id, rating_overall, rating_comfort, rating_service, rating_punctuality, comment_text, comment_date)
VALUES
(1, 201, 301, 5, 5, 5, 4, 'Chuyến bay đúng giờ, nhân viên thân thiện.', '2025-08-10'),
(2, 202, 302, 4, 4, 5, 3, 'Dịch vụ tốt, nhưng hơi trễ 15 phút.', '2025-07-21'),
(3, 203, 303, 5, 5, 5, 5, 'Tốt, giá hợp lý, chuyến bay mượt mà.', '2025-06-18'),
(4, 204, 304, 3, 3, 4, 2, 'Máy bay hơi ồn, nhưng phi hành đoàn nhiệt tình.', '2025-09-02'),
(5, 205, 301, 4, 4, 4, 4, 'Ổn định, ghế ngồi thoải mái.', '2025-09-29');

-- =====================================================
-- 📊 BÁO CÁO DOANH THU (REVENUE_REPORTS)
-- =====================================================
INSERT INTO Revenue_Reports (report_type, period_start, period_end, total_revenue, revenue_from_tickets, revenue_from_services, total_refunds, total_bookings, confirmed_bookings, cancelled_bookings, new_customers, avg_booking_value, cancellation_rate, customer_growth_rate, generated_by, is_finalized)
VALUES
('daily', '2025-10-25', '2025-10-25', 15000000, 14000000, 1000000, 300000, 120, 110, 10, 15, 125000, 8.3, 2.5, 1, TRUE),
('daily', '2025-10-26', '2025-10-26', 16500000, 15500000, 1000000, 250000, 130, 120, 10, 20, 127000, 7.7, 3.2, 2, TRUE),
('weekly', '2025-10-20', '2025-10-26', 98000000, 94000000, 4000000, 1200000, 800, 760, 40, 60, 122500, 5.0, 4.8, 3, TRUE),
('monthly', '2025-10-01', '2025-10-31', 412000000, 390000000, 22000000, 5000000, 3300, 3100, 200, 180, 124800, 6.1, 5.5, 4, TRUE);

-- =====================================================
-- ✈️ THỐNG KÊ CHUYẾN BAY (FLIGHT_STATISTICS)
-- =====================================================
INSERT INTO Flight_Statistics (flight_id, statistic_date, total_bookings, total_revenue, occupancy_rate, avg_ticket_price)
VALUES
(201, '2025-10-25', 100, 12000000, 90.5, 120000),
(202, '2025-10-25', 80, 9500000, 85.0, 118750),
(203, '2025-10-25', 70, 8000000, 82.0, 114285),
(204, '2025-10-26', 120, 13500000, 95.0, 112500),
(205, '2025-10-26', 90, 9900000, 88.0, 110000);

-- =====================================================
-- 🛫 THỐNG KÊ TUYẾN BAY (ROUTE_STATISTICS)
-- =====================================================
INSERT INTO Route_Statistics (dep_airport_id, arr_airport_id, statistic_date, total_passengers, total_flights, total_revenue, average_load_factor)
VALUES
(1, 2, '2025-10-25', 7500, 25, 89000000, 88.5),   -- HAN -> SGN
(1, 3, '2025-10-25', 4200, 14, 47000000, 84.2),   -- HAN -> DAD
(2, 4, '2025-10-26', 3100, 12, 36000000, 87.3),   -- SGN -> CXR
(3, 5, '2025-10-26', 2800, 9, 32000000, 89.4);    -- DAD -> PQC

-- =====================================================
-- 📅 THỐNG KÊ HÀNG NGÀY (DAILY_STATS)
-- =====================================================
INSERT INTO Daily_Stats (stat_date, completed_flights, active_flights, cancelled_flights, total_revenue, tickets_sold, prev_completed_flights, prev_active_flights, prev_cancelled_flights, prev_revenue, prev_tickets_sold)
VALUES
('2025-10-25', 120, 80, 10, 15000000, 4500, 115, 75, 12, 14000000, 4400),
('2025-10-26', 130, 85, 15, 16500000, 4700, 120, 80, 10, 15000000, 4500),
('2025-10-27', 125, 78, 8, 17000000, 4900, 130, 85, 15, 16500000, 4700);

-- =====================================================
-- 🔗 LIÊN KẾT BÁO CÁO – NGÀY (REPORT_DAILY_LINK)
-- =====================================================
INSERT INTO Report_Daily_Link (report_id, daily_stat_id)
VALUES
(1, 1),
(2, 2),
(3, 2),
(4, 3);

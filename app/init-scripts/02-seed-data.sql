SET session_replication_role = replica;

INSERT INTO Staff (admin_id, admin_name, password, full_name, role, email, is_active, avatar) VALUES
(1, 'ngquynhanh', 'matkhau1', 'Nguyễn Thị Quỳnh Anh', 'Super Admin', 'quynhanh@airvn.com', TRUE, 'https://cdn.airvn.com/avatar/quynh_anh.jpg'),
(2, 'daongocbich', 'matkhau2', 'Đào Thị Ngọc Bích', 'Admin', 'ngocbich@airvn.com', TRUE, 'https://cdn.airvn.com/avatar/ngoc_bich.jpg'),
(3, 'duongdiemquynh', 'matkhau3', 'Dương Diễm Quỳnh', 'Admin', 'diemquynh@airvn.com', TRUE, 'https://cdn.airvn.com/avatar/diem_quynh.jpg'),
(4, 'luuthuytien', 'matkhau4', 'Lưu Thị Thủy Tiên', 'Admin', 'thuytien@airvn.com', TRUE, 'https://cdn.airvn.com/avatar/thuy_tien.jpg');


INSERT INTO Users (id, email, password, first_name, last_name, address, phone, date_of_birth, gender, created_at, updated_at) VALUES
(1, 'tranthanh@gmail.com', 'mk123', 'Trần', 'Thành', 'Hà Nội', '0912345678', '1990-03-12', 'male', '2025-08-01', '2025-10-01'),
(2, 'ngoclan@gmail.com', 'mk234', 'Ngọc', 'Lan', 'TP. Hồ Chí Minh', '0905123456', '1994-07-20', 'female', '2025-08-05', '2025-10-01'),
(3, 'phamhoang@gmail.com', 'mk345', 'Phạm', 'Hoàng', 'Đà Nẵng', '0987654321', '1988-02-15', 'male', '2025-08-10', '2025-10-02'),
(4, 'dangthuy@gmail.com', 'mk456', 'Đặng', 'Thủy', 'Cần Thơ', '0933123123', '1993-09-09', 'female', '2025-08-11', '2025-10-02'),
(5, 'nguyenminh@gmail.com', 'mk567', 'Nguyễn', 'Minh', 'Huế', '0904222333', '1995-12-12', 'male', '2025-08-12', '2025-10-02'),
(6, 'lethao@gmail.com', 'mk678', 'Lê', 'Thảo', 'Hải Phòng', '0915333444', '1996-04-03', 'female', '2025-08-13', '2025-10-02'),
(7, 'buitrung@gmail.com', 'mk789', 'Bùi', 'Trung', 'Đà Lạt', '0916444555', '1989-11-22', 'male', '2025-08-14', '2025-10-03'),
(8, 'hoangyen@gmail.com', 'mk890', 'Hoàng', 'Yến', 'Quy Nhơn', '0917555666', '1997-06-06', 'female', '2025-08-15', '2025-10-03'),
(9, 'doanthang@gmail.com', 'mk901', 'Đoàn', 'Thắng', 'Phú Quốc', '0918666777', '1991-01-01', 'male', '2025-08-16', '2025-10-03');


INSERT INTO Promotions (id, code, name, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, start_date, end_date, is_active) VALUES
(1, 'CHAOHE25', 'Khuyến mãi chào hè 25%', 'Giảm 25% cho các chuyến bay nội địa', 'percentage', 25.00, 0, 300000.00, 1000, '2025-06-01', '2025-09-01', TRUE),
(2, 'THANG10FIX', 'Giảm cố định 50.000đ', 'Giảm 50.000 đồng cho mọi đơn đặt vé trong tháng 10', 'fixed_amount', 50000.00, 0, NULL, 2000, '2025-10-01', '2025-10-31', TRUE),
(3, 'VIPMEMBER', 'Thành viên VIP giảm 15%', 'Ưu đãi cho khách hàng thân thiết', 'percentage', 15.00, 1000000.00, NULL, 100, '2025-07-01', '2025-12-31', TRUE),
(4, 'TET2025', 'Khuyến mãi Tết 2025', 'Giảm 20% vé khứ hồi', 'percentage', 20.00, 500000.00, NULL, 500, '2025-12-01', '2025-12-31', FALSE),
(5, 'STUDENT50', 'Giảm giá sinh viên', 'Giảm 50.000đ cho sinh viên có thẻ', 'fixed_amount', 50000.00, 0, NULL, 1000, '2025-09-01', '2025-11-30', TRUE);


INSERT INTO Promotion_Usage (promotion_id, reservation_id, user_id, discount_amount, used_at) VALUES
(1, 1, 8, 33000.00, '2025-10-09 08:15:00'),
(2, 2, 4, 50000.00, '2025-10-09 09:00:00'),
(3, 3, 2, 150000.00, '2025-10-10 10:00:00'),
(5, 4, 4, 50000.00, '2025-10-11 12:00:00'),
(2, 1, 8, 50000.00, '2025-10-12 07:45:00');


INSERT INTO Reviews (user_id, flight_id, airline_id, rating_overall, rating_comfort, rating_service, rating_punctuality, comment_text, comment_date) VALUES
(2, 7, 1, 5, 5, 5, 5, 'Chuyến bay tuyệt vời, nhân viên thân thiện.', '2025-09-10 10:00:00'),
(4, 19, 2, 4, 4, 4, 4, 'Máy bay sạch sẽ, phục vụ tốt, bay hơi trễ.', '2025-09-20 12:30:00'),
(6, 40, 1, 3, 3, 3, 2, 'Máy bay hơi cũ, đồ ăn chưa ngon lắm.', '2025-10-05 16:45:00'),
(8, 42, 2, 5, 5, 5, 5, 'Bay nhanh, đúng giờ, tôi rất hài lòng.', '2025-10-09 09:00:00'),
(10, 46, 2, 4, 5, 4, 5, 'Chỗ ngồi thoải mái, check-in nhanh.', '2025-10-12 08:30:00');


INSERT INTO Revenue_Reports (id, report_type, period_start, period_end, total_revenue, revenue_from_tickets, revenue_from_services, total_refunds, total_bookings, confirmed_bookings, cancelled_bookings, new_customers, avg_booking_value, cancellation_rate, customer_growth_rate, generated_at, generated_by, is_finalized) VALUES
(1, 'daily', '2025-10-01', '2025-10-01', 15000000, 13000000, 2000000, 500000, 250, 230, 20, 25, 60000, 8.00, 5.00, '2025-10-02 09:00:00', 1, TRUE),
(2, 'daily', '2025-10-02', '2025-10-02', 15800000, 14000000, 1800000, 400000, 260, 240, 20, 10, 60769.23, 7.69, 4.00, '2025-10-03 08:00:00', 2, TRUE),
(3, 'weekly', '2025-09-23', '2025-09-30', 98000000, 90000000, 8000000, 2000000, 1400, 1350, 50, 45, 70000, 3.57, 2.50, '2025-10-01 07:30:00', 3, TRUE),
(4, 'monthly', '2025-09-01', '2025-09-30', 350000000, 320000000, 30000000, 7000000, 6200, 6000, 200, 180, 56451.61, 3.22, 4.15, '2025-10-01 08:00:00', 2, TRUE),
(5, 'daily', '2025-10-03', '2025-10-03', 16200000, 14500000, 1700000, 300000, 265, 250, 15, 12, 61132.08, 5.66, 3.20, '2025-10-04 08:30:00', 4, TRUE);


INSERT INTO Flight_Statistics (flight_id, statistic_date, total_bookings, total_revenue, occupancy_rate, avg_ticket_price) VALUES
(7, '2025-10-09', 120, 23880000, 85.00, 199000.00),
(19, '2025-09-20', 160, 47840000, 78.00, 299000.00),
(40, '2025-10-05', 90, 36810000, 68.00, 409000.00),
(42, '2025-10-09', 135, 40410000, 80.00, 299000.00),
(46, '2025-10-12', 150, 44700000, 88.00, 298000.00);


INSERT INTO Route_Statistics (dep_airport_id, arr_airport_id, statistic_date, total_passengers, total_flights, total_revenue, average_load_factor) VALUES
(1, 2, '2025-10-01', 200, 5, 39800000.00, 82.50),
(2, 1, '2025-10-02', 180, 5, 35820000.00, 80.00),
(1, 5, '2025-10-03', 150, 4, 31200000.00, 77.00),
(2, 4, '2025-10-04', 170, 5, 34000000.00, 79.00),
(5, 1, '2025-10-05', 190, 6, 36100000.00, 81.00);


INSERT INTO Daily_Stats (id, stat_date, completed_flights, active_flights, cancelled_flights, total_revenue, tickets_sold, prev_completed_flights, prev_active_flights, prev_cancelled_flights, prev_revenue, prev_tickets_sold, calculated_at) VALUES
(1, '2025-10-01', 125, 80, 25, 15000000.00, 5000, 120, 78, 22, 14000000.00, 4800, '2025-10-02 08:00:00'),
(2, '2025-10-02', 130, 82, 18, 15800000.00, 5200, 125, 80, 25, 15000000.00, 5000, '2025-10-03 08:00:00'),
(3, '2025-10-03', 135, 84, 16, 16200000.00, 5400, 130, 82, 18, 15800000.00, 5200, '2025-10-04 08:00:00'),
(4, '2025-10-04', 140, 86, 14, 16800000.00, 5600, 135, 84, 16, 16200000.00, 5400, '2025-10-05 08:00:00'),
(5, '2025-10-05', 145, 88, 12, 17200000.00, 5800, 140, 86, 14, 16800000.00, 5600, '2025-10-06 08:00:00');


INSERT INTO Report_Daily_Link (id, report_id, daily_stat_id) VALUES
(1, 1, 1),
(2, 2, 2),
(3, 3, 3),
(4, 4, 4),
(5, 5, 5);

SET session_replication_role = DEFAULT;
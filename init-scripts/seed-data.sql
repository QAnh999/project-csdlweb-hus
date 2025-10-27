-- Thêm dữ liệu mẫu cho Staff với 4 tên bạn cung cấp
INSERT INTO Staff (admin_name, password, full_name, role, email, avatar) VALUES
('bich.dao', '$2a$10$hashed_password_1', 'Dao Thi Ngoc Bich', 'Super Admin', 'bich.dao@flight.com', '/avatars/bich.jpg'),
('quynh.duong', '$2a$10$hashed_password_2', 'Duong Diem Quynh', 'Admin', 'quynh.duong@flight.com', '/avatars/quynh.jpg'),
('quynhanh.nguyen', '$2a$10$hashed_password_3', 'Nguyen Thi Quynh Anh', 'Admin', 'quynhanh.nguyen@flight.com', '/avatars/quynhanh.jpg'),
('thuytien.luu', '$2a$10$hashed_password_4', 'Luu Thi Thuy Tien', 'Admin', 'thuytien.luu@flight.com', '/avatars/thuytien.jpg');

-- Thêm dữ liệu mẫu cho Airlines
INSERT INTO Airlines (airline_code, airline_name, logo_url, contact_email, contact_phone) VALUES
('VN', 'Vietnam Airlines', '/logos/vn-airlines.png', 'contact@vietnamairlines.com', '+84-24-38320320'),
('VJ', 'Vietjet Air', '/logos/vietjet.png', 'support@vietjetair.com', '+84-28-35475858'),
('QH', 'Bamboo Airways', '/logos/bamboo.png', 'info@bambooairways.com', '+84-28-36222888'),
('BL', 'Pacific Airlines', '/logos/pacific.png', 'care@pacificairlines.com', '+84-28-35147788'),
('TK', 'Turkish Airlines', '/logos/turkish.png', 'info@turkishairlines.com', '+90-212-4440849'),
('SQ', 'Singapore Airlines', '/logos/singapore.png', 'customer_service@singaporeair.com', '+65-62238888');

-- Thêm dữ liệu mẫu cho Airports
INSERT INTO Airports (airport_code, airport_name, city, country, timezone) VALUES
('HAN', 'Noi Bai International Airport', 'Hanoi', 'Vietnam', 'Asia/Bangkok'),
('SGN', 'Tan Son Nhat International Airport', 'Ho Chi Minh', 'Vietnam', 'Asia/Bangkok'),
('DAD', 'Da Nang International Airport', 'Da Nang', 'Vietnam', 'Asia/Bangkok'),
('CXR', 'Cam Ranh International Airport', 'Nha Trang', 'Vietnam', 'Asia/Bangkok'),
('PQC', 'Phu Quoc International Airport', 'Phu Quoc', 'Vietnam', 'Asia/Bangkok'),
('HKG', 'Hong Kong International Airport', 'Hong Kong', 'China', 'Asia/Hong_Kong'),
('BKK', 'Suvarnabhumi Airport', 'Bangkok', 'Thailand', 'Asia/Bangkok'),
('SIN', 'Changi Airport', 'Singapore', 'Singapore', 'Asia/Singapore'),
('ICN', 'Incheon International Airport', 'Seoul', 'South Korea', 'Asia/Seoul'),
('NRT', 'Narita International Airport', 'Tokyo', 'Japan', 'Asia/Tokyo');

-- Thêm dữ liệu mẫu cho Users
INSERT INTO Users (email, password, first_name, last_name, address, phone, date_of_birth, gender) VALUES
('customer1@gmail.com', '$2a$10$hashed_pass_1', 'Minh', 'Nguyen', '123 Nguyen Hue, Q1, HCM', '0901234567', '1990-05-15', 'male'),
('customer2@gmail.com', '$2a$10$hashed_pass_2', 'Lan', 'Tran', '45 Le Loi, Q1, HCM', '0902345678', '1985-08-20', 'female'),
('customer3@gmail.com', '$2a$10$hashed_pass_3', 'Hung', 'Le', '78 Pasteur, Q3, HCM', '0903456789', '1992-12-10', 'male'),
('customer4@gmail.com', '$2a$10$hashed_pass_4', 'Hoa', 'Pham', '12 CMT8, Q10, HCM', '0904567890', '1988-03-25', 'female'),
('customer5@gmail.com', '$2a$10$hashed_pass_5', 'An', 'Vo', '56 Hai Ba Trung, Q1, HCM', '0905678901', '1995-07-30', 'female'),
('customer6@gmail.com', '$2a$10$hashed_pass_6', 'Bao', 'Tran', '89 Dong Khoi, Q1, HCM', '0906789012', '1987-11-12', 'male'),
('customer7@gmail.com', '$2a$10$hashed_pass_7', 'Chi', 'Le', '34 Le Duan, Q1, HCM', '0907890123', '1993-04-18', 'female'),
('customer8@gmail.com', '$2a$10$hashed_pass_8', 'Dung', 'Phan', '67 Ton Duc Thang, Q1, HCM', '0908901234', '1991-09-05', 'male');

-- Thêm dữ liệu mẫu cho Flights
INSERT INTO Flights (flight_number, airline_id, departure_airport_id, arrival_airport_id, departure_time, arrival_time, duration_minutes, total_seats, available_seats, base_price) VALUES
-- Domestic flights
('VN123', 1, 1, 2, '2024-01-20 08:00:00', '2024-01-20 10:00:00', 120, 180, 150, 1200000),
('VJ456', 2, 1, 2, '2024-01-20 10:30:00', '2024-01-20 12:30:00', 120, 200, 180, 900000),
('QH789', 3, 2, 1, '2024-01-20 14:00:00', '2024-01-20 16:00:00', 120, 160, 140, 1100000),
('BL321', 4, 1, 3, '2024-01-20 16:30:00', '2024-01-20 17:30:00', 60, 150, 120, 800000),
('VN654', 1, 2, 4, '2024-01-21 09:00:00', '2024-01-21 10:00:00', 60, 180, 160, 750000),
('VJ987', 2, 3, 2, '2024-01-21 11:00:00', '2024-01-21 12:00:00', 60, 200, 175, 700000),
-- International flights
('VN801', 1, 1, 6, '2024-01-22 13:00:00', '2024-01-22 16:30:00', 210, 250, 200, 4500000),
('TK202', 5, 2, 7, '2024-01-22 15:00:00', '2024-01-22 18:00:00', 180, 300, 250, 3800000),
('SQ305', 6, 1, 8, '2024-01-23 10:00:00', '2024-01-23 13:30:00', 210, 280, 220, 5200000);

-- Thêm dữ liệu mẫu cho Reservations
INSERT INTO Reservations (user_id, flight_id, total_amount, status, seat_number) VALUES
(1, 1, 1200000, 'confirmed', '12A'),
(2, 2, 900000, 'confirmed', '15B'),
(3, 3, 1100000, 'confirmed', '08C'),
(4, 4, 800000, 'confirmed', '22D'),
(5, 5, 750000, 'confirmed', '10A'),
(6, 6, 700000, 'confirmed', '18B'),
(1, 7, 4500000, 'confirmed', '05A'),
(2, 8, 3800000, 'confirmed', '12B'),
(3, 9, 5200000, 'confirmed', '08C'),
(4, 1, 1200000, 'confirmed', '14D'),
(5, 2, 900000, 'confirmed', '20A');

-- Thêm dữ liệu mẫu cho Promotions
INSERT INTO Promotions (code, name, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, start_date, end_date, is_active) VALUES
('WELCOME10', 'Welcome Discount 10%', 'Discount 10% for new customers', 'percentage', 10.00, 500000, 200000, 1000, '2024-01-01 00:00:00', '2024-12-31 23:59:59', true),
('SUMMER20', 'Summer Sale 20%', 'Special summer promotion', 'percentage', 20.00, 1000000, 500000, 500, '2024-06-01 00:00:00', '2024-08-31 23:59:59', true),
('FIXED50K', 'Fixed Discount 50K', 'Fixed discount 50,000 VND', 'fixed_amount', 50000.00, 800000, 50000, 2000, '2024-01-01 00:00:00', '2024-12-31 23:59:59', true),
('FIRSTFLIGHT', 'First Flight 15%', 'Discount for first time flyers', 'percentage', 15.00, 700000, 300000, 300, '2024-01-01 00:00:00', '2024-03-31 23:59:59', true),
('BUSINESS25', 'Business Class 25%', 'Special discount for business class', 'percentage', 25.00, 2000000, 1000000, 100, '2024-01-01 00:00:00', '2024-12-31 23:59:59', true);

-- Thêm dữ liệu mẫu cho Promotion_Usage
INSERT INTO Promotion_Usage (promotion_id, reservation_id, user_id, discount_amount) VALUES
(1, 1, 1, 120000),
(3, 2, 2, 50000),
(1, 3, 3, 110000),
(2, 7, 1, 900000),
(4, 5, 5, 112500);

-- Thêm dữ liệu mẫu cho Reviews
INSERT INTO Reviews (user_id, flight_id, airline_id, rating_overall, rating_comfort, rating_service, rating_punctuality, comment_text, comment_date) VALUES
(1, 1, 1, 5, 4, 5, 5, 'Chuyến bay rất tốt, nhân viên thân thiện, đúng giờ', '2024-01-20 12:00:00'),
(2, 2, 2, 4, 3, 4, 5, 'Giá cả hợp lý, đúng giờ, ghế hơi chật', '2024-01-20 14:30:00'),
(3, 3, 3, 5, 5, 4, 4, 'Dịch vụ tốt, ghế ngồi thoải mái, delay 15 phút', '2024-01-20 18:00:00'),
(4, 4, 4, 3, 3, 3, 4, 'Bình thường, không có gì đặc biệt', '2024-01-20 19:30:00'),
(1, 7, 1, 5, 5, 5, 5, 'Chuyến bay quốc tế tuyệt vời, dịch vụ 5 sao', '2024-01-22 18:00:00'),
(2, 8, 5, 4, 4, 4, 5, 'Hãng hàng không tốt, đúng giờ', '2024-01-22 20:00:00');

-- Thêm dữ liệu mẫu cho Daily_Stats
INSERT INTO Daily_Stats (stat_date, completed_flights, active_flights, cancelled_flights, total_revenue, tickets_sold, prev_completed_flights, prev_active_flights, prev_cancelled_flights, prev_revenue, prev_tickets_sold) VALUES
('2024-01-20', 125, 80, 25, 15000000, 5000, 120, 75, 20, 14500000, 4800),
('2024-01-21', 130, 85, 15, 16000000, 5200, 125, 80, 25, 15000000, 5000),
('2024-01-22', 140, 90, 10, 18000000, 5800, 130, 85, 15, 16000000, 5200),
('2024-01-23', 135, 88, 12, 17500000, 5600, 140, 90, 10, 18000000, 5800);

-- Thêm dữ liệu mẫu cho Revenue_Reports
INSERT INTO Revenue_Reports (report_type, period_start, period_end, total_revenue, revenue_from_tickets, revenue_from_services, total_refunds, total_bookings, confirmed_bookings, cancelled_bookings, new_customers, avg_booking_value, cancellation_rate, customer_growth_rate, generated_by, is_finalized) VALUES
('daily', '2024-01-20', '2024-01-20', 15000000, 15000000, 0, 500000, 5000, 4800, 200, 150, 3000000, 4.0, 12.5, 1, true),
('daily', '2024-01-21', '2024-01-21', 16000000, 16000000, 0, 300000, 5200, 5100, 100, 180, 3076923, 1.9, 20.0, 1, true),
('daily', '2024-01-22', '2024-01-22', 18000000, 18000000, 0, 200000, 5800, 5750, 50, 220, 3103448, 0.9, 22.2, 2, true),
('weekly', '2024-01-15', '2024-01-21', 95000000, 95000000, 0, 2000000, 32000, 31000, 1000, 1200, 2968750, 3.1, 15.8, 1, true),
('monthly', '2024-01-01', '2024-01-31', 400000000, 400000000, 0, 8000000, 135000, 130000, 5000, 4500, 2962963, 3.7, 18.5, 2, true);

-- Thêm dữ liệu mẫu cho Flight_Statistics
INSERT INTO Flight_Statistics (flight_id, statistic_date, total_bookings, total_revenue, occupancy_rate, avg_ticket_price) VALUES
(1, '2024-01-20', 45, 54000000, 75.0, 1200000),
(2, '2024-01-20', 60, 54000000, 85.0, 900000),
(3, '2024-01-20', 38, 41800000, 79.2, 1100000),
(4, '2024-01-20', 42, 33600000, 84.0, 800000),
(5, '2024-01-21', 50, 37500000, 83.3, 750000),
(7, '2024-01-22', 35, 157500000, 70.0, 4500000);

-- Thêm dữ liệu mẫu cho Route_Statistics
INSERT INTO Route_Statistics (dep_airport_id, arr_airport_id, statistic_date, total_passengers, total_flights, total_revenue, average_load_factor) VALUES
(1, 2, '2024-01-20', 850, 8, 1020000000, 82.5),
(2, 1, '2024-01-20', 720, 7, 864000000, 78.3),
(1, 3, '2024-01-20', 420, 5, 336000000, 84.0),
(1, 6, '2024-01-22', 280, 3, 1260000000, 74.7),
(2, 7, '2024-01-22', 320, 4, 1216000000, 80.0);

-- Thêm dữ liệu mẫu cho Report_Daily_Link
INSERT INTO Report_Daily_Link (report_id, daily_stat_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(1, 4);

-- Hiển thị thông tin tổng quan
SELECT 
    (SELECT COUNT(*) FROM Staff) as total_staff,
    (SELECT COUNT(*) FROM Users) as total_users,
    (SELECT COUNT(*) FROM Airlines) as total_airlines,
    (SELECT COUNT(*) FROM Airports) as total_airports,
    (SELECT COUNT(*) FROM Flights) as total_flights,
    (SELECT COUNT(*) FROM Reservations) as total_reservations,
    (SELECT COUNT(*) FROM Promotions) as total_promotions,
    (SELECT COUNT(*) FROM Reviews) as total_reviews;
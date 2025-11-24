INSERT INTO Promotions (id, code, name, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, start_date, end_date, is_active) VALUES
(1, 'CHAOHE25', 'Khuyến mãi chào hè 25%', 'Giảm 25% cho các chuyến bay nội địa', 'percentage', 25.00, 0, 300000.00, 1000, '2025-06-01', '2025-09-01', TRUE),
(2, 'THANG10FIX', 'Giảm cố định 50.000đ', 'Giảm 50.000 đồng cho mọi đơn đặt vé trong tháng 10', 'fixed_amount', 50000.00, 0, NULL, 2000, '2025-10-01', '2025-10-31', TRUE),
(3, 'VIPMEMBER', 'Thành viên VIP giảm 15%', 'Ưu đãi cho khách hàng thân thiết', 'percentage', 15.00, 1000000.00, NULL, 100, '2025-07-01', '2025-12-31', TRUE),
(4, 'TET2025', 'Khuyến mãi Tết 2025', 'Giảm 20% vé khứ hồi', 'percentage', 20.00, 500000.00, NULL, 500, '2025-12-01', '2025-12-31', FALSE),
(5, 'STUDENT50', 'Giảm giá sinh viên', 'Giảm 50.000đ cho sinh viên có thẻ', 'fixed_amount', 50000.00, 0, NULL, 1000, '2025-09-01', '2025-11-30', TRUE);
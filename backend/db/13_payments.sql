INSERT INTO Payments (reservation_id, payment_method, payment_gateway, transaction_id, currency, status, created_at, updated_at, paid_at) 
VALUES
(1, 'credit_card', 'VNPay', 'TXN10001', 'VND', 'completed', '2025-10-09 09:00:00', '2025-10-09 09:01:00', '2025-10-09 09:01:00'),
(2, 'e_wallet', 'Momo', 'TXN10002', 'VND', 'refunded', '2025-10-09 09:10:00', '2025-10-09 09:20:00', '2025-10-09 09:11:00'),
(3, 'bank_transfer', 'Techcombank', 'TXN10003', 'VND', 'pending', '2025-10-09 09:15:00', '2025-10-09 09:15:00', NULL),
(4, 'credit_card', 'VNPay', 'TXN10004', 'VND', 'completed', '2025-10-09 09:30:00', '2025-10-09 09:31:00', '2025-10-09 09:31:00'),
(4, 'credit_card', 'VNPay', 'TXN10005', 'VND', 'completed', '2025-10-09 09:35:00', '2025-10-09 09:35:00', '2025-10-09 09:35:00');

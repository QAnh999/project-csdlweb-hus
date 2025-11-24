INSERT INTO Revenue_Reports (id, report_type, period_start, period_end, total_revenue, revenue_from_tickets, revenue_from_services, total_refunds, total_bookings, confirmed_bookings, cancelled_bookings, new_customers, avg_booking_value, cancellation_rate, customer_growth_rate, generated_at, generated_by, is_finalized) VALUES
(1, 'daily', '2025-10-01', '2025-10-01', 15000000, 13000000, 2000000, 500000, 250, 230, 20, 25, 60000, 8.00, 5.00, '2025-10-02 09:00:00', 1, TRUE),
(2, 'daily', '2025-10-02', '2025-10-02', 15800000, 14000000, 1800000, 400000, 260, 240, 20, 10, 60769.23, 7.69, 4.00, '2025-10-03 08:00:00', 2, TRUE),
(3, 'weekly', '2025-09-23', '2025-09-30', 98000000, 90000000, 8000000, 2000000, 1400, 1350, 50, 45, 70000, 3.57, 2.50, '2025-10-01 07:30:00', 3, TRUE),
(4, 'monthly', '2025-09-01', '2025-09-30', 350000000, 320000000, 30000000, 7000000, 6200, 6000, 200, 180, 56451.61, 3.22, 4.15, '2025-10-01 08:00:00', 2, TRUE),
(5, 'daily', '2025-10-03', '2025-10-03', 16200000, 14500000, 1700000, 300000, 265, 250, 15, 12, 61132.08, 5.66, 3.20, '2025-10-04 08:30:00', 4, TRUE);

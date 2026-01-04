INSERT INTO Reservations (
    reservation_code, user_id, main_flight_id, return_flight_id,
    total_passengers, total_amount, paid_amount, discount_amount, tax_amount, status
) VALUES
('RES202510090008', 8, 7, NULL, 2, 873343, 0, 33000, 82000, 'completed'),
('RES202510090002', 4, 19, NULL, 3, 5280265, 5280265, 98000, 489000, 'cancelled'),
('RES202510090001', 2, 42, NULL, 2, 3218468, 965540, 0, 293000, 'pending'),
('RES202510090010', 4, 40, 46, 3, 3711028, 3711028, 586000, 391000, 'confirmed');
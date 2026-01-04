INSERT INTO Reservation_Details (
    reservation_id, passenger_id, flight_id, seat_id,
    base_fare, seat_surcharge, luggage_surcharge, tax_fare, total_fare,
    luggage_count, luggage_weight, checkin_time, checkin_method, boarding_pass_code, checkin_status
)
VALUES 
(1, 17, 7, 6, 395671.50, 0, 0, 41000.00, 436671.50, 0, 0.00, NULL, 'none', 'BP-RES0001-1', 'not_checked_in'),
(1, 18, 7, 7, 395671.50, 0, 0, 41000.00, 436671.50, 0, 0.00, NULL, 'none', 'BP-RES0001-2', 'not_checked_in'),
(2, 8, 19, 70, 1597088.33, 0, 0, 163000.00, 1760088.33, 0, 0.00, NULL, 'none', 'BP-RES0002-1', 'not_checked_in'),
(2, 9, 19, 71, 1597088.33, 0, 0, 163000.00, 1760088.33, 0, 0.00, NULL, 'none', 'BP-RES0002-2', 'not_checked_in'),
(2, 10, 19, 72, 1597088.34, 0, 0, 163000.00, 1760088.34, 0, 0.00, NULL, 'none', 'BP-RES0002-3', 'not_checked_in'),
(3, 4, 42, 15, 1462734.00, 0, 0, 146500.00, 1609234.00, 0, 0.00, NULL, 'none', 'BP-RES0003-1', 'not_checked_in'),
(3, 5, 42, 16, 1462734.00, 0, 0, 146500.00, 1609234.00, 0, 0.00, NULL, 'none', 'BP-RES0003-2', 'not_checked_in'),
(4, 8, 40, 41, 553338.00, 0, 0, 65166.67, 618504.67, 0, 0.00, NULL, 'none', 'BP-RES0004-1', 'not_checked_in'),
(4, 9, 40, 42, 553338.00, 0, 0, 65166.67, 618504.67, 0, 0.00, NULL, 'none', 'BP-RES0004-2', 'not_checked_in'),
(4, 10, 40, 43, 553338.00, 0, 0, 65166.67, 618504.67, 0, 0.00, NULL, 'none', 'BP-RES0004-3', 'not_checked_in'),
(4, 8, 46, 8, 553338.00, 0, 0, 65166.67, 618504.67, 0, 0.00, NULL, 'none', 'BP-RES0004-4', 'not_checked_in'),
(4, 9, 46, 9, 553338.00, 0, 0, 65166.67, 618504.67, 0, 0.00, NULL, 'none', 'BP-RES0004-5', 'not_checked_in'),
(4, 10, 46, 10, 553338.00, 0, 0, 65166.65, 618504.65, 0, 0.00, NULL, 'none', 'BP-RES0004-6', 'not_checked_in');
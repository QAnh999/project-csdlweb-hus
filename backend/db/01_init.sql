-- 1. Airlines
CREATE TABLE Airlines (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    logo_url VARCHAR(500),
    contact_email VARCHAR(255),
    phone VARCHAR(20),
    website VARCHAR(255)
);


-- 2. Airports
CREATE TABLE Airports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    iata VARCHAR(3) UNIQUE,
    icao VARCHAR(4) UNIQUE
);


-- 3. Aircrafts
CREATE TABLE Aircrafts (
    id SERIAL PRIMARY KEY,
    model VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(100),
    capacity_economy INT NOT NULL CHECK (capacity_economy >= 0),
    capacity_business INT DEFAULT 0 CHECK (capacity_business >= 0),
    capacity_first INT DEFAULT 0 CHECK (capacity_first >= 0),
    total_capacity INT GENERATED ALWAYS AS (
        capacity_economy + capacity_business + capacity_first
    ) STORED,
    id_airline INT NOT NULL,
    CONSTRAINT fk_aircrafts_airline FOREIGN KEY (id_airline) REFERENCES Airlines(id)
);


-- 4. Users
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);


-- 5. Passengers
CREATE TABLE Passengers (
    id SERIAL PRIMARY KEY,
    user_id INT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10),
    nationality VARCHAR(100),
    passport_number VARCHAR(50) UNIQUE,
    passport_expiry DATE,
    identify_number VARCHAR(50), -- CCCD
    passenger_type VARCHAR(20) DEFAULT 'adult', -- adult, child, infant
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_passengers_user FOREIGN KEY (user_id) REFERENCES Users(id)
);


-- 6. Flights
CREATE TABLE Flights (
    id SERIAL PRIMARY KEY,
    flight_number VARCHAR(20) NOT NULL,
    id_airline INT NOT NULL,
    id_aircraft INT NOT NULL,
    dep_airport INT NOT NULL,
    arr_airport INT NOT NULL,
    dep_datetime TIMESTAMP NOT NULL,
    arr_datetime TIMESTAMP NOT NULL,
    duration_minutes INT NOT NULL,
    
    base_price_economy DECIMAL(12,2) NOT NULL,
    base_price_business DECIMAL(12,2),
    base_price_first DECIMAL(12,2),
    
    luggage_fee_per_kg DECIMAL(10,2) DEFAULT 0,
    free_luggage_weight DECIMAL(5,2) DEFAULT 20, -- kg
    overweight_fee_per_kg DECIMAL(10,2) DEFAULT 0,
    
    total_seats INT NOT NULL,
    available_seats_economy INT NOT NULL,
    available_seats_business INT DEFAULT 0,
    available_seats_first INT DEFAULT 0,
    
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, boarding, departed, arrived, cancelled, delayed
    gate VARCHAR(10),
    terminal VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_flights_airline FOREIGN KEY (id_airline) REFERENCES Airlines(id),
    CONSTRAINT fk_flights_aircraft FOREIGN KEY (id_aircraft) REFERENCES Aircrafts(id),
    CONSTRAINT fk_flights_dep_airport FOREIGN KEY (dep_airport) REFERENCES Airports(id),
    CONSTRAINT fk_flights_arr_airport FOREIGN KEY (arr_airport) REFERENCES Airports(id),
    CONSTRAINT chk_valid_dates CHECK (arr_datetime > dep_datetime)
);


-- 7. Seats
CREATE TABLE Seats (
    id SERIAL PRIMARY KEY,
    id_aircraft INT NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    seat_class VARCHAR(20) NOT NULL, -- economy, business, first
    seat_type VARCHAR(50) NOT NULL, -- window, aisle, middle, emergency
    is_available BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_seats_aircraft FOREIGN KEY (id_aircraft) REFERENCES Aircrafts(id),
    CONSTRAINT unique_seat_per_aircraft UNIQUE (id_aircraft, seat_number)
);



-- 8. Reservations
CREATE TABLE Reservations (
    id SERIAL PRIMARY KEY,
    reservation_code VARCHAR(20) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    
    main_flight_id INT NOT NULL,
    return_flight_id INT, 
    
    total_passengers INT NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,	
    tax_amount DECIMAL(10,2) DEFAULT 0,
    
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, cancelled, completed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    CONSTRAINT fk_reservations_user FOREIGN KEY (user_id) REFERENCES Users(id),
    CONSTRAINT fk_reservations_main_flight FOREIGN KEY (main_flight_id) REFERENCES Flights(id),
    CONSTRAINT fk_reservations_return_flight FOREIGN KEY (return_flight_id) REFERENCES Flights(id)
);


-- 9. Booked_Seats
CREATE TABLE Booked_Seats (
    id_seat INT NOT NULL,
    id_flight INT NOT NULL,
    reservation_id INT,
    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_seat, id_flight),
    CONSTRAINT fk_booked_seats_seat FOREIGN KEY (id_seat) REFERENCES Seats(id),
    CONSTRAINT fk_booked_seats_flight FOREIGN KEY (id_flight) REFERENCES Flights(id),
    CONSTRAINT fk_booked_seats_reservation FOREIGN KEY (reservation_id) REFERENCES Reservations(id)
);


-- 10. Reservations_Details
CREATE TABLE Reservation_Details (
    id SERIAL PRIMARY KEY,
    reservation_id INT NOT NULL,        -- Mã đặt chỗ (liên kết tới Reservations)
    passenger_id INT NOT NULL,          -- Hành khách cụ thể
    flight_id INT NOT NULL,             -- Chuyến bay cụ thể
    seat_id INT NOT NULL,               -- Ghế được chọn hoặc cấp
    
    -- Thông tin giá vé
    base_fare DECIMAL(10,2) NOT NULL,   -- Giá cơ bản
    seat_surcharge DECIMAL(10,2) DEFAULT 0,  -- Phụ phí ghế
    luggage_surcharge DECIMAL(10,2) DEFAULT 0, -- Phụ phí hành lý
    tax_fare DECIMAL(10,2) DEFAULT 0,   -- Thuế
    total_fare DECIMAL(10,2) NOT NULL,  -- Tổng tiền cho hành khách này
    
    -- Hành lý
    luggage_count INT DEFAULT 0,        -- Số kiện hành lý
    luggage_weight DECIMAL(5,2) DEFAULT 0, -- Tổng trọng lượng hành lý
    
    -- Check-in Online
    checkin_time TIMESTAMP,             -- Thời điểm check-in (NULL nếu chưa check-in)
    checkin_method VARCHAR(20) DEFAULT 'none', 
    -- none / online / counter
    boarding_pass_code VARCHAR(50) UNIQUE, -- Mã boarding pass (QR hoặc mã số)
    checkin_status VARCHAR(20) DEFAULT 'not_checked_in',
    -- not_checked_in / checked_in / cancelled
    
    -- Ràng buộc khóa ngoại
    CONSTRAINT fk_rd_reservation FOREIGN KEY (reservation_id) REFERENCES Reservations(id),
    CONSTRAINT fk_rd_passenger FOREIGN KEY (passenger_id) REFERENCES Passengers(id),
    CONSTRAINT fk_rd_flight FOREIGN KEY (flight_id) REFERENCES Flights(id),
    CONSTRAINT fk_rd_seat FOREIGN KEY (seat_id) REFERENCES Seats(id)
);


-- 12. Tickets
CREATE TABLE Tickets (
    id SERIAL PRIMARY KEY,
    ticket_number VARCHAR(20) UNIQUE NOT NULL,  -- Mã vé riêng, ví dụ: 738-1234567890
    reservation_detail_id INT NOT NULL,         -- Gắn với 1 hành khách cụ thể
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    status VARCHAR(20) DEFAULT 'active',        -- active, used, refunded, cancelled
    qr_code_url VARCHAR(255),                   -- Link QR cho check-in
    pdf_url VARCHAR(255),                       -- Vé điện tử PDF (nếu có)
    CONSTRAINT fk_tickets_reservation_detail 
        FOREIGN KEY (reservation_detail_id) REFERENCES Reservation_Details(id)
);


CREATE TABLE Payments (
    id SERIAL PRIMARY KEY,
    reservation_id INT NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- credit_card, bank_transfer, e_wallet
    payment_gateway VARCHAR(100),
    transaction_id VARCHAR(255) UNIQUE,
    -- amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'VND',
    status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed, refunded
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP,
    CONSTRAINT fk_payments_reservation FOREIGN KEY (reservation_id) REFERENCES Reservations(id)
);


CREATE TABLE Invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    reservation_id INT NOT NULL,
    user_id INT NOT NULL,
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- thoi diem tao hoa don
    due_date TIMESTAMP NOT NULL, -- thoi han cuoi cung de thanh toan
    total_amount DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'unpaid', -- unpaid, paid, overdue, cancelled
    CONSTRAINT fk_invoices_reservation FOREIGN KEY (reservation_id) REFERENCES Reservations(id),
    CONSTRAINT fk_invoices_user FOREIGN KEY (user_id) REFERENCES Users(id)
);

CREATE TABLE Services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL, -- meal, luggage, insurance, entertainment
    base_price DECIMAL(10,2) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE
);


CREATE TABLE Reservation_Services (
    id SERIAL PRIMARY KEY,
    reservation_detail_id INT NOT NULL,
    service_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_rs_reservation_detail FOREIGN KEY (reservation_detail_id) REFERENCES Reservation_Details(id),
    CONSTRAINT fk_rs_service FOREIGN KEY (service_id) REFERENCES Services(id)
);

CREATE TABLE Staff (
    admin_id SERIAL PRIMARY KEY,
    admin_name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('Admin', 'Super Admin')),
    email VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    avatar VARCHAR(255) NOT NULL
);


CREATE TABLE Promotions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    max_discount_amount DECIMAL(10,2),
    usage_limit INT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);


CREATE TABLE Promotion_Usage (
    id SERIAL PRIMARY KEY,
    promotion_id INT NOT NULL,
    reservation_id INT NOT NULL,
    user_id INT NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pu_promotion FOREIGN KEY (promotion_id) REFERENCES Promotions(id),
    CONSTRAINT fk_pu_user FOREIGN KEY (user_id) REFERENCES Users(id)
);

CREATE TABLE Reviews (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    flight_id INT NOT NULL,
    airline_id INT NOT NULL,
    rating_overall INT NOT NULL CHECK (rating_overall >= 1 AND rating_overall <= 5),
    rating_comfort INT CHECK (rating_comfort >= 1 AND rating_comfort <= 5),
    rating_service INT CHECK (rating_service >= 1 AND rating_service <= 5),
    rating_punctuality INT CHECK (rating_punctuality >= 1 AND rating_punctuality <= 5),
    comment_text TEXT,
    comment_date TIMESTAMP NOT NULL,
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES Users(id),
    CONSTRAINT fk_reviews_flight FOREIGN KEY (flight_id) REFERENCES Flights(id),
    CONSTRAINT fk_reviews_airline FOREIGN KEY (airline_id) REFERENCES Airlines(id)
);

CREATE TABLE Revenue_Reports (
    id SERIAL PRIMARY KEY,
    report_type VARCHAR(20) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    revenue_from_tickets DECIMAL(12,2) DEFAULT 0,
    revenue_from_services DECIMAL(12,2) DEFAULT 0,
    total_refunds DECIMAL(12,2) DEFAULT 0,
    total_bookings INT DEFAULT 0,
    confirmed_bookings INT DEFAULT 0,
    cancelled_bookings INT DEFAULT 0,
    new_customers INT DEFAULT 0,
    avg_booking_value DECIMAL(10,2) DEFAULT 0,
    cancellation_rate DECIMAL(5,2) DEFAULT 0,
    customer_growth_rate DECIMAL(5,2) DEFAULT 0,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    generated_by INT,
    is_finalized BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_reports_staff FOREIGN KEY (generated_by) REFERENCES Staff(admin_id),
    UNIQUE(generated_at, report_type)
);

CREATE TABLE Flight_Statistics (
    id SERIAL PRIMARY KEY,
    flight_id INT NOT NULL,
    statistic_date DATE NOT NULL,
    total_bookings INT DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    occupancy_rate DECIMAL(5,2) DEFAULT 0,
    avg_ticket_price DECIMAL(10,2) DEFAULT 0,
    CONSTRAINT unique_flight_date UNIQUE (flight_id, statistic_date),
    CONSTRAINT fk_stats_flight FOREIGN KEY (flight_id) REFERENCES Flights(id)
);

CREATE TABLE Route_Statistics (
    id SERIAL PRIMARY KEY,
    dep_airport_id INT NOT NULL,
    arr_airport_id INT NOT NULL,
    statistic_date DATE NOT NULL,
    total_passengers INT DEFAULT 0,
    total_flights INT DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    average_load_factor DECIMAL(5,2) DEFAULT 0,
    CONSTRAINT fk_route_dep_airport FOREIGN KEY (dep_airport_id) REFERENCES Airports(id),
    CONSTRAINT fk_route_arr_airport FOREIGN KEY (arr_airport_id) REFERENCES Airports(id),
    CONSTRAINT chk_different_airports CHECK (dep_airport_id != arr_airport_id),
    UNIQUE(dep_airport_id, arr_airport_id, statistic_date)
);

CREATE TABLE Daily_Stats (
    id SERIAL PRIMARY KEY,
    stat_date DATE NOT NULL UNIQUE,
    completed_flights INT DEFAULT 0,
    active_flights INT DEFAULT 0,
    cancelled_flights INT DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    tickets_sold INT DEFAULT 0,
    prev_completed_flights INT DEFAULT 0,
    prev_active_flights INT DEFAULT 0,
    prev_cancelled_flights INT DEFAULT 0,
    prev_revenue DECIMAL(12,2) DEFAULT 0,
    prev_tickets_sold INT DEFAULT 0,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Report_Daily_Link (
    id SERIAL PRIMARY KEY,
    report_id INT NOT NULL,
    daily_stat_id INT NOT NULL,
    UNIQUE(report_id, daily_stat_id),
    FOREIGN KEY (report_id) REFERENCES Revenue_Reports(id) ON DELETE CASCADE,
    FOREIGN KEY (daily_stat_id) REFERENCES Daily_Stats(id) ON DELETE CASCADE
);

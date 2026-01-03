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
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned', 'deleted')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
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
    passenger_type VARCHAR(20) DEFAULT 'adult' CHECK (passenger_type IN ('adult', 'child', 'infant')), -- adult, child, infant
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
    
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'boarding', 'departed', 'arrived', 'cancelled', 'delayed')), -- scheduled, boarding, departed, arrived, cancelled, delayed
    gate VARCHAR(10),
    terminal VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_flights_airline FOREIGN KEY (id_airline) REFERENCES Airlines(id),
    CONSTRAINT fk_flights_aircraft FOREIGN KEY (id_aircraft) REFERENCES Aircrafts(id),
    CONSTRAINT fk_flights_dep_airport FOREIGN KEY (dep_airport) REFERENCES Airports(id),
    CONSTRAINT fk_flights_arr_airport FOREIGN KEY (arr_airport) REFERENCES Airports(id),
    CONSTRAINT chk_valid_dates CHECK (arr_datetime > dep_datetime)--,
    -- CONSTRAINT chk_prices_non_negative CHECK (
    --     base_price_economy >= 0 AND
    --     (base_price_business IS NULL OR base_price_business >= 0) AND
    --     (base_price_first IS NULL OR base_price_first >= 0)
    -- ),
    -- CONSTRAINT chk_fees_non_negative CHECK(
    --     luggage_fee_per_kg >= 0 AND
    --     free_luggage_weight >= 0 AND
    --     overweight_fee_per_kg >= 0
    -- ),
    -- CONSTRAINT chk_seats_non_negative CHECK (
    --     total_seats > 0 AND
    --     available_seats_economy >= 0 AND
    --     available_seats_business >= 0 AND
    --     available_seats_first >= 0
    -- ),
    -- CONSTRAINT chk_seats_consistency CHECK (
    --     (available_seats_economy + available_seats_business + available_seats_first) <= total_seats
    -- ),
    -- CONSTRAINT chk_duration_positive CHECK (duration_minutes > 0)
);


-- 7. Seats
CREATE TABLE Seats (
    id SERIAL PRIMARY KEY,
    id_aircraft INT NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    seat_class VARCHAR(20) NOT NULL CHECK (seat_class IN ('economy', 'business', 'first')), -- economy, business, first
    seat_type VARCHAR(50) NOT NULL CHECK (seat_type IN ('window', 'aisle', 'middle', 'emergency')), -- window, aisle, middle, emergency
    -- is_available BOOLEAN DEFAULT TRUE,
    price_surcharge DECIMAL(10,2) DEFAULT 0,
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
    
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')), -- pending, confirmed, cancelled, completed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    CONSTRAINT fk_reservations_user FOREIGN KEY (user_id) REFERENCES Users(id),
    CONSTRAINT fk_reservations_main_flight FOREIGN KEY (main_flight_id) REFERENCES Flights(id),
    CONSTRAINT fk_reservations_return_flight FOREIGN KEY (return_flight_id) REFERENCES Flights(id)--,
    -- CONSTRAINT chk_amounts_non_negative CHECK (
    --     total_amount >= 0 AND
    --     paid_amount >= 0 AND
    --     discount_amount >= 0 AND
    --     tax_amount >= 0
    -- ),
    -- CONSTRAINT chk_paid_not_exceed_total CHECK (paid_amount <= total_amount),
    -- CONSTRAINT chk_expired_after_created CHECK (expires_at > created_at),
    -- CONSTRAINT chk_passengers_positive CHECK (total_passengers > 0)
);


-- 9. Booked_Seats
CREATE TABLE Booked_Seats (
    id_seat INT NOT NULL,
    id_flight INT NOT NULL,
    reservation_id INT,
    -- status VARCHAR(10) NOT NULL DEFAULT 'held' 
    hold_expires TIMESTAMP NULL,
    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_seat, id_flight),
    -- CONSTRAINT chk_booked_seat_status CHECK (status IN ('held', 'booked'))
    CONSTRAINT fk_booked_seats_seat FOREIGN KEY (id_seat) REFERENCES Seats(id),
    CONSTRAINT fk_booked_seats_flight FOREIGN KEY (id_flight) REFERENCES Flights(id),
    CONSTRAINT fk_booked_seats_reservation FOREIGN KEY (reservation_id) REFERENCES Reservations(id)
);

ALTER TABLE Booked_Seats
ADD CONSTRAINT uq_flight_seat UNIQUE(id_flight, id_seat);


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
    checkin_method VARCHAR(20) DEFAULT 'none' CHECK (checkin_method IN ('none', 'online', 'counter')), 
    -- none / online / counter
    boarding_pass_code VARCHAR(50) UNIQUE, -- Mã boarding pass (QR hoặc mã số)
    checkin_status VARCHAR(20) DEFAULT 'not_checked_in' CHECK (checkin_status IN ('not_checked_in', 'checked_in', 'cancelled')),
    -- not_checked_in / checked_in / cancelled
    
    -- Ràng buộc khóa ngoại
    CONSTRAINT fk_rd_reservation FOREIGN KEY (reservation_id) REFERENCES Reservations(id),
    CONSTRAINT fk_rd_passenger FOREIGN KEY (passenger_id) REFERENCES Passengers(id),
    CONSTRAINT fk_rd_flight FOREIGN KEY (flight_id) REFERENCES Flights(id),
    CONSTRAINT fk_rd_seat FOREIGN KEY (seat_id) REFERENCES Seats(id)--,
    -- CONSTRAINT chk_fares_non_negative CHECK (
    --     base_fare >= 0 AND 
    --     seat_surcharge >= 0 AND
    --     luggage_surcharge >= 0 AND
    --     tax_fare >= 0 AND
    --     total_fare >= 0
    -- ),
    -- CONSTRAINT chk_total_fare_calculation CHECK (
    --     total_fare = base_fare + seat_surcharge + luggage_surcharge + tax_fare
    -- ),
    -- CONSTRAINT chk_luggage_non_negative CHECK (
    --     luggage_count >= 0 AND
    --     luggage_weight >= 0
    -- )
);

-- ALTER TABLE reservation_details ALTER COLUMN seat_id DROP NOT NULL;


-- 12. Tickets
CREATE TABLE Tickets (
    id SERIAL PRIMARY KEY,
    ticket_number VARCHAR(20) UNIQUE NOT NULL,  -- Mã vé riêng, ví dụ: 738-1234567890
    reservation_detail_id INT NOT NULL,         -- Gắn với 1 hành khách cụ thể
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'used', 'refunded', 'cancelled')),        -- active, used, refunded, cancelled
    qr_code_url VARCHAR(255),                   -- Link QR cho check-in
    pdf_url VARCHAR(255),                       -- Vé điện tử PDF (nếu có)
    CONSTRAINT fk_tickets_reservation_detail 
        FOREIGN KEY (reservation_detail_id) REFERENCES Reservation_Details(id)
);

ALTER TABLE tickets ALTER COLUMN qr_code_url TYPE TEXT;


CREATE TABLE Payments (
    id SERIAL PRIMARY KEY,
    reservation_id INT NOT NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('credit_card', 'bank_transfer', 'e_wallet')), -- credit_card, bank_transfer, e_wallet
    payment_gateway VARCHAR(100),
    transaction_id VARCHAR(255) UNIQUE,
    -- amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'VND',
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')), -- pending, completed, failed, refunded
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP,
    CONSTRAINT fk_payments_reservation FOREIGN KEY (reservation_id) REFERENCES Reservations(id)--,
    -- CONSTRAINT chk_paid_at_logic CHECK (
    --     (status = 'completed' AND paid_at IS NOT NULL) OR
    --     (status != 'completed' AND paid_at IS NULL)
    -- )
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
    status VARCHAR(20) DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'overdue', 'cancelled')), -- unpaid, paid, overdue, cancelled
    CONSTRAINT fk_invoices_reservation FOREIGN KEY (reservation_id) REFERENCES Reservations(id),
    CONSTRAINT fk_invoices_user FOREIGN KEY (user_id) REFERENCES Users(id)--,
    -- CONSTRAINT chk_amounts_non_negative CHECK (
    --     total_amount >= 0 AND
    --     tax_amount >= 0
    -- ),
    -- CONSTRAINT chk_due_date_after_issue CHECK (due_date > issue_date)
);

CREATE TABLE Services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL, -- CHECK (category IN ('meal', 'luggage', 'insurance', 'entertainment')), -- meal, luggage, insurance, entertainment
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
    CONSTRAINT fk_rs_service FOREIGN KEY (service_id) REFERENCES Services(id),
    CONSTRAINT chk_quantitie_positive CHECK (quantity > 0)--,
    -- CONSTRAINT chk_prices_non_negative CHECK (
    --     unit_price >= 0 AND
    --     total_price >= 0
    -- ),
    -- CONSTRAINT chk_total_price_calculation CHECK (total_price = unit_price * quantity)
);



CREATE TABLE Reservation_Passengers (
    id SERIAL PRIMARY KEY,
    reservation_id INT NOT NULL,
    passenger_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rp_reservation FOREIGN KEY (reservation_id) REFERENCES Reservations(id),
    CONSTRAINT fk_rp_passenger FOREIGN KEY (passenger_id) REFERENCES Passengers(id)
);


-- CREATE TABLE Hold_Seats (
--     id SERIAL PRIMARY KEY,
--     reservation_id INT NOT NULL,
--     flight_id INT NOT NULL,
--     seat_id INT NOT NULL,
--     expire_at TIMESTAMP NOT NULL,
--     status VARCHAR(20) DEFAULT 'held', -- held / confirmed / released
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     CONSTRAINT fk_hs_reservation FOREIGN KEY (reservation_id) REFERENCES Reservations(id),
--     CONSTRAINT fk_hs_flight FOREIGN KEY (flight_id) REFERENCES Flights(id),
--     CONSTRAINT fk_hs_seat FOREIGN KEY (seat_id) REFERENCES Seats(id)
-- );




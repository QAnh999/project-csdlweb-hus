-- =========================
-- 1. BASE TABLES
-- =========================

CREATE TABLE Airlines (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    logo_url VARCHAR(500),
    contact_email VARCHAR(255),
    phone VARCHAR(20),
    website VARCHAR(255)
);

CREATE TABLE Airports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    iata VARCHAR(3) UNIQUE,
    icao VARCHAR(4) UNIQUE
);

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
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'inactive', 'banned', 'deleted')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    last_login TIMESTAMP
);

CREATE TABLE Staff (
    admin_id SERIAL PRIMARY KEY,
    admin_name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('Admin', 'Super Admin')),
    email VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    avatar VARCHAR(255),
    status VARCHAR(20) DEFAULT 'work'
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

CREATE TABLE Services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE
);

-- =========================
-- 2. AIRCRAFT & SEATS
-- =========================

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
    CONSTRAINT fk_aircrafts_airline
        FOREIGN KEY (id_airline) REFERENCES Airlines(id)
);

CREATE TABLE Seats (
    id SERIAL PRIMARY KEY,
    id_aircraft INT NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    seat_class VARCHAR(20) NOT NULL
        CHECK (seat_class IN ('economy', 'business', 'first')),
    seat_type VARCHAR(50) NOT NULL
        CHECK (seat_type IN ('window', 'aisle', 'middle', 'emergency')),
    price_surcharge DECIMAL(10,2) DEFAULT 0,
    CONSTRAINT fk_seats_aircraft
        FOREIGN KEY (id_aircraft) REFERENCES Aircrafts(id),
    CONSTRAINT unique_seat_per_aircraft
        UNIQUE (id_aircraft, seat_number)
);

-- =========================
-- 3. FLIGHTS
-- =========================

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
    free_luggage_weight DECIMAL(5,2) DEFAULT 20,
    overweight_fee_per_kg DECIMAL(10,2) DEFAULT 0,

    total_seats INT NOT NULL,
    available_seats_economy INT NOT NULL,
    available_seats_business INT DEFAULT 0,
    available_seats_first INT DEFAULT 0,

    status VARCHAR(20) DEFAULT 'scheduled'
        CHECK (status IN ('scheduled','boarding','departed','arrived','cancelled','delayed','deleted')),
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

-- =========================
-- 4. PASSENGERS
-- =========================

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
    identify_number VARCHAR(50),
    passenger_type VARCHAR(20) DEFAULT 'adult'
        CHECK (passenger_type IN ('adult','child','infant')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_passengers_user
        FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- =========================
-- 5. RESERVATIONS
-- =========================

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
    status VARCHAR(50) DEFAULT 'pending'
        CHECK (status IN ('pending','confirmed','cancelled','completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    CONSTRAINT fk_res_user FOREIGN KEY (user_id) REFERENCES Users(id),
    CONSTRAINT fk_res_main_flight FOREIGN KEY (main_flight_id) REFERENCES Flights(id),
    CONSTRAINT fk_res_return_flight FOREIGN KEY (return_flight_id) REFERENCES Flights(id)
);

CREATE TABLE Reservation_Passengers (
    id SERIAL PRIMARY KEY,
    reservation_id INT NOT NULL,
    passenger_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reservation_id) REFERENCES Reservations(id),
    FOREIGN KEY (passenger_id) REFERENCES Passengers(id)
);

CREATE TABLE Booked_Seats (
    id_seat INT NOT NULL,
    id_flight INT NOT NULL,
    reservation_id INT,
    hold_expires TIMESTAMP,
    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_seat, id_flight),
    FOREIGN KEY (id_seat) REFERENCES Seats(id),
    FOREIGN KEY (id_flight) REFERENCES Flights(id),
    FOREIGN KEY (reservation_id) REFERENCES Reservations(id)
);

-- =========================
-- 6. RESERVATION DETAILS
-- =========================

CREATE TABLE Reservation_Details (
    id SERIAL PRIMARY KEY,
    reservation_id INT NOT NULL,
    passenger_id INT NOT NULL,
    flight_id INT NOT NULL,
    seat_id INT NOT NULL,

    base_fare DECIMAL(10,2) NOT NULL,
    seat_surcharge DECIMAL(10,2) DEFAULT 0,
    luggage_surcharge DECIMAL(10,2) DEFAULT 0,
    tax_fare DECIMAL(10,2) DEFAULT 0,
    total_fare DECIMAL(10,2) NOT NULL,

    luggage_count INT DEFAULT 0,
    luggage_weight DECIMAL(5,2) DEFAULT 0,

    checkin_time TIMESTAMP,
    checkin_method VARCHAR(20) DEFAULT 'none'
        CHECK (checkin_method IN ('none','online','counter')),
    boarding_pass_code VARCHAR(50) UNIQUE,
    checkin_status VARCHAR(20) DEFAULT 'not_checked_in'
        CHECK (checkin_status IN ('not_checked_in','checked_in','cancelled')),

    FOREIGN KEY (reservation_id) REFERENCES Reservations(id),
    FOREIGN KEY (passenger_id) REFERENCES Passengers(id),
    FOREIGN KEY (flight_id) REFERENCES Flights(id),
    FOREIGN KEY (seat_id) REFERENCES Seats(id)
);

CREATE TABLE Reservation_Services (
    id SERIAL PRIMARY KEY,
    reservation_detail_id INT NOT NULL,
    service_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (reservation_detail_id) REFERENCES Reservation_Details(id),
    FOREIGN KEY (service_id) REFERENCES Services(id)
);

CREATE TABLE Tickets (
    id SERIAL PRIMARY KEY,
    ticket_number VARCHAR(20) UNIQUE NOT NULL,
    reservation_detail_id INT NOT NULL,
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active'
        CHECK (status IN ('active','used','refunded','cancelled')),
    qr_code_url VARCHAR(255),
    pdf_url VARCHAR(255),
    FOREIGN KEY (reservation_detail_id)
        REFERENCES Reservation_Details(id)
);

-- =========================
-- 7. PAYMENTS & INVOICES
-- =========================

CREATE TABLE Payments (
    id SERIAL PRIMARY KEY,
    reservation_id INT NOT NULL,
    payment_method VARCHAR(50) NOT NULL
        CHECK (payment_method IN ('credit_card','bank_transfer','e_wallet')),
    payment_gateway VARCHAR(100),
    transaction_id VARCHAR(255) UNIQUE,
    currency VARCHAR(3) DEFAULT 'VND',
    status VARCHAR(50) DEFAULT 'pending'
        CHECK (status IN ('pending','completed','failed','refunded')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP,
    FOREIGN KEY (reservation_id) REFERENCES Reservations(id)
);

CREATE TABLE Invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    reservation_id INT NOT NULL,
    user_id INT NOT NULL,
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'unpaid'
        CHECK (status IN ('unpaid','paid','overdue','cancelled')),
    FOREIGN KEY (reservation_id) REFERENCES Reservations(id),
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- =========================
-- 8. PROMOTIONS & REVIEWS
-- =========================

CREATE TABLE Promotion_Usage (
    id SERIAL PRIMARY KEY,
    promotion_id INT NOT NULL,
    reservation_id INT NOT NULL,
    user_id INT NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (promotion_id) REFERENCES Promotions(id),
    FOREIGN KEY (reservation_id) REFERENCES Reservations(id),
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

CREATE TABLE Reviews (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    flight_id INT NOT NULL,
    airline_id INT NOT NULL,
    rating_overall INT NOT NULL CHECK (rating_overall BETWEEN 1 AND 5),
    rating_comfort INT CHECK (rating_comfort BETWEEN 1 AND 5),
    rating_service INT CHECK (rating_service BETWEEN 1 AND 5),
    rating_punctuality INT CHECK (rating_punctuality BETWEEN 1 AND 5),
    comment_text TEXT,
    comment_date TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (flight_id) REFERENCES Flights(id),
    FOREIGN KEY (airline_id) REFERENCES Airlines(id)
);

-- =========================
-- 9. STATISTICS & REPORTS
-- =========================

CREATE TABLE Flight_Statistics (
    id SERIAL PRIMARY KEY,
    flight_id INT NOT NULL,
    statistic_date DATE NOT NULL,
    total_bookings INT DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    occupancy_rate DECIMAL(5,2) DEFAULT 0,
    avg_ticket_price DECIMAL(10,2) DEFAULT 0,
    UNIQUE (flight_id, statistic_date),
    FOREIGN KEY (flight_id) REFERENCES Flights(id)
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
    CHECK (dep_airport_id <> arr_airport_id),
    UNIQUE (dep_airport_id, arr_airport_id, statistic_date),
    FOREIGN KEY (dep_airport_id) REFERENCES Airports(id),
    FOREIGN KEY (arr_airport_id) REFERENCES Airports(id)
);

CREATE TABLE Daily_Stats (
    id SERIAL PRIMARY KEY,
    stat_date DATE NOT NULL UNIQUE,
    completed_flights INT DEFAULT 0,
    active_flights INT DEFAULT 0,
    cancelled_flights INT DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    tickets_sold INT DEFAULT 0,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Revenue_Reports (
    id SERIAL PRIMARY KEY,
    report_type VARCHAR(20) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    generated_by INT,
    is_finalized BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (generated_by) REFERENCES Staff(admin_id)
);

CREATE TABLE Report_Daily_Link (
    id SERIAL PRIMARY KEY,
    report_id INT NOT NULL,
    daily_stat_id INT NOT NULL,
    UNIQUE (report_id, daily_stat_id),
    FOREIGN KEY (report_id) REFERENCES Revenue_Reports(id) ON DELETE CASCADE,
    FOREIGN KEY (daily_stat_id) REFERENCES Daily_Stats(id) ON DELETE CASCADE
);

-- Tạo các bảng placeholder để tránh lỗi FK
CREATE TABLE Flights (id SERIAL PRIMARY KEY);
CREATE TABLE Airlines (id SERIAL PRIMARY KEY);
CREATE TABLE Airports (id SERIAL PRIMARY KEY);
CREATE TABLE Reservations (id SERIAL PRIMARY KEY);

-- === BẮT ĐẦU CÁC BẢNG CHÍNH ===

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

-- ✅ ĐÃ BỎ FOREIGN KEY FK_PU_RESERVATION
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

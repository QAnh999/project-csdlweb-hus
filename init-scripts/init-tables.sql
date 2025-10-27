-- =============================================
-- TẠO CƠ SỞ DỮ LIỆU FLIGHT BOOKING
-- =============================================

-- Xóa các bảng cũ nếu tồn tại
DROP TABLE IF EXISTS sample_data CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =============================================
-- Bảng Staff (Quản trị viên)
-- =============================================
CREATE TABLE Staff (
    admin_id SERIAL PRIMARY KEY,
    admin_name VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Super Admin')),
    email VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    avatar VARCHAR(255) DEFAULT '/avatars/default.jpg',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    CONSTRAINT chk_staff_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- =============================================
-- Bảng Users (Người dùng)
-- =============================================
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
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    CONSTRAINT chk_user_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_user_phone CHECK (phone ~ '^[0-9+\-\s()]{10,20}$')
);

-- =============================================
-- Bảng Airlines (Hãng hàng không)
-- =============================================
CREATE TABLE Airlines (
    id SERIAL PRIMARY KEY,
    airline_code VARCHAR(10) UNIQUE NOT NULL,
    airline_name VARCHAR(100) NOT NULL,
    logo_url VARCHAR(255) DEFAULT '/logos/default.png',
    contact_email VARCHAR(100),
    contact_phone VARCHAR(20),
    headquarters VARCHAR(100),
    founded_year INT,
    fleet_size INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_airline_email CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_airline_phone CHECK (contact_phone ~ '^[0-9+\-\s()]{10,20}$'),
    CONSTRAINT chk_founded_year CHECK (founded_year BETWEEN 1900 AND EXTRACT(YEAR FROM CURRENT_DATE))
);

-- =============================================
-- Bảng Airports (Sân bay)
-- =============================================
CREATE TABLE Airports (
    id SERIAL PRIMARY KEY,
    airport_code VARCHAR(10) UNIQUE NOT NULL,
    airport_name VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    timezone VARCHAR(50) NOT NULL,
    latitude DECIMAL(10, 6),
    longitude DECIMAL(10, 6),
    runways INT DEFAULT 1,
    terminals INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- Bảng Flights (Chuyến bay)
-- =============================================
CREATE TABLE Flights (
    id SERIAL PRIMARY KEY,
    flight_number VARCHAR(20) NOT NULL,
    airline_id INT NOT NULL,
    departure_airport_id INT NOT NULL,
    arrival_airport_id INT NOT NULL,
    departure_time TIMESTAMP NOT NULL,
    arrival_time TIMESTAMP NOT NULL,
    duration_minutes INT NOT NULL,
    aircraft_type VARCHAR(50) DEFAULT 'A320',
    total_seats INT NOT NULL CHECK (total_seats > 0),
    available_seats INT NOT NULL CHECK (available_seats >= 0),
    base_price DECIMAL(10,2) NOT NULL CHECK (base_price >= 0),
    business_price DECIMAL(10,2) CHECK (business_price >= 0),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'boarding', 'departed', 'arrived', 'cancelled', 'delayed')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (airline_id) REFERENCES Airlines(id) ON DELETE CASCADE,
    FOREIGN KEY (departure_airport_id) REFERENCES Airports(id) ON DELETE CASCADE,
    FOREIGN KEY (arrival_airport_id) REFERENCES Airports(id) ON DELETE CASCADE,
    CONSTRAINT chk_available_seats CHECK (available_seats <= total_seats),
    CONSTRAINT chk_departure_before_arrival CHECK (departure_time < arrival_time),
    CONSTRAINT chk_duration_positive CHECK (duration_minutes > 0)
);

-- =============================================
-- Bảng Reservations (Đặt chỗ)
-- =============================================
CREATE TABLE Reservations (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    flight_id INT NOT NULL,
    reservation_code VARCHAR(20) UNIQUE NOT NULL,
    reservation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'refunded')),
    seat_class VARCHAR(20) DEFAULT 'economy' CHECK (seat_class IN ('economy', 'business', 'first')),
    seat_number VARCHAR(10),
    passenger_count INT DEFAULT 1 CHECK (passenger_count > 0),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method VARCHAR(50),
    payment_date TIMESTAMP,
    special_requests TEXT,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (flight_id) REFERENCES Flights(id) ON DELETE CASCADE,
    CONSTRAINT chk_reservation_code CHECK (reservation_code ~ '^[A-Z0-9]{6,20}$')
);

-- =============================================
-- Bảng Promotions (Khuyến mãi)
-- =============================================
CREATE TABLE Promotions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value DECIMAL(10,2) NOT NULL CHECK (discount_value >= 0),
    min_order_amount DECIMAL(10,2) DEFAULT 0 CHECK (min_order_amount >= 0),
    max_discount_amount DECIMAL(10,2) CHECK (max_discount_amount >= 0),
    usage_limit INT CHECK (usage_limit > 0),
    used_count INT DEFAULT 0 CHECK (used_count >= 0),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    applicable_airlines JSONB DEFAULT '[]',
    applicable_routes JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES Staff(admin_id),
    CONSTRAINT chk_promotion_dates CHECK (start_date < end_date),
    CONSTRAINT chk_used_count CHECK (used_count <= COALESCE(usage_limit, used_count + 1))
);

-- =============================================
-- Bảng Promotion_Usage (Sử dụng khuyến mãi)
-- =============================================
CREATE TABLE Promotion_Usage (
    id SERIAL PRIMARY KEY,
    promotion_id INT NOT NULL,
    reservation_id INT NOT NULL,
    user_id INT NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL CHECK (discount_amount >= 0),
    original_amount DECIMAL(10,2) NOT NULL CHECK (original_amount >= 0),
    final_amount DECIMAL(10,2) NOT NULL CHECK (final_amount >= 0),
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (promotion_id) REFERENCES Promotions(id) ON DELETE CASCADE,
    FOREIGN KEY (reservation_id) REFERENCES Reservations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    UNIQUE(promotion_id, reservation_id),
    CONSTRAINT chk_final_amount CHECK (final_amount = original_amount - discount_amount)
);

-- =============================================
-- Bảng Reviews (Đánh giá)
-- =============================================
CREATE TABLE Reviews (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    flight_id INT NOT NULL,
    airline_id INT NOT NULL,
    reservation_id INT NOT NULL,
    rating_overall INT NOT NULL CHECK (rating_overall >= 1 AND rating_overall <= 5),
    rating_comfort INT CHECK (rating_comfort >= 1 AND rating_comfort <= 5),
    rating_service INT CHECK (rating_service >= 1 AND rating_service <= 5),
    rating_punctuality INT CHECK (rating_punctuality >= 1 AND rating_punctuality <= 5),
    rating_food INT CHECK (rating_food >= 1 AND rating_food <= 5),
    rating_entertainment INT CHECK (rating_entertainment >= 1 AND rating_entertainment <= 5),
    comment_title VARCHAR(200),
    comment_text TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    helpful_count INT DEFAULT 0 CHECK (helpful_count >= 0),
    comment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (flight_id) REFERENCES Flights(id) ON DELETE CASCADE,
    FOREIGN KEY (airline_id) REFERENCES Airlines(id) ON DELETE CASCADE,
    FOREIGN KEY (reservation_id) REFERENCES Reservations(id) ON DELETE CASCADE,
    UNIQUE(user_id, reservation_id)
);

-- =============================================
-- Bảng Revenue_Reports (Báo cáo doanh thu)
-- =============================================
CREATE TABLE Revenue_Reports (
    id SERIAL PRIMARY KEY,
    report_type VARCHAR(20) NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    period_name VARCHAR(100) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- FINANCIAL METRICS
    total_revenue DECIMAL(12,2) DEFAULT 0 CHECK (total_revenue >= 0),
    revenue_from_tickets DECIMAL(12,2) DEFAULT 0 CHECK (revenue_from_tickets >= 0),
    revenue_from_services DECIMAL(12,2) DEFAULT 0 CHECK (revenue_from_services >= 0),
    total_refunds DECIMAL(12,2) DEFAULT 0 CHECK (total_refunds >= 0),
    net_revenue DECIMAL(12,2) DEFAULT 0 CHECK (net_revenue >= 0),
    
    -- BOOKING METRICS
    total_bookings INT DEFAULT 0 CHECK (total_bookings >= 0),
    confirmed_bookings INT DEFAULT 0 CHECK (confirmed_bookings >= 0),
    cancelled_bookings INT DEFAULT 0 CHECK (cancelled_bookings >= 0),
    new_customers INT DEFAULT 0 CHECK (new_customers >= 0),
    
    -- FLIGHT METRICS
    total_flights INT DEFAULT 0 CHECK (total_flights >= 0),
    completed_flights INT DEFAULT 0 CHECK (completed_flights >= 0),
    cancelled_flights INT DEFAULT 0 CHECK (cancelled_flights >= 0),
    
    -- CALCULATED FIELDS
    avg_booking_value DECIMAL(10,2) DEFAULT 0 CHECK (avg_booking_value >= 0),
    cancellation_rate DECIMAL(5,2) DEFAULT 0 CHECK (cancellation_rate >= 0 AND cancellation_rate <= 100),
    customer_growth_rate DECIMAL(5,2) DEFAULT 0,
    load_factor DECIMAL(5,2) DEFAULT 0 CHECK (load_factor >= 0 AND load_factor <= 100),
    
    -- METADATA
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    generated_by INT,
    is_finalized BOOLEAN DEFAULT FALSE,
    notes TEXT,
    
    FOREIGN KEY (generated_by) REFERENCES Staff(admin_id),
    UNIQUE(report_type, period_start, period_end),
    CONSTRAINT chk_period_dates CHECK (period_start <= period_end),
    CONSTRAINT chk_net_revenue CHECK (net_revenue = total_revenue - total_refunds)
);

-- =============================================
-- Bảng Flight_Statistics (Thống kê chuyến bay)
-- =============================================
CREATE TABLE Flight_Statistics (
    id SERIAL PRIMARY KEY,
    flight_id INT NOT NULL,
    statistic_date DATE NOT NULL,
    total_bookings INT DEFAULT 0 CHECK (total_bookings >= 0),
    total_revenue DECIMAL(12,2) DEFAULT 0 CHECK (total_revenue >= 0),
    occupancy_rate DECIMAL(5,2) DEFAULT 0 CHECK (occupancy_rate >= 0 AND occupancy_rate <= 100),
    avg_ticket_price DECIMAL(10,2) DEFAULT 0 CHECK (avg_ticket_price >= 0),
    no_show_count INT DEFAULT 0 CHECK (no_show_count >= 0),
    completed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (flight_id) REFERENCES Flights(id) ON DELETE CASCADE,
    UNIQUE (flight_id, statistic_date)
);

-- =============================================
-- Bảng Route_Statistics (Thống kê tuyến bay)
-- =============================================
CREATE TABLE Route_Statistics (
    id SERIAL PRIMARY KEY,
    dep_airport_id INT NOT NULL,
    arr_airport_id INT NOT NULL,
    statistic_date DATE NOT NULL,
    total_passengers INT DEFAULT 0 CHECK (total_passengers >= 0),
    total_flights INT DEFAULT 0 CHECK (total_flights >= 0),
    total_revenue DECIMAL(12,2) DEFAULT 0 CHECK (total_revenue >= 0),
    average_load_factor DECIMAL(5,2) DEFAULT 0 CHECK (average_load_factor >= 0 AND average_load_factor <= 100),
    avg_ticket_price DECIMAL(10,2) DEFAULT 0 CHECK (avg_ticket_price >= 0),
    cancellation_rate DECIMAL(5,2) DEFAULT 0 CHECK (cancellation_rate >= 0 AND cancellation_rate <= 100),
    FOREIGN KEY (dep_airport_id) REFERENCES Airports(id) ON DELETE CASCADE,
    FOREIGN KEY (arr_airport_id) REFERENCES Airports(id) ON DELETE CASCADE,
    CHECK (dep_airport_id != arr_airport_id),
    UNIQUE(dep_airport_id, arr_airport_id, statistic_date)
);

-- =============================================
-- Bảng Daily_Stats (Thống kê hàng ngày)
-- =============================================
CREATE TABLE Daily_Stats (
    id SERIAL PRIMARY KEY,
    stat_date DATE NOT NULL UNIQUE,
    
    -- TODAY'S STATS
    completed_flights INT DEFAULT 0 CHECK (completed_flights >= 0),
    active_flights INT DEFAULT 0 CHECK (active_flights >= 0),
    cancelled_flights INT DEFAULT 0 CHECK (cancelled_flights >= 0),
    total_revenue DECIMAL(12,2) DEFAULT 0 CHECK (total_revenue >= 0),
    tickets_sold INT DEFAULT 0 CHECK (tickets_sold >= 0),
    new_customers INT DEFAULT 0 CHECK (new_customers >= 0),
    
    -- YESTERDAY'S STATS (for comparison)
    prev_completed_flights INT DEFAULT 0 CHECK (prev_completed_flights >= 0),
    prev_active_flights INT DEFAULT 0 CHECK (prev_active_flights >= 0),
    prev_cancelled_flights INT DEFAULT 0 CHECK (prev_cancelled_flights >= 0),
    prev_revenue DECIMAL(12,2) DEFAULT 0 CHECK (prev_revenue >= 0),
    prev_tickets_sold INT DEFAULT 0 CHECK (prev_tickets_sold >= 0),
    prev_new_customers INT DEFAULT 0 CHECK (prev_new_customers >= 0),
    
    -- CALCULATED FIELDS
    revenue_growth DECIMAL(8,2) DEFAULT 0,
    ticket_growth DECIMAL(8,2) DEFAULT 0,
    customer_growth DECIMAL(8,2) DEFAULT 0,
    
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- Bảng Report_Daily_Link (Liên kết báo cáo)
-- =============================================
CREATE TABLE Report_Daily_Link (
    id SERIAL PRIMARY KEY,
    report_id INT NOT NULL,
    daily_stat_id INT NOT NULL,
    FOREIGN KEY (report_id) REFERENCES Revenue_Reports(id) ON DELETE CASCADE,
    FOREIGN KEY (daily_stat_id) REFERENCES Daily_Stats(id) ON DELETE CASCADE,
    UNIQUE(report_id, daily_stat_id)
);

-- =============================================
-- TẠO INDEX CHO HIỆU SUẤT
-- =============================================

-- Index cho Staff
CREATE INDEX idx_staff_email ON Staff(email);
CREATE INDEX idx_staff_role ON Staff(role);

-- Index cho Users
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_users_created_at ON Users(created_at);

-- Index cho Airlines
CREATE INDEX idx_airlines_code ON Airlines(airline_code);

-- Index cho Airports
CREATE INDEX idx_airports_code ON Airports(airport_code);
CREATE INDEX idx_airports_city ON Airports(city);

-- Index cho Flights
CREATE INDEX idx_flights_departure_time ON Flights(departure_time);
CREATE INDEX idx_flights_airline_id ON Flights(airline_id);
CREATE INDEX idx_flights_departure_airport ON Flights(departure_airport_id);
CREATE INDEX idx_flights_arrival_airport ON Flights(arrival_airport_id);
CREATE INDEX idx_flights_status ON Flights(status);

-- Index cho Reservations
CREATE INDEX idx_reservations_user_id ON Reservations(user_id);
CREATE INDEX idx_reservations_flight_id ON Reservations(flight_id);
CREATE INDEX idx_reservations_status ON Reservations(status);
CREATE INDEX idx_reservations_reservation_date ON Reservations(reservation_date);
CREATE INDEX idx_reservations_reservation_code ON Reservations(reservation_code);

-- Index cho Promotions
CREATE INDEX idx_promotions_code ON Promotions(code);
CREATE INDEX idx_promotions_dates ON Promotions(start_date, end_date);
CREATE INDEX idx_promotions_active ON Promotions(is_active);

-- Index cho Reviews
CREATE INDEX idx_reviews_user_id ON Reviews(user_id);
CREATE INDEX idx_reviews_flight_id ON Reviews(flight_id);
CREATE INDEX idx_reviews_rating ON Reviews(rating_overall);

-- Index cho Revenue_Reports
CREATE INDEX idx_revenue_reports_dates ON Revenue_Reports(period_start, period_end);
CREATE INDEX idx_revenue_reports_type ON Revenue_Reports(report_type);

-- Index cho Flight_Statistics
CREATE INDEX idx_flight_stats_date ON Flight_Statistics(statistic_date);
CREATE INDEX idx_flight_stats_flight_date ON Flight_Statistics(flight_id, statistic_date);

-- Index cho Route_Statistics
CREATE INDEX idx_route_stats_date ON Route_Statistics(statistic_date);
CREATE INDEX idx_route_stats_route ON Route_Statistics(dep_airport_id, arr_airport_id);

-- Index cho Daily_Stats
CREATE INDEX idx_daily_stats_date ON Daily_Stats(stat_date);

-- =============================================
-- TẠO FUNCTION CẬP NHẬT TIMESTAMP
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger cho bảng Users
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON Users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger cho bảng Flights
CREATE TRIGGER update_flights_updated_at BEFORE UPDATE ON Flights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNCTION TÍNH DOANH THU TỰ ĐỘNG
-- =============================================
CREATE OR REPLACE FUNCTION calculate_net_revenue()
RETURNS TRIGGER AS $$
BEGIN
    NEW.net_revenue = NEW.total_revenue - NEW.total_refunds;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_net_revenue_trigger BEFORE INSERT OR UPDATE ON Revenue_Reports
    FOR EACH ROW EXECUTE FUNCTION calculate_net_revenue();

-- =============================================
-- FUNCTION CẬP NHẬT GROWTH RATE
-- =============================================
CREATE OR REPLACE FUNCTION calculate_growth_rates()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.prev_revenue > 0 THEN
        NEW.revenue_growth = ((NEW.total_revenue - NEW.prev_revenue) / NEW.prev_revenue) * 100;
    END IF;
    
    IF NEW.prev_tickets_sold > 0 THEN
        NEW.ticket_growth = ((NEW.tickets_sold - NEW.prev_tickets_sold) / NEW.prev_tickets_sold) * 100;
    END IF;
    
    IF NEW.prev_new_customers > 0 THEN
        NEW.customer_growth = ((NEW.new_customers - NEW.prev_new_customers) / NEW.prev_new_customers) * 100;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_growth_rates_trigger BEFORE INSERT OR UPDATE ON Daily_Stats
    FOR EACH ROW EXECUTE FUNCTION calculate_growth_rates();

-- =============================================
-- GHI CHÚ HOÀN THÀNH
-- =============================================
COMMENT ON DATABASE myapp IS 'Flight Booking System Database';
COMMENT ON TABLE Staff IS 'Quản lý thông tin nhân viên và admin hệ thống';
COMMENT ON TABLE Users IS 'Quản lý thông tin người dùng/khách hàng';
COMMENT ON TABLE Airlines IS 'Danh sách các hãng hàng không';
COMMENT ON TABLE Airports IS 'Danh sách các sân bay';
COMMENT ON TABLE Flights IS 'Thông tin các chuyến bay';
COMMENT ON TABLE Reservations IS 'Thông tin đặt chỗ của khách hàng';
COMMENT ON TABLE Promotions IS 'Chương trình khuyến mãi';
COMMENT ON TABLE Reviews IS 'Đánh giá và nhận xét của khách hàng';
COMMENT ON TABLE Revenue_Reports IS 'Báo cáo doanh thu và thống kê kinh doanh';
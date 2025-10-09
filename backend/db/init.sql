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

INSERT INTO Airlines (name, code, logo_url, contact_email, phone, website)
VALUES 
('Vietjet', 'VJ', 'https://upload.wikimedia.org/wikipedia/commons/8/8d/VietJet_Air_logo.png', '19001886@vietjetair.com', '19001886', 'https://www.vietjetair.com'),
('Vietnam Airlines', 'VNA', 'https://upload.wikimedia.org/wikipedia/vi/b/bc/Vietnam_Airlines_logo.svg', 'onlinesupport@vietnamairlines.com', '19001100', 'https://www.vietnamairlines.com'),
('Bamboo Airways', 'QH', 'https://upload.wikimedia.org/wikipedia/commons/7/78/Bamboo_Airways_Logo.svg', '19001166@bambooairways.com', '19001166', 'https://www.bambooairways.com'),
('Vietravel Airlines', 'VTA', 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Vietravel_Airlines_Logo.png', 'customercare@vietravelairlines.vn', '19006686', 'https://www.vietravelairlines.com'),
('Pacific Airlines', 'BL', 'https://upload.wikimedia.org/wikipedia/commons/5/5d/Logo_h%C3%A3ng_Pacific_Airlines.svg', 'callcenter1@pacificairlines.com.vn', '19001550', 'https://www.pacificairlines.com');


-- 2. Airports
CREATE TABLE Airports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    iata VARCHAR(3) UNIQUE,
    icao VARCHAR(4) UNIQUE
);

INSERT INTO Airports (name, city, country, iata, icao)
VALUES
('Nội Bài', 'Hà Nội', 'Việt Nam', 'HAN', 'VVNB'),
('Tân Sơn Nhất', 'TP HCM', 'Việt Nam', 'SGN', 'VVTS'),
('Liên Khương', 'Đà Lạt', 'Việt Nam', 'DLI', 'VVDL'),
('Phú Quốc', 'Phú Quốc', 'Việt Nam', 'PQC', 'VVPQ'),
('Đà Nẵng', 'Đà Nẵng', 'Việt Nam', 'DAD', 'VVDN'),
('Cam Ranh', 'Nha Trang', 'Việt Nam', 'CXR', 'VVCR'),
('Cát Bi', 'Hải Phòng', 'Việt Nam', 'HPH', 'VVCI'),
('Vinh', 'Vinh', 'Việt Nam', 'VII', 'VVVH'),
('Chu Lai', 'Chu Lai', 'Việt Nam', 'VCL', 'VVCA'),
('Phú Bài', 'Huế', 'Việt Nam', 'HUI', 'VVPB'),
('Thọ Xuân', 'Thanh Hóa', 'Việt Nam', 'THD', 'VVTN'),
('Phù Cát', 'Quy Nhơn', 'Việt Nam', 'UIH', 'VVPC');


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


-- Vietjet Air
INSERT INTO Aircrafts (model, manufacturer, capacity_economy, capacity_business, capacity_first, id_airline)
VALUES
('Airbus A320', 'Airbus', 180, 0, 0, 1),
('Airbus A321', 'Airbus', 220, 0, 0, 1);
-- Vietnam Airlines
INSERT INTO Aircrafts (model, manufacturer, capacity_economy, capacity_business, capacity_first, id_airline)
VALUES
('Airbus A321', 'Airbus', 180, 16, 0, 2),
('Airbus A350', 'Airbus', 220, 20, 8, 2),
('Boeing 787', 'Boeing', 246, 28, 8, 2);
-- Bamboo Airways
INSERT INTO Aircrafts (model, manufacturer, capacity_economy, capacity_business, capacity_first, id_airline)
VALUES
('Airbus A320', 'Airbus', 162, 8, 0, 3),
('Airbus A321', 'Airbus', 184, 8, 0, 3);
-- Vietravel Airlines
INSERT INTO Aircrafts (model, manufacturer, capacity_economy, capacity_business, capacity_first, id_airline)
VALUES
('Airbus A321', 'Airbus', 200, 8, 0, 4);
-- Pacific Airlines
INSERT INTO Aircrafts (model, manufacturer, capacity_economy, capacity_business, capacity_first, id_airline)
VALUES
('Airbus A320', 'Airbus', 180, 0, 0, 5);



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
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other'))
);

INSERT INTO Users (email, password, first_name, last_name, address, phone, date_of_birth, gender)
VALUES
('nguyen.van.a@email.com', '$2b$10$abc123', 'An', 'Nguyễn Văn', '123 Đường Lê Lợi, Quận 1, TP.HCM', '0901234567', '1990-05-15', 'male'),
('tran.thi.b@email.com', '$2b$10$def456', 'Bình', 'Trần Thị', '45 Đường Hoàng Diệu, Quận Hải Châu, Đà Nẵng', '0902345678', '1985-08-22', 'female'),
('le.van.c@email.com', '$2b$10$ghi789', 'Cường', 'Lê Văn', '27 Phố Huế, Quận Hai Bà Trưng, Hà Nội', '0903456789', '1992-03-10', 'male'),
('pham.thi.d@email.com', '$2b$10$jkl012', 'Dung', 'Phạm Thị', '89 Trần Phú, Thành phố Nha Trang, Khánh Hòa', '0904567890', '1988-11-05', 'female'),
('hoang.van.e@email.com', '$2b$10$mno345', 'Em', 'Hoàng Văn', '56 Nguyễn Trãi, Thành phố Cần Thơ', '0905678901', '1995-07-18', 'male'),
('john.smith@email.com', '$2b$10$efg123', 'John', 'Smith', '12 Lý Thường Kiệt, Quận Hoàn Kiếm, Hà Nội', '0911234567', '1980-01-30', 'male'),
('sarah.johnson@email.com', '$2b$10$hij456', 'Sarah', 'Johnson', '78 Nguyễn Văn Linh, Quận Thanh Khê, Đà Nẵng', '0912345678', '1983-07-12', 'female'),
('michael.brown@email.com', '$2b$10$klm789', 'Michael', 'Brown', '9 Nguyễn Huệ, Thành phố Huế, Thừa Thiên - Huế', '0913456789', '1978-11-25', 'male'),
('emily.davis@email.com', '$2b$10$nop012', 'Emily', 'Davis', '22 Lạch Tray, Quận Ngô Quyền, Hải Phòng', '0914567890', '1986-03-08', 'female'),
('david.wilson@email.com', '$2b$10$qrs345', 'David', 'Wilson', '101 Trần Hưng Đạo, Thành phố Đà Lạt, Lâm Đồng', '0915678901', '1990-08-17', 'male');


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
    CONSTRAINT fk_passengers_user FOREIGN KEY (user_id) REFERENCES Users(id)
);

INSERT INTO Passengers (user_id, first_name, last_name, date_of_birth, gender, nationality, passport_number, passport_expiry, identify_number, passenger_type)
VALUES
-- Relate to user 1
(1, 'An', 'Nguyễn Văn', '1990-05-15', 'male', 'Vietnamese', 'VN12345678', '2028-12-31', '001199000123', 'adult'),
(1, 'Hoa', 'Lê Thị', '1992-08-20', 'female', 'Vietnamese', 'VN23456789', '2029-06-30', '001199200456', 'adult'),
(1, 'Bảo', 'Nguyễn Anh', '2018-03-10', 'male', 'Vietnamese', 'VN34567890', '2030-03-15', NULL, 'child'),

-- Relate to user 2
(2, 'Minh', 'Phạm Văn', '1987-11-15', 'male', 'Vietnamese', NULL, NULL, '001198701234', 'adult'),
(2, 'Anh', 'Trần Tuấn', '2020-12-05', 'male', 'Vietnamese', NULL, NULL, NULL, 'child'),

-- Relate to user 3
(3, 'Cường', 'Lê Văn', '1992-03-10', 'male', 'Vietnamese', 'VN45678901', '2029-09-20', '001199200567', 'adult'),
(3, 'Hương', 'Nguyễn Thị', '1994-06-25', 'female', 'Vietnamese', 'VN56789012', '2030-01-25', '001199400890', 'adult'),

-- Relate to user 4
(4, 'Dung', 'Phạm Thị', '1988-11-05', 'female', 'Vietnamese', NULL, NULL, '001198800901', 'adult'),
(4, 'Lan', 'Phạm Thị', '2019-07-12', 'female', 'Vietnamese', NULL, NULL, NULL, 'child'),
(4, 'Thành', 'Nguyễn Văn', '1986-04-18', 'male', 'Vietnamese', NULL, NULL, '001198601234', 'adult'),

-- Relate to user 5
(5, 'Sơn', 'Hoàng Văn', '1965-09-10', 'male', 'Vietnamese', 'VN67890123', '2026-05-20', '001196509101', 'adult'),
(5, 'Liên', 'Phạm Thị', '1968-11-25', 'female', 'Vietnamese', 'VN78901234', '2027-08-15', '001196811252', 'adult'),

-- Relate to user 6
(6, 'John', 'Smith', '1980-01-30', 'male', 'American', 'US12345678', '2027-04-15', NULL, 'adult'),
(6, 'Lisa', 'Smith', '1982-09-22', 'female', 'American', 'US23456789', '2028-03-20', NULL, 'adult'),
(6, 'Emma', 'Smith', '2015-11-08', 'female', 'American', 'US34567890', '2029-12-10', NULL, 'child'),

-- Relate to user 7
(7, 'Sarah', 'Johnson', '1983-07-12', 'female', 'British', 'UK12345678', '2028-10-20', NULL, 'adult'),

-- Relate to user 8
(8, 'Jennifer', 'Brown', '1980-04-18', 'female', 'Canadian', 'CA23456789', '2030-01-31', NULL, 'adult'),
(8, 'Sophia', 'Brown', '2021-06-18', 'female', 'Canadian', 'CA34567890', '2030-01-31', NULL, 'infant'),

-- Relate to user 9
(9, 'Emily', 'Davis', '1986-03-08', 'female', 'Australian', 'AU12345678', '2026-06-10', NULL, 'adult'),
(9, 'William', 'Davis', '1984-12-15', 'male', 'Australian', 'AU23456789', '2027-11-25', NULL, 'adult'),

-- Relate to user 10
(10, 'David', 'Wilson', '1990-08-17', 'male', 'New Zealander', 'NZ12345678', '2030-12-05', NULL, 'adult'),
(10, 'Olivia', 'Wilson', '1992-04-03', 'female', 'New Zealander', 'NZ23456789', '2031-07-18', NULL, 'adult');


-- 7. Flights
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
    
    CONSTRAINT fk_flights_airline FOREIGN KEY (id_airline) REFERENCES Airlines(id),
    CONSTRAINT fk_flights_aircraft FOREIGN KEY (id_aircraft) REFERENCES Aircrafts(id),
    CONSTRAINT fk_flights_dep_airport FOREIGN KEY (dep_airport) REFERENCES Airports(id),
    CONSTRAINT fk_flights_arr_airport FOREIGN KEY (arr_airport) REFERENCES Airports(id),
    CONSTRAINT chk_valid_dates CHECK (arr_datetime > dep_datetime)
);

INSERT INTO Flights (
    flight_number, id_airline, id_aircraft, dep_airport, arr_airport, 
    dep_datetime, arr_datetime, duration_minutes,
    base_price_economy, base_price_business, base_price_first,
    luggage_fee_per_kg, free_luggage_weight, overweight_fee_per_kg,
    total_seats, available_seats_economy, available_seats_business, available_seats_first,
    status, gate, terminal
) VALUES
('VJ402', 1, 1, 3, 1, '2026-04-01 16:05:00', '2026-04-01 18:15:00', 130, 409000, NULL, NULL, 50000, 20, 70000, 180, 180, 0, 0, 'scheduled', 'B2', 'T1'),
('VJ403', 1, 1, 1, 3, '2026-04-01 05:30:00', '2026-04-01 07:20:00', 110, 609000, NULL, NULL, 50000, 20, 70000, 180, 180, 0, 0, 'scheduled', 'B1', 'T1'),
('VU 301', 4, 8, 2, 4, '2026-04-01 13:00:00', '2026-04-01 14:05:00', 65, 150000, 225000, NULL, 50000, 20, 70000, 208, 200, 8, 0, 'scheduled', 'A3', 'T1'),
('VN6056', 2, 5, 2, 5, '2026-04-02 19:30:00', '2026-04-02 20:50:00', 80, 149000, 223500, 298000, 50000, 20, 70000, 282, 246, 28, 8, 'scheduled', 'D2', 'T2'),
('VJ343', 1, 1, 2, 4, '2026-04-02 11:55:00', '2026-04-02 12:50:00', 55, 569000, NULL, NULL, 50000, 20, 70000, 180, 180, 0, 0, 'scheduled', 'A2', 'T1'),
('VN7151', 2, 3, 1, 5, '2026-04-02 06:30:00', '2026-04-02 07:55:00', 85, 1309000, 1963500, NULL, 50000, 20, 70000, 196, 180, 16, 0, 'scheduled', 'A2', 'T1'),
('VJ771', 1, 1, 1, 6, '2026-04-03 07:35:00', '2026-04-03 09:15:00', 100, 1029000, NULL, NULL, 50000, 20, 70000, 180, 180, 0, 0, 'scheduled', 'B2', 'T1'),
('VN207', 2, 4, 1, 2, '2026-04-03 07:00:00', '2026-04-03 09:15:00', 135, 299000, 448500, 598000, 50000, 20, 70000, 248, 220, 20, 8, 'scheduled', 'B1', 'T1'),
('VJ282', 1, 1, 2, 7, '2026-04-03 12:30:00', '2026-04-03 14:30:00', 120, 299000, NULL, NULL, 50000, 20, 70000, 180, 180, 0, 0, 'scheduled', 'B3', 'T1'),
('QH1626', 3, 7, 4, 1, '2026-04-04 17:55:00', '2026-04-04 20:00:00', 125, 5300000, 7950000, NULL, 50000, 20, 70000, 192, 184, 8, 0, 'scheduled', 'B1', 'T1'),
('VN207', 2, 5, 1, 2, '2026-04-04 07:00:00', '2026-04-04 09:15:00', 135, 299000, 448500, 598000, 50000, 20, 70000, 282, 246, 28, 8, 'scheduled', 'D1', 'T2'),
('QH1544', 3, 6, 2, 7, '2026-04-04 12:40:00', '2026-04-04 14:40:00', 120, 69000, 103500, NULL, 50000, 20, 70000, 170, 162, 8, 0, 'scheduled', 'D3', 'T2'),
('VU 301', 4, 8, 2, 4, '2026-04-05 13:00:00', '2026-04-05 14:05:00', 65, 90000, 135000, NULL, 50000, 20, 70000, 208, 200, 8, 0, 'scheduled', 'A2', 'T1'),
('VN1184', 2, 5, 2, 7, '2026-04-05 10:45:00', '2026-04-05 12:50:00', 125, 109000, 163500, 218000, 50000, 20, 70000, 282, 246, 28, 8, 'scheduled', 'A3', 'T1'),
('VJ218', 1, 1, 2, 8, '2026-04-05 07:10:00', '2026-04-05 09:00:00', 110, 299000, NULL, NULL, 50000, 20, 70000, 180, 180, 0, 0, 'scheduled', 'A1', 'T1'),
('QH1626', 3, 6, 4, 1, '2026-04-06 17:55:00', '2026-04-06 20:00:00', 125, 3900000, 5850000, NULL, 50000, 20, 70000, 170, 162, 8, 0, 'scheduled', 'A3', 'T1'),
('VN1343', 2, 4, 6, 2, '2026-04-06 12:10:00', '2026-04-06 13:20:00', 70, 99000, 148500, 198000, 50000, 20, 70000, 248, 220, 20, 8, 'scheduled', 'B1', 'T1'),
('QH1622', 3, 7, 4, 1, '2026-04-06 09:50:00', '2026-04-06 11:55:00', 125, 899000, 1348500, NULL, 50000, 20, 70000, 192, 184, 8, 0, 'scheduled', 'A2', 'T1'),
('VJ771', 1, 2, 1, 6, '2026-04-07 07:35:00', '2026-04-07 09:15:00', 100, 609000, NULL, NULL, 50000, 20, 70000, 220, 220, 0, 0, 'scheduled', 'A1', 'T1'),
('VN207', 2, 4, 1, 2, '2026-04-07 07:00:00', '2026-04-07 09:15:00', 135, 299000, 448500, 598000, 50000, 20, 70000, 248, 220, 20, 8, 'scheduled', 'C1', 'T2'),
('VJ282', 1, 2, 2, 7, '2026-04-07 12:30:00', '2026-04-07 14:30:00', 120, 49000, NULL, NULL, 50000, 20, 70000, 220, 220, 0, 0, 'scheduled', 'D2', 'T2'),
('QH247', 3, 7, 1, 2, '2026-04-08 19:45:00', '2026-04-08 21:55:00', 130, 299000, 448500, NULL, 50000, 20, 70000, 192, 184, 8, 0, 'scheduled', 'D1', 'T2'),
('VN181', 2, 3, 1, 5, '2026-04-08 16:20:00', '2026-04-08 17:45:00', 85, 309000, 463500, NULL, 50000, 20, 70000, 196, 180, 16, 0, 'scheduled', 'C2', 'T2'),
('VJ278', 1, 2, 2, 7, '2026-04-08 19:20:00', '2026-04-08 21:20:00', 120, 49000, NULL, NULL, 50000, 20, 70000, 220, 220, 0, 0, 'scheduled', 'C1', 'T2'),
('VJ123', 1, 1, 1, 2, '2026-04-09 09:30:00', '2026-04-09 11:45:00', 135, 199000, NULL, NULL, 50000, 20, 70000, 180, 180, 0, 0, 'scheduled', 'D2', 'T2'),
('VJ623', 1, 1, 5, 2, '2026-04-09 16:55:00', '2026-04-09 18:20:00', 85, 49000, NULL, NULL, 50000, 20, 70000, 180, 180, 0, 0, 'scheduled', 'B2', 'T1'),
('QH280', 3, 7, 2, 1, '2026-04-09 21:00:00', '2026-04-09 23:10:00', 130, 299000, 448500, NULL, 50000, 20, 70000, 192, 184, 8, 0, 'scheduled', 'D1', 'T2'),
('VN7086', 2, 4, 4, 2, '2026-04-10 07:55:00', '2026-04-10 09:05:00', 70, 199000, 298500, 398000, 50000, 20, 70000, 248, 220, 20, 8, 'scheduled', 'B1', 'T1'),
('VJ179', 1, 2, 1, 2, '2026-04-10 21:50:00', '2026-04-11 00:00:00', 130, 199000, NULL, NULL, 50000, 20, 70000, 220, 220, 0, 0, 'scheduled', 'C1', 'T2'),
('VJ213', 1, 2, 8, 2, '2026-04-10 13:00:00', '2026-04-10 14:50:00', 110, 299000, NULL, NULL, 50000, 20, 70000, 220, 220, 0, 0, 'scheduled', 'A1', 'T1'),
('QH1173', 3, 6, 11, 2, '2026-04-11 14:50:00', '2026-04-11 16:50:00', 120, 399000, 598500, NULL, 50000, 20, 70000, 170, 162, 8, 0, 'scheduled', 'A3', 'T1'),
('VN6431', 2, 4, 8, 2, '2026-04-11 10:20:00', '2026-04-11 12:15:00', 115, 69000, 103500, 138000, 50000, 20, 70000, 248, 220, 20, 8, 'scheduled', 'A1', 'T1'),
('VN7124', 2, 5, 2, 5, '2026-04-11 06:45:00', '2026-04-11 08:10:00', 85, 99000, 148500, 198000, 50000, 20, 70000, 282, 246, 28, 8, 'scheduled', 'A3', 'T1'),
('VJ450', 1, 1, 4, 1, '2026-04-12 20:05:00', '2026-04-12 22:05:00', 120, 649000, NULL, NULL, 50000, 20, 70000, 180, 180, 0, 0, 'scheduled', 'A2', 'T1'),
('VN207', 2, 5, 1, 2, '2026-04-12 07:00:00', '2026-04-12 09:15:00', 135, 299000, 448500, 598000, 50000, 20, 70000, 282, 246, 28, 8, 'scheduled', 'D3', 'T2'),
('VJ282', 1, 2, 2, 7, '2026-04-12 12:30:00', '2026-04-12 14:30:00', 120, 49000, NULL, NULL, 50000, 20, 70000, 220, 220, 0, 0, 'scheduled', 'A2', 'T1'),
('VN283', 2, 3, 1, 2, '2026-04-13 20:00:00', '2026-04-13 22:15:00', 135, 299000, 448500, NULL, 50000, 20, 70000, 196, 180, 16, 0, 'scheduled', 'B3', 'T1'),
('VJ378', 1, 1, 2, 9, '2026-04-13 10:45:00', '2026-04-13 12:05:00', 80, 99000, NULL, NULL, 50000, 20, 70000, 180, 180, 0, 0, 'scheduled', 'A2', 'T1'),
('VJ401', 1, 2, 1, 3, '2026-04-13 13:40:00', '2026-04-13 15:30:00', 110, 299000, NULL, NULL, 50000, 20, 70000, 220, 220, 0, 0, 'scheduled', 'B1', 'T1'),
('VN214', 2, 4, 2, 1, '2026-04-14 14:00:00', '2026-04-14 16:10:00', 130, 299000, 448500, 598000, 50000, 20, 70000, 248, 220, 20, 8, 'scheduled', 'C1', 'T2'),
('VN1382', 2, 4, 2, 3, '2026-04-14 09:30:00', '2026-04-14 10:35:00', 65, 99000, 148500, 198000, 50000, 20, 70000, 248, 220, 20, 8, 'scheduled', 'D3', 'T2'),
('VJ632', 1, 2, 2, 5, '2026-04-14 15:35:00', '2026-04-14 17:00:00', 85, 49000, NULL, NULL, 50000, 20, 70000, 220, 220, 0, 0, 'scheduled', 'B2', 'T1'),
('QH1212', 3, 7, 12, 1, '2026-04-15 11:45:00', '2026-04-15 13:25:00', 100, 69000, 103500, NULL, 50000, 20, 70000, 192, 184, 8, 0, 'scheduled', 'A1', 'T1'),
('VN6202', 2, 4, 2, 6, '2026-04-15 19:35:00', '2026-04-15 20:40:00', 65, 49000, 73500, 98000, 50000, 20, 70000, 248, 220, 20, 8, 'scheduled', 'A1', 'T1'),
('VN275', 2, 3, 1, 2, '2026-04-15 18:00:00', '2026-04-15 20:15:00', 135, 299000, 448500, NULL, 50000, 20, 70000, 196, 180, 16, 0, 'scheduled', 'B3', 'T1'),
('VJ155', 1, 1, 1, 2, '2026-04-16 19:20:00', '2026-04-16 21:30:00', 130, 199000, NULL, NULL, 50000, 20, 70000, 180, 180, 0, 0, 'scheduled', 'B1', 'T1'),
('VN1460', 2, 5, 2, 9, '2026-04-16 11:40:00', '2026-04-16 13:05:00', 85, 209000, 313500, 418000, 50000, 20, 70000, 282, 246, 28, 8, 'scheduled', 'C2', 'T2'),
('VN1579', 2, 5, 1, 3, '2026-04-16 17:15:00', '2026-04-16 19:15:00', 120, 509000, 763500, 1018000, 50000, 20, 70000, 282, 246, 28, 8, 'scheduled', 'B3', 'T1'),
('VN7837', 2, 3, 2, 4, '2026-04-17 19:55:00', '2026-04-17 21:00:00', 65, 199000, 298500, NULL, 50000, 20, 70000, 196, 180, 16, 0, 'scheduled', 'C3', 'T2'),
('VN7230', 2, 3, 4, 1, '2026-04-17 21:00:00', '2026-04-17 23:05:00', 125, 1209000, 1813500, NULL, 50000, 20, 70000, 196, 180, 16, 0, 'scheduled', 'A2', 'T1'),
('VN7578', 2, 4, 3, 1, '2026-04-17 20:55:00', '2026-04-17 22:40:00', 105, 299000, 448500, 598000, 50000, 20, 70000, 248, 220, 20, 8, 'scheduled', 'B3', 'T1'),
('VN1238', 2, 5, 4, 1, '2026-04-18 19:00:00', '2026-04-18 21:15:00', 135, 3379000, 5068500, 6758000, 50000, 20, 70000, 282, 246, 28, 8, 'scheduled', 'A3', 'T1'),
('VN6201', 2, 4, 6, 2, '2026-04-18 10:20:00', '2026-04-18 11:30:00', 70, 259000, 388500, 518000, 50000, 20, 70000, 248, 220, 20, 8, 'scheduled', 'B1', 'T1'),
('QH1624', 3, 7, 4, 1, '2026-04-18 12:50:00', '2026-04-18 14:55:00', 125, 3380000, 5070000, NULL, 50000, 20, 70000, 192, 184, 8, 0, 'scheduled', 'A3', 'T1'),
('VN7275', 2, 5, 11, 2, '2026-04-19 13:25:00', '2026-04-19 15:35:00', 130, 109000, 163500, 218000, 50000, 20, 70000, 282, 246, 28, 8, 'scheduled', 'B1', 'T1'),
('VN209', 2, 5, 1, 2, '2026-04-19 09:00:00', '2026-04-19 11:15:00', 135, 299000, 448500, 598000, 50000, 20, 70000, 282, 246, 28, 8, 'scheduled', 'C2', 'T2'),
('VJ304', 1, 1, 2, 10, '2026-04-19 12:30:00', '2026-04-19 13:55:00', 85, 49000, NULL, NULL, 50000, 20, 70000, 180, 180, 0, 0, 'scheduled', 'C1', 'T2'),
('VJ224', 1, 2, 2, 8, '2026-04-20 14:10:00', '2026-04-20 16:00:00', 110, 99000, NULL, NULL, 50000, 20, 70000, 220, 220, 0, 0, 'scheduled', 'D2', 'T2'),
('VJ123', 1, 2, 1, 2, '2026-04-20 09:30:00', '2026-04-20 11:45:00', 135, 199000, NULL, NULL, 50000, 20, 70000, 220, 220, 0, 0, 'scheduled', 'C3', 'T2'),
('QH1103', 3, 6, 10, 2, '2026-04-20 10:50:00', '2026-04-20 12:25:00', 95, 26000, 39000, NULL, 50000, 20, 70000, 170, 162, 8, 0, 'scheduled', 'B3', 'T1'),
('VJ324', 1, 2, 4, 2, '2026-04-21 11:55:00', '2026-04-21 13:05:00', 70, 49000, NULL, NULL, 50000, 20, 70000, 220, 220, 0, 0, 'scheduled', 'B2', 'T1'),
('QH1540', 3, 7, 2, 7, '2026-04-21 08:00:00', '2026-04-21 10:00:00', 120, 89000, 133500, NULL, 50000, 20, 70000, 192, 184, 8, 0, 'scheduled', 'A3', 'T1'),
('VN1268', 2, 5, 2, 8, '2026-04-21 19:15:00', '2026-04-21 21:10:00', 115, 109000, 163500, 218000, 50000, 20, 70000, 282, 246, 28, 8, 'scheduled', 'B2', 'T1'),
('VN113', 2, 3, 5, 2, '2026-04-22 09:10:00', '2026-04-22 10:40:00', 90, 99000, 148500, NULL, 50000, 20, 70000, 196, 180, 16, 0, 'scheduled', 'B1', 'T1'),
('VU 329', 4, 8, 2, 4, '2026-04-22 17:05:00', '2026-04-22 18:10:00', 65, 50000, 75000, NULL, 50000, 20, 70000, 208, 200, 8, 0, 'scheduled', 'A2', 'T1'),
('VN159', 2, 5, 1, 5, '2026-04-22 08:20:00', '2026-04-22 09:45:00', 85, 309000, 463500, 618000, 50000, 20, 70000, 282, 246, 28, 8, 'scheduled', 'D1', 'T2'),
('VJ155', 1, 1, 1, 2, '2026-04-23 19:20:00', '2026-04-23 21:30:00', 130, 199000, NULL, NULL, 50000, 20, 70000, 180, 180, 0, 0, 'scheduled', 'D1', 'T2'),
('VJ454', 1, 1, 4, 1, '2026-04-23 12:25:00', '2026-04-23 14:25:00', 120, 309000, NULL, NULL, 50000, 20, 70000, 180, 180, 0, 0, 'scheduled', 'A1', 'T1'),
('QH1421', 3, 6, 1, 3, '2026-04-23 05:55:00', '2026-04-23 07:45:00', 110, 1200000, 1800000, NULL, 50000, 20, 70000, 170, 162, 8, 0, 'scheduled', 'D1', 'T2'),
('QH1626', 3, 7, 4, 1, '2026-04-24 17:55:00', '2026-04-24 20:00:00', 125, 5300000, 7950000, NULL, 50000, 20, 70000, 192, 184, 8, 0, 'scheduled', 'B3', 'T1'),
('VN1346', 2, 4, 2, 6, '2026-04-24 12:35:00', '2026-04-24 13:50:00', 75, 99000, 148500, 198000, 50000, 20, 70000, 248, 220, 20, 8, 'scheduled', 'B3', 'T1'),
('VJ1452', 1, 1, 4, 1, '2026-04-24 10:45:00', '2026-04-24 12:50:00', 125, 309000, NULL, NULL, 50000, 20, 70000, 180, 180, 0, 0, 'scheduled', 'B3', 'T1'),
('VJ450', 1, 2, 4, 1, '2026-04-25 20:05:00', '2026-04-25 22:05:00', 120, 309000, NULL, NULL, 50000, 20, 70000, 220, 220, 0, 0, 'scheduled', 'B2', 'T1'),
('VU 757', 4, 8, 1, 2, '2026-04-25 09:25:00', '2026-04-25 12:00:00', 155, 290000, 435000, NULL, 50000, 20, 70000, 208, 200, 8, 0, 'scheduled', 'D1', 'T2'),
('VN1181', 2, 3, 7, 2, '2026-04-25 10:00:00', '2026-04-25 12:15:00', 135, 109000, 163500, NULL, 50000, 20, 70000, 196, 180, 16, 0, 'scheduled', 'A2', 'T1'),
('VJ450', 1, 2, 4, 1, '2026-04-26 20:05:00', '2026-04-26 22:05:00', 120, 309000, NULL, NULL, 50000, 20, 70000, 220, 220, 0, 0, 'scheduled', 'A3', 'T1'),
('VN7388', 2, 3, 2, 3, '2026-04-26 05:55:00', '2026-04-26 07:00:00', 65, 69000, 103500, NULL, 50000, 20, 70000, 196, 180, 16, 0, 'scheduled', 'A3', 'T1'),
('VN1232', 2, 5, 4, 1, '2026-04-26 13:25:00', '2026-04-26 15:40:00', 135, 3009000, 4513500, 6018000, 50000, 20, 70000, 282, 246, 28, 8, 'scheduled', 'A1', 'T1'),
('VN1575', 2, 3, 1, 3, '2026-04-27 12:45:00', '2026-04-27 14:45:00', 120, 99000, 148500, NULL, 50000, 20, 70000, 196, 180, 16, 0, 'scheduled', 'A2', 'T1'),
('VJ770', 1, 1, 6, 1, '2026-04-27 09:45:00', '2026-04-27 11:35:00', 110, 909000, NULL, NULL, 50000, 20, 70000, 180, 180, 0, 0, 'scheduled', 'A1', 'T1'),
('VN6517', 2, 4, 2, 4, '2026-04-27 14:05:00', '2026-04-27 15:10:00', 65, 49000, 73500, 98000, 50000, 20, 70000, 248, 220, 20, 8, 'scheduled', 'A2', 'T1'),
('VJ434', 1, 1, 12, 1, '2026-04-28 14:45:00', '2026-04-28 16:25:00', 100, 89000, NULL, NULL, 50000, 20, 70000, 180, 180, 0, 0, 'scheduled', 'B2', 'T1'),
('VN1341', 2, 4, 6, 2, '2026-04-28 09:45:00', '2026-04-28 10:55:00', 70, 69000, 103500, 138000, 50000, 20, 70000, 248, 220, 20, 8, 'scheduled', 'A3', 'T1'),
('VN275', 2, 4, 1, 2, '2026-04-28 18:00:00', '2026-04-28 20:15:00', 135, 299000, 448500, 598000, 50000, 20, 70000, 248, 220, 20, 8, 'scheduled', 'C3', 'T2'),
('VJ151', 1, 2, 1, 2, '2026-04-29 21:00:00', '2026-04-29 23:10:00', 130, 609000, NULL, NULL, 50000, 20, 70000, 220, 220, 0, 0, 'scheduled', 'A1', 'T1'),
('VJ336', 1, 2, 4, 2, '2026-04-29 19:15:00', '2026-04-29 20:15:00', 60, 49000, NULL, NULL, 50000, 20, 70000, 220, 220, 0, 0, 'scheduled', 'A3', 'T1'),
('VN1575', 2, 4, 1, 3, '2026-04-29 12:45:00', '2026-04-29 14:45:00', 120, 1609000, 2413500, 3218000, 50000, 20, 70000, 248, 220, 20, 8, 'scheduled', 'C3', 'T2'),
('VJ434', 1, 2, 12, 1, '2026-04-30 14:45:00', '2026-04-30 16:25:00', 100, 89000, NULL, NULL, 50000, 20, 70000, 220, 220, 0, 0, 'scheduled', 'A2', 'T1'),
('VU 757', 4, 8, 1, 2, '2026-04-30 09:25:00', '2026-04-30 12:00:00', 155, 390000, 585000, NULL, 50000, 20, 70000, 208, 200, 8, 0, 'scheduled', 'A2', 'T1'),
('VN1186', 2, 4, 2, 7, '2026-04-30 16:55:00', '2026-04-30 19:00:00', 125, 909000, 1363500, 1818000, 50000, 20, 70000, 248, 220, 20, 8, 'scheduled', 'C1', 'T2'),
('VN283', 2, 4, 1, 2, '2026-05-01 20:00:00', '2026-05-01 22:15:00', 135, 299000, 448500, 598000, 50000, 20, 70000, 248, 220, 20, 8, 'scheduled', 'A2', 'T1'),
('QH204', 3, 7, 2, 1, '2026-05-01 07:05:00', '2026-05-01 09:15:00', 130, 299000, 448500, NULL, 50000, 20, 70000, 192, 184, 8, 0, 'scheduled', 'A2', 'T1'),
('QH170', 3, 7, 2, 5, '2026-05-01 20:00:00', '2026-05-01 21:30:00', 90, 599000, 898500, NULL, 50000, 20, 70000, 192, 184, 8, 0, 'scheduled', 'A2', 'T1'),
('VJ322', 1, 2, 4, 2, '2026-05-02 11:05:00', '2026-05-02 12:10:00', 65, 1049000, NULL, NULL, 50000, 20, 70000, 220, 220, 0, 0, 'scheduled', 'B1', 'T1'),
('VJ771', 1, 2, 1, 6, '2026-05-02 07:35:00', '2026-05-02 09:15:00', 100, 709000, NULL, NULL, 50000, 20, 70000, 220, 220, 0, 0, 'scheduled', 'B2', 'T1'),
('VJ412', 1, 1, 3, 1, '2026-05-02 22:00:00', '2026-05-02 23:50:00', 110, 1689000, NULL, NULL, 50000, 20, 70000, 180, 180, 0, 0, 'scheduled', 'A3', 'T1'),
('QH281', 3, 7, 1, 2, '2026-05-03 21:15:00', '2026-05-03 23:25:00', 130, 649000, 973500, NULL, 50000, 20, 70000, 192, 184, 8, 0, 'scheduled', 'D2', 'T2'),
('VJ312', 1, 2, 2, 10, '2026-05-03 21:10:00', '2026-05-03 22:35:00', 85, 469000, NULL, NULL, 50000, 20, 70000, 220, 220, 0, 0, 'scheduled', 'A1', 'T1'),
('VN1573', 2, 4, 1, 3, '2026-05-03 07:45:00', '2026-05-03 09:40:00', 115, 509000, 763500, 1018000, 50000, 20, 70000, 248, 220, 20, 8, 'scheduled', 'B1', 'T1');


-- 8. Seats
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

INSERT INTO Seats (id_aircraft, seat_number, seat_class, seat_type, is_available) VALUES
(1, '2A', 'economy', 'window', TRUE),
(1, '6B', 'economy', 'aisle', TRUE),
(1, '7C', 'economy', 'middle', TRUE),
(1, '8D', 'economy', 'middle', TRUE),
(1, '11E', 'economy', 'aisle', TRUE),
(1, '16F', 'economy', 'window', TRUE),
(1, '23A', 'economy', 'window', TRUE),
(1, '24B', 'economy', 'aisle', TRUE),
(1, '26C', 'economy', 'middle', TRUE),
(1, '28D', 'economy', 'middle', TRUE),
(1, '29E', 'economy', 'aisle', TRUE),
(2, '1A', 'economy', 'window', TRUE),
(2, '2B', 'economy', 'aisle', TRUE),
(2, '5C', 'economy', 'middle', TRUE),
(2, '6D', 'economy', 'middle', TRUE),
(2, '7E', 'economy', 'aisle', TRUE),
(2, '20F', 'economy', 'window', TRUE),
(2, '21A', 'economy', 'window', TRUE),
(2, '22B', 'economy', 'aisle', TRUE),
(2, '26C', 'economy', 'middle', TRUE),
(2, '27D', 'economy', 'middle', TRUE),
(2, '30E', 'economy', 'aisle', TRUE),
(3, '4A', 'business', 'window', TRUE),
(3, '6B', 'business', 'aisle', TRUE),
(3, '9C', 'business', 'middle', TRUE),
(3, '11D', 'business', 'middle', TRUE),
(3, '12E', 'economy', 'aisle', TRUE),
(3, '15F', 'economy', 'window', TRUE),
(3, '16A', 'economy', 'window', TRUE),
(3, '18B', 'economy', 'aisle', TRUE),
(3, '22C', 'economy', 'middle', TRUE),
(3, '26D', 'economy', 'middle', TRUE),
(3, '27E', 'economy', 'aisle', TRUE),
(4, '4A', 'first', 'window', TRUE),
(4, '6B', 'first', 'aisle', TRUE),
(4, '8C', 'business', 'middle', TRUE),
(4, '15D', 'business', 'middle', TRUE),
(4, '18E', 'business', 'aisle', TRUE),
(4, '19F', 'economy', 'window', TRUE),
(4, '20A', 'economy', 'window', TRUE),
(4, '21B', 'economy', 'aisle', TRUE),
(4, '23C', 'economy', 'middle', TRUE),
(4, '25D', 'economy', 'middle', TRUE),
(4, '30E', 'economy', 'aisle', TRUE),
(5, '1A', 'first', 'window', TRUE),
(5, '2B', 'first', 'aisle', TRUE),
(5, '11C', 'business', 'middle', TRUE),
(5, '14D', 'business', 'middle', TRUE),
(5, '15E', 'business', 'aisle', TRUE),
(5, '19F', 'economy', 'window', TRUE),
(5, '21A', 'economy', 'window', TRUE),
(5, '22B', 'economy', 'aisle', TRUE),
(5, '23C', 'economy', 'middle', TRUE),
(5, '24D', 'economy', 'middle', TRUE),
(5, '29E', 'economy', 'aisle', TRUE),
(6, '3A', 'economy', 'window', TRUE),
(6, '5B', 'economy', 'aisle', TRUE),
(6, '6C', 'economy', 'middle', TRUE),
(6, '12D', 'economy', 'middle', TRUE),
(6, '15E', 'economy', 'aisle', TRUE),
(6, '18F', 'economy', 'window', TRUE),
(6, '20A', 'economy', 'window', TRUE),
(6, '23B', 'economy', 'aisle', TRUE),
(6, '25C', 'economy', 'middle', TRUE),
(6, '26D', 'economy', 'middle', TRUE),
(6, '28E', 'economy', 'aisle', TRUE),
(7, '1A', 'business', 'window', TRUE),
(7, '4B', 'business', 'aisle', TRUE),
(7, '5C', 'business', 'middle', TRUE),
(7, '8D', 'business', 'middle', TRUE),
(7, '14E', 'economy', 'aisle', TRUE),
(7, '19F', 'economy', 'window', TRUE),
(7, '20A', 'economy', 'window', TRUE),
(7, '21B', 'economy', 'aisle', TRUE),
(7, '25C', 'economy', 'middle', TRUE),
(7, '26D', 'economy', 'middle', TRUE),
(7, '28E', 'economy', 'aisle', TRUE),
(8, '3A', 'business', 'window', TRUE),
(8, '4B', 'business', 'aisle', TRUE),
(8, '9C', 'business', 'middle', TRUE),
(8, '13D', 'business', 'middle', TRUE),
(8, '15E', 'economy', 'aisle', TRUE),
(8, '17F', 'economy', 'window', TRUE),
(8, '21A', 'economy', 'window', TRUE),
(8, '23B', 'economy', 'aisle', TRUE),
(8, '25C', 'economy', 'middle', TRUE),
(8, '28D', 'economy', 'middle', TRUE),
(8, '30E', 'economy', 'aisle', TRUE),
(9, '2A', 'economy', 'window', TRUE),
(9, '4B', 'economy', 'aisle', TRUE),
(9, '5C', 'economy', 'middle', TRUE),
(9, '10D', 'economy', 'middle', TRUE),
(9, '11E', 'economy', 'aisle', TRUE),
(9, '18F', 'economy', 'window', TRUE),
(9, '20A', 'economy', 'window', TRUE),
(9, '21B', 'economy', 'aisle', TRUE),
(9, '27C', 'economy', 'middle', TRUE),
(9, '28D', 'economy', 'middle', TRUE),
(9, '29E', 'economy', 'aisle', TRUE);


-- 9. Reservations
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
    
    CONSTRAINT fk_reservations_user FOREIGN KEY (user_id) REFERENCES Users(id),
    CONSTRAINT fk_reservations_main_flight FOREIGN KEY (main_flight_id) REFERENCES Flights(id),
    CONSTRAINT fk_reservations_return_flight FOREIGN KEY (return_flight_id) REFERENCES Flights(id)
);

INSERT INTO Reservations (
    reservation_code, user_id, main_flight_id, return_flight_id,
    total_passengers, total_amount, paid_amount, discount_amount, tax_amount, status
) VALUES
('RES202510090008', 8, 7, NULL, 2, 873343, 0, 33000, 82000, 'completed'),
('RES202510090002', 4, 19, NULL, 3, 5280265, 5280265, 98000, 489000, 'cancelled'),
('RES202510090001', 2, 42, NULL, 2, 3218468, 965540, 0, 293000, 'pending'),
('RES202510090010', 4, 40, 46, 3, 3711028, 3711028, 586000, 391000, 'confirmed');


-- 10. Booked_Seats
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

INSERT INTO Booked_Seats (id_seat, id_flight, reservation_id, booked_at)
VALUES 
(6, 7, 1, '2025-10-09 10:00:00'),
(7, 7, 1, '2025-10-09 10:00:00'),
(70, 19, 2, '2025-10-09 09:00:00'),
(71, 19, 2, '2025-10-09 09:00:00'),
(72, 19, 2, '2025-10-09 09:00:00'),
(15, 42, 3, '2025-10-09 08:00:00'),
(16, 42, 3, '2025-10-09 08:00:00'),
(41, 40, 4, '2025-10-09 07:30:00'),
(42, 40, 4, '2025-10-09 07:30:00'),
(43, 40, 4, '2025-10-09 07:30:00'),
(8, 46, 4, '2025-10-09 07:30:00'),
(9, 46, 4, '2025-10-09 07:30:00'),
(10, 46, 4, '2025-10-09 07:30:00');


-- 11. Reservations_Details
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
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'VND',
    status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed, refunded
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


CREATE TABLE Promotions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL, -- percentage, fixed_amount
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    max_discount_amount DECIMAL(10,2),
    usage_limit INT,
    used_count INT DEFAULT 0,
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
    CONSTRAINT fk_pu_reservation FOREIGN KEY (reservation_id) REFERENCES Reservations(id),
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


CREATE TABLE Crew_Members (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL, -- NV001, NV002
    crew_type VARCHAR(50) NOT NULL, -- pilot, co_pilot, flight_attendant, engineer
    total_flight_hours INT DEFAULT 0,
    hire_date DATE NOT NULL
);

CREATE TABLE Flight_Crew_Assignments (
    id SERIAL PRIMARY KEY,
    flight_id INT NOT NULL,
    crew_member_id INT NOT NULL,
    role VARCHAR(50) NOT NULL, -- pilot_in_command, first_officer, purser, flight_attendant
    duty_start_time TIMESTAMP NOT NULL,
    duty_end_time TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, confirmed, reassigned, cancelled
    
    CONSTRAINT fk_assignments_flight FOREIGN KEY (flight_id) REFERENCES Flights(id),
    CONSTRAINT fk_assignments_crew FOREIGN KEY (crew_member_id) REFERENCES Crew_Members(id),
    CONSTRAINT chk_valid_duty_times CHECK (duty_end_time > duty_start_time)
);

CREATE TABLE Staff (
    admin_id SERIAL PRIMARY KEY,
    admin_name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('Admin','Super Admin')),
    email VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    avatar VARCHAR(255) NOT NULL -- link ảnh
);

CREATE TABLE Flight_Statistics (
    id SERIAL PRIMARY KEY,
    flight_id INT NOT NULL,
    statistic_date DATE NOT NULL,
    total_bookings INT DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    occupancy_rate DECIMAL(5,2) DEFAULT 0,
    avg_ticket_price DECIMAL(10,2) DEFAULT 0,
    CONSTRAINT fk_stats_flight FOREIGN KEY (flight_id) REFERENCES Flights(id),
    CONSTRAINT unique_flight_date UNIQUE (flight_id, statistic_date)
);

CREATE TABLE Revenue_Reports (
    id SERIAL PRIMARY KEY,
    report_date DATE NOT NULL,
    report_type VARCHAR(50) NOT NULL, -- daily, weekly, monthly
    total_revenue DECIMAL(12,2) DEFAULT 0,
    booking_count INT DEFAULT 0,
    avg_booking_value DECIMAL(10,2) DEFAULT 0,
    cancellation_rate DECIMAL(5,2) DEFAULT 0
);


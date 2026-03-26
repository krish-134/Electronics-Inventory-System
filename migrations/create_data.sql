CREATE TABLE Users (
    username  VARCHAR PRIMARY KEY,
    password  VARCHAR NOT NULL,
    email     VARCHAR NOT NULL UNIQUE,
    real_name VARCHAR NOT NULL
);

CREATE TABLE Location (
    storage_name VARCHAR,
    position     VARCHAR,
    facility     VARCHAR,
    type         VARCHAR,
    label        VARCHAR,
    last_updated TIMESTAMP,

    PRIMARY KEY (storage_name, position, facility)
);

CREATE TABLE Supplier (
    name          VARCHAR PRIMARY KEY,
    url           VARCHAR NOT NULL,
    country       VARCHAR NOT NULL,
    contact_email VARCHAR 
);

CREATE TABLE Project (
    name         VARCHAR PRIMARY KEY,
    created_at   TIMESTAMP NOT NULL,
    purpose      TEXT,
    last_updated TIMESTAMP,

    storage_name VARCHAR,
    position     VARCHAR,
    facility     VARCHAR,

    FOREIGN KEY (storage_name, position, facility)
        REFERENCES Location(storage_name, position, facility)
        ON DELETE NO ACTION
);

CREATE TABLE Component (
    part_num       VARCHAR PRIMARY KEY,
    price          DECIMAL(10,2),
    name           VARCHAR NOT NULL,
    package        VARCHAR,
    tolerance      DECIMAL(6,6),
    quantity       INT DEFAULT 0,
    voltage_rating DECIMAL(16,4),
    additional     JSONB,
    
    storage_name   VARCHAR,
    position       VARCHAR,
    facility       VARCHAR,

    supplier_name  VARCHAR NOT NULL,

    FOREIGN KEY (storage_name, position, facility)
        REFERENCES Location(storage_name, position, facility)
        ON DELETE SET NULL,

        
    FOREIGN KEY (supplier_name)
        REFERENCES Supplier(name)
        ON DELETE NO ACTION
);

------------------------------------------------------------  

CREATE TABLE Capacitor (
    temp_coeff  VARCHAR,
    type        VARCHAR,
    capacitance DECIMAL(8,4) NOT NULL,

    part_num    VARCHAR PRIMARY KEY,

    FOREIGN KEY (part_num)
        REFERENCES Component(part_num)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE Resistor (
    composition VARCHAR,
    resistance  DECIMAL(16,4) NOT NULL,
    power       VARCHAR,

    part_num    VARCHAR PRIMARY KEY,

    FOREIGN KEY (part_num)
        REFERENCES Component(part_num)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE Diode (
    dcapacitance DECIMAL(16,4),
    vforward    DECIMAL(16,4) NOT NULL,
    vreverse    DECIMAL(16,4) NOT NULL,

    part_num    VARCHAR PRIMARY KEY,

    FOREIGN KEY (part_num)
        REFERENCES Component(part_num)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

------------------------------------------------------------  

CREATE TABLE Courier (
    name          VARCHAR PRIMARY KEY,
    code_format   VARCHAR,
    website       VARCHAR NOT NULL,
    contact_email VARCHAR
);

CREATE TABLE Version (
    version_number VARCHAR,
    title          VARCHAR NOT NULL,
    date           TIMESTAMP NOT NULL,
    snapshot       JSONB NOT NULL,
    created_by     VARCHAR,
    project_name   VARCHAR,

    FOREIGN KEY (created_by)
        REFERENCES Users(username)
        ON DELETE SET NULL,

    FOREIGN KEY (project_name)
        REFERENCES Project(name)
        ON DELETE CASCADE,

    PRIMARY KEY (project_name, version_number)
);

------------------------------------------------------------  
CREATE TABLE Purchase (
    order_number  VARCHAR PRIMARY KEY,
    price         DECIMAL(10,2) NOT NULL,
    tracking_code VARCHAR,
    date_placed   DATE NOT NULL,
    delivery_date DATE,

    supplier      VARCHAR NOT NULL,
    courier       VARCHAR,      
    
    FOREIGN KEY (supplier)
        REFERENCES Supplier(name)
        ON DELETE SET NULL,

    FOREIGN KEY (courier)
        REFERENCES Courier(name)
        ON DELETE SET NULL
);

CREATE TABLE PurchaseIncludes (
    order_number VARCHAR,
    part_num VARCHAR,

    FOREIGN KEY (order_number)
        REFERENCES Purchase(order_number)
        ON DELETE NO ACTION,

    FOREIGN KEY (part_num)
        REFERENCES Component(part_num)
        ON DELETE NO ACTION
        ON UPDATE CASCADE,

    PRIMARY KEY (order_number, part_num)
);

------------------------------------------------------------  
CREATE TABLE Includes (
    project_name       VARCHAR,
    component_part_num VARCHAR,
    quantity           VARCHAR NOT NULL,

    PRIMARY KEY (project_name, component_part_num),

    FOREIGN KEY (project_name)
        REFERENCES Project(name)
        ON DELETE CASCADE,

    FOREIGN KEY (component_part_num) 
        REFERENCES Component(part_num)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE Makes (
    project_name VARCHAR,
    username     VARCHAR,

    PRIMARY KEY (project_name, username),

    FOREIGN KEY (project_name)
        REFERENCES Project(name)
        ON DELETE CASCADE,

    FOREIGN KEY (username) 
        REFERENCES Users(username)
        ON DELETE CASCADE
);

-- INSERT TUPLES

-- Users --
INSERT INTO Users (username, password, email, real_name) VALUES 
('d5v6x', 'password123', 'dtang08@student.ubc.ca', 'Dorson Tang'),
('w6i9k', 'vimislife', 'jwrigh13@student.ubc.ca', 'Julian Wright'),
('g8a8b', '67rizzking', 'garchakri@gmail.com', 'Krishna Garcha'),
('daGOATprof', 'password123', 'example@replacement.com', 'Ivan Beschastnikh'),
('sigmamale', 'grindset', 'idontbelieveinemails@fake.iop', 'Elon Musk');

-- Location --
INSERT INTO Location (storage_name, position, facility, type, label, last_updated) VALUES 
('resistors', 'row1_col1', 'workshop', 'bin', 'Resistors', '2026-03-06 10:00:00'),
('capacitors', 'row1_col2', 'workshop', 'bin', 'Capacitors', '2026-03-06 10:00:00'),
('projects', 'cabinet1_shelf3', 'storage_room', 'shelf', 'Projects Storage', '2026-03-06 10:00:00'),
('large', 'drawer1', 'home', 'drawer', 'Larger Items', '2026-03-06 10:00:00'),
('miscellaneous', 'cabinet2_shelf2', 'storage_room', 'shelf', 'Unsorted Electronics', '2026-03-06 10:00:00');

-- Supplier --
INSERT INTO Supplier (name, url, country, contact_email) VALUES 
('digikey', 'https://www.digikey.ca', 'Canada', 'support@digikey.ca'),
('mouser', 'https://www.mouser.com', 'USA', 'support@mouser.com'),
('lcsc', 'https://www.lcsc.com', 'China', 'support@lcsc.com'),
('adafruit', 'https://www.adafruit.com', 'USA', 'support@adafruit.com'),
('farnell', 'https://www.farnell.com', 'UK', 'support@farnell.com');

-- Project --
INSERT INTO Project (name, created_at, purpose, last_updated, storage_name, position, facility) VALUES 
('soccer_bot', '2026-03-06 10:00:00', 'Miniture soccer playing robot', '2026-03-06 10:00:00', 'projects', 'cabinet1_shelf3', 'storage_room'),
('sub_bot', '2026-03-06 10:00:00', 'AUV for Robosub 2026', '2026-03-06 10:00:00', 'projects', 'cabinet1_shelf3', 'storage_room'),
('temperature_reader', '2026-03-06 10:00:00', 'Project that can display the temperature and humidity', '2026-03-06 10:00:00', 'projects', 'cabinet1_shelf3', 'storage_room'),
('sanitizer_dispenser', '2026-03-06 10:00:00', 'Automatic hand sanitizer dispenser that uses ultrasonic sensors', '2026-03-06 10:00:00', 'projects', 'cabinet1_shelf3', 'storage_room'),
('humanoid_robot', '2026-03-06 10:00:00', 'Creating life', '2026-03-06 10:00:00', 'projects', 'cabinet1_shelf3', 'storage_room');

-- Component --
INSERT INTO Component (part_num, price, name, package, tolerance, quantity, voltage_rating, additional, storage_name, position, facility, supplier_name) VALUES 
('CAP-100NF', 0.10, '100nF Capacitor', 'all', 0.100000, 200, 50.0000, '{"quality": "good"}', 'capacitors', 'row1_col2', 'workshop', 'digikey'),
('CAP-10UF', 0.13, '10uF Capacitor', 'all', 0.200000, 50, 25.0000, '{}', 'capacitors', 'row1_col2', 'workshop', 'farnell'),
('RES-10K', 0.50, '10k Resistor', 'all', 0.010000, 500, 50.0000, '{}', 'resistors', 'row1_col1', 'workshop', 'lcsc'),
('RES-1K', 0.12, '1k Resistor', 'all', 0.010000, 300, 50.0000, '{}', 'resistors', 'row1_col1', 'workshop', 'lcsc'),
('DIO-1N4148', 0.19, 'Diode', 'all', 0.010000, 100, 100.0000, '{}', 'miscellaneous', 'cabinet2_shelf2', 'storage_room', 'mouser');

-- Capacitor --
INSERT INTO Capacitor (temp_coeff, type, capacitance, part_num) VALUES 
('X7R', 'Ceramic', 0.1000, 'CAP-100NF'),
('X5R', 'Electrolytic', 10.0000, 'CAP-10UF');

-- Resistor --
INSERT INTO Resistor (composition, resistance, power, part_num) VALUES 
('Thick Film', 9999, '0.1W', 'RES-10K'),
('Thick Film', 1000, '0.1W', 'RES-1K');

-- Diode --
INSERT INTO Diode (dcapacitance, vforward, vreverse, part_num) VALUES 
(4.0000, 1.0000, 100.0000, 'DIO-1N4148');

-- Courier --
INSERT INTO Courier (name, code_format, website, contact_email) VALUES 
('federal_express_corporation', 'FedEx', 'https://www.fedex.com', 'support@fedex.com'),
('united_parcel_service', 'UPS', 'https://www.ups.com', 'support@ups.com'),
('dhl', 'DHL', 'https://www.dhl.com', 'support@dhl.com'),
('united_states_postal_service', 'USPS', 'https://www.usps.com', 'support@usps.com'),
('canada_post', 'Canada Post', 'https://www.canadapost.ca', 'support@canadapost.ca');

-- Version --
INSERT INTO Version (version_number, title, date, snapshot, created_by, project_name) VALUES 
('v1.0.0', 'Created Triton', '2026-03-06 10:00:00', '{"status": "stable"}', 'd5v6x', 'sub_bot'),
('v1.1.0', 'Added joystick controls', '2026-03-06 10:00:00', '{"status": "stable"}', 'w6i9k', 'soccer_bot'),
('v0.1.0', 'Created Steelhead', '2026-03-06 10:00:00', '{"status": "testing"}', 'g8a8b', 'sub_bot'),
('v2.0.0', 'Added humifity', '2026-03-06 10:00:00', '{"status": "released"}', 'daGOATprof', 'temperature_reader'),
('v0.0.1', 'Morality test', '2026-03-06 10:00:00', '{"status": "testing"}', 'sigmamale', 'humanoid_robot');

-- Purchase --
INSERT INTO Purchase (order_number, price, tracking_code, date_placed, delivery_date, supplier, courier) VALUES 
('1', 150.50, '123456789', '2026-03-06 10:00:00', '2026-03-06 10:00:01', 'digikey', 'federal_express_corporation'),
('2', 45.20, '9999999999999999', '2026-03-06 10:00:00', '2026-03-06 10:00:01', 'mouser', 'united_parcel_service'),
('3', 210.00, '987654321', '2026-03-06 10:00:00', '2026-03-06 10:00:01', 'lcsc', 'dhl'),
('4', 12.99, '22222222222222222', '2026-03-06 10:00:00', '2026-03-06 10:00:01', 'adafruit', 'united_states_postal_service'),
('5', 88.00, 'ABC123321CBA', '2026-03-06 10:00:00', '2026-03-06 10:00:01', 'farnell', 'canada_post');

-- PurchaseIncludes --
INSERT INTO PurchaseIncludes (order_number, part_num) VALUES
('1', 'CAP-100NF'),
('1', 'CAP-10UF'),
('1', 'RES-10K'),
('2', 'RES-1K'),
('2', 'DIO-1N4148');

-- Includes --
INSERT INTO Includes (project_name, component_part_num, quantity) VALUES 
('sub_bot', 'RES-10K', '10'),
('sub_bot', 'CAP-100NF', '5'),
('sub_bot', 'RES-1K', '3'),
('sub_bot', 'DIO-1N4148', '1'),
('soccer_bot', 'RES-1K', '20'),
('humanoid_robot', 'CAP-10UF', '4'),
('sanitizer_dispenser', 'DIO-1N4148', '2');

-- Makes --
INSERT INTO Makes (project_name, username) VALUES 
('sub_bot', 'd5v6x'),
('sub_bot', 'g8a8b'),
('humanoid_robot', 'sigmamale'),
('soccer_bot', 'w6i9k'),
('sanitizer_dispenser', 'w6i9k');

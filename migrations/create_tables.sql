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
);

CREATE TABLE Resistor (
    composition VARCHAR,
    resistance  DECIMAL(16,4) NOT NULL,
    power       VARCHAR,

    part_num    VARCHAR PRIMARY KEY,

    FOREIGN KEY (part_num)
        REFERENCES Component(part_num)
        ON DELETE CASCADE
);

CREATE TABLE Diode (
    capacitance DECIMAL(16,4),
    vforward    DECIMAL(16,4) NOT NULL,
    vreverse    DECIMAL(16,4) NOT NULL,

    part_num    VARCHAR PRIMARY KEY,

    FOREIGN KEY (part_num)
        REFERENCES Component(part_num)
        ON DELETE CASCADE
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
        ON DELETE NO ACTION,

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

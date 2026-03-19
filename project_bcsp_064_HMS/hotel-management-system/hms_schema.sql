-- ==============================================================================
-- HOTEL MANAGEMENT SYSTEM DATABASE SCHEMA (FINAL VERIFIED VERSION)
-- Enrollment Number: 2351051132
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS hotel_management_db;
USE hotel_management_db;

-- ==============================================================================
-- 1. Guests Table
-- ==============================================================================

CREATE TABLE Guests (
    GuestID INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    Email VARCHAR(255) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Phone VARCHAR(15),
    RegistrationDate DATE NOT NULL,
    Address TEXT,
    
    CHECK (LENGTH(FirstName) >= 2),
    CHECK (LENGTH(LastName) >= 2)
);

-- ==============================================================================
-- 2. Room_Types Table
-- ==============================================================================

CREATE TABLE Room_Types (
    RoomTypeID INT AUTO_INCREMENT PRIMARY KEY,
    TypeName VARCHAR(255) NOT NULL UNIQUE,
    Description TEXT,
    PricePerNight DECIMAL(10,2) NOT NULL CHECK (PricePerNight > 0),
    Amenities TEXT,
    MaxOccupancy INT NOT NULL DEFAULT 2 CHECK (MaxOccupancy > 0),
    TotalRooms INT NOT NULL DEFAULT 1 CHECK (TotalRooms >= 0),
    ImageURL VARCHAR(255)
);

-- ==============================================================================
-- 3. Rooms Table
-- ==============================================================================

CREATE TABLE Rooms (
    RoomID INT AUTO_INCREMENT PRIMARY KEY,
    RoomNumber VARCHAR(10) NOT NULL UNIQUE,
    RoomTypeID INT,
    Status ENUM('Available','Occupied','Cleaning','OutOfOrder') 
           NOT NULL DEFAULT 'Available',

    FOREIGN KEY (RoomTypeID)
        REFERENCES Room_Types(RoomTypeID)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- ==============================================================================
-- 4. Staff Table
-- ==============================================================================

CREATE TABLE Staff (
    StaffID INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    Email VARCHAR(255) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Role ENUM('Receptionist','Manager') NOT NULL,
    CreatedDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE
);

-- ==============================================================================
-- 5. Bookings Table
-- ==============================================================================

CREATE TABLE Bookings (
    BookingID INT AUTO_INCREMENT PRIMARY KEY,
    RoomID INT,
    GuestID INT NOT NULL,
    CheckInDate DATETIME NOT NULL,
    CheckOutDate DATETIME NOT NULL,
    ActualCheckIn DATETIME,
    ActualCheckOut DATETIME,
    Status ENUM('Reserved','CheckedIn','CheckedOut','Cancelled','Confirmed') 
           NOT NULL DEFAULT 'Reserved',

    CHECK (CheckOutDate > CheckInDate),

    FOREIGN KEY (RoomID)
        REFERENCES Rooms(RoomID)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    FOREIGN KEY (GuestID)
        REFERENCES Guests(GuestID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- ==============================================================================
-- 6. Bills Table
-- ==============================================================================

CREATE TABLE Bills (
    BillID INT AUTO_INCREMENT PRIMARY KEY,
    BookingID INT NOT NULL,
    GuestID INT NOT NULL,
    TotalAmount DECIMAL(10,2) NOT NULL CHECK (TotalAmount >= 0),
    Status ENUM('Pending','Paid') NOT NULL DEFAULT 'Pending',
    GeneratedDate DATETIME NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (BookingID)
        REFERENCES Bookings(BookingID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    FOREIGN KEY (GuestID)
        REFERENCES Guests(GuestID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- ==============================================================================
-- 7. Services Table
-- ==============================================================================

CREATE TABLE Services (
    ServiceID INT AUTO_INCREMENT PRIMARY KEY,
    BookingID INT NOT NULL,
    ServiceName VARCHAR(100) NOT NULL,
    Charge DECIMAL(10,2) NOT NULL CHECK (Charge >= 0),
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (BookingID)
        REFERENCES Bookings(BookingID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- ==============================================================================
-- 8. Room Status History Table (Audit Trail)
-- ==============================================================================

CREATE TABLE RoomStatusHistory (
    StatusHistoryID INT AUTO_INCREMENT PRIMARY KEY,
    RoomID INT NOT NULL,
    OldStatus ENUM('Available','Occupied','Cleaning','OutOfOrder'),
    NewStatus ENUM('Available','Occupied','Cleaning','OutOfOrder') NOT NULL,
    ChangedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Reason VARCHAR(255),

    FOREIGN KEY (RoomID)
        REFERENCES Rooms(RoomID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- ==============================================================================
-- PERFORMANCE INDEXES
-- ==============================================================================

CREATE INDEX idx_guest_email ON Guests(Email);
CREATE INDEX idx_booking_guest ON Bookings(GuestID);
CREATE INDEX idx_booking_dates ON Bookings(CheckInDate, CheckOutDate);
CREATE INDEX idx_room_status ON Rooms(Status);
CREATE INDEX idx_bill_status ON Bills(Status);
CREATE INDEX idx_bill_booking ON Bills(BookingID);
CREATE INDEX idx_room_status_history ON RoomStatusHistory(RoomID);
CREATE INDEX idx_staff_active ON Staff(IsActive);

-- ==============================================================================
-- END OF FINAL VERIFIED SCHEMA
-- ==============================================================================

-- ==============================================================================
-- HOTEL MANAGEMENT SYSTEM - SAMPLE DATA 
-- ==============================================================================

USE hotel_management_db;

-- ------------------------------------------------------------------------------
-- 1. Insert Guests
-- ------------------------------------------------------------------------------
INSERT INTO Guests (FirstName, LastName, Email, PasswordHash, Phone, RegistrationDate, Address) 
VALUES 
('Rahul', 'Sharma', 'rahul.sharma@example.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjIQG81111', '9876543210', '2023-11-15', '123 MG Road, Indore, MP'),
('Priya', 'Patel', 'priya.patel@example.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjIQG82222', '9123456780', '2024-01-20', '45 Arera Colony, Bhopal, MP'),
('Vikram', 'Singh', 'vikram.singh@example.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjIQG83333', '9988776655', '2024-02-10', '78 Civil Lines, Jabalpur, MP');

-- ------------------------------------------------------------------------------
-- 2. Insert Room Types
-- ------------------------------------------------------------------------------
INSERT INTO Room_Types (TypeName, Description, PricePerNight, Amenities, MaxOccupancy, TotalRooms, ImageURL) 
VALUES 
('Standard Room', 'A comfortable basic room with essential amenities.', 1500.00, '{"wifi": true, "ac": true, "tv": false}', 2, 10, '/images/standard.jpg'),
('Deluxe Room', 'A spacious room with city views and premium bedding.', 2500.00, '{"wifi": true, "ac": true, "tv": true, "minibar": true}', 3, 5, '/images/deluxe.jpg'),
('Executive Suite', 'A luxurious suite featuring a separate living area and Jacuzzi.', 5500.00, '{"wifi": true, "ac": true, "tv": true, "minibar": true, "jacuzzi": true}', 4, 2, '/images/suite.jpg');

-- ------------------------------------------------------------------------------
-- 3. Insert Rooms (Linking to Room_Types)
-- ------------------------------------------------------------------------------
INSERT INTO Rooms (RoomNumber, RoomTypeID, Status) 
VALUES 
('101', 1, 'Available'),
('102', 1, 'Occupied'),
('103', 1, 'Cleaning'),
('201', 2, 'Available'),
('202', 2, 'Occupied'),
('301', 3, 'Available');

-- ------------------------------------------------------------------------------
-- 4. Insert Staff
-- ------------------------------------------------------------------------------
INSERT INTO Staff (FirstName, LastName, Email, PasswordHash, Role) 
VALUES 
('Amodit', 'Jha', 'admin@hotel.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjIQG84444', 'Manager'),
('Neha', 'Gupta', 'reception@hotel.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjIQG85555', 'Receptionist');

-- ------------------------------------------------------------------------------
-- 5. Insert Bookings (Linking Guests and Rooms)
-- ------------------------------------------------------------------------------
INSERT INTO Bookings (RoomID, GuestID, CheckInDate, CheckOutDate, ActualCheckIn, ActualCheckOut, Status) 
VALUES 
-- A past booking that is fully checked out
(4, 2, '2024-02-01 14:00:00', '2024-02-04 11:00:00', '2024-02-01 14:15:00', '2024-02-04 10:30:00', 'CheckedOut'),

-- A current ongoing booking (Guest is currently in Room 102)
(2, 1, '2024-03-10 14:00:00', '2024-03-15 11:00:00', '2024-03-10 15:00:00', NULL, 'CheckedIn'),

-- A future reservation (Room not yet assigned, hence RoomID can be NULL or pre-assigned)
(5, 3, '2024-04-20 14:00:00', '2024-04-25 11:00:00', NULL, NULL, 'Confirmed');

-- ------------------------------------------------------------------------------
-- 6. Insert Services (Extra charges tied to Bookings)
-- ------------------------------------------------------------------------------
INSERT INTO Services (BookingID, ServiceName, Charge) 
VALUES 
(1, 'Room Service - Dinner', 850.00),
(1, 'Laundry Service', 300.00),
(2, 'Mini-bar Usage', 450.00);

-- ------------------------------------------------------------------------------
-- 7. Insert Bills (Tied to completed or ongoing bookings)
-- ------------------------------------------------------------------------------
INSERT INTO Bills (BookingID, GuestID, TotalAmount, Status, GeneratedDate) 
VALUES 
-- Bill for the completed booking (3 nights @ 2500 + 850 + 300)
(1, 2, 8650.00, 'Paid', '2024-02-04 10:35:00'),

-- Pending bill for the ongoing booking (calculated so far: 5 nights @ 1500 + 450)
(2, 1, 7950.00, 'Pending', '2024-03-14 08:00:00');

-- ==============================================================================
-- End of Sample Data
-- ==============================================================================
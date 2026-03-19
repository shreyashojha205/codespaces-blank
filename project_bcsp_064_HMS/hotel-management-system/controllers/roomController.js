const { query } = require('../config/db');

/**
 * Search available rooms by date range and optionally by room type.
 * Uses overlap logic to exclude already booked rooms.
 */
const searchRooms = async (req, res, next) => {
  try {
    const { checkInDate, checkOutDate, roomTypeId } = req.query;

    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        error: { message: 'checkInDate and checkOutDate are required' },
      });
    }

    const params = [checkInDate, checkOutDate];
    let roomTypeFilter = '';
    if (roomTypeId) {
      roomTypeFilter = 'AND r.RoomTypeID = ?';
      params.push(roomTypeId);
    }

    const sql = `
      SELECT
        r.RoomID,
        r.RoomNumber,
        r.Status,
        rt.RoomTypeID,
        rt.TypeName,
        rt.PricePerNight,
        rt.MaxOccupancy,
        rt.Amenities,
        rt.Description
      FROM Rooms r
      JOIN Room_Types rt ON r.RoomTypeID = rt.RoomTypeID
      WHERE r.Status = 'Available'
        ${roomTypeFilter}
        AND r.RoomID NOT IN (
          SELECT b.RoomID
          FROM Bookings b
          WHERE b.RoomID IS NOT NULL
            AND b.Status IN ('Reserved','Confirmed','CheckedIn')
            AND ( ? < b.CheckOutDate AND ? > b.CheckInDate )
        )
    `;

    const rooms = await query(sql, params);

    return res.json({ success: true, data: rooms });
  } catch (err) {
    return next(err);
  }
};

/**
 * Manager-only: CRUD for room types and rooms
 */
const listRoomTypes = async (req, res, next) => {
  try {
    const roomTypes = await query('SELECT * FROM Room_Types');
    return res.json({ success: true, data: roomTypes });
  } catch (err) {
    return next(err);
  }
};

const createRoomType = async (req, res, next) => {
  try {
    const { typeName, description, pricePerNight, amenities, maxOccupancy, totalRooms, imageURL } = req.body;

    if (!typeName || !pricePerNight) {
      return res.status(400).json({ success: false, error: { message: 'typeName and pricePerNight are required' } });
    }

    const result = await query(
      'INSERT INTO Room_Types (TypeName, Description, PricePerNight, Amenities, MaxOccupancy, TotalRooms, ImageURL) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [typeName, description || null, pricePerNight, amenities || null, maxOccupancy || 1, totalRooms || 1, imageURL || null]
    );

    const created = await query('SELECT * FROM Room_Types WHERE RoomTypeID = ?', [result.insertId]);
    return res.status(201).json({ success: true, data: created[0] });
  } catch (err) {
    return next(err);
  }
};

const updateRoomType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { typeName, description, pricePerNight, amenities, maxOccupancy, totalRooms, imageURL } = req.body;

    const existing = await query('SELECT * FROM Room_Types WHERE RoomTypeID = ?', [id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, error: { message: 'Room type not found' } });
    }

    await query(
      `UPDATE Room_Types SET
      TypeName = COALESCE(?, TypeName),
      Description = COALESCE(?, Description),
      PricePerNight = COALESCE(?, PricePerNight),
      Amenities = COALESCE(?, Amenities),
      MaxOccupancy = COALESCE(?, MaxOccupancy),
      TotalRooms = COALESCE(?, TotalRooms),
      ImageURL = COALESCE(?, ImageURL)
      WHERE RoomTypeID = ?`,
      [typeName, description, pricePerNight, amenities, maxOccupancy, totalRooms, imageURL, id]
    );

    const updated = await query('SELECT * FROM Room_Types WHERE RoomTypeID = ?', [id]);
    return res.json({ success: true, data: updated[0] });
  } catch (err) {
    return next(err);
  }
};

const deleteRoomType = async (req, res, next) => {
  try {
    const { id } = req.params;

    await query('DELETE FROM Room_Types WHERE RoomTypeID = ?', [id]);
    return res.json({ success: true, data: { message: 'Room type deleted' } });
  } catch (err) {
    return next(err);
  }
};

const listRooms = async (req, res, next) => {
  try {
    const rooms = await query(
      `SELECT r.*, rt.TypeName, rt.PricePerNight, rt.MaxOccupancy
      FROM Rooms r
      LEFT JOIN Room_Types rt ON r.RoomTypeID = rt.RoomTypeID`
    );
    return res.json({ success: true, data: rooms });
  } catch (err) {
    return next(err);
  }
};

const createRoom = async (req, res, next) => {
  try {
    const { roomNumber, roomTypeId, status } = req.body;
    if (!roomNumber) {
      return res.status(400).json({ success: false, error: { message: 'roomNumber is required' } });
    }

    const result = await query(
      'INSERT INTO Rooms (RoomNumber, RoomTypeID, Status) VALUES (?, ?, ?)',
      [roomNumber, roomTypeId || null, status || 'Available']
    );

    const created = await query('SELECT * FROM Rooms WHERE RoomID = ?', [result.insertId]);
    return res.status(201).json({ success: true, data: created[0] });
  } catch (err) {
    return next(err);
  }
};

const updateRoom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { roomNumber, roomTypeId, status } = req.body;

    const existing = await query('SELECT * FROM Rooms WHERE RoomID = ?', [id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, error: { message: 'Room not found' } });
    }

    await query(
      `UPDATE Rooms SET
      RoomNumber = COALESCE(?, RoomNumber),
      RoomTypeID = COALESCE(?, RoomTypeID),
      Status = COALESCE(?, Status)
      WHERE RoomID = ?`,
      [roomNumber, roomTypeId, status, id]
    );

    const updated = await query('SELECT * FROM Rooms WHERE RoomID = ?', [id]);
    return res.json({ success: true, data: updated[0] });
  } catch (err) {
    return next(err);
  }
};

const deleteRoom = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM Rooms WHERE RoomID = ?', [id]);
    return res.json({ success: true, data: { message: 'Room deleted' } });
  } catch (err) {
    return next(err);
  }
};

const updateRoomStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: { message: 'status is required' } });
    }

    await query('UPDATE Rooms SET Status = ? WHERE RoomID = ?', [status, id]);
    const updated = await query('SELECT * FROM Rooms WHERE RoomID = ?', [id]);
    return res.json({ success: true, data: updated[0] });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  searchRooms,
  listRoomTypes,
  createRoomType,
  updateRoomType,
  deleteRoomType,
  listRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  updateRoomStatus,
};

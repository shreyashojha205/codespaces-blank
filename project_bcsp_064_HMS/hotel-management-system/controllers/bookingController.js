const { getConnection, query } = require('../config/db');

const createBooking = async (req, res, next) => {
  const { roomId, guestId, checkInDate, checkOutDate, status } = req.body;

  if (!guestId || !checkInDate || !checkOutDate) {
    return res.status(400).json({
      success: false,
      error: { message: 'guestId, checkInDate and checkOutDate are required' },
    });
  }

  const connection = await getConnection();
  try {
    await connection.beginTransaction();

    if (roomId) {
      // lock the room row for update to avoid races
      const [roomRows] = await connection.execute('SELECT * FROM Rooms WHERE RoomID = ? FOR UPDATE', [roomId]);
      if (!roomRows.length) {
        await connection.rollback();
        return res.status(404).json({ success: false, error: { message: 'Room not found' } });
      }

      const [overlaps] = await connection.execute(
        `SELECT BookingID
         FROM Bookings
         WHERE RoomID = ?
           AND Status IN ('Reserved','Confirmed','CheckedIn')
           AND ( ? < CheckOutDate AND ? > CheckInDate )
         FOR UPDATE`,
        [roomId, checkInDate, checkOutDate]
      );

      if (overlaps.length) {
        await connection.rollback();
        return res.status(409).json({
          success: false,
          error: { message: 'Selected room is already booked for the chosen dates' },
        });
      }
    }

    const [result] = await connection.execute(
      `INSERT INTO Bookings (RoomID, GuestID, CheckInDate, CheckOutDate, Status)
       VALUES (?, ?, ?, ?, ?)`,
      [roomId || null, guestId, checkInDate, checkOutDate, status || 'Reserved']
    );

    await connection.commit();

    const booking = await query('SELECT * FROM Bookings WHERE BookingID = ?', [result.insertId]);
    return res.status(201).json({ success: true, data: booking[0] });
  } catch (err) {
    await connection.rollback();
    return next(err);
  } finally {
    connection.release();
  }
};

const checkIn = async (req, res, next) => {
  const { id } = req.params;
  const connection = await getConnection();
  try {
    await connection.beginTransaction();

    const [bookings] = await connection.execute(
      'SELECT * FROM Bookings WHERE BookingID = ? FOR UPDATE',
      [id]
    );
    if (!bookings.length) {
      await connection.rollback();
      return res.status(404).json({ success: false, error: { message: 'Booking not found' } });
    }

    const booking = bookings[0];
    if (booking.Status !== 'Reserved' && booking.Status !== 'Confirmed') {
      await connection.rollback();
      return res.status(400).json({ success: false, error: { message: 'Booking is not in a state that can be checked in' } });
    }

    const now = new Date();

    await connection.execute(
      `UPDATE Bookings
       SET ActualCheckIn = ?, Status = 'CheckedIn'
       WHERE BookingID = ?`,
      [now, id]
    );

    if (booking.RoomID) {
      await connection.execute('UPDATE Rooms SET Status = ? WHERE RoomID = ?', ['Occupied', booking.RoomID]);
    }

    await connection.commit();

    const updated = await query('SELECT * FROM Bookings WHERE BookingID = ?', [id]);
    return res.json({ success: true, data: updated[0] });
  } catch (err) {
    await connection.rollback();
    return next(err);
  } finally {
    connection.release();
  }
};

const checkOut = async (req, res, next) => {
  const { id } = req.params;
  const connection = await getConnection();
  try {
    await connection.beginTransaction();

    const [bookings] = await connection.execute(
      'SELECT * FROM Bookings WHERE BookingID = ? FOR UPDATE',
      [id]
    );
    if (!bookings.length) {
      await connection.rollback();
      return res.status(404).json({ success: false, error: { message: 'Booking not found' } });
    }

    const booking = bookings[0];
    if (booking.Status !== 'CheckedIn') {
      await connection.rollback();
      return res.status(400).json({ success: false, error: { message: 'Booking is not currently checked in' } });
    }

    const now = new Date();

    await connection.execute(
      `UPDATE Bookings
       SET ActualCheckOut = ?, Status = 'CheckedOut'
       WHERE BookingID = ?`,
      [now, id]
    );

    if (booking.RoomID) {
      await connection.execute('UPDATE Rooms SET Status = ? WHERE RoomID = ?', ['Available', booking.RoomID]);
    }

    await connection.commit();

    const updated = await query('SELECT * FROM Bookings WHERE BookingID = ?', [id]);
    return res.json({ success: true, data: updated[0] });
  } catch (err) {
    await connection.rollback();
    return next(err);
  } finally {
    connection.release();
  }
};

const listBookings = async (req, res, next) => {
  try {
    const bookings = await query(
      `SELECT b.*, g.FirstName AS GuestFirstName, g.LastName AS GuestLastName,
              r.RoomNumber, rt.TypeName as RoomType
       FROM Bookings b
       LEFT JOIN Guests g ON g.GuestID = b.GuestID
       LEFT JOIN Rooms r ON r.RoomID = b.RoomID
       LEFT JOIN Room_Types rt ON rt.RoomTypeID = r.RoomTypeID
       ORDER BY b.CheckInDate DESC`
    );

    return res.json({ success: true, data: bookings });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createBooking,
  checkIn,
  checkOut,
  listBookings,
};

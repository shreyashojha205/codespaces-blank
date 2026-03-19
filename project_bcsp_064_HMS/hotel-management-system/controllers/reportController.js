const { query } = require('../config/db');

const occupancyReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: { message: 'startDate and endDate are required in YYYY-MM-DD format' },
      });
    }

    const totalRoomsResult = await query('SELECT COUNT(*) AS total FROM Rooms');
    const totalRooms = totalRoomsResult[0].total || 0;

    const occupancyByStatus = await query(
      `SELECT r.Status, COUNT(*) AS count
       FROM Rooms r
       GROUP BY r.Status`
    );

    const occupiedResult = await query(
      `SELECT COUNT(DISTINCT r.RoomID) AS occupied
       FROM Rooms r
       JOIN Bookings b ON b.RoomID = r.RoomID
       WHERE b.Status IN ('CheckedIn','Confirmed','Reserved')
         AND ( ? < b.CheckOutDate AND ? > b.CheckInDate )`,
      [startDate, endDate]
    );

    const occupied = occupiedResult[0].occupied || 0;
    const occupancyRate = totalRooms ? parseFloat(((occupied / totalRooms) * 100).toFixed(2)) : 0;

    return res.json({
      success: true,
      data: {
        totalRooms,
        occupied,
        occupancyRate,
        occupancyByStatus,
        period: { startDate, endDate },
      },
    });
  } catch (err) {
    return next(err);
  }
};

const revenueReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: { message: 'startDate and endDate are required in YYYY-MM-DD format' },
      });
    }

    const revenue = await query(
      `SELECT SUM(TotalAmount) AS revenue
       FROM Bills
       WHERE GeneratedDate BETWEEN ? AND ?`,
      [startDate, endDate]
    );

    return res.json({ success: true, data: { revenue: parseFloat(revenue[0].revenue || 0) } });
  } catch (err) {
    return next(err);
  }
};

const pendingBills = async (req, res, next) => {
  try {
    const bills = await query(
      `SELECT b.*, g.FirstName AS GuestFirstName, g.LastName AS GuestLastName
       FROM Bills b
       LEFT JOIN Guests g ON g.GuestID = b.GuestID
       WHERE b.Status = 'Pending'
       ORDER BY b.GeneratedDate DESC`
    );

    return res.json({ success: true, data: bills });
  } catch (err) {
    return next(err);
  }
};

const popularRoomTypes = async (req, res, next) => {
  try {
    const results = await query(
      `SELECT rt.RoomTypeID, rt.TypeName, COUNT(b.BookingID) AS bookings
       FROM Room_Types rt
       LEFT JOIN Rooms r ON r.RoomTypeID = rt.RoomTypeID
       LEFT JOIN Bookings b ON b.RoomID = r.RoomID
       GROUP BY rt.RoomTypeID
       ORDER BY bookings DESC
       LIMIT 10`
    );

    return res.json({ success: true, data: results });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  occupancyReport,
  revenueReport,
  pendingBills,
  popularRoomTypes,
};

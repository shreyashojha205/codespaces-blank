const { query } = require('../config/db');

const calculateBilling = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const bookings = await query(
      `SELECT b.*, r.RoomID, r.RoomNumber, rt.PricePerNight
       FROM Bookings b
       LEFT JOIN Rooms r ON r.RoomID = b.RoomID
       LEFT JOIN Room_Types rt ON rt.RoomTypeID = r.RoomTypeID
       WHERE b.BookingID = ?`,
      [bookingId]
    );

    if (!bookings.length) {
      return res.status(404).json({ success: false, error: { message: 'Booking not found' } });
    }

    const booking = bookings[0];

    const services = await query('SELECT SUM(Charge) AS total FROM Services WHERE BookingID = ?', [bookingId]);
    const serviceCharges = parseFloat(services[0].total || 0);

    const checkIn = new Date(booking.CheckInDate);
    const checkOut = new Date(booking.CheckOutDate);
    const msPerDay = 24 * 60 * 60 * 1000;
    const nights = Math.max(1, Math.ceil((checkOut - checkIn) / msPerDay));

    const pricePerNight = parseFloat(booking.PricePerNight || 0);
    const roomCharges = nights * pricePerNight;

    const subTotal = roomCharges + serviceCharges;
    const tax = parseFloat((subTotal * 0.18).toFixed(2));
    const totalAmount = parseFloat((subTotal + tax).toFixed(2));

    // Insert or update bill
    const existing = await query('SELECT * FROM Bills WHERE BookingID = ?', [bookingId]);
    if (existing.length) {
      await query(
        `UPDATE Bills SET TotalAmount = ?, UpdatedAt = CURRENT_TIMESTAMP WHERE BookingID = ?`,
        [totalAmount, bookingId]
      );
    } else {
      await query(
        `INSERT INTO Bills (BookingID, GuestID, TotalAmount, Status, GeneratedDate)
         VALUES (?, ?, ?, 'Pending', CURRENT_TIMESTAMP)`,
        [bookingId, booking.GuestID, totalAmount]
      );
    }

    const bill = await query('SELECT * FROM Bills WHERE BookingID = ?', [bookingId]);

    return res.json({
      success: true,
      data: {
        booking: {
          bookingId,
          nights,
          roomCharges,
          serviceCharges,
          tax,
          totalAmount,
        },
        bill: bill[0],
      },
    });
  } catch (err) {
    return next(err);
  }
};

const getBills = async (req, res, next) => {
  try {
    const bills = await query(
      `SELECT b.*, g.FirstName AS GuestFirstName, g.LastName AS GuestLastName, bk.CheckInDate, bk.CheckOutDate
       FROM Bills b
       LEFT JOIN Guests g ON g.GuestID = b.GuestID
       LEFT JOIN Bookings bk ON bk.BookingID = b.BookingID
       ORDER BY b.GeneratedDate DESC`
    );
    return res.json({ success: true, data: bills });
  } catch (err) {
    return next(err);
  }
};

const payBill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [billRows] = await query('SELECT * FROM Bills WHERE BillID = ?', [id]);
    if (!billRows.length) {
      return res.status(404).json({ success: false, error: { message: 'Bill not found' } });
    }

    await query('UPDATE Bills SET Status = ?, UpdatedAt = CURRENT_TIMESTAMP WHERE BillID = ?', ['Paid', id]);

    const [updated] = await query('SELECT * FROM Bills WHERE BillID = ?', [id]);
    return res.json({ success: true, data: updated });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  calculateBilling,
  getBills,
  payBill,
};

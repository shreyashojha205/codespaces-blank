require('dotenv').config();
const { query } = require('./config/db');

(async () => {
  try {
    const guests = await query('SELECT * FROM Guests');
    console.log(`Found ${guests.length} guests in database! Connection is working.`);
    process.exit(0);
  } catch (err) {
    console.error('DB Connection Failed:', err);
    process.exit(1);
  }
})();

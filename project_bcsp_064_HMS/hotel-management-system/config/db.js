const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hotel_management_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true,
});

// Test DB Connection immediately on startup
pool.getConnection()
  .then((conn) => {
    // eslint-disable-next-line no-console
    console.log('✅ Successfully connected to the MySQL database.');
    conn.release();
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('\n❌ CRITICAL WARNING: Could not connect to the MySQL database.');
    // eslint-disable-next-line no-console
    console.error('   Please check your .env file or ensure MySQL is running.\n');
    // eslint-disable-next-line no-console
    console.error('   Original error:', err.message, '\n');
  });


/**
 * Run a single query using the pool.
 * This uses prepared statements to prevent SQL injection.
 */
const query = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};

/**
 * Acquire a connection to run a transactional series of statements.
 */
const getConnection = () => pool.getConnection();

module.exports = {
  pool,
  query,
  getConnection,
};

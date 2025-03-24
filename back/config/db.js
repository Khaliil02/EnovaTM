require('dotenv').config();
const { Pool } = require('pg');

// Load environment variables
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'enovatm',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
  
  // Connection pool optimization
  max: 20, // Maximum number of clients
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  
  // Connection retry logic
  retryCount: 3, // Try to reconnect 3 times
  retryDelayMs: 1000 // Wait 1 second between retries
};

const pool = new Pool(dbConfig);

// Add connection error handling
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

// Connection validation helper
const testConnection = async () => {
  let client;
  try {
    client = await pool.connect();
    console.log('Database connection successful');
    return true;
  } catch (err) {
    console.error('Database connection error:', err);
    return false;
  } finally {
    if (client) client.release();
  }
};

// Add a test query to check connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

// Make sure your exports look like this at the bottom:
module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  testConnection
};

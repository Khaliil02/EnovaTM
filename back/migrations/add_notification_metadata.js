const db = require('../config/db');

/**
 * Migration to add metadata column to the notifications table
 */
const migrate = async () => {
  try {
    console.log('Starting notification metadata migration...');
    
    // Check if metadata column already exists
    const checkColumnResult = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'notifications' 
      AND column_name = 'metadata'
    `);
    
    // Add metadata column if it doesn't exist
    if (checkColumnResult.rows.length === 0) {
      await db.query(`
        ALTER TABLE notifications
        ADD COLUMN metadata JSONB
      `);
      console.log('Added metadata column to notifications table');
    } else {
      console.log('Metadata column already exists in notifications table');
    }
    
    console.log('Notification metadata migration completed successfully');
  } catch (err) {
    console.error('Error during notification metadata migration:', err);
    throw err;
  }
};

// Export the migration function for use in server.js
module.exports = { migrate };
const db = require('../config/db');

const migrateUserPreferences = async () => {
  try {
    console.log('Starting user preferences migration...');
    
    // Check if preferences column exists
    const columnExists = await db.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'preferences'
    `);
    
    if (columnExists.rows.length === 0) {
      // Add preferences JSON column
      await db.query(`
        ALTER TABLE users
        ADD COLUMN preferences JSONB DEFAULT '{"theme": "light", "notifications_enabled": true, "email_notifications": false, "sound_enabled": true, "language": "en"}'
      `);
      console.log('Added preferences column to users table');
    } else {
      console.log('Preferences column already exists');
    }
    
    // Set default preferences for existing users
    await db.query(`
      UPDATE users
      SET preferences = '{"theme": "light", "notifications_enabled": true, "email_notifications": false, "sound_enabled": true, "language": "en"}'
      WHERE preferences IS NULL
    `);
    console.log('Set default preferences for users');
    
    console.log('User preferences migration completed successfully');
  } catch (error) {
    console.error('Error during user preferences migration:', error);
  }
};

// Run the migration
migrateUserPreferences();
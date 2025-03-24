-- Add clerk_user_id column to sysuser table
ALTER TABLE sysuser ADD COLUMN clerk_user_id VARCHAR(255) UNIQUE; 
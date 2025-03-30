-- Add nullable columns first for existing records
ALTER TABLE recipeorder ADD COLUMN createdat TIMESTAMP NULL;
ALTER TABLE recipeorder ADD COLUMN fulfilled BOOLEAN NULL;

-- Set default values for existing records
UPDATE recipeorder SET createdat = CURRENT_TIMESTAMP WHERE createdat IS NULL;
UPDATE recipeorder SET fulfilled = false WHERE fulfilled IS NULL;

-- Make columns NOT NULL with default values for future records
ALTER TABLE recipeorder ALTER COLUMN createdat SET NOT NULL;
ALTER TABLE recipeorder ALTER COLUMN createdat SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE recipeorder ALTER COLUMN fulfilled SET NOT NULL;
ALTER TABLE recipeorder ALTER COLUMN fulfilled SET DEFAULT false; 
-- Add contact_persons field to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS contact_persons JSONB;

-- Add comment for documentation
COMMENT ON COLUMN events.contact_persons IS 'Array of contact persons with name, phone, email fields';

-- Example structure:
-- [
--   {"name": "John Doe", "phone": "+1234567890", "email": "john@example.com"},
--   {"name": "Jane Smith", "phone": "+0987654321", "email": "jane@example.com"}
-- ]

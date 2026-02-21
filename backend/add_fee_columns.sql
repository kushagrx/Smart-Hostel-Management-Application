-- Add hostel_fee and mess_fee to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS hostel_fee DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS mess_fee DECIMAL(10, 2) DEFAULT 0;

-- Drop the existing constraint
ALTER TABLE cleaning_requests DROP CONSTRAINT IF EXISTS cleaning_requests_student_id_fkey;

-- Re-add with ON DELETE CASCADE
ALTER TABLE cleaning_requests
ADD CONSTRAINT cleaning_requests_student_id_fkey
FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;

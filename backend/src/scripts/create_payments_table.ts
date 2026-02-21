import { pool } from '../config/db';

const createTableQuery = `
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(255) NOT NULL,
    payment_id VARCHAR(255),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);
`;

async function createTable() {
    try {
        console.log('🚀 Creating payments table...');
        await pool.query(createTableQuery);
        console.log('✅ Payments table created successfully!');
    } catch (error) {
        console.error('❌ Error creating table:', error);
    } finally {
        pool.end();
    }
}

createTable();

import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import helmet from 'helmet';

dotenv.config();

import path from 'path';
import { query } from './config/db';
import analyticsRoutes from './routes/analytics';
import attendanceRoutes from './routes/attendanceRoutes';
import authRoutes from './routes/authRoutes';
import busRoutes from './routes/busRoutes';
import chatRoutes from './routes/chatRoutes';
import exportRoutes from './routes/exportRoutes';
import facilityRoutes from './routes/facilityRoutes';
import hostelRoutes from './routes/hostelRoutes';
import messAttendanceRoutes from './routes/messAttendanceRoutes';
import noticeRoutes from './routes/noticeRoutes';
import notificationRoutes from './routes/notificationRoutes';
import paymentRoutes from './routes/paymentRoutes';
import roomRoutes from './routes/roomRoutes';
import searchRoutes from './routes/searchRoutes';
import serviceRoutes from './routes/serviceRoutes';
import studentRoutes from './routes/studentRoutes';
import visitorRoutes from './routes/visitorRoutes';

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve Static Files (Profile Photos)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bus', busRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/hostel-info', hostelRoutes);
app.use('/api/mess', messAttendanceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/export', exportRoutes);

// Basic Route
app.get('/', (req: Request, res: Response) => {
    res.send('SmartStay API is running');
});

// Health Check
app.get('/health', async (req: Request, res: Response) => {
    try {
        await query('SELECT NOW()');
        res.json({ status: 'ok', database: 'connected' });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ status: 'error', database: 'disconnected', error: err.message });
    }
});

// Start Server
const startServer = async () => {
    try {
        console.log('Checking database schema...');
        await query(`
            ALTER TABLE students 
            ADD COLUMN IF NOT EXISTS last_notifications_cleared_at BIGINT DEFAULT 0;
            
            ALTER TABLE messages
            ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;
            
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT NOW(),
            ADD COLUMN IF NOT EXISTS push_token VARCHAR(255);
            
            CREATE TABLE IF NOT EXISTS visitors (
                id SERIAL PRIMARY KEY,
                student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
                visitor_name VARCHAR(255) NOT NULL,
                visitor_phone VARCHAR(15) NOT NULL,
                visitor_relation VARCHAR(100),
                purpose VARCHAR(500) NOT NULL,
                room_number VARCHAR(10) NOT NULL,
                expected_date DATE NOT NULL,
                expected_time_in TIME,
                expected_time_out TIME,
                status VARCHAR(20) DEFAULT 'pending',
                admin_remarks TEXT,
                approved_by INTEGER REFERENCES users(id),
                approved_at TIMESTAMP,
                checked_in_at TIMESTAMP,
                checked_out_at TIMESTAMP,
                visitor_photo TEXT,
                id_proof_type VARCHAR(50),
                id_proof_number VARCHAR(50),
                qr_code TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE INDEX IF NOT EXISTS idx_visitors_student ON visitors(student_id);
            CREATE INDEX IF NOT EXISTS idx_visitors_status ON visitors(status);
            CREATE INDEX IF NOT EXISTS idx_visitors_date ON visitors(expected_date);
            CREATE INDEX IF NOT EXISTS idx_visitors_room ON visitors(room_number);

            ALTER TABLE rooms 
            ADD COLUMN IF NOT EXISTS room_type VARCHAR(50),
            ADD COLUMN IF NOT EXISTS facilities JSONB DEFAULT '[]'::jsonb;

            -- New migrations for hostel_info and facilities
            ALTER TABLE hostel_info 
            ADD COLUMN IF NOT EXISTS name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS address TEXT,
            ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
            ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50),
            ADD COLUMN IF NOT EXISTS warden_name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS total_capacity INTEGER DEFAULT 100,
            ADD COLUMN IF NOT EXISTS subtitle VARCHAR(255),
            ADD COLUMN IF NOT EXISTS footer_text TEXT,
            ADD COLUMN IF NOT EXISTS location VARCHAR(255),
            ADD COLUMN IF NOT EXISTS image_url TEXT;

            -- Ensure default row for hostel_info
            INSERT INTO hostel_info (id, name, address, contact_email, contact_phone, warden_name, total_capacity)
            VALUES (1, 'Smart Hostel', 'Hostel Address', 'admin@example.com', '1234567890', 'Admin', 100)
            ON CONFLICT (id) DO NOTHING;

            ALTER TABLE facilities
            ADD COLUMN IF NOT EXISTS name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS title VARCHAR(255),
            ADD COLUMN IF NOT EXISTS image_url TEXT,
            ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb,
            ADD COLUMN IF NOT EXISTS icon VARCHAR(50) DEFAULT 'star',
            ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

            -- Sync name to title if title is null and name exists
            UPDATE facilities SET title = name WHERE title IS NULL AND name IS NOT NULL;
            -- Fallback for title if name is also null
            UPDATE facilities SET title = 'New Facility' WHERE title IS NULL;
        `);
        console.log('✅ Database schema verified');

        app.listen(+port, '0.0.0.0', () => {
            console.log(`Server is running on http://0.0.0.0:${port}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
    }
};


// Global Error Handler
app.use((err: any, req: Request, res: Response, next: any) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});

startServer();

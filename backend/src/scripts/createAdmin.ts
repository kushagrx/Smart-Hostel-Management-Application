import bcrypt from 'bcrypt';
import { pool } from '../config/db';

const seedAdmin = async () => {
    try {
        const email = 'shaswatrastogi91@gmail.com';
        const password = 'password123';
        const name = 'Admin User';

        // Check if user exists
        const checkResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (checkResult.rows.length === 0) {
            const passwordHash = await bcrypt.hash(password, 10);

            await pool.query(
                `INSERT INTO users (email, full_name, role, password_hash) 
                 VALUES ($1, $2, 'admin', $3)`,
                [email, name, passwordHash]
            );
            console.log(`✅ Admin user created!`);
            console.log(`Email: ${email}`);
            console.log(`Password: ${password}`);
        } else {
            console.log('Admin user already exists.');
        }

    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        pool.end();
    }
};

seedAdmin();

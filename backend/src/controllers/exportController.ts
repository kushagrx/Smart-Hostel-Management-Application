import { Request, Response } from 'express';
import pool from '../config/db';
import { exportToExcel, exportToPDF, sendFileResponse } from '../services/exportService';

/**
 * Get distinct filter options (branch, blood group) for the export modal
 */
export const getExportFilters = async (req: Request, res: Response) => {
    try {
        const branchRes = await pool.query(`SELECT DISTINCT college_name as branch FROM students WHERE college_name IS NOT NULL AND college_name != '' ORDER BY college_name`);
        const bloodGroupRes = await pool.query(`SELECT DISTINCT blood_group FROM students WHERE blood_group IS NOT NULL AND blood_group != '' ORDER BY blood_group`);
        const hostelRes = await pool.query(`SELECT DISTINCT hostel_name FROM students WHERE hostel_name IS NOT NULL AND hostel_name != '' ORDER BY hostel_name`);
        const roomTypeRes = await pool.query(`SELECT DISTINCT room_type FROM rooms WHERE room_type IS NOT NULL AND room_type != '' ORDER BY room_type`);

        res.json({
            branches: branchRes.rows.map(r => r.branch),
            bloodGroups: bloodGroupRes.rows.map(r => r.blood_group),
            hostels: hostelRes.rows.map(r => r.hostel_name),
            roomTypes: roomTypeRes.rows.map(r => r.room_type),
        });
    } catch (error) {
        console.error('Error fetching export filters:', error);
        res.status(500).json({ error: 'Failed to fetch export filters' });
    }
};

/**
 * Export student data
 */
export const exportStudents = async (req: Request, res: Response) => {
    try {
        const {
            format = 'excel',
            status = 'active',
            branch,
            bloodGroup,
            hostelName,
            roomType,
            feeFrequency,
            duesStatus,
            roomNumber,
            startDate,
            endDate
        } = req.query;

        let query = `
            SELECT 
                s.roll_no as roll_number,
                u.full_name as name,
                u.email,
                rooms.room_number,
                s.college_name as branch,
                s.hostel_name,
                rooms.room_type,
                s.phone as contact,
                s.dob,
                s.blood_group,
                s.address,
                s.father_name,
                s.father_phone as parent_contact,
                s.mother_name,
                s.medical_history,
                s.emergency_contact_name,
                s.emergency_contact_phone,
                s.hostel_fee,
                s.mess_fee,
                s.dues,
                s.fee_frequency,
                s.created_at
            FROM students s
            JOIN users u ON s.user_id = u.id
            LEFT JOIN room_allocations ra ON ra.student_id = s.id AND ra.is_active = TRUE
            LEFT JOIN rooms ON ra.room_id = rooms.id
            WHERE 1=1
        `;

        const params: any[] = [];

        if (status) {
            query += ` AND s.status = $${params.length + 1}`;
            params.push(status);
        }

        if (branch) {
            query += ` AND s.college_name ILIKE $${params.length + 1}`;
            params.push(`%${branch}%`);
        }

        if (bloodGroup) {
            query += ` AND s.blood_group = $${params.length + 1}`;
            params.push(bloodGroup);
        }

        if (hostelName) {
            query += ` AND s.hostel_name ILIKE $${params.length + 1}`;
            params.push(`%${hostelName}%`);
        }

        if (roomType) {
            query += ` AND rooms.room_type ILIKE $${params.length + 1}`;
            params.push(`%${roomType}%`);
        }

        if (feeFrequency) {
            query += ` AND s.fee_frequency = $${params.length + 1}`;
            params.push(feeFrequency);
        }

        if (duesStatus === 'has_dues') {
            query += ` AND s.dues > 0`;
        } else if (duesStatus === 'no_dues') {
            query += ` AND s.dues <= 0`;
        }

        if (roomNumber) {
            query += ` AND rooms.room_number = $${params.length + 1}`;
            params.push(roomNumber);
        }

        if (startDate) {
            query += ` AND s.created_at >= $${params.length + 1}`;
            params.push(startDate);
        }

        if (endDate) {
            query += ` AND s.created_at <= $${params.length + 1}`;
            params.push(endDate);
        }

        query += ` ORDER BY s.roll_no`;

        const result = await pool.query(query, params);

        const headers = [
            { key: 'roll_number', header: 'Roll Number', width: 15 },
            { key: 'name', header: 'Name', width: 25 },
            { key: 'email', header: 'Email', width: 30 },
            { key: 'hostel_name', header: 'Hostel Name', width: 20 },
            { key: 'room_number', header: 'Room', width: 10 },
            { key: 'room_type', header: 'Room Type', width: 15 },
            { key: 'branch', header: 'College', width: 20 },
            { key: 'contact', header: 'Contact', width: 15 },
            { key: 'dob', header: 'DOB', width: 15 },
            { key: 'blood_group', header: 'Blood Grp', width: 12 },
            { key: 'address', header: 'Address', width: 40 },
            { key: 'father_name', header: 'Father Name', width: 20 },
            { key: 'parent_contact', header: 'Father Contact', width: 15 },
            { key: 'mother_name', header: 'Mother Name', width: 20 },
            { key: 'medical_history', header: 'Medical History', width: 30 },
            { key: 'emergency_contact_name', header: 'Emergency Contact', width: 20 },
            { key: 'emergency_contact_phone', header: 'Emergency Phone', width: 15 },
            { key: 'hostel_fee', header: 'Hostel Fee', width: 12 },
            { key: 'mess_fee', header: 'Mess Fee', width: 12 },
            { key: 'dues', header: 'Pending Dues', width: 15 },
            { key: 'fee_frequency', header: 'Fee Freq', width: 12 },
            { key: 'created_at', header: 'Joined Date', width: 20 }
        ];

        const filename = `students_report_${new Date().toISOString().split('T')[0]}`;

        if (format === 'pdf') {
            const buffer = await exportToPDF(result.rows, filename, 'Students Report', headers);
            sendFileResponse(res, buffer, `${filename}.pdf`, 'application/pdf');
        } else {
            const buffer = await exportToExcel(result.rows, filename, headers);
            sendFileResponse(res, buffer, `${filename}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        }
    } catch (error) {
        console.error('Error exporting students:', error);
        res.status(500).json({ error: 'Failed to export student data' });
    }
};

/**
 * Export attendance data
 */
export const exportAttendance = async (req: Request, res: Response) => {
    try {
        const { format = 'excel', startDate, endDate, studentId } = req.query;

        let query = `
            SELECT 
                s.roll_no as roll_number,
                u.full_name as name,
                rooms.room_number,
                a.date,
                a.status,
                'System' as marked_by,
                '' as remarks
            FROM attendance a
            JOIN students s ON a.student_id = s.id
            JOIN users u ON s.user_id = u.id
            LEFT JOIN room_allocations ra ON ra.student_id = s.id AND ra.is_active = TRUE
            LEFT JOIN rooms ON ra.room_id = rooms.id
            WHERE 1=1
        `;

        const params: any[] = [];

        if (startDate) {
            query += ` AND a.date >= $${params.length + 1}`;
            params.push(startDate);
        }

        if (endDate) {
            query += ` AND a.date <= $${params.length + 1}`;
            params.push(endDate);
        }

        if (studentId) {
            query += ` AND a.student_id = $${params.length + 1}`;
            params.push(studentId);
        }

        query += ` ORDER BY a.date DESC, s.roll_no`;

        const result = await pool.query(query, params);

        const headers = [
            { key: 'roll_number', header: 'Roll Number', width: 15 },
            { key: 'name', header: 'Name', width: 25 },
            { key: 'room_number', header: 'Room Number', width: 15 },
            { key: 'date', header: 'Date', width: 15 },
            { key: 'status', header: 'Status', width: 12 },
            { key: 'marked_by', header: 'Marked By', width: 20 },
            { key: 'remarks', header: 'Remarks', width: 30 }
        ];

        const filename = `attendance_report_${new Date().toISOString().split('T')[0]}`;

        if (format === 'pdf') {
            const buffer = await exportToPDF(result.rows, filename, 'Attendance Report', headers);
            sendFileResponse(res, buffer, `${filename}.pdf`, 'application/pdf');
        } else {
            const buffer = await exportToExcel(result.rows, filename, headers);
            sendFileResponse(res, buffer, `${filename}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        }
    } catch (error) {
        console.error('Error exporting attendance:', error);
        res.status(500).json({ error: 'Failed to export attendance data' });
    }
};

/**
 * Export complaints data
 */
export const exportComplaints = async (req: Request, res: Response) => {
    try {
        const { format = 'excel', status, startDate, endDate, type } = req.query;

        let query = `
            SELECT 
                s.roll_no as roll_number,
                u.full_name as name,
                rooms.room_number,
                c.category as type,
                c.description,
                'Hostel' as location,
                c.status,
                'Normal' as priority,
                c.created_at,
                c.resolved_at,
                c.admin_response as resolved_by
            FROM complaints c
            JOIN students s ON c.student_id = s.id
            JOIN users u ON s.user_id = u.id
            LEFT JOIN room_allocations ra ON ra.student_id = s.id AND ra.is_active = TRUE
            LEFT JOIN rooms ON ra.room_id = rooms.id
            WHERE 1=1
        `;

        const params: any[] = [];

        if (status) {
            query += ` AND c.status = $${params.length + 1}`;
            params.push(status);
        }

        if (type) {
            query += ` AND c.category = $${params.length + 1}`;
            params.push(type);
        }

        if (startDate) {
            query += ` AND c.created_at >= $${params.length + 1}`;
            params.push(startDate);
        }

        if (endDate) {
            query += ` AND c.created_at <= $${params.length + 1}`;
            params.push(endDate);
        }

        query += ` ORDER BY c.created_at DESC`;

        const result = await pool.query(query, params);

        const headers = [
            { key: 'roll_number', header: 'Roll Number', width: 15 },
            { key: 'name', header: 'Name', width: 25 },
            { key: 'room_number', header: 'Room Number', width: 15 },
            { key: 'type', header: 'Type', width: 15 },
            { key: 'description', header: 'Description', width: 40 },
            { key: 'location', header: 'Location', width: 20 },
            { key: 'status', header: 'Status', width: 12 },
            { key: 'priority', header: 'Priority', width: 12 },
            { key: 'created_at', header: 'Created Date', width: 20 },
            { key: 'resolved_at', header: 'Resolved Date', width: 20 },
            { key: 'resolved_by', header: 'Resolved By', width: 20 }
        ];

        const filename = `complaints_report_${new Date().toISOString().split('T')[0]}`;

        if (format === 'pdf') {
            const buffer = await exportToPDF(result.rows, filename, 'Complaints Report', headers);
            sendFileResponse(res, buffer, `${filename}.pdf`, 'application/pdf');
        } else {
            const buffer = await exportToExcel(result.rows, filename, headers);
            sendFileResponse(res, buffer, `${filename}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        }
    } catch (error) {
        console.error('Error exporting complaints:', error);
        res.status(500).json({ error: 'Failed to export complaints data' });
    }
};

/**
 * Export payments data
 */
export const exportPayments = async (req: Request, res: Response) => {
    try {
        const { format = 'excel', status, startDate, endDate } = req.query;

        let query = `
            SELECT 
                s.roll_no as roll_number,
                u.full_name as name,
                rooms.room_number,
                p.amount,
                p.purpose as type,
                p.status,
                'Online/Cash' as payment_method,
                'N/A' as transaction_id,
                p.created_at,
                p.paid_at
            FROM payments p
            JOIN students s ON p.student_id = s.id
            JOIN users u ON s.user_id = u.id
            LEFT JOIN room_allocations ra ON ra.student_id = s.id AND ra.is_active = TRUE
            LEFT JOIN rooms ON ra.room_id = rooms.id
            WHERE 1=1
        `;

        const params: any[] = [];

        if (status) {
            query += ` AND p.status = $${params.length + 1}`;
            params.push(status);
        }

        if (startDate) {
            query += ` AND p.created_at >= $${params.length + 1}`;
            params.push(startDate);
        }

        if (endDate) {
            query += ` AND p.created_at <= $${params.length + 1}`;
            params.push(endDate);
        }

        query += ` ORDER BY p.created_at DESC`;

        const result = await pool.query(query, params);

        const headers = [
            { key: 'roll_number', header: 'Roll Number', width: 15 },
            { key: 'name', header: 'Name', width: 25 },
            { key: 'room_number', header: 'Room Number', width: 15 },
            { key: 'amount', header: 'Amount (₹)', width: 15 },
            { key: 'type', header: 'Payment Type', width: 20 },
            { key: 'status', header: 'Status', width: 12 },
            { key: 'payment_method', header: 'Payment Method', width: 20 },
            { key: 'transaction_id', header: 'Transaction ID', width: 25 },
            { key: 'created_at', header: 'Created Date', width: 20 },
            { key: 'paid_at', header: 'Paid Date', width: 20 }
        ];

        const filename = `payments_report_${new Date().toISOString().split('T')[0]}`;

        if (format === 'pdf') {
            const buffer = await exportToPDF(result.rows, filename, 'Payments Report', headers);
            sendFileResponse(res, buffer, `${filename}.pdf`, 'application/pdf');
        } else {
            const buffer = await exportToExcel(result.rows, filename, headers);
            sendFileResponse(res, buffer, `${filename}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        }
    } catch (error) {
        console.error('Error exporting payments:', error);
        res.status(500).json({ error: 'Failed to export payments data' });
    }
};

/**
 * Export leave requests data
 */
export const exportLeaveRequests = async (req: Request, res: Response) => {
    try {
        const { format = 'excel', status, startDate, endDate } = req.query;

        let query = `
            SELECT 
                s.roll_no as roll_number,
                u.full_name as name,
                rooms.room_number,
                lr.start_date,
                lr.end_date,
                lr.reason,
                lr.status,
                lr.admin_response as admin_remarks,
                'Admin' as approved_by,
                lr.created_at,
                lr.updated_at as approved_at
            FROM leave_requests lr
            JOIN students s ON lr.student_id = s.id
            JOIN users u ON s.user_id = u.id
            LEFT JOIN room_allocations ra ON ra.student_id = s.id AND ra.is_active = TRUE
            LEFT JOIN rooms ON ra.room_id = rooms.id
            WHERE 1=1
        `;

        const params: any[] = [];

        if (status) {
            query += ` AND lr.status = $${params.length + 1}`;
            params.push(status);
        }

        if (startDate) {
            query += ` AND lr.created_at >= $${params.length + 1}`;
            params.push(startDate);
        }

        if (endDate) {
            query += ` AND lr.created_at <= $${params.length + 1}`;
            params.push(endDate);
        }

        query += ` ORDER BY lr.created_at DESC`;

        const result = await pool.query(query, params);

        const headers = [
            { key: 'roll_number', header: 'Roll Number', width: 15 },
            { key: 'name', header: 'Name', width: 25 },
            { key: 'room_number', header: 'Room Number', width: 15 },
            { key: 'start_date', header: 'Start Date', width: 15 },
            { key: 'end_date', header: 'End Date', width: 15 },
            { key: 'reason', header: 'Reason', width: 40 },
            { key: 'status', header: 'Status', width: 12 },
            { key: 'admin_remarks', header: 'Admin Remarks', width: 30 },
            { key: 'approved_by', header: 'Approved By', width: 20 },
            { key: 'created_at', header: 'Created Date', width: 20 },
            { key: 'approved_at', header: 'Approved Date', width: 20 }
        ];

        const filename = `leave_requests_report_${new Date().toISOString().split('T')[0]}`;

        if (format === 'pdf') {
            const buffer = await exportToPDF(result.rows, filename, 'Leave Requests Report', headers);
            sendFileResponse(res, buffer, `${filename}.pdf`, 'application/pdf');
        } else {
            const buffer = await exportToExcel(result.rows, filename, headers);
            sendFileResponse(res, buffer, `${filename}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        }
    } catch (error) {
        console.error('Error exporting leave requests:', error);
        res.status(500).json({ error: 'Failed to export leave requests data' });
    }
};

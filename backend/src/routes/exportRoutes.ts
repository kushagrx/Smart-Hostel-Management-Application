import { Router } from 'express';
import {
    exportAttendance,
    exportComplaints,
    exportLeaveRequests,
    exportPayments,
    exportStudents,
    getExportFilters
} from '../controllers/exportController';
import { requireAdmin, requireAuth } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

// Get distinct filter options (admin only)
router.get('/filters', requireAdmin, getExportFilters);

// Student exports (admin only)
router.get('/students', requireAdmin, exportStudents);

// Attendance exports (admin only)
router.get('/attendance', requireAdmin, exportAttendance);

// Complaints exports (admin only)
router.get('/complaints', requireAdmin, exportComplaints);

// Payments exports (admin only)
router.get('/payments', requireAdmin, exportPayments);

// Leave requests exports (admin only)
router.get('/leave-requests', requireAdmin, exportLeaveRequests);

export default router;

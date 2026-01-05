import express from 'express';
import { getAuditLogs } from '../controllers/audit.controller.js';
import { authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Audit logs only for admin
router.use(authorize('admin'));

router.get('/', getAuditLogs);

export default router;




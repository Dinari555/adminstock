import express from 'express';
import { getSummary, getSalesByPeriod } from '../controllers/dashboard.controller.js';

const router = express.Router();

router.get('/summary', getSummary);
router.get('/sales', getSalesByPeriod);

export default router;




import express from 'express';
import { body } from 'express-validator';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  generatePDF,
} from '../controllers/invoice.controller.js';
import { auditAction, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(auditAction);

const invoiceValidation = [
  body('clientId').isMongoId(),
  body('items').isArray({ min: 1 }),
  body('items.*.productId').isMongoId(),
  body('items.*.qte').isInt({ min: 1 }),
  body('statut').optional().isIn(['payé', 'en_attente', 'en_retard']),
];

router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.get('/:id/pdf', generatePDF);
router.post('/', invoiceValidation, createInvoice);
router.put('/:id', body('statut').isIn(['payé', 'en_attente', 'en_retard']), updateInvoice);
// Suppression de facture réservée aux administrateurs
router.delete('/:id', authorize('admin'), deleteInvoice);

export default router;




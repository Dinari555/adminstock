import express from 'express';
import { body } from 'express-validator';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getStockAlerts,
} from '../controllers/product.controller.js';
import { auditAction } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(auditAction);

const productValidation = [
  body('reference').notEmpty().trim(),
  body('nom').notEmpty().trim(),
  body('prix').isFloat({ min: 0 }),
  body('quantite').optional().isInt({ min: 0 }),
  body('seuilMin').optional().isInt({ min: 0 }),
  body('description').optional().trim(),
];

const stockValidation = [
  body('type').isIn(['IN', 'OUT']),
  body('quantite').isInt({ min: 1 }),
  body('note').optional().trim(),
];

router.get('/', getProducts);
router.get('/alerts', getStockAlerts);
router.get('/:id', getProductById);
router.post('/', productValidation, createProduct);
router.put('/:id', productValidation, updateProduct);
router.delete('/:id', deleteProduct);
router.post('/:id/stock', stockValidation, updateStock);

export default router;


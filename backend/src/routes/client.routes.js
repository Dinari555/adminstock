import express from 'express';
import { body } from 'express-validator';
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} from '../controllers/client.controller.js';
import { auditAction } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(auditAction);

const clientValidation = [
  body('nom').notEmpty().trim(),
  body('prenom').notEmpty().trim(),
  body('contact').notEmpty().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('adresse').optional().trim(),
];

router.get('/', getClients);
router.get('/:id', getClientById);
router.post('/', clientValidation, createClient);
router.put('/:id', clientValidation, updateClient);
router.delete('/:id', deleteClient);

export default router;



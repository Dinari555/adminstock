import express from 'express';
import { body } from 'express-validator';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/user.controller.js';
import { authorize, auditAction } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require admin role
router.use(authorize('admin'));
// Audit des créations / modifications / suppressions d'utilisateurs
router.use(auditAction);

const userValidation = [
  body('nom').notEmpty().trim(),
  body('prenom').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').optional().isLength({ min: 6 }),
  body('role').optional().isIn(['admin', 'employee']),
];

router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', userValidation, createUser);
router.put('/:id', userValidation, updateUser);
router.delete('/:id', deleteUser);

export default router;



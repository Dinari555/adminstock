import express from 'express';
import { body, validationResult } from 'express-validator';
import { login, refresh, logout } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg || 'Erreur de validation',
      errors: errors.array(),
    });
  }
  next();
};

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Le mot de passe est requis').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
];

router.post('/login', loginValidation, handleValidationErrors, login);
router.post('/refresh', body('refreshToken').notEmpty().withMessage('Refresh token requis'), handleValidationErrors, refresh);
router.post('/logout', authenticate, logout);

export default router;



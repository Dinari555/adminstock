import express from 'express';
import { seedDatabase } from '../scripts/seed.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    await seedDatabase();
    res.json({
      success: true,
      message: 'Base de données initialisée avec succès',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;




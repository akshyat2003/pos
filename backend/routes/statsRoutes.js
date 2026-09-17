import express from 'express';
import { getDatabaseStats } from '../controllers/statsController.js';

const router = express.Router();

router.get('/', getDatabaseStats);

export default router;

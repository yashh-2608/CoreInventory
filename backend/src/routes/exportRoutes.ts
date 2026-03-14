import { Router } from 'express';
import { exportProducts, exportLedger, exportGlobalReport } from '../controllers/exportController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/products', authenticate, exportProducts);
router.get('/ledger', authenticate, exportLedger);
router.get('/global', authenticate, exportGlobalReport);

export default router;

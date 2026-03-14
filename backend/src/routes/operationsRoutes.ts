import { Router } from 'express';
import {
  createReceipt,
  validateReceipt,
  createDelivery,
  confirmDelivery,
  createTransfer,
  completeTransfer,
  createAdjustment,
} from '../controllers/operationsController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/receipts', createReceipt);
router.post('/receipts/:id/validate', validateReceipt);

router.post('/deliveries', createDelivery);
router.post('/deliveries/:id/confirm', confirmDelivery);

router.post('/transfers', createTransfer);
router.post('/transfers/:id/complete', completeTransfer);

router.post('/adjustments', createAdjustment);

export default router;

import { Router } from 'express';
import {
  createReceipt,
  getReceiptDrafts,
  deleteReceipt,
  validateReceipt,
  createDelivery,
  getDeliveryDrafts,
  deleteDelivery,
  confirmDelivery,
  createTransfer,
  getTransferDrafts,
  deleteTransfer,
  completeTransfer,
  createAdjustment,
} from '../controllers/operationsController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/receipts', createReceipt);
router.get('/receipts/drafts', getReceiptDrafts);
router.delete('/receipts/:id', deleteReceipt);
router.post('/receipts/:id/validate', validateReceipt);

router.post('/deliveries', createDelivery);
router.get('/deliveries/drafts', getDeliveryDrafts);
router.delete('/deliveries/:id', deleteDelivery);
router.post('/deliveries/:id/confirm', confirmDelivery);

router.post('/transfers', createTransfer);
router.get('/transfers/drafts', getTransferDrafts);
router.delete('/transfers/:id', deleteTransfer);
router.post('/transfers/:id/complete', completeTransfer);

router.post('/adjustments', createAdjustment);

export default router;

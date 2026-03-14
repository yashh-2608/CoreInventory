import { Router } from 'express';
import { getDashboardStats, getInventoryActivity, getCategoryDistribution, getLowStockItems, getPendingReceipts, getPendingDeliveries, getPendingTransfers } from '../controllers/reportsController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/stats', authenticate, getDashboardStats);
router.get('/activity', authenticate, getInventoryActivity);
router.get('/distribution', authenticate, getCategoryDistribution);
router.get('/low-stock', authenticate, getLowStockItems);
router.get('/pending-receipts', authenticate, getPendingReceipts);
router.get('/pending-deliveries', authenticate, getPendingDeliveries);
router.get('/pending-transfers', authenticate, getPendingTransfers);

export default router;


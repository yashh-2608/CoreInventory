import { Router } from 'express';
import { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } from '../controllers/warehouseController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticate, getWarehouses);
router.post('/', authenticate, authorize(['ADMIN', 'STAFF']), createWarehouse);
router.put('/:id', authenticate, authorize(['ADMIN', 'STAFF']), updateWarehouse);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteWarehouse);

export default router;

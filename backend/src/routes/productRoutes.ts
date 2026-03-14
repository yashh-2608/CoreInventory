import { Router } from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories } from '../controllers/productController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticate, getProducts);
router.post('/', authenticate, authorize(['ADMIN', 'STAFF']), createProduct);
router.put('/:id', authenticate, authorize(['ADMIN', 'STAFF']), updateProduct);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteProduct);
router.get('/categories', authenticate, getCategories);

export default router;

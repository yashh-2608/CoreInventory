import './env';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import warehouseRoutes from './routes/warehouseRoutes';
import operationsRoutes from './routes/operationsRoutes';
import reportRoutes from './routes/reportRoutes';
import exportRoutes from './routes/exportRoutes';
import { sendServerError } from './lib/errors';

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const sanitizedOrigin = origin.replace(/\/$/, '');
    const allowed = [
      'http://localhost:3000',
      'https://core-inventory-kohl.vercel.app',
      'https://core-inventory.vercel.app',
      'https://core-inventory-git-main-yashh-2608s-projects.vercel.app',
      ...(process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim().replace(/\/$/, '')) || [])
    ];
    if (allowed.some(ao => ao === sanitizedOrigin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/operations', operationsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/export', exportRoutes);

app.get('/', (req, res) => {
  res.send('CoreInventory API is running 🚀');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'CoreInventory API is running' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((error: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (res.headersSent) {
    return next(error);
  }

  return sendServerError(res, error);
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
